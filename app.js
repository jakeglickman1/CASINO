// Closet Companion front-end logic covering wardrobe management, outfit history, and planner views.
const STORAGE_KEY = 'closet-companion-state-v1';

// Default state shape used when the user has no saved data.
const defaultState = {
  items: [],
  outfits: [],
  history: [],
  planner: {}
};

// Mutated in-place whenever the UI changes and then persisted to localStorage.
let state = loadState();
// Tracks the active week displayed in the planner grid.
let currentWeekStart = getWeekStart(new Date());

// Cache frequently accessed DOM nodes to avoid repeated lookups.
const elements = {
  uploadForm: document.getElementById('uploadForm'),
  itemImages: document.getElementById('itemImages'),
  itemName: document.getElementById('itemName'),
  itemCategory: document.getElementById('itemCategory'),
  itemColors: document.getElementById('itemColors'),
  itemSeason: document.getElementById('itemSeason'),
  wardrobeGrid: document.getElementById('wardrobeGrid'),
  wardrobeEmpty: document.getElementById('wardrobeEmpty'),
  clearWardrobe: document.getElementById('clearWardrobe'),
  outfitForm: document.getElementById('outfitForm'),
  outfitItems: document.getElementById('outfitItems'),
  outfitGrid: document.getElementById('outfitGrid'),
  outfitEmpty: document.getElementById('outfitEmpty'),
  historyForm: document.getElementById('historyForm'),
  historyTimeline: document.getElementById('historyTimeline'),
  historyOutfit: document.getElementById('historyOutfit'),
  plannerForm: document.getElementById('plannerForm'),
  plannerOutfit: document.getElementById('plannerOutfit'),
  plannerBody: document.getElementById('plannerBody'),
  plannerDate: document.getElementById('plannerDate'),
  weekLabel: document.getElementById('weekLabel'),
  weekPrev: document.getElementById('weekPrev'),
  weekNext: document.getElementById('weekNext'),
  statMostWorn: document.getElementById('statMostWorn'),
  statStreak: document.getElementById('statStreak'),
  statAttention: document.getElementById('statAttention'),
  insightsList: document.getElementById('insightsList')
};

init();

// Bootstraps the application by wiring events and drawing the initial state.
function init() {
  bindEvents();
  renderAll();
}

// Attach all DOM listeners in a single place for clarity.
function bindEvents() {
  elements.uploadForm.addEventListener('submit', handleUploadSubmit);
  elements.outfitForm.addEventListener('submit', handleOutfitSubmit);
  elements.historyForm.addEventListener('submit', handleHistorySubmit);
  elements.plannerForm.addEventListener('submit', handlePlannerSubmit);
  elements.weekPrev.addEventListener('click', () => {
    currentWeekStart = shiftWeek(currentWeekStart, -7);
    renderPlanner();
  });
  elements.weekNext.addEventListener('click', () => {
    currentWeekStart = shiftWeek(currentWeekStart, 7);
    renderPlanner();
  });
  elements.clearWardrobe.addEventListener('click', handleClearWardrobe);
  elements.plannerBody.addEventListener('click', handlePlannerCellActions);

  elements.wardrobeGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action="remove-item"]');
    if (!button) return;
    const id = button.dataset.id;
    removeItem(id);
  });

  elements.outfitGrid.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('[data-action="remove-outfit"]');
    if (removeBtn) {
      removeOutfit(removeBtn.dataset.id);
      return;
    }
  });

  elements.historyTimeline.addEventListener('click', (event) => {
    const removeBtn = event.target.closest('[data-action="remove-history"]');
    if (!removeBtn) return;
    removeHistoryEntry(removeBtn.dataset.date);
  });
}

// Handle wardrobe upload form submission by reading images and persisting metadata.
async function handleUploadSubmit(event) {
  event.preventDefault();
  const files = Array.from(elements.itemImages.files || []);
  if (!files.length) {
    alert('Please choose at least one image to upload.');
    return;
  }

  const baseName = elements.itemName.value.trim();
  if (!baseName) {
    alert('Please provide an item name.');
    return;
  }

  const metadata = {
    category: elements.itemCategory.value,
    colors: elements.itemColors.value.trim(),
    season: elements.itemSeason.value.trim()
  };

  try {
    const items = await Promise.all(files.map((file, index) => readFileAsDataURL(file).then((image) => ({
      id: createId(),
      name: files.length === 1 ? baseName : `${baseName} (${index + 1})`,
      image,
      ...metadata,
      addedAt: new Date().toISOString()
    }))));

    state.items = [...state.items, ...items];
    persistState();
    elements.uploadForm.reset();
    renderAll();
  } catch (error) {
    console.error(error);
    alert('We hit a snag saving those images. Please try again.');
  }
}

