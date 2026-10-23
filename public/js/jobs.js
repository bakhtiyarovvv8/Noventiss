// Работа в Узбекистане: вакансии hh.uz (?tab=vac), доска резюме (?tab=cv) и справочник профессий (?tab=prof)
const app = document.getElementById('app');
const params = new URLSearchParams(location.search);
const S = {
  tab: ['vac', 'cv', 'prof'].includes(params.get('tab')) ? params.get('tab') : 'vac',
  text: params.get('text') || '', city: '', salary: '', vac: null, vacPage: 0, vacBusy: false,
  cv: null, cvMore: false, cvPage: 0, cvSector: '', cvCity: '', cvQ: '', mine: [],
  pq: '', psector: '', psort: 'demand',
};
let RATE = null;

const fold = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const opts = (obj, sel, all) => (all ? `<option value="">${tx(all)}</option>` : '')
  + Object.entries(obj).map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${tx(v.t || v)}</option>`).join('');
const money = n => '$' + Number(n).toLocaleString('en-US');
const sums = n => RATE ? ' · ' + Math.round(n * RATE / 1e5) / 10 + T(' млн сум', 'm UZS', ' mln soʻm')[LANG] : '';
const W = {
  title: T('Работа в Узбекистане', 'Jobs in Uzbekistan', 'Oʻzbekistonda ish'),
  lead: T('Свежие вакансии, резюме тех, кто ищет работу, и 330+ профессий с зарплатами и спросом.',
    'Fresh vacancies, CVs of people looking for work and 330+ careers with salaries and demand.',
    'Yangi vakansiyalar, ish qidirayotganlar rezyumelari va maosh hamda talab koʻrsatilgan 330+ kasb.'),
  vac: T('Вакансии', 'Vacancies', 'Vakansiyalar'), cv: T('Ищу работу', 'Looking for work', 'Ish qidiraman'), prof: T('Профессии', 'Careers', 'Kasblar'),
  search: T('Профессия или навык', 'Job title or skill', 'Kasb yoki koʻnikma'), all_cities: T('Весь Узбекистан', 'All of Uzbekistan', 'Butun Oʻzbekiston'),
  salary_from: T('Зарплата от, $', 'Salary from, $', 'Maosh, $ dan'), find: T('Найти', 'Search', 'Qidirish'),
  found: T('Найдено вакансий', 'Vacancies found', 'Topilgan vakansiyalar'), more: T('Показать ещё', 'Show more', 'Yana koʻrsatish'),
  no_salary: T('Зарплата не указана', 'Salary not stated', 'Maosh koʻrsatilmagan'), open: T('Открыть на hh.uz ↗', 'Open on hh.uz ↗', 'hh.uz da ochish ↗'),
  also: T('Искать также на', 'Also search on', 'Shuningdek qidiring'),
  off: T('Живой поиск вакансий подключается ключом hh.uz (администратор сайта добавляет его один раз). А пока — готовые ссылки на поиск по твоему запросу:',
    'Live vacancy search needs an hh.uz API key (the site admin adds it once). Meanwhile, here are ready search links for your query:',
    'Jonli vakansiya qidiruvi hh.uz kaliti bilan ulanadi (sayt administratori uni bir marta qoʻshadi). Hozircha soʻrovingiz boʻyicha tayyor havolalar:'),
  err: T('Не удалось загрузить вакансии. Попробуй позже или открой площадки ниже.', 'Could not load vacancies. Try later or use the sites below.', 'Vakansiyalarni yuklab boʻlmadi. Keyinroq urinib koʻring yoki quyidagi saytlardan foydalaning.'),
  empty: T('Ничего не найдено', 'Nothing found', 'Hech narsa topilmadi'),
  all_sectors: T('Все сферы', 'All fields', 'Barcha sohalar'), cv_post: T('Разместить резюме', 'Post your CV', 'Rezyume joylash'),
  cv_mine: T('Мои резюме', 'My CVs', 'Mening rezyumelarim'), cv_login: T('Войди, чтобы видеть контакты и разместить своё резюме.', 'Log in to see contacts and post your CV.', 'Kontaktlarni koʻrish va rezyume joylash uchun kiring.'),
  login: T('Войти', 'Log in', 'Kirish'),
  f_title: T('Кем хочешь работать', 'Desired position', 'Kim boʻlib ishlamoqchisiz'), f_sector: T('Сфера', 'Field', 'Soha'), f_city: T('Город', 'City', 'Shahar'),
  f_exp: T('Опыт', 'Experience', 'Tajriba'), f_salary: T('Желаемая зарплата, $ в месяц', 'Expected salary, $ / month', 'Kutilayotgan maosh, $ / oy'),
  f_about: T('О себе: навыки, образование, языки', 'About you: skills, education, languages', 'Oʻzingiz haqingizda: koʻnikmalar, taʼlim, tillar'),
  f_contact: T('Контакт: Telegram или телефон', 'Contact: Telegram or phone', 'Aloqa: Telegram yoki telefon'),
  publish: T('Опубликовать', 'Publish', 'Eʼlon qilish'), del: T('Удалить', 'Delete', 'Oʻchirish'),
  posted: T('Резюме опубликовано', 'CV published', 'Rezyume eʼlon qilindi'), deleted: T('Удалено', 'Deleted', 'Oʻchirildi'),
  limit: T('Можно разместить до 3 резюме', 'You can post up to 3 CVs', '3 tagacha rezyume joylash mumkin'),
  check: T('Заполни должность, сферу, город, опыт и контакт', 'Fill in position, field, city, experience and contact', 'Lavozim, soha, shahar, tajriba va aloqani toʻldiring'),
  public_note: T('Резюме видят все посетители, контакт — только вошедшие пользователи.', 'Everyone can see your CV; only logged-in users see your contact.', 'Rezyumeni hamma koʻradi, aloqani — faqat kirgan foydalanuvchilar.'),
  hidden: T('контакт виден после входа', 'log in to see contact', 'aloqa kirgandan keyin koʻrinadi'),
  by_demand: T('Сначала востребованные', 'Most in demand first', 'Avval talab yuqorilari'), by_salary: T('Сначала высокая зарплата', 'Highest pay first', 'Avval yuqori maosh'),
  by_name: T('По алфавиту', 'Alphabetical', 'Alifbo boʻyicha'), per_month: T('в месяц', 'per month', 'oyiga'),
  vac_btn: T('Вакансии →', 'Vacancies →', 'Vakansiyalar →'), day_btn: T('День из жизни', 'A day in the life', 'Bir kun hayoti'),
  sal_note: T('Зарплаты — ориентир по Узбекистану на 2026 год, зависят от города, опыта и компании.', 'Salaries are a 2026 guide for Uzbekistan and vary by city, experience and company.', 'Maoshlar — 2026-yil uchun Oʻzbekiston boʻyicha moʻljal, shahar, tajriba va kompaniyaga bogʻliq.'),
  prof_count: T('профессий', 'careers', 'kasb'),
};
const EXP = { none: T('Без опыта', 'No experience', 'Tajribasiz'), lt1: T('До 1 года', 'Under 1 year', '1 yilgacha'), y1: T('1–3 года', '1–3 years', '1–3 yil'), y3: T('3+ года', '3+ years', '3+ yil') };
const w = k => tx(W[k]);

function setUrl() {
  const p = new URLSearchParams({ tab: S.tab });
  if (S.tab === 'vac' && S.text) p.set('text', S.text);
  history.replaceState(null, '', '/jobs?' + p);
}

function render() {
  setUrl();
  app.innerHTML = `
    <div class="page-head"><span class="kicker">${t('nav_tools')}</span><h1>${w('title')}</h1><p>${w('lead')}</p></div>
    <div class="chips-pick" style="margin-bottom:24px">${['vac', 'cv', 'prof'].map(k =>
      `<button type="button" class="chip-btn ${S.tab === k ? 'on' : ''}" data-tab="${k}">${w(k)}</button>`).join('')}</div>
    <div id="pane"></div>`;
  app.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { S.tab = b.dataset.tab; render(); });
  ({ vac: renderVac, cv: renderCv, prof: renderProf })[S.tab]();
}
const pane = () => document.getElementById('pane');

// ---------- вакансии ----------
const sitesBlock = () => `<div class="card"><h4 class="rank" style="margin:0 0 14px">${w('also')}</h4><div class="chips-pick">${JOB_SITES.map(s =>
  `<a class="chip-btn" href="${escapeHtml(s.url(S.text))}" target="_blank" rel="noopener">${escapeHtml(s.n)} ↗</a>`).join('')}</div></div>`;

const salaryText = s => {
  if (!s || (!s.from && !s.to)) return w('no_salary');
  const f = n => Number(n).toLocaleString(locale());
  return (s.from && s.to ? `${f(s.from)}–${f(s.to)}` : s.from ? T('от ', 'from ', '')[LANG] + f(s.from) + (LANG === 'uz' ? ' dan' : '') : T('до ', 'up to ', '')[LANG] + f(s.to) + (LANG === 'uz' ? ' gacha' : ''))
    + ' ' + escapeHtml(s.currency === 'UZS' ? T('сум', 'UZS', 'soʻm')[LANG] : s.currency || '');
};

function vacList() {
  const d = S.vac;
  if (!d) return `<div class="empty">…</div>`;
  if (d.error) return `<div class="alert">${w('err')}</div>`;
  if (!d.configured) return `<div class="alert">${w('off')}</div>`;
  if (!d.items.length) return `<div class="empty">${w('empty')}</div>`;
  return `<p class="note" style="margin:0 0 14px">${w('found')}: <b>${Number(d.found).toLocaleString(locale())}</b></p>
    <div class="tools-grid">${d.items.map(v => `<div class="tool career">
      <b>${escapeHtml(v.name)}</b>
      <span>${escapeHtml(v.employer)} · ${escapeHtml(v.city)}${v.date ? ' · ' + escapeHtml(v.date) : ''}</span>
      <span style="color:var(--gold-2)">${salaryText(v.salary)}</span>
      ${v.req ? `<span>${escapeHtml(v.req)}</span>` : ''}
      ${v.exp || v.schedule ? `<span>${escapeHtml([v.exp, v.schedule].filter(Boolean).join(' · '))}</span>` : ''}
      ${v.url ? `<a class="more" href="${escapeHtml(v.url)}" target="_blank" rel="noopener" style="color:var(--gold)">${w('open')}</a>` : ''}
    </div>`).join('')}</div>
    ${d.page + 1 < d.pages ? `<div style="text-align:center;margin:20px 0"><button class="btn btn-ghost" id="vmore">${w('more')}</button></div>` : ''}`;
}

async function loadVac(append) {
  if (S.vacBusy) return;
  S.vacBusy = true;
  const p = new URLSearchParams({ page: String(append ? S.vacPage + 1 : 0) });
  if (S.text) p.set('text', S.text);
  if (S.city && UZ_CITIES[S.city].hh) p.set('area', UZ_CITIES[S.city].hh);
  if (S.salary) p.set('salary', S.salary);
  const r = await api('/api/jobs?' + p).catch(() => ({ ok: false, data: {} }));
  S.vacBusy = false;
  if (!r.ok) S.vac = { error: true };
  else if (append && S.vac && S.vac.items) { S.vac = { ...r.data, items: S.vac.items.concat(r.data.items) }; S.vacPage = r.data.page; }
  else { S.vac = r.data; S.vacPage = 0; }
  if (S.tab === 'vac') drawVac();
}

function drawVac() {
  const box = document.getElementById('vlist');
  if (!box) return;
  box.innerHTML = vacList();
  const more = document.getElementById('vmore');
  if (more) more.onclick = () => { more.disabled = true; loadVac(true); };
  document.getElementById('vsites').innerHTML = sitesBlock();
}

function renderVac() {
  const cities = Object.fromEntries(Object.entries(UZ_CITIES).filter(([, c]) => c.hh));
  pane().innerHTML = `
    <form class="filters" id="vf" style="grid-template-columns:1fr 220px 160px auto">
      <input class="input" id="vt" type="search" autocomplete="off" placeholder="${w('search')}" value="${escapeHtml(S.text)}">
      <select class="select" id="vc">${opts(cities, S.city, W.all_cities)}</select>
      <input class="input" id="vs" type="number" min="0" step="50" placeholder="${w('salary_from')}" value="${escapeHtml(S.salary)}">
      <button class="btn btn-gold" type="submit">${w('find')}</button>
    </form>
    <div id="vlist"></div><div id="vsites" style="margin-top:18px"></div>`;
  document.getElementById('vf').onsubmit = e => {
    e.preventDefault();
    S.text = document.getElementById('vt').value.trim();
    S.city = document.getElementById('vc').value;
    S.salary = document.getElementById('vs').value;
    S.vac = null; setUrl(); drawVac(); loadVac(false);
  };
  drawVac();
  if (!S.vac) loadVac(false);
}

// ---------- резюме ----------
async function loadCv(append) {
  const p = new URLSearchParams({ page: String(append ? S.cvPage + 1 : 0) });
  if (S.cvSector) p.set('sector', S.cvSector);
  if (S.cvCity) p.set('city', S.cvCity);
  if (S.cvQ) p.set('q', S.cvQ);
  const r = await api('/api/resumes?' + p);
  const list = r.ok ? r.data.resumes : [];
  S.cv = append ? (S.cv || []).concat(list) : list;
  S.cvPage = append ? S.cvPage + 1 : 0;
  S.cvMore = r.ok && r.data.more;
  if (ME) { const m = await api('/api/resumes/mine'); S.mine = m.ok ? m.data.resumes : []; }
  if (S.tab === 'cv') drawCv();
}

const cvCard = (r, mine) => `<div class="tool career">
  <b>${escapeHtml(r.title)}</b>
  <span>${tx((SECTORS[r.sector] || {}).t) || ''} · ${tx((UZ_CITIES[r.city] || {}).t) || ''} · ${tx(EXP[r.exp])}</span>
  ${r.salary != null ? `<span style="color:var(--gold-2)">${money(r.salary)} ${w('per_month')}${sums(r.salary)}</span>` : ''}
  ${r.about ? `<span style="white-space:pre-line">${escapeHtml(r.about)}</span>` : ''}
  <span>${escapeHtml(r.name)} · ${r.contact ? `<b style="font-family:inherit;font-size:14px;color:var(--gold)">${escapeHtml(r.contact)}</b>` : `<i>${w('hidden')}</i>`}</span>
  ${mine ? `<div class="career-actions"><button class="btn btn-ghost" data-del="${r.id}">${w('del')}</button></div>` : ''}
