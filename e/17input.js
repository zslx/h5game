vge.register('vge.input',function(g){
    this.mouse={x:0,y:0};
    this.touch={x:0,y:0};
    var m=[];
    m[0]= m[1] ="left";
    m[2]="right";

    /**
     *��갴�´����Ĵ�����
     **/
    var mousedown_callbacks = {};
    /**
     *����ɿ������Ĵ�����
     **/
    var mouseup_callbacks = {};
    /**
     *����ƶ������Ĵ�����
     **/
    var mousemove_callbacks = [];

    var touchstart_callbacks = [];

    /** �����¼�
     **/
    var recordTouchstart = function(ev) {
		if(vge.game.loop && vge.game.loop.stop) return;
        ev = vge.tool.getEventObj(ev);
		ev.stopPropagation();
		ev.preventDefault();

		// touch1=ev.changedTouches[0];
        var pageX=0, pageY=0, touch1=ev.touches[0];

        pageX = touch1.pageX;
        pageY = touch1.pageY;

        vge.input.touch.x = pageX - vge.game.pos[0];
        vge.input.touch.y = pageY - vge.game.pos[1];

        for (var i = 0, len = touchstart_callbacks.length; i < len; i++) {
            touchstart_callbacks[i](ev);
        }
    };

    /**
     *��¼�����canvas�ڵ�λ��
     **/
    var recordMouseMove = function(ev) {
		if(vge.game.loop && vge.game.loop.stop) return;
        ev = vge.tool.getEventObj(ev);
		ev.stopPropagation();
		ev.preventDefault();

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
     *��¼��갴��
     **/
    var recordMouseDown=function(ev){
		if(vge.game.loop && vge.game.loop.stop) return;
        ev = vge.tool.getEventObj(ev);
		ev.stopPropagation();
		ev.preventDefault();
		
        var pressed_btn=m[ev.button];
        if(pressed_btn==="left"){//�������
            vge.input.mouse.left_pressed=true;
        }else if(pressed_btn==="right"){//�Ҽ�����
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
		ev.stopPropagation();
		ev.preventDefault();

        var pressed_btn=m[ev.button];
        if(pressed_btn=="left"){//����ɿ�
            vge.input.mouse.left_pressed=false;
        }else if(pressed_btn=="right"){//�Ҽ��ɿ�
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
     *����갴���¼�
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
