# Fun Zone

A modern learning playground for kids with five games, levels, and unlockable badges.

## Games

- **Math Pop**: addition, subtraction and multiplication, three difficulty levels, streak bonuses
- **Memory Match**: find all 8 pairs, with a saved best score
- **Color Lab**: mix red, green and blue light with live gradient sliders, hex codes and color names
- **Spell It**: see the picture, tap the letters in order, hear the word read aloud
- **Count It**: tap each object to count it, then pick the right number

## Features

- Sidebar navigation on desktop, bottom tab bar on phones
- Light and dark themes (follows the device setting until changed)
- Stars, levels and 8 badges, saved on the device
- Sound effects and read-aloud voice with a mute toggle
- Keyboard accessible, screen-reader labels, and reduced-motion support
- No frameworks, no build step, works offline except for the web fonts

## Run it

Open `index.html` in any modern browser.

## Structure

```
index.html
css/
  base.css         design tokens, themes, reset, keyframes
  layout.css       app shell, sidebar, top bar, home page, responsive rules
  components.css   buttons, chips, segmented control, cards, badges, toasts, confetti
  games.css        styles for each game
js/
  store.js         saved settings and progress (localStorage)
  utils.js         helpers: $, rand, shuffle, confetti
  audio.js         sound effects and text-to-speech
  progress.js      stars, levels, badges, toasts
  app.js           router, theme, sound toggle, reset, start-up
  games/           math.js, memory.js, color.js, spell.js, count.js
```

## Add a new game

1. Add a nav link (`href="#mygame"`, `data-route="mygame"`, `data-accent="..."`) and a
   `<section class="view" id="view-mygame" data-title="My Game" data-accent="...">` in `index.html`.
2. Add `'mygame'` to the `ROUTES` list in `js/app.js`.
3. Create `js/games/mygame.js` that registers itself:
   ```js
   (function () {
     var FunZone = window.FunZone = window.FunZone || {};
     FunZone.games = FunZone.games || {};
     FunZone.games.mygame = { init: function () { /* set up */ } };
   })();
   ```
4. Add `<script src="js/games/mygame.js" defer></script>` before `app.js`.
5. Reward players with `FunZone.progress.addStars(n)` and add a badge in `js/progress.js` if you like.

## Customize

- Accent colors live in `css/base.css` (`--violet`, `--pink`, `--amber`, `--green`, `--sky`).
- Stars per level: `STARS_PER_LEVEL` in `js/progress.js`.
- Word list: `WORDS` in `js/games/spell.js`.
