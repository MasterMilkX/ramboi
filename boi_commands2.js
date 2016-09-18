/*global boi*/
/*global move*/
/*global pixX*/
/*global jump*/
/*global pixY*/
/*global tilesReady*/
/*global map*/

//move to the right
function moveRight(){
    boi.dir = "right";
    boi.action = "run";
    if (boi.velX < boi.speed)
      boi.velX+= boi.friction;
      
    move();
}

//move to the left
function moveLeft(){
    boi.dir = "left";
    boi.action = "run";
    if (boi.velX > -boi.speed)
      boi.velX-= boi.friction;
          
    move();
}

//dont move
function idle(){
    boi.action = "idle";
}

//wait idlely for a set time
function wait(sec, f){
  window.setTimeout(f, (sec*1000));
}

//main execution
var canRunRams = false;
function goRams(){
    if(canRunRams){
        moveRight();
    
        if(foundPit()){
            console.log("oh god!");
            jump();
        }
        
        if(pixX >= 7){
            canRunRams = false;
        }
    }else{
        idle();
    }
    
    requestAnimationFrame(goRams);
}
goRams();



//decision making area

//check if next block is a pit
function foundPit(){
    if(tilesReady){
        var nextTileX = pixX + (boi.dir == "left" ? -1 : 1);
        var nextTileY = (pixY + 1);
        if(map[nextTileX][nextTileY] == 0){
            return true;
        }else{
            return false;
        }
    }
    
}