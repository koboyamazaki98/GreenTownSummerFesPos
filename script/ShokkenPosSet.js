/***************************************/
/* 食券ＰＯＳ・編集部                  */
/***************************************/
var SET_MODE_NAME_NEW = "新規";
var itemNum = 8;
var salesYear = 0;
var goodPrises = null;
var salesMode = SALES_MODE_ONDAY;
var setMode = 0;
var setData = null;
var flgInnerProc = false;

/* フォーム初期処理 */
function shokkenPosSetLoad(){
	parent.initChild(VIEW_MODE_SET, this);
	
	// 価格表
	goodPrises = new Object();
	goodPrises.salesMode = 0;
	goodPrises.prises = [];
	goodPrises.prises.push(10000);
	goodPrises.prises.push(5000);
	goodPrises.prises.push(1000);
	goodPrises.prises.push(500);
	goodPrises.prises.push(100);
	goodPrises.prises.push(50);
	goodPrises.prises.push(10);
	goodPrises.prises.push(1);
}

/* モード初期表示 */
function initMode(aGoodsInfo, aSalesMode){
	var setTable = document.getElementById("setTable");
	var setThId = "";
	var setTh = null;
	var i = 0;
	
	//alert("yyy");
	if(aSalesMode < SALES_MODE_PRESALE || SALES_MODE_ONDAY < aSalesMode){
		return;
	}
	salesYear = aGoodsInfo.goodYear;
	salesMode = aSalesMode;
	
	initSet(SET_MODE_NEW, null);
}

/* 編集初期表示 */
function initSet(aSetMode, aSalesData){
	if (aSetMode < SET_MODE_NEW || SET_MODE_UPDATE < aSetMode) {
		retern;
	}
	setMode = aSetMode;
	setData = null;
	
	var i = 0;
	var textId = "";
	var setItem = null;
	var setTarget = document.getElementById("setTarget");
	var deleteButton = document.getElementById("deleteButton");
	var radioJobCode1 = document.getElementById("radioJobCode1");
	var radioJobCode3 = document.getElementById("radioJobCode3");
	var mon = 0;
	var day = 0;
	var hh = 0;
	var mm = 0;
	var mondayhhmm = "";
	
	switch(setMode){
	case SET_MODE_NEW:
		//新規データ
		setData = parent.createSalesDataIF(salesYear, salesMode, JOB_CODE_IN);
		setTarget.innerHTML = SET_MODE_NAME_NEW;
		deleteButton.disabled = true;
		break;
	case SET_MODE_UPDATE:
		//データ更新
		if(salesMode != aSalesData.salesMode){
			//履歴からの選択などで、販売モードが変わる場合
			parent.setSystemMode(aSalesData.salesMode, VIEW_MODE_SET)
		}
		
		setData = parent.copySalesDataIF(aSalesData);
		mon = parseInt(setData.salesDate / 100);
		day = parseInt(setData.salesDate % 100);
		hh = parseInt(setData.salesTime / 10000);
		mm = parseInt((setData.salesTime % 10000) / 100);
		mondayhhmm = ("" + (100 + mon)).slice(-2) + "/" + ("" + (100 + day)).slice(-2) + " " + ("" + (100 + hh)).slice(-2) + ":" + ("" + (100 + mm)).slice(-2);
		setTarget.innerHTML = mondayhhmm;
		deleteButton.disabled = false;
		break;
	}
	
	flgInnerProc = true;
	if(setData.jobCode = JOB_CODE_IN){
		radioJobCode1.checked = true;
	}else{
		radioJobCode3.checked = true;
	}
	for(i = 0; i < itemNum; i++){
		textId = "setItem" + ("" + (100 + i)).slice(-2);
		setItem = document.getElementById(textId);
		setItem.innerText = setData.items[i];
	}
	setItem = document.getElementById("setPriceSum");
	setItem.innerText = "￥" + setData.priceSum;
	flgInnerProc = false;
}

/* 販売数の編集 */
function changeSetItem(idx){
	if(flgInnerProc) return;
	
	// 個数表示
	if (0 <= idx && idx < itemNum) {
		var textId = "setItem" + ("" + (100 + idx)).slice(-2);
		var setItem = document.getElementById(textId);
		setItem.innerText = setData.items[idx];
	}
	
	// 売り上げ金額算出
	var i = 0;
	var price = 0;
	var priceSum = 0;
	for(i = 0; i < itemNum; i++){
		price = setData.items[i] * goodPrises.prises[i];
		priceSum += price;
	}
	setData.priceSum = priceSum;
	
	// 売り上げ金額の表示
	setItem = document.getElementById("setPriceSum");
	setItem.innerText = "￥" + setData.priceSum;
}

/* 販売数の加算 */
function addItemButtonClick(aIdx, aNum){
	if(0 <= aIdx && aIdx < itemNum) {
		if (setData.items[aIdx] + aNum <= 100) {
			setData.items[aIdx] += aNum;
		}
		changeSetItem(aIdx)
	}
}

/* 販売数のクリア */
function clearItemButtonClick(aIdx){
	if(0 <= aIdx && aIdx < itemNum) {
		setData.items[aIdx] = 0;
		changeSetItem(aIdx)
	}
}

/* 確定ボタンクリック */
function enterButtonClick(){
	var resultData = null;
	var radioJobCode1 = document.getElementById("radioJobCode1");
	var radioJobCode3 = document.getElementById("radioJobCode3");
	
	if(radioJobCode1.checked){
		setData.jobCode = 1;
	}else{
		setData.jobCode = 3;
	}
	if(setMode == SET_MODE_NEW){
		//追加
		resultData = parent.insertSalesDataIF(setData);
		
		if(resultData == null){
			//エラー
			alert("登録できませんでした。");
			return;
		}
		
		//履歴に登録
		appendHistory(resultData);
		
		//新規登録を繰り返す
		initSet(SET_MODE_NEW, null);
	}else if(setMode == SET_MODE_UPDATE){
		//更新
		resultData = parent.updateSalesDataIF(setData);
		
		if(resultData == null){
			//エラー
			alert("更新できませんでした。");
			return;
		}
		
		//履歴に登録
		appendHistory(resultData);
		
		//一覧画面に戻る
		parent.selectListPage(PAGE_CONTROL_CURR);
	}
}

/* 削除ボタンクリック */
function deleteButtonClick(){
	var resultData = null;
	
	//削除
	resultData = parent.deleteSalesDataIF(SET_MODE_DELETE, setData);
	
	if(resultData == null){
		//エラー
		alert("更新できませんでした。");
		return;
	}
	
	//履歴から削除
	deleteHistory(resultData);
	
	//一覧画面に戻る
	parent.selectListPage(PAGE_CONTROL_CURR);
}

/* 取消ボタンクリック */
function cancelButtonClick(){
	if(setMode == SET_MODE_NEW){
		//新規登録を繰り返す
		initSet(SET_MODE_NEW, null);
	}else if(setMode == SET_MODE_UPDATE){
		//一覧画面に戻る
		parent.selectListPage(PAGE_CONTROL_CURR);
	}
}

/* 履歴に追加 */
function appendHistory(aSalesData){
}

/* 履歴から削除 */
function deleteHistory(aSalesData){
}
