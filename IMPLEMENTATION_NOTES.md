# Implementation Notes

## v1.13.0

Schema 11 localizes the retained `quick` mode as Quick Mission. Quick-mode phase snapshots are generated dynamically in participant-sized chunks; the existing modulo assignment then shares a short final phase across all active heroes. Locked comic tiles set `selectedMonsterId` and route directly to the Quick Mission offer, while unlocked tiles remain comic-reader links.

## v1.12.0

Schema 10 removes the legacy `normal` game mode, makes `quick` the default, and renames the retained `deep` mode to Complete Rescue while preserving its identifier for session compatibility. The `mission-offer` route sits between mode choice and briefing. Its typewriter animation and assistant voice are local-only, and its robot sprite is bundled for offline use.

## v1.11.0

`appSettings.selectedMonsterId` is an optional, backward-compatible next-battle override. Session creation consumes the selected monster and the app clears the override after creating that session. Hero responsibility details are rendered as an accessible non-blocking dialog and dismissed by the next pointer press outside it. Both language-specific logo PNGs are bundled in the offline cache.

## v1.10.0

The home route is now a dedicated Hero Cleaners landing screen. Its menu music is synthesized locally with Web Audio and requires one user gesture on a fresh Safari session, after which the active audio context permits automatic playback when returning home. The logo is a bundled transparent PNG and is included in the offline cache.

## Architecture
Static ES-module PWA. IndexedDB stores one versioned root record. Business logic is separated into storage, migration, validation, security, audio/speech, timers, roles, game-engine, backup and view modules. All application URLs are relative for GitHub Pages project-subdirectory hosting.

## Requirement mapping
The application implements first-run setup; 1–4-profile data model (setup requires two); PBKDF2 PIN verification and lockout; eight editable factory missions; three game modes; role rotation/restrictions logic; independent child confirmations; immediate IndexedDB persistence; session snapshots; pause/resume; monster health/progress/collectibles; parent inspection/correction; history; backup/import validation; migration; offline cache; connectivity badge; speech; sound; reduced motion; Home Screen metadata; and parent reset protection.

## Deliberate simplifications / limitations
- The supplied release provides mission activation and duplication in the parent UI, but the compact editor does not expose every FR-031 mission field in a dedicated form. The underlying data model contains every required field.
- Reordering controls and drag-and-drop are not exposed in this first UI although order-preserving arrays are used.
- Parent role locks/restrictions are honored by logic but the dedicated role/rotation editing UI is not fully surfaced.
- Break reminders are represented by Pause/More Time behavior; an automatic break screen after N missions is not surfaced in this release.
- Parent inactivity timeout is enforced by the in-memory parent authorization window when navigating; no visible countdown is shown.
- Vibration preference is stored but vibration is not invoked because iPad Safari support is inconsistent.
- Local WAV files are included as original assets; runtime effects use Web Audio tones to remain robust on Safari.
- `_headers` is useful on Netlify/Cloudflare-compatible setups; GitHub Pages ignores it.

## Security/privacy
No real names, photos or PIN are included in source. The PIN verifier uses random salt + PBKDF2-SHA-256. User-entered text is assigned via `textContent`/text nodes and never dynamically inserted as HTML. Imported backups are parsed as JSON, migrated and validated before mutation; a pre-import backup downloads before confirmed replacement.

## Schema
Current schema version: 2. Migration from version 1 adds reward defaults and fills application settings.

## Version 1.1 — English / Spanish localization

- Added a persisted `appSettings.language` preference with supported values `en` and `es`.
- Added an always-available EN/ES header toggle plus language selection during first-run setup and Parent → Settings.
- Added `js/i18n.js` for interface strings, interpolation, role names, game-mode names, and localized record fields.
- Added authored Spanish translations for all eight factory mission titles, child instructions, parent instructions, and safety notes.
- Added Spanish names for factory modes and room zones and Spanish defaults for the family reward message.
- Browser speech synthesis now requests `en-US` or `es-US` based on the selected language and prefers a matching installed system voice when available.
- Schema version advanced from 2 to 3. Migration preserves existing profiles, history, settings, custom missions, and active sessions while adding bilingual factory fields and defaulting existing users to English.
- Custom mission or reward text that has no Spanish-specific value falls back to the saved original text; it is never machine-translated or sent to an external service.
- Service-worker cache advanced to `room-monster-v1.1.0` and now precaches `js/i18n.js`.

## v1.1.1 Safari startup patch

- Rewrote `js/views/home.js` as formatted, conservative JavaScript to eliminate the Safari startup parse error reported as `SyntaxError: Unexpected token '}'. Expected ')' to end an argument list.`
- Bumped the service-worker cache from `room-monster-v1.1.0` to `room-monster-v1.1.1` so previously cached JavaScript is replaced after deployment.
- No data schema change was made; existing IndexedDB family data remains compatible.

## Version 1.2.0 — participants, countdowns and celebrations

