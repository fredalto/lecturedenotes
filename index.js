// --- ÉTAT global
let cleChoisie = '';
let niveauChoisi = 0;
let defiChoisi = '';

/* ============================
   Transitions d’affichage
   ============================ */
function showFadeSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('hidden');
  // déclenche l’animation "fade"
  requestAnimationFrame(() => el.classList.add('show'));
}
function hideAllFadeSections() {
  document.querySelectorAll('.fade').forEach(el => {
    el.classList.remove('show');
    setTimeout(() => el.classList.add('hidden'), 300);
  });
}

/* ============================
   Choix du mode (Clé / Instruments / Défi)
   ============================ */
function choisirMode(button, mode) {
  // visuel bouton
  document.querySelectorAll('.mode-buttons button').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');

  // reset d’état
  cleChoisie = '';
  niveauChoisi = 0;
  defiChoisi = '';
  const goBtn = document.getElementById('go-button');
  if (goBtn) goBtn.classList.add('hidden');
  const goDefi = document.getElementById('go-button-defi');
  if (goDefi) goDefi.classList.add('hidden');

  // affiche la bonne section
  hideAllFadeSections();
  setTimeout(() => showFadeSection(`etape-${mode}`), 300);
}

/* ============================
   Mode "Clé"
   ============================ */
function setCle(button, cle) {
  document.querySelectorAll('#cle-buttons button').forEach(btn => btn.classList.remove('selected'));
  button.classList.add('selected');
  cleChoisie = cle;

  // on montre la zone niveaux
  hideAllFadeSections();
  setTimeout(() => {
    showFadeSection('etape-cle');
    showFadeSection('etape-niveau');
  }, 300);
}
function selectNiveau(n) {
  document.querySelectorAll('.niveau-card').forEach(card => card.classList.remove('selected'));
  const cards = document.querySelectorAll('.niveau-card');
  if (cards[n - 1]) cards[n - 1].classList.add('selected');
  niveauChoisi = n;
  const goBtn = document.getElementById('go-button');
  if (goBtn) goBtn.classList.remove('hidden');
}
function lancerExercice() {
  if (!cleChoisie || !niveauChoisi) {
    alert("Choisis d’abord une clé et un niveau.");
    return;
  }
  const url = `${cleChoisie}_niveau${niveauChoisi}.html`;
  window.location.href = url;
}

/* ============================
   Mode "Défi"
   ============================ */
