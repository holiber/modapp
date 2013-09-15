define(function () {
    return {
	    /**
	     * @return {Number} object fields count
	     */
	    length: function (obj) {
		    var cnt = 0;
		    if ($.isArray(obj)) return obj.length;
		    for (var key in obj) cnt++;
		    return cnt;
	    },

	    /**
	     * convert camelCase string to under_score
	     * @param {String} str
	     * @return {String}
	     */
	    toUnderscore: function (str) {
		    if (!str) return '';
		    return str.replace(/([A-Z])/g, function (str, p1) { return '_' + p1.toLowerCase()});
	    },

	    /**
	     * convert camelCase string to -score
	     * @param {String} str
	     * @return {String}
	     */
	    toScore: function (str) {
		    if (!str) return '';
		    str = str.replace(/([A-Z])/g, function (str, p1, offset) { return (offset != 0 ? '-' : '') + p1.toLowerCase()});
		    str = str.replace(/(_)/g, '-');
		    return str;
	    },

	    /**
	     * format number as "999 999"
	     * @param {String|Number} number
	     * @return
	     */
	    toFormatedNumber: function (number) {
		    if (number === 0) return '0';
		    if (!number) return '';
		    return String(number).replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
	    },

	    tocamelCase: function (str) {
		    if (!str) return '';
		    str = str.replace(/([A-Z])/g, function (str, p1, offset) { return offset != 0 ? p1.toUpperCase() : p1.toLowerCase()});
		    str = str.replace(/(_)/g, '');
		    str = str.replace(/(-)/g, '');
		    return str;
	    },

	    /**
	     * converts date to "dd.mm.yyyy" format
	     * @param {Date|Number} date
	     * @return string
	     **/
	    dateToSting: function (date) {
		    if (!date) return '';
		    if (!(date instanceof Date)) date = new Date(date);
		    var dd = String(date.getDate());
		    if (dd < 10) dd = '0' + dd;
		    var mm = String(date.getMonth() + 1);
		    if (mm < 10) mm = '0' + mm;
		    var yyyy = String(date.getFullYear());
		    return (dd + '.' + mm + '.' + yyyy);
	    }
    };
});