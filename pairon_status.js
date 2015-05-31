// ===============================================================================
// Pairon Status Manager
// ===============================================================================
var BASIC_RANK_1ST = 0;
var BASIC_RANK_2ND = 1;
var BASIC_RANK_3RD = 2;
var BASIC_RANK_4TH = 3;
var BASIC_RANK_UNKNOWN = 4;
var BASIC_RANK_NUM = 4;
var GRADE_HISTORY_NUM = 15;

// Default value of status
var DEFAULT_RANK = [0.2598, 0.2967, 0.2567, 0.1868];
var DEFAULT_GOAL_RATE = 0.2423;
var DEFAULT_HOUJU_RATE = 0.1117;
var DEFAULT_REACH_RATE = 0.4119;
var DEFAULT_HURO_RATE = 0.5287;
var DEFAULT_DAMA_RATE = 0.0593;
var DEFAULT_GRADE = new Array(GRADE_HISTORY_NUM);
for (var i = 0; i < GRADE_HISTORY_NUM; i++) {
	DEFAULT_GRADE[i] = BASIC_RANK_UNKNOWN;
}

// Fixed style value of status
var PAIRON_STATUS_STYLE_RANK_GRAPH_WIDTH = 300;
var PAIRON_STATUS_STYLE_GOAL_GRAPH_WIDTH = 300;
var PAIRON_STATUS_STYLE_CANVAS_WIDTH = 195;
var PAIRON_STATUS_STYLE_CANVAS_HEIGHT = PAIRON_GLOBAL_STYLE_BLOCK_HEIGHT;
var PAIRON_STATUS_CONT_ELEMENT_NAME = "CONT_TOTAL_STATUS";

// Error code
var PAIRON_STATUS_ERROR_BASE				= PAIRON_ERROR_BASE - 2000;
var PAIRON_STATUS_ERROR_CANNOT_USE_CANVAS	= PAIRON_STATUS_ERROR_BASE - 1;
var PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND	= PAIRON_STATUS_ERROR_BASE - 2;

