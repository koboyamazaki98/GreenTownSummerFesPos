/***************************************/
/* 食券ＰＯＳ・販売データ              */
/***************************************/

var connectionSalesData = null;
var dbSalesData = null;

/* 新規入力データの生成 */
function createSalesData(aSalesYear, aSalesMode, aJobCode){
	// オブジェクトの生成
	var result = new Object();
	
	// 年
	result.salesYear = aSalesYear;
	
	// 販売モード
	result.salesMode = aSalesMode;
	
	// 販売日
	result.salesDate = 0;
	
	// 販売時刻
	result.salesTime = 0;
	
	// 業務コード
	result.jobCode = aJobCode;
	
	// 販売数
	var i = 0;
	result.items = [];
	for(i = 0; i < ITEM_NUM_MAX; i++){
		result.items.push(0);
	}
	
	// 販売金額
	result.priceSum = 0;
	
	// 更新日時
	result.updateYear = 0;
	result.updateDate = 0;
	result.updateTime = 0;
	
	return result;
}

/* 販売データの複製 */
function copySalesData(aSalesData){
	var i = 0;
	var result = new Object();
	
	// 販売年
	result.salesYear = aSalesData.salesYear;
	
	// 販売モード
	result.salesMode = aSalesData.salesMode;
	
	// 販売日
	result.salesDate = aSalesData.salesDate;
	
	// 販売時刻
	result.salesTime = aSalesData.salesTime;
	
	// 販売数
	result.items = [];
	for(i = 0; i < ITEM_NUM_MAX; i++){
		result.items.push(aSalesData.items[i]);
	}
	
	// 販売金額
	result.priceSum = aSalesData.priceSum;
	
	// 更新日時
	result.updateYear = aSalesData.salesYear;
	result.updateDate = aSalesData.salesDate;
	result.updateTime = aSalesData.salesTime;
	
	return result;
}

/* データベースに接続 */
function connectSalesData(){
	connectionSalesData = new ActiveXObject("DAO.DBEngine.36");
	dbSalesData = connectionSalesData.OpenDatabase("D:\\13_Project\\201808_グリーンタウン_夏まつり\\食券POS\\data\\ShokkenPos.mdb");
}

/* レコード数の取得 */
function getSalesDataNum(aSalesYear, aSalesMode){
	var	result = 0;
	var records = null;
	
	// ＤＢ接続
	if(dbSalesData == null){
		connectSalesData();
	}
	
	// 読み込み
	records = dbSalesData.OpenRecordset("select DATA_COUNT from Q_SALES_DATA_COUNT2 where SALES_YEAR=" + aSalesYear + " and SALES_MODE=" + aSalesMode + ";");
	if(!records.EOF){
		//result = records("DATA_COUNT").Value;
		result = records(0).Value;
	}
	
	// 切断
	records.Close();
	records = null;
	
	// 戻り値
	return result;
}

/* 販売データの取得 */
function loadSalesDataList(aSalesYear, aSalesMode, aRecordFrom, aRecordTo){
	var	resultList = [];
	var salesData = null;
	var records = null;
	var wnum = 0;
	
	// ＤＢ接続
	if(dbSalesData == null){
		connectSalesData();
	}
	
	// 読み込み
	var sql = "select * from Q_SALES_DATA_LIST2 where "
			+ "SALES_YEAR=" + aSalesYear
			+ " and SALES_MODE=" + aSalesMode 
			+ " and ROWNO>=" + aRecordFrom
			+ " and ROWNO<=" + aRecordTo
			+ ";";
	records = dbSalesData.OpenRecordset(sql);
	while(!records.EOF){
		salesData = new Object();
		
		salesData.salesYear = records("SALES_YEAR").Value;
		salesData.salesMode = records("SALES_MODE").Value;
		salesData.salesDate = records("SALES_DATE").Value;
		salesData.salesTime = records("SALES_TIME").Value;
		salesData.jobCode = records("JOB_CODE").Value;
		salesData.items = [];
		wnum = records("ITEM_NUM01").Value;
		salesData.items.push(wnum);
		wnum = records("ITEM_NUM02").Value;
		salesData.items.push(wnum);
		wnum = records("ITEM_NUM03").Value;
		salesData.items.push(wnum);
		wnum = records("ITEM_NUM04").Value;
		salesData.items.push(wnum);
		wnum = records("ITEM_NUM05").Value;
		salesData.items.push(wnum);
		wnum = records("ITEM_NUM06").Value;
		salesData.items.push(wnum);
		wnum = records("ITEM_NUM07").Value;
		salesData.items.push(wnum);
		wnum = records("ITEM_NUM08").Value;
		salesData.items.push(wnum);
		salesData.priceSum = records("PRISE_SUM").Value;
		salesData.updateYear = records("UPDATE_YEAR").Value;
		salesData.updateDate = records("UPDATE_DATE").Value;
		salesData.updateTime = records("UPDATE_TIME").Value;
		
		resultList.push(salesData);

		records.MoveNext();
	}
	
	// 切断
	records.Close();
	records = null;
	
	// 戻り値
	return resultList;
}

