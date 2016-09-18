/*global boi*/
/*global move*/
/*global pixX*/
/*global jump*/

var canRun = false;
var step = 0;
var commandSet = [];

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

function autoRun(commands){
    if(canRun){
        var totalSteps = commands.length;
        console.log("total: " + totalSteps);
        if(step < totalSteps){
            var action = commands[step];
            var instruc = action.split("=");
            if(instruc[0] == "goRight"){
                console.log("right");
                if(pixX < instruc[1]){
                    moveRight();
                }else{
                    step++;
                }
            }
            else if(instruc[0] == "goLeft"){
                console.log("left");
                if(pixX > instruc[1]){
                    moveLeft();
                }else{
                    step++;
                }
            }else if(instruc[0] == "wait"){
                console.log("wait");
                idle();
                wait(instruc[1], function(){step++});
            }else if(instruc[0] == "jump"){
                console.log("jump");
                jump();
                step++;
            }
        }else{
            idle();
            canRun = false;
        }
    }
    requestAnimationFrame(autoRun);
    
}
function test(){
    commandSet = [
        "goRight=14",
        "goLeft=2",
        "wait=1",
        "jump"
        ];
}

function goRam(setNum){
    if(setNum == 1){
        console.log("test set");
        canRun = true;
        step = 0;
        test();
    }
}

//autoRun(commandSet);