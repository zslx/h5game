function jstest(){
	// testing: function/objcet/this, constructor/prototype/__proto__
	var x= vge.class(function(){
		this.a='';
		this.f=function(){
		};
	}).static({					// �� function x �ı���
		b:'123',
		c:function(){
		}
	}).methods({				// �� function x �� prototype ����
		d:'455',
		e:function(){}
	});

	console.log(x, typeof x, x.prototype, x instanceof x, x.a,x.f,x.b,x.c,x.d,x.e);
	var o = new x();
	console.log(o, typeof o, o instanceof x, o.a,o.f, o.b,o.c,o.d,o.e);
	console.log(',,,',x.constructor,',,,', o.constructor,'...',x.__proto__,'...',o.__proto__);
}
jstest();
