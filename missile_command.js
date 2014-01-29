//BEGIN LIBRARY CODE
var main;
var background;
var cities;

var cities_ctx;
var background_ctx;
var main_ctx;

var canvas_w;
var canvas_h;

var background;
var background_image;

var missile;
var missile_controller;
var explosion_controller;

var turret1;
var turret2;
//var turret3;
var curr_turret;

var city1;
var city2;
var city3;

var image_repository;

var missileExists = false;
 
// physical variables
var g = 2; 		// gravity
var fac = 0.8; 		// velocity reduction factor per bounce
//var radius = 3; 	// ball radius

//colors for missile trails
var color0 = "#FF1C0A";
var color1 = "#800000";
var color2 = "#ABABAB";
var color3 = "#BABABA";

var color0 = "#FF1C0A";
var color1 = "#800000";
var color2 = "#ABABAB";
var color3 = "#BABABA";

//colors for cities;
var city_color0 = "#07EEF2";
var city_color1 = "#D6FEFF";
var city_color2 = "#6BFCFF";

 
// initialise position and velocity of ball
var x = 50;
var y = 50;
var vx = 2;
var vy = 0;

// ensure that code does not run before page has loaded
window.onload = init;  

function init() {
    console.log("Initializing!");

    //image_repository = new image_repository();
    //image_repository.init(); 

    main = document.getElementById("main");
    background = document.getElementById("background");
    cities = document.getElementById("cities");

    canvas_w = main.width;
    canvas_h = main.height;

    main.addEventListener("mousedown", onClick, false);

    main_ctx = main.getContext('2d');
    background_ctx = background.getContext('2d');
    cities_ctx = cities.getContext('2d');

    //background_image = new Image();
    //background_image.onLoad = function() {
    //  background_ctx.drawImage(background_image, 0, 0);
    //  console.log("background loaded");
    //}
    //background_image.onLoad();
    //background_image.src = "background.png";

    background = new Background();
    //background.init();

    //turret1 = new Turret(canvas_w / 2, canvas_h - 100);
    turret1 = new Turret(0 + 50, canvas_h - 100);
    turret2 = new Turret(canvas_w - 50, canvas_h - 100);
    curr_turret = 1;

    city1 = new City();
    city2 = new City();
    city3 = new City();

    missile_controller = new MissileController();
    explosion_controller = new ExplosionController();

    city1.init(canvas_w / 2, canvas_h);
    city2.init(0 + 150, canvas_h);
    city3.init(canvas_w - 150, canvas_h);

    background.draw();

    city1.draw();
    city2.draw();
    city3.draw();

    return setInterval( update, 1000/60 ); // 60 frames per second
  }

