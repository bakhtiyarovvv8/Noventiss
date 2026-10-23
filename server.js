// Noventis — сервер: http + база Turso (libSQL, тот же SQLite) + crypto.scrypt
const http = require('node:http');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const crypto = require('node:crypto');
const { createClient } = require('@libsql/client');

// --- настройки из .env (локально) или из переменных окружения (на Render)
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* .env нет — берём переменные окружения */ }

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, 'public');
const SESSION_DAYS = 30;
// Секрет, который знает только прокси на Cloudflare. Задан → сервер принимает /api только через Cloudflare.
const PROXY_KEY = process.env.PROXY_KEY || '';
const PROD = process.env.NODE_ENV === 'production';

// Без TURSO_DATABASE_URL работаем с локальным файлом — удобно для разработки.
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || 'file:' + path.join(__dirname, 'data', 'noventis.db').replace(/\\/g, '/'),
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const one = async (sql, ...args) => (await db.execute({ sql, args })).rows[0] || null;
const all = async (sql, ...args) => (await db.execute({ sql, args })).rows;
const run = (sql, ...args) => db.execute({ sql, args });

const ready = db.batch([
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    pass_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    answers TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  'CREATE INDEX IF NOT EXISTS results_user ON results(user_id)',
  // избранные вузы: place — код страны (UZ) или региона (us)
  `CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    place TEXT NOT NULL,
    web TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE (user_id, name, place)
  )`,
  // личный план по неделям: один на пользователя, data — JSON (вуз, направление, дедлайн, недели с задачами)
  `CREATE TABLE IF NOT EXISTS plans (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  // календарь: только то, что пользователь добавил сам (из плана или вручную)
  `CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    kind TEXT NOT NULL DEFAULT 'task',
    url TEXT NOT NULL DEFAULT '',
    UNIQUE (user_id, title, date)
  )`,
  // сохранённые расчёты калькуляторов: kind — chances | cost, data — JSON с вводом и итогом
  `CREATE TABLE IF NOT EXISTS calcs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  'CREATE INDEX IF NOT EXISTS calcs_user ON calcs(user_id)',
  // доска резюме «ищу работу»: видят все, контакт — только вошедшие
  `CREATE TABLE IF NOT EXISTS resumes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sector TEXT NOT NULL,
    city TEXT NOT NULL,
    exp TEXT NOT NULL,
    salary INTEGER,
    about TEXT NOT NULL DEFAULT '',
    contact TEXT NOT NULL,
    search TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`,
  'CREATE INDEX IF NOT EXISTS resumes_user ON resumes(user_id)',
], 'write');

const hashPassword = (password, salt) => new Promise((resolve, reject) =>
  crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (e, key) => e ? reject(e) : resolve(key.toString('hex'))));

// --- откуда пришёл запрос
const safeEqual = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};
const viaCloudflare = req => !!PROXY_KEY && safeEqual(req.headers['x-noventis-proxy-key'] || '', PROXY_KEY);

// Реальный IP посетителя. Прокси на Cloudflare кладёт в x-noventis-client-ip значение CF-Connecting-IP.
// Доверяем ему, только если запрос подписан секретом PROXY_KEY, иначе любой мог бы подставить чужой IP.
function clientIp(req) {
  if (viaCloudflare(req)) {
    const ip = String(req.headers['x-noventis-client-ip'] || '').trim();
    if (net.isIP(ip)) return ip;
  }
  return req.socket.remoteAddress || 'unknown';
}

// --- лимиты запросов: окно 15 минут
const WINDOW = 15 * 60 * 1000;
// вход/регистрация: 10 попыток на связку IP + email. За одним IP в Узбекистане часто сидят
// сотни людей (мобильные операторы, школы), поэтому один IP целиком не блокируем.
const authHits = new Map();
const authKey = (ip, email) => ip + '|' + str(email).trim().toLowerCase();
const apiHits = new Map();   // все запросы к API: 300
function overLimit(map, ip, max) {
  const now = Date.now();
  const rec = map.get(ip);
  if (!rec || now - rec.t > WINDOW) { map.set(ip, { n: 1, t: now }); return false; }
  return ++rec.n > max;
}

function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

