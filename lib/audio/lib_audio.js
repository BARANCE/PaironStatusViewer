
// Playable format list
var LIB_AUDIO_PLAYABLE_FORMAT_LIST = ["ogg", "mp3", "wav", "wma", "mp4"];

// Error code
var LIB_AUDIO_OK = 0;

var LIB_ERROR_BASE								= -45000000;
var LIB_AUDIO_ERROR_BASE						= LIB_ERROR_BASE - 1000;
var LIB_AUDIO_ERROR_API_NOT_SUPPORTED			= LIB_AUDIO_ERROR_BASE - 1;
var LIB_AUDIO_ERROR_NOT_INITIALIZED				= LIB_AUDIO_ERROR_BASE - 2;
var LIB_AUDIO_ERROR_NOT_SELECT_FILE				= LIB_AUDIO_ERROR_BASE - 3;
var LIB_AUDIO_ERROR_CANNOT_PLAY_FILE			= LIB_AUDIO_ERROR_BASE - 4;
var LIB_AUDIO_ERROR_NOT_PLAYING					= LIB_AUDIO_ERROR_BASE - 5;
var LIB_AUDIO_ERROR_AUDIO_NOT_PLEPARED			= LIB_AUDIO_ERROR_BASE - 6;
var LIB_AUDIO_ERROR_INVALID_PLAY_TIME			= LIB_AUDIO_ERROR_BASE - 7;
var LIB_AUDIO_ERROR_CANNOT_READ_MEDIA_FORMAT	= LIB_AUDIO_ERROR_BASE - 8;
var LIB_AUDIO_ERROR_XML_READER_NOT_LOADED		= LIB_AUDIO_ERROR_BASE - 9;
var LIB_AUDIO_ERROR_XML_IS_NOT_SPECIFIED		= LIB_AUDIO_ERROR_BASE - 10;

var AudioPlayList = function() {
};
AudioPlayList.prototype = {
	initialize : function() {
		return LIB_AUDIO_OK;
	},
	terminate : function() {
		return LIB_AUDIO_OK;
	},
	setPlayList : function(name, audioDataList) {
		this.playListName = name;
		this.playList = audioDataList;
	},
	loadPlayList : function(xmlPath) {
		if (!XmlReader) {
			console.log("XML reader API is not loaded.");
			return LIB_AUDIO_ERROR_XML_READER_NOT_LOADED;
		}
		
		var xhrCallback = function(completeState, obj, arg) {
			if (completeState == LIB_STORAGE_XML_COMPLETE) {
				var xmlObject = obj.getXml();
				arg.afterLoadPlayList(xml);
			}
		}
		
		var xmlReader = new XmlReader();
		xmlReader.initialize();
		xmlReader.setXhrCallback(xhrCallback, this);
	},
	afterLoadPlayList : function(xmlObject) {
		if (!xmlObject) {
			console.log("XML object is not specified.");
			return LIB_AUDIO_ERROR_XML_IS_NOT_SPECIFIED;
		}
	}
};

var AudioData = function() {
};
AudioData.prototype = {
	initialize : function() {
		return LIB_AUDIO_OK;
	},
	terminate : function() {
		this.path = undefined;
		this.artist = undefined;
		this.albam = undefined;
		
		return LIB_AUDIO_OK;
	},
	setMedia : function(path) {
		this.path = path;
		
		return LIB_AUDIO_OK;
	},
	setArtist : function(artistName) {
		this.artist = artistName;
		
		return LIB_AUDIO_OK;
	},
	setAlbam : function(albamName) {
		this.albam = albamName;
		
		return LIB_AUDIO_OK
	},
	getMediaName : function() {
		if (!this.path) {
			cosole.log("Media is not specified.");
			return "";
		}
		
		var pathLength = this.path.length;
		var nameIndex = this.path.lastIndexOf("/");
		var retName = "";
		if (nameIndex == -1) {
			retName = this.path;
		} else {
			retName = this.path.substring(nameIndex + 1, pathLength);
		}
		
		return retName;
	},
	getMediaFormat : function() {
		if (!this.path) {
			console.log("Media is not specified.");
			return "";
		}
		
		var pathLength = this.path.length;
		var formatIndex = this.path.lastIndexOf(".");
		if (formatIndex == -1) {
			console.log("Format is not discripted in file name.");
			return LIB_AUDIO_ERROR_CANNOT_READ_MEDIA_FORMAT;
		}
		
		var formatStr = this.path.substring(formatIndex + 1, pathLength);
		
		
		return formatStr;
	},
	getArtist : function() {
		return this.artist;
	},
	getAlbam : function() {
		return this.albam;
	}
};

