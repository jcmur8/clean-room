import { fairRotation } from './roles.js';
import { newStepTimer } from './timers.js';

export function selectMissions(data, modeId) {
  const mode = data.gameModes.find((item) => item.id === modeId) ||
    data.gameModes.find((item) => item.defaultMode);
  return (mode?.missionIds || [])
    .map((id) => data.missions.find((mission) => mission.id === id))
    .filter((mission) => mission?.active && !mission.archived);
}

export function createSession(data, modeId, now = Date.now()) {
  const missions = selectMissions(data, modeId).map((mission) => structuredClone(mission));
  const participants = data.children
    .filter((child) => child.active !== false)
    .map((child) => child.id);
  const assignments = fairRotation(data.children, missions, data.roles);
  const firstMission = missions[0];

  return {
    id: crypto.randomUUID?.() || `session-${now}`,
    startedAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    completedAt: null,
    modeSnapshot: structuredClone(data.gameModes.find((mode) => mode.id === modeId)),
    missionSnapshots: missions,
    participants,
    assignments,
    confirmations: {},
    currentMissionIndex: 0,
    pauseState: { paused: false },
    timer: { runningSince: now, accumulatedMs: 0, pausedAt: null },
    stepTimer: firstMission ? newStepTimer(firstMission.id, now) : null,
    rewards: [],
    inspection: {
      required: data.appSettings.inspectionRequired,
      requestedAt: null,
      inspectedAt: null,
      approved: false,
      returnedMissionIds: [],
      note: ''
    },
    status: 'active',
    interrupted: false
  };
}

export function currentMission(session) {
  return session?.missionSnapshots?.[session.currentMissionIndex] || null;
}

export function missionAssignments(session, missionId) {
  return session.assignments.find((item) => item.missionId === missionId)?.assignments || [];
}

export function confirmChild(session, missionId, childId, now = Date.now()) {
  const set = new Set(session.confirmations[missionId] || []);
  set.add(childId);
  return {
    ...session,
    confirmations: { ...session.confirmations, [missionId]: [...set] },
    updatedAt: new Date(now).toISOString()
  };
}

export function undoChild(session, missionId, childId) {
  return {
    ...session,
    confirmations: {
      ...session.confirmations,
      [missionId]: (session.confirmations[missionId] || []).filter((id) => id !== childId)
    }
  };
}

export function missionReady(session, missionId) {
  const ids = missionAssignments(session, missionId).map((assignment) => assignment.childId);
  const confirmations = session.confirmations[missionId] || [];
  return ids.length > 0 && ids.every((id) => confirmations.includes(id));
}

export function advanceMission(session, now = Date.now()) {
  const mission = currentMission(session);
  if (!mission || !missionReady(session, mission.id)) return session;

  const rewards = [...session.rewards, mission.collectibleId];
  const nextIndex = session.currentMissionIndex + 1;

  if (nextIndex >= session.missionSnapshots.length) {
    return {
      ...session,
      rewards,
      stepTimer: null,
      status: session.inspection.required ? 'inspection' : 'victory',
      inspection: {
        ...session.inspection,
        requestedAt: session.inspection.required ? new Date(now).toISOString() : null
      },
      updatedAt: new Date(now).toISOString()
    };
  }

  const nextMission = session.missionSnapshots[nextIndex];
  return {
    ...session,
    rewards,
    currentMissionIndex: nextIndex,
    stepTimer: newStepTimer(nextMission.id, now),
    updatedAt: new Date(now).toISOString()
  };
}

export function returnMissions(session, ids, note = '', now = Date.now()) {
  const indexes = ids
    .map((id) => session.missionSnapshots.findIndex((mission) => mission.id === id))
    .filter((index) => index >= 0);
  const index = indexes.length ? Math.min(...indexes) : 0;
  const mission = session.missionSnapshots[index];

  return {
    ...session,
    currentMissionIndex: index,
    status: 'active',
    stepTimer: mission ? newStepTimer(mission.id, now) : null,
    inspection: {
      ...session.inspection,
      inspectedAt: new Date(now).toISOString(),
      approved: false,
      returnedMissionIds: ids,
      note
    },
    updatedAt: new Date(now).toISOString()
  };
}

export function approveInspection(session, note = '', now = Date.now()) {
  return {
    ...session,
    status: 'victory',
    inspection: {
      ...session.inspection,
      inspectedAt: new Date(now).toISOString(),
      approved: true,
      returnedMissionIds: [],
      note
    },
    updatedAt: new Date(now).toISOString()
  };
}

export function finishSession(session, now = Date.now()) {
  return {
    ...session,
    status: 'complete',
    completedAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString()
  };
}
