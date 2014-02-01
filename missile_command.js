//Declare global variables.
var main;
var background;
var cities;
var text;

var cities_ctx;
var background_ctx;
var main_ctx;
var text_ctx;

var canvas_w;
var canvas_h;

//var background;
//var background_image;

var missile;
var missile_controller;
var explosion_controller;
var game_controller;

var turret1;
var turret2;
var curr_turret;

var city1;
var city2;
var city3; 

//colors for missile trails
var red0 = "#800000";
var red1 = "#FF0000";

var blue0 = "#0000FF";
var blue1 = "#0066FF";

var green0 = "#006600";
var green1 = "#339933";

var yellow0 = "#CC9900";
var yellow1 = "#FFFF00";

var grey0 = "#ABABAB";
var grey1 = "#BABABA";


//Colors for cities;
var city_color0 = "#07EEF2";
var city_color1 = "#D6FEFF";
var city_color2 = "#6BFCFF";


//Ensures that code does not run before page has loaded
window.onload = init;  

/*
* Initialize the game and instantiate everything that's needed.
*/
function init() {
    //prepare canvases.
    main = document.getElementById("main");
    background = document.getElementById("background");
    cities = document.getElementById("cities");
    text = document.getElementById("text");
    //explosion = document.getElementById("explosion");

    canvas_w = main.width;
    canvas_h = main.height;

    //add the mouse click event listener.
    text.addEventListener("mousedown", onClick, false);

    //prepare the graphics contexts.
    main_ctx = main.getContext('2d');
    background_ctx = background.getContext('2d');
    cities_ctx = cities.getContext('2d');
    text_ctx = text.getContext('2d');
    //explosion_ctx = explosion.getContext('2d');

    //Instantiate the player's turrets.
    turret1 = new Turret(0 + 50, canvas_h - 40);
    turret2 = new Turret(canvas_w - 50, canvas_h - 40);

    //Instantiate and initialize the three cities.
    city1 = new City();
    city2 = new City();
    city3 = new City();

    city1.init(canvas_w / 2, canvas_h);
    city2.init(0 + 150, canvas_h);
    city3.init(canvas_w - 150, canvas_h);

    city1.draw();
    city2.draw();
    city3.draw();

    //Instantiate the controller objects.
    missile_controller = new MissileController();
    explosion_controller = new ExplosionController();
    game_controller = new GameController();

    //Start the first wave of missiles.
    game_controller.startWave();

    return setInterval( update, 1000/60 ); // 60 frames per second
  }

