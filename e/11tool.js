// DOM��������
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
		// ��Ԫ�ذ��¼�������, ���� flow������Ϣ�����ĸ��׶δ���
		// ʹ���ӳټ��ؼ���(��������ʱ��ִ��): �����ظ��ж�
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
		// �Ƴ�Ԫ����ĳ�¼��Ĵ�����
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
		// ʹ���������ؼ��� �����ظ��ж�
	})();

	this.getEventObj = function(e) {
        return e || win.event;
    };
    this.getEventTarget = function(e) {
        var ev = this.getEventObj(e);
        return ev.target || ev.srcElement;
    };

    /**
       ��ֹĬ����Ϊ
    **/
    this.preventDefault = function(eve) {
        if (eve.preventDefault) {
            eve.preventDefault();
        }else {
            eve.returnValue = false;
        }

    };

	this.isMobile = function(){ //�Ƿ�Ϊ�ƶ��ն�
		var u = navigator.userAgent;
		// console.log('navigator.userAgent',u);
		return /Android|webOS|iPhone|iPod|BlackBerry/i.test(u);
		// return !!u.match(/AppleWebKit.*Mobile.*/) || !!u.match(/AppleWebKit/);
	};

	this.audioPlayLoop=function(o){ // ѭ���������֣�δ��
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
        //�̳�
        if(vge.tool.isFunction(parent)){
			// parent.apply(this,arguments); // call parent constructor on child
            var F = function() {};
            F.prototype = parent.prototype; // ֻ�̳�ԭ��
            newClass.prototype = new F();	// ��ֹ�����޸��˸����ԭ��
            newClass.prototype.constructor = newClass; // �ָ���ȷ
            newClass.parent = parent;
        }

        //��չ1 newClass.static_method();
        newClass.static=function(funcObj){
            vge.extend(this, funcObj);
            return this;
        };

        //��չ2 new newClass().methods();
        newClass.methods=function(funcObj){
            vge.extend(this.prototype,funcObj);
			// console.log('this:',this,'prototype:',this.prototype);
            return this;
        };

        return newClass;
    };

	this.beMobile = vge.tool.isMobile();

});
