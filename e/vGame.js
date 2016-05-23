(function(){
	var g = {
        // 生成namespace,并执行相应操作, 用于扩展模块功能
        register: function(ns, o) {
            var nsar = ns.split('.'),
			parent = window,i=0,l=nsar.length,part='';
            for (i=0; i<l; i++) {
				part=nsar[i];
                if(parent[part] === undefined) {
					parent[part] = {};
				}
                parent = parent[part];
            }
			// function o(vge){...} 扩展函数
            if (o) {
				// function.call(thisArg[,arg1[,arg2[,...]]]) 类似 apply
                o.call(parent, this);
            }
            return parent;
        },
		// 复制对象属性
		extend: function(destination, source, isCover) {
			(undefined === isCover) && (isCover = true);
			for (var name in source) {
				if (isCover || undefined === destination[name]) {
					// if(name==='getSpeedX') console.log(name,destination);
					destination[name] = source[name];
				}
			}
			return destination;
		}
	};
	// 暴露外部调用的对象名称 vge，若已有定义，不覆盖
	window.vge = g;
	// console.log('vge init',vge);
})();

vge.register('vge.tool',function(g){
	// 程序工具函数
    this.isObject = function(elem) {
        return elem === Object(elem);
    };
    this.isString = function(elem) {
        return Object.prototype.toString.call(elem) === "[object String]";
    };
    this.isNum = function(elem) {
        return Object.prototype.toString.call(elem) === "[object Number]";
    };
    this.isArray = function(elem) {
        return Object.prototype.toString.call(elem) === "[object Array]";
    };
    this.isFunction = function(elem) {
        return Object.prototype.toString.call(elem) === "[object Function]";
    };

	// notice: this keywork
	this.addHandler=function(element, type, handler, flow) {
		// 给元素绑定事件处理器, 参数 flow：在消息流的哪个阶段触发
		// 使用延迟加载技术(真正调用时才执行): 避免重复判断
		if (element.addEventListener) {
			this.addHandler = function(element, type, handler, flow) {
				element.addEventListener(type, handler, flow !== undefined);
			};
		} else if (element.attachEvent) {
			this.addHandler = function(element, type, handler, flow) {
				// element.attachEvent('on'+type, handler);
				element.attachEvent('on' + type, function() {
					handler.call(element);// modify this arg
				});
			};
		} else {
			this.addHandler = function(element, type, handler, flow) {
				element['on' + type] = handler;
			};
		}
		this.addHandler(element, type, handler, flow);
	};
	this.removeHandler= (function() {
		// 移除元素上某事件的处理器
		if (document.addEventListener) {
			return function(element, type, handler, flow) {
				element.removeEventListener(type, handler, flow !== undefined);
			};
		} else if (document.attachEvent) {
			return function(element, type, handler, flow) {
				element.detachEvent('on' + type, handler);
			};
		} else {
			return function(element, type, handler, flow) {
				element['on' + type] = null;
			};
		}
		// 使用条件加载技术 避免重复判断
	})();

	this.getEventObj = function(e) {
        return e || win.event;
    };
    this.getEventTarget = function(e) {
        var ev = this.getEventObj(e);
        return ev.target || ev.srcElement;
    };

    /**
       禁止默认行为
    **/
    this.preventDefault = function(eve) {
        if (eve.preventDefault) {
            eve.preventDefault();
        }else {
            eve.returnValue = false;
        }

    };

	this.isMobile = function(){ //是否为移动终端
		var u = navigator.userAgent;
		// console.log('navigator.userAgent',u);
		return /Android|webOS|iPhone|iPod|BlackBerry/i.test(u);
		// return !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/);
	};

	this.audioPlayLoop=function(o){ // 循环播放音乐？未测
		vge.tool.addHandler(o,'ended',function(){
			var t=setTimeout(function(){
				clearTimeout(t);
				t=null;
				o.play();
			},500);
			// console.log('play loop',o,t);
		});
		o.play();
	};

	this.playloop=function(o){
		o.autoplay='autoplay';
		o.loop='loop';
		o.play();
	};

	this.play=function(o){
		o.pause();
		o.currentTime=0;
		o.play();
	};

	// console.log('vge tool', vge.tool);
});

