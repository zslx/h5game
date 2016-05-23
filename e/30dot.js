vge.register('vge',function(g){
	this.focallength = 250;
	var Dot=g.class(function(centerX , centerY , centerZ , radius , color){
		this.dx = centerX;
		this.dy = centerY;
		this.dz = centerZ;
		this.tx = 0;
		this.ty = 0;
		this.tz = 0;
		this.z = centerZ;
		this.x = centerX;
		this.y = centerY;
		this.radius = radius;
		this.color = color;
		// console.log(this);
	}).methods({
		init:function(opt){
		},
		draw:function(context){
			var w=vge.game.width,
			h=vge.game.height,
			scale = (this.z+vge.focallength)/(2*vge.focallength);

			context.save();
			context.beginPath();

			context.arc(w/2+(this.x-w/2)*scale, h/2+(this.y-h/2)*scale, this.radius*scale , 0 , 2*Math.PI);

			context.fillStyle= 'rgba('+[this.color.r,this.color.g,this.color.b,scale].join(',') +')';

			context.fill()
			context.restore();
		},
	});

	var Particle=g.class(function(dr){
		this.dr=dr;
		this.dots=[];
		this.derection = true;
		this.pause = false;
		this.lastTime=Date.now();
		this.thisTime=Date.now();
		this.sulv = 0.1;
		this.stop=false;
		
	}).static({
		 getRandom:function(a,b){
			// a?b?
			return Math.random()*(b-a) + a;
		},

		getimgData:function(context,x,y,width,height,dr){
			var img = context.getImageData(x,y,width,height);
			// context.clearRect(0,0,width,height);
			var dots = [],dot, data=img.data, r=g=b=a=0;

			// for(var i=0,l=data.length;i<l;i+=4){
			// 	// RGBA
			// 	r=data[i+0];
			// 	g=data[i+1];
			// 	b=data[i+2];
			// 	a=data[i+3];
			// 	if(a > 127){
			// 		dot=new Dot(x-dr, y-dr, 0, dr, {a:r, b:g, c:b});
			// 		dots.push(dot);
			// 	}
			// }

			for(var x=0;x<img.width;x+=dr*2){
				for(var y=0;y<img.height;y+=dr*2){
					var i = (y*img.width + x)*4;
					if(img.data[i+3] > 128){
						dot=new Dot(x-dr, y-dr, 0, dr, {r:img.data[i], g:img.data[i+1], b:img.data[i+2]});
						dots.push(dot);
					}
				}
			}

			console.log(dots.length)
			return dots;
		},

		set:function(o,w,h){
			o.x  = Particle.getRandom(0 , w);
			o.y  = Particle.getRandom(0 , h);
			o.z  = Particle.getRandom(-vge.focallength, vge.focallength);
			o.tx = Particle.getRandom(0 , w);
			o.ty = Particle.getRandom(0 , h);
			o.tz = Particle.getRandom(-vge.focallength, vge.focallength);
		}

	}).methods({

		init:function(text,context,width,height){
			context.clearRect(0,0,width,height)
			var grd = context.createRadialGradient(200,90,30, 60, 40, 380);
			grd.addColorStop(0.6, "yellow");
			grd.addColorStop(0.3, "green");
			grd.addColorStop(0, "red");
			grd.addColorStop(1, "blue");
			var text=new vge.shape.Text(text, {pos:[0,0],textBaseline:'top',textAlign:'left',style:grd});
			text.setOptions({font:"120px 微软雅黑"});
			text.draw();

			this.dots = Particle.getimgData(context,0,0,width,height,this.dr);

			for(var i=0,l=this.dots.length;i<l;++i){
				Particle.set(this.dots[i], width,height);
			}
		},

		update:function(){
			if(this.stop)return;
			var dot,self=this;
			this.thisTime = Date.now();
			for(var i=0,l=self.dots.length;i<l;++i){
				dot=self.dots[i];
				if(self.derection){
					if (Math.abs(dot.dx - dot.x) < 0.1 && Math.abs(dot.dy - dot.y) < 0.1 && Math.abs(dot.dz - dot.z)<0.1) {
						dot.x = dot.dx;
						dot.y = dot.dy;
						dot.z = dot.dz;
						// if(self.thisTime - self.lastTime > 300)
							self.derection = false;
					} else {
						dot.x = dot.x + (dot.dx - dot.x) * self.sulv;
						dot.y = dot.y + (dot.dy - dot.y) * self.sulv;
						dot.z = dot.z + (dot.dz - dot.z) * self.sulv;
						self.lastTime=Date.now();
					}
				}else {
						if(self.thisTime - self.lastTime < 300) return;
					if (Math.abs(dot.tx - dot.x) < 0.1 && Math.abs(dot.ty - dot.y) < 0.1 && Math.abs(dot.tz - dot.z)<0.1) {
						dot.x = dot.tx;
						dot.y = dot.ty;
						dot.z = dot.tz;
						self.pause = true;
					} else {
						dot.x = dot.x + (dot.tx - dot.x) * self.sulv;
						dot.y = dot.y + (dot.ty - dot.y) * self.sulv;
						dot.z = dot.z + (dot.tz - dot.z) * self.sulv;
						self.pause = false;
					}
				}
			}
		},

		draw:function(){
			var context=vge.game.context,self=this;
			for(var i=0,l=self.dots.length;i<l;++i){
				self.dots[i].draw(context);
			}

			if(!self.pause) {
			// 	// 链式调用 requestAnimationFrame
			// 	if("requestAnimationFrame" in window){
			// 		requestAnimationFrame(self.animate);
			// 	}
			// 	else if("webkitRequestAnimationFrame" in window){
			// 		webkitRequestAnimationFrame(self.animate);
			// 	}
			// 	else if("msRequestAnimationFrame" in window){
			// 		msRequestAnimationFrame(self.animate);
			// 	}
			// 	else if("mozRequestAnimationFrame" in window){
			// 		mozRequestAnimationFrame(self.animate);
			// 	}
			} else {
			// 	context.clearRect(0,0,width,height)
				self.derection=true;
				self.pause = false;
				console.log('stoped');
			}

		},

	});

	this.Dot=Dot;
	this.Particle=Particle;
});
