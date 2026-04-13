const bgColor = '#f2fffe';
var floorOne, floorTwo, characterImg;

const selectionPadding = 15;
const imageOutlineWidth = 1;
const scaleRate = 1.5, rotateRate = 30;
const minSize = 30, maxSize = 400;
var mouseStart = [0, 0];
var lastMouse = [0, 0];
var editingEnabled = true;
var mode = 'move-mode';
var visPoint = [0, 0];

// Source - https://stackoverflow.com/a/79284189
// Posted by Jasper
// Retrieved 2026-04-08, License - CC BY-SA 4.0
function star(x, y, num_points, inner_radius, outer_radius) {
    const angle = 2 * Math.PI / num_points; // angle between two points
    const halfAngle = angle / 2.0; // angle between point and valley
    
    beginShape();
    for (let a = 0; a < Math.PI * 2; a += angle) {
        let sx = x + Math.cos(a) * outer_radius;
        let sy = y + Math.sin(a) * outer_radius;
        vertex(sx, sy); // vertex at point of star

        sx = x + Math.cos(a + halfAngle) * inner_radius;
        sy = y + Math.sin(a + halfAngle) * inner_radius;
        vertex(sx, sy); // vertex at valley
    }
    endShape(CLOSE);
}

function pointInEllipse(x, y, pX, pY, w, h) {
    let theta = Math.atan2(h * (pY - y), w * (pX - x));
    let distance = (Math.pow((pX - x) * Math.cos(theta) + (pY - y) * Math.sin(theta), 2) / Math.pow(w, 2)) + 
                   (Math.pow((pX - x) * Math.sin(theta) - (pY - y) * Math.cos(theta), 2) / Math.pow(h, 2));
    return distance <= 1;
}

// helper func from p5.js sketch: https://editor.p5js.org/tinywitchdraws/sketches/XExU8uTPN
function pointInTriangle(p, t0, t1, t2) {
    let dX = p[0] - t2[0];
    let dY = p[1] - t2[1];
    let dX21 = t2[0] - t1[0];
    let dY12 = t1[1] - t2[1];
    let D = dY12 * (t0[0] - t2[0]) + dX21 * (t0[1] - t2[1]);
    let s = dY12 * dX + dX21 * dY;
    let t = (t2[1] - t0[1]) * dX + (t0[0] - t2[0]) * dY;

    if (D < 0) {
        return s <= 0 && t <= 0 && s + t >= D;
    }
    return s >= 0 && t >= 0 && s + t <= D;
}

