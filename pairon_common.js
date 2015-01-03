
var PAIRON_OK = 0;

var PAIRON_ERROR_BASE			= -86000000;
var PAIRON_GLOBAL_ERROR_BASE	= PAIRON_ERROR_BASE - 1000;
var PAIRON_INVALID_ARGUMENT		= PAIRON_GLOBAL_ERROR_BASE - 1;
var PAIRON_INVALID_INPUT		= PAIRON_GLOBAL_ERROR_BASE - 2;
var PAIRON_UNKNOWN_CONTEXT		= PAIRON_GLOBAL_ERROR_BASE - 3;
var PAIRON_CANVAS_API_ERROR		= PAIRON_GLOBAL_ERROR_BASE - 4;

// Global style value of content elements
var PAIRON_GLOBAL_STYLE_BLOCK_WIDTH = 640;
var PAIRON_GLOBAL_STYLE_BLOCK_HEIGHT = 70;

function gi(name) {
	return document.getElementById(name);
}

function shuffle(array) {
  var m = array.length, t, i;

  // While there remain elements to shuffle…
  while (m) {

    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  }

  return array;
}

typeOf = function(that){
	if (that === null)      return 'Null';
	if (that === undefined) return 'Undefined';
	var tc = that.constructor;
	return typeof(tc) === 'function'
		? getFunctionName(tc) 
		: tc /* [object HTMLDocumentConstructor] など */;
};

// ===============================================================================
// Debug functions
// ===============================================================================
function DEBUG(caller, message) {
	console.log("[" + caller + "]<DEBUG>" + message);
	return PAIRON_OK;
}
function ERROR(caller, ret) {
	console.log("[" + caller + "]<ERROR> ret = " + ret);
	return ret;
}
function ERROR_IF_NOT_OK(caller, ret) {
	if (ret != PAIRON_OK) {
		ERROR(caller, ret);
		return true;
	}
	return false;
}