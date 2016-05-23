// JS���򼶹���
(function(){
	var g = {
        // ����namespace,��ִ����Ӧ����, ������չģ�鹦��
        register: function(ns, o) {
            var nsar = ns.split('.'),
			parent = window,i=0,l=nsar.length,part='';
            for (i=0; i<l; i++) {
				part=nsar[i];
                if(parent[part] === undefined) {
					parent[part] = {};
				}
                parent = parent[part];
            }
			// function o(vge){...} ��չ����
            if (o) {
				// function.call(thisArg[,arg1[,arg2[,...]]]) ���� apply
                o.call(parent, this);
            }
            return parent;
        },
		// ���ƶ�������
		extend: function(destination, source, isCover) {
			(undefined === isCover) && (isCover = true);
			for (var name in source) {
				if (isCover || undefined === destination[name]) {
					// if(name==='getSpeedX') console.log(name,destination);
					destination[name] = source[name];
				}
			}
			return destination;
		}
	};
	// ��¶�ⲿ���õĶ��� vge(Vjifen Game Engine)
	window.vge = g;
	// console.log('vge init',vge);
})();
