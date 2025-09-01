/* ===== URL Apps Script (même que tes autres écrans) ===== */
var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzY_NRau0v-nltjlhA8e0U5JysyTpqdK8StMIgDXmxWwnQk8Y_iXc4EAHWoEn_3LZT8aw/exec";

/* ===== RANGES & REPÈRES (reprend exactement tes définitions) ===== */
var SOL_RANGE = ["F3","G3","A3","B3","C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5","B5","C6","D6","E6"];
var SOL_REPERES = { "G4":1, "C4":1, "C5":1, "A5":1 };

var FA_RANGE = ["C2","D2","E2","F2","G2","A2","B2","C3","D3","E3","F3","G3","A3","B3","C4","D4","E4"];
var FA_REPERES = { "F3":1, "C4":1, "E2":1, "B2":1 };

var UT3_RANGE = ["A2","B2","C3","D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4","B4"];
var UT3_REPERES = { "C4":1, "G4":1, "C3":1, "F3":1 };

var UT4_RANGE = ["B2","C3","D3","E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4"];
var UT4_REPERES = { "C4":1, "F4":1, "D3":1, "G3":1 };

var DIRS = { sol:"Images/sol", fa:"Images/fa", ut3:"Images/ut3", ut4:"Images/ut4" };

/* ===== MAPPINGS ===== */
var LETTER2NAME = { C:"Do", D:"Ré", E:"Mi", F:"Fa", G:"Sol", A:"La", B:"Si" };
var NAMES = ["Do","Ré","Mi","Fa","Sol","La","Si"];

/* ===== ÉTAT ===== */
var running=false, qIndex=0, qTotal=0, good=0, bad=0;
var currentCode="", currentClef="", lastImg="";

/* ===== DOM ===== */
var startBtn = document.getElementById("start-quiz");
var resetBtn = document.getElementById("reset-quiz");
var quizSection = document.getElementById("quiz-section");
var noteImage = document.getElementById("note-image");
var gameContainer = document.getElementById("game-container");
var feedback = document.getElementById("feedback");
var progressBar = document.getElementById("progress-bar");
var scoreDisplay = document.getElementById("score-display");

/* ===== AUDIO (facultatif, si tu as /sounds) ===== */
function playNoteIfExists(code){
  try{ new Audio("sounds/"+code+".mp3").play().catch(function(){}); }catch(e){}
}
function playDuck(){
  try{ new Audio("sounds/duck.mp3").play().catch(function(){}); }catch(e){}
}

/* ===== UI ===== */
function updateHUD(){
  scoreDisplay.innerHTML = "Score : <b>"+good+"</b> / "+qIndex;
  var pct = qTotal ? Math.floor(100 * (qIndex/qTotal)) : 0;
  progressBar.style.width = (qTotal ? pct : 0) + "%";
}
function setFeedback(msg, ok){
  feedback.className = feedback.className.replace(/\bcorrect\b|\bincorrect\b/g,'').trim();
  if(!msg){ feedback.textContent=""; return; }
  feedback.textContent = msg;
  feedback.className += ok ? " correct" : " incorrect";
}

/* ===== OUTILS ===== */
function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function poolFrom(range, reperes){
  // on prend toute l’étendue (tu peux limiter si tu préfères repères+voisins)
  return range.slice();
}

/* ===== RENDU BOUTONS ===== */
(function renderButtons(){
  gameContainer.innerHTML = "";
  NAMES.forEach(function(nom){
    var b=document.createElement("button");
    b.className="button";
    b.textContent=nom;
    b.onclick=function(){ onAnswer(nom); };
    gameContainer.appendChild(b);
  });
})();

/* ===== GÉNÉRATION QUESTION ===== */
function getSelectedKeys(){
  var boxes = document.querySelectorAll('.clef:checked');
  var keys = [];
  for (var i=0;i<boxes.length;i++) keys.push(boxes[i].value);
  if (keys.length===0) keys = ["sol","fa"]; // valeur sûre
  return keys;
}

