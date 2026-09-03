import {
  SCHEMA_VERSION,
  makeDefaultData,
  factoryMissions,
  zones,
  defaultModes,
} from "./defaults.js";

export function migrate(data) {
  let d = structuredClone(data);
  if (!d || typeof d !== "object") throw new Error("Invalid data");
  if (!d.schemaVersion) d.schemaVersion = 1;

  if (d.schemaVersion === 1) {
    d.rewards = d.rewards || [
      {
        id: "team-star",
        name: "Team Star",
        message: "You worked together!",
        active: true,
      },
    ];
    d.appSettings = { ...makeDefaultData().appSettings, ...d.appSettings };
    d.schemaVersion = 2;
  }

  if (d.schemaVersion === 2) {
    const defs = makeDefaultData();
    d.appSettings = {
      ...defs.appSettings,
      ...d.appSettings,
      language: d.appSettings?.language || "en",
    };
    d.missions = (d.missions || []).map((mission) => {
      const factory = factoryMissions.find((item) => item.id === mission.id);
      return factory
        ? {
            ...factory,
            ...mission,
            titleEs: mission.titleEs || factory.titleEs,
            childInstructionEs:
              mission.childInstructionEs || factory.childInstructionEs,
            parentInstructionEs:
              mission.parentInstructionEs || factory.parentInstructionEs,
            safetyNoteEs: mission.safetyNoteEs || factory.safetyNoteEs,
          }
        : mission;
    });
    d.zones = (d.zones || zones).map((zone) => {
      const factory = zones.find((item) => item.id === zone.id);
      return factory
        ? { ...factory, ...zone, nameEs: zone.nameEs || factory.nameEs }
        : zone;
    });
    d.gameModes = (d.gameModes || defaultModes).map((mode) => {
      const factory = defaultModes.find((item) => item.id === mode.id);
      return factory
        ? { ...factory, ...mode, nameEs: mode.nameEs || factory.nameEs }
        : mode;
    });
    d.schemaVersion = 3;
  }

  if (d.schemaVersion === 3) {
    const defaults = makeDefaultData();
    d.appSettings = {
      ...defaults.appSettings,
      ...d.appSettings,
      maxParticipants: 8,
      stepCountdownSeconds: 300,
    };
    if (d.activeSession && !d.activeSession.stepTimer) {
      const mission =
        d.activeSession.missionSnapshots?.[d.activeSession.currentMissionIndex];
      if (mission) {
        const now = Date.now();
        d.activeSession.stepTimer = {
          missionId: mission.id,
          durationMs: 300000,
          deadlineAt: now + 300000,
          pausedRemainingMs: null,
          attempts: 0,
          lastExpiredAt: null,
        };
      }
    }
    d.schemaVersion = 4;
  }

  if (d.schemaVersion === 4) {
    const durationDefaults = { quick: 300, normal: 420, deep: 480 };
    d.gameModes = (d.gameModes || defaultModes).map((mode) => ({
      ...mode,
      missionDurationSeconds:
        mode.missionDurationSeconds || durationDefaults[mode.id] || 300,
    }));
    if (d.activeSession) {
      const durationSeconds =
        d.activeSession.modeSnapshot?.missionDurationSeconds ||
        d.activeSession.stepTimer?.durationMs / 1000 ||
        durationDefaults[d.activeSession.modeSnapshot?.id] ||
        300;
      d.activeSession.stepDurationMs = durationSeconds * 1000;
      if (d.activeSession.modeSnapshot) {
        d.activeSession.modeSnapshot.missionDurationSeconds = durationSeconds;
      }
      if (d.activeSession.stepTimer) {
        d.activeSession.stepTimer.halfwayAlerted = false;
      }
    }
    d.schemaVersion = 5;
  }

  if (d.schemaVersion === 5) {
    d.appSettings = {
      ...makeDefaultData().appSettings,
      ...d.appSettings,
      nextMonsterIndex: d.appSettings?.nextMonsterIndex || 0,
    };
    if (d.activeSession && !d.activeSession.monsterId) {
      d.activeSession.monsterId = "mess-gobbler";
    }
    d.schemaVersion = 6;
  }

  if (d.schemaVersion === 6) {
    d.appSettings = {
      ...makeDefaultData().appSettings,
      ...d.appSettings,
      sound: true,
    };
    if (d.activeSession?.stepTimer) {
      d.activeSession.stepTimer.criticalAlerted = false;
      d.activeSession.stepTimer.pauseUsed = false;
    }
    d.schemaVersion = 7;
  }

  if (d.schemaVersion === 7) {
    d.gameModes = (d.gameModes || defaultModes).map((mode) => ({
      ...mode,
      missionPhases:
        mode.missionPhases ||
        Object.fromEntries(
          (mode.missionIds || []).map((id, index) => [id, Math.floor(index / 2) + 1]),
        ),
    }));
    d.children = (d.children || []).map((child) => ({ ...child, photo: child.photo || null }));
    if (d.activeSession && !d.activeSession.phaseSnapshots) {
      d.activeSession.phaseSnapshots = (d.activeSession.missionSnapshots || []).map((mission, index) => ({
        id: `phase-${index + 1}`,
        number: index + 1,
        missionIds: [mission.id],
      }));
      d.activeSession.currentPhaseIndex = d.activeSession.currentMissionIndex || 0;
    }
    d.schemaVersion = 8;
  }

  if (d.schemaVersion === 8) {
    d.appSettings = {
      ...makeDefaultData().appSettings,
      ...d.appSettings,
      defeatedMonsterIds:
        d.appSettings?.defeatedMonsterIds ||
        [...new Set((d.sessionHistory || []).filter((session) => session.status === "complete").map((session) => session.monsterId).filter(Boolean))],
    };
    d.schemaVersion = 9;
  }

  if (d.schemaVersion === 9) {
    const modeDefaults = makeDefaultData().gameModes;
    d.gameModes = (d.gameModes || [])
      .filter((mode) => mode.id !== "normal")
      .map((mode) => {
        const replacement = modeDefaults.find((item) => item.id === mode.id);
        return replacement
          ? {
              ...mode,
              name: replacement.name,
              nameEs: replacement.nameEs,
              defaultMode: mode.id === "quick",
            }
          : mode;
      });
    for (const fallback of modeDefaults) {
      if (!d.gameModes.some((mode) => mode.id === fallback.id))
        d.gameModes.push(structuredClone(fallback));
    }
    if (!d.gameModes.some((mode) => mode.id === d.appSettings.lastModeId))
      d.appSettings.lastModeId = "quick";
    d.schemaVersion = 10;
  }

  if (d.schemaVersion !== SCHEMA_VERSION) {
    throw new Error("Unsupported schema version");
  }
  return d;
}
