const pocoMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (pocoMovimento) document.documentElement.classList.add('fermo');

const limita = (valore, minimo = 0, massimo = 1) => Math.min(massimo, Math.max(minimo, valore));
const tra = (da, a, quanto) => da + (a - da) * quanto;
const frena = t => 1 - (1 - t) ** 3;
const morbido = t => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

// quanta strada è stata fatta dentro una sezione più alta dello schermo, da 0 a 1
function avanzamento(sezione) {
    const bordo = sezione.getBoundingClientRect();
    const corsa = bordo.height - innerHeight;
    return corsa > 0 ? limita(-bordo.top / corsa) : 0;
}

// IL PROFILO: lo stesso testo della pagina viene copiato nello schermo del portatile
const profilo = document.getElementById('profilo');
const schermoPortatile = document.getElementById('schermo-portatile');
const copiaProfilo = profilo.cloneNode(true);
copiaProfilo.removeAttribute('id');
schermoPortatile.append(copiaProfilo);

// il portatile è nascosto ai lettori di schermo solo dove il profilo è già scritto nella pagina
const schermoStretto = matchMedia('(max-width: 760px)');
const portatile = document.querySelector('.portatile');

function chiLeggeIlProfilo() {
    portatile.inert = schermoStretto.matches;
    if (schermoStretto.matches) {
        portatile.setAttribute('aria-hidden', 'true');
    } else {
        portatile.removeAttribute('aria-hidden');
    }
}

schermoStretto.addEventListener('change', chiLeggeIlProfilo);
chiLeggeIlProfilo();

// IL PORTATILE: si apre mentre si scorre, poi la vista gli gira davanti
const scenaPortatile = document.querySelector('.scena--portatile');

function muoviPortatile() {
    const p = avanzamento(scenaPortatile);
    const alto = portatile.offsetHeight;
    const apre = morbido(limita((p - 0.03) / 0.42));
    const avvicina = morbido(limita((p - 0.5) / 0.36));

    // chiuso e visto dall'alto -> aperto -> di fronte, a tutto schermo
    const apri = tra(tra(-89, 12, apre), 0, avvicina);
    const inclina = tra(tra(-62, -14, apre), 0, avvicina);
    const scala = tra(tra(0.5, 0.62, apre), 1, avvicina);
    const chiuso = 0.1 * innerHeight - 0.72 * alto;
    const aperto = 0.05 * innerHeight - 0.265 * alto;
    const sposta = tra(tra(chiuso, aperto, apre), 0, avvicina);

    // finché il portatile non è aperto, il pulsante dentro lo schermo non si può premere
    scenaPortatile.classList.toggle('chiuso', apre < 0.95);

    const stile = scenaPortatile.style;
    stile.setProperty('--apri', apri.toFixed(2));
    stile.setProperty('--inclina', inclina.toFixed(2));
    stile.setProperty('--scala', scala.toFixed(4));
    stile.setProperty('--sposta', sposta.toFixed(1));
    stile.setProperty('--luce', limita((apre - 0.3) / 0.4).toFixed(3));
    stile.setProperty('--intro', (1 - limita((p - 0.02) / 0.12)).toFixed(3));
}

// IL SITO DEI VINI: la finestra cresce entrando, poi il sito scorre dentro il telefono
const finestra = document.getElementById('finestra');
const scorriTelefono = document.getElementById('scorri-telefono');
const passi = scorriTelefono.querySelectorAll('.passo');

function muoviVini() {
    const entrata = limita((innerHeight - finestra.getBoundingClientRect().top) / (innerHeight * 0.9));
    finestra.style.setProperty('--s', tra(0.86, 1, frena(entrata)).toFixed(4));

    const p = avanzamento(scorriTelefono);
    scorriTelefono.style.setProperty('--scorri', p.toFixed(4));
    // i testi cambiano quando nel telefono passano l'apertura, la vetrina e l'elenco
    const quale = p < 0.14 ? 0 : p < 0.42 ? 1 : 2;
    passi.forEach((passo, indice) => passo.classList.toggle('attivo', indice === quale));
}

// Il link attivo della barra segue la sezione che sta a metà schermo
const zone = document.querySelectorAll('main section[data-zona]');
const linkBarra = document.querySelectorAll('.bar__nav a');

function aggiornaZona() {
    let corrente = zone[0];
    zone.forEach(zona => {
        if (zona.offsetParent !== null && zona.getBoundingClientRect().top <= innerHeight * 0.5) corrente = zona;
    });

    const ancora = corrente.id || 'inizio';
    linkBarra.forEach(link => {
        const attivo = link.getAttribute('href') === `#${ancora}`;
        link.classList.toggle('active', attivo);
        if (attivo) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
    });
    document.body.classList.toggle('sotto', scrollY > 8);
}

let inAttesa = false;

function aggiornaTutto() {
    inAttesa = false;
    aggiornaZona();
    if (pocoMovimento) return;
    muoviPortatile();
    muoviVini();
}

function chiediAggiornamento() {
    if (inAttesa) return;
    inAttesa = true;
    requestAnimationFrame(aggiornaTutto);
}

window.addEventListener('scroll', chiediAggiornamento, { passive: true });
window.addEventListener('resize', chiediAggiornamento);
window.addEventListener('load', chiediAggiornamento);
aggiornaTutto();

// ENTRATE: gli elementi compaiono sfalsati quando entrano nello schermo
const daRivelare = document.querySelectorAll('[data-rivela]');

if (!pocoMovimento && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('rivela');
    const osservatore = new IntersectionObserver(voci => {
        voci.forEach(voce => {
            if (!voce.isIntersecting) return;
            voce.target.classList.add('visto');
            osservatore.unobserve(voce.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    // un piccolo ritardo per ogni fratello marcato, così entrano uno dopo l'altro
    daRivelare.forEach(elemento => {
        const fratelli = [...elemento.parentElement.children].filter(f => f.hasAttribute('data-rivela'));
        elemento.style.setProperty('--ritardo', `${fratelli.indexOf(elemento) * 80}ms`);
        osservatore.observe(elemento);
    });
}

// CONTATTI: copia l'indirizzo
const tastoCopia = document.getElementById('copia-mail');
const statoCopia = document.getElementById('stato-copia');
const testoCopia = tastoCopia.textContent;
const indirizzo = 'zappullavlad@gmail.com';
let attesaCopia;

// se l'API degli appunti non è disponibile (pagina non sicura, permessi), si prova alla vecchia maniera
function copiaAllaVecchia(testo) {
    const campo = document.createElement('textarea');
    campo.value = testo;
    campo.setAttribute('readonly', '');
    campo.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.append(campo);
    campo.select();
    const riuscita = document.execCommand('copy');
    campo.remove();
    tastoCopia.focus();
    if (!riuscita) throw new Error('copia non riuscita');
}

tastoCopia.addEventListener('click', async () => {
    clearTimeout(attesaCopia);
    try {
        try {
            await navigator.clipboard.writeText(indirizzo);
        } catch {
            copiaAllaVecchia(indirizzo);
        }
        tastoCopia.textContent = 'Indirizzo copiato';
        tastoCopia.classList.add('fatto');
        statoCopia.textContent = 'Indirizzo email copiato negli appunti.';
    } catch {
        tastoCopia.textContent = 'Copia non riuscita';
        statoCopia.textContent = 'Copia non riuscita: seleziona l\'indirizzo a mano.';
    }
    attesaCopia = setTimeout(() => {
        tastoCopia.textContent = testoCopia;
        tastoCopia.classList.remove('fatto');
        statoCopia.textContent = '';
    }, 2500);
});
