/*Starter code taken from the repo as given in instructions */
/* general idea of implementation taken from 
https://medium.com/letsboot/classic-arcade-game-with-js-5687e4125169 */
//Player
var boy = 'images/char-boy.png';

//Gem for collection
var blueGem = 'images/Gem Blue.png';

//declaring grid constants
var gridY = 83;
var gridX = 101;
var gridY_top_space = 50;
var gridY_bottom_space = 20;
var maxPlayer_move_up = 0 * gridY + gridY_top_space;
var maxPlayer_move_down = 5 * gridY - gridY_bottom_space;
var maxPlayer_move_left = 0;
var maxPlayer_move_right = 4 * gridX;

//hitbox adjustment
var rightAdjust = 83;
var leftAdjust = 18;
var topAdjust = 81;
var bottomAdjust = 132;

//enemy spawns
var enemySpawns = 4;

//setting up player start constant
var playerStart_X = gridX * 2;
var playerStart_Y = gridY * 5 - gridY_bottom_space;

//minimum and maximum enemy speed
var min_enemy_speed = 100;
var max_enemy_speed = 580;

//Enemy hitbox adjustment
var enemy_right_adjust = 98;
var enemy_left_adjust = 3;
var enemy_top_adjust = 81;
var enemy_bottom_adjust = 132;

//below two functions are taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
/*This one returns random number b/w
min and max both inclusive */
function getRandomArbitrary(min, max) {
    return Math.random() * (max-min) + min;
}

/*This one returns random number b/w
min and max with only min inclusive*/
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max-min)) + min;
}

//Returns true if compared actors inersect
function intersect(actor1, actor2) {
    return !(actor1.right < actor2.left ||
            actor1.left > actor2.right ||
            actor1.top > actor2.bottom ||
            actor1.bottom < actor2.top);
}

//Actor class
var Actor = function(x,y,img,rightAdj,leftAdj,topAdj,botAdj) {
    this.x = x;
    this.y = y;
    this.rightAdj = rightAdj;
    this.leftAdj = leftAdj;
    this.topAdj = topAdj;
    this.botAdj = botAdj;
    this.sprite = img;
    this.right = this.x + this.rightAdj;
    this.left = this.x + this.leftAdj;
    this.top = this.y + this.topAdj;
    this.bottom = this.y + this.botAdj;
};

Actor.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};
Actor.prototype.updateHitbox = function() {
    this.right = this.x + this.rightAdj;
    this.left = this.x + this.leftAdj;
    this.top = this.y + this.topAdj;
    this.bottom = this.y + this.botAdj;
};