function selectDefi(el, cle) {
  document.querySelectorAll('.defi-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  defiChoisi = cle;
  const go = document.getElementById('go-button-defi');
  if (go) go.classList.remove('hidden');
}
function lancerDefiChoisi() {
  if (!defiChoisi) return;
  window.location.href = `defi_${defiChoisi}.html`;
}

/* ============================
   Mode "Instruments"
   (simplifié et calé sur les fichiers présents)
   ============================ */
let familleChoisie = '';
let sousFamilleChoisie = '';
let instrumentChoisi = '';

const SOUSFAMILLES = {
  'cordes': [
    { id:'frottees', label:'Frottées' },
    { id:'pincees',  label:'Pincées'  }
  ],
  'vents': [
    { id:'bois', label:'Bois' },
    { id:'cuivres', label:'Cuivres' }
  ],
  'claviers-soufflets': [
    { id:'claviers', label:'Claviers' },
    { id:'soufflets', label:'Soufflets' }
  ]
};

// Active uniquement ce qui existe dans ton ZIP (violon, alto, violoncelle)
const CATALOGUE = {
  'cordes': {
    'frottees': [
      { id:'violon',      label:'Violon',      actif:true  },
      { id:'alto',        label:'Alto',        actif:true  },
      { id:'violoncelle', label:'Violoncelle', actif:true  },
      { id:'contrebasse', label:'Contrebasse', actif:false }
    ],
    'pincees': [
      { id:'harpe', label:'Harpe', actif:false },
      { id:'guitare', label:'Guitare', actif:false }
    ]
  },
  'vents': {
    'bois': [
      { id:'flute', label:'Flûte', actif:false },
      { id:'clarinette', label:'Clarinette', actif:false }
    ],
    'cuivres': [
      { id:'trompette', label:'Trompette', actif:false }
    ]
  },
  'claviers-soufflets': {
    'claviers': [
      { id:'piano', label:'Piano', actif:false },
      { id:'percuclavier', label:'Percussions à clavier', actif:false }
    ],
    'soufflets': [
      { id:'accordeon', label:'Accordéon', actif:false }
    ]
  }
};

function selectFamille(famille) {
  familleChoisie = famille;
  sousFamilleChoisie = '';
  instrumentChoisi = '';
  document.getElementById('bloc-sousfamilles').classList.remove('hidden-soft');
  document.getElementById('bloc-instruments').classList.add('hidden-soft');
  document.getElementById('bloc-niveaux').classList.add('hidden-soft');

  // visuel
  document.querySelectorAll('.families-row .tile').forEach(t => t.classList.remove('selected'));
  const tile = document.querySelector(`.families-row .tile[data-famille="${famille}"]`);
  if (tile) tile.classList.add('selected');

  // injecte sous-familles
  const cont = document.getElementById('sousfamilles-container');
  cont.innerHTML = '';
  (SOUSFAMILLES[famille] || []).forEach(sf => {
    const d = document.createElement('div');
    d.className = 'tile';
    d.textContent = sf.label;
    d.onclick = () => selectSousFamille(sf.id);
    cont.appendChild(d);
  });
}

function selectSousFamille(sf) {
  sousFamilleChoisie = sf;
  instrumentChoisi = '';
  document.getElementById('bloc-instruments').classList.remove('hidden-soft');
  document.getElementById('bloc-niveaux').classList.add('hidden-soft');

  // visuel
  document.querySelectorAll('#sousfamilles-container .tile').forEach(t => t.classList.remove('selected'));
  const tiles = Array.from(document.querySelectorAll('#sousfamilles-container .tile'));
  const idx = (SOUSFAMILLES[familleChoisie] || []).findIndex(x => x.id === sf);
  if (tiles[idx]) tiles[idx].classList.add('selected');

  // injecte instruments
  const cont = document.getElementById('instruments-container');
  cont.innerHTML = '';
  const liste = (CATALOGUE[familleChoisie] || {})[sf] || [];
  liste.forEach(inst => {
    const d = document.createElement('div');
    d.className = 'tile' + (inst.actif ? '' : ' disabled');
    d.textContent = inst.label;
    if (inst.actif) d.onclick = () => selectInstrument(inst.id);
    cont.appendChild(d);
  });
}

function selectInstrument(id) {
  instrumentChoisi = id;
  document.getElementById('bloc-niveaux').classList.remove('hidden-soft');

  // visuel
  document.querySelectorAll('#instruments-container .tile').forEach(t => t.classList.remove('selected'));
  // sélection par texte
  const tiles = Array.from(document.querySelectorAll('#instruments-container .tile'));
  const found = tiles.find(t => t.textContent.trim().toLowerCase() === id.replace('-', ' '));
  if (found) found.classList.add('selected');

  // niveaux : on ne met des liens que pour les instruments disponibles
  const cont = document.getElementById('levels-container');
  cont.innerHTML = '';

  const haveFourLevels = ['violon', 'alto', 'violoncelle'].includes(id);
  if (!haveFourLevels) {
    for (let n = 1; n <= 4; n++) {
      const div = document.createElement('div');
      div.className = 'button level disabled';
      div.textContent = `Niveau ${n}`;
      cont.appendChild(div);
    }
    return;
  }

  for (let n = 1; n <= 4; n++) {
    const a = document.createElement('a');
    a.className = 'button level';
    a.textContent = `Niveau ${n}`;
    a.href = `${id}_niveau${n}.html`;
    cont.appendChild(a);
  }
}

/* ============================
   Accessibilité légère pour clavier
   ============================ */
document.addEventListener('DOMContentLoaded', () => {
  // rendre les tuiles focusables
  ['.niveau-card','.defi-card','.tile','.button.level'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
      el.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click?.(); }
      });
    });
  });
});

// Expose dans le scope global (nécessaire car on utilise des onClick HTML)
window.choisirMode = choisirMode;
window.setCle = setCle;
window.selectNiveau = selectNiveau;
window.lancerExercice = lancerExercice;
window.selectDefi = selectDefi;
window.lancerDefiChoisi = lancerDefiChoisi;
window.selectFamille = selectFamille;
window.selectSousFamille = selectSousFamille;
window.selectInstrument = selectInstrument;