</div>`;

function drawCv() {
  const box = document.getElementById('cvlist');
  if (!box) return;
  box.innerHTML = !S.cv ? '<div class="empty">…</div>'
    : (S.cv.length ? `<div class="tools-grid">${S.cv.map(r => cvCard(r, false)).join('')}</div>` : `<div class="empty">${w('empty')}</div>`)
      + (S.cvMore ? `<div style="text-align:center;margin:20px 0"><button class="btn btn-ghost" id="cmore">${w('more')}</button></div>` : '');
  const more = document.getElementById('cmore');
  if (more) more.onclick = () => { more.disabled = true; loadCv(true); };
  const mine = document.getElementById('mine');
  if (mine) mine.innerHTML = S.mine.length ? `<h4 class="rank" style="margin:24px 0 14px">${w('cv_mine')}</h4><div class="tools-grid">${S.mine.map(r => cvCard(r, true)).join('')}</div>` : '';
  app.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    const r = await api('/api/resumes/' + b.dataset.del, { method: 'DELETE' });
    if (r.ok) { toast(w('deleted')); loadCv(false); }
  });
}

function renderCv() {
  const sectors = SECTORS, cities = UZ_CITIES;
  pane().innerHTML = `
    <div class="card">
      ${ME ? `<details><summary class="btn btn-gold" style="display:inline-flex">${w('cv_post')}</summary>
        <form id="cvf" style="display:grid;gap:12px;margin-top:18px">
          <input class="input" name="title" maxlength="100" placeholder="${w('f_title')}" required>
          <div class="filters" style="grid-template-columns:1fr 1fr 1fr;margin:0">
            <select class="select" name="sector" required>${opts(sectors, '', W.f_sector)}</select>
            <select class="select" name="city" required>${opts(cities, '', W.f_city)}</select>
            <select class="select" name="exp" required>${opts(EXP, '', W.f_exp)}</select>
          </div>
          <input class="input" name="salary" type="number" min="0" max="100000" placeholder="${w('f_salary')}">
          <textarea class="input" name="about" rows="4" maxlength="1000" placeholder="${w('f_about')}" style="resize:vertical;padding-top:14px"></textarea>
          <input class="input" name="contact" maxlength="100" placeholder="${w('f_contact')}" required>
          <p class="note" style="margin:0">${w('public_note')}</p>
          <div><button class="btn btn-gold" type="submit">${w('publish')}</button></div>
        </form></details><div id="mine"></div>`
      : `<p style="margin:0 0 14px">${w('cv_login')}</p><a class="btn btn-gold" href="/auth?next=${encodeURIComponent('/jobs?tab=cv')}">${w('login')}</a>`}
    </div>
    <div class="filters" style="grid-template-columns:1fr 220px 220px">
      <input class="input" id="cq" type="search" autocomplete="off" placeholder="${w('search')}" value="${escapeHtml(S.cvQ)}">
      <select class="select" id="cs">${opts(sectors, S.cvSector, W.all_sectors)}</select>
      <select class="select" id="cc">${opts(cities, S.cvCity, W.all_cities)}</select>
    </div>
    <div id="cvlist"></div>`;
  let timer;
  document.getElementById('cq').oninput = e => { clearTimeout(timer); timer = setTimeout(() => { S.cvQ = e.target.value.trim(); loadCv(false); }, 350); };
  document.getElementById('cs').onchange = e => { S.cvSector = e.target.value; loadCv(false); };
  document.getElementById('cc').onchange = e => { S.cvCity = e.target.value; loadCv(false); };
  const f = document.getElementById('cvf');
  if (f) f.onsubmit = async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(f));
    if (!body.title.trim() || !body.sector || !body.city || !body.exp || body.contact.trim().length < 3) return toast(w('check'));
    const r = await api('/api/resumes', { method: 'POST', body });
    if (!r.ok) return toast(r.data.error === 'too_many' ? w('limit') : r.data.error === 'bad_json' ? w('check') : t('err_server'));
    toast(w('posted')); f.reset(); f.parentElement.open = false; loadCv(false);
  };
  drawCv();
  loadCv(false);
}

// ---------- справочник профессий ----------
function renderProf() {
  pane().innerHTML = `
    <div class="filters" style="grid-template-columns:1fr 260px">
      <input class="input" id="pq" type="search" autocomplete="off" placeholder="${w('search')}" value="${escapeHtml(S.pq)}">
      <select class="select" id="ps">${opts({ demand: W.by_demand, salary: W.by_salary, name: W.by_name }, S.psort)}</select>
    </div>
    <div class="chips-pick" style="margin-bottom:20px">
      <button type="button" class="chip-btn ${S.psector ? '' : 'on'}" data-sec="">${w('all_sectors')}</button>
      ${Object.entries(SECTORS).map(([k, s]) => `<button type="button" class="chip-btn ${S.psector === k ? 'on' : ''}" data-sec="${k}">${tx(s.t)}</button>`).join('')}
    </div>
    <div id="plist"></div><p class="note">${w('sal_note')}</p>`;
  const $q = document.getElementById('pq');
  $q.oninput = () => { S.pq = $q.value; drawProf(); };
  document.getElementById('ps').onchange = e => { S.psort = e.target.value; drawProf(); };
  app.querySelectorAll('[data-sec]').forEach(b => b.onclick = () => {
    S.psector = b.dataset.sec;
    app.querySelectorAll('[data-sec]').forEach(x => x.classList.toggle('on', x === b));
    drawProf();
  });
  drawProf();
}

function drawProf() {
  const q = fold(S.pq.trim());
  const name = p => ({ ru: p[0], en: p[1], uz: p[2] })[LANG] || p[0];
  let list = PROFS.filter(p => (!S.psector || p[3] === S.psector) && (!q || fold(p[0] + ' ' + p[1] + ' ' + p[2]).includes(q)));
  const cmp = { demand: (a, b) => b[7] - a[7] || b[5] - a[5], salary: (a, b) => b[5] - a[5] || b[4] - a[4], name: (a, b) => name(a).localeCompare(name(b), locale()) }[S.psort];
  list = list.slice().sort(cmp);
  document.getElementById('plist').innerHTML = `<p class="note" style="margin:0 0 14px">${list.length} ${w('prof_count')}</p>`
    + (list.length ? `<div class="tools-grid">${list.map(p => {
      const sec = SECTORS[p[3]];
      return `<div class="tool career">
        <b>${escapeHtml(name(p))}</b>
        <span>${tx(sec.t)}</span>
        <span style="color:var(--gold-2)">${money(p[4])}–${money(p[5])} ${w('per_month')}</span>
        <span>${tx(EDU[p[6]])} · ${'●'.repeat(p[7])}${'○'.repeat(3 - p[7])} ${tx(DEMAND[p[7]])}</span>
        <div class="career-actions">
          <a href="/jobs?tab=vac&text=${encodeURIComponent(p[0])}" class="more" data-vac="${escapeHtml(p[0])}" style="color:var(--gold)">${w('vac_btn')}</a>
          ${sec.f && FIELDS[sec.f] ? `<a href="/careers?f=${sec.f}" class="more">${w('day_btn')}</a>` : ''}
        </div>
      </div>`;
    }).join('')}</div>` : `<div class="empty">${w('empty')}</div>`);
  app.querySelectorAll('[data-vac]').forEach(a => a.onclick = e => {
    e.preventDefault();
    S.text = a.dataset.vac; S.city = ''; S.salary = ''; S.vac = null; S.tab = 'vac';
    render(); scrollTo(0, 0);
  });
}

document.addEventListener('langchange', render);
document.addEventListener('DOMContentLoaded', async () => {
  await loadMe();
  render();
  gsap.from('.page-head > *', { y: 30, opacity: 0, stagger: .06, duration: 1, ease: 'expo.out' });
  const r = await api('/api/rate');
  if (r.ok && r.data.rate) { RATE = r.data.rate; if (S.tab === 'cv') drawCv(); }
});
