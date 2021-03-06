// VCE Project - Boundary class
//
// A boundary class compatible with p5.js and matter.js.
//
// Requires:
// - matter.js
// - p5.js 
// 
// Adpated from Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for: https://youtu.be/uITcoKpbQq4
//
// To DO:
// - add ability to show boundaries as walls
// - use utils.get_absolute_coordinates in makeBoundaries
//
// Andrew D. McGuire 2018
// a.mcguire227@gmail.com
//----------------------------------------------------------


function Boundary(x, y, w, h, a, world, mode=CENTER) {
    /* Create a boundary and add it to the target matter.World.

       Args:
           - x (float) : The x-coordinate of the new boundary.
	   - y (float) : The y-coordinate of the new boundary.
           - w (float) : The width of the new boundary.
           - h (float) : The height of the new boundary.
	   - world (matter.World) : The matter world to add the
             boundary body to. If world is null then the boundary is
             created, but not added to the world.
           - mode (p5 rectMode option) : The p5 rectMode to use. This
             sets the precise meaning on the x, y args. Only LEFT and
             CENTER are currently supported. CENTER is assumed by
             default.

    */

    // initialisation
    this.options = {
	friction: 0,
	restitution: 0.95,
	angle: a,
	isStatic: true
    };
    this.colour = {
	active : 'rgba(255, 0, 0, 0.5)',
	inactive : 'rgba(0, 0, 0, 0.5)'
    };
    this.name = ''
    

    // translate coordinates if required
    if (mode == LEFT) {
	var pos = this.left2center(x, y, w, h, a);
	x = pos.x;
	y = pos.y;	
    }
    else if (mode != CENTER && mode !== 'undefined') {
	throw new TypeError("mode arg must be either CENTER or LEFT.")
    };


    // set the object attributes
    this.body = Bodies.rectangle(x, y, w, h, this.options);
    this.w = w;
    this.h = h;	
    this.active = false;
    this.rpoint = 10.0;
    this.world = world;
    if (this.world !== undefined) {
	World.add(this.world, this.body);
    };

    
    // class methods
    this.show = function() {

	this.show_shape();
	this.show_center();
	this.show_lcorner();
	this.show_name();
	
    };

    
    this.show_shape= function() {
	push();
	translate(this.body.position.x, this.body.position.y);
	rotate(this.body.angle);
	rectMode(CENTER);
	stroke(255)
	strokeWeight(1);
	if (this.active) { fill(this.colour.active)}
	else { fill(this.colour.inactive) };
	rect(0, 0, this.w, this.h);
	pop();
    };
    

    this.show_center = function() {
	// show central point
	push()
	fill(255,105,180);
	noStroke();
	translate(this.body.position.x, this.body.position.y);
	ellipse(0, 0, this.rpoint);
	pop()
    };

    
    this.show_lcorner = function() {
	// show corner point
	push();
	var l_pos = this.center2left(this.body.position.x, this.body.position.y, this.w, this.h, this.body.angle)
	fill(135, 206, 250);
	noStroke();
	translate(l_pos.x, l_pos.y);
	ellipse(0, 0, this.rpoint);
	pop();
    };

    this.show_name = function() {
	push();
	textAlign(CENTER, CENTER);
	textSize(12);
	fill(255);
	noStroke();
	text(this.name, this.body.position.x, this.body.position.y - 20);
	pop();
    };


    this.removeFromWorld = function() {
	if (this.world !== undefined) {
	    World.remove(this.world, this.body);
	};
    };

    
    this.move = function(x, y) {
	// move boundary to position (x, y)
	var offset = {
	    x : x - this.body.position.x,
	    y : y - this.body.position.y
	};
	Body.translate(this.body, offset);	
    };


    this.translate = function(dx, dy) {
	var new_pos = {
	    x : this.body.position.x + dx,
	    y : this.body.position.y + dy
	}
	Body.setPosition(this.body, new_pos);
    };

    
    this.rotate = function(angle) {
	Body.rotate(this.body, angle);
    };

    
    this.scale = function(scaleX, scaleY) {
	// need to destroy current body and create the scaled body
	// since Body.scale does not work well with rotated
	// rectangles...
	if (this.world !== undefined) {
	    World.remove(this.world, this.body)
	};
	this.w = this.w*scaleX;
	this.h = this.h*scaleY;
	this.options.angle = this.body.angle;
	this.body = Bodies.rectangle(this.body.position.x, this.body.position.y, this.w, this.h, this.options);
	if (this.world !== undefined) {
	    World.add(this.world, this.body);
	};
    };


    this.get_coordinates = function() {
	return {
	    x : this.body.position.x,
	    y : this.body.position.y,
	    w : this.w,
	    h : this.h,
	    angle : this.body.angle
	};
    };


    this.get_positional_scale_factors = function(xmax, ymax, img_width, img_height) {
	// Compute the positional scaling factors.
	// Assumes that Boundary coordinates are constructed using:
	// x : (xmax + x_scaling*img_width)/2
	// y : (ymax + y_scaling*img_height)/2
	// w : w_scaling*img_width
	// h : h_scaling*img_height
	// a : a
	
	var absolute = this.get_coordinates();
	return {
	    x_scaling : (2.0*absolute.x - xmax)/img_width,
	    y_scaling : (2.0*absolute.y - ymax)/img_height,
	    w_scaling : absolute.w/img_width,
	    h_scaling : absolute.h/img_height,
	    a : this.body.angle
	};
    };

    
    
    this.is_in_bounds = function(x, y) {
	// Check if x, y lies within the bounds of the body.
	
	// rotate the point around the center of mass of the reactangle
	var rotated_point = utils.rotate_point_with_body(this.body, { x : x, y : y});

	// check if rotated mouse coordinates are in the bounds of the reactangle
	if (rotated_point.x > this.body.position.x - 0.5*this.w && rotated_point.x < this.body.position.x + 0.5*this.w) {
	    if (rotated_point.y > this.body.position.y - 0.5*this.h && rotated_point.y < this.body.position.y + 0.5*this.h) {
 		return true;
	    };
	};
	return false
	
    };


    this.is_on_corner = function(x, y) {
	var corner_point = this.center2left(this.body.position.x, this.body.position.y, this.w, this.h, this.body.angle);
	var dist = Math.sqrt(Math.pow(corner_point.x - x, 2) + Math.pow(corner_point.y - y, 2));
	if (dist <= this.rpoint ) {
	    return true;
	};
	return false;
    };
    
    
    this.mousePressed = function(mouseX, mouseY) {
	if (this.is_in_bounds(mouseX, mouseY)) { this.active = true; }
	else { this.active = false; };
    };
    
    
    this.mouseDragged = function(mouseX, mouseY) {
	if (this.active) {
	    this.move(mouseX, mouseY);
	};
    };


    this.keyPressed = function() {
	if (this.active) {
	    if (keyCode == 82) {
		this.rotate(+PI/24);
	    }
	    else if (keyCode == 76) {
		this.rotate(-PI/24);
	    }
	    else if (keyCode == 39) {
		this.scale(1.05, 1.0);
	    }
	    else if (keyCode == 37) {
		this.scale(0.95, 1.0);
	    }
	    else if (keyCode == 38) {
		this.scale(1.0, 1.05);
	    }
	    else if (keyCode == 40) {
		this.scale(1.0, 0.95);
	    }
	    else if (keyCode == 27) {
		this.active = false; // esc
	    }
	};
    };


};


