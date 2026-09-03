# The Battle of the Room

## v1.14.0 - Interface consistency and App Store readiness

- Standardized prominent controls around a monochrome, geometric icon system and consistent display-title casing.
- Added a delayed pulse/glow to the bilingual welcome logo, with reduced-motion support inherited from the application accessibility settings.
- Updated the incoming transmission with a lower robotic assistant voice profile and equal green/red decision controls.
- Simplified the mission console: hero task popovers show only the hero name, task heading, and bulleted subtasks; Safety Alerts now opens its own bulleted dialog; redundant touch/music labels were removed.
- Added a distinctive wrong-answer buzzer at timeout and reordered equal-size Try Again and Exit choices.
- Moved the Parent PIN exit control to the upper-right of the dialog while keeping the PIN keypad numeric.
- Schema version remains 11. The service-worker cache is `room-monster-v1.14.0`.

## v1.13.0 — Comic launches and balanced Quick Missions

- Tapping a locked Comic Books character now immediately offers a Quick Mission against that monster; victory unlocks its comic. Unlocked characters still open their stories.
- Removed the separate Battle this Monster control and renamed Setting to Settings.
- Enlarged the centered logo by roughly 30%, reduced surrounding controls, and swapped the left/right button groups.
- Entering Parent Zone from the welcome screen always requests the numeric parent PIN.
- Quick Mission assigns at most one distinct required task per hero in each phase, creates more phases when tasks outnumber heroes, and shares the remaining task when the final phase has fewer tasks than heroes.
- Parent → Missions replaces Duplicate with confirmed Delete and adds an Add Missions dialog.
- Schema version is 11 and the service-worker cache is `room-monster-v1.13.0`.

## v1.12.0 — Incoming mission campaign flow

- First-time setup begins with one child and filters Parent PIN input to exactly four numeric digits.
- The centered bilingual logo is surrounded by two large child choices (Battle and Comic Books) and two smaller adult/settings choices.
- Welcome music starts automatically whenever Safari has an active audio permission; setup and the first page interaction activate it when needed.
- The app now offers only Quick Rescue and Complete Rescue. Existing Normal Battle settings migrate safely into the two-mode structure.
- Selecting an unlocked monster in Comic Books launches the battle-mode flow with that monster as the target.
- A narrated digital transmission with a saluting robot asks the hero to Accept or Deny before the detective-portfolio Battle Briefing.
- Briefing colors now use dark text on light evidence cards, and its action is simplified to Begin.
- Responsibility popovers show sentence-level subtasks as bullet points, and Team Status uses the shorter completion reminder.
- Schema version is 10 and the service-worker cache is `room-monster-v1.12.0`.

## v1.11.0 — Selectable monsters and mission popovers

- Comic Book now lets children select any monster as the target of their next battle, while comic stories remain locked until that monster is defeated.
- The running clock is now the central mission display without the static Current Orders block. Tapping a hero opens a large responsibilities popover that closes when another screen area is tapped.
- Parent Zone and Setting are visually smaller than the two child-focused landing choices.
- The landing shield switches to “Héroes de Limpieza” in Spanish, and light-filled controls now enforce dark, readable text.
- The service-worker cache is `room-monster-v1.11.0`; schema version remains 9.

## v1.10.0 — Hero Cleaners landing menu

- Replaced the story-heavy home view with a full-screen landing menu built around four large choices: Parent Zone, Battle, Setting, and Comic Books.
- Added a custom shield-style Hero Cleaners logo and a responsive two-by-two game-menu layout sized for tablets and distance viewing.
- Added an original low-volume synthesized video-game menu theme. Safari starts it after the first deliberate tap on the music control; returning to the menu resumes it automatically.
- The service-worker cache is `room-monster-v1.10.0`; schema version remains 9.

## v1.9.0 — Monster comic library

- The home screen is now a child-friendly menu for Battle, Comic Book, Player Settings, and Parent Access.
- Quick Rescue expands its task pool when needed and assigns every active hero a distinct task in one concurrent phase.
- Players can change emoji avatars or take/choose local profile photos without entering the parent area.
- Victories unlock monsters in a thirteen-character mosaic. Locked monsters remain grayscale, unnamed, disabled, and inaccessible.
- Each unlocked monster opens a one-scene-at-a-time comic reader with Previous/Next controls and a quiet synthesized character theme.
- The ten supplied English and Spanish PDF comics provide localized scene art, dialogue adaptations, and hero lessons. The original three monsters retain their in-app origin stories.
- Schema version is 9 and the service-worker cache is `room-monster-v1.9.0`.

## v1.8.0 — Concurrent hero phases

- Parents assign each mode's tasks to numbered phases from the Missions matrix. Tasks sharing a phase run concurrently.
- Each hero receives a phase-specific task; tapping a hero on the right opens a bulleted list of that child's orders.
- Command narration names every hero and their assigned task. The phase countdown remains stopped until automatic narration ends.
- Ten additional rotating monsters and bilingual detective-archive storylines join the original three.
- The opening origin comic is removed; the pre-mission alert shows only the monster image and name, while story evidence remains between phases.
- Child profiles can use a camera or photo-library image. Photos are resized on-device and remain in local app data/backups.
- Schema version is 8 and the service-worker cache is `room-monster-v1.8.0`.