async function currentUser(req) {
  const token = parseCookies(req).kj_session;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return null;
  return one(`
    SELECT u.id, u.name, u.email, u.created_at FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ? AND s.expires_at > ?`, token, Date.now());
}

const cookie = (value, maxAge) =>
  `kj_session=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${PROD ? '; Secure' : ''}`;

async function createSession(res, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  await run('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)',
    token, userId, Date.now() + SESSION_DAYS * 864e5);
  res.setHeader('Set-Cookie', cookie(token, SESSION_DAYS * 86400));
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

class HttpError extends Error { constructor(status, code) { super(code); this.status = status; } }

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => {
      size += c.length;
      if (size > 200_000) { reject(new HttpError(413, 'too_large')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw 0;
        resolve(body);
      } catch { reject(new HttpError(400, 'bad_json')); }
    });
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = v => (typeof v === 'string' ? v : '');
const isPlainObject = v => !!v && typeof v === 'object' && !Array.isArray(v);

let rateCache = { t: 0, data: { rate: null, date: null } };
async function usdRate() {
  if (Date.now() - rateCache.t < 6 * 36e5) return rateCache.data;
  try {
    const r = await fetch('https://cbu.uz/ru/arkhiv-kursov-valyut/json/USD/', { signal: AbortSignal.timeout(5000) });
    const [usd] = await r.json();
    const rate = Number(usd.Rate);
    if (!(rate > 0)) throw new Error('bad rate');
    rateCache = { t: Date.now(), data: { rate, date: String(usd.Date) } };
  } catch (e) {
    // ЦБ недоступен — отдаём последний известный курс, повторим через 10 минут
    rateCache.t = Date.now() - 6 * 36e5 + 6e5;
    console.error('Курс ЦБ:', e.message);
  }
  return rateCache.data;
}

// --- вакансии hh.uz. Без токена приложения hh поиск не отдаёт (403), поэтому:
// HH_TOKEN — готовый токен приложения, или HH_CLIENT_ID + HH_CLIENT_SECRET — сервер получит его сам (dev.hh.ru)
const HH_UA = 'Noventis/1.0 (noventis)';
const UZ_AREAS = new Set(['97', '2759', '2778', '2781', '2768', '2779', '2782', '2780', '2783', '2790', '2786', '2788', '2789', '2870', '2784', '2787', '2785', '2766', '2767']);
let hhToken = process.env.HH_TOKEN || '';
const hhConfigured = () => !!(hhToken || (process.env.HH_CLIENT_ID && process.env.HH_CLIENT_SECRET));
async function hhAuth() {
  if (hhToken) return hhToken;
  const r = await fetch('https://api.hh.ru/token', {
    method: 'POST', signal: AbortSignal.timeout(8000),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'HH-User-Agent': HH_UA },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: process.env.HH_CLIENT_ID, client_secret: process.env.HH_CLIENT_SECRET }),
  });
  const d = await r.json();
  if (!d.access_token) throw new Error('hh token: ' + JSON.stringify(d).slice(0, 200));
  return (hhToken = d.access_token);
}
const plain = s => String(s || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const jobsCache = new Map(); // ключ — строка запроса, кэш 10 минут, не больше 300 запросов
async function hhVacancies(q) {
  const key = JSON.stringify(q);
  const hit = jobsCache.get(key);
  if (hit && Date.now() - hit.t < 6e5) return hit.data;
  const p = new URLSearchParams({ area: q.area, per_page: '20', page: String(q.page), order_by: 'publication_time' });
  if (q.text) p.set('text', q.text);
  if (q.salary) { p.set('salary', String(q.salary)); p.set('currency', 'USD'); p.set('only_with_salary', 'true'); }
  const get = async () => fetch('https://api.hh.ru/vacancies?' + p, {
    signal: AbortSignal.timeout(8000), headers: { 'HH-User-Agent': HH_UA, Authorization: 'Bearer ' + await hhAuth() } });
  let r = await get();
  if (r.status === 401 && !process.env.HH_TOKEN) { hhToken = ''; r = await get(); }
  if (!r.ok) throw new Error('hh ' + r.status);
  const d = await r.json();
  const data = {
    configured: true, found: d.found, page: d.page, pages: d.pages,
    items: (d.items || []).map(v => ({
      id: v.id, name: plain(v.name), employer: plain(v.employer && v.employer.name), city: plain(v.area && v.area.name),
      salary: v.salary ? { from: v.salary.from, to: v.salary.to, currency: v.salary.currency } : null,
      url: /^https:\/\/[\w.-]*hh\.(uz|ru)\//.test(v.alternate_url) ? v.alternate_url : '',
      date: String(v.published_at || '').slice(0, 10),
      req: plain(v.snippet && v.snippet.requirement).slice(0, 300),
      schedule: plain(v.schedule && v.schedule.name), exp: plain(v.experience && v.experience.name),
    })),
  };
  if (jobsCache.size > 300) jobsCache.clear();
  jobsCache.set(key, { t: Date.now(), data });
  return data;
}

const RESUME_EXP = ['none', 'lt1', 'y1', 'y3'];
const resumeRow = (r, withContact) => ({
  id: Number(r.id), title: r.title, sector: r.sector, city: r.city, exp: r.exp,
  salary: r.salary == null ? null : Number(r.salary), about: r.about, name: r.name,
  contact: withContact ? r.contact : null, created_at: r.created_at,
});

async function api(req, res, url) {
  // Если сервер стоит за Cloudflare, напрямую на Render к API не пускаем.
  if (PROXY_KEY && !viaCloudflare(req)) return json(res, 403, { error: 'forbidden' });

  const route = `${req.method} ${url.pathname}`;
  const ip = clientIp(req);
  if (overLimit(apiHits, ip, 300)) return json(res, 429, { error: 'too_many' });

  if (route === 'GET /api/health') return json(res, 200, { ok: true });

  // курс доллара ЦБ Узбекистана для калькулятора стоимости, кэш 6 часов
  if (route === 'GET /api/rate') return json(res, 200, await usdRate());

  // вакансии Узбекистана с hh.uz: text, area (код города hh), salary ($ в месяц), page
  if (route === 'GET /api/jobs') {
    if (!hhConfigured()) return json(res, 200, { configured: false, items: [] });
    const sp = url.searchParams;
    const q = {
      text: str(sp.get('text')).trim().slice(0, 100),
      area: UZ_AREAS.has(sp.get('area')) ? sp.get('area') : '97',
      salary: Math.min(100000, Math.max(0, Math.floor(Number(sp.get('salary')) || 0))),
      page: Math.min(19, Math.max(0, Math.floor(Number(sp.get('page')) || 0))),
    };
    try { return json(res, 200, await hhVacancies(q)); }
    catch (e) { console.error('Вакансии hh:', e.message); return json(res, 502, { error: 'jobs_unavailable' }); }
  }

  // доска резюме: смотреть может любой, контакт видят только вошедшие
  if (route === 'GET /api/resumes') {
    const viewer = await currentUser(req);
    const sp = url.searchParams, where = [], args = [];
    const sector = str(sp.get('sector')).slice(0, 30), city = str(sp.get('city')).slice(0, 30), q = str(sp.get('q')).trim().slice(0, 60);
    if (sector) { where.push('r.sector = ?'); args.push(sector); }
    if (city) { where.push('r.city = ?'); args.push(city); }
    // LIKE в SQLite не знает регистр кириллицы, поэтому ищем по полю search, сохранённому в нижнем регистре
    if (q) { where.push("r.search LIKE ? ESCAPE '\\'"); args.push('%' + q.toLowerCase().replace(/[\\%_]/g, '\\$&') + '%'); }
    const page = Math.min(50, Math.max(0, Math.floor(Number(sp.get('page')) || 0)));
    const rows = await all(`SELECT r.*, u.name FROM resumes r JOIN users u ON u.id = r.user_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY r.id DESC LIMIT 21 OFFSET ?`, ...args, page * 20);
    return json(res, 200, { resumes: rows.slice(0, 20).map(r => resumeRow(r, !!viewer)), more: rows.length > 20, login: !viewer });
  }

  if (route === 'POST /api/register') {
    const body = await readBody(req);
    if (overLimit(authHits, authKey(ip, body.email), 10)) return json(res, 429, { error: 'too_many' });
    const name = str(body.name).trim(), email = str(body.email).trim().toLowerCase(), password = str(body.password);
    if (name.length < 2) return json(res, 400, { error: 'name_short' });
    if (email.length > 254 || !EMAIL_RE.test(email)) return json(res, 400, { error: 'email_invalid' });
    if (password.length < 8) return json(res, 400, { error: 'password_short' });
    if (password.length > 200) return json(res, 400, { error: 'bad_json' });
    if (await one('SELECT 1 FROM users WHERE email = ?', email)) return json(res, 409, { error: 'email_taken' });
    const salt = crypto.randomBytes(16).toString('hex');
    const r = await run('INSERT INTO users (name, email, pass_hash, salt) VALUES (?, ?, ?, ?)',
      name.slice(0, 60), email, await hashPassword(password, salt), salt);
    await createSession(res, Number(r.lastInsertRowid));
    return json(res, 201, { ok: true });
  }

  if (route === 'POST /api/login') {
    const body = await readBody(req);
    if (overLimit(authHits, authKey(ip, body.email), 10)) return json(res, 429, { error: 'too_many' });
    const email = str(body.email).trim(), password = str(body.password);
    if (!email || !password || password.length > 200) return json(res, 401, { error: 'bad_credentials' });
    const u = await one('SELECT id, pass_hash, salt FROM users WHERE email = ?', email);
    const ok = u && safeEqual(await hashPassword(password, u.salt), u.pass_hash);
    if (!ok) return json(res, 401, { error: 'bad_credentials' });
    authHits.delete(authKey(ip, email));
    await createSession(res, Number(u.id));
    return json(res, 200, { ok: true });
  }

  if (route === 'POST /api/logout') {
    const token = parseCookies(req).kj_session;
    if (token) await run('DELETE FROM sessions WHERE token = ?', token);
    res.setHeader('Set-Cookie', cookie('', 0));
    return json(res, 200, { ok: true });
  }

  const user = await currentUser(req);

  if (route === 'GET /api/me') return json(res, 200, { user });

  if (!user) return json(res, 401, { error: 'unauthorized' });

  // Все запросы ниже ищут только по user_id вошедшего — чужие результаты не видны и не удаляются.
  if (route === 'GET /api/results') {
    const rows = await all(
      'SELECT id, category, summary, created_at FROM results WHERE user_id = ? ORDER BY id DESC', user.id);
    return json(res, 200, { results: rows.map(r => ({ ...r, summary: JSON.parse(r.summary) })) });
  }

  if (route === 'POST /api/results') {
    const { category, answers = {}, summary = {} } = await readBody(req);
    if (!['university', 'work', 'prep'].includes(category)) return json(res, 400, { error: 'bad_category' });
    if (!isPlainObject(answers) || !isPlainObject(summary)) return json(res, 400, { error: 'bad_json' });
    const n = await one('SELECT COUNT(*) AS c FROM results WHERE user_id = ?', user.id);
    if (Number(n.c) >= 200) return json(res, 400, { error: 'too_many' });
    const r = await run('INSERT INTO results (user_id, category, answers, summary) VALUES (?, ?, ?, ?)',
      user.id, category, JSON.stringify(answers), JSON.stringify(summary));
    return json(res, 201, { id: Number(r.lastInsertRowid) });
  }

  if (route === 'GET /api/favorites') {
    const rows = await all('SELECT name, place, web, created_at FROM favorites WHERE user_id = ? ORDER BY id DESC', user.id);
    return json(res, 200, { favorites: rows });
  }

  if (route === 'POST /api/favorites' || route === 'DELETE /api/favorites') {
    const body = await readBody(req);
    const name = str(body.name).trim().slice(0, 200), place = str(body.place).trim().slice(0, 20);
    if (!name || !place) return json(res, 400, { error: 'bad_json' });
    if (req.method === 'DELETE') {
      await run('DELETE FROM favorites WHERE user_id = ? AND name = ? AND place = ?', user.id, name, place);
      return json(res, 200, { ok: true });
    }
    // ссылку храним, только если это http(s)
    const web = /^https?:\/\/[^\s"'<>]{1,300}$/i.test(str(body.web)) ? str(body.web) : '';
    const n = await one('SELECT COUNT(*) AS c FROM favorites WHERE user_id = ?', user.id);
    if (Number(n.c) >= 300) return json(res, 400, { error: 'fav_limit' });
    await run('INSERT OR IGNORE INTO favorites (user_id, name, place, web) VALUES (?, ?, ?, ?)', user.id, name, place, web);
    return json(res, 201, { ok: true });
  }

  if (route === 'GET /api/calcs') {
    const rows = await all('SELECT id, kind, data, created_at FROM calcs WHERE user_id = ? ORDER BY id DESC', user.id);
    return json(res, 200, { calcs: rows.map(r => ({ ...r, data: JSON.parse(r.data) })) });
  }

  if (route === 'POST /api/calcs') {
    const { kind, data } = await readBody(req);
    if (!['chances', 'cost'].includes(kind) || !isPlainObject(data)) return json(res, 400, { error: 'bad_json' });
    const text = JSON.stringify(data);
    if (text.length > 20_000) return json(res, 413, { error: 'too_large' });
    const n = await one('SELECT COUNT(*) AS c FROM calcs WHERE user_id = ?', user.id);
    if (Number(n.c) >= 100) return json(res, 400, { error: 'too_many' });
    const r = await run('INSERT INTO calcs (user_id, kind, data) VALUES (?, ?, ?)', user.id, kind, text);
    return json(res, 201, { id: Number(r.lastInsertRowid) });
  }

  const cc = url.pathname.match(/^\/api\/calcs\/(\d{1,12})$/);
  if (cc && req.method === 'DELETE') {
    await run('DELETE FROM calcs WHERE id = ? AND user_id = ?', Number(cc[1]), user.id);
    return json(res, 200, { ok: true });
  }

  // ---------- резюме ----------
  if (route === 'GET /api/resumes/mine') {
    const rows = await all('SELECT r.*, u.name FROM resumes r JOIN users u ON u.id = r.user_id WHERE r.user_id = ? ORDER BY r.id DESC', user.id);
    return json(res, 200, { resumes: rows.map(r => resumeRow(r, true)) });
  }
  if (route === 'POST /api/resumes') {
    const b = await readBody(req);
    const title = str(b.title).trim().slice(0, 100), sector = str(b.sector).trim(), city = str(b.city).trim();
    const contact = str(b.contact).trim().slice(0, 100), about = str(b.about).trim().slice(0, 1000);
    const salary = b.salary === '' || b.salary == null ? null : Math.floor(Number(b.salary));
    if (title.length < 2 || !/^[a-z]{2,20}$/.test(sector) || !/^[a-z]{2,20}$/.test(city) || !RESUME_EXP.includes(b.exp)
        || contact.length < 3 || (salary !== null && !(salary >= 0 && salary <= 100000))) return json(res, 400, { error: 'bad_json' });
    const n = await one('SELECT COUNT(*) AS c FROM resumes WHERE user_id = ?', user.id);
    if (Number(n.c) >= 3) return json(res, 400, { error: 'too_many' });
    const r = await run('INSERT INTO resumes (user_id, title, sector, city, exp, salary, about, contact, search) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      user.id, title, sector, city, b.exp, salary, about, contact, (title + ' ' + about).toLowerCase());
    return json(res, 201, { id: Number(r.lastInsertRowid) });
  }
  const rm = url.pathname.match(/^\/api\/resumes\/(\d{1,12})$/);
  if (rm && req.method === 'DELETE') {
    await run('DELETE FROM resumes WHERE id = ? AND user_id = ?', Number(rm[1]), user.id);
    return json(res, 200, { ok: true });
  }

  // ---------- план по неделям ----------
  if (route === 'GET /api/plan') {
    const row = await one('SELECT data, updated_at FROM plans WHERE user_id = ?', user.id);
    return json(res, 200, { plan: row ? JSON.parse(row.data) : null, updated_at: row ? row.updated_at : null });
  }
  if (route === 'PUT /api/plan') {
    const { plan } = await readBody(req);
    if (!isPlainObject(plan) || !Array.isArray(plan.weeks) || plan.weeks.length > 160) return json(res, 400, { error: 'bad_json' });
    const text = JSON.stringify(plan);
    if (text.length > 150_000) return json(res, 413, { error: 'too_large' });
    await run(`INSERT INTO plans (user_id, data) VALUES (?, ?)
      ON CONFLICT (user_id) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`, user.id, text);
    return json(res, 200, { ok: true });
  }
  if (route === 'DELETE /api/plan') {
    await run('DELETE FROM plans WHERE user_id = ?', user.id);
    return json(res, 200, { ok: true });
  }

  // ---------- календарь ----------
  if (route === 'GET /api/events') {
    const rows = await all('SELECT id, title, date, note, kind, url FROM events WHERE user_id = ? ORDER BY date, id', user.id);
    return json(res, 200, { events: rows });
  }
  if (route === 'POST /api/events') {
    const { items } = await readBody(req);
    if (!Array.isArray(items) || !items.length || items.length > 60) return json(res, 400, { error: 'bad_json' });
    const clean = [];
    for (const it of items) {
      if (!isPlainObject(it)) return json(res, 400, { error: 'bad_json' });
      const title = str(it.title).trim().slice(0, 200), date = str(it.date);
      if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date))) return json(res, 400, { error: 'bad_json' });
      clean.push([title, date, str(it.note).slice(0, 500), ['deadline', 'exam', 'grant', 'task'].includes(it.kind) ? it.kind : 'task',
        /^https?:\/\/[^\s"'<>]{1,300}$/i.test(str(it.url)) ? str(it.url) : '']);
    }
    const n = await one('SELECT COUNT(*) AS c FROM events WHERE user_id = ?', user.id);
    if (Number(n.c) + clean.length > 300) return json(res, 400, { error: 'too_many' });
    for (const c of clean) await run('INSERT OR IGNORE INTO events (user_id, title, date, note, kind, url) VALUES (?, ?, ?, ?, ?, ?)', user.id, ...c);
    return json(res, 201, { ok: true });
  }
  const em = url.pathname.match(/^\/api\/events\/(\d{1,12})$/);
  if (em && req.method === 'DELETE') {
    await run('DELETE FROM events WHERE id = ? AND user_id = ?', Number(em[1]), user.id);
    return json(res, 200, { ok: true });
  }

  const m = url.pathname.match(/^\/api\/results\/(\d{1,12})$/);
  if (m && req.method === 'GET') {
    const r = await one('SELECT * FROM results WHERE id = ? AND user_id = ?', Number(m[1]), user.id);
    if (!r) return json(res, 404, { error: 'not_found' });
    return json(res, 200, { ...r, answers: JSON.parse(r.answers), summary: JSON.parse(r.summary) });
  }
  if (m && req.method === 'DELETE') {
    await run('DELETE FROM results WHERE id = ? AND user_id = ?', Number(m[1]), user.id);
    return json(res, 200, { ok: true });
  }

  return json(res, 404, { error: 'not_found' });
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.woff2': 'font/woff2',
};

// Страницы отдаёт Cloudflare Pages; здесь — для запуска на своём компьютере.
function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p === '/') p = '/index.html';
  if (!path.extname(p)) p += '.html';
  const file = path.normalize(path.join(PUBLIC, p));
  if (!file.startsWith(PUBLIC)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(path.join(PUBLIC, 'index.html')).pipe(res);
    }
    const ext = path.extname(file);
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.jpg' || ext === '.webp' ? 'public, max-age=604800' : 'no-cache',
    });
    fs.createReadStream(file).pipe(res);
  });
}

ready.then(() => {
  http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (url.pathname.startsWith('/api/')) return await api(req, res, url);
      serveStatic(req, res, url);
    } catch (e) {
      if (e instanceof HttpError) return json(res, e.status, { error: e.message });
      console.error(e);
      json(res, 500, { error: 'server_error' });
    }
  }).listen(PORT, () => console.log(`\n  Noventis запущен →  http://localhost:${PORT}\n`));
}).catch(e => { console.error('Не удалось подключиться к базе:', e.message); process.exit(1); });

// раз в час: чистим просроченные сессии и старые записи лимитов
setInterval(() => {
  run('DELETE FROM sessions WHERE expires_at < ?', Date.now()).catch(e => console.error(e));
  const now = Date.now();
  for (const map of [authHits, apiHits]) for (const [key, rec] of map) if (now - rec.t > WINDOW) map.delete(key);
}, 36e5).unref();
