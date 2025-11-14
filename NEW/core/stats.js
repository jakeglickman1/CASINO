const DEFAULT_STATS = {
  rounds: 0,
  wins: 0,
  losses: 0,
  pushes: 0,
  totalWon: 0,
  totalLost: 0,
  biggestWin: 0,
  currentStreak: 0,
  longestWinStreak: 0,
  longestLossStreak: 0,
  lastGame: null,
  updatedAt: null,
};

const STORAGE_KEY = 'auroraArcade.stats';

function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readFromStorage(key = STORAGE_KEY) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed == null) return null;
    return { ...DEFAULT_STATS, ...parsed };
  } catch (error) {
    console.warn('Unable to read stats from storage', error);
    return null;
  }
}

function writeToStorage(state, key = STORAGE_KEY) {
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn('Unable to persist stats', error);
  }
}

export function createStatsTracker({ storageKey = STORAGE_KEY } = {}) {
  let state = readFromStorage(storageKey) ?? { ...DEFAULT_STATS };
  const listeners = new Set();

  const getSnapshot = () => {
    const rounds = Math.max(0, safeNumber(state.rounds));
    const wins = Math.max(0, safeNumber(state.wins));
    const losses = Math.max(0, safeNumber(state.losses));
    const pushes = Math.max(0, safeNumber(state.pushes));
    const totalWon = Math.max(0, safeNumber(state.totalWon));
    const totalLost = Math.max(0, safeNumber(state.totalLost));
    const winRate = rounds > 0 ? (wins / rounds) * 100 : 0;
    const net = totalWon - totalLost;
    const currentStreak = safeNumber(state.currentStreak);
    const longestWinStreak = Math.max(0, safeNumber(state.longestWinStreak));
    const longestLossStreak = Math.min(0, safeNumber(state.longestLossStreak));

    return {
      rounds,
      wins,
      losses,
      pushes,
      totalWon,
      totalLost,
      net,
      biggestWin: Math.max(0, safeNumber(state.biggestWin)),
      winRate,
      winRateLabel: `${winRate.toFixed(1)}%`,
      totalWonLabel: `${totalWon.toLocaleString()} credits`,
      biggestWinLabel: state.biggestWin > 0 ? `${state.biggestWin.toLocaleString()} credits` : '--',
      netLabel: `${net >= 0 ? '+' : '-'}${Math.abs(net).toLocaleString()} credits`,
      roundsLabel: `${rounds} bet${rounds === 1 ? '' : 's'}`,
      winsLabel: `${wins} win${wins === 1 ? '' : 's'}`,
      currentStreak,
      currentStreakLabel:
        currentStreak === 0
          ? 'Neutral streak'
          : `${currentStreak > 0 ? '+' : '-'}${Math.abs(currentStreak)} ${currentStreak > 0 ? 'win' : 'loss'} streak`,
      longestWinStreak,
      longestLossStreak,
      lastGame: state.lastGame,
      updatedAt: state.updatedAt,
    };
  };

  const emit = () => {
    writeToStorage(state, storageKey);
    const snapshot = getSnapshot();
    listeners.forEach(listener => {
      listener(snapshot);
    });
    return snapshot;
  };

  const record = ({ game, net = 0 } = {}) => {
    if (!Number.isFinite(net) || net === 0) {
      return getSnapshot();
    }
    state.rounds += 1;
    state.lastGame = game || null;
    state.updatedAt = Date.now();

    if (net > 0) {
      state.wins += 1;
      state.totalWon += net;
      state.biggestWin = Math.max(state.biggestWin, net);
      state.currentStreak = state.currentStreak >= 0 ? state.currentStreak + 1 : 1;
      state.longestWinStreak = Math.max(state.longestWinStreak, state.currentStreak);
    } else {
      state.losses += 1;
      state.totalLost += Math.abs(net);
      state.currentStreak = state.currentStreak <= 0 ? state.currentStreak - 1 : -1;
      state.longestLossStreak = Math.min(state.longestLossStreak, state.currentStreak);
    }

    return emit();
  };

  const reset = () => {
    state = { ...DEFAULT_STATS };
    state.updatedAt = Date.now();
    return emit();
  };

  const subscribe = (listener, { immediate = true } = {}) => {
    if (typeof listener !== 'function') return () => {};
    listeners.add(listener);
    if (immediate) {
      listener(getSnapshot());
    }
    return () => listeners.delete(listener);
  };

  return {
    record,
    reset,
    subscribe,
    getSnapshot,
  };
}

export function bindStatsPanel(tracker, root = document) {
  if (!tracker || !root) return null;
  const panel = root.querySelector('[data-stats-panel]');
  if (!panel) return null;

  const registry = {};
  panel.querySelectorAll('[data-stat]').forEach(node => {
    const key = node.dataset.stat;
    if (!key) return;
    if (!registry[key]) {
      registry[key] = [];
    }
    registry[key].push(node);
  });

  const updateNodes = snapshot => {
    if (!snapshot) return;
    const map = {
      winRate: snapshot.winRateLabel,
      rounds: snapshot.roundsLabel,
      wins: snapshot.winsLabel,
      biggestWin: snapshot.biggestWinLabel,
      totalWon: snapshot.totalWonLabel,
      net: snapshot.netLabel,
      streak: snapshot.currentStreakLabel,
      lastGame: snapshot.lastGame || 'No sessions yet',
    };

    Object.entries(map).forEach(([key, value]) => {
      (registry[key] || []).forEach(node => {
        node.textContent = value;
      });
    });
  };

  return tracker.subscribe(updateNodes);
}