// Build and store a new outfit composed of selected wardrobe items.
function handleOutfitSubmit(event) {
  event.preventDefault();
  const name = event.target.outfitName.value.trim();
  if (!name) {
    alert('Give your outfit a name before saving.');
    return;
  }
  const itemIds = Array.from(elements.outfitItems.selectedOptions).map((opt) => opt.value);
  if (!itemIds.length) {
    alert('Select at least one wardrobe piece for the outfit.');
    return;
  }
  const tags = event.target.outfitTags.value.trim();

  const outfit = {
    id: createId(),
    name,
    tags: tags ? splitTags(tags) : [],
    itemIds,
    createdAt: new Date().toISOString()
  };

  state.outfits.push(outfit);
  persistState();
  elements.outfitForm.reset();
  renderAll();
}

// Record the outfit worn for a given date, ensuring only one entry per day.
function handleHistorySubmit(event) {
  event.preventDefault();
  const date = event.target.historyDate.value;
  const outfitId = event.target.historyOutfit.value;
  if (!date || !outfitId) return;

  const existingIndex = state.history.findIndex((entry) => entry.date === date);
  const entry = { date, outfitId };
  if (existingIndex >= 0) {
    state.history[existingIndex] = entry;
  } else {
    state.history.push(entry);
  }

  state.history.sort((a, b) => (a.date > b.date ? 1 : -1));
  persistState();
  elements.historyForm.reset();
  renderHistory();
  renderStats();
  renderPlanner();
}

// Save a planned outfit for the selected date in the weekly calendar.
function handlePlannerSubmit(event) {
  event.preventDefault();
  const date = event.target.plannerDate.value;
  const outfitId = event.target.plannerOutfit.value;
  if (!date || !outfitId) return;

  state.planner[date] = { outfitId };
  persistState();
  elements.plannerForm.reset();
  renderPlanner();
}

// Remove every wardrobe item and cascading data that depends on it.
function handleClearWardrobe() {
  if (!state.items.length) return;
  const confirmed = confirm('This will remove all wardrobe items. Outfits that depend on them will also be cleared. Continue?');
  if (!confirmed) return;

  const itemIds = new Set(state.items.map((item) => item.id));
  state.items = [];
  state.outfits = state.outfits.filter((outfit) => !outfit.itemIds.some((id) => itemIds.has(id)));
  state.history = state.history.filter((entry) => state.outfits.some((outfit) => outfit.id === entry.outfitId));
  Object.keys(state.planner).forEach((date) => {
    if (!state.outfits.some((outfit) => outfit.id === state.planner[date].outfitId)) {
      delete state.planner[date];
    }
  });
  persistState();
  renderAll();
}

// Remove a single wardrobe item and clean up dependent records.
function removeItem(id) {
  const confirmed = confirm('Remove this wardrobe item?');
  if (!confirmed) return;
  state.items = state.items.filter((item) => item.id !== id);
  state.outfits = state.outfits.map((outfit) => ({
    ...outfit,
    itemIds: outfit.itemIds.filter((itemId) => itemId !== id)
  })).filter((outfit) => outfit.itemIds.length);
  pruneHistoryAndPlanner();
  persistState();
  renderAll();
}

// Delete an outfit and prune any history or planner references to it.
function removeOutfit(id) {
  const confirmed = confirm('Delete this outfit? It will also disappear from history and planner.');
  if (!confirmed) return;
  state.outfits = state.outfits.filter((outfit) => outfit.id !== id);
  pruneHistoryAndPlanner();
  persistState();
  renderAll();
}

// Delete a logged history entry for the provided date.
function removeHistoryEntry(date) {
  state.history = state.history.filter((entry) => entry.date !== date);
  persistState();
  renderHistory();
  renderStats();
  renderPlanner();
}

// Drop history/planner entries that reference outfits that no longer exist.
function pruneHistoryAndPlanner() {
  const outfitIds = new Set(state.outfits.map((outfit) => outfit.id));
  state.history = state.history.filter((entry) => outfitIds.has(entry.outfitId));
  Object.keys(state.planner).forEach((date) => {
    if (!outfitIds.has(state.planner[date].outfitId)) {
      delete state.planner[date];
    }
  });
}

// Redraw every primary panel in sequence so the UI stays in sync with state.
function renderAll() {
  renderWardrobe();
  renderOutfits();
  populateOutfitSelects();
  renderHistory();
  renderStats();
  renderPlanner();
}

