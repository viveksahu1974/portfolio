# Make portfolio feedback reach Gmail

**Current state:** The form is on the portfolio, but the public website cannot email Gmail automatically until a Google Apps Script web-app URL is configured. The destination email is **vsahu5369@gmail.com**.

## One-time owner setup (Google authorization required)

1. Sign into the Google account you want to use and visit https://script.google.com/.
2. Create a new Apps Script project. Replace the default code with the exact contents of [Code.gs](./Code.gs).
3. Click **Save**. Select \`testEmail\` in the function dropdown and click **Run**. Review the authorization prompts; check that the test email reaches **vsahu5369@gmail.com** (including Spam).
4. Select **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone** (when your account supports it). Authorize and deploy. Copy the **web app URL ending in \`/exec\`**. Do not use \`/dev\`.
5. Open this repository's \`index.html\` and find \`const APPS_SCRIPT_URL='';\`. Enter your deployed \`/exec\` URL inside the quotes, commit and wait for GitHub Pages to publish.
6. Open https://viveksahu1974.github.io/portfolio/#feedback and submit **one** test. Check the mailbox. If the browser says unconfirmed, check Gmail first to avoid duplicate emails.
7. Optional: For a feedback archive, create a Google Sheet and enter its ID in \`FEEDBACK_SHEET_ID\` in \`Code.gs\`. Re-deploy an updated Apps Script version after editing.

## Important limitations

- Google Apps Script ContentService can redirect POST responses, causing **CORS errors** even when it successfully saves and emails feedback. The form will **never** falsely claim delivery. To get fully reliable browser-visible success statuses, use a provider supporting cross-origin form submissions or a backend/proxy with explicit CORS response headers.
- Direct **Email feedback** fallback on the website opens the visitor's mail program and is **not anonymous**, because it sends from their email account. The on-page anonymous submission is disabled until the Apps Script URL is set.
- Visitor name and email are *not requested* by the Apps Script. Google and network intermediaries can still process technical request metadata.
- Deploying an anonymous endpoint publicly can invite spam and incur Google daily email quotas. Use rate-limiting or anti-abuse checks through a production backend for heavy traffic.
- Never expose private API keys, Google passwords, or personal credentials in a public GitHub repository.

## Resume

The linked \`VIVEKRESUME.pdf\` is a public web edition created from the owner's supplied resume. It omits the precise home street address for privacy.
