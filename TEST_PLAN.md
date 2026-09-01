# Test Plan

## v1.10.0 landing menu checks

- Confirm the home screen shows the Hero Cleaners shield and exactly four large primary choices in this order: Parent Zone, Battle, Setting, Comic Books.
- Confirm Parent Zone opens the PIN gate, Battle starts/resumes the battle flow, Setting opens player settings, and Comic Books opens the monster library.
- Tap the menu-music control and confirm a quiet game-menu theme plays; navigate away to confirm it stops, then return home to confirm it resumes.
- Reload once online, switch offline, and confirm the logo and landing screen remain available.

## Automated browser tests
Open `tests/test-runner.html` through the local server. Tests cover role restrictions, mode selection, session snapshot immutability, confirmations, timer pause/resume, lockout model, schema validation, rejected import immutability, v1→v2 migration, storage round-trip, and relative service-worker path construction.

## Manual acceptance checklist
- [ ] Current iPad Safari: complete first-run setup and create a four-digit PIN.
- [ ] Landscape: one mission fits without required page scrolling; controls are comfortably tappable.
- [ ] Portrait and phone: content remains usable.
- [ ] Audio activates only after a deliberate tap; mute state is visible.
- [ ] Speech plays mission text when available and leaves readable text when unavailable.
- [ ] Both child confirmations are required; accidental second taps do not advance the mission.
- [ ] Hold a completed child button for two seconds to undo confirmation.
- [ ] Need More Time has no penalty.
- [ ] Refresh during setup/home/mission/inspection and confirm the stored state resumes.
- [ ] Hide the page for over 30 seconds and confirm hidden time is not counted.
- [ ] Complete first online load, use Airplane Mode, then launch and continue an active mission offline.
- [ ] Add to Home Screen and verify standalone launch.
- [ ] Enable reduced motion and confirm wobble/celebration animation is suppressed.
- [ ] Navigate with keyboard; verify visible focus.
- [ ] Verify buttons and form controls expose meaningful screen-reader labels/text.
- [ ] Fail parent PIN five times and confirm 30-second lockout.
- [ ] Parent inspection can approve or return selected missions; prior child credit remains.
- [ ] Export a backup; import it; verify configuration/history match.
- [ ] Attempt an invalid import and confirm current data is unchanged.
- [ ] Full reset requires two confirmations and exact typed phrase `RESET ROOM MONSTER`.
- [ ] Update service-worker cache version outside an active session and verify update notice/reload behavior.
- [ ] Network panel shows no third-party requests.

## Bilingual acceptance checks

1. From the child home screen, tap **ES** and confirm the home story, controls, connectivity badge, mode selection, battle briefing, mission instructions, safety warning, completion buttons, celebration, inspection request, and victory screen change to Spanish.
2. Reload the browser and relaunch from the iPad Home Screen; confirm the selected language persists.
3. Switch back with **EN** and confirm English returns immediately without changing mission progress.
4. In Parent → Settings, change the interface language and confirm parent navigation, settings, history, backup tools, dialogs, and child mode use the selected language.
5. With speech enabled, tap the mission audio control in both languages and confirm Safari uses an appropriate English or Spanish voice when the device provides one; verify text remains available if speech synthesis has no matching voice.
6. Start a session in one language, switch languages mid-session, and confirm the same session, mission index, confirmations, roles, timer, collectibles, and inspection state remain intact.
7. Migrate an existing schema-v2 backup and confirm profiles/history remain intact and the language defaults to English until changed.

## v1.2 acceptance additions

- [ ] Create 3–8 heroes during first-run setup and confirm all active heroes appear in the battle briefing and mission confirmation controls.
- [ ] Add another hero later under Parent → Profiles and confirm the next new battle snapshots that participant.
- [ ] Verify each mission begins at 5:00 and counts down once per second without making completion dependent on the timer.
- [ ] Let a mission timer reach 0:00; confirm the shot-clock alert plays, encouraging text appears, spoken coaching uses the selected language when speech is enabled, and the countdown resets to 5:00.
- [ ] Let the timer expire twice and confirm it continues to reset without removing points, confirmations, or progress.
- [ ] Press More Time and confirm the current countdown resets to 5:00 without penalty.
- [ ] Pause a battle and verify the per-mission countdown stops; resume and confirm it continues from the remaining time.
- [ ] Hide the page for more than 30 seconds and verify hidden time is excluded from both elapsed and per-mission countdown timing.
- [ ] Complete an intermediate mission and confirm confetti plus a cheerful success jingle; verify reduced-motion mode suppresses confetti.
- [ ] Complete the last mission and confirm its celebration still appears before parent inspection (when inspection is enabled).
- [ ] Reach final victory and confirm the larger celebration and extended fanfare; verify reduced-motion mode remains comfortable.
- [ ] Start a new battle after the deliberate Start Battle tap and confirm the mission-start alarm plays at a moderate volume.
- [ ] Repeat countdown, expiry coaching, and celebration checks in both English and Spanish.