/*
* Saves the coordinates of on-screen mouse clicks.
* If the player's turrets are able, launch a missile targeting that position.
*/ 
function onClick(event) {
    console.log("THIS IS HAPPENING!");
    var x = new Number();
    var y = new Number();

    if (event.x != undefined && event.y != undefined) {
      x = event.x;
      y = event.y;
    }
    //firefox method
    else {
      x = event.clientX + document.body.scrollLeft +
          document.documentElement.scrollLeft;
      y = event.clientY + document.body.scrollTop +
          document.documentElement.scrollTop;
    }	

    //If the position is on the left side of the screen, 
    //try to fire the missile from the closest turret.
    if(x < canvas_w / 2 && !turret1.is_out) {
      turret1.launch(x,y);
      //if that turret is unavailable, use the far turret.
    } else if(turret1.is_out) {
      turret2.launch(x,y);
    }

    //Same thing, but for the right side.
    if(x >= canvas_w / 2 && !turret2.is_out) {
      turret2.launch(x,y);
    } else if(turret2.is_out) {
      turret1.launch(x,y);
    } 
  }

  /*
  * Defines the missile object.
  * -----
  * Missiles move in a straight line from their start coords to their target coords.
  * They explode (and instantiate an explosion object) if they collide with an explosion
  * or if they reach their target coords. 
  */ 
  function Missile() {

    //Activates a missile, giving it a start position and a target position.
    this.spawn = function(start_x, start_y, target_x, target_y, speed) {
        this.alive = true; //indicates that the missile is active. 

        this.start_x = start_x;
        this.start_y = start_y; 

        this.target_x = target_x;
        this.target_y = target_y;

        //if the missile is coming from the bottom of the screen
        //it was fired by a player and thus designated a 'rocket'.
        if(this.start_y >= this.target_y) {
          this.type = "rocket"
        }
        //enemy missiles fired from the top of the screen are 
        //designated 'missiles'
        if(this.start_y < this.target_y) {
          this.type = "missile"
        }

        this.speed = speed;

        //assign the missiles real position to its start coordinates.
        this.x = this.start_x;
        this.y = this.start_y;

        //calculate the angle between the missiles start position and its target position.
        this.dirx = this.target_x - this.start_x;
        this.diry = this.target_y - this.start_y;

        this.angle = Math.atan2(this.diry, this.dirx);
      }

    //Move the missile across the screen.
    this.move = function() {

      //calculate the x and y values to add to the missiles current 
      //position such that it will move an approprate distance along the line that connects 
      //its start position to its target position.
      var sin = Math.sin(this.angle) * this.speed;
      var cos = Math.cos(this.angle) * this.speed;

      this.x += cos;
      this.y += sin;

      //Detonate the missile when it reaches the same y-position as its target y.
      if(this.type == "rocket") {
        if(this.y < this.target_y) {
          this.explode();
        }
      } else if(this.type = "missile") {
        if(this.y > this.target_y) {
          //Destroy any objects that the enemy missile was targeting.
          if(this.target_x == city1.x) {
            city1.destroy();
          }
          else if(this.target_x == city2.x) {
            city2.destroy();
          }
          else if(this.target_x == city3.x) {
            city3.destroy();
          }
          else if(this.target_x == turret1.x) {
            turret1.destroy();
          }
          else if(this.target_x == turret2.x) {
            turret2.destroy();
          }
          this.explode();
        }
      }

      //Check whether or not the missile is within the radius of any explosions.
      for(var i = 0; i < explosion_controller.explosion_count; i++) {
        var explosion = explosion_controller.exp_pool[i];
        //if the explosion is active
        if(explosion.alive) {
          //and it seems like we're in range
          if(this.y <= explosion.y + 51 && this.y >- explosion.y - 51) {
            //check for collision
            if((Math.pow((this.x - explosion.x),2) + Math.pow((this.y - explosion.y),2)) < (Math.pow(explosion.radius, 2))) {
              if(explosion.x != this.x && explosion.y != this.y) {
                //if the missile is within the explosion's radius, detonate it.
                this.explode();
              }
            }
          }
        }
      }
     }  

     //Draw the missile.
    this.drawMissile = function(color0, color1) {
      this.color0 = color0;
      this.color1 = color1;
      if(this.alive) {
        with(main_ctx) {

          //Missiles are drawn by first choosing a color at random
          switch(Math.floor(Math.random() * 4)) {
            case 0:
              fillStyle = color0;
              break;
            case 1: 
              fillStyle = color1;
              break;
            case 2:
              fillStyle = grey0;
              break;
            default:
              fillStyle = grey1;
              break;
          }

          //and then drawing semi-randomly sized rectangles at semi-random distances away from the missile's origin.
          //this creates a really cool 'smoke and fire' effect.
          beginPath();

          fillRect(this.x + (Math.random() * 4 + Math.random() * -4), this.y + (Math.random() * 4 + Math.random() * -4),
                       4 + (Math.random() * 7), 4 + (Math.random() * 4));
          fillRect(this.x + (Math.random() * 4 + Math.random() * -4), this.y + (Math.random() * 4 + Math.random() * -4),
                       4 + (Math.random() * 7), 4 + (Math.random() * 4));
          fillRect(this.x + Math.floor((Math.random() * 15) + (Math.random() * -15)), 
                       this.y + Math.floor((Math.random() * 15) + (Math.random() * -15)),
                       1 + (Math.random() * 4), 1 + (Math.random() * 4));

          //If the missile belongs to the player, draw a target indicator at the target position.
          if(this.type == "rocket") {
            fillRect(this.target_x + 15, this.target_y, 5, 5);
            fillRect(this.target_x - 15, this.target_y, 5, 5);
            fillRect(this.target_x, this.target_y + 15, 5, 5);
            fillRect(this.target_x, this.target_y - 15, 5, 5);
          }
          
          //create a subtle acceleration effect.
          if(this.type == "rocket") {
            this.speed += .01;
          }
        } 
      }
      
      //Detonate the missile. Tells the missile controller to activate one of its stored explosions.
      //No new explosion object is created.
     this.explode = function() {
       explosion_controller.activateExplosion(this.x, this.y, this.color0, this.color1);
       //if it was an enemy missile, tell the game controller to increase the player's score and that 
       //there is one less active missile. This is important for deterniming when to end the wave. 
       if(this.type == "missile") {
          game_controller.score += 5;
          game_controller.missiles_active--;
       }
       //deactivate the missile.
       this.alive = false;
     }

    }    

  }

