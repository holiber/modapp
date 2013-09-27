define([
	'./utils',
	'./module',
	'./router',
	'./protocol',
	'./activedata'
],
function (utils, Module, Router, Protocol, ActiveData) {
	
	var App = window.App = Module.extend({

		id: 0,

		init: function (defaultPage) {
			this._super();
			this.app = this;
			this.pageDepend = true;
			this.activeFlag = true;
			this.router = new App.Router(defaultPage);
			this.add('router', this.router);
		},

		start: function ($container) {
			this.$container = $container;
			if (!this.$container || !this.$container.length) {
				throw 'application container not found';
			};
			this.setPage(this.router.getPage());
			this.render();
		},

		render: function ($container) {
			if ($container) this.$container = $container;
			if (!this.$container || !this.$container.length) return;
			this.$el = $(this.tpl(this));
			this.placeModules();
			this.emit('render');
			this.$container.html(this.$el);
			this.emit('app/ready');
		},

		getPage: function (deep) {
			return this.getPagePath().split('/')[deep - 1];
		},
		/**
		 *
		 * @param {Boolean} [asRoute = false]
		 * @returns {string}
		 */
		getPagePath: function (asRoute) {
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
				path += asRoute ? module.pageRoute : module.page;
				path += '/';
				module = module.children[module.page];
			}
			path = path.substr(0, path.length - 1);
			return path;
		},

		getRoutePath: function () {
			return this.getPagePath(true);
		},

		switchFullscreen: function () {
			this.$el.find('.layout').hide();
			this.$el.find('.fullscreen').show();
		},

		switchLayout: function () {
			this.$el.find('.fullscreen').hide();
			this.$el.find('.layout').show();
		}

	}, {
		utils: utils,
		Module: Module,
		Router: Router,
		Protocol: Protocol,
		ActiveData: ActiveData,

		nextId: function () {
			return ++this.id;
		}
	});

	return App;
});