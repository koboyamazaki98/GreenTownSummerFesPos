/***************************************/
/* 食券ＰＯＳ・一覧部                  */
/***************************************/
var itemNum = 0;
var salesYear = 0;
var salesMode = 0;
var pageNo = 0;
var pageNum = 0;
var salesDataNum = 0;
var salesDataList = null;
var listTable = null;

/* フォーム初期処理 */
function shokkenPosListLoad(){
	//alert("xxx");
	parent.initChild(VIEW_MODE_LIST, this);
}

/* モード初期表示 */
function initMode(aGoodsInfo, aSalesMode){
	//alert("zzz");
	if(aSalesMode < SALES_MODE_PRESALE || SALES_MODE_ONDAY < aSalesMode){
		return;
	}
	listTable = document.getElementById("listTable");
	salesYear = aGoodsInfo.goodYear;
	salesMode = aSalesMode;
	
	itemNum = ITEM_NUM_MAX;
	if(aGoodsInfo.goodNum < itemNum){
		itemNum = aGoodsInfo.goodNum;
	}
	
	/* ヘッダー設定 */
	buildLineHeader(aGoodsInfo, aSalesMode);
	
	/* 一覧表示 */
	selectListPage(PAGE_CONTROL_FIRST);
}

/* 一覧ヘッダー設定 */
function buildLineHeader(aGoodsInfo, aSalesMode){
	var listThId = "";
	var listTh = null;
	var i = 0;
	var goodPrises = null;
	
	/* ヘッダー */
	goodPrises = aGoodsInfo.goodPrises[aSalesMode - 1];
	for(i = 0; i < itemNum; i++){
		listThId = "listTh" + ("" + (100 + i)).slice(-2);
		listTh = document.getElementById(listThId);
		listTh.innerHTML = aGoodsInfo.goodNames[i] + "<br>" + "￥" + goodPrises.prises[i];
	}
}

/* 一覧表示 */
function selectListPage(aSelect){
	/* ページ設定 */
	selectPageControl(salesYear, salesMode, aSelect);
	
	/* 表示用データ取得 */
	loadSalesDataListOnePage(salesYear, salesMode, pageNo, pageNum);
	
	/* 一覧表示 */
	viewList();
}

/* ページ設定 */
function selectPageControl(aSalesYear, aSalesMode, aSelect){
	var tdPageNum = null;
	
	// 件数、ページ数の取得
	salesDataNum = parent.getSalesDataNumIF(aSalesYear, aSalesMode);
	pageNum = parseInt((salesDataNum + PAGE_SIZE - 1) / PAGE_SIZE);
	
	// ページ設定
	switch( aSelect ){
	case PAGE_CONTROL_FIRST :
		pageNo = 1;
		break;
	case PAGE_CONTROL_PREV :
		if(1 < pageNo){
			--pageNo;
		}
		break;
	case PAGE_CONTROL_NEXT :
		if(pageNo < pageNum){
			++pageNo;
		}
		break;
	case PAGE_CONTROL_LAST :
		pageNo = pageNum;
		break;
	default:
		if(pageNo < 1){
			pageNo = 1;
		}else if(pageNum < pageNo){
			pageNo = pageNum;
		}
	}
	
	// ページコントロール表示
	tdPageNum = document.getElementById("pageNum");
	tdPageNum.innerText = pageNo + " / " + pageNum;
}

/* 販売データ取得 */
function loadSalesDataListOnePage(aSalesYear, aSalesMode, aPageNo, aPageNum){
	var recordFrom = 0;
	var recordTo = 0;

	// 読み込み範囲（逆順に表示する）
	recordTo = salesDataNum - (PAGE_SIZE * (aPageNo - 1));
	recordFrom = recordTo - PAGE_SIZE + 1;
	if(recordFrom <= 0){
		recordFrom = 1;
	}
	
	// ＤＢ読み込み
	salesDataList = parent.loadSalesDataListIF(aSalesYear, aSalesMode, recordFrom, recordTo);
}

