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
        if(boi.dir == "right")
            moveRight();
        else
            moveLeft();
    
        if(foundPit() || foundWall()){
            jump();
        }
        
        if(pixX == map[0].length - 1){
            boi.dir = "left";
        }else if(pixX == 0){
            boi.dir = "right";
        }
        
        
    }else{
        idle();
        move();
    }
    //requestAnimationFrame(move)
    requestAnimationFrame(goRams);
}
goRams();



//decision making area

//check if next block is a pit
function foundPit(){
    if(tilesReady){
        var nextTileX = pixX + (boi.dir == "left" ? -1 : 1);
        var nextTileY = (pixY + 1);
        if(map[nextTileY][nextTileX] == 0){
            return true;
        }else{
            return false;
        }
    }
}
//check if next block is a wall
function foundWall(){
    if(tilesReady){
        var nextTileX = pixX + (boi.dir == "left" ? -1 : 1);
        var nextTileY = pixY;
        if(map[nextTileY][nextTileX] == 1){
            return true;
        }else{
            return false;
        }
    }
}