/*
* Describes the turret object, which stores and manages the player's missiles.
*/
function Turret(x, y) {
  this.alive = true;
  this.x = x;
  this.y = y;
  this.available_missiles = 15; //the number of missiles that the player is allowed to shoot from this turret each wave. 
  this.missile_count = 10; //the number of missiles stored in the 'arsenal' array. Note: these missiles are recycled.
  this.arsenal = [this.missile_count]; 
  this.is_out = false; //true if the turret becomes destoryed or the player runs out of ammo. Makes the turret unable to fire. 
  for(var i = 0; i < this.missile_count; i++) {
    this.arsenal[i] = new Missile(); //populate the arsenal with missile objects.
  }

  //draw the text that tells the player how many missiles they have remaining. 
  this.draw = function() {
    with(text_ctx) {
      clearRect(this.x - 5, this.y, 200, 200);
      fillStyle = "white";
      font = "bold 16px Arial";
      if(this.available_missiles > 0) {
        fillText(this.available_missiles, this.x - 5, this.y + 20);
      }else if(this.available_missiles == 0) {
        fillText("OUT", this.x - 15, this.y + 15);
        this.is_out = true;
      }
    }
  }
  
  //Grab an inactive missile from the arsenal and launch it. 
  this.launch  = function(target_x, target_y) {
    var launched = false;
    var i = 0;
    while(!launched) {
        if(i > this.missile_count){
          console.log("out of missiles!");
          break;
        }
        //find the first inactive missile
        if(!this.arsenal[i].alive) {
          //if the player is allowed to launch it, spawn the missile.
          if(this.available_missiles != 0) {
            this.arsenal[i].spawn(this.x, this.y, target_x, target_y, 4);
            this.available_missiles--;
            if(this.available_missiles == 0) {
              this.is_out = true;
            }
          }
          launched = true;
        } else {
          i++;
        } 
    }
  }

  //loops though the arsenal and draws all inactive missiles.
  this.drawMissiles = function() {
    for(var i = 0; i < this.missile_count; i++) {
      if(this.arsenal[i].alive) {
        this.arsenal[i].move();
        this.arsenal[i].drawMissile(red0, red1);
      }
    }  
  }

  //renders the turret unable to fire. Occurs when an enemy missile impacts the turret.
  this.destroy = function() {
    this.alive = false;
    this.available_missiles = 0;
  }

  //clear all of the turret's active missiles from the screen.
  this.reset = function() {
    for(var i = 0; i < this.missile_count; i++) {
      this.arsenal[i].alive = false;
    }
  }
}

