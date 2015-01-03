// ===============================================================================
// Pairon Gallery Manager
// ===============================================================================

var OPERATION_TARGET_ELEMENT_NAME = "CONT_GALLERY";

var PAIRON_GALLERY_ERROR_BASE				= PAIRON_ERROR_BASE - 3000;
var PAIRON_GALLERY_ERROR_STATUS_NONE		= PAIRON_GALLERY_ERROR_BASE - 1;
var PAIRON_GALLERY_ERROR_INVALID_XML_FORMAT	= PAIRON_GALLERY_ERROR_BASE - 2;
var PAIRON_GALLERY_ERROR_NOT_PREPARED		= PAIRON_GALLERY_ERROR_BASE - 3;
var PAIRON_GALLERY_ERROR_ELEMENT_NOT_FOUND	= PAIRON_GALLERY_ERROR_BASE - 4;

var PaironGallery = function() {
	this.name = "PaironGallery";
};
PaironGallery.prototype = {
	initialize : function() {
		var ret = PAIRON_OK;
		var fname = "initialize()";
		var caller = this.name + "::" + fname;
	
		this.element = gi(OPERATION_TARGET_ELEMENT_NAME);
		if (!this.element) {
			console.log("element of '" + OPERATION_TARGET_ELEMENT_NAME + "' is not found.");
			return PAIRON_GALLERY_ERROR_ELEMENT_NOT_FOUND;
		}
		ret = this.loadXml();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		this.active = true;
		
		return ret;
	},
	terminate : function() {
		this.active = false;
		return PAIRON_OK;
	},
	getRender : function() {
		if (!this.render) {
			console.log("rander is not prepared.");
		}
		return this.render;
	},
	getBalloon : function() {
		if (!this.balloon) {
			console.log("balloon is not prepared.");
		}
		return this.balloon;
	},
	loadXml : function() {
		var ret = PAIRON_OK;
		var fname = "loadXml()";
		var caller = this.name + "::" + fname;
	
		if (!this.xmlReader) {
			this.xmlReader = new XmlReader();
			ret = this.xmlReader.initialize();
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			
			var callback = function(state, reader, arg) {
				if (state != LIB_STORAGE_OK) {
					console.log("reading XML process is failed.");
					return;
				}
				ret = arg.formatCdList(reader.tag("cd"));
				if(ERROR_IF_NOT_OK(caller, ret)) return ret;
				
			};
			
			ret = this.xmlReader.setXhrCallback(callback, this);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			
			ret = this.xmlReader.loadXml("./character.xml");
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		return ret;
	},
	formatCdList : function(cdList) {
		var ret = PAIRON_OK;
		var fname = "formatCdList()";
		var caller = this.name + "::" + fname;
	
		var length = cdList.length;
		var cardList = new Array(length);
		
		for (var i = 0; i < length; i++) {
			cardList[i] = new PaironCard();
			ret = cardList[i].initialize(cdList[i]);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		this.render = new PaironCardRender();
		ret = this.render.initialize(cardList);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		this.balloon = new PaironBalloon();
		ret = this.balloon.initialize();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		this.update();
		
		return ret;
	},
	autoSelect : function() {
		var ret = PAIRON_OK;
		var fname = "autoSelect()";
		var caller = this.name + "::" + fname;
	
		var render = this.getRender();
		var maxId = render.getCardNum();
		var randomId = 1;
		if (maxId >= 2) {
			while (1) {
				randomId = Math.floor( Math.random() * maxId );
				if (randomId != render.getSelectId()) break;
			}
		} else if (maxId <= 0) {
			console.log("render target is not prepared.");
			return PAIRON_GALLERY_ERROR_NOT_PREPARED;
		}
		
		var selectCallback = function(obj, arg) {
			var balloon = arg.getBalloon();
			
			var targetCard = render.getCardList()[randomId];
			
			if (render.getPrepared()) {
				ret = balloon.showBalloon(targetCard);
				if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			}
		}
		
		var balloon = this.getBalloon();
		
		ret = balloon.hideBalloon();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		if (render.getPrepared()) {
			ret = render.setSelectId(randomId);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			
			ret = render.select(1000, 100, selectCallback, this);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		return ret;
	},
	show : function() {
		var ret = PAIRON_OK;
		var fname = "show()";
		var caller = this.name + "::" + fname;
		
		this.element.style.display = "block";
	
		if (!this.render) {
			console.log("render is not prepared.");
			return PAIRON_GALLERY_ERROR_NOT_PREPARED;
		}
		
		ret = this.render.show();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	hide : function() {
		var ret = PAIRON_OK;
		var fname = "hide()";
		var caller = this.name + "::" + fname;
	
		this.element.style.display = "none";
		if (this.render) {
			ret = this.render.hide();
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		if (this.balloon) {
			ret = this.balloon.hideBalloon();
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		return ret;
	},
	update : function() {
		var ret = PAIRON_OK;
		var fname = "update()";
		var caller = this.name + "::" + fname;
	
		var parent = this;
		var render = this.getRender();
		if(render.getPrepared()) {
			ret = this.autoSelect();
			if(ERROR_IF_NOT_OK(caller, ret)) return;
		}
		setTimeout(parent.update.bind(parent), 8000);
	}
};

var PaironCardRender = function() {
	this.prepared = false;
};
PaironCardRender.prototype = {
	initialize : function(cardList) {
		var ret = PAIRON_OK;
	
		this.element = gi(OPERATION_TARGET_ELEMENT_NAME);
		if (!this.element) {
			console.log("element of '" + OPERATION_TARGET_ELEMENT_NAME + "' is not found.");
			return PAIRON_GALLERY_ERROR_ELEMENT_NOT_FOUND;
		}
		this.contHeight = PAIRON_GLOBAL_STYLE_BLOCK_HEIGHT;
		
		// position of selected card
		this.centerX = 60;
		this.centerY = this.contHeight / 2;
		
		this.cardList = cardList;
		this.length = this.cardList.length;
		
		return ret;
		
	},
	terminate : function() {
		return PAIRON_OK;
	},
	show : function() {
		var ret = PAIRON_OK;
		var fname = "show()";
		var caller = this.name + "::" + fname;
		
		if (!this.cardList) {
			console.log("card list is not prepared.");
			return PAIRON_GALLERY_ERROR_NOT_PREPARED;
		}
		
		for (var i = 0; i < this.length; i++) {
			var picture = this.cardList[i].getPicture();
			
			ret = picture.setDisplay(true);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			
			picture.update();
		}
	
		ret = this.setInitialPos();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.addPictureToHtml();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		var afterBeginFunc = function(obj, arg) {
			arg.prepared = true;
		}
		
		ret = this.showBeginning(500, 10, afterBeginFunc, this);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	hide : function() {
		var ret = PAIRON_OK;
		var fname = "hide()";
		var caller = this.name + "::" + fname;
	
		this.prepared = false;
		
		ret = this.setSelectId(1);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.selectInSecond();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		for (var i = 0; i < this.length; i++) {
			var picture = this.cardList[i].getPicture();
			
			ret = picture.setDisplay(false);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			
			picture.update();
		}
		
		return ret;
	},
	addPictureToHtml : function() {
		for (var i = 0; i < this.length; i++) {
			var picture = this.cardList[i].getPicture();
			var img = picture.getPictureHandle();
			
			if (!this.element) return PAIRON_GALLERY_ERROR_ELEMENT_NOT_FOUND;
			this.element.appendChild(img);
		}
		
		return PAIRON_OK;
	},
	getSelectId : function() {
		var ret = PAIRON_OK;
	
		if (this.selectId == undefined) {
			ret = this.setSelectId(1);
			if (ret != PAIRON_OK) {
				console.log("getting process is failed.");
				return 1;
			}
		}
		
		return this.selectId;
	},
	setSelectId : function(id) {
		var ret = PAIRON_OK;
		var fname = "setSelectId()";
		var caller = this.name + "::" + fname;
	
		if (!this.cardList) {
			console.log("card list is not prepared.");
			return PAIRON_GALLERY_ERROR_NOT_PREPARED;
		}
		if (this.length == undefined) {
			this.length == this.cardList.length;
		}
		if (id < 0 || id > this.length) {
			console.log("specified id is invalid.");
			return PAIRON_INVALID_ARGUMENT;
		}
		this.selectId = id;
		
		return ret;
	},
	getCardList : function() {
		if (!this.cardList) {
			console.log("card list is not prepared.");
			return undefined;
		}
	
		return this.cardList;
	},
	getCardNum : function() {
		if (!this.cardList) {
			console.log("card list is not prepared.");
			return 0;
		}
	
		return this.length;
	},
	getPrepared : function() {
		return this.prepared;
	},
	setInitialPos : function() {
		var ret = PAIRON_OK;
		var fname = "setInitialPos()";
		var caller = this.name + "::" + fname;
	
		this.cardList = shuffle(this.cardList);
		
		ret = this.setSelectId(parseInt(this.length / 2));
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.selectInSecond();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		for (var i = 0; i < this.length; i++) {
			var picture = this.cardList[i].getPicture();
			var posX = picture.getCenterPosition()[0];
			var posY = this.centerY;
			if (i % 2 == 0) {
				posY -= this.contHeight;
			} else {
				posY += this.contHeight;
			}
			
			ret = picture.moveCenter(posX, posY);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			
			picture.update();
		}
		
		return ret;
	},
	showBeginning : function(moveTime, constant, callbackFunc, arg) {
		var ret = PAIRON_OK;
		var fname = "showBeginning()";
		var caller = this.name + "::" + fname;
	
		var parent = this;
		
		var callTimeSpan = 20;
		var currentTime = 0;
		var currentPos = 0;
		var totalMoveTime = moveTime;
		var constantTime = constant;
		var totalDistance = this.contHeight;
		
		var returnFunc = callbackFunc;
		var returnArg = arg;
		
		var callback = function() {
			currentTime += callTimeSpan;
			
			var oldPos = currentPos;
			var newPos = parent.getCurrentPos(totalDistance, totalMoveTime, constantTime, currentTime);
			var posDiff = newPos - oldPos;
			currentPos = newPos;
			
			for (var i = 0; i < parent.length; i++) {
				var picture = parent.cardList[i].getPicture();
				if (i % 2 == 0) {
					ret = picture.moveRelative(0, posDiff);
				} else {
					ret = picture.moveRelative(0, -1 * posDiff);
				}
				if(ERROR_IF_NOT_OK(caller, ret)) return ret;
				
				picture.update();
			}
			
			if (currentPos < totalDistance) {
				setTimeout(callback, callTimeSpan);
			} else {
				if (returnFunc) {
					returnFunc(parent, returnArg);
				}
			}
		}
		
		setTimeout(callback, callTimeSpan);
		
		return ret;
	},
	select : function(moveTime, constant, callbackFunc, arg) {
		var ret = PAIRON_OK;
		var fname = "select()";
		var caller = this.name + "::" + fname;
	
		if (!this.prepared) {
			console.log("slide show is not prepared.");
			return;
		}
	
		var parent = this;
		
		var picture = this.cardList[0].getPicture();
		var afterPosX = this.centerX - this.getSelectId() * picture.getWidth();
		var currentPosX = picture.getCenterPosition()[0];
		var distance = afterPosX - currentPosX;
		
		var callTimeSpan = 20;
		var currentTime = 0;
		var currentPos = 0;
		var totalMoveTime = moveTime;
		var constantTime = constant;
		var totalDistance = distance;
		var nagativeFlag = 1;
		if (totalDistance < 0) {
			
			totalDistance *= -1;
			negativeFlag = -1;
		} else {
			totalDistance *= 1;
			negativeFlag = 1;
		}
		
		var returnFunc = callbackFunc;
		var returnArg = arg;
		
		var callback = function() {
			currentTime += callTimeSpan;
			
			var oldPos = currentPos;
			var newPos = parent.getCurrentPos(totalDistance, totalMoveTime, constantTime, currentTime);
			var posDiff = newPos - oldPos;
			currentPos = newPos;
			
			ret = parent.slideAllPicture(posDiff * negativeFlag);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			
			if (currentPos < totalDistance && parent.getPrepared()) {
				setTimeout(callback, callTimeSpan);
			} else {
				if (returnFunc) {
					returnFunc(parent, returnArg);
				}
			}
		};
	
		setTimeout(callback, callTimeSpan);
		
		return ret;
	},
	selectInSecond : function() {
		var ret = PAIRON_OK;
		var fname = "selectInSecond()";
		var caller = this.name + "::" + fname;
	
		for (var i = 0; i < this.length; i++) {
			var picture = this.cardList[i].getPicture();
			var posX = this.centerX + (i - this.getSelectId()) * picture.getWidth();
			var posY = this.centerY;
			
			ret = picture.moveCenter(posX, posY);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		for (var i = 0; i < this.length; i++) {
			this.cardList[i].getPicture().update();
		}
		
		return ret;
	},
	getCurrentPos : function(totalDistance, totalMoveTime, constantTime, currentTime) {
		if (constantTime > totalMoveTime) {
			console.log("constant time is wrong.");
			constantTime = totalMoveTime;
		}
	
		var currentPos = 0;
		var accBorderTime = (totalMoveTime - constantTime) / 2;	// この時間まで加速、以降は等速
		var conBorderTime = (totalMoveTime + constantTime) / 2;	// この時間まで等速度、以降は減速
		
		var accTime = accBorderTime;	// 加速している時間
		var conTime = conBorderTime - accBorderTime;	// 等速度で移動する時間
		var stpTime = totalMoveTime - conBorderTime;	// 減速している時間
		
		var maxSpeed = (totalDistance * 2) / (totalMoveTime + constantTime);	// 最大速度
		
		if (currentTime < 0) {
			currentPos = 0;
		} else if (currentTime >= 0 && currentTime < accBorderTime) {
			var rate = currentTime / accTime;
			var height = maxSpeed * rate;
			currentPos = (currentTime * height) / 2;
		} else if (currentTime >= accBorderTime && currentTime < conBorderTime) {
			currentPos += (accTime * maxSpeed) / 2;
			currentPos += (currentTime - accBorderTime) * maxSpeed;
		} else if (currentTime >= conBorderTime && currentTime < totalMoveTime) {
			currentPos += (accTime * maxSpeed) / 2;
			currentPos += (conTime * maxSpeed);
			var rate = (stpTime - (currentTime - conBorderTime)) / stpTime;
			var height = maxSpeed * rate;
			currentPos += ((height + maxSpeed) * (currentTime - conBorderTime)) / 2;
		} else if (currentTime >= totalMoveTime) {
			currentPos = totalDistance;
		}
		
		return currentPos;
	},
	slideAllPicture : function(diff) {
		var ret = PAIRON_OK;
		var fname = "slideAllPicture()";
		var caller = this.name + "::" + fname;
	
		for (var i = 0; i < this.length; i++) {
			var picture = this.cardList[i].getPicture();
			ret = picture.moveRelative(diff, 0);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			
			picture.update();
		}
		
		return ret;
	}
};

var PAIRON_GALLERY_DATA_NUM = 6;
var PAIRON_GALLERY_DATA_NAME_POS = 0;
var PAIRON_GALLERY_DATA_AGE_POS = 1;
var PAIRON_GALLERY_DATA_COMMENT_POS = 2;
var PAIRON_GALLERY_DATA_PICTURE_POS = 3;
var PAIRON_GALLERY_DATA_HAVE_POS = 4;
var PAIRON_GALLERY_DATA_RATE_POS = 5;

var PaironCard = function() {
	this.name = "PaironCard";
};
PaironCard.prototype = {
	initialize : function(cdListElement) {
		var ret = PAIRON_OK;
		var fname = "initialize()";
		var caller = this.name + "::" + fname;
		
		var ELEMENT_NODE = 1;
	
		this.cdArray = new Array(PAIRON_GALLERY_DATA_NUM);
	
		var list = cdListElement.childNodes;
		var listLength = list.length;
		for (var j = 0; j < listLength; j++) {
			if (list[j].nodeType == ELEMENT_NODE) {
				var nodeName = list[j].nodeName;
				switch (nodeName) {
				case "name":
					ret = this.setName(list[j].innerHTML);
					if(ERROR_IF_NOT_OK(caller, ret)) return ret;
					break;
				case "age":
					ret = this.setAge(list[j].innerHTML);
					if(ERROR_IF_NOT_OK(caller, ret)) return ret;
					break;
				case "comment":
					ret = this.setComment(list[j].innerHTML);
					if(ERROR_IF_NOT_OK(caller, ret)) return ret;
					break;
				case "picture":
					var path = list[j].innerHTML;
					var picture = new PaironCardPicture();
					picture.initialize(path);
					ret = this.setPicture(picture);
					if(ERROR_IF_NOT_OK(caller, ret)) return ret;
					break;
				case "have":
					var xmlArray;
					try {
						xmlArray = eval(list[j].innerHTML);
					} catch(e) {
						console.log(e);
						console.log("have discription is invalid");
						xmlArray = new Array(0);
					}
					ret = this.setHave(xmlArray);
					if(ERROR_IF_NOT_OK(caller, ret)) return ret;
					break;
				case "rate":
					ret = this.setRate(list[j].innerHTML);
					if(ERROR_IF_NOT_OK(caller, ret)) return ret;
					break;
				default:
					console.log("unknown element is discripted.");
					break;
				}
			}
		}
		
		for (var j = 0; j < PAIRON_GALLERY_DATA_NUM; j++) {
			if(!this.cdArray[j]) {
				console.log("character data is not enough.");
			}
		}
		
		return ret;
	},
	terminate : function() {
		return PAIRON_OK;
	},
	getName : function() {
		return this.cdArray[PAIRON_GALLERY_DATA_NAME_POS];
	},
	setName : function(name) {
		this.cdArray[PAIRON_GALLERY_DATA_NAME_POS] = name;
		return PAIRON_OK;
	},
	getAge : function() {
		return this.cdArray[PAIRON_GALLERY_DATA_AGE_POS];
	},
	setAge : function(age) {
		this.cdArray[PAIRON_GALLERY_DATA_AGE_POS] = age;
		return PAIRON_OK;
	},
	getComment : function() {
		return this.cdArray[PAIRON_GALLERY_DATA_COMMENT_POS];
	},
	setComment : function(comment) {
		this.cdArray[PAIRON_GALLERY_DATA_COMMENT_POS] = comment;
		return PAIRON_OK;
	},
	getPicture : function() {
		return this.cdArray[PAIRON_GALLERY_DATA_PICTURE_POS];
	},
	setPicture : function(picture) {
		this.cdArray[PAIRON_GALLERY_DATA_PICTURE_POS] = picture;
		return PAIRON_OK;
	},
	getHave : function() {
		return this.cdArray[PAIRON_GALLERY_DATA_HAVE_POS];
	},
	setHave : function(have) {
		this.cdArray[PAIRON_GALLERY_DATA_HAVE_POS] = have;
		return PAIRON_OK;
	},
	getRate : function() {
		return this.cdArray[PAIRON_GALLERY_DATA_RATE_POS];
	},
	setRate : function(rate) {
		this.cdArray[PAIRON_GALLERY_DATA_RATE_POS] = rate;
		return PAIRON_OK;
	}
};

var PAIRON_PICTURE_WIDTH_SCALE = 0.688679;

var PaironCardPicture = function() {
	this.name = "PaironCardPicture";

	this.isPrepared = false;
	this.left = 0.0;
	this.top = 0.0;
	this.height = 0.0;
	this.width = 0.0;
	this.opacity = 1.0
	this.isDisplay = false;
};
PaironCardPicture.prototype = {
	initialize : function(path) {
		var ret = PAIRON_OK;
		var fname = "initialize()";
		var caller = this.name + "::" + fname;
	
		this.path = path;
		
		var parent = this;
		this.img = document.createElement("img");
		this.img.onload = function() {
			parent.isPrepared = true;
		}
		
		this.element = gi(OPERATION_TARGET_ELEMENT_NAME);
		if (!this.element) {
			console.log("element of '" + OPERATION_TARGET_ELEMENT_NAME + "' is not found.");
			return PAIRON_GALLERY_ERROR_ELEMENT_NOT_FOUND;
		}
		
		this.defaultHeight = parseInt((this.element.currentStyle || document.defaultView.getComputedStyle(this.element, '')).height);
		this.defaultWidth = this.defaultHeight * PAIRON_PICTURE_WIDTH_SCALE;
		
		this.left = 0;
		this.top = 0;
		this.width = this.defaultWidth;
		this.height = this.defaultHeight;
		this.opacity = 1.0;
		this.isDisplay = true;
		
		with (this.img.style) {
			backgroundColor = "#000000";
			display = "block";
			position = "absolute";
			margin = "0px";
			padding = "0px";
			top = parseInt(this.top) + "px";
			left = parseInt(this.left) + "px";
			width = parseInt(this.width) + "px";
			height = parseInt(this.height) + "px";
			borderStyle = "none";
		}
		
		this.img.setAttribute("src", this.path);
		
		return ret;
	},
	terminate : function() {
		return PAIRON_OK;
	},
	getPictureHandle : function() {
		return this.img;
	},
	getIsPrepared : function() {
		return this.isPrepared;
	},
	getPosition : function() {
		var ret = new Array(2);
		ret[0] = this.left;
		ret[1] = this.top;
		return ret;
	},
	getHeight : function() {
		return this.height;
	},
	getWidth : function() {
		return this.width;
	},
	getCenterPosition : function() {
		var ret = new Array(2);
		ret[0] = this.left + this.width / 2.0;
		ret[1] = this.top + this.height / 2.0;
		return ret;
	},
	getScale : function() {
		var scale = this.height / this.defaultHeight;
		return scale;
	},
	setScale : function(scale) {
		var scaleNum = parseFloat(scale);
		if (isNaN(scale)) {
			console.log("input scale is invalid.");
			return PAIRON_INVALID_ARGUMENT;
		}
		this.width = this.defaultWidth * scaleNum;
		this.height = this.defaultHeight * scaleNum
		return PAIRON_OK;
	},
	setScaleCenter : function(scale) {
		var centerX = this.left + this.width / 2;
		var centerY = this.top + this.height / 2;
		this.scale(scale);
		this.moveCenter(centerX, centerY);
		return PAIRON_OK;
	},
	move : function(x, y) {
		this.left = x;
		this.top = y
		return PAIRON_OK;
	},
	moveCenter : function(x, y) {
		var centerX = this.width / 2;
		var centerY = this.height / 2;
		
		var moveTargetX = x - centerX;
		var moveTargetY = y - centerY;
		
		this.move(moveTargetX, moveTargetY);
		return PAIRON_OK;
	},
	moveRelative : function(x, y) {
		this.left += x;
		this.top += y;
		return PAIRON_OK;
	},
	getOpacity : function() {
		return this.opacity;
	},
	setOpacity : function(rate) {
		this.opacity = rate;
		return PAIRON_OK;
	},
	getDisplay : function() {
		return this.isDisplay;
	},
	setDisplay : function(isDisplay) {
		if (isDisplay) {
			this.isDisplay = true;
		} else {
			this.isDisplay = false;
		}
		return PAIRON_OK;
	},
	update : function() {		
		with (this.img.style) {
			if (this.left < (-1) * this.width) {
				left = parseInt((-1) * this.width) + "px";
			} else if (this.left > (-1) * this.width && this.left < PAIRON_GLOBAL_STYLE_BLOCK_WIDTH) {
				left = parseInt(this.left) + "px";
				top = parseInt(this.top) + "px";
				opacity = this.opacity;
				if (this.isDisplay) {
					display = "block";
				} else {
					display = "none";
				}
			} else if (this.left > PAIRON_GLOBAL_STYLE_BLOCK_WIDTH) {
				left = parseInt(PAIRON_GLOBAL_STYLE_BLOCK_WIDTH) + "px";
			}
			
			width = parseInt(this.width) + "px";
			height = parseInt(this.height) + "px";
		}
	}
};

var PaironBalloon = function() {
	this.name = "PaironBalloon";
};
PaironBalloon.prototype = {
	initialize : function() {
		var ret = PAIRON_OK;
		var fname = "initialize()";
		var caller = this.name + "::" + fname;
		
		var BALOON_STYLE_LEFT = 100;
		var BALOON_STYLE_TOP = 5;
		var BALOON_STYLE_WIDTH = 500;
		var BALOON_STYLE_HEIGHT = 60;
		
		this.element = document.createElement("div");
		with (this.element.style) {
			position = "absolute";
			display = "none";
			left = BALOON_STYLE_LEFT + "px";
			top = BALOON_STYLE_TOP + "px";
			width = BALOON_STYLE_WIDTH + "px";
			height = BALOON_STYLE_HEIGHT + "px";
			backgroundColor = "#ffffff";
			borderStyle = "solid";
			borderColor = "#000000";
			borderWidth = "1px";
			borderRadius = "10px";
			opacity = "0.8";
			zIndex = "1";
		}
		
		this.upperElement = document.createElement("div");
		with (this.upperElement.style) {
			position = "absolute";
			display = "none";
			left = BALOON_STYLE_LEFT + "px";
			top = BALOON_STYLE_TOP + "px";
			width = BALOON_STYLE_WIDTH + "px";
			height = BALOON_STYLE_HEIGHT + "px";
			color = "#000000";
			zIndex = "2";
		}
		
		this.nameElement = document.createElement("div");
		this.nameElement.innerHTML = "";
		with (this.nameElement.style) {
			position = "absolute";
			left = "10px";
			top = "1px";
			width = (BALOON_STYLE_WIDTH - 15) + "px";
			height = "25px";
			fontFamily = "Meiryo UI";
			fontWeight = "bold";
			fontSize = "18px";
			color = "#0000cd";
			overflow = "hidden";
		}
		this.upperElement.appendChild(this.nameElement);
		
		this.commentElement = document.createElement("div");
		this.commentElement.innerHTML = "";
		with (this.commentElement.style) {
			position = "absolute";
			left = "10px";
			top = "25px";
			width = (BALOON_STYLE_WIDTH - 15) + "px";
			height = "33px";
			fontFamily = "Meiryo UI";
			fontSize = "12px";
			color = "#000000";
			overflow = "hidden";
			wordWrap = "normal";
			fontWeight = "bold";
		}
		this.upperElement.appendChild(this.commentElement);
		
		this.targetElement = gi(OPERATION_TARGET_ELEMENT_NAME);
		if (!this.targetElement) {
			console.log("element of '" + OPERATION_TARGET_ELEMENT_NAME + "' is not found.");
			return PAIRON_GALLERY_ERROR_ELEMENT_NOT_FOUND;
		}
		this.targetElement.appendChild(this.element);
		this.targetElement.appendChild(this.upperElement);
		
		return ret;
	},
	terminate : function() {
		return PAIRON_OK;
	},
	showBalloon : function(card) {
		var name = card.getName();
		var age = card.getAge();
		var comment = card.getComment();
		
		this.nameElement.innerHTML = name;
		this.commentElement.innerHTML = comment;
	
		this.element.style.display = "block";
		this.upperElement.style.display = "block";
		
		return PAIRON_OK;
	},
	hideBalloon : function() {
		this.element.style.display = "none";
		this.upperElement.style.display = "none";
		return PAIRON_OK;
	}
};