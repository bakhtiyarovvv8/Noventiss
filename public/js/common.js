// Общие утилиты: язык, API, навигация
const UI = {
  nav_how: L('Как это работает', 'How it works'), nav_tracks: L('Треки', 'Tracks'), nav_world: L('Мир', 'World'),
  nav_login: L('Войти', 'Log in'), nav_profile: L('Кабинет', 'Dashboard'), nav_logout: L('Выйти', 'Log out'),
  start: L('Пройти тест', 'Take the test'), start_track: L('Начать', 'Start'), minutes: L('≈ 5 минут', '≈ 5 minutes'),

  hero_kicker: L('Профориентация для молодёжи Узбекистана', 'Career guidance for the youth of Uzbekistan'),
  hero_title: L('Твоё будущее<br>начинается <em>здесь</em>', 'Your future<br>starts <em>here</em>'),
  hero_sub: L('Пройди тест о своих способностях — и узнай, куда поступить, кем работать и где в мире твоя сфера развита сильнее всего.',
              'Take a test about your abilities — and find out where to study, what to work as and where in the world your field thrives.'),
  scroll: L('Листай вниз', 'Scroll down'),

  fly_1t: L('Мир огромен', 'The world is vast'), fly_1s: L('Тысячи вузов, сотни профессий. С чего начать?', 'Thousands of universities, hundreds of careers. Where to start?'),
  fly_2t: L('Поднимись над шумом', 'Rise above the noise'), fly_2s: L('Советы родственников, мнения друзей. Посмотри на себя сверху.', 'Advice from relatives, opinions of friends. Look at yourself from above.'),
  fly_3t: L('Лондон. Финансы. Право.', 'London. Finance. Law.'), fly_3s: L('В каждом городе мира развита своя сфера.', 'Every city in the world has its own strength.'),
  fly_4t: L('Гонконг. Бизнес. Технологии.', 'Hong Kong. Business. Tech.'), fly_4s: L('Мы покажем, где твоя сфера сильнее всего.', 'We’ll show you where your field is strongest.'),
  fly_5t: L('Твой кампус', 'Your campus'), fly_5s: L('Подберём вузы в Узбекистане и по всему миру.', 'We’ll match universities in Uzbekistan and worldwide.'),
  fly_6t: L('Твой выпускной', 'Your graduation'), fly_6s: L('Осталось сделать первый шаг.', 'All that’s left is the first step.'),

  tracks_kicker: L('Три трека', 'Three tracks'), tracks_title: L('Выбери, с чего начать', 'Choose where to begin'),
  how_kicker: L('Как это работает', 'How it works'), how_title: L('Три шага до ясности', 'Three steps to clarity'),
  how_1t: L('Расскажи о себе', 'Tell us about you'), how_1s: L('Возраст, языки, любимые предметы, навыки и мечты.', 'Age, languages, favourite subjects, skills and dreams.'),
  how_2t: L('Ответь на вопросы', 'Answer questions'), how_2s: L('Короткие вопросы о способностях — без правильных и неправильных ответов.', 'Short questions about your abilities — no right or wrong answers.'),
  how_3t: L('Получи план', 'Get your plan'), how_3s: L('Направления, вузы, страны, зарплаты и пошаговый план подготовки.', 'Fields, universities, countries, salaries and a step-by-step prep plan.'),
  stat_fields: L('направлений', 'fields'), stat_unis: L('вузов мира', 'universities'), stat_countries: L('стран и регионов', 'countries & regions'), stat_grants: L('программ грантов', 'grant programs'),
  world_kicker: L('Где развиты сферы', 'Where fields thrive'), world_title: L('Мир как карта возможностей', 'The world as a map of opportunity'),
  city_tokyo: L('Япония', 'Japan'),
  city_london: L('Великобритания', 'United Kingdom'),
  city_chicago: L('США', 'USA'),
  city_hk: L('Гонконг', 'Hong Kong'),
  city_seoul: L('Южная Корея', 'South Korea'),
  cta_title: L('Готов узнать, кем станешь?', 'Ready to find out who you’ll become?'),
  cta_sub: L('Регистрация бесплатная. Результаты сохраняются в твоём кабинете.', 'Sign-up is free. Your results are saved in your dashboard.'),
  footer: L('Noventis — сделано для тех, кто ищет свой путь.', 'Noventis — made for those finding their way.'),

  // auth
  auth_quote: L('«Кто знает, куда идёт, — тому и ветер попутный»', '“If you know where you’re going, every wind is fair”'),
  auth_welcome: L('С возвращением', 'Welcome back'), auth_join: L('Создай аккаунт', 'Create your account'),
  auth_login_sub: L('Войди, чтобы продолжить тест и увидеть результаты.', 'Log in to continue and see your results.'),
  auth_reg_sub: L('Сохраняй результаты тестов и возвращайся к ним в любой момент.', 'Save your test results and come back anytime.'),
  tab_login: L('Вход', 'Log in'), tab_register: L('Регистрация', 'Sign up'),
  f_name: L('Имя', 'Name'), f_email: L('Email', 'Email'), f_password: L('Пароль', 'Password'),
  f_password_hint: L('Минимум 8 символов', 'At least 8 characters'),
  btn_login: L('Войти', 'Log in'), btn_register: L('Создать аккаунт', 'Create account'),
  pw_weak: L('Слабый', 'Weak'), pw_ok: L('Нормальный', 'Fair'), pw_strong: L('Надёжный', 'Strong'),
  err_name_short: L('Имя слишком короткое', 'Name is too short'), err_email_invalid: L('Неверный email', 'Invalid email'),
  err_password_short: L('Пароль — минимум 8 символов', 'Password must be at least 8 characters'),
  err_email_taken: L('Этот email уже зарегистрирован', 'This email is already registered'),
  err_bad_credentials: L('Неверный email или пароль', 'Wrong email or password'),
  err_too_many: L('Слишком много попыток. Подожди 15 минут.', 'Too many attempts. Wait 15 minutes.'),
  err_server: L('Ошибка сервера. Попробуй ещё раз.', 'Server error. Try again.'),
  wait_wake: L('Подключаемся, это займёт до минуты…', 'Connecting, this may take up to a minute…'),

  // test
  q_of: L('Вопрос', 'Question'), back: L('Назад', 'Back'), next: L('Далее', 'Next'), finish: L('Показать результат', 'Show result'),
  section_profile: L('О тебе', 'About you'), section_main: L('Способности и интересы', 'Abilities & interests'),
  section_work: L('Навыки и цели', 'Skills & goals'), section_prep: L('Твоя подготовка', 'Your preparation'),
  analyzing: L('Анализируем ответы…', 'Analysing your answers…'),
  res_kicker: L('Твой результат', 'Your result'),
  res_uni_title: L('Тебе подходят эти направления', 'These fields suit you'),
  res_work_title: L('Профессии, которые тебе подходят', 'Careers that suit you'),
  res_prep_title: L('Твой план подготовки', 'Your preparation plan'),
  match: L('совпадение', 'match'), where_strong: L('Где сфера развита', 'Where it thrives'),
  unis_world: L('Сильные вузы мира', 'Top universities worldwide'), unis_uz: L('В Узбекистане', 'In Uzbekistan'),
  your_regions: L('в выбранных странах', 'in your chosen regions'),
  grants: L('Гранты и стипендии для тебя', 'Grants & scholarships for you'),
  salary_uz: L('Узбекистан, в месяц', 'Uzbekistan, monthly'), salary_w: L('США/Европа, в год', 'USA/Europe, yearly'),
  first_steps: L('Первые шаги', 'First steps'), platforms: L('Где искать работу', 'Where to find jobs'),
  salary_note: L('Зарплаты ориентировочные (2026), зависят от опыта и компании.', 'Salaries are approximate (2026) and depend on experience and company.'),
  exams_needed: L('Экзамены и требования', 'Exams & requirements'), roadmap: L('Дорожная карта', 'Roadmap'),
  week_plan: L('Неделя подготовки', 'Your study week'), weak_tips: L('Как прокачать слабые места', 'How to fix weak spots'),
  resources: L('Бесплатные ресурсы', 'Free resources'),
  saved: L('Результат сохранён в кабинете', 'Result saved to your dashboard'),
  retake: L('Пройти заново', 'Retake'), to_profile: L('В кабинет', 'To dashboard'), other_tracks: L('Другие треки', 'Other tracks'),
  profile_note: L('Твой профиль', 'Your profile'),
  eng_warn: L('Для зарубежных вузов подтяни английский до B2+ / IELTS 6.0+', 'For universities abroad, raise your English to B2+ / IELTS 6.0+'),
  age_note_young: L('Тебе ещё рано поступать — отлично! Есть время спокойно подготовиться и попробовать олимпиады.', 'You’re still young — great! You have time to prepare calmly and try olympiads.'),

  // главная вошедшего и повторный тест
  home_title: L('Начнём<br>твой <em>путь</em>', 'Let’s start<br>your <em>journey</em>'),
  home_sub: L('Начни с одного из трёх тестов. Каждая попытка сохраняется в кабинете — можно проходить снова и смотреть, как меняется результат.',
              'Start with one of the three tests. Every attempt is saved to your dashboard — retake any time and see how your result changes.'),
  home_done: L('пройден', 'taken'), home_again: L('Пройти ещё раз', 'Take again'),
  rt_title: L('Пройти тест ещё раз?', 'Take the test again?'),
  rt_text: L('Ты уже проходил(а) этот тест. Новая попытка сохранится отдельно — прошлые результаты останутся в кабинете.', 'You’ve already taken this test. The new attempt is saved separately — your previous results stay in your dashboard.'),
  rt_count: L('Попыток', 'Attempts'), rt_yes: L('Да, пройти ещё раз', 'Yes, take it again'), rt_last: L('Открыть последний результат', 'Open my last result'),
  cancel: L('Отмена', 'Cancel'), attempt: L('Попытка', 'Attempt'),

  // profile
  hello: L('Привет', 'Hi'), member_since: L('С нами с', 'Member since'),
  my_results: L('Мои результаты', 'My results'), no_results: L('Пока нет результатов. Пройди первый тест!', 'No results yet. Take your first test!'),
  open: L('Открыть', 'Open'), delete: L('Удалить', 'Delete'), new_test: L('Новый тест', 'New test'),

  // результат: почему подходит, PDF, поделиться
  why_title: L('Почему тебе подходит — твои ответы', 'Why it fits you — your answers'),
  pdf_btn: L('Скачать PDF', 'Download PDF'), share_btn: L('Поделиться', 'Share'),
  pdf_hint: L('В окне печати выбери «Сохранить как PDF»', 'In the print dialog choose “Save as PDF”'),
  share_title: L('Мне подходит', 'My best fit'), share_cta: L('Пройди тест и узнай свой путь', 'Take the test and find your path'),
  share_saved: L('Картинка сохранена — отправь её в Telegram или Instagram', 'Image saved — send it to Telegram or Instagram'),
  report_for: L('Отчёт для', 'Report for'), report_date: L('Дата', 'Date'),

  // калькулятор шансов
  ch_title: L('Калькулятор шансов', 'Admission chances'),
  ch_lead: L('Введи свои баллы — покажем, куда ты поступишь с запасом, куда реально, а куда это мечта.', 'Enter your scores — see where you’re safe, where it’s realistic and where it’s a dream.'),
  ch_ielts: L('IELTS', 'IELTS'), ch_no_ielts: L('Ещё не сдавал(а)', 'Not taken yet'),
  ch_sat: L('SAT (если есть)', 'SAT (if any)'), ch_gpa: L('Средний балл в школе (из 5)', 'School average (out of 5)'),
  ch_olymp: L('Олимпиады', 'Olympiads'), ch_ol0: L('Нет', 'None'), ch_ol1: L('Областные', 'Regional'),
  ch_ol2: L('Республиканские', 'National'), ch_ol3: L('Международные', 'International'),
  ch_ru: L('Знаю русский (для вузов России)', 'I speak Russian (for Russian universities)'),
  ch_field: L('Направление', 'Field'), ch_countries: L('Страны', 'Countries'), ch_all: L('Все', 'All'),
  ch_safe: L('С запасом', 'Safe'), ch_match: L('Реально', 'Realistic'), ch_reach: L('Мечта', 'Dream'),
  ch_safe_d: L('Твои баллы выше обычных требований', 'Your scores are above typical requirements'),
  ch_match_d: L('Баллы на уровне требований — шансы хорошие', 'Scores match requirements — good chances'),
  ch_reach_d: L('Очень высокий конкурс или не хватает баллов', 'Very competitive or scores fall short'),
  ch_need_ielts: L('нужен IELTS', 'needs IELTS'), ch_need_sat: L('нужен SAT', 'needs SAT'), ch_need_ru: L('нужен русский', 'needs Russian'),
  ch_found: L('Foundation / 1 курс', 'Foundation / 1st year'), ch_kolleg: L('Studienkolleg', 'Studienkolleg'),
  ch_lottery: L('конкурс < 10%', 'acceptance < 10%'),
  ch_tip: L('Подними IELTS до', 'Raise your IELTS to'), ch_tip2: L('— и станет реальнее ещё', '— and this many more become realistic:'),
  ch_note: L('Оценка ориентировочная: вузы смотрят ещё эссе, рекомендации и достижения. Требования проверяй на сайте вуза. «Foundation» — после 11 классов школы Узбекистана многие вузы Великобритании, Нидерландов и Австралии просят подготовительный год или 1 курс вуза; Германия — Studienkolleg.',
    'An estimate only: universities also weigh essays, references and achievements. Check requirements on the university website. “Foundation” — after Uzbekistan’s 11-year school, many UK, Dutch and Australian universities ask for a foundation year or 1 year of university; Germany — Studienkolleg.'),

  // калькулятор стоимости
  co_title: L('Калькулятор стоимости', 'Cost calculator'),
  co_lead: L('Сколько стоит учёба и жизнь в другой стране — в долларах и сумах. И какие гранты это покроют.', 'What studying and living abroad costs — in dollars and soums. And which grants cover it.'),
  co_country: L('Страна', 'Country'), co_type: L('Вуз', 'University'), co_pub: L('Государственный', 'Public'), co_priv: L('Частный', 'Private'),
  co_field: L('Направление (необязательно)', 'Field (optional)'), co_years: L('Лет учёбы', 'Years of study'), co_style: L('Образ жизни', 'Lifestyle'),
  co_eco: L('Эконом', 'Budget'), co_mid: L('Средний', 'Average'), co_comf: L('Комфорт', 'Comfort'),
  co_tuition: L('Обучение в год', 'Tuition per year'), co_living: L('Жизнь в год', 'Living per year'),
  co_once: L('Виза, страховка, перелёты в год', 'Visa, insurance, flights per year'),
  co_year: L('Итого за год', 'Total per year'), co_total: L('За всю учёбу', 'Whole programme'),
  co_month: L('в месяц', 'per month'), co_rate: L('Курс ЦБ', 'CBU rate'),
  co_grants: L('Гранты, которые это покрывают', 'Grants that cover it'),
  co_full: L('покрывает всё: обучение и жизнь', 'covers everything: tuition and living'),
  co_tuit: L('покрывает обучение', 'covers tuition'), co_part: L('покрывает часть обучения', 'covers part of tuition'),
  co_left: L('останется платить в год', 'left to pay per year'), co_no_grants: L('Крупных грантов для этой страны нет — смотри стипендии самих вузов.', 'No major grants for this country — check university scholarships.'),
  co_note: L('Цифры ориентировочные (2026) и зависят от города и вуза. Частичные скидки считаем как 50% обучения.', 'Figures are approximate (2026) and depend on the city and university. Partial discounts are counted as 50% of tuition.'),
  sum: L('сум', 'UZS'),

  // календарь: только события, добавленные пользователем
  dl_title: L('Календарь дедлайнов', 'Deadline calendar'),
  dl_lead: L('Здесь только то, что ты добавил(а) сам(а): даты из плана по неделям и свои события. Скачай их в календарь телефона — придут напоминания.', 'Only what you added yourself: dates from your weekly plan and your own events. Download them to your phone calendar to get reminders.'),
  dl_days: L('дн.', 'days'), dl_today: L('сегодня', 'today'), dl_ics: L('В календарь', 'To calendar'),
  dl_ics_all: L('Скачать мой календарь (.ics)', 'Download my calendar (.ics)'),
  dl_ics_hint: L('Открой файл на телефоне — события появятся в календаре, напоминания придут за 30, 7 и 1 день.', 'Open the file on your phone — events appear in your calendar with reminders 30, 7 and 1 day before.'),
  dl_none_mine: L('Календарь пока пуст. Составь план по неделям и добавь его даты — или добавь своё событие ниже.', 'Your calendar is empty. Build a weekly plan and add its dates — or add your own event below.'),
  dl_soon: L('Мои ближайшие события', 'My upcoming events'), dl_open: L('Весь календарь →', 'Full calendar →'),
  dl_note: L('Сроки из списка — ориентир по прошлым годам. Точную дату всегда проверяй на официальном сайте.', 'Deadlines from the list are based on previous years. Always check the exact date on the official website.'),

  // личный план по неделям
  pl_title: L('Мой план по неделям', 'My weekly plan'),
  pl_lead: L('Выбери вуз, направление и дедлайн — сайт сам разложит подготовку по неделям. Потом поправь план под себя и добавь даты в календарь.', 'Pick a university, field and deadline — we’ll spread your prep over the weeks. Then adjust the plan and add its dates to your calendar.'),
  pl_left: L('До подачи осталось', 'Until applications'), pl_weeks: L('нед.', 'wk'),
  pl_week: L('Неделя', 'Week'), pl_now: L('эта неделя', 'this week'), pl_done: L('выполнено', 'done'),
  pl_show_all: L('Показать все недели', 'Show all weeks'), pl_hide: L('Только ближайшие', 'Upcoming only'),
  pl_open: L('План по неделям', 'Weekly plan'),

  // бесплатные ресурсы
  rs_title: L('Бесплатные ресурсы', 'Free resources'),
  rs_lead: L('Проверенные бесплатные курсы и сайты для подготовки к экзаменам и по каждой сфере.', 'Hand-picked free courses and websites for exam prep and every field.'),
  rs_exams: L('Экзамены', 'Exams'), rs_areas: L('Сферы', 'Fields'), rs_all: L('Для всех', 'For everyone'),
  rs_count: L('ресурсов', 'resources'), rs_field: L('Ресурсы по сфере →', 'Resources for this field →'),

  // профессии: день из жизни и сравнение
  cr_title: L('Профессии', 'Careers'),
  cr_lead: L('43 направления: как проходит рабочий день, сколько платят, сколько учиться и что сложного. Сравни любые две.', '43 fields: what a workday looks like, pay, years of study and the hard parts. Compare any two.'),
  cr_search: L('Найти профессию', 'Find a career'), cr_day: L('День из жизни', 'A day in the life'),
  cr_years: L('Учёба до первой работы', 'Study before first job'), cr_years_u: L('лет', 'years'),
  cr_pros: L('Плюсы', 'Pros'), cr_cons: L('Минусы', 'Cons'), cr_path: L('Путь в профессию', 'How to get in'),
  cr_subj: L('Главные предметы', 'Key subjects'), cr_jobs: L('Профессии и зарплаты', 'Jobs and salaries'),
  cr_cmp: L('Сравнить', 'Compare'), cr_cmp_go: L('Сравнить выбранные', 'Compare selected'),
  cr_pick2: L('Отметь две профессии, чтобы сравнить их бок о бок.', 'Tick two careers to compare them side by side.'),
  cr_back: L('← Все профессии', '← All careers'), cr_more: L('Подробнее →', 'Details →'),
  cr_unis: L('Сильные вузы', 'Top universities'), cr_links: L('Дальше', 'Next steps'),

  // навигация внутренних страниц и хаб инструментов
  jobs_link: L('Вакансии и резюме в Узбекистане →', 'Vacancies and CVs in Uzbekistan →'),
  nav_tools: L('Инструменты', 'Tools'), nav_unis: L('Вузы мира', 'World universities'),
  tools_title: L('Инструменты', 'Tools'),
  tools_lead: L('Всё, что помогает выбрать путь и поступить: от каталога вузов до плана подготовки.', 'Everything that helps you choose a path and get in: from the university catalogue to your study plan.'),

  // каталог вузов
  cat_title: L('Все вузы мира', 'All universities in the world'),
  cat_lead: L('Сверху — топ-вузы с ценами и сильными направлениями: выбери страну, бюджет и направление. Ниже — все 10 000+ вузов из 200 стран.', 'Top universities with prices and strong fields on top: pick a country, budget and field. Below — all 10,000+ universities in 200 countries.'),
  cat_all_title: L('Все вузы мира', 'All universities in the world'),
  cat_budget_note: L('бюджет — по средней цене государственного вуза в стране', 'budget uses the average public university price in the country'),
  cat_field_note: L('направления известны только у вузов из топа выше', 'fields are known only for the top universities above'),
  cat_search: L('Название вуза', 'University name'), cat_all: L('Все страны', 'All countries'),
  cat_found: L('Найдено', 'Found'), cat_more: L('Показать ещё', 'Show more'),
  cat_site: L('Сайт', 'Website'), cat_google: L('Найти в Google', 'Search Google'),
  cat_empty: L('Ничего не нашлось. Попробуй написать название по-английски.', 'Nothing found. Try the English name.'),
  cat_source: L('Источник: открытый список Hipo university-domains-list (MIT) + вузы Узбекистана от Noventis.', 'Source: open Hipo university-domains-list (MIT) + Uzbek universities added by Noventis.'),
  cat_all_link: L('Все вузы мира →', 'All universities →'),

  // избранное
  fav_title: L('Избранные вузы', 'Saved universities'),
  fav_empty: L('Пока пусто. Нажми ♡ у вуза в списке ниже, в результате теста или в «Вузах мира».', 'Nothing yet. Tap ♡ next to a university below, in your test results or in “World universities”.'),
  fav_lead: L('Твои вузы — с ценой и переходом в калькуляторы. Ниже — подбор новых вузов по стране, бюджету и направлению.', 'Your universities — with prices and links to the calculators. Below — find new ones by country, budget and field.'),
  fav_find: L('Подобрать вузы', 'Find universities'), fav_count: L('Вузов в избранном', 'Saved universities'),
  fav_added: L('Добавлено в избранное', 'Saved'), fav_removed: L('Убрано из избранного', 'Removed'),
  fav_login: L('Войди, чтобы сохранять вузы', 'Log in to save universities'),
  fav_limit: L('В избранном уже 300 вузов — убери лишние', 'You already have 300 saved — remove some first'),
  fav_add: L('В избранное', 'Save'), fav_del: L('Убрать из избранного', 'Remove'),
};

