
// Return code
var LIB_STORAGE_OK = 0;
var LIB_STORAGE_IO_EXCEPTION = -1;
var LIB_STORAGE_CANNOT_FIND_KEY = -2;

var CookieManager = function() {
	this.handle = document.cookie;
};
CookieManager.prototype = {
	initialize : function() {
		var ret = LIB_STORAGE_OK;
		return ret;
	},
	terminate : function() {
		return LIB_STORAGE_OK;
	},
	setCookie : function(key, value) {
		var ret = LIB_STORAGE_OK;
		
		var COOKIE_LIMIT_DAY = 90;
		var DAY_LENGTH = 24 * 60 * 60 * 1000;
		var COOKIE_LIMIT_TIME = COOKIE_LIMIT_DAY * DAY_LENGTH;
		
		var date = new Date();
		date.setTime(date.getTime() + COOKIE_LIMIT_TIME);
		var gmtLimitDate = date.toGMTString();
		
		try {
			document.cookie = key + "=" + encodeURIComponent(value) + ";expires=" + gmtLimitDate;
		} catch(e) {
			console.log("can't write cookie.");
			return LIB_STORAGE_IO_EXCEPTION;
		}
		
		return ret;
	},
	getCookie : function(key) {
		var ret = LIB_STORAGE_OK;
		
		var searchWord = key + "=";
		var allCookies = document.cookie;
		
		var position = allCookies.indexOf(searchWord);
		if (position == -1) {
			console.log("specified key is not stored.");
			return LIB_STORAGE_CANNOT_FIND_KEY;
		}
		
		var startIndex = position + searchWord.length;
		var endIndex = allCookies.indexOf(";", startIndex);
		if (endIndex == -1) {
			endIndex = allCookies.length;
		}
		
		ret = decodeURIComponent(allCookies.substring(startIndex, endIndex));
		
		return ret;
	},
	checkCookie : function(key) {
		var ret = LIB_STORAGE_OK;
		
		var searchWord = key + "=";
		var allCookies = document.cookie;
		
		var position = allCookies.indexOf(searchWord);
		if (position == -1) {
			return LIB_STORAGE_CANNOT_FIND_KEY;
		}
		
		return ret;
	}
};

var LIB_STORAGE_XML_NOT_STARTED = 0;
var LIB_STORAGE_XML_LOADING = 1;
var LIB_STORAGE_XML_LOADED = 2;
var LIB_STORAGE_XML_INTERACTIVE = 3;
var LIB_STORAGE_XML_COMPLETE = 4;

var LIB_STORAGE_XML_INVALID_RESPONSE = -100;
var LIB_STORAGE_XML_ERROR_CANNOT_CREATE_XHR = -101;
var LIB_STORAGE_XML_ERROR_CANNOT_OPEN_XHR = -102;
var LIB_STORAGE_XML_ERROR_REJECT_REQUEST = -103;

var XmlReader = function() {
};
XmlReader.prototype = {
	initialize : function() {
		var ret = LIB_STORAGE_OK;
		
		try {
			this.xhr = new window.XMLHttpRequest();
		} catch(e) {
			console.log(e);
			return LIB_STORAGE_XML_ERROR_CANNOT_CREATE_XHR;
		}
		this.setReadyState(LIB_STORAGE_XML_NOT_STARTED);
		
		return ret;
	},
	terminate : function() {
		this.xhr = undefined;
		this.xml = undefined;
		
		return LIB_STORAGE_OK;
	},
	getXhr : function() {
		if (!this.xhr) {
			console.log("xml reader is not initialized.");
			this.xhr = undefined;
		}
		return this.xhr;
	},
	getXhrCallback : function() {
		if (!this.callbackFunc) this.callbackFunc = undefined;
		return this.callbackFunc;
	},
	getXhrCallbackArg : function() {
		if (!this.arg) this.arg = undefined;
		return this.arg;
	},
	setXhrCallback : function(callbackFunc, arg) {
		this.callbackFunc = callbackFunc;
		this.arg = arg;
		
		return LIB_STORAGE_OK;
	},
	getXml : function() {
		if (!this.xml) {
			console.log("xml document is not prepared.");
			this.xml = undefined;
		}
		return this.xml;
	},
	setXml : function(xmlObject) {
		this.xml = xmlObject;
		return LIB_STORAGE_OK;
	},
	loadXml : function(path) {
		var ret = LIB_STORAGE_OK;
		
		var REQUEST_DATA = null;
		var HTTP_METHOD = "GET"
		var ASYNC_FLAG = true;
		
		var parent = this;
		
		try {
			this.xhr.open(HTTP_METHOD, path, ASYNC_FLAG);
		} catch(e) {
			console.log(e);
			this.setReadyState(LIB_STORAGE_XML_COMPLETE);
			this.afterResponse();
			return LIB_STORAGE_XML_ERROR_CANNOT_OPEN_XHR;
		}
		
		this.xhr.onreadystatechange = function() {
			var xhr = parent.getXhr();
			parent.setReadyState(xhr.readyState);
			parent.afterResponse();
		};
		
		try {
			this.xhr.send(REQUEST_DATA);
		} catch(e) {
			console.log(e);
			this.setReadyState(LIB_STORAGE_XML_COMPLETE);
			this.afterResponse();
			return LIB_STORAGE_XML_ERROR_REJECT_REQUEST;
		}
		
		
		return ret;
	},
	getReadyState : function() {
		return this.readyState;
	},
	setReadyState : function(state) {
		this.readyState = state;
		return LIB_STORAGE_OK;
	},
	afterResponse2 : function() {
		var ret = LIB_STORAGE_OK;
		var completeState = LIB_STORAGE_OK;
		
		if (!this.xmlObj) {
			console.log("xml is not loaded.");
			completeState = LIB_STORAGE_XML_INVALID_RESPONSE;
		}
		if (this.xmlObj["parsererror"]) {
			console.log(this.xmlObj["parsererror"]);
			return LIB_STORAGE_XML_ERROR_REJECT_REQUEST;
			completeState = LIB_STORAGE_XML_INVALID_RESPONSE;
		}
		
		var callback = this.getXhrCallback();
		if (callback) {
			console.log("ok");
			// callback(completeState, this, this.getXhrCallbackArg());
		}
		
		return ret;
	},
	afterResponse : function() {
		var ret = LIB_STORAGE_OK;
		
		if (this.getReadyState() == LIB_STORAGE_XML_COMPLETE) {
			var completeState = LIB_STORAGE_OK;
		
			if (this.xhr.responseXML) {
				ret = this.setXml(this.xhr.responseXML);
				if (ret != LIB_STORAGE_OK) return ret;
			} else {
				console.log("responce format is invalid.");
				completeState = LIB_STORAGE_XML_INVALID_RESPONSE;
			}
		
			var callback = this.getXhrCallback();
			if (callback) {
				callback(completeState, this, this.getXhrCallbackArg());
			}
		}
		
		return ret;
	},
	tag : function(tagName) {
		return this.xml.getElementsByTagName(tagName);
	}
};
