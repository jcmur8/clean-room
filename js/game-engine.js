import { assignRoles } from "./roles.js";
import { newStepTimer, pauseStepTimer } from "./timers.js";
import { monsters } from "./defaults.js";

export function selectMissions(data, modeId) {
  const mode =
    data.gameModes.find((item) => item.id === modeId) ||
    data.gameModes.find((item) => item.defaultMode);
  const selected = (mode?.missionIds || [])
    .map((id) => data.missions.find((mission) => mission.id === id))
    .filter((mission) => mission?.active && !mission.archived);
  if (mode?.id === "quick") {
    const heroCount = data.children.filter((child) => child.active !== false).length;
    const extras = data.missions.filter(
      (mission) => mission.active && !mission.archived && !selected.some((item) => item.id === mission.id),
    );
    while (selected.length < heroCount && extras.length) selected.push(extras.shift());
  }
  return selected;
}

export function createSession(data, modeId, now = Date.now()) {
  const missions = selectMissions(data, modeId).map((mission) =>
    structuredClone(mission),
  );
  const participants = data.children
    .filter((child) => child.active !== false)
    .map((child) => child.id);
  const selectedMode = data.gameModes.find((mode) => mode.id === modeId);
  const phaseMap = selectedMode?.missionPhases || {};
  const grouped = new Map();
  for (const mission of missions) {
    const phaseNumber = selectedMode?.id === "quick"
      ? 1
      : Math.max(1, Number(phaseMap[mission.id]) || missions.indexOf(mission) + 1);
    if (!grouped.has(phaseNumber)) grouped.set(phaseNumber, []);
    grouped.get(phaseNumber).push(mission.id);
  }
  const phaseSnapshots = [...grouped.entries()]
    .sort(([a], [b]) => a - b)
    .map(([number, missionIds], index) => ({ id: `phase-${index + 1}`, number, missionIds }));
  const activeChildren = data.children.filter((child) => child.active !== false);
  const assignments = [];
  phaseSnapshots.forEach((phase, phaseIndex) => {
    const phaseMissions = phase.missionIds.map((id) => missions.find((mission) => mission.id === id));
    const byMission = new Map(phaseMissions.map((mission) => [mission.id, []]));
    activeChildren.forEach((child, childIndex) => {
      const mission = phaseMissions[childIndex % phaseMissions.length];
      const role = assignRoles([child], mission, phaseIndex + childIndex, data.roles)[0]?.role || "Helper";
      byMission.get(mission.id).push({ childId: child.id, role });
    });
    for (const mission of phaseMissions) {
      assignments.push({ missionId: mission.id, assignments: byMission.get(mission.id) });
    }
  });
  const firstPhase = phaseSnapshots[0];
  const stepDurationMs = (selectedMode?.missionDurationSeconds || 300) * 1000;
  const selectedMonster = monsters.find(
    (item) => item.id === data.appSettings.selectedMonsterId,
  );
  const monster =
    selectedMonster ||
    monsters[(data.appSettings.nextMonsterIndex || 0) % monsters.length];

  return {
    id: crypto.randomUUID?.() || `session-${now}`,
    startedAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
    completedAt: null,
    modeSnapshot: structuredClone(selectedMode),
    missionSnapshots: missions,
    phaseSnapshots,
    currentPhaseIndex: 0,
    participants,
    assignments,
    confirmations: {},
    currentMissionIndex: 0,
    pauseState: { paused: false },
    timer: { runningSince: now, accumulatedMs: 0, pausedAt: null },
    stepDurationMs,
    monsterId: monster.id,
    awaitingInstructions: true,
    stepTimer: firstPhase
      ? pauseStepTimer(newStepTimer(firstPhase.id, now, stepDurationMs), now)
      : null,
    rewards: [],
    inspection: {
      required: data.appSettings.inspectionRequired,
      requestedAt: null,
      inspectedAt: null,
      approved: false,
      returnedMissionIds: [],
      note: "",
    },
    status: "active",
    interrupted: false,
  };
}

export function currentMission(session) {
  const phase = currentPhase(session);
  const id = phase?.missionIds?.[0];
  return session?.missionSnapshots?.find((mission) => mission.id === id) ||
    session?.missionSnapshots?.[session.currentMissionIndex] || null;
}

export function currentPhase(session) {
  if (session?.phaseSnapshots?.length) {
    return session.phaseSnapshots[session.currentPhaseIndex || 0] || null;
  }
  const mission = session?.missionSnapshots?.[session.currentMissionIndex];
  return mission ? { id: mission.id, number: (session.currentMissionIndex || 0) + 1, missionIds: [mission.id] } : null;
}

export function phaseMissions(session) {
  const phase = currentPhase(session);
  return (phase?.missionIds || [])
    .map((id) => session.missionSnapshots.find((mission) => mission.id === id))
    .filter(Boolean);
}

