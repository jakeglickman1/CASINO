const DEFAULT_STORAGE_KEY = 'auroraArcade.bankroll';

function safeParseInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function isStorageAvailable() {
  try {
    const key = '__bankroll_test__';
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('LocalStorage unavailable, bankroll persistence disabled.', error);
    return false;
  }
}

export function createBankroll({
  startingCredits = 1000,
  storageKey = DEFAULT_STORAGE_KEY,
  onChange,
  onSync,
} = {}) {
  const storageEnabled = isStorageAvailable();

  const loadFromStorage = () => {
    if (!storageEnabled) return null;
    const raw = window.localStorage.getItem(storageKey);
    return raw == null ? null : safeParseInt(raw);
  };

  const persistToStorage = value => {
    if (!storageEnabled) return;
    window.localStorage.setItem(storageKey, String(value));
  };

  let balance = startingCredits;
  const stored = loadFromStorage();
  if (stored != null && Number.isFinite(stored) && stored >= 0) {
    balance = stored;
    if (typeof onSync === 'function' && stored !== startingCredits) {
      onSync({ type: 'restore', balance: stored });
    }
  }

  if (typeof onChange === 'function') {
    onChange(balance, { isInitial: true });
  }

  const emitChange = options => {
    if (typeof onChange === 'function') {
      onChange(balance, options);
    }
  };

  const setBalance = (nextBalance, options) => {
    const value = Math.max(0, Math.round(Number(nextBalance) || 0));
    balance = value;
    persistToStorage(balance);
    emitChange(options);
    return balance;
  };

  const adjust = (delta, options) => setBalance(balance + Number(delta || 0), options);

  const canAfford = amount => balance >= Number(amount || 0);

  const debit = (amount, options) => {
    const value = Math.abs(Number(amount || 0));
    if (!canAfford(value)) return false;
    adjust(-value, options);
    return true;
  };

  const credit = (amount, options) => {
    const value = Math.abs(Number(amount || 0));
    adjust(value, options);
    return balance;
  };

  const reset = options => setBalance(startingCredits, options);

  const syncFromStorage = options => {
    const currentStored = loadFromStorage();
    if (currentStored == null || currentStored === balance) return balance;
    balance = Math.max(0, currentStored);
    emitChange(options);
    if (typeof onSync === 'function') {
      onSync({ type: 'sync', balance });
    }
    return balance;
  };

  return {
    get balance() {
      return balance;
    },
    setBalance,
    adjust,
    canAfford,
    debit,
    credit,
    reset,
    syncFromStorage,
  };
}
