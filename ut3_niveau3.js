const notesRepereEtConjointes = {
  "C4": { nom: "Do", conjointes: ["E4", "A3"] },
  "G4": { nom: "Sol", conjointes: ["B4", "E4"] },
  "C3": { nom: "Do", conjointes: ["A2", "E3"] },
  "F3": { nom: "Fa", conjointes: ["A3", "D3"] }
};

const noteToNom = {
  "C4": "Do", "E4": "Mi", "A3": "La",
  "G4": "Sol", "B4": "Si","E4": "Mi",
  "C3": "Do", "A2": "La", "E3": "Mi",
  "F3": "Fa", "A3": "La", "D3": "Ré"
};
  
const reponses = ["Do", "Ré", "Mi", "Fa", "Sol", "La", "Si"];

let score = 0, total = 10, current = 0, quizNotes = [], correct = "", scoreEnvoye = false;


const startBtn = document.getElementById("start-quiz");
const quiz = document.getElementById("quiz-section");
const noteImg = document.getElementById("note-image");
const container = document.getElementById("game-container");
const feedback = document.getElementById("feedback");
const progressBar = document.getElementById("progress-bar");
const scoreDisplay = document.getElementById("score-display");
const finalMessage = document.getElementById("final-message");
const endButtons = document.getElementById("end-buttons");

startBtn.onclick = () => {
  const intro = document.getElementById("note-reference");
  if (intro) intro.classList.add("hidden");
  startBtn.classList.add("hidden");
  quiz.classList.remove("hidden");
  score = 0;
  current = 0;
  quizNotes = generateSequence();
  nextNote();
};

function generateSequence() {
  const repereKeys = Object.keys(notesRepereEtConjointes);
  const result = [];
  let prevRepere = null; 
  for (let i = 0; i < total; i++) {
    if (i % 2 === 0) {
const candidats = prevRepere
        ? repereKeys.filter(r => r !== prevRepere)
        : repereKeys.slice(); 
      const r = candidats[Math.floor(Math.random() * candidats.length)];
      result.push({ code: r, nom: noteToNom[r], img: r + ".png", repere: r });
      prevRepere = r; 
    } else {
      const conj = notesRepereEtConjointes[prevRepere].conjointes;
      const c = conj[Math.floor(Math.random() * conj.length)];
      result.push({ code: c, nom: noteToNom[c], img: c + ".png", repere: prevRepere });
    }
  }
  return result;
}

function nextNote() {
  if (current >= total) {
    finishQuiz();
    return;
  }

  const note = quizNotes[current];
  correct = note.nom;
  noteImg.src = "Images/ut3/" + note.img;
  container.innerHTML = "";
  enableButtons();
  feedback.textContent = "";

  reponses.forEach(r => {
    const btn = document.createElement("button");
    btn.textContent = r;
    btn.className = "button";
    btn.onclick = () => check(r);
    container.appendChild(btn);
  });

  scoreDisplay.textContent = `Score : ${score} / ${total}`;
  progressBar.style.width = (current / total * 100) + "%";
}

function check(resp) {
  disableButtons();
  if (resp === correct) {
    score++;
    feedback.textContent = "Bonne réponse !";
    feedback.className = "correct";
    playSound(quizNotes[current].code + ".mp3");
  } else {
    feedback.textContent = `Incorrect ! C'était "${correct}"`;
    feedback.className = "incorrect";
    playSound("duck.mp3");
  }

  current++;
  setTimeout(() => {
    nextNote();
  }, 800);
}

function playSound(file) {
  const audio = new Audio("sounds/" + file);
  audio.play();
}

function resetSendScoreForm() {
  const prenom = document.getElementById("prenom");
  const nom = document.getElementById("nom");
  const prof = document.getElementById("prof");
  const confirmation = document.getElementById("confirmation");
  const loadingMessage = document.getElementById("loading-message");

  if (prenom) prenom.value = "";
  if (nom) nom.value = "";
  if (prof) prof.value = ""; // revient sur "Choisir un professeur"

  if (confirmation) {
    confirmation.textContent = "";
    confirmation.style.color = "";
  }

  if (loadingMessage) loadingMessage.classList.add("hidden");

  scoreEnvoye = false; // on réactive la possibilité d'envoyer
}

// Vider les champs quand la page (re)devient visible après un reload/navigation
window.addEventListener('pageshow', () => {
  resetSendScoreForm();
});

