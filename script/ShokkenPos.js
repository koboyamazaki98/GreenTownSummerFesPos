/***************************************/
/* 食券ＰＯＳ                          */
/***************************************/
var	itemNum  = 0;
var	viewMode = 0;
var	salesMode = 0;
var	editMode = EDIT_MODE_NEW;
var frameWinCtrl = null;
var frameWinSet = null;
var frameWinEdit = null;
var frameWinList = null;
var frameWinTotal = null;

/* 画面ロード */
function shokkenPosLoad(){
	//alert("xxx");
}

/* 子ウィンドウの初期化 */
function initChild(aViewMode, aChildWindow){
	if(!isDbDataPathSet()){
		setDbDataPath(goodsInfo.dbDataPath);
	}
	
	switch(aViewMode){
	case VIEW_MODE_CTRL:
		frameWinCtrl = aChildWindow;
		break;
	case VIEW_MODE_SET:
		frameWinSet = aChildWindow;
		frameWinSet.initMode(goodsInfo, salesMode);
		break;
	case VIEW_MODE_EDIT:
		frameWinEdit = aChildWindow;
		frameWinEdit.initMode(goodsInfo, salesMode);
		break;
	case VIEW_MODE_LIST:
		frameWinList = aChildWindow;
		frameWinList.initMode(goodsInfo, salesMode);
		break;
	case VIEW_MODE_TOTAL:
		frameWinTotal = aChildWindow;
		frameWinTotal.initMode(goodsInfo, salesMode);
		break;
	}
}

/* 表示モードの設定 */
function setViewMode(aViewMode){
	var divPanel = null;
	var divPanelOther1 = null;
	var divPanelOther2 = null;
	var divPanelOther3 = null;

	//表示モードの設定
	if(viewMode != aViewMode){
		//子ウィンドウ表示
		switch(aViewMode){
		case VIEW_MODE_SET:
			divPanel = document.getElementById("setPanel");
			divPanelOther1 = document.getElementById("editPanel");
			divPanelOther2 = document.getElementById("listPanel");
			divPanelOther3 = document.getElementById("totalPanel");
			break;
		case VIEW_MODE_EDIT:
			divPanelOther1 = document.getElementById("setPanel");
			divPanel = document.getElementById("editPanel");
			divPanelOther2 = document.getElementById("listPanel");
			divPanelOther3 = document.getElementById("totalPanel");
			break;
		case VIEW_MODE_LIST:
			divPanelOther1 = document.getElementById("setPanel");
			divPanelOther2 = document.getElementById("editPanel");
			divPanel = document.getElementById("listPanel");
			divPanelOther3 = document.getElementById("totalPanel");
			break;
		case VIEW_MODE_TOTAL:
			divPanelOther1 = document.getElementById("setPanel");
			divPanelOther2 = document.getElementById("editPanel");
			divPanelOther3 = document.getElementById("listPanel");
			divPanel = document.getElementById("totalPanel");
			break;
		default:
			return;
		}
		divPanelOther1.style.display = "none";
		divPanelOther2.style.display = "none";
		divPanelOther3.style.display = "none";
		divPanel.style.display = "block";
		
		// 表示モードの変更時には、常に一覧タブには通知する。
		if(frameWinList != null){
			frameWinList.initMode(goodsInfo, salesMode);
		}
		
		// 値の設定
		viewMode = aViewMode;
	}
}

/* 販売モード、表示モードの設定 */
function setSystemMode(aSalesMode, aViewMode){
	//表示モードの設定
	setViewMode(aViewMode)
	
	//販売モードの設定
	//子ウィンドウ参照変数設定と、子ウィンドウ初期化
	switch(aViewMode){
	case VIEW_MODE_SET:
		if(frameWinSet != null){
			frameWinSet.initMode(goodsInfo, aSalesMode);
		}
		break;
	case VIEW_MODE_EDIT:
		if(frameWinEdit != null){
			frameWinEdit.initMode(goodsInfo, aSalesMode);
		}
		break;
	case VIEW_MODE_TOTAL:
		if(frameWinTotal != null){
			frameWinTotal.initMode(goodsInfo, aSalesMode);
		}
		break;
	}
	
	// 販売モードの変更時には、常に一覧タブには通知する。
	if(salesMode != aSalesMode){
		if(frameWinList != null){
			frameWinList.initMode(goodsInfo, aSalesMode);
		}
	}
	
	salesMode = aSalesMode;
}

/* 販売データの編集 */
function selectSalesDate(aSalesData){
	var editPanel = null;
	
	if(frameWinSet != null && aSalesData.jobCode == JOB_CODE_IN){
		setViewMode(VIEW_MODE_SET);
		
		// コントロール表示切替
		frameWinCtrl.selectTabCtrl(VIEW_MODE_SET);
		
		// 編集データ設定
		frameWinSet.initSet(EDIT_MODE_UPDATE, aSalesData);
	}else if(frameWinEdit != null && aSalesData.jobCode == JOB_CODE_SALES){
		setViewMode(VIEW_MODE_EDIT);
		
		// コントロール表示切替
		frameWinCtrl.selectTabCtrl(VIEW_MODE_EDIT);
		
		// 編集データ設定
		frameWinEdit.initEdit(EDIT_MODE_UPDATE, aSalesData);
	}else if(frameWinSet != null && aSalesData.jobCode == JOB_CODE_OUT){
		setViewMode(VIEW_MODE_SET);
		
		// コントロール表示切替
		frameWinCtrl.selectTabCtrl(VIEW_MODE_SET);
		
		// 編集データ設定
		frameWinSet.initSet(EDIT_MODE_UPDATE, aSalesData);
	}
}

/* 一覧ページ選択 */
function selectListPage(aSelect){
	if(frameWinCtrl != null){
		frameWinCtrl.selectTabCtrl(VIEW_MODE_LIST);
	}
	setViewMode(VIEW_MODE_LIST);
	if(frameWinList != null){
		frameWinList.selectListPage(aSelect)
	}
}

/****************************************/
/* SalseDataへのインタフェース          */
/****************************************/

/* 新規入力データの生成 */
function createSalesDataIF(aSalesYear, aSalesMode, aJobCode){
	return createSalesData(aSalesYear, aSalesMode, aJobCode);
}

/* 販売データの複製 */
function copySalesDataIF(aSalesData){
	return copySalesData(aSalesData);
}

/* レコード数の取得 */
function getSalesDataNumIF(aSalesYear, aSalesMode){
	return getSalesDataNum(aSalesYear, aSalesMode);
}

/* 販売データの取得 */
function loadSalesDataListIF(aSalesYear, aSalesMode, aRecordFrom, aRecordTo){
	return loadSalesDataList(aSalesYear, aSalesMode, aRecordFrom, aRecordTo);
}

/* 販売データの登録 */
function insertSalesDataIF(aSalesData){
	return insertSalesData(aSalesData);
}

/* 販売データの更新 */
function updateSalesDataIF(aSalesData){
	return updateSalesData(aSalesData);
}

/* 販売データの削除 */
function deleteSalesDataIF(aSalesData){
	return deleteSalesData(aSalesData);
}

/* 販売集計データの取得 */
function loadTotalDataListIF(aSalesYear){
	return loadTotalDataList(aSalesYear);
}

/* 現金残高データの取得 */
function loadTotalBalanceListIF(aSalesYear, aSalesMode){
	return loadTotalBalanceList(aSalesYear, aSalesMode);
}

/* CSVデータの取得 */
function getSalesDataCSVIF(aSalesYear, aSalesMode){
	return getSalesDataCSV(aSalesYear, aSalesMode);
}
