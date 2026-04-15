const rooms = ['lobby', 'gallery-1', 'gallery-2', 'gallery-3', 'cafe', 'courtyard'];
var roomImgs = {};
var backgroundImg;
const backgroundImageHeightPct = 0.75;

let x = 400, y = 0, w = 0, h = 0, mouseOffsetX = 0, mouseOffsetY = 0;
var character;
var moving = false;

function preload() {
    character = loadImage(localStorage.getItem('characterURL'));
    for (var room of rooms) {
        roomImgs[room] = loadImage('assets/rooms/' + room + '.jpg');
        roomImgs[room].resize(windowWidth, windowHeight);
    }
    backgroundImg = loadImage('assets/rooms/cam.jpg');
    backgroundImg.resize(windowWidth, windowHeight);
}

function setup() {
    y = windowHeight * 3 / 5;
    w = windowWidth / 5;
    h = windowWidth / 2.5;
    character = loadImage(localStorage.getItem('characterURL'));
    let canvas = createCanvas(windowWidth, windowHeight * backgroundImageHeightPct);
    canvas.parent('place-canvas');
    imageMode(CENTER);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight * 0.8);
}

function draw() {
    clear();
    image(backgroundImg, windowWidth / 2, windowHeight * backgroundImageHeightPct / 2, 
        windowWidth, windowHeight * backgroundImageHeightPct, 0, 0, 0, 0, COVER);
    image(character, x, y, w, h, 0, 0, 0, 0, CONTAIN);
}

function touchStarted() {
    let interact = mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;
    if (interact) {
        moving = true;
        mouseOffsetX = x - mouseX;
        mouseOffsetY = y - mouseY;
    } else {
        moving = false;
    }
}
function touchMoved(e) {
    if (moving) {
        x = mouseX + mouseOffsetX;
        y = mouseY + mouseOffsetY;
    }
}



window.addEventListener('load', () => {
    for (var room of rooms) {
        let container = document.createElement('div');
        let thumbnail = document.createElement('img');
        thumbnail.src = 'assets/rooms/' + room + '.jpg';
        container.append(thumbnail);
        document.getElementById('place-thumbnails').append(container);
    }
});