let LANG = (() => { try { return localStorage.getItem('kj_lang') || 'ru'; } catch { return 'ru'; } })();
// Узбекский берём из самой строки (uz) или из словаря uz.js по русскому тексту; нет перевода — показываем русский
const tx = v => {
  if (!v || typeof v !== 'object') return v ?? '';
  if (LANG === 'uz') return v.uz || (typeof UZ !== 'undefined' && UZ[v.ru]) || v.ru;
  return v[LANG] ?? v.ru;
};
// Формат дат и чисел для текущего языка
const locale = () => ({ ru: 'ru-RU', en: 'en-GB', uz: 'uz-Latn-UZ' })[LANG] || 'ru-RU';
const t = key => tx(UI[key]) || key;

function applyI18n(root = document) {
  document.documentElement.lang = LANG;
  root.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('.lang-toggle button').forEach(b => b.classList.toggle('on', b.dataset.lang === LANG));
}

function setLang(l) {
  LANG = l;
  try { localStorage.setItem('kj_lang', l); } catch {}
  applyI18n();
  document.dispatchEvent(new CustomEvent('langchange'));
}

async function api(path, opts = {}) {
  const res = await fetch(path, {
    method: opts.method || 'GET',
    headers: opts.body ? { 'Content-Type': 'application/json' } : {},
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    credentials: 'same-origin',
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

let ME = null;
async function loadMe() {
  const r = await api('/api/me');
  ME = r.data.user || null;
  renderNavAuth();
  return ME;
}

function renderNavAuth() {
  const box = document.querySelector('.nav-auth');
  if (!box) return;
  if (ME) {
    box.innerHTML = `<a class="btn btn-ghost" href="/profile"><span class="avatar">${escapeHtml(ME.name[0] || '?').toUpperCase()}</span><span data-i18n="nav_profile">${t('nav_profile')}</span></a>`;
  } else {
    box.innerHTML = `<a class="btn btn-ghost" href="/auth" data-i18n="nav_login">${t('nav_login')}</a>`;
  }
}

async function logout() {
  await api('/api/logout', { method: 'POST' });
  location.href = '/';
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Окно с вопросом. buttons: [{ v, label, gold }] → промис со значением v нажатой кнопки (null — закрыли)
function ask(title, html, buttons) {
  return new Promise(resolve => {
    const back = document.createElement('div');
    back.className = 'modal-back';
    back.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><h3>${title}</h3>${html ? `<div class="modal-body"><p>${html}</p></div>` : ''}
      <div class="row">${buttons.map((b, i) => `<button type="button" class="btn ${b.gold ? 'btn-gold' : 'btn-ghost'}" data-i="${i}">${b.label}</button>`).join('')}</div></div>`;
    const close = v => { back.remove(); removeEventListener('keydown', onKey); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') close(null); };
    back.addEventListener('click', e => {
      if (e.target === back) return close(null);
      const b = e.target.closest('[data-i]');
      if (b) close(buttons[b.dataset.i].v);
    });
    addEventListener('keydown', onKey);
    document.body.appendChild(back);
    back.querySelector('.btn-gold, .btn').focus();
  });
}

function toast(msg) {
  let el = document.querySelector('.toast');
  if (!el) { el = document.createElement('div'); el.className = 'toast'; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2800);
}

// Название страны по коду ISO (UZ → Узбекистан) или подпись региона из REGIONS (us → США / Канада)
function placeName(code) {
  if (LANG === 'uz' && typeof UZ_REGIONS !== 'undefined' && UZ_REGIONS[code]) return UZ_REGIONS[code];
  if (/^[A-Z]{2}$/.test(code)) {
    try { return new Intl.DisplayNames([LANG], { type: 'region' }).of(code); } catch { return code; }
  }
  return typeof REGIONS !== 'undefined' && REGIONS[code] ? tx(REGIONS[code]) : code;
}

// Название вуза для показа: вузы, записанные по-русски, на узбекском берём из словаря
const nm = n => (LANG === 'uz' && typeof UZ !== 'undefined' && UZ[n]) || n;

// ---------- избранные вузы ----------
// Ключ вуза — название + место (код страны или региона). Список грузится один раз на страницу.
const favKey = (name, place) => place + '|' + name;
let FAVS = null;
async function loadFavs() {
  if (FAVS) return FAVS;
  const r = ME ? await api('/api/favorites') : { ok: false };
  FAVS = new Map((r.ok ? r.data.favorites : []).map(f => [favKey(f.name, f.place), f]));
  return FAVS;
}
const heart = (name, place, web = '') => {
  const on = FAVS && FAVS.has(favKey(name, place));
  return `<button class="heart ${on ? 'on' : ''}" type="button" data-name="${escapeHtml(name)}" data-place="${escapeHtml(place)}" data-web="${escapeHtml(web)}"
    aria-label="${t(on ? 'fav_del' : 'fav_add')}" title="${t(on ? 'fav_del' : 'fav_add')}">${on ? '♥' : '♡'}</button>`;
};
// все сердечки на странице обновляются одинаково
function paintHearts() {
  document.querySelectorAll('.heart').forEach(b => {
    const on = FAVS && FAVS.has(favKey(b.dataset.name, b.dataset.place));
    b.classList.toggle('on', !!on);
    b.textContent = on ? '♥' : '♡';
    b.title = t(on ? 'fav_del' : 'fav_add');
    b.setAttribute('aria-label', b.title);
  });
}
document.addEventListener('click', async e => {
  const b = e.target.closest('.heart');
  if (!b) return;
  e.preventDefault();
  if (!ME) { toast(t('fav_login')); setTimeout(() => location.href = '/auth?next=' + encodeURIComponent(location.pathname + location.search), 900); return; }
  await loadFavs();
  const { name, place, web } = b.dataset, key = favKey(name, place);
  const had = FAVS.has(key);
  const r = await api('/api/favorites', { method: had ? 'DELETE' : 'POST', body: { name, place, web } });
  if (!r.ok) return toast(t({ too_many: 'err_too_many', fav_limit: 'fav_limit' }[r.data.error] || 'err_server'));
  if (had) FAVS.delete(key); else FAVS.set(key, { name, place, web });
  paintHearts();
  toast(t(had ? 'fav_removed' : 'fav_added'));
  document.dispatchEvent(new CustomEvent('favchange'));
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-toggle button').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  applyI18n();
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', scrollY > 30);
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
});
