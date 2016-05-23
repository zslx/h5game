vge.register('vge.base', function(g){
	this.ObjectList=g.class(function(){
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


});
