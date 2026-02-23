const SHEET_ID = "YOUR_SPREADSHEET_ID_HERE";

function doGet() {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function checkPassword(inputPassword) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("settings");
  const values = sheet.getDataRange().getValues();
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === "password") return inputPassword === String(values[i][1]);
  }
  return false;
}

// categoryを追加して6列（A-F）で保存
function postNews(title, subtitle, body, name, category) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  sheet.appendRow([new Date(), title, subtitle, body, name, category]); 
  return "success";
}

function getNewsList() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  
  // A列(時間)からF列(カテゴリー)までの6列分を取得
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
