//BEGIN LIBRARY CODE
var main;
var background;
var cities;
var text;
var explosion;

var cities_ctx;
var background_ctx;
var main_ctx;
var text_ctx;
var explosion_ctx;

var canvas_w;
var canvas_h;

var background;
var background_image;

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

var image_repository;

var missileExists = false;
 

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


//colors for cities;
var city_color0 = "#07EEF2";
var city_color1 = "#D6FEFF";
var city_color2 = "#6BFCFF";


// ensure that code does not run before page has loaded
window.onload = init;  

function init() {
    //console.log("Initializing!");

    main = document.getElementById("main");
    background = document.getElementById("background");
    cities = document.getElementById("cities");
    text = document.getElementById("text");
    explosion = document.getElementById("explosion");

    canvas_w = main.width;
    canvas_h = main.height;

    text.addEventListener("mousedown", onClick, false);

    main_ctx = main.getContext('2d');
    background_ctx = background.getContext('2d');
    cities_ctx = cities.getContext('2d');
    text_ctx = text.getContext('2d');
    explosion_ctx = explosion.getContext('2d');

    //explosion_ctx.globalCompositeOperation = 'destination-out';

    turret1 = new Turret(0 + 50, canvas_h - 40);
    turret2 = new Turret(canvas_w - 50, canvas_h - 40);
    curr_turret = 1;

    city1 = new City();
    city2 = new City();
    city3 = new City();

    missile_controller = new MissileController();
    explosion_controller = new ExplosionController();
    game_controller = new GameController();

    game_controller.startWave();

    city1.init(canvas_w / 2, canvas_h);
    city2.init(0 + 150, canvas_h);
    city3.init(canvas_w - 150, canvas_h);

    city1.draw();
    city2.draw();
    city3.draw();

    return setInterval( update, 1000/60 ); // 60 frames per second
  }

function onClick(event) {
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
    if(x < canvas_w / 2 && !turret1.is_out) {
      turret1.launch(x,y);
    } else if(turret1.is_out) {
      turret2.launch(x,y);
    }

    if(x >= canvas_w / 2 && !turret2.is_out) {
      turret2.launch(x,y);
    } else if(turret2.is_out) {
      turret1.launch(x,y);
    } 
  }

  function Missile() {

    this.spawn = function(start_x, start_y, target_x, target_y, speed) {
        //console.log("missile spawned");
        this.alive = true;

        this.distance = 0;

        this.start_x = start_x;
        this.start_y = start_y; 

        this.target_x = target_x;
        this.target_y = target_y;

        if(this.start_y >= this.target_y) {
          this.type = "rocket"
        }
        if(this.start_y < this.target_y) {
          this.type = "missile"
        }

        this.speed = speed;

        this.x = this.start_x;
        this.y = this.start_y;

        this.dirx = this.target_x - this.start_x;
        this.diry = this.target_y - this.start_y;

        this.angle = Math.atan2(this.diry, this.dirx);
      }

    this.move = function() {

      var sin = Math.sin(this.angle) * this.speed;
      var cos = Math.cos(this.angle) * this.speed;

      this.x += cos;
      this.y += sin;

      if(this.type == "rocket") {
        if(this.y < this.target_y) {
          this.explode();
        }
      } else if(this.type = "missile") {
        if(this.y > this.target_y) {
          if(this.target_x == city1.x) {
            console.log("city1 destroyed");
            city1.destroy();
          }
          else if(this.target_x == city2.x) {
            console.log("city2 destroyed");
            city2.destroy();
          }
          else if(this.target_x == city3.x) {
            console.log("city3 destroyed");
            city3.destroy();
          }
          else if(this.target_x == turret1.x) {
            console.log("turret1 destroyed");
            turret1.destroy();
          }
          else if(this.target_x == turret2.x) {
            console.log("turret2 destroyed");
            turret2.destroy();
          }
          this.explode();
        }
      }

      for(var i = 0; i < explosion_controller.explosion_count; i++) {
        var explosion = explosion_controller.exp_pool[i];
        //if the explosion is active
        if(explosion.alive) {
          //and it seems like we're in range
          if(this.y <= explosion.y + 51 && this.y >- explosion.y - 51) {
            //check for collision
            if((Math.pow((this.x - explosion.x),2) + Math.pow((this.y - explosion.y),2)) < (Math.pow(explosion.radius, 2))) {
              if(explosion.x != this.x && explosion.y != this.y) {
                this.explode();
              }
            }
          }
        }
      }
     }  

    this.drawMissile = function(color0, color1) {
      this.color0 = color0;
      this.color1 = color1;
      if(this.alive) {
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

          fillRect(this.x + (Math.random() * 4 + Math.random() * -4), this.y + (Math.random() * 4 + Math.random() * -4),
                       4 + (Math.random() * 7), 4 + (Math.random() * 4));
          fillRect(this.x + (Math.random() * 4 + Math.random() * -4), this.y + (Math.random() * 4 + Math.random() * -4),
                       4 + (Math.random() * 7), 4 + (Math.random() * 4));
          fillRect(this.x + Math.floor((Math.random() * 15) + (Math.random() * -15)), 
                       this.y + Math.floor((Math.random() * 15) + (Math.random() * -15)),
                       1 + (Math.random() * 4), 1 + (Math.random() * 4));

          if(this.type == "rocket") {
            fillRect(this.target_x + 15, this.target_y, 5, 5);
            fillRect(this.target_x - 15, this.target_y, 5, 5);
            fillRect(this.target_x, this.target_y + 15, 5, 5);
            fillRect(this.target_x, this.target_y - 15, 5, 5);
          }
          

          //create an acceleration effect
          if(this.type == "rocket") {
            this.speed += .01;
          }
        } 
      }
      
     this.explode = function() {
       explosion_controller.activateExplosion(this.x, this.y, this.color0, this.color1);
       if(this.type == "missile") {
          game_controller.score += 5;
          game_controller.missiles_active--;
       }
       this.alive = false;
     }

    }    

  }

