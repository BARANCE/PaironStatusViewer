window.onload = function() {
	var ret = PAIRON_OK;
	var caller = "window.onload()";

	var manager = new PaironBlockManager();
	ret = manager.initialize();
	if(ERROR_IF_NOT_OK(caller, ret)) return;
}

// ===============================================================================
// Pairon Block Manager
// ===============================================================================

var PAIRON_BLOCK_NUM = 2;
var PAIRON_SUB_BLOCK_NUM = 1;

var PAIRON_STATUS_MANAGER_ID = 0;
var PAIRON_GALLERY_MANAGER_ID = 1;

var PAIRON_AUDIO_MANAGER_ID = 1;

var PAIRON_DEFAULT_VIEW_TIME = 10000;
var PAIRON_STATUS_VIEW_TIME = 10000;
var PAIRON_GALLERY_VIEW_TIME = 40000;

var PaironBlockManager = function() {
	this.name = "PaironBlockManager";

	this.currentActive = 0;
	this.nextActive = 0;
};
PaironBlockManager.prototype = {
	initialize : function() {
		var ret = PAIRON_OK;
		var fname = "initialize()";
		var caller = this.name + "::" + fname;
		
		this.blockArray = new Array(PAIRON_BLOCK_NUM);
		this.subBlockArray = new Array(PAIRON_SUB_BLOCK_NUM);
		
		this.blockElementArray = new Array(PAIRON_BLOCK_NUM + PAIRON_SUB_BLOCK_NUM);
		this.inputElementArray = new Array(PAIRON_BLOCK_NUM + PAIRON_SUB_BLOCK_NUM);
		
		// ==== Main Block ====
		// status manager
		this.blockArray[PAIRON_STATUS_MANAGER_ID] = new PaironStatus();
		ret = this.blockArray[PAIRON_STATUS_MANAGER_ID].initialize();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		this.blockArray[PAIRON_STATUS_MANAGER_ID].viewTime = PAIRON_STATUS_VIEW_TIME;
		
		// gallery manager
		this.blockArray[PAIRON_GALLERY_MANAGER_ID] = new PaironGallery();
		ret = this.blockArray[PAIRON_GALLERY_MANAGER_ID].initialize();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		this.blockArray[PAIRON_GALLERY_MANAGER_ID].viewTime = PAIRON_GALLERY_VIEW_TIME;
		
		// ==== Sub Block ====
		// audio manager
		this.subBlockArray[PAIRON_AUDIO_MANAGER_ID] = new PaironAudio();
		ret = this.subBlockArray[PAIRON_AUDIO_MANAGER_ID].initialize();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		setTimeout(this.update.bind(this), 2000);
		
		return ret;
	},
	terminate : function() {
		return PAIRON_OK;
	},
	update : function() {
		var fname = "update()";
		var caller = this.name + "::" + fname;
		var parent = this;
		
		if (this.currentActive != this.nextActive) {
			ret = this.blockArray[this.currentActive].hide();
			if(ERROR_IF_NOT_OK(caller, ret)) return;
		}
		
		this.currentActive = this.nextActive;
		ret = this.blockArray[this.currentActive].show();
		if(ERROR_IF_NOT_OK(caller, ret)) return;
		this.nextActive = (this.currentActive + 1) % PAIRON_BLOCK_NUM;
		
		var waitTime = this.blockArray[this.currentActive].viewTime;
		if (!waitTime) {
			console.log("view time is not setted.");
			waitTime = PAIRON_DEFAULT_VIEW_TIME;
			return;
		}
		
		setTimeout(parent.update.bind(parent), waitTime);
	}
};

var ContBlock = function() {
};
ContBlock.prototype = {
	
};