## v1.2.1 Safari inspection fix

Reformatted `js/views/inspection.js` into Safari-friendly multi-line JavaScript and bumped the service-worker cache to `room-monster-v1.2.1`. No data-schema change is required.

## v1.2.2 Safari parent dashboard fix

Verify that the site starts without a `parent-dashboard.js` parse error, all 14 browser tests pass, all service-worker assets resolve, and a previous schema-version-4 installation retains its family data after the cache advances to `room-monster-v1.2.2`.

## Version 1.3 engagement and timer controls

Verify the 5/7/8-minute mode defaults, parent duration editing, schema 4→5 migration, continuous countdown, one-time halfway warning, timer reset using the selected mode duration, emergency start siren, mission-complete applause/growl, and adult-PIN-protected abort flow. Confirm that canceling the final abort prompt preserves the active battle.

## Version 1.4 live mission experience

Verify that the timer changes every second without any button press, remains legible at landscape iPad distance, and retains the selected mode duration. Confirm that action music begins only after audio activation, continues across mission rerenders, and stops outside the active mission. Run four new battles to verify the monster sequence Gobbler → Crawler → Slime → Gobbler. Verify all three images work offline and each child can select and later edit an avatar.

## Version 1.5 battle-console redesign

Verify the monster attack screen automatically deploys the next mission, the automatic command narration runs once per phase, the instruction icon repeats it, and the action music scheduler starts after audio activation. Confirm the help icon opens a large modal with a working X, More Time is absent, icon controls remain on the left, and hero check fields remain on the right. Test the red flashing timer at 1:59 and the normal green timer at 2:00 with reduced-motion both enabled and disabled.

## Version 1.6 comic campaign and tactical rules

Verify all three bilingual origin comics, progressive weakening scales, radio-bed start/end callbacks, and absence of the mute control. Confirm mode mission composition persists and refuses an empty mode. Exercise the 30-second pause to automatic resume, then verify the second-pause modal. Test the 1:59 critical siren only once. At timeout, confirm defeat ends and records the battle; confirm retry restores exactly half the original mode time and preserves the used pause. At inspection, approve with one button or repeat one selected step and verify its confirmations are cleared.

## Version 1.7 mission matrix and case files

Verify Parent → Missions shows one row per mission and one assignment column per mode. Save different combinations, reload, and confirm each battle uses the matching ordered tasks; verify an empty mode is rejected. Confirm Parent → Modes no longer duplicates task checkboxes. Test Settings at desktop, tablet, and phone widths in English and Spanish and confirm labels never overlap. Complete at least three phases against each monster and confirm the between-phase black-and-white detective archive rotates through all three localized origin facts while showing the monster's weakened state.

## Version 1.8 concurrent hero phases

Assign two or more tasks to the same numbered phase in each mode and verify active children receive concurrent orders. Confirm automatic radio narration names each hero and task, the countdown remains at its full value during speech, and the first decrement occurs only after speech ends. Tap each hero card to open and close its bulleted task list, complete all hero checks, and verify the whole phase advances once. Confirm the opening sequence shows only the current monster and name. Rotate through thirteen battles and verify all monsters and bilingual archive stories. Take and remove profile photos during setup and Parent → Profiles; confirm photos appear on home, briefing, and mission screens, survive reload/export/import, and remain local/offline.

## Version 1.9 menu and comic library

With 2, 4, and 8 active players, start Quick Rescue and verify every player receives a distinct task. Check that the home menu opens battle selection, player settings, the Comic Book, and PIN-protected Parent Access. Change every player's emoji and test camera/library photos. Before any victory, confirm all thirteen comic tiles are grayscale, disabled, and unnamed. Complete a battle and finish the victory screen; verify exactly that monster becomes colored and clickable. Read all scenes with Previous/Next, confirm the final hero lesson, switch English/Spanish, verify the matching PDF artwork and text, and confirm quiet background music starts only after user activation and stops when leaving the reader. Test the entire library offline.
