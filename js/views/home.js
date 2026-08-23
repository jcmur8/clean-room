import { el, button } from '../ui.js';
import { t } from '../i18n.js';

export function renderHome(root, data, actions) {
  const active = Boolean(
    data.activeSession && data.activeSession.status !== 'complete'
  );

  const heroes = el(
    'div',
    { class: 'grid hero-preview-grid' },
    ...data.children
      .filter((child) => child.active !== false)
      .map((child) =>
        el(
          'div',
          { class: 'hero-chip' },
          el('span', { class: 'hero-avatar', text: child.avatar }),
          el(
            'div',
            {},
            el('strong', { text: child.displayName }),
            el('div', { text: child.heroTitle || t('hero') })
          )
        )
      )
  );

  const startOrResume = async () => {
    await actions.audio();

    let route;
    let params = {};

    if (active) {
      if (data.activeSession.status === 'inspection') {
        route = 'inspection-request';
      } else if (data.activeSession.status === 'victory') {
        route = 'victory';
      } else {
        route = 'mission';
      }
    } else {
      route = data.appSettings.showModeSelection ? 'modes' : 'intro';
      const defaultMode = data.gameModes.find((mode) => mode.defaultMode);
      params = { modeId: defaultMode ? defaultMode.id : 'normal' };
    }

    actions.go(route, params);
  };

  root.replaceChildren(
    el(
      'section',
      { class: 'child-screen' },
      el(
        'div',
        { class: 'card hero-card' },
        el(
          'div',
          {},
          el('div', {
            class: 'monster messy',
            text: active ? '😮' : '👾'
          }),
          el('p', {
            style: 'text-align:center',
            text: active ? t('monsterActive') : t('monsterIdle')
          })
        ),
        el(
          'div',
          {},
          el('h1', {
            text: active ? t('battleProgress') : t('heroesNeed')
          }),
          heroes,
          el('p', {
            text: active ? t('progressSafe') : t('homeStory')
          }),
          button(
            active ? t('resume') : t('start'),
            'btn-primary',
            startOrResume
          )
        )
      )
    )
  );
}
