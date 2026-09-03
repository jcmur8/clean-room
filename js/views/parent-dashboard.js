import { el, button } from "../ui.js";
import { t, setLanguage, localized, modeName, getLanguage } from "../i18n.js";
import { heroAvatars } from "../defaults.js";
import { heroPortrait, choosePhotoInput } from "../profile-photo.js";

export function renderParentDashboard(
  root,
  data,
  actions,
  section = "dashboard",
) {
  const nav = [
    "dashboard",
    "profiles",
    "missions",
    "modes",
    "rewards",
    "settings",
    "history",
    "data",
  ];
  const shell = el(
    "div",
    { class: "parent-shell" },
    el(
      "nav",
      { class: "parent-nav" },
      ...nav.map((name) =>
        button(t(`nav_${name}`), "btn-secondary", () => actions.goParent(name)),
      ),
    ),
    el("section", { class: "card parent-content" }),
  );
  const content = shell.lastChild;
  content.append(
    el("h1", { text: t("parentSection", { section: t(`nav_${section}`) }) }),
  );

  if (section === "dashboard") renderDashboard(content, data, actions);
  else if (section === "profiles") renderProfiles(content, data, actions);
  else if (section === "missions") renderMissions(content, data, actions);
  else if (section === "modes") renderModes(content, data, actions);
  else if (section === "rewards") renderRewards(content, data, actions);
  else if (section === "settings") renderSettings(content, data, actions);
  else if (section === "history") renderHistory(content, data);
  else if (section === "data") renderDataTools(content, actions);
  root.replaceChildren(shell);
}

function renderDashboard(content, data, actions) {
  content.append(
    el("p", {
      text: t("summary", {
        heroes: data.children.filter((child) => child.active !== false).length,
        missions: data.missions.filter(
          (mission) => mission.active && !mission.archived,
        ).length,
        sessions: data.sessionHistory.length,
      }),
    }),
    el("p", { class: "notice", text: t("autoClose") }),
    button(t("returnChild"), "btn-primary", () => actions.exitParent()),
  );
}

function renderProfiles(content, data, actions) {
  for (const child of data.children) {
    const name = el("input", { value: child.displayName });
    name.value = child.displayName;
    const active = el("input", { type: "checkbox" });
    active.checked = child.active !== false;
    const avatar = el(
      "select",
      { "aria-label": t("chooseAvatar") },
      ...heroAvatars.map((item) => el("option", { value: item, text: item })),
    );
    avatar.value = child.avatar || heroAvatars[0];
    const photoInput = choosePhotoInput(t("takeProfilePhoto"), async (photo) => {
      child.photo = photo;
      await actions.save(data);
      actions.goParent("profiles");
    });
    content.append(
      el(
        "div",
        { class: "list-item editor-row" },
        el("div", { class: "profile-photo-preview" }, heroPortrait(child)),
        el(
          "div",
          { class: "profile-editor-fields" },
          avatar,
          name,
          el("label", {}, active, ` ${t("active")}`),
          el("label", { class: "photo-capture-button" }, `📷 ${t("takeProfilePhoto")}`, photoInput),
          child.photo
            ? button(t("removeProfilePhoto"), "btn-secondary", async () => {
                child.photo = null;
                await actions.save(data);
                actions.goParent("profiles");
              })
            : null,
        ),
        button(t("save"), "btn-primary", async () => {
          child.displayName =
            name.value.trim().slice(0, 24) || child.displayName;
          child.avatar = avatar.value;
          child.active = active.checked;
          await actions.save(data);
          actions.notice(t("profileSaved"));
        }),
      ),
    );
  }
  if (data.children.length < (data.appSettings.maxParticipants || 8)) {
    content.append(
      button(t("addHero"), "btn-secondary", async () => {
        data.children.push({
          id: crypto.randomUUID(),
          displayName: t("newHero"),
          avatar: "🦸",
          photo: null,
          heroTitle: t("roomRanger"),
          active: true,
          roleRestrictions: [],
          order: data.children.length,
        });
        await actions.save(data);
        actions.goParent("profiles");
      }),
    );
  }
}

