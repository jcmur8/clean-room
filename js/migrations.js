import { SCHEMA_VERSION, makeDefaultData, factoryMissions, zones, defaultModes } from './defaults.js';

export function migrate(data) {
  let d = structuredClone(data);
  if (!d || typeof d !== 'object') throw new Error('Invalid data');
  if (!d.schemaVersion) d.schemaVersion = 1;

  if (d.schemaVersion === 1) {
    d.rewards = d.rewards || [
      { id: 'team-star', name: 'Team Star', message: 'You worked together!', active: true }
    ];
    d.appSettings = { ...makeDefaultData().appSettings, ...d.appSettings };
    d.schemaVersion = 2;
  }

  if (d.schemaVersion === 2) {
    const defs = makeDefaultData();
    d.appSettings = {
      ...defs.appSettings,
      ...d.appSettings,
      language: d.appSettings?.language || 'en'
    };
    d.missions = (d.missions || []).map((mission) => {
      const factory = factoryMissions.find((item) => item.id === mission.id);
      return factory
        ? {
            ...factory,
            ...mission,
            titleEs: mission.titleEs || factory.titleEs,
            childInstructionEs: mission.childInstructionEs || factory.childInstructionEs,
            parentInstructionEs: mission.parentInstructionEs || factory.parentInstructionEs,
            safetyNoteEs: mission.safetyNoteEs || factory.safetyNoteEs
          }
        : mission;
    });
    d.zones = (d.zones || zones).map((zone) => {
      const factory = zones.find((item) => item.id === zone.id);
      return factory ? { ...factory, ...zone, nameEs: zone.nameEs || factory.nameEs } : zone;
    });
    d.gameModes = (d.gameModes || defaultModes).map((mode) => {
      const factory = defaultModes.find((item) => item.id === mode.id);
      return factory ? { ...factory, ...mode, nameEs: mode.nameEs || factory.nameEs } : mode;
    });
    d.schemaVersion = 3;
  }

  if (d.schemaVersion === 3) {
    const defaults = makeDefaultData();
    d.appSettings = {
      ...defaults.appSettings,
      ...d.appSettings,
      maxParticipants: 8,
      stepCountdownSeconds: 300
    };
    if (d.activeSession && !d.activeSession.stepTimer) {
      const mission = d.activeSession.missionSnapshots?.[d.activeSession.currentMissionIndex];
      if (mission) {
        const now = Date.now();
        d.activeSession.stepTimer = {
          missionId: mission.id,
          durationMs: 300000,
          deadlineAt: now + 300000,
          pausedRemainingMs: null,
          attempts: 0,
          lastExpiredAt: null
        };
      }
    }
    d.schemaVersion = 4;
  }

  if (d.schemaVersion !== SCHEMA_VERSION) {
    throw new Error('Unsupported schema version');
  }
  return d;
}