vge.register('vge',function(g){
	this.class = function(newClass, parent){
        //继承
        if(vge.tool.isFunction(parent)){
			// parent.apply(this,arguments); // call parent constructor on child
            var F = function() {};
            F.prototype = parent.prototype; // 只继承原型
            newClass.prototype = new F();	// 防止子类修改了父类的原型
            newClass.prototype.constructor = newClass; // 恢复正确
            newClass.parent = parent;
        }

        //扩展1 newClass.static_method();
        newClass.static=function(funcObj){
            vge.extend(this, funcObj);
            return this;
        };

        //扩展2 new newClass().methods();
        newClass.methods=function(funcObj){
            vge.extend(this.prototype,funcObj);
			// console.log('this:',this,'prototype:',this.prototype);
            return this;
        };

        return newClass;
    };

	var movableobj=g.class(function(options){ // 可移动对象
        if (!(this instanceof vge.MovableObj)) {
            return new vge.MovableObj(id, options);
        }
        this.init(options);
        return this;
    }).methods({
        init:function(options){
            var postive_infinity=Number.POSITIVE_INFINITY;
            this.pos=[0,0];
            this.imgStart= [0,0];
            this.imgSize= [32,32];
            this.size= [32,32];
            this.angle= 0;
            this.speed= [0,0];
            this.a=[0,0];
            this.maxSpeed=postive_infinity;
            this.maxAngleSpeed=postive_infinity;
            this.maxPos=[postive_infinity,postive_infinity];
            this.minPos=[-postive_infinity,-postive_infinity];
            options = options || {};
            this.setOptions(options);
			this.x=this.pos[0];
			this.y=this.pos[1];

			// console.log(this.constructor);
        },
        getSpeedX:function(){
            return this.speed[0]*Math.cos(this.angle);
        },
        getSpeedY:function(){
            return -this.speed[0]*Math.sin(this.angle);
        },
        /**
         *返回参照物相对于该对象的角度
         **/
        getRelatedAngle:function(elem){
            elem.angle=elem.getHeading()||0;
            this.angle=this.getHeading();
            var relatedAngle=elem.angle-this.angle;

            if(relatedAngle>Math.PI){
                relatedAngle=relatedAngle-Math.PI*2;
            }else if(relatedAngle<-Math.PI){
                relatedAngle=relatedAngle+Math.PI*2;
            }
            return relatedAngle;
        },
        /**
         *设置移动参数
         **/
        setOptions: function(options) {
            vge.extend(this, options);
        },
        move: function(dx,dy) {
            var x = this.pos[0] + dx||0;
            var y = this.pos[1] + dy||0;
            this.pos[0] = Math.min(Math.max(this.minPos[0], x), this.maxPos[0]);
            this.pos[1] = Math.min(Math.max(this.minPos[1], y), this.maxPos[1]);
            return this;
        },
        moveTo: function(pos) {
            this.pos[0] = Math.min(Math.max(this.minPos[0], pos[0]), this.maxPos[0]);
            this.pos[1] = Math.min(Math.max(this.minPos[1], pos[1]), this.maxPos[1]);
            return this;
        },
        rotate: function(da) {//要旋转的角度
            da = da || 0;
            var angle=this.angle||0;
            this.angle = angle+da;
            return this;
        },
        rotateTo: function(angle) {
            this.angle = angle;
            return this;
        },
        stop:function(){
            /*this.preAngle=this.angle;
              this.preSpeed=this.speed;
              this.preA=this.a;*/
            this.speed=[0,0];   
            this.a=[0,0];
            return this;
        },
        /**
         *恢复移动
         **/
        resume:function(){
            this.angle=this.preAngle;
            this.speed=this.preSpeed||this.speed;
            this.a=this.preSpeed;
            return this;
        },
        /**
         *更新位置
         **/
        update: function(duration) {//duration:该帧历时 单位：秒
            //x方向速度
            var speedX = this.speed[0]*Math.cos(this.angle) + this.a[0]*Math.cos(this.angle) * duration;
            //y方向速度
            var speedY = this.speed[0]*Math.sin(this.angle) + this.a[0] *Math.sin(this.angle) * duration;
            
            if(Math.sqrt(speedX*speedX+speedY*speedY)>this.maxSpeed){       
                speedX=Math.cos(this.angle)*this.maxSpeed;
                speedY=Math.sin(this.angle)*this.maxSpeed;
            }
            //角速度
            this.speed[1] = this.speed[1] + this.a[1] * duration;
            if(this.speed[1]<-this.maxAngleSpeed){
                this.speed[1]=-this.maxAngleSpeed;
            }else if(this.speed[1]>this.maxAngleSpeed){
                this.speed[1]=this.maxAngleSpeed;
            }
            this.rotate(this.speed[1]).move(speedX, -speedY);
        }

    });
	this.MovableObj = movableobj;

	this.beMobile = vge.tool.isMobile();
	// console.log('vge class',vge);
});