Boundary.prototype.center2left = function(x, y, w, h, a) {
    return {
	x : x + 0.5*h*Math.sin(a) + 0.5*w*Math.cos(PI-a),
	y : y - 0.5*h*Math.cos(a) - 0.5*w*Math.sin(PI-a)
    };
};


Boundary.prototype.left2center = function(x, y, w, h, a) {
    return {
	x : x - 0.5*h*Math.sin(a) - 0.5*w*Math.cos(PI-a),
	y : y + 0.5*h*Math.cos(a) + 0.5*w*Math.sin(PI-a)
    };
   
};


function makeBoundaries(pos_consts, xmax, ymax, img_width, img_height, world) {
    // Build mutiple boundaries from a list of positional constants
    // (scaling constants).
    //
    // Args:
    //
    // Returns:
    //     - boundaries (array of Boundary objects)

    var boundaries = []
    for (var i = 0; i < pos_consts.length; i++) {
	var x = (xmax + pos_consts[i].x_scaling*img_width)/2;
	var y = (ymax + pos_consts[i].y_scaling*img_height)/2;
	var w = pos_consts[i].w_scaling*img_width;
	var h = pos_consts[i].h_scaling*img_height;
	var a = pos_consts[i].a;
	boundaries.push(new Boundary(x, y, w, h, a, world, CENTER));
    };
    return boundaries;
};
