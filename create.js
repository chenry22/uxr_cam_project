const bgColor = '#f2fffe';

let selectionPadding = 10;
var mouseStart = [0, 0];

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


function drawable(x, y, type, color, data) {
    return ({
        x: x, y: y, 
        type: type, 
        color: color,
        data: data, 
        moving: false,
        selected: false,
        draw: function() {
            switch (type) {
                case 'circle':
                    fill(color);
                    circle(this.x, this.y, this.data.r * 2);
                    if (this.selected) {
                        drawingContext.setLineDash([5, 5]);
                        stroke(20, 60, 200, 100);
                        fill(255, 0);
                        rect(this.x - this.data.r - selectionPadding, this.y - this.data.r - selectionPadding, 
                            this.data.r * 2 + selectionPadding * 2, this.data.r * 2 + selectionPadding * 2);
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
                        rect(this.x - selectionPadding, this.y - selectionPadding, 
                            this.data.w + selectionPadding * 2, this.data.h + selectionPadding * 2);
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
                        rect(this.x - selectionPadding, this.y - selectionPadding, 
                            this.data.r2 * 2 + selectionPadding * 2, this.data.r2 * 2 + selectionPadding * 2);
                        fill(255);
                        stroke(0);
                        drawingContext.setLineDash([]);
                    }
                    break;
                case 'image':
                    tint(personalColor);
                    image(this.data.img, this.x, this.y, this.data.w, this.data.h);
                    noTint();

                    if (this.selected) {
                        drawingContext.setLineDash([5, 5]);
                        stroke(20, 60, 200, 100);
                        fill(255, 0);
                        rect(this.x - this.data.w / 2 - selectionPadding, this.y - this.data.h / 2 - selectionPadding, 
                            this.data.w + selectionPadding * 2, this.data.h + selectionPadding * 2);
                        fill(255);
                        stroke(0);
                        drawingContext.setLineDash([]);
                    }
                    break;
                default:
                    fill(color);
                    square(this.x, this.y, 10);
                    break;
            }
        },
    })
}

var drawables = [];

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('character-canvas');
    pixelDensity(1);
    angleMode(DEGREES);
    imageMode(CENTER);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(bgColor);
    for (i in drawables) {
        drawables[i].draw();
    }
}

function touchStarted(e) {
    // if interacting with canvas element, get that canvas element
    mouseStart = [mouseX, mouseY];
    for (i in drawables) {
        let d = drawables[drawables.length - i - 1];
        switch (d.type) {
            case 'circle':
                if(dist(d.x, d.y, mouseX, mouseY) < d.data.r && !d.moving) {
                    drawables = drawables.filter(item => {
                        return item !== d;
                    });
                    d.moving = true;
                    drawables.push(d);
                    return; // early terminate, only one thing can be moved 
                }
                break;
            case 'rect':
                if(mouseX > d.x && mouseX < d.x + d.data.w && mouseY > d.y && mouseY < d.y + d.data.h && !d.moving) {
                    drawables = drawables.filter(item => {
                        return item !== d;
                    });
                    d.moving = true;
                    drawables.push(d);
                    return; // early terminate, only one thing can be moved 
                }
                break;
            case 'image':
                if(mouseX > d.x - d.data.w / 2 && mouseX < d.x + d.data.w / 2 && mouseY > d.y - d.data.h / 2 && mouseY < d.y + d.data.h / 2 && !d.moving) {
                    drawables = drawables.filter(item => {
                        return item !== d;
                    });
                    d.moving = true;
                    drawables.push(d);
                    return; // early terminate, only one thing can be moved 
                }
                break;
        }
    }
}

function touchEnded() {
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
    for (i in drawables) {
        let d = drawables[i];
        if (d.moving) {
            switch (d.type) {
                case 'circle':
                    drawables[i].x = mouseX;
                    drawables[i].y = mouseY;
                    break;
                case 'rect':
                    drawables[i].x = mouseX - d.data.w / 2.0;
                    drawables[i].y = mouseY - d.data.h / 2.0;
                    break;
                case 'star':
                    drawables[i].x = mouseX - d.data.r2 / 2.0;
                    drawables[i].y = mouseY - d.data.r2 / 2.0;
                    break;
                case 'image':
                    drawables[i].x = mouseX;
                    drawables[i].y = mouseY;
                    break;
            }
        }
    }
}