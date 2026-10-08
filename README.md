# URVoteMatters

A one-page, nonpartisan civic information site for the November 3, 2026 U.S. elections, built on the URDesk brand system.

## What's in this folder

```
public/                     The website (this is what visitors see)
  index.html                The page
  404.html                  "Page not found" page
  assets/styles.css         Design system and layout
  assets/app.js             Interactions: countdown, state links, copy, checklist, signup form
  assets/states.js          Official state election office links (edit here to update)
  assets/fonts/             Self-hosted brand fonts (Archivo, Newsreader, IBM Plex Mono)
  og-image.png              Link preview image for Instagram, X, Facebook, iMessage
  favicon.svg + PNG icons   Browser and home-screen icons
netlify/functions/
  subscribe.mjs             Secure signup relay (browser > Netlify > Google Sheet)
apps-script/
  Code.gs                   Paste into your Google Sheet's Apps Script editor
netlify.toml                Netlify settings and security headers
```

## Setup, about 20 minutes

### 1. Make the Google Sheet

1. Create a new Google Sheet, for example "URVoteMatters signups".
2. Open **Extensions > Apps Script**. Delete what's there and paste in everything from `apps-script/Code.gs`. Save.
3. Open **Project Settings** (the gear icon) > **Script properties** > **Add script property**.
   - Property: `SIGNUP_SECRET`
   - Value: a long random password. Generate one with a password manager, at least 32 characters. Keep it handy for step 3.
4. Back in the editor, choose the `setup` function from the dropdown and click **Run**. Approve the permissions. This creates a "Signups" tab with headers.
5. Click **Deploy > New deployment**. Type: **Web app**. Execute as: **Me**. Who has access: **Anyone**. Click **Deploy** and copy the **Web app URL** (it ends in `/exec`).

"Anyone" is required so Netlify can reach the script. It is still protected: the script ignores any request without your secret, and the secret only lives in Netlify, never in the website code.

### 2. Put the site on Netlify

Signup needs Netlify Functions, which don't run on drag-and-drop deploys. Use GitHub (no coding needed):

1. Create a new GitHub repository and upload everything in this folder (keep the folder structure).
2. In Netlify: **Add new site > Import an existing project > GitHub**, then pick the repo. Netlify reads `netlify.toml`, so leave the build settings as they are and deploy.

(If you use the Netlify CLI instead: `netlify deploy --prod` from this folder.)

### 3. Connect the signup form

In Netlify: **Site configuration > Environment variables**, add:

| Key | Value |
|---|---|
| `APPS_SCRIPT_URL` | The Web app URL from step 1.5 |
| `SIGNUP_SECRET` | The same secret you saved in Apps Script |
| `ALLOWED_ORIGIN` | Your site address, e.g. `https://urvotematters.com` (optional, blocks other sites from posting) |

Then **Deploys > Trigger deploy** so the function picks them up. Submit the form once with your own email and confirm a row appears in the Sheet.

### 4. Your domain

The page assumes **https://urvotematters.com**. If your domain is different, search `index.html` for `urvotematters.com` and replace all of them (canonical link, Open Graph, X card, structured data). Link previews need the real domain to show the image.

In Netlify: **Domain management > Add a domain**. HTTPS is automatic.

## What the signup form does

- Checks the name, email format, state and consent box in the browser, then again on the server.
- Saves Timestamp, First Name, Email, State, Consent and Source to the Sheet.
- Duplicate emails aren't added again. The visitor sees "You're already on the list."
- Shows loading, success and error states, and every field is labeled for screen readers.
- Stops spam with a hidden trap field, a minimum fill time, Netlify rate limiting (5 a minute per visitor) and the shared secret.
- Blocks spreadsheet formula injection (values starting with `=`, `+`, `-`, `@`).

## Things to know

**Needs your action**
- **Sending emails isn't included.** The form collects subscribers. To email them, import the Sheet into your email tool (Klaviyo, Mailchimp, etc.). Honor unsubscribes there. The consent text promises URVoteMatters election updates only, so don't add these contacts to other brands' lists.
- **Check the state links before launch.** `assets/states.js` uses USA.gov's official state election office directory as of October 8, 2026. Click through a few, and update the footer's "Links reviewed" date when you re-check.

**Embeds and APIs (researched, not invented)**
- **Ballotpedia:** no free embeddable sample ballot widget. They sell a developer API for "API customers" (needs an account and key). The site links out to their lookup instead. An in-page lookup would be a paid upgrade.
- **NASS and EAC:** no public APIs or embeds. The site links to their official pages. NASS's "Can I Vote" pages let the visitor choose a state and then send them to the state's official tool.
- **Google Sheets:** connected through Apps Script with a shared secret. No Google API key is needed and nothing sensitive is in the browser code.

**Accessibility and performance**
- Tested at phone (390px) and desktop (1440px) with no horizontal scroll and no automated WCAG A/AA violations (axe-core).
- Keyboard navigation, visible focus, reduced-motion support, and live announcements for copy, checklist and form results.
- Fonts are self-hosted, so the site makes no requests to Google or any tracker.

## Expanding toward and after November

- **Add or change state info:** add fields to each state in `assets/states.js` (for example a registration deadline with its official source URL), then show them in `renderState()` in `assets/app.js`.
- **Add a section:** copy any `<section class="sec ...">` block in `index.html`. Use `sec--paper`, `sec--ink` or `sec--green` to keep the rhythm, then add a nav link.
- **After Election Day:** the countdown switches to "Thank you for voting." Update the hero and signup copy for the next cycle (2027 locals, 2028).
- **Analytics:** none are installed. If you add any, update the "Your information" text in the footer.
