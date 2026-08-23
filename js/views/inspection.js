import { el, button } from '../ui.js';
import { t, localized } from '../i18n.js';

export function renderInspectionRequest(root, data, actions) {
  const panel = el(
    'section',
    { class: 'child-screen' },
    el(
      'div',
      { class: 'card', style: 'text-align:center' },
      el('div', { class: 'monster', text: '😴' }),
      el('h1', { text: t('greatTeamwork') }),
      el('p', { text: t('inspectionAsk') }),
      button(
        t('grownInspection'),
        'btn-gold',
        () => actions.requireParent('inspection')
      )
    )
  );

  root.replaceChildren(panel);
}

export function renderInspection(root, data, actions) {
  const session = data.activeSession;

  const missionRows = session.missionSnapshots.map((mission) => {
    const checkbox = el('input', {
      type: 'checkbox',
      value: mission.id
    });

    return el(
      'label',
      { class: 'list-item' },
      checkbox,
      ' ',
      t('returnLook', {
        mission: localized(mission, 'title')
      })
    );
  });

  const missionList = el(
    'div',
    { class: 'list' },
    ...missionRows
  );

  const note = el('textarea', {
    rows: '3',
    placeholder: t('optionalNote')
  });

  const approveButton = button(
    t('approveRoom'),
    'btn-primary',
    () => actions.approveInspection(note.value)
  );

  const returnButton = button(
    t('returnSelected'),
    'btn-gold',
    () => {
      const selected = missionList.querySelectorAll('input:checked');
      const ids = Array.from(selected).map((input) => input.value);

      if (ids.length === 0) {
        actions.notice(t('selectMission'));
        return;
      }

      actions.returnMissions(ids, note.value);
    }
  );

  const panel = el(
    'section',
    { class: 'card' },
    el('h1', { text: t('parentInspection') }),
    el('p', { text: t('inspectionHelp') }),
    missionList,
    el(
      'label',
      { class: 'field' },
      el('span', { text: t('note') }),
      note
    ),
    el(
      'div',
      { class: 'button-row' },
      approveButton,
      returnButton
    )
  );

  root.replaceChildren(panel);
}
