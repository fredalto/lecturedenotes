// --- ÉTAT global (modes Clé / Instruments / Défi)
let cleChoisie = '';
let niveauChoisi = 0;
let defiChoisi = '';

// --- Outils d'affichage (transitions)
function showFadeSection(id) {
  const el = document.getElementById(id);
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('show'), 10);
}

function hideAllFadeSections() {
  document.querySelectorAll('.fade').forEach(el => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 300);
  });
}

// --- Choix du mode
function choisirMode(button, mode) {
  document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
  hideAllFadeSections();
  if (mode === 'cle') {
    setTimeout(() => showFadeSection('etape-cle'), 300);
  } else if (mode === 'instrument') {
    setTimeout(() => showFadeSection('etape-instrument'), 300);
  } else if (mode === 'defi') {
    setTimeout(() => showFadeSection('etape-defi'), 300);
  }
}

// --- Mode "Clé"
function setCle(button, cle) {
  document.querySelectorAll('#cle-buttons button').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
  cleChoisie = cle;
  hideAllFadeSections();
  setTimeout(() => showFadeSection('etape-cle'), 300);
  setTimeout(() => showFadeSection('etape-niveau'), 600);
}

function selectNiveau(n) {
  document.querySelectorAll('.niveau-card').forEach(card => card.classList.remove('selected'));
  document.querySelectorAll('.niveau-card')[n - 1].classList.add('selected');
  niveauChoisi = n;
  document.getElementById('go-button').classList.remove('hidden');
}

function lancerExercice(type) {
  const url = `${cleChoisie}_niveau${niveauChoisi}.html`;
  window.location.href = url;

  // Chargement lazy du JS associé (facultatif / debug)
  const cheminJS = `${cleChoisie}_niveau${niveauChoisi}.js`;
  const script = document.createElement('script');
  script.src = cheminJS;
  script.onload = () => { console.log(`Script ${cheminJS} chargé.`); };
  script.onerror = () => { console.warn("Erreur de chargement du fichier : " + cheminJS); };
  document.body.appendChild(script);

  // Debug utilisateur
  // alert(`Lancement d'un exercice (${type}) : clé ${cleChoisie}, niveau ${niveauChoisi}`);
}

// --- Mode "Défi"
function selectDefi(el, cle) {
  document.querySelectorAll('.defi-card').forEach(c => {
    c.classList.remove('selected');
    if (c.id === 'defi-ultime') {
      c.style.backgroundColor = 'gold';
      c.style.color = 'black';
      c.style.fontWeight = 'bold';
    }
  });
  el.classList.add('selected');
  defiChoisi = cle;
  if (el.id === 'defi-ultime') {
    el.style.backgroundColor = 'gold';
    el.style.color = 'black';
    el.style.fontWeight = 'bold';
  }
  document.getElementById('go-button-defi').classList.remove('hidden');
}

function lancerDefiChoisi() {
  const url = `defi_${defiChoisi}.html`;
  window.location.href = url;

  const cheminJS = `defi_${defiChoisi}.js`;
  const script = document.createElement('script');
  script.src = cheminJS;
  script.onload = () => { console.log(`Script ${cheminJS} chargé.`); };
  script.onerror = () => { console.warn("Erreur de chargement du fichier : " + cheminJS); };
  document.body.appendChild(script);

  // alert(`Défi sélectionné : ${defiChoisi}`);
}

// --- Effets hover / clic / cascade (cartes "clé" et "défi")
function addCardHoverEffects(container) {
  const cards = container.querySelectorAll('.niveau-card, .defi-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 8px 18px rgba(0,0,0,.12)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '';
    });
    card.addEventListener('mousedown', () => { card.style.transform = 'translateY(0)'; });
    card.addEventListener('mouseup', () => { card.style.transform = 'translateY(-2px)'; });
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { card.click(); e.preventDefault(); }
    });
  });
}

function cascadeIn(container) {
  const cards = container.querySelectorAll('.niveau-card, .defi-card');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(6px)';
    card.style.transition = 'opacity .22s ease, transform .22s ease';
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = '';
    }, 60 + i * 40);
  });
}