// Populate the wardrobe grid with the latest items or show the empty state.
function renderWardrobe() {
  elements.wardrobeGrid.innerHTML = '';
  elements.clearWardrobe.disabled = !state.items.length;
  if (!state.items.length) {
    elements.wardrobeGrid.classList.add('hidden');
    elements.wardrobeEmpty.classList.remove('hidden');
    return;
  }
  elements.wardrobeGrid.classList.remove('hidden');
  elements.wardrobeEmpty.classList.add('hidden');

  const fragment = document.createDocumentFragment();
  state.items
    .slice()
    .sort((a, b) => (a.addedAt > b.addedAt ? -1 : 1))
    .forEach((item) => {
      const tags = [item.colors, item.season]
        .filter(Boolean)
        .map((label) => `<span class="pill">${escapeHTML(label)}</span>`)
        .join('');
      const card = document.createElement('article');
      card.className = 'wardrobe-card';
      card.innerHTML = `
        <div class="wardrobe-thumb" style="background-image: url('${item.image}')" aria-hidden="true"></div>
        <div class="wardrobe-info">
          <h4>${escapeHTML(item.name)}</h4>
          <p>${escapeHTML(item.category || 'Uncategorized')}</p>
          ${tags ? `<div class="pill-row">${tags}</div>` : ''}
        </div>
        <button class="btn ghost small" data-action="remove-item" data-id="${item.id}" type="button">Remove</button>
      `;
      fragment.appendChild(card);
    });
  elements.wardrobeGrid.appendChild(fragment);
}

// Render saved outfits as cards, including preview imagery where available.
function renderOutfits() {
  elements.outfitGrid.innerHTML = '';
  if (!state.outfits.length) {
    elements.outfitGrid.classList.add('hidden');
    elements.outfitEmpty.classList.remove('hidden');
    return;
  }
  elements.outfitGrid.classList.remove('hidden');
  elements.outfitEmpty.classList.add('hidden');

  const fragment = document.createDocumentFragment();
  state.outfits
    .slice()
    .sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1))
    .forEach((outfit) => {
      const primaryItem = getPrimaryItemForOutfit(outfit);
      const tagMarkup = outfit.tags.map((tag) => `<span class="pill">${escapeHTML(tag)}</span>`).join('');
      const itemCount = outfit.itemIds.length;
      const card = document.createElement('article');
      card.className = 'outfit-card';
      card.innerHTML = `
        <div class="outfit-media" aria-hidden="true" ${primaryItem ? `style="background-image: url('${primaryItem.image}')"` : ''}>
          ${!primaryItem ? '<span>No preview</span>' : ''}
        </div>
        <div class="outfit-body">
          <h3>${escapeHTML(outfit.name)}</h3>
          <p>${itemCount} piece${itemCount === 1 ? '' : 's'}${tagMarkup ? ' · Styled as:' : ''}</p>
          <div class="pill-row">${tagMarkup || ''}</div>
          <button class="btn ghost small" data-action="remove-outfit" data-id="${outfit.id}" type="button">Remove outfit</button>
        </div>
      `;
      fragment.appendChild(card);
    });
  elements.outfitGrid.appendChild(fragment);
}

// Keep multi-use selects (builder/history/planner) aligned with current outfits and items.
function populateOutfitSelects() {
  const selects = [elements.outfitItems, elements.historyOutfit, elements.plannerOutfit];
  selects.forEach((select) => {
    if (!select) return;
    const currentValue = select.value;
    select.innerHTML = '';
    if (select === elements.outfitItems) {
      state.items
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((item) => {
          const option = document.createElement('option');
          option.value = item.id;
          option.textContent = `${item.name} · ${item.category || 'Uncategorized'}`;
          select.appendChild(option);
        });
    } else {
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = state.outfits.length ? 'Select outfit' : 'No outfits yet';
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);

      state.outfits
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((outfit) => {
          const option = document.createElement('option');
          option.value = outfit.id;
          option.textContent = outfit.name;
          select.appendChild(option);
        });
    }
    if (currentValue && Array.from(select.options).some((option) => option.value === currentValue)) {
      select.value = currentValue;
    }
  });
}

// Draw the timeline of logged outfits, most recent first.
function renderHistory() {
  elements.historyTimeline.innerHTML = '';
  if (!state.history.length) {
    elements.historyTimeline.innerHTML = '<p class="empty-state">No outfit history yet. Log what you wore to see your rotation.</p>';
    return;
  }

  const sorted = state.history
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  sorted.forEach((entry) => {
    const outfit = state.outfits.find((o) => o.id === entry.outfitId);
    if (!outfit) return;
    const timeline = document.createElement('div');
    timeline.className = 'timeline-entry';
    timeline.innerHTML = `
      <div class="timeline-dot"></div>
      <div>
        <p class="timeline-date">${formatDate(entry.date)}</p>
        <p>${escapeHTML(outfit.name)}</p>
        <button class="link-button" data-action="remove-history" data-date="${entry.date}" type="button">Remove</button>
      </div>
    `;
    elements.historyTimeline.appendChild(timeline);
  });
}

