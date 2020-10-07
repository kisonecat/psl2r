var canvas;
var ctx;

let points;
points = [];
points.push( {x: 1,y:1 } );
points.push( {x: -1, y:1});

function geodesic(p,q) {
  let px = p.x;
  let py = p.y;
  let qx = q.x;
  let qy = q.y;

  let c = (px**2 + py**2 - qx**2 - qy**2)/(2*(px - qx));
  let r = Math.sqrt(px**4 + 2*px**2*py**2 - 4*px*qx**3 + py**4 + qx**4 + 2*qx**2*(3*px**2 + py**2) - 4*qx*(px**3 + px*py**2) + qy**4 + 2*qy**2*(px**2 - 2*px*qx - py**2 + qx**2))/(2*Math.abs(px - qx));
  return {r:r, c:c};
}

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

  let g = geodesic( points[0], points[1] );
  ctx.beginPath();
  ctx.strokeStyle = '#00F';
  ctx.lineWidth = 3*pixels;
  ctx.arc(g.c, 0, g.r, 0, Math.PI);
  ctx.stroke();
  
  points.forEach( (p) => {
    ctx.beginPath();
    ctx.fillStyle = "#0A0";
    ctx.arc(p.x, p.y, 8*pixels, 0, 2*Math.PI);
    ctx.fill();
  });
}

function mousemove(e)
{
  if (e.buttons) {
    mousedown(e);
  }
}

function mousedown(event)
{
  let p = canvas.relMouseCoords(event);
  let q = toCoordinates(p);

  points.sort( function(a,b) {
    return ((a.x - q.x)*(a.x - q.x) + (a.y - q.y)*(a.y - q.y)) -
      ((b.x - q.x)*(b.x - q.x) + (b.y - q.y)*(b.y - q.y));
  });
  points.shift();    
  points.push( q );
  draw();
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
  }

  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();

  canvas.addEventListener("mousemove",mousemove,false);
  canvas.addEventListener("mousedown",mousedown,false);
});

