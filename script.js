// =====================================================
// CONTENUTI: modifica qui progetti, competenze ed email
// =====================================================
const EMAIL = 'zappullavlad@gmail.com';

// Per ogni progetto aggiungi `demo` e/o `code` (URL) quando saranno online
const PROJECTS = [
    {
        title: 'Todo App',
        description: 'Applicazione per gestire liste di attività in tempo reale',
        demo: null,
        code: null
    },
    {
        title: 'Weather App',
        description: 'Meteo in tempo reale con API pubblica',
        demo: null,
        code: null
    },
    {
        title: 'Calculator',
        description: 'Calcolatore avanzato con dark mode',
        demo: null,
        code: null
    }
];

const SKILLS = ['JavaScript', 'React', 'HTML/CSS', 'Unity'];

const ROLES = ['Web Developer', 'Studente Informatica UNICT', 'Appassionato di videogiochi'];

// =====================================================

document.documentElement.classList.add('js');

const $ = (sel) => document.querySelector(sel);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Toast ----------
let toastTimer;
function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

// ---------- Tema chiaro/scuro ----------
function currentTheme() {
    const set = document.documentElement.dataset.theme;
    if (set) return set;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

$('#theme-toggle').addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
});

// ---------- Menu mobile ----------
const menuToggle = $('#menu-toggle');
const navMenu = $('#nav-menu');

function setMenu(open) {
    navMenu.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
}

menuToggle.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));
navMenu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        setMenu(false);
        menuToggle.focus();
    }
});

// ---------- Progetti ----------
const grid = $('#projects-grid');
const empty = $('#projects-empty');
const search = $('#project-search');

function renderProjects(filter = '') {
    const q = filter.trim().toLowerCase();
    grid.innerHTML = '';
    let shown = 0;

    PROJECTS.forEach((p, i) => {
        if (q && !(p.title + ' ' + p.description).toLowerCase().includes(q)) return;
        shown++;
        const card = document.createElement('article');
        card.className = 'project-card';
        card.innerHTML = `
            <span class="project-num">${String(i + 1).padStart(2, '0')}</span>
            <h3></h3>
            <p></p>
            <div><button type="button" class="btn">Vedi dettagli</button></div>`;
        card.querySelector('h3').textContent = p.title;
        card.querySelector('p').textContent = p.description;
        card.querySelector('button').addEventListener('click', (e) => openProject(p, e.currentTarget));
        grid.appendChild(card);
    });

    empty.hidden = shown > 0;
}

search.addEventListener('input', () => renderProjects(search.value));
$('#clear-search').addEventListener('click', () => {
    search.value = '';
    renderProjects();
    search.focus();
});

// ---------- Dettaglio progetto ----------
const dialog = $('#project-dialog');
let lastTrigger = null;

function openProject(p, trigger) {
    lastTrigger = trigger;
    $('#dialog-title').textContent = p.title;
    $('#dialog-desc').textContent = p.description;

    const links = $('#dialog-links');
    links.innerHTML = '';
    [['demo', 'Apri demo'], ['code', 'Vedi codice']].forEach(([key, label]) => {
        if (!p[key]) return;
        const a = document.createElement('a');
        a.href = p[key];
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = key === 'demo' ? 'cta-btn' : 'ghost-btn';
        a.textContent = label;
        links.appendChild(a);
    });
    if (!links.children.length) {
        const note = document.createElement('p');
        note.className = 'dialog-note';
        note.textContent = 'Demo e codice saranno disponibili a breve.';
        links.appendChild(note);
    }

    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
}

dialog.addEventListener('close', () => { if (lastTrigger) lastTrigger.focus(); });
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

// ---------- Competenze ----------
const skillsList = $('#skills-list');
SKILLS.forEach((s) => {
    const li = document.createElement('li');
    li.className = 'skill';
    li.textContent = s;
    skillsList.appendChild(li);
});

// ---------- Contatti ----------
const emailLink = $('#email-link');
emailLink.href = `mailto:${EMAIL}`;
emailLink.textContent = EMAIL;

$('#copy-email').addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(EMAIL);
        toast('Indirizzo copiato');
    } catch (e) {
        toast(`Copia non riuscita, l'indirizzo è ${EMAIL}`);
    }
});

const form = $('#contact-form');
const fields = [
    [$('#cf-name'), $('#cf-name-err')],
    [$('#cf-message'), $('#cf-message-err')]
];

function validate(input, err) {
    const ok = input.value.trim() !== '';
    err.hidden = ok;
    input.setAttribute('aria-invalid', String(!ok));
    if (!ok) input.setAttribute('aria-describedby', err.id);
    else input.removeAttribute('aria-describedby');
    return ok;
}

fields.forEach(([input, err]) => {
    input.addEventListener('blur', () => { if (input.value) validate(input, err); });
    input.addEventListener('input', () => { if (!err.hidden) validate(input, err); });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const results = fields.map(([i, err]) => validate(i, err));
    const firstBad = results.indexOf(false);
    if (firstBad !== -1) {
        fields[firstBad][0].focus();
        return;
    }
    const name = $('#cf-name').value.trim();
    const subject = encodeURIComponent(`Contatto dal portfolio: ${name}`);
    const body = encodeURIComponent($('#cf-message').value.trim() + `\n\n${name}`);
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
    toast('Si sta aprendo il tuo programma di posta');
});

// ---------- Testo animato nell'hero ----------
(function typeRoles() {
    const el = $('#typed');
    if (reduceMotion) return;
    let r = 0, c = ROLES[0].length, deleting = true;
    function tick() {
        const word = ROLES[r];
        c += deleting ? -1 : 1;
        el.textContent = word.slice(0, c);
        let delay = deleting ? 40 : 80;
        if (!deleting && c === word.length) { deleting = true; delay = 1800; }
        else if (deleting && c === 0) { deleting = false; r = (r + 1) % ROLES.length; delay = 300; }
        setTimeout(tick, delay);
    }
    setTimeout(tick, 1800);
})();

// ---------- Link attivo nella navbar ----------
const navLinks = document.querySelectorAll('.nav-links a');
const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach((s) => spy.observe(s));

// ---------- Comparsa allo scroll ----------
const revealer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealer.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

// ---------- Avvio ----------
$('#year').textContent = new Date().getFullYear();
renderProjects();
