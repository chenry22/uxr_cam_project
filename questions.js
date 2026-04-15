const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

const questions = [
    "What color do you feel like at the moment?",
    "Please choose a shape you most identify with right now.",
    "Share some reflections from your museum visit today (these will not be shared with other visitors):",
    "What state are you from?",
    "Choose an object you're drawn to:",
    "How many times have you visited CAM before?",
    "Finish creating your self portrait!",
    "Are you sure you're finished?"
];

const defaultColors = ['#000000', "#ffffff", "#E6E6E6", '#FF2B01', '#00aeef'];

const maxShapesAddable = 5;
var shapesRemaining;

var question = 0;
var personalColor = '';
var personalShape = '';
var reflection = '';
var state = null;
var object = null;
var previousVisits = -1;

var characterImgURL;

window.addEventListener('load', () => {
    shapesRemaining = maxShapesAddable
    setShapeCountLabel();
    loadStateOptions();
    loadQuestion(question);
    loadColors();

    document.getElementById('state').addEventListener("keydown", function (e) {
        if (e.key === 'Enter') {
            autocompleteState();
        }
    });
});

function questionMode() {
    document.getElementById('creation-container').classList.add('hidden');
    document.getElementById('question-container').classList.remove('hidden');
}

function creationMode() {
    document.getElementById('question-container').classList.add('hidden');
    document.getElementById('creation-container').classList.remove('hidden');
}

function loadQuestion(i) {
    let prompt = document.getElementById('prompt');
    prompt.textContent = questions[i];

    switch(i) {
        case 0: // color
            document.getElementById("color-pick").classList.remove('hidden');
            break;
        case 1: // shape
            document.getElementById("color-pick").classList.add('hidden');

            // randomize shape order
            var shapes = document.getElementById('shapes');
            var count = shapes.children.length;
            var divs = [...shapes.children];
            shapes.innerHTML = '';
            for (let i = 0; i < count; i++) {
                shapes.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
            }
            document.getElementById("shapes").classList.remove('hidden');
            break;
        case 2: // reflect
            document.getElementById("shapes").classList.add('hidden');
            document.getElementById("reflection").classList.remove('hidden');
            break;
        case 3: // state
            document.getElementById("reflection").classList.add('hidden');
            document.getElementById("state-response").classList.remove('hidden');
            break;
        case 4: // object
            document.getElementById("state-response").classList.add('hidden');

            // randomize object order
            var objects = document.getElementById('objects');
            var count = objects.children.length;
            var divs = [...objects.children];
            objects.innerHTML = '';
            for (let i = 0; i < count; i++) {
                objects.append(divs.splice(Math.floor(Math.random() * divs.length), 1)[0]);
            }
            document.getElementById("objects").classList.remove('hidden');
            break;
        case 5: // prev visits
            document.getElementById("objects").classList.add('hidden');
            document.getElementById('previous-visits').classList.remove('hidden');
            break;
        case 6: // full screen of character creator, prompt to create
            document.getElementById('complete-confirm').classList.add('hidden');
            document.getElementById('previous-visits').classList.add('hidden');
            document.getElementsByClassName('next')[0].classList.add('hidden');
            document.getElementById('finish-character').classList.remove('hidden');
            break;
        case 7: // confirmation
            document.getElementById('finish-character').classList.add('hidden');
            document.getElementById('complete-confirm').classList.remove('hidden');
            break;
        case 8: // final comment
            break;
    }
}

