const toneClassMap = {
  positive: 'status-positive',
  negative: 'status-negative',
  neutral: 'status-neutral',
};

function clearToneClasses(element) {
  element.classList.remove(toneClassMap.positive, toneClassMap.negative, toneClassMap.neutral, 'pulse');
}

export function flashIndicator(element, tone = 'neutral') {
  if (!element) return;
  clearToneClasses(element);
  const className = toneClassMap[tone] ?? toneClassMap.neutral;
  element.classList.add(className);
  void element.offsetWidth; // reflow to restart animation
  element.classList.add('pulse');
  window.setTimeout(() => clearToneClasses(element), 650);
}

export function setStatus(element, message, tone = 'neutral') {
  if (!element) return;
  element.textContent = message;
  clearToneClasses(element);
  const className = toneClassMap[tone] ?? toneClassMap.neutral;
  element.classList.add(className);
  void element.offsetWidth;
  element.classList.add('pulse');
  window.setTimeout(() => element.classList.remove('pulse'), 650);
}

export function logEvent(container, { game, message, net = 0, tone } = {}) {
  if (!container) return null;
  const entry = document.createElement('div');
  entry.className = 'history-entry';
  const netLabel =
    Number.isFinite(net) && net !== 0 ? ` · Net ${net >= 0 ? '+' : ''}${net.toLocaleString()} credits` : '';
  entry.innerHTML = `<strong>${game}</strong><span>${message}${netLabel}</span>`;
  if (tone) {
    entry.classList.add(toneClassMap[tone] ?? toneClassMap.neutral);
  }
  container.prepend(entry);
  entry.classList.add('pulse');
  window.setTimeout(() => entry.classList.remove('pulse'), 700);
  while (container.children.length > 20) {
    container.removeChild(container.lastChild);
  }
  return entry;
}

let toastHost = null;

function ensureToastHost() {
  if (toastHost) return toastHost;
  toastHost = document.createElement('div');
  toastHost.className = 'site-toast';
  toastHost.setAttribute('aria-live', 'polite');
  toastHost.setAttribute('aria-atomic', 'true');
  document.body.appendChild(toastHost);
  return toastHost;
}

export function showToast(message, { tone = 'neutral', timeout = 4000 } = {}) {
  if (!message) return null;
  const host = ensureToastHost();
  const item = document.createElement('div');
  item.className = `site-toast__item site-toast__item--${tone}`;
  item.textContent = message;
  host.appendChild(item);
  requestAnimationFrame(() => item.classList.add('is-visible'));
  const hide = () => {
    item.classList.remove('is-visible');
    item.addEventListener(
      'transitionend',
      () => {
        item.remove();
      },
      { once: true }
    );
  };
  window.setTimeout(hide, timeout);
  return item;
}

export function attachConfirmAction(
  button,
  { confirmLabel = 'Confirm action', idleLabel = button?.textContent?.trim() ?? 'Confirm', timeout = 4000, onConfirm } = {}
) {
  if (!button) return;
  let awaiting = false;
  let timerId = null;

  const reset = () => {
    awaiting = false;
    button.classList.remove('is-confirm');
    button.textContent = idleLabel;
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = null;
    }
  };

  button.addEventListener('click', event => {
    if (!awaiting) {
      awaiting = true;
      button.classList.add('is-confirm');
      button.textContent = confirmLabel;
      timerId = window.setTimeout(() => {
        reset();
      }, timeout);
      return;
    }

    event.preventDefault();
    reset();
    if (typeof onConfirm === 'function') {
      onConfirm(event);
    }
  });
}
