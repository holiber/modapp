define(function () {

	var DIRRECTION_ALL = 'all';
	var DIRRECTION_PARENT = 'parent';
	var DIRRECTION_CHILDREN = 'children';
	var DIRRECTION_GLOBAL = 'global';
	var DIRRECTION_ROOT = 'root';

	return {

		/**
		 * emit (name[,data [,dirrection] [,callback]])
		 * @param {String} name
		 * @param {Object} [data]
		 * @param {String} [dirrection='global']
		 * @param {Function} [callback]
		 */
		emit: function (name, data, dirrection, callback) {

			//swap arguments
			if (dirrection && $.isFunction(dirrection)) callback = dirrection;
			dirrection = dirrection || 'global';

			var e = {name: name, data: data, sender: this, direction: dirrection, way: 'children', isGlobal: false}

			if ((dirrection == DIRRECTION_ALL || dirrection == DIRRECTION_CHILDREN) && this.children) {
				for (var itemName in this.children) {
					var item = this.children[itemName];
					item._on(e);
				}
				return;
			}

			if ((dirrection == DIRRECTION_ALL || dirrection == DIRRECTION_PARENT) && this.parent) {
				e = $.extend({}, e, {way: 'parent'});
				this.parent._on(e);
				return
			}

			var root = this;
			while (root.parent) root = root.parent;

			if (dirrection == DIRRECTION_ROOT) {
				root._on(e);
				for (var itemName in root.children) {
					var item = root.children[itemName];
					item._on(e);
				}
				return;
			}

			if (dirrection == DIRRECTION_GLOBAL) {

				e = $.extend({}, e, {way: 'children', isGlobal: true});

				var fnSendEvent = function (node) {
					node._on(e);
					for (var nodeName in node.children) {
						fnSendEvent(node.children[nodeName]);
					}
				}

				fnSendEvent(root);
				callback && setTimeout(callback);
			}
		},

		_on: function (e) {

		}

	}


});