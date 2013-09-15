define(['./mixins/events'], function (eventMixin) {

	var DEFAULT_OPTIONS = {
		transport: 'xhr'
	};

	var DEFAULT_XHR_OPTIONS = {
		type: 'GET',
		dataType: 'json',
		contentType: 'application/json'
	};

	var Protocol = Class.extend([eventMixin], {

		init: function (options) {
			this.params = $.extend({}, DEFAULT_OPTIONS, options);
			this.transport = this.params.transport;
		},

		request: function (params, callback, userData) {
			if (this.transport == 'xhr') {
				this.xhrRequest(params, callback, userData);
			}
		},

		xhrRequest: function (params, callback, userData) {

			var fnOnDone = function (response, error, userData) {
				var eventData = {name: params.name, response: response, error: error, request: params, userData: userData}
				this.emit('server/message', eventData, 'global');
				callback && callback(eventData);
			}.bind(this);

			var xhrParams = {
				type: params.type || DEFAULT_XHR_OPTIONS.type,
				data: params.data,
				dataType: params.dataType || undefined,
				contentType: params.contentType || undefined,
				success: function (response) {
					fnOnDone(response, false, userData);
				},
				error: function (jqXhr, textStatus, errorThrown) {
					fnOnDone(null, {jqXhr: jqXhr, texStatus: textStatus, errorThrown: errorThrown}, userData);
				}
			}

			$.ajax(params.url, xhrParams);
		}

	}, {
		lastRequestId: 1
	});

	return Protocol;
});