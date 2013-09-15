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
			this.pagePlace = null;
			this.helper = {};
			this.deep = 1;
			this.pageDepend = false;
			this.autoLoad = true;
			this.m = {};//activemarks
			this.activeMarkValue = 'active';
			this.activeMark = App.utils.toScore(this.name) + '-mark';
			this.loadState = LSTATE_NONE;
			this.saveState = 'none';
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
			module._onReady && module._onReady();
			this.emit('moduleAdded', module);
			return true;
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

			if (typeof($container) == 'string') {
				var $part = $(this.tpl(this)).find('.' + $container);
				this.$el.find('.' + $container).replaceWith($part);
				return true;
			}

			if (this.pageDepend && !$container) {
				var $el = this.$container.find(':first');
				if (!$el.hasClass(this.name)) return false;
			}

			if ($container) this.$container = $container;
			if (!this.tpl) return false;
			if (!this.$container || !this.$container.length) return false;
			this.$el = $(this.tpl(this));
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
			if (!this.get(page)) page = 'notfound';
			var oldPlace = this.pagePlace;
			this.setPage(page);
			if (!this.$el || !this.$el.length) return;
			this.$el.find('.' + oldPlace).removeClass(oldPlace).addClass(this.pagePlace);
			this.$el.find('.' + this.activeMark).removeClass(this.activeMarkValue);
			this.$el.find('.' + this.activeMark + '.m-' + App.utils.toScore(page)).addClass(this.activeMarkValue);
			this.placeModules();
		},

		/**
		 * placement of the current module on the page
		 * @param {jQuery} $container
		 * @param {String} subPage
		 */
		place: function ($container, subPage) {
			this.setPage(subPage);
			this.render($container);
			this.placeModules();
			if ((this.loadState == LSTATE_NONE || this.loadState == LSTATE_ERROR) && this.autoLoad && this.load) this.load();
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
				var selector = '.' + App.utils.toScore(moduleName) + '-place';
				var $container = this.$el.find(selector);
				var $internalEl = $container.find(':first');
				if ($internalEl.hasClass(App.utils.toScore(moduleName))) continue;
				if ($container && $container.length) module.place($container, (module.page || module.defaultPage) ? subPage : null);
			}
			return true;
		},

		getPagePlace: function () {
			return App.utils.toScore(this.getComputedPage()) + '-place';
		},

		setPage: function (page) {
			this.page = page || this.defaultPage;
			this.pagePlace = this.getPagePlace();
			for (var key in this.m) {
				this.m[key] = this.activeMark + ' m-' + App.utils.toScore(key);
				if (key == this.page) this.m[key] += ' ' + this.activeMarkValue;
			}
		},

		getDeep: function () {
			if (!this.parent) return 0;
			return 1 + this.parent.getDeep();
		},

		getPageDeep: function () {
			var result = Number(!!this.page);
			if (this.parent) result += this.parent.getPageDeep();
			return result;
		},

		getComputedPage: function () {
			return this.page || (this.parent && this.parent.getComputedPage());
		},

		_attachEvents: function () {
		},

		_onReady: function () {

		},

		_onPlace: function () {

		},

		_onRoute: function (routeEvent) {
			var deep = this.getPageDeep();
			var changeDeep = App.Router.getChangeDeep('!' + this.app.getPagePath(), this.app.router.hash);
			if (deep != changeDeep) return;
			var newPage = routeEvent.data.router.getPage(changeDeep);
			if (!this.page && !this.defaultPage) return;

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