// Update all high-level stats after changes to history or outfits.
function renderStats() {
  renderMostWorn();
  renderUniqueStreak();
  renderAttentionItems();
  renderInsights();
}

// Show which outfit has appeared most often in history.
function renderMostWorn() {
  const container = elements.statMostWorn;
  const valueEl = container.querySelector('.stat-value');
  const labelEl = container.querySelector('.stat-label');

  if (!state.history.length) {
    valueEl.textContent = '—';
    labelEl.textContent = 'Most worn outfit';
    return;
  }

  const counts = state.history.reduce((acc, entry) => {
    acc[entry.outfitId] = (acc[entry.outfitId] || 0) + 1;
    return acc;
  }, {});

  const [topId, wears] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const outfit = state.outfits.find((o) => o.id === topId);
  valueEl.textContent = outfit ? `${wears}×` : `${wears}`;
  labelEl.textContent = outfit ? `Most worn outfit (${outfit.name})` : 'Most worn outfit';
}

// Calculate how many consecutive days feature unique outfits.
function renderUniqueStreak() {
  const container = elements.statStreak;
  const valueEl = container.querySelector('.stat-value');
  const labelEl = container.querySelector('.stat-label');
  if (!state.history.length) {
    valueEl.textContent = '—';
    labelEl.textContent = 'Current streak of unique outfits';
    return;
  }

  const sorted = state.history
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const seen = new Set();
  let streak = 0;
  for (const entry of sorted) {
    if (seen.has(entry.outfitId)) break;
    seen.add(entry.outfitId);
    streak += 1;
  }

  valueEl.textContent = `${streak} day${streak === 1 ? '' : 's'}`;
  labelEl.textContent = 'Current streak of unique outfits';
}

// Count wardrobe pieces that have not been worn within the last 60 days.
function renderAttentionItems() {
  const container = elements.statAttention;
  const valueEl = container.querySelector('.stat-value');
  const labelEl = container.querySelector('.stat-label');

  if (!state.items.length) {
    valueEl.textContent = '—';
    labelEl.textContent = 'Items not worn in 60 days';
    return;
  }

  const lastWornMap = new Map();
  state.history.forEach((entry) => {
    const outfit = state.outfits.find((o) => o.id === entry.outfitId);
    if (!outfit) return;
    outfit.itemIds.forEach((itemId) => {
      const current = lastWornMap.get(itemId);
      if (!current || entry.date > current) {
        lastWornMap.set(itemId, entry.date);
      }
    });
  });

  const today = new Date();
  const attentionCount = state.items.reduce((count, item) => {
    const lastWorn = lastWornMap.get(item.id);
    if (!lastWorn) return count + 1;
    const days = differenceInDays(today, new Date(lastWorn));
    return days >= 60 ? count + 1 : count;
  }, 0);

  valueEl.textContent = attentionCount ? `${attentionCount}` : '0';
  labelEl.textContent = 'Items not worn in 60 days';
}

// Build the week-at-a-glance calendar with scheduled outfits and placeholders.
function renderPlanner() {
  const tbody = elements.plannerBody;
  tbody.innerHTML = '';
  const weekDates = getWeekDates(currentWeekStart);
  updateWeekLabel(weekDates);

  const row = document.createElement('tr');
  weekDates.forEach((date) => {
    const iso = toISODate(date);
    const cell = document.createElement('td');
    const entry = state.planner[iso];
    const isPast = isPastDate(date);
    const outfit = entry ? state.outfits.find((o) => o.id === entry.outfitId) : null;
    cell.innerHTML = `
      <span class="day-number">${date.getDate()}</span>
      ${outfit ? `<p>${escapeHTML(outfit.name)}</p>` : '<p class="muted">No plan yet</p>'}
      ${outfit && outfit.tags.length ? `<span class="pill">${escapeHTML(outfit.tags[0])}</span>` : ''}
      ${entry ? `<button class="link-button" data-action="clear-plan" data-date="${iso}">Clear</button>` : ''}
    `;
    if (isPast && !entry) {
      cell.classList.add('muted-cell');
    }
    row.appendChild(cell);
  });
  tbody.appendChild(row);
}

