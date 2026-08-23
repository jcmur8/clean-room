import { el, button } from '../ui.js';
import { t, localized } from '../i18n.js';
import { confettiBurst } from '../effects.js';

export function renderCelebration(root, data, actions) {
  const session = data.activeSession;
  const completedIndex = Math.max(0, (session.rewards?.length || 1) - 1);
  const mission = session.missionSnapshots[completedIndex];

  root.replaceChildren(
    el(
      'section',
      { class: 'child-screen' },
      el(
        'div',
        { class: 'card celebrate celebration-stage', style: 'text-align:center' },
        el('div', { class: 'monster celebration-monster', text: '😲' }),
        el('h1', { text: t('zoneRescued') }),
        el('p', {
          text: t('missionComplete', {
            mission: mission ? localized(mission, 'title') : t('missionsWord')
          })
        }),
        el('div', { class: 'collectibles celebration-stars', text: '⭐ ✨ ⭐ ✨ ⭐' }),
        button(t('nextMission'), 'btn-primary', () => {
          if (session.status === 'inspection') {
            actions.go('inspection-request');
          } else if (session.status === 'victory') {
            actions.go('victory');
          } else {
            actions.go('mission');
          }
        })
      )
    )
  );

  actions.sound('celebrate');
  confettiBurst({ count: 52, duration: 1900 });
}
