define([
	'./utils',
	'./module',
	'./router',
	'./protocol'
],
function (utils, Module, Router, Protocol) {
	
	var App = window.App = Module.extend({

		id: 0,

		init: function (defaultPage) {
			this._super();
			this.app = this;
			this.pageDepend = true;
			this.router = new App.Router(defaultPage);
			this.add('router', this.router);
		},

		getPage: function (deep) {
			return this.getPagePath().split('/')[deep - 1];
//			var module = this;
//			while (module.getDeep() < deep) {
//				if (!module.children[module.page]) return false;
//				module = module.children[module.page]
//			}
//			return module.name;
		},

		getPagePath: function () {
			var module = this;
			var path = '';
			if (!module.page) {
				for (var moduleName in module.children) {
					if (module.children[moduleName].page) {
						module = module.children[moduleName];
						break;
					}
				}
			}

			while (module.page) {
				if (!module.children[module.page]) {
					for (var moduleName in module.children) {
						if (module.children[moduleName].page) {
							module = module.children[moduleName];
							break;
						}
					}
					break;
				}
				path += module.page + '/';
				module = module.children[module.page];
			}
			path = path.substr(0, path.length - 1);
			return path;
		}

	}, {
		utils: utils,
		Module: Module,
		Router: Router,
		Protocol: Protocol,

		nextId: function () {
			return ++this.id;
		}
	});

	return App;
});