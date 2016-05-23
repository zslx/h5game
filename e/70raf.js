// requestAnimationFrame vs setTimeout/setInterval
(function() {
    var lastTime = 0;			// 闭包 私有公共变量
    var vendors = ['ms', 'moz', 'webkit', 'o'];

    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
            || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    // if (true) {
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback) {
            var currTime = Date.now(),
            timeToCall = Math.max(0, 16 - (currTime - lastTime)),
			id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
	}

}());

vge.register('vge',function(g){
	var RAF=g.class(function (callback,delta){
		this.callback=callback;
		this.delta=delta;
		this.bRun=false;
		this.rafid=null;
		this.startTime=this.lastTime=0;
	}).methods({
		run:function(time) {
			// time ?= now
			var now=Date.now(),self=this;
			if(this.startTime===0){
				this.startTime=this.lastTime=Date.now();
			}
			this.rafid=requestAnimationFrame(function(t){self.run(t);});
			// if(now-this.lastTime < this.delta){ console.log('skip');return;}

			// do something
			// console.log('raf callback',now,time);
			this.callback(this.lastTime-this.startTime);

			this.lastTime=now;
		},
		stop:function(){
			cancelAnimationFrame(this.rafid);
		}
	});
	this.RAF=RAF;
});



function raftest() {

	// Get the buttons.
	var startBtn = document.getElementById('startBtn');
	var stopBtn = document.getElementById('stopBtn');
	var resetBtn = document.getElementById('resetBtn');

	// Canvas
	var canvas = vge.game.canvas;
	var ctx = canvas.getContext('2d');
	ctx.fillStyle = '#212121';

	// Variables to for the drawing position and object.
	var posX = 0;
	var boxWidth = 50;
	var pixelsPerFrame = 5; // How many pixels the box should move per frame.

	// Draw the initial box on the canvas.
	ctx.fillRect(posX, 0, boxWidth, canvas.height);

	// Animate.
	function animate(escape) {
		// If the box has not reached the end draw on the canvas.
		// Otherwise stop the animation.
		if (posX <= (canvas.width - boxWidth)) {
			ctx.clearRect((posX - pixelsPerFrame), 0, boxWidth, canvas.height);
			ctx.fillRect(posX, 0, boxWidth, canvas.height);
			posX += pixelsPerFrame;
		} else {
			raf.stop();
		}
	}

	var raf = new vge.RAF(animate,10);

	// Event listener for the start button.
	startBtn.addEventListener('click', function(e) {
		e.preventDefault();

		// Start the animation.
		raf.run(Date.now());
	});

	// Event listener for the stop button.
	stopBtn.addEventListener('click', function(e) {
		e.preventDefault();

		// Stop the animation;
		raf.stop();
	});

	// Event listener for the reset button.
	resetBtn.addEventListener('click', function(e) {
		e.preventDefault();

		// Reset the X position to 0.
		posX = 0;

		// Clear the canvas.
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Draw the initial box on the canvas.
		ctx.fillRect(posX, 0, boxWidth, canvas.height);
	});

}
