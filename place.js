const rooms = ['cam', 'lobby', 'gallery-1', 'gallery-2', 'gallery-3', 'cafe', 'courtyard'];
var roomImgs = {};

var activeRoom = '';
var backgroundImg;
var prevAvatars = [];
const backgroundImageHeightPct = 0.78;

let x = 300, y = 0, w = 0, h = 0, mouseOffsetX = 0, mouseOffsetY = 0;
var character = null;
var moving = false;
var helperText = true;
var movementEnabled = true;

function preload() {
    for (var room of rooms) {
        roomImgs[room] = loadImage('assets/rooms/' + room + '.jpg');
        roomImgs[room].resize(windowWidth, windowHeight);
    }
    activeRoom = 'cam';

    let url = localStorage.getItem('characterURL');
    if (url) {
        character = loadImage(url);
    }
}

function setup() {
    y = windowHeight * 3 / 5;
    w = windowWidth / 5;
    h = windowWidth / 2.5;

    let storageStr = localStorage.getItem('avatars') ?? '';
    for (var entry of storageStr.split('||')) {
        if (entry.trim() === '') { continue; }
        var data = entry.split(';;');
        let img = loadImage(data[0].trim());
        prevAvatars.push({ img, x: parseFloat(data[1]), y: parseFloat(data[2]), comment: data[3], room: data[4], showComment: false })
    }

    let canvas = createCanvas(windowWidth, windowHeight * backgroundImageHeightPct);
    canvas.parent('place-canvas');
    rectMode(CENTER);
    imageMode(CENTER);
    textAlign(CENTER, CENTER);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight * 0.8);
}

function draw() {
    clear();
    image(roomImgs[activeRoom], windowWidth / 2, windowHeight * backgroundImageHeightPct / 2, 
        windowWidth, windowHeight, 0, 0, 0, 0, COVER);

    for (var a of prevAvatars) {
        if (a.room === activeRoom) {
            image(a.img, a.x, a.y, w, h, 0, 0, 0, 0, CONTAIN);
            if (a.showComment) {
                rect(a.x + w/2, a.y - h/5, 100, 60);
                text(a.comment, a.x + w/2, a.y - h/5, 100, 60);
            }
        }
    }

    if (character) {
        image(character, x, y, w, h, 0, 0, 0, 0, CONTAIN);
        if (helperText) {
            push();
            textSize(14);
            fill(255);
            strokeWeight(4);
            stroke(0);
            text('Click and drag your character to move it!', x - w / 2, y, 150);
            pop();
        }
    }
}

function touchStarted() {
    if (!movementEnabled) { return; }

    let interact = mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;
    if (interact) {
        moving = true;
        mouseOffsetX = x - mouseX;
        mouseOffsetY = y - mouseY;
        helperText = false;
    } else {
        moving = false;

        // check overlap with current avatars, show comment
        for (var a of prevAvatars) {
            if (a.room === activeRoom && mouseX > a.x - w/2 && mouseX < a.x + w/2 && mouseY > a.y - h/2 && mouseY < a.y + h/2){
                a.showComment = !a.showComment;
            }
        }
    }
}
function touchMoved(e) {
    if (moving) {
        x = Math.max(w / 7, Math.min(windowWidth + w / 6 , mouseX + mouseOffsetX));
        y = Math.min(windowHeight - h / 5, Math.max(mouseY + mouseOffsetY, windowHeight * 3 / 7));
    }
}



window.addEventListener('load', () => {
    for (var room of rooms) {
        if (room === 'cam') { continue; } // don't allow nav back...

        let container = document.createElement('div');
        let thumbnail = document.createElement('img');
        thumbnail.src = 'assets/rooms/' + room + '.jpg';
        container.append(thumbnail);
        container.classList.add('room');
        container.id = room;

        let r = room;
        container.onclick = () => setActiveRoom(r);
        document.getElementById('place-thumbnails').append(container);
    }
});

function enterBuilding() {
    document.getElementById('enter-cam').classList.add('hidden');
    document.getElementById('intro-instruct').classList.add('hidden');
    document.getElementById('place-nav').classList.remove('hidden');
    setActiveRoom('lobby');
}
function setActiveRoom(r) {
    activeRoom = r;
    for (var roomBlock of document.getElementsByClassName('room')) {
        roomBlock.classList.remove('active-room');
    }
    document.getElementById(r).classList.add('active-room');
}

function placeCharacter() {
    movementEnabled = false;
    moving = false;
    helperText = false;
    document.getElementById('place-nav').classList.add('hidden');
    document.getElementById('add-comment').classList.remove('hidden');
    document.getElementById('comment-input').style.left = x  + (w / 3) + 'px';
    document.getElementById('comment-input').style.top = y - (h / 3) + 'px';
}
function backToPlace() {
    movementEnabled = true;
    document.getElementById('place-nav').classList.remove('hidden');
    document.getElementById('add-comment').classList.add('hidden');
}

function completeCreation() {
    // save image
    let storageStr = localStorage.getItem('avatars') ?? '';
    let img = localStorage.getItem('characterURL') ?? '';
    let comment = document.getElementById('comment-input').getElementsByTagName('input')[0].value;
    storageStr += `||${img};;${x};;${y};;${comment};;${activeRoom}`
    localStorage.setItem('avatars', storageStr);

    document.getElementById('add-comment').classList.add('hidden');
    document.getElementById('outro').classList.remove('hidden');
}
function backToMain() {
    window.location.href = 'index.html';
}