## v1.7.0 — Mission matrix and detective archives

- Parent → Missions now uses one task-by-mode matrix for Quick Rescue, Normal Battle, and Deep Clean assignments.
- Parent → Modes now focuses on whether a mode is available and its per-mission timer.
- Parent → Settings uses responsive control cards that remain readable in English and Spanish.
- Every completed phase reveals a different black-and-white detective case-file scene with the current monster's origin story and evidence.
- The service-worker cache is `room-monster-v1.7.0`; schema version remains 7.

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

## v1.2.2 Safari parent dashboard fix

Corrected malformed nested calls in `js/views/parent-dashboard.js`, reformatted the JavaScript sources for easier browser diagnostics, restored the required `.nojekyll` marker, and bumped the service-worker cache to `room-monster-v1.2.2`. No data-schema change is required.

## Version 1.3 engagement and timer controls

- Battle start now uses a locally synthesized rising-and-falling emergency mission siren.
- Every completed mission plays synthesized applause, a cheerful jingle, and a friendly monster growl.
- Mission countdowns run continuously and use per-mode defaults: Quick Rescue 5 minutes, Normal Battle 7 minutes, and Deep Clean 8 minutes.
- A one-time bell sounds when each countdown reaches its halfway point.
- Parents can set each mode to 1–30 minutes per mission under Parent → Modes. A running battle retains the duration captured when it started.
- Children can request **Abort Battle**, but the existing adult PIN and a final confirmation are required before current progress is discarded.

Schema version 5 adds per-mode mission durations and migrates existing schema-version-4 data without clearing profiles, history, settings, or a running battle. The service-worker cache is `room-monster-v1.3.0`.

## Version 1.4 live mission experience

- Fixed the visible countdown loop so seconds update continuously without requiring a completion-button rerender.
- Enlarged the timer to a high-contrast, tabular display designed to be read across a room.
- Added an original synthesized action-music loop during active cleaning phases, with rhythmic battle pulses, wordless team shouts, and friendly monster-growl punctuation. Music stops for celebrations, inspection, pauses, and non-mission screens.
- Added three transparent monster characters derived from the supplied concept sheet: The Mess Gobbler, The Clutter Crawler, and The Chaos Slime. New battles rotate through them cyclically and retain the selected monster for the entire session.
- Preserved the applause, jingle, monster growl, confetti, and final fanfare celebrations.
- Added twelve child-selectable hero avatars during family setup and avatar editing under Parent → Profiles.

Schema version 6 adds monster-rotation state and migrates active schema-version-5 battles to The Mess Gobbler. The service-worker cache is `room-monster-v1.4.0` and includes all three monster images for offline play.

## Version 1.5 battle-console redesign

- Replaced the bright mission page with a dark aircraft/submarine-style HMI using luminous green text, grid lines, target telemetry, and high-contrast panels.
- Added animated monster attack/radar interludes before the first mission and between completed phases.
- Made the timer the central display and added a flashing red critical state below two minutes.
- Reorganized controls into a left icon rail: repeat command, large help dialog, pause, and PIN-protected abort. Removed More Time.
- Replaced large child completion buttons with right-side avatar/name check fields.
- Mission instructions now play automatically once per phase using a lower-pitched battlefield-command speech profile with radio static cues. The instruction icon repeats them on demand.
- Increased original action-music output and ensures audio is reactivated from the Begin Mission gesture. Music pauses outside active cleaning phases.

The service-worker cache is `room-monster-v1.5.0`. Schema version remains 6 because existing version-6 session objects accept the new narration marker without migration.

## Version 1.6 comic campaign and tactical rules

- Renamed the game to **The Battle of the Room** and removed the sound-mute control. Sound remains enabled and is activated from deliberate battle gestures required by Safari.
- Added three-panel bilingual origin comics for every monster and animated comic impact/weakening scenes after each completed phase.
- Enhanced command narration with continuous low-level radio transmission noise, squelch cues, and the device's slower/lower-pitched voice.
- Parent → Modes now controls both the per-phase timer and exactly which active missions belong to Quick Rescue, Normal Battle, and Deep Clean.
- Added a one-time 30-second tactical pause per phase. A second request opens a monster-strength warning.
- Added a one-time critical siren below 2:00.
- Timeout now opens a flashing decision screen: accept defeat or retry with half of the mode's original phase time.
- Help uses large bullet points, command icons are larger/neon, and the team advance control is a right arrow.
- Final inspection is a single whole-room approval button plus a dropdown/button for repeating exactly one prior step. Repeated steps clear old confirmations and restart only that task.

Schema version 7 adds critical-alert and pause-use state while forcing sound on. The service-worker cache is `room-monster-v1.6.0`.
