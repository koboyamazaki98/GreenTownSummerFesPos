/***************************************/
/* 食券ＰＯＳ・共通                    */
/***************************************/

/* 最大商品数 */
var ITEM_NUM_MAX = 8;

/* 一覧表示数 */
var PAGE_SIZE = 20;

/* 表示モード */
var VIEW_MODE_CTRL	= 0;
var VIEW_MODE_SET	= 1;
var VIEW_MODE_EDIT 	= 2;
var VIEW_MODE_LIST 	= 3;
var VIEW_MODE_TOTAL	= 4;

/* 販売モード */
var SALES_MODE_ALL = -1;
var SALES_MODE_INVALID = 0;
var SALES_MODE_PRESALE = 1;
var SALES_MODE_INVITE  = 2;
var SALES_MODE_ONDAY   = 3;
var SALES_MODE_NAMES = ["前売", "招待", "当日"];

/* 業務コード */
var JOB_CODE_IN		= 1;
var JOB_CODE_SALES	= 2;
var JOB_CODE_OUT	= 3;
var JOB_CODE_NAMES = ["釣銭受入", "販売", "釣銭預出"];

/* 編集モード */
var EDIT_MODE_NEW    = 0;
var EDIT_MODE_UPDATE = 1;
var EDIT_MODE_DELETE = 2;
var SET_MODE_NEW    = 0;
var SET_MODE_UPDATE = 1;
var SET_MODE_DELETE = 2;

/* ページコントロール  */
var PAGE_CONTROL_FIRST 	= -2;
var PAGE_CONTROL_PREV 	= -1;
var PAGE_CONTROL_CURR 	= 0;
var PAGE_CONTROL_NEXT 	= 1;
var PAGE_CONTROL_LAST 	= 2;