export function phaseAssignments(session) {
  const phase = currentPhase(session);
  const byChild = new Map();
  for (const missionId of phase?.missionIds || []) {
    for (const assignment of missionAssignments(session, missionId)) {
      if (!byChild.has(assignment.childId)) byChild.set(assignment.childId, []);
      byChild.get(assignment.childId).push({ ...assignment, missionId });
    }
  }
  return [...byChild.entries()].map(([childId, tasks]) => ({ childId, tasks }));
}

export function missionAssignments(session, missionId) {
  return (
    session.assignments.find((item) => item.missionId === missionId)
      ?.assignments || []
  );
}

export function confirmChild(session, missionId, childId, now = Date.now()) {
  const set = new Set(session.confirmations[missionId] || []);
  set.add(childId);
  return {
    ...session,
    confirmations: { ...session.confirmations, [missionId]: [...set] },
    updatedAt: new Date(now).toISOString(),
  };
}

export function undoChild(session, missionId, childId) {
  return {
    ...session,
    confirmations: {
      ...session.confirmations,
      [missionId]: (session.confirmations[missionId] || []).filter(
        (id) => id !== childId,
      ),
    },
  };
}

export function missionReady(session, missionId) {
  const ids = missionAssignments(session, missionId).map(
    (assignment) => assignment.childId,
  );
  const confirmations = session.confirmations[missionId] || [];
  return ids.length > 0 && ids.every((id) => confirmations.includes(id));
}

export function confirmPhaseChild(session, childId, now = Date.now()) {
  let next = session;
  const hero = phaseAssignments(session).find((item) => item.childId === childId);
  for (const task of hero?.tasks || []) next = confirmChild(next, task.missionId, childId, now);
  return next;
}

export function phaseReady(session) {
  const heroes = phaseAssignments(session);
  return heroes.length > 0 && heroes.every((hero) =>
    hero.tasks.every((task) => (session.confirmations[task.missionId] || []).includes(hero.childId)),
  );
}

export function advanceMission(session, now = Date.now()) {
  const missions = phaseMissions(session);
  if (!missions.length || !phaseReady(session)) return session;
  const rewards = [...session.rewards, ...missions.map((mission) => mission.collectibleId)];
  const nextPhaseIndex = (session.currentPhaseIndex || 0) + 1;

  if (nextPhaseIndex >= (session.phaseSnapshots?.length || session.missionSnapshots.length)) {
    return {
      ...session,
      rewards,
      lastCompletedPhaseIndex: session.currentPhaseIndex || 0,
      stepTimer: null,
      status: session.inspection.required ? "inspection" : "victory",
      inspection: {
        ...session.inspection,
        requestedAt: session.inspection.required
          ? new Date(now).toISOString()
          : null,
      },
      updatedAt: new Date(now).toISOString(),
    };
  }

  const nextPhase = session.phaseSnapshots[nextPhaseIndex];
  const nextMissionIndex = session.missionSnapshots.findIndex((mission) => mission.id === nextPhase.missionIds[0]);
  return {
    ...session,
    rewards,
    lastCompletedPhaseIndex: session.currentPhaseIndex || 0,
    currentPhaseIndex: nextPhaseIndex,
    currentMissionIndex: Math.max(0, nextMissionIndex),
    lastAutoSpokenMissionId: null,
    awaitingInstructions: true,
    stepTimer: pauseStepTimer(newStepTimer(nextPhase.id, now, session.stepDurationMs), now),
    updatedAt: new Date(now).toISOString(),
  };
}

export function returnMissions(session, ids, note = "", now = Date.now()) {
  const indexes = ids
    .map((id) =>
      session.missionSnapshots.findIndex((mission) => mission.id === id),
    )
    .filter((index) => index >= 0);
  const index = indexes.length ? Math.min(...indexes) : 0;
  const mission = session.missionSnapshots[index];
  const phaseIndex = session.phaseSnapshots?.findIndex((phase) =>
    phase.missionIds.some((id) => ids.includes(id)),
  );
  const phase = phaseIndex >= 0 ? session.phaseSnapshots[phaseIndex] : null;
  const confirmations = { ...session.confirmations };
  for (const id of ids) delete confirmations[id];

  return {
    ...session,
    currentMissionIndex: index,
    currentPhaseIndex: phaseIndex >= 0 ? phaseIndex : index,
    status: "active",
    confirmations,
    lastAutoSpokenMissionId: null,
    stepTimer: mission
      ? newStepTimer(phase?.id || mission.id, now, session.stepDurationMs)
      : null,
    inspection: {
      ...session.inspection,
      inspectedAt: new Date(now).toISOString(),
      approved: false,
      returnedMissionIds: ids,
      note,
    },
    updatedAt: new Date(now).toISOString(),
  };
}

export function approveInspection(session, note = "", now = Date.now()) {
  return {
    ...session,
    status: "victory",
    inspection: {
      ...session.inspection,
      inspectedAt: new Date(now).toISOString(),
      approved: true,
      returnedMissionIds: [],
      note,
    },
    updatedAt: new Date(now).toISOString(),
  };
}

export function finishSession(session, now = Date.now()) {
  return {
    ...session,
    status: "complete",
    completedAt: new Date(now).toISOString(),
    updatedAt: new Date(now).toISOString(),
  };
}
