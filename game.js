/*global Image*/
/*global boi*/
/*global levelList*/

//set up the canvas
var canvas = document.createElement("canvas");
canvas.id = "game";
var ctx = canvas.getContext("2d");
canvas.width = 320;
canvas.height = 320;
document.body.appendChild(canvas);

//background image
var bgPNG = new Image();
bgPNG.src = "sprites/background32.gif";
bgPNG.onload = function(){
  ctx.drawImage(bgPNG, 0, 0);
};

//level
var map = [];

//pre-set map
map = [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];


var rows;
var cols;
var tiles = new Image();
tiles.src = "sprites/tiles32.png";
var tilesReady = false;
tiles.onload = function(){
  tilesReady = true;
};

//level objects
function levelDat(name, mapName, boiX, boiY){
    this.name = name;
    this.mapName = mapName;
    this.boiX = boiX;
    this.boiY = boiY;
}

var levelList = [
    new levelDat("Default", "default", 1,3)
];

//camera
var camera = {
  x : 0,
  y : 0
};

//colliding variables
var pixX;
var pixY;
var nextX;
var nextY;
var colTileX = 0;
var colTileY = 0;

//boi image properties
var boiIMG = new Image();
boiIMG.src = "sprites/ramboi.png";
var boiReady = false;
boiIMG.onload = function(){boiReady = true;};

var boi = {
  name : "boi",
  //movement
  speed : 2,
  x : 0, 
  y : 0,
  velX : 0,
  velY : 0,
  friction: 0.85,
  jump: -7.75,
  //properties
  width : 32,
  height : 32,
  dir : "right",
  action: "idle",
  img : boiIMG,
  ready : boiReady,
  fps : 4,  //frame speed
  fpr : 4,  //# of frames per row
  show : true,
  
  //animation
  idleRight : [0,0,0,0],
  idleLeft : [7,7,7,7],
  runRight : [1,2,3,2],
  runLeft : [6,5,4,5],
  jumpRight : [2,2,2,2],
  jumpLeft : [5,5,5,5],
  curFrame : 0,
  ct : 0
};

//physics
var gravity = 0.5;
var hasGravity = true;
var jumped = false;
var canJump = false;

//controls
var control = "ai";


//////////////////////////////////////////      FUNCTIONS     //////////////////////////////////////

var mapUpload = [];
function loadLevel(levelName){
  //import level
  var client = new XMLHttpRequest();
  client.open('GET', '/levels/' + levelName +'.txt');
  client.onreadystatechange = function(){
    mapUpload = client.responseText.split("\n");
    map = makeMap(mapUpload);
    //console.log(levelName + ": " + map[0]);
  };
  
  client.send();
}

function nextLevel(levelName){
  var aLevel;
  console.log("NEXT LEVEL: " + levelName);
  
  //look for correct level
  for(var a = 0; a < levelList.length; a++){
    if(levelList[a].name == levelName){
      aLevel = levelList[a];
      //console.log("level found");
    }
  }
  
  //get boi and map info
  var fileName = aLevel.mapName;
  var bx = aLevel.boiX;
  var by = aLevel.boiY;
  loadLevel(fileName);
  
  //reset the level
  resetLevel(bx*32,by*32);
}

//external map selection
function getLevel(e){
  var levelTxt = document.getElementById('levelSelect');
  if(levelTxt.files && levelTxt.files[0]){
    var reader = new FileReader();
    reader.onload = function(e){
      //alert("NEW LEVEL!");
      mapUpload = e.target.result.split("\n");
      map = makeMap(mapUpload);
      resetLevel(5*32,5*32);
    };
    reader.readAsText(levelTxt.files[0]);
  }
}

//draw the map
function makeMap(level){
  var newMap = [];
  
  rows = level.length;
  cols = level[0].length;
  
  for(var i = 0; i < level.length; i++){
    var cells = level[i].split(",");    //get each row
    for(var a = 0; a < cells.length; a++){
      cells[a] = parseInt(cells[a]);
    }
    
    newMap.push(cells);
  }
  return newMap;
}