function onClick(event)
  {
    var x = new Number();
    var y = new Number();

    if (event.x != undefined && event.y != undefined)
    {
      x = event.x;
      y = event.y;
    }
    else // Firefox method to get the position
    {
      x = event.clientX + document.body.scrollLeft +
          document.documentElement.scrollLeft;
      y = event.clientY + document.body.scrollTop +
          document.documentElement.scrollTop;
    }	

    if(curr_turret == 1) {
      turret1.launch(x,y);
      curr_turret = 2;
    }
    else if(curr_turret == 2) {
      turret2.launch(x,y);
      curr_turret = 1;
    }
    //missile = new Missile();
    //missile.spawn(x, y, .1);
    //console.log("creating new missile.");
    //console.log("obj: " + missile + " target_x: " + x + " target_y " + y);
    //missileExists = true;

    //console.log("mouse x" + x);
    //console.log("mouse y" + y);
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

        //this.in_x_range = false;
        //this.in_y_range = false;
        //this.start_x = canvas.width - Math.floor(Math.random() * canvas.width + 1);
        //this.start_y = 0;

        //this.start_x = canvas.width - Math.floor(Math.random() * canvas.width + 1);
        //this.start_y = canvas.height;

        //console.log("missile start pos: " + this.start_x + ", " + this.start_y);
        //console.log("missile target pos: " + this.target_x + ", " + this.target_y);

        this.speed = speed;

        this.x = this.start_x;
        this.y = this.start_y;

        this.dirx = this.target_x - this.start_x;
        this.diry = this.target_y - this.start_y;

        this.angle = Math.atan2(this.diry, this.dirx);

        //console.log("angle: " + this.angle);
      }

    this.move = function() {

      var sin = Math.sin(this.angle) * this.speed;
      var cos = Math.cos(this.angle) * this.speed;

      this.x += cos;
      this.y += sin;

      //if the missile 
      if(this.type == "rocket") {
        if(this.y < this.target_y) {
          this.explode();
        }
      } else if(this.type = "missile") {
        if(this.y > this.target_y) {
          this.explode();
        }
      }

      //TODO: check for collision with explosion
      for(var i = 0; i < explosion_controller.explosion_count; i++) {
        var explosion = explosion_controller.exp_pool[i];
        //if the explosion is active
        if(explosion.alive) {
          //and it seems like we're in range
          if(this.y <= explosion.y + 51 && this.y >- explosion.y - 51) {
            //check for collision
            //console.log("missile in range, checking for collision");
            if((Math.pow((this.x - explosion.x),2) + Math.pow((this.y - explosion.y),2)) < (Math.pow(explosion.radius, 2))) {
              if(explosion.x != this.x && explosion.y != this.y) {
                console.log("valid collision detected");
                this.explode();
              }
            }
          }
        }
      }
     }  

    this.drawMissile = function() {
      if(this.alive) {
        with(main_ctx) {
          //console.log("drawing missile");
          switch(Math.floor(Math.random() * 4)) {
            case 0:
              fillStyle = color0;
              break;
            case 1: 
              fillStyle = color1;
              break;
            case 2:
              fillStyle = color2;
              break;
            default:
              fillStyle = color3;
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

          fillRect(this.target_x + 15, this.target_y, 5, 5);
          fillRect(this.target_x - 15, this.target_y, 5, 5);
          fillRect(this.target_x, this.target_y + 15, 5, 5);
          fillRect(this.target_x, this.target_y - 15, 5, 5);
          closePath();
          fill();

          //create an acceleration effect
          if(this.type == "rocket") {
            this.speed += .01;
          }
        } 
      }
      
     this.explode = function() {
      //console.log("exploding!")
       explosion_controller.activateExplosion(this.x, this.y);
       this.alive = false;
     }

    }    

  }

function Turret(x_pos, y_pos) {
  this.alive = true;
  this.x_pos = x_pos;
  this.y_pos = y_pos;
  this.missile_count = 10;
  this.arsenal = [this.missile_count];
  for(var i = 0; i < this.missile_count; i++) {
    this.arsenal[i] = new Missile();
  }

  this.draw = function() {
    with(cities_ctx) {
      fillStyle = color0;
      fillRect(x_pos, y_pos - 20, 20, 20);
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
          this.arsenal[i].spawn(this.x_pos, this.y_pos, target_x, target_y, 2);
          launched = true;
        } else {
          i++;
        } 
    }
    //this.arsenal.launch(this.x_pos, this.y_pos, target_x, target_y);
  }

  this.drawMissiles = function() {
    for(var i = 0; i < this.missile_count; i++) {
      if(this.arsenal[i].alive) {
        this.arsenal[i].move();
        this.arsenal[i].drawMissile();
      }
    }  
  }
} //Turret

