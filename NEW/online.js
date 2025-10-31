(function () {
  const STARTING_CREDITS = 1000;
  let credits = STARTING_CREDITS;

  const creditsDisplay = document.getElementById('onlineCredits');
  if (!creditsDisplay) return;

  const resetBtn = document.getElementById('onlineReset');
  const historyEl = document.getElementById('onlineHistory');

  // Crash elements
  const crashBetInput = document.getElementById('crashBet');
  const crashButton = document.getElementById('crashButton');
  const crashStatus = document.getElementById('crashStatus');
  const crashMultiplierEl = document.getElementById('crashMultiplier');
  const crashProgressBar = document.getElementById('crashProgress');
  const crashRocket = document.getElementById('crashRocket');
  const crashTrail = document.getElementById('crashTrail');
  const crashAutoBtn = document.getElementById('crashAutoCash');

  // Mines elements
  const minesBetInput = document.getElementById('minesBet');
  const minesCountSelect = document.getElementById('minesCount');
  const minesStartBtn = document.getElementById('minesStart');
  const minesCashOutBtn = document.getElementById('minesCashOut');
  const minesStatus = document.getElementById('minesStatus');
  const minesGridEl = document.getElementById('minesGrid');
  const minesSafeEl = document.getElementById('minesSafe');
  const minesMultiplierEl = document.getElementById('minesMultiplier');
  const minesAutoBtn = document.getElementById('minesAutoCash');

  // Limbo elements
  const limboBetInput = document.getElementById('limboBet');
  const limboTargetInput = document.getElementById('limboTarget');
  const limboButton = document.getElementById('limboButton');
  const limboStatus = document.getElementById('limboStatus');
  const limboPointer = document.getElementById('limboPointer');
  const limboThreshold = document.getElementById('limboThreshold');
  const limboResultEl = document.getElementById('limboResult');

  // Crossy elements
  const crossyBetInput = document.getElementById('crossyBet');
  const crossyStartBtn = document.getElementById('crossyStart');
  const crossyHopBtn = document.getElementById('crossyHop');
  const crossyBailBtn = document.getElementById('crossyBail');
  const crossyStatus = document.getElementById('crossyStatus');
  const crossyLanesEl = document.getElementById('crossyLanes');
  const crossyPlayerEl = document.getElementById('crossyPlayer');
  const crossyTrafficEl = document.getElementById('crossyTraffic');
  const crossyLaneEl = document.getElementById('crossyLane');
  const crossyMultiplierEl = document.getElementById('crossyMultiplier');

  // Horse racing elements
  const horseBetInput = document.getElementById('horseBet');
  const horsePickSelect = document.getElementById('horsePick');
  const horseStartBtn = document.getElementById('horseStart');
  const horseCheerBtn = document.getElementById('horseCheer');
  const horseStatus = document.getElementById('horseStatus');
  const horseTrackEl = document.getElementById('horseTrack');

  // Plinko elements
  const plinkoBetInput = document.getElementById('plinkoBet');
  const plinkoLaneSelect = document.getElementById('plinkoLane');
  const plinkoDropBtn = document.getElementById('plinkoDrop');
  const plinkoStatus = document.getElementById('plinkoStatus');
  const plinkoBoardEl = document.getElementById('plinkoBoard');
  const plinkoPegsEl = document.getElementById('plinkoPegs');
  const plinkoPuckEl = document.getElementById('plinkoPuck');
  const plinkoSlotEl = document.getElementById('plinkoSlot');
  const plinkoMultiplierEl = document.getElementById('plinkoMultiplier');

  // Skee-ball elements
  const skeeBetInput = document.getElementById('skeeBet');
  const skeeRollBtn = document.getElementById('skeeRoll');
  const skeeStatus = document.getElementById('skeeStatus');
  const skeeBallEl = document.getElementById('skeeBall');
  const skeeSlotEl = document.getElementById('skeeSlot');
  const skeeMultiplierEl = document.getElementById('skeeMultiplier');

  // Memory elements
  const memoryBetInput = document.getElementById('memoryBet');
  const memoryStartBtn = document.getElementById('memoryStart');
  const memoryGuessBtn = document.getElementById('memoryGuess');
  const memoryStatus = document.getElementById('memoryStatus');
  const memoryGridEl = document.getElementById('memoryGrid');
  const memoryRoundEl = document.getElementById('memoryRound');
  const memoryStreakEl = document.getElementById('memoryStreak');
  const resultModalEl = document.getElementById('resultModal');
  const resultModalTitleEl = document.getElementById('resultModalTitle');
  const resultModalMessageEl = document.getElementById('resultModalMessage');
  const resultModalCloseBtn = document.getElementById('resultModalClose');
  const resultModalBackdropEl = document.getElementById('resultModalBackdrop');

  const crashState = {
    active: false,
    timer: null,
    bet: 0,
    crashPoint: 0,
    current: 1,
    maxDisplay: 4.5,
    autoEnabled: false,
    autoTarget: 0,
  };

  const minesState = {
    active: false,
    bet: 0,
    bombs: 0,
    bombSet: new Set(),
    revealed: new Set(),
    safeRevealed: 0,
    multiplier: 1,
    hit: false,
    autoEnabled: false,
    autoTarget: 0,
  };

  const limboState = {
    animating: false,
  };

  const HORSE_RUNNERS = [
    { id: 'nova', name: 'Nova' },
    { id: 'comet', name: 'Comet' },
    { id: 'eclipse', name: 'Eclipse' },
  ];

  const PLINKO_MULTIPLIERS = [5, 3.2, 2.2, 0.2, 0.2, 2.2, 3.2, 5];
  const PLINKO_ROWS = PLINKO_MULTIPLIERS.length - 1;
  const SKEE_MULTIPLIERS = [0.6, 1.2, 1.8, 3.2];
  const SKEE_POSITIONS = [
    { x: -38, y: -165 },
    { x: -12, y: -185 },
    { x: 14, y: -205 },
    { x: 36, y: -225 },
  ];
  const MEMORY_GRID_SIZE = 16;

  const crossyState = {
    active: false,
    totalLanes: 5,
    bet: 0,
    lane: 0,
    lanes: [],
    multiplier: 1,
    themes: [],
    trafficTimers: [],
    scriptedDeath: null,
  };

  const horseState = {
    active: false,
    bet: 0,
    selection: '',
    timer: null,
    horses: [],
    cheerUsed: false,
  };

  const plinkoState = {
    animating: false,
    bet: 0,
    timer: null,
    path: [],
    step: 0,
    resultIndex: 2,
  };

  const skeeState = {
    active: false,
    bet: 0,
    targetIndex: null,
    timer: null,
  };

  const memoryState = {
    active: false,
    bet: 0,
    pattern: [],
    revealTimers: [],
    awaitingGuess: false,
    round: 0,
    streak: 0,
    scriptedWin: false,
  };

  // ---------------------------------------------------------------------------
  // Utility helpers
  function updateCredits() {
    creditsDisplay.textContent = credits.toLocaleString();
  }

  function flashCredits(tone = 'neutral') {
    creditsDisplay.classList.remove('status-positive', 'status-negative', 'status-neutral', 'pulse');
    const className =
      tone === 'positive' ? 'status-positive' : tone === 'negative' ? 'status-negative' : 'status-neutral';
    creditsDisplay.classList.add(className);
    void creditsDisplay.offsetWidth;
    creditsDisplay.classList.add('pulse');
    setTimeout(() => {
      creditsDisplay.classList.remove('status-positive', 'status-negative', 'status-neutral', 'pulse');
    }, 650);
  }

  function setStatus(element, message, tone = 'neutral') {
    if (!element) return;
    element.textContent = message;
    element.classList.remove('status-positive', 'status-negative', 'status-neutral', 'pulse');
    const className =
      tone === 'positive' ? 'status-positive' : tone === 'negative' ? 'status-negative' : 'status-neutral';
    element.classList.add(className);
    void element.offsetWidth;
    element.classList.add('pulse');
    setTimeout(() => element.classList.remove('pulse'), 650);
  }

  function logEvent(game, message, net = 0) {
    if (!historyEl) return;
    const entry = document.createElement('div');
    entry.className = 'history-entry';
    const netLabel =
      Number.isFinite(net) && net !== 0 ? ` · Net ${net >= 0 ? '+' : ''}${net.toLocaleString()} credits` : '';
    entry.innerHTML = `<strong>${game}</strong><span>${message}${netLabel}</span>`;
    historyEl.prepend(entry);
    entry.classList.add('pulse');
    setTimeout(() => entry.classList.remove('pulse'), 700);
    while (historyEl.children.length > 20) {
      historyEl.removeChild(historyEl.lastChild);
    }
  }

  function showResultModal({ game, bet = 0, payout = 0, tone = 'neutral', message = '' }) {
    if (!resultModalEl || !resultModalTitleEl || !resultModalMessageEl) return;
    const net = payout - bet;
    let heading;
    if (net > 0) heading = 'You won!';
    else if (net < 0) heading = 'You lost.';
    else heading = 'Round pushed.';

    const summary =
      net > 0
        ? `${game} paid ${payout.toLocaleString()} credits (net +${net.toLocaleString()}).`
        : net < 0
          ? `${game} cost ${Math.abs(net).toLocaleString()} credits.`
          : `${game} returned your stake.`;
    const detail = message ? `${message} ${summary}` : summary;

    if (tone === 'positive') resultModalEl.dataset.tone = 'positive';
    else if (tone === 'negative') resultModalEl.dataset.tone = 'negative';
    else delete resultModalEl.dataset.tone;

    resultModalTitleEl.textContent = heading;
    resultModalMessageEl.textContent = detail;
    resultModalEl.classList.add('is-visible');
    resultModalEl.setAttribute('aria-hidden', 'false');
    if (resultModalCloseBtn) {
      setTimeout(() => resultModalCloseBtn.focus(), 60);
    }
  }

  function hideResultModal() {
    if (!resultModalEl) return;
    if (!resultModalEl.classList.contains('is-visible')) return;
    resultModalEl.classList.remove('is-visible');
    resultModalEl.setAttribute('aria-hidden', 'true');
    delete resultModalEl.dataset.tone;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function weightedChoice(weights) {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * total;
    for (let i = 0; i < weights.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) return i;
    }
    return weights.length - 1;
  }

  function applyStake(amount) {
    if (amount > credits) return false;
    credits -= amount;
    updateCredits();
    flashCredits('negative');
    return true;
  }

  function resetStatusMessages() {
    setStatus(crashStatus, 'Ready for launch.');
    setStatus(minesStatus, 'Arm the grid to begin.');
    setStatus(limboStatus, 'Pick a number and test the cosmos.');
    setStatus(crossyStatus, 'Arm a run to begin.');
    setStatus(horseStatus, 'Select a runner and start the race.');
    setStatus(plinkoStatus, 'Select a lane and drop the puck.');
    setStatus(skeeStatus, 'Lock a bet and send the sphere flying.');
    setStatus(memoryStatus, 'Watch the tiles pulse and lock in the sequence.');
  }

  // ---------------------------------------------------------------------------
  // Crash logic
  function updateCrashAutoButton() {
    if (!crashAutoBtn) return;
    if (crashState.autoEnabled && crashState.autoTarget >= 1.1) {
      crashAutoBtn.classList.add('is-active');
      crashAutoBtn.textContent = `Auto cash @ ${crashState.autoTarget.toFixed(2)}x`;
    } else {
      crashAutoBtn.classList.remove('is-active');
      crashAutoBtn.textContent = 'Auto cash out';
    }
  }

  function updateCrashButton() {
    if (!crashButton) return;
    if (crashState.active) {
      crashButton.textContent = `Cash out (${crashState.current.toFixed(2)}x)`;
      crashButton.disabled = false;
    } else {
      crashButton.textContent = 'Launch';
      crashButton.disabled = false;
    }
  }

  function resetCrashVisuals() {
    if (crashMultiplierEl) crashMultiplierEl.textContent = '1.00x';
    if (crashProgressBar) crashProgressBar.style.width = '0%';
    if (crashRocket) {
      crashRocket.textContent = '🚀';
      crashRocket.style.bottom = '12px';
    }
    if (crashTrail) crashTrail.style.height = '0px';
    crashState.current = 1;
    updateCrashButton();
    updateCrashAutoButton();
  }

  function endCrashRound(outcome) {
    clearInterval(crashState.timer);
    crashState.timer = null;
    crashState.active = false;
    updateCrashButton();
    updateCrashAutoButton();

    if (outcome === 'crash' && crashRocket) {
      crashRocket.textContent = '💥';
      setTimeout(() => {
        crashRocket.textContent = '🚀';
        crashRocket.style.bottom = '12px';
        if (crashTrail) crashTrail.style.height = '0px';
        resetCrashVisuals();
      }, 800);
    } else if (crashRocket) {
      crashRocket.style.bottom = '140px';
      if (crashTrail) crashTrail.style.height = '120px';
      setTimeout(resetCrashVisuals, 900);
    } else {
      resetCrashVisuals();
    }
  }

  function finishCrashRound({ outcome, payout, message, tone }) {
    const bet = crashState.bet;
    const net = payout - bet;
    if (payout > 0) {
      credits += payout;
      updateCredits();
      flashCredits(tone === 'positive' ? 'positive' : 'neutral');
    }
    setStatus(crashStatus, message, tone);
    logEvent('Orbital Crash', message, net);
    showResultModal({
      game: 'Orbital Crash',
      bet,
      payout,
      message,
      tone,
    });
    crashState.bet = 0;
    endCrashRound(outcome);
  }

  function startCrashRound() {
    if (crashState.active) return;
    const rawBet = Number(crashBetInput ? crashBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 20) {
      setStatus(crashStatus, 'Minimum launch bet is 20 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 20) * 20;
    if (!applyStake(bet)) {
      setStatus(crashStatus, 'Not enough lounge credits for that launch.', 'negative');
      return;
    }

    resetCrashVisuals();
    crashState.active = true;
    crashState.bet = bet;
    crashState.current = 1;
    crashState.crashPoint = Number((Math.random() * 3 + 1.6).toFixed(2));
    crashState.maxDisplay = Math.max(crashState.crashPoint + 1.2, 4.5);
    setStatus(crashStatus, 'Launching... hit cash out before the rocket blows!', 'neutral');
    updateCrashButton();
    updateCrashAutoButton();

    crashState.timer = setInterval(() => {
      const delta = 0.02 + (crashState.current - 1) * 0.025;
      crashState.current = Number((crashState.current + delta).toFixed(2));
      if (crashState.current > crashState.maxDisplay) {
        crashState.current = crashState.maxDisplay;
      }

      if (crashMultiplierEl) crashMultiplierEl.textContent = `${crashState.current.toFixed(2)}x`;
      if (crashProgressBar) {
        const progress = Math.min(100, ((crashState.current - 1) / (crashState.maxDisplay - 1)) * 100);
        crashProgressBar.style.width = `${progress}%`;
      }
      if (crashRocket) {
        const bottom = 12 + ((crashState.current - 1) / (crashState.maxDisplay - 1)) * 120;
        crashRocket.style.bottom = `${Math.min(bottom, 140)}px`;
      }
      if (crashTrail) {
        const trailHeight = Math.max(0, ((crashState.current - 1) / (crashState.maxDisplay - 1)) * 110);
        crashTrail.style.height = `${Math.min(trailHeight, 120)}px`;
      }

      updateCrashButton();
      if (
        crashState.autoEnabled &&
        crashState.autoTarget >= 1.1 &&
        crashState.current >= crashState.autoTarget
      ) {
        cashOutCrash();
        return;
      }

      if (crashState.current >= crashState.crashPoint) {
        crashState.current = crashState.crashPoint;
        if (crashMultiplierEl) crashMultiplierEl.textContent = `${crashState.current.toFixed(2)}x`;
        finishCrashRound({
          outcome: 'crash',
          payout: 0,
          message: `Rocket imploded at ${crashState.crashPoint.toFixed(2)}x. Maybe next orbit.`,
          tone: 'negative',
        });
      }
    }, 70);
  }

  function cashOutCrash() {
    if (!crashState.active) return;
    crashState.active = false;
    clearInterval(crashState.timer);
    crashState.timer = null;

    const multiplier = Math.max(crashState.current, 1);
    const payout = Math.round(crashState.bet * multiplier);
    finishCrashRound({
      outcome: 'cashout',
      payout,
      message: `You bailed at ${multiplier.toFixed(2)}x and pocketed ${payout.toLocaleString()} credits!`,
      tone: 'positive',
    });
  }

  // ---------------------------------------------------------------------------
  // Mines logic
  function buildMinesGrid() {
    if (!minesGridEl) return;
    minesGridEl.innerHTML = '';
    for (let i = 0; i < 25; i += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'mines-cell';
      cell.dataset.index = i.toString();
      cell.dataset.state = 'hidden';
      minesGridEl.appendChild(cell);
    }
  }

  function updateMinesAutoButton() {
    if (!minesAutoBtn) return;
    if (minesState.autoEnabled && minesState.autoTarget > 0) {
      minesAutoBtn.classList.add('is-active');
      minesAutoBtn.textContent = `Auto cash @ ${minesState.autoTarget.toFixed(2)}x`;
    } else {
      minesAutoBtn.classList.remove('is-active');
      minesAutoBtn.textContent = 'Auto cash out';
    }
    minesAutoBtn.disabled = false;
  }

  function resetMinesBoard() {
    minesState.active = false;
    minesState.bet = 0;
    minesState.bombs = 0;
    minesState.bombSet.clear();
    minesState.revealed.clear();
    minesState.safeRevealed = 0;
    minesState.multiplier = 1;
    minesState.hit = false;
    if (minesGridEl) {
      minesGridEl.querySelectorAll('.mines-cell').forEach(cell => {
        cell.disabled = true;
        cell.textContent = '';
        cell.dataset.state = 'hidden';
        cell.classList.remove('pulse');
      });
    }
    if (minesSafeEl) minesSafeEl.textContent = '0';
    if (minesMultiplierEl) minesMultiplierEl.textContent = '1.00x';
    if (minesCashOutBtn) minesCashOutBtn.disabled = true;
    if (minesStartBtn) minesStartBtn.disabled = false;
    updateMinesAutoButton();
  }

  function updateMinesInfo() {
    if (minesSafeEl) minesSafeEl.textContent = minesState.safeRevealed.toString();
    if (minesMultiplierEl) minesMultiplierEl.textContent = `${minesState.multiplier.toFixed(2)}x`;
  }

  function revealAllBombs(triggerIndex = null) {
    if (!minesGridEl) return;
    minesGridEl.querySelectorAll('.mines-cell').forEach(cell => {
      const index = Number(cell.dataset.index);
      if (minesState.bombSet.has(index)) {
        cell.dataset.state = 'hit';
        cell.textContent = index === triggerIndex ? '💥' : '💣';
      }
      cell.disabled = true;
    });
  }

  function finishMinesRound({ payout = 0, message, tone }) {
    minesState.active = false;
    if (payout > 0) {
      credits += payout;
      updateCredits();
      flashCredits(tone === 'positive' ? 'positive' : 'neutral');
    }
    updateMinesInfo();
    if (minesCashOutBtn) minesCashOutBtn.disabled = true;
    if (minesStartBtn) minesStartBtn.disabled = false;
    const bet = minesState.bet;
    const net = payout - bet;
    setStatus(minesStatus, message, tone);
    logEvent('Meteor Mines', message, net);
    showResultModal({
      game: 'Meteor Mines',
      bet,
      payout,
      message,
      tone,
    });
    minesState.bet = 0;
    updateMinesAutoButton();
  }

  function adjacentBombs(index) {
    const row = Math.floor(index / 5);
    const col = index % 5;
    let count = 0;
    for (let r = row - 1; r <= row + 1; r += 1) {
      for (let c = col - 1; c <= col + 1; c += 1) {
        if (r < 0 || c < 0 || r >= 5 || c >= 5 || (r === row && c === col)) continue;
        const idx = r * 5 + c;
        if (minesState.bombSet.has(idx)) count += 1;
      }
    }
    return count;
  }

  function handleMinesCellClick(event) {
    if (!minesState.active) return;
    const cell = event.target.closest('.mines-cell');
    if (!cell || cell.dataset.state === 'revealed' || cell.dataset.state === 'hit') return;

    const index = Number(cell.dataset.index);
    if (!Number.isInteger(index)) return;

    if (minesState.bombSet.has(index)) {
      cell.dataset.state = 'hit';
      cell.textContent = '💥';
      minesState.hit = true;
      revealAllBombs(index);
      finishMinesRound({
        payout: 0,
        message: 'Meteor strike! The wager vaporised.',
        tone: 'negative',
      });
      return;
    }

    const neighbors = adjacentBombs(index);
    cell.dataset.state = 'revealed';
    cell.disabled = true;
    cell.textContent = '✨';
    if (neighbors === 0) cell.classList.add('pulse');

    minesState.safeRevealed += 1;
    const boost = 0.35 + minesState.bombs * 0.03;
    minesState.multiplier = Number((1 + minesState.safeRevealed * boost).toFixed(2));
    updateMinesInfo();

    if (
      minesState.autoEnabled &&
      minesState.autoTarget > 0 &&
      minesState.safeRevealed > 0 &&
      minesState.multiplier >= minesState.autoTarget
    ) {
      setTimeout(() => {
        if (minesState.active) {
          cashOutMines();
        }
      }, 180);
    }

    const safeTotal = 25 - minesState.bombs;
    if (minesState.safeRevealed >= safeTotal) {
      revealAllBombs();
      const payout = Math.round(minesState.bet * minesState.multiplier);
      finishMinesRound({
        payout,
        message: `Board cleared! You collect ${payout.toLocaleString()} credits.`,
        tone: 'positive',
      });
    } else {
      setStatus(
        minesStatus,
        `${minesState.safeRevealed} safe tile${minesState.safeRevealed === 1 ? '' : 's'} uncovered.`,
        'neutral',
      );
    }
  }

  function startMinesRound() {
    if (minesState.active) return;

    const rawBet = Number(minesBetInput ? minesBetInput.value : 0);
    const bombCount = Number(minesCountSelect ? minesCountSelect.value : 5);
    if (!Number.isFinite(rawBet) || rawBet < 20) {
      setStatus(minesStatus, 'Minimum stake is 20 credits.', 'negative');
      return;
    }
    if (!Number.isFinite(bombCount) || bombCount < 1 || bombCount >= 10) {
      setStatus(minesStatus, 'Pick a meteor count between 1 and 9.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 10) * 10;
    if (!applyStake(bet)) {
      setStatus(minesStatus, 'Not enough lounge credits for that run.', 'negative');
      return;
    }

    minesState.active = true;
    minesState.bet = bet;
    minesState.bombs = bombCount;
    minesState.bombSet.clear();
    minesState.revealed.clear();
    minesState.safeRevealed = 0;
    minesState.multiplier = 1;
    minesState.hit = false;

    const bombSet = new Set();
    while (bombSet.size < bombCount) {
      bombSet.add(Math.floor(Math.random() * 25));
    }
    minesState.bombSet = bombSet;

    if (minesGridEl) {
      minesGridEl.querySelectorAll('.mines-cell').forEach(cell => {
        cell.disabled = false;
        cell.textContent = '';
        cell.dataset.state = 'hidden';
        cell.classList.remove('pulse');
      });
    }
    if (minesCashOutBtn) minesCashOutBtn.disabled = false;
    if (minesStartBtn) minesStartBtn.disabled = true;
    updateMinesAutoButton();

    updateMinesInfo();
    setStatus(minesStatus, 'Grid armed. Reveal tiles or cash out early.', 'neutral');
  }

  function cashOutMines() {
    if (!minesState.active) return;
    let payout;
    if (minesState.safeRevealed === 0) {
      payout = minesState.bet;
      revealAllBombs();
      finishMinesRound({
        payout,
        message: 'No tiles revealed. Stake returned.',
        tone: 'neutral',
      });
      return;
    }

    payout = Math.round(minesState.bet * Math.max(1.05, minesState.multiplier));
    revealAllBombs();
    finishMinesRound({
      payout,
      message: `You cashed out with ${minesState.safeRevealed} safe tiles for ${payout.toLocaleString()} credits.`,
      tone: 'positive',
    });
  }

  // ---------------------------------------------------------------------------
  // Limbo logic
  function resetLimboVisuals() {
    if (limboPointer) limboPointer.style.left = '0%';
    if (limboThreshold) limboThreshold.style.left = '0%';
    if (limboResultEl) limboResultEl.textContent = '--';
  }

  function playLimboRound() {
    if (limboState.animating) return;
    const rawBet = Number(limboBetInput ? limboBetInput.value : 0);
    const rawTarget = Number(limboTargetInput ? limboTargetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 10) {
      setStatus(limboStatus, 'Minimum limbo bet is 10 credits.', 'negative');
      return;
    }
    if (!Number.isFinite(rawTarget) || rawTarget < 1.2) {
      setStatus(limboStatus, 'Set a target of at least 1.2x.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 5) * 5;
    if (!applyStake(bet)) {
      setStatus(limboStatus, 'Not enough lounge credits for that target.', 'negative');
      return;
    }

    const maxMultiplier = 6;
    const target = Math.min(rawTarget, maxMultiplier);
    const result = Number((1 + Math.random() * (maxMultiplier - 1)).toFixed(2));
    const thresholdPercent = Math.min(100, (target / maxMultiplier) * 100);
    const resultPercent = Math.min(100, (result / maxMultiplier) * 100);

    limboState.animating = true;
    if (limboButton) limboButton.disabled = true;
    if (limboPointer) {
      limboPointer.style.transition = 'none';
      limboPointer.style.left = '0%';
      void limboPointer.offsetWidth;
      limboPointer.style.transition = 'left 0.6s ease';
      limboPointer.style.left = `${resultPercent}%`;
    }
    if (limboThreshold) limboThreshold.style.left = `${thresholdPercent}%`;

    setTimeout(() => {
      if (limboResultEl) limboResultEl.textContent = `${result.toFixed(2)}x`;
      const success = result >= target;
      let payout = 0;
      let tone = 'negative';
      let message = '';

      if (success) {
        payout = Math.round(bet * target);
        credits += payout;
        updateCredits();
        flashCredits('positive');
        tone = 'positive';
        message = `Nice! Beam hit ${result.toFixed(2)}x over your ${target.toFixed(2)}x target.`;
      } else {
        message = `Beam fizzled at ${result.toFixed(2)}x, below your ${target.toFixed(2)}x target.`;
      }

      setStatus(limboStatus, message, tone);
      logEvent('Limbo Line', message, payout - bet);
      showResultModal({
        game: 'Limbo Line',
        bet,
        payout,
        message,
        tone,
      });

      limboState.animating = false;
      if (limboButton) limboButton.disabled = false;
    }, 650);
  }

  // ---------------------------------------------------------------------------
  // Photon Skee-Ball
  function resetSkeeUI() {
    clearTimeout(skeeState.timer);
    skeeState.timer = null;
    skeeState.active = false;
    skeeState.bet = 0;
    skeeState.targetIndex = null;
    if (skeeBallEl) skeeBallEl.style.transform = 'translate(-50%, 0)';
    if (skeeSlotEl) skeeSlotEl.textContent = '--';
    if (skeeMultiplierEl) skeeMultiplierEl.textContent = '1.00x';
    if (skeeRollBtn) skeeRollBtn.disabled = false;
    if (skeeBetInput) skeeBetInput.disabled = false;
  }

  function finishSkeeRound({ payout, message, tone }) {
    skeeState.active = false;
    if (payout > 0) {
      credits += payout;
      updateCredits();
      flashCredits(tone === 'positive' ? 'positive' : 'neutral');
    }
    const bet = skeeState.bet;
    const net = payout - bet;
    setStatus(skeeStatus, message, tone);
    logEvent('Photon Skee-Ball', message, net);
    showResultModal({
      game: 'Photon Skee-Ball',
      bet,
      payout,
      message,
      tone,
    });
    setTimeout(() => resetSkeeUI(), 750);
  }

  function rollSkeeBall() {
    if (skeeState.active) return;
    const rawBet = Number(skeeBetInput ? skeeBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 20) {
      setStatus(skeeStatus, 'Minimum skee-ball stake is 20 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 10) * 10;
    if (!applyStake(bet)) {
      setStatus(skeeStatus, 'Not enough lounge credits for that roll.', 'negative');
      return;
    }

    skeeState.active = true;
    skeeState.bet = bet;
    if (skeeRollBtn) skeeRollBtn.disabled = true;
    if (skeeBetInput) skeeBetInput.disabled = true;
    setStatus(skeeStatus, 'Sphere launched—tracking the arc...', 'neutral');

    const outcome = weightedChoice([5, 3, 2, 1]);
    skeeState.targetIndex = outcome;
    const pos = SKEE_POSITIONS[outcome];
    if (skeeBallEl) {
      skeeBallEl.style.transform = 'translate(-50%, 0) translate(' + pos.x + '%, ' + pos.y + '%)';
    }

    clearTimeout(skeeState.timer);
    skeeState.timer = setTimeout(() => {
      const multiplier = SKEE_MULTIPLIERS[outcome];
      if (skeeSlotEl) {
        const labels = ['20', '40', '80', '150'];
        skeeSlotEl.textContent = labels[outcome] || '--';
      }
      if (skeeMultiplierEl) skeeMultiplierEl.textContent = multiplier.toFixed(2) + 'x';
      const payout = Math.round(bet * multiplier);
      const tone = payout > bet ? 'positive' : payout === bet ? 'neutral' : 'negative';
      let message;
      if (multiplier <= 0.8) {
        message = 'Ball clipped the low ring—house keeps a slice.';
      } else if (multiplier < 2) {
        message = 'Solid toss! Ring multiplies your stake to ' + payout.toLocaleString() + ' credits.';
      } else {
        message = 'Jackpot arc! Highest ring beams ' + payout.toLocaleString() + ' credits.';
      }
      finishSkeeRound({ payout, message, tone });
    }, 750);
  }

  if (skeeRollBtn) skeeRollBtn.addEventListener('click', rollSkeeBall);

  // ---------------------------------------------------------------------------
  // Memory Matrix
  function buildMemoryGrid() {
    if (!memoryGridEl || memoryGridEl.children.length === MEMORY_GRID_SIZE) return;
    memoryGridEl.innerHTML = '';
    for (let i = 0; i < MEMORY_GRID_SIZE; i += 1) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'memory-tile';
      tile.disabled = true;
      tile.dataset.index = i.toString();
      memoryGridEl.appendChild(tile);
    }
  }

  function cancelMemoryTimers() {
    memoryState.revealTimers.forEach(timer => clearTimeout(timer));
    memoryState.revealTimers.length = 0;
  }

  function clearMemoryHighlights() {
    if (!memoryGridEl) return;
    memoryGridEl.querySelectorAll('.memory-tile').forEach(tile => tile.classList.remove('is-glow'));
  }

  function resetMemoryUI() {
    cancelMemoryTimers();
    clearMemoryHighlights();
    memoryState.active = false;
    memoryState.bet = 0;
    memoryState.pattern = [];
    memoryState.awaitingGuess = false;
    memoryState.scriptedWin = false;
    if (memoryStartBtn) memoryStartBtn.disabled = false;
    if (memoryGuessBtn) memoryGuessBtn.disabled = true;
    if (memoryBetInput) memoryBetInput.disabled = false;
    if (memoryRoundEl) memoryRoundEl.textContent = memoryState.round.toString();
    if (memoryStreakEl) memoryStreakEl.textContent = memoryState.streak.toString();
  }

  function playMemoryPattern() {
    if (memoryState.active) return;
    const rawBet = Number(memoryBetInput ? memoryBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 20) {
      setStatus(memoryStatus, 'Minimum memory stake is 20 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 10) * 10;
    if (!applyStake(bet)) {
      setStatus(memoryStatus, 'Not enough lounge credits for that challenge.', 'negative');
      return;
    }

    memoryState.active = true;
    memoryState.bet = bet;
    memoryState.pattern = [];
    memoryState.awaitingGuess = false;
    memoryState.scriptedWin = Math.random() < Math.min(0.55 + memoryState.streak * 0.12, 0.9);
    cancelMemoryTimers();
    clearMemoryHighlights();

    if (memoryStartBtn) memoryStartBtn.disabled = true;
    if (memoryGuessBtn) memoryGuessBtn.disabled = true;
    if (memoryBetInput) memoryBetInput.disabled = true;
    setStatus(memoryStatus, 'Pattern incoming—memorise the glow.', 'neutral');

    const tiles = Array.from(memoryGridEl ? memoryGridEl.querySelectorAll('.memory-tile') : []);
    const shuffled = tiles.map((_, idx) => idx).sort(() => Math.random() - 0.5);
    const length = Math.min(4 + Math.floor(memoryState.round / 2), 6);
    memoryState.pattern = shuffled.slice(0, length);

    memoryState.pattern.forEach((tileIndex, step) => {
      const timerOn = setTimeout(() => {
        const tile = tiles[tileIndex];
        if (tile) {
          tile.classList.add('is-glow');
          const timerOff = setTimeout(() => tile.classList.remove('is-glow'), 280);
          memoryState.revealTimers.push(timerOff);
        }
        if (step === memoryState.pattern.length - 1) {
          const readyTimer = setTimeout(() => {
            memoryState.awaitingGuess = true;
            if (memoryGuessBtn) memoryGuessBtn.disabled = false;
            setStatus(memoryStatus, 'Lock your guess when ready.', 'neutral');
          }, 340);
          memoryState.revealTimers.push(readyTimer);
        }
      }, step * 520);
      memoryState.revealTimers.push(timerOn);
    });
  }

  function lockMemoryGuess() {
    if (!memoryState.awaitingGuess) return;
    memoryState.awaitingGuess = false;
    if (memoryGuessBtn) memoryGuessBtn.disabled = true;
    if (memoryStartBtn) memoryStartBtn.disabled = false;
    if (memoryBetInput) memoryBetInput.disabled = false;

    const success = memoryState.scriptedWin;
    let payout = 0;
    let tone = 'negative';
    let message = '';

    memoryState.round += 1;

    if (success) {
      memoryState.streak += 1;
      const multiplier = 1.4 + memoryState.streak * 0.35;
      payout = Math.round(memoryState.bet * multiplier);
      tone = 'positive';
      message = 'Perfect recall! Matrix awards ' + payout.toLocaleString() + ' credits.';
    } else {
      payout = 0;
      memoryState.streak = 0;
      message = 'Pattern lost in the ether. Focus resets for the next round.';
    }

    if (payout > 0) {
      credits += payout;
      updateCredits();
      flashCredits(tone === 'positive' ? 'positive' : 'neutral');
    }

    const bet = memoryState.bet;
    const net = payout - bet;
    setStatus(memoryStatus, message, tone);
    logEvent('Memory Matrix', message, net);
    showResultModal({
      game: 'Memory Matrix',
      bet,
      payout,
      message,
      tone,
    });

    memoryState.bet = 0;
    resetMemoryUI();
  }

  if (memoryStartBtn) memoryStartBtn.addEventListener('click', playMemoryPattern);
  if (memoryGuessBtn) memoryGuessBtn.addEventListener('click', lockMemoryGuess);

  // ---------------------------------------------------------------------------
  // Crossy Run
  function buildCrossyLanes() {
    if (!crossyLanesEl) return;
    crossyLanesEl.innerHTML = '';
    const defaultThemes = ['field', 'road', 'river', 'road', 'field'];
    crossyState.themes = defaultThemes.slice(0, crossyState.totalLanes);
    for (let i = 0; i < crossyState.totalLanes; i += 1) {
      const lane = document.createElement('div');
      lane.className = 'crossy-lane';
      lane.dataset.index = i.toString();
      lane.dataset.theme = crossyState.themes[i];
      const label = document.createElement('span');
      label.className = 'crossy-lane__label';
      if (i === 0) label.textContent = 'Start';
      else if (i === crossyState.totalLanes - 1) label.textContent = 'Goal';
      else if (crossyState.themes[i] === 'road') label.textContent = 'Traffic';
      else if (crossyState.themes[i] === 'river') label.textContent = 'River';
      else label.textContent = `Lane ${i + 1}`;
      lane.appendChild(label);
      crossyLanesEl.appendChild(lane);
    }
  }

  function renderCrossyLanes() {
    if (!crossyLanesEl) return;
    const lanes = crossyLanesEl.querySelectorAll('.crossy-lane');
    lanes.forEach(laneEl => {
      laneEl.classList.remove('is-win', 'is-loss', 'is-current');
    });
    lanes.forEach((laneEl, index) => {
      laneEl.dataset.theme = crossyState.themes[index] || 'field';
      const status = crossyState.lanes[index] || 'pending';
      if (status === 'safe') laneEl.classList.add('is-win');
      if (status === 'fail') laneEl.classList.add('is-loss');
      if (crossyState.active && index === crossyState.lane) laneEl.classList.add('is-current');
      if (crossyState.scriptedDeath && index === crossyState.scriptedDeath.lane) laneEl.classList.add('is-danger');
      else laneEl.classList.remove('is-danger');
    });
  }

  function updateCrossyPlayerPosition() {
    if (!crossyPlayerEl) return;
    const base = 6;
    const range = 78;
    const ratio = Math.min(Math.max(crossyState.lane / crossyState.totalLanes, 0), 1);
    const bottomPercent = base + range * ratio;
    crossyPlayerEl.style.bottom = `${bottomPercent}%`;
    const wiggle = Math.sin(Date.now() / 400) * 3;
    crossyPlayerEl.style.left = `${50 + wiggle}%`;
  }

  function stopCrossyTraffic() {
    crossyState.trafficTimers.forEach(timer => clearInterval(timer));
    crossyState.trafficTimers = [];
    if (crossyTrafficEl) crossyTrafficEl.innerHTML = '';
  }

  function spawnCrossyCar(laneIndex) {
    if (!crossyTrafficEl || !crossyLanesEl) return;
    const car = document.createElement('div');
    car.className = 'car';
    car.dataset.lane = laneIndex.toString();
    const direction = Math.random() < 0.5 ? 'left' : 'right';
    const palettes = [
      ['#ff8a65', '#ff7043'],
      ['#64b5f6', '#1e88e5'],
      ['#81c784', '#43a047'],
      ['#ba68c8', '#8e24aa'],
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    car.style.background = `linear-gradient(180deg, ${palette[0]}, ${palette[1]})`;
    const lanes = crossyLanesEl.querySelectorAll('.crossy-lane');
    const laneEl = lanes[laneIndex];
    if (!laneEl) return;
    const laneRect = laneEl.getBoundingClientRect();
    const sceneRect = crossyLanesEl.getBoundingClientRect();
    const laneCenter = ((laneRect.top + laneRect.bottom) / 2 - sceneRect.top) / sceneRect.height;
    car.style.bottom = `${laneCenter * 100}%`;
    if (direction === 'left') {
      car.style.left = '110%';
      setTimeout(() => {
        car.style.left = '-20%';
      }, 16);
    } else {
      car.style.left = '-20%';
      setTimeout(() => {
        car.style.left = '110%';
      }, 16);
    }
    crossyTrafficEl.appendChild(car);
    setTimeout(() => {
      car.remove();
    }, 1800);
  }

  function startCrossyTraffic() {
    stopCrossyTraffic();
    crossyState.themes.forEach((theme, index) => {
      if (theme !== 'road') return;
      const interval = setInterval(() => spawnCrossyCar(index), 1400 + Math.random() * 800);
      crossyState.trafficTimers.push(interval);
      spawnCrossyCar(index);
    });
  }

  function setCrossyControls(activeRound) {
    if (crossyStartBtn) crossyStartBtn.disabled = activeRound;
    if (crossyHopBtn) crossyHopBtn.disabled = !activeRound;
    if (crossyBailBtn) crossyBailBtn.disabled = !activeRound;
    if (crossyBetInput) crossyBetInput.disabled = activeRound;
  }

  function resetCrossyUI() {
    stopCrossyTraffic();
    crossyState.active = false;
    crossyState.bet = 0;
    crossyState.lane = 0;
    crossyState.multiplier = 1;
    crossyState.lanes = Array.from({ length: crossyState.totalLanes }, () => 'pending');
    crossyState.scriptedDeath = null;
    buildCrossyLanes();
    renderCrossyLanes();
    if (crossyLaneEl) crossyLaneEl.textContent = '0';
    if (crossyMultiplierEl) crossyMultiplierEl.textContent = '1.00x';
    setCrossyControls(false);
    updateCrossyPlayerPosition();
  }

  function finishCrossyRound({ payout, message, tone }) {
    crossyState.active = false;
    setCrossyControls(false);
    renderCrossyLanes();
    stopCrossyTraffic();
    const bet = crossyState.bet;
    const net = payout - bet;
    if (payout > 0) {
      credits += payout;
      updateCredits();
      if (net > 0) flashCredits('positive');
      else flashCredits('neutral');
    }
    setStatus(crossyStatus, message, tone);
    logEvent('Crossy Run', message, net);
    showResultModal({
      game: 'Crossy Run',
      bet,
      payout,
      message,
      tone,
    });
    crossyState.bet = 0;
  }

  function startCrossyRun() {
    if (crossyState.active) return;
    const rawBet = Number(crossyBetInput ? crossyBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 20) {
      setStatus(crossyStatus, 'Minimum stake is 20 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 10) * 10;
    if (!applyStake(bet)) {
      setStatus(crossyStatus, 'Not enough lounge credits for that run.', 'negative');
      return;
    }

    resetCrossyUI();
    crossyState.active = true;
    crossyState.bet = bet;
    crossyState.scriptedDeath = {
      lane: Math.min(crossyState.totalLanes - 1, 4),
      message: 'A hover truck thunders across the neon road and sends the chicken flying.'
    };
    setCrossyControls(true);
    renderCrossyLanes();
    updateCrossyPlayerPosition();
    startCrossyTraffic();
    setStatus(
      crossyStatus,
      `First hop is clear. Rumour says lane ${crossyState.scriptedDeath.lane + 1} is cursed tonight.`,
      'neutral',
    );
  }

  function updateCrossyProgressUI() {
    if (crossyLaneEl) crossyLaneEl.textContent = crossyState.lane.toString();
    if (crossyMultiplierEl) crossyMultiplierEl.textContent = `${crossyState.multiplier.toFixed(2)}x`;
    renderCrossyLanes();
    updateCrossyPlayerPosition();
  }

  function hopCrossy() {
    if (!crossyState.active) return;
    if (crossyState.lane >= crossyState.totalLanes) return;
    const laneIndex = crossyState.lane;
    if (crossyState.scriptedDeath && crossyState.lane === crossyState.scriptedDeath.lane) {
      crossyState.lanes[laneIndex] = 'fail';
      updateCrossyProgressUI();
      finishCrossyRound({
        payout: 0,
        message: crossyState.scriptedDeath.message,
        tone: 'negative',
      });
      return;
    }

    const laneTheme = crossyState.themes[laneIndex] || 'field';
    let hazardChance = 0.22 + laneIndex * 0.12;
    if (laneTheme === 'road') hazardChance += 0.18;
    if (laneTheme === 'river') hazardChance += 0.1;
    if (laneTheme === 'field') hazardChance -= 0.08;
    hazardChance = clamp(hazardChance, 0.18, 0.82);
    const hazard = Math.random() < hazardChance;

    if (hazard) {
      crossyState.lanes[laneIndex] = 'fail';
      updateCrossyProgressUI();
      finishCrossyRound({
        payout: 0,
        message: `Traffic surge! You were clipped on lane ${laneIndex + 1}.`,
        tone: 'negative',
      });
      return;
    }

    crossyState.lanes[laneIndex] = 'safe';
    crossyState.lane += 1;
    crossyState.multiplier = Number((1 + crossyState.lane * 0.35).toFixed(2));
    updateCrossyProgressUI();

    if (crossyState.lane >= crossyState.totalLanes) {
      crossyState.multiplier = Number((crossyState.multiplier + 1.25).toFixed(2));
      updateCrossyProgressUI();
      const payout = Math.round(crossyState.bet * crossyState.multiplier);
      finishCrossyRound({
        payout,
        message: `Clean sweep! You cleared all lanes for ${payout.toLocaleString()} credits.`,
        tone: 'positive',
      });
      return;
    }

    setStatus(
      crossyStatus,
      `Safe hop! ${crossyState.lane} lane${crossyState.lane === 1 ? '' : 's'} cleared.`,
      'neutral',
    );
  }

  function bailCrossy() {
    if (!crossyState.active) return;
    const safeHops = crossyState.lane;
    let payout = crossyState.bet;
    if (safeHops > 0) {
      payout = Math.round(crossyState.bet * Math.max(1.05, crossyState.multiplier));
    }
    finishCrossyRound({
      payout,
      message:
        safeHops === 0
          ? 'You backed out before hopping. Stake returned.'
          : `You bailed with ${safeHops} safe hop${safeHops === 1 ? '' : 's'} for ${payout.toLocaleString()} credits.`,
      tone: safeHops > 0 ? 'positive' : 'neutral',
    });
  }

  // ---------------------------------------------------------------------------
  // Horse racing
  function buildHorseTrack() {
    if (!horseTrackEl) return;
    horseTrackEl.innerHTML = '';
    horseState.horses = HORSE_RUNNERS.map(runner => {
      const lane = document.createElement('div');
      lane.className = 'horse-lane';
      lane.dataset.id = runner.id;

      const label = document.createElement('span');
      label.className = 'horse-name';
      label.textContent = runner.name;

      const track = document.createElement('div');
      track.className = 'crash-progress';

      const bar = document.createElement('div');
      bar.className = 'crash-progress__bar';
      bar.style.width = '0%';

      track.appendChild(bar);
      lane.appendChild(label);
      lane.appendChild(track);
      horseTrackEl.appendChild(lane);

      return {
        id: runner.id,
        name: runner.name,
        progress: 0,
        momentum: 0,
        laneEl: lane,
        barEl: bar,
      };
    });
  }

  function setHorseControls(activeRace) {
    if (horseStartBtn) horseStartBtn.disabled = activeRace;
    if (horseCheerBtn) horseCheerBtn.disabled = !activeRace;
    if (horseBetInput) horseBetInput.disabled = activeRace;
    if (horsePickSelect) horsePickSelect.disabled = activeRace;
  }

  function resetHorseUI() {
    clearInterval(horseState.timer);
    horseState.timer = null;
    horseState.active = false;
    horseState.bet = 0;
    horseState.selection = horsePickSelect ? horsePickSelect.value : '';
    horseState.cheerUsed = false;
    if (horseState.horses.length === 0) buildHorseTrack();
    horseState.horses.forEach(horse => {
      horse.progress = 0;
      horse.momentum = 0;
      horse.barEl.style.width = '0%';
      horse.laneEl.classList.remove('is-win', 'is-loss');
    });
    setHorseControls(false);
  }

  function finishHorseRace({ winners, payout, message, tone }) {
    clearInterval(horseState.timer);
    horseState.timer = null;
    horseState.active = false;
    setHorseControls(false);
    if (horseCheerBtn) horseCheerBtn.disabled = true;

    horseState.horses.forEach(horse => {
      horse.laneEl.classList.remove('is-win', 'is-loss');
      const isWinner = winners.some(winner => winner.id === horse.id);
      horse.laneEl.classList.add(isWinner ? 'is-win' : 'is-loss');
      horse.barEl.style.width = `${horse.progress}%`;
    });

    const bet = horseState.bet;
    const net = payout - bet;
    if (payout > 0) {
      credits += payout;
      updateCredits();
      if (net > 0) flashCredits('positive');
      else flashCredits('neutral');
    }

    setStatus(horseStatus, message, tone);
    logEvent('Neon Derby', message, net);
    showResultModal({
      game: 'Neon Derby',
      bet,
      payout,
      message,
      tone,
    });
    horseState.bet = 0;
  }

  function startHorseRace() {
    if (horseState.active) return;
    if (horseState.horses.length === 0) buildHorseTrack();

    const rawBet = Number(horseBetInput ? horseBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 30) {
      setStatus(horseStatus, 'Minimum race stake is 30 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 10) * 10;
    if (!applyStake(bet)) {
      setStatus(horseStatus, 'Not enough lounge credits for that race.', 'negative');
      return;
    }

    const chosen = horsePickSelect ? horsePickSelect.value : HORSE_RUNNERS[0].id;
    horseState.horses.forEach(horse => {
      horse.progress = 0;
      horse.momentum = 0.85 + Math.random() * 0.3;
      horse.barEl.style.width = '0%';
      horse.laneEl.classList.remove('is-win', 'is-loss');
    });

    horseState.active = true;
    horseState.bet = bet;
    horseState.selection = chosen;
    horseState.cheerUsed = false;

    setHorseControls(true);
    const selectedHorse = HORSE_RUNNERS.find(runner => runner.id === chosen);
    setStatus(
      horseStatus,
      `Race underway! Cheer once to boost ${selectedHorse ? selectedHorse.name : 'your horse'}.`,
      'neutral',
    );

    horseState.timer = setInterval(() => {
      let finished = false;
      let lead = 0;
      horseState.horses.forEach(horse => {
        const bias = horse.id === horseState.selection ? 1.05 : 1;
        const stride = (Math.random() * 5 + 3) * horse.momentum * bias;
        horse.progress = Math.min(100, horse.progress + stride);
        if (horse.progress > lead) lead = horse.progress;
        horse.barEl.style.width = `${horse.progress}%`;
        if (horse.progress >= 100) finished = true;
      });

      if (finished) {
        const topScore = Math.max(...horseState.horses.map(horse => horse.progress));
        const winners = horseState.horses.filter(horse => Math.abs(horse.progress - topScore) < 0.01);
        const winnerNames = winners.map(winner => winner.name).join(' & ');
        const selectedName =
          HORSE_RUNNERS.find(runner => runner.id === horseState.selection)?.name || horseState.selection;

        let payout = 0;
        let tone = 'negative';
        let message = `${winnerNames} sprinted ahead of your pick ${selectedName}.`;

        const playerWins = winners.some(winner => winner.id === horseState.selection);
        if (playerWins) {
          if (winners.length === 1) {
            payout = Math.round(horseState.bet * 4);
            tone = 'positive';
            message = `${selectedName} takes the win! You collect ${payout.toLocaleString()} credits.`;
          } else {
            payout = Math.round(horseState.bet * 2);
            tone = 'neutral';
            const partners = winners
              .filter(winner => winner.id !== horseState.selection)
              .map(winner => winner.name)
              .join(' & ');
            message = `${selectedName} shares the win with ${partners}. Split purse awarded.`;
          }
        }

        finishHorseRace({ winners, payout, message, tone });
      }
    }, 180);
  }

  function cheerHorse() {
    if (!horseState.active || horseState.cheerUsed) return;
    const target = horseState.horses.find(horse => horse.id === horseState.selection);
    if (!target) return;

    target.progress = Math.min(100, target.progress + 12);
    target.barEl.style.width = `${target.progress}%`;
    horseState.cheerUsed = true;
    if (horseCheerBtn) horseCheerBtn.disabled = true;

    const name = HORSE_RUNNERS.find(runner => runner.id === horseState.selection)?.name || 'Your runner';
    setStatus(horseStatus, `${name} surges forward with the crowd behind them!`, 'positive');
  }

  // ---------------------------------------------------------------------------
  // Quantum Plinko
  function buildPlinkoBoard() {
    if (!plinkoBoardEl) return;
    if (plinkoBoardEl.children.length === PLINKO_MULTIPLIERS.length) return;
    plinkoBoardEl.innerHTML = '';
    PLINKO_MULTIPLIERS.forEach((multiplier, index) => {
      const slot = document.createElement('div');
      slot.className = 'plinko-slot';
      slot.dataset.index = index.toString();
      slot.textContent = `${multiplier.toFixed(2)}x`;
      plinkoBoardEl.appendChild(slot);
    });
  }

  function buildPlinkoPegs() {
    if (!plinkoPegsEl) return;
    plinkoPegsEl.innerHTML = '';
    for (let row = 0; row < PLINKO_ROWS; row += 1) {
      const rowEl = document.createElement('div');
      rowEl.className = 'peg-row';
      const pegCount = row + 1;
      const remaining = PLINKO_MULTIPLIERS.length - (row + 1);
      const padding = Math.max(0, remaining * 10);
      rowEl.style.paddingInline = `${padding}px`;
      rowEl.style.gap = `${Math.max(18, 32 - row * 2)}px`;
      for (let i = 0; i < pegCount; i += 1) {
        const peg = document.createElement('span');
        peg.className = 'peg';
        rowEl.appendChild(peg);
      }
      plinkoPegsEl.appendChild(rowEl);
    }
  }

  function renderPlinkoHighlight(index) {
    if (!plinkoBoardEl) return;
    plinkoBoardEl.querySelectorAll('.plinko-slot').forEach((slot, slotIndex) => {
      if (slotIndex === index) slot.classList.add('is-active');
      else slot.classList.remove('is-active');
    });
  }

  function setPlinkoControls(activeRound) {
    if (plinkoDropBtn) plinkoDropBtn.disabled = activeRound;
    if (plinkoBetInput) plinkoBetInput.disabled = activeRound;
    if (plinkoLaneSelect) plinkoLaneSelect.disabled = activeRound;
  }

  function resetPlinkoUI() {
    clearInterval(plinkoState.timer);
    plinkoState.timer = null;
    plinkoState.animating = false;
    plinkoState.bet = 0;
    plinkoState.path = [];
    plinkoState.step = 0;
    plinkoState.resultIndex = Math.floor(PLINKO_MULTIPLIERS.length / 2);
    buildPlinkoBoard();
    buildPlinkoPegs();
    if (plinkoBoardEl) {
      plinkoBoardEl.querySelectorAll('.plinko-slot').forEach(slot => slot.classList.remove('is-win'));
    }
    renderPlinkoHighlight(-1);
    if (plinkoSlotEl) plinkoSlotEl.textContent = '--';
    if (plinkoMultiplierEl) plinkoMultiplierEl.textContent = '1.00x';
    setPlinkoControls(false);
    if (plinkoPuckEl) {
      plinkoPuckEl.classList.remove('is-active');
      plinkoPuckEl.style.left = '50%';
      plinkoPuckEl.style.top = '12%';
    }
  }

  function pickPlinkoResult(startIndex) {
    let index = startIndex;
    for (let i = 0; i < PLINKO_ROWS; i += 1) {
      index = clamp(index + (Math.floor(Math.random() * 3) - 1), 0, PLINKO_MULTIPLIERS.length - 1);
    }
    if (Math.random() < 0.25) {
      index = clamp(index + (Math.random() < 0.5 ? -1 : 1), 0, PLINKO_MULTIPLIERS.length - 1);
    }
    return index;
  }

  function generatePlinkoPath(startIndex, resultIndex) {
    const steps = PLINKO_ROWS;
    const path = [startIndex];
    let current = startIndex;
    for (let i = 1; i < steps; i += 1) {
      current = clamp(current + (Math.floor(Math.random() * 3) - 1), 0, PLINKO_MULTIPLIERS.length - 1);
      path.push(current);
    }
    path.push(resultIndex);
    return path;
  }

  function finishPlinkoRound() {
    renderPlinkoHighlight(plinkoState.resultIndex);
    if (plinkoBoardEl) {
      plinkoBoardEl.querySelectorAll('.plinko-slot').forEach((slot, index) => {
        if (index === plinkoState.resultIndex) slot.classList.add('is-win');
        else slot.classList.remove('is-win');
      });
    }

    const multiplier = PLINKO_MULTIPLIERS[plinkoState.resultIndex];
    if (plinkoMultiplierEl) plinkoMultiplierEl.textContent = `${multiplier.toFixed(2)}x`;
    if (plinkoSlotEl) plinkoSlotEl.textContent = (plinkoState.resultIndex + 1).toString();
    if (plinkoPuckEl) {
      positionPlinkoPuck(plinkoState.resultIndex, plinkoState.path.length - 1);
      plinkoPuckEl.classList.add('is-active');
    }

    const bet = plinkoState.bet;
    const payout = Math.round(bet * multiplier);
    const net = payout - bet;
    if (payout > 0) {
      credits += payout;
      updateCredits();
      if (net > 0) flashCredits('positive');
      else if (net === 0) flashCredits('neutral');
    }

    let tone = 'negative';
    let message = `Puck settled in slot ${plinkoState.resultIndex + 1} for ${multiplier.toFixed(2)}x.`;
    if (net > 0) {
      tone = 'positive';
      message = `Great drop! Slot ${plinkoState.resultIndex + 1} paid ${payout.toLocaleString()} credits.`;
    } else if (net === 0) {
      tone = 'neutral';
      message = `Even finish. Slot ${plinkoState.resultIndex + 1} returned your stake.`;
    } else if (payout > 0) {
      tone = 'neutral';
      message = `Soft landing. Slot ${plinkoState.resultIndex + 1} returned ${payout.toLocaleString()} credits.`;
    }

    setStatus(plinkoStatus, message, tone);
    logEvent('Quantum Plinko', message, net);
    showResultModal({
      game: 'Quantum Plinko',
      bet,
      payout,
      message,
      tone,
    });

    plinkoState.animating = false;
    plinkoState.bet = 0;
    plinkoState.path = [];
    plinkoState.step = 0;
    plinkoState.resultIndex = Math.floor(PLINKO_MULTIPLIERS.length / 2);
    setPlinkoControls(false);
  }

  function positionPlinkoPuck(index, step) {
    if (!plinkoPuckEl || !plinkoBoardEl) return;
    const sceneEl = plinkoBoardEl.closest('.plinko-scene');
    if (!sceneEl) return;
    const slots = Array.from(plinkoBoardEl.querySelectorAll('.plinko-slot'));
    if (slots.length === 0) return;
    const sceneRect = sceneEl.getBoundingClientRect();
    const slotRects = slots.map(slotEl => slotEl.getBoundingClientRect());
    const slotCenters = slotRects.map(rect => rect.left + rect.width / 2 - sceneRect.left);
    const targetCenter = slotCenters[index] ?? slotCenters[slotCenters.length - 1];
    const entryIndex = plinkoState.path[0] ?? Math.floor(slots.length / 2);
    const startCenter = slotCenters[entryIndex] ?? slotCenters[Math.floor(slotCenters.length / 2)];
    const midPoint =
      slotCenters.length % 2 === 0
        ? (slotCenters[slotCenters.length / 2 - 1] + slotCenters[slotCenters.length / 2]) / 2
        : slotCenters[Math.floor(slotCenters.length / 2)];
    const maxSteps = Math.max(plinkoState.path.length - 1, 1);
    const progress = Math.min(step / maxSteps, 1);
    const eased = Math.pow(progress, 1.25);
    const centerTarget = midPoint + (targetCenter - midPoint) * eased;
    const leftPx = startCenter + (centerTarget - startCenter) * eased;
    const previousIndex = step > 0 ? plinkoState.path[step - 1] : entryIndex;
    const direction = clamp(index - previousIndex, -1, 1);
    const wobble = direction * 12 * (1 - eased);
    const baseTop = sceneRect.height * 0.12;
    const travel = sceneRect.height * 0.7;
    const topPx = baseTop + travel * progress;
    plinkoPuckEl.classList.add('is-active');
    plinkoPuckEl.style.left = `${leftPx + wobble}px`;
    plinkoPuckEl.style.top = `${topPx}px`;
  }

  function dropPlinko() {
    if (plinkoState.animating) return;

    const rawBet = Number(plinkoBetInput ? plinkoBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 10) {
      setStatus(plinkoStatus, 'Minimum plinko stake is 10 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 5) * 5;
    if (!applyStake(bet)) {
      setStatus(plinkoStatus, 'Not enough lounge credits for that drop.', 'negative');
      return;
    }

    const lane = Number(plinkoLaneSelect ? plinkoLaneSelect.value : 2);
    const startIndex = clamp(lane, 0, PLINKO_MULTIPLIERS.length - 1);
    const resultIndex = pickPlinkoResult(startIndex);
    const path = generatePlinkoPath(startIndex, resultIndex);

    plinkoState.animating = true;
    plinkoState.bet = bet;
    plinkoState.resultIndex = resultIndex;
    plinkoState.path = path;
    plinkoState.step = 0;
    setPlinkoControls(true);

    if (plinkoBoardEl) {
      plinkoBoardEl.querySelectorAll('.plinko-slot').forEach(slot => slot.classList.remove('is-win'));
    }

    setStatus(plinkoStatus, 'Puck dropping... watch the bounces.', 'neutral');
    renderPlinkoHighlight(path[0]);
    positionPlinkoPuck(path[0], 0);

    clearInterval(plinkoState.timer);
    plinkoState.timer = setInterval(() => {
      plinkoState.step += 1;
      if (plinkoState.step < plinkoState.path.length) {
        const idx = plinkoState.path[plinkoState.step];
        renderPlinkoHighlight(idx);
        positionPlinkoPuck(idx, plinkoState.step);
      }
      if (plinkoState.step >= plinkoState.path.length - 1) {
        clearInterval(plinkoState.timer);
        plinkoState.timer = null;
        setTimeout(finishPlinkoRound, 200);
      }
    }, 140);
  }

  // ---------------------------------------------------------------------------
  // Event bindings
  if (crashButton) {
    crashButton.addEventListener('click', () => {
      if (crashState.active) {
        cashOutCrash();
      } else {
        startCrashRound();
      }
    });
  }

  if (crashAutoBtn) {
    crashAutoBtn.addEventListener('click', () => {
      if (crashState.autoEnabled) {
        crashState.autoEnabled = false;
        updateCrashAutoButton();
        setStatus(crashStatus, 'Auto cash disabled. Manual flight ready.', 'neutral');
        return;
      }
      const defaultTarget = crashState.autoTarget >= 1.1 ? crashState.autoTarget.toFixed(2) : '2.00';
      const input = window.prompt('Auto cash out at multiplier (min 1.10x)', defaultTarget);
      if (input === null) return;
      const target = Number(input);
      if (!Number.isFinite(target) || target < 1.1) {
        setStatus(crashStatus, 'Auto cash target must be at least 1.10x.', 'negative');
        return;
      }
      crashState.autoTarget = Number(target.toFixed(2));
      crashState.autoEnabled = true;
      updateCrashAutoButton();
      setStatus(crashStatus, `Auto cash primed for ${crashState.autoTarget.toFixed(2)}x.`, 'positive');
    });
  }

  if (minesStartBtn) minesStartBtn.addEventListener('click', startMinesRound);
  if (minesCashOutBtn) minesCashOutBtn.addEventListener('click', cashOutMines);
  if (minesAutoBtn) {
    minesAutoBtn.addEventListener('click', () => {
      if (minesState.autoEnabled) {
        minesState.autoEnabled = false;
        updateMinesAutoButton();
        setStatus(minesStatus, 'Auto cash disabled. Trust your instincts.', 'neutral');
        return;
      }
      const defaultTarget = minesState.autoTarget > 0 ? minesState.autoTarget.toFixed(2) : '1.50';
      const input = window.prompt('Auto cash out when multiplier reaches...', defaultTarget);
      if (input === null) return;
      const target = Number(input);
      if (!Number.isFinite(target) || target < 1.05) {
        setStatus(minesStatus, 'Pick at least a 1.05x multiplier for auto cash.', 'negative');
        return;
      }
      minesState.autoTarget = Number(target.toFixed(2));
      minesState.autoEnabled = true;
      updateMinesAutoButton();
      const tone = minesState.active ? 'positive' : 'neutral';
      setStatus(minesStatus, `Auto cash primed for ${minesState.autoTarget.toFixed(2)}x.`, tone);
    });
  }

  if (minesGridEl) {
    buildMinesGrid();
    minesGridEl.addEventListener('click', handleMinesCellClick);
  }

  buildMemoryGrid();

  if (limboButton) limboButton.addEventListener('click', playLimboRound);

  if (crossyStartBtn) crossyStartBtn.addEventListener('click', startCrossyRun);
  if (crossyHopBtn) crossyHopBtn.addEventListener('click', hopCrossy);
  if (crossyBailBtn) crossyBailBtn.addEventListener('click', bailCrossy);

  if (horseStartBtn) horseStartBtn.addEventListener('click', startHorseRace);
  if (horseCheerBtn) horseCheerBtn.addEventListener('click', cheerHorse);

  if (plinkoDropBtn) plinkoDropBtn.addEventListener('click', dropPlinko);

  if (resultModalCloseBtn) resultModalCloseBtn.addEventListener('click', hideResultModal);
  if (resultModalBackdropEl) resultModalBackdropEl.addEventListener('click', hideResultModal);
  if (resultModalEl) {
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        hideResultModal();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      credits = STARTING_CREDITS;
      updateCredits();
      flashCredits('neutral');
      clearInterval(crashState.timer);
      crashState.timer = null;
      crashState.active = false;
      crashState.bet = 0;
      crashState.crashPoint = 0;
      crashState.maxDisplay = 4.5;
      resetCrashVisuals();
      resetMinesBoard();
      resetLimboVisuals();
      resetSkeeUI();
      resetCrossyUI();
      resetHorseUI();
      resetPlinkoUI();
      memoryState.round = 0;
      memoryState.streak = 0;
      resetMemoryUI();
      resetStatusMessages();
      logEvent('Lounge', 'Arcade bankroll reset to 1,000 credits.', 0);
    });
  }

  // Initial setup
  resetCrashVisuals();
  resetMinesBoard();
  resetLimboVisuals();
  resetSkeeUI();
  resetCrossyUI();
  resetHorseUI();
  resetPlinkoUI();
  resetMemoryUI();
  resetStatusMessages();
  updateCredits();
  logEvent('Host', 'Welcome to the Arcade Lounge. Your bankroll starts at 1,000 credits.', 0);
})();
