/***************************************/
/* 食券ＰＯＳ・販売データ              */
/***************************************/

/* DBデータパス */
var flgDbDataPathSet = false;
var dbDataPath = "";

var connectionSalesData = null;
var dbSalesData = null;
var RECORD_COLUMN_NAMES = "SALES_YEAR, SALES_MODE, SALES_DATE, SALES_TIME, JOB_CODE, ITEM_NUM01, ITEM_NUM02, ITEM_NUM03, ITEM_NUM04, ITEM_NUM05, ITEM_NUM06, ITEM_NUM07, ITEM_NUM08, PRICE_SUM, DEPOSIT_SUM, UPDATE_YEAR, UPDATE_DATE, UPDATE_TIME";

/* DBデータパス設定の有無 */
function isDbDataPathSet(){
	return flgDbDataPathSet;
}

/* DBデータパス設定 */
function setDbDataPath(aPath){
	dbDataPath = aPath;
	flgDbDataPathSet = true;
}

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
	
	// 業務コード
	result.jobCode = aSalesData.jobCode;
	
	// 販売数
	result.items = [];
	for(i = 0; i < ITEM_NUM_MAX; i++){
		result.items.push(aSalesData.items[i]);
	}
	
	// 販売金額
	result.priceSum = aSalesData.priceSum;
	
	// 更新日時
	result.updateYear = aSalesData.updateYear;
	result.updateDate = aSalesData.updateDate;
	result.updateTime = aSalesData.updateTime;
	
	return result;
}

/* データベースに接続 */
function connectSalesData(){
	connectionSalesData = new ActiveXObject("DAO.DBEngine.36");
	dbSalesData = connectionSalesData.OpenDatabase(dbDataPath);
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
	
	// 読み込みSQL
	var sql = "select * from Q_SALES_DATA_LIST2 where "
			+ "SALES_YEAR=" + aSalesYear;
	switch(aSalesMode){
	case SALES_MODE_ALL:
		break;
	case SALES_MODE_PRESALE:
	case SALES_MODE_INVITE:
	case SALES_MODE_ONDAY:
		sql = sql + " and SALES_MODE=" + aSalesMode;
		break;
	default:
		return null;
	}
	sql = sql + " and ROWNO>=" + aRecordFrom
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
		if(salesData.jobCode == JOB_CODE_OUT){
			//釣銭預け出し
			salesData.priceSum = records("DEPOSIT_SUM").Value;
		}else{
			//販売、釣銭預かり入れ
			salesData.priceSum = records("PRICE_SUM").Value;
		}
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
	var sql1 = "";
	var sql2 = "";
	var sqlTemp = "";
	var resultCode = "01";
	var swork = "";
	var nowDate = null;
	var keyDate = 0;
	var keyTime = 0;
	var keyHour = 0;
	var updateYear = 0;
	var records = null;
	
	//日付時刻取得
	nowDate = new Date();
	updateYear = nowDate.getFullYear();
	keyDate = 100 * (nowDate.getMonth() + 1) + nowDate.getDate();
	//keyHour = nowDate.getHours();
	keyTime = 10000 * nowDate.getHours() + 100 * nowDate.getMinutes() + nowDate.getSeconds();
	
	try{
		// ＤＢ接続
		if(dbSalesData == null){
			connectSalesData();
		}
		
		// データ確認
		sql1 = "select " + RECORD_COLUMN_NAMES + " from T_SALES_DATA where " + 
				"SALES_YEAR=" + aSalesData.salesYear + " and " +
				"SALES_MODE=" + aSalesData.salesMode + " and " +
				"SALES_DATE=" + keyDate + " and " +
				"SALES_TIME=" + keyTime + ";"
		records = dbSalesData.OpenRecordset(sql1);
		if(!records.EOF){
			// 重複データあり
			records.Close();
			records = null;
			return null;
		}
		records.Close();
		records = null;
		
		// データ登録
		if(aSalesData.jobCode == JOB_CODE_OUT){
			//釣銭預け出し
			sqlTemp = "0, " + aSalesData.priceSum + ", ";
		}else{
			//販売、釣銭預かり入れ
			sqlTemp = aSalesData.priceSum + ", 0, ";
		}
		sql2 = "insert into T_SALES_DATA(" + RECORD_COLUMN_NAMES + ") values(" + 
				aSalesData.salesYear + ", " +
				aSalesData.salesMode + ", " +
				keyDate + ", " +
				keyTime + ", " +
				aSalesData.jobCode + ", " +
				aSalesData.items[0] + ", " +
				aSalesData.items[1] + ", " +
				aSalesData.items[2] + ", " +
				aSalesData.items[3] + ", " +
				aSalesData.items[4] + ", " +
				aSalesData.items[5] + ", " +
				aSalesData.items[6] + ", " +
				aSalesData.items[7] + ", " +
				sqlTemp +
				updateYear + ", " +
				keyDate + ", " +
				keyTime + ");";
		dbSalesData.Execute(sql2);
	}catch(e){
		return null;
	}
	
	// salesDate, salesTime, updateYear, updateDate, updateTime を反映
	aSalesData.salesDate = keyDate;
	aSalesData.salesTime = keyTime;
	aSalesData.updateYear = updateYear;
	aSalesData.updateDate = keyDate;
	aSalesData.updateTime = keyTime;
	
	return aSalesData;
}

