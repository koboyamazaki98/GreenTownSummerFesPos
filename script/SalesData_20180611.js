/***************************************/
/* 食券ＰＯＳ・販売データ              */
/***************************************/

/* 新規入力データの生成 */
function createSalesData(aSalesMode){
	// オブジェクトの生成
	var result = new Object();
	
	// 販売モード
	result.salesMode = aSalesMode;
	
	// 販売日
	var s = "";
	var nowDate = new Date();
	s = ("" + nowDate.getFullYear()) + ("" + (100 + nowDate.getMonth() + 1)).slice(-2) + ("" + (100 +nowDate.getDate())).slice(-2);
	result.salesDate = s;
	
	// 販売時刻
	s = ("" + (100 + nowDate.getHours())).slice(-2) + ("" + (100 + nowDate.getMinutes() + 1)).slice(-2) + ("" + (100 +nowDate.getSeconds())).slice(-2);
	result.salesTime = s;
	
	// 販売数
	var i = 0;
	result.items = [];
	for(i = 0; i < ITEM_NUM_MAX; i++){
		result.items.push(0);
	}
	
	// 販売金額
	result.priceSum = 0;
	
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
	
	return result;
}

/* レコード数の取得 */
function getSalesDataNum(aSalesYear, aSalesMode){
	var	result = 0;
	var connection = null;
	var command = null;
	var parameter = null;
	var records = null;

	// 接続
	connection = new ActiveXObject("ADODB.Connection");
	connection.Provider = "Microsoft.Jet.OLEDB.4.0";
	//connection.Open("DSN=GTSummerFestaSalesData");
	connection.Open("D:\\13_Project\\201808_グリーンタウン_夏まつり\\食券POS\\data\\ShokkenPos.mdb");
	
	// コマンドを作成
	command = new ActiveXObject("ADODB.Command");
	command.ActiveConnection = connection;
	//command.Properties("Jet OLEDB:Stored Query") = true
	command.CommandText = "Q_SALES_DATA_COUNT";
	parameter = command.CreateParameter("TARGET_YEAR", 3, 1, 4, aSalesYear);
    command.Parameters.Append(parameter);
	parameter = command.CreateParameter("TARGET_MODE", 3, 1, 4, aSalesMode);
    command.Parameters.Append(parameter);
	
	// レコードセットを取得
	records = new ActiveXObject("ADODB.Recordset");
	records = command.Execute();
	
	result = records.Fields[0].Value;
	
	// 切断
	command = null;
	connection.Close;
	connection = null;
	
	// 戻り値
	return result;
}