/////////////////////////DRAWING AND RENDERING//////////////////////////
function Animation(image, sequence, fps, fpr, w, h){
  var ct = 0;
  var curFrame = 0;
  
  this.update = function(){
    //update the frames
    if(ct == (fps - 1))
      curFrame = (curFrame + 1) % sequence.length;
      
    ct = (ct + 1) % fps;
  };
  this.draw = function(x,y){
    //get the row and col of the current frame
    var row = Math.floor(sequence[curFrame] / fpr);
    var col = Math.floor(sequence[curFrame] % fpr);
    
    //draw it
    ctx.drawImage(image, 
      col * w, row * h, 
      w, h,
      x, y, 
      w, h);
  };
  
}
//rendering function for the map
function drawMap(){
  if(tilesReady){
    for(var y = 0; y < rows; y++){
      for(var x = 0; x < cols; x++){
        if(withinBounds(x,y)){
          ctx.drawImage(tiles, 32 * map[y][x], 0, 32, 32, (x * 32), (y * 32), 32, 32);
        }
      }
    }
  }
}

//rendering functions for the characters
function drawBoi(){
    updaterobot(boi);
    renderrobot(boi);
}
function updaterobot(robot){
  //set the animation sequence
  var sequence;
  if(robot.dir == "left")
    sequence = robot.runLeft;
  else if(robot.dir == "right")
    sequence = robot.runRight;
    
  //update the frames
  if(robot.ct == (robot.fps - 1))
    robot.curFrame = (robot.curFrame + 1) % sequence.length;
    
  robot.ct = (robot.ct + 1) % robot.fps;
}
function renderrobot(robot){
  //set the animation sequence
  var sequence;
  if(robot.dir == "left"){
    if(robot.action == "idle")
      sequence = robot.idleLeft;
    else 
      sequence = robot.runLeft;
  }
  else if(robot.dir == "right"){
    if(robot.action == "idle")
      sequence = robot.idleRight;
    else 
      sequence = robot.runRight;
  }
  
  //get the row and col of the current frame
  var row = Math.floor(sequence[robot.curFrame] / robot.fpr);
  var col = Math.floor(sequence[robot.curFrame] % robot.fpr);
  
  if(robot.show){
    ctx.drawImage(robot.img, 
    col * robot.width, row * robot.height, 
    robot.width, robot.height,
    robot.x, robot.y, 
    robot.width, robot.height);
  }
}

//overall rendering function
function render(){
  ctx.save();
  
  //camera movement?
  ctx.translate(-camera.x,-camera.y);
  
  //clear everything
  ctx.clearRect(camera.x, camera.y,canvas.width,canvas.height);
  
  //re-draw bg
  var ptrn = ctx.createPattern(bgPNG, 'repeat'); // Create a pattern with this image, and set it to "repeat".
  ctx.fillStyle = ptrn;
  ctx.fillRect(camera.x, camera.y, canvas.width, canvas.height);
  
  //draw the map
  drawMap();
  
  //draw the characters
  drawBoi();
  
  ctx.restore();
  requestAnimationFrame(render);
    
}

//////////////////// collision events ///////////////////////
function withinBounds(x,y){
  var xBound = (x >= Math.floor(camera.x / 32) - 1) && (x <= Math.floor(camera.x / 32) + (canvas.width / 32));
  return xBound;
}
function touching(sprite1, sprite2){
  //areas -- [x1,x2,y1,y2]
  var area1 = [sprite1.x, sprite1.x+sprite1.width, sprite1.y, sprite1.y + sprite1.height];
  var area2 = [sprite2.x, sprite2.x+sprite2.width, sprite2.y, sprite2.y + sprite2.height];
  
  //check if crossing area
  var xCross = false;
  var yCross = false;
  if((area1[1] >= area2[0] && area1[0] <= area2[1]) || (area2[1] >= area1[0] && area2[0] <= area1[1]))
    xCross = true;
  if((area1[3] >= area2[2] && area1[2] <= area2[3]) || (area2[3] >= area1[2] && area2[2] <= area1[3]))
    yCross = true;

  return xCross && yCross;
  
}

//////////////////key events/////////////

function moveRight(){
    boi.dir = "right";
    boi.action = "run";
    if (boi.velX < boi.speed)
      boi.velX+= boi.friction;
      
    move();
}
function moveLeft(){
    boi.dir = "left";
    boi.action = "run";
    if (boi.velX > -boi.speed)
      boi.velX-= boi.friction;
          
    move();
}
function idle(){
    boi.action = "idle";
}
function wait(sec, f){
  window.setTimeout(f, (sec*1000));
}


