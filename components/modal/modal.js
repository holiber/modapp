/**
 * twitter bootstrap modal wrap
 */

define(['../../app'], function (App) {

	var DEFAULT_OPTIONS = {
		backdrop: true,
		keyboard: true
	}

	return App.Module.extend({

		init: function (options) {
			this.options = $.extend({}, DEFAULT_OPTIONS, options);
			this._super();
			this.data = null;
		},

		render: function () {
			if (!this.tpl) return false;
			this.$el = $(this.tpl(this));
			if (!this.$container) {
				this.$container = this.$el;
			} else {
				this.$container.html(this.$el.find('> *'));
			}
			this.off();
			this._attachEvents();
			return true;
		},

		show: function () {
			this.saveState = 'none';
			if ((this.loadState == 'none' || this.loadState == 'error') && this.autoLoad && this.load) this.load();
			this.render();
			this.$container.modal('show');
			this.$container.off('.bs.modal');
			this.$container.on('hide.bs.modal', this._onHide.bind(this));
			this.$container.on('hidden.bs.modal', this._onHidden.bind(this));
		},

		hide: function () {
			this.$container.modal('hide');
		},

		getPageDeep: function () {
			var result = 1;
			if (this.parent) result += this.parent.getPageDeep();
			return result;
		},

		_onActivate: function () {
			this.show();
		},

		_onHide: function () {
		},

		_onHidden: function () {
		},

		_onRoute: function (routeEvent) {
			var deep = this.getPageDeep();
			var changeDeep = App.Router.getChangeDeep('!' + this.app.getPagePath(), this.app.router.hash);
			if (deep > changeDeep && this.parent) {
				if (!this.parent.isActive()) {
					this.hide()
				} else {
					if (this.parent.page != this.name) this.hide();
				}
			}
			if (deep != changeDeep) return;
			var newPage = routeEvent.data.router.getPage(changeDeep);
			if (!this.page && !this.defaultPage) return;

			this.switchPage(newPage || this.defaultPage);
		},

	});

});