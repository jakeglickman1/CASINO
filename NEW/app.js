import { createBankroll } from './core/bankroll.js';
import {
  flashIndicator,
  setStatus as applyStatus,
  logEvent as recordEvent,
  attachConfirmAction,
  showToast,
} from './core/ui.js';

const STARTING_CREDITS = 1000;

const creditsDisplay = document.getElementById('creditsDisplay');
if (!creditsDisplay) {
  console.warn('Casino floor UI not found.');
} else {
  let credits = STARTING_CREDITS;

  const resetBtn = document.getElementById('resetBankroll');
  const historyEl = document.getElementById('history');

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

  const slotSymbols = ['🍒', '🍋', '⭐', '7️⃣', '💎', '🍀'];
  const slotSymbolLabels = new Map([
    ['🍒', 'Cherry'],
    ['🍋', 'Lemon'],
    ['⭐', 'Star'],
    ['7️⃣', 'Seven'],
    ['💎', 'Diamond'],
    ['🍀', 'Clover'],
  ]);

  const slotsBetInput = document.getElementById('slotsBet');
  const spinButton = document.getElementById('spinButton');
  const slotsStatus = document.getElementById('slotsStatus');
  const slotReels = [
    document.getElementById('reel1'),
    document.getElementById('reel2'),
    document.getElementById('reel3'),
  ];

  slotReels.forEach(reel => {
    if (!reel) return;
    reel.setAttribute('role', 'img');
    const label = slotSymbolLabels.get(reel.textContent.trim());
    if (label) reel.setAttribute('aria-label', label);
  });

  const duelBetInput = document.getElementById('duelBet');
  const duelButton = document.getElementById('duelButton');
  const playerCardEl = document.getElementById('playerCard');
  const dealerCardEl = document.getElementById('dealerCard');
  const duelStatus = document.getElementById('duelStatus');

  const rouletteForm = document.getElementById('rouletteForm');
  const rouletteBetInput = document.getElementById('rouletteBet');
  const rouletteChoice = document.getElementById('rouletteChoice');
  const rouletteStatus = document.getElementById('rouletteStatus');
  const rouletteResultEl = document.getElementById('rouletteResult');
  const rouletteWheelEl = document.getElementById('rouletteWheel');
  const roulettePointerEl = document.getElementById('roulettePointer');

  const crapsBetInput = document.getElementById('crapsBet');
  const crapsRollBtn = document.getElementById('crapsRoll');
  const crapsStatus = document.getElementById('crapsStatus');
  const crapsDiceEl = document.getElementById('crapsDice');
  const crapsPointEl = document.getElementById('crapsPoint');

  const baccaratBetInput = document.getElementById('baccaratBet');
  const baccaratChoiceSelect = document.getElementById('baccaratChoice');
  const baccaratDealBtn = document.getElementById('baccaratDeal');
  const baccaratStatus = document.getElementById('baccaratStatus');
  const baccaratPlayerRow = document.getElementById('baccaratPlayer');
  const baccaratBankerRow = document.getElementById('baccaratBanker');
  const baccaratPlayerScoreEl = document.getElementById('baccaratPlayerScore');
  const baccaratBankerScoreEl = document.getElementById('baccaratBankerScore');
  const blackjackBetInput = document.getElementById('blackjackBet');
  const blackjackDealBtn = document.getElementById('blackjackDeal');
  const blackjackHitBtn = document.getElementById('blackjackHit');
  const blackjackStandBtn = document.getElementById('blackjackStand');
  const blackjackPlayerRow = document.getElementById('blackjackPlayer');
  const blackjackDealerRow = document.getElementById('blackjackDealer');
  const blackjackPlayerValueEl = document.getElementById('blackjackPlayerValue');
  const blackjackDealerValueEl = document.getElementById('blackjackDealerValue');
  const blackjackStatus = document.getElementById('blackjackStatus');

  const pokerBetInput = document.getElementById('pokerBet');
  const pokerDealBtn = document.getElementById('pokerDeal');
  const pokerDrawBtn = document.getElementById('pokerDraw');
  const pokerRevealBtn = document.getElementById('pokerReveal');
  const pokerPlayerRow = document.getElementById('pokerPlayerHand');
  const pokerAi1Row = document.getElementById('pokerAi1');
  const pokerAi2Row = document.getElementById('pokerAi2');
  const pokerPlayerRankEl = document.getElementById('pokerPlayerRank');
  const pokerAi1RankEl = document.getElementById('pokerAi1Rank');
  const pokerAi2RankEl = document.getElementById('pokerAi2Rank');
  const pokerStatus = document.getElementById('pokerStatus');

  const SUITS = ['♠', '♥', '♦', '♣'];
  const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];
  const RANK_ORDER = new Map([
    ['A', 14],
    ['K', 13],
    ['Q', 12],
    ['J', 11],
    ['10', 10],
    ['9', 9],
    ['8', 8],
    ['7', 7],
    ['6', 6],
    ['5', 5],
    ['4', 4],
    ['3', 3],
    ['2', 2],
  ]);
  const VALUE_TO_LABEL = new Map(Array.from(RANK_ORDER.entries(), ([rank, value]) => [value, rank]));
  let rouletteRotation = 0;

  const blackjackState = {
    deck: [],
    player: [],
    dealer: [],
    bet: 0,
    active: false,
    revealDealer: false,
  };

  const pokerState = {
    deck: [],
    player: [],
    ai1: [],
    ai2: [],
    holds: new Set(),
    stage: 'idle', // idle -> dealt -> drawn -> reveal
    bet: 0,
    revealed: false,
  };

  const crapsState = {
    phase: 'idle', // idle -> point
    point: null,
    bet: 0,
  };

  const baccaratState = {
    deck: [],
    player: [],
    banker: [],
    bet: 0,
  };

  function updateCreditsDisplay(options) {
    bankroll.setBalance(credits, options);
  }

  function flashCredits(tone) {
    flashIndicator(creditsDisplay, tone);
  }

  function setStatus(element, message, tone = 'neutral') {
    applyStatus(element, message, tone);
  }

  function logEvent(game, message, net = 0, tone) {
    recordEvent(historyEl, { game, message, net, tone });
  }

  function applyStake(amount) {
    if (amount > credits) return false;
    credits -= amount;
    updateCreditsDisplay();
    flashCredits();
    return true;
  }

  function buildDeck() {
    const deck = [];
    SUITS.forEach(suit => {
      RANKS.forEach(rank => {
        deck.push({ suit, rank });
      });
    });
    return deck;
  }

  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  function drawCard(deck) {
    return deck.pop();
  }

  function makeCardSpan(card, options = {}) {
    const { hidden = false, large = false, clickable = false, held = false, index = null } = options;
    const span = document.createElement('span');
    span.className = 'card';
    if (large) span.classList.add('card--large');
    if (clickable) span.classList.add('is-clickable');
    if (held) span.classList.add('is-hold');
    span.textContent = hidden ? '??' : `${card.rank}${card.suit}`;
    if (index !== null) span.dataset.index = index.toString();
    return span;
  }

  const DIE_PIP_MAP = {
    1: [[50, 50]],
    2: [
      [25, 25],
      [75, 75],
    ],
    3: [
      [25, 25],
      [50, 50],
      [75, 75],
    ],
    4: [
      [25, 25],
      [75, 25],
      [25, 75],
      [75, 75],
    ],
    5: [
      [25, 25],
      [75, 25],
      [50, 50],
      [25, 75],
      [75, 75],
    ],
    6: [
      [25, 25],
      [75, 25],
      [25, 50],
      [75, 50],
      [25, 75],
      [75, 75],
    ],
  };

  function renderDieFace(dieEl, value) {
    if (!dieEl) return;
    dieEl.dataset.value = value.toString();
    dieEl.innerHTML = '';
    const pips = DIE_PIP_MAP[value] || [];
    pips.forEach(([x, y]) => {
      const pip = document.createElement('span');
      pip.className = 'pip';
      pip.style.left = `${x}%`;
      pip.style.top = `${y}%`;
      pip.style.transform = 'translate(-50%, -50%)';
      dieEl.appendChild(pip);
    });
  }

  // Craps -------------------------------------------------------------------
  function resetCrapsTable() {
    crapsState.phase = 'idle';
    crapsState.point = null;
    crapsState.bet = 0;
    if (crapsPointEl) crapsPointEl.textContent = '--';
    if (crapsBetInput) crapsBetInput.disabled = false;
    if (crapsDiceEl) updateCrapsDice(1, 1);
  }

  function finishCrapsRound({ payout, message, tone }) {
    if (payout > 0) {
      credits += payout;
      updateCreditsDisplay();
      flashCredits(tone === 'positive' ? 'positive' : 'neutral');
    }
    const net = payout - crapsState.bet;
    setStatus(crapsStatus, message, tone);
    logEvent('Neon Craps', message, net);
    resetCrapsTable();
  }

  function handleCrapsRoll() {
    let bet = crapsState.bet;
    if (crapsState.phase === 'idle') {
      const rawBet = Number(crapsBetInput ? crapsBetInput.value : 0);
      if (!Number.isFinite(rawBet) || rawBet < 50) {
        setStatus(crapsStatus, 'Minimum craps stake is 50 credits.', 'negative');
        return;
      }
      bet = Math.round(rawBet / 25) * 25;
      if (!applyStake(bet)) {
        setStatus(crapsStatus, 'Not enough credits to fire the dice.', 'negative');
        return;
      }
      crapsState.bet = bet;
      crapsState.phase = 'comeout';
      if (crapsBetInput) crapsBetInput.disabled = true;
      setStatus(crapsStatus, 'Come-out roll! Natural pays, craps loses.', 'neutral');
    }

    const die1 = Math.ceil(Math.random() * 6);
    const die2 = Math.ceil(Math.random() * 6);
    const total = die1 + die2;
    updateCrapsDice(die1, die2);

    if (crapsState.phase === 'comeout') {
      if (total === 7 || total === 11) {
        finishCrapsRound({
          payout: bet * 2,
          message: `Natural ${total}! You pocket ${(bet * 2).toLocaleString()} credits.`,
          tone: 'positive',
        });
        return;
      }
      if (total === 2 || total === 3 || total === 12) {
        finishCrapsRound({
          payout: 0,
          message: `Craps ${total}. The house scoops your stake.`,
          tone: 'negative',
        });
        return;
      }
      crapsState.point = total;
      crapsState.phase = 'point';
      if (crapsPointEl) crapsPointEl.textContent = total.toString();
      setStatus(crapsStatus, `Point set at ${total}. Roll ${total} before a seven to score.`, 'neutral');
      return;
    }

    if (crapsState.phase === 'point') {
      if (total === crapsState.point) {
        finishCrapsRound({
          payout: crapsState.bet * 2,
          message: `Point made! ${total} hits and pays even money.`,
          tone: 'positive',
        });
        return;
      }
      if (total === 7) {
        finishCrapsRound({
          payout: 0,
          message: 'Seven out. Dice go cold and the bankroll dips.',
          tone: 'negative',
        });
        return;
      }
      setStatus(crapsStatus, `Rolled ${total}. Still hunting for the point ${crapsState.point}.`, 'neutral');
    }
  }

  if (crapsRollBtn) crapsRollBtn.addEventListener('click', handleCrapsRoll);

  // Baccarat ---------------------------------------------------------------
  function resetBaccaratUI() {
    if (baccaratPlayerRow) baccaratPlayerRow.innerHTML = '';
    if (baccaratBankerRow) baccaratBankerRow.innerHTML = '';
    if (baccaratPlayerScoreEl) baccaratPlayerScoreEl.textContent = '--';
    if (baccaratBankerScoreEl) baccaratBankerScoreEl.textContent = '--';
    const playerContainer = baccaratPlayerRow?.parentElement;
    const bankerContainer = baccaratBankerRow?.parentElement;
    playerContainer?.classList.remove('is-win', 'is-loss');
    bankerContainer?.classList.remove('is-win', 'is-loss');
  }

  function renderBaccaratHand(hand, container) {
    if (!container) return;
    container.innerHTML = '';
    hand.forEach(card => {
      container.appendChild(makeCardSpan(card, { large: false }));
    });
  }

  function baccaratCardValue(rank) {
    if (rank === 'A') return 1;
    if (['K', 'Q', 'J', '10'].includes(rank)) return 0;
    return Number(rank);
  }

  function baccaratHandTotal(hand) {
    return hand.reduce((sum, card) => (sum + baccaratCardValue(card.rank)) % 10, 0);
  }

  function highlightBaccarat(result) {
    const playerContainer = baccaratPlayerRow?.parentElement;
    const bankerContainer = baccaratBankerRow?.parentElement;
    playerContainer?.classList.remove('is-win', 'is-loss');
    bankerContainer?.classList.remove('is-win', 'is-loss');
    if (result === 'player') {
      playerContainer?.classList.add('is-win');
      bankerContainer?.classList.add('is-loss');
    } else if (result === 'banker') {
      bankerContainer?.classList.add('is-win');
      playerContainer?.classList.add('is-loss');
    }
  }

  function dealBaccaratRound() {
    const rawBet = Number(baccaratBetInput ? baccaratBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 50) {
      setStatus(baccaratStatus, 'Minimum baccarat stake is 50 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 25) * 25;
    if (!applyStake(bet)) {
      setStatus(baccaratStatus, 'Not enough credits for that shoe.', 'negative');
      return;
    }

    resetBaccaratUI();

    const choice = baccaratChoiceSelect ? baccaratChoiceSelect.value : 'player';
    baccaratState.bet = bet;
    baccaratState.deck = buildDeck();
    shuffleDeck(baccaratState.deck);
    baccaratState.player = [drawCard(baccaratState.deck), drawCard(baccaratState.deck)];
    baccaratState.banker = [drawCard(baccaratState.deck), drawCard(baccaratState.deck)];

    renderBaccaratHand(baccaratState.player, baccaratPlayerRow);
    renderBaccaratHand(baccaratState.banker, baccaratBankerRow);

    let playerTotal = baccaratHandTotal(baccaratState.player);
    let bankerTotal = baccaratHandTotal(baccaratState.banker);

    let playerThirdCard = null;
    let bankerThirdCard = null;

    if (playerTotal >= 8 || bankerTotal >= 8) {
      // Natural, no draws
    } else {
      if (playerTotal <= 5) {
        playerThirdCard = drawCard(baccaratState.deck);
        baccaratState.player.push(playerThirdCard);
        renderBaccaratHand(baccaratState.player, baccaratPlayerRow);
        playerTotal = baccaratHandTotal(baccaratState.player);
      }

      const bankerShouldDraw = () => {
        if (!playerThirdCard) {
          return bankerTotal <= 5;
        }
        const thirdValue = baccaratCardValue(playerThirdCard.rank);
        if (bankerTotal <= 2) return true;
        if (bankerTotal === 3) return thirdValue !== 8;
        if (bankerTotal === 4) return thirdValue >= 2 && thirdValue <= 7;
        if (bankerTotal === 5) return thirdValue >= 4 && thirdValue <= 7;
        if (bankerTotal === 6) return thirdValue === 6 || thirdValue === 7;
        return false;
      };

      if (bankerShouldDraw()) {
        bankerThirdCard = drawCard(baccaratState.deck);
        baccaratState.banker.push(bankerThirdCard);
        renderBaccaratHand(baccaratState.banker, baccaratBankerRow);
      }
    }

    playerTotal = baccaratHandTotal(baccaratState.player);
    bankerTotal = baccaratHandTotal(baccaratState.banker);

    if (baccaratPlayerScoreEl) baccaratPlayerScoreEl.textContent = playerTotal.toString();
    if (baccaratBankerScoreEl) baccaratBankerScoreEl.textContent = bankerTotal.toString();

    let result = 'tie';
    if (playerTotal > bankerTotal) result = 'player';
    else if (bankerTotal > playerTotal) result = 'banker';

    highlightBaccarat(result);

    let payout = 0;
    let tone = 'negative';
    let message = '';

    if (result === choice) {
      if (choice === 'player') {
        payout = bet * 2;
        tone = 'positive';
        message = `Player wins with ${playerTotal} over ${bankerTotal}.`;
      } else if (choice === 'banker') {
        payout = Math.round(bet * 1.95);
        tone = 'positive';
        message = `Banker wins ${bankerTotal} to ${playerTotal}. 5% commission applied.`;
      } else {
        payout = bet * 8;
        tone = 'positive';
        message = `Tie! Both sides on ${playerTotal}. ${payout.toLocaleString()} credits awarded.`;
      }
    } else if (result === 'tie') {
      payout = bet;
      tone = 'neutral';
      message = `Stalemate at ${playerTotal}. Non-tie wagers push.`;
    } else {
      message =
        result === 'player'
          ? `Player edge ${playerTotal} to ${bankerTotal}.`
          : `Banker edge ${bankerTotal} to ${playerTotal}.`;
    }

    if (payout > 0) {
      credits += payout;
      updateCreditsDisplay();
      flashCredits(tone === 'positive' ? 'positive' : 'neutral');
    }

    const net = payout - bet;
    setStatus(baccaratStatus, message, tone);
    logEvent('Cyber Baccarat', message, net);
    baccaratState.bet = 0;
  }

  if (baccaratDealBtn) baccaratDealBtn.addEventListener('click', dealBaccaratRound);

  function updateCrapsDice(d1, d2) {
    if (!crapsDiceEl) return;
    const dice = crapsDiceEl.querySelectorAll('.die');
    renderDieFace(dice[0], d1);
    renderDieFace(dice[1], d2);
  }

  function resetStatusMessages() {
    setStatus(slotsStatus, 'Set your stake and spin the reels.');
    setStatus(duelStatus, 'Wager credits to flip for high card.');
    setStatus(rouletteStatus, 'Pick a color and spin the wheel.');
    setStatus(crapsStatus, 'Come-out roll the bones.');
    setStatus(baccaratStatus, 'Bet the shoe and let it ride.');
    setStatus(blackjackStatus, 'Enter a bet and press deal to start a hand.');
    setStatus(pokerStatus, 'Deal a hand, hold favorites, draw once, then reveal.');
    if (rouletteResultEl) rouletteResultEl.textContent = '--';
  }

  // Slots --------------------------------------------------------------------
  function spinSymbol() {
    return slotSymbols[Math.floor(Math.random() * slotSymbols.length)];
  }

  function evaluateSlots(result, bet) {
    const [a, b, c] = result;
    if (a === b && b === c) {
      const multiplier = a === '💎' ? 15 : a === '7️⃣' ? 10 : 7;
      return {
        payout: bet * multiplier,
        message: `Triple ${a}! ${multiplier}x payout.`,
        tone: 'positive',
      };
    }
    if (a === b || a === c || b === c) {
      return { payout: Math.round(bet * 2), message: 'Nice pair! Stake doubled.', tone: 'positive' };
    }
    if (result.includes('🍀')) {
      return {
        payout: Math.round(bet * 0.5),
        message: 'Lucky clover cushions the loss. Half stake returned.',
        tone: 'neutral',
      };
    }
    return { payout: 0, message: 'No luck this time.', tone: 'negative' };
  }

  function animateReels(result, tone) {
    slotReels.forEach((reel, idx) => {
      if (!reel) return;
      reel.classList.remove('is-win');
      reel.textContent = result[idx];
      reel.setAttribute('role', 'img');
      const symbolLabel = slotSymbolLabels.get(result[idx]);
      if (symbolLabel) {
        reel.setAttribute('aria-label', symbolLabel);
      }
      reel.classList.add('is-spinning');
      setTimeout(() => reel.classList.remove('is-spinning'), 600);
    });
    if (tone === 'positive' || tone === 'neutral') {
      setTimeout(() => {
        slotReels.forEach(reel => {
          if (!reel) return;
          reel.classList.add('is-win');
          setTimeout(() => reel.classList.remove('is-win'), 900);
        });
      }, 150);
    }
  }

  if (spinButton) {
    spinButton.addEventListener('click', () => {
      const rawBet = Number(slotsBetInput ? slotsBetInput.value : 0);
      if (!Number.isFinite(rawBet) || rawBet < 10) {
        setStatus(slotsStatus, 'Minimum spin bet is 10 credits.', 'negative');
        return;
      }
      const bet = Math.round(rawBet / 10) * 10;
      if (!applyStake(bet)) {
        setStatus(slotsStatus, 'Not enough credits for that spin.', 'negative');
        return;
      }

      const result = slotReels.map(() => spinSymbol());
      animateReels(result, 'neutral');

      const outcome = evaluateSlots(result, bet);
      if (outcome.payout > 0) {
        credits += outcome.payout;
        updateCreditsDisplay();
        flashCredits(outcome.tone === 'positive' ? 'positive' : 'neutral');
      }

      const net = outcome.payout - bet;
      animateReels(result, outcome.tone);
      setStatus(slotsStatus, `${outcome.message}`, outcome.tone);
      logEvent('Lucky Spin', outcome.message, net);
    });
  }

  // High Card Duel -----------------------------------------------------------
  function resetDuelCards() {
    if (playerCardEl) {
      playerCardEl.textContent = '?';
      playerCardEl.classList.remove('is-flip', 'is-win', 'is-loss');
    }
    if (dealerCardEl) {
      dealerCardEl.textContent = '?';
      dealerCardEl.classList.remove('is-flip', 'is-win', 'is-loss');
    }
  }

  if (duelButton) {
    duelButton.addEventListener('click', () => {
      const rawBet = Number(duelBetInput ? duelBetInput.value : 0);
      if (!Number.isFinite(rawBet) || rawBet < 25) {
        setStatus(duelStatus, 'Minimum duel bet is 25 credits.', 'negative');
        return;
      }
      const bet = Math.round(rawBet / 25) * 25;
      if (!applyStake(bet)) {
        setStatus(duelStatus, 'Not enough credits for that duel.', 'negative');
        return;
      }

      const deck = buildDeck();
      shuffleDeck(deck);
      const playerCard = drawCard(deck);
      const dealerCard = drawCard(deck);
      const playerValue = RANK_ORDER.get(playerCard.rank);
      const dealerValue = RANK_ORDER.get(dealerCard.rank);

      if (playerCardEl) {
        playerCardEl.textContent = `${playerCard.rank}${playerCard.suit}`;
        playerCardEl.classList.remove('is-win', 'is-loss');
        playerCardEl.classList.add('is-flip');
        setTimeout(() => playerCardEl.classList.remove('is-flip'), 500);
      }
      if (dealerCardEl) {
        dealerCardEl.textContent = `${dealerCard.rank}${dealerCard.suit}`;
        dealerCardEl.classList.remove('is-win', 'is-loss');
        dealerCardEl.classList.add('is-flip');
        setTimeout(() => dealerCardEl.classList.remove('is-flip'), 500);
      }

      let payout = 0;
      let message = '';
      let tone = 'neutral';

      if (playerValue > dealerValue) {
        payout = bet * 2;
        message = 'You pull the high card! Bet doubled.';
        tone = 'positive';
        if (playerCardEl) playerCardEl.classList.add('is-win');
        if (dealerCardEl) dealerCardEl.classList.add('is-loss');
      } else if (playerValue < dealerValue) {
        message = 'Dealer wins the duel.';
        tone = 'negative';
        if (dealerCardEl) dealerCardEl.classList.add('is-win');
        if (playerCardEl) playerCardEl.classList.add('is-loss');
      } else {
        payout = bet;
        message = 'Tie round. Stake returned.';
        tone = 'neutral';
      }

      if (payout > 0) {
        credits += payout;
        updateCreditsDisplay();
        flashCredits(tone === 'positive' ? 'positive' : 'neutral');
      }

      const net = payout - bet;
      setStatus(duelStatus, message, tone);
      logEvent('High Card Duel', message, net);
    });
  }

  // Roulette -----------------------------------------------------------------
  function spinRoulette() {
    const number = Math.floor(Math.random() * 37);
    let color = 'green';
    if (number !== 0) {
      color = number % 2 === 0 ? 'black' : 'red';
    }
    return { number, color };
  }

  if (rouletteForm) {
    rouletteForm.addEventListener('submit', event => {
      event.preventDefault();
      const rawBet = Number(rouletteBetInput ? rouletteBetInput.value : 0);
      if (!Number.isFinite(rawBet) || rawBet < 25) {
        setStatus(rouletteStatus, 'Minimum roulette bet is 25 credits.', 'negative');
        return;
      }
      const bet = Math.round(rawBet / 25) * 25;
      if (!applyStake(bet)) {
        setStatus(rouletteStatus, 'Not enough credits for that wheel spin.', 'negative');
        return;
      }

      const choice = rouletteChoice ? rouletteChoice.value : 'red';
      const outcome = spinRoulette();
      rouletteRotation += 720 + Math.random() * 360;
      if (rouletteWheelEl) rouletteWheelEl.style.transform = `rotate(${rouletteRotation}deg)`;
      if (roulettePointerEl) {
        roulettePointerEl.classList.add('pulse');
        setTimeout(() => roulettePointerEl.classList.remove('pulse'), 600);
      }
      if (rouletteResultEl) {
        rouletteResultEl.textContent = `${outcome.number} · ${outcome.color.toUpperCase()}`;
        rouletteResultEl.classList.add('pulse');
        setTimeout(() => rouletteResultEl.classList.remove('pulse'), 600);
      }

      let payout = 0;
      let message = '';
      let tone = 'negative';

      if (outcome.color === choice) {
        payout = bet * 2;
        message = 'Color match! You double your wager.';
        tone = 'positive';
      } else if (outcome.color === 'green') {
        message = 'House edge! Ball landed on zero.';
      } else {
        message = `Missed. Wheel favoured ${outcome.color}.`;
      }

      if (payout > 0) {
        credits += payout;
        updateCreditsDisplay();
        flashCredits(tone === 'positive' ? 'positive' : 'neutral');
      }

      const net = payout - bet;
      setStatus(rouletteStatus, message, tone);
      logEvent(
        'Color Roulette',
        `${message} Result: ${outcome.number} ${outcome.color}.`,
        net,
      );
    });
  }

  // Blackjack ----------------------------------------------------------------
  function resetBlackjackUI() {
    if (blackjackPlayerRow) blackjackPlayerRow.innerHTML = '';
    if (blackjackDealerRow) blackjackDealerRow.innerHTML = '';
    if (blackjackPlayerValueEl) blackjackPlayerValueEl.textContent = '--';
    if (blackjackDealerValueEl) blackjackDealerValueEl.textContent = '--';
    blackjackPlayerValueEl?.classList.remove('is-highlight');
    blackjackDealerValueEl?.classList.remove('is-highlight');
    blackjackState.revealDealer = false;
  }

  function resetBlackjackState() {
    blackjackState.deck = [];
    blackjackState.player = [];
    blackjackState.dealer = [];
    blackjackState.bet = 0;
    blackjackState.active = false;
    blackjackState.revealDealer = false;
  }

  function setBlackjackControls(activeRound) {
    if (blackjackDealBtn) blackjackDealBtn.disabled = activeRound;
    if (blackjackHitBtn) blackjackHitBtn.disabled = !activeRound;
    if (blackjackStandBtn) blackjackStandBtn.disabled = !activeRound;
    if (blackjackBetInput) blackjackBetInput.disabled = activeRound;
  }

  function blackjackCardValue(card) {
    if (card.rank === 'A') return 11;
    if (['K', 'Q', 'J'].includes(card.rank)) return 10;
    return Number(card.rank);
  }

  function blackjackHandValue(hand) {
    let total = 0;
    let aces = 0;
    hand.forEach(card => {
      total += blackjackCardValue(card);
      if (card.rank === 'A') aces += 1;
    });
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }
    return total;
  }

  function renderBlackjack(revealDealer = blackjackState.revealDealer) {
    if (blackjackPlayerRow) {
      blackjackPlayerRow.innerHTML = '';
      blackjackState.player.forEach((card, idx) => {
        const span = makeCardSpan(card, { large: true });
        span.classList.add('is-flip');
        setTimeout(() => span.classList.remove('is-flip'), 400 + idx * 50);
        blackjackPlayerRow.appendChild(span);
      });
    }
    if (blackjackDealerRow) {
      blackjackDealerRow.innerHTML = '';
      blackjackState.dealer.forEach((card, idx) => {
        const hidden = !revealDealer && idx === 1;
        const span = makeCardSpan(card, { large: true, hidden });
        if (hidden) span.classList.add('card--hidden');
        blackjackDealerRow.appendChild(span);
      });
    }
    if (blackjackPlayerValueEl) {
      blackjackPlayerValueEl.textContent = blackjackState.player.length
        ? blackjackHandValue(blackjackState.player).toString()
        : '--';
    }
    if (blackjackDealerValueEl) {
      blackjackDealerValueEl.textContent =
        revealDealer || blackjackState.dealer.length < 2
          ? (blackjackState.dealer.length ? blackjackHandValue(blackjackState.dealer).toString() : '--')
          : blackjackCardValue(blackjackState.dealer[0]).toString();
    }
  }

  function finishBlackjack(outcome, message) {
    blackjackState.revealDealer = true;
    renderBlackjack(true);

    let payout = 0;
    switch (outcome) {
      case 'blackjack':
        payout = Math.round(blackjackState.bet * 2.5);
        break;
      case 'win':
        payout = blackjackState.bet * 2;
        break;
      case 'push':
        payout = blackjackState.bet;
        break;
      default:
        payout = 0;
    }

    if (payout > 0) {
      credits += payout;
      updateCreditsDisplay();
      flashCredits(payout > blackjackState.bet ? 'positive' : 'neutral');
    }

    const net = payout - blackjackState.bet;
    const tone = net > 0 ? 'positive' : net < 0 ? 'negative' : 'neutral';
    setStatus(blackjackStatus, message, tone);
    logEvent('Blackjack', message, net);

    if (blackjackPlayerValueEl) {
      if (net >= 0) blackjackPlayerValueEl.classList.add('is-highlight');
      else blackjackPlayerValueEl.classList.remove('is-highlight');
    }
    if (blackjackDealerValueEl) {
      if (net <= 0) blackjackDealerValueEl.classList.add('is-highlight');
      else blackjackDealerValueEl.classList.remove('is-highlight');
    }

    resetBlackjackState();
    setBlackjackControls(false);
  }

  function dealBlackjack() {
    const rawBet = Number(blackjackBetInput ? blackjackBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 50) {
      setStatus(blackjackStatus, 'Minimum blackjack bet is 50 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 25) * 25;
    if (!applyStake(bet)) {
      setStatus(blackjackStatus, 'Not enough credits for that bet.', 'negative');
      return;
    }

    resetBlackjackUI();
    blackjackState.deck = buildDeck();
    shuffleDeck(blackjackState.deck);
    blackjackState.player = [drawCard(blackjackState.deck), drawCard(blackjackState.deck)];
    blackjackState.dealer = [drawCard(blackjackState.deck), drawCard(blackjackState.deck)];
    blackjackState.bet = bet;
    blackjackState.active = true;
    blackjackState.revealDealer = false;

    renderBlackjack(false);
    setBlackjackControls(true);
    setStatus(blackjackStatus, 'Hit or stand to play the hand.', 'neutral');

    const playerTotal = blackjackHandValue(blackjackState.player);
    const dealerTotal = blackjackHandValue(blackjackState.dealer);
    const playerBlackjack = playerTotal === 21 && blackjackState.player.length === 2;
    const dealerBlackjack = dealerTotal === 21 && blackjackState.dealer.length === 2;

    if (playerBlackjack || dealerBlackjack) {
      if (playerBlackjack && dealerBlackjack) {
        finishBlackjack('push', 'Both you and the dealer hit blackjack. Push.');
      } else if (playerBlackjack) {
        finishBlackjack('blackjack', 'Blackjack! Paid 3:2.');
      } else {
        finishBlackjack('loss', 'Dealer has blackjack. You lose the hand.');
      }
    }
  }

  function blackjackHit() {
    if (!blackjackState.active) return;
    blackjackState.player.push(drawCard(blackjackState.deck));
    renderBlackjack(false);
    const total = blackjackHandValue(blackjackState.player);
    if (total > 21) {
      finishBlackjack('loss', 'You bust. Dealer wins the hand.');
    } else {
      setStatus(blackjackStatus, `You have ${total}.`, 'neutral');
    }
  }

  function playDealerHand() {
    while (blackjackHandValue(blackjackState.dealer) < 17) {
      blackjackState.dealer.push(drawCard(blackjackState.deck));
    }
  }

  function blackjackStand() {
    if (!blackjackState.active) return;
    playDealerHand();
    const playerTotal = blackjackHandValue(blackjackState.player);
    const dealerTotal = blackjackHandValue(blackjackState.dealer);
    if (dealerTotal > 21) {
      finishBlackjack('win', `Dealer busts with ${dealerTotal}. You win.`);
      return;
    }
    if (playerTotal > dealerTotal) {
      finishBlackjack('win', `You win with ${playerTotal} against dealer's ${dealerTotal}.`);
      return;
    }
    if (playerTotal < dealerTotal) {
      finishBlackjack('loss', `Dealer wins ${dealerTotal} to ${playerTotal}.`);
      return;
    }
    finishBlackjack('push', `Push. Both at ${playerTotal}.`);
  }

  if (blackjackDealBtn) blackjackDealBtn.addEventListener('click', dealBlackjack);
  if (blackjackHitBtn) blackjackHitBtn.addEventListener('click', blackjackHit);
  if (blackjackStandBtn) blackjackStandBtn.addEventListener('click', blackjackStand);

  // Poker --------------------------------------------------------------------
  const POKER_RANK_LABELS = [
    'High Card',
    'One Pair',
    'Two Pair',
    'Three of a Kind',
    'Straight',
    'Flush',
    'Full House',
    'Four of a Kind',
    'Straight Flush',
  ];

  function sortCardValues(cards) {
    return cards
      .map(card => RANK_ORDER.get(card.rank))
      .sort((a, b) => b - a);
  }

  function isStraight(values) {
    const unique = [...new Set(values)];
    if (unique.length !== 5) return { straight: false };
    const max = unique[0];
    const min = unique[4];
    if (max - min === 4) return { straight: true, high: max };
    if (unique[0] === 14 && unique[1] === 5 && unique[2] === 4 && unique[3] === 3 && unique[4] === 2) {
      return { straight: true, high: 5 };
    }
    return { straight: false };
  }

  function evaluatePokerHand(hand) {
    const valuesDesc = sortCardValues(hand);
    const suits = hand.map(card => card.suit);
    const counts = new Map();
    valuesDesc.forEach(value => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    const countGroups = Array.from(counts.entries()).sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return b[0] - a[0];
    });
    const straightInfo = isStraight(valuesDesc);
    const flush = new Set(suits).size === 1;

    let rankIndex = 0;
    let tiebreakers = [];

    if (straightInfo.straight && flush) {
      rankIndex = 8;
      tiebreakers = [straightInfo.high];
    } else if (countGroups[0][1] === 4) {
      rankIndex = 7;
      tiebreakers = [countGroups[0][0], countGroups[1][0]];
    } else if (countGroups[0][1] === 3 && countGroups[1][1] === 2) {
      rankIndex = 6;
      tiebreakers = [countGroups[0][0], countGroups[1][0]];
    } else if (flush) {
      rankIndex = 5;
      tiebreakers = valuesDesc;
    } else if (straightInfo.straight) {
      rankIndex = 4;
      tiebreakers = [straightInfo.high];
    } else if (countGroups[0][1] === 3) {
      rankIndex = 3;
      const kickers = valuesDesc.filter(v => v !== countGroups[0][0]);
      tiebreakers = [countGroups[0][0], ...kickers];
    } else if (countGroups[0][1] === 2 && countGroups[1][1] === 2) {
      rankIndex = 2;
      const pairHigh = Math.max(countGroups[0][0], countGroups[1][0]);
      const pairLow = Math.min(countGroups[0][0], countGroups[1][0]);
      const kicker = countGroups[2][0];
      tiebreakers = [pairHigh, pairLow, kicker];
    } else if (countGroups[0][1] === 2) {
      rankIndex = 1;
      const kickers = valuesDesc.filter(v => v !== countGroups[0][0]);
      tiebreakers = [countGroups[0][0], ...kickers];
    } else {
      rankIndex = 0;
      tiebreakers = valuesDesc;
    }

    let score = rankIndex * 1e8;
    tiebreakers.forEach((value, index) => {
      score += value * Math.pow(15, 5 - index);
    });

    return {
      rankIndex,
      rankLabel: POKER_RANK_LABELS[rankIndex],
      tiebreakers,
      score,
      valuesDesc,
      countGroups,
      straightInfo,
      flush,
    };
  }

  function valueLabel(value) {
    return VALUE_TO_LABEL.get(value) || value.toString();
  }

  function describePokerEvaluation(result) {
    switch (result.rankIndex) {
      case 8:
        return `Straight Flush to ${valueLabel(result.straightInfo.high)}`;
      case 7:
        return `Four of a Kind (${valueLabel(result.countGroups[0][0])}s, kicker ${valueLabel(result.countGroups[1][0])})`;
      case 6:
        return `Full House (${valueLabel(result.countGroups[0][0])}s over ${valueLabel(result.countGroups[1][0])}s)`;
      case 5:
        return `Flush (${result.valuesDesc.map(valueLabel).join(', ')})`;
      case 4:
        return `Straight to ${valueLabel(result.straightInfo.high)}`;
      case 3:
        return `Three of a Kind (${valueLabel(result.countGroups[0][0])}s, kickers ${result.tiebreakers
          .slice(1)
          .map(valueLabel)
          .join(', ')})`;
      case 2:
        return `Two Pair (${valueLabel(result.tiebreakers[0])}s & ${valueLabel(result.tiebreakers[1])}s, kicker ${valueLabel(
          result.tiebreakers[2],
        )})`;
      case 1:
        return `Pair of ${valueLabel(result.tiebreakers[0])}s (kickers ${result.tiebreakers
          .slice(1)
          .map(valueLabel)
          .join(', ')})`;
      default:
        return `High Card (${result.tiebreakers.map(valueLabel).join(', ')})`;
    }
  }

  function clearPokerHighlights() {
    [pokerPlayerRow, pokerAi1Row, pokerAi2Row].forEach(row => {
      if (!row) return;
      row.querySelectorAll('.card').forEach(card => card.classList.remove('is-win', 'is-loss'));
    });
    [pokerPlayerRankEl, pokerAi1RankEl, pokerAi2RankEl].forEach(label => {
      if (!label) return;
      label.classList.remove('status-positive', 'status-negative', 'status-neutral', 'pulse');
    });
  }

  function highlightPokerRow(row, tone) {
    if (!row) return;
    row.querySelectorAll('.card').forEach(card => {
      card.classList.remove('is-win', 'is-loss');
      if (tone === 'win') card.classList.add('is-win');
      if (tone === 'loss') card.classList.add('is-loss');
    });
  }

  function setRankTone(label, tone) {
    if (!label) return;
    label.classList.remove('status-positive', 'status-negative', 'status-neutral');
    const className =
      tone === 'positive' ? 'status-positive' : tone === 'negative' ? 'status-negative' : 'status-neutral';
    label.classList.add(className);
    label.classList.add('pulse');
    setTimeout(() => label.classList.remove('pulse'), 650);
  }

  function updatePokerRanks({ reveal = false, evaluations = [] } = {}) {
    if (!reveal) {
      if (pokerPlayerRankEl) pokerPlayerRankEl.textContent = '--';
      if (pokerAi1RankEl) pokerAi1RankEl.textContent = '--';
      if (pokerAi2RankEl) pokerAi2RankEl.textContent = '--';
      return;
    }
    evaluations.forEach(entry => {
      if (entry.rankEl) {
        entry.rankEl.textContent = describePokerEvaluation(entry.evaluation);
      }
    });
  }

  function bindPokerHoldHandlers() {
    if (pokerState.stage !== 'dealt' || !pokerPlayerRow) return;
    pokerPlayerRow.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        const index = Number(card.dataset.index);
        if (!Number.isInteger(index)) return;
        if (pokerState.holds.has(index)) {
          pokerState.holds.delete(index);
          card.classList.remove('is-hold');
        } else {
          pokerState.holds.add(index);
          card.classList.add('is-hold');
        }
      });
    });
  }

  function renderPokerHands({ reveal = pokerState.revealed } = {}) {
    if (pokerPlayerRow) {
      pokerPlayerRow.innerHTML = '';
      pokerState.player.forEach((card, idx) => {
        const span = makeCardSpan(card, {
          hidden: false,
          clickable: pokerState.stage === 'dealt',
          held: pokerState.holds.has(idx),
          index: idx,
        });
        pokerPlayerRow.appendChild(span);
      });
    }

    const aiRows = [
      { row: pokerAi1Row, hand: pokerState.ai1 },
      { row: pokerAi2Row, hand: pokerState.ai2 },
    ];
    aiRows.forEach(({ row, hand }) => {
      if (!row) return;
      row.innerHTML = '';
      hand.forEach(card => {
        const span = makeCardSpan(card, { hidden: !reveal });
        row.appendChild(span);
      });
    });

    if (pokerState.stage === 'dealt') {
      bindPokerHoldHandlers();
    }
  }

  function setPokerControls(stage) {
    if (pokerDealBtn) pokerDealBtn.disabled = stage !== 'idle';
    if (pokerDrawBtn) pokerDrawBtn.disabled = stage !== 'dealt';
    if (pokerRevealBtn) pokerRevealBtn.disabled = !(stage === 'drawn' || stage === 'dealt');
    if (pokerBetInput) pokerBetInput.disabled = stage !== 'idle';
  }

  function resetPokerState() {
    pokerState.deck = [];
    pokerState.player = [];
    pokerState.ai1 = [];
    pokerState.ai2 = [];
    pokerState.holds.clear();
    pokerState.stage = 'idle';
    pokerState.bet = 0;
    pokerState.revealed = false;
  }

  function resetPokerUI() {
    if (pokerPlayerRow) pokerPlayerRow.innerHTML = '';
    if (pokerAi1Row) pokerAi1Row.innerHTML = '';
    if (pokerAi2Row) pokerAi2Row.innerHTML = '';
    if (pokerPlayerRankEl) pokerPlayerRankEl.textContent = '--';
    if (pokerAi1RankEl) pokerAi1RankEl.textContent = '--';
    if (pokerAi2RankEl) pokerAi2RankEl.textContent = '--';
    clearPokerHighlights();
    resetPokerState();
  }

  function dealPoker() {
    const rawBet = Number(pokerBetInput ? pokerBetInput.value : 0);
    if (!Number.isFinite(rawBet) || rawBet < 100) {
      setStatus(pokerStatus, 'Minimum poker bet is 100 credits.', 'negative');
      return;
    }
    const bet = Math.round(rawBet / 50) * 50;
    if (!applyStake(bet)) {
      setStatus(pokerStatus, 'Not enough credits for that hand.', 'negative');
      return;
    }

    pokerState.deck = buildDeck();
    shuffleDeck(pokerState.deck);
    pokerState.player = Array.from({ length: 5 }, () => drawCard(pokerState.deck));
    pokerState.ai1 = Array.from({ length: 5 }, () => drawCard(pokerState.deck));
    pokerState.ai2 = Array.from({ length: 5 }, () => drawCard(pokerState.deck));
    pokerState.holds.clear();
    pokerState.bet = bet;
    pokerState.stage = 'dealt';
    pokerState.revealed = false;

    clearPokerHighlights();
    renderPokerHands({ reveal: false });
    updatePokerRanks();
    setPokerControls('dealt');
    setStatus(pokerStatus, 'Click cards to hold them, then draw once.', 'neutral');
  }

  function drawPoker() {
    if (pokerState.stage !== 'dealt') {
      setStatus(pokerStatus, 'Deal a hand before drawing.', 'negative');
      return;
    }
    const replacements = [];
    for (let i = 0; i < 5; i += 1) {
      if (!pokerState.holds.has(i)) {
        replacements.push({ index: i, card: drawCard(pokerState.deck) });
      }
    }
    replacements.forEach(({ index, card }) => {
      pokerState.player[index] = card;
    });
    pokerState.stage = 'drawn';
    renderPokerHands({ reveal: false });
    setPokerControls('drawn');
    setStatus(pokerStatus, 'Ready to reveal. Hit reveal to see the showdown.', 'neutral');
  }

  function revealPoker() {
    if (pokerState.stage !== 'dealt' && pokerState.stage !== 'drawn') {
      setStatus(pokerStatus, 'Deal a hand to begin.', 'negative');
      return;
    }

    pokerState.revealed = true;
    renderPokerHands({ reveal: true });

    const evaluations = [
      {
        id: 'player',
        name: 'You',
        hand: pokerState.player,
        evaluation: evaluatePokerHand(pokerState.player),
        row: pokerPlayerRow,
        rankEl: pokerPlayerRankEl,
      },
      {
        id: 'ai1',
        name: 'Vega',
        hand: pokerState.ai1,
        evaluation: evaluatePokerHand(pokerState.ai1),
        row: pokerAi1Row,
        rankEl: pokerAi1RankEl,
      },
      {
        id: 'ai2',
        name: 'Rigel',
        hand: pokerState.ai2,
        evaluation: evaluatePokerHand(pokerState.ai2),
        row: pokerAi2Row,
        rankEl: pokerAi2RankEl,
      },
    ];

    updatePokerRanks({ reveal: true, evaluations });

    const bestScore = Math.max(...evaluations.map(entry => entry.evaluation.score));
    const winners = evaluations.filter(entry => entry.evaluation.score === bestScore);
    const playerWins = winners.some(entry => entry.id === 'player');

    let payout = 0;
    let tone = 'negative';
    let message = '';

    if (playerWins && winners.length === 1) {
      payout = Math.round(pokerState.bet * 3);
      tone = 'positive';
      message = `You win with ${describePokerEvaluation(evaluations[0].evaluation)}!`;
    } else if (playerWins) {
      payout = pokerState.bet;
      tone = 'neutral';
      const partners = winners.filter(entry => entry.id !== 'player').map(entry => entry.name).join(' & ');
      message = `Split pot with ${partners} on ${describePokerEvaluation(evaluations[0].evaluation)}.`;
    } else {
      const winningOpponent = winners[0];
      message = `${winningOpponent.name} wins with ${describePokerEvaluation(winningOpponent.evaluation)}.`;
    }

    winners.forEach(entry => {
      highlightPokerRow(entry.row, 'win');
      setRankTone(entry.rankEl, 'positive');
    });
    evaluations
      .filter(entry => !winners.includes(entry))
      .forEach(entry => {
        highlightPokerRow(entry.row, 'loss');
        setRankTone(entry.rankEl, 'negative');
      });

    if (payout > 0) {
      credits += payout;
      updateCreditsDisplay();
      flashCredits(tone === 'positive' ? 'positive' : 'neutral');
    }

    const net = payout - pokerState.bet;
    setStatus(pokerStatus, message, tone);
    logEvent('Poker Draw', message, net);

    pokerState.bet = 0;
    pokerState.stage = 'idle';
    pokerState.holds.clear();
    setPokerControls('idle');
  }

  if (pokerDealBtn) pokerDealBtn.addEventListener('click', dealPoker);
  if (pokerDrawBtn) pokerDrawBtn.addEventListener('click', drawPoker);
  if (pokerRevealBtn) pokerRevealBtn.addEventListener('click', revealPoker);

  if (resetBtn) {
    attachConfirmAction(resetBtn, {
      confirmLabel: 'Confirm reset',
      onConfirm: () => {
        bankroll.reset({ tone: 'neutral' });
        credits = bankroll.balance;
        flashCredits('neutral');
        resetDuelCards();
        resetCrapsTable();
        resetBaccaratUI();
        rouletteRotation = 0;
        if (rouletteWheelEl) rouletteWheelEl.style.transform = 'rotate(0deg)';
        resetBlackjackUI();
        resetBlackjackState();
        setBlackjackControls(false);
        resetPokerUI();
        setPokerControls('idle');
        resetStatusMessages();
        logEvent('Bank', 'Bankroll reset to 1,000 credits.', 0);
        showToast('Bankroll reset to 1,000 credits.', { tone: 'neutral' });
      },
    });
  }

  resetDuelCards();
  resetCrapsTable();
  resetBaccaratUI();
  if (rouletteWheelEl) rouletteWheelEl.style.transform = 'rotate(0deg)';
  resetBlackjackUI();
  resetBlackjackState();
  setBlackjackControls(false);
  resetPokerUI();
  setPokerControls('idle');
  resetStatusMessages();
  updateCreditsDisplay();
  logEvent('Host', 'Welcome to Aurora Arcade. Your bankroll starts at 1,000 credits.', 0);
}