function renderMissions(content, data, actions) {
  const missions = data.missions.filter((mission) => !mission.archived);
  const controls = new Map();
  const showAddMission = () => {
    const title = el("input", { maxlength: "60", placeholder: t("missionTitle") });
    const instruction = el("textarea", { rows: "4", maxlength: "240", placeholder: t("missionInstruction") });
    const icon = el("input", { maxlength: "4", value: "🎯", "aria-label": t("missionIcon") });
    icon.value = "🎯";
    const modal = el(
      "div",
      { class: "modal", role: "dialog", "aria-modal": "true" },
      el(
        "div",
        { class: "card add-mission-dialog" },
        el("h2", { text: t("addMissionTitle") }),
        el("label", { class: "field" }, el("span", { text: t("missionTitle") }), title),
        el("label", { class: "field" }, el("span", { text: t("missionInstruction") }), instruction),
        el("label", { class: "field" }, el("span", { text: t("missionIcon") }), icon),
        el(
          "div",
          { class: "button-row" },
          button(t("cancel"), "btn-secondary", () => modal.remove()),
          button(t("addMission"), "btn-primary", async () => {
            const missionTitle = title.value.trim();
            const missionInstruction = instruction.value.trim();
            if (!missionTitle || !missionInstruction) {
              actions.notice(t("missionFieldsRequired"));
              return;
            }
            data.missions.push({
              id: crypto.randomUUID(),
              title: missionTitle,
              titleEs: missionTitle,
              childInstruction: missionInstruction,
              childInstructionEs: missionInstruction,
              parentInstruction: missionInstruction,
              parentInstructionEs: missionInstruction,
              safetyNote: "",
              safetyNoteEs: "",
              zoneId: "room",
              icon: icon.value.trim() || "🎯",
              estimatedMinutes: 5,
              difficulty: 1,
              active: true,
              roles: ["Finder"],
              childExclusions: [],
              points: 10,
              collectibleId: "custom-mission",
              inspectionRequired: true,
              archived: false,
            });
            await actions.save(data);
            modal.remove();
            actions.goParent("missions");
            actions.notice(t("missionAdded"));
          }),
        ),
      ),
    );
    document.body.append(modal);
    title.focus();
  };
  const header = el(
    "tr",
    {},
    el("th", { text: t("missionTask") }),
    el("th", { text: t("active") }),
    ...data.gameModes.map((mode) => el("th", { text: modeName(mode) })),
    el("th", { text: t("actions") }),
  );
  const body = missions.map((mission) => {
    const active = el("input", {
      type: "checkbox",
      "aria-label": `${localized(mission, "title")} — ${t("active")}`,
    });
    active.checked = mission.active !== false;
    const modes = new Map();
    for (const mode of data.gameModes) {
      const phase = el(
        "select",
        {
        "aria-label": `${localized(mission, "title")} — ${modeName(mode)}`,
        },
        el("option", { value: "", text: t("notIncluded") }),
        ...Array.from({ length: 8 }, (_, index) =>
          el("option", { value: String(index + 1), text: t("phaseNumber", { number: index + 1 }) }),
        ),
      );
      phase.value = mode.missionIds.includes(mission.id)
        ? String(mode.missionPhases?.[mission.id] || mode.missionIds.indexOf(mission.id) + 1)
        : "";
      modes.set(mode.id, phase);
    }
    controls.set(mission.id, { active, modes });
    return el(
      "tr",
      {},
      el(
        "td",
        { class: "mission-matrix-task" },
        el("strong", { text: `${mission.icon} ${localized(mission, "title")}` }),
        el("small", { text: localized(mission, "childInstruction") }),
      ),
      el("td", { class: "matrix-check" }, active),
      ...data.gameModes.map((mode) =>
        el("td", { class: "matrix-check" }, modes.get(mode.id)),
      ),
      el(
        "td",
        {},
        button(t("deleteMission"), "btn-danger matrix-action", async () => {
          const blockingMode = data.gameModes.find(
            (mode) => mode.missionIds.includes(mission.id) && mode.missionIds.length <= 1,
          );
          if (blockingMode) {
            actions.notice(t("cannotDeleteOnlyMission", { mode: modeName(blockingMode) }));
            return;
          }
          if (!confirm(t("deleteMissionConfirm", { mission: localized(mission, "title") }))) return;
          mission.archived = true;
          mission.active = false;
          for (const mode of data.gameModes) {
            mode.missionIds = mode.missionIds.filter((id) => id !== mission.id);
            if (mode.missionPhases) delete mode.missionPhases[mission.id];
          }
          await actions.save(data);
          actions.goParent("missions");
          actions.notice(t("missionDeleted"));
        }),
      ),
    );
  });
  content.append(
    el("p", { class: "notice", text: t("missionMatrixHelp") }),
    button(t("addMissions"), "btn-primary add-missions-button", showAddMission),
    el(
      "div",
      { class: "mission-matrix-wrap" },
      el("table", { class: "mission-matrix" }, el("thead", {}, header), el("tbody", {}, ...body)),
    ),
    button(t("saveMissionMatrix"), "btn-primary", async () => {
      for (const mode of data.gameModes) {
        const selected = missions.filter(
          (mission) => controls.get(mission.id).modes.get(mode.id).value,
        );
        if (!selected.length) {
          actions.notice(t("modeNeedsMission", { mode: modeName(mode) }));
          return;
        }
      }
      for (const mission of missions) mission.active = controls.get(mission.id).active.checked;
      for (const mode of data.gameModes) {
        mode.missionIds = missions
          .filter((mission) => controls.get(mission.id).modes.get(mode.id).value)
          .map((mission) => mission.id);
        mode.missionPhases = Object.fromEntries(
          mode.missionIds.map((id) => [id, Number(controls.get(id).modes.get(mode.id).value)]),
        );
      }
      await actions.save(data);
      actions.notice(t("missionMatrixSaved"));
    }),
  );
  content.append(
    button(t("restoreFactory"), "btn-gold", () => actions.restoreMissions()),
  );
}

