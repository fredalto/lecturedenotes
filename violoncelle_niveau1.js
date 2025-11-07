const notes = [
  { nom: "Do", image: "Images/fa/C2.png", fingering: "0" },
  { nom: "Sol", image: "Images/fa/G2.png", fingering: "0" },
  { nom: "Ré", image: "Images/fa/D3.png", fingering: "0" },
  { nom: "La", image: "Images/fa/A3.png", fingering: "0" }
];

const labels = ['Do', 'Ré', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

let score = 0;
let totalQuestions = 10;
let currentQuestion = 0;
let currentCorrectAnswer = "";
let quizNotes = [];
let lastNoteImage = "";
let isWaiting = false;
let showFingering = false; // état du toggle

const startButton = document.getElementById("start-quiz");
const quizSection = document.getElementById("quiz-section");
const noteImage = document.getElementById("note-image");
const gameContainer = document.getElementById("game-container");
const feedback = document.getElementById("feedback");
const progressBar = document.getElementById("progress-bar");
const scoreDisplay = document.getElementById("score-display");
const endButtons = document.getElementById("end-buttons");
const fingeringBadge = document.getElementById("fingering-badge");
const toggleFingering = document.getElementById("toggle-fingering");

startButton.addEventListener("click", startQuiz);

// Gestion du toggle "Afficher le doigté"
if (toggleFingering) {
  toggleFingering.addEventListener("change", () => {
    showFingering = !!toggleFingering.checked;
    // Met à jour l'affichage du badge pour la note courante si on est dans le quiz
    if (quizSection.style.display !== "none") {
      const n = quizNotes[currentQuestion];
      updateFingeringBadge(n);
    }
  });
}

function startQuiz() {
  startButton.style.display = "none";
  document.getElementById("note-reference").style.display = "none";
  quizSection.style.display = "block";
  score = 0;
  currentQuestion = 0;
  lastNoteImage = "";
  isWaiting = false;

  // --- Nouvelle logique : 10 notes, chaque corde ≥ 2 fois, sans répétition consécutive ---
  quizNotes = [];

  // 1. Chaque note deux fois (4x2 = 8)
  notes.forEach(note => { quizNotes.push(note, note); });

  // 2. +2 notes aléatoires (peut donner 3 occurrences de certaines)
  for (let i = 0; i < 2; i++) {
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    quizNotes.push(randomNote);
  }

  // 3. Mélange sans doublons consécutifs
  quizNotes = shuffleNoRepeats(quizNotes);

  loadNextQuestion();
}

function shuffleNoRepeats(array) {
  let shuffled;
  let attempt = 0;
  do {
    shuffled = array.slice().sort(() => Math.random() - 0.5);
    attempt++;
  } while (hasConsecutiveDuplicates(shuffled) && attempt < 100);
  return shuffled;
}

function hasConsecutiveDuplicates(array) {
  for (let i = 1; i < array.length; i++) {
    if (array[i].image === array[i - 1].image) return true;
  }
  return false;
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

  // Met à jour le badge de doigté (affiché uniquement si le toggle est actif)
  updateFingeringBadge(currentNote);

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
    goldButton.textContent = "Niveau 2";
    goldButton.className = "button gold-button";
    goldButton.onclick = () => {
      window.location.href = "violoncelle_niveau2.html";
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
  data.append("niveau", "violoncelle_niveau1");
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
