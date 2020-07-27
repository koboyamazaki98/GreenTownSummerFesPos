/***************************************/
/* 食券ＰＯＳ・制御部                  */
/***************************************/

var salesMode = SALES_MODE_ONDAY;
var viewMode = VIEW_MODE_EDIT;

/* 画面ロード */
function shokkenPosCtrlLoad(){
	//alert("xxx");
	
	// 親に通知
	parent.initChild(VIEW_MODE_CTRL, this);
	
	// タブコントロール設定
	tabCtrlClick(viewMode);
}

/* モード選択 */
function selectSalesModeChanged(){
	// 選択値を取得
	var selectSalesMode =  document.getElementById("selectSalesMode");
	salesMode = parseInt(selectSalesMode.value, 10);
	
	//親ウィンドウに通知
	parent.setSystemMode(salesMode, viewMode);
}

/* タブ表示切替 */
function selectTabCtrl(aViewMode){
	var tabCtrl = null;
	var tabCtrlOther1 = null;
	var tabCtrlOther2 = null;
	var tabCtrlOther3 = null;
	
	// タブコントロール表示制御
	switch(aViewMode){
	case VIEW_MODE_SET:
		tabCtrl = document.getElementById("tabCtrl01");
		tabCtrlOther1 = document.getElementById("tabCtrl02");
		tabCtrlOther2 = document.getElementById("tabCtrl03");
		tabCtrlOther3 = document.getElementById("tabCtrl04");
		break;
	case VIEW_MODE_EDIT:
		tabCtrlOther1 = document.getElementById("tabCtrl01");
		tabCtrl = document.getElementById("tabCtrl02");
		tabCtrlOther2 = document.getElementById("tabCtrl03");
		tabCtrlOther3 = document.getElementById("tabCtrl04");
		break;
	case VIEW_MODE_LIST:
		tabCtrlOther1 = document.getElementById("tabCtrl01");
		tabCtrlOther2 = document.getElementById("tabCtrl02");
		tabCtrl = document.getElementById("tabCtrl03");
		tabCtrlOther3 = document.getElementById("tabCtrl04");
		break;
	case VIEW_MODE_TOTAL:
		tabCtrlOther1 = document.getElementById("tabCtrl01");
		tabCtrlOther2 = document.getElementById("tabCtrl02");
		tabCtrlOther3 = document.getElementById("tabCtrl03");
		tabCtrl = document.getElementById("tabCtrl04");
		break;
	default:
		return;
	}
	tabCtrl.style.color = "black";
	tabCtrlOther1.style.color = "#F8F8F8";
	tabCtrlOther2.style.color = "#F8F8F8";
	tabCtrlOther3.style.color = "#F8F8F8";
	tabCtrl.style.backgroundImage = 'url("./image/TabCtrlOn.png")';
	tabCtrlOther1.style.backgroundImage = 'url("./image/TabCtrlOff.png")';
	tabCtrlOther2.style.backgroundImage = 'url("./image/TabCtrlOff.png")';
	tabCtrlOther3.style.backgroundImage = 'url("./image/TabCtrlOff.png")';
	
	//設定モード保存
	viewMode = aViewMode;
}

/* タブクリック */
function tabCtrlClick(aViewMode){
	//タブ表示切替
	selectTabCtrl(aViewMode);
	
	//親ウィンドウに通知
	parent.setSystemMode(salesMode, aViewMode);
}