function submitResponse() {
    switch(question) {
        case 0: // color
            personalColor = document.getElementById('color-pick').value;
            document.documentElement.style.setProperty("--main-color", personalColor);
            
            // generate 5 variants of color and add these to swatch container
            addPersonalColors();
            break;
        case 1: // shape
            if (personalShape === '') { return; }
            switch (personalShape) {
                case 'square':
                    drawables.push(drawable(200, 200, 'rect', personalColor, { w: 150, h: 150}));
                    break;
                case 'circle':
                    drawables.push(drawable(200, 200, 'ellipse', personalColor, { w: 150, h: 150 }));
                    break;
                case 'triangle':
                    drawables.push(drawable(200, 200, 'triangle', personalColor, { w: 120, h: 120 }));
                    break;
                case 'star':
                    drawables.push(drawable(200, 200, 'star', personalColor, { pts: 5, r1: 40, r2: 100 }));
                    break;
                case 'rect':
                    drawables.push(drawable(200, 200, 'rect', personalColor, { w: 200, h: 100 }));
                    break;
                case 'oval':
                    drawables.push(drawable(200, 200, 'ellipse', personalColor, { w: 200, h: 100 }));
                    break;
            }
            break;
        case 2: // reflect
            // basically longer reflection means shape with more sides
            reflection = document.getElementById('reflection').getElementsByTagName('textarea')[0].value;
            if (reflection.length >= 120) {
                // drawables.push(drawable(200, 200, 'hexagon', personalColor, { w: 150, h: 150 }));
            } else if (reflection.length >= 90) {
                // drawables.push(drawable(200, 200, 'pentagon', personalColor, { w: 150, h: 150 }));
            } else if (reflection.length >= 60) {
                drawables.push(drawable(200, 200, 'rect', personalColor, { w: 150, h: 150 }));
            } else if (reflection.length >= 30) {
                drawables.push(drawable(200, 200, 'triangle', personalColor, { w: 150, h: 150 }));
            } else {
                drawables.push(drawable(200, 200, 'ellipse', personalColor, { w: 150, h: 150 }));
            }
            break;
        case 3: // state
            if (state === null) { return; }
        
            var w, h, largerSide = 250;
            var aspectRatio = state.width / state.height;
            if (state.width > state.height) {
                w = largerSide;
                h = w / aspectRatio;
            } else {
                h = largerSide;
                w = h * aspectRatio;
            }
            
            state.resize(w * 2, h * 2);
            state.filter(THRESHOLD); // basically turns it white
            drawables.push(drawable(150, 150, 'image', personalColor, { img: state, w: w, h: h }));
            break;
        case 4: // object
            if (object === null) { return; }

            var w, h, largerSide = 200;
            var aspectRatio = object.width / object.height;
            if (object.width > object.height) {
                w = largerSide;
                h = w / aspectRatio;
            } else {
                h = largerSide;
                w = h * aspectRatio;
            }
            
            object.resize(w * 2, h * 2);
            drawables.push(drawable(150, 150, 'image', '', { img: object, w: w, h: h }));
            break;
        case 5: // prev visits
            if (previousVisits < 0) { return; }
            drawables.push(drawable(200, 200, 'star', personalColor, { pts: 4 + previousVisits, r1: 40, r2: 100 }));
            break;
        case 6: // initial completion confirm
            editingEnabled = false;
            break;
        case 8: // final comment, export everything and load
            break;
    }
    loadQuestion(++question);
}

function shapeResponse(shape) {
    personalShape = shape;
    for(var s of document.getElementById('shapes').getElementsByClassName('shape')) {
        s.classList.remove('selected');
    }
    document.getElementById('shapes').getElementsByClassName(shape)[0].classList.add('selected');
}

