// --- ÉTAT global
let cleChoisie = '';
let niveauChoisi = 0;
let defiChoisi = '';

// --- Transitions d’affichage
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
  setTimeout(() => showFadeSection(`etape-${mode}`), 300);
}

// --- Mode "Clé"
function setCle(button, cle) {
  document.querySelectorAll('#cle-buttons button').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
  cleChoisie = cle;
  hideAllFadeSections();
  setTimeout(() => { showFadeSection('etape-cle'); showFadeSection('etape-niveau'); }, 300);
}
function selectNiveau(n) {
  document.querySelectorAll('.niveau-card').forEach(card => card.classList.remove('selected'));
  document.querySelectorAll('.niveau-card')[n - 1].classList.add('selected');
  niveauChoisi = n;
  document.getElementById('go-button').classList.remove('hidden');
}
function lancerExercice() {
  const url = `${cleChoisie}_niveau${niveauChoisie}.html`;
  window.location.href = url;
}

// --- Mode "Défi"
function selectDefi(el, cle) {
  document.querySelectorAll('.defi-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  defiChoisi = cle;
  document.getElementById('go-button-defi').classList.remove('hidden');
}
function lancerDefiChoisi() {
  const url = `defi_${defiChoisi}.html`;
  window.location.href = url;
}

// --- Effets visuels
function addCardHoverEffects(container) {
  const cards = container.querySelectorAll('.niveau-card, .defi-card, .tile, .button.level');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-2px)');
    card.addEventListener('mouseleave', () => card.style.transform = '');
    if (!card.hasAttribute('tabindex')) card.tabIndex = 0;
    card.addEventListener('keydown', e => {
      if (['Enter', ' '].includes(e.key)) { e.preventDefault(); card.click?.(); }
    });
  });
}
function cascadeIn(container) {
  const cards = container.querySelectorAll('.niveau-card, .defi-card, .tile, .button.level');
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(6px)';
    setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 60 + i * 40);
  });
}
const _showFadeSection = showFadeSection;
showFadeSection = id => { _showFadeSection(id); setTimeout(() => { addCardHoverEffects(document.getElementById(id)); cascadeIn(document.getElementById(id)); }, 20); };

// ==========================
//  MODE "INSTRUMENTS"
// ==========================
let familleChoisie = '', sousFamilleChoisie = '', instrumentChoisi = '';

const SOUSFAMILLES = {
  'cordes': [
    { id:'frottees', label:'Frottées' },
    { id:'pinces',   label:'Pincées' },
    { id:'frappees', label:'Frappées' }
  ],
  'vents': [
    { id:'bois',    label:'Bois' },
    { id:'cuivres', label:'Cuivres' },
    { id:'biseaux', label:'Biseaux' }
  ],
  'claviers-soufflets': [
    { id:'claviers',       label:'Claviers' },
    { id:'soufflets',      label:'Soufflets' },
    { id:'percuclavier',   label:'Percussions à clavier' }
  ]
};

const CATALOGUE = {
  'cordes': {
    'frottees': [
      { id:'violon',      label:'Violon',       actif:true  },
      { id:'alto',        label:'Alto',         actif:true  },
      { id:'violoncelle', label:'Violoncelle',  actif:false },
      { id:'contrebasse', label:'Contrebasse',  actif:false }
    ],
    'pinces': [
      { id:'guitare',     label:'Guitare',      actif:false },
      { id:'clavecin',    label:'Clavecin',     actif:false }
    ],
    'frappees': [
      { id:'piano',       label:'Piano',        actif:false }
    ]
  },
  'vents': {
    'bois': [
      { id:'hautbois',    label:'Hautbois',     actif:false },
      { id:'clarinette',  label:'Clarinette',   actif:false },
      { id:'basson',      label:'Basson',       actif:false },
      { id:'saxophone',   label:'Saxophone',    actif:false }
    ],
    'cuivres': [
      { id:'cor',         label:'Cor',                  actif:false },
      { id:'trompette',   label:'Trompette / Cornet',   actif:false },
      { id:'trombone',    label:'Trombone',             actif:false },
      { id:'tuba',        label:'Tuba',                 actif:false }
    ],
    'biseaux': [
      { id:'flute',       label:'Flûte traversière',    actif:false },
      { id:'flutebec',    label:'Flûte à bec',          actif:false }
    ]
  },
  'claviers-soufflets': {
    'claviers': [
      { id:'piano',       label:'Piano',       actif:false },
      { id:'orgue',       label:'Orgue',       actif:false },
      { id:'clavecin',    label:'Clavecin',    actif:false }
    ],
    'soufflets': [
      { id:'accordeon',   label:'Accordéon',   actif:false },
      { id:'cornemuse',   label:'Cornemuse',   actif:false }
    ],
    'percuclavier': [
      {
        id:'perc_clavier',
        label:'Vibraphone, Marimba, Xylophone, Glockenspiel',
        actif:false
      }
    ]
  }
};

