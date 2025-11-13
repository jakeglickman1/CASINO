# Aurora Arcade

Aurora Arcade is a retro-futurist casino prototype that links three distinct play surfaces—a cinematic casino floor, a lounge full of risk mini-games, and a synth skill gauntlet—through a single shared bankroll. Everything is written in plain HTML, CSS, and vanilla ES modules so it can run anywhere a static site can be served.

## Highlights
- Shared 1,000-credit bankroll persisted in `localStorage` and surfaced across every page with reset + sync helpers.
- Richly narrated tables with contextual help overlays, status regions, and animated UI feedback powered by the `core/ui.js` utilities.
- Eleven lounge challenges (crash, mines, limbo, Crossy, derby, Plinko, skee-ball, memory, wheel, dice duel, tower climb) plus nine casino tables and six skill trials.
- Mobile-friendly navigation drawer, scroll-spy shortcuts, and accessible live regions shipped through `site.js`.
- Zero build tooling—open the HTML files directly or serve the folder to keep ES module imports working.

## Game Surfaces
### Casino Floor (`casino.html` / `app.js`)
- Lucky Spin Slots · streak multipliers with emoji reels.
- High Card Duel · one-card showdown vs Dealer Vega.
- Aurora Roulette · red / black / dual-zero strip.
- Neon Craps · point tracking with pit boss narration.
- Street Dice Showdown · Cee-lo combo ranking.
- Triad Poker · three-card poker with combo boosts.
- Cyber Baccarat · banker/player/tie with live scorecards.
- Blackjack 21 · hit/stand/double decisions plus dealer AI.
- Poker Draw · two AI rivals, draw + reveal phases.

### Arcade Lounge (`online-casino.html` / `online.js`)
- Orbital Crash, Meteor Mines, Limbo Line, Crossy Run.
- Neon Derby horse racing with cheer boosts.
- Quantum Plinko, Photon Skee-Ball, Memory Matrix.
- Fortune Wheel, Nova Dice Duel, Nebula Towers ladder climb.
- Each experience tracks its own state machine and posts results to the shared history feed.

### Skill Gauntlet (`skill-games.html` / `skill-games.js`)
- Reflex Reactor, Nebula Sequence, Quantum Sums, Target Lock.
- Pulse Rhythm timing challenge and Cipher Grid logic puzzle.
- Skill cards swap in/out of a single stage view, refund unused stakes when you change drills, and log every win/loss.

## Tech Stack & Architecture
- **HTML/CSS:** Static multi-page layout styled by `styles.css` with utility classes for buttons, cards, overlays, and responsive grids.
- **Vanilla ES Modules:** `app.js`, `online.js`, and `skill-games.js` wire game logic to DOM controls; `site.js` bootstraps global UI behavior.
- **Core helpers:**  
  - `core/bankroll.js` provides a persistent credit ledger with reset/sync hooks.  
  - `core/ui.js` handles status flashes, history logging, toast notifications, and confirm buttons.  
  - `core/scrollspy.js` powers the in-page navigation highlights.

## Project Structure
- `index.html` – Landing page and marketing copy for the arcade.
- `casino.html`, `online-casino.html`, `skill-games.html` – The three playable surfaces.
- `app.js`, `online.js`, `skill-games.js`, `site.js` – Page-specific logic plus shared site chrome.
- `core/` – Bankroll, UI, and scroll-spy utilities.
- `styles.css` – Single stylesheet for the neon theme, layouts, and animations.

## Running Locally
Because the project uses native ES modules, serve the folder over HTTP instead of opening files with the `file://` protocol.

### Using npm `http-server`
```bash
npm install --global http-server
http-server .
```
Then visit `http://localhost:8080` (or the port shown in the terminal).

### Using Python
```bash
python3 -m http.server 4173
```
Open `http://localhost:4173` and navigate between the pages.

## Bankroll Tips
- The starting bankroll is 1,000 credits. Press any Reset button to restore it and re-sync localStorage.
- If you want to wipe persistence manually, clear the `auroraArcade.bankroll` key in your browser’s dev tools.
- Keep the browser tab open to maintain the shared credits between the casino, lounge, and skill gauntlet.

## Contributing & Testing
- Linting/build tooling is intentionally absent; keep contributions in plain HTML/CSS/JS.
- Prefer manual play-testing in multiple browsers/viewports to confirm animations, nav drawer, and status regions behave as expected.
- When adding new games, extend the appropriate `challenge-nav`, wire new DOM nodes in the matching JS file, and register events through the helpers in `core/ui.js`.