// helper func to get angle between AB and BC vectors
function findAngle(A, B, C) {
    // Vectors BA and BC
    const v1 = { x: A.x - B.x, y: A.y - B.y };
    const v2 = { x: C.x - B.x, y: C.y - B.y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const cross = v1.x * v2.y - v1.y * v2.x;
    return Math.atan2(cross, dot); // radians
}





function drawable(x, y, type, color, data) {
    return ({
        x: x, y: y, rotation: 0,
        mouseOffsetX: 0, mouseOffsetY: 0,
        type: type, 
        color: color,
        data: data, 
        moving: false,
        selected: false,
        draw: function() {
            translate(this.x, this.y);
            rotate(this.rotation);
            translate(-this.x, -this.y);

            switch (type) {
                case 'ellipse':
                    fill(color);
                    ellipse(this.x, this.y, this.data.w, this.data.h);
                    if (this.selected) {
                        drawingContext.setLineDash([5, 5]);
                        stroke(20, 60, 200, 100);
                        fill(255, 0);
                        rect(this.x, this.y, this.data.w + selectionPadding * 2, this.data.h + selectionPadding * 2);
                        fill(255);
                        stroke(0);
                        drawingContext.setLineDash([]);
                    }
                    break;
                case 'rect':
                    fill(color);
                    rect(this.x, this.y, this.data.w, this.data.h);
                    if (this.selected) {
                        drawingContext.setLineDash([5, 5]);
                        stroke(20, 60, 200, 100);
                        fill(255, 0);
                        rect(this.x, this.y, this.data.w + selectionPadding * 2, this.data.h + selectionPadding * 2);
                        fill(255);
                        stroke(0);
                        drawingContext.setLineDash([]);
                    }
                    break;
                case 'star':
                    fill(color);
                    star(this.x, this.y, this.data.pts, this.data.r1, this.data.r2)
                    if (this.selected) {
                        drawingContext.setLineDash([5, 5]);
                        stroke(20, 60, 200, 100);
                        fill(255, 0);
                        rect(this.x, this.y, this.data.r2 * 2 + selectionPadding * 2, this.data.r2 * 2 + selectionPadding * 2);
                        fill(255);
                        stroke(0);
                        drawingContext.setLineDash([]);
                    }
                    break;
                case 'triangle':
                    fill(color);
                    triangle(
                        -this.data.w / 2 + this.x, this.data.h / 2 + this.y, 
                        this.x, -this.data.h / 2 + this.y, 
                        this.data.w / 2 + this.x, this.data.h / 2 + this.y
                    );
                    if (this.selected) {
                        drawingContext.setLineDash([5, 5]);
                        stroke(20, 60, 200, 100);
                        fill(255, 0);
                        rect(this.x, this.y, this.data.w + selectionPadding * 2, this.data.h + selectionPadding * 2);
                        fill(255);
                        stroke(0);
                        drawingContext.setLineDash([]);
                    }
                    break;
                case 'image':
                    tint('black')
                    image(this.data.img, this.x, this.y, 
                        this.data.w + imageOutlineWidth * 2, this.data.h + imageOutlineWidth * 2);
                    tint(this.color);
                    image(this.data.img, this.x, this.y, this.data.w, this.data.h);
                    noTint();

                    if (this.selected) {
                        drawingContext.setLineDash([5, 5]);
                        stroke(20, 60, 200, 100);
                        fill(255, 0);
                        rect(this.x, this.y, this.data.w + selectionPadding * 2, this.data.h + selectionPadding * 2);
                        fill(255);
                        stroke(0);
                        drawingContext.setLineDash([]);
                    }
                    break;
                default:
                    fill(color);
                    square(this.x, this.y, 50);
                    break;
            }

            // undo rotation for the other shapes
            translate(this.x, this.y);
            rotate(-this.rotation);
            translate(-this.x, -this.y);
        },
    })
}

var drawables = [];

function setup() {
    let canvas = createCanvas(windowWidth * 0.5, windowHeight);
    canvas.parent('character-canvas');
    pixelDensity(1);
    angleMode(DEGREES);
    imageMode(CENTER);
    rectMode(CENTER) 
    strokeWeight(0.5);
}

function windowResized() {
    resizeCanvas(windowWidth * 0.5, windowHeight);
}

function draw() {
    clear();
    for (i in drawables) {
        drawables[i].draw();
    }

    // circle(visPoint[0], visPoint[1], 10);
}

function touchStarted(e) {
    if (!editingEnabled) { return; }

    // if interacting with canvas element, get that canvas element
    mouseStart = [mouseX, mouseY];
    lastMouse = mouseStart;
    for (i in drawables) {
        let d = drawables[drawables.length - i - 1];

        // offset point to MINUS rotation to check if within bounds still...
        console.log(mouseX, mouseY);
        let dx = mouseX - d.x, dy = mouseY - d.y;
        let cos = Math.cos(-d.rotation * (Math.PI / 180)), sin = Math.sin(-d.rotation * (Math.PI / 180));
        let x = d.x + dx * cos - dy * sin, y = d.y + dx * sin + dy * cos
        console.log(x, y);
        visPoint = [x, y];

        let circleInteract = d.type === 'ellipse' && pointInEllipse(d.x, d.y, x, y, d.data.w / 2, d.data.h / 2);
        let rectInteract = d.type === 'rect' && x > d.x - d.data.w / 2 && x < d.x + d.data.w / 2 && y > d.y - d.data.h / 2 && y < d.y + d.data.h / 2;
        let starInteract = d.type === 'star' && dist(d.x, d.y, x, y) < d.data.r2;
        let triInteract = d.type === 'triangle' && pointInTriangle([x, y], [-d.data.w / 2 + d.x, d.data.h / 2 + d.y], [d.x, -d.data.h / 2 + d.y], [d.data.w / 2 + d.x, d.data.h / 2 + d.y]);
        let imgInteract = d.type === 'image' && x > d.x - d.data.w / 2 && x < d.x + d.data.w / 2 && y > d.y - d.data.h / 2 && y < d.y + d.data.h / 2;

        if (!d.moving && (circleInteract || rectInteract || starInteract || triInteract || imgInteract)) {
            drawables = drawables.filter(item => {
                return item !== d;
            });
            d.moving = true;
            d.mouseOffsetX = d.x - mouseX;
            d.mouseOffsetY = d.y - mouseY;
            drawables.push(d);
            return; // early terminate, only one thing can be moved
        }
    }
}

function touchEnded() {
    if (mouseX > windowWidth / 2) { return; }

    var newSelect = false;
    for (i in drawables) {
        // if hovered over and released 
        if (newSelect) {
            drawables[i].selected = false;
        } else if (drawables[i].moving && dist(mouseStart[0], mouseStart[1], mouseX, mouseY) < 0.5) {
            drawables[i].selected = !drawables[i].selected;
            newSelect = true;
            for (let j = 0; j < i; j++) {
                drawables[j].selected = false;
            }
        }
        drawables[i].moving = false;
    }
    if (!newSelect) {
        for (i in drawables) {
            drawables[i].selected = false;
        }
    }
}

function touchMoved(e) {
    if (mode === 'move-mode') {
        for (i in drawables) {
            let d = drawables[i];
            if (d.moving) {
                drawables[i].x = mouseX + d.mouseOffsetX;
                drawables[i].y = mouseY + d.mouseOffsetY;
            }
        }
    } else if (mode === 'scale-mode') {
        for (i in drawables) {
            let d = drawables[i];
            if (d.moving) {
                let scaleAmount = dist(lastMouse[0], lastMouse[1], mouseX, mouseY);
                let scaleDir = dist(d.x, d.y, lastMouse[0], lastMouse[1]) < 
                    dist(d.x, d.y, mouseX, mouseY) ? 1 : -1;
                scaleAmount *= scaleDir * scaleRate;

                if (d.type === 'star') {
                    let aspectRatio = d.data.r2 / d.data.r1;
                    d.data.r1 += scaleAmount;
                    d.data.r1 = Math.min(maxSize, Math.max(minSize, d.data.r1));
                    d.data.r2 = d.data.r1 * aspectRatio;
                } else {
                    let aspectRatio = d.data.h / d.data.w;
                    d.data.w += scaleAmount;
                    d.data.w = Math.min(maxSize, Math.max(minSize, d.data.w));
                    d.data.h = d.data.w * aspectRatio
                }
                lastMouse = [mouseX, mouseY]
                return;
            }
        }
    } else if (mode === 'rotate-mode') {
        for (i in drawables) {
            let d = drawables[i];
            if (d.moving) {
                let a = findAngle(
                    { x: lastMouse[0], y: lastMouse[1] },
                    { x: d.x, y: d.y },
                    { x: mouseX, y: mouseY },
                );
                d.rotation += a * rotateRate;
                d.rotation = d.rotation % 360;
                lastMouse = [mouseX, mouseY]
                return;
            }
        }
    }
}

function setColor(color) {
    for (i in drawables) {
        let d = drawables[i];
        if (d.selected) {
            drawables[i] = drawable(d.x, d.y, d.type, color, d.data);
            drawables[i].rotation = d.rotation;
            drawables[i].selected = true;
            console.log(drawables);
            return;
        }
    }
}

function changeMode(mode) {
    if (!document.getElementById(mode).classList.contains('active-mode')) {
        document.getElementById('move-mode').classList.remove('active-mode');
        document.getElementById('scale-mode').classList.remove('active-mode');
        document.getElementById('rotate-mode').classList.remove('active-mode');
        document.getElementById(mode).classList.add('active-mode');
        this.mode = mode;
    }
}