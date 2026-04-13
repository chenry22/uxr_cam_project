const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

let questions = [
    "What color do you feel like at the moment?",
    "Please choose a shape you most identify with right now.",
    "Share some reflections from your museum visit today:",
    "What state are you from?",
    "Choose an object you're drawn to:",
    "How many times have you visited CAM before?",
    "Finish creating your self portrait!",
    "Are you sure you're finished?",
    "Leave a comment for other visitors! (optional)"
];

let defaultColors = ['#ffffff', '#D42C41', '#3AC242', '#4A6EE0', '#FFF07A', '#FAA441', '#8F3287'];

var question = 0;
var personalColor = '';
var personalShape = '';
var reflection = '';
var state = null;
var object = null;
var previousVisits = -1;

var characterImgURL;

window.addEventListener('load', () => {
    loadStateOptions();
    loadQuestion(question);
    loadColors();
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
            
            // add to swatches list
            let c = document.createElement('div');
            c.classList.add('color');
            c.style.setProperty('background-color', personalColor);
            c.setAttribute('onclick', "setColor('" + personalColor + "')");
            document.getElementById('color-swatches').append(c);
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
                drawables.push(drawable(200, 200, 'hexagon', personalColor, { w: 150, h: 150 }));
            } else if (reflection.length >= 90) {
                drawables.push(drawable(200, 200, 'pentagon', personalColor, { w: 150, h: 150 }));
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
    for(var s of document.getElementsByClassName('shape')) {
        s.classList.remove('selected');
    }
    document.getElementsByClassName(shape)[0].classList.add('selected');
}

function loadStateOptions() {
    let stateList = document.getElementById('states');
    for (var state of states) {
        let opt = document.createElement('option');
        opt.value = state;
        stateList.appendChild(opt);
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
    // basically flatten canvas element... maybe just turn into PNG?
    // then upload to DB (with comment and maybe behavior pattern)

    const character = document.getElementById("character-canvas").getElementsByTagName('canvas')[0];
    characterImgURL = character.toDataURL(); // convert to PNG?

    document.addEventListener('mousemove', (e) => {
        console.log('move', e.clientX, e.clientY);
        let character = document.getElementById('character-img');
        character.style.left = e.clientX - 80 + 'px';
        character.style.top = e.clientY - 90 + 'px';
    });

    document.getElementById('character-img').setAttribute('src', characterImgURL);
    document.getElementById('main').classList.add('hidden');
    document.getElementById('map-place').classList.remove('hidden');
    document.getElementsByClassName('character')[0].classList.remove('hidden');
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