/*
* Describes the missile controller object, which stores and manages the enemy's missiles.
*/
function MissileController() {
  //the colors that missiles from this controller will be.
  this.color0;
  this.color1;
  this.missile_count = 30;  //Maximum number of missiles on-screen at once. 
  this.arsenal = [this.missile_count];
  for(var i = 0; i < this.missile_count; i++) {
    this.arsenal[i] = new Missile(); //instantiate all the missiles and store them in the 'arsenal' array.
  }

  //grab and inactive missile from the arsenal and launch it.
  this.launch  = function() {
    //choose a target for the missile at random.
    var chosen = false;
    while(!chosen) {
      var choose = Math.floor(Math.random() * 6);
      switch(choose) {
        case 0: 
          this.target_x = turret1.x;
          this.target_y = turret1.y;
          chosen = true;
          break;
        case 1:
          this.target_x = turret2.x;
          this.target_y = turret2.y;
          chosen = true;
          break;
        case 2:
          this.target_x = city1.x;
          this.target_y = city1.y;
          chosen = true;
          break;
        case 3:
          this.target_x = city1.x;
          this.target_y = city1.y;
          chosen = true;
          break;
        case 4:
          this.target_x = city2.x;
          this.target_y = city2.y;
          chosen = true;
          break; 
        case 5:
          this.target_x = city3.x;
          this.target_y = city3.y;
          chosen = true;
          break;
        default:
          this.target_x = turret1.x;
          this.target_y = turret1.y;
          chosen = true;
          break;     
      }
    }

    //choose a ranom location at the top of the screen for the missile to start at.
    this.launch_x = canvas_w - (Math.floor(Math.random() * canvas_w));
    this.launch_y = 0;
    
    //find the first inactive missile in the arsenal and launch it. 
    var launched = false;
    var i = 0
    while(!launched) {
        if(i > this.missile_count){
          console.log("out of missiles!");
          break;
        }
        if(!this.arsenal[i].alive) {
          this.arsenal[i].spawn(this.launch_x, this.launch_y, this.target_x, this.target_y, game_controller.missile_speed);
          launched = true;
        } else {
          i++;
        } 
    }
  }

  //Loops through the arsenal of missile objects and draws the active ones. 
  this.drawMissiles = function() {
    for(var i = 0; i < this.missile_count; i++) {
      if(this.arsenal[i].alive) {
        this.arsenal[i].move();
        this.arsenal[i].drawMissile(this.color0, this.color1);
      }
    }  
  }

  //Deactivates all enemy missiles. Used for clearing the screen.
  this.reset = function() {
    for(var i = 0; i < this.missile_count; i++) {
      this.arsenal[i].alive = false;
    }
  }
}

/*
* The things that the player is trying to protect.
* Drawn at fixed positions. 
* TODO: Make them look cooler.
*/
function City() {
  var alive;

  this.init = function(x, y) {
    this.alive = true;
    this.x = x;
    this.y = y;
  }

  //If the city has been destroyed, clear it. 
  this.draw = function() {
    with(cities_ctx) {
      if(this.alive) {
        fillStyle = city_color0;
        fillRect(this.x, this.y - 20, 20, 20);
      }
      if(!this.alive) {
        clearRect(this.x, this.y - 20, 20, 20);
      }
    }
  }

  //Destroy the city
  //Happens when a missile targeting the city reaches it.
  //Does NOT occur when the city is within an explosion's radius. 
  this.destroy = function() {
    if(this.alive){
      game_controller.city_count--;
    }
    this.alive = false;
    this.draw();
  }
}

/*
* Describes an explosion object. Created when missiles are destroyed.
* They grow to a maximum radius and then disappear. 
* If a missile makes contact with an active explosion, it detonates.
*/
function Explosion () {
  this.color0 = red0;  //explosions are drawn with multiple colors. By default they are red, but
  this.color1 = red1;  //the color of an explosion is altered to match the color of the missile that it comes from.
  this.alive = false;  //if missiles are alive, they'll be drawn on the screen and effect the world.

  //Initializes the missile. Happens when a missile detonates. 
  this.init = function(x, y, color0, color1) {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.color0 = color0;
    this.color1 = color1;
    this.radius = 5;
  }

  //Expand the explosion's radius. 
  //If it has reached it's maximum radius, deactivate it. 
  this.grow = function() {
    this.radius += 3;
    if(this.radius > 50) {
      this.alive = false;
    }
  }

  //Draw the explosion
  this.draw = function(color0, color1) {
    with(main_ctx) {
      switch(Math.floor(Math.random() * 4)) {
            case 0:
              fillStyle = color0;
              break;
            case 1: 
              fillStyle = color1;
              break;
            case 2:
              fillStyle = grey0;
              break;
            default:
              fillStyle = grey1;
              break;
      }
      beginPath();
      arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
      //If the explosion has reached its maximum radius, draw a grey circle over it. 
      if(this.radius +3 > 50) {
        if(Math.floor(Math.random() * 2) == 0) {
          fillStyle = grey1;
        } else {
          fillStyle = grey0;
        }
        arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
      }
      closePath();
      fill();
    }  
  }
}

