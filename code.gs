const SHEET_ID = "PUT_YOUR_SPREADSHEE_ID";

function doGet() {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- 認証機能 ---
function signupUser(username, password, displayName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) return "exists";
  }
  sheet.appendRow([username, password, displayName]);
  return "success";
}

function loginUser(username, password) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username && String(data[i][1]) === password) {
      return { username: data[i][0], displayName: data[i][2] };
    }
  }
  return null;
}

// --- ニュース機能 ---
function postNews(title, subtitle, body, name, category, imageUrl, rowIndex = null) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  
  if (rowIndex !== null) {
    // 編集モード：既存の行を更新
    // rowIndexは1から始まるため、シートの行番号と一致させる
    const range = sheet.getRange(rowIndex, 2, 1, 6); // titleからcategory+imageまで
    range.setValues([[title, subtitle, body, name, category, imageUrl]]);
    return "updated";
  } else {
    // 新規投稿：新しい行を追加 (H列の初期閲覧数は0)
    sheet.appendRow([new Date(), title, subtitle, body, name, category, imageUrl, 0]); 
    return "success";
  }
}

function getNewsList() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, 8).getValues();
  
  return values.map((row, index) => ({
    rowIndex: index + 2, // スプレッドシート上の行番号
    date: row[0] instanceof Date ? row[0].toLocaleString('ja-JP') : row[0],
    title: row[1],
    subtitle: row[2],
    body: row[3],
    name: row[4],
    category: row[5] || "未分類",
    imageUrl: row[6] || "",
    views: parseInt(row[7]) || 0
  }));
}

// 閲覧数を増やす
function addView(rowIndex) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  const cell = sheet.getRange(rowIndex, 8);
  const currentViews = parseInt(cell.getValue()) || 0;
  cell.setValue(currentViews + 1);
  return currentViews + 1;
}
