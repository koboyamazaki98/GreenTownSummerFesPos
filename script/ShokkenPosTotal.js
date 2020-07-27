/***************************************/
/* 食券ＰＯＳ・集計部                  */
/***************************************/
var itemNum = 0;
var salesYear = 0;
var salesMode = 0;
var pageNum = 0;
var goodsNames = null;
var totalDataList = null;
var totalBalance = null;
var totalDataTable = null;
var totalBalanceTable = null;

/* フォーム初期処理 */
function shokkenPosTotalLoad(){
	//alert("xxx");
	parent.initChild(VIEW_MODE_TOTAL, this);
}

/* モード初期表示 */
function initMode(aGoodsInfo, aSalesMode){
	//alert("zzz");
	if(aSalesMode < SALES_MODE_PRESALE || SALES_MODE_ONDAY < aSalesMode){
		return;
	}
	totalDataTable = document.getElementById("totalDataTable");
	totalBalanceTable = document.getElementById("totalBalanceTable");
	salesYear = aGoodsInfo.goodYear;
	salesMode = aSalesMode;
	
	/* 商品数設定 */
	itemNum = ITEM_NUM_MAX;
	if(aGoodsInfo.goodNum < itemNum){
		itemNum = aGoodsInfo.goodNum;
	}
	
	/* 商品名設定 */
	buildGoodsNames(aGoodsInfo);
	
	/* 販売集計ヘッダー設定 */
	buildTotalDataTableHeader(aGoodsInfo, aSalesMode);
	
	/* 販売集計 */
	buildTotalDataTable();
	
	/* 現金残高 */
	buildTotalBalanceTable();
}

/* 商品名設定 */
function buildGoodsNames(aGoodsInfo){
	goodsNames = [];
	for(i = 0; i < itemNum; i++){
		goodsNames.push(aGoodsInfo.goodNames[i]);
	}
}

/* 販売集計ヘッダー設定 */
function buildTotalDataTableHeader(aGoodsInfo, aSalesMode){
	var totalDataThId = "";
	var totalDataTh = null;
	var i = 0;
	var goodPrises = null;
	
	/* ヘッダー */
	goodPrises = aGoodsInfo.goodPrises[aSalesMode - 1];
	for(i = 0; i < itemNum; i++){
		totalDataThId = "totalDataTh" + ("" + (100 + i)).slice(-2);
		totalDataTh = document.getElementById(totalDataThId);
		totalDataTh.innerHTML = aGoodsInfo.goodNames[i];
	}
}

/* 販売集計設定 */
function buildTotalDataTable(){
	// 表示用データ取得
	loadTotalDataList(salesYear);
	
	// 一覧表示
	viewTotalDataTable();
}

/* 販売データ取得 */
function loadTotalDataList(aSalesYear){
	// ＤＢ読み込み
	totalDataList = parent.loadTotalDataListIF(aSalesYear);
}

/* 販売集計表示 */
function viewTotalDataTable(){
	var i = 0;
	var j = 0;
	var row = null;
	var cell = null;
	var totalData = null;
	var mode = 0;
	var smode = "";
	var cellId = "";
	
	/* 既存表示内容はクリア */
	for(i = 1; i <= 3; i++){
		row = totalDataTable.rows[i];
		for(j = 1; j <=9; j++){	// 金額までなので、1～9
			cell = row.cells[j];
			cell.innerHTML = "";
		}
	}
	
	/* データ表示 */
	for(i = 0; i < totalDataList.length; i++){
		// 表示データ
		totalData = totalDataList[i];
		
		// 販売モード
		mode = totalData.salesMode;
		switch(mode){
		case SALES_MODE_PRESALE:
			smode = "01";
			break;
		case SALES_MODE_INVITE:
			smode = "02";
			break;
		case SALES_MODE_ONDAY:
			smode = "03";
			break;
		default:
			smode = null;
		}
		
		if(smode != null){
			// 販売個数
			for(j = 0; j < 8; j++){
				cellId = "totalItem" + smode + ("" + (101 + j)).slice(-2);
				cell = document.getElementById(cellId);
				cell.innerHTML = "" + totalData.items[j];
			}
			
			// 販売金額
			cellId = "totalPrice" + smode;
			cell = document.getElementById(cellId);
			cell.innerHTML = "￥" + totalData.totalPrice;
		}
	}
}

/* 現金残高 */
function buildTotalBalanceTable(){
	// 表示用データ取得
	loadTotalBalanceList(salesYear, salesMode);
	
	// 一覧表示
	viewTotalBalanceTable();
}