/*
* Describes the explosion controller object, which stores and manages explosion objects.
*/
function ExplosionController() {
  this.explosion_count = 40; //maximum number of explosions objects that can be on-screen at one time.
  this.exp_pool = [this.explosion_count]; //An array that stores all of the game's explosion objects.
  for(var i = 0; i < this.explosion_count; i++) {
    this.exp_pool[i] = new Explosion(); //instantiate all the explosions.
  }

  //grab an inactive explosion from the pool and activate it.
  this.activateExplosion = function(x, y, color0, color1) {
    //get first inactive explosion
    var has_activated = false;
    var i = 0;
    while(!has_activated && i <= this.explosion_count) {
      if(!this.exp_pool[i].alive) {
        this.exp_pool[i].init(x, y, color0, color1);
        has_activated = true;
      }
      i++;
    }
    if(i >= this.explosion_count) {
      console.log("out of explosions!");
    }
  }

  //loop through the pool of explosion objects and draw the active ones.
  this.drawExplosions = function() {
    for(var i = 0; i < this.explosion_count; i++) {
      if(this.exp_pool[i].alive) {
        this.exp_pool[i].grow();
        this.exp_pool[i].draw(this.exp_pool[i].color0, this.exp_pool[i].color1);
      }
    }  
  }

  //deactivate all explosions. Used for clearing the screen.
  this.reset = function() {
    for(var i = 0; i < this.explosion_count; i++) {
      this.exp_pool[i].alive = false;
    }
  }
}

/*
* Describes the game controller object, which manages the game loop, score, and difficulty.
*/
function GameController() {
   this.score = 0;
   this.wave = 0;
   this.missiles_to_fire = 5; //The number of missiles that will be fired this wave.
   this.missiles_fired = 0;   //The number of missiles that have been fired so far this wave.
   this.missiles_active = 0;  //Missiles currently active on-screen.
   this.missile_speed = .5;
   this.missile_color = 0;
   this.city_count = 3;    
   this.difficulty = 0;
   this.game_paused = false;  //true when wave ends. Stops update() from executing.
   this.game_over = false;    //Permanently stops update() from executing.
   this.unpause_timer = 0;    //used to time how long the pause screen is displayed between waves.

   /*
   * Activates a new wave of missiles.
   */
   this.startWave = function() {
    this.game_paused = false;
    this.unpause_timer = 0;
    this.drawUnPaused();

    //restore the player's turrets.
    turret1.alive = true;
    turret2.alive = true;
    turret1.is_out = false;
    turret2.is_out = false;

    //give the player's turrets more missiles.
    turret1.available_missiles = 15;
    turret2.available_missiles = 15;

    this.missile_speed += .5;
    this.missiles_to_fire += 2;

    //give the enemy missiles a random new color
    this.missile_color = Math.floor(Math.random() * 3);

    if(this.missile_color == 0) {
      missile_controller.color0 = blue0;
      missile_controller.color1 = blue1;
    } else if(this.missile_color == 1) {
      missile_controller.color0 = green0;
      missile_controller.color1 = green1;
    } else if(this.missile_color == 2) {
      missile_controller.color0 = yellow0;
      missile_controller.color1 = yellow1;
    }

    this.missiles_fired = 0;
   }

  /*
  * Ends the wave, called when there are no more missiles to fire and 
  * no active missiles on-screen.
  * Pauses the game.
  */
   this.endWave = function() {
    this.wave++;
    this.game_paused = true;
    this.drawPaused();
   }

  /*
  * Ends the game, called when the player loses their last city.
  */
   this.endGame = function() {
    this.game_over = true;
   }

   /*
   * Makes a series of checks each time the game updates.
   */
   this.step = function() {
    //made sure we don't have negative active missiles
    if(this.missiles_active < 0) {
      this.missiles_active = 0;
    }
    //check that the player hasn't lost the game.
    if(this.city_count == 0) {
      this.endGame();
    }
    //check if the wave is over.
    if((this.missiles_to_fire == this.missiles_fired) && this.missiles_active == 0){
      this.endWave();
    }

    //if the wave has ended, wait to start the next one.
    if(this.game_paused) {
      if(this.unpause_timer == 150) {
        this.startWave();
      }
      this.unpause_timer++;
    }

    //if the game is over display the game over screen.
    if(this.game_over) {
      this.drawGameOver();
    }

    //Make sure the score isn't drawn in the top-left corner
    //if the game is over or paused. If it is drawn at that time it
    //clears a part of the transparent grey background.
    if(!this.game_paused && !this.game_over) {
      this.drawScore();
    }  
   }

   //Draw the player's current score in the top-left corner.
   this.drawScore = function() {
    with(text_ctx) {
        fillStyle = "white";
        font = "bold 16px Arial";
        clearRect(0, 0, 200, 200);
        fillText("Score: " + this.score, 5, 25);
    }
   }

   //Draw the game over screen.
   //Display final score and an encouraging message.
   //TODO: make additional encouraging messages and choose among them at random.
   this.drawGameOver = function() {
    with(text_ctx) {
        clearRect(0, 0, canvas_w, canvas_h);
        fillStyle = "rgba(0, 0, 0, 0.5)"
        fillRect(0, 0, canvas_w, canvas_h);
        fillStyle = "white";
        font = "bold 32px Arial";
        fillText("EVERYTHING YOU LOVE", (canvas_w / 2) - 170, (canvas_h / 2) - 50);
        fillText("HAS BEEN DESTROYED", (canvas_w / 2) - 170, (canvas_h / 2));
        fillText("BY MISSILES", (canvas_w / 2) - 170, (canvas_h / 2) + 50);
        font = "28px Helvetica";
        fillText("FINAL SCORE : " + this.score, (canvas_w / 2) - 170, (canvas_h / 2) + 100);
    }
   }

   //Draw inter-wave pause screen.
   //Display player's score and an encouraging message.
   this.drawPaused = function() {
      with(text_ctx) {
        clearRect(0, 0,canvas_w, canvas_h);
        fillStyle = "rgba(0, 0, 0, 0.5)"
        fillRect(0, 0, canvas_w, canvas_h);
        fillStyle = "white";
        font = "bold 32px Arial";
        fillText("YOU HAVE SURVIVED", (canvas_w / 2) - 170, (canvas_h / 2) - 50);
        fillText("FOR NOW", (canvas_w / 2) - 170, (canvas_h / 2));
        font = "28px Helvetica";
        fillText("CURRENT SCORE : " + this.score, (canvas_w / 2) - 170, (canvas_h / 2) + 50);
      }
   }

  //clear the screen to prepare it for the next round.
   this.drawUnPaused = function() {
      //clear any leftover missiles and explosions from the screen
      missile_controller.reset();
      explosion_controller.reset();
      turret1.reset();
      turret2.reset();
      with(main_ctx) {
        clearRect(0, 0, canvas_w, canvas_h);
      } 
      with(text_ctx) {
        clearRect(0,0,canvas_w,canvas_h);
      }
   }
}

