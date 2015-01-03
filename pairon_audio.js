// ===============================================================================
// Pairon Audio Manager
// ===============================================================================

// Error code
var PAIRON_AUDIO_ERROR_BASE					= PAIRON_ERROR_BASE - 4000;

var PaironAudio = function() {
	this.name = "PaironAudio";
};
PaironAudio.prototype = {
	initialize : function() {
		var ret = PAIRON_OK;
		var fname = "initialize()";
		var caller = this.name + "::" + fname;
		
		this.audioPlayer = new AudioPlayer();
		ret = this.audioPlayer.initialize();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.audioPlayer.setAudio("./audio/moratriamCraster.mp3");
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		var callback = function(obj, arg) {
			ret = arg.audioPlayer.replay();
		}
		
		ret = this.audioPlayer.setTerminateCallback(callback, this);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.audioPlayer.setVolume(0.5);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		//ret = this.audioPlayer.play();
		//if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return PAIRON_OK;
	}
};

var PaironAudioPlaylist = function() {
	this.name = "PaironAudioPlaylist";
};
PaironAudioPlaylist.prototype = {
	initialize : function() {
		this.playlist = new Array(0);
	},
	terminate : function() {
		this.playlist = undefined;
	}
};