/* 表示用データ取得 */
function loadTotalBalanceList(aSalesYear, aSalesMode){
	// ＤＢ読み込み
	totalBalance = parent.loadTotalBalanceListIF(aSalesYear, aSalesMode);
}

/* 一覧表示 */
function viewTotalBalanceTable(){
	var cell = null;
	
	// 釣銭受け入れ
	cell = document.getElementById("totalBalanceIn");
	cell.innerHTML = "￥" + totalBalance.balanceIn;
	
	// 売り上げ
	cell = document.getElementById("totalBalanceSales");
	cell.innerHTML = "￥" + totalBalance.balanceSales;
	
	// 釣銭預け出し
	cell = document.getElementById("totalBalanceOut");
	cell.innerHTML = "￥" + totalBalance.balanceOut;
	
	// 現金残高
	cell = document.getElementById("totalBalanceSum");
	cell.innerHTML = "￥" + totalBalance.balanceSum;
}

// CSVファイルダウンロード
function downloadCSV(){
	var fileName = "salesData.csv";
	var fileData = "";
	var i1 = 0;
	var i2 = 0;
	var j = 0;
	var header = "";
	var body = "";
	var wmm = 0;
	var wdd = 0;
	var whur = 0;
	var wmin = 0;
	var wsec = 0;
	var wnum = 0;
	var date0 = 0;
	var time0 = 0;
	var sdate = "";
	var stime = "";
	var wSalesMode = SALES_MODE_INVALID;
	var salesData = null;
	var csvSalesDataList = null;
	var totalData = null;
	var csvTotalDataList = null;
	var partialBalancePrice = 0;
	var totalBalancePrice = 0;
	var totalSalesPrice = 0;
	var totalItems = [];
	
	// データヘッダ
	header = "年,モード,販売日付,販売時刻,業務コード,";
	for(j = 0; j < itemNum; j++){
		header = header + goodsNames[j] + ",";
	}
	for( ;j<ITEM_NUM_MAX; j++){
		header = header + ",";
	}
	header = header + "売上,設定";
	
	// 総計バッファ初期化
	wnum = 0;
	for(j=0; j<ITEM_NUM_MAX; j++){
		totalItems.push(wnum);
	}
	
	// ＤＢ読み込み
	// データ取得（明細）
	csvSalesDataList = parent.loadSalesDataListIF(salesYear, SALES_MODE_ALL, 0, 9999);
	// データ取得（集計）
	csvTotalDataList = parent.loadTotalDataListIF(salesYear);

	if(csvSalesDataList != null && csvTotalDataList != null){
		// CSV生成
		for(i1 = 0; i1 < csvSalesDataList.length; i1++){
			// 販売データ
			salesData = csvSalesDataList[i1];
			
			// 販売モード毎に集計データ出力、ヘッダー出力
			if(wSalesMode != salesData.salesMode){
				// 集計データ出力
				totalData = null;
				if(wSalesMode != SALES_MODE_INVALID){
					for(i2 = 0; i2 < csvTotalDataList.length; i2++){
						if(csvTotalDataList[i2].salesMode == wSalesMode){
							totalData = csvTotalDataList[i2];
						}
					}
				}
				if(totalData != null){
					// 行編集
					body = "";
					body = totalData.salesYear + ",";
					switch(wSalesMode){
					case SALES_MODE_PRESALE:
					case SALES_MODE_INVITE:
					case SALES_MODE_ONDAY:
						body = body + wSalesMode + ":" + SALES_MODE_NAMES[wSalesMode - 1] + ",";
						break;
					default:
						body = body + ",";
					}
					body = body + "小計,,,";
					
					// 販売個数
					for(j = 0; j < itemNum; j++){
						body = body + totalData.items[j] + ",";
					}
					for( ;j<ITEM_NUM_MAX; j++){
						body = body + ",";
					}
					
					// 金額
					body = body + totalData.totalPrice + "," + partialBalancePrice;
					
					// CSV ファイルデータ
					fileData = fileData + body + "\r\n\r\n";
					
					// 集計
					for(j = 0; j < itemNum; j++){
						totalItems[j] = totalItems[j] + totalData.items[j];
					}
					totalSalesPrice = totalSalesPrice + totalData.totalPrice;
					totalBalancePrice = totalBalancePrice + partialBalancePrice;
				}
				
				// 販売モード切替、小計クリア
				wSalesMode = salesData.salesMode;
				partialBalancePrice = 0;
				
				// 次のヘッダー出力
				fileData = fileData + header + "\r\n";
			}
			
			// 行編集
			body = "";
			body = salesData.salesYear + ",";
			switch(wSalesMode){
			case SALES_MODE_PRESALE:
			case SALES_MODE_INVITE:
			case SALES_MODE_ONDAY:
				body = body + wSalesMode + ":" + SALES_MODE_NAMES[wSalesMode - 1] + ",";
				break;
			default:
				body = body + ",";
			}
			
			// 日付
			date0 = salesData.salesDate;
			wmm = parseInt(date0 / 100);
			wdd = parseInt(date0 % 100);
			sdate = ("" + salesYear) + "/" + ("" + (100 + wmm)).slice(-2) + "/" + ("" + (100 + wdd)).slice(-2);
			body = body + sdate + ",";
			
			// 時刻
			time0 = salesData.salesTime;
			whur = parseInt(time0 / 10000);
			wmin = parseInt((time0 % 10000) / 100);
			wsec = parseInt(time0 % 100);
			stime = ("" + (100 + whur)).slice(-2) + ":" + ("" + (100 + wmin)).slice(-2) + ":" + ("" + (100 + wsec)).slice(-2);
			body = body + stime + ",";
			
			// 業務コード
			switch(salesData.jobCode){
			case JOB_CODE_IN:
			case JOB_CODE_SALES:
			case JOB_CODE_OUT:
				body = body + salesData.jobCode + ":" + JOB_CODE_NAMES[salesData.jobCode - 1] + ",";
				break;
			default:
				body = body + ",";
			}
			
			switch(salesData.jobCode){
			case JOB_CODE_IN:
				// 釣銭受入れ
				for(j = 0; j<ITEM_NUM_MAX; j++){
					body = body + ",";
				}
				body = body + "," + salesData.priceSum;
				partialBalancePrice = partialBalancePrice + salesData.priceSum;
				break;
			case JOB_CODE_SALES:
				// 販売個数
				for(j = 0; j < itemNum; j++){
					body = body + salesData.items[j] + ",";
				}
				for( ;j<ITEM_NUM_MAX; j++){
					body = body + ",";
				}
				
				// 金額
				body = body + salesData.priceSum + ",";
				break;
			case JOB_CODE_OUT:
				// 釣銭預け出し
				for(j = 0; j<ITEM_NUM_MAX; j++){
					body = body + ",";
				}
				body = body + ",-" + salesData.priceSum;
				partialBalancePrice = partialBalancePrice - salesData.priceSum;
				break;
			}
			
			// CSV ファイルデータ
			fileData = fileData + body + "\r\n";
		}
		
		// 集計データ出力
		if(wSalesMode != SALES_MODE_INVALID){
			totalData = null;
			for(i2 = 0; i2 < csvTotalDataList.length; i2++){
				if(csvTotalDataList[i2].salesMode == wSalesMode){
					totalData = csvTotalDataList[i2];
				}
			}
			if(totalData != null){
				// 行編集
				body = "";
				body = totalData.salesYear + ",";
				switch(wSalesMode){
				case SALES_MODE_PRESALE:
				case SALES_MODE_INVITE:
				case SALES_MODE_ONDAY:
					body = body + wSalesMode + ":" + SALES_MODE_NAMES[wSalesMode - 1] + ",";
					break;
				default:
					body = body + ",";
				}
				body = body + "小計,,,";
				
				// 販売個数
				for(j = 0; j < itemNum; j++){
					body = body + totalData.items[j] + ",";
				}
				for( ;j<ITEM_NUM_MAX; j++){
					body = body + ",";
				}
				
				// 金額
				body = body + totalData.totalPrice + "," + partialBalancePrice;
				
				// CSV ファイルデータ
				fileData = fileData + body + "\r\n\r\n";
				
				// 集計
				for(j = 0; j < itemNum; j++){
					totalItems[j] += totalData.items[j];
				}
				totalSalesPrice = totalSalesPrice + totalData.totalPrice;
				totalBalancePrice = totalBalancePrice + partialBalancePrice;
			}
		}
		
		csvTotalDataList = null;
		csvSalesDataList = null;
	}
	
	// 総計・ヘッダー出力
	fileData = fileData + header + "\r\n";
	
	// 総計
	body = salesYear + ",総計,,,,";
	// 販売個数
	for(j = 0; j < itemNum; j++){
		body = body + totalItems[j] + ",";
	}
	for( ;j<ITEM_NUM_MAX; j++){
		body = body + ",";
	}
	body = body + totalSalesPrice + "," + totalBalancePrice;
	fileData = fileData + body + "\r\n";
	
	// ダウンロードデータの生成
	var blob = new Blob([fileData], { "type": "text/plain" });
	
	// ダウンロード（IEのみをサポート）
	if (window.navigator.msSaveBlob) { 
		window.navigator.msSaveBlob(blob, fileName); 
	}
	fileData = null;
}
