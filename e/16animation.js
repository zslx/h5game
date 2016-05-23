vge.register('vge.base', function(g){
    var list=[];//��������
    this.Animation=g.class(function(options){
        if (!(this instanceof vge.base.Animation)) {
            return new vge.base.Animation(options);
        }
        this.init(options);
    }).methods({
        init:function(options){
            this.target=null;    //Ŀ�����
            this.propertyName="";//������
            this.duration=0;    //�仯��ʱ
            this.onFinished=null;//��ɶ����Ļص�
            this.tweenFun=Animation.tweenObj.linear; //ʹ�õĻ���������Ĭ��Ϊ���������˶�
            this.setOptions(options);
            this.from=parseFloat(this.target[this.propertyName]||0); //��ʼֵ
            this.to=parseFloat(this.to||0);							 //Ŀ��ֵ
            this.changeDistance=this.to-this.from;					 //�仯����
        },
        setOptions: function(options) {
            vge.extend(this, options);
        },
        /**
         *��������
         **/
        update:function(){
            var time=Date.now()-this.startTime;//��ʱ
            var p=time/this.duration;
            if(p>=1){//��ɶ���
				this.onFinished&&this.onFinished.call(this);
				return;
            }
            var currentValue=this.changeDistance*this.tweenFun(time/this.duration)+this.from;
            this.target[this.propertyName]=currentValue;
        }
    }).static({
        /**
         *��Ӷ���
         **/            
        add:function(animation){
            list.push(animation);
            animation.startTime=Date.now();//���ó�ʼʱ��
        },
        /**
         *�Ƴ�����
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
         *���¶����еĶ���
         **/ 
        update:function(){
            for(var i=0;i<list.length;i++){
                list[i].update();
            }
        },
        /**
         *������������
         **/ 
        tweenObj:{
            linear:function(p){//��������ʱ��ռ������ʱ��İٷֱ�
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