vge.register('vge.shape',function(g){
	this.Rect=g.class(function(options) {
        if (!(this instanceof vge.shape.Rect)) {
            return new vge.shape.Rect(options);
        }
        this.init(options);
        return this;
    },g.MovableObj).methods({
        init: function(options) {
            this.pos=[0,0];
            this.size=[100,100];
            this.style="Red";
            this.isFill=true;
            this.alpha=1;
            vge.shape.Rect.parent.prototype.init.call(this,options);
        },
        setOptions: function(options) {
            vge.extend(this, options);
        },
        draw: function() {
            var context = vge.game.context;
            context.globalAlpha=this.alpha;
            if (this.isFill) {
                context.fillStyle = this.style;
                context.fillRect(this.pos[0], this.pos[1], this.size[0], this.size[1]);
            }else {
                context.strokeStyle = this.style;
                context.strokeRect(this.pos[0], this.pos[1], this.size[0], this.size[1]);
            }
            return this;
        },
        resize: function(dSize) {
            this.size[0] += dSize[0];
            this.size[1] += dSize[1];
            return this;
        },
        resizeTo: function(size) {
            this.width = size[0];
            this.height = size[1];
            return this;
        },
        /**
         *返回是否在某对象左边
         **/
        isLeftTo:function(obj,isCenter){//isCenter:是否以中点为依据判断
            if(isCenter) return this.pos[0]<obj.pos[0];
            return this.pos[0]+this.size[0]/2<obj.pos[0]-obj.size[0]/2;
        },
        /**
         *返回是否在某对象右边
         **/
        isRightTo:function(obj,isCenter){
            if(isCenter) return this.pos[0]>obj.pos[0];
            return this.pos[0]-this.size[0]/2>obj.pos[0]+obj.size[0]/2;
        },
        /**
         *返回是否在某对象上边
         **/
        isTopTo:function(obj,isCenter){
            if(isCenter) return this.pos[1]<obj.pos[1];
            return this.pos[1]+this.size[1]/2<obj.pos[1]-obj.size[0]/2;
        },
        /**
         *返回是否在某对象下边
         **/
        isBottomTo:function(obj,isCenter){
            if(isCenter) return this.pos[1]>obj.pos[1];
            return this.pos[1]-this.size[0]/2>obj.pos[1]+obj.size[1]/2;
        },
        /**
         *点是否在矩形内
         **/            
        isInside:function(point){
            var pointX=point[0],
            pointY=point[1],
            x=this.pos[0],
            y=this.pos[1],
            right=x+this.size[0],
            bottom=y+this.size[1];
            return (pointX >= x && pointX <= right && pointY >= y && pointY <= bottom);
        },
        /**
         *返回正矩形的相对于某点的四个顶点坐标
         **/
        getPoints:function(point){
            var leftTop=[],rightTop=[],leftBottom=[],rightBottom=[],pos=[];
            //相对于point的坐标
            pos[0]=this.pos[0]-point[0];
            pos[1]=point[1]-this.pos[1];
            //相对于point的四个顶点坐标
            leftTop[0]=pos[0]-this.size[0]/2;
            leftTop[1]=pos[1]+this.size[1]/2;
            rightTop[0]=pos[0]+this.size[0]/2;
            rightTop[1]=pos[1]+this.size[1]/2;
            leftBottom[0]=pos[0]-this.size[0]/2;
            leftBottom[1]=pos[1]-this.size[1]/2;
            rightBottom[0]=pos[0]+this.size[0]/2;
            rightBottom[1]=pos[1]-this.size[1]/2;
            return[leftTop,rightTop,rightBottom,leftBottom];
        },
        /**
         *返回相对于某点包含该sprite的矩形对象
         **/
        getRect: function() {  
            var point=this.pos;//默认的相对点为sprite的中点
            var points=this.getPoints(point);
            var pointsArr=[];
            var angle=this.angle;
            for(var i=0,len=points.length;i<len;i++){
                var thePoint=points[i];
                //相对于某点旋转后的顶点坐标
                var newX=thePoint[0]*Math.cos(angle)-thePoint[1]*Math.sin(angle);
                var newY=thePoint[0]*Math.sin(angle)+thePoint[1]*Math.cos(angle);
                //从相对于某点的坐标系转换为相对于canvas的位置
                newX+=point[0];
                newY=point[1]-newY;
                pointsArr.push([newX,newY]);//四个顶点旋转后的坐标
            }
            return new vge.shape.Polygon({pointsArr:pointsArr});
        },
    });

    this.Polygon=g.class(function(options){
        if (!(this instanceof vge.shape.Polygon)) {
            return new vge.shape.Polygon(options);
        }
        this.init(options);         
        return this;
    }).methods({
        init:function(options){
            this.pointsArr=[];//所有顶点数组
            this.style="black";
            this.lineWidth=1;
            this.alpha=1;
            this.isFill=true;
            this.setOptions(options);    
        },
        setOptions: function(options) {
            vge.extend(this,options);
        },
        isInside:function(point){
            var lines=this.getLineSegs();
            var count=0;//相交的边的数量
            var lLine=new Line({start:[point[0],point[1]],end:[-9999,point[1]]});//左射线
            var crossPointArr=[];//相交的点的数组
            for(var i=0,len=lines.length;i<len;i++){
                var crossPoint=lLine.isCross(lines[i]);
                if(crossPoint){
                    for(var j=0,len2=crossPointArr.length;j<len2;j++){
                        //如果交点和之前的交点相同，即表明交点为多边形的顶点
                        if(crossPointArr[j][0]==crossPoint[0]&&crossPointArr[j][1]==crossPoint[1]){
                            break;  
                        }
                    }
                    if(j==len2){
                        crossPointArr.push(crossPoint); 
                        count++;
                    }
                }
            }
            if(count%2==0){//不包含
                return false;
            }
            return true;//包含
        },
        /**
         *获取多边形的线段集合
         **/
        getLineSegs:function(){
            var pointsArr=this.pointsArr.slice();//点集合
            pointsArr.push(pointsArr[0]);
            var lineSegsArr=[];
            for(var i=0,len=pointsArr.length;i<len-1;i++){
                var point=pointsArr[i];
                var nextPoint=pointsArr[i+1];
                var newLine=new line({start:[point[0],point[1]],end:[nextPoint[0],nextPoint[1]]});
                lineSegsArr.push(newLine);
            }
            return lineSegsArr;
        },
        /**
         *返回多边形各个点坐标
         **/
        getPoints:function(){
            return this.pointsArr.slice();
        },
        draw:function(){
            var ctx=vge.game.context;
            ctx.save();
            ctx.globalAlpha=this.alpha;
            ctx.beginPath();
            
            for(var i=0,len=this.pointsArr.length;i<len-1;i++){
                var start=this.pointsArr[i];
                var end=this.pointsArr[i+1];
                ctx.lineTo(start[0],start[1]);
                ctx.lineTo(end[0],end[1]);        
            }
            ctx.closePath();
            if(this.isFill){
                ctx.fillStyle = this.style;
                ctx.fill(); 
            }
            else{
                ctx.lineWidth = this.lineWidth;
                ctx.strokeStyle = this.style;
                ctx.stroke();   
            }  
            ctx.restore();
        }  
    });

    this.Circle = g.class(function(options) {
        if (!(this instanceof vge.shape.Circle)) {
            return new vge.shape.Circle(options);
        }
        this.init(options);
        return this;
    },g.MovableObj).methods({
        init: function(options) {
            this.pos=[100,100];
            this.r = 100;
            this.startAngle= 0;
            this.endAngle= Math.PI * 2;
            this.antiClock= false;
            this.alpha=1;
            this.style= "red";
            this.isFill= true;
            options = options || {};
            vge.shape.Circle.parent.prototype.init.call(this,options);
        },
        setOptions: function(options) {
            vge.extend(this, options);
        },
        draw: function() {
            var context = vge.game.context;
            context.globalAlpha=this.alpha;
            context.beginPath();
            context.arc(this.pos[0], this.pos[1], this.r, this.startAngle, this.endAngle, this.antiClock);
            context.closePath();
            if (this.isFill) {
                context.fillStyle = this.style;
                context.fill();
            }else {
                context.strokeStyle = this.style;
                context.stroke();
            }
        },
        resize: function(dr) {
            dr = dr || 0;
            this.r += dr;
            return this;
        },
        resizeTo: function(r) {
            r = r || this.r;
            this.r = r;
            return this;
        },
        isLeftTo:function(obj,isCenter){
            if(isCenter) return this.pos[0]<obj.pos[0];
            return this.pos[0]+this.r<obj.pos[0]-obj.r;
        },
        isRightTo:function(obj,isCenter){
            if(isCenter) return this.pos[0]>obj.pos[0];
            return this.pos[0]-this.r>obj.pos[0]+obj.r;
        },
        isTopTo:function(obj,isCenter){
            if(isCenter) return this.pos[1]<obj.pos[1];
            return this.pos[1]+this.r<obj.pos[1]-obj.r;
        },
        /**
        *返回是否在某对象下边
        **/
        isBottomTo:function(obj,isCenter){
            if(isCenter) return this.pos[1]>obj.pos[1];
            return this.pos[1]-this.r>obj.pos[1]+obj.r;
        },
        /**
        *点是否在圆形内
        **/
        isInside: function(point) {
            var pointX=point[0];
            var pointY=point[1];
            var x=this.pos[0];
            var y=this.pos[1];
            var r=this.r;
            return (Math.pow((pointX - x), 2) + Math.pow((pointY - y), 2) < Math.pow(r, 2));
        }
    });

    this.Text=g.class(function(text, options) {
        if (!(this instanceof vge.shape.Text)) {
            return new vge.shape.Text(text, options);
        }

        this.init(text, options);
        return this;
    }, g.MovableObj).methods({
        init: function(text,options) {

            this.text=text||"test";
            this.pos= [100,100];
            this.style="red";
            this.isFill=true;
            this.alpha=1;
            this.context=vge.game.context;
            options = options || {};
            this.setOptions(options);
            vge.shape.Text.parent.prototype.init.call(this,options);
        },
        draw: function() {
            var context = vge.game.context; 
            context.save();
            context.globalAlpha=this.alpha;
            (undefined!== this.font) && (context.font = this.font);
            (undefined!==this.textBaseline) && (context.textBaseline = this.textBaseline);
            (undefined!==this.textAlign) && (context.textAlign = this.textAlign);
            (undefined!==this.maxWidth) && (context.maxWidth = this.maxWidth);
            if (this.isFill) {
                context.fillStyle = this.style;
                this.maxWidth ? context.fillText(this.text, this.pos[0], this.pos[1], this.maxWidth) : context.fillText(this.text, this.pos[0], this.pos[1]);
            }else {
                context.strokeStyle = this.style;
                this.maxWidth ? context.strokeText(this.text, this.pos[0], this.pos[1], this.maxWidth) : context.strokeText(this.text, this.pos[0], this.pos[1]);
            }
            context.restore();
        },
        setOptions: function(options) {
            vge.extend(this, options);
        }
    });
    /*  线段  */
    this.Line=g.class(function(options){
        if (!(this instanceof vge.shape.Line)) {
            return new vge.shape.Line(options);
        }
        this.init(options);
        return this;
    }).methods({
        init: function(options) {   
            this.start=[0,0];
            this.end=[0,0]; 
            this.style="red";
            this.lineWidth=1;
            this.alpha=1;
            this.context=vge.game.context;
            options = options || {};
            vge.extend(this,options);
        },
        /**
        *判断线段和另一条线段是否相交
        **/
        isCross:function(newLine){
            var start=this.start;
            var end=this.end;
            var newStart=newLine.start;
            var newEnd=newLine.end;
            var point=[];
            
            var k1=(end[1]-start[1])/(end[0]-start[0]);//所在直线斜率
            var b1=end[1]-end[0]*k1;//所在直线截距
            
            var k2=(newEnd[1]-newStart[1])/(newEnd[0]-newStart[0]);//新线段所在直线斜率
            var b2=newEnd[1]-newEnd[0]*k2;//新线段所在直线截距
            
            if(k1==k2){
                if(start[1]==newStart[1]){
                    return (start[0]<newStart[0]&&end[0]>newStart[0])||(newStart[0]<start[0]&&newEnd[0]>start[0]);
                }
                else if(start[0]==newStart[0]){
                    return (start[1]<newStart[1]&&end[1]>newStart[1])||(newStart[1]<start[1]&&newEnd[1]>start[1]);
                }
            }
            //这里线段A的端点在线段B上，还不算相交
            else if(((newStart[0]*k1+b1-newStart[1])*(newEnd[0]*k1+b1-newEnd[1]))<0&&((start[0]*k2+b2-start[1])*(end[0]*k2+b2-end[1]))<0){          
                point[0]=(b1-b2)/(k2-k1);
                point[1]=k2*point[0]+b2;
                return point;
            }
            return false;
        },
        /**
        *绘制
        **/
        draw: function() {
            var ctx=vge.game.context;
            var start=this.start;
            var end=this.end;
            
            ctx.save();
            ctx.strokeStyle = this.style;
            ctx.lineWidth = this.lineWidth;
            ctx.globalAlpha=this.alpha;
            ctx.beginPath(); 
            ctx.lineTo(start[0],start[1]);
            ctx.lineTo(end[0],end[1]);
            ctx.closePath();  
            ctx.stroke();
            ctx.restore();
        },
        /**
        *设置参数
        **/
        setOptions: function(options) {
            vge.extend(this,options);
        }
    });
    
    // this.Polygon=polygon;
    // this.Line = line;
    // this.Text = text;
    // this.Rect = rect;
    // this.Circle = circle;

});