/* 販売データの登録 */
function insertSalesData(aSalesData){
	var sql = "";
	var resultCode = "01";
	var swork = "";
	var records = null;
	
	// ＤＢ接続
	if(dbSalesData == null){
		connectSalesData();
	}
	
	// データ登録
	sql = "select insertSalesData(" + 
			aSalesData.salesYear + ", " + 
			aSalesData.salesMode + ", " + 
			aSalesData.jobCode + ", " + 
			aSalesData.items[0] + ", " + 
			aSalesData.items[1] + ", " + 
			aSalesData.items[2] + ", " + 
			aSalesData.items[3] + ", " + 
			aSalesData.items[4] + ", " + 
			aSalesData.items[5] + ", " + 
			aSalesData.items[6] + ", " + 
			aSalesData.items[7] + ", " + 
			aSalesData.priceSum + ") AS RESULT;";
	records = dbSalesData.OpenRecordset(sql);
	if(!records.EOF){
		resultCode = records.Fields("RESULT");
	}
	records.Close
	records = null;
	
	if("01".equals(resultCode)){
		// エラー
		return null;
	}else if(resultCode.length() != 30){
		return null;
	}
	
	// salesDate, salesTime, updateYear, updateDate, updateTime を反映
	swork = resultCode.substring(6, 10);
	sSalesData.salesDate = parseInt(swork);
	
	swork = resultCode.substring(10, 16);
	sSalesData.salesTime = parseInt(swork);
	
	swork = resultCode.substring(16, 20);
	sSalesData.updateYear = parseInt(swork);
	
	swork = resultCode.substring(20, 24);
	sSalesData.updateDate = parseInt(swork);
	
	swork = resultCode.substring(24, 30);
	sSalesData.updateTime = parseInt(swork);
	
	return aSalesData;
}

/* 販売データの更新 */
function updateSalesData(aSalesData){
	var resultSalesData = null;
	var sql = "";
	var resultCode = "02";
	var records = null;
	
	// ＤＢ接続
	if(dbSalesData == null){
		connectSalesData();
	}
	
	// データ更新
	sql = "select updateSalesData(" + 
			aSalesData.salesYear + ", " + 
			aSalesData.salesMode + ", " + 
			aSalesData.salesDate + ", " + 
			aSalesData.salesTime + ", " + 
			aSalesData.jobCode + ", " + 
			aSalesData.items[0] + ", " + 
			aSalesData.items[1] + ", " + 
			aSalesData.items[2] + ", " + 
			aSalesData.items[3] + ", " + 
			aSalesData.items[4] + ", " + 
			aSalesData.items[5] + ", " + 
			aSalesData.items[6] + ", " + 
			aSalesData.items[7] + ", " + 
			aSalesData.priceSum + ", " + 
			aSalesData.updateYear + ", " + 
			aSalesData.updateDate + ", " + 
			aSalesData.updateTime + ") AS RESULT;";
	records = dbSalesData.OpenRecordset(sql);
	if(!records.EOF){
		resultCode = records.Fields("RESULT");
	}
	records.Close
	records = null;
	
	if("02".equals(resultCode)){
		// エラー
		return null;
	}else if(resultCode.length() != 30){
		return null;
	}
	
	// updateYear, updateDate, updateTime を反映
	swork = resultCode.substring(16, 20);
	sSalesData.updateYear = parseInt(swork);
	
	swork = resultCode.substring(20, 24);
	sSalesData.updateDate = parseInt(swork);
	
	swork = resultCode.substring(24, 30);
	sSalesData.updateTime = parseInt(swork);
	
	return aSalesData;
}

/* 販売データの削除 */
function deleteSalesData(aSalesData){
	var resultSalesData = null;
	var sql = "";
	var resultCode = "02";
	var records = null;
	
	// ＤＢ接続
	if(dbSalesData == null){
		connectSalesData();
	}
	
	// データ削除
	sql = "select deleteSalesData(" + 
			aSalesData.salesYear + ", "
			aSalesData.salesMode + ", "
			aSalesData.salesDate + ", "
			aSalesData.salesTime + ", "
			aSalesData.updateYear + ", "
			aSalesData.updateDate + ", "
			aSalesData.updateTime + ") AS RESULT;";
	records = dbSalesData.OpenRecordset(sql);
	if(!records.EOF){
		resultCode = records.Fields("RESULT");
	}
	records.Close
	records = null;
	
	if("02".equals(resultCode)){
		// エラー
		return null;
	}else if(resultCode.length() != 30){
		return null;
	}
	
	// updateYear, updateDate, updateTime を反映
	swork = resultCode.substring(16, 20);
	sSalesData.updateYear = parseInt(swork);
	
	swork = resultCode.substring(20, 24);
	sSalesData.updateDate = parseInt(swork);
	
	swork = resultCode.substring(24, 30);
	sSalesData.updateTime = parseInt(swork);
	
	return aSalesData;
}
