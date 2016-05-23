vge.register('vge.shape',function(g){
	this.Rect=g.class(function(options) {
        if (!(this instanceof vge.shape.Rect)) {
            return new vge.shape.Rect(options);
        }
		options= options ||{};
        this.init(options);
    },g.MovableObj).methods({
        init: function(options) {
            this.pos=[0,0];
            this.size=[100,100];
            this.style="Red";
            this.isFill=options.fill===undefined?true:options.fill;
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
                context.fillRect(this.pos[0],this.pos[1], this.size[0], this.size[1]);
            }else {
                context.strokeStyle = this.style;
                context.strokeRect(this.pos[0],this.pos[1],this.size[0],this.size[1]);
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
		options= options ||{};
        this.init(text, options);
    }, g.MovableObj).methods({
        init: function(text,options) {
            this.text=text||"test";
            this.pos= [100,100];
            this.style="red";
            this.isFill=options.fill===undefined?true:options.fill;
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
