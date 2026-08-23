# Room Monster Battle

A static, installable PWA that turns a shared-bedroom cleanup into a cooperative battle against a silly monster. It uses vanilla HTML/CSS/JavaScript, IndexedDB, Web Crypto, speech synthesis and a service worker. No accounts, analytics, advertising, remote APIs, CDNs, package manager or cloud database are used.

## Local use
Run `python3 -m http.server 8000 --directory room-monster-battle` from the parent directory, then open `http://localhost:8000/`. Do not double-click `index.html`, because service workers and ES modules require an HTTP(S) origin.

## GitHub Pages
Upload the project contents so `index.html` is at the repository root. In Settings → Pages, deploy the `main` branch from `/ (root)`. All application paths are relative so a project subdirectory works. `_headers` is included for compatible hosts but GitHub Pages does not apply it.

## iPad
Open the HTTPS site in Safari once while online, complete parent setup, start a short battle to activate audio, then Share → Add to Home Screen. After the first complete online load, the application shell is cached for offline use. Avoid Private Browsing for normal family use.

## Data and backups
Family settings, PIN verifier, current battle and history live in IndexedDB on the device. Parent → Data exports a versioned JSON backup. Export before updates and periodically thereafter. Changing domain/repository path changes the browser origin/context and can affect access to stored data.

## Security
The four-digit PIN is never stored directly. PBKDF2-SHA-256 with a random 16-byte salt and 160,000 iterations is used through Web Crypto. Five unsuccessful attempts cause a 30-second lockout. Dynamic user text is rendered with DOM text APIs.

## English / Spanish language switch

Room Monster Battle supports English and Spanish without an internet translation service. Tap **ES** in the top-right header to switch from English to Spanish; when Spanish is active the button shows **EN** to switch back. Parents can also choose the interface language during first-run setup or under **Parent → Settings**. The preference is saved in IndexedDB and survives reloads, Home Screen launches, and offline use. The factory missions include authored Spanish titles, instructions, and safety notes. Custom family text falls back to the wording entered by the parent when no translated version is stored.

## Version 1.2 enhancements

- First-run setup and Parent → Profiles support up to eight active heroes/participants.
- Every mission starts with a five-minute countdown. Reaching 0:00 does not fail the mission or remove credit; a locally synthesized shot-clock alert plays, an encouraging message appears, and the timer automatically resets to 5:00.
- **More Time** resets the current mission countdown to five minutes without penalty.
- Completing every mission triggers confetti (unless reduced motion is enabled) and a cheerful locally synthesized success jingle.
- The final victory uses a larger two-wave confetti celebration and an extended victory fanfare.
- Beginning a new battle plays a short kid-friendly mission alarm after audio has been activated by the user's deliberate Start Battle tap.
- All new countdown and coaching text is available in English and Spanish.

Existing schema-version-3 installations migrate to schema version 4 without clearing family profiles, history, settings, PIN data, or an active battle. If an older active battle has no per-mission countdown state, migration gives its current mission a fresh five-minute countdown.


## v1.2.1 Safari inspection fix

Reformatted `js/views/inspection.js` into Safari-friendly multi-line JavaScript and bumped the service-worker cache to `room-monster-v1.2.1`. No data-schema change is required.
