const SHEET_ID = "PUT_YOUR_SPREADSHEET_ID";

function doGet() {
  return HtmlService.createTemplateFromFile("index")
    .evaluate()
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle("AIクリエイティ部 NEWS")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// --- ユーザー & プロフィール機能 ---
function loginUser(username, password) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username && String(data[i][1]) === password) {
      return { username: data[i][0], displayName: data[i][2], bio: data[i][3] || "" };
    }
  }
  return null;
}

function signupUser(username, password, displayName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) return "exists";
  }
  sheet.appendRow([username, password, displayName, "AIクリエイティ部へようこそ！"]);
  return "success";
}

function updateProfile(username, bio) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username) {
      sheet.getRange(i + 1, 4).setValue(bio);
      return "success";
    }
  }
}

// 特定のユーザーの情報を取得（他人のプロフィール用）
function getPublicProfile(displayName) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][2] === displayName) {
      return { displayName: data[i][2], bio: data[i][3] || "自己紹介はまだありません。" };
    }
  }
  return null;
}

// --- 記事機能 ---
function postNews(title, subtitle, body, name, category, imageUrl, rowIndex = null) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  if (rowIndex) {
    sheet.getRange(rowIndex, 2, 1, 6).setValues([[title, subtitle, body, name, category, imageUrl]]);
    return "updated";
  } else {
    sheet.appendRow([new Date(), title, subtitle, body, name, category, imageUrl, 0, "FALSE"]); 
    return "success";
  }
}

function deleteNews(rowIndex) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  sheet.getRange(rowIndex, 9).setValue("TRUE");
  return "deleted";
}

function getNewsList() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
  return values.map((row, index) => ({
    rowIndex: index + 2,
    date: row[0] instanceof Date ? row[0].toLocaleDateString('ja-JP') : row[0],
    title: row[1], subtitle: row[2], body: row[3], name: row[4], category: row[5], imageUrl: row[6], 
    views: parseInt(row[7]) || 0,
    deleted: String(row[8]) === "TRUE"
  })).filter(a => !a.deleted);
}

// --- コメント & 閲覧数 ---
function addComment(articleRow, userName, comment) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("comments");
  sheet.appendRow([new Date(), articleRow, userName, comment]);
}

function getComments(articleRow) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("comments");
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  return values.filter(row => row[1] == articleRow).map(row => ({
    date: row[0] instanceof Date ? row[0].toLocaleString('ja-JP') : row[0],
    userName: row[2], comment: row[3]
  }));
}

function addView(rowIndex) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName("news");
  const cell = sheet.getRange(rowIndex, 8);
  cell.setValue((parseInt(cell.getValue()) || 0) + 1);
}
