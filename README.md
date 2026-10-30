# Fun Zone

A multi-page, interactive learning playground for kids — 10 hands-on games covering math, memory, color, spelling, counting, listening, patterns, shapes, telling time, and logic, with daily streaks, a daily challenge, collectible stickers, and unlockable badges that keep kids coming back.

**Category:** Education / Kids

**Live site:** https://islandcoder3.github.io/fun-zone/

**Built with:** HTML, CSS, JavaScript

## About

Built as a playful, screen-friendly alternative to worksheets. Every game gives kids instant feedback with sound, animation, and encouragement, and rewards progress with stars that fill a level bar. A friendly fox named Zippy greets each player by name, sets a daily goal, and nudges them toward the next thing to try. Games are grouped by skill, and most offer Easy, Medium, and Hard levels so the same game grows with the child. A home page ties it all together with a game picker and a badge shelf that shows what has been unlocked so far.

## Games

| Game | What kids practice |
| --- | --- |
| Math Pop | Addition, subtraction, and multiplication with streak bonuses |
| Memory Match | Finding 8 pairs in as few moves as possible, with a saved best score |
| Color Lab | Mixing red, green, and blue light with live gradient sliders, color names, and hex codes |
| Spell It | Spelling words from a picture, with read-aloud |
| Count It | Counting objects by tapping each one |
| Echo | Listening and remembering a growing sequence of lights and notes |
| Pattern Pals | Finding what comes next in a pattern |
| Shape Hunt | Recognizing shapes from circles to hexagons |
| Clock Time | Reading an analog clock: o'clock, half past, then 5-minute steps |
| Odd One Out | Sorting things into groups and spotting the one that does not belong |

## Features

- Ten games with a home page game picker and hash-based navigation (the browser back button works)
- Three difficulty levels in most games
- Player profile: kids pick a name and a buddy on their first visit (stored only on the device)
- Daily streak (days in a row), a daily star goal with a bonus, and a rotating Daily Challenge game where stars count double
- Combo meter that rewards long runs of correct answers with bonus stars
- Collectible sticker book (24 stickers) earned from level-ups, daily goals, challenges, and badges
- Stars, a level progress bar, and 16 unlockable badges with celebration pop-ups, toasts, and confetti
- Zippy the mascot gives personalized tips based on streak, goal, and games not yet tried
- "New" tags on games that have not been played, plus a Continue button to jump back in
- Light and dark themes that follow the device setting until changed
- Sound effects, musical notes, and read-aloud words with a one-tap mute
- Responsive layout: sidebar on desktop, scrollable bottom tab bar on phones
- Keyboard accessible, with screen-reader labels and reduced-motion support
- Progress, best scores, theme, and sound settings saved automatically with `localStorage`

## Tech Stack

Vanilla HTML, CSS, and JavaScript — no frameworks or build tools required. Open `index.html` in any modern browser. Fonts load from Google Fonts and fall back to system fonts when offline.

## Project Structure

```
index.html
css/
  base.css         design tokens, themes, accents, reset, keyframes
  layout.css       app shell, sidebar, top bar, home page, responsive rules
  components.css   buttons, chips, segmented control, cards, badges, toasts, confetti
  games.css        styles for each game
  engage.css       streak and combo chips, mascot card, sticker book, dialogs
js/
  store.js         saved settings and progress (localStorage)
  utils.js         helpers: $, rand, pick, shuffle, confetti
  audio.js         sound effects, notes, and text-to-speech
  ui.js            celebration pop-ups and the player profile dialog
  progress.js      stars, levels, streaks, daily goal and challenge, stickers, badges, toasts
  app.js           router, theme, sound toggle, reset, start-up
  games/           math, memory, color, spell, count, echo, pattern, shape, clock, odd
```

## Adding a Game

1. Add a nav link (`href="#mygame"`, `data-route="mygame"`, `data-accent="..."`), a home card, and a `<section class="view" id="view-mygame" data-title="My Game" data-accent="...">` in `index.html`.
2. Add `'mygame'` to the `ROUTES` list in `js/app.js`.
3. Create `js/games/mygame.js` that registers `FunZone.games.mygame = { init: function () {} }`.
4. Add `<script src="js/games/mygame.js" defer></script>` before `app.js`.
5. Reward players with `FunZone.progress.addStars(n)` and count wins with `FunZone.progress.bump('name')`. Add a badge in `js/progress.js`, and update the Explorer badge's target count.

## Customizing

- Accent colors: `css/base.css` (`--violet`, `--pink`, `--amber`, `--green`, `--sky`, `--coral`, `--teal`, `--indigo`, `--lime`)
- Stars needed per level, the daily goal, challenge target, and bonus sizes: constants at the top of `js/progress.js`
- Sticker emoji: `STICKERS` in `js/progress.js`
- Spelling words: `WORDS` in `js/games/spell.js`
- Odd One Out groups: `GROUPS` in `js/games/odd.js`