function renderModes(content, data, actions) {
  for (const mode of data.gameModes) {
    const selectable = el("input", { type: "checkbox" });
    selectable.checked = mode.childSelectable;
    const duration = el("input", {
      type: "number",
      min: "1",
      max: "30",
      step: "1",
      value: String(Math.round((mode.missionDurationSeconds || 300) / 60)),
    });
    duration.value = String(
      Math.round((mode.missionDurationSeconds || 300) / 60),
    );
    content.append(
      el(
        "div",
        { class: "list-item editor-row" },
        el(
          "div",
          {},
          el("label", {}, selectable, ` ${modeName(mode)}`),
          el(
            "label",
            { class: "field" },
            el("span", { text: t("minutesPerMission") }),
            duration,
          ),
          el("small", { text: t("modeAssignmentsMoved") }),
        ),
        button(t("save"), "btn-primary", async () => {
          const minutes = Math.max(
            1,
            Math.min(30, Number(duration.value) || 1),
          );
          mode.childSelectable = selectable.checked;
          mode.missionDurationSeconds = Math.round(minutes * 60);
          duration.value = String(minutes);
          await actions.save(data);
          actions.notice(
            t("modeTimerSaved", { mode: modeName(mode), minutes }),
          );
        }),
      ),
    );
  }
}

function renderRewards(content, data, actions) {
  const reward = el("textarea", { rows: "3" });
  reward.value =
    getLanguage() === "es"
      ? data.appSettings.rewardMessageEs || data.appSettings.rewardMessage
      : data.appSettings.rewardMessage;
  content.append(
    el(
      "label",
      { class: "field" },
      el("span", { text: t("familyReward") }),
      reward,
    ),
    button(t("saveReward"), "btn-primary", async () => {
      if (getLanguage() === "es")
        data.appSettings.rewardMessageEs = reward.value.slice(0, 240);
      else data.appSettings.rewardMessage = reward.value.slice(0, 240);
      await actions.save(data);
      actions.notice(t("rewardSaved"));
    }),
  );
}

function renderSettings(content, data, actions) {
  const speech = el("input", { type: "checkbox" });
  speech.checked = data.appSettings.speech;
  const inspection = el("input", { type: "checkbox" });
  inspection.checked = data.appSettings.inspectionRequired;
  const reducedMotion = el("input", { type: "checkbox" });
  reducedMotion.checked = data.appSettings.reducedMotion;
  const language = el(
    "select",
    {},
    el("option", { value: "en", text: "English" }),
    el("option", { value: "es", text: "Español" }),
  );
  language.value = data.appSettings.language || "en";
  const settingCard = (icon, input, title, help) =>
    el(
      "label",
      { class: "setting-card" },
      el("span", { class: "setting-icon", text: icon }),
      el("span", { class: "setting-copy" }, el("strong", { text: title }), el("small", { text: help })),
      el("span", { class: "setting-switch" }, input),
    );
  content.append(
    el(
      "div",
      { class: "settings-grid" },
      settingCard("📡", speech, t("spokenSetting"), t("spokenSettingHelp")),
      settingCard("🔍", inspection, t("inspectSetting"), t("inspectSettingHelp")),
      settingCard("◌", reducedMotion, t("reduceMotion"), t("reduceMotionHelp")),
    ),
    el(
      "label", { class: "setting-language" },
      el("span", { class: "setting-icon", text: "🌐" }),
      el("strong", { text: t("interfaceLanguage") }),
      language,
    ),
    button(t("saveSettings"), "btn-primary", async () => {
      data.appSettings.speech = speech.checked;
      data.appSettings.inspectionRequired = inspection.checked;
      data.appSettings.reducedMotion = reducedMotion.checked;
      data.appSettings.language = language.value;
      setLanguage(language.value);
      await actions.save(data);
      actions.applyAccessibility();
      actions.refreshChrome();
      actions.notice(t("settingsSaved"));
      actions.goParent("settings");
    }),
  );
}

function renderHistory(content, data) {
  if (!data.sessionHistory.length)
    content.append(el("p", { text: t("noBattles") }));
  for (const session of data.sessionHistory.slice(-100).reverse()) {
    const locale = getLanguage() === "es" ? "es-US" : "en-US";
    const status = session.inspection?.approved
      ? t("inspected")
      : t("completed");
    content.append(
      el(
        "div",
        { class: "list-item" },
        el("strong", {
          text: new Date(
            session.completedAt || session.startedAt,
          ).toLocaleString(locale),
        }),
        el("div", {
          text: `${modeName(session.modeSnapshot)} • ${session.missionSnapshots?.length || 0} ${t("missionsWord")} • ${status}`,
        }),
      ),
    );
  }
}

function renderDataTools(content, actions) {
  const file = el("input", { type: "file", accept: "application/json,.json" });
  content.append(
    button(t("exportBackup"), "btn-primary", () => actions.exportBackup()),
    el(
      "label",
      { class: "field" },
      el("span", { text: t("importBackup") }),
      file,
    ),
    button(t("validateImport"), "btn-gold", () =>
      actions.importBackup(file.files?.[0]),
    ),
    el("hr"),
    el("p", { class: "warning", text: t("resetWarning") }),
    button(t("fullReset"), "btn-danger", () => actions.fullReset()),
  );
}