- Schema advanced from 3 to 4. Migration preserves existing configuration/history/security data and adds `maxParticipants: 8`, `stepCountdownSeconds: 300`, plus per-active-session `stepTimer` state when required.
- Participant capacity is now eight. First-run setup can create 2–8 heroes, and Parent → Profiles can add profiles until the same limit is reached. All active participants are included in new session snapshots and receive mission assignments/confirmation credit.
- Each session now stores a five-minute per-mission `stepTimer`. Expiration is motivational only: it increments an attempt counter, plays a synthesized shot-clock cue, shows/speaks supportive copy, and restarts at five minutes. It never fails a mission or removes earned credit.
- Per-mission countdown state pauses with the battle and excludes hidden-page time when the existing >30-second visibility rule applies.
- `js/effects.js` provides dependency-free DOM confetti. It creates no remote requests and is suppressed by `prefers-reduced-motion` or the in-app reduced-motion setting.
- `js/audio.js` now synthesizes mission-start, shot-clock, mission-complete, and final-victory sound sequences with Web Audio. No copyrighted or remote sound assets were added.
- Final mission completion now passes through the normal mission celebration before inspection/victory, ensuring every completed step receives immediate positive feedback.
- Service-worker cache version advanced to `room-monster-v1.2.0` and caches `js/effects.js`.


## v1.2.1 Safari inspection fix

Reformatted `js/views/inspection.js` into Safari-friendly multi-line JavaScript and bumped the service-worker cache to `room-monster-v1.2.1`. No data-schema change is required.

## v1.2.2 Safari parent dashboard fix

Replaced the malformed compressed `js/views/parent-dashboard.js` implementation with equivalent readable control flow. The service-worker cache is now `room-monster-v1.2.2`; the application data schema remains version 4.

## Version 1.3 engagement and timer controls

Schema version 5 stores `missionDurationSeconds` on each game mode. Sessions snapshot this as `stepDurationMs`, so later parent edits do not mutate an active battle. Midpoint alerts are persisted on the step timer and reset with each new chance. All new sounds use Web Audio oscillators and generated noise, keeping the PWA offline and avoiding bundled third-party recordings. The abort action reuses the PBKDF2-backed adult PIN verifier and clears only the active session after a separate confirmation.

## Version 1.4 live mission experience

The original countdown regression was caused by starting `tick()` before the timer element was connected; its connection guard immediately cleared the interval. The interval now starts after `root.replaceChildren`. Action music is generated entirely through Web Audio and shares the existing sound-volume setting. Monster rotation uses `appSettings.nextMonsterIndex`, while each session snapshots `monsterId`. Generated RGBA sprites are resized to 700×700 and cached locally. Schema version 6 adds these fields without clearing existing family data.

## Version 1.5 battle-console redesign

`battle-transition.js` owns the animated radar/monster interlude and its reduced-motion timing. `mission.js` now renders a three-column battle console and stores `lastAutoSpokenMissionId` in the active session to prevent narration from repeating on confirmation rerenders. Web Speech uses a slower, lower-pitched command profile bracketed by synthesized radio static; action music remains generated by Web Audio. The critical timer threshold is centralized in `isCriticalRemaining` and intentionally begins below, not at, 2:00.

## Version 1.6 comic campaign and tactical rules

Monster lore is authored in `monster-stories.js` and rendered as semantic HTML/CSS panels by `monster-origin.js`. Radio noise follows Web Speech lifecycle callbacks. Step timers now carry `criticalAlerted` and `pauseUsed`; retries derive from the immutable session `stepDurationMs`. Mode mission membership remains an ordered `missionIds` array. Inspection repetition calls `returnMissions`, which now deletes confirmations for returned IDs before creating a fresh timer. Schema version 7 migrates these states and enforces sound enabled.

## Version 1.7 mission matrix and detective archive

The Missions editor treats the existing ordered `mode.missionIds` arrays as a task-by-mode matrix, so no data migration is needed. The Modes editor retains only availability and duration. Settings use responsive cards instead of inline list labels. The completion cutscene reuses locally cached monster art with CSS grayscale, contrast, paper, stamp, and scan-line treatments; it reveals the current monster's authored story panels in phase order without adding remote assets.

## Version 1.8 concurrent hero phases

Schema 8 adds `missionPhases` to modes and `phaseSnapshots/currentPhaseIndex` to sessions. Each phase snapshots its task IDs and distributes active children across those tasks; confirmations remain keyed by mission ID for inspection compatibility. New step timers begin paused with `awaitingInstructions` and resume from the speech lifecycle callback. Profile photos use the device file/camera picker, are center-cropped to a 480px JPEG locally, and are stored with the child profile. The ten-character roster is a single offline sprite atlas generated from the supplied concept reference and addressed through CSS background positions.

## Version 1.9 menu and comic library

Schema 9 adds `appSettings.defeatedMonsterIds`, deriving initial unlocks from completed session history during migration. Finishing a victory adds the session monster ID; defeats and aborted sessions never unlock comics. Quick Rescue supplements its configured missions from active factory/custom tasks until it has at least one distinct task per active hero and groups them into one fast concurrent phase. Comic assets are optimized page renders from the supplied bilingual PDFs and displayed through deterministic CSS scene crops with accessible localized summaries. Low-volume comic music is synthesized through Web Audio and uses a monster-ID-derived motif; no audio files or network calls are required.