// Enemies our player must avoid
var Enemy = function(x,y,rightAdj,leftAdj,topAdj,botAdj) {
    Actor.call(this,x,y,'images/enemy-bug.png',rightAdj,leftAdj,topAdj,botAdj);
    //for random speed of enemy
    this.speed = getRandomArbitrary(min_enemy_speed,max_enemy_speed); 
};
Enemy.prototype = Object.create(Actor.prototype);
Enemy.prototype.constructor = Enemy;
// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.

    //reset enemy once it goes off screen
    if (this.x > gridX * 5) {
        this.x = gridX * -1;
        this.y = gridY * getRandomInt(1,4) - gridY_bottom_space;
        this.speed = getRandomArbitrary(min_enemy_speed,max_enemy_speed);
    }

    this.x = this.x + this.speed * dt;
};


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
/* Player Class */
var Player = function(x,y,rightAdj,leftAdj,topAdj,botAdj) {
    this.charSelect = boy;
    Actor.call(this,x,y,this.charSelect,rightAdj,leftAdj,topAdj,botAdj);
    this.alive = true;
    this.score = 0;
    this.lives = 3;
};
Player.prototype = Object.create(Actor.prototype);
Player.prototype.constructor = Player;
Player.prototype.handleInput = function(keyCode) {
    if (keyCode == "up" && this.y > maxPlayer_move_up) this.y = this.y -gridY;
    else if (keyCode =="down" && this.y < maxPlayer_move_down) this.y = this.y + gridY;
    else if (keyCode == "left" && this.x > maxPlayer_move_left) this.x = this.x - gridX;
    else if (keyCode == "right" && this.x < maxPlayer_move_right) this.x = this.x + gridX;
};
Player.prototype.update = function() {
    //increasing score when player reaches water
    if (this.y <= 0 * gridY + gridY_top_space) {
        this.x = playerStart_X;
        this.y = playerStart_Y;
        this.sprite = this.charSelect;
        this.score = this.score + 1;
    }

    //check if player died and reset position
    if (this.alive === false) {
        this.x = playerStart_X;
        this.y = playerStart_Y;
        this.sprite = this.charSelect;
        this.alive = true;
        if (this.lives === 0) {
            this.score = 0;
            this.lives = 3;
        }
        else {
            this.lives = this.lives - 1;
        }
    }
};
Player.prototype.renderStatus = function() {
    ctx.clearRect(0,20,505,25);
    ctx.font = "25px bold";
    //displaying score to right and lives to left
    ctx.fillText("Score: " + this.score,404,40);
    ctx.fillText("Lives: " + this.lives,0,40);
};
Player.prototype.checkCollisions = function(allEnemies, gem, heart) {
    var self = this;
    allEnemies.forEach(function(enemy) {
        if (intersect(enemy, self)) {
            self.alive = false;
        }
    });
    if (intersect(gem, this)) {
        gem.taken = true;
        this.score = this.score + 2;
    }
    if (intersect(heart,this)) {
        heart.taken = true;
        this.lives = this.lives + 1;
    }
};

//Gem class
var Gem = function(x,y,rightAdj,leftAdj,topAdj,botAdj) {
    this.gemColor = blueGem;
    Actor.call(this,x,y,this.gemColor,rightAdj,leftAdj,topAdj,botAdj);
    this.taken = false;
};
Gem.prototype = Object.create(Actor.prototype);
Gem.prototype.constructor = Gem;
Gem.prototype.update = function() {
    if (this.taken === true) {
        this.x = gridX * getRandomInt(0,5);
        this.y = gridY * getRandomInt(1,4) - gridY_bottom_space;
        this.taken = false;
    }
};

//Heart Class
var Heart = function(x,y,rightAdj,leftAdj,topAdj,botAdj) {
    Actor.call(this,x,y,'images/Heart.png',rightAdj,leftAdj,topAdj,botAdj);
    this.taken = false;
};
Heart.prototype = Object.create(Actor.prototype);
Heart.prototype.constructor = Heart;
Heart.prototype.update = function() {
    if (this.taken === true) {
        this.x = gridX * getRandomInt(0,5);
        this.y = gridY * getRandomInt(1,4) - gridY_bottom_space;
        this.taken = false;
    }
};

// Now instantiate your objects.
// Place the player object in a variable called player
var player = new Player(playerStart_X,playerStart_Y,rightAdjust,leftAdjust,topAdjust,bottomAdjust);
// Place all enemy objects in an array called allEnemies
var allEnemies = [];
for (var i = 0; i < enemySpawns; i++) {
    allEnemies.push(new Enemy(gridX * -1,gridY * getRandomInt(1,4) - gridY_bottom_space,enemy_right_adjust,enemy_left_adjust,enemy_top_adjust,enemy_bottom_adjust));
}
var gem = new Gem(gridX * getRandomInt(0,5), gridY * getRandomInt(1,4) - gridY_bottom_space,rightAdjust,leftAdjust,topAdjust,bottomAdjust);
var heart = new Heart(gridX * getRandomInt(0,5),gridY * getRandomInt(1,4) - gridY_bottom_space,rightAdjust,leftAdjust,topAdjust,bottomAdjust);


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
