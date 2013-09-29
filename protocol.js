define(['./mixins/events'], function (eventMixin) {

	var DEFAULT_OPTIONS = {
		transport: 'xhr',
		delay: 0
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

			//TODO: create other transports such as "polling", "long polling", "web sockets" or think about using "Socket IO"
			if (this.transport == 'xhr') {
				this.xhrRequest(params, callback, userData);
			}
		},

		xhrRequest: function (params, callback, userData) {

			var fnOnDone = function (response, error, jqXhr, userData) {
				if (params.onResponse) {
					var eventData = {
						name: params.onResponse,
						response: response,
						error: error,
						request: params,
						jqXhr: jqXhr,
						userData: userData
					}
					if (params.delay) {
						setTimeout(this.emit.bind(this, 'server/message', eventData, 'global'), params.delay);
					} else {
						this.emit('server/message', eventData);
					}
				}
				callback && callback(eventData);
			}.bind(this);

			var xhrParams = {
				type: params.type || DEFAULT_XHR_OPTIONS.type,
				data: params.data,
				dataType: params.dataType || undefined,
				contentType: params.contentType || undefined,
				success: function (response, textTstatus, jqXhr) {
					fnOnDone(response, false, jqXhr, userData);
				},
				error: function (jqXhr, textStatus, errorThrown) {
					fnOnDone(null, {jqXhr: jqXhr, texStatus: textStatus, errorThrown: errorThrown}, userData);
				}
			}

			$.ajax(params.url, xhrParams);

			if (params.onRequest) {
				var eventData = {name: params.onRequest, request: params, userData: userData}
				this.emit('client/request', eventData);
			}
		}

	});

	return Protocol;
});