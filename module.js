define(['./mixins/events'], function (eventMixin) {

	//load states
	var LSTATE_NONE = 'none';
	var LSTATE_LOADING = 'loading';
	var LSTATE_DONE = 'done';
	var LSTATE_ERROR = 'error';

	var Module = Class.extend([eventMixin], {

		init: function (defaultPage) {
			this.children = {};
			this.defaultPage = defaultPage;
			this.parent = null;
			this.app = null;
			this.$el = null;
			this.$container = null;
			this.page = null;
			this.pageTpl = null;
			this.pagePlace = null;
			this.pageRoute = null;
			this.helper = {};
			this.deep = 1;
			this.routeDepend = false;
			this.autoLoad = true;
			this.autoPlace = true;
			this.m = {};//activemarks
			this.activeMarkValue = 'active';
			this.activeMark = null;
			this.loadState = LSTATE_NONE;
			this.saveState = 'none';
			this.activeFlag = false;
			this.allModulesPlaced = true;
			if (!this.name) this.name = null;
			if (!this.defaultPage) this.defaultPage = null;
			this.setPage();
		},

		/**
		 * add ([name,] element)
		 */
		add: function (name, module) {
			if (typeof(name) != 'string') {
				module = name;
				name = module.name;
			}

			if (!name) {
				throw 'unnamed item';
				return false;
			}
			if (this.children[name]) return false;
			this.children[name] = module;
			module.parent = this;
			if (module instanceof App.Module) module.setApp(this.app);
			this.m[name] = '';
			this._updateActiveMarks();
			module._onReady && module._onReady();
			this.allModulesPlaced = false;
			this.emit('moduleAdded', module);
			return module;
		},


		/**
		 *
		 * @param {String} itemName
		 * @return {Module|*} item
		 */
		get: function (itemName) {
			return this.children[itemName];
		},

		setApp: function (app) {
			this.app = app;
			for (var childName in this.children) {
				var childModule = this.children[childName];
				if (childModule instanceof App.Module) childModule.setApp(app);
			}
		},

		render: function ($container) {

			if (!this.isActive()) return false;

			//render part of template
			if (typeof($container) == 'string') {
				var $part = $(this.tpl(this)).find('.' + $container);
				this.$el.find('.' + $container).replaceWith($part);
				return true;
			}

			//stop render if another module placed in this container
			if (this.pageDepend && !$container) {
				var $el = this.$container.find(':first');
				var subModuleClass = App.utils.toScore(this.name) + '-module';
				if (!$el.hasClass(subModuleClass)) return false;
			}

			if ($container) this.$container = $container;
			if (!this.tpl) return false;
			if (!this.$container || !this.$container.length) return false;
			this.$el = $(this.tpl(this));
			//if (!this.allModulesPlaced) this.placeModules();
			this.placeModules();
			this.$container.html(this.$el);
			return true;
		},

		remove: function () {
			//TODO:
		},

		destroy: function () {
			//TODO:
		},

		switchPage: function (page) {
			var oldPlaceClass = this.pagePlace;
			this.setPage(page);
			if (!this.$el || !this.$el.length) return;
			this.$el.find('.' + oldPlaceClass).removeClass(oldPlaceClass).addClass(this.pagePlace);
			this.$el.find('.' + this.activeMark).removeClass(this.activeMarkValue);
			this.$el.find('.' + this.activeMark + '.m-' + App.utils.toScore(this.page)).addClass(this.activeMarkValue);
			this.placeModules();
		},

		isActive: function () {
			if (!this.activeFlag) return false;
			if (!this.parent) return true;
			if (!this.parent.activeFlag) return false;
			return this.parent.isActive();
		},

		/**
		 * placement of the current module on the page
		 * @param {jQuery} $container
		 * @param {String} subPage
		 */
		place: function ($container, subPage) {
			this.setPage(subPage);
			this.activeFlag = true;
			this.render($container);
			$container.data('module', this);
			//this.placeModules();
			if ((this.loadState == LSTATE_NONE || this.loadState == LSTATE_ERROR) && this.autoLoad && this.load) this.load();
			this.off();
			this._attachEvents();
			setTimeout(this._onPlace.bind(this));
			this.emit('place');
		},

		/**
		 * placement of slave modules on the page
		 * @return {boolean}
		 */
		placeModules: function () {
			if (!this.$el) return false;
			var subPage = this.app.router.getPage(this.getPageDeep() + 1);

			for (var moduleName in this.children) {
				var module = this.children[moduleName];
				if (!(module instanceof App.Module)) continue;
				if (!module.name) continue;
				var moduleSubPage = (module.page || module.defaultPage) ? subPage : null;
				if (!this.autoPlace) continue;
				var selector = '.' + App.utils.toScore(moduleName) + '-place';
				var $container = this.$el.find(selector);
				if (!$container.length) continue;
				var $internalEl = $container.find(':first');
				if ($internalEl.hasClass(App.utils.toScore(moduleName + '-module'))) continue;
				var oldModule = $container.data('module');
				if (oldModule) oldModule.activeFlag = false;
				module.place($container, moduleSubPage);
			}
			this.allModulesPlaced = true;
			return true;
		},

		getPagePlace: function () {
			return App.utils.toScore(this.getComputedPage()) + '-place';
		},

		setPage: function (page) {
			page = page || this.defaultPage;
			if (this.defaultPage) this.routeDepend = true;
			var route = page;
			if (!this.get(page)) {
				route = page;
				if (!route) route = this.getRouteByHash();
				page = this.getPageByRoute(route) || page;
			}

			this.page = page;
			this.pageRoute = route;
			this.pagePlace = this.getPagePlace();
			this._updateActiveMarks();
			var subModule = this.get(this.page);
			if (subModule) {
				subModule.setRoute(route);
				var subPage = this.app.router.getPage(this.getPageDeep() + 1);
				subModule._onActivate(subPage);
			}
		},

		setRoute: function (route) {
			this.route = route;
		},

		getDeep: function () {
			if (!this.parent) return 0;
			return 1 + this.parent.getDeep();
		},

		getPageDeep: function () {
			var result = Number(!!this.page);
			if (this.routeDepend) result = 1;
			if (this.parent) result += this.parent.getPageDeep();
			return result;
		},

		getComputedPage: function () {
			return this.page || (this.parent && this.parent.getComputedPage());
		},

		getPageByRoute: function (page) {
			if (!page) return;
			var moduleName = null;
			for (var childName in this.children) {
				var child = this.children[childName];
				if (!(child instanceof App.Module)) continue;
				if (child.name != page) continue;
				moduleName = child.name;
				break;
			}
			if (moduleName) return moduleName;
			for (var childName in this.children) {
				var child = this.children[childName];
				if (!(child instanceof App.Module)) continue;
				if (!child.pageTpl || !child.pageTpl.test(page)) continue;
				moduleName = child.name;
				break;
			}
			return moduleName;
		},

		getRouteByHash: function () {
			var deep = this.getPageDeep();
			var route = App.Router.getPage(deep);
			return route;
		},

		on: function (type, selector, fn) {
			var args = Array.prototype.slice.call(arguments, 0);
			args[0] += '.module';
			this.$container.on.apply(this.$container, args);
		},

		off: function () {
			this.$container && this.$container.off('.module');
		},

		_attachEvents: function () {
		},

		_onReady: function () {

		},

		_onPlace: function () {

		},

		_onActivate: function () {

		},

		_updateActiveMarks: function () {
			this.activeMark = App.utils.toScore(this.name) + '-mark';
			for (var key in this.m) {
				this.m[key] = this.activeMark + ' m-' + App.utils.toScore(key);
				if (key == this.page) this.m[key] += ' ' + this.activeMarkValue;
			}
		},

		_onRoute: function (routeEvent) {
			var deep = this.getPageDeep();
			var changeDeep = App.Router.getChangeDeep('!' + this.app.getRoutePath(), this.app.router.hash);
			if (!changeDeep) return;
			if (deep != changeDeep) return;
			var newPage = routeEvent.data.router.getPage(changeDeep);
			if (!this.page && !this.routeDepend) return;

			this.switchPage(newPage || this.defaultPage);
		},

		_on: function (event) {
			switch (event.name) {
				case 'route': this._onRoute(event);break;
			}
		}
	});

	return Module;
});