// Hook pour rajouter les effets à chaque ouverture de section
const _showFadeSection = showFadeSection;
showFadeSection = function(id){
  _showFadeSection(id);
  const el = document.getElementById(id);
  setTimeout(() => {
    addCardHoverEffects(el);
    cascadeIn(el);
  }, 20);
};

document.addEventListener('DOMContentLoaded', () => {
  const initialSections = document.querySelectorAll('.step-container:not(.hidden)');
  initialSections.forEach(sec => { addCardHoverEffects(sec); cascadeIn(sec); });
});


// =====================
//  MODE "INSTRUMENTS"
// =====================
let familleChoisie = '';
let instrumentChoisi = '';

// Mapping des familles -> instruments (seuls violon/alto actifs)
const CATALOGUE_INSTRUMENTS = {
  cordes: [
    { id:'violon', label:'Violon', actif:true },
    { id:'alto',   label:'Alto',   actif:true }
  ],
  bois: [
    { id:'flute',     label:'Flûte',     actif:false },
    { id:'clarinette',label:'Clarinette',actif:false },
    { id:'hautbois',  label:'Hautbois',  actif:false }
  ],
  vents: [
    { id:'trompette', label:'Trompette', actif:false },
    { id:'trombone',  label:'Trombone',  actif:false },
    { id:'cor',       label:'Cor',       actif:false }
  ]
};

function selectFamille(famille){
  familleChoisie = famille;
  instrumentChoisi = '';

  // Visuel sélection familles
  document.querySelectorAll('#etape-instrument .families-row .tile').forEach(t => {
    t.classList.toggle('selected', t.dataset.famille === famille);
  });

  // Rendre la liste d'instruments correspondante
  renderInstruments();
  document.getElementById('bloc-instruments').classList.remove('hidden-soft');

  // Masquer niveaux si on change de famille
  document.getElementById('bloc-niveaux').classList.add('hidden-soft');
  document.getElementById('levels-container').innerHTML = '';
}

function renderInstruments(){
  const cont = document.getElementById('instruments-container');
  cont.innerHTML = '';
  const list = CATALOGUE_INSTRUMENTS[familleChoisie] || [];
  list.forEach(ins => {
    const card = document.createElement('div');
    card.className = 'tile' + (ins.actif ? '' : ' disabled');
    card.textContent = ins.label;
    card.title = ins.actif ? ins.label : 'Bientôt disponible';
    if (ins.actif) {
      card.onclick = () => selectInstrument(ins.id);
      card.tabIndex = 0;
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectInstrument(ins.id); }
      });
    }
    cont.appendChild(card);
  });
}

function selectInstrument(id){
  instrumentChoisi = id;

  // Visuel sélection instrument
  document.querySelectorAll('#instruments-container .tile').forEach(t => t.classList.remove('selected'));
  const tiles = Array.from(document.querySelectorAll('#instruments-container .tile'));
  const found = tiles.find(t => t.textContent.trim().toLowerCase() ===
    (id === 'violon' ? 'violon' : id === 'alto' ? 'alto' : id));
  if (found) found.classList.add('selected');

  renderLevels(id);
  document.getElementById('bloc-niveaux').classList.remove('hidden-soft');
}

function renderLevels(id){
  const cont = document.getElementById('levels-container');
  cont.innerHTML = '';

  // Seuls violon/alto sont actifs pour le moment
  let base = null;
  if (id === 'violon') base = 'violon';
  else if (id === 'alto') base = 'alto';

  const mkBtn = (n, enabled, href, title) => {
    const a = document.createElement(enabled ? 'a' : 'div');
    a.className = 'button';
    a.textContent = `Niveau ${n}`;
    if (enabled) {
      a.classList.add('level');
      a.href = href;
      a.title = title;
    } else {
      a.style.opacity = .5;
      a.style.cursor = 'not-allowed';
      a.title = 'Bientôt disponible';
    }
    return a;
  };

  for (let n=1; n<=4; n++){
    if (base) {
      cont.appendChild(mkBtn(n, true, `${base}_niveau${n}.html`, `${base} — Niveau ${n}`));
    } else {
      cont.appendChild(mkBtn(n, false, '#', 'Bientôt disponible'));
    }
  }
}
