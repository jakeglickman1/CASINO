# Aurora Arcade Casino

Aurora Arcade is a single-page casino experience that runs entirely in the browser. It ships with cinematic UI, a shared credit bankroll, and a suite of mini games that can be played without any backend service.

## Game Lineup

- Slots — streak-based triple-reel slots with escalating multipliers.
- High Card Duel — flip a single card against the dealer for quick wins.
- Roulette — bet on color (red/black) or the glowing neon zero; wheel animation includes pointer physics.
- Craps — full come-out and point phases with animated dice and point tracking.
- Baccarat — player / banker / tie wagers with natural checks and third-card logic.
- Blackjack — supports hit/stand play, soft totals, dealer reveal, and settlement rules.
- Video Poker — draw/hold cycle with rank evaluation for both the player and AI opponents.
- Plinko (Arcade Lounge) — drop a puck through configurable lanes to chase multiplier slots.

All games feed credits into a shared bankroll displayed in the site header. Results stream into the history log so the play session can be reviewed.

## Project Structure

```
NEW/
  index.html          # Landing page that links to casino and arcade lounges
  casino.html         # Main casino floor experience (slots, duel, roulette, craps, baccarat, blackjack, poker)
  online-casino.html  # Arcade lounge with plinko feature showcase
  app.js              # Core game logic that powers the casino floor pages
  online.js           # Logic dedicated to the arcade lounge interactions
  styles.css          # Global styling for every view
```

> Legacy prototype files (`app.js`, `index.html`, `styles.css` at the repository root) are kept for reference and can be ignored when running the Aurora Arcade experience.

## Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/jakeglickman1/CASINO.git
   cd CASINO
   ```
2. Serve the files:
   - Option A: Open `NEW/index.html` directly in your browser (double-click or drag into a tab).
   - Option B: Run a lightweight HTTP server:
     ```bash
     # Python 3
     python3 -m http.server 3000
     # then visit http://localhost:3000/NEW/index.html
     ```
3. Explore the casino floor via `NEW/casino.html` or check out the arcade lounge via `NEW/online-casino.html`.

The site uses no build steps; edit the HTML/CSS/JS and refresh the browser to see changes.

## Development Notes

- `app.js` includes modular helpers (deck builders, shuffling, credit adjustments) that are shared between games.
- Each game uses `setStatus` helpers to display contextual status messages and color-coded feedback.
- Bankroll updates trigger animations (`flashCredits`) so gains/losses are easy to track.
- History entries are appended through `logEvent`, giving players a persistent session recap.

## Contributing

Pull requests and issue suggestions are welcome. If you add a new game, follow the existing pattern by:

1. Creating the markup in the relevant HTML file.
2. Extending the shared state in `app.js` or `online.js`.
3. Wiring up controls that call `applyStake`, update history, and report status.

Happy dealing!
