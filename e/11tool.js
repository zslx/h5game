// DOM操作工具
vge.register('vge.tool',function(g){
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
			}
		} else if (element.attachEvent) {
			this.addHandler = function(element, type, handler, flow) {
				// element.attachEvent('on'+type, handler);
				element.attachEvent('on' + type, function() {
					handler.call(element);// modify this arg
				});
			}
		} else {
			this.addHandler = function(element, type, handler, flow) {
				element['on' + type] = handler;
			}
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

	this.beMobile = vge.tool.isMobile();

});
