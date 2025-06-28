document.addEventListener('DOMContentLoaded', function() {
    // Noms des notes repères
    const notesRepaires = ['Do4', 'Do3', 'Sol4', 'Fa3'];
    const noteToImage = {
        'Do4': 'C4.png',
        'Do3': 'C3.png',
        'Sol4': 'G4.png',
        'Fa3': 'F3.png'
    };

    const simplifiedButtonNames = ['Do', 'Sol', 'Fa'];

    const gameContainer = document.getElementById('game-container');
    const noteImage = document.getElementById('note-image');
    const feedback = document.getElementById('feedback');
    const progressBar = document.getElementById('progress-bar');
    const scoreDisplay = document.getElementById('score-display');
    let currentNote = '';
    let score = 0;
    let questionCount = 0;
    const totalQuestions = 20; // Nombre total de questions

    // Fonction pour choisir une note aléatoire
    function getRandomNote() {
        const randomIndex = Math.floor(Math.random() * notesRepaires.length);
        return notesRepaires[randomIndex];
    }

    // Fonction pour mettre à jour l'image de la note affichée
    function updateNoteDisplay() {
        currentNote = getRandomNote();
        const imageFileName = noteToImage[currentNote];
        const imagePath = `Images/ut3/${imageFileName}`;
        noteImage.src = imagePath;
        noteImage.alt = currentNote;
    }

    // Fonction pour créer les boutons des notes
    function createNoteButtons() {
        gameContainer.innerHTML = ''; // Vider le contenu précédent
        simplifiedButtonNames.forEach(buttonName => {
            const button = document.createElement('button');
            button.textContent = buttonName;
            button.onclick = function() {
                checkAnswer(buttonName);
            };
            gameContainer.appendChild(button);
        });
    }

    // Fonction pour vérifier la réponse
    function checkAnswer(selectedButton) {
        // Vérifie si la note actuelle est un "Do" lorsque "Do" est sélectionné
        const isCorrect = checkIfCorrect(selectedButton, currentNote);

        if (isCorrect) {
            feedback.textContent = 'Correct!';
            feedback.style.color = 'green';
            score++;
        } else {
            feedback.textContent = 'Incorrect. Essayez encore.';
            feedback.style.color = 'red';
        }

        questionCount++;
        updateProgressBar();

        if (questionCount < totalQuestions) {
            updateNoteDisplay(); // Recharger une nouvelle note après chaque réponse
        } else {
            endGame();
        }
    }

    // Fonction pour vérifier si la réponse est correcte
    function checkIfCorrect(selectedButton, currentNote) {
        // Pour "Do", nous vérifions si c'est Do4 ou Do3
        if (selectedButton === 'Do' && (currentNote === 'Do4' || currentNote === 'Do3')) {
            return true;
        }
        // Pour les autres notes, la correspondance est directe (sans le numéro)
        return selectedButton === currentNote.replace(/[0-9]/g, '');
    }

    // Fonction pour mettre à jour la barre de progression
    function updateProgressBar() {
        const progress = (questionCount / totalQuestions) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${questionCount}/${totalQuestions}`;
    }

    // Fonction pour terminer le jeu et afficher le score final
    function endGame() {
        scoreDisplay.textContent = `Score final : ${score}/${totalQuestions}`;
        feedback.textContent = ''; // Efface le feedback précédent

        // Désactiver les boutons après la fin du jeu
        const buttons = document.querySelectorAll('#game-container button');
        buttons.forEach(button => {
            button.onclick = null; // Désactiver les clicks
        });
    }

    // Initialiser le jeu
    updateNoteDisplay();
    createNoteButtons();
});
