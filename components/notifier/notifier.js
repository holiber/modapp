/**
 * jquery dialog wrap
 */

define([
	'../../app',
	'../../mixins/events'
], function (App, EventsMixin) {

	var DEFAULT_MAX = 3;
	var DEFAULT_TIME = 5000;
	var DEFAULT_ANIMATION_SPEED = 300;

	var DEFAULT_LAYOUT_TPL = function (notifier) {
		return '<div class="notifier">' +
				'<div class="notifier-track">' +
					(function () {
						var result = '';
						for (var i = 0; i < notifier.items.length; i++) {
							result += notifier.itemTpl({item: notifier.items[i], notifier: notifier});
						}
						return result;
					})() +
				'</div>' +
			'</div>';
	}

	var DEFAULT_ITEM_TPL =  function (data) {
		return '<div class="notifier-item alert alert-' + data.item.type + '" rel="' + data.item.id + '">' +
			'<div class="text">' +
				data.item.text +
			'</div>' +
			'<div class="notifier-close"></div>' +
		'</div>';
	}

	var Notifier = App.Module.extend([EventsMixin], {

		/**
		 * @param {Function} [tpl]
		 * @param {Number} max
		 */
		init: function (tpl, max) {
			this._super();
			//swap args
			if (arguments.length = 1) {
				max = tpl;
				tpl = undefined;
			}

			tpl = tpl || {};
			this.name = 'notifier';
			this.tpl = tpl.layout|| DEFAULT_LAYOUT_TPL;
			this.itemTpl = tpl.item || DEFAULT_ITEM_TPL; //{layout: tpl.layout || DEFAUT_LAYOUT_TPL, item: tpl.item || DEFAULT_ITEM_TPL};
			this.$el = null;
			this.$container = null;
			this.max = max || DEFAULT_MAX;
			this.items = [];
			this.lastId = 0;
			this.animationSpeed = DEFAULT_ANIMATION_SPEED;
		},

		/**
		 * @param {String} [type='info']
		 * @param {String} text
		 * @param {Object} [options]
		 */
		push: function (type, text, options) {
			switch (arguments.length) {
				case 1:
					text = type;
					type = undefined;
				break;
				case 2:
					if (typeof(text) == 'string') break;
					options = text;
					text = type;
					type = undefined;
				break;
				case 3:
					type = type || 'info';
					text = text || '';
					options: options || {};
				break;
			}
			var notification = $.extend({}, {id: ++this.lastId, type: 'info', text: 'empty notification', time: DEFAULT_TIME}, {text: text, type: type}, options);
			notification.timeoutId = setTimeout(this._onNotifyTimeout.bind(this, notification), notification.time);
			if (this.max <= this.items.length) this.close(this.items[0].id);
			this.items.push(notification);
			var $notification = $(this.itemTpl({item: notification, notifier: this}));
			this.$el.find('.notifier-track').append($notification);
			$notification.css({opacity: 0}).animate({opacity: 1});
		},
//
//		render: function ($container) {
//			if ($container) this.$container = $container;
//			this.$el = $(this.tpl.layout(this));
//			this.$container.html(this.$el);
//			this._attachEvents();
//		},

		close: function (id) {
			var index = -1;
			for (var i = this.items.length; i--;) if (this.items[i].id == id) index = i;
			if (!~index) return false;
			var notification = this.items[index];
			clearTimeout(notification.timeoutId);
			this.items.splice(index, 1);
			var $notification = this.$el.find('.notifier-item[rel="' + id + '"]');
			$notification.slideUp(function () {$notification.remove()});
			return index;
		},

		clean: function () {
			//TODO:
		},

		_attachEvents: function () {
			var namespace = '.notificator';
			this.$el.off('.notificator');
			this.$el.on('click' + namespace, '.notifier-close', this._onCloseClick.bind(this));
		},

		_onCloseClick: function (e) {
			var $el = $(e.currentTarget).closest('.notifier-item');
			var id = $el.attr('rel');
			this.close(id);
		},

		_onNotifyTimeout: function (notification) {
			this.close(notification.id);
		},

		_on: function (event) {
			if (event.name == 'notifier') {
				var params = event.data;
				if (!params) return;
				if (typeof params == 'string') params = {text: params};
				this.push(params.type, params.text, params.options);
			}
		}

	});

	return Notifier;
});