function move(){
  //in mid-air
  if(!colliding("vertical") && hasGravity && !jumped){
    // apply some gravity to y velocity.
    if(boi.velY < 9)
      boi.velY += gravity;       //increase the force of gravity
    else
      boi.velY = 9;    //terminal velocity
      
    boi.y += boi.velY;    //apply the velocity
  }else if(colliding("vertical") && !jumped){    //on the ground
    boi.velY = 0;
    boi.y = colTileY;
    canJump = true;
  }else if(jumped){
    boi.y += boi.velY;
    jumped = false;
  }
  
  if(hitHead())
    boi.velY = 0;
  
  //check horizontal collisions
  if(!colliding("horizontal")){
    // apply some friction to x velocity.
    boi.velX *= boi.friction;
    boi.x += boi.velX;
    
    //camera displacement
    if((boi.x >= (canvas.width / 2)) && (boi.x <= (map[0].length * 32) - (canvas.width / 2)))
      camera.x = boi.x - (canvas.width / 2);
    
    
  }else{
    boi.velX = 0;
    boi.x = colTileX;
  }
  
  // bounds checking
  if (boi.x >= (map[0].length * 32 - 32)) {
      boi.x = (map[0].length * 32 - 32);
  } else if (boi.x <= 0) {
      boi.x = 0;
  }

  if (boi.y > (canvas.height - 32)) {
      boi.y = canvas.height - 32;
  }
  
  //requestAnimationFrame(move);
}
function jump(){
  if(canJump){
    canJump = false;
    jumped = true;
    boi.velY += boi.jump;
    //console.log("hop you bastard!");
  }
}

function colliding(axis){
  if(tilesReady){
    if(axis == "vertical"){
      if(boi.dir == "left")
        pixX = Math.ceil(boi.x / 32);
      else
        pixX = Math.floor(boi.x / 32);
        
      pixY = Math.floor(boi.y / 32);
      nextY = pixY + 1;     //bottom
        
      if(map[nextY][pixX] !== 0){
        colTileY = pixY * 32;
        return true;
      }
      else{
        return false;
      }
    }
    else if(axis == "horizontal"){
      if(boi.dir == "left")
        pixX = Math.ceil(boi.x / 32);
      else
        pixX = Math.floor(boi.x / 32);
        
      pixY = Math.floor(boi.y / 32);
      nextX = pixX + (boi.dir == "left" ? -1 : 1);  //left or right side
      if(map[pixY][nextX] !== 0){
        if(boi.dir == "right")
          colTileX = pixX * 32;
        else
          colTileX = Math.ceil(boi.x / 32) * 32;

        return true;
      }else
        return false;
    }else{
      return false;
    }
  }
}
function hitHead(){
  //get boi's x and y value
  var cx1;
  var cx2;
  cx1 = Math.ceil(boi.x / 32);
  cx2 = Math.floor(boi.x / 32);
    
  var cy = Math.ceil(boi.y / 32);
  var ny = cy - 1;
  
  if(tilesReady){
    if((ny <= 0) || (map[ny][cx1] !== 0 && map[ny][cx2] !== 0)){
      return true;
    }else{
      return false;
    }
  }else
    return false;
  
  
}


//main updating function
function main(){
  requestAnimationFrame(main);
  canvas.focus();
  
  // key events
  /*
  document.body.addEventListener("keydown", function (e) {
      keys[e.keyCode] = true;
  });
  document.body.addEventListener("keyup", function (e) {
      keys[e.keyCode] = false;
      jumped = false;
  });
  document.body.addEventListener("keydown", jump);
  */
  
  
  //settings debugger screen
  var settings = "X: " + Math.round(boi.x) + " | Y: " + Math.round(boi.y);
  settings += " --- Vel X: " + Math.round(boi.velX) + " | Vel Y: " + Math.round(boi.velY);
  settings += " --- Pix X: " + pixX + " | Pix Y: " + pixY;
  document.getElementById('boiSettings').innerHTML = settings;
  
}

//reset function
function resetLevel(x,y){
  boi.x = x;
  boi.y = y;
  colTileX = x;
  colTileY = y;
  //Move the camera to focus on the player
  camera.x = 0;
}

//get the level
nextLevel('Default');

//LETS PLAY!
main();
render();
move();

var canGo = false;
var step = -1;

function gorams(){
  //run 
  if(step == 0){
    if(pixX < 14)
      moveRight();
    else
      step++;
  }else if(step == 1){
    if(pixX > 2)
      moveLeft();
    else
      step++;
  }else if(step == 2){
    idle();
    wait(1.5, function(){step++});
  }else if(step == 3){
    jump();
    step++;
  }else{
    idle();
  }
  
  requestAnimationFrame(gorams);
}

//gorams();
