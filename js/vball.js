// 戳球球
(function(){
    'use strict';
	// 创建画布
	var canvasObj=document.createElement("canvas");
	canvasObj.id="canvas";
	var wrap=document.getElementById("wrap");
	wrap.appendChild(canvasObj);

	vge.game.init(canvasObj,{bgColor:'#000',size:[window.innerWidth*0.999,window.innerHeight*0.995]});
	vge.game.drawBg();

	var dlg=document.getElementById('dialog'),tdiv=document.getElementById('content'),okbtn=document.getElementById('okbtn'),xbtn=document.getElementById('xbtn');

	vge.tool.addHandler(okbtn,'click',function(ev){
		// window.location.reload();
		dlg.style.display='none';
		loader.gameObj.restart();
		vge.game.loop.start();
	});

	vge.tool.addHandler(xbtn,'click',function(ev){
		window.close();
		WeixinJSBridge.call('closeWindow');
	});
	
	// 游戏全局资源
	var center=[vge.game.width/2,vge.game.height/2], //canvas中点
	    colors=['red','green','blue','yellow','Tan','white','gray','Cyan','Gold','Olive'];
	var srcObj={
		vlogo:"res/vlogo.png",
		tenBall:"res/ksf.png",//十分球
		twentyBall:"res/pepsi.png",//二十分球
		thirdtyBall:"res/rejoice.png",//三十分球
		sTenBall:"res/ty.png",//减十分球
		sTwentyBall:"res/wahaha.png",//减二十分球
		sThirdtyBall:"res/want.png",//减三十分球

		// bkmusic:'res/title.mp3',
		// bkmusic:'res/bk2.wav',
		// bkmusic:'res/bk2.mp3',
		// hitmusic:'res/crowdohh.mp3',
		// okmusic:'res/hithard.mp3'

	};

	var ballKinds=[["tenBall",10],["twentyBall",20],["thirdtyBall",30],["sTenBall",-10],["sTwentyBall",-20],["sThirdtyBall",-30]];

	var Text=vge.shape.Text,list=vge.game.spriteList,input=vge.input,
	    Circle=vge.shape.Circle,Line=vge.shape.Line,collision=vge.collision,
	    loader=vge.game.loader;

	// 泡泡对象
	var Ball=vge.class(function(opt){
		Ball.parent.prototype.init.call(this,opt);
		this.pos=this.oriPos=[opt.x,opt.y];
		this.oriSize=opt.r;
		this.size=[opt.r,opt.r];
		this.z=opt.z||0;
		this.score=opt.score||0;
		this.oriSpeedZ=opt.speed||0;
		this.speedZ=this.oriSpeedZ;
		this.scale=1;
		this.orbit=opt.orbit||0; // 0 浮现 1 坠落 2 冒泡 -1 固定位置
		this.resetXY();
		this.context = vge.game.context;

		if(this.orbit===-1) {
			// 图片+分数
			this.stxt=new Text(this.score,{
				textBaseline:'top',
				pos:[opt.x +opt.r/8, opt.y+opt.r],
				style:"#339933",
				font:"20px Calibri"
			});
		}

	    // },vge.base.Sprite).methods({ // 从精灵对象继承
	},vge.shape.Rect).methods({
		disappear:function(){//小球被选中消失
			// this.image = loader.loadedImgs[srcObj['vlogo'] ];
			// this.setCurrentImage(srcObj['vlogo']);
			list.remove(this);
		},
		resetXY:function(){//改变x,y的位置和尺寸
			if(this.orbit===-1) return;

			var oriX=this.oriPos[0];
			var oriY=this.oriPos[1];
			var oriSize=this.oriSize;

			this.scale=((center[0]+this.z)/center[0]);//相对于现时的scale
			// this.speedZ=this.oriSpeedZ*this.scale;
			this.speedZ=this.oriSpeedZ;

			if(this.orbit===0) {
				this.pos=[(oriX-center[0])*this.scale+center[0],(oriY-center[1])*this.scale+center[1]];

				this.height=this.width=this.oriSize*Math.abs(this.scale);
				this.size=[this.height,this.width];
			}else if(this.orbit===1){
				this.pos=[oriX,Math.abs((oriY-center[1])*this.scale+center[1])];

			}else{
				// this.pos=[oriX, (oriY-center[1])*this.scale+center[1]];
				this.pos=[oriX, oriY*(1.3-this.scale)+center[1]];
			}

			if(this.pos[0]>vge.game.width || this.pos[1]>vge.game.height)
				// this.pos[0]>vge.game.width || this.pos[1]>vge.game.height/2||
				// this.pos[0]<0 || this.pos[1]<0
			{
				this.disappear();
			}

		},
		update:function(){
			if(this.orbit===-1) return;
			Ball.parent.prototype.update.call(this);
			this.resetXY();
		},

		draw:function(){
			// Ball.parent.prototype.draw.call(this);
			// this.context.save();
			// console.log(this.image);
            this.context.drawImage(this.image, this.pos[0], this.pos[1], this.size[0],this.size[1]);
			if(this.orbit===-1){
				this.stxt.draw();
			}
			// this.context.restore();
		}

	});

	var ballsManager={			// 小球管理器
		createDuration:300,
		ballSize:50,
		lastCreateTime:Date.now(),
		createRandomBalls:function(num){
			var now=Date.now();
			if(now-this.lastCreateTime>this.createDuration){
				for(var i=0;i<num;i++){
					var x=Math.random()* vge.game.width,
					    // y=vge.game.height, z=-100, orbit=2,
					    y=0, z=0, orbit=1,
					    // y=Math.random()* vge.game.height, z=-280, orbit=0,

					    randomKind=ballKinds[Math.floor(Math.random()*6)];
					if(x+this.ballSize>vge.game.width) {x-=this.ballSize;}
					var newBall=new Ball({
						x:x,
						y:y,
						r:this.ballSize,
						z:z,
						score:randomKind[1],
						orbit:orbit,
						// speed:Math.random()*num
						// speed:(1+Math.random())*(num>2?2:num)
						// speed:(1+Math.random())*2
						speed:(0.6+Math.random())*2
						// style:colors[Math.floor(Math.random()*10)]
					});
					// newBall.setCurrentImage(srcObj[randomKind[0]]);//设置图片
					newBall.image = loader.loadedImgs[srcObj[randomKind[0]] ];

					list.add(newBall);
				}
				this.lastCreateTime=now;
			}
		},
		changeBallsPos:function(){
			var ballsArr=list.get(function(elem){
				return elem instanceof Ball;							   
			});
			for(var i=0,len=ballsArr.length;i<len;i++){
				var ball=ballsArr[i];
				ball.z+=ball.speedZ;
			}
		}
	};

	/*	游戏对象	*/
	var gameObj=(function(){
		var prePos;	//鼠标上次的位置
		var currentPos;//鼠标该次的位置
		var circle;//圆对象
		var startTime;//倒计时开始时间

		/*	倒计时	*/
		var countDown=function(countTime){//秒数形式传入
			var now=Date.now();
			startTime=startTime||now;
			return Math.ceil(countTime-(now-startTime)/1000);//秒数形式返回
		};

		/*	计时	*/
		var countUp=function(){
			var now=Date.now();
			startTime=startTime||now;
			return Math.ceil((now-startTime)/1000);//秒数形式返回
		};

		var checkpp=function(pos,o){
			var balls=list.get(function(elem){
				return elem instanceof Ball;
			}),ball,b=false;

			for(var i=balls.length-1;i>=0;--i){
				ball=balls[i];
				if(ball.orbit===-1) continue;
				if(ball.isInside(pos)){
					ball.disappear();
					o.addScore(ball);
					b=true;
					if(ball.score>0) { // 某些手机不能播放
						vge.tool.play(o.okmusic);
					}else{
						vge.tool.play(o.hitmusic);
					}
					break;
				}
			}
			if(!b){ o.mousepp();}
			return b;
		};

		return {
			initialize:function(){
                // console.log('initialize',arguments.callee.caller);
				var self=this,
				    gw=vge.game.width,
				    gh=vge.game.height,
				    gc=vge.game.context;

				this.score=0;
				this.plus=false;
				this.plusx=0;
				this.plusy=0;
				this.countDownTime=60;
				this.restTime=0;

				this.title=vge.shape.Rect({size:[gw,40],style:'#9933ff'});
				list.add(this.title);

				gc.font='40px Calibri';
				var tl=gc.measureText('30');
				this.timeText=new Text(this.countDownTime, {pos:[gw-tl.width, 32],style:"#fff"});
				this.timeText.setOptions({font:"40px Calibri"});
				list.add(this.timeText);

				this.scoreText=new Text('score:00', {pos:[10,32],style:"#ffff00"});
				this.scoreText.setOptions({font:"40px Calibri"});
				list.add(this.scoreText);

				this.plusText=new Text('00', {pos:[0,0],font:"20px Calibri",style:"#00cc00"});

				// this.bkmusic=loader.loadedAudios[srcObj['bkmusic']];
				// this.okmusic=loader.loadedAudios[srcObj['okmusic']];
				// this.hitmusic=loader.loadedAudios[srcObj['hitmusic']];

				this.bkmusic=document.getElementById('bk2m');
				this.okmusic=document.getElementById('hithard');
				this.hitmusic=document.getElementById('crowdohh');

				this.particle = new vge.Particle(3);
				this.particle.init('品牌雨', gc, gw, gh);
				list.add(this.particle);

				this.stop=true;
				this.play=true;

				var ballda=ballKinds[0],bc=ballda[1],bn=ballda[0],
				    r=gw/10,y=gh-r*2,ball,x;
				for(var i=0;i<6;++i) {
					ballda=ballKinds[i];
					bc=ballda[1];
					bn=ballda[0];
					x=(r+10)*i+gw/10;
					ball=new Ball({x:x,y:y,score:bc,style:'red',r:r,z:1,orbit:-1});
					ball.image = loader.loadedImgs[srcObj[bn]];
					list.add(ball);
				}

				var txt='游戏说明：手指戳中泡泡得分,限时30秒';
				this.manText=new Text(txt, {
					pos:[gw/10, gh-r*2.5],
					style:"#fff",
					font:'100 16px 宋体'});

				if(vge.beMobile){
					// alert('beMobile Start');
					currentPos=prePos=[input.touch.x,input.touch.y];
					input.onTouchStart(function(){
						prePos=currentPos;
						if(this.play) {
							this.play=false;
							vge.tool.play(self.bkmusic); // IOS 必须用户主动播放才行
						}

						currentPos=[input.touch.x,input.touch.y];
						checkpp(currentPos,self);
					});
				}else{
					currentPos=prePos=[input.mouse.x,input.mouse.y];
					input.onMouseDown('left',function(){
						prePos=currentPos;
						currentPos=[input.mouse.x,input.mouse.y];
						checkpp(currentPos,self);

						// console.log(list.getLength());
					});
				}

				input.bindEvtHandler();
				// vge.tool.play(self.bkmusic);
				// vge.tool.audioPlayLoop(self.bkmusic);
				vge.tool.playloop(self.bkmusic); // IOS 必须用户主动播放才行

                console.log(list.getLength());
			},

			mousepp:function(){
				if(this.stop){
					this.particle.stop=false;
					this.stop=false;
				}

				if(prePos[0]!==0 && prePos[1]!==0){
					// c=new Circle({pos:currentPos,r:4,style:colors[Math.floor(Math.random()*10)]});
					// list.add(c);
				}

			},
			addScore:function(o){
				this.score += o.score;
				// console.log('score:',o.score);
				this.scoreText.setOptions({text:'score:'+this.score,font:"40px Calibri",style:'#cccc00'});
				this.plus=true;
				this.plusText.pos=o.pos;
				this.plusx=o.pos[0]-100;
				this.plusy=o.pos[1]-40;
				this.plusText.text=o.score>0?'+'+o.score:o.score;
				list.add(this.plusText);
			},
			/*	更新 */
			update:function(){

                if(this.stop) {
	                list.add(this.manText);

	                if(!this.particle.derection) {
		                this.particle.stop=true;
	                }

                    return;
                }

	            if(this.particle.derection){
		            list.remove(this.particle);
		            list.remove(this.manText);
	            }else{
		            return;
                }
				var timeLeft=countDown(this.countDownTime);//倒计时
				// var timeLeft=countUp();//计时

				this.timeText.setOptions({text:timeLeft});
				if(timeLeft<=0){//倒计时结束，结束游戏
				    // if(list.getLength()>30 || timeLeft>60) { // 屏幕被球充满，结束游戏
					this.end();
					return;
				}
				if(this.restTime!==timeLeft){
					this.scoreText.setOptions({font:"40px Calibri",style:'#ffff00'});
					this.restTime=timeLeft;
				}

				if(this.plus){
					// 加分动画
					var p0=this.plusText.pos,p1=[0,0];
					p1[0]= p0[0]-this.plusx/60;
					p1[1]= p0[1]-this.plusy/60;
					this.plusText.pos=p1;
					if(p1[1]<50){
						this.plus=false;
						list.remove(this.plusText);
					}
				}

				var bn=list.getLength()-10,
				    n = (this.countDownTime-timeLeft)/(bn>0?bn:1);
				// n = (1+timeLeft)/(bn>0?bn:1);

				n = n>4?4:n;
				// ballsManager.createRandomBalls(Math.floor((Math.random()*4)));
				ballsManager.createRandomBalls(Math.floor((Math.random()*n)));
				ballsManager.changeBallsPos();

			},
			/*	游戏结束	*/
			end:function(){
				vge.game.loop.end();

				// vge.game.context.font='50px Calibri';
				// var tl=vge.game.context.measureText('Game over');
				// var txt= new vge.shape.Text('Game over',{
				// 	pos:[center[0]-tl.width/2,center[1]],
				// 	font:"50px Calibri"
				// });
				// list.add(txt);

				dlg.style.display='';
				tdiv.innerHTML='恭喜您获得 '+ this.score/10 +' V积分[<a href="http://218.107.155.98/static/h5f/app/index/demo.html">领取</a>]';
			},
			restart:function(){
				startTime=Date.now();
				this.score=0;
				this.countDownTime=60;

				this.timeText.setOptions({text:this.countDownTime});
				this.scoreText.setOptions({text:'score:00',font:"40px Calibri",style:'#cccc00'});

				list.remove(function(ele){
					return ele instanceof Ball && ele.orbit!==-1;
				});

				vge.game.clean();
			}
		};
	})();


	vge.game.context.font='30px Calibri';
	var tl=vge.game.context.measureText('加载 100% ');
	var txtprogress= new vge.shape.Text('加载...', {pos:[center[0]-tl.width/2,center[1]],font:"30px Calibri"});

	loader.start(gameObj,{srcArray:srcObj,onLoad:function(p){
		txtprogress.setOptions({text:['加载 ',p,'%'].join(' ')});
		vge.game.clean();
		txtprogress.draw();
		// if(p===100)gameObj.particle.stop=false;
	}});

})();
