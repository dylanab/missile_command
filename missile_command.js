

//Initialize and start the game.
var game = new Game();

function init() {
        if(game.init())
                game.start();
}

//Define an object to hold all our images for the game so images
//are only ever created once. 

var image_repository = new function() {
        // Define images
        this.background = new Image();
        this.missile_launcher = new Image();
        this.missile = new Image();
        this.enemy_missile = new Image();

        // Ensure all images have loaded before starting the game
        var num_images = 5;
        var num_loaded = 0;

        function image_loaded() {
                num_loaded++;
                if (num_loaded === num_images) {
                        window.init();
                }
        }

        this.background.load = function() {
                image_loaded();
        }
        this.missile_launcher.load = function() {
                imageLoaded();
        }
        this.missile.load = function() {
                imageLoaded();
        }
        this.enemy_missile.load = function() {
                imageLoaded();
        }
        
        // Set images src
        this.background.src = "imgs/background.png";
        this.missile_launcher.src = "imgs/missile_launcher.png";
        this.missile.src = "imgs/missile.png";
        this.enemy_missile.src = "imgs/enemy_missile.png";
}

function Drawable() {
        this.init = function(x, y, width, height) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
        }

        this.speed = 0;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        
        //abstract functions to be implemented by children
        this.draw = function() {

        }

        this.move = function() {

        }
}

function Background() {
        this.speed = 1; // Redefine speed of the background for panning
        
        // Implement abstract function
        this.draw = function() {
                // Pan background
                this.y += this.speed;
                this.context.drawImage(imageRepository.background, this.x, this.y);
                
                // Draw another image at the top edge of the first image
                this.context.drawImage(imageRepository.background, this.x, this.y - this.canvasHeight);

                // If the image scrolled off the screen, reset
                if (this.y >= this.canvasHeight)
                        this.y = 0;
        };
}
// Set Background to inherit properties from Drawable
Background.prototype = new Drawable();


function Missile() {
        this.alive = false;

        this.spawn = function(target_x, target_y, speed) {
                this.alive = true;

                this.distance = 0;

                this.start_x = canvasWidth  - Math.random(canvasWidth - 1);
                this.start_y = 0;

                this.target = target;
                this.speed = speed;

                var x = this.target_x - this.start_x;
                var y = this.target_y - this.start_y;
                this.angle = Math.atan(x/y);
        }

        this.spin = function() {

        }

        this.draw = function() {

        }

        this.move = function() {
                var original_x = this.x;
                var original_y = this.y;

                this.distance += this.speed;
                this.x = Math.sin(this.angle) * this.distance + this.original_x;
                this.y = Math.cos(this.angle) * this.distance + this.original_y;

                //if the missile's position changed
                if(original_x != this.x || original_y != this.y) {
                        this.dirty = true;

                        //add the "dirty rectangle" to the dirty rectangles array. 
                        //this area of the canvas will be redrawn.
                        Game.dirty_rects.push({
                                x: original_x,
                                y: original_y,
                                width: this.width,
                                height: this.height
                        });
                }
                
                this.x += speed;
                this.y -= speed;
        }

        this.reset_values = function() {
                this.start_x = 0;
                this.start_y = 0;

                this.target_x = 0;
                this.target_y = 0;

                this.speed = 0;
                this.alive = 0;
        }

        
}
Missile.prototype = new Drawable();

function Arsenal(max_missiles) {
        var size = max_missiles;
        var arsenal = [];

        this.init = function() {
                //populate the arsenal with missiles
                for(var i = 0; i < size; i++) {
                        var missile = new Missile();
                        missile.init(0, 0, image_repository.missile.width,
                                        image_repository.missile.height);
                        arsenal[i] = missile;
                }
        };

        //pulls a missile from the back of the arsenal and initializes it.
        this.launch = function(target_x, target_y, speed) {
                if(!arsenal[size - 1].alive) {
                        arsenal[size - 1].spawn(target_x, target_y, speed);
                        arsenal.unshift(arsenal.pop());
                }
        };

        this.animate = function() {
                for(var i = 0; i < size; i++) {
                        //look for active missiles and draw them. 
                        if(arsenal[i].alive) {
                                if(arsenal[i].draw()) {
                                        arsenal[i].clear();
                                        arsenal.push((arsenal.splice(i, 1))[0]);
                                }
                        } else {
                                break;
                        }
                }
        }

}

function Game() {
        /*
         * Gets canvas information and context and sets up all game
         * objects. 
         * Returns true if the canvas is supported and false if it
         * is not. This is to stop the animation script from constantly
         * running on browsers that do not support the canvas.
         */
        this.init = function() {
                // Get the canvas elements
                this.bgCanvas = document.getElementById('background');
                //this.shipCanvas = document.getElementById('ship');
                this.missileCanvas = document.getElementById('missile');
                this.turretCanvas = document.getElementById('turret');
                
                // Test to see if canvas is supported. 
                // Only need to check one canvas
                if (this.bgCanvas.getContext) {
                        this.bgContext = this.bgCanvas.getContext('2d');
                        this.shipContext = this.shipCanvas.getContext('2d');
                        this.mainContext = this.mainCanvas.getContext('2d');
                
                        // Initialize objects to contain their context and canvas
                        // information
                        Background.prototype.context = this.bgContext;
                        Background.prototype.canvasWidth = this.bgCanvas.width;
                        Background.prototype.canvasHeight = this.bgCanvas.height;
                        
                        //Ship.prototype.context = this.shipContext;
                        //Ship.prototype.canvasWidth = this.shipCanvas.width;
                        //Ship.prototype.canvasHeight = this.shipCanvas.height;
                        
                        Missile.prototype.context = this.missileContext;
                        Missile.prototype.canvasWidth = this.missileCanvas.width;
                        Missile.prototype.canvasHeight = this.missileCanvas.height;

                        Turret.prototype.context = this.turretContext;
                        Turret.prototype.canvasWidth = this.turretCanvas.width;
                        Turret.prototype.canvasHeight = this.turretCanvas.height;
                        
                        // Initialize the background object
                        this.background = new Background();
                        this.background.init(0,0); // Set draw point to 0,0
                        /*
                        // Initialize the ship object
                        this.ship = new Ship();
                        // Set the ship to start near the bottom middle of the canvas
                        var shipStartX = this.shipCanvas.width/2 - imageRepository.spaceship.width;
                        var shipStartY = this.shipCanvas.height/4*3 + imageRepository.spaceship.height*2;
                        this.ship.init(shipStartX, shipStartY, imageRepository.spaceship.width,
                                       imageRepository.spaceship.height);
                        */
                        return true;
                } else {
                        return false;
                }
        };
        
        // Start the animation loop
        this.start = function() {
                //this.ship.draw();
                animate();
        };
}


/**
 * The animation loop. Calls the requestAnimationFrame shim to
 * optimize the game loop and draws all game objects. This
 * function must be a gobal function and cannot be within an
 * object.
 */
function animate() {
        window.requestAnimFrame();
        game.background.draw();
        //game.ship.move();
        game.ship.bulletPool.animate(); 
}



