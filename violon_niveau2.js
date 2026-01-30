// Définition par cordes : open (0) puis 1er doigt (1)
const STRINGS = [
  {
    name: "Sol",
    open:   { nom: "Sol", image: "Images/sol/G3.png", fingering: "0" },
    first:  { nom: "La",  image: "Images/sol/A3.png", fingering: "1" }
  },
  {
    name: "Ré",
    open:   { nom: "Ré",  image: "Images/sol/D4.png", fingering: "0" },
    first:  { nom: "Mi",  image: "Images/sol/E4.png", fingering: "1" }
  },
  {
    name: "La",
    open:   { nom: "La",  image: "Images/sol/A4.png", fingering: "0" },
    first:  { nom: "Si",  image: "Images/sol/B4.png", fingering: "1" }
  },
  {
    name: "Mi",
    open:   { nom: "Mi",  image: "Images/sol/E5.png", fingering: "0" },
    first:  { nom: "Fa",  image: "Images/sol/F5.png", fingering: "1" }
  }
];

const labels = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

let score = 0;
let totalQuestions = 10;   // 5 paires [0 -> 1], couvre les 4 cordes au moins une fois
let currentQuestion = 0;
let currentCorrectAnswer = "";
let quizNotes = [];        // séquence finale (open, first, open, first, ...)
let isWaiting = false;
let showFingering = false;
let showRainbow = false; // Notes arc-en-ciel

const startButton    = document.getElementById("start-quiz");
const quizSection    = document.getElementById("quiz-section");
const noteImage      = document.getElementById("note-image");
const noteFrame      = document.getElementById("note-frame");
const gameContainer  = document.getElementById("game-container");
const feedback       = document.getElementById("feedback");
const progressBar    = document.getElementById("progress-bar");
const scoreDisplay   = document.getElementById("score-display");
const endButtons     = document.getElementById("end-buttons");
const fingeringBadge = document.getElementById("fingering-badge");
const toggleFingering= document.getElementById("toggle-fingering");
const toggleRainbow  = document.getElementById("toggle-rainbow");

startButton.addEventListener("click", startQuiz);

if (toggleFingering) {
  toggleFingering.addEventListener("change", () => {
    showFingering = !!toggleFingering.checked;
    if (quizSection.style.display !== "none") {
      const n = quizNotes[currentQuestion];
      updateFingeringBadge(n);
    }
  });
}

if (toggleRainbow) {
  toggleRainbow.addEventListener("change", () => {
    showRainbow = !!toggleRainbow.checked;
    const n = quizNotes[currentQuestion];
    updateRainbowBar(n);
  });
}

if (toggleRainbow) {
  toggleRainbow.addEventListener("change", () => {
    showRainbow = !!toggleRainbow.checked;
    const currentNote = quizNotes[currentQuestion];
    updateRainbowBar(currentNote);
  });
}

function startQuiz() {
  startButton.style.display = "none";
  document.getElementById("note-reference").style.display = "none";
  quizSection.style.display = "block";

  score = 0;
  currentQuestion = 0;
  isWaiting = false;

  // On construit un ordre de cordes pour des paires [0 -> 1] :
  // - couvre les 4 cordes au moins une fois
  // - pas deux fois la même corde à la suite
  const pairs = totalQuestions / 2;  // 5
  const order = buildStringOrder(pairs); // ex. [2,0,3,1,0]

  quizNotes = [];
  for (const idx of order) {
    quizNotes.push(STRINGS[idx].open);  // corde à vide
    quizNotes.push(STRINGS[idx].first); // 1er doigt
  }

  loadNextQuestion();
}

// Construit un ordre de 'pairs' cordes respectant : couverture des 4 cordes + pas de répétition immédiate
function buildStringOrder(pairs) {
  // On commence par une permutation aléatoire des 4 cordes (couvre toutes les cordes)
  const base = [0,1,2,3].sort(() => Math.random() - 0.5);

  // Si pairs > 4 (ici 5), on ajoute des cordes aléatoires ≠ de la précédente
  while (base.length < pairs) {
    const last = base[base.length - 1];
    const candidates = [0,1,2,3].filter(i => i !== last);
    base.push(candidates[Math.floor(Math.random() * candidates.length)]);
  }
  return base.slice(0, pairs);
}

