# Fun Zone

A multi-page, interactive learning playground for kids — 10 hands-on games covering math, memory, color, spelling, counting, listening, patterns, shapes, telling time, and logic, with levels, stars, and unlockable badges that reward every correct answer.

**Category:** Education / Kids

**Live site:** https://islandcoder3.github.io/fun-zone/

**Built with:** HTML, CSS, JavaScript

## About

Built as a playful, screen-friendly alternative to worksheets. Every game gives kids instant feedback with sound, animation, and encouragement, and rewards progress with stars that fill a level bar. Games are grouped by skill, and most offer Easy, Medium, and Hard levels so the same game grows with the child. A home page ties it all together with a game picker and a badge shelf that shows what has been unlocked so far.

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
- Stars, a level progress bar, and 14 unlockable badges with toast notifications and confetti
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
js/
  store.js         saved settings and progress (localStorage)
  utils.js         helpers: $, rand, pick, shuffle, confetti
  audio.js         sound effects, notes, and text-to-speech
  progress.js      stars, levels, badges, toasts
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
- Stars needed per level: `STARS_PER_LEVEL` in `js/progress.js`
- Spelling words: `WORDS` in `js/games/spell.js`
- Odd One Out groups: `GROUPS` in `js/games/odd.js`
