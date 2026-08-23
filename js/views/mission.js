import { el, button } from '../ui.js';
import {
  currentMission,
  missionAssignments,
  confirmChild,
  missionReady,
  advanceMission,
  undoChild
} from '../game-engine.js';
import {
  formatDuration,
  elapsedMs,
  stepRemainingMs,
  expireStepTimer,
  newStepTimer
} from '../timers.js';
import { t, localized, roleName } from '../i18n.js';

let activeCountdown = null;

function stopCountdown() {
  if (activeCountdown) {
    clearInterval(activeCountdown);
    activeCountdown = null;
  }
}

export function renderMission(root, data, actions) {
  stopCountdown();
  const session = data.activeSession;
  const mission = currentMission(session);
  if (!mission) {
    actions.go('home');
    return;
  }

  if (!session.stepTimer || session.stepTimer.missionId !== mission.id) {
    session.stepTimer = newStepTimer(mission.id);
    actions.save(data);
  }

  const assignments = missionAssignments(session, mission.id);
  const confirmed = session.confirmations[mission.id] || [];
  const completed = session.currentMissionIndex;
  const total = session.missionSnapshots.length;
  const pct = Math.round((completed / total) * 100);
  const healthCount = Math.max(5, Math.min(10, total));
  const alive = Math.max(0, healthCount - Math.round((completed / total) * healthCount));

  const health = el(
    'div',
    { class: 'health', 'aria-label': t('health', { count: alive }) },
    ...Array.from({ length: healthCount }, (_, index) =>
      el('span', { class: `heart ${index < alive ? 'alive' : ''}`, text: '💚' })
    )
  );

  const timerValue = el('strong', {
    class: 'countdown-value',
    text: formatDuration(stepRemainingMs(session.stepTimer))
  });
  const timerBox = el(
    'div',
    { class: 'mission-countdown', 'aria-live': 'polite' },
    el('span', { text: `⏱ ${t('timerLabel')}` }),
    timerValue
  );
  const timerCoach = el('p', {
    class: `timer-coach notice${session.stepTimer.attempts ? '' : ' hidden'}`,
    text: session.stepTimer.attempts > 1 ? t('timerExpiredAgain') : t('timerExpired')
  });

  let expiryBusy = false;
  const tick = async () => {
    if (!timerValue.isConnected) {
      stopCountdown();
      return;
    }
    const current = data.activeSession;
    if (!current?.stepTimer || current.stepTimer.missionId !== mission.id) return;
    const remaining = stepRemainingMs(current.stepTimer);
    timerValue.textContent = formatDuration(remaining);
    timerBox.classList.toggle('urgent', remaining <= 30000 && remaining > 0);

    if (remaining <= 0 && !current.pauseState?.paused && !expiryBusy) {
      expiryBusy = true;
      current.stepTimer = expireStepTimer(current.stepTimer);
      await actions.save(data);
      actions.sound('shotclock');
      const message = current.stepTimer.attempts > 1 ? t('timerExpiredAgain') : t('timerExpired');
      timerCoach.textContent = message;
      timerCoach.classList.remove('hidden');
      actions.notice(message);
      actions.speak(message);
      timerValue.textContent = formatDuration(stepRemainingMs(current.stepTimer));
      timerBox.classList.remove('urgent');
      expiryBusy = false;
    }
  };
  activeCountdown = setInterval(tick, 250);
  tick();

  const confirms = el(
    'div',
    { class: 'heroes-confirm' },
    ...assignments.map((assignment) => {
      const child = data.children.find((item) => item.id === assignment.childId);
      if (!child) return null;
      const done = confirmed.includes(assignment.childId);
      let holdTimer;
      const control = button(
        done ? `${child.displayName} ${t('done')}` : `${child.displayName}: ${t('didPart')}`,
        done ? 'confirm-btn confirmed' : 'confirm-btn btn-primary',
        async () => {
          if (done) return;
          data.activeSession = confirmChild(data.activeSession, mission.id, child.id);
          await actions.save(data);
          actions.sound('confirm');
          actions.go('mission');
        }
      );

      if (done) {
        control.addEventListener('pointerdown', () => {
          holdTimer = setTimeout(async () => {
            data.activeSession = undoChild(data.activeSession, mission.id, child.id);
            await actions.save(data);
            actions.notice(t('undoNotice'));
            actions.go('mission');
          }, 2000);
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach((eventName) => {
          control.addEventListener(eventName, () => clearTimeout(holdTimer));
        });
      }

      return el(
        'div',
        { class: 'hero-confirm-card' },
        el(
          'div',
          { class: 'hero-chip compact' },
          el('span', { class: 'hero-avatar', text: child.avatar }),
          el(
            'div',
            {},
            el('strong', { text: child.displayName }),
            el('div', { text: `${t('role')}: ${roleName(assignment.role)}` })
          )
        ),
        control
      );
    })
  );

  const advance = missionReady(session, mission.id)
    ? button(t('teamContinue'), 'btn-gold', async () => {
        stopCountdown();
        data.activeSession = advanceMission(data.activeSession);
        await actions.save(data);
        actions.go('celebration');
      })
    : el('p', { class: 'notice', text: t('waitBoth') });

  const instruction = localized(mission, 'childInstruction');
  const safety = localized(mission, 'safetyNote');

  root.replaceChildren(
    el(
      'section',
      { class: 'child-screen' },
      el(
        'div',
        { class: 'card mission-layout' },
        el(
          'div',
          {},
          el('div', { class: 'monster messy', text: '👾' }),
          health,
          el('div', { class: 'progress-track' }, el('div', { class: 'progress-fill', style: `width:${pct}%` })),
          el('p', {
            text: t('missionCount', {
              current: completed + 1,
              total,
              time: formatDuration(elapsedMs(session.timer))
            })
          }),
          timerBox,
          timerCoach,
          el('div', { class: 'collectibles', text: (session.rewards || []).map(() => '⭐').join(' ') })
        ),
        el(
          'div',
          {},
          el('div', { class: 'mission-icon', text: mission.icon }),
          el('h1', { text: localized(mission, 'title') }),
          el('p', { text: instruction }),
          safety
            ? el('div', { class: 'warning' }, el('strong', { text: t('safety') }), safety)
            : null,
          el(
            'div',
            { class: 'mission-actions' },
            button(t('hear'), 'btn-secondary', () => actions.speak(instruction)),
            button(t('help'), 'btn-secondary', () => actions.notice(t('helpNotice'))),
            button(t('moreTime'), 'btn-secondary', async () => {
              const attempts = data.activeSession.stepTimer?.attempts || 0;
              data.activeSession.stepTimer = {
                ...newStepTimer(mission.id),
                attempts,
                lastExpiredAt: data.activeSession.stepTimer?.lastExpiredAt || null
              };
              await actions.save(data);
              timerValue.textContent = '5:00';
              timerBox.classList.remove('urgent');
              actions.notice(t('timeNotice'));
            }),
            button(t('pause'), 'btn-secondary', () => actions.pause())
          ),
          confirms,
          advance
        )
      )
    )
  );
}
