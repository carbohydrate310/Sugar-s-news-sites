const SHEET_ID = "YOUR_SPREADSHEET_ID_HERE";

function doGet() {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- アカウント関連機能 ---

// 新規登録
function signupUser(username, password, displayName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("users");
  const data = sheet.getDataRange().getValues();
  
  // ユーザー名の重複チェック
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) return "exists";
  }
  
  sheet.appendRow([username, password, displayName]);
  return "success";
}

// ログイン
function loginUser(username, password) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("users");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username && String(data[i][1]) === password) {
      return {
        username: data[i][0],
        displayName: data[i][2]
      };
    }
  }
  return null;
}

// --- ニュース関連機能 ---

function postNews(title, subtitle, body, name, category) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  sheet.appendRow([new Date(), title, subtitle, body, name, category]); 
  return "success";
}

function getNewsList() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, 6).getValues();
  
  return values.map((row, index) => ({
    id: index,
    date: row[0] instanceof Date ? row[0].toLocaleString('ja-JP') : row[0],
    title: row[1],
    subtitle: row[2],
    body: row[3],
    name: row[4],
    category: row[5] || "未分類"
  }));
}