var AudioPlayer = function() {
};
AudioPlayer.prototype = {
	initialize : function() {
		var ret = LIB_AUDIO_OK;
		
		try {
			this.audio = new Audio();
		} catch(e) {
			console.log(e);
			console.log("audio operation is not supported.");
			return LIB_AUDIO_ERROR_API_NOT_SUPPORTED;
		}
		
		var playCheck = "";
		this.playableFormatList = new Array();
		
		for (var i = 0; i < LIB_AUDIO_PLAYABLE_FORMAT_LIST.length; i++) {
			try {
				playCheck = this.audio.canPlayType("audio/" + LIB_AUDIO_PLAYABLE_FORMAT_LIST[i]);
			} catch(e) {
				console.log(e);
				console.log("audio operation is not supported.");
				return LIB_AUDIO_ERROR_API_NOT_SUPPORTED;
			}
			if (playCheck == "maybe") {
				this.playableFormatList.push(LIB_AUDIO_PLAYABLE_FORMAT_LIST[i]);
			}
		}
		
		ret = this.setIsPlaying(false);
		if(ret != LIB_AUDIO_OK) return ret;
		
		this.update();
		
		return ret;
	},
	terminate : function() {
		var ret = LIB_AUDIO_OK;
		
		if (this.playing == true) {
			ret = this.stop();
			if(ret != LIB_AUDIO_OK) return ret;
			
			ret = this.setIsPlaying(false);
			if(ret != LIB_AUDIO_OK) return ret;
		}
		
		this.playableFormatList = undefined;
		this.audio = undefined;
		
		return LIB_AUDIO_OK;
	},
	getIsPlaying : function() {
		var ret = LIB_AUDIO_OK;
		
		if (!this.audio) {
			console.log("Audio is not initialized.");
			return false;
		}
		if (this.playing == undefined) this.playing = false;
		return this.playing;
	},
	setIsPlaying : function(isPlaying) {	// Not need to call
		var ret = LIB_AUDIO_OK;
		
		if (!this.audio) {
			console.log("Audio is not initialized.");
			return LIB_AUDIO_ERROR_NOT_INITIALIZED;
		}
		this.playing = isPlaying;
		return ret;
	},
	setAudio : function(path) {
		var ret = LIB_AUDIO_OK;
		
		if (!this.audio) {
			console.log("Audio is not initialized.");
			return LIB_AUDIO_ERROR_NOT_INITIALIZED;
		}
		
		var isPlayable = false;
		var playableLength = this.playableFormatList.length;
		for (var i = 0; i < playableLength; i++) {
			var formatStr = "." + this.playableFormatList[i];
			var formatStrLength = formatStr.length;
			var pathLength = path.length;
			
			var formatPos = path.lastIndexOf(formatStr);
			if (formatPos != -1) {
				var willEmpty = path.substring(formatPos + formatStrLength, pathLength);
				if (willEmpty == "") {
					isPlayable = true;
				}
			}
		}
		if (!isPlayable) {
			console.log("Specified file format is not playable.");
			return LIB_AUDIO_ERROR_CANNOT_PLAY_FILE;
		}
		
		this.audio.src = path;
		this.audio.loop = false;
		
		try {
			this.audio.load();
		} catch(e) {
			console.log(e);
			console.log("Cannot play this file.");
			return LIB_AUDIO_ERROR_CANNOT_PLAY_FILE;
		}
		
		return LIB_AUDIO_OK;
	},
	getVolume : function() {
		var ret = LIB_AUDIO_OK;
		
		if (!this.audio) {
			console.log("Audio is not initialized.");
			return 0;
		}
		
		return this.audio.volume;
	},
	setVolume : function(volume) {
		var ret = LIB_AUDIO_OK;
		
		if (!this.audio) {
			console.log("Audio is not initialized.");
			return LIB_AUDIO_ERROR_NOT_INITIALIZED;
		}
		
		this.audio.volume = volume;
		
		return LIB_AUDIO_OK;
	},
	getTerminateCallback : function() {
		return this.terminateCallback;
	},
	getTerminateCallbackArg : function() {
		return this.terminateCallbackArg;
	},
	setTerminateCallback : function(callback, arg) {
		this.terminateCallback = callback;
		this.terminateCallbackArg = arg;
		
		return LIB_AUDIO_OK;
	},
	play : function() {
		var ret = LIB_AUDIO_OK;
		
		if (!this.audio) {
			console.log("Audio is not initialized.");
			return LIB_AUDIO_ERROR_NOT_INITIALIZED;
		}
		if (!this.audio.src) {
			console.log("Audio file is not specified.");
			return LIB_AUDIO_ERROR_NOT_SELECT_FILE;
		}
		
		try {
			this.audio.play();
		} catch(e) {
			console.log(e);
			console.log("Cannot play this file.");
			return LIB_AUDIO_ERROR_CANNOT_PLAY_FILE;
		}
		
		this.playing = true;
		
		return LIB_AUDIO_OK;
	},
	replay : function() {
		var ret = LIB_AUDIO_OK;
		
		if (this.getIsPlaying()) {
			ret = this.stop();
			if(ret != LIB_AUDIO_OK) return ret;
		}
		
		ret = this.seek(0);
		if(ret != LIB_AUDIO_OK) return ret;
		
		ret = this.play();
		if(ret != LIB_AUDIO_OK) return ret;
		
		return ret;
	},
	stop : function() {
		var ret = LIB_AUDIO_OK;
		
		if (!this.audio) {
			console.log("Audio is not initialized.");
			return LIB_AUDIO_ERROR_NOT_INITIALIZED;
		}
		if (!this.playing) {
			console.log("Audio is not playing.");
			return LIB_AUDIO_ERROR_NOT_PLAYING;
		}
		
		try {
			this.audio.stop();
		} catch(e) {
			console.log(e);
			console.log("Cannot stop playing.");
			return LIB_AUDIO_ERROR_API_NOT_SUPPORTED;
		}
		
		this.playing = false;
		
		return ret;
	},
	seek : function(time) {
		var ret = LIB_AUDIO_OK;
		
		if (!this.audio) {
			console.log("Audio is not initialized.");
			return LIB_AUDIO_ERROR_NOT_INITIALIZED;
		}
		if (!this.audio.src) {
			console.log("Audio file is not specified.");
			return LIB_AUDIO_ERROR_NOT_SELECT_FILE;
		}
		
		if (time < 0) {
			console.log("Specified time is out of play duration.");
			return LIB_AUDIO_ERROR_INVALID_PLAY_TIME;
		} else if (time == 0) {
			try {
				this.audio.load();
			} catch(e) {
				console.log(e);
				console.log("Cannot play this file.");
				return LIB_AUDIO_ERROR_CANNOT_PLAY_FILE;
			}
		} else {
			var duration = this.audio.duration;
			if (!duration) {
				console.log("Cannot read audio duration.");
				return LIB_AUDIO_ERROR_API_NOT_SUPPORTED;
			}
			
			if (isNaN(duration)) {
				console.log("audio duration is not a number.");
				return LIB_AUDIO_ERROR_AUDIO_NOT_PLEPARED;
			}
			
			if (time > duration) {
				console.log("Specified time is out of play duration.");
				return LIB_AUDIO_ERROR_INVALID_PLAY_TIME;
			}
			
			this.audio.currentTime = time;
		}
		
		return ret;
	},
	update : function() {
		var ret = LIB_AUDIO_OK;
		
		if (!this.audio) return;
		
		if (this.playing) {
			var endFlag = this.audio.ended;
			if (endFlag) {
				this.playing = false;
				var callback = this.getTerminateCallback();
				if (callback) {
					callback(this, this.getTerminateCallbackArg());
				}
			}
		}
		
		setTimeout(this.update.bind(this), 100);
	}
	
};