/* 一覧表示 */
function viewList(aSalesMode){
	var i = 0;
	var j = 0;
	var rowIdx = 0;
	var salesData = null;
	var row = null;
	var cell = null;
	var date0 = -1;
	var date1 = 0;
	var wmonth = 0;
	var wday = 0;
	var sdate = ""
	var hh = 0;
	var mm = 0;
	var hhmm = "";
	
	/* 既存行は削除 */
	while(1 < listTable.rows.length){
		rowIdx = listTable.rows.length - 1;
		listTable.deleteRow(rowIdx);
	}
	
	// データなし
	if(salesDataList == null){
		return;
	}
	
	/* 新規行を生成 */
	for(i = 0; i < salesDataList.length; i++){
		/* 表示データ */
		salesData = salesDataList[i];
		
		/* 業務日付 */
		date1 = salesData.salesDate;
		if(date0 == -1){
			/* 日付の保存 */
			date0 = date1;
		}else if(date1 != date0){
			/* 日付文字列 */
			wmonth = parseInt(date0 / 100);
			wday = parseInt(date0 % 100);
			sdate = ("" + salesYear) + "/" + ("" + (100 + wmonth)).slice(-2) + "/" + ("" + (100 + wday)).slice(-2);
			
			/* 行、列追加 */
			row = listTable.insertRow(1);	// 先頭に挿入していく
			cell = row.insertCell(-1);
			
			/* 表示 */
			cell.colSpan = ITEM_NUM_MAX + 2;
			cell.style.textAlign = "left";
			cell.innerHTML = sdate;
			
			/* 日付の保存 */
			date0 = date1;
		}
		
		/* 行追加 */
		row = listTable.insertRow(1);	// 先頭に挿入していく
		
		/* 見出し列（分:秒） */
		cell = row.insertCell(-1);
		hh = parseInt(salesData.salesTime / 10000);
		mm = parseInt((salesData.salesTime % 10000) / 100);
		hhmm = ("" + (100 + hh)).slice(-2) + ":" + ("" + (100 + mm)).slice(-2);
		cell.innerHTML = 
			"<div class=\"selectDataButton\" onclick=\"selectDataButtonClick(" + i + ");\">" + 
			hhmm + 
			"</div>";
		
		if(salesData.jobCode == 1){
			cell = row.insertCell(-1);
			cell.colSpan = ITEM_NUM_MAX;
			cell.style.textAlign = "left";
			cell.innerHTML = "釣銭受入";
		}else if(salesData.jobCode == 2){
			/* 販売数 */
			for(j = 0; j < ITEM_NUM_MAX; j++){
				cell = row.insertCell(-1);
				if(j < itemNum){
					cell.style.textAlign = "right";
					cell.innerHTML = "" + salesData.items[j];
				}else{
					cell.innerHTML = " ";
				}
			}
		}else if(salesData.jobCode == 3){
			cell = row.insertCell(-1);
			cell.colSpan = ITEM_NUM_MAX;
			cell.style.textAlign = "left";
			cell.innerHTML = "釣銭預出";
		}else{
			cell = row.insertCell(-1);
			cell.colSpan = ITEM_NUM_MAX;
			cell.style.textAlign = "left";
			cell.innerHTML = " ";
		}
		
		/* 金額 */
		cell = row.insertCell(-1);
		cell.style.textAlign = "right";
		cell.innerHTML = "￥" + salesData.priceSum;
	}
	
	/* 最後の日付表示 */
	if(date0 != -1){
		/* 日付文字列 */
		wmonth = parseInt(date0 / 100);
		wday = parseInt(date0 % 100);
		sdate = ("" + salesYear) + "/" + ("" + (100 + wmonth)).slice(-2) + "/" + ("" + (100 + wday)).slice(-2);
		
		/* 行、列追加 */
		row = listTable.insertRow(1);
		cell = row.insertCell(-1);
		
		/* 表示 */
		cell.colSpan = ITEM_NUM_MAX + 2;
		cell.style.textAlign = "left";
		cell.innerHTML = sdate;
	}
}

/* 販売データ選択 */
function selectDataButtonClick(aIdx){
	var selectData = null;
	
	// 選択行の特定
	if(0 <= aIdx && aIdx < salesDataList.length){
		selectData = salesDataList[aIdx];
		
		// 選択行の編集設定
		parent.selectSalesDate(selectData);
	}
}
