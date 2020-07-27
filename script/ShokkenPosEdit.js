/***************************************/
/* 食券ＰＯＳ・編集部                  */
/***************************************/
var EDIT_MODE_NAME_NEW = "新規";
var itemNum = 0;
var salesYear = 0;
var goodPrises = null;
var salesMode = SALES_MODE_ONDAY;
var editMode = 0;
var editData = null;
var flgInnerProc = false;

/* フォーム初期処理 */
function shokkenPosEditLoad(){
	parent.initChild(VIEW_MODE_EDIT, this);
}

/* モード初期表示 */
function initMode(aGoodsInfo, aSalesMode){
	var editTable = document.getElementById("editTable");
	var editThId = "";
	var editTh = null;
	var i = 0;
	
	//alert("yyy");
	if(aSalesMode < SALES_MODE_PRESALE || SALES_MODE_ONDAY < aSalesMode){
		return;
	}
	salesYear = aGoodsInfo.goodYear;
	salesMode = aSalesMode;
	goodPrises = aGoodsInfo.goodPrises[salesMode - 1];
	
	itemNum = ITEM_NUM_MAX;
	if(aGoodsInfo.goodNum < itemNum){
		itemNum = aGoodsInfo.goodNum;
	}
	
	for(i = 0; i < itemNum; i++){
		editThId = "editTh" + ("" + (100 + i)).slice(-2);
		editTh = document.getElementById(editThId);
		editTh.innerHTML = aGoodsInfo.goodNames[i] + "<br>" + "￥" + goodPrises.prises[i];
	}
	
	initEdit(EDIT_MODE_NEW, null);
}

/* 編集初期表示 */
function initEdit(aEditMode, aSalesData){
	if (aEditMode < EDIT_MODE_NEW || EDIT_MODE_UPDATE < aEditMode) {
		retern;
	}
	editMode = aEditMode;
	editData = null;
	
	var i = 0;
	var textId = "";
	var editItem = null;
	var editTarget = document.getElementById("editTarget");
	var deleteButton = document.getElementById("deleteButton");
	var mon = 0;
	var day = 0;
	var hh = 0;
	var mm = 0;
	var mondayhhmm = "";
	
	switch(editMode){
	case EDIT_MODE_NEW:
		//新規データ
		editData = parent.createSalesDataIF(salesYear, goodPrises.salesMode, JOB_CODE_SALES);
		editTarget.innerHTML = EDIT_MODE_NAME_NEW;
		deleteButton.disabled = true;
		break;
	case EDIT_MODE_UPDATE:
		//データ更新
		if(salesMode != aSalesData.salesMode){
			//履歴からの選択などで、販売モードが変わる場合
			parent.setSystemMode(aSalesData.salesMode, VIEW_MODE_EDIT)
		}
		
		editData = parent.copySalesDataIF(aSalesData);
		mon = parseInt(editData.salesDate / 100);
		day = parseInt(editData.salesDate % 100);
		hh = parseInt(editData.salesTime / 10000);
		mm = parseInt((editData.salesTime % 10000) / 100);
		mondayhhmm = ("" + (100 + mon)).slice(-2) + "/" + ("" + (100 + day)).slice(-2) + " " + ("" + (100 + hh)).slice(-2) + ":" + ("" + (100 + mm)).slice(-2);
		editTarget.innerHTML = mondayhhmm;
		deleteButton.disabled = false;
		break;
	}
	
	flgInnerProc = true;
	for(i = 0; i < itemNum; i++){
		textId = "editItem" + ("" + (100 + i)).slice(-2);
		editItem = document.getElementById(textId);
		editItem.innerText = editData.items[i];
	}
	editItem = document.getElementById("editPriceSum");
	editItem.innerText = "￥" + editData.priceSum;
	flgInnerProc = false;
}

/* 販売数の編集 */
function changeEditItem(idx){
	if(flgInnerProc) return;
	
	// 個数表示
	if (0 <= idx && idx < itemNum) {
		var textId = "editItem" + ("" + (100 + idx)).slice(-2);
		var editItem = document.getElementById(textId);
		editItem.innerText = editData.items[idx];
	}
	
	// 売り上げ金額算出
	var i = 0;
	var price = 0;
	var priceSum = 0;
	for(i = 0; i < itemNum; i++){
		price = editData.items[i] * goodPrises.prises[i];
		priceSum += price;
	}
	editData.priceSum = priceSum;
	
	// 売り上げ金額の表示
	editItem = document.getElementById("editPriceSum");
	editItem.innerText = "￥" + editData.priceSum;
}

/* 販売数の１加算 */
function addItem1ButtonClick(idx){
	if(0 <= idx && idx < itemNum) {
		if (editData.items[idx] + 1 <= 100) {
			editData.items[idx] += 1;
		}
		changeEditItem(idx)
	}
	
	var audioObj = document.getElementById('taiko01');
	if(audioObj!=null){
		audioObj.play();
	}
}

/* 販売数の５加算 */
function addItem5ButtonClick(idx){
	if(0 <= idx && idx < itemNum) {
		if (editData.items[idx] + 5 <= 100) {
			editData.items[idx] += 5;
		}
		changeEditItem(idx)
	}
	
	var audioObj = document.getElementById('taiko05');
	if(audioObj!=null){
		audioObj.play();
	}
}

/* 販売数のクリア */
function clearItemButtonClick(idx){
	var audioObj;
	if(0 <= idx && idx < itemNum) {
		editData.items[idx] = 0;
		changeEditItem(idx)
	}
	
	var audioObj = document.getElementById('taiko00');
	if(audioObj!=null){
		audioObj.play();
	}
}

/* 確定ボタンクリック */
function enterButtonClick(){
	var resultData = null;
	
	if(editMode == EDIT_MODE_NEW){
		//追加
		resultData = parent.insertSalesDataIF(editData);
		
		if(resultData == null){
			//エラー
			alert("登録できませんでした。");
			return;
		}
		
		//履歴に登録
		appendHistory(resultData);
		
		//新規登録を繰り返す
		initEdit(EDIT_MODE_NEW, null);
	}else if(editMode == EDIT_MODE_UPDATE){
		//更新
		resultData = parent.updateSalesDataIF(editData);
		
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
	resultData = parent.deleteSalesDataIF(EDIT_MODE_DELETE, editData);
	
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
	if(editMode == EDIT_MODE_NEW){
		//新規登録を繰り返す
		initEdit(EDIT_MODE_NEW, null);
	}else if(editMode == EDIT_MODE_UPDATE){
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
