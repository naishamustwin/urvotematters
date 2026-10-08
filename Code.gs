/**
 * URVoteMatters signup receiver (Google Apps Script)
 * ----------------------------------------------------------------
 * Paste this into Extensions > Apps Script in the Google Sheet that
 * should collect signups. Setup steps are in README.md.
 *
 * Only the Netlify function calls this. It must send the shared secret
 * stored in Project Settings > Script properties as SIGNUP_SECRET.
 */

var SHEET_NAME = 'Signups';
var HEADERS = ['Timestamp', 'First Name', 'Email', 'State', 'Consent', 'Source'];
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
var STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return out_({ ok: false, error: 'bad_json' });
  }

  var secret = PropertiesService.getScriptProperties().getProperty('SIGNUP_SECRET');
  if (!secret || data.secret !== secret) return out_({ ok: false, error: 'unauthorized' });

  var firstName = clean_(data.firstName, 60);
  var email = String(data.email || '').trim().toLowerCase();
  var state = String(data.state || '').trim().toUpperCase();
  if (!firstName || !EMAIL_RE.test(email) || email.length > 254 || STATES.indexOf(state) === -1) {
    return out_({ ok: false, error: 'invalid' });
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
  } catch (err) {
    return out_({ ok: false, error: 'busy' });
  }

  try {
    var sheet = sheet_();
    var last = sheet.getLastRow();
    if (last > 1) {
      var emails = sheet.getRange(2, 3, last - 1, 1).getValues();
      for (var i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).trim().toLowerCase() === email) {
          return out_({ ok: true, status: 'duplicate' });
        }
      }
    }
    sheet.appendRow([
      data.timestamp ? new Date(data.timestamp) : new Date(),
      safe_(firstName),
      safe_(email),
      state,
      safe_(clean_(data.consent, 80)),
      safe_(clean_(data.source, 80))
    ]);
    return out_({ ok: true, status: 'added' });
  } finally {
    lock.releaseLock();
  }
}

/** Visiting the web app URL in a browser shows this, not your data. */
function doGet() {
  return out_({ ok: true, service: 'URVoteMatters signup receiver' });
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function clean_(v, max) {
  return String(v || '').replace(/[\u0000-\u001F\u007F]/g, '').trim().replace(/\s+/g, ' ').slice(0, max);
}

/** Stops spreadsheet formula injection (values starting with = + - @). */
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Run once from the editor to create the sheet tab and headers. */
function setup() {
  sheet_();
}
