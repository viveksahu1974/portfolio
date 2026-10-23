/**
 * Vivek Sahu Portfolio — Anonymous Feedback Backend
 * Install as Google Apps Script, authorise and deploy as Web app.
 * Execute as: Me; access: Anyone (where available).
 * Do NOT copy passwords, access tokens or Google credentials into the website.
 */
const FEEDBACK_INBOX = 'vsahu5369@gmail.com';
const FEEDBACK_SHEET_ID = ''; // Optional Google Sheet ID. Leave blank for email-only.
const MAX_LENGTHS = Object.freeze({rating:40,liked:120,improve:2000,recommend:20,message:2000});

function textValue(value, maximum) {
  return String(value == null ? '' : value).trim().slice(0, maximum).replace(/\u0000/g, '');
}
function safeSheetCell(value) {
  const s = String(value == null ? '' : value);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}
function jsonResult(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) throw new Error('Missing request body');
    if (e.postData.contents.length > 12000) throw new Error('Request too large');
    const received = JSON.parse(e.postData.contents);
    // Optional honeypot: never ask the visitor to fill this field.
    if (received.website) return jsonResult({status:'success'});
    const data = {};
    Object.keys(MAX_LENGTHS).forEach(k => data[k] = textValue(received[k], MAX_LENGTHS[k]));
    if (!data.rating || !data.liked || !data.improve) throw new Error('Rating, liked and improvement fields are required');
    const rating = parseInt(data.rating, 10);
    if (!(rating >= 1 && rating <= 5)) throw new Error('Invalid rating');

    if (FEEDBACK_SHEET_ID) {
      const book = SpreadsheetApp.openById(FEEDBACK_SHEET_ID);
      let tab = book.getSheetByName('Feedback');
      if (!tab) {
        tab = book.insertSheet('Feedback');
        tab.appendRow(['Timestamp', 'Rating', 'Liked', 'Improve', 'Recommend', 'Message']);
      }
      tab.appendRow([new Date(), ...['rating','liked','improve','recommend','message'].map(k => safeSheetCell(data[k]))]);
    }

    const lines = [
      'New anonymous feedback on Vivek Sahu Portfolio',
      '',
      'Rating: ' + data.rating,
      'Liked: ' + data.liked,
      'Suggested improvement: ' + data.improve,
      'Recommend: ' + data.recommend,
      'Message: ' + data.message
    ];
    MailApp.sendEmail({
      to: FEEDBACK_INBOX,
      subject: 'Portfolio feedback (' + rating + '/5 stars)',
      body: lines.join('\n'),
      name: 'Vivek Sahu Portfolio'
    });
    return jsonResult({status:'success'});
  } catch (error) {
    console.error('Feedback submission failed: ' + error);
    return jsonResult({status:'error', message:'Feedback delivery was not completed'});
  }
}
// Run once from Apps Script editor to request authorization and test Gmail delivery.
function testEmail() {
  MailApp.sendEmail({
    to: FEEDBACK_INBOX,
    subject: 'Portfolio feedback test',
    body: 'Google Apps Script permission test: emails from your portfolio can be delivered.'
  });
}