// Support clearing planned outfits via event delegation on the calendar table.
function handlePlannerCellActions(event) {
  const button = event.target.closest('[data-action="clear-plan"]');
  if (!button) return;
  const date = button.dataset.date;
  delete state.planner[date];
  persistState();
  renderPlanner();
}

// Generate lightweight guidance based on history trends and upcoming plans.
function renderInsights() {
  const list = elements.insightsList;
  list.innerHTML = '';

  if (!state.history.length && !Object.keys(state.planner).length) {
    list.innerHTML = '<li>Add history entries to unlock personalized insights.</li>';
    return;
  }

  const insights = [];
  if (state.history.length) {
    const counts = state.history.reduce((acc, entry) => {
      acc[entry.outfitId] = (acc[entry.outfitId] || 0) + 1;
      return acc;
    }, {});
    const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (topEntry) {
      const outfit = state.outfits.find((o) => o.id === topEntry[0]);
      if (outfit) {
        insights.push(`${outfit.name} has been your go-to look (${topEntry[1]} wears). Consider refreshing its accessories.`);
      }
    }
  }

  const upcoming = Object.entries(state.planner)
    .map(([date, value]) => ({ date, outfit: state.outfits.find((o) => o.id === value.outfitId) }))
    .filter(({ outfit }) => outfit)
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  if (upcoming.length) {
    const next = upcoming[0];
    insights.push(`Next planned outfit: ${next.outfit.name} on ${formatDate(next.date)}.`);
  }

  const attentionCard = elements.statAttention.querySelector('.stat-value').textContent;
  if (attentionCard && attentionCard !== '—' && Number(attentionCard) > 0) {
    insights.push(`You have ${attentionCard} item${attentionCard === '1' ? '' : 's'} waiting for love. Try scheduling them next week.`);
  }

  if (!insights.length) {
    insights.push('Keep logging outfits to unlock trend insights.');
  }

  insights.forEach((text) => {
    const li = document.createElement('li');
    li.textContent = text;
    list.appendChild(li);
  });
}

// Utilities
// Hydrate persisted state from localStorage, falling back to defaults when needed.
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneState(defaultState);
    const parsed = JSON.parse(raw);
    return {
      items: parsed.items || [],
      outfits: parsed.outfits || [],
      history: parsed.history || [],
      planner: parsed.planner || {}
    };
  } catch (error) {
    console.warn('Unable to read saved data. Starting fresh.', error);
    return cloneState(defaultState);
  }
}

// Serialize and save the current state snapshot to localStorage.
function persistState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Convert an uploaded File into a base64 data URL so it can be stored inline.
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (event) => reject(event.target.error);
    reader.readAsDataURL(file);
  });
}

// Generate a unique identifier; prefer crypto.randomUUID when available.
function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// Turn a comma-delimited string into trimmed tags, skipping empty values.
function splitTags(input) {
  return input
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

// Return the first wardrobe item tied to an outfit for thumbnail previews.
function getPrimaryItemForOutfit(outfit) {
  return outfit.itemIds
    .map((id) => state.items.find((item) => item.id === id))
    .find(Boolean);
}

// Normalize a date to the Monday that starts its week.
function getWeekStart(date) {
  const temp = new Date(date);
  const day = temp.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // convert Sunday-based to Monday start
  temp.setDate(temp.getDate() + diff);
  temp.setHours(0, 0, 0, 0);
  return temp;
}

// Create a list of Date objects covering a single week from the given start.
function getWeekDates(start) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

// Move the planner reference week forward/backward by the given offset.
function shiftWeek(start, offset) {
  const next = new Date(start);
  next.setDate(start.getDate() + offset);
  return next;
}

// Display a friendly range label for the planner header.
function updateWeekLabel(weekDates) {
  const first = weekDates[0];
  const last = weekDates[weekDates.length - 1];
  elements.weekLabel.textContent = `Week of ${formatDate(toISODate(first))} – ${formatDate(toISODate(last))}`;
}

// Convert a Date object into a YYYY-MM-DD string.
function toISODate(date) {
  return date.toISOString().split('T')[0];
}

// Render a date as a short, localized label for UI display.
function formatDate(dateInput) {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    weekday: 'short'
  });
}

// Determine whether the supplied date is before today.
function isPastDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return target < today;
}

// Rough day-level difference helper for wear recency calculations.
function differenceInDays(a, b) {
  const ms = 1000 * 60 * 60 * 24;
  const start = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const end = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((start - end) / ms);
}

// Sanitize text content before injecting it into innerHTML.
function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Deep clone plain objects via serialization to avoid accidental mutations.
function cloneState(obj) {
  return JSON.parse(JSON.stringify(obj));
}