var PaironStatus = function() {
	this.name = "PaironStatus";
};
PaironStatus.prototype = {
	initialize : function() {
		var ret = PAIRON_OK;
		var fname = "initialize()";
		var caller = this.name + "::" + fname;
		
		ret = this.createViewer();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	terminate : function() {
		return PAIRON_OK;
	},
	getRank : function() {
		return this.rank;
	},
	createViewer : function() {
		var ret = PAIRON_OK;
		var fname = "createViewer()";
		var caller = this.name + "::" + fname;
		
		this.xmlReader = new XmlReader();
		
		ret = this.xmlReader.initialize();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		var xhrCallback = function(state, reader, arg) {
			if (state == LIB_STORAGE_OK) {
				var viewerDivElement = reader.getXml().getElementById("view");
				
				ret = arg.createViewerAfterCallback(viewerDivElement);
				if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			} else {
				DEBUG(caller, "Cannot read xml response.");
			}
		};
		
		ret = this.xmlReader.setXhrCallback(xhrCallback, this);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.xmlReader.loadXml("pairon_status.xml");
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	createViewerAfterCallback : function(viewerDivElement) {
		var ret = PAIRON_OK;
		var fname = "createViewerAfterCallback()";
		var caller = this.name + "::" + fname;
		
		this.topElement = gi("CONT_TOTAL_STATUS");
		this.topElement.innerHTML = viewerDivElement.innerHTML;
		
		this.contElement = gi(PAIRON_STATUS_CONT_ELEMENT_NAME);
		if (!this.contElement) {
			console.log("element of '" + PAIRON_STATUS_CONT_ELEMENT_NAME + "' is not found.");
			return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		}
		
		this.cookie = new CookieManager();
		ret = this.cookie.initialize();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.loadStatus();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.saveStatus();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		this.statusInput = new PaironStatusInput();
		ret = this.statusInput.initialize(this);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		this.update();
		
		return ret;
	},
	show : function() {
		this.contElement.style.display = "block";
		return PAIRON_OK;
	},
	hide : function() {
		this.contElement.style.display = "none";
		return PAIRON_OK;
	},
	setRank : function(rankArray) {
		var ret = PAIRON_OK;
		var fname = "setRank()";
		var caller = this.name + "::" + fname;
		
		
		if (!this.rank) {
			this.rank = new Array(BASIC_RANK_NUM);
		}
		for (var i = 0; i < BASIC_RANK_NUM; i++) {
			if(isNaN(rankArray[i])) {
				rankArray[i] = 0.0;
				console.log("rank[" + i + "] is invalid. So converted to 0.0");
			}
		}
		
		var rankSum = 0.0;
		
		if (rankSum + rankArray[BASIC_RANK_1ST] <= 1.0) {
			this.rank[BASIC_RANK_1ST] = rankArray[BASIC_RANK_1ST];
		} else {
			this.rank[BASIC_RANK_1ST] = 1.0;
			console.log("1st rank is invalid.");
			ret = PAIRON_INVALID_ARGUMENT;
		}
		rankSum += this.rank[BASIC_RANK_1ST];
		
		if (rankSum + rankArray[BASIC_RANK_2ND] <= 1.0) {
			this.rank[BASIC_RANK_2ND] = rankArray[BASIC_RANK_2ND];
		} else {
			this.rank[BASIC_RANK_2ND] = 1.0 - rankSum;
			console.log("2nd rank is invalid.");
			ret = PAIRON_INVALID_ARGUMENT;
		}
		rankSum += this.rank[BASIC_RANK_2ND];
		
		if (rankSum + rankArray[BASIC_RANK_3RD] <= 1.0) {
			this.rank[BASIC_RANK_3RD] = rankArray[BASIC_RANK_3RD];
		} else {
			this.rank[BASIC_RANK_3RD] = 1.0 - rankSum;
			console.log("3rd rank is invalid.");
			ret = PAIRON_INVALID_ARGUMENT;
		}
		rankSum += this.rank[BASIC_RANK_3RD];
		
		if (rankSum + rankArray[BASIC_RANK_4TH] <= 1.0) {
			this.rank[BASIC_RANK_4TH] = rankArray[BASIC_RANK_4TH];
		} else {
			this.rank[BASIC_RANK_4TH] = 1.0 - rankSum;
			// ぱいろんの順位率が1.0を下回ったり上回ったりするため、4位のエラーチェックは入れないことにします。
		}
		rankSum += this.rank[BASIC_RANK_4TH];
		
		if (rankSum != 1.0) {
			this.rank[BASIC_RANK_4TH] = 1.0 - (this.rank[BASIC_RANK_1ST] + this.rank[BASIC_RANK_2ND] + this.rank[BASIC_RANK_3RD]);
		}
		
		return ret;
	},
	getGoalReach : function() {
		return this.goalReach;
	},
	getGoalHuro : function() {
		return this.goalHuro;
	},
	getGoalDama : function() {
		return this.goalDama;
	},
	setGoal : function(reach, huro, dama) {
		var ret = PAIRON_OK;
		var fname = "setGoal()";
		var caller = this.name + "::" + fname;
	
		if (!this.goalReach) this.reach = 0.0;
		if (!this.goalHuro) this.huro = 0.0;
		if (!this.goalDama) this.dama = 0.0;
		
		if (isNaN(reach)) this.reach = 0.0;
		if (isNaN(huro)) this.huro = 0.0;
		if (isNaN(dama)) this.dama = 0.0;
		
		var goalSum = 0.0;
		
		if (goalSum + reach <= 1.0) {
			this.goalReach = reach;
		} else {
			this.goalReach = 1.0 - goalSum;
			console.log("reach rate is invalid.");
			ret = PAIRON_INVALID_ARGUMENT;
		}
		goalSum += this.goalReach;
		
		if (goalSum + huro <= 1.0) {
			this.goalHuro = huro;
		} else {
			this.goalHuro = 1.0 - goalSum;
			console.log("huro rate is invalid.");
			ret = PAIRON_INVALID_ARGUMENT;
		}
		goalSum += this.goalHuro;
		
		
		if (goalSum + dama <= 1.0) {
			this.goalDama = dama;
		} else {
			this.goalDama = 1.0 - goalSum;
		}
		goalSum += this.goalDama;
		
		if (goalSum != 1.0) {
			this.goalDama = 1.0 - (this.goalReach + this.goalHuro);
		}
		
		return ret;
	},
	getGrade : function() {
		return this.gradeHistoryArray;
	},
	setGrade : function(grade) {
		var ret = PAIRON_OK;
		var fname = "setGrade()";
		var caller = this.name + "::" + fname;
		
		if (!this.gradeHistoryArray) {
			this.gradeHistoryArray = new Array(GRADE_HISTORY_NUM);
		}
		
		if (grade == "１") grade = BASIC_RANK_1ST;
		else if (grade == "２") grade = BASIC_RANK_2ND;
		else if (grade == "３") grade = BASIC_RANK_3RD;
		else if (grade == "４") grade = BASIC_RANK_4TH;
		
		if (grade != BASIC_RANK_1ST &&
			grade != BASIC_RANK_2ND &&
			grade != BASIC_RANK_3RD &&
			grade != BASIC_RANK_4TH &&
			grade != BASIC_RANK_UNKNOWN) {
			console.log("input grade is invalid.");
			return PAIRON_INVALID_ARGUMENT;
		}
		
		for (var i = 0; i < GRADE_HISTORY_NUM - 1; i++) {
			this.gradeHistoryArray[i] = this.gradeHistoryArray[i + 1];
		}
		this.gradeHistoryArray[GRADE_HISTORY_NUM - 1] = grade;
		
		return ret;
	},
	getGoalRate : function() {
		if (isNaN(this.goalRate)) {
			this.goalRate = 0.0;
		}
		if (this.goalRate < 0.0) {
			this.goalRate = 0.0;
		}
		if (this.goalRate > 1.0) {
			this.goalRate = 1.0;
		}
		
		return this.goalRate;
	},
	setGoalRate : function(goalRate) {
		var ret = PAIRON_OK;
		var fname = "setGoalRate()";
		var caller = this.name + "::" + fname;
		
		if (isNaN(goalRate)) {
			goalRate = 0.0;
		}
	
		if(goalRate >= 0.0 && goalRate <= 1.0) {
			this.goalRate = goalRate;
		} else if (goalRate < 0.0) {
			this.goalRate = 0.0;
			ret = PAIRON_INVALID_ARGUMENT;
		} else {
			this.goalRate = 1.0;
			ret = PAIRON_INVALID_ARGUMENT;
		}
		
		return ret;
	},
	getHoujuRate : function() {
		if (isNaN(this.houjuRate)) {
			this.houjuRate == 0.0;
		}
		if (this.houjuRate < 0.0) {
			this.houjuRate = 0.0;
		}
		if (this.houjuRate > 1.0) {
			this.houjuRate = 1.0;
		}
		
		return this.houjuRate;
	},
	setHoujuRate : function(houjuRate) {
		var ret = PAIRON_OK;
		var fname = "setHoujuRate()";
		var caller = this.name + "::" + fname;
		
		if (isNaN(houjuRate)) {
			houjuRate = 0.0;
		}
		
		if(houjuRate >= 0.0 && houjuRate <= 1.0) {
			this.houjuRate = houjuRate;
		} else if (houjuRate < 0.0) {
			this.houjuRate = 0.0;
			ret = PAIRON_INVALID_ARGUMENT;
		} else {
			this.houjuRate = 1.0;
			ret = PAIRON_INVALID_ARGUMENT;
		}		
		return ret;
	},
	update : function() {
		var ret = PAIRON_OK;
		var fname = "update()";
		var caller = this.name + "::" + fname;
		
		ret = this.updateBasicStatus();
		if(ERROR_IF_NOT_OK(caller, ret)) return;
		
		ret = this.updateRank();
		if(ERROR_IF_NOT_OK(caller, ret)) return;
		
		ret = this.updateGoal();
		if(ERROR_IF_NOT_OK(caller, ret)) return;
		
		ret = this.updateProcess();
		if(ERROR_IF_NOT_OK(caller, ret)) return;
		
	},
	updateBasicStatus : function() {
		var ret = PAIRON_OK;
		var fname = "updateBasicStatus()";
		var caller = this.name + "::" + fname;
	
		var basicStatus1stRate = gi("BASIC_STATUS_1ST_RATE");
		if (!basicStatus1stRate) {
			DEBUG(caller, "cannot find BASIC_STATUS_1ST_RATE.");
			return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		}
		basicStatus1stRate.innerHTML = sprintf("%2.2f", this.rank[BASIC_RANK_1ST] * 100.0);
	
		var basicStatusWinRate = gi("BASIC_STATUS_WIN_RATE");
		if (!basicStatusWinRate) {
			DEBUG(caller, "cannot find BASIC_STATUS_WIN_RATE.");
			return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		}
		basicStatusWinRate.innerHTML = sprintf("%2.2f", (this.rank[BASIC_RANK_1ST] + this.rank[BASIC_RANK_2ND]) * 100.0);
		
		var basicStatusGoalRate = gi("BASIC_STATUS_GOAL_RATE");
		if (!basicStatusGoalRate) {
			DEBUG(caller, "cannot find BASIC_STATUS_GOAL_RATE.");
			return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		}
		basicStatusGoalRate.innerHTML = sprintf("%2.2f", this.goalRate * 100.0);
		
		var basicStatusHoujuRate = gi("BASIC_STATUS_HOUJU_RATE");
		if (!basicStatusHoujuRate) {
			DEBUG(caller, "cannot find BASIC_STATUS_HOUJU_RATE.");
			return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		}
		basicStatusHoujuRate.innerHTML = sprintf("%2.2f", this.houjuRate * 100.0);
		
		return ret;
	},
	updateRank : function() {
		var ret = PAIRON_OK;
		var fname = "updateRank()";
		var caller = this.name + "::" + fname;
	
		var rankSum = 0.0;
		var scaleFactor = PAIRON_STATUS_STYLE_RANK_GRAPH_WIDTH;
		
		var leftTmp = 0.0;
		var widthTmp = 0.0;
		
		// Rank1
		var graphRank1 = gi("RANK_1");
		if (!graphRank1) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		leftTmp = rankSum * scaleFactor;
		graphRank1.style.left = parseInt(leftTmp) + "px";
		widthTmp = this.rank[BASIC_RANK_1ST] * scaleFactor;
		if (widthTmp > 0) graphRank1.style.width = parseInt(widthTmp) + "px";
		else graphRank1.style.width = 0;
		
		var graphRankValue1 = gi("RANK_VALUE_1");
		if (!graphRankValue1) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		graphRankValue1.innerHTML = sprintf("%2.2f", this.rank[BASIC_RANK_1ST] * 100.0);
		rankSum += this.rank[BASIC_RANK_1ST];
		
		// Rank2
		var graphRank2 = gi("RANK_2");
		if (!graphRank2) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		leftTmp = rankSum * scaleFactor;
		graphRank2.style.left = parseInt(leftTmp) + "px";
		widthTmp = this.rank[BASIC_RANK_2ND] * scaleFactor;
		if (widthTmp > 0) graphRank2.style.width = parseInt(widthTmp) + "px";
		else graphRank2.style.width = 0;
		
		var graphRankValue2 = gi("RANK_VALUE_2");
		if (!graphRankValue2) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		graphRankValue2.innerHTML = sprintf("%2.2f", this.rank[BASIC_RANK_2ND] * 100.0);
		rankSum += this.rank[BASIC_RANK_2ND];
		
		// Rank3
		var graphRank3 = gi("RANK_3");
		if (!graphRank3) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		leftTmp = rankSum * scaleFactor
		graphRank3.style.left = parseInt(leftTmp) + "px";
		widthTmp = this.rank[BASIC_RANK_3RD] * scaleFactor;
		if (widthTmp > 0) graphRank3.style.width = parseInt(widthTmp) + "px";
		else graphRank3.style.width = 0;
		
		var graphRankValue3 = gi("RANK_VALUE_3");
		if (!graphRankValue3) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		graphRankValue3.innerHTML = sprintf("%2.2f", this.rank[BASIC_RANK_3RD] * 100.0);
		rankSum += this.rank[BASIC_RANK_3RD];
		
		// Rank4
		var graphRank4 = gi("RANK_4");
		if (!graphRank4) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		leftTmp = rankSum * scaleFactor
		graphRank4.style.left = parseInt(leftTmp) + "px";
		widthTmp = this.rank[BASIC_RANK_4TH] * scaleFactor;
		if (widthTmp > 0) graphRank4.style.width = parseInt(widthTmp) + "px";
		else graphRank4.style.width = 0;
		
		var graphRankValue4 = gi("RANK_VALUE_4");
		if (!graphRankValue4) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		graphRankValue4.innerHTML = sprintf("%2.2f", this.rank[BASIC_RANK_4TH] * 100.0);
		rankSum += this.rank[BASIC_RANK_4TH];
		
		return ret;
	},
	updateGoal : function() {
		var ret = PAIRON_OK;
		var fname = "updateGoal()";
		var caller = this.name + "::" + fname;
	
		var goalSum = 0.0;
		var scaleFactor = PAIRON_STATUS_STYLE_GOAL_GRAPH_WIDTH;
		
		var leftTmp = 0.0;
		var widthTmp = 0.0;
		
		// Reach
		var graphGoalReach = gi("GOAL_REACH");
		if (!graphGoalReach) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		leftTmp = goalSum * scaleFactor;
		graphGoalReach.style.left = parseInt(leftTmp) + "px";
		widthTmp = this.goalReach * scaleFactor;
		if (widthTmp > 0) graphGoalReach.style.width = parseInt(widthTmp) + "px";
		else graphGoalReach.style.width = 0;
		
		var graphGoalValueReach = gi("GOAL_VALUE_REACH");
		if (!graphGoalValueReach) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		graphGoalValueReach.innerHTML = sprintf("%2.2f", this.goalReach * 100.0);
		goalSum += this.goalReach;
		
		// Huro
		var graphGoalHuro = gi("GOAL_HURO");
		if (!graphGoalHuro) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		leftTmp = goalSum * scaleFactor;
		graphGoalHuro.style.left = parseInt(leftTmp) + "px";
		widthTmp = this.goalHuro * scaleFactor;
		if (widthTmp > 0) graphGoalHuro.style.width = parseInt(widthTmp) + "px";
		else graphGoalHuro.style.width = 0;
		
		var graphGoalValueHuro = gi("GOAL_VALUE_HURO");
		if (!graphGoalValueHuro) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		graphGoalValueHuro.innerHTML = sprintf("%2.2f", this.goalHuro * 100.0);
		goalSum += this.goalHuro;
		
		// Dama
		var graphGoalDama = gi("GOAL_DAMA");
		if (!graphGoalDama) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		leftTmp = goalSum * scaleFactor;
		graphGoalDama.style.left = parseInt(leftTmp) + "px";
		widthTmp = this.goalDama * scaleFactor;
		if (widthTmp > 0) graphGoalDama.style.width = parseInt(widthTmp) + "px";
		else graphGoalDama.style.width = 0;
		
		var graphGoalValueDama = gi("GOAL_VALUE_DAMA");
		if (!graphGoalValueDama) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		graphGoalValueDama.innerHTML = sprintf("%2.2f", this.goalDama * 100.0);
		goalSum += this.goalDama;
		
		return ret;
	},
	updateProcess : function() {
		var ret = PAIRON_OK;
		var fname = "updateProcess()";
		var caller = this.name + "::" + fname;
	
		var canvas = gi("PROCESS_CANVAS");
		if (!canvas) {
			console.log("canvas element is not found.");
			return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		}
		
		var context;
		try {
			context = canvas.getContext("2d");
		} catch(e) {
			console.log("cannot use canvas.");
			return PAIRON_STATUS_ERROR_CANNOT_USE_CANVAS;
		}
		
		canvas.width = PAIRON_STATUS_STYLE_CANVAS_WIDTH;
		canvas.height = PAIRON_STATUS_STYLE_CANVAS_HEIGHT;
		
		this.width = canvas.width;
		this.height = canvas.height;
		
		if (!this.painter) {
			this.painter = new CanvasPainter();
			ret = this.painter.initialize(context);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		ret = this.initializeCanvasGraph(context);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	initializeCanvasGraph : function(context) {
		var ret = PAIRON_OK;
		var fname = "initializeCanvasGraph()";
		var caller = this.name + "::" + fname;
	
		var GRAPH_FONT_SIZE = 12;
		var GRAPH_BORDER_SIZE_1 = 1;
		var GRAPH_BORDER_SIZE_2 = 2;
		
		var GRAPH_TOP = 5;
		var GRAPH_BOTTOM = this.height - 5;
		var GRAPH_LEFT = 25;
		var GRAPH_RIGHT = this.width - 5;
		
		var PRIMAL_AXIS_COLOR = "#ffffff";
		var AXIS_LABEL_FONT_COLOR = PRIMAL_AXIS_COLOR;
		var SUB_AXIS_COLOR = "#cccccc";
		var GRADE_BORDER_COLOR = "#ffff00";
		var GRADE_PAINT_COLOR = "#000000";
		
		var VERTICAL_AXIS_LEFT = GRAPH_LEFT - 22;
		var HORIZONTAL_AXIS_TOP = GRAPH_BOTTOM + 3;
		
		var RANK1_POS_Y = (GRAPH_BOTTOM - GRAPH_TOP) / 6;
		var RANK2_POS_Y = RANK1_POS_Y + (GRAPH_BOTTOM - GRAPH_TOP) / 4;
		var RANK3_POS_Y = RANK2_POS_Y + (GRAPH_BOTTOM - GRAPH_TOP) / 4;
		var RANK4_POS_Y = RANK3_POS_Y + (GRAPH_BOTTOM - GRAPH_TOP) / 4;
		
		var gradePointXArray = new Array(GRADE_HISTORY_NUM);
		for (var i = 0; i < GRADE_HISTORY_NUM; i++) {
			gradePointXArray[i] = GRAPH_LEFT + ((GRAPH_RIGHT - GRAPH_LEFT) / GRADE_HISTORY_NUM) * (i + 0.5);
		}
		var gradePointYArray = new Array(GRADE_HISTORY_NUM);
		for (var i = 0; i < GRADE_HISTORY_NUM; i++) {
			var grade = this.gradeHistoryArray[i];
			switch(grade) {
			case BASIC_RANK_1ST:
				gradePointYArray[i] = RANK1_POS_Y;
				break;
			case BASIC_RANK_2ND:
				gradePointYArray[i] = RANK2_POS_Y;
				break;
			case BASIC_RANK_3RD:
				gradePointYArray[i] = RANK3_POS_Y;
				break;
			case BASIC_RANK_4TH:
				gradePointYArray[i] = RANK4_POS_Y;
				break;
			case BASIC_RANK_UNKNOWN:
				break;
			default:
				console.log("unknown rank.");
				break;
			}
		}
		
		this.painter.drawLine(GRAPH_LEFT, GRAPH_TOP, GRAPH_LEFT, GRAPH_BOTTOM, PRIMAL_AXIS_COLOR, GRAPH_BORDER_SIZE_2);
		this.painter.drawLine(GRAPH_LEFT, GRAPH_BOTTOM, GRAPH_RIGHT, GRAPH_BOTTOM, PRIMAL_AXIS_COLOR, GRAPH_BORDER_SIZE_2);
		
		this.painter.drawLine(GRAPH_LEFT, RANK1_POS_Y, GRAPH_RIGHT, RANK1_POS_Y, SUB_AXIS_COLOR, GRAPH_BORDER_SIZE_1);
		this.painter.drawLine(GRAPH_LEFT, RANK2_POS_Y, GRAPH_RIGHT, RANK2_POS_Y, SUB_AXIS_COLOR, GRAPH_BORDER_SIZE_1);
		this.painter.drawLine(GRAPH_LEFT, RANK3_POS_Y, GRAPH_RIGHT, RANK3_POS_Y, SUB_AXIS_COLOR, GRAPH_BORDER_SIZE_1);
		this.painter.drawLine(GRAPH_LEFT, RANK4_POS_Y, GRAPH_RIGHT, RANK4_POS_Y, SUB_AXIS_COLOR, GRAPH_BORDER_SIZE_1);
		
		this.painter.drawText(VERTICAL_AXIS_LEFT, RANK1_POS_Y - GRAPH_FONT_SIZE / 2, "1位", AXIS_LABEL_FONT_COLOR, GRAPH_FONT_SIZE);
		this.painter.drawText(VERTICAL_AXIS_LEFT, RANK2_POS_Y - GRAPH_FONT_SIZE / 2, "2位", AXIS_LABEL_FONT_COLOR, GRAPH_FONT_SIZE);
		this.painter.drawText(VERTICAL_AXIS_LEFT, RANK3_POS_Y - GRAPH_FONT_SIZE / 2, "3位", AXIS_LABEL_FONT_COLOR, GRAPH_FONT_SIZE);
		this.painter.drawText(VERTICAL_AXIS_LEFT, RANK4_POS_Y - GRAPH_FONT_SIZE / 2, "4位", AXIS_LABEL_FONT_COLOR, GRAPH_FONT_SIZE);
		
		for (var i = 1; i < GRADE_HISTORY_NUM; i++) {
			if (this.gradeHistoryArray[i - 1] != BASIC_RANK_UNKNOWN && this.gradeHistoryArray[i] != BASIC_RANK_UNKNOWN) {
				var x1 = gradePointXArray[i - 1];
				var y1 = gradePointYArray[i - 1];
				var x2 = gradePointXArray[i];
				var y2 = gradePointYArray[i];
				
				this.painter.drawLine(x1, y1, x2, y2, GRADE_BORDER_COLOR, GRAPH_BORDER_SIZE_2);
			}
		}
		for (var i = 0; i < GRADE_HISTORY_NUM; i++) {
			if (this.gradeHistoryArray[i] != BASIC_RANK_UNKNOWN) {
				this.painter.drawCircle(gradePointXArray[i], gradePointYArray[i], GRADE_BORDER_COLOR, GRADE_PAINT_COLOR, 3);
			}
		}
		
		return ret;
	},
	saveStatus : function() {
		var ret = PAIRON_OK;
		var fname = "saveStatus()";
		var caller = this.name + "::" + fname;
	
		ret = this.cookie.setCookie("r1", sprintf("%0.4f", this.getRank()[BASIC_RANK_1ST]));
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		ret = this.cookie.setCookie("r2", sprintf("%0.4f", this.getRank()[BASIC_RANK_2ND]));
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		ret = this.cookie.setCookie("r3", sprintf("%0.4f", this.getRank()[BASIC_RANK_3RD]));
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		ret = this.cookie.setCookie("r4", sprintf("%0.4f", this.getRank()[BASIC_RANK_4TH]));
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.cookie.setCookie("gr", sprintf("%0.4f", this.getGoalReach()));
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		ret = this.cookie.setCookie("gh", sprintf("%0.4f", this.getGoalHuro()));
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		ret = this.cookie.setCookie("gd", sprintf("%0.4f", this.getGoalDama()));
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.cookie.setCookie("goal", sprintf("%0.4f", this.getGoalRate()));
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		ret = this.cookie.setCookie("houju", sprintf("%0.4f", this.getHoujuRate()));
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		var gradeStr = "";
		var gradeArray = this.getGrade();
		for (var i = 0; i < GRADE_HISTORY_NUM; i++) {
			gradeStr += sprintf("%d", gradeArray[i]) + "";
		}
		ret = this.cookie.setCookie("grade", gradeStr);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	loadStatus : function() {
		var ret = PAIRON_OK;
		var fname = "loadStatus()";
		var caller = this.name + "::" + fname;
	
		if (this.cookie.checkCookie("r1") == LIB_STORAGE_OK &&
			this.cookie.checkCookie("r2") == LIB_STORAGE_OK &&
			this.cookie.checkCookie("r3") == LIB_STORAGE_OK &&
			this.cookie.checkCookie("r4") == LIB_STORAGE_OK) {
			var loadRankArray = new Array(4);
			loadRankArray[BASIC_RANK_1ST] = parseFloat(this.cookie.getCookie("r1"));
			loadRankArray[BASIC_RANK_2ND] = parseFloat(this.cookie.getCookie("r2"));
			loadRankArray[BASIC_RANK_3RD] = parseFloat(this.cookie.getCookie("r3"));
			loadRankArray[BASIC_RANK_4TH] = parseFloat(this.cookie.getCookie("r4"));
			ret = this.setRank(loadRankArray);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		} else {
			console.log("default rank is loaded.");
			ret = this.setRank(DEFAULT_RANK);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		if (this.cookie.checkCookie("gr") == LIB_STORAGE_OK &&
			this.cookie.checkCookie("gh") == LIB_STORAGE_OK &&
			this.cookie.checkCookie("gd") == LIB_STORAGE_OK) {
			var loadReach = parseFloat(this.cookie.getCookie("gr"));
			var loadHuro = parseFloat(this.cookie.getCookie("gh"));
			var loadDama = parseFloat(this.cookie.getCookie("gd"));
			
			ret = this.setGoal(loadReach, loadHuro, loadDama);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		} else {
			console.log("default goal is loaded.");
			ret = this.setGoal(DEFAULT_REACH_RATE, DEFAULT_HURO_RATE, DEFAULT_DAMA_RATE);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		if (this.cookie.checkCookie("goal") == LIB_STORAGE_OK) {
			ret = this.setGoalRate(parseFloat(this.cookie.getCookie("goal")));
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		} else {
			console.log("default goal rate is loaded.");
			ret = this.setGoalRate(DEFAULT_GOAL_RATE);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		if (this.cookie.checkCookie("houju") == LIB_STORAGE_OK) {
			ret = this.setHoujuRate(parseFloat(this.cookie.getCookie("houju")));
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		} else {
			console.log("default houju rate is loaded.");
			ret = this.setHoujuRate(DEFAULT_HOUJU_RATE);
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		if (this.cookie.checkCookie("grade") == LIB_STORAGE_OK) {
			var gradeStr = this.cookie.getCookie("grade");
			var gradeStrLength = gradeStr.length;
			//if(gradeStrLength == GRADE_HISTORY_NUM) {
				for(var i = 0; i < gradeStrLength; i++) {
					var loadGrade = parseInt(gradeStr.substring(i, i + 1));
					if(loadGrade == BASIC_RANK_1ST ||
					   loadGrade == BASIC_RANK_2ND ||
					   loadGrade == BASIC_RANK_3RD ||
					   loadGrade == BASIC_RANK_4TH ||
					   loadGrade == BASIC_RANK_UNKNOWN) {
						ret = this.setGrade(loadGrade);
						if(ERROR_IF_NOT_OK(caller, ret)) return ret;
					} else {
						console.log("unknown grade string is received.");
					}
				}
			/*} else {
				console.log("grade string is invalid length.");
			}*/
			
		} else {
			console.log("default grade history is loaded.");
			for (var i = 0; i < GRADE_HISTORY_NUM; i++) {
				ret = this.setGrade(DEFAULT_GRADE[i]);
				if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			}
		}
		
		return ret;
	},
	show : function() {
		var ret = PAIRON_OK;
		
		if (!this.contElement) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		this.contElement.style.display = "block";
		
		return ret;
	},
	hide : function() {
		var ret = PAIRON_OK;
		
		if (!this.contElement) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		this.contElement.style.display = "none";
		
		return ret;
	}
};

var CanvasPainter = function() {
	this.name = "CanvasPainter";

	this.context = undefined;
};
CanvasPainter.prototype = {
	initialize : function(context) {
		this.context = context;
		return PAIRON_OK;
	},
	terminate : function() {
		this.context = undefined;
		return PAIRON_OK;
	},
	drawLine : function(x1, y1, x2, y2, color, width) {
		var ret = PAIRON_OK;
		var fname = "drawLine()";
		var caller = this.name + "::" + fname;
		
		if (!this.context) {
			console.log("canvas context is not initialized.");
			return PAIRON_UNKNOWN_CONTEXT;
		}
		
		try {
			if (color) {
				this.context.strokeStyle = color;
			}
			if (width) {
				this.context.lineWidth = width;
			}
		
			this.context.beginPath();
			this.context.moveTo(x1, y1);
			this.context.lineTo(x2, y2);
			this.context.closePath();
			this.context.stroke();
		} catch(e) {
			console.log(e);
			return PAIRON_CANVAS_API_ERROR;
		}
		
		return ret;
	},
	drawCircle : function(x, y, color, background, radius) {
		var ret = PAIRON_OK;
		var fname = "drawCircle()";
		var caller = this.name + "::" + fname;
		
		if (!this.context) {
			console.log("canvas context is not initialized.");
			return PAIRON_UNKNOWN_CONTEXT;
		}
		
		try {
			if (color) {
				this.context.strokeStyle = color;
			}
			if (background) {
				this.context.fillStyle = background;
			}
			this.context.lineWidth = 2;
			
			this.context.beginPath();
			this.context.arc(x, y, radius, 0, Math.PI * 2, false);
			this.context.fill();
			this.context.stroke();
			this.context.closePath();
		} catch(e) {
			console.log(e);
			return PAIRON_CANVAS_API_ERROR;
		}
		
		return ret;
	},
	drawText : function(x, y, text, color, size) {
		var ret = PAIRON_OK;
		var fname = "drawText()";
		var caller = this.name + "::" + fname;
		
		if (!this.context) {
			console.log("canvas context is not initialized.");
			return PAIRON_UNKNOWN_CONTEXT;
		}
		
		try {
			if (color) {
				this.context.fillStyle = color;
			}
			if (size) {
				this.context.font = size + "px 'Meiryo UI'";
			}
			
			this.context.textAlign = "left";
			this.context.textBaseline = "top";
			
			this.context.fillText(text, x, y);
		} catch(e) {
			console.log(e);
			return PAIRON_UNKNOWN_CONTEXT;
		}
		
		return ret;
	}
};

var PaironStatusInput = function() {
	this.name = "PaironStatusInput";

	this.status = undefined;
};
PaironStatusInput.prototype = {
	initialize : function(statusHandle, inputFrame) {
		var ret = PAIRON_OK;
		var fname = "initialize()";
		var caller = this.name + "::" + fname;
		
		if (!statusHandle) return PAIRON_INVALID_ARGUMENT;
		
		this.status = statusHandle;
		
		ret = this.createForm();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	terminate : function() {
		this.status = undefined;
		return PAIRON_OK;
	},
	createForm : function() {
		var ret = PAIRON_OK;
		var fname = "createForm()";
		var caller = this.name + "::" + fname;
		
		this.xmlReader = new XmlReader();
		
		ret = this.xmlReader.initialize();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		var xhrCallback = function(state, reader, arg) {
			if (state == LIB_STORAGE_OK) {
				var inputDivElement = reader.getXml().getElementById("input");
				
				ret = arg.createFormAfterCallback(inputDivElement);
				if(ERROR_IF_NOT_OK(caller, ret)) return ret;
			} else {
				DEBUG(caller, "Cannot read xml response.");
			}
		};
		
		ret = this.xmlReader.setXhrCallback(xhrCallback, this);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.xmlReader.loadXml("pairon_status.xml");
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	createFormAfterCallback : function(inputDivElement) {
		var ret = PAIRON_OK;
		var fname = "createFormAfterCallback()";
		var caller = this.name + "::" + fname;
		
		this.topElement = gi("INPUT_BLOCK");
		this.topElement.innerHTML = inputDivElement.innerHTML;
		
		ret = this.updateForm();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = this.setEventHandler();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	updateForm : function() {
		var parent = this;
		var fname = "updateForm()";
		var caller = this.name + "::" + fname;
	
		var handle = this.status;
	
		var rankArray = handle.getRank();
		gi("INPUT_RANK_1").value = sprintf("%2.2f", rankArray[BASIC_RANK_1ST] * 100);
		gi("INPUT_RANK_2").value = sprintf("%2.2f", rankArray[BASIC_RANK_2ND] * 100);
		gi("INPUT_RANK_3").value = sprintf("%2.2f", rankArray[BASIC_RANK_3RD] * 100);
		gi("INPUT_RANK_4").value = sprintf("%2.2f", rankArray[BASIC_RANK_4TH] * 100);
		
		gi("INPUT_GOAL_REACH").value = sprintf("%2.2f", handle.getGoalReach() * 100);
		gi("INPUT_GOAL_HURO").value = sprintf("%2.2f", handle.getGoalHuro() * 100);
		gi("INPUT_GOAL_DAMA").value = sprintf("%2.2f", handle.getGoalDama() * 100);
		
		gi("INPUT_GOAL_RATE").value = sprintf("%2.2f", handle.getGoalRate() * 100);
		gi("INPUT_HOUJU_RATE").value = sprintf("%2.2f", handle.getHoujuRate() * 100);
		
		return PAIRON_OK;
	},
	setEventHandler : function() {
		var ret = PAIRON_OK;
		var fname = "setEventHandler()";
		var caller = this.name + "::" + fname;
		
		var parent = this;
	
		var inputStatusButton = gi("INPUT_STATUS_BUTTON");
		if (!inputStatusButton) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		inputStatusButton.onclick = function() {
			ret = parent.showStatus();
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		var inputGradeButton = gi("INPUT_GRADE_BUTTON");
		if (!inputGradeButton) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		inputGradeButton.onclick = function() {
			ret = parent.addGrade();
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		var inputGradeDeleteButton = gi("INPUT_GRADE_DELETE_BUTTON");
		if (!inputGradeDeleteButton) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		inputGradeDeleteButton.onclick = function() {
			ret = parent.clearGrade();
			if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		}
		
		return ret;
	},
	showStatus : function() {
		var ret = PAIRON_OK;
		var fname = "showStatus()";
		var caller = this.name + "::" + fname;
		
		var handle = this.status;
		
		var rankArray = new Array(4);
		rankArray[BASIC_RANK_1ST] = parseFloat(gi("INPUT_RANK_1").value) / 100;
		rankArray[BASIC_RANK_2ND] = parseFloat(gi("INPUT_RANK_2").value) / 100;
		rankArray[BASIC_RANK_3RD] = parseFloat(gi("INPUT_RANK_3").value) / 100;
		rankArray[BASIC_RANK_4TH] = parseFloat(gi("INPUT_RANK_4").value) / 100;
		ret = handle.setRank(rankArray);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		var reachRate = parseFloat(gi("INPUT_GOAL_REACH").value) / 100;
		var huroRate = parseFloat(gi("INPUT_GOAL_HURO").value) / 100;
		var damaRate = parseFloat(gi("INPUT_GOAL_DAMA").value) / 100;
		ret = handle.setGoal(reachRate, huroRate, damaRate);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = handle.setGoalRate(parseFloat(gi("INPUT_GOAL_RATE").value) / 100);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		ret = handle.setHoujuRate(parseFloat(gi("INPUT_HOUJU_RATE").value) / 100);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		handle.update();
		
		ret = handle.saveStatus();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	addGrade : function() {
		var ret = PAIRON_OK;
		var fname = "addGrade()";
		var caller = this.name + "::" + fname;
		
		var handle = this.status;
		
		var inputGradeText = gi("INPUT_GRADE_TEXT");
		if (!inputGradeText) return PAIRON_STATUS_ERROR_ELEMENT_NOT_FOUND;
		
		var rankValue = parseInt(inputGradeText.value);
		inputGradeText.value = "";
		if(isNaN(rankValue)) {
			console.log("invalid rank.");
			return PAIRON_INVALID_INPUT;
		}
		
		var rank;
		switch(rankValue) {
		case 1:
			rank = BASIC_RANK_1ST;
			break;
		case 2:
			rank = BASIC_RANK_2ND;
			break;
		case 3:
			rank = BASIC_RANK_3RD;
			break;
		case 4:
			rank = BASIC_RANK_4TH;
			break;
		default:
			console.log("invalid rank.");
			return PAIRON_INVALID_INPUT;
		}
		
		ret = handle.setGrade(rank);
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		handle.update();
		
		ret = handle.saveStatus();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	},
	clearGrade : function() {
		var ret = PAIRON_OK;
		var fname = "clearGrade()";
		var caller = this.name + "::" + fname;
	
		var handle = this.status;
	
		for(var i = 0; i < GRADE_HISTORY_NUM; i++) {
			handle.setGrade(BASIC_RANK_UNKNOWN);
		}
		
		handle.update();
		
		ret = handle.saveStatus();
		if(ERROR_IF_NOT_OK(caller, ret)) return ret;
		
		return ret;
	}
};