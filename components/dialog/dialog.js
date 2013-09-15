/**
 * jquery dialog wrap
 */

define(['../../app'], function (App) {

	var DEFAULT_OPTIONS = {
		modal: 'true',
		resizable: false,
		show: 'fade',
		hide: 'fade',
		autoOpen: false
	}

	var Dialog = App.Module.extend({

		init: function () {
			this._super();
			this.isRendered = false;
			this.$dialog = null;
			this.width = 475;
		},

		render: function () {
			if (!this.tpl) return false;
			this.$el = $(this.tpl(this));
			if (!this.$container || !this.$dialog) {
				this.$container = $('<div class="' + App.utils.toScore(this.name) + '-dialog-wrap"></div>');
				this.$container.append(this.$el);
				this.$dialog = this.$container.dialog($.extend({}, {width: this.width}, DEFAULT_OPTIONS));
			} else {
				this.$container.html(this.$el)
			}
			this._attachEvents();
		},

		show: function () {
			this.saveState = 'none';
			if ((this.loadState == 'none' || this.loadState == 'error') && this.autoLoad && this.load) this.load();
			this.render();
			this.$dialog.dialog('open');
		},

		hide: function () {
			this.$dialog.dialog('close');
		}

	});

	return Dialog;
});