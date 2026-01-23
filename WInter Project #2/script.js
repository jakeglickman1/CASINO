const field = document.getElementById("field");
const playLayer = document.getElementById("play-layer");
const ballEl = document.getElementById("ball");
const offenseScoreEl = document.getElementById("offense-score");
const defenseScoreEl = document.getElementById("defense-score");
const downTextEl = document.getElementById("down-text");
const ballSpotEl = document.getElementById("ball-spot");
const messageEl = document.getElementById("play-message");
const powerFillEl = document.getElementById("power-fill");
const losMarkerEl = document.getElementById("los-marker");
const firstDownMarkerEl = document.getElementById("firstdown-marker");
const routeOverlay = document.getElementById("routes-overlay");
const opponentLabelEl = document.getElementById("opponent-name");
const seasonInfoEl = document.getElementById("season-info");
const awayEndzoneEl = document.getElementById("away-endzone");
const homeScreenEl = document.getElementById("home-screen");
const homeRecordEl = document.getElementById("home-record");
const homeStageEl = document.getElementById("home-stage");
const homeOpponentEl = document.getElementById("home-opponent-name");
const homeMessageEl = document.getElementById("home-screen-message");
const homePlayButton = document.getElementById("home-play-button");
const homeSimButton = document.getElementById("home-sim-button");
const rosterListEl = document.getElementById("roster-list");
const rosterSelectEl = document.getElementById("roster-select");
const draftPicksDisplayEl = document.getElementById("draft-picks-display");
const signPlayerButton = document.getElementById("sign-player");
const releasePlayerButton = document.getElementById("release-player");
const tradePlayerButton = document.getElementById("trade-player");
const cpuDriveIndicator = document.createElement("div");
cpuDriveIndicator.id = "cpu-drive-indicator";
cpuDriveIndicator.className = "cpu-drive-indicator";
cpuDriveIndicator.innerHTML = '<div class="drive-dot"></div><span>CPU Drive</span>';
cpuDriveIndicator.style.display = "none";
field.appendChild(cpuDriveIndicator);

const FIELD_PADDING = 35;
const RECEIVER_PRESETS = [
  { label: "WR1", role: "WR", lane: 0.24, breakLane: 0.15, depth: 220, finalLane: 0.12, finalDepth: 140, speed: 150, color: "#ff9c63" },
  { label: "WR2", role: "WR", lane: 0.38, breakLane: 0.5, depth: 250, finalLane: 0.52, finalDepth: 140, speed: 148, color: "#ffda63" },
  { label: "WR3", role: "WR", lane: 0.62, breakLane: 0.75, depth: 230, finalLane: 0.8, finalDepth: 130, speed: 146, color: "#ffa3d6" },
  { label: "TE", role: "TE", lane: 0.48, breakLane: 0.34, depth: 160, finalLane: 0.4, finalDepth: 80, speed: 143, color: "#fff5a1" },
  { label: "RB", role: "RB", lane: 0.7, breakLane: 0.82, depth: 90, finalLane: 0.88, finalDepth: 50, speed: 138, color: "#9de3ff" },
];
const DEFENDER_LANES = [0.22, 0.34, 0.52, 0.68, 0.82];
const OFFENSIVE_LINE_PRESETS = [
  { label: "LT", lane: 0.42 },
  { label: "LG", lane: 0.5 },
  { label: "RG", lane: 0.58 },
  { label: "RT", lane: 0.66 },
];
const DEFENSIVE_LINE_PRESETS = [
  { label: "DE1", lane: 0.4 },
  { label: "DT1", lane: 0.5 },
  { label: "DT2", lane: 0.6 },
  { label: "DE2", lane: 0.7 },
];
const TEAM_POOL = [
  { name: "Cyclones", difficulty: 1.0 },
  { name: "Gladiators", difficulty: 1.05 },
  { name: "Kodiaks", difficulty: 0.95 },
  { name: "Volt", difficulty: 1.1 },
  { name: "Phantoms", difficulty: 1.08 },
  { name: "Outlaws", difficulty: 1.02 },
  { name: "Lynx", difficulty: 0.92 },
  { name: "Comets", difficulty: 1.12 },
  { name: "Sharks", difficulty: 1.04 },
  { name: "Guardians", difficulty: 0.98 },
];
const PLAYOFF_ROUNDS = ["Semifinal", "Championship"];
const GAME_RULES = {
  regularWeeks: 8,
  drivesPerGame: 6,
  targetScore: 35,
};
const ROUTE_PREVIEW_DURATION = 2000;
const CPU_DRIVE_DEFAULT_DISTANCE = 75;
const CPU_DRIVE_BASE_TD = 0.42;
const CPU_DRIVE_BASE_FG = 0.3;
const CPU_DRIVE_ANIMATION_DURATION = 2.4;
const BASE_DRAFT_PICKS = { 1: 1, 2: 1, 3: 1 };
const ROSTER_MIN_SIZE = 5;
const ROSTER_MAX_SIZE = 12;
const INITIAL_ROSTER_POSITIONS = ["QB", "RB", "WR1", "WR2", "WR3", "TE", "LB", "CB"];
const POSITION_RATING_RANGE = {
  QB: [3, 5],
  RB: [2, 5],
  WR1: [3, 5],
  WR2: [2, 5],
  WR3: [2, 4],
  TE: [2, 4],
  LB: [2, 4],
  CB: [2, 4],
  DL: [2, 4],
  S: [2, 4],
};
const FIRST_NAMES = [
  "Miles",
  "Jalen",
  "Tariq",
  "Devin",
  "Harper",
  "Noah",
  "Cruz",
  "Eli",
  "Caleb",
  "Zane",
  "Roman",
];
const LAST_NAMES = [
  "Hendrix",
  "Langford",
  "Samuels",
  "Holloway",
  "Carver",
  "Bennett",
  "Owens",
  "Porter",
  "Dalton",
  "Monroe",
  "Whitaker",
];

let fieldSize = getFieldSize();

const THROW_MIN_SPEED = 200;
const THROW_MAX_SPEED = 420;
const THROW_CHARGE_TIME = 1.2;

const state = {
  offenseScore: 0,
  defenseScore: 0,
  drive: 1,
  down: 1,
  ballOn: 20,
  nextFirstDown: 30,
  lineOfScrimmage: 20,
  playClock: 0,
  playActive: false,
  keyState: new Set(),
  lastTime: performance.now(),
  players: {
    qb: null,
    receivers: [],
    defenders: [],
    offensiveLine: [],
    defensiveLine: [],
  },
  controlledPlayer: null,
  ball: {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    z: 0,
    vz: 0,
    gravity: -900,
    flightDuration: 0,
    inFlight: false,
    flightTime: 0,
    carrier: null,
    targetPoint: null,
  },
  chargingThrow: false,
  throwCharge: 0,
  pointer: {
    x: 0,
    y: 0,
    inside: false,
  },
  routePreviewVisible: false,
  routePreviewTimeout: null,
  franchise: null,
  cpuDrive: null,
  homeScreen: {
    visible: false,
    busy: false,
    pendingMessage: "",
  },
};

