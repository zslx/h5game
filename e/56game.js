vge.register('vge.game',function(g){
    var file_type = {};
    file_type["js"] = "js";
    file_type["json"] = "json";
    file_type["wav"] = "audio";
    file_type["mp3"] = "audio";
    file_type["ogg"] = "audio";
    file_type["png"] = "image";
    file_type["jpg"] = "image";
    file_type["jpeg"] = "image";
    file_type["gif"] = "image";
    file_type["bmp"] = "image";
    file_type["tiff"] = "image";

    this.init=function(obj, options) {
        options = options || {};
        // this.canvas = document.getElementById(obj || "canvas");
        this.canvas = obj;
        this.context = this.canvas.getContext('2d');
        this.size=options.size||[400,400];
        this.canvas.width =this.width= this.size[0];
        this.canvas.height =this.height= this.size[1];
        this.pos=this.getCanvasPos(this.canvas);
        this.fps=options.fps||30;
        this.bgColor=options.bgColor;
        this.bgImageSrc=options.bgImageSrc;
        this.spriteList=new vge.base.ObjectList();
    };

    this.getCanvasPos=function(canvas) {
        var left = 0, top = 0;
        while (canvas.offsetParent) {
            left += canvas.offsetLeft;
            top += canvas.offsetTop;
            canvas = canvas.offsetParent;
        }
        return [left, top];
    };

    // 返回是否在canvas外
    this.isOutsideCanvas=function(elem){
        return elem.pos[0]+elem.size[0]<0||elem.pos[0]>this.canvas.width||elem.pos[1]+elem.size[1]<0||elem.pos[1]>this.canvas.height;
    };

    this.clean=function() {
        this.context.clearRect(0,0,this.width, this.height);
    };

    this.drawBg=function(){
        if(this.bgColor){
            var bgRect=new vge.shape.Rect();//绘制背景色
			bgRect.setOptions({size:[this.width,this.height],style:this.bgColor});
            bgRect.draw();
        } else if(this.bgImageSrc){
            if(vge.loader.loadedImgs[this.bgImageSrc]){
                this.context.drawImage(vge.loader.loadedImgs[this.bgImageSrc],0,0,this.width,this.height);
            }
        }
    };

    /**
     *资源加载完毕的处理程序
     **/
    var resourceLoad = function(self, type) {
        return function resourceLoad0() {		// 闭包?
            if(type == "error"){
                self.errorCount ++;
            }else{
                self.loadedCount ++;
            }

            if(type == "image"||type==='js'){
				self.loadedImgs[this.srcPath] = this;
				vge.tool.removeHandler(this, "load", resourceLoad0);//执行一次后销毁
			}else if(type == "audio"){
				self.loadedAudios[this.srcPath] = this;
				vge.tool.removeHandler(this, "canplay", resourceLoad0);
			}
            vge.tool.removeHandler(this, "error", resourceLoad0);

            self.loadedPercent = Math.floor((self.loadedCount+self.errorCount) / self.sum * 100);
            self.onLoad && self.onLoad(self.loadedPercent);
            if (!type || self.loadedPercent === 100) {//如果没有资源需要加载或者资源已经加载完毕
                self.loadedCount = 0;
                self.errorCount = 0;
                self.loadedPercent = 0;

				// 改进
                if (self.gameObj && self.gameObj.initialize) { // 已经存在游戏循环
                    if (vge.game.loop && !vge.game.loop.stop) {	//结束上一个循环
                        vge.game.loop.end();
						// console.log(type,this);
                    }else{
						if(!vge.game.loop){
							self.gameObj.initialize(self.startOptions); // ??
							vge.game.loop = new vge.game.Gloop(self.gameObj,{fps:vge.game.fps}); //开始新游戏循环
						}
						vge.game.loop.start();
					}
                }
            }
        };
    };

    this.loader = {
        sum: 0,         //图片总数
        loadedCount: 0, //图片已加载数
        errorCount:0,
        loadedImgs: {}, //已加载图片集合
        loadedAudios: {}, //已加载音频集合
        /**
         *图像加载，之后启动游戏
         **/
        start: function(gameObj, options) {//options:srcArray,onload
            options=options||{};
            var srcArr = options.srcArray;
            this.startOptions = options.startOptions; //游戏开始需要的初始化参数
            this.onLoad = options.onLoad;
            this.gameObj = gameObj;
            this.sum = 0;
            vge.game.spriteList.clean();
            if(!srcArr){//如果没有资源需要加载，直接执行resourceLoad回调
                resourceLoad(this)();
            }else if (vge.tool.isArray(srcArr) || vge.tool.isObject(srcArr)) {
                for (var i in srcArr) {
                    if (srcArr.hasOwnProperty(i)) {
                        this.sum++;
                        var path = srcArr[i];
                        var suffix = srcArr[i].substring(srcArr[i].lastIndexOf(".") + 1);
                        var type = file_type[suffix];
                        if (type == "image") {
                            var img = new Image();
                            vge.tool.addHandler(img, "load", resourceLoad(this, type));
                            vge.tool.addHandler(img, "error", resourceLoad(this, "error"));
                            img.src = path;
                            img.srcPath = path; //没有经过自动变换的src
                        }else if (type == "audio") {

							try{
								var audio = new Audio(path);
								vge.tool.addHandler(audio, "error", resourceLoad(this, "error"));
								vge.tool.addHandler(audio, "canplay", resourceLoad(this, type));
								audio.src = path;
								audio.srcPath = path; //没有经过自动变换的src
							}catch(e){
								alert(e);
								resourceLoad(this)();
							}

                        }else if (type == "js") {//如果是脚本，加载后执行
                            var head = document.getElementsByTagName("head")[0];
                            var script = document.createElement("script");
                            head.appendChild(script);
                            vge.tool.addHandler(script, "load", resourceLoad(this, type));
                            vge.tool.addHandler(script, "error", resourceLoad(this, "error"));
                            script.src = path;
                        }
                    }
                }
            }
        }
    };


	// 私有变量
    var timerid;//timeId;
    var delay;
    /**
     *循环方法
     **/
    var loop = function() {
        var self = this;
        var currentFpsArr=[];
        return function() {		// 闭包
            var now = new Date().getTime();
            var duration = (now - self.lastTime); //帧历时
            if (!self.pause && !self.stop && duration) {
                currentFpsArr.push(1000/duration); //计算实际平均fps
                if(currentFpsArr.length>=20){
                    var sumFps=0;
                    var fps;
                    while(fps=currentFpsArr.pop()){
                        sumFps+=fps;
                    }
                    self.avgFPS=Math.round(sumFps/20);
                }
                self.loopDuration = (self.startTime - now) / 1000;
// console.log(self.loopDuration);

                if (self.gameObj.update) {//调用游戏对象的update
                    self.gameObj.update(duration / 1000);
                }
                vge.game.clean();
                vge.game.drawBg();//绘制背景色
                if (self.gameObj.draw) {
                    self.gameObj.draw(duration / 1000);
                }

                //动画队列更新
				// vge.base.Animation.update();

                //更新所有sprite
                vge.game.spriteList.update(duration / 1000);
                vge.game.spriteList.draw();

                if (duration > self.interval) {//修正delay时间
                    delay = Math.max(1, self.interval - (duration - self.interval));
                }else{
                    delay=self.interval;
                }
            }
            self.lastTime = now;
            // timerid = window.setTimeout(arguments.callee, delay);
            // timerid = window.setTimeout(self.loop, delay);
        };
    };

    var rafloop = function(est) {
        var self = this;
        return function() {		// 闭包
            var now = new Date().getTime();
            var duration = (now - self.lastTime); //帧历时
            if (!self.pause && !self.stop && duration) {
                if (self.gameObj.update) {//调用游戏对象的update
                    self.gameObj.update(duration / 1000);
                }
                vge.game.clean();
                vge.game.drawBg();//绘制背景色
                if (self.gameObj.draw) {
                    self.gameObj.draw(duration / 1000);
                }

				console.log('rafloop',duration);
                //动画队列更新
				// vge.base.Animation.update();

                //更新所有sprite
                vge.game.spriteList.update(duration / 1000);
                vge.game.spriteList.draw();
            }
            self.lastTime = now;
        };
    };

    /**
     *游戏循环构造函数
     **/
    this.Gloop=g.class(function(gameObj, options) {
        if (!(this instanceof vge.game.Gloop)) { // 保证以构造函数方式调用
            return new vge.game.Gloop(gameObj, options);
        }
        this.init(gameObj, options);
        return this;
    }).methods({
        init: function(gameObj, options) {
            var defaultObj = {
                fps: 30
            };
            options = options || {};
            options = vge.extend(defaultObj, options);
            this.gameObj = gameObj;
            this.avgFPS=this.fps = options.fps;
            this.interval = delay = 1000 / this.fps;
            this.pause = false;
            this.stop = true;
        },
        /**
         *开始循环
         **/
        start: function() {
            if (this.stop) {        //如果是结束状态则可以开始
                this.stop = false;
                var now = new Date().getTime();
                this.startTime = now;
                this.lastTime = now;
                this.loopDuration = 0;

                // // window.setTimeout(loop.call(this), delay);
				// this.loop = loop.call(this);
                // window.setTimeout(this.loop, delay);

				this.loop = rafloop.call(this);
				this.raf = new vge.RAF(this.loop,delay);
            }
        },
        run: function() {
            this.pause = false;
			this.raf.run(Date.now());
        },
        pause: function() {
            this.pause = true;
			this.raf.stop();
        },
        end: function() {
            this.stop = true;
            window.clearTimeout(timerid);
			this.raf.stop();
        }
    });

});