vge.register('vge.base', function(g){
    var list=[];//动画队列
    /**
     *动画类
     **/  
    this.Animation=g.class(function(options){
        if (!(this instanceof vge.base.Animation)) {
            return new vge.base.Animation(options);
        }
        this.init(options);
        return this;
    }).methods({
        init:function(options){
            this.target=null;    //目标对象
            this.propertyName="";//属性名
            this.duration=0;    //变化耗时
            this.onFinished=null;//完成动画的回调
            this.tweenFun=Animation.tweenObj.linear; //使用的缓动方法，默认为匀速线性运动
            this.setOptions(options);
            this.from=parseFloat(this.target[this.propertyName]||0); //初始值
            this.to=parseFloat(this.to||0);							 //目标值
            this.changeDistance=this.to-this.from;					 //变化距离
        },
        setOptions: function(options) {
            vge.extend(this, options);
        },
        /**
         *动画更新
         **/
        update:function(){
            var time=Date.now()-this.startTime;//历时
            var p=time/this.duration;
            if(p>=1){//完成动画
				this.onFinished&&this.onFinished.call(this);
				return;
            }
            var currentValue=this.changeDistance*this.tweenFun(time/this.duration)+this.from;
            this.target[this.propertyName]=currentValue;
        }
    }).static({
        /**
         *添加动画
         **/            
        add:function(animation){
            list.push(animation);
            animation.startTime=Date.now();//设置初始时间
        },
        /**
         *移除动画
         **/
        remove:function(animation){
            for(var i=0;i<list.length;i++){
                if(list[i]===animation){
                    list.splice(i,1);
                    return;
                }
            }
        },
        /**
         *更新队列中的动画
         **/ 
        update:function(){
            for(var i=0;i<list.length;i++){
                list[i].update();
            }
        },
        /**
         *缓动函数对象
         **/ 
        tweenObj:{
            linear:function(p){//传入运行时间占总运行时间的百分比
                return p;
            },
            cubic: {
                easeIn: function(p){
                    return p*p*p;
                },
                easeOut: function(p){
                    return (p-=1)*p*p+1;
                },
                easeInOut: function(p){
                    if ((p/2) < 1){
                        return p*p*p/2;
                    }
                    return ((p-=2)*p*p + 2)/2;
                }
            }                
        }
    });

	this.SpriteList=g.class(function(){
        this.init();
    }).methods({
        init:function(){
            this.list=[];
        },
        get:function(index){//传入索引或条件函数
            if(vge.tool.isNum(index)){
                return this.list[index];
            }else if(vge.tool.isFunction(index)){
                var arr=[];
                for(var i=0,len=this.list.length;i<len;i++){
                    if(index(this.list[i])){
                        arr.push(this.list[i]);
                    }
                }
                return arr;
            }
            return null;
        },
        add: function(sprite) {
            this.list.push(sprite);
        },
        remove: function(sprite) {//传入sprite或条件函数
            for (var i = 0, len = this.list.length; i < len; i++) {
                if (this.list[i] === sprite||(vge.tool.isFunction(sprite)&&sprite(this.list[i]))) {
                    this.list.splice(i, 1);
                    i--;
                    len--;
                }
            }
        },
        clean: function() {
            for (var i = 0, len = this.list.length; i < len; i++) {
                this.list.pop();
            }
        },
        sort: function(func) {
            this.list.sort(func);
        },
        getLength:function(){
            return this.list.length;
        },
        update:function(duration){
            // for (var i = 0;i < this.list.length; i++) {
            // for (var i=this.list.length-1;i>=0; --i) {
            for (var i=0,l=this.list.length;i<l; i++) {
                if(this.list[i]&&this.list[i].update){
                    this.list[i].update(duration);
                }
            }
        },
        draw:function(){
            // for (var i = 0;i < this.list.length; i++) {
            // for (var i = this.list.length-1;i >= 0; --i) {
            for (var i=0,l=this.list.length;i<l; i++) {
                if(this.list[i]&&this.list[i].draw){
                    this.list[i].draw();
                }
            }
        }
    });

    this.Sprite = g.class(function(id, options) {//继承rect类

        // if (!(this instanceof arguments.callee)) {
        //     return new arguments.callee(id, options);
        // }

        if (!(this instanceof vge.base.Sprite)) {
            return new vge.base.Sprite(id, options);
        }

        this.init(id, options);
        return this;
    },vge.shape.Rect).methods({
        init: function(options) {
            vge.base.Sprite.parent.prototype.init.call(this,options);
            this.context=options.context||vge.game.context;
            this.imgSize=options.imgSize||this.size;
            this.spriteSheetList = {};
            if (this.src) { //传入图片路径
                this.setCurrentImage(this.src, this.imgStart,this.imgSize);
            }else if (this.spriteSheet) {//传入spriteSheet对象
                this.addAnimation(this.spriteSheet);
                this.setCurrentAnimation(this.spriteSheet);
            }
        },
        /*
         *添加动画
         **/
        addAnimation: function(spriteSheet) {
            spriteSheet.relatedSprite=this;
            this.spriteSheetList[spriteSheet.id] = spriteSheet;
        },
        /**
         *设置当前显示动画
         **/
        setCurrentAnimation: function(id) {//可传入id或spriteSheet
            if (!this.isCurrentAnimation(id)) {
                if (vge.tool.isString(id)) {
                    this.spriteSheet = this.spriteSheetList[id];
                    if(this.spriteSheet){
                        this.size=[this.spriteSheet.frameSize[0],this.spriteSheet.frameSize[1]];
                        this.image = this.imgStart = null;
                    }
                }else if (vge.tool.isObject(id)) {
                    this.spriteSheet = id;
                    if(this.spriteSheet){
                        var frameSize=this.spriteSheet.frameSize;
                        this.size=[frameSize[0],frameSize[1]];
                        this.addAnimation(id);
                        this.image = this.imgStart = null;
                    }
                }
            }
        },
        /**
         *判断当前动画是否为该id的动画
         **/
        isCurrentAnimation: function(id) {
            var spriteSheet=this.spriteSheet;
            if (vge.tool.isString(id)) {
                return (spriteSheet && spriteSheet.id === id);
            }else if (vge.tool.isObject(id)) {
                return spriteSheet === id;
            }
            return false;
        },
        /**
         *设置当前显示图像
         **/
        setCurrentImage: function(src, imgStart,imgSize) {
            imgStart=imgStart||[0,0];
            imgSize=imgSize||[32,32];
            if (!this.isCurrentImage(src, imgStart,imgSize)) {
                this.image = vge.game.loader.loadedImgs[src];
                this.imgStart = imgStart;
                this.imgSize=imgSize;
                this.spriteSheet = null;
            }
        },
        /**
         *判断当前图像是否为该src的图像
         **/
        isCurrentImage: function(src,imgStart,imgSize) {
            var image = this.image;
            if(image&&src){
                imgStart=imgStart||[0,0];
                if(this.imgStart[0] === imgStart[0] && this.imgStart[1] === imgStart[1]&&this.imgSize[0]==imgSize[0]&&this.imgSize[1]==imgSize[1]){
                    if (vge.tool.isString(src)) {
                        return (image.srcPath === src );
                    }else{
                        return image==src;
                    }
                }
            }
            return false;       
        },
        /**
         *跳到特定帧
         **/
        index:function(index){
            var spriteSheet=this.spriteSheet;
            spriteSheet&&spriteSheet.index(index);      
        },

        /**
         *更新位置和帧动画
         **/
        update: function(duration) {//duration:该帧历时 单位：秒
            vge.base.Sprite.parent.prototype.update.call(this,duration);
            if (this.spriteSheet) {//更新spriteSheet动画
                this.spriteSheet.pos[0] = this.pos[0];
                this.spriteSheet.pos[1] = this.pos[1];
                this.spriteSheet.update();
            }
        },
        /**
         *绘制出sprite
         **/
        draw: function() {
            var context = this.context;
            var halfWith;
            var halfHeight;
            if (this.spriteSheet) {
                this.spriteSheet.pos = this.pos;
                this.spriteSheet.draw();
            }else if (this.image) {
                context.save();
                var point=this.pos;//默认的相对点为sprite的中点
                halfWith = this.size[0] / 2;
                halfHeight = this.size[1] / 2;

                context.translate(point[0],point[1]); // 
                context.rotate(this.angle * -1);	  // 


				if (this.isFill) {
					context.fillStyle = this.style;
					context.fillRect(this.pos[0], this.pos[1], this.size[0], this.size[1]);
				}else {
					context.strokeStyle = this.style;
					context.strokeRect(this.pos[0], this.pos[1], this.size[0], this.size[1]);
				}

                // context.drawImage(
				// 	this.image,
				// 	this.imgStart[0], this.imgStart[1],
				// 	this.imgSize[0],this.imgSize[1],
				// 	this.pos[0]-point[0]-halfWith,this.pos[1]-point[1]-halfHeight,
				// 	this.size[0], this.size[1]);

                context.drawImage(this.image, this.pos[0], this.pos[1], this.size[0],this.size[1]);


                context.restore();
            }
        }
    });
    
	// console.log('vge base', vge.base);
});

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
        this.spriteList=new vge.base.SpriteList();
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
            type == "image" && (self.loadedImgs[this.srcPath] = this);
            type == "audio" && (self.loadedAudios[this.srcPath] = this);
            if(type == "error"){
                self.errorCount ++;
            }else{
                self.loadedCount ++;
            }
			// console.log(resourceLoad0);
            vge.tool.removeHandler(this, "load", resourceLoad0);//保证图片的onLoad执行一次后销毁
            vge.tool.removeHandler(this, "error", resourceLoad0);
            vge.tool.removeHandler(this, "canplay", resourceLoad0);

            self.loadedPercent = Math.floor((self.loadedCount+self.errorCount) / self.sum * 100);
            self.onLoad && self.onLoad(self.loadedPercent);
            if (!type || self.loadedPercent === 100) {//如果没有资源需要加载或者资源已经加载完毕
                self.loadedCount = 0;
                self.errorCount = 0;
                self.loadedPercent = 0;
                type == "image" && (self.loadingImgs = {});
                type == "audio" && (self.loadingAudios = {});

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
        loadingImgs: {}, //未加载图片集合
        loadedImgs: {}, //已加载图片集合
        loadingAudios: {}, //未加载音频集合
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
                            var img=this.loadingImgs[path] = new Image();
                            vge.tool.addHandler(img, "load", resourceLoad(this, type));
                            vge.tool.addHandler(img, "error", resourceLoad(this, "error"));
                            img.src = path;
                            img.srcPath = path; //没有经过自动变换的src
                        }else if (type == "audio") {
                            var audio=this.loadingAudios[path] = new Audio(path);
                            vge.tool.addHandler(audio, "canplay", resourceLoad(this, type));
                            vge.tool.addHandler(audio, "error", resourceLoad(this, "error"));
                            audio.src = path;
                            audio.srcPath = path; //没有经过自动变换的src
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
            timerid = window.setTimeout(self.loop, delay);
        }
    };
    /**
     *游戏循环构造函数
     **/
    this.Gloop=g.class(function(gameObj, options) {
        if (!(this instanceof vge.game.Gloop)) { // 保证以构造函数方式调用
            return new vge.game.Gloop(gameObj, options);
        }
        this.init(gameObj, options);
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
                // window.setTimeout(loop.call(this), delay);
				this.loop = loop.call(this);
                window.setTimeout(this.loop, delay);
            }
        },
        run: function() {
            this.pause = false;
        },
        pause: function() {
            this.pause = true;
        },
        end: function() {
            this.stop = true;
            window.clearTimeout(timerid);
        }
    });

});



