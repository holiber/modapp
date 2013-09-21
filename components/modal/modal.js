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
			this.$container.on('hide', this._onHide.bind(this));
			this.$container.on('hidden', this._onHidden.bind(this));
		},

		hide: function () {
			this.$container.modal('hide');
		},

		_onActivate: function () {
			this.show();
		},

		_onHide: function () {
			console.log('hide');
			window.location.hash = '#..';
		},

		_onHidden: function () {
		}

	});

});