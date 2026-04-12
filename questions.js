const states = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

let questions = [
    "What color do you feel like at the moment?",
    "Please choose a shape you most identify with right now.",
    "Share some reflections from your museum visit today:",
    "What state are you from?",
    "Choose an object you're drawn to:",
    "How many times have you visited CAM before?",
    "Finish creating your self portrait...",
    "Leave a comment for other visitors! (optional)"
];

var question = 0;
var personalColor = '';
var personalShape = '';
var reflection = '';
var state = null;

window.addEventListener('load', () => {
    loadStateOptions();
    loadQuestion(question);
});

function loadQuestion(i) {
    let prompt = document.getElementById('prompt');
    prompt.textContent = questions[i];

    switch(i) {
        case 0: // color
            document.getElementById("color-pick").classList.toggle('hidden');
            break;
        case 1: // shape
            document.getElementById("color-pick").classList.toggle('hidden');
            document.getElementById("shapes").classList.toggle('hidden');
            break;
        case 2: // reflect
            document.getElementById("reflection").classList.toggle('hidden');
            document.getElementById("shapes").classList.toggle('hidden');
            break;
        case 3: // state
            document.getElementById("reflection").classList.toggle('hidden');
            document.getElementById("state-response").classList.toggle('hidden');
            break;
        case 4: // object
            break;
        case 5: // prev visits
            break;
        case 6: // full screen of character creator, prompt to create
            break;
        case 7: // final comment
            break;
    }
}

function submitResponse() {
    switch(question) {
        case 0: // color
            personalColor = document.getElementById('color-pick').value;
            document.documentElement.style.setProperty("--main-color", personalColor);
            break;
        case 1: // shape
            if (personalShape === '') { return; }
            switch (personalShape) {
                case 'square':
                    drawables.push(drawable(200, 200, 'rect', personalColor, { w: 150, h: 150}));
                    break;
                case 'circle':
                    drawables.push(drawable(200, 200, 'circle', personalColor, { r: 100 }));
                    break;
                case 'triangle':
                    drawables.push(drawable(200, 200, 'triangle', personalColor, { w: 100, h: 100 }));
                    break;
                case 'star':
                    drawables.push(drawable(200, 200, 'star', personalColor, { pts: 5, r1: 40, r2: 100 }));
                    break;
                case 'rect':
                    drawables.push(drawable(200, 200, 'rect', personalColor, { w: 200, h: 100 }));
                    break;
                case 'oval':
                    drawables.push(drawable(200, 200, 'oval', personalColor, { w: 200, h: 100 }));
                    break;
            }
            break;
        case 2: // reflect
            // basically longer reflection means shape with more sides
            reflection = document.getElementById('reflection').getElementsByTagName('textarea')[0].value;
            if (reflection.length >= 200) {
                drawables.push(drawable(200, 200, 'hexagon', personalColor, { w: 150, h: 150 }));
            } else if (reflection.length >= 150) {
                drawables.push(drawable(200, 200, 'pentagon', personalColor, { w: 150, h: 150 }));
            } else if (reflection.length >= 100) {
                drawables.push(drawable(200, 200, 'rect', personalColor, { w: 150, h: 150 }));
            } else if (reflection.length >= 50) {
                drawables.push(drawable(200, 200, 'triangle', personalColor, { w: 200, h: 100 }));
            } else {
                drawables.push(drawable(200, 200, 'circle', personalColor, { r: 100 }));
            }
            break;
        case 3: // state
            if (state === null) { return; }
        
            let h = 250;
            let aspectRatio = state.width / state.height;
            let w = h * aspectRatio;
            
            state.resize(w, h);
            state.filter(THRESHOLD); // basically turns it white
            drawables.push(drawable(150, 150, 'image', personalColor, { img: state, w: w, h: h }))
            break;
        case 4: // object
            break;
        case 5: // prev visits
            break;
        case 6: // full screen of character creator, prompt to create
            break;
        case 7: // final comment
            break;
    }
    loadQuestion(++question);
}

function shapeResponse(shape) {
    personalShape = shape;
    
    for(var s of document.getElementsByClassName('shape')) {
        s.classList.remove('selected');
    }
    document.getElementsByClassName(shape)[0].classList.add('selected')
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

function submitCharacter() {
    // basically flatten canvas element... maybe just turn into PNG?
    // then upload to DB (with comment and maybe behavior pattern)
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