function getFieldSize() {
  const rect = field.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function yardsToX(yards) {
  const playableWidth = fieldSize.width - FIELD_PADDING * 2;
  return FIELD_PADDING + (yards / 100) * playableWidth;
}

function xToYards(x) {
  const playableWidth = fieldSize.width - FIELD_PADDING * 2;
  return clamp(((x - FIELD_PADDING) / playableWidth) * 100, 0, 100);
}

function createPlayer(label, team, role) {
  const el = document.createElement("div");
  el.className = `player ${team} ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "player-avatar";
  const badge = document.createElement("span");
  badge.className = "player-label";
  badge.textContent = label;
  el.appendChild(avatar);
  el.appendChild(badge);
  playLayer.appendChild(el);
  return {
    label,
    team,
    role,
    x: 0,
    y: 0,
    speed: 200,
    baseSpeed: 200,
    element: el,
    routePhase: 0,
    breakPoint: null,
    goPoint: null,
    assignment: null,
  };
}

function createPlayers() {
  state.players.qb = createPlayer("QB", "offense", "qb");
  state.players.qb.speed = 140;
  state.players.qb.baseSpeed = 140;
  state.players.receivers = RECEIVER_PRESETS.map((preset) => {
    const receiver = createPlayer(preset.label, "offense", "receiver");
    receiver.speed = preset.speed;
    receiver.baseSpeed = preset.speed;
    receiver.preset = preset;
    receiver.routeColor = preset.color;
    return receiver;
  });
  state.players.defenders = DEFENDER_LANES.map((lane, index) => {
    const defender = createPlayer(`DB${index + 1}`, "defense", "defender");
    defender.speed = 125 + index * 8;
    defender.baseSpeed = defender.speed;
    defender.lane = lane;
    defender.assignmentIndex = index;
    return defender;
  });
  state.players.offensiveLine = OFFENSIVE_LINE_PRESETS.map((preset) => {
    const blocker = createPlayer(preset.label, "offense", "lineman");
    blocker.speed = 115;
    blocker.baseSpeed = blocker.speed;
    blocker.anchor = { lane: preset.lane };
    return blocker;
  });
  state.players.defensiveLine = DEFENSIVE_LINE_PRESETS.map((preset, index) => {
    const rusher = createPlayer(preset.label, "defense", "lineman");
    rusher.speed = 130 + index * 5;
    rusher.baseSpeed = rusher.speed;
    rusher.anchor = { lane: preset.lane };
    return rusher;
  });
}

function generateSchedule(weeks, seasonNumber = 1) {
  const schedule = [];
  const pool = [...TEAM_POOL];
  for (let i = 0; i < weeks; i += 1) {
    if (pool.length === 0) {
      pool.push(...TEAM_POOL);
    }
    const index = Math.floor(Math.random() * pool.length);
    const team = pool.splice(index, 1)[0];
    const difficultyBoost = 0.05 * Math.min(seasonNumber - 1, 4) + 0.02 * i;
    schedule.push({
      name: team.name,
      difficulty: Math.max(0.85, team.difficulty + difficultyBoost),
    });
  }
  return schedule;
}

function generatePlayoffOpponents(seasonNumber = 1) {
  return PLAYOFF_ROUNDS.map((round, index) => {
    const team = TEAM_POOL[(index + seasonNumber) % TEAM_POOL.length];
    const difficulty = team.difficulty + 0.1 * (index + 1) + 0.06 * seasonNumber;
    return {
      name: `${team.name} ${round === "Championship" ? "Elite" : ""}`.trim(),
      difficulty: Math.min(1.4, difficulty),
    };
  });
}

function getOpponentDifficultyMultiplier() {
  const opponent = state.franchise?.opponent;
  return opponent ? clamp(opponent.difficulty, 0.8, 1.4) : 1;
}

function describeCpuDriveOutcome(outcome, reason) {
  if (outcome === "td") {
    return reason === "short-field"
      ? "Short field: opponent cashes in for six."
      : "Opponent answers with a touchdown.";
  }
  if (outcome === "fg") {
    return reason === "short-field"
      ? "Defense bends but gives up three."
      : "Opponent tacks on a field goal.";
  }
  return reason === "short-field"
    ? "Defense stiffens after the short field."
    : "Defense forces a stop.";
}

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomItem(list) {
  if (!list || list.length === 0) {
    return null;
  }
  return list[Math.floor(Math.random() * list.length)];
}

function getPositionRatingRange(position) {
  return POSITION_RATING_RANGE[position] || [2, 4];
}

function formatRatingStars(rating) {
  const rounded = clamp(Math.round(rating), 1, 5);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function generatePlayer(options = {}) {
  const position = options.position || randomItem(Object.keys(POSITION_RATING_RANGE));
  const [minRating, maxRating] = options.ratingRange || getPositionRatingRange(position);
  const rating = clamp(Math.round(randomInRange(minRating, maxRating)), 1, 5);
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
    position,
    rating,
  };
}

function generateInitialRoster() {
  return INITIAL_ROSTER_POSITIONS.map((position) => generatePlayer({ position }));
}

function cloneDraftPicks(picks) {
  const source = picks || BASE_DRAFT_PICKS;
  return {
    1: source[1] ?? BASE_DRAFT_PICKS[1],
    2: source[2] ?? BASE_DRAFT_PICKS[2],
    3: source[3] ?? BASE_DRAFT_PICKS[3],
  };
}

function ensureDraftPicks(franchise) {
  if (!franchise) {
    return cloneDraftPicks(BASE_DRAFT_PICKS);
  }
  if (!franchise.draftPicks) {
    franchise.draftPicks = cloneDraftPicks(BASE_DRAFT_PICKS);
  }
  return franchise.draftPicks;
}

function getDraftRatingRange(round) {
  if (round === 1) {
    return [4, 5];
  }
  if (round === 2) {
    return [3, 5];
  }
  return [2, 4];
}

function getTradeRoundForRating(rating) {
  if (rating >= 5) {
    return 1;
  }
  if (rating >= 4) {
    return 2;
  }
  return 3;
}

function runSeasonDraft(franchise) {
  if (!franchise) {
    return [];
  }
  const picks = ensureDraftPicks(franchise);
  const summary = [];
  [1, 2, 3].forEach((round) => {
    const pickCount = Math.max(picks[round] || 0, 1);
    for (let i = 0; i < pickCount; i += 1) {
      const rookie = generatePlayer({ ratingRange: getDraftRatingRange(round) });
      franchise.roster.push(rookie);
      summary.push(`R${round}: ${rookie.name} (${rookie.position}) ${rookie.rating}★`);
    }
  });
  franchise.draftPicks = cloneDraftPicks(BASE_DRAFT_PICKS);
  return summary;
}

function rollCpuDriveOutcome(options = {}) {
  const difficulty = getOpponentDifficultyMultiplier();
  const distanceToGoal = clamp(
    options.distanceToGoal ?? CPU_DRIVE_DEFAULT_DISTANCE,
    18,
    95
  );
  const shortFieldBoost = Math.max(0, (90 - distanceToGoal) / 135);
  let tdChance = CPU_DRIVE_BASE_TD * difficulty + shortFieldBoost;
  let fgChance = CPU_DRIVE_BASE_FG * (0.8 + 0.2 * difficulty) + shortFieldBoost * 0.5;
  tdChance = clamp(tdChance, 0.08, 0.85);
  const fgCap = Math.max(0, 0.95 - tdChance);
  if (fgCap <= 0) {
    fgChance = 0;
  } else {
    fgChance = clamp(fgChance, 0.05, fgCap);
  }
  const roll = Math.random();
  let outcome = "stop";
  let points = 0;
  if (roll < tdChance) {
    outcome = "td";
    points = 7;
  } else if (roll < tdChance + fgChance) {
    outcome = "fg";
    points = 3;
  }
  let yardsAdvanced = distanceToGoal * randomInRange(0.35, 0.7);
  if (outcome === "td") {
    yardsAdvanced = distanceToGoal;
  } else if (outcome === "fg") {
    const minGain = distanceToGoal * 0.55;
    yardsAdvanced = Math.max(minGain, distanceToGoal - randomInRange(6, 18));
  }
  yardsAdvanced = clamp(yardsAdvanced, 6, distanceToGoal);
  return {
    outcome,
    points,
    summary: describeCpuDriveOutcome(outcome, options.reason || "standard"),
    distanceToGoal,
    yardsAdvanced,
  };
}

function resetCpuDriveSimulation() {
  state.cpuDrive = null;
  cpuDriveIndicator.style.display = "none";
  cpuDriveIndicator.style.opacity = "0";
}

function startCpuDriveSimulation(options = {}, onComplete) {
  if (state.cpuDrive?.active) {
    finishCpuDriveSimulation();
  }
  const roll = rollCpuDriveOutcome(options);
  const startYard = clamp(roll.distanceToGoal, 5, 95);
  let endYard;
  if (roll.outcome === "td") {
    endYard = 0;
  } else {
    endYard = Math.max(
      roll.outcome === "fg" ? 8 : 18,
      startYard - roll.yardsAdvanced
    );
  }
  const startX = yardsToX(startYard);
  const endX = yardsToX(endYard);
  state.cpuDrive = {
    active: true,
    elapsed: 0,
    duration: CPU_DRIVE_ANIMATION_DURATION,
    startX,
    endX,
    outcome: roll,
    callback: onComplete,
  };
  cpuDriveIndicator.style.display = "flex";
  cpuDriveIndicator.style.opacity = "1";
  cpuDriveIndicator.style.left = `${startX}px`;
  if (options.introMessage) {
    setMessage(options.introMessage);
  } else {
    setMessage("Defense takes the field...");
  }
}

function updateCpuDriveSimulation(dt) {
  const sim = state.cpuDrive;
  if (!sim?.active) {
    return;
  }
  sim.elapsed += dt;
  const ratio = clamp(sim.elapsed / sim.duration, 0, 1);
  const eased = ratio * ratio * (3 - 2 * ratio);
  const currentX = sim.startX + (sim.endX - sim.startX) * eased;
  cpuDriveIndicator.style.left = `${currentX}px`;
  if (ratio >= 1) {
    finishCpuDriveSimulation();
  }
}

function finishCpuDriveSimulation() {
  const sim = state.cpuDrive;
  if (!sim) {
    return;
  }
  state.cpuDrive = null;
  cpuDriveIndicator.style.opacity = "0";
  setTimeout(() => {
    cpuDriveIndicator.style.display = "none";
  }, 260);
  if (sim.outcome.points > 0) {
    state.defenseScore += sim.outcome.points;
  }
  if (typeof sim.callback === "function") {
    sim.callback(sim.outcome.summary);
  }
}

function applyOpponentDifficulty(opponent) {
  const multiplier = opponent ? Math.min(1.4, Math.max(0.8, opponent.difficulty)) : 1;
  state.players.defenders.forEach((player) => {
    player.speed = player.baseSpeed * multiplier;
  });
  state.players.defensiveLine.forEach((player) => {
    player.speed = player.baseSpeed * multiplier;
  });
}

function updateOpponentBranding() {
  const opponentName = state.franchise?.opponent?.name || "CPU";
  if (opponentLabelEl) {
    opponentLabelEl.textContent = opponentName;
  }
  if (awayEndzoneEl) {
    awayEndzoneEl.textContent = opponentName.toUpperCase();
  }
}

function describeFranchiseStage(franchise) {
  if (!franchise) {
    return "Exhibition";
  }
  if (franchise.stage === "regular") {
    return `Week ${Math.min(franchise.week, franchise.regularWeeks)}/${franchise.regularWeeks}`;
  }
  if (franchise.stage === "playoffs") {
    return `Playoffs · ${PLAYOFF_ROUNDS[franchise.playoffRound] || "Final"}`;
  }
  return "Exhibition";
}

function updateSeasonHud() {
  if (!seasonInfoEl) {
    return;
  }
  const franchise = state.franchise;
  if (!franchise) {
    seasonInfoEl.textContent = "Season setup...";
    return;
  }
  const stageLabel = describeFranchiseStage(franchise);
  const opponentName = franchise.opponent ? `vs ${franchise.opponent.name}` : "";
  const recordText = `Record ${franchise.record.wins}-${franchise.record.losses}`;
  const trophyText = franchise.trophies > 0 ? ` · Rings ${franchise.trophies}` : "";
  seasonInfoEl.textContent = `Season ${franchise.season} · ${stageLabel} · ${opponentName} · ${recordText}${trophyText}`;
}

function setHomeScreenMessage(text) {
  if (homeMessageEl) {
    homeMessageEl.textContent = text || "";
  }
}

function updateDraftPicksDisplay() {
  if (!draftPicksDisplayEl) {
    return;
  }
  const picks = state.franchise?.draftPicks || BASE_DRAFT_PICKS;
  const round1 = picks[1] ?? BASE_DRAFT_PICKS[1];
  const round2 = picks[2] ?? BASE_DRAFT_PICKS[2];
  const round3 = picks[3] ?? BASE_DRAFT_PICKS[3];
  draftPicksDisplayEl.textContent = `Draft Picks: R1×${round1} · R2×${round2} · R3×${round3}`;
}

function updateRosterUI() {
  const roster = state.franchise?.roster || [];
  if (rosterListEl) {
    if (roster.length === 0) {
      rosterListEl.innerHTML = '<div class="roster-entry">No players signed yet.</div>';
    } else {
      rosterListEl.innerHTML = roster
        .map(
          (player) => `
            <div class="roster-entry">
              <div><strong>${player.position}</strong> ${player.name}</div>
              <div class="rating-stars">${formatRatingStars(player.rating)}</div>
            </div>`
        )
        .join("");
    }
  }
  if (rosterSelectEl) {
    if (roster.length === 0) {
      rosterSelectEl.innerHTML = '<option value="">No players</option>';
      rosterSelectEl.disabled = true;
    } else {
      rosterSelectEl.disabled = false;
      rosterSelectEl.innerHTML = roster
        .map(
          (player) =>
            `<option value="${player.id}">${player.position} · ${player.name} (${player.rating}★)</option>`
        )
        .join("");
    }
  }
  updateDraftPicksDisplay();
}

function updateHomeScreenPanel(message) {
  const franchise = state.franchise;
  if (!franchise) {
    if (homeRecordEl) {
      homeRecordEl.textContent = "Record 0-0";
    }
    if (homeStageEl) {
      homeStageEl.textContent = "Season setup";
    }
    if (homeOpponentEl) {
      homeOpponentEl.textContent = "CPU";
    }
    setHomeScreenMessage(message);
    return;
  }
  if (homeRecordEl) {
    homeRecordEl.textContent = `Record ${franchise.record.wins}-${franchise.record.losses}`;
  }
  if (homeStageEl) {
    homeStageEl.textContent = `Season ${franchise.season} · ${describeFranchiseStage(franchise)}`;
  }
  if (homeOpponentEl) {
    homeOpponentEl.textContent = franchise.opponent ? franchise.opponent.name : "CPU";
  }
  if (typeof message !== "undefined") {
    setHomeScreenMessage(message);
  }
  updateRosterUI();
}

function showHomeScreen(message) {
  if (!homeScreenEl) {
    return;
  }
  const displayMessage = message ?? state.homeScreen.pendingMessage;
  state.homeScreen.pendingMessage = "";
  updateHomeScreenPanel(displayMessage);
  homeScreenEl.classList.remove("hidden");
  state.homeScreen.visible = true;
  setHomeScreenBusy(false);
}

function hideHomeScreen() {
  if (!homeScreenEl) {
    return;
  }
  homeScreenEl.classList.add("hidden");
  state.homeScreen.visible = false;
  if (homeMessageEl) {
    homeMessageEl.textContent = "";
  }
}

function setHomeScreenBusy(isBusy) {
  state.homeScreen.busy = isBusy;
  if (homePlayButton) {
    homePlayButton.disabled = isBusy;
  }
  if (homeSimButton) {
    homeSimButton.disabled = isBusy;
  }
  if (signPlayerButton) {
    signPlayerButton.disabled = isBusy;
  }
  if (releasePlayerButton) {
    releasePlayerButton.disabled = isBusy || (state.franchise?.roster || []).length === 0;
  }
  if (tradePlayerButton) {
    tradePlayerButton.disabled = isBusy || (state.franchise?.roster || []).length === 0;
  }
  if (rosterSelectEl) {
    rosterSelectEl.disabled = isBusy || (state.franchise?.roster || []).length === 0;
  }
  updateRosterUI();
}

function queueHomeScreenMessage(message) {
  state.homeScreen.pendingMessage = message || "";
}

function appendHomeScreenMessage(message) {
  if (!message) {
    return;
  }
  if (state.homeScreen.pendingMessage) {
    state.homeScreen.pendingMessage = `${state.homeScreen.pendingMessage} ${message}`;
    return;
  }
  state.homeScreen.pendingMessage = message;
}

function getSelectedRosterPlayerId() {
  if (!rosterSelectEl) {
    return null;
  }
  return rosterSelectEl.value || null;
}

function removeRosterPlayer(franchise, playerId) {
  if (!franchise || !playerId) {
    return null;
  }
  const roster = franchise.roster || [];
  const index = roster.findIndex((player) => player.id === playerId);
  if (index === -1) {
    return null;
  }
  const [removed] = roster.splice(index, 1);
  return removed;
}

function signRandomPlayer() {
  const franchise = state.franchise;
  if (!franchise) {
    return;
  }
  const roster = franchise.roster || [];
  if (roster.length >= ROSTER_MAX_SIZE) {
    setHomeScreenMessage("Roster full. Release or trade a player first.");
    return;
  }
  const newPlayer = generatePlayer();
  roster.push(newPlayer);
  updateRosterUI();
  setHomeScreenMessage(`Signed ${newPlayer.name} (${newPlayer.position})`);
}

function releaseSelectedPlayer() {
  const franchise = state.franchise;
  if (!franchise) {
    return;
  }
  const roster = franchise.roster || [];
  if (roster.length <= ROSTER_MIN_SIZE) {
    setHomeScreenMessage("Need to keep core intact. Sign someone before releasing.");
    return;
  }
  const playerId = getSelectedRosterPlayerId();
  const removed = removeRosterPlayer(franchise, playerId);
  if (!removed) {
    setHomeScreenMessage("Select a player to release.");
    return;
  }
  updateRosterUI();
  setHomeScreenMessage(`Released ${removed.name}.`);
}

function tradeSelectedPlayer() {
  const franchise = state.franchise;
  if (!franchise) {
    return;
  }
  const roster = franchise.roster || [];
  if (roster.length <= ROSTER_MIN_SIZE) {
    setHomeScreenMessage("Roster too thin to trade right now.");
    return;
  }
  const playerId = getSelectedRosterPlayerId();
  const removed = removeRosterPlayer(franchise, playerId);
  if (!removed) {
    setHomeScreenMessage("Select a player to trade.");
    return;
  }
  const round = getTradeRoundForRating(removed.rating);
  const picks = ensureDraftPicks(franchise);
  picks[round] = (picks[round] || 0) + 1;
  updateRosterUI();
  setHomeScreenMessage(`Traded ${removed.name} for a round ${round} pick.`);
}

function pickNextOpponent() {
  const franchise = state.franchise;
  if (!franchise) {
    return;
  }
  let opponent = null;
  if (franchise.stage === "regular") {
    opponent = franchise.schedule[Math.min(franchise.week - 1, franchise.schedule.length - 1)];
  } else if (franchise.stage === "playoffs") {
    const fallbackIndex = Math.max(franchise.playoffOpponents.length - 1, 0);
    opponent = franchise.playoffOpponents[franchise.playoffRound] || franchise.playoffOpponents[fallbackIndex];
  }
  if (!opponent) {
    opponent = { name: "CPU", difficulty: 1 };
  }
  franchise.opponent = opponent;
  applyOpponentDifficulty(opponent);
  updateOpponentBranding();
  updateSeasonHud();
  if (state.homeScreen.visible) {
    updateHomeScreenPanel();
  }
}

function resetInGameState() {
  state.playActive = false;
  state.ball.inFlight = false;
  state.ball.carrier = null;
  hideRoutePreview();
  state.offenseScore = 0;
  state.defenseScore = 0;
  state.drive = 1;
  state.down = 1;
  state.ballOn = 20;
  state.lineOfScrimmage = 20;
  state.nextFirstDown = 30;
  updateHud();
  resetCpuDriveSimulation();
}

function prepareMatch() {
  hideHomeScreen();
  resetInGameState();
  startPlay();
}

function setupFormation() {
  const lineX = yardsToX(state.ballOn);
  const qb = state.players.qb;
  qb.x = lineX - 60;
  qb.y = fieldSize.height / 2;
  qb.speed = 140;

  state.players.receivers.forEach((receiver) => {
    const preset = receiver.preset;
    const startY = fieldSize.height * preset.lane;
    const startX = lineX - 20;
    receiver.x = startX;
    receiver.y = startY;
    receiver.routePhase = 0;
    receiver.breakPoint = {
      x: clamp(lineX + preset.depth, FIELD_PADDING + 30, fieldSize.width - FIELD_PADDING - 70),
      y: fieldSize.height * preset.breakLane,
    };
    receiver.goPoint = {
      x: clamp(
        (lineX + preset.depth) + (preset.finalDepth || 100),
        FIELD_PADDING + 50,
        fieldSize.width - FIELD_PADDING - 20
      ),
      y: fieldSize.height * (preset.finalLane ?? preset.breakLane),
    };
    receiver.routePath = [
      { x: startX, y: startY },
      { ...receiver.breakPoint },
      { ...receiver.goPoint },
    ];
  });

  state.players.defenders.forEach((defender, index) => {
    const assignment = state.players.receivers[index] || null;
    defender.assignment = assignment;
    if (assignment) {
      defender.x = clamp(lineX + 30 + index * 10, FIELD_PADDING + 40, fieldSize.width - FIELD_PADDING - 60);
      defender.y = assignment.y - 18;
    } else {
      defender.x = clamp(lineX + 120 + index * 30, FIELD_PADDING + 40, fieldSize.width - FIELD_PADDING - 40);
      defender.y = fieldSize.height * defender.lane;
    }
  });
  state.players.offensiveLine.forEach((blocker, index) => {
    blocker.x = lineX - 25;
    blocker.y = fieldSize.height * blocker.anchor.lane;
    blocker.assignment = state.players.defensiveLine[index] || null;
  });
  state.players.defensiveLine.forEach((rusher) => {
    rusher.x = lineX + 25;
    rusher.y = fieldSize.height * rusher.anchor.lane;
    rusher.assignment = null;
  });

  state.ball.carrier = qb;
  state.ball.inFlight = false;
  state.ball.targetPoint = null;
  state.ball.flightTime = 0;
  state.ball.flightDuration = 0;
  state.playClock = 0;
  state.controlledPlayer = qb;
  state.chargingThrow = false;
  state.throwCharge = 0;
  updatePowerMeter(0);
  state.pointer.x = qb.x;
  state.pointer.y = qb.y;
  state.pointer.inside = true;
  showRoutePreview();
}

function formatDown(down) {
  switch (down) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    default:
      return "4th";
  }
}

function updateHud() {
  offenseScoreEl.textContent = state.offenseScore;
  defenseScoreEl.textContent = state.defenseScore;
  const yardsToGo = Math.max(1, Math.round(state.nextFirstDown - state.ballOn));
  downTextEl.textContent = `${formatDown(state.down)} & ${yardsToGo}`;
  ballSpotEl.textContent = `Ball On: ${Math.round(state.ballOn)}`;
  updateMarkers();
  updateSeasonHud();
}

function updateMarkers() {
  if (!losMarkerEl || !firstDownMarkerEl) {
    return;
  }
  const losX = yardsToX(state.lineOfScrimmage);
  const firstX = yardsToX(Math.min(100, state.nextFirstDown));
  losMarkerEl.style.left = `${losX}px`;
  firstDownMarkerEl.style.left = `${firstX}px`;
}

function setMessage(text) {
  messageEl.textContent = text;
}

function updatePowerMeter(ratio) {
  if (!powerFillEl) {
    return;
  }
  const clampedRatio = clamp(ratio, 0, 1);
  powerFillEl.style.width = `${(clampedRatio * 100).toFixed(1)}%`;
}

function renderRoutePreview() {
  if (!routeOverlay) {
    return;
  }
  routeOverlay.innerHTML = "";
  routeOverlay.setAttribute("viewBox", `0 0 ${fieldSize.width} ${fieldSize.height}`);
  routeOverlay.setAttribute("width", "100%");
  routeOverlay.setAttribute("height", "100%");
  state.players.receivers.forEach((receiver) => {
    if (!receiver.routePath) {
      return;
    }
    const path = receiver.routePath.map((point) => `${point.x},${point.y}`).join(" ");
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", path);
    polyline.setAttribute("class", "route-line");
    if (receiver.routeColor) {
      polyline.style.stroke = receiver.routeColor;
    }
    routeOverlay.appendChild(polyline);
  });
}

function showRoutePreview() {
  if (!routeOverlay) {
    return;
  }
  renderRoutePreview();
  routeOverlay.classList.add("visible");
  state.routePreviewVisible = true;
  if (state.routePreviewTimeout) {
    clearTimeout(state.routePreviewTimeout);
  }
  state.routePreviewTimeout = setTimeout(() => {
    hideRoutePreview();
  }, ROUTE_PREVIEW_DURATION);
}

function hideRoutePreview() {
  if (!routeOverlay || !state.routePreviewVisible) {
    return;
  }
  routeOverlay.classList.remove("visible");
  routeOverlay.innerHTML = "";
  state.routePreviewVisible = false;
  if (state.routePreviewTimeout) {
    clearTimeout(state.routePreviewTimeout);
    state.routePreviewTimeout = null;
  }
}

function updatePointerFromEvent(event) {
  const rect = field.getBoundingClientRect();
  const localX = event.clientX - rect.left;
  const localY = event.clientY - rect.top;
  state.pointer.x = clamp(localX, FIELD_PADDING, fieldSize.width - FIELD_PADDING);
  state.pointer.y = clamp(localY, FIELD_PADDING, fieldSize.height - FIELD_PADDING);
  state.pointer.inside = true;
}

function handleFieldPointerMove(event) {
  updatePointerFromEvent(event);
}

function handleFieldPointerDown(event) {
  if (event.button !== 0) {
    return;
  }
  event.preventDefault();
  updatePointerFromEvent(event);
  startChargingThrow();
}

function handleFieldPointerLeave() {
  state.pointer.inside = false;
}

function handleGlobalPointerUp(event) {
  if (event.button !== 0) {
    return;
  }
  releaseThrow();
}

function startPlay() {
  setupFormation();
  state.playActive = true;
  setMessage(`Drive ${state.drive} · ${formatDown(state.down)} & ${Math.max(1, Math.round(state.nextFirstDown - state.ballOn))}`);
  updateHud();
}

function resetGame() {
  resetFranchiseProgress();
}

function beginSeason(seasonNumber, trophies, carryover = {}) {
  const roster =
    carryover.roster && carryover.roster.length > 0
      ? [...carryover.roster]
      : generateInitialRoster();
  const draftPicks = cloneDraftPicks(carryover.draftPicks || BASE_DRAFT_PICKS);
  state.franchise = {
    season: seasonNumber,
    week: 1,
    regularWeeks: GAME_RULES.regularWeeks,
    stage: "regular",
    record: { wins: 0, losses: 0 },
    playoffRound: 0,
    trophies,
    schedule: generateSchedule(GAME_RULES.regularWeeks, seasonNumber),
    playoffOpponents: [],
    opponent: null,
    roster,
    draftPicks,
  };
  pickNextOpponent();
  showHomeScreen();
}

function advanceSeason() {
  const previous = state.franchise;
  const trophies = previous ? previous.trophies : 0;
  const nextSeason = previous ? previous.season + 1 : 1;
  let carryover = {};
  if (previous) {
    const draftSummary = runSeasonDraft(previous);
    carryover = {
      roster: previous.roster ? [...previous.roster] : [],
      draftPicks: previous.draftPicks ? { ...previous.draftPicks } : cloneDraftPicks(BASE_DRAFT_PICKS),
    };
    const draftMessage =
      draftSummary.length > 0
        ? `Draft haul · ${draftSummary.join(" · ")}`
        : "Draft complete. Roster reloaded for the new season.";
    appendHomeScreenMessage(draftMessage);
  }
  beginSeason(nextSeason, trophies, carryover);
}

function resetFranchiseProgress() {
  beginSeason(1, 0);
}

function canStartThrow() {
  return (
    state.playActive &&
    !state.ball.inFlight &&
    state.ball.carrier === state.players.qb &&
    !state.chargingThrow
  );
}

function startChargingThrow() {
  if (!canStartThrow()) {
    return;
  }
  state.chargingThrow = true;
  state.throwCharge = 0;
  updatePowerMeter(0);
  setMessage("Charging throw... release the click to fire.");
}

function releaseThrow() {
  if (!state.chargingThrow) {
    return;
  }
  const charge = clamp(state.throwCharge, 0, 1);
  state.chargingThrow = false;
  updatePowerMeter(0);
  attemptPass(charge);
}

function attemptPass(powerRatio = 0.5) {
  if (
    !state.playActive ||
    state.ball.inFlight ||
    state.ball.carrier !== state.players.qb
  ) {
    return;
  }
  hideRoutePreview();
  const normalizedPower = clamp(powerRatio, 0, 1);
  const passTarget = {
    x: clamp(state.pointer.x, FIELD_PADDING, fieldSize.width - FIELD_PADDING),
    y: clamp(state.pointer.y, FIELD_PADDING, fieldSize.height - FIELD_PADDING),
  };
  state.ball.targetPoint = passTarget;
  state.ball.inFlight = true;
  state.ball.flightTime = 0;
  state.ball.carrier = null;
  const dx = passTarget.x - state.players.qb.x;
  const dy = passTarget.y - state.players.qb.y;
  const horizontalDistance = Math.hypot(dx, dy) || 1;
  const baseHorizontalSpeed =
    THROW_MIN_SPEED + (THROW_MAX_SPEED - THROW_MIN_SPEED) * normalizedPower;
  const duration = clamp(horizontalDistance / baseHorizontalSpeed, 0.85, 1.45);
  state.ball.flightDuration = duration;
  state.ball.z = 10;
  state.ball.vx = dx / duration;
  state.ball.vy = dy / duration;
  state.ball.vz = -(state.ball.z + 0.5 * state.ball.gravity * duration * duration) / duration;
  setMessage(`Ball in the air · Power ${Math.round(normalizedPower * 100)}%`);
}

function movePlayer(player, dx, dy) {
  player.x = clamp(player.x + dx, FIELD_PADDING, fieldSize.width - FIELD_PADDING);
  player.y = clamp(player.y + dy, FIELD_PADDING, fieldSize.height - FIELD_PADDING);
}

function handleUserMovement(dt) {
  const controlled = state.controlledPlayer;
  if (!controlled) {
    return;
  }
  const horizontal = (state.keyState.has("ArrowRight") ? 1 : 0) -
    (state.keyState.has("ArrowLeft") ? 1 : 0);
  const vertical = (state.keyState.has("ArrowDown") ? 1 : 0) -
    (state.keyState.has("ArrowUp") ? 1 : 0);
  if (horizontal === 0 && vertical === 0) {
    return;
  }
  if (state.routePreviewVisible) {
    hideRoutePreview();
  }
  const sprintMultiplier = state.keyState.has("Shift") ? 1.25 : 1;
  const magnitude = Math.hypot(horizontal, vertical) || 1;
  const speed = controlled.speed * sprintMultiplier * dt;
  movePlayer(
    controlled,
    (horizontal / magnitude) * speed,
    (vertical / magnitude) * speed
  );
}

function moveToward(player, targetX, targetY, speed, dt) {
  const dx = targetX - player.x;
  const dy = targetY - player.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) {
    return;
  }
  movePlayer(player, (dx / distance) * speed * dt, (dy / distance) * speed * dt);
}

function updateReceivers(dt) {
  state.players.receivers.forEach((receiver) => {
    if (state.ball.carrier === receiver) {
      return;
    }
    const target = receiver.routePhase === 0 ? receiver.breakPoint : receiver.goPoint;
    moveToward(receiver, target.x, target.y, receiver.speed, dt);
    const distance = Math.hypot(receiver.x - target.x, receiver.y - target.y);
    if (distance < 6 && receiver.routePhase === 0) {
      receiver.routePhase = 1;
    }
  });
}

function updateTrenchBattles(dt) {
  const qb = state.players.qb;
  state.players.offensiveLine.forEach((blocker) => {
    const targetX = qb.x - 20;
    const targetY = fieldSize.height * blocker.anchor.lane;
    moveToward(blocker, targetX, targetY, 85, dt);
  });
  state.players.defensiveLine.forEach((rusher) => {
    const targetX = qb.x - 4;
    const targetY = fieldSize.height * rusher.anchor.lane;
    moveToward(rusher, targetX, targetY, 120, dt);
  });
  state.players.offensiveLine.forEach((blocker, index) => {
    const rusher = state.players.defensiveLine[index];
    if (!rusher) {
      return;
    }
    const dx = rusher.x - blocker.x;
    const dy = rusher.y - blocker.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 26) {
      const pushX = dx / (distance || 1);
      const pushY = dy / (distance || 1);
      const pushForce = 110 * dt;
      blocker.x -= pushX * pushForce * 0.6;
      blocker.y -= pushY * pushForce * 0.6;
      rusher.x += pushX * pushForce * 0.8;
      rusher.y += pushY * pushForce * 0.8;
    }
  });
}

function updateDefenders(dt) {
  state.players.defenders.forEach((defender) => {
    let targetX = defender.x;
    let targetY = defender.y;
    const assigned = defender.assignment;
    const qb = state.players.qb;
    const coverPhase = !state.ball.carrier || state.ball.carrier === qb || state.ball.inFlight;
    if (assigned && (coverPhase || state.ball.carrier === assigned)) {
      const leadPoint = assigned.routePhase === 0 ? assigned.breakPoint : assigned.goPoint;
      const mix = assigned.routePhase === 0 ? 0.35 : 0.2;
      const cushion = assigned.role === "TE" ? 10 : 14;
      targetX = assigned.x * (1 - mix) + leadPoint.x * mix - cushion;
      targetY = assigned.y * (1 - mix) + leadPoint.y * mix;
    } else if (state.ball.carrier) {
      targetX = state.ball.carrier.x;
      targetY = state.ball.carrier.y;
    } else if (assigned) {
      const anchorY = fieldSize.height * defender.lane;
      targetX = assigned.x - 12;
      targetY = anchorY;
    }
    moveToward(defender, targetX, targetY, defender.speed, dt);
  });
}

function updateBall(dt) {
  if (state.ball.carrier) {
    state.ball.x = state.ball.carrier.x;
    state.ball.y = state.ball.carrier.y - 6;
    state.ball.z = 0;
    state.ball.vz = 0;
    return;
  }
  if (!state.ball.inFlight) {
    state.ball.x = state.players.qb.x;
    state.ball.y = state.players.qb.y - 6;
    state.ball.z = 0;
    state.ball.vz = 0;
    return;
  }
  state.ball.flightTime += dt;
  state.ball.x += state.ball.vx * dt;
  state.ball.y += state.ball.vy * dt;
  state.ball.z += state.ball.vz * dt;
  state.ball.vz += state.ball.gravity * dt;
  if (state.ball.z < 0) {
    state.ball.z = 0;
    state.ball.vz = 0;
  }
  attemptOffensiveCatch();
  if (!state.ball.inFlight) {
    return;
  }
  if (state.ball.targetPoint) {
    const distanceToPoint = Math.hypot(
      state.ball.targetPoint.x - state.ball.x,
      state.ball.targetPoint.y - state.ball.y
    );
    if (distanceToPoint < 8) {
      endPlay("incomplete", state.lineOfScrimmage);
      return;
    }
  }
  if (state.ball.z === 0 && state.ball.flightTime > state.ball.flightDuration) {
    endPlay("incomplete", state.lineOfScrimmage);
    return;
  }
  if (
    state.ball.flightTime > 1.8 ||
    state.ball.x <= FIELD_PADDING ||
    state.ball.x >= fieldSize.width - FIELD_PADDING
  ) {
    endPlay("incomplete", state.lineOfScrimmage);
  }
}

function attemptOffensiveCatch() {
  if (!state.ball.inFlight) {
    return;
  }
  const effectiveRadius = state.ball.z > 10 ? 45 : 18;
  const planeDistance = (player) => Math.hypot(player.x - state.ball.x, player.y - state.ball.y);

  const eligible = state.players.receivers.slice().sort((a, b) => {
    const aDist = planeDistance(a);
    const bDist = planeDistance(b);
    const aLead = Math.hypot(
      state.ball.targetPoint ? state.ball.targetPoint.x - a.x : 0,
      state.ball.targetPoint ? state.ball.targetPoint.y - a.y : 0
    );
    const bLead = Math.hypot(
      state.ball.targetPoint ? state.ball.targetPoint.x - b.x : 0,
      state.ball.targetPoint ? state.ball.targetPoint.y - b.y : 0
    );
    return aLead - bLead || aDist - bDist;
  });

  for (const receiver of eligible) {
    if (planeDistance(receiver) < effectiveRadius) {
      completePass(receiver);
      return;
    }
  }

  const qb = state.players.qb;
  if (
    !state.ball.carrier &&
    state.ball.flightTime > 0.25 &&
    planeDistance(qb) < effectiveRadius * 0.7
  ) {
    state.ball.carrier = qb;
    state.ball.inFlight = false;
    state.ball.targetPoint = null;
    state.controlledPlayer = qb;
    setMessage("QB caught his own pass!");
  }
}

function completePass(receiver) {
  state.ball.carrier = receiver;
  state.ball.inFlight = false;
  state.ball.targetPoint = null;
  state.ball.z = 0;
  state.ball.vz = 0;
  state.controlledPlayer = receiver;
  setMessage(`${receiver.label} hauls it in!`);
}

function handleCollisions() {
  if (!state.ball.carrier) {
    return;
  }
  const carrier = state.ball.carrier;
  const tacklers = [
    ...state.players.defenders,
    ...state.players.defensiveLine,
  ];
  for (const defender of tacklers) {
    const distance = Math.hypot(defender.x - carrier.x, defender.y - carrier.y);
    if (distance < 20) {
      const yardLine = xToYards(carrier.x);
      endPlay("tackle", yardLine);
      return;
    }
  }
}

function handleInterceptions() {
  if (!state.ball.inFlight) {
    return;
  }
  if (state.ball.z > 8) {
    return;
  }
  const defenders = [
    ...state.players.defenders,
    ...state.players.defensiveLine,
  ];
  for (const defender of defenders) {
    const distance = Math.hypot(defender.x - state.ball.x, defender.y - state.ball.y);
    if (distance < 18) {
      state.ball.inFlight = false;
      state.ball.carrier = null;
      setMessage("Picked off!");
      endPlay("turnover", xToYards(defender.x));
      return;
    }
  }
}

function checkForTouchdown() {
  if (!state.ball.carrier) {
    return;
  }
  const yardLine = xToYards(state.ball.carrier.x);
  if (yardLine >= 100) {
    endPlay("touchdown", 100);
  }
}

function endPlay(outcome, yardLine) {
  state.playActive = false;
  state.ball.inFlight = false;
  state.ball.targetPoint = null;
  state.controlledPlayer = state.players.qb;
  state.chargingThrow = false;
  state.throwCharge = 0;
  updatePowerMeter(0);
  hideRoutePreview();
  const yard = clamp(yardLine, 0, 100);

  if (outcome === "touchdown") {
    state.offenseScore += 7;
    state.drive += 1;
    state.ballOn = 20;
    state.lineOfScrimmage = 20;
    state.nextFirstDown = 30;
    state.down = 1;
    const baseMessage = "Touchdown! Defense heads to the field...";
    const finalizeDrive = (cpuSummary) => {
      const combinedMessage = cpuSummary
        ? `Touchdown! ${cpuSummary}`
        : "Touchdown! Defense holds.";
      updateHud();
      if (maybeFinishGame()) {
        setMessage(combinedMessage);
        return;
      }
      setMessage(combinedMessage);
      setTimeout(startPlay, 1400);
    };
    startCpuDriveSimulation({ reason: "kickoff", introMessage: baseMessage }, finalizeDrive);
    return;
  }

  if (outcome === "turnover") {
    state.drive += 1;
    const cpuDistance = clamp(100 - yard, 18, 95);
    state.ballOn = 20;
    state.lineOfScrimmage = 20;
    state.nextFirstDown = 30;
    state.down = 1;
    const introMessage = "Turnover! Defense races out...";
    const finalizeDrive = (cpuSummary) => {
      const combinedMessage = cpuSummary
        ? `Turnover! ${cpuSummary}`
        : "Turnover! Defense holds.";
      updateHud();
      if (maybeFinishGame()) {
        setMessage(combinedMessage);
        return;
      }
      setMessage(combinedMessage);
      setTimeout(startPlay, 1400);
    };
    startCpuDriveSimulation(
      { reason: "short-field", distanceToGoal: cpuDistance, introMessage: introMessage },
      finalizeDrive
    );
    return;
  }

  if (outcome === "incomplete") {
    state.down += 1;
    if (state.down > 4) {
      turnoverOnDowns();
      return;
    }
    setMessage("Incomplete. Back to the huddle.");
    updateHud();
    setTimeout(startPlay, 900);
    return;
  }

  state.ballOn = yard;
  if (state.ballOn >= state.nextFirstDown) {
    state.lineOfScrimmage = state.ballOn;
    state.nextFirstDown = Math.min(100, state.ballOn + 10);
    state.down = 1;
    setMessage("Move the chains! First down.");
  } else {
    state.lineOfScrimmage = state.ballOn;
    state.down += 1;
    if (state.down > 4) {
      turnoverOnDowns();
      return;
    }
    setMessage("Wrapped up. Get ready for the next snap.");
  }
  updateHud();
  setTimeout(startPlay, 900);
}

function turnoverOnDowns() {
  const turnoverSpot = state.ballOn;
  state.drive += 1;
  state.ballOn = 20;
  state.lineOfScrimmage = 20;
  state.nextFirstDown = 30;
  state.down = 1;
  const introMessage = "Turnover on downs. Defense scrambles back out...";
  const finalizeDrive = (cpuSummary) => {
    const combinedMessage = cpuSummary
      ? `Turnover on downs. ${cpuSummary}`
      : "Turnover on downs. Defense stands tall.";
    updateHud();
    if (maybeFinishGame()) {
      setMessage(combinedMessage);
      return;
    }
    setMessage(combinedMessage);
    setTimeout(startPlay, 1200);
  };
  startCpuDriveSimulation(
    {
      reason: "short-field",
      distanceToGoal: clamp(100 - turnoverSpot, 18, 95),
      introMessage,
    },
    finalizeDrive
  );
}

function maybeFinishGame() {
  const franchise = state.franchise;
  if (!franchise) {
    return false;
  }
  const drivesLimitReached = state.drive > GAME_RULES.drivesPerGame;
  const mercyRule =
    state.offenseScore >= GAME_RULES.targetScore ||
    state.defenseScore >= GAME_RULES.targetScore;
  if (!drivesLimitReached && !mercyRule) {
    return false;
  }
  const playerWon = state.offenseScore >= state.defenseScore;
  finalizeMatch(playerWon);
  return true;
}

function finalizeMatch(playerWon, options = {}) {
  state.playActive = false;
  state.ball.inFlight = false;
  hideRoutePreview();
  const franchise = state.franchise;
  const opponentName = franchise?.opponent?.name || "CPU";
  let summary =
    options.summaryOverride ||
    (playerWon ? `You beat the ${opponentName}!` : `Fell to the ${opponentName}.`);

  if (!franchise) {
    setMessage(summary);
    setTimeout(() => showHomeScreen(summary), options.postGameDelay ?? 2000);
    return;
  }

  if (franchise.stage === "regular") {
    if (playerWon) {
      franchise.record.wins += 1;
    } else {
      franchise.record.losses += 1;
    }
    franchise.week += 1;
    const seasonComplete = franchise.week > franchise.regularWeeks;
    if (seasonComplete) {
      const winsNeeded = Math.ceil(franchise.regularWeeks / 2);
      if (franchise.record.wins >= winsNeeded) {
        franchise.stage = "playoffs";
        franchise.playoffRound = 0;
        franchise.playoffOpponents = generatePlayoffOpponents(franchise.season);
        summary += " Playoffs bound!";
        pickNextOpponent();
        setMessage(summary);
        setTimeout(
          () => showHomeScreen(summary),
          options.postGameDelay ?? 2200
        );
        return;
      }
      summary += " Season over. Restarting for a new year.";
      setMessage(summary);
      queueHomeScreenMessage(summary);
      setTimeout(() => advanceSeason(), options.postGameDelay ?? 2400);
      return;
    }
    pickNextOpponent();
    setMessage(summary);
    setTimeout(() => showHomeScreen(summary), options.postGameDelay ?? 1800);
    return;
  }

  if (franchise.stage === "playoffs") {
    if (playerWon) {
      franchise.playoffRound += 1;
      if (franchise.playoffRound >= PLAYOFF_ROUNDS.length) {
        franchise.trophies += 1;
        summary += " Champions!";
        setMessage(summary);
        queueHomeScreenMessage(summary);
        setTimeout(() => advanceSeason(), options.postGameDelay ?? 2500);
        return;
      }
      summary += ` Advancing to the ${PLAYOFF_ROUNDS[franchise.playoffRound]}.`;
      pickNextOpponent();
      setMessage(summary);
      setTimeout(() => showHomeScreen(summary), options.postGameDelay ?? 2000);
      return;
    }
    summary += " Playoff run ends here.";
    setMessage(summary);
    queueHomeScreenMessage(summary);
    setTimeout(() => advanceSeason(), options.postGameDelay ?? 2400);
  }
}

function simulateNextGame() {
  const franchise = state.franchise;
  if (!franchise || state.homeScreen.busy) {
    return;
  }
  if (!franchise.opponent) {
    updateHomeScreenPanel("No opponent available yet.");
    return;
  }
  setHomeScreenBusy(true);
  hideHomeScreen();
  const opponentName = franchise.opponent.name;
  setMessage(`Simulating vs ${opponentName}...`);
  const difficulty = getOpponentDifficultyMultiplier();
  const variance = randomInRange(-0.05, 0.05);
  const baseChance = clamp(0.62 - (difficulty - 1) * 0.75 + variance, 0.18, 0.85);
  const playerWon = Math.random() < baseChance;
  let playerScore = Math.round(randomInRange(20, 38));
  let opponentScore = Math.round(randomInRange(17, 34));
  if (playerWon && playerScore <= opponentScore) {
    playerScore = opponentScore + Math.floor(Math.random() * 6) + 1;
  } else if (!playerWon && opponentScore <= playerScore) {
    opponentScore = playerScore + Math.floor(Math.random() * 6) + 1;
  }
  state.offenseScore = playerScore;
  state.defenseScore = opponentScore;
  updateHud();
  const summary = playerWon
    ? `Sim win! Beat the ${opponentName} ${playerScore}-${opponentScore}.`
    : `Sim loss to the ${opponentName} ${opponentScore}-${playerScore}.`;
  finalizeMatch(playerWon, { summaryOverride: summary, postGameDelay: 1500 });
}

if (homePlayButton) {
  homePlayButton.addEventListener("click", () => {
    if (state.homeScreen.busy) {
      return;
    }
    prepareMatch();
  });
}

if (homeSimButton) {
  homeSimButton.addEventListener("click", () => {
    if (state.homeScreen.busy) {
      return;
    }
    simulateNextGame();
  });
}

if (signPlayerButton) {
  signPlayerButton.addEventListener("click", () => {
    if (state.homeScreen.busy) {
      return;
    }
    signRandomPlayer();
  });
}

if (releasePlayerButton) {
  releasePlayerButton.addEventListener("click", () => {
    if (state.homeScreen.busy) {
      return;
    }
    releaseSelectedPlayer();
  });
}

if (tradePlayerButton) {
  tradePlayerButton.addEventListener("click", () => {
    if (state.homeScreen.busy) {
      return;
    }
    tradeSelectedPlayer();
  });
}

function renderPlayers() {
  const allPlayers = [
    state.players.qb,
    ...state.players.receivers,
    ...state.players.defenders,
    ...state.players.offensiveLine,
    ...state.players.defensiveLine,
  ];
  allPlayers.forEach((player) => {
    player.element.style.left = `${player.x}px`;
    player.element.style.top = `${player.y}px`;
  });
  ballEl.style.left = `${state.ball.x}px`;
  ballEl.style.top = `${state.ball.y - state.ball.z}px`;
}

function handleKeyDown(event) {
  const key = event.key;
  const lower = key.toLowerCase();
  const handled = [
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright",
    "shift",
    "r",
  ];
  if (handled.includes(lower)) {
    event.preventDefault();
  }
  if (key.startsWith("Arrow")) {
    state.keyState.add(key);
  } else if (key === "Shift") {
    state.keyState.add("Shift");
  } else if (lower === "r") {
    resetGame();
  }
}

function handleKeyUp(event) {
  if (event.key.startsWith("Arrow") && state.keyState.has(event.key)) {
    state.keyState.delete(event.key);
  }
  if (event.key === "Shift" && state.keyState.has("Shift")) {
    state.keyState.delete("Shift");
  }
}

function resizeField() {
  const previous = { ...fieldSize };
  fieldSize = getFieldSize();
  if (previous.width === 0) {
    return;
  }
  const scaleX = (fieldSize.width - FIELD_PADDING * 2) / (previous.width - FIELD_PADDING * 2);
  const scaleY = fieldSize.height / previous.height;
  const scalePlayer = (player) => {
    const yards = xToYards(player.x);
    player.x = yardsToX(yards);
    player.y *= scaleY;
  };
  const everyone = [
    state.players.qb,
    ...state.players.receivers,
    ...state.players.defenders,
    ...state.players.offensiveLine,
    ...state.players.defensiveLine,
  ];
  everyone.forEach(scalePlayer);
  state.players.receivers.forEach((receiver) => {
    if (receiver.routePath) {
      receiver.routePath = receiver.routePath.map((point) => ({
        x: yardsToX(xToYards(point.x)),
        y: point.y * scaleY,
      }));
    }
  });
  state.ball.x = yardsToX(xToYards(state.ball.x));
  state.ball.y *= scaleY;
  updateMarkers();
  if (state.controlledPlayer) {
    state.pointer.x = state.controlledPlayer.x;
    state.pointer.y = state.controlledPlayer.y;
  } else {
    state.pointer.x = yardsToX(state.ballOn);
    state.pointer.y = fieldSize.height / 2;
  }
  state.pointer.inside = true;
  if (state.routePreviewVisible) {
    renderRoutePreview();
  }
}

function update(dt) {
  updateCpuDriveSimulation(dt);
  if (state.chargingThrow) {
    state.throwCharge = clamp(
      state.throwCharge + dt / THROW_CHARGE_TIME,
      0,
      1
    );
    updatePowerMeter(state.throwCharge);
  }
  if (state.playActive) {
    state.playClock += dt;
    handleUserMovement(dt);
    updateReceivers(dt);
    updateTrenchBattles(dt);
    updateDefenders(dt);
    updateBall(dt);
    handleInterceptions();
    handleCollisions();
    checkForTouchdown();
  } else if (!state.ball.carrier) {
    state.ball.x = yardsToX(state.ballOn);
    state.ball.y = fieldSize.height / 2;
  }
}

function loop(timestamp) {
  const dt = Math.min((timestamp - state.lastTime) / 1000, 0.05);
  state.lastTime = timestamp;
  update(dt);
  renderPlayers();
  requestAnimationFrame(loop);
}

function init() {
  createPlayers();
  resetFranchiseProgress();
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  field.addEventListener("pointermove", handleFieldPointerMove);
  field.addEventListener("pointerdown", handleFieldPointerDown);
  field.addEventListener("pointerleave", handleFieldPointerLeave);
  window.addEventListener("pointerup", handleGlobalPointerUp);
  window.addEventListener("resize", () => {
    resizeField();
    updateHud();
  });
  requestAnimationFrame(loop);
}

init();
