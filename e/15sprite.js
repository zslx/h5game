vge.register('vge.base', function(g){
    this.Sprite = g.class(function(id, options) {
        // if (!(this instanceof arguments.callee)) {
        //     return new arguments.callee(id, options);
        // }
        if (!(this instanceof vge.base.Sprite)) {
            return new vge.base.Sprite(id, options);
        }

        this.init(id, options);
    },vge.shape.Rect).methods({
        init: function(options) {
            vge.base.Sprite.parent.prototype.init.call(this,options);
            this.context=options.context||vge.game.context;
            this.imgSize=options.imgSize||this.size;
            this.spriteSheetList = {};
            if (this.src) { //����ͼƬ·��
                this.setCurrentImage(this.src, this.imgStart,this.imgSize);
            }else if (this.spriteSheet) {//����spriteSheet����
                this.addAnimation(this.spriteSheet);
                this.setCurrentAnimation(this.spriteSheet);
            }
        },
        /*
         *��Ӷ���
         **/
        addAnimation: function(spriteSheet) {
            spriteSheet.relatedSprite=this;
            this.spriteSheetList[spriteSheet.id] = spriteSheet;
        },
        /**
         *���õ�ǰ��ʾ����
         **/
        setCurrentAnimation: function(id) {//�ɴ���id��spriteSheet
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
         *�жϵ�ǰ�����Ƿ�Ϊ��id�Ķ���
         **/
        isCurrentAnimation: function(id) {
            var spriteSheet=this.spriteSheet;
            if (vge.tool.isString(id)) {
                return (spriteSheet && spriteSheet.id === id);
            }else if (vge.tool.isObject(id)) {
                return spriteSheet === id;
            }
        },
        /**
         *���õ�ǰ��ʾͼ��
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
         *�жϵ�ǰͼ���Ƿ�Ϊ��src��ͼ��
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
         *�����ض�֡
         **/
        index:function(index){
            var spriteSheet=this.spriteSheet;
            spriteSheet&&spriteSheet.index(index);      
        },

        /**
         *����λ�ú�֡����
         **/
        update: function(duration) {//duration:��֡��ʱ ��λ����
            vge.base.Sprite.parent.prototype.update.call(this,duration);
            if (this.spriteSheet) {//����spriteSheet����
                this.spriteSheet.pos[0] = this.pos[0];
                this.spriteSheet.pos[1] = this.pos[1];
                this.spriteSheet.update();
            }
        },
        /**
         *���Ƴ�sprite
         **/
        draw: function() {
            var context = this.context;
            if (this.spriteSheet) {
                this.spriteSheet.pos = this.pos;
                this.spriteSheet.draw();
            }else if (this.image) {
                context.save()
                var point=this.pos,	// Ĭ�ϵ���Ե�Ϊsprite���е�
                halfWith = this.size[0] / 2,
                halfHeight = this.size[1] / 2;

                context.translate(point[0],point[1]);
                context.rotate(this.angle * -1);


                context.drawImage(
					this.image,
					this.imgStart[0], this.imgStart[1],
					this.imgSize[0], this.imgSize[1],
					this.pos[0]-point[0]-halfWith, this.pos[1]-point[1]-halfHeight,
					this.size[0], this.size[1]);

                // context.drawImage(this.image, this.pos[0], this.pos[1], this.size[0],this.size[1]);


                context.restore();
            }
        }
    });
    
});