function showQuestion(){
  var sel = getSelectedKeys();
  currentClef = pick(sel); // tirage équilibré parmi la sélection
  var cfg =
    currentClef==="sol" ? {dir:DIRS.sol, RANGE:SOL_RANGE, REPERES:SOL_REPERES} :
    currentClef==="fa"  ? {dir:DIRS.fa,  RANGE:FA_RANGE,  REPERES:FA_REPERES } :
    currentClef==="ut3" ? {dir:DIRS.ut3, RANGE:UT3_RANGE, REPERES:UT3_REPERES} :
                          {dir:DIRS.ut4, RANGE:UT4_RANGE, REPERES:UT4_REPERES};

  var pool = poolFrom(cfg.RANGE, cfg.REPERES);
  currentCode = pick(pool);

  var src = cfg.dir + "/" + currentCode + ".png";
  if(src===lastImg){ return showQuestion(); } // évite doublon strict
  lastImg = src;

  noteImage.onerror = function(){ showQuestion(); };
  noteImage.src = src;
  setFeedback("", true);
}

/* ===== RÉPONSES ===== */
function onAnswer(nom){
  if(!running || !currentCode) return;
  qIndex++;
  var expected = LETTER2NAME[currentCode[0]];

  if(nom===expected){
    good++; playNoteIfExists(currentCode);
    setFeedback("✅ Correct", true);
  }else{
    bad++; playDuck();
    setFeedback("❌ Attendu : "+expected, false);
  }

  updateHUD();

  if(qIndex >= qTotal){
    // fin de session
    running=false;
    startBtn.disabled=false; resetBtn.disabled=false;
    document.getElementById("send-score").style.display="block";
    return;
  }
  setTimeout(showQuestion, 250);
}

/* ===== CONTRÔLES ===== */
startBtn.onclick=function(){
  if(running) return;
  qTotal = Math.max(1, Math.min(200, parseInt(document.getElementById("nbQuestions").value,10) || 20));
  running=true; qIndex=0; good=0; bad=0; lastImg="";
  quizSection.style.display="block";
  startBtn.disabled=true; resetBtn.disabled=false;
  updateHUD(); showQuestion();
};

resetBtn.onclick=function(){
  running=false; qIndex=0; good=0; bad=0; lastImg="";
  quizSection.style.display="none";
  startBtn.disabled=false; resetBtn.disabled=true;
  updateHUD(); setFeedback("", true); noteImage.src="";
};

/* ===== ENVOI SCORE (optionnel) ===== */
function envoyerScore() {
  var prenom = document.getElementById("prenom").value.trim();
  var nom = document.getElementById("nom").value.trim();
  var prof = document.getElementById("prof").value.trim();
  var confirmation = document.getElementById("confirmation");
  var loadingMessage = document.getElementById("loading-message");

  if (!prenom || !nom || !prof) {
    confirmation.style.color = "red";
    confirmation.textContent = "Merci de remplir tous les champs.";
    return;
  }

  var pct = Math.round( (good / Math.max(1, (good+bad))) * 100 );
  var score20 = Math.round( (pct/100) * 20 );

  loadingMessage.style.display="block";
  confirmation.textContent="";

  var data = new URLSearchParams();
  data.append("prenom", prenom);
  data.append("nom", nom);
  data.append("prof", prof);
  data.append("exercice", "Lecture de notes");
  data.append("type", "Entrainement");
  data.append("niveau", "melange_cles"); // libellé pour ta feuille
  data.append("score20", score20);
  data.append("scorePct", pct);

  fetch(APPS_SCRIPT_URL, { method:"POST", body:data })
    .then(function(){
      loadingMessage.style.display="none";
      confirmation.style.color="green";
      confirmation.textContent="✅ Score envoyé au professeur !";
    })
    .catch(function(){
      loadingMessage.style.display="none";
      confirmation.style.color="red";
      confirmation.textContent="❌ Une erreur est survenue pendant l'envoi.";
    });
}

/* ===== Raccourcis clavier (comme tes défis) ===== */
document.addEventListener('keydown', function(ev){
  if(!running) return;
  var t = (ev.target && ev.target.tagName || '').toLowerCase();
  if (t==='input' || t==='select' || t==='textarea') return;

  var k = ev.key ? ev.key.toLowerCase() : '';
  var map = {c:'Do', d:'Ré', e:'Mi', f:'Fa', g:'Sol', a:'La', b:'Si'};
  var nom = map[k];
  if(!nom) return;

  var btns = gameContainer.querySelectorAll('button');
  for (var i=0;i<btns.length;i++){
    if (btns[i].textContent === nom){ btns[i].click(); break; }
  }
});