// Fichiers disponibles
const BASE_MAP = {
  violon: 'violon',
  alto:   'alto'
};

// --- Sélection famille / sous-famille / instrument
function selectFamille(famille){
  familleChoisie = famille; sousFamilleChoisie = ''; instrumentChoisi = '';
  document.querySelectorAll('#etape-instrument .families-row .tile').forEach(t => t.classList.toggle('selected', t.dataset.famille === famille));
  renderSousFamilles(famille);
  document.getElementById('bloc-sousfamilles').classList.remove('hidden-soft');
  document.getElementById('bloc-instruments').classList.add('hidden-soft');
  document.getElementById('bloc-niveaux').classList.add('hidden-soft');
}

function renderSousFamilles(famille){
  const cont = document.getElementById('sousfamilles-container');
  cont.innerHTML = '';
  (SOUSFAMILLES[famille] || []).forEach(sf => {
    const card = document.createElement('div');
    card.className = 'tile';
    card.textContent = sf.label;
    card.dataset.sousfamille = sf.id;
    card.onclick = () => selectSousFamille(sf.id);
    cont.appendChild(card);
  });
}

function selectSousFamille(sfid){
  sousFamilleChoisie = sfid; instrumentChoisi = '';
  document.querySelectorAll('#sousfamilles-container .tile').forEach(t => t.classList.toggle('selected', t.dataset.sousfamille === sfid));
  renderInstruments();
  document.getElementById('bloc-instruments').classList.remove('hidden-soft');
  document.getElementById('bloc-niveaux').classList.add('hidden-soft');
}

function renderInstruments(){
  const cont = document.getElementById('instruments-container');
  cont.innerHTML = '';
  const list = (CATALOGUE[familleChoisie] || {})[sousFamilleChoisie] || [];

  if (!list.length){
    cont.innerHTML = '<div class="tile disabled">Bientôt disponible</div>';
    return;
  }

  list.forEach(ins => {
    const card = document.createElement('div');
    card.className = 'tile' + (ins.actif ? '' : ' disabled');
    card.textContent = ins.label;
    if (ins.actif) card.onclick = () => selectInstrument(ins.id);
    cont.appendChild(card);
  });
}

function selectInstrument(id){
  instrumentChoisi = id;
  document.querySelectorAll('#instruments-container .tile').forEach(t => t.classList.remove('selected'));
  renderLevels(id);
  document.getElementById('bloc-niveaux').classList.remove('hidden-soft');
}

function renderLevels(id){
  const cont = document.getElementById('levels-container');
  cont.innerHTML = '';

  // Cas : Percussions à clavier → un seul exercice commun
  if (id === 'perc_clavier') {
    const a = document.createElement('a');
    a.className = 'button level';
    a.textContent = 'Exercice';
    a.href = 'percussions_clavier.html';
    cont.appendChild(a);
    return;
  }

  const base = BASE_MAP[id];
  for (let n=1; n<=4; n++){
    const a = document.createElement(base ? 'a' : 'div');
    a.className = 'button level';
    a.textContent = `Niveau ${n}`;
    if (base) a.href = `${base}_niveau${n}.html`; else a.classList.add('disabled');
    cont.appendChild(a);
  }
}
