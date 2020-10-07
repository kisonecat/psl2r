var canvasUHP;
var canvasPD;
var ctxPD;
var ctxUHP;

let points = [];

function pd2uhp(p) {
  let x = p.x;
  let y = p.y;

  let d = (x**2 + (y-1)**2);
  let u = 2*x/d;
  let v = (1 - x**2 - y**2)/d;
  
  return {x:u, y:v};
}

function uhp2pd(p) {
  let x = p.x;
  let y = p.y;

  let d = (x**2 + y**2 + 2*y + 1) 
  let u = 2*x/d
  let v = (x**2 + y**2 - 1)/d;

  return {x:u, y:v};
}

function geodesic(p,q) {
  let px = p.x;
  let py = p.y;
  let qx = q.x;
  let qy = q.y;

  let c = (px**2 + py**2 - qx**2 - qy**2)/(2*(px - qx));
  let r = Math.sqrt(px**4 + 2*px**2*py**2 - 4*px*qx**3 + py**4 + qx**4 + 2*qx**2*(3*px**2 + py**2) - 4*qx*(px**3 + px*py**2) + qy**4 + 2*qy**2*(px**2 - 2*px*qx - py**2 + qx**2))/(2*Math.abs(px - qx));
  return {r:r, c:c};
}

function drawSegment(p,q) {
  if (p.x > q.x) {
    let r = { x: q.x, y: q.y };
    q = p;
    p = r;
  }
  
  let g = geodesic( p, q );
  a = Math.atan2( p.y, p.x - g.c );
  b = Math.atan2( q.y, q.x - g.c );
  ctx.arc(g.c, 0, g.r, b, a );
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

function involution(p) {
  let x = p.x;
  let y = p.y;
  let m = new DOMMatrix([
    x/y,
    -(x**2/y) - y,
    1/y,
    -(x/y),
    0, 0
  ]);

  return m;
}

function applyMatrix(theMatrix, p ) {
  let a = theMatrix.a;
  let b = theMatrix.b;
  let c = theMatrix.c;
  let d = theMatrix.d;  

  let x = p.x;
  let y = p.y;
 
  let denom = (c*c*x*x + c*c*y*y + 2*c*d*x + d*d);
    
  let newX = (a*c*x*x + a*c*y*y + b*c*x + a*d*x + b*d)/denom;
  let newY = (-b*c*y + a*d*y)/denom;

  return {x: newX, y: newY};
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

function toCoordinates(ctx, p) {
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
  ctxUHP.resetTransform();
  ctxUHP.translate( canvasUHP.width/2,
                 19 * canvasUHP.height / 20 );

  viewportWidth = 16;
  let gridspacing = canvasUHP.width / viewportWidth;
  
  viewportHeight = 19 * canvasUHP.height / 20 / gridspacing;

  pixels = viewportWidth / canvasUHP.width;
  
  ctxUHP.transform(gridspacing, 0, 0, -gridspacing, 0, 0);

  ctxPD.resetTransform();
  ctxPD.translate( canvasPD.width/2,
                   canvasPD.height/2 );
  let scale = Math.min(0.95 * canvasPD.width/2,0.95 * canvasPD.height/2);
  ctxPD.transform( scale, 0, 0, scale, 0, 0 );

}

function draw() {
  ////////////////////////////////////////////////////////////////
  // background for UHP
  
  ctxUHP.fillStyle = "#FEFEFE";
  ctxUHP.fillRect(-canvasUHP.width/2, -canvasUHP.height/20, canvasUHP.width, 2*canvasUHP.height);
  
  for(var i=0; i < Math.ceil(viewportHeight); i++ ) {
    ctxUHP.beginPath();
    ctxUHP.strokeStyle = '#DDD';
    ctxUHP.lineWidth = pixels;    
    ctxUHP.moveTo(-viewportWidth/2, i);
    ctxUHP.lineTo( viewportWidth/2, i);
    ctxUHP.stroke();
  }  
  
  for(var i=Math.floor(-viewportWidth); i<=Math.ceil(viewportWidth); i++ ) {
    ctxUHP.beginPath();
    ctxUHP.strokeStyle = '#DDD';
    ctxUHP.lineWidth = pixels;
    ctxUHP.moveTo(i, -viewportHeight);
    ctxUHP.lineTo(i,  viewportHeight);
    ctxUHP.stroke();
  }

  ctxUHP.beginPath();
  ctxUHP.strokeStyle = '#888';
  ctxUHP.lineWidth = 3*pixels;
  ctxUHP.moveTo(0,  viewportHeight);
  ctxUHP.lineTo(0, -viewportHeight);
  ctxUHP.stroke();  

  ctxUHP.beginPath();
  ctxUHP.strokeStyle = '#888';
  ctxUHP.lineWidth = 3*pixels;
  ctxUHP.moveTo(-viewportWidth/2, 0);
  ctxUHP.lineTo( viewportWidth/2, 0);
  ctxUHP.stroke();

  ctxUHP.beginPath();
  ctxUHP.strokeStyle = "rgba(0,0,0,0.1)";
  ctxUHP.lineWidth = 3*pixels;
  let firstUHP = true;
  points.forEach( (p) => {
    if (firstUHP) {
      ctxUHP.moveTo(p.x, p.y);
      firstUHP = false;
    } else {
      ctxUHP.lineTo(p.x, p.y);
    }
  });
  ctxUHP.stroke();
  
  points.forEach( (p) => {
    ctxUHP.beginPath();
    ctxUHP.fillStyle = "rgba(0,0,0,0.5)";
    ctxUHP.arc(p.x, p.y, 3*pixels, 0, 2*Math.PI);
    ctxUHP.fill();
  });
  
  ////////////////////////////////////////////////////////////////
  // background for PD
  ctxPD.fillStyle = "#F5F5F5";
  ctxPD.fillRect(-canvasPD.width/2, -canvasPD.height/20, canvasPD.width, 2*canvasPD.height);

  ctxPD.beginPath();
  ctxPD.fillStyle = '#FFF';
  ctxPD.arc(0, 0, 1, 0, 2*Math.PI);
  ctxPD.fill();

  ctxPD.beginPath();
  ctxPD.strokeStyle = '#888';
  let px = 2.0/canvasPD.width;
  ctxPD.lineWidth = px;
  ctxPD.arc(0, 0, 1, 0, 2*Math.PI);
  ctxPD.stroke();

  ctxPD.beginPath();
  ctxPD.strokeStyle = "rgba(0,0,0,0.1)";
  ctxPD.lineWidth = 3*px;
  let firstPD = true;
  points.forEach( (p) => {
    let q = uhp2pd( p );
    if (firstPD) {
      ctxPD.moveTo(q.x, q.y);
      firstPD = false;
    } else {
      ctxPD.lineTo(q.x, q.y);
    }
  });
  ctxPD.stroke();
  
  points.forEach( (p) => {
    ctxPD.beginPath();
    ctxPD.fillStyle = "rgba(0,0,0,0.5)";
    let q = uhp2pd( p );
    ctxPD.arc(q.x, q.y, 3*px, 0, 2*Math.PI);
    ctxPD.fill();
  });

}

function mousemoveUHP(event)
{
  let p = canvasUHP.relMouseCoords(event);
  let q = toCoordinates(ctxUHP, p);
  if (q.y < 0) q.y = 0;

  if (points.length > 20)
    points.shift();  
  
  points.push( q );
  
  draw();
}

function mousemovePD(event)
{
  let p = canvasPD.relMouseCoords(event);
  let r = toCoordinates(ctxPD, p);
  let q = pd2uhp(r);

  if (q.y < 0) q.y = 0;
  
  if (points.length > 20)
    points.shift();  
  
  points.push( q );
  
  draw();

}

window.addEventListener('DOMContentLoaded', (event) => {
  canvasPD = document.getElementById('disk');
  canvasUHP = document.getElementById('uhp');

  ctxPD = canvasPD.getContext('2d');
  ctxUHP = canvasUHP.getContext('2d');

  function resizeCanvas() {
    canvasPD.width = window.innerWidth/2;
    canvasPD.height = window.innerHeight;
    canvasUHP.width = window.innerWidth/2;
    canvasUHP.height = window.innerHeight;

    canvasUHP.style.position = 'fixed';
    canvasUHP.style.top = 0;
    canvasUHP.style.left = 0;
    
    canvasPD.style.position = 'fixed';
    canvasPD.style.top = 0;
    canvasPD.style.left = (window.innerWidth / 2).toString() + 'px';
    
    init();
    draw();
  }

  window.addEventListener('resize', resizeCanvas, false);
  resizeCanvas();

  canvasUHP.addEventListener("mousemove",mousemoveUHP,false);
  canvasPD.addEventListener("mousemove",mousemovePD,false);

});

