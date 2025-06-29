// Niveau 2 - Logique spécifique pour la génération des notes

document.addEventListener('DOMContentLoaded', function() {
    // Notes repères
    const referenceNotes = ['C4', 'C3', 'G4', 'F3'];

    // Mappage des notes aux images
    const noteToImage = {
        'C4': 'C4.png',
        'D4': 'D4.png',
        'B3': 'B3.png',
        'C3': 'C3.png',
        'G4': 'G4.png',
        'F4': 'F4.png',
        'E4': 'E4.png',
        'F3': 'F3.png',
        'G3': 'G3.png',
        'E3': 'E3.png',
        'D3': 'D3.png'
    };

    // Noms simplifiés des boutons de notes
    const simplifiedButtonNames = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];

    // Variables pour le quiz
    let score = 0;
    let questionCount = 0;
    const totalQuestions = 20; // Nombre total de questions
    let currentNote = '';
    let lastNoteWasReference = false; // Pour suivre si la dernière note était une note repère

    // Éléments DOM
    const gameContainer = document.getElementById('game-container');
    const noteImage = document.getElementById('note-image');
    const feedback = document.getElementById('feedback');
    const scoreDisplay = document.getElementById('score-display');
    const progressBar = document.getElementById('progress-bar');

    // Fonction pour obtenir une note repère aléatoire
    function getRandomReferenceNote() {
        const randomIndex = Math.floor(Math.random() * referenceNotes.length);
        return referenceNotes[randomIndex];
    }

    // Fonction pour obtenir une note adjacente
    function getAdjacentNote(note) {
        const noteOrder = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4'];
        const currentIndex = noteOrder.indexOf(note);
        const direction = Math.random() < 0.5 ? -1 : 1;
        const nextIndex = currentIndex + direction;

        // Gérer les limites du tableau
        if (nextIndex < 0 || nextIndex >= noteOrder.length) {
            return note; // Rester sur la même note si on dépasse les limites
        }

        return noteOrder[nextIndex];
    }

    // Fonction pour mettre à jour l'affichage de la note
    function updateNoteDisplay() {
        if (!lastNoteWasReference) {
            // Sélectionner une note repère
            currentNote = getRandomReferenceNote();
            lastNoteWasReference = true;
        } else {
            // Sélectionner une note adjacente
            currentNote = getAdjacentNote(currentNote);
            lastNoteWasReference = false;
        }
        noteImage.src = `Images/ut3/${noteToImage[currentNote]}`;
        noteImage.alt = currentNote;
    }

    // Fonction pour créer les boutons de notes
    function createNoteButtons() {
        gameContainer.innerHTML = ''; // Effacer les boutons précédents

        simplifiedButtonNames.forEach(note => {
            const button = document.createElement('button');
            button.textContent = note;
            button.onclick = function() {
                checkAnswer(note);
            };
            gameContainer.appendChild(button);
        });
    }

    // Fonction pour vérifier la réponse
    function checkAnswer(selectedNote) {
        const noteNames = {
            'C4': 'Do',
            'D4': 'Re',
            'B3': 'Si',
            'C3': 'Do',
            'G4': 'Sol',
            'F4': 'Fa',
            'E4': 'Mi',
            'F3': 'Fa',
            'G3': 'Sol',
            'E3': 'Mi',
            'D3': 'Re'
        };

        const currentNoteName = noteNames[currentNote];

        if (selectedNote === currentNoteName) {
            score++;
            feedback.textContent = 'Correct!';
            feedback.style.color = 'green';
        } else {
            feedback.textContent = `Incorrect. La bonne réponse était ${currentNoteName}.`;
            feedback.style.color = 'red';
        }

        questionCount++;
        updateProgressBar();

        if (questionCount < totalQuestions) {
            updateNoteDisplay(); // Afficher la nouvelle note
        } else {
            endGame();
        }
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
        feedback.textContent = '';
        document.getElementById('end-buttons').style.display = 'block';

        // Désactiver les boutons après la fin du jeu
        const buttons = document.querySelectorAll('#game-container button');
        buttons.forEach(button => {
            button.onclick = null;
        });
    }

    // Gérer le clic sur le bouton pour démarrer le quiz
    document.getElementById('start-quiz').addEventListener('click', function() {
        document.getElementById('note-reference').style.display = 'none';
        document.getElementById('quiz-section').style.display = 'block';
        updateNoteDisplay();
        createNoteButtons();
    });
});
