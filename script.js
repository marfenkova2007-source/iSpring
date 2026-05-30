var GAME = {
    width: 1366,
    height: 768,
}

var BOARD = {
    x: 433,
    y: 134,
    width: 500,
    height: 500,
    color: "blue"
}

var BOX = {
    width: 95,
    height: 95,
    color: "white",
}

var gameState = {
    openedCards: [],
    matchedPairs: [],
    imagesLoaded: false,
    cards: Array(25).fill(false),
    background: null,
    waiting: false,
    newlyMatched: [],
    gameStarted: false,
    timeLeft: 120,
    timerInterval: null
};

var canvas = document.getElementById('canvas');
canvas.width = GAME.width;
canvas.height = GAME.height;
var canvasContext = canvas.getContext('2d');
var startButton = document.getElementById('startButton');
var timerElement = document.getElementById('timer');

function loadBackground() {
    gameState.background = new Image();
    gameState.background.src = 'back.png';
    gameState.background.onload = function() {
        drawBoard();
        makemaspictures();
    };
}

function drawBoard() {
    if (gameState.background) {
        canvasContext.drawImage(gameState.background, 0, 0, GAME.width, GAME.height);
    }

    canvasContext.fillStyle = BOARD.color;
    canvasContext.fillRect(BOARD.x, BOARD.y, BOARD.width, BOARD.height);

    for (let i = 0; i < 25; i++) {
        drawBox(i);
    }

    if (gameState.gameStarted && startButton.style.display === 'none') {
        if (gameState.matchedPairs.length === 24) {
            drawCenteredText("You are win!", "green");
        } else if (gameState.timeLeft <= 0) {
            drawCenteredText("You are lose", "red");
        }
    }
}

function drawCenteredText(text, color) {
    canvasContext.fillStyle = color;
    canvasContext.font = "48px Arial";
    canvasContext.textAlign = "center";
    canvasContext.fillText(text, GAME.width / 2, GAME.height / 2);
}

function drawBox(id) {
    const x = 2.5 * (id % 5 + 1) + BOARD.x + BOX.width * (id % 5) + 2.5 * (id % 5);
    const y = BOARD.y + 2.5 * (Math.floor(id/5) + 1) + 2.5 * (Math.floor(id/5)) + BOX.height * (Math.floor(id/5));

    canvasContext.fillStyle = BOX.color;
    canvasContext.fillRect(x, y, BOX.width, BOX.height);

    if (gameState.newlyMatched.includes(id)) {
        if (itog_pictures[id]) {
            canvasContext.drawImage(itog_pictures[id], x, y, BOX.width, BOX.height);
        }
    }
    else if (gameState.cards[id] && !gameState.matchedPairs.includes(id)) {
        if (itog_pictures[id]) {
            canvasContext.drawImage(itog_pictures[id], x, y, BOX.width, BOX.height);
        }
    }
    else if (!gameState.matchedPairs.includes(id)) {
        var klever = new Image();
        klever.src = 'clever.png';
        canvasContext.drawImage(klever, x, y, BOX.width, BOX.height);
    }
}

function updateGame() {
    canvasContext.clearRect(0, 0, GAME.width, GAME.height);
    drawBoard();
}

function startGame() {
    gameState = {
        openedCards: [],
        matchedPairs: [],
        imagesLoaded: gameState.imagesLoaded,
        cards: Array(25).fill(false),
        background: gameState.background,
        waiting: false,
        newlyMatched: [],
        gameStarted: true,
        timeLeft: 120,
        timerInterval: null
    };
    
    startButton.style.display = 'none';
    timerElement.style.display = 'block';
    
    gameState.timerInterval = setInterval(function() {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            setTimeout(() => {
                startButton.style.display = 'block';
                startButton.textContent = 'Начать заново';
                timerElement.style.display = 'none';
            }, 500);
        }
        
        if (gameState.matchedPairs.length === 24) {
            clearInterval(gameState.timerInterval);
            setTimeout(() => {
                startButton.style.display = 'block';
                startButton.textContent = 'Начать заново';
                timerElement.style.display = 'none';
            }, 500);
        }
    }, 1000);
    
    updateTimerDisplay();
    play();
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function play() {
    updateGame();
    if (gameState.gameStarted && gameState.timeLeft > 0 && gameState.matchedPairs.length < 24) {
        requestAnimationFrame(play);
    }
}

const pictures = ['pen.png','heart.png', 'books.png', 'kitten.png', 'ball.png', 'musik.png', 'cake.png', 'dog.png', 'sun.png', 'table.png', 'phone.png', 'shoes.png', 'apple.png'];
const names_pictures = [];
for (let i = 0; i < 12; i++) {
    names_pictures.push(pictures[i]);
    names_pictures.push(pictures[i]);
}
names_pictures.push(pictures[12]);
const itog_pictures = Array(25).fill(null);

function makemaspictures() {
    shuffle(names_pictures);
    let loadedCount = 0;

    for (let i = 0; i < names_pictures.length; i++) {
        const p = new Image();
        p.src = names_pictures[i];
        p.onload = () => {
            itog_pictures[i] = p;
            loadedCount++;

            if (loadedCount === names_pictures.length) {
                gameState.imagesLoaded = true;
            }
        };
    }
}

function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

canvas.addEventListener('mousedown', function(e) {
    if (!gameState.gameStarted || !gameState.imagesLoaded || gameState.waiting || 
        gameState.openedCards.length >= 2 || gameState.timeLeft <= 0 ||
        gameState.matchedPairs.length === 24) return;

    const [x, y] = getCursorPosition(canvas, e);

    for (let id = 0; id < 25; id++) {
        const boxX = 2.5 * (id % 5 + 1) + BOARD.x + BOX.width * (id % 5) + 2.5 * (id % 5);
        const boxY = BOARD.y + 2.5 * (Math.floor(id/5) + 1) + 2.5 * (Math.floor(id/5)) + BOX.height * (Math.floor(id/5));

        if (x >= boxX && x <= boxX + BOX.width && 
            y >= boxY && y <= boxY + BOX.height) {

            if (gameState.matchedPairs.includes(id) || gameState.openedCards.includes(id)) {
                continue;
            }

            gameState.cards[id] = true;
            gameState.openedCards.push(id);

            if (gameState.openedCards.length === 2) {
                const [id1, id2] = gameState.openedCards;
                if (names_pictures[id1] === names_pictures[id2]) {
                    gameState.newlyMatched.push(id1, id2);
                    gameState.openedCards = [];
                    
                    setTimeout(() => {
                        gameState.matchedPairs.push(id1, id2);
                        gameState.newlyMatched = gameState.newlyMatched.filter(
                            item => item !== id1 && item !== id2
                        );
                    }, 500);
                } else {
                    gameState.waiting = true;
                    setTimeout(() => {
                        gameState.cards[id1] = false;
                        gameState.cards[id2] = false;
                        gameState.openedCards = [];
                        gameState.waiting = false;
                    }, 1000);
                }
            }

            break;
        }
    }
});

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return [x, y];
}

startButton.addEventListener('click', startGame);
loadBackground();