function finishQuiz() {
  // 1) Laisser visible la section quiz
  quiz.classList.remove("hidden");

  // 2) Cacher les éléments de jeu
  const noteDisplay = document.getElementById("note-display");
  const game = document.getElementById("game-container");
  const fb = document.getElementById("feedback");
  const prog = document.getElementById("progress-container");

  if (noteDisplay) noteDisplay.classList.add("hidden");
  if (game)        game.classList.add("hidden");
  if (fb)          fb.classList.add("hidden");
  if (prog)        prog.classList.add("hidden");

  // 3) Afficher le score
  scoreDisplay.classList.remove("hidden");
  const pct = Math.round((score / total) * 100);
  const btnN1 = document.getElementById("niveau-1");
if (btnN1) {
  btnN1.classList.add("hidden");       // reset à chaque fin de quiz
  if (pct < 25) btnN1.classList.remove("hidden");
}
  // -- Visibilité du bouton "Niveau 4" : visible seulement si pct ≥ 75 %
const btnN3 = document.getElementById("niveau-suivant");
if (btnN3) {
  btnN3.classList.add("hidden");        // on repart caché à chaque fin de quiz
  if (pct >= 75) btnN3.classList.remove("hidden");
}

  scoreDisplay.innerHTML = `
    <div style="font-size: 48px; font-weight: bold; margin-bottom: 10px;">
      🎯 ${score} / ${total}
    </div>
    <div style="font-size: 36px; color: #333;">
      ✅ ${pct} %
    </div>
  `;

  // 4) Message final
  finalMessage.innerHTML = pct >= 75
    ? `<div style="color: green; font-size: 20px; margin-bottom: 10px;">
        🎉 Félicitations ! Tu maîtrises les notes comme un chef d’orchestre ! 🥳
      </div>
      <div style="font-size: 18px; color: #333; margin-bottom: 20px;">
        🚀 Tu es prêt·e à passer au niveau suivant !
      </div>`
    : `<div style="font-size: 18px; color: #333; margin-bottom: 20px;">
        🔁 Recommence le niveau pour renforcer ta rapidité et ta précision !
      </div>`;

  // 5) Afficher les boutons de fin et l’envoi du score
  endButtons.classList.remove("hidden");
  resetSendScoreForm();
  document.getElementById("send-score").classList.remove("hidden");

    // 6) Assurer l’état initial du bloc d’envoi
  const loadingMessage = document.getElementById("loading-message");
  const confirmation = document.getElementById("confirmation");
  if (loadingMessage) loadingMessage.classList.add("hidden"); // toujours caché à l’arrivée
  if (confirmation) confirmation.textContent = "";  
}



function envoyerScore() {
  if (scoreEnvoye) return;
  const prenom = document.getElementById("prenom").value.trim();
  const nom = document.getElementById("nom").value.trim();
  const prof = document.getElementById("prof").value.trim();
  const score20 = score * 2;
  const pourcentage = Math.round((score / total) * 100);
  const confirmation = document.getElementById("confirmation");
  const bouton = document.querySelector("#send-score button");
  const loadingMessage = document.getElementById("loading-message");

  if (!prenom || !nom || !prof) {
    confirmation.style.color = "red";
    confirmation.textContent = "Merci de remplir tous les champs.";
    return;
  }

  loadingMessage.classList.remove("hidden");
  confirmation.textContent = "";

  const data = new URLSearchParams();
  data.append("prenom", prenom);
  data.append("nom", nom);
  data.append("prof", prof);
  data.append("exercice", "Lecture de notes");
  data.append("type", "Clé");
  data.append("niveau", "ut3_niveau3");
  data.append("score20", score20);
  data.append("scorePct", pourcentage);

  fetch("https://script.google.com/macros/s/AKfycbzY_NRau0v-nltjlhA8e0U5JysyTpqdK8StMIgDXmxWwnQk8Y_iXc4EAHWoEn_3LZT8aw/exec", {
    method: "POST",
    body: data
  }).then(() => {
    scoreEnvoye = true;
    loadingMessage.classList.add("hidden");
    confirmation.style.color = "green";
    confirmation.textContent = "✅ Score envoyé avec succès !";
    bouton.disabled = true;
    bouton.textContent = "Score déjà envoyé";
  }).catch(() => {
    loadingMessage.classList.add("hidden");
    confirmation.style.color = "red";
    confirmation.textContent = "❌ Une erreur est survenue pendant l'envoi.";
  });
}

function disableButtons() {
  document.querySelectorAll('#game-container button').forEach(btn => btn.disabled = true);
}

function enableButtons() {
  document.querySelectorAll('#game-container button').forEach(btn => btn.disabled = false);
}

(function() {
  try {
    var btn = document.getElementById('btn-envoyer-score');
    if (btn && typeof envoyerScore === 'function') {
      btn.addEventListener('click', envoyerScore, { once: false });
    }
  } catch (e) {
    console.warn('Bind envoyerScore error:', e);
  }
})();

// === Preload images & sounds ===
(function preloadAssets() {
  // Images
  const images = [
  "C4.png" , "E4.png" , "A3.png",
  "G4.png" , "B4.png" , "E4.png",
  "C3.png" , "A2.png" , "E3.png",
  "F3.png" , "A3.png" , "D3.png"
  ].map(n => "Images/ut3/" + n);
  
  images.forEach(src => { const img = new Image(); img.src = src; });

  // Sons
  const sons = [
    "duck.mp3",
  "C4.mp3" , "E4.mp3" , "A3.mp3",
  "G4.mp3" , "B4.mp3" , "E4.mp3",
  "C3.mp3" , "A2.mp3" , "E3.mp3",
  "F3.mp3" , "A3.mp3" , "D3.mp3"
  ].map(n => "sounds/" + n);
  
  sons.forEach(src => { const a = new Audio(); a.preload = "auto"; a.src = src; });
})();

function playSound(file) {
  const audio = new Audio("sounds/" + file);
  const p = audio.play();
  if (p && typeof p.catch === 'function') {
    p.catch(() => { /* on ignore si l’autoplay est bloqué */ });
  }
}

// === Keyboard shortcuts ===

const keyMap = {
  'c': 'Do', 'd': 'Ré', 'e': 'Mi', 'f': 'Fa', 'g': 'Sol', 'a': 'La', 'b': 'Si'
};

document.addEventListener('keydown', (ev) => {
  // ignorer si on tape dans un input/select
  const tag = (ev.target && ev.target.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'select' || tag === 'textarea') return;

  const note = keyMap[ev.key?.toLowerCase()];
  if (!note) return;

  // Clique “virtuellement” le bouton correspondant si visible
  const btn = [...document.querySelectorAll('#game-container button')]
    .find(b => b.textContent.trim().toLowerCase() === note.toLowerCase());
  if (btn && !btn.disabled) btn.click();
});