/* 販売データの更新 */
function updateSalesData(aSalesData){
	var resultSalesData = null;
	var sql1 = "";
	var sql2 = "";
	var sqlTemp = "";
	var resultCode = "02";
	var nowDate = null;
	var keyYear = 0;
	var keyMode = 0;
	var keyDate = 0;
	var keyTime = 0;
	var updateYear = 0;
	var orgUpdateYear = 0;
	var orgUpdateDate = 0;
	var orgUpdateTime = 0;
	var records = null;
	
	//キー項目
	keyYear = aSalesData.salesYear;
	keyMode = aSalesData.salesMode;
	keyDate = aSalesData.salesDate;
	keyTime = aSalesData.salesTime;
	
	//日付時刻取得
	nowDate = new Date();
	updateYear = nowDate.getFullYear();
	updateDate = 100 * (nowDate.getMonth() + 1) + nowDate.getDate();
	updateTime = 10000 * nowDate.getHours() + 100 * nowDate.getMinutes() + nowDate.getSeconds();
	
	try{
		// ＤＢ接続
		if(dbSalesData == null){
			connectSalesData();
		}
	
		// データ確認
		sql1 = "select " + RECORD_COLUMN_NAMES + " from T_SALES_DATA where " + 
				"SALES_YEAR=" + aSalesData.salesYear + " and " +
				"SALES_MODE=" + aSalesData.salesMode + " and " +
				"SALES_DATE=" + keyDate + " and " +
				"SALES_TIME=" + keyTime + ";"
		records = dbSalesData.OpenRecordset(sql1);
		if(records.EOF){
			// データなし
			records.Close();
			records = null;
			return null;
		}
		orgUpdateYear = records("UPDATE_YEAR").Value;
		orgUpdateDate = records("UPDATE_DATE").Value;
		orgUpdateTime = records("UPDATE_TIME").Value;
		records.Close();
		records = null;
		
		// 更新確認
		if(orgUpdateYear != aSalesData.updateYear || orgUpdateDate != aSalesData.updateDate || orgUpdateTime != aSalesData.updateTime){
			return null;
		}
		
		// データ更新
		if(aSalesData.jobCode == JOB_CODE_OUT){
			//釣銭預け出し
			sqlTemp = "PRICE_SUM=0, DEPOSIT_SUM=" + aSalesData.priceSum + ", ";
		}else{
			//販売、釣銭預かり入れ
			sqlTemp = "PRICE_SUM=" + aSalesData.priceSum + ", DEPOSIT_SUM=0, ";
		}
		sql2 = "update T_SALES_DATA set " + 
				"JOB_CODE=" + aSalesData.jobCode + ", " + 
				"ITEM_NUM01=" + aSalesData.items[0] + ", " + 
				"ITEM_NUM02=" + aSalesData.items[1] + ", " + 
				"ITEM_NUM03=" + aSalesData.items[2] + ", " + 
				"ITEM_NUM04=" + aSalesData.items[3] + ", " + 
				"ITEM_NUM05=" + aSalesData.items[4] + ", " + 
				"ITEM_NUM06=" + aSalesData.items[5] + ", " + 
				"ITEM_NUM07=" + aSalesData.items[6] + ", " + 
				"ITEM_NUM08=" + aSalesData.items[7] + ", " + 
				sqlTemp + 
				"UPDATE_YEAR=" + updateYear + ", " + 
				"UPDATE_DATE=" + updateDate + ", " + 
				"UPDATE_TIME=" + updateTime + " where " +
				"SALES_YEAR=" + aSalesData.salesYear + " and " + 
				"SALES_MODE=" + aSalesData.salesMode + " and " + 
				"SALES_DATE=" + aSalesData.salesDate + " and " + 
				"SALES_TIME=" + aSalesData.salesTime + ";";
		dbSalesData.Execute(sql2);
	}catch(e){
		return null;
	}
	
	// updateYear, updateDate, updateTime を反映
	aSalesData.updateYear = keyYear;
	aSalesData.updateDate = updateDate;
	aSalesData.updateTime = updateTime;
	
	return aSalesData;
}