/*
* The update function. Runs 60 times per second.
*/
function update() {

    //if the game is not over or paused, run the game.
    if(!game_controller.game_paused && !game_controller.game_over) {
      //draw old images back on the canvas, but gradually lower their alphas
      //creates a fading effect. Source: http://rectangleworld.com/blog/archives/214
      var last_image = main_ctx.getImageData(0,0,canvas_w,canvas_h);
      var i;
      var pixel_data = last_image.data;
      var len = pixel_data.length;
      for (i = 3; i < len; i += 4) {
        //change alpha
        pixel_data[i] -= 1.5;
      }

      //allow the missile controller to fire missiles at random intervals.
      //TODO: replace this with a better system. Make the missiles fire more frequently
      //      as difficulty increases. 
      var fire = Math.floor(Math.random() * 100);

      if(fire == 0) {
        if(game_controller.missiles_fired != game_controller.missiles_to_fire) {
          missile_controller.launch();
          
          game_controller.missiles_fired++;
          game_controller.missiles_active++;
        } 
      }

      main_ctx.putImageData(last_image,0,0);

      //draw the turret text, and draw all of the active missiles in the turret's arsenals.
      turret1.draw(); 
      turret1.drawMissiles();
      turret2.draw(); 
      turret2.drawMissiles();

      //draw all active enemy missiles and explosions.
      missile_controller.drawMissiles();
      explosion_controller.drawExplosions();
    }
    //always allow the game_controller to run, whether or not the game is paused/over.
    game_controller.step();
}