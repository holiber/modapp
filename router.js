define(['./mixins/events'], function (eventMixin) {

	var Router = Class.extend([eventMixin], {

		init: function (defaultPage) {
			this.defaultPage = defaultPage;
			this.hash = window.location.hash.substr(1);
			this.route = null;
			this.paramsStr = null;
			this.params = null;
			this.referrer = null;

			var arHash = this.hash.split('?');
			this.route = arHash[0];
			this.paramsStr = arHash[1];
			if (this.paramsStr) {
				this.params = this.parseParams(this.paramsStr);
			}
			$(window).hashChange();
			$(window).on('hashchange', $.proxy(this._onRoute, this));
		},

		/**
		 * getPage([deep])
		 * @param {Number} [deep]
		 * @return {String|Boolean} page
		 */

		getPage: function (deep) {
			var level = deep || 1;
			var hash = window.location.hash.split('!')[1];
			if (hash) hash = hash.split('?')[0];
			var page = null;
			if (hash) {
				page = hash.split('/')[level - 1];
			} else if (deep > 1) {
				page = false;
			} else {
				page = this.defaultPage;
			}
			return page;
		},

		_onRoute: function (page) {
			var oldHash = this.hash;
			var hash = window.location.hash.substr(1);
			var onlyParams = false;
			if (hash.charAt(0) == '?') onlyParams = true;
			var paramsStr = null;
			var arHash = hash.split('?');
			var route = arHash[0];
			paramsStr = arHash[1];

			if (onlyParams) {
				var newHash = oldHash.split('?')[0];
				if (paramsStr) newHash += '?' + paramsStr;
				window.location.hash = newHash;
				return;
			}

			if (route == '..') {
				var hashItems = oldHash.split('/');
				if (hashItems[hashItems.length] == '/') hashItems.splice(hashItems.length - 1, 1);
				hashItems && hashItems.splice(hashItems.length - 1, 1);
				hash = hashItems.join('/');
				if (paramsStr) hash += '?' + paramsStr;
				window.location.hash = hash;
				return;
			}

			this.hash = hash;
			this.route = route;
			this.paramsStr = paramsStr;
			this.referrer = oldHash;

			if (paramsStr) {
				this.params = this.parseParams(this.paramsStr);
			} else {
				this.params = null;
			}

			if (page && typeof(page) == 'string') {
				this.emit('route', page);
				return;
			}


			var changeDeep = Router.getChangeDeep(this.hash, oldHash);
			page = this.getPage(changeDeep);
			var eventData = {router: this, old: oldHash};
			this.emit('route', eventData, 'global');
		},

		getDeep: function () {
			if (!this.hash.split('!')[1]) return 0;
			return this.hash.split('/').length;
		},

		parseParams: function (paramsStr) {
			var params = {};
			var pairs = paramsStr.split('&');
			for (var i = 0; i < pairs.length; i++) {
				var pair = pairs[i];
				pair = pair.split('=');
				params[pair[0]] = pair[1] || null
			}
			return params
		}

	}, {
		getChangeDeep: function (hash1, hash2) {
			if (!hash1 || !hash2) return 1;
			hash1 = hash1.split('!')[1];
			hash2 = hash2.split('!')[1];
			if (!hash1 || !hash2) return 1;
			hash1 = hash1.split('?')[0];
			hash2 = hash2.split('?')[0];
			if (!hash1 || !hash2) return 1;
			hash1 = hash1.split('/');
			hash2 = hash2.split('/');
			var maxDeep = Math.max(hash1.length, hash2.length);
			for (var i = 0; i < maxDeep; i++) {
				if (hash1[i] != hash2[i]) return i + 1;
			}
			if (hash1.length > 0 && hash1.length == hash2.length) return 0;
			return 1;
		},

		makeParamsStr: function (params) {
			var result = '';
			for (var paramName in params) {
				result += '&' + paramName + '=' + params[paramName];
			}
			return result.substr(1);
		}
	});

	return Router;
});

/*!
 * Hashable jQuery plugin
 * http://www.thepiepers.net/
 *
 * This jQuery plugin enables a website owner to easily bind to the hash value changes.
 * If the Modernizr v2.0+ library is present and the browser supports the hashchange event,
 * it will fire based on change, rather than timer.
 *
 * Usage:
 * <script type="text/javascript">
 *  // the callback will receive the new and old hash values as arguments
 *  $(window).hashChange(callbackFunction);
 *
 *  // or you can bind to the "hashChange" event
 *  $(window).bind("hashChange", function(e, newHash, oldHash) {
 *      console.log("new: " +  newHash);
 *      console.log("old: " + oldHash);
 *  });
 * </script>
 *
 * Copyright (c) 2011, Bryan Pieper
 * Released under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {

	$.fn.hashChange = function(func, options) {

		var settings = {
			initialHash: "",
			delay: 100
		};

		var timer = null;
		var lastHashValue = "";
		var $this = $(this);

		if (typeof options !== "undefined") {
			$.extend(settings, options);
		}

		function parseHash(val) {
			if (!val) {
				val = "";
			} else {
				if (val.substring(0, 1) == "#") {
					val = val.substring(1);
				}
			}
			return val;
		}

		function getCurrentHashValue() {
			return parseHash(window.location.hash);
		}

		function checkHash() {
			// check current hash state
			var currentHash = getCurrentHashValue();
			if (currentHash != lastHashValue) {
				var lastHashValue2 = lastHashValue;

				// reset known hash
				lastHashValue = currentHash;

				// fire hashChange event
				$this.trigger("hashChange", [currentHash, lastHashValue2]);

				if (typeof func !== "undefined") {
					// hashchange callback: new, old
					func(currentHash, lastHashValue2)
				}
			}
		}

		// override initial hash
		lastHashValue = parseHash(settings.initialHash);

		// Modernizr check
		if (typeof Modernizr !== "undefined" && Modernizr.hashchange) {
			// bind to window event change
			$this.bind("hashchange", checkHash);

			// call initial hashChange for page load
			checkHash();
		} else {
			timer = setInterval(checkHash, settings.delay);
		}

	};

})(jQuery);