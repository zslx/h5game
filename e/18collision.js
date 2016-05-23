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
