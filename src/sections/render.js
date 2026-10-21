import { profile, stats, experience, projects, projectCategories, skills, education } from '../data/cv.js';

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const svg = (body, cls = '') =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const ICONS = {
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  whatsapp: svg('<path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.1-4.6A9 9 0 1 1 21 12z"/><path d="M9.5 9.5c0 3 2 5 5 5l1-1.5-2-1-1 1a4 4 0 0 1-1.5-1.5l1-1-1-2z"/>'),
  linkedin: svg('<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.1M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>'),
  github: svg('<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>'),
  pin: svg('<path d="M12 22s7-7.1 7-12a7 7 0 1 0-14 0c0 4.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>'),
  bolt: svg('<path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z"/>'),
  arrow: svg('<path d="M7 17 17 7M8 7h9v9"/>'),
  spark: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>'),
  cap: svg('<path d="m2 10 10-5 10 5-10 5-10-5z"/><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/>'),
};

const catLabel = (id) => projectCategories.find((c) => c.id === id)?.label ?? id;

function set(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function statHTML(s) {
  return `
    <div class="stat" data-reveal>
      <div class="stat__value"><span class="count" data-count="${s.value}">0</span><span class="stat__suffix">${esc(s.suffix)}</span></div>
      <div class="stat__label">${esc(s.label)}</div>
      <div class="stat__note">${esc(s.note)}</div>
    </div>`;
}

function avatarHTML() {
  return `
    <div class="avatar__orb" aria-hidden="true"><span>${esc(profile.initials)}</span></div>
    <h3 class="avatar__name">${esc(profile.name)}</h3>
    <p class="avatar__title">${esc(profile.title)}</p>
    <ul class="avatar__meta">
      <li>${ICONS.pin}<span>${esc(profile.location)}</span></li>
      <li><span class="avatar__dot"></span><span>${esc(profile.availability)}</span></li>
    </ul>
    <div class="avatar__social">
      <a href="mailto:${esc(profile.email)}" aria-label="Email">${ICONS.mail}</a>
      <a href="${esc(profile.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">${ICONS.linkedin}</a>
      <a href="${esc(profile.github)}" target="_blank" rel="noopener" aria-label="GitHub">${ICONS.github}</a>
      <a href="https://wa.me/${esc(profile.whatsapp)}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.whatsapp}</a>
    </div>
    <span class="avatar__glare" aria-hidden="true"></span>`;
}

function serviceHTML(s) {
  return `
    <div class="service" data-reveal>
      ${ICONS.spark}
      <div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>
    </div>`;
}

function eduHTML(e) {
  return `
    <div class="edu__row" data-reveal>
      ${ICONS.cap}
      <div>
        <strong>${esc(e.degree)}</strong>
        <span>${esc(e.school)}</span>
      </div>
      <div class="edu__right"><span>${esc(e.period)}</span><strong>${esc(e.result)}</strong></div>
    </div>`;
}

function expHTML(x, i) {
  return `
    <article class="tl__item" data-reveal style="--i:${i}">
      <span class="tl__marker" aria-hidden="true"></span>
      <div class="card tl__card">
        <header class="tl__head">
          <div>
            <h3 class="tl__role">${esc(x.role)}</h3>
            <p class="tl__company">${esc(x.company)}</p>
          </div>
          <span class="tl__period">${esc(x.period)}</span>
        </header>
        <div class="tl__metrics">${x.metrics.map((m) => `<span class="chip chip--accent">${esc(m)}</span>`).join('')}</div>
        <ul class="tl__bullets">${x.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      </div>
    </article>`;
}

function projectHTML(p, i) {
  const links = p.links.length
    ? `<div class="project__links">${p.links
        .map((l) => `<a class="link-arrow" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)} ${ICONS.arrow}</a>`)
        .join('')}</div>`
    : '';
  const cover = p.cover
    ? `<figure class="project__cover"><img src="${esc(p.cover)}" alt="${esc(p.coverAlt || p.title)}" width="1200" height="900" loading="lazy" decoding="async"></figure>`
    : '';
  return `
    <article class="card project${p.featured ? ' is-featured' : ''}${p.cover ? ' has-cover' : ''}" data-category="${esc(p.category)}" data-project="${i}" data-reveal tabindex="0">
      ${cover}
      <div class="project__body">
        <div class="project__top">
          <span class="tag">${esc(catLabel(p.category))}</span>
          ${p.client ? `<span class="project__client">${esc(p.client)}</span>` : ''}
        </div>
        <h3 class="project__title">${esc(p.title)}</h3>
        <p class="project__subtitle">${esc(p.subtitle)}</p>
        <p class="project__desc">${esc(p.description)}</p>
        <p class="project__metric">${ICONS.bolt}<span>${esc(p.metric)}</span></p>
        <ul class="project__tech" aria-label="Technologies">${p.tech.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        ${links}
      </div>
    </article>`;
}

function skillHTML(s, i) {
  return `
    <article class="card skill" data-ring="${i}" data-reveal tabindex="0">
      <header class="skill__head">
        <span class="skill__index">0${i + 1}</span>
        <div>
          <h3>${esc(s.name)}</h3>
          <p>${esc(s.blurb)}</p>
        </div>
      </header>
      <ul class="chips">${s.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </article>`;
}

function contactHTML() {
  const items = [
    { icon: ICONS.mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    { icon: ICONS.whatsapp, label: 'WhatsApp', value: profile.phone, href: `https://wa.me/${profile.whatsapp}`, ext: true },
    { icon: ICONS.linkedin, label: 'LinkedIn', value: `in/${profile.linkedinHandle}`, href: profile.linkedin, ext: true },
    { icon: ICONS.github, label: 'GitHub', value: `@${profile.githubHandle}`, href: profile.github, ext: true },
  ];
  return items
    .map(
      (c) => `
      <a class="contact-card" href="${esc(c.href)}"${c.ext ? ' target="_blank" rel="noopener"' : ''} data-reveal>
        <span class="contact-card__icon">${c.icon}</span>
        <span class="contact-card__label">${esc(c.label)}</span>
        <span class="contact-card__value">${esc(c.value)}</span>
        ${ICONS.arrow}
      </a>`
    )
    .join('');
}

export function renderContent() {
  const intro = document.getElementById('hero-intro');
  if (intro) intro.textContent = profile.intro;

  set('stats', stats.map(statHTML).join(''));
  set('avatar', avatarHTML());
  set('about-text', profile.about.map((p) => `<p>${esc(p)}</p>`).join(''));
  set('what-i-do', profile.whatIDo.map(serviceHTML).join(''));
  set('education', education.map(eduHTML).join(''));
  set('timeline', experience.map(expHTML).join(''));
  set(
    'project-filters',
    projectCategories
      .map(
        (c, i) =>
          `<button class="filter${i === 0 ? ' is-active' : ''}" type="button" data-filter="${esc(c.id)}" aria-pressed="${i === 0}">${esc(c.label)}</button>`
      )
      .join('')
  );
  set('project-grid', projects.map(projectHTML).join(''));
  set('skills-grid', skills.map(skillHTML).join(''));
  set('contact-links', contactHTML());

  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
  document.querySelectorAll('[data-cv]').forEach((el) => el.setAttribute('href', profile.cv));
}