function loadNextQuestion() {
  if (currentQuestion >= totalQuestions) {
    showFinalScore();
    return;
  }

  const currentNote = quizNotes[currentQuestion];
  currentCorrectAnswer = currentNote.nom;

  noteImage.src = currentNote.image;
  noteImage.alt = currentNote.nom;

  updateFingeringBadge(currentNote);
  updateRainbowBar(currentNote);

  gameContainer.innerHTML = "";
  feedback.textContent = "";

  labels.forEach((label) => {
    const button = document.createElement("button");
    button.textContent = label;
    button.className = "button";
    button.addEventListener("click", () => checkAnswer(label));
    gameContainer.appendChild(button);
  });

  updateScoreDisplay();
}

function updateFingeringBadge(note) {
  if (!fingeringBadge) return;
  if (showFingering) {
    fingeringBadge.textContent = note?.fingering ?? "";
    fingeringBadge.style.display = "inline-flex";
  } else {
    fingeringBadge.style.display = "none";
  }
}


function normalizeNoteName(n) {
  return (n || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // retire accents
    .replace(/\s+/g, "")
    .replace("ré", "re");
}

// Mapping Boomwhackers (Do à Si)
function getRainbowColor(noteName) {
  const n = normalizeNoteName(noteName);
  const map = {
    // Couleurs un peu plus sombres (proches Boomwhackers)
    "do":  "#c62828", // rouge
    "re":  "#ef6c00", // orange
    "mi":  "#f9a825", // jaune
    "fa":  "#7cb342", // vert clair
    "sol": "#2e7d32", // vert
    "la":  "#6a1b9a", // violet
    "si":  "#ad1457"  // rose
  };
  return map[n] || "#9e9e9e";
}

function hexToRgba(hex, a) {
  const h = (hex || "#000000").replace("#","").trim();
  const full = h.length === 3 ? h.split("").map(c=>c+c).join("") : h.padEnd(6,"0");
  const r = parseInt(full.slice(0,2),16);
  const g = parseInt(full.slice(2,4),16);
  const b = parseInt(full.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

function updateRainbowBar(noteObj) {
  /* Notes arc-en-ciel : uniquement le cadre, sans soulignement */
  if (!noteFrame) return;

  if (!showRainbow || !noteObj) {
    noteFrame.classList.remove("rainbow-on");
    noteFrame.style.removeProperty("--rainbow-color");
    noteFrame.style.removeProperty("--rainbow-glow");
    return;
  }

  const base = getRainbowColor(noteObj.nom);

  // Cadre coloré autour de la note
  noteFrame.style.setProperty("--rainbow-color", base);
  noteFrame.style.setProperty("--rainbow-glow", hexToRgba(base, 0.35));
  noteFrame.classList.add("rainbow-on");
}


function playSound(filename) {
  const audio = new Audio(`sounds/${filename}`);
  audio.play();
}

function checkAnswer(selected) {
  if (isWaiting || currentQuestion >= totalQuestions) return;
  isWaiting = true;

  if (selected === currentCorrectAnswer) {
    score++;
    feedback.textContent = "Bonne réponse !";
    feedback.className = "correct";
    const noteFile = noteImage.src.split("/").pop().replace(".png", ".mp3");
    playSound(noteFile);
  } else {
    feedback.textContent = `Incorrect ! C'était "${currentCorrectAnswer}".`;
    feedback.className = "incorrect";
    playSound("duck.mp3");
  }

  currentQuestion++;
  updateProgress();

  const allButtons = gameContainer.querySelectorAll("button");
  allButtons.forEach(btn => btn.disabled = true);

  setTimeout(() => {
    isWaiting = false;
    loadNextQuestion();
  }, 1000);
}

function updateProgress() {
  const percent = (currentQuestion / totalQuestions) * 100;
  progressBar.style.width = percent + "%";
}

function updateScoreDisplay() {
  scoreDisplay.innerHTML = `
    <div style="font-size: 28px; font-weight: bold;">
      Score : ${score} / ${totalQuestions}
    </div>
  `;
}

function showFinalScore() {
  quizSection.style.display = "none";
  endButtons.style.display = "block";

  const percent = Math.round((score / totalQuestions) * 100);
  let html = `
    <div style="font-size: 36px; font-weight: bold; margin-bottom: 10px;">
      Score final : ${score} / ${totalQuestions} (${percent}%)
    </div>
  `;

  if (percent >= 90) {
    html += `
      <div style="color: green; font-size: 20px; margin-bottom: 10px;">
        🎉 Félicitations ! Tu maîtrises les notes comme un chef d’orchestre ! 🥳
      </div>
      <div style="font-size: 18px; color: #333; margin-bottom: 20px;">
        🚀 Tu es prêt·e à passer au niveau suivant !
      </div>
    `;
  } else {
    html += `
      <div style="font-size: 18px; color: #333; margin-bottom: 20px;">
        🔁 Recommence le niveau pour renforcer ta rapidité et ta précision !
      </div>
    `;
  }

  scoreDisplay.innerHTML = html;
  scoreDisplay.style.display = "block";
  endButtons.parentNode.insertBefore(scoreDisplay, endButtons);

  if (percent >= 90 && !document.querySelector(".gold-button")) {
    const goldButton = document.createElement("button");
    goldButton.textContent = "Niveau 3";
    goldButton.className = "button gold-button";
    goldButton.onclick = () => {
      window.location.href = "violon_niveau3.html";
    };
    endButtons.insertBefore(goldButton, endButtons.firstChild);
  }

  document.getElementById("send-score").style.display = "block";
}

let scoreEnvoye = false;

function envoyerScore() {
  if (scoreEnvoye) return;

  const prenom = document.getElementById("prenom").value.trim();
  const nom = document.getElementById("nom").value.trim();
  const prof = document.getElementById("prof").value.trim();
  const score20 = score * 2;
  const pourcentage = Math.round((score / totalQuestions) * 100);
  const confirmation = document.getElementById("confirmation");
  const bouton = document.querySelector("#send-score button");
  const loadingMessage = document.getElementById("loading-message");

  if (!prenom || !nom || !prof) {
    confirmation.style.color = "red";
    confirmation.textContent = "Merci de remplir tous les champs.";
    return;
  }

  loadingMessage.style.display = "block";
  confirmation.textContent = "";

  const data = new URLSearchParams();
  data.append("prenom", prenom);
  data.append("nom", nom);
  data.append("prof", prof);
  data.append("exercice", "Lecture de notes");
  data.append("type", "Clé");
  data.append("niveau", "violon_niveau2");
  data.append("score20", score20);
  data.append("scorePct", pourcentage);

  fetch("https://script.google.com/macros/s/AKfycbzY_NRau0v-nltjlhA8e0U5JysyTpqdK8StMIgDXmxWwnQk8Y_iXc4EAHWoEn_3LZT8aw/exec", {
    method: "POST",
    body: data
  })
  .then(() => {
    scoreEnvoye = true;
    loadingMessage.style.display = "none";
    confirmation.style.color = "green";
    confirmation.textContent = "✅ Score envoyé avec succès !";

    bouton.disabled = true;
    bouton.textContent = "Score déjà envoyé";
    bouton.style.backgroundColor = "#ccc";
    bouton.style.color = "#666";
    bouton.style.border = "1px solid #999";
    bouton.style.cursor = "not-allowed";
  })
  .catch(() => {
    loadingMessage.style.display = "none";
    confirmation.style.color = "red";
    confirmation.textContent = "❌ Une erreur est survenue pendant l'envoi.";
  });
}

const keyMap = {
  'c': 'Do', 'd': 'Ré', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si'
};

document.addEventListener('keydown', (ev) => {
  const tag = (ev.target && ev.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'select' || tag === 'textarea') return;

  const note = keyMap[ev.key?.toLowerCase()];
  if (!note) return;

  const btn = [...document.querySelectorAll('#game-container button')]
    .find(b => b.textContent.trim().toLowerCase() === note.toLowerCase());
  if (btn && !btn.disabled) btn.click();
});