function MissileController() {
  //this.x_pos = x_pos;
  //this.y_pos = y_pos;
  this.missile_count = 30;
  this.arsenal = [this.missile_count];
  for(var i = 0; i < this.missile_count; i++) {
    this.arsenal[i] = new Missile();
  }
/*
  this.draw = function() {
    with(cities_ctx) {
      fillStyle = color0;
      fillRect(x_pos, y_pos, 20, 20);
    }
  }
 */ 
  this.launch  = function() {
    //choose a target
    var chosen = false;
    while(!chosen) {
      var choose = Math.floor(Math.random() * 6);
      //console.log("potential target: " + choose);
      switch(choose) {
        case 0: 
          if(turret1.alive) {
            this.target_x = turret1.x_pos;
            this.target_y = turret1.y_pos;
            chosen = true;
          }
          break;
        case 1:
          if(turret2.alive) {
            this.target_x = turret2.x_pos;
            this.target_y = turret2.y_pos;
            chosen = true;
          }
          break;
        case 2:
          if(city1.alive) {
            this.target_x = city1.x_pos;
            this.target_y = city1.y_pos;
            chosen = true;
          }
          break;
        case 3:
          if(city1.alive) {
            this.target_x = city1.x_pos;
            this.target_y = city1.y_pos;
            chosen = true;
          }
          break;
        case 4:
          if(city2.alive) {
            this.target_x = city2.x_pos;
            this.target_y = city2.y_pos;
            chosen = true;
          }
          break; 
        case 5:
          if(city3.alive) {
            this.target_x = city3.x_pos;
            this.target_y = city3.y_pos;
            chosen = true;
          }
          break;
        default:
          if(turret1.alive) {
            this.target_x = turret1.x_pos;
            this.target_y = turret1.y_pos;
            chosen = true;
          }
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
          this.arsenal[i].spawn(this.launch_x, this.launch_y, this.target_x, this.target_y, .8);
          launched = true;
        } else {
          i++;
        } 
    }
    //this.arsenal.launch(this.x_pos, this.y_pos, target_x, target_y);
  }

  this.drawMissiles = function() {
    for(var i = 0; i < this.missile_count; i++) {
      if(this.arsenal[i].alive) {
        this.arsenal[i].move();
        this.arsenal[i].drawMissile();
      }
    }  
  }
}

function Background() {
  this.background_img = new Image();
  this.background_img.onLoad = function() {
    background_ctx.drawImage(this.background_img, 100, 10);
  }
  this.background_img.src = "background.png";
  this.draw = function() {
    console.log("drawing background");
    background_ctx.drawImage(this.background_img, 100, 10);
    //this.background_img = new Image();
    //this.background_img.onLoad = function() {
    //  console.log("this is happening");
    //  background_ctx.drawImage(this.background_img, 100, 100);
    //};
    //this.background_img.src = 'http://www.html5canvastutorials.com/demos/assets/darth-vader.jpg';
    
    //fillStyle = "#BABABA";
    //background_ctx.fillRect(0,0, 50, 50);
  }
  
}

function City() {
  var alive;
  var x_pos;
  var y_pos;

  this.init = function(x_pos, y_pos) {
    this.alive = true;
    this.x_pos = x_pos;
    this.y_pos = y_pos;
    //this.image = new Image();
    //this.image.src = "imgs/city";
  }

  this.draw = function() {
    with(cities_ctx) {
      //console.log("drawing city");
      switch(Math.floor(Math.random() * 4)) {
        case 0:
          fillStyle = city_color0;
          break;
        case 1: 
          fillStyle = city_color1;
          break;
        case 2:
          fillStyle = city_color2
          break;
        default:
          fillStyle = city_color0;
          break;
      }
      fillRect(this.x_pos + 5, this.y_pos - 4, 5, 15);
      fillRect(this.x_pos - 5, this.y_pos - 7, 5, 25);
      fillRect(this.x_pos + 2, this.y_pos - 6, 5, 5);
      fillRect(this.x_pos - 4, this.y_pos - 3, 5, 35);
    }
  }
}

