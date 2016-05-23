vge.register('vge.base', function(g){
    var list=[];//动画队列
    this.Animation=g.class(function(options){
        if (!(this instanceof vge.base.Animation)) {
            return new vge.base.Animation(options);
        }
        this.init(options);
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

});
