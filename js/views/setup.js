import { el, button, field, input } from '../ui.js';
import { hashPin } from '../security.js';
import { safeText, validPin } from '../validation.js';
import { t, setLanguage } from '../i18n.js';

const avatars = ['🦸', '🦸‍♀️', '🧑‍🚀', '🧙', '🥷', '🦹‍♀️', '🧑‍🔧', '🧑‍🎤'];
const titles = ['Room Ranger', 'Cleanup Captain', 'Toy Tamer', 'Book Guardian', 'Floor Defender', 'Bed Builder', 'Stuffie Scout', 'Final Inspector'];

export function renderSetup(root, data, actions) {
  let step = 0;
  let heroes = [
    { name: 'Hero One', avatar: avatars[0] },
    { name: 'Hero Two', avatar: avatars[1] }
  ];
  let pin = '';
  let confirmation = '';
  const maxParticipants = data.appSettings.maxParticipants || 8;

  const draw = () => {
    setLanguage(data.appSettings.language || 'en');
    root.replaceChildren();
    const card = el('section', { class: 'card setup-step' });

    if (step === 0) {
      const language = el(
        'select',
        { 'aria-label': t('interfaceLanguage') },
        el('option', { value: 'en', text: 'English' }),
        el('option', { value: 'es', text: 'Español' })
      );
      language.value = data.appSettings.language || 'en';
      language.onchange = async () => {
        data.appSettings.language = language.value;
        setLanguage(language.value);
        await actions.save(data);
        actions.refreshChrome();
        draw();
      };

      card.append(
        el('label', { class: 'field' }, el('span', { text: t('interfaceLanguage') }), language),
        el('h1', { text: t('setupTitle') }),
        el('p', { text: t('setupIntro') }),
        el('p', { class: 'notice', text: t('participantLimit', { count: maxParticipants }) })
      );

      const heroList = el('div', { class: 'setup-heroes' });
      heroes.forEach((hero, index) => {
        const name = input('text', hero.name);
        name.maxLength = 24;
        name.oninput = () => {
          hero.name = name.value;
        };
        const row = el(
          'div',
          { class: 'setup-hero-row' },
          el('span', { class: 'hero-avatar', text: hero.avatar }),
          field(`${t('heroName')} ${index + 1}`, name)
        );
        if (heroes.length > 2) {
          row.append(
            button(t('removeHero'), 'btn-secondary', () => {
              heroes.splice(index, 1);
              draw();
            })
          );
        }
        heroList.append(row);
      });
      card.append(heroList);

      if (heroes.length < maxParticipants) {
        card.append(
          button(t('moreHeroes'), 'btn-secondary', () => {
            const index = heroes.length;
            heroes.push({ name: `${t('newHero')} ${index + 1}`, avatar: avatars[index % avatars.length] });
            draw();
          })
        );
      }

      card.append(
        button(t('next'), 'btn-primary', () => {
          if (heroes.some((hero) => !hero.name.trim())) return;
          heroes = heroes.map((hero) => ({ ...hero, name: safeText(hero.name, 24) }));
          step = 1;
          draw();
        })
      );
    } else if (step === 1) {
      card.append(el('h1', { text: t('pinTitle') }), el('p', { text: t('pinIntro') }));
      const first = input('password');
      const second = input('password');
      first.inputMode = second.inputMode = 'numeric';
      first.maxLength = second.maxLength = 4;
      first.oninput = () => {
        pin = first.value;
      };
      second.oninput = () => {
        confirmation = second.value;
      };
      card.append(
        field(t('pin4'), first),
        field(t('confirmPin'), second),
        button(t('preview'), 'btn-primary', () => {
          if (!validPin(pin) || pin !== confirmation) {
            actions.notice(t('pinMismatch'));
            return;
          }
          step = 2;
          draw();
        })
      );
    } else {
      card.append(
        el('h1', { text: t('ready') }),
        el(
          'div',
          { class: 'grid hero-preview-grid' },
          ...heroes.map((hero) =>
            el('div', { class: 'hero-chip' }, el('span', { class: 'hero-avatar', text: hero.avatar }), hero.name)
          )
        ),
        el('p', { text: t('setupSummary') }),
        button(t('saveSetup'), 'btn-primary', async () => {
          const security = await hashPin(pin);
          data.children = heroes.map((hero, index) => ({
            id: `child-${index + 1}`,
            displayName: hero.name,
            avatar: hero.avatar,
            color: '#5577c8',
            heroTitle: titles[index % titles.length],
            active: true,
            roleRestrictions: [],
            order: index
          }));
          data.parentSecurity = {
            ...data.parentSecurity,
            ...security,
            failedAttempts: 0,
            lockedUntil: 0
          };
          data.appSettings.setupComplete = true;
          await actions.save(data);
          actions.go('home');
        })
      );
    }

    root.append(card);
  };

  draw();
}