/* 販売データの削除 */
function deleteSalesData(aSalesData){
	var resultSalesData = null;
	var sql1 = "";
	var sql2 = "";
	var resultCode = "02";
	var keyYear = 0;
	var keyMode = 0;
	var keyDate = 0;
	var keyTime = 0;
	var orgUpdateYear = 0;
	var orgUpdateDate = 0;
	var orgUpdateTime = 0;
	var records = null;
	
	//キー項目
	keyYear = aSalesData.salesYear;
	keyMode = aSalesData.salesMode;
	keyDate = aSalesData.salesDate;
	keyTime = aSalesData.salesTime;
	
	try{
		// ＤＢ接続
		if(dbSalesData == null){
			connectSalesData();
		}
	
		// データ確認
		sql1 = "select " + RECORD_COLUMN_NAMES + " from T_SALES_DATA where " + 
				"SALES_YEAR=" + aSalesData.salesYear + " and " +
				"SALES_MODE=" + aSalesData.salesMode + " and " +
				"SALES_DATE=" + keyDate + " and " +
				"SALES_TIME=" + keyTime + ";"
		records = dbSalesData.OpenRecordset(sql1);
		if(records.EOF){
			// データなし
			records.Close();
			records = null;
			return null;
		}
		orgUpdateYear = records("UPDATE_YEAR").Value;
		orgUpdateDate = records("UPDATE_DATE").Value;
		orgUpdateTime = records("UPDATE_TIME").Value;
		records.Close();
		records = null;
		
		// 更新確認
		if(orgUpdateYear != aSalesData.updateYear || orgUpdateDate != aSalesData.updateDate || orgUpdateTime != aSalesData.updateTime){
			return null;
		}
		
		// データ削除
		sql2 = "delete from T_SALES_DATA where " + 
				"SALES_YEAR=" + aSalesData.salesYear + " and " + 
				"SALES_MODE=" + aSalesData.salesMode + " and " + 
				"SALES_DATE=" + aSalesData.salesDate + " and " + 
				"SALES_TIME=" + aSalesData.salesTime + ";";
		dbSalesData.Execute(sql2);
	}catch(e){
		return null;
	}
	
	return aSalesData;
}

/* 販売集計データの取得 */
function loadTotalDataList(aSalesYear){
	var	resultList = [];
	var totalData = null;
	var records = null;
	var wnum = 0;
	
	// ＤＢ接続
	if(dbSalesData == null){
		connectSalesData();
	}
	
	// SQL
	var sql = "select * from Q_TOTAL_DATA where SALES_YEAR=" + aSalesYear + ";";
	
	// 読み込み
	records = dbSalesData.OpenRecordset(sql);
	while(!records.EOF){
		totalData = new Object();
		
		totalData.salesYear = records("SALES_YEAR").Value;
		totalData.salesMode = records("SALES_MODE").Value;
		totalData.items = [];
		wnum = records("TOTAL_NUM01").Value;
		totalData.items.push(wnum);
		wnum = records("TOTAL_NUM02").Value;
		totalData.items.push(wnum);
		wnum = records("TOTAL_NUM03").Value;
		totalData.items.push(wnum);
		wnum = records("TOTAL_NUM04").Value;
		totalData.items.push(wnum);
		wnum = records("TOTAL_NUM05").Value;
		totalData.items.push(wnum);
		wnum = records("TOTAL_NUM06").Value;
		totalData.items.push(wnum);
		wnum = records("TOTAL_NUM07").Value;
		totalData.items.push(wnum);
		wnum = records("TOTAL_NUM08").Value;
		totalData.items.push(wnum);
		totalData.totalPrice = records("TOTAL_PRICE").Value;
		
		resultList.push(totalData);

		records.MoveNext();
	}
	
	// 切断
	records.Close();
	records = null;
	
	// 戻り値
	return resultList;
}

/* 現金残高データの取得 */
function loadTotalBalanceList(aSalesYear, aSalesMode){
	var result = null;
	var records = null;
	var wjob = 0;
	var wvalue;
	var win = 0;
	var wsales = 0;
	var wout = 0;
	var wsum = 0;
	
	// ＤＢ接続
	if(dbSalesData == null){
		connectSalesData();
	}
	
	// SQL
	var sql = "select * from Q_TOTAL_BALANCE where SALES_YEAR=" + aSalesYear + " and SALES_MODE=" + aSalesMode + ";";
	
	// 読み込み
	records = dbSalesData.OpenRecordset(sql);
	while(!records.EOF){
		wjob = records("JOB_CODE").Value;
		switch(wjob){
		case JOB_CODE_IN:
			wvalue = records("TOTAL_PRICE").Value;
			win += wvalue;
			break;
		case JOB_CODE_SALES:
			wvalue = records("TOTAL_PRICE").Value;
			wsales += wvalue;
			break;
		case JOB_CODE_OUT:
			wvalue = records("TOTAL_DEPOSIT").Value;
			wout += wvalue;
			break;
		}

		records.MoveNext();
	}
	
	// 切断
	records.Close();
	records = null;

	// 戻り値
	result = new Object();
	wsum = win + wsales - wout;
	result.salesYear = aSalesYear;
	result.salesMode = aSalesMode;
	result.balanceIn = win;
	result.balanceSales = wsales;
	result.balanceOut = wout;
	result.balanceSum = wsum;
	
	// 戻り値
	return result;
}

