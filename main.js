var canvas;
var ctx;

var kanTheta = 0;
let kanA = 1;
let kanN = 1;

let testPoint = { x: -1, y: 2 };

function sl2r(theta, r, x) {
  r = r / 4;
  x = x / 4;
  
  let K = new DOMMatrix([
    Math.cos(theta),
    -Math.sin(theta),
    Math.sin(theta),
    Math.cos(theta),
    0, 0
  ]);
  
  let A = new DOMMatrix([
    r, 0,
    0, 1/r,
    0, 0
  ]);

  let result = new DOMMatrix([
    1, x,
    0, 1,
    0, 0
  ]);

  result.preMultiplySelf(A);
  result.preMultiplySelf(K);

  return result;
}

function updateMatrix() {
  let theMatrix = sl2r( kanTheta, kanA, kanN );

  let a = theMatrix.a;
  let b = theMatrix.b;
  let c = theMatrix.c;
  let d = theMatrix.d;
  
  m11 = document.getElementById('m11');
  m12 = document.getElementById('m12');
  m21 = document.getElementById('m21');
  m22 = document.getElementById('m22');
  trace = document.getElementById('trace');  

  m11.innerText = a.toString();
  m12.innerText = b.toString();
  m21.innerText = c.toString();
  m22.innerText = d.toString();

  trace.innerText = (a+d).toString();  
}

function relMouseCoords(event){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent)

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

  return {x:canvasX, y:canvasY};
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function toCoordinates(p) {
  let matrix = ctx.getTransform();
  matrix.invertSelf()
  let pt = new DOMPoint(p.x, p.y);
  let transformedPoint = pt.matrixTransform(matrix);
  return {x: transformedPoint.x,
          y: transformedPoint.y};
}

let viewportWidth = 16;
let viewportHeight = 9;
let pixels = 1;

function init() {
  ctx.resetTransform();
  ctx.translate( canvas.width/2,
                 19 * canvas.height / 20 );

  viewportWidth = 16;
  let gridspacing = canvas.width / viewportWidth;
  
  viewportHeight = 19 * canvas.height / 20 / gridspacing;

  pixels = viewportWidth / canvas.width;
  
  ctx.transform(gridspacing, 0, 0, -gridspacing, 0, 0);
}

function drawIterates(theMatrix, color) {
  let a = theMatrix.a;
  let b = theMatrix.b;
  let c = theMatrix.c;
  let d = theMatrix.d;  

  let trace = a + d;
  
  let x = testPoint.x;
  let y = testPoint.y;

  console.log(trace);

  iterations = 20;
  for( var i = 0; i<iterations; i++ ) {
    let radius = 2*pixels;
    ctx.beginPath();
    ctx.lineWidth = 1 * pixels;
    var opacity = Math.pow((iterations - i)/iterations, 0.8);
    ctx.fillStyle = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + opacity + ")";
    ctx.fill();

    ctx.arc(x, y, radius, 0, 2*Math.PI);
    ctx.fill();

    let denom = (c*c*x*x + c*c*y*y + 2*c*d*x + d*d);
    
    let newX = (a*c*x*x + a*c*y*y + b*c*x + a*d*x + b*d)/denom;
    let newY = (-b*c*y + a*d*y)/denom;

    x = newX;
    y = newY;

    if (y < 0.001) return;
  }
}

function draw() {
  ctx.fillStyle = "#FEFEFE";
  ctx.fillRect(-canvas.width/2, -canvas.height/20, canvas.width, 2*canvas.height);
  
  for(var i=0; i < Math.ceil(viewportHeight); i++ ) {
    ctx.beginPath();
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = pixels;    
    ctx.moveTo(-viewportWidth/2, i);
    ctx.lineTo( viewportWidth/2, i);
    ctx.stroke();
  }  
  
  for(var i=Math.floor(-viewportWidth); i<=Math.ceil(viewportWidth); i++ ) {
    ctx.beginPath();
    ctx.strokeStyle = '#DDD';
    ctx.lineWidth = pixels;
    ctx.moveTo(i, -viewportHeight);
    ctx.lineTo(i,  viewportHeight);
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3*pixels;
  ctx.moveTo(0,  viewportHeight);
  ctx.lineTo(0, -viewportHeight);
  ctx.stroke();  

  ctx.beginPath();
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 3*pixels;
  ctx.moveTo(-viewportWidth/2, 0);
  ctx.lineTo( viewportWidth/2, 0);
  ctx.stroke();  
  
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#000000";

  let angleX = kanN;
  let angleY = kanA;
  let angleR = 10 * pixels;
  ctx.beginPath();
  ctx.strokeStyle = '#080';
  ctx.lineWidth = 1*pixels;  
  ctx.arc(angleX, angleY, angleR, 0, 2*Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = '#0A0';
  ctx.lineWidth = 5 * pixels;
  ctx.arc(angleX, angleY, angleR, 0, kanTheta);
  ctx.stroke();

  let theMatrix = sl2r( kanTheta, kanA, kanN );
  drawIterates(theMatrix, {red:0,green:0,blue:255});  
  
  theMatrix.invertSelf();
  drawIterates(theMatrix, {red:255,green:0,blue:0});
}

function mousemove(event)
{
  let p = canvas.relMouseCoords(event);
  let q = toCoordinates(p);

  if (event.buttons > 0)
    mousedown(event);
  else {
    testPoint = q;
    if (testPoint.y <= 0)
      testPoint.y = 0;

    draw();
  }
}

function mousedown(event)
{
  let p = canvas.relMouseCoords(event);
  let q = toCoordinates(p);

  kanN = q.x;
  kanA = q.y;
  if (q.y <= 0)
    kanA = 0;

  draw();
  updateMatrix();
}

function wheel(event)
{
  kanTheta -= event.deltaY * 0.001;
  kanTheta = kanTheta % (2*Math.PI);

  if (Math.abs(kanTheta) < 0.05)
    kanTheta = 0;
  
  draw();
  updateMatrix();
}

window.addEventListener('DOMContentLoaded', (event) => {
  canvas = document.getElementById('canvas');
  console.log(canvas);
  ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    init();
    draw();
    updateMatrix();
  }

  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();

  canvas.addEventListener("mousemove",mousemove,false);
  canvas.addEventListener("mousedown",mousedown,false);
  canvas.addEventListener("wheel",wheel, false);
});