vge.register('vge.input',function(g){
    this.mouse={x:0,y:0};
    this.touch={x:0,y:0};
    var m=[];
    m[0]= m[1] ="left";
    m[2]="right";

    /**
     *鼠标按下触发的处理函数
     **/
    var mousedown_callbacks = {};
    /**
     *鼠标松开触发的处理函数
     **/
    var mouseup_callbacks = {};
    /**
     *鼠标移动触发的处理函数
     **/
    var mousemove_callbacks = [];

    var touchstart_callbacks = [];

    /** 触屏事件
     **/
    var recordTouchstart = function(ev) {
		if(vge.game.loop && vge.game.loop.stop) return;

        var pageX=0, pageY=0,
		// touch1=ev.changedTouches[0];
		touch1=ev.touches[0];

        pageX = touch1.pageX;
        pageY = touch1.pageY;

        vge.input.touch.x = pageX - vge.game.pos[0];
        vge.input.touch.y = pageY - vge.game.pos[1];

        for (var i = 0, len = touchstart_callbacks.length; i < len; i++) {
            touchstart_callbacks[i](ev);
        }
    };

    /**
     *记录鼠标在canvas内的位置
     **/
    var recordMouseMove = function(ev) {
		if(vge.game.loop && vge.game.loop.stop) return;
        var pageX, pageY, x, y;
        ev = vge.tool.getEventObj(ev);
        pageX = ev.pageX || ev.clientX + document.documentElement.scrollLeft - document.documentElement.clientLeft;
        pageY = ev.pageY || ev.clientY + document.documentElement.scrollTop - document.documentElement.clientTop;
        vge.input.mouse.x = pageX - vge.game.pos[0];
        vge.input.mouse.y = pageY - vge.game.pos[1];
        for (var i = 0, len = mousemove_callbacks.length; i < len; i++) {
            mousemove_callbacks[i](ev);
        }
    };

    /**
     *记录鼠标按键
     **/
    var recordMouseDown=function(ev){
		if(vge.game.loop && vge.game.loop.stop) return;
        ev = vge.tool.getEventObj(ev);
        var pressed_btn=m[ev.button];
        if(pressed_btn==="left"){//左键按下
            vge.input.mouse.left_pressed=true;
        }else if(pressed_btn==="right"){//右键按下
            vge.input.mouse.right_pressed=true;
        }
        var callBacksArr=mousedown_callbacks[pressed_btn];
        if(callBacksArr&&callBacksArr.length){
            for (var i = 0, len = callBacksArr.length; i < len; i++) {
                callBacksArr[i](ev);
            }
        }
    };
    var recordMouseUp=function(ev){
		if(vge.game.loop && vge.game.loop.stop) return;
        ev = vge.tool.getEventObj(ev);
        var pressed_btn=m[ev.button];
        if(pressed_btn=="left"){//左键松开
            vge.input.mouse.left_pressed=false;
        }else if(pressed_btn=="right"){//右键松开
            btn=vge.input.mouse.right_pressed=false;
        }
        var callBacksArr=mouseup_callbacks[pressed_btn];
        if(callBacksArr&&callBacksArr.length){
            for (var i = 0, len = callBacksArr.length; i < len; i++) {
                callBacksArr[i](ev);
            }   
        }
    };

	this.bindEvtHandler = function(){
		var o = vge.game.canvas;
		// console.log('canvas:',o,'device',vge.beMobile);
		if(vge.beMobile){
			// vge.tool.addHandler(window, "touchstart", recordTouchstart);
			vge.tool.addHandler(o, "touchstart", recordTouchstart);
		}else{
			vge.tool.addHandler(o, "mousemove", recordMouseMove);
			vge.tool.addHandler(o, "mousedown", recordMouseDown);
			vge.tool.addHandler(o, "mouseup", recordMouseUp);
		}
	}

    /**
     *绑定鼠标按下事件
     **/
    this.onMouseDown = function(buttonName, handler) {
        buttonName = buttonName || "all";
        if (undefined===mousedown_callbacks[buttonName]) {
            mousedown_callbacks[buttonName] = [];
        }
        mousedown_callbacks[buttonName].push(handler);
    };
    this.onMouseUp = function(buttonName, handler) {
        buttonName = buttonName || "all";
        if (undefined===mouseup_callbacks[buttonName]) {
            mouseup_callbacks[buttonName] = [];
        }
        mouseup_callbacks[buttonName].push(handler);
    };
    this.onMouseMove = function(handler) {
        mousemove_callbacks.push(handler);
    };

    this.onTouchStart = function( handler) {
        touchstart_callbacks.push(handler);
    };

});

