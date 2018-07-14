// VCE Project - distillation_graphics.js
//
// This class is intended to provide a graphical representation of a
// distillation column.  Its primary attribute is a list of
// vce_ensemble.Ensemble objects. Each ensemble object in this list
// represents a component in the main reaction. THIS CLASS IS UNDER
// DEVELOPMENT AND SHOULD NOT BE CONSIDERED STABLE. ONLY ONE REACTION
// IS SUPPORTED FOR THE MOMENT.
//
//
//
// Requires:

//
// Andrew D. McGuire 2018
// a.mcguire227@gmail.com
//
// To do:
//
//----------------------------------------------------------
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint = Matter.Constraint;

function DistillationGraphics(canvas, column_img, debug) {
    /*
      
    Args:
        cavas (p5.canvas) : The p5 canvas to render on top of.

    */

    // Set the main class attributes
    this.canvas = canvas;
    this.xmax = canvas.width;
    this.ymax = canvas.height;
    this.isf = 0.85;
    this.engine = Engine.create();
    this.world = this.engine.world;
    this.column_img = column_img;
    this.sid = getImgScaledDimensions(this.column_img, this.isf, this.ymax);
    this.show_boundaries_log = true;
    this.debug = debug;
    

    // Build the ensemble array (one ensemble for each component)
    this.Ensembles = [];

    // Compute the ratio between graphical particles to 'real' particles. 
    // var component_n_init_0 = Math.round(this.Reac.conc[0]*n_init/cT);
    // this.k = component_n_init_0/(this.Reac.conc[0]*this.Reac.V)
    // ;


    // Build the boundaries (ideally these co-ordinates should be loaded from file...)
    this.Boundaries = [];
    var x_mid = (this.xmax)/2;
    var y_mid = (this.ymax)/2;
    var wb = 20.0;
    var wc = this.sid.width;
    var hc = this.sid.height;
    // colum main right
    this.Boundaries.push(new Boundary(x_mid - 0.02*wc,
    				      y_mid - 0.34*hc,
    				      wb,
				      hc*0.515, 0.0,
    				      this.world,
				      LEFT));

    // column upper left
    this.Boundaries.push(new Boundary(x_mid - 0.325*wc,
    				      y_mid - 0.34*hc,
    				      wb,
				      hc*0.7, 0.0,
    				      this.world,
				      LEFT));

    
    // under reflux
    this.Boundaries.push(new Boundary(x_mid - 0.02*wc,
    				      y_mid - 0.34*hc,
    				      0.515*wc,
				      wb, 0.0,
    				      this.world,
				      LEFT));

    // reflux upper left
    this.Boundaries.push(new Boundary(x_mid - 0.045*wc,
    				      y_mid - 0.42*hc,
    				      0.26*wc,
				      wb*0.7, 0.0,
    				      this.world,
				      LEFT));
    
    // reflux upper right
    this.Boundaries.push(new Boundary(x_mid + 0.26*wc,
    				      y_mid - 0.42*hc,
    				      0.26*wc,
				      wb*0.7, 0.0,
    				      this.world,
				      LEFT));

    // condenser top
    this.Boundaries.push(new Boundary(x_mid + 0.12*wc,
    				      y_mid - 0.565*hc,
    				      0.26*wc,
				      wb, 0.0,
    				      this.world,
				      LEFT));

    
    // condenser feed top
    this.Boundaries.push(new Boundary(x_mid - 0.14*wc,
    				      y_mid - 0.53*hc,
    				      0.26*wc,
				      wb, 0.0,
    				      this.world,
				      LEFT));

    
    // condenser feed bottom
    this.Boundaries.push(new Boundary(x_mid - 0.105*wc,
    				      y_mid - 0.445*hc,
    				      0.22*wc,
				      wb*0.7, 0.0,
    				      this.world,
				      LEFT));
    
    // reboiler feed bottom
    this.Boundaries.push(new Boundary(x_mid - 0.18*wc,
    				      y_mid + 0.4*hc,
    				      0.3*wc,
				      wb, 0.0,
    				      this.world,
				      LEFT));

    // reboiler feed top
    this.Boundaries.push(new Boundary(x_mid - 0.18*wc,
    				      y_mid + 0.3*hc,
    				      0.3*wc,
				      wb, 0.0,
    				      this.world,
				      LEFT));
    
    
    // top of reboiler return pipe
    this.Boundaries.push(new Boundary(x_mid - 0.02*wc,
    				      y_mid + 0.115*hc,
    				      0.35*wc,
				      wb, 0.0,
    				      this.world,
				      LEFT));

    // bottom of reboiler return pipe
    this.Boundaries.push(new Boundary(x_mid - 0.02*wc,
    				      y_mid + 0.205*hc,
    				      0.235*wc,
				      wb, 0.0,
    				      this.world,
				      LEFT));
    

    // reboiler return right side
    this.Boundaries.push(new Boundary(x_mid + 0.265*wc,
    				      y_mid + 0.115*hc,
    				      wb,
				      0.23*hc, 0.0,
    				      this.world,
				      LEFT));

    
    
    // this.Boundaries.push(new Boundary(0.7*this.xmax,
    // 				      0.6*this.ymax,
    // 				      20,
    // 				      this.sid.height*0.52, 0.9*PI,
    // 				      this.world));
    // this.Boundaries.push(new Boundary((this.xmax+this.sid.width)/2+30,
    // 				      (this.ymax)/2,
    // 				      72, this.sid.height*0.7, 0.0,
    // 				      this.world));
    // this.Boundaries.push(new Boundary((this.xmax)/2,
    // 				      (this.ymax+1.25*this.sid.height)/2,
    // 				      this.sid.width, 72, 0.0,
    // 				      this.world));
    // this.Boundaries.push(new Boundary((this.xmax-this.sid.width*0.7)/2,
    // 				      (this.ymax+1.12*this.sid.height)/2,
    // 				      0.8*this.sid.width, 72, 0.5,
    // 				      this.world));
    // this.Boundaries.push(new Boundary((this.xmax+this.sid.width*0.7)/2,
    // 				      (this.ymax+1.12*this.sid.height)/2,
    // 				      0.8*this.sid.width, 72, 2*PI-0.5,
    // 				      this.world));
    // this.Boundaries.push(new Boundary((this.xmax-this.sid.width*0.96)/2,
    // 				      (this.ymax+1.0*this.sid.height)/2,
    // 				      0.8*this.sid.width, 72, 1.0,
    // 				      this.world));
    // this.Boundaries.push(new Boundary((this.xmax+this.sid.width*0.96)/2,
    // 				      (this.ymax+1.0*this.sid.height)/2,
    // 				      0.8*this.sid.width, 72, 2*PI-1.0,
    // 				      this.world));
    // this.Boundaries.push(new Boundary(0.5*this.xmax,
    // 				      0.5*(this.ymax-0.87*this.sid.height),
    // 				      1.3*this.sid.width, 72, 0.0,
    // 				      this.world));
    

        
    // Class Methods
    this.update = function() {

	this.update_ensemble();
	
    };

    this.update_ensemble = function() {   };



    this.show = function() {

	// render all the neccessary pieces to the canvas
	background(51);
	this.show_column();
	this.show_boundaries();
	if (this.debug) {
	    this.show_fps();
	};
    };
    

    this.show_column = function() {
	push();
	imageMode(CENTER);
	image(this.column_img, this.xmax/2 , this.ymax/2, this.sid.width, this.sid.height);
	pop();	
    };
    

    this.show_boundaries = function() {
	if (this.show_boundaries_log) {
	    for (var i = 0; i < this.Boundaries.length; i++) {
		this.Boundaries[i].show();
	    };
	};
    };

    
    this.show_fps = function() {
	push()
	textAlign(LEFT,BOTTOM);
	text(frameRate().toFixed(0) + 'fps', this.canvas.width*0.02, this.canvas.height*0.98);
	pop()
    };

};