function Turret(x, y) {
  this.alive = true;
  this.x = x;
  this.y = y;
  this.available_missiles = 15;
  this.missile_count = 10;
  this.arsenal = [this.missile_count];
  this.is_out = false;
  for(var i = 0; i < this.missile_count; i++) {
    this.arsenal[i] = new Missile();
  }

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
  
  this.launch  = function(target_x, target_y) {
    var launched = false;
    var i = 0;
    while(!launched) {
        if(i > this.missile_count){
          console.log("out of missiles!");
          break;
        }
        if(!this.arsenal[i].alive) {
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

  this.drawMissiles = function() {
    for(var i = 0; i < this.missile_count; i++) {
      if(this.arsenal[i].alive) {
        this.arsenal[i].move();
        this.arsenal[i].drawMissile(red0, red1);
      }
    }  
  }

  this.destroy = function() {
    this.alive = false;
    this.available_missiles = 0;
  }

  this.reset = function() {
    for(var i = 0; i < this.missile_count; i++) {
      this.arsenal[i].alive = false;
    }
  }
} //Turret

function MissileController() {
  this.color0;
  this.color1;
  this.missile_count = 30;
  this.arsenal = [this.missile_count];
  for(var i = 0; i < this.missile_count; i++) {
    this.arsenal[i] = new Missile();
  }
  this.launch  = function() {
    //choose a target
    var chosen = false;
    while(!chosen) {
      var choose = Math.floor(Math.random() * 6);
      //console.log("potential target: " + choose);
      switch(choose) {
        case 0: 
          //if(turret1.alive) {
            this.target_x = turret1.x;
            this.target_y = turret1.y;
            chosen = true;
          //}
          break;
        case 1:
          //if(turret2.alive) {
            this.target_x = turret2.x;
            this.target_y = turret2.y;
            chosen = true;
          //}
          break;
        case 2:
          //if(city1.alive) {
            this.target_x = city1.x;
            this.target_y = city1.y;
            chosen = true;
          //}
          break;
        case 3:
          //if(city1.alive) {
            this.target_x = city1.x;
            this.target_y = city1.y;
            chosen = true;
          //}
          break;
        case 4:
          //if(city2.alive) {
            this.target_x = city2.x;
            this.target_y = city2.y;
            chosen = true;
          //}
          break; 
        case 5:
          //if(city3.alive) {
            this.target_x = city3.x;
            this.target_y = city3.y;
            chosen = true;
          //}
          break;
        default:
          //if(turret1.alive) {
            this.target_x = turret1.x;
            this.target_y = turret1.y;
            chosen = true;
          //}
          break;     
      }
    }

    this.launch_x = canvas_w - (Math.floor(Math.random() * canvas_w));
    this.launch_y = 0;
    
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

  this.drawMissiles = function() {
    for(var i = 0; i < this.missile_count; i++) {
      if(this.arsenal[i].alive) {
        this.arsenal[i].move();
        this.arsenal[i].drawMissile(this.color0, this.color1);
      }
    }  
  }

  this.reset = function() {
    for(var i = 0; i < this.missile_count; i++) {
      this.arsenal[i].alive = false;
    }
  }
}

function City() {
  var alive;

  this.init = function(x, y) {
    this.alive = true;
    this.x = x;
    this.y = y;
  }

  this.draw = function() {
    with(cities_ctx) {
      if(this.alive) {
        console.log("drawing city");
        fillStyle = city_color0;
        fillRect(this.x, this.y - 20, 20, 20);
      }
      if(!this.alive) {
        clearRect(this.x, this.y - 20, 20, 20);
      }
    }
  }

  this.destroy = function() {
    if(this.alive){
      game_controller.city_count--;
    }
    this.alive = false;
    this.draw();
  }
}

function Explosion () {
  this.color0 = red0;
  this.color1 = red1;
  this.alive = false;
  //this.is_growing = true;
  //this.is_shrinking = false;

  this.init = function(x, y, color0, color1) {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.color0 = color0;
    this.color1 = color1;
    this.radius = 5;
  }

  this.grow = function() {
    this.radius += 3;
    if(this.radius > 50) {
      this.alive = false;
      //this.is_growing = false;
      //this.is_shrinking = true;
    }
  }

/*
  this.shrink = function() {
    this.radius -= 3;
    if(this.radius <= 5) {
      this.alive = false;
      //reset the grow/shrink values so that the explosion objects
      //can be reused. 
      //this.is_growing = true;
      //this.is_shrinking = false;
    } 
  }
  */

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

function ExplosionController() {
  this.explosion_count = 40;
  this.exp_pool = [this.explosion_count];
  for(var i = 0; i < this.explosion_count; i++) {
    this.exp_pool[i] = new Explosion();
  }

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

  this.drawExplosions = function() {
    for(var i = 0; i < this.explosion_count; i++) {
      if(this.exp_pool[i].alive) {
        //console.log("growing and drawing explosion " + i);
        //if(this.exp_pool[i].is_growing) {
        this.exp_pool[i].grow();
        //} else if(this.exp_pool[i].is_shrinking) {
          //this.exp_pool[i].shrink();
        //}
        this.exp_pool[i].draw(this.exp_pool[i].color0, this.exp_pool[i].color1);
      }
    }  
  }

  this.reset = function() {
    for(var i = 0; i < this.explosion_count; i++) {
      this.exp_pool[i].alive = false;
    }
  }
}


function GameController() {
   this.score = 0;
   this.wave = 0;
   this.missiles_to_fire = 5;
   this.missiles_fired = 0;
   this.missiles_active = 0;
   this.missile_speed = .5;
   this.missile_color = 0;
   this.city_count = 3;
   this.missiles_used = 0;
   this.difficulty = 0;
   this.game_paused = false;
   this.game_over = false;
   this.unpause_timer = 0;

   //this.levelEnd = function() {
   // this.score += (this.city_count * 10) + (30 - this.missiles_used);
   // this.difficulty++;
   //}

   this.startWave = function() {
    console.log("actually unpausing!");
    this.game_paused = false;
    this.unpause_timer = 0;
    this.drawUnPaused();

    //make everything alive again.
    turret1.alive = true;
    turret2.alive = true;

    //maybe make these alive again. 
    //I'll have to think about it.
    //city1.alive = true;
    //city2.alive = true;
    //city3.alive = true;

    //city1.draw();
    //city2.draw();
    //city3.draw();

    //give the turrets more missiles.
    turret1.available_missiles = 15;
    turret2.available_missiles = 15;

    this.missile_speed += .5;
    this.missiles_to_fire += 2;

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

   this.endWave = function() {
    this.wave++;
    this.game_paused = true;
    this.drawPaused();
   }

   this.endGame = function() {
    this.game_over = true;
   }

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

    if(this.game_over) {
      this.drawGameOver();
    }

    if(!this.game_paused && !this.game_over) {
      this.drawScore();
    }  
   }

   this.drawScore = function() {
    with(text_ctx) {
        fillStyle = "white";
        font = "bold 16px Arial";
        clearRect(0, 0, 200, 200);
        fillText("Score: " + this.score, 5, 25);
    }
   }

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

   this.drawUnPaused = function() {
      //clear any leftover missiles from the screen
      missile_controller.reset();
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


function update() {

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

      var derp = Math.floor(Math.random() * 100);

      if(derp == 0) {
        if(game_controller.missiles_fired != game_controller.missiles_to_fire) {
          missile_controller.launch();
          
          game_controller.missiles_fired++;
          game_controller.missiles_active++;
        } 
      }

      main_ctx.putImageData(last_image,0,0);

      turret1.draw(); 
      turret1.drawMissiles();
      turret2.draw(); 
      turret2.drawMissiles();

      missile_controller.drawMissiles();
      explosion_controller.drawExplosions();
    }
    game_controller.step();
	}