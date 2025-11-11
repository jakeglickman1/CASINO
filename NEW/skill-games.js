import { createBankroll } from './core/bankroll.js';
import {
  flashIndicator,
  setStatus as applyStatus,
  logEvent as recordEvent,
  attachConfirmAction,
  showToast,
} from './core/ui.js';

const STARTING_CREDITS = 1000;

const creditsDisplay = document.getElementById('skillCredits');
if (!creditsDisplay) {
  console.warn('Skill games UI not found.');
} else {
  let credits = STARTING_CREDITS;

  const resetBtn = document.getElementById('skillReset');
  const skillGrid = document.getElementById('skillGrid');
  const skillBackBtn = document.getElementById('skillBack');
  const skillGameTitle = document.getElementById('skillGameTitle');
  const skillGameBlurb = document.getElementById('skillGameBlurb');
  const skillPlaceholder = document.getElementById('skillPlaceholder');
  const skillLog = document.getElementById('skillLog');

  const bankroll = createBankroll({
    startingCredits: STARTING_CREDITS,
    onChange: (balance, { tone, isInitial } = {}) => {
      credits = balance;
      creditsDisplay.textContent = balance.toLocaleString();
      if (!isInitial && tone) {
        flashIndicator(creditsDisplay, tone);
      }
    },
    onSync: ({ balance }) => {
      showToast(`Bankroll synced at ${balance.toLocaleString()} credits`, { tone: 'neutral' });
    },
  });
  credits = bankroll.balance;

  const reflexModule = document.getElementById('moduleReflex');
  const memoryModule = document.getElementById('moduleMemory');
  const mathModule = document.getElementById('moduleMath');
  const targetModule = document.getElementById('moduleTarget');

  const reflexBetInput = document.getElementById('reflexBet');
  const reflexStartBtn = document.getElementById('reflexStart');
  const reflexStatus = document.getElementById('reflexStatus');
  const reflexDisplay = document.getElementById('reflexDisplay');
  const reflexTapBtn = document.getElementById('reflexTap');

  const memoryBetInput = document.getElementById('memoryBet');
  const memoryStartBtn = document.getElementById('memoryStart');
  const memoryStatus = document.getElementById('memoryStatus');
  const memoryPads = Array.from(document.querySelectorAll('.memory-pad'));

  const mathBetInput = document.getElementById('mathBet');
  const mathStartBtn = document.getElementById('mathStart');
  const mathStatus = document.getElementById('mathStatus');
  const mathQuestionEl = document.getElementById('mathQuestion');
  const mathRemainingEl = document.getElementById('mathRemaining');
  const mathTimerEl = document.getElementById('mathTimer');
  const mathAnswerInput = document.getElementById('mathAnswer');
  const mathSubmitBtn = document.getElementById('mathSubmit');

  const targetBetInput = document.getElementById('targetBet');
  const targetStartBtn = document.getElementById('targetStart');
  const targetStatus = document.getElementById('targetStatus');
  const targetHitsEl = document.getElementById('targetHits');
  const targetTimeEl = document.getElementById('targetTime');
  const targetArena = document.getElementById('targetArena');
  const targetDot = document.getElementById('targetDot');
  const rhythmModule = document.getElementById('moduleRhythm');
  const cipherModule = document.getElementById('moduleCipher');
  const rhythmBetInput = document.getElementById('rhythmBet');
  const rhythmStartBtn = document.getElementById('rhythmStart');
  const rhythmStrikeBtn = document.getElementById('rhythmStrike');
  const rhythmStatus = document.getElementById('rhythmStatus');
  const rhythmPrompt = document.getElementById('rhythmPrompt');
  const rhythmPulseEl = document.getElementById('rhythmPulseIndicator');
  const cipherBetInput = document.getElementById('cipherBet');
  const cipherStartBtn = document.getElementById('cipherStart');
  const cipherStatus = document.getElementById('cipherStatus');
  const cipherGuessInput = document.getElementById('cipherGuess');
  const cipherSubmitBtn = document.getElementById('cipherSubmit');
  const cipherAttemptsList = document.getElementById('cipherAttempts');

  const DEFAULT_TITLE = 'Choose a skill challenge';
  const DEFAULT_BLURB = 'Select a game card to load its arena and view the betting rules.';

  const DEFAULT_STATUS = {
    reflex: reflexStatus ? reflexStatus.textContent : 'Stake at least 20 credits, then wait for the reactor to flash green.',
    memory: memoryStatus ? memoryStatus.textContent : 'Press start to watch the nebula flash. Repeat it perfectly to win.',
    math: mathStatus ? mathStatus.textContent : 'Race the clock through three equations. Higher accuracy boosts your payout.',
    target: targetStatus ? targetStatus.textContent : 'Click the roaming drone six times before the timer runs out.',
    rhythm: rhythmStatus ? rhythmStatus.textContent : 'Press start then tap when the pulse glows.',
    cipher: cipherStatus ? cipherStatus.textContent : 'Start the console to receive a fresh cipher.',
  };

  const GAMES = {
    reflex: {
      title: 'Reflex Reactor',
      blurb: 'Arm the core, wait for the flash, and slam the button with lightning speed.',
      element: reflexModule,
      reset: resetReflexUI,
    },
    memory: {
      title: 'Nebula Sequence',
      blurb: 'Track the glowing nebula pattern and replay it with flawless precision.',
      element: memoryModule,
      reset: resetMemoryUI,
    },
    math: {
      title: 'Quantum Sums',
      blurb: 'Solve three equations before the quantum window collapses to maximise payouts.',
      element: mathModule,
      reset: resetMathUI,
    },
    target: {
      title: 'Target Lock',
      blurb: 'Track the roaming drone and land precision hits before it cloaks again.',
      element: targetModule,
      reset: resetTargetUI,
    },
    rhythm: {
      title: 'Pulse Rhythm',
      blurb: 'Hit the beat exactly when the pulse turns electric to climb the payout ladder.',
      element: rhythmModule,
      reset: resetRhythmUI,
    },
    cipher: {
      title: 'Cipher Grid',
      blurb: 'Crack a four-symbol neon code using limited intel from each attempt.',
      element: cipherModule,
      reset: resetCipherUI,
    },
  };

  let currentGameId = null;
  const CIPHER_SYMBOLS = ['A', 'B', 'C', 'D', 'E', 'F'];

  function updateCredits(options) {
    bankroll.setBalance(credits, options);
  }

  function flashCredits(tone = 'neutral') {
    flashIndicator(creditsDisplay, tone);
  }

  function setStatus(element, message, tone = 'neutral') {
    applyStatus(element, message, tone);
  }

  function logEvent(game, message, net = 0, tone) {
    recordEvent(skillLog, { game, message, net, tone });
  }

  function applyStake(amount) {
    if (amount > credits) return false;
    credits -= amount;
    updateCredits();
    flashCredits('negative');
    return true;
  }

  function deactivateModules() {
    Object.values(GAMES).forEach(game => {
      if (game.element) game.element.hidden = true;
    });
  }

  function deactivateCurrentGame({ refund = false, silence = false } = {}) {
    if (currentGameId && GAMES[currentGameId]) {
      GAMES[currentGameId].reset({ refund, keepStatus: silence });
      if (GAMES[currentGameId].element) GAMES[currentGameId].element.hidden = true;
    }
    currentGameId = null;
    skillPlaceholder.hidden = false;
    if (skillBackBtn) skillBackBtn.hidden = true;
    skillGameTitle.textContent = DEFAULT_TITLE;
    skillGameBlurb.textContent = DEFAULT_BLURB;
  }

  function activateGame(gameId) {
    if (!GAMES[gameId]) return;
    if (currentGameId === gameId) return;
    if (currentGameId) {
      const previous = GAMES[currentGameId];
      if (previous) previous.reset({ refund: true, keepStatus: false });
    }
    deactivateModules();
    currentGameId = gameId;
    const game = GAMES[gameId];
    if (game.element) game.element.hidden = false;
    skillPlaceholder.hidden = true;
    if (skillBackBtn) skillBackBtn.hidden = false;
    skillGameTitle.textContent = game.title;
    skillGameBlurb.textContent = game.blurb;
    game.reset({ refund: false, keepStatus: false });
  }

  const reflexState = {
    bet: 0,
    waiting: false,
    awaitingTap: false,
    timer: null,
    failTimer: null,
    startTime: 0,
  };

  function resetReflexUI({ refund = false, keepStatus = false } = {}) {
    clearTimeout(reflexState.timer);
    clearTimeout(reflexState.failTimer);
    reflexState.timer = null;
    reflexState.failTimer = null;

    if (refund && reflexState.bet > 0) {
      credits += reflexState.bet;
      updateCredits();
      flashCredits('neutral');
    }

    reflexState.bet = 0;
    reflexState.waiting = false;
    reflexState.awaitingTap = false;
    reflexState.startTime = 0;

    if (reflexDisplay) {
      reflexDisplay.classList.remove('is-armed', 'is-ready');
      reflexDisplay.textContent = 'Arm the reactor to begin.';
    }
    if (reflexTapBtn) reflexTapBtn.disabled = true;
    if (!keepStatus) {
      setStatus(reflexStatus, DEFAULT_STATUS.reflex, 'neutral');
    }
  }

  function finishReflexRound({ payout, message, tone }) {
    clearTimeout(reflexState.timer);
    clearTimeout(reflexState.failTimer);
    reflexState.timer = null;
    reflexState.failTimer = null;
    reflexState.waiting = false;
    reflexState.awaitingTap = false;

    const bet = reflexState.bet;
    const net = payout - bet;

    if (payout > 0) {
      credits += payout;
      updateCredits();
      flashCredits(net > 0 ? 'positive' : 'neutral');
    }

    setStatus(reflexStatus, message, tone);
    logEvent('Reflex Reactor', message, net);
    resetReflexUI({ keepStatus: true });
  }

  function startReflexRound() {
    if (reflexState.waiting || reflexState.awaitingTap) return;
    const rawBet = Number(reflexBetInput ? reflexBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 20) {
      setStatus(reflexStatus, 'Minimum reactor stake is 20 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 5) * 5;
    if (!applyStake(bet)) {
      setStatus(reflexStatus, 'Not enough credits for this reactor sequence.', 'negative');
      return;
    }

    reflexState.bet = bet;
    reflexState.waiting = true;
    if (reflexTapBtn) reflexTapBtn.disabled = false;

    if (reflexDisplay) {
      reflexDisplay.textContent = 'Hold...';
      reflexDisplay.classList.remove('is-ready');
      reflexDisplay.classList.add('is-armed');
    }
    setStatus(reflexStatus, 'Wait for the reactor to go green, then tap immediately.', 'neutral');

    const delay = 900 + Math.random() * 2000;
    reflexState.timer = setTimeout(() => {
      reflexState.waiting = false;
      reflexState.awaitingTap = true;
      reflexState.startTime = performance.now();
      if (reflexDisplay) {
        reflexDisplay.textContent = 'Tap!';
        reflexDisplay.classList.remove('is-armed');
        reflexDisplay.classList.add('is-ready');
      }
      reflexState.failTimer = setTimeout(() => {
        finishReflexRound({
          payout: 0,
          tone: 'negative',
          message: 'Too slow! The reactor vented your wager.',
        });
      }, 1500);
    }, delay);
  }

  if (reflexStartBtn) reflexStartBtn.addEventListener('click', startReflexRound);

  if (reflexTapBtn) {
    reflexTapBtn.addEventListener('click', () => {
      if (!reflexState.bet) return;
      if (reflexState.waiting) {
        finishReflexRound({
          payout: 0,
          tone: 'negative',
          message: 'False start! Triggered before the reactor flashed green.',
        });
        return;
      }
      if (!reflexState.awaitingTap) return;
      const reaction = performance.now() - reflexState.startTime;
      let multiplier = 0;
      let tone = 'negative';
      let message = `Reaction checked in at ${reaction.toFixed(0)}ms. Reactor keeps the wager.`;

      if (reaction <= 250) {
        multiplier = 3;
        tone = 'positive';
        message = `Lightning fast! ${reaction.toFixed(0)}ms locks in a triple payout.`;
      } else if (reaction <= 400) {
        multiplier = 2;
        tone = 'positive';
        message = `Sharp response at ${reaction.toFixed(0)}ms. Double payout secured.`;
      } else if (reaction <= 550) {
        multiplier = 1.2;
        tone = 'neutral';
        message = `Solid timing at ${reaction.toFixed(0)}ms. Reactor boosts you by 1.2×.`;
      }

      const payout = Math.round(reflexState.bet * multiplier);
      finishReflexRound({ payout, tone, message });
    });
  }

  const memoryState = {
    bet: 0,
    sequence: [],
    step: 0,
    revealTimers: [],
    acceptingInput: false,
  };

  function clearMemoryTimers() {
    memoryState.revealTimers.forEach(timer => clearTimeout(timer));
    memoryState.revealTimers.length = 0;
  }

  function resetMemoryUI({ refund = false, keepStatus = false } = {}) {
    clearMemoryTimers();
    if (refund && memoryState.bet > 0) {
      credits += memoryState.bet;
      updateCredits();
      flashCredits('neutral');
    }
    memoryState.bet = 0;
    memoryState.sequence = [];
    memoryState.step = 0;
    memoryState.acceptingInput = false;
    memoryPads.forEach(pad => pad.classList.remove('is-lit'));
    if (!keepStatus) {
      setStatus(memoryStatus, DEFAULT_STATUS.memory, 'neutral');
    }
  }

  function finishMemoryRound(success) {
    const bet = memoryState.bet;
    let payout = 0;
    let tone = 'negative';
    let message = 'Pattern drifted out of focus. Nebula claims the wager.';

    if (success) {
      payout = Math.round(bet * 2.8);
      tone = 'positive';
      message = `Nebula stabilised! Sequence replayed perfectly for ${payout.toLocaleString()} credits.`;
    }

    const net = payout - bet;
    if (payout > 0) {
      credits += payout;
      updateCredits();
      flashCredits('positive');
    }

    setStatus(memoryStatus, message, tone);
    logEvent('Nebula Sequence', message, net);
    resetMemoryUI({ keepStatus: true });
  }

  function flashMemoryPad(pad) {
    if (!pad) return;
    pad.classList.add('is-lit');
    const offTimer = setTimeout(() => pad.classList.remove('is-lit'), 260);
    memoryState.revealTimers.push(offTimer);
  }

  function startMemoryRound() {
    if (memoryState.sequence.length > 0 || memoryState.acceptingInput) return;
    const rawBet = Number(memoryBetInput ? memoryBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 25) {
      setStatus(memoryStatus, 'Minimum sequence stake is 25 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 5) * 5;
    if (!applyStake(bet)) {
      setStatus(memoryStatus, 'Not enough credits to stabilise the nebula.', 'negative');
      return;
    }

    resetMemoryUI({ keepStatus: true });
    memoryState.bet = bet;
    const length = 3 + Math.floor(Math.random() * 3); // 3-5 steps
    memoryState.sequence = Array.from({ length }, () => Math.floor(Math.random() * memoryPads.length));
    setStatus(memoryStatus, 'Observe the pattern closely...', 'neutral');

    memoryState.sequence.forEach((padIndex, step) => {
      const timerOn = setTimeout(() => {
        flashMemoryPad(memoryPads[padIndex]);
        if (step === memoryState.sequence.length - 1) {
          const readyTimer = setTimeout(() => {
            memoryState.acceptingInput = true;
            memoryState.step = 0;
            setStatus(memoryStatus, 'Your turn! Tap the pads in order.', 'neutral');
          }, 320);
          memoryState.revealTimers.push(readyTimer);
        }
      }, step * 620);
      memoryState.revealTimers.push(timerOn);
    });
  }

  if (memoryStartBtn) memoryStartBtn.addEventListener('click', startMemoryRound);

  memoryPads.forEach(pad => {
    pad.addEventListener('click', () => {
      if (!memoryState.acceptingInput) return;
      const index = Number(pad.dataset.index);
      flashMemoryPad(pad);
      const expected = memoryState.sequence[memoryState.step];
      if (index !== expected) {
        memoryState.acceptingInput = false;
        finishMemoryRound(false);
        return;
      }
      memoryState.step += 1;
      if (memoryState.step >= memoryState.sequence.length) {
        memoryState.acceptingInput = false;
        finishMemoryRound(true);
      }
    });
  });

  const mathState = {
    bet: 0,
    questions: [],
    index: 0,
    correct: 0,
    timer: null,
    timeLeft: 0,
    timeout: false,
  };

  function resetMathUI({ refund = false, keepStatus = false } = {}) {
    clearInterval(mathState.timer);
    mathState.timer = null;
    mathState.questions = [];
    mathState.index = 0;
    mathState.correct = 0;
    mathState.timeLeft = 0;
    mathState.timeout = false;

    if (refund && mathState.bet > 0) {
      credits += mathState.bet;
      updateCredits();
      flashCredits('neutral');
    }
    const defaultRemaining = '3';
    const defaultTimer = '25s';

    if (mathQuestionEl) mathQuestionEl.textContent = '--';
    if (mathRemainingEl) mathRemainingEl.textContent = defaultRemaining;
    if (mathTimerEl) mathTimerEl.textContent = defaultTimer;
    if (mathAnswerInput) {
      mathAnswerInput.value = '';
      mathAnswerInput.disabled = true;
    }
    if (mathSubmitBtn) mathSubmitBtn.disabled = true;

    mathState.bet = 0;
    if (!keepStatus) {
      setStatus(mathStatus, DEFAULT_STATUS.math, 'neutral');
    }
  }

  function createMathQuestion() {
    const modes = ['add', 'subtract', 'multiply'];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    let a;
    let b;
    let prompt;
    let answer;

    if (mode === 'add') {
      a = Math.floor(Math.random() * 40) + 10;
      b = Math.floor(Math.random() * 40) + 10;
      prompt = `${a} + ${b}`;
      answer = a + b;
    } else if (mode === 'subtract') {
      a = Math.floor(Math.random() * 40) + 30;
      b = Math.floor(Math.random() * 30) + 5;
      prompt = `${a} − ${b}`;
      answer = a - b;
    } else {
      a = Math.floor(Math.random() * 8) + 3;
      b = Math.floor(Math.random() * 7) + 2;
      prompt = `${a} × ${b}`;
      answer = a * b;
    }

    return { prompt, answer };
  }

  function updateMathQuestion() {
    const remaining = Math.max(mathState.questions.length - mathState.index, 0);
    if (mathRemainingEl) mathRemainingEl.textContent = remaining.toString();
    if (mathQuestionEl) {
      const next = mathState.questions[mathState.index];
      mathQuestionEl.textContent = next ? next.prompt : '--';
    }
    if (mathAnswerInput) {
      mathAnswerInput.value = '';
      mathAnswerInput.disabled = !mathState.questions.length || mathState.index >= mathState.questions.length;
      if (!mathAnswerInput.disabled) mathAnswerInput.focus();
    }
    if (mathSubmitBtn) {
      mathSubmitBtn.disabled = !mathState.questions.length || mathState.index >= mathState.questions.length;
    }
  }

  function completeMathRound({ timeout = false } = {}) {
    clearInterval(mathState.timer);
    mathState.timer = null;
    mathState.timeout = timeout;

    const bet = mathState.bet;
    let payout = 0;
    let tone = 'negative';
    let message = 'Time collapsed before you finished. Quantum vault keeps the wager.';

    if (!timeout) {
      if (mathState.correct === mathState.questions.length) {
        payout = Math.round(bet * 3);
        tone = 'positive';
        message = `Flawless! ${mathState.correct}/3 correct earns ${payout.toLocaleString()} credits.`;
      } else if (mathState.correct === mathState.questions.length - 1) {
        payout = Math.round(bet * 1.8);
        tone = 'positive';
        message = `Great work—${mathState.correct}/3 correct multiplies your stake by 1.8×.`;
      } else if (mathState.correct === 1) {
        payout = bet;
        tone = 'neutral';
        message = 'One correct answer salvaged your stake. Credits returned.';
      } else if (mathState.correct > 1) {
        payout = Math.round(bet * 1.2);
        tone = 'neutral';
        message = `${mathState.correct}/3 correct nets a modest 1.2× return.`;
      } else {
        message = 'All answers drifted off target. Vault keeps the wager.';
      }
    }

    const net = payout - bet;
    if (payout > 0) {
      credits += payout;
      updateCredits();
      flashCredits(net > 0 ? 'positive' : 'neutral');
    }

    setStatus(mathStatus, message, tone);
    logEvent('Quantum Sums', message, net);
    resetMathUI({ keepStatus: true });
  }

  function startMathRound() {
    if (mathState.questions.length) return;
    const rawBet = Number(mathBetInput ? mathBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 20) {
      setStatus(mathStatus, 'Minimum quiz stake is 20 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 5) * 5;
    if (!applyStake(bet)) {
      setStatus(mathStatus, 'Not enough credits to enter the quantum vault.', 'negative');
      return;
    }

    resetMathUI({ keepStatus: true });
    mathState.bet = bet;
    mathState.questions = Array.from({ length: 3 }, createMathQuestion);
    mathState.index = 0;
    mathState.correct = 0;
    mathState.timeLeft = 25;
    mathState.timeout = false;

    if (mathTimerEl) mathTimerEl.textContent = `${mathState.timeLeft}s`;
    setStatus(mathStatus, 'Solve all three equations before the timer expires.', 'neutral');
    updateMathQuestion();

    mathState.timer = setInterval(() => {
      mathState.timeLeft -= 1;
      if (mathTimerEl) mathTimerEl.textContent = `${Math.max(mathState.timeLeft, 0)}s`;
      if (mathState.timeLeft <= 0) {
        completeMathRound({ timeout: true });
      }
    }, 1000);
  }

  if (mathStartBtn) mathStartBtn.addEventListener('click', startMathRound);

  if (mathSubmitBtn) {
    mathSubmitBtn.addEventListener('click', () => {
      if (!mathState.questions.length || mathState.index >= mathState.questions.length) return;
      const answer = Number(mathAnswerInput ? mathAnswerInput.value : NaN);
      const current = mathState.questions[mathState.index];
      if (Number.isFinite(answer) && current && answer === current.answer) {
        mathState.correct += 1;
      }
      mathState.index += 1;
      if (mathState.index >= mathState.questions.length) {
        completeMathRound();
      } else {
        updateMathQuestion();
      }
    });
  }

  if (mathAnswerInput) {
    mathAnswerInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!mathSubmitBtn?.disabled) {
          mathSubmitBtn.click();
        }
      }
    });
  }

  const targetState = {
    bet: 0,
    hits: 0,
    countdown: 0,
    timer: null,
    moveTimer: null,
    active: false,
  };

  const rhythmState = {
    bet: 0,
    hits: 0,
    round: 0,
    active: false,
    windowOpen: false,
    pulseTimer: null,
    windowTimer: null,
  };
  const cipherState = {
    active: false,
    bet: 0,
    code: [],
    attempts: 0,
    maxAttempts: 4,
    bestExact: 0,
  };

  function resetTargetUI({ refund = false, keepStatus = false } = {}) {
    clearInterval(targetState.timer);
    clearInterval(targetState.moveTimer);
    targetState.timer = null;
    targetState.moveTimer = null;
    if (refund && targetState.bet > 0) {
      credits += targetState.bet;
      updateCredits();
      flashCredits('neutral');
    }
    targetState.bet = 0;
    targetState.hits = 0;
    targetState.countdown = 0;
    targetState.active = false;
    if (targetHitsEl) targetHitsEl.textContent = '0';
    if (targetTimeEl) targetTimeEl.textContent = '20s';
    if (targetDot) {
      targetDot.hidden = true;
      targetDot.style.left = '50%';
      targetDot.style.top = '50%';
    }
    if (!keepStatus) {
      setStatus(targetStatus, DEFAULT_STATUS.target, 'neutral');
    }
  }

  function moveTargetDot() {
    if (!targetDot) return;
    const left = 12 + Math.random() * 76;
    const top = 18 + Math.random() * 64;
    targetDot.style.left = `${left}%`;
    targetDot.style.top = `${top}%`;
  }

  function finishTargetRound() {
    clearInterval(targetState.timer);
    clearInterval(targetState.moveTimer);
    targetState.timer = null;
    targetState.moveTimer = null;
    targetState.active = false;

    const bet = targetState.bet;
    let payout = 0;
    let tone = 'negative';
    let message = `Drone escaped after ${targetState.hits} hit${targetState.hits === 1 ? '' : 's'}.`;

    if (targetState.hits >= 6) {
      payout = Math.round(bet * 2.5);
      tone = 'positive';
      message = `Drone disabled! ${targetState.hits} hits bank ${payout.toLocaleString()} credits.`;
    } else if (targetState.hits >= 4) {
      payout = Math.round(bet * 1.4);
      tone = 'positive';
      message = `Solid pursuit—${targetState.hits} hits earn a ${payout.toLocaleString()} credit haul.`;
    }

    const net = payout - bet;
    if (payout > 0) {
      credits += payout;
      updateCredits();
      flashCredits('positive');
    }

    setStatus(targetStatus, message, tone);
    logEvent('Target Lock', message, net);
    resetTargetUI({ keepStatus: true });
  }

  function startTargetRound() {
    if (targetState.active) return;
    const rawBet = Number(targetBetInput ? targetBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 25) {
      setStatus(targetStatus, 'Minimum drone stake is 25 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 5) * 5;
    if (!applyStake(bet)) {
      setStatus(targetStatus, 'Not enough credits to deploy the drone.', 'negative');
      return;
    }

    resetTargetUI({ keepStatus: true });
    targetState.bet = bet;
    targetState.hits = 0;
    targetState.countdown = 20;
    targetState.active = true;

    if (targetHitsEl) targetHitsEl.textContent = '0';
    if (targetTimeEl) targetTimeEl.textContent = `${targetState.countdown}s`;
    if (targetDot) targetDot.hidden = false;
    moveTargetDot();
    setStatus(targetStatus, 'Hit the drone six times before it cloaks.', 'neutral');

    targetState.moveTimer = setInterval(moveTargetDot, 850);
    targetState.timer = setInterval(() => {
      targetState.countdown -= 1;
      if (targetTimeEl) targetTimeEl.textContent = `${Math.max(targetState.countdown, 0)}s`;
      if (targetState.countdown <= 0) {
        finishTargetRound();
      }
    }, 1000);
  }

  if (targetStartBtn) targetStartBtn.addEventListener('click', startTargetRound);

  if (targetDot) {
    targetDot.addEventListener('click', event => {
      if (!targetState.active) return;
      event.preventDefault();
      targetState.hits += 1;
      if (targetHitsEl) targetHitsEl.textContent = targetState.hits.toString();
      moveTargetDot();
      if (targetState.hits >= 6) {
        finishTargetRound();
      }
    });
  }

  if (targetArena) {
    targetArena.addEventListener('click', () => {
      if (!targetState.active) return;
      // Clicking the arena without hitting the target has no direct effect.
    });
  }

  function clearRhythmTimers() {
    clearTimeout(rhythmState.pulseTimer);
    clearTimeout(rhythmState.windowTimer);
    rhythmState.pulseTimer = null;
    rhythmState.windowTimer = null;
  }

  function resetRhythmUI({ refund = false, keepStatus = false } = {}) {
    clearRhythmTimers();
    if (refund && rhythmState.bet > 0) {
      credits += rhythmState.bet;
      updateCredits();
      flashCredits('neutral');
    }
    rhythmState.bet = 0;
    rhythmState.hits = 0;
    rhythmState.round = 0;
    rhythmState.active = false;
    rhythmState.windowOpen = false;
    if (rhythmStrikeBtn) rhythmStrikeBtn.disabled = true;
    if (rhythmPulseEl) rhythmPulseEl.classList.remove('is-live');
    if (rhythmPrompt) rhythmPrompt.textContent = 'Press start to enter the beat grid.';
    if (!keepStatus) setStatus(rhythmStatus, DEFAULT_STATUS.rhythm, 'neutral');
  }

  function queueNextPulse() {
    clearTimeout(rhythmState.pulseTimer);
    if (!rhythmState.active) return;
    rhythmState.round += 1;
    if (rhythmState.round > 3) {
      finishRhythmRound();
      return;
    }
    if (rhythmPrompt) rhythmPrompt.textContent = `Pulse ${rhythmState.round}/3 incoming...`;
    const delay = 600 + Math.random() * 900;
    rhythmState.pulseTimer = setTimeout(() => {
      if (rhythmState.active) openRhythmWindow();
    }, delay);
  }

  function openRhythmWindow() {
    clearTimeout(rhythmState.windowTimer);
    if (!rhythmState.active) return;
    rhythmState.windowOpen = true;
    if (rhythmPulseEl) rhythmPulseEl.classList.add('is-live');
    if (rhythmPrompt) rhythmPrompt.textContent = 'Strike now!';
    if (rhythmStrikeBtn) rhythmStrikeBtn.disabled = false;
    rhythmState.windowTimer = setTimeout(() => {
      closeRhythmWindow(false);
    }, 520);
  }

  function closeRhythmWindow(hit) {
    clearTimeout(rhythmState.windowTimer);
    rhythmState.windowTimer = null;
    if (rhythmPulseEl) rhythmPulseEl.classList.remove('is-live');
    if (rhythmStrikeBtn) rhythmStrikeBtn.disabled = true;
    rhythmState.windowOpen = false;

    if (!rhythmState.active) return;

    if (!hit) {
      setStatus(rhythmStatus, 'Missed the flash. Stay ready for the next pulse.', 'negative');
    }

    if (rhythmState.round >= 3) {
      rhythmState.pulseTimer = setTimeout(() => {
        if (rhythmState.active) finishRhythmRound();
      }, 420);
    } else {
      rhythmState.pulseTimer = setTimeout(() => {
        if (rhythmState.active) queueNextPulse();
      }, 420);
    }
  }

  function finishRhythmRound() {
    clearRhythmTimers();
    if (rhythmPulseEl) rhythmPulseEl.classList.remove('is-live');
    if (rhythmStrikeBtn) rhythmStrikeBtn.disabled = true;
    const bet = rhythmState.bet;
    const hits = rhythmState.hits;
    let payout = 0;
    let tone = 'negative';
    let message = `No beats captured. The house keeps your ${bet.toLocaleString()} credits.`;

    if (hits >= 3) {
      payout = Math.round(bet * 3.2);
      tone = 'positive';
      message = `Flawless rhythm! All three pulses hit for ${payout.toLocaleString()} credits.`;
    } else if (hits === 2) {
      payout = Math.round(bet * 1.6);
      tone = 'positive';
      message = `Solid groove. Two pulses locked for ${payout.toLocaleString()} credits.`;
    } else if (hits === 1) {
      payout = bet;
      tone = 'neutral';
      message = 'One pulse landed. Stake returned for holding the baseline.';
    }

    const net = payout - bet;
    if (payout > 0) {
      credits += payout;
      updateCredits();
      flashCredits(net > 0 ? 'positive' : 'neutral');
    } else {
      flashCredits('negative');
    }

    setStatus(rhythmStatus, message, tone);
    logEvent('Pulse Rhythm', message, net);
    showResultModal({
      game: 'Pulse Rhythm',
      bet,
      payout,
      message,
      tone,
    });

    resetRhythmUI({ keepStatus: true });
  }

  function startRhythmRound() {
    if (rhythmState.active) return;
    const rawBet = Number(rhythmBetInput ? rhythmBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 20) {
      setStatus(rhythmStatus, 'Minimum pulse stake is 20 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 5) * 5;
    if (!applyStake(bet)) {
      setStatus(rhythmStatus, 'Not enough credits to sync with the pulse.', 'negative');
      return;
    }

    resetRhythmUI({ keepStatus: true });
    rhythmState.bet = bet;
    rhythmState.active = true;
    rhythmState.hits = 0;
    rhythmState.round = 0;
    setStatus(rhythmStatus, 'Pulse calibrating... watch for the flash.', 'neutral');
    if (rhythmPrompt) rhythmPrompt.textContent = 'Stay ready... pulse is arming.';
    queueNextPulse();
  }

  function handleRhythmStrike() {
    if (!rhythmState.active) return;
    if (!rhythmState.windowOpen) {
      setStatus(rhythmStatus, 'Too early. Wait for the pulse to glow.', 'negative');
      if (rhythmStrikeBtn) rhythmStrikeBtn.disabled = true;
      return;
    }
    rhythmState.hits += 1;
    setStatus(rhythmStatus, `Beat locked! ${rhythmState.hits} of ${rhythmState.round} pulses secured.`, 'positive');
    closeRhythmWindow(true);
  }

  if (rhythmStartBtn) rhythmStartBtn.addEventListener('click', startRhythmRound);
  if (rhythmStrikeBtn) rhythmStrikeBtn.addEventListener('click', handleRhythmStrike);

  // Cipher Grid -------------------------------------------------------------
  function resetCipherUI({ refund = false, keepStatus = false } = {}) {
    if (refund && cipherState.bet > 0) {
      credits += cipherState.bet;
      updateCredits();
      flashCredits('neutral');
    }
    cipherState.bet = 0;
    cipherState.code = [];
    cipherState.attempts = 0;
    cipherState.bestExact = 0;
    cipherState.active = false;
    if (cipherGuessInput) {
      cipherGuessInput.value = '';
      cipherGuessInput.disabled = true;
    }
    if (cipherSubmitBtn) cipherSubmitBtn.disabled = true;
    if (cipherAttemptsList) {
      cipherAttemptsList.innerHTML =
        '<p class="cipher-empty">Start the console to receive a neon cipher.</p>';
    }
    if (!keepStatus) setStatus(cipherStatus, DEFAULT_STATUS.cipher, 'neutral');
  }

  function finishCipherRound({ payout = 0, tone = 'negative', message = '' }) {
    if (payout > 0) {
      credits += payout;
      updateCredits();
      flashCredits(payout > cipherState.bet ? 'positive' : 'neutral');
    } else {
      flashCredits('negative');
    }
    const net = payout - cipherState.bet;
    setStatus(cipherStatus, message, tone);
    logEvent('Cipher Grid', message, net, tone);
    cipherState.bet = 0;
    cipherState.active = false;
    cipherState.code = [];
    cipherState.attempts = 0;
    cipherState.bestExact = 0;
    if (cipherGuessInput) {
      cipherGuessInput.value = '';
      cipherGuessInput.disabled = true;
    }
    if (cipherSubmitBtn) cipherSubmitBtn.disabled = true;
  }

  function startCipherRound() {
    const rawBet = Number(cipherBetInput ? cipherBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 40) {
      setStatus(cipherStatus, 'Minimum cipher stake is 40 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 10) * 10;
    if (!applyStake(bet)) {
      setStatus(cipherStatus, 'Not enough credits to power the console.', 'negative');
      return;
    }

    resetCipherUI({ refund: false, keepStatus: true });
    cipherState.bet = bet;
    cipherState.code = Array.from({ length: 4 }, () => CIPHER_SYMBOLS[Math.floor(Math.random() * CIPHER_SYMBOLS.length)]);
    cipherState.active = true;
    setStatus(cipherStatus, 'Cipher online. Enter four letters (A–F).', 'neutral');
    if (cipherGuessInput) {
      cipherGuessInput.disabled = false;
      cipherGuessInput.value = '';
      cipherGuessInput.focus();
    }
    if (cipherSubmitBtn) cipherSubmitBtn.disabled = false;
    if (cipherAttemptsList) cipherAttemptsList.innerHTML = '';
  }

  function submitCipherGuess() {
    if (!cipherState.active) {
      setStatus(cipherStatus, 'Start the console to receive a code.', 'negative');
      return;
    }
    const rawGuess = (cipherGuessInput ? cipherGuessInput.value : '').trim().toUpperCase();
    if (!/^[A-F]{4}$/.test(rawGuess)) {
      setStatus(cipherStatus, 'Enter exactly four letters between A and F.', 'negative');
      return;
    }
    const guess = rawGuess.split('');
    cipherState.attempts += 1;
    const freq = {};
    cipherState.code.forEach(letter => {
      freq[letter] = (freq[letter] || 0) + 1;
    });
    let exact = 0;
    guess.forEach((letter, idx) => {
      if (cipherState.code[idx] === letter) {
        exact += 1;
        freq[letter] -= 1;
      }
    });
    let partial = 0;
    guess.forEach((letter, idx) => {
      if (cipherState.code[idx] !== letter && freq[letter] > 0) {
        partial += 1;
        freq[letter] -= 1;
      }
    });
    cipherState.bestExact = Math.max(cipherState.bestExact, exact);

    if (cipherAttemptsList) {
      const row = document.createElement('div');
      row.className = 'cipher-attempts__item';
      row.innerHTML = `<strong>${guess.join(' ')}</strong><span>${exact} exact · ${partial} near</span>`;
      cipherAttemptsList.appendChild(row);
    }

    if (exact === 4) {
      const payout = Math.round(cipherState.bet * 3.5);
      finishCipherRound({
        payout,
        tone: 'positive',
        message: `Cipher cracked! Console pays ${payout.toLocaleString()} credits.`,
      });
      return;
    }

    if (cipherState.attempts >= cipherState.maxAttempts) {
      const reveal = cipherState.code.join('');
      let multiplier = 0;
      if (cipherState.bestExact >= 3) multiplier = 1.6;
      else if (cipherState.bestExact === 2) multiplier = 1;
      const payout = Math.round(cipherState.bet * multiplier);
      const tone = multiplier > 1 ? 'positive' : multiplier === 1 ? 'neutral' : 'negative';
      const message =
        multiplier > 0
          ? `Partial decrypt (${cipherState.bestExact} exact). Code was ${reveal}.`
          : `Grid locked. Code was ${reveal}.`;
      finishCipherRound({ payout, tone, message });
      return;
    }

    const remaining = cipherState.maxAttempts - cipherState.attempts;
    setStatus(
      cipherStatus,
      `${exact} exact · ${partial} near. ${remaining} attempt${remaining === 1 ? '' : 's'} left.`,
      'neutral'
    );
    if (cipherGuessInput) cipherGuessInput.value = '';
  }

  if (cipherStartBtn) cipherStartBtn.addEventListener('click', startCipherRound);
  if (cipherSubmitBtn) cipherSubmitBtn.addEventListener('click', submitCipherGuess);
  if (cipherGuessInput) {
    cipherGuessInput.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !cipherSubmitBtn?.disabled) {
        event.preventDefault();
        cipherSubmitBtn.click();
      }
    });
  }


  if (skillGrid) {
    skillGrid.addEventListener('click', event => {
      const card = event.target.closest('.skill-card');
      if (!card) return;
      const gameId = card.dataset.game;
      if (!gameId) return;
      activateGame(gameId);
    });
  }

  if (skillBackBtn) {
    skillBackBtn.addEventListener('click', () => {
      deactivateCurrentGame({ refund: true, silence: false });
    });
  }

  if (resetBtn) {
    attachConfirmAction(resetBtn, {
      confirmLabel: 'Confirm reset',
      onConfirm: () => {
        bankroll.reset({ tone: 'neutral' });
        credits = bankroll.balance;
        flashCredits('neutral');
        deactivateCurrentGame({ refund: false, silence: true });
        Object.values(GAMES).forEach(game => game.reset({ refund: false, keepStatus: false }));
        logEvent('Skill Hub', 'Bankroll reset to 1,000 credits.', 0);
        showToast('Skill hub bankroll reset to 1,000 credits.', { tone: 'neutral' });
      },
    });
  }

  // Game start buttons may reset states when switching games
  Object.values(GAMES).forEach(game => {
    if (game.element) game.element.hidden = true;
  });
  if (skillBackBtn) skillBackBtn.hidden = true;
  skillPlaceholder.hidden = false;

  resetReflexUI();
  resetMemoryUI();
  resetMathUI();
  resetTargetUI();
  resetRhythmUI();
  resetCipherUI();
  updateCredits();
  logEvent('Host', 'Skill hub ready. Balance seeded with 1,000 credits.', 0);
}