function Explosion () {
  this.alive = false;

  this.init = function(x, y) {
    this.alive = true;
    this.x = x;
    this.y = y;
    this.radius = 5;
  }

  this.grow = function() {
    this.radius += 2;
    if(this.radius > 50) {
      this.alive = false;
    }
  }

  this.draw = function() {
    with(main_ctx) {
      switch(Math.floor(Math.random() * 4)) {
            case 0:
              fillStyle = color0;
              break;
            case 1: 
              fillStyle = color1;
              break;
            case 2:
              fillStyle = color2;
              break;
            default:
              fillStyle = color3;
              break;
      }
      beginPath();
      arc(this.x, this.y, this.radius, 0, 2*Math.PI, true);
      closePath();
      /*
      beginPath();
      arc(this.x + Math.floor(Math.random() * this.radius), this.y + Math.floor(Math.random() * this.radius), Math.floor(Math.random() * this.radius), 0, 2*Math.PI, true);
      closePath()
      beginPath();
      arc(this.x - Math.floor(Math.random() * this.radius), this.y - Math.floor(Math.random() * this.radius), Math.floor(Math.random() * this.radius), 0, 2*Math.PI, true);
      closePath()
      beginPath();
      arc(this.x + Math.floor(Math.random() * this.radius), this.y + Math.floor(Math.random() * this.radius), Math.floor(Math.random() * this.radius), 0, 2*Math.PI, true);
      closePath()
      beginPath();
      arc(this.x - Math.floor(Math.random() * this.radius), this.y - Math.floor(Math.random() * this.radius), Math.floor(Math.random() * this.radius), 0, 2*Math.PI, true);
      closePath()
      beginPath();
      arc(this.x - Math.floor(Math.random() * this.radius), this.y + Math.floor(Math.random() * this.radius), Math.floor(Math.random() * this.radius), 0, 2*Math.PI, true);
      closePath()
      beginPath();
      arc(this.x + Math.floor(Math.random() * this.radius), this.y + Math.floor(Math.random() * this.radius), Math.floor(Math.random() * this.radius), 0, 2*Math.PI, true);
      closePath()
      beginPath();
      arc(this.x - Math.floor(Math.random() * this.radius), this.y - Math.floor(Math.random() * this.radius), Math.floor(Math.random() * this.radius), 0, 2*Math.PI, true);
      closePath()
      //closePath();
      */
      fill();
    }  
  }
}

function ExplosionController() {
  this.explosion_count = 40;
  this.exp_pool = [this.explosion_count];
  for(var i = 0; i < this.explosion_count; i++) {
    this.exp_pool[i] = new Explosion();
    //console.log("creating new Explosion. Alive? : " + this.exp_pool[i].alive);
  }

  this.activateExplosion = function(x, y) {
    //get first inactive explosion
    var has_activated = false;
    var i = 0;
    while(!has_activated && i <= this.explosion_count) {
      if(!this.exp_pool[i].alive) {
        this.exp_pool[i].init(x, y);
        has_activated = true;
        //console.log("exp index at: " + i);
        //console.log("activating explosion at :" + x + ", " + y);
        //console.log("has activated");
      }
      i++;
    }
    //console.log("out of the loop");
    if(i >= this.explosion_count) {
      console.log("out of explosions!");
    }
  }

  this.drawExplosions = function() {
    for(var i = 0; i < this.explosion_count; i++) {
      if(this.exp_pool[i].alive) {
        //console.log("growing and drawing explosion " + i);
        this.exp_pool[i].grow();
        this.exp_pool[i].draw();
      }
    }  
  }
}

function update() {

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

    var derp = Math.floor(Math.random() * 200);

    if(derp == 0) {
      missile_controller.launch();
    }

    main_ctx.putImageData(last_image,0,0);

    turret1.draw(); 
    turret1.drawMissiles();
    turret2.draw(); 
    turret2.drawMissiles();
    //turret3.draw(); 
    //turret3.drawMissiles();
    missile_controller.drawMissiles();
    explosion_controller.drawExplosions();

    //city1.draw();

    

    /*
       
    var p = particleList.first;
    while (p != null) {
      context.fillStyle = p.color;
      context.beginPath();
      context.arc(p.x, p.y, p.rad, 0, 2*Math.PI, false);
      context.closePath();
      context.fill();
      p = p.next;
    }
   

    if(missileExists) {
      missile.move();
      missile.drawMissile();
    }
     */
    //move the missile

      /*
  		// update velocity
  		vy += g; // gravity
 
  		// update position
  		x += vx;
  		y += vy;
 
  		// handle bouncing
  		if (y > canvas.height - radius)
		{
    			y = canvas.height - radius;
    			vy *= -fac;
  		}
 
  		// wrap around
  		if(x > canvas.width + radius)
		{
    		x = -radius;
  		}
		drawBall();
    */
	}

	function drawBall(missile) 
	{
		with(main_ctx)
		{
        	this.missile = missile;
		      fillStyle = color0;
        	beginPath();
        	arc(this.missile.x, this.missile.y, 50, 0, 2*Math.PI, true);
        	closePath();
        	fill();
          //clearRect(0, 0, canvas.width, canvas.height); 
		}
	};