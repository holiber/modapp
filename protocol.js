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

	var DEFAULT_SOCKET_OPTIONS = {
		host: 'http://localhost'
	}

	var Protocol = Class.extend([eventMixin], {

		init: function (options) {
			this.options = $.extend({}, DEFAULT_OPTIONS, options);
			this.transport = this.options.transport;
			this.io = null;
			this.socket = null;
			if (this.transport == 'sockets') this.initSockets();
		},

		initSockets: function () {
			if (!io) throw ('socket.io library not found');
			this.options = $.extend({}, DEFAULT_SOCKET_OPTIONS, this.options);
			this.io = io;
		},

		connect: function () {
			if (this.transport != 'sockets') return;
			this.socket = this.io.connect(this.options.host);
			this.socket.on('message', this._onSocketMessage.bind(this));
			this.socket.on('connect', this.emit('server/connect'));
			//this.socket.on('disconnect', this.emit('server/disconnect'));
		},

		request: function (params, callback, userData) {

			switch (this.transport) {
				case 'xhr': this.xhrRequest(params, callback, userData);break;
				case 'sockets': this.socketRequest(params, callback, userData);break;
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
		},

		socketRequest: function (params) {
			var eventName = params.event || params.url;
			this.socket.emit(eventName, params.data);
		},

		_onSocketMessage: function (message) {
			this.emit('server/message', message);
		}

	});

	return Protocol;
});