function loadStateOptions() {
    let stateList = document.getElementById('states');
    for (var state of states) {
        let opt = document.createElement('option');
        opt.value = state;
        stateList.appendChild(opt);
    }
}
function autocompleteState(e) {
    let s = document.getElementById('state').value + '';
    for (var state of states) {
        if (state.toLowerCase().startsWith(s.toLowerCase())) {
            console.log(state);
            document.getElementById('state').value = state;
            return;
        }
    }
}
function stateResponse() {
    let s = document.getElementById('state').value + '';
    s = s.split(' ').map((word) => {
        if (word !== 'of') {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
    }).join(' ');

    if (states.includes(s)) {
        let svgContainer = document.getElementById('state-preview');
        state = loadImage('assets/state_svgs/' + s.replaceAll(' ', '_') + '.svg');
        let stateSvg = 'assets/state_svgs/' + s.replaceAll(' ', '_') + '.svg';
        document.getElementById('state-error').classList.add('hidden');

        fetch(stateSvg).then(res => res.text())
            .then(svg => {
                svgContainer.innerHTML = svg;
                const svgEl = svgContainer.querySelector("svg");
                svgEl.style.color = personalColor;
                svgEl.querySelectorAll("*").forEach(el => {
                    el.style = '';
                    el.setAttribute("fill", "currentColor");
                    el.setAttribute('stroke', 'currentColor');
                });

                document.getElementById('state-preview').classList.remove('hidden');
            });
    } else {
        document.getElementById('state-preview').classList.add('hidden');
        document.getElementById('state-error').classList.remove('hidden');
    }
}

function objectResponse(objID) {
    // preload image
    object = loadImage('assets/objects/' + objID + '.png'); 
    for(var s of document.getElementsByClassName('object')) {
        s.classList.remove('selected-obj');
    }
    document.getElementsByClassName(objID)[0].classList.add('selected-obj');
}

function visitResponse() {
    let visits = parseInt(document.getElementById('visits').value);
    if (isNaN(visits) || visits < 0) {
        previousVisits = -1;
        document.getElementById('visits-error').classList.remove('hidden');
    } else {
        previousVisits = visits;
        document.getElementById('visits-error').classList.add('hidden');
    }
}

function backToEditing() {
    editingEnabled = true;
    loadQuestion(--question);
}

function submitCharacter() {
    const character = document.getElementById("character-canvas").getElementsByTagName('canvas')[0];
    characterImgURL = character.toDataURL(); // convert to PNG?
    localStorage.setItem('characterURL', characterImgURL);
}

// helper func
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}



// CREATION MODE
function setShapeCountLabel() {
    document.getElementById('shape-count').innerText = shapesRemaining + '/' + maxShapesAddable + '  shapes available';
}

function addShape(type) {
    if (shapesRemaining <= 0) { return; }
    if (type === 'circle') {
        drawables.push(drawable(200, 200, 'ellipse', personalColor, { w: 150, h: 150, deletable: true }));
        shapesRemaining--;
    } else if (type === 'triangle') {
        drawables.push(drawable(200, 200, 'triangle', personalColor, { w: 120, h: 120, deletable: true }));
        shapesRemaining--;
    } else if (type === 'rect') {
        drawables.push(drawable(200, 200, 'rect', personalColor, { w: 200, h: 100, deletable: true }));
        shapesRemaining--;
    } else if (type === 'oval') {
        drawables.push(drawable(200, 200, 'ellipse', personalColor, { w: 200, h: 100, deletable: true }));
        shapesRemaining--;
    }
    setShapeCountLabel();
}

function loadColors() {
    let colors = document.getElementById('color-swatches');
    for (var color of defaultColors) {
        let c = document.createElement('div');
        c.classList.add('color');
        c.style.setProperty('background-color', color);
        c.setAttribute('onclick', "setColor('" + color + "')");
        colors.append(c);
    }
}

function addPersonalColors() {
    var amt = -30;
    var shift = 15
    for (let i = 0; i < 5; i++) {
        let color = shadeColor(personalColor, amt);
        let c = document.createElement('div');
        c.classList.add('color');
        c.style.setProperty('background-color', color);
        c.setAttribute('onclick', "setColor('" + color + "')");
        document.getElementById('color-swatches').append(c);
        amt += shift;
    }
}

// Source - https://stackoverflow.com/a/13532993
// Posted by Pablo, modified by community. See post 'Timeline' for change history
// Retrieved 2026-04-14, License - CC BY-SA 4.0
// for getting darker + lighter versions of the main color selected
function shadeColor(color, percent) {
    var R = parseInt(color.substring(1,3),16);
    var G = parseInt(color.substring(3,5),16);
    var B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    R = Math.round(R)
    G = Math.round(G)
    B = Math.round(B)

    var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}
