//BEGIN LIBRARY CODE
var canvas;
var context;
var missile;
var missileExists = false;
 
// physical variables
var g = 2; 		// gravity
var fac = 0.8; 		// velocity reduction factor per bounce
var radius = 3; 	// ball radius
var color0 = "#FF1C0A";
var color1 = "#800000";
var color2 = "#ABABAB";
var color3 = "#BABABA";
 
// initialise position and velocity of ball
var x = 50;
var y = 50;
var vx = 2;
var vy = 0;

// ensure that code does not run before page has loaded
window.onload = init; 

function init()
  {
    canvas = document.getElementById("canvas");
    canvas.addEventListener("mousedown", getPosition, false);
    context = canvas.getContext('2d');

    return setInterval( update, 1000/60 ); // 60 frames per second
  }

  function getPosition(event)
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

    missile = new Missile();
    missile.spawn(x, y, 5);
    console.log("creating new missile.");
    console.log("obj: " + missile + " target_x: " + x + " target_y " + y);
    missileExists = true;

    //console.log("mouse x" + x);
    //console.log("mouse y" + y);
  }

  function Missile() {

    var x;
    var y;

    this.spawn = function(target_x, target_y, speed) {
        console.log("missile spawned");
        this.alive = true;

        this.distance = 0;

        this.start_x = canvas.width - Math.floor(Math.random() * canvas.width + 1);
        this.start_y = 0;

        console.log("missile start pos: " + this.start_x + ", " + this.start_y);

        this.target_x = target_x;
        this.target_y = target_y

        this.speed = speed;

        this.x = this.start_x;
        this.y = this.start_y;

        this.dirx = this.target_x - this.start_x;
        this.diry = this.target_y - this.start_y;

        this.angle = Math.atan2(this.diry, this.dirx);

        console.log("angle: " + this.angle);
      }

    this.move = function() {

      var sin = Math.sin(this.angle) * this.speed;
      var cos = Math.cos(this.angle) * this.speed;

      this.x += cos;
      this.y += sin;

      //console.log("missile pos: " + Math.floor(this.x) + ", " + Math.floor(this.y));

      if((Math.floor(this.x) <= this.target_x + 15 && Math.floor(this.x) >= this.target_x - 15)
          && ((Math.floor(this.y) >= this.target_y + 15) && (Math.floor(this.y) >= this.target_y - 15))) {
        this.explode();
        missileExists = false;
      }

     }  

    this.drawMissile = function() {
      if(this.alive) {
        with(context) {
          //console.log("drawing missile");
          //clearRect(0, 0, canvas.width, canvas.height);

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

          //var oldx = this.x;
          //var oldy = this.y;

          //create a wobble maybe!
          //this.x += Math.random() * 10 + Math.random() * -10;
          //this.y += Math.random() * 10 + Math.random() * -10;

          beginPath();
          //arc(this.x, this.y, radius, 0, 2*Math.PI, true);
          fillRect(this.x + (Math.random() * 4 + Math.random() * -4), this.y + (Math.random() * 4 + Math.random() * -4),
                       4 + (Math.random() * 7), 4 + (Math.random() * 4));
          fillRect(this.x + (Math.random() * 4 + Math.random() * -4), this.y + (Math.random() * 4 + Math.random() * -4),
                       4 + (Math.random() * 7), 4 + (Math.random() * 4));
          fillRect(this.x + Math.floor((Math.random() * 15) + (Math.random() * -15)), 
                       this.y + Math.floor((Math.random() * 15) + (Math.random() * -15)),
                       1 + (Math.random() * 4), 1 + (Math.random() * 4));
          closePath();
          fill();

          //this.x = oldx;
          //this.y = oldy;
        } 
      }
      
     this.explode = function() {
       console.log("BOOM!"); 
       drawBall();
       this.alive = false;
     }

    }    

  }

   	function update()
	{
/* 
    var last_image = context.getImageData(0,0,canvas.width,canvas.height);
    var i;
    var pixel_data = last_image.data;
    var len = pixel_data.length;
    for (i = 3; i < len; i += 4) {
      //change alpha
      pixel_data[i] -= 1.5;
    }
    context.putImageData(last_image,0,0);
    
       
    var p = particleList.first;
    while (p != null) {
      context.fillStyle = p.color;
      context.beginPath();
      context.arc(p.x, p.y, p.rad, 0, 2*Math.PI, false);
      context.closePath();
      context.fill();
      p = p.next;
    }
    */

    if(missileExists) {
      missile.move();
      missile.drawMissile();
    }
    
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

	function drawBall() 
	{
		with(context)
		{
        	
		      fillStyle = color0;
        	beginPath();
        	arc(missile.x, missile.y, 50, 0, 2*Math.PI, true);
        	closePath();
        	fill();
          //clearRect(0, 0, canvas.width, canvas.height); 
		}
	};