vge.register('vge.collision',function(g){
	// 碰撞检查
	/**
     *点和矩形间的碰撞
     **/    
    this.point_rect=function(pointX,pointY,rectObj){
        return (pointX>rectObj.x&&pointX<(rectObj.x+rectObj.size[0]) && pointY>rectObj.y&&pointY<(rectObj.y+rectObj.size[1]));
    }
    /**
     *点和圆形间的碰撞
     **/
    this.point_circle = function(pointX, pointY, circleObj) {
        return (Math.pow((pointX - circleObj.x), 2) + Math.pow((pointY - circleObj.y), 2) < Math.pow(circleObj.r, 2));
    }

    /**
     *矩形和矩形间的碰撞
     **/
    this.between_rects = function(rectObjA, rectObjB) {
        return ((rectObjA.x+rectObjA.width >= rectObjB.x && rectObjA.x+rectObjA.width <= rectObjB.right || rectObjA.x >= rectObjB.x && rectObjA.x <= rectObjB.right) && (rectObjA.y+rectObjA.height >= rectObjB.y && rectObjA.y+rectObjA.height <= rectObjB.y+rectObjB.height || rectObjA.y <= rectObjB.y+rectObjB.height && rectObjA.y+rectObjA.height >= rectObjB.y));
    };
    /**
     *圆形和圆形间的碰撞
     **/
    this.between_circles = function(circleObjA, circleObjB) {
        return (Math.pow((circleObjA.x - circleObjB.x), 2) + Math.pow((circleObjA.y - circleObjB.y), 2) < Math.pow((circleObjA.r + circleObjB).r, 2));

    };
    /**
     *多边形间的碰撞
     **/
    this.between_polygons=function(polygonA , polygonB){
        var linesA=polygonA.getLineSegs();
        var linesB=polygonB.getLineSegs();
        
        for(var i=0,len=linesA.length;i<len;i++){
            for(var j=0,len2=linesB.length;j<len2;j++){
                if(linesA[i].isCross(linesB[j])){
                    return true;    
                }
            }
        }
        return false;
    };
    /**
     *多边形和线段间的碰撞
     **/        
    this.line_polygon=function(line,polygon){
        var lines=polygon.getLineSegs();
        for(var i=0,len=lines.length;i<len;i++){
            if(line.isCross(lines[i])){
				
                return true;
            }
        }
        return false;
    };

});


function jstest(){
	// testing: function/objcet/this, constructor/prototype/__proto__
	var x= vge.class(function(){
		this.a='';
		this.f=function(){
		};
	}).static({					// 是 function x 的变量
		b:'123',
		c:function(){
		}
	}).methods({				// 是 function x 的 prototype 变量
		d:'455',
		e:function(){}
	});

	console.log(x, typeof x, x.prototype, x instanceof x, x.a,x.f,x.b,x.c,x.d,x.e);
	var o = new x();
	console.log(o, typeof o, o instanceof x, o.a,o.f, o.b,o.c,o.d,o.e);
	console.log(',,,',x.constructor,',,,', o.constructor,'...',x.__proto__,'...',o.__proto__);
}
// jstest();
