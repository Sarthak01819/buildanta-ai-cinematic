/**
 * BUILDANTA AI INSTITUTE - receiver for the Apply form.
 *
 * Every application sent from the website is appended as a row in this
 * spreadsheet and emailed to you. Nothing is stored anywhere else, and no
 * third-party form service sees an applicant's details.
 *
 * SETUP, ONCE
 *  1. Create a Google Sheet, or open the one you want the applications in.
 *  2. Extensions > Apps Script. Delete whatever sample code is in the editor.
 *  3. Paste this whole file in, then set NOTIFY_EMAIL and SHARED_SECRET below.
 *  4. Save, then Deploy > New deployment. Click the gear, choose "Web app".
 *       Description:      Apply form
 *       Execute as:       Me
 *       Who has access:   Anyone
 *  5. Google asks you to authorise. The "Google hasn't verified this app"
 *     warning is expected, because the app is your own script: click Advanced,
 *     then "Go to Apply form (unsafe)", then Allow.
 *  6. Copy the Web app URL. It ends in /exec. That URL is what the site needs.
 *
 * TO CHANGE THIS LATER
 *  Edit the code, then Deploy > Manage deployments > pencil icon > Version:
 *  New version > Deploy. The /exec URL stays the same. A brand new deployment
 *  would give you a different URL and the site would keep posting to the old one.
 */

/** Where to email each new application. Leave as '' to switch the email off. */
const NOTIFY_EMAIL = ''

/**
 * A shared secret the website sends with every application. It stops casual
 * drive-by posting to this URL. It is not real security: the value ships inside
 * the website's JavaScript, so anyone determined can read it. Leave as '' to
 * accept every request.
 */
const SHARED_SECRET = ''

/** The tab applications are written to. Created automatically if missing. */
const SHEET_NAME = 'Applications'

const HEADERS = ['Received', 'Name', 'Phone', 'Student or professional', 'Note', 'Page', 'Source']

/**
 * The website posts here. The body is JSON sent as text/plain, because a web
 * app cannot answer the CORS preflight that a JSON content type would trigger.
 */
function doPost(e) {
  const lock = LockService.getScriptLock()
  try {
    // Two applications submitted in the same second must not share a row.
    lock.waitLock(20000)

    const body = e && e.postData ? e.postData.contents : ''
    const data = JSON.parse(body || '{}')

    if (SHARED_SECRET && data.access_key !== SHARED_SECRET) {
      return jsonResponse_({ success: false, error: 'rejected' })
    }
    if (!data.name || !data.phone) {
      return jsonResponse_({ success: false, error: 'name and phone are required' })
    }

    appendRow_(data)
    sendNotification_(data)
    return jsonResponse_({ success: true })
  } catch (err) {
    // The row is what matters, so a failure is recorded rather than swallowed.
    console.error(err)
    return jsonResponse_({ success: false, error: String(err) })
  } finally {
    lock.releaseLock()
  }
}

/** Open the /exec URL in a browser to check the deployment is alive. */
function doGet() {
  return jsonResponse_({ ok: true, message: 'BUILDANTA apply form receiver is running.' })
}

function appendRow_(data) {
  const sheet = getSheet_()
  sheet.appendRow([
    new Date(),
    String(data.name || ''),
    // A cell beginning with + is read as a formula, so +919876543210 would break.
    // The leading apostrophe pins the phone number as text.
    "'" + String(data.phone || ''),
    String(data.who || ''),
    String(data.note || ''),
    String(data.page || ''),
    String(data.source || ''),
  ])
}

function getSheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = book.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME)
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
  }
  return sheet
}

function sendNotification_(data) {
  if (!NOTIFY_EMAIL) return
  const lines = [
    'A new application came in from the website.',
    '',
    'Name:  ' + (data.name || ''),
    'Phone: ' + (data.phone || ''),
    'They are a: ' + (data.who || ''),
    'Note:  ' + (data.note || '(none)'),
    '',
    'Page:  ' + (data.page || ''),
    'Sheet: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
  ]
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: 'New application: ' + (data.name || 'unnamed'),
      body: lines.join('\n'),
      name: 'BUILDANTA website',
    })
  } catch (err) {
    // A blocked or over-quota email must never lose the row that was just written.
    console.error('notification failed', err)
  }
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON)
}

/**
 * Run this once from the Apps Script editor (choose testReceiver in the
 * function dropdown, press Run) to prove the sheet and the email both work,
 * before the website is pointed at it.
 */
function testReceiver() {
  const fake = {
    name: 'Test Applicant',
    phone: '+919999999999',
    who: 'Student',
    note: 'This row came from testReceiver and can be deleted.',
    page: '/apply',
    source: 'manual test',
    access_key: SHARED_SECRET,
  }
  appendRow_(fake)
  sendNotification_(fake)
  console.log('Wrote a test row to "' + SHEET_NAME + '".')
}
