/* TAHER MOHAMED — front-end. All content comes from /api/content (edited in /admin). */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const isAr = s => /[؀-ۿ]/.test(s || '');
  const get = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);

  const CATEGORIES = [
    ['all', 'All'], ['residential', 'Residential'], ['interior', 'Interior'],
    ['commercial', 'Commercial'], ['execution', 'Execution']
  ];

  const ICONS = {
    plan: '<svg viewBox="0 0 56 56"><rect x="6" y="10" width="44" height="36"/><path d="M6 24h18v22M24 10v8M34 46V30h16M34 30v-6h-4"/><path d="M40 10v10"/></svg>',
    interior: '<svg viewBox="0 0 56 56"><path d="M8 46h40M12 46V32a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v14"/><path d="M16 28v-4a4 4 0 0 1 4-4h16a4 4 0 0 1 4 4v4M12 38h32"/><path d="M28 6v8M24 14h8l-4 0"/></svg>',
    finish: '<svg viewBox="0 0 56 56"><path d="M10 14h28v10H10z"/><path d="M38 19h6v12H26v6"/><rect x="23" y="37" width="6" height="13"/><path d="M14 14V8h20v6"/></svg>',
    build: '<svg viewBox="0 0 56 56"><path d="M8 48h40M14 48V22l14-12 14 12v26"/><path d="M22 48V34h12v14M14 22h28"/><path d="M28 10V4"/></svg>',
    site: '<svg viewBox="0 0 56 56"><path d="M10 48h36M14 48V18h10v30M24 26h16v22"/><path d="M14 18L30 8h18v6H30M48 14v6"/><path d="M45 20v4"/></svg>',
    key: '<svg viewBox="0 0 56 56"><circle cx="18" cy="28" r="9"/><circle cx="18" cy="28" r="3"/><path d="M27 28h22M42 28v7M48 28v5"/></svg>'
  };

  let C = null;          // content
  let activeFilter = 'all';

  // ---------- boot ----------
  // Live server → /api/content. Published (static) copy → /content.json
  let STATIC = false;
  const getJSON = u => fetch(u, { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  getJSON('/api/content')
    .catch(() => { STATIC = true; return getJSON('/content.json'); })
    .then(data => { C = data; render(); })
    .catch(err => { console.error('Content failed to load', err); })
    .finally(() => setTimeout(() => document.body.classList.add('loaded'), 250));

  function render() {
    // simple text bindings
    $$('[data-bind]').forEach(el => {
      const v = get(C, el.dataset.bind);
      if (v != null && v !== '') el.textContent = v;
    });
    document.title = `${titleCase(C.site.name)} — ${C.site.title}`;
    renderHero();
    renderAbout();
    renderServices();
    renderFilters();
    renderProjects();
    renderPhilosophy();
    renderBeforeAfter();
    renderProcess();
    renderWhy();
    renderNumbers();
    renderTestimonials();
    renderContact();
    observe();
  }
  const titleCase = s => String(s).toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  // ---------- hero ----------
  function renderHero() {
    const m = $('#heroMedia');
    const s = C.site;
    if (s.heroVideo) {
      m.innerHTML = `<video autoplay muted loop playsinline poster="${esc(s.heroImage)}"><source src="${esc(s.heroVideo)}"></video>`;
    } else {
      m.innerHTML = `<img src="${esc(s.heroImage)}" alt="" fetchpriority="high">`;
    }
  }

  // ---------- about ----------
  function statHTML(s, cls) {
    const hasNum = s.value !== '' && s.value != null && !isNaN(Number(s.value));
    if (!hasNum) return `<div class="${cls}"><div class="stat-num word">${esc(s.label)}</div><div class="stat-label">${esc(s.value || 'Core expertise')}</div></div>`;
    return `<div class="${cls}"><div class="stat-num"><span class="count" data-to="${esc(s.value)}" data-prefix="${esc(s.prefix)}" data-suffix="${esc(s.suffix)}">${esc(s.prefix)}0${esc(s.suffix)}</span></div><div class="stat-label">${esc(s.label)}</div></div>`;
  }
  function renderAbout() {
    const a = C.about;
    $('#aboutImg').src = a.image;
    // Each paragraph gets its own direction, so Arabic and English both read naturally
    const paras = $('#aboutParas');
    paras.removeAttribute('dir'); paras.classList.remove('ar'); paras.style.textAlign = 'initial';
    paras.innerHTML = (a.paragraphs || []).map(p => isAr(p)
      ? `<p class="reveal ar" dir="rtl" style="text-align:right">${esc(p)}</p>`
      : `<p class="reveal" dir="ltr" style="text-align:left">${esc(p)}</p>`).join('');
    $('#aboutStats').innerHTML = (a.stats || []).map(s => statHTML(s, 'stat reveal')).join('');
    const yrs = (a.stats || []).find(s => /year/i.test(s.label));
    if (yrs) $('#aboutBadgeNum').textContent = `${yrs.prefix || ''}${yrs.value}${yrs.suffix || ''}`;
  }

  // ---------- services ----------
  function renderServices() {
    $('#serviceGrid').innerHTML = (C.services || []).map((s, i) => `
      <article class="service reveal" style="transition-delay:${(i % 3) * 90}ms">
        <div class="service-top">
          <span class="service-num">${String(i + 1).padStart(2, '0')}</span>
          <span class="service-icon-wrap">${(ICONS[s.icon] || ICONS.plan).replace('<svg', '<svg class="service-icon" aria-hidden="true"')}</span>
        </div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
        <a class="service-arrow" href="#contact">Discuss your project →</a>
      </article>`).join('');
  }

  // ---------- projects ----------
  function sortedProjects() {
    return [...(C.projects || [])].sort((a, b) => (b.featured === true) - (a.featured === true));
  }
  function renderFilters() {
    const ps = C.projects || [];
    $('#filters').innerHTML = CATEGORIES.map(([k, label]) => {
      const n = k === 'all' ? ps.length : ps.filter(p => p.category === k).length;
      return `<button class="filter${k === activeFilter ? ' active' : ''}" data-filter="${k}" role="tab" aria-selected="${k === activeFilter}">${label}<sup>${n}</sup></button>`;
    }).join('');
    $$('#filters .filter').forEach(b => b.addEventListener('click', () => {
      activeFilter = b.dataset.filter;
      $$('#filters .filter').forEach(x => { x.classList.toggle('active', x === b); x.setAttribute('aria-selected', x === b); });
      renderProjects(true);
    }));
  }
  function layout(n) {
    // rows of 1 (wide), 2 (half), 3 (third), 2 … for a cinematic rhythm
    if (n === 2) return ['', ''];
    const rows = [1, 2, 3, 2], out = []; let i = 0, r = 0;
    while (i < n) {
      const size = Math.min(rows[r++ % rows.length], n - i);
      const cls = size === 1 ? 'wide' : size === 2 ? '' : 'third';
      for (let k = 0; k < size; k++) out.push(cls);
      i += size;
    }
    return out;
  }
  function renderProjects(animate) {
    const list = sortedProjects().filter(p => activeFilter === 'all' || p.category === activeFilter);
    const sizes = layout(list.length);
    const grid = $('#projectGrid');
    if (!list.length) { grid.innerHTML = '<p class="empty">New projects in this category are coming soon.</p>'; return; }
    grid.innerHTML = list.map((p, i) => `
      <article class="project ${sizes[i]} reveal${animate ? '' : ''}" data-id="${esc(p.id)}" tabindex="0" aria-label="${esc(p.title)} — view project">
        <div class="project-media">
          ${p.featured ? '<span class="featured-tag">Featured</span>' : ''}
          <img src="${esc(p.cover || (p.gallery || [])[0] || '')}" alt="${esc(p.title)}" loading="lazy">
          <div class="project-overlay">
            <div>
              <p class="project-cat">${[catLabel(p.category), p.year].filter(Boolean).map(esc).join(' · ')}</p>
              <h3 class="project-title">${esc(p.title)}</h3>
              <p class="project-meta">${[p.location, p.type].filter(Boolean).map(esc).join(' — ')}</p>
            </div>
            <span class="project-view" aria-hidden="true">→</span>
          </div>
        </div>
      </article>`).join('');
    $$('.project', grid).forEach(el => {
      const open = () => openModal(el.dataset.id);
      el.addEventListener('click', open);
      el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    observe(grid);
  }
  const catLabel = k => (CATEGORIES.find(c => c[0] === k) || [k, k])[1];

  // ---------- modal ----------
  let gal = [], gi = 0, lastFocus = null;
  function openModal(id) {
    const p = (C.projects || []).find(x => x.id === id); if (!p) return;
    gal = (p.gallery && p.gallery.length ? p.gallery : [p.cover]).filter(Boolean); gi = 0;
    $('#mCat').textContent = catLabel(p.category);
    $('#mTitle').textContent = p.title;
    $('#mLoc').textContent = p.location;
    $('#mType').textContent = p.type;
    ['mLoc', 'mType', 'mYear'].forEach(k => { $('#' + k).parentElement.hidden = !p[{ mLoc: 'location', mType: 'type', mYear: 'year' }[k]]; });
    $('#mYear').textContent = p.year;
    $('#mDesc').textContent = p.description;
    $('#mDesc').dir = isAr(p.description) ? 'rtl' : 'ltr';
    $('#mThumbs').innerHTML = gal.length > 1 ? gal.map((g, i) => `<button data-i="${i}" aria-label="Image ${i + 1}"><img src="${esc(g)}" alt="" loading="lazy"></button>`).join('') : '';
    $$('#mThumbs button').forEach(b => b.addEventListener('click', () => showImg(+b.dataset.i)));
    $('#mPrev').hidden = $('#mNext').hidden = gal.length < 2;
    showImg(0);
    lastFocus = document.activeElement;
    $('#modal').classList.add('open'); $('#modal').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.modal-close').focus();
  }
  function showImg(i) {
    gi = (i + gal.length) % gal.length;
    const img = $('#mImg'); img.style.opacity = 0;
    setTimeout(() => { img.src = gal[gi]; img.onload = () => (img.style.opacity = 1); }, 150);
    $('#mCount').textContent = `${String(gi + 1).padStart(2, '0')} / ${String(gal.length).padStart(2, '0')}`;
    $$('#mThumbs button').forEach((b, k) => b.classList.toggle('active', k === gi));
  }
  function closeModal() {
    $('#modal').classList.remove('open'); $('#modal').setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  $('#mPrev').addEventListener('click', () => showImg(gi - 1));
  $('#mNext').addEventListener('click', () => showImg(gi + 1));
  $$('#modal [data-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (!$('#modal').classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowRight') showImg(gi + 1);
    if (e.key === 'ArrowLeft') showImg(gi - 1);
  });

  // ---------- philosophy ----------
  function renderPhilosophy() {
    const ph = C.philosophy;
    $('#philoBg').style.backgroundImage = `url("${ph.image}")`;
    const steps = ph.steps || [];
    const flow = $('#flow');
    flow.style.setProperty('--n', steps.length);
    flow.innerHTML = steps.map((s, i) => `<div class="flow-step" style="--d:${(i * 2.6) / steps.length}s"><span>${String(i + 1).padStart(2, '0')}</span><b>${esc(s)}</b></div>`).join('');
    flow.classList.add('reveal-flow');
    $('#ordinaryList').innerHTML = (ph.ordinary || []).map(x => `<li>${esc(x)}</li>`).join('');
    $('#oursList').innerHTML = (ph.ours || []).map(x => `<li>${esc(x)}</li>`).join('');
  }

  // ---------- before / after ----------
  function renderBeforeAfter() {
    const items = C.beforeAfter || [];
    const sec = $('#before-after');
    if (!items.length) { sec.hidden = true; return; }
    $('#baTabs').innerHTML = items.length > 1 ? items.map((b, i) => `<button class="filter${i ? '' : ' active'}" data-i="${i}">${esc(b.title)}</button>`).join('') : '';
    $$('#baTabs .filter').forEach(b => b.addEventListener('click', () => {
      $$('#baTabs .filter').forEach(x => x.classList.toggle('active', x === b));
      setBA(+b.dataset.i);
    }));
    setBA(0);
  }
  function setBA(i) {
    const b = C.beforeAfter[i];
    $('#baBefore').src = b.before; $('#baAfter').src = b.after;
    $('#baCaption').innerHTML = `<b>${esc(b.title)}</b><span>${esc(b.caption)}</span>`;
    $('#baRange').value = 50; $('#ba').style.setProperty('--pos', '50%');
  }
  $('#baRange').addEventListener('input', e => $('#ba').style.setProperty('--pos', e.target.value + '%'));

  // ---------- process / why ----------
  function renderProcess() {
    $('#processList').innerHTML = (C.process || []).map((p, i) => `
      <li class="process-step reveal" style="transition-delay:${(i % 3) * 100}ms">
        <span class="process-num">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(p.title)}</h3><span class="ar" dir="rtl">${esc(p.titleAr)}</span>
        <p>${esc(p.description)}</p>
      </li>`).join('');
  }
  function renderWhy() {
    $('#whyList').innerHTML = (C.why || []).map((w, i) => `
      <div class="why-item reveal"><i>${String(i + 1).padStart(2, '0')}</i><h3>${esc(w.title)}</h3><p>${esc(w.description)}</p></div>`).join('');
  }

  // ---------- numbers ----------
  function renderNumbers() {
    $('#numbersGrid').innerHTML = (C.numbers || []).map(n => `
      <div class="number reveal"><b><small>${esc(n.prefix)}</small><span class="count" data-to="${esc(n.value)}">0</span><small>${esc(n.suffix)}</small></b><span>${esc(n.label)}</span></div>`).join('');
  }
  function countUp(el) {
    const to = Number(el.dataset.to); if (isNaN(to)) return;
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    const dur = 1800, t0 = performance.now();
    const fmt = v => Math.round(v).toLocaleString('en-US');
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + fmt(to * e) + suf;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  // ---------- testimonials ----------
  let qi = 0, qTimer = null;
  function renderTestimonials() {
    const t = C.testimonials || [];
    if (!t.length) { $('#testimonials').hidden = true; return; }
    $('#quotes').innerHTML = t.map((q, i) => `
      <figure class="quote${i ? '' : ' active'}">
        <span class="quote-mark" aria-hidden="true">“</span>
        <blockquote class="${isAr(q.quote) ? 'ar' : ''}" dir="${isAr(q.quote) ? 'rtl' : 'ltr'}">${esc(q.quote)}</blockquote>
        <div class="quote-stars" aria-label="${q.rating || 5} out of 5">${'★'.repeat(Math.max(0, Math.min(5, q.rating || 5)))}</div>
        <cite>${esc(q.name)}<span>${esc(q.role)}</span></cite>
      </figure>`).join('');
    $('#quoteNav').innerHTML = t.length > 1 ? t.map((_, i) => `<button class="${i ? '' : 'active'}" aria-label="Testimonial ${i + 1}"></button>`).join('') : '';
    $$('#quoteNav button').forEach((b, i) => b.addEventListener('click', () => { showQuote(i); restartQ(); }));
    restartQ();
  }
  function showQuote(i) {
    const qs = $$('#quotes .quote'); qi = (i + qs.length) % qs.length;
    qs.forEach((q, k) => q.classList.toggle('active', k === qi));
    $$('#quoteNav button').forEach((b, k) => b.classList.toggle('active', k === qi));
  }
  function restartQ() { clearInterval(qTimer); if ((C.testimonials || []).length > 1) qTimer = setInterval(() => showQuote(qi + 1), 7000); }

  // ---------- contact ----------
  function renderContact() {
    const c = C.contact;
    const rows = [
      ['Phone', c.phone && `<a href="tel:${esc(c.phone.replace(/\s/g, ''))}">${esc(c.phone)}</a>`],
      ['Email', c.email && `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>`],
      ['Areas', c.address && `<span class="ar" dir="rtl">${esc(c.address)}</span>`],
      ['Hours', c.hours && esc(c.hours)]
    ].filter(r => r[1]);
    $('#contactList').innerHTML = rows.map(([k, v]) => `<li><span>${k}</span><span>${v}</span></li>`).join('');
    const wa = $('#waBtn');
    if (c.whatsapp) {
      wa.href = `https://wa.me/${encodeURIComponent(c.whatsapp.replace(/\D/g, ''))}?text=${encodeURIComponent('مرحبًا م. طاهر، أرغب في بدء مشروع.')}`;
    } else wa.hidden = true;
    $('#footerContact').innerHTML = rows.slice(0, 2).map(r => `<p>${r[1]}</p>`).join('');
    const socials = [['Instagram', c.instagram], ['LinkedIn', c.linkedin], ['Behance', c.behance], ['Facebook', c.facebook]].filter(s => s[1]);
    $('#footerSocial').innerHTML = socials.map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${n}</a>`).join('');
  }

  $('#contactForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, st = $('#formStatus');
    const data = Object.fromEntries(new FormData(f));
    $$('.field', f).forEach(x => x.classList.remove('invalid'));
    if (!data.name.trim()) { f.name.closest('.field').classList.add('invalid'); st.className = 'form-status err'; st.textContent = 'Please add your name.'; return; }
    if (!data.phone.trim() && !data.email.trim()) { f.phone.closest('.field').classList.add('invalid'); st.className = 'form-status err'; st.textContent = 'Please add a phone number or email.'; return; }
    if (STATIC && C.contact.whatsapp) {
      // Published site has no server: hand the enquiry to WhatsApp, ready to send
      const lines = [
        'New project enquiry', '',
        `Name: ${data.name}`, data.phone && `Phone: ${data.phone}`, data.email && `Email: ${data.email}`,
        data.location && `Location: ${data.location}`, data.projectType && `Project: ${data.projectType}`,
        data.budget && `Budget: ${data.budget}`, data.message && `\n${data.message}`
      ].filter(Boolean).join('\n');
      window.open(`https://wa.me/${C.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(lines)}`, '_blank', 'noopener');
      st.className = 'form-status ok'; st.textContent = 'Opening WhatsApp — just press send.';
      return;
    }
    const btn = f.querySelector('button[type=submit]'); btn.disabled = true;
    st.className = 'form-status'; st.textContent = 'Sending…';
    try {
      const r = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Something went wrong.');
      f.reset();
      st.className = 'form-status ok'; st.innerHTML = '<span class="ar">شكرًا! هتواصل معاك قريب جدًا.</span> — Thank you, I’ll be in touch shortly.';
    } catch (err) {
      st.className = 'form-status err'; st.textContent = err.message + ' You can also reach me on WhatsApp.';
    } finally { btn.disabled = false; }
  });

  // ---------- reveal + counters ----------
  let io;
  function observe(root = document) {
    if (!io) io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        $$('.count', en.target).forEach(c => { if (!c.dataset.done) { c.dataset.done = 1; countUp(c); } });
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    $$('.reveal:not(.in), .reveal-flow:not(.in)', root).forEach(el => io.observe(el));
  }

  // ---------- nav ----------
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#navToggle').addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    $('#navToggle').setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    document.body.classList.remove('nav-open'); document.body.style.overflow = '';
  }));
  // active link
  const secs = ['about', 'services', 'projects', 'process', 'testimonials', 'contact'].map(id => document.getElementById(id));
  const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('#navLinks a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => s && navIO.observe(s));

  // subtle hero parallax
  const heroMedia = $('#heroMedia');
  addEventListener('scroll', () => {
    if (scrollY < innerHeight) heroMedia.style.transform = `translateY(${scrollY * 0.25}px)`;
  }, { passive: true });

  $('#year').textContent = new Date().getFullYear();
})();
