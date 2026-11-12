/* ============================================================
   PAULEILA — interactions, content + mini games
   ============================================================ */

(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem("pauleila:" + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem("pauleila:" + key, JSON.stringify(value));
      } catch {
        /* storage may be blocked; the page still works */
      }
    }
  };

  const shuffle = (list) => {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  /* ---------- Tabs ---------- */

  const tabs = $$(".tab");
  const panels = new Map(tabs.map((tab) => [tab.dataset.panel, document.getElementById("panel-" + tab.dataset.panel)]));

  function activateTab(name, { focusTab = false, scroll = false } = {}) {
    const targetTab = tabs.find((tab) => tab.dataset.panel === name);
    if (!targetTab || !panels.has(name)) return;

    tabs.forEach((tab) => {
      const selected = tab === targetTab;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel, key) => {
      panel.hidden = key !== name;
    });

    if (name !== "games") endMath(false);
    if (name === "bible") maybeSummarizeGospel();

    if (scroll) {
      const panel = panels.get(name);
      panel.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    }
    if (focusTab) targetTab.focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.panel));
    tab.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      activateTab(tabs[next].dataset.panel, { focusTab: true });
    });
  });

  $$("[data-jump]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      activateTab(trigger.dataset.jump, { scroll: true });
      panels.get(trigger.dataset.jump)?.focus({ preventScroll: true });
    });
  });

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Jokes ---------- */

  const jokes = [
    { setup: "Why did the math book look so sad?", punch: "Because it had too many problems." },
    { setup: "Why don't scientists trust atoms?", punch: "Because they make up everything." },
    { setup: "What do you call a bear with no teeth?", punch: "A gummy bear." },
    { setup: "Why did the girl bring a ladder to school?", punch: "She heard high school was next." },
    { setup: "How does the moon cut its hair?", punch: "Eclipse it." },
    { setup: "Why can't you give Elsa a balloon?", punch: "Because she'll let it go." },
    { setup: "What's a ghost's favourite dessert?", punch: "I-scream." },
    { setup: "Why did the computer go to the doctor?", punch: "It caught a virus." },
    { setup: "What did the zero say to the eight?", punch: "Nice belt!" },
    { setup: "Why did the student eat her homework?", punch: "The teacher said it was a piece of cake." },
    { setup: "What do you call a fish wearing a bow tie?", punch: "So-fish-ticated." },
    { setup: "Why was the broom late for school?", punch: "It swept in." },
    { setup: "What's an astronaut's favourite part of a computer?", punch: "The space bar." },
    { setup: "Why did the book join the library club?", punch: "It wanted to get its story straight." },
    { setup: "How do you make a tissue dance?", punch: "Put a little boogie in it." },
    { setup: "What did one wall say to the other wall?", punch: "I'll meet you at the corner." },
    { setup: "Why do bees have sticky hair?", punch: "Because they use honeycombs." },
    { setup: "Why did the scarecrow win an award?", punch: "Because he was outstanding in his field." },
    { setup: "What do you call a fake noodle?", punch: "An impasta." },
    { setup: "Why did the bicycle fall over?", punch: "It was two-tired." },
    { setup: "How does a penguin build its house?", punch: "Igloos it together." },
    { setup: "Why can't your nose be 12 inches long?", punch: "Because then it would be a foot." },
    { setup: "What do you call cheese that isn't yours?", punch: "Nacho cheese." },
    { setup: "Why did the golfer bring two pairs of pants?", punch: "In case he got a hole in one." },
    { setup: "What do you call a sleeping bull?", punch: "A bulldozer." },
    { setup: "Why did the tomato turn red?", punch: "It saw the salad dressing." },
    { setup: "What do you call a snowman with a six-pack?", punch: "An abdominal snowman." },
    { setup: "Why did the cookie go to the doctor?", punch: "It felt crummy." },
    { setup: "What do you call a boomerang that won't come back?", punch: "A stick." },
    { setup: "Why did the coffee file a police report?", punch: "It got mugged." },
    { setup: "What did the ocean say to the beach?", punch: "Nothing, it just waved." },
    { setup: "Why are fish so smart?", punch: "They live in schools." },
    { setup: "What do you call a bear with no ears?", punch: "B." },
    { setup: "Why did the banana go to the doctor?", punch: "It wasn't peeling well." },
    { setup: "What do you call a dinosaur that crashes its car?", punch: "Tyrannosaurus wrecks." },
    { setup: "Why did the girl sit on the clock?", punch: "She wanted to be on time." },
    { setup: "What do you call a pony with a sore throat?", punch: "A little horse." },
    { setup: "What do you call a magician's dog?", punch: "A labracadabrador." },
    { setup: "Why did the math teacher open a window?", punch: "To let the problems fly out." },
    { setup: "What do you call a group of musical frogs?", punch: "A croakestra." },
    { setup: "Why did the smartphone go to school?", punch: "It wanted to improve its apps." },
    { setup: "What do you call a robot who takes the long way home?", punch: "R2-detour." },
    { setup: "Why did the leaf go to the doctor?", punch: "It was feeling green." },
    { setup: "What do you call a cat that loves bowling?", punch: "An alley cat." },
    { setup: "Why did the picture go to jail?", punch: "It was framed." },
    { setup: "What do you call a sleeping dinosaur?", punch: "A dino-snore." },
    { setup: "Why did the donut go to the dentist?", punch: "It needed a filling." },
    { setup: "What do you call a cow with no legs?", punch: "Ground beef." },
    { setup: "Why did the chicken join a band?", punch: "Because it had the drumsticks." },
    { setup: "What do you call a fish with no eyes?", punch: "A fsh." }
  ];

  const featureHost = $("#joke-feature");
  const jokeGrid = $("#joke-grid");
  const JOKES_PER_DAY = 17;
  let dailyJokes = [];
  let featureIndex = 0;
  let jokeDateKey = "";
  let jokeRefreshTimer = null;

  const localDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  function hashDate(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededShuffle(list, seed) {
    const arr = list.slice();
    let state = seed >>> 0;
    const random = () => {
      state += 0x6D2B79F5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function refreshDailyJokes(force = false) {
    const today = localDateKey();
    if (!force && today === jokeDateKey && dailyJokes.length) return;
    jokeDateKey = today;
    dailyJokes = seededShuffle(jokes, hashDate(today)).slice(0, JOKES_PER_DAY);
    featureIndex = 0;
    renderFeatureJoke();
    renderJokeGrid();
  }

  function scheduleJokeRefresh() {
    clearTimeout(jokeRefreshTimer);
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2, 0);
    jokeRefreshTimer = window.setTimeout(() => {
      refreshDailyJokes(true);
      scheduleJokeRefresh();
    }, Math.max(1000, nextMidnight - now));
  }

  function refreshJokesIfDayChanged() {
    if (localDateKey() !== jokeDateKey) {
      refreshDailyJokes(true);
      scheduleJokeRefresh();
    }
  }

  function jokeCard(joke, index) {
    const card = document.createElement("article");
    card.className = "joke-card";
    card.innerHTML = `
      <span class="joke-num" aria-hidden="true">No. ${String(index + 1).padStart(2, "0")}</span>
      <p class="joke-setup">${joke.setup}</p>
      <p class="punchline" hidden>${joke.punch}</p>
      <button class="reveal" type="button" aria-expanded="false">Tap for the punchline ✨</button>
    `;
    const punchline = $(".punchline", card);
    const button = $(".reveal", card);
    button.addEventListener("click", () => {
      const open = punchline.hidden;
      punchline.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? "Hide it 🙈" : "Tap for the punchline ✨";
    });
    return card;
  }

  function renderFeatureJoke() {
    if (!dailyJokes.length) return;
    const joke = dailyJokes[featureIndex];
    featureHost.innerHTML = `
      <article class="joke-feature-card">
        <span class="feature-emoji" aria-hidden="true">😂</span>
        <div class="joke-feature-body">
          <span class="joke-num">Joke of the day</span>
          <p class="joke-setup">${joke.setup}</p>
          <p class="punchline" hidden>${joke.punch}</p>
          <div class="feature-foot">
            <button class="btn btn-primary btn-small reveal" type="button" aria-expanded="false">Reveal the punchline ✨</button>
            <span class="meta">Tell it to someone today.</span>
          </div>
        </div>
      </article>
    `;
    const punchline = $(".punchline", featureHost);
    const button = $(".reveal", featureHost);
    button.addEventListener("click", () => {
      const open = punchline.hidden;
      punchline.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? "Hide it 🙈" : "Reveal the punchline ✨";
    });
  }

  function renderJokeGrid() {
    jokeGrid.innerHTML = "";
    dailyJokes.forEach((joke, index) => {
      if (index !== featureIndex) jokeGrid.appendChild(jokeCard(joke, index));
    });
  }

  refreshDailyJokes(true);
  scheduleJokeRefresh();

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshJokesIfDayChanged();
  });
  window.addEventListener("focus", refreshJokesIfDayChanged);
  window.addEventListener("pageshow", refreshJokesIfDayChanged);

  $("#joke-shuffle").addEventListener("click", () => {
    if (!dailyJokes.length) return;
    let next = Math.floor(Math.random() * dailyJokes.length);
    if (next === featureIndex) next = (next + 1) % dailyJokes.length;
    featureIndex = next;
    renderFeatureJoke();
    renderJokeGrid();
  });

  /* ---------- Word of the day ---------- */

  const words = [
    {
      word: "Curious",
      phonetic: "/ˈkyo͝or-ee-əs/ · adjective",
      def: "Eager to learn or know more; full of questions rather than answers.",
      example: "A curious mind asks why the sky turns pink before it turns dark.",
      note: "Curiosity is not a distraction — it is the first step of every discovery."
    },
    {
      word: "Luminous",
      phonetic: "/ˈlo͞o-mə-nəs/ · adjective",
      def: "Giving off light; bright enough to glow in the dark.",
      example: "The luminous jellyfish drifted past like a tiny underwater moon.",
      note: "Try using it for people, too: a luminous idea lights up a whole room."
    },
    {
      word: "Ingenious",
      phonetic: "/in-ˈjēn-yəs/ · adjective",
      def: "Clever, original, and inventive — a solution nobody else thought of.",
      example: "Her ingenious pencil holder was made from an old cereal box.",
      note: "Do not confuse it with ingenuous, which means innocent and honest."
    },
    {
      word: "Perseverance",
      phonetic: "/ˌpər-sə-ˈvir-əns/ · noun",
      def: "Continuing to try even when something is difficult or slow.",
      example: "It took perseverance, three tries, and one bruised knee to learn the trick.",
      note: "Perseverance is a skill, not a personality. It grows every time you try again."
    },
    {
      word: "Resilient",
      phonetic: "/ri-ˈzil-yənt/ · adjective",
      def: "Able to recover quickly after something hard or disappointing.",
      example: "The resilient little plant bent in the storm and stood up straight after.",
      note: "Being resilient does not mean never feeling sad. It means bouncing back after."
    },
    {
      word: "Serendipity",
      phonetic: "/ˌser-ən-ˈdip-ə-tē/ · noun",
      def: "A happy discovery that happens by chance when you were looking for something else.",
      example: "Finding the perfect book in a tiny shop was pure serendipity.",
      note: "A whole word for lucky accidents — one of the best words in English."
    },
    {
      word: "Hypothesis",
      phonetic: "/hī-ˈpä-thə-səs/ · noun",
      def: "A smart guess you can test with an experiment or more evidence.",
      example: "Her hypothesis was that plants grow taller with music — so she tested it.",
      note: "A hypothesis can be wrong. That is the point: being wrong teaches you something."
    },
    {
      word: "Kaleidoscope",
      phonetic: "/kə-ˈlī-də-ˌskōp/ · noun",
      def: "A tube of mirrors and coloured glass; also anything full of changing colours and patterns.",
      example: "The autumn leaves were a kaleidoscope of gold, rust, and plum.",
      note: "From Greek: kalos (beautiful), eidos (form), skopein (to look). Look beautifully."
    },
    {
      word: "Eloquent",
      phonetic: "/ˈel-ə-kwənt/ · adjective",
      def: "Speaking or writing in a clear, powerful, and beautiful way.",
      example: "Her eloquent speech made the whole room go quiet, then cheer.",
      note: "Eloquent does not mean using big words. It means making people understand."
    },
    {
      word: "Tenacious",
      phonetic: "/tə-ˈnā-shəs/ · adjective",
      def: "Holding on tightly and refusing to give up.",
      example: "The tenacious detective kept asking questions until the story made sense.",
      note: "Say it out loud: tenacious. It even sounds like it will not budge."
    },
    {
      word: "Empathy",
      phonetic: "/ˈem-pə-thē/ · noun",
      def: "The ability to understand and share how another person feels.",
      example: "She showed empathy by sitting beside her friend without needing to say anything.",
      note: "Empathy is a kind of genius — maybe the most useful kind."
    },
    {
      word: "Constellation",
      phonetic: "/ˌkän-stə-ˈlā-shən/ · noun",
      def: "A group of stars that forms a pattern in the sky.",
      example: "They found the constellation shaped like a hunter in the winter sky.",
      note: "The stars are far apart; humans drew the lines that make them a story."
    },
    {
      word: "Gregarious",
      phonetic: "/ɡrəˈɡer-ee-əs/ · adjective",
      def: "Very sociable; someone who loves being around other people.",
      example: "Her gregarious nature made every new class feel like a room full of friends.",
      note: "Gregarious comes from the Latin grex, meaning flock. Think of a happy flock of birds."
    },
    {
      word: "Meticulous",
      phonetic: "/məˈtik-yə-ləs/ · adjective",
      def: "Extremely careful about little details.",
      example: "He was meticulous about his model rocket, checking every fin twice.",
      note: "Meticulous is not the same as fussy. It means caring about getting it right."
    },
    {
      word: "Vivacious",
      phonetic: "/vī-ˈvā-shəs/ · adjective",
      def: "Lively, energetic, and full of sparkle.",
      example: "Her vivacious laugh made the whole picnic feel brighter.",
      note: "Vivacious comes from vivere, 'to live.' It is life with the volume turned up."
    },
    {
      word: "Nebula",
      phonetic: "/ˈneb-yə-lə/ · noun",
      def: "A huge cloud of gas and dust in space where stars are born.",
      example: "The telescope showed a pink nebula glowing like a cosmic garden.",
      note: "Nebula means 'cloud' in Latin. Some are cradles for baby stars."
    },
    {
      word: "Quintessential",
      phonetic: "/ˌkwin-tə-ˈsen-shəl/ · adjective",
      def: "The most perfect example of something.",
      example: "That tiny bookshop was the quintessential cozy corner.",
      note: "It comes from the fifth element, once thought to be the pure essence of everything."
    },
    {
      word: "Iridescent",
      phonetic: "/ˌir-i-ˈdes-ənt/ · adjective",
      def: "Showing shimmering colours that seem to change with the light.",
      example: "The bubble floated by in iridescent shades of pink and green.",
      note: "Iris was the Greek goddess of the rainbow, which is where the word begins."
    },
    {
      word: "Altruistic",
      phonetic: "/ˌal-troo-ˈis-tik/ · adjective",
      def: "Caring about other people's happiness more than your own gain.",
      example: "Her altruistic choice was to share the last cookie without being asked.",
      note: "Altruistic acts can be small. Kindness does not need an audience."
    },
    {
      word: "Zephyr",
      phonetic: "/ˈzef-ər/ · noun",
      def: "A soft, gentle breeze.",
      example: "A warm zephyr ruffled the pages of her notebook.",
      note: "Zephyrus was the Greek god of the west wind. Say it softly, like a breeze."
    },
    {
      word: "Epiphany",
      phonetic: "/i-ˈpif-ə-nē/ · noun",
      def: "A sudden clear understanding or brilliant idea.",
      example: "She had an epiphany in the bath: the answer was to build it upside down.",
      note: "An epiphany can arrive with a splash. Keep a notebook nearby for yours."
    },
    {
      word: "Mellifluous",
      phonetic: "/mə-ˈlif-loo-əs/ · adjective",
      def: "Sweet and smooth-sounding, like honey for the ears.",
      example: "Her mellifluous voice made the bedtime story feel like a song.",
      note: "Melli- means honey and fluere means to flow. Honey flowing — lovely."
    },
    {
      word: "Intrepid",
      phonetic: "/in-ˈtrep-əd/ · adjective",
      def: "Brave and adventurous, especially when facing something new.",
      example: "The intrepid explorer packed a map, a snack, and a very big hat.",
      note: "Intrepid does not mean fearless. It means going anyway."
    },
    {
      word: "Effervescent",
      phonetic: "/ˌef-ər-ˈves-ənt/ · adjective",
      def: "Bubbly, fizzy, and full of happy energy.",
      example: "Her effervescent mood made even chores feel like a dance party.",
      note: "Think of a fizzy drink: all those tiny bubbles are the effervescence."
    },
    {
      word: "Sagacious",
      phonetic: "/sə-ˈgā-shəs/ · adjective",
      def: "Wise and quick to understand.",
      example: "The sagacious old owl knew exactly which path led home.",
      note: "Sagacious comes from sagax, Latin for keen-scented — like a mind that can sniff out truth."
    },
    {
      word: "Marvel",
      phonetic: "/ˈmär-vəl/ · noun or verb",
      def: "A wonderful thing; to feel wonder or amazement.",
      example: "She paused to marvel at the tiny world inside a drop of pond water.",
      note: "Marvel is both a noun and a verb. Today, try to marvel at one ordinary thing."
    },
    {
      word: "Symmetry",
      phonetic: "/ˈsim-ə-trē/ · noun",
      def: "A balanced arrangement where two sides match.",
      example: "The snowflake's symmetry made it look like a tiny frozen star.",
      note: "Symmetry is not just for art. It appears in shells, leaves, and even music."
    },
    {
      word: "Aurora",
      phonetic: "/ə-ˈrôr-ə/ · noun",
      def: "The glowing lights in the sky near the poles; also dawn.",
      example: "The aurora shimmered above the snow in ribbons of green and violet.",
      note: "Aurora was the Roman goddess of dawn. The northern lights borrowed her name."
    },
    {
      word: "Camaraderie",
      phonetic: "/ˌkäm-əˈräd-ə-rē/ · noun",
      def: "A feeling of friendship and trust among people who share something.",
      example: "The team's camaraderie made every practice feel like a party.",
      note: "Camaraderie grows when people cheer for each other, not just for themselves."
    },
    {
      word: "Kismet",
      phonetic: "/ˈkiz-met/ · noun",
      def: "Destiny; the feeling that something was meant to happen.",
      example: "Finding her lost bracelet on the beach felt like kismet.",
      note: "Kismet comes from Turkish. It is a fancy word for a happy coincidence."
    }
  ];

  let wordIndex = 0;
  let wordDateKey = "";
  let wordRefreshTimer = null;

  const wordDate = $("#word-date");
  const wordWord = $("#word-word");
  const wordPhonetic = $("#word-phonetic");
  const wordDef = $("#word-def");
  const wordExample = $("#word-example");
  const wordNote = $("#word-note");
  const wordProgress = $("#word-progress");

  function renderWord() {
    const entry = words[wordIndex];
    wordWord.textContent = entry.word;
    wordPhonetic.textContent = entry.phonetic;
    wordDef.textContent = entry.def;
    wordExample.textContent = "“" + entry.example + "”";
    wordNote.textContent = entry.note;
    wordProgress.textContent = `Word ${(wordIndex % words.length) + 1} of ${words.length} · collected`;
    wordDate.textContent = new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" });
  }

  function refreshDailyWord(force = false) {
    const today = localDateKey();
    if (!force && today === wordDateKey) return;
    wordDateKey = today;
    let index = hashDate(today) % words.length;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const previousIndex = hashDate(localDateKey(yesterday)) % words.length;
    if (index === previousIndex) index = (index + 1) % words.length;
    wordIndex = index;
    renderWord();
  }

  function scheduleWordRefresh() {
    clearTimeout(wordRefreshTimer);
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 2, 0);
    wordRefreshTimer = window.setTimeout(() => {
      refreshDailyWord(true);
      scheduleWordRefresh();
    }, Math.max(1000, nextMidnight - now));
  }

  function refreshWordIfDayChanged() {
    if (localDateKey() !== wordDateKey) {
      refreshDailyWord(true);
      scheduleWordRefresh();
    }
  }

  refreshDailyWord(true);
  scheduleWordRefresh();

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refreshWordIfDayChanged();
  });
  window.addEventListener("focus", refreshWordIfDayChanged);
  window.addEventListener("pageshow", refreshWordIfDayChanged);

  $("#word-next").addEventListener("click", () => {
    wordIndex = (wordIndex + 1) % words.length;
    renderWord();
  });

  /* ---------- Grades ---------- */

  const grades = [
    {
      grade: 1,
      title: "The Word Collector",
      age: "Ages 6–7 · a foundation year",
      intro: "Grade 1 is where letters turn into words and words turn into stories. It is a big leap, so celebrate the small wins.",
      learn: [
        "Phonics, sight words, and reading short books",
        "Counting, adding, and subtracting within 20",
        "Writing full sentences with capitals and periods",
        "Plants, animals, and the four seasons"
      ],
      words: ["alphabet", "pattern", "habitat", "sentence"],
      tip: "Read aloud for ten minutes a day and count everything out loud — stairs, grapes, sock pairs. Number sense grows in ordinary moments."
    },
    {
      grade: 2,
      title: "The Story Builder",
      age: "Ages 7–8 · growing independence",
      intro: "Grade 2 is the year stories get longer and numbers get bigger. Reading starts to feel like a superpower instead of homework.",
      learn: [
        "Reading fluently and answering questions about a story",
        "Place value up to 1,000",
        "Adding and subtracting two- and three-digit numbers",
        "Writing narratives with a beginning, middle, and end"
      ],
      words: ["fluency", "value", "narrative", "sequence"],
      tip: "Keep a tiny notebook and write one true sentence each night. Tiny sentences build big writers."
    },
    {
      grade: 3,
      title: "The Fact Finder",
      age: "Ages 8–9 · the chapter-book year",
      intro: "Grade 3 is famous for multiplication, chapter books, and learning how to find facts in a text. It is a year of real independence.",
      learn: [
        "Chapter books and finding the main idea",
        "Multiplication and division facts",
        "Fractions as equal parts of a whole",
        "Simple machines, weather, and life cycles"
      ],
      words: ["product", "fraction", "main idea", "evidence"],
      tip: "Explain your homework out loud to a pet, a plant, or a patient grown-up. Teaching is the fastest way to find the gaps."
    },
    {
      grade: 4,
      title: "The Explorer",
      age: "Ages 9–10 · longer projects",
      intro: "Grade 4 stretches thinking from one step to many. You start comparing sources, solving multi-step problems, and writing opinions.",
      learn: [
        "Multi-step word problems and long division",
        "Comparing fractions and beginning decimals",
        "Energy, electricity, and Earth's changes",
        "Opinion writing with reasons and evidence"
      ],
      words: ["equivalent", "justify", "circuit", "summary"],
      tip: "Start a mistake museum: write down your best mistakes and what each one taught you. Geniuses collect them."
    },
    {
      grade: 5,
      title: "The Problem Solver",
      age: "Ages 10–11 · thinking in systems",
      intro: "Grade 5 mixes skills together — fractions with volume, reading with research, and writing with a real audience in mind.",
      learn: [
        "Fraction operations and volume of solids",
        "Ecosystems and the movement of matter",
        "Research projects with several sources",
        "Narrative and explanatory writing"
      ],
      words: ["volume", "ecosystem", "synthesize", "revision"],
      tip: "Ask “why?” three times in a row. The first answer is usually the surface; the third one is where the interesting stuff lives."
    },
    {
      grade: 6,
      title: "The Scholar",
      age: "Ages 11–12 · the big transition",
      intro: "Grade 6 is the doorway to middle school: ratios, early algebra, deeper science, and arguments built on evidence.",
      learn: [
        "Ratios, rates, percentages, and integer thinking",
        "Expressions, equations, and early algebra",
        "Earth science, space systems, and data",
        "Argument writing and close reading"
      ],
      words: ["ratio", "variable", "claim", "inference"],
      tip: "Teach a concept to someone younger. If you can explain it simply, you own it."
    }
  ];

  const gradePicker = $("#grade-picker");
  const gradeDetail = $("#grade-detail");

  function renderGrade(index) {
    const entry = grades[index];
    gradeDetail.innerHTML = `
      <span class="grade-watermark" aria-hidden="true">${entry.grade}</span>
      <span class="tag">Grade ${entry.grade}</span>
      <h3>${entry.title}</h3>
      <span class="grade-age">${entry.age}</span>
      <p class="grade-intro">${entry.intro}</p>
      <div class="grade-columns">
        <div class="grade-block">
          <h4>Big skills this year</h4>
          <ul>${entry.learn.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
        <div class="grade-block">
          <h4>Words to know</h4>
          <div class="word-chips">${entry.words.map((word) => `<span>${word}</span>`).join("")}</div>
          <h4 style="margin-top:20px">Try this</h4>
          <ul>
            <li>Pick one skill and practise it for 10 focused minutes.</li>
            <li>Ask a grown-up what they remember from this grade.</li>
          </ul>
        </div>
      </div>
      <div class="genius-tip">
        <span class="tip-icon" aria-hidden="true">🧠</span>
        <p><strong>Genius tip:</strong> ${entry.tip}</p>
      </div>
    `;
  }

  if (gradePicker && gradeDetail) {
    grades.forEach((entry, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "grade-btn";
    button.setAttribute("aria-pressed", String(index === 0));
    button.innerHTML = `<span class="grade-num" aria-hidden="true">${entry.grade}</span><span>Grade ${entry.grade}</span>`;
    button.addEventListener("click", () => {
      $$(".grade-btn", gradePicker).forEach((btn) => btn.setAttribute("aria-pressed", "false"));
      button.setAttribute("aria-pressed", "true");
      renderGrade(index);
    });
    gradePicker.appendChild(button);
  });

    renderGrade(0);
  }

  /* ---------- Magic 8 Ball ---------- */

  const wisdomBall = $("#wisdom-ball");
  const wisdomBallText = $("#wisdom-ball-text");
  const wisdomMessage = $("#wisdom-message");
  const wisdomSub = $("#wisdom-sub");
  const wisdomHint = $("#wisdom-hint");
  const wisdomCount = $("#wisdom-count");
  const wisdomReset = $("#wisdom-reset");

  const wisdomFortunes = [
    { text: "You are enough.", note: "Exactly as you are, right now." },
    { text: "Small steps are still steps.", note: "Keep going, lovely." },
    { text: "Your kindness is magic.", note: "The world feels it." },
    { text: "Brave looks good on you.", note: "Do the thing anyway." },
    { text: "You make the world softer.", note: "That is a rare gift." },
    { text: "Curiosity is your superpower.", note: "Ask the next question." },
    { text: "You are allowed to shine.", note: "No shrinking today." },
    { text: "Today is yours.", note: "Take it one small joy at a time." },
    { text: "You’ve got this.", note: "Even on the wobbly days." },
    { text: "Your smile is a little sunrise.", note: "Someone needed it today." },
    { text: "Be proud of your progress.", note: "You came a long way." },
    { text: "A gentle heart is a strong heart.", note: "Softness is courage too." },
    { text: "You are wonderfully made.", note: "Every little detail." },
    { text: "Good things are growing.", note: "Even when you cannot see them yet." },
    { text: "Take up space.", note: "Your voice belongs here." },
    { text: "Your voice matters.", note: "Say the true thing." },
    { text: "Rest is part of the plan.", note: "You do not have to earn it." },
    { text: "You are loved, exactly as you are.", note: "No edits needed." },
    { text: "The world needs your sparkle.", note: "Shine in your own way." },
    { text: "You are doing better than you think.", note: "Be kind to yourself." },
    { text: "Choose wonder.", note: "There is magic in noticing." },
    { text: "You can do hard things.", note: "One brave minute at a time." },
    { text: "Your light is not too much.", note: "Let it glow." },
    { text: "You belong here.", note: "This little universe is yours." }
  ];

  let wisdomLast = -1;
  let wisdomReveals = 0;
  let wisdomTimer = null;

  function renderWisdomMessage(text) {
    let letterIndex = 0;
    const words = text.split(" ").map((word) => {
      const letters = Array.from(word).map((char) => {
        const span = `<span class="oracle-letter" style="--i:${letterIndex}">${char}</span>`;
        letterIndex += 1;
        return span;
      }).join("");
      letterIndex += 1;
      return `<span class="oracle-word">${letters}</span>`;
    }).join(" ");
    wisdomMessage.innerHTML = `<span aria-hidden="true">${words}</span>`;
    wisdomMessage.setAttribute("aria-label", text);
  }

  function revealWisdom() {
    if (!wisdomBall || wisdomBall.classList.contains("is-thinking")) return;

    clearTimeout(wisdomTimer);
    wisdomBall.classList.remove("is-lit", "has-answer");
    wisdomBall.classList.add("is-thinking");
    wisdomBall.setAttribute("aria-busy", "true");
    wisdomMessage.classList.remove("is-long", "is-longer", "is-revealing");
    wisdomMessage.removeAttribute("aria-label");
    wisdomHint.textContent = "The triangle is turning…";
    wisdomMessage.textContent = "…";
    wisdomSub.textContent = "Give the orb five seconds to think.";

    wisdomTimer = window.setTimeout(() => {
      let index = Math.floor(Math.random() * wisdomFortunes.length);
      if (wisdomFortunes.length > 1 && index === wisdomLast) {
        index = (index + 1) % wisdomFortunes.length;
      }
      wisdomLast = index;
      const fortune = wisdomFortunes[index];

      wisdomReveals += 1;
      renderWisdomMessage(fortune.text);
      wisdomMessage.classList.toggle("is-long", fortune.text.length > 32);
      wisdomMessage.classList.toggle("is-longer", fortune.text.length > 46);
      wisdomSub.textContent = fortune.note;
      wisdomCount.textContent = wisdomReveals === 1 ? "1 wish" : `${wisdomReveals} wishes`;
      wisdomBall.classList.remove("is-thinking");
      wisdomBall.classList.add("is-lit", "has-answer");
      wisdomBall.setAttribute("aria-busy", "false");
      void wisdomMessage.offsetWidth;
      wisdomMessage.classList.add("is-revealing");
      wisdomHint.textContent = "Tap again for another little lift.";
    }, prefersReducedMotion ? 300 : 5000);
  }

  if (wisdomBall) {
    wisdomBall.addEventListener("click", revealWisdom);
  }

  if (wisdomReset) {
    wisdomReset.addEventListener("click", () => {
      clearTimeout(wisdomTimer);
      wisdomReveals = 0;
      wisdomLast = -1;
      wisdomBall.classList.remove("is-thinking", "is-lit", "has-answer");
      wisdomBallText.textContent = "8";
      wisdomBall.setAttribute("aria-busy", "false");
      wisdomMessage.classList.remove("is-long", "is-longer", "is-revealing");
      wisdomMessage.removeAttribute("aria-label");
      wisdomMessage.textContent = "Tap to ask";
      wisdomSub.textContent = "Tap the 8 ball to begin.";
      wisdomHint.textContent = "Tap the ball to shake out a little wisdom.";
      wisdomCount.textContent = "";
    });
  }

  /* ---------- Books ---------- */

  const genres = [
    { id: "all", label: "All genres", emoji: "✦" },
    { id: "fantasy", label: "Fantasy", emoji: "🐉" },
    { id: "adventure", label: "Adventure", emoji: "🧭" },
    { id: "animals", label: "Animals", emoji: "🐾" }
  ];

  const books = [
    { id: "alice", title: "Alice’s Adventures in Wonderland", author: "Lewis Carroll", genre: "fantasy", ages: "8–12", emoji: "🐇", blurb: "Fall down the rabbit-hole with Alice and meet the Cheshire Cat, the Mad Hatter and the Queen of Hearts.", spark: "The book that made nonsense feel like an adventure.", gutenberg: 11, file: "books/alice.txt" },
    { id: "oz", title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", genre: "fantasy", ages: "7–11", emoji: "🌪️", blurb: "Dorothy, Toto and new friends follow the yellow brick road to the Emerald City.", spark: "A road, a wish, and friends who already have what they need.", gutenberg: 55, file: "books/oz.txt" },
    { id: "jungle-book", title: "The Jungle Book", author: "Rudyard Kipling", genre: "adventure", ages: "9–12", emoji: "🐯", blurb: "Mowgli grows up among the wolves, bears and panthers of the Indian jungle.", spark: "Wild, fierce, and full of the jungle's own rules.", gutenberg: 236, file: "books/jungle-book.txt" },
    { id: "secret-garden", title: "The Secret Garden", author: "Frances Hodgson Burnett", genre: "adventure", ages: "8–12", emoji: "🌹", blurb: "Mary Lennox finds a hidden garden and helps a sickly boy learn to live again.", spark: "A hidden door, fresh air, and the courage to grow.", gutenberg: 17396, file: "books/secret-garden.txt" },
    { id: "little-princess", title: "A Little Princess", author: "Frances Hodgson Burnett", genre: "adventure", ages: "8–12", emoji: "👑", blurb: "Sara Crewe stays kind and brave even when she loses everything.", spark: "Kindness is its own kind of bravery.", gutenberg: 146, file: "books/little-princess.txt" },
    { id: "wind-willows", title: "The Wind in the Willows", author: "Kenneth Grahame", genre: "animals", ages: "7–11", emoji: "🚣", blurb: "Mole, Rat, Toad and Badger share river days, wild rides and cosy homes.", spark: "Slow river days and the comfort of home.", gutenberg: 289, file: "books/wind-willows.txt" },
    { id: "treasure-island", title: "Treasure Island", author: "Robert Louis Stevenson", genre: "adventure", ages: "10–13", emoji: "🏴‍☠️", blurb: "Jim Hawkins sails for buried treasure and meets the unforgettable Long John Silver.", spark: "Maps, mutiny, and a pirate you can't forget.", gutenberg: 120, file: "books/treasure-island.txt" },
    { id: "black-beauty", title: "Black Beauty", author: "Anna Sewell", genre: "animals", ages: "8–12", emoji: "🐴", blurb: "A horse tells his own life story, from a kind home to hard work and back again.", spark: "A horse's whole life, told in his own voice.", gutenberg: 271, file: "books/black-beauty.txt" },
    { id: "velveteen-rabbit", title: "The Velveteen Rabbit", author: "Margery Williams", genre: "animals", ages: "5–9", emoji: "🧸", blurb: "A stuffed rabbit learns what it means to become Real through love.", spark: "What it really means to become Real.", gutenberg: 11757, file: "books/velveteen-rabbit.txt" },
    { id: "happy-prince", title: "The Happy Prince and Other Tales", author: "Oscar Wilde", genre: "fantasy", ages: "7–11", emoji: "✨", blurb: "A golden statue and a little swallow give everything they have to help others.", spark: "Giving everything away, one small kindness at a time.", gutenberg: 902, file: "books/happy-prince.txt" }
  ];

  const genreChips = $("#genre-chips");
  const bookGrid = $("#book-grid");
  const bookCount = $("#book-count");
  let activeGenre = "all";

  const esc = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  /* ---------- Reader ---------- */

  const readerModal = $("#reader-modal");
  const readerTitle = $("#reader-title");
  const readerAuthor = $("#reader-author");
  const readerText = $("#reader-text");
  const readerScroll = $("#reader-scroll");
  const readerSource = $("#reader-source");
  const readerPlay = $("#reader-play");
  const readerStop = $("#reader-stop");
  const readerClose = $("#reader-close");
  const readerVoice = $("#reader-voice");
  const readerRate = $("#reader-rate");
  const readerRateValue = $("#reader-rate-value");
  const readerChapter = $("#reader-chapter");
  const readerChapterWrap = $("#reader-chapter-wrap");
  const readerStatus = $("#reader-status");

  const bookTextCache = new Map();
  let readerChunks = [];
  let readerChapterStarts = [];
  let readerChunkIndex = 0;
  let readerSpeaking = false;
  let readerPaused = false;

  function parseBookText(raw) {
    const blocks = raw.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
    const chunks = [];
    const chapterStarts = [];
    for (const block of blocks) {
      if (block.startsWith("# ")) {
        const heading = block.slice(2).trim();
        chapterStarts.push({ index: chunks.length, title: heading });
        chunks.push({ type: "h", text: heading });
      } else {
        chunks.push({ type: "p", text: block });
      }
    }
    if (chapterStarts.length === 0) chapterStarts.push({ index: 0, title: "Story" });
    return { chunks, chapterStarts };
  }

  function renderReader() {
    readerText.innerHTML = readerChunks.map((chunk, index) => {
      const className = "reader-chunk";
      if (chunk.type === "h") {
        return `<h3 class="${className}" data-chunk="${index}">${esc(chunk.text)}</h3>`;
      }
      return `<p class="${className}" data-chunk="${index}">${esc(chunk.text)}</p>`;
    }).join("");
  }

  function updateChapterSelect() {
    if (readerChapterStarts.length > 1) {
      readerChapterWrap.hidden = false;
      readerChapter.innerHTML = readerChapterStarts.map((chapter, index) =>
        `<option value="${index}">${esc(chapter.title)}</option>`
      ).join("");
    } else {
      readerChapterWrap.hidden = true;
      readerChapter.innerHTML = "";
    }
  }

  function loadVoices() {
    if (!("speechSynthesis" in window)) return;
    const english = speechSynthesis.getVoices().filter((voice) => /^en/i.test(voice.lang));
    const list = english.length ? english : speechSynthesis.getVoices();
    readerVoice.innerHTML = list.map((voice, index) =>
      `<option value="${index}">${esc(voice.name)} (${voice.lang})</option>`
    ).join("");
    readerVoice._voices = list;
  }

  if ("speechSynthesis" in window) {
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  } else {
    readerPlay.hidden = true;
    readerVoice.parentElement.hidden = true;
    readerRate.parentElement.hidden = true;
    readerStatus.textContent = "Read-aloud is not supported in this browser.";
  }

  function selectedVoice() {
    const list = readerVoice._voices || [];
    const index = Number(readerVoice.value || 0);
    return list[index] || null;
  }

  function setReaderStatus(message) {
    readerStatus.textContent = message;
  }

  function highlightChunk(index) {
    $$(".reader-chunk", readerText).forEach((element) => element.classList.remove("is-reading"));
    const element = readerText.querySelector(`[data-chunk="${index}"]`);
    if (element) {
      element.classList.add("is-reading");
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  function finishSpeaking() {
    readerSpeaking = false;
    readerPaused = false;
    readerChunkIndex = 0;
    readerPlay.textContent = "🔊 Read aloud";
    readerStop.hidden = true;
    setReaderStatus("Finished.");
    $$(".reader-chunk", readerText).forEach((element) => element.classList.remove("is-reading"));
  }

  function speakNext() {
    if (!readerSpeaking || readerPaused) return;
    if (readerChunkIndex >= readerChunks.length) {
      finishSpeaking();
      return;
    }
    const chunk = readerChunks[readerChunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunk.text);
    const voice = selectedVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = Number(readerRate.value || 0.95);
    utterance.onstart = () => highlightChunk(readerChunkIndex);
    utterance.onend = () => {
      readerChunkIndex += 1;
      speakNext();
    };
    utterance.onerror = (event) => {
      if (event.error === "interrupted" || event.error === "canceled") return;
      setReaderStatus("Voice error: " + event.error);
      finishSpeaking();
    };
    speechSynthesis.speak(utterance);
    setReaderStatus(`Reading ${readerChunkIndex + 1} of ${readerChunks.length}`);
  }

  function startSpeaking(fromIndex) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    readerChunkIndex = Math.max(0, Math.min(fromIndex, readerChunks.length - 1));
    readerSpeaking = true;
    readerPaused = false;
    readerPlay.textContent = "⏸ Pause";
    readerStop.hidden = false;
    speakNext();
  }

  function togglePlay() {
    if (!readerSpeaking) {
      startSpeaking(readerChunkIndex);
      return;
    }
    if (readerPaused) {
      readerPaused = false;
      speechSynthesis.resume();
      readerPlay.textContent = "⏸ Pause";
      setReaderStatus(`Reading ${readerChunkIndex + 1} of ${readerChunks.length}`);
    } else {
      readerPaused = true;
      speechSynthesis.pause();
      readerPlay.textContent = "▶ Resume";
      setReaderStatus("Paused.");
    }
  }

  function stopSpeaking() {
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    readerSpeaking = false;
    readerPaused = false;
    readerChunkIndex = 0;
    readerPlay.textContent = "🔊 Read aloud";
    readerStop.hidden = true;
    setReaderStatus("Stopped.");
    $$(".reader-chunk", readerText).forEach((element) => element.classList.remove("is-reading"));
  }

  async function openBook(id) {
    const book = books.find((item) => item.id === id);
    if (!book) return;
    readerTitle.textContent = book.title;
    readerAuthor.textContent = book.author;
    readerSource.href = `https://www.gutenberg.org/ebooks/${book.gutenberg}`;
    readerText.innerHTML = '<p class="reader-loading">Loading the full story…</p>';
    readerChapterWrap.hidden = true;
    readerChapter.innerHTML = "";
    readerModal.hidden = false;
    document.body.style.overflow = "hidden";
    readerClose.focus();
    stopSpeaking();
    try {
      let text = bookTextCache.get(book.id);
      if (!text) {
        const response = await fetch(book.file);
        if (!response.ok) throw new Error("Could not load this book.");
        text = await response.text();
        bookTextCache.set(book.id, text);
      }
      const parsed = parseBookText(text);
      readerChunks = parsed.chunks;
      readerChapterStarts = parsed.chapterStarts;
      renderReader();
      updateChapterSelect();
      setReaderStatus(`${readerChunks.length} paragraphs. Press “Read aloud” to listen.`);
    } catch (error) {
      readerText.innerHTML = `<p class="reader-error">${esc(error.message || "Could not load this book.")}</p><button class="btn btn-ghost btn-small" id="reader-retry" type="button">Try again ↻</button>`;
      const retry = $("#reader-retry");
      if (retry) retry.addEventListener("click", () => openBook(id));
    }
  }

  function closeReader() {
    stopSpeaking();
    readerModal.hidden = true;
    document.body.style.overflow = "";
  }

  readerClose.addEventListener("click", closeReader);
  readerModal.querySelector(".reader-backdrop").addEventListener("click", closeReader);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !readerModal.hidden) closeReader();
  });
  readerPlay.addEventListener("click", togglePlay);
  readerStop.addEventListener("click", stopSpeaking);
  readerRate.addEventListener("input", () => {
    readerRateValue.textContent = Number(readerRate.value).toFixed(2) + "×";
    if (readerSpeaking && !readerPaused) startSpeaking(readerChunkIndex);
  });
  readerVoice.addEventListener("change", () => {
    if (readerSpeaking && !readerPaused) startSpeaking(readerChunkIndex);
  });
  readerChapter.addEventListener("change", () => {
    const chapterIndex = Number(readerChapter.value || 0);
    const start = readerChapterStarts[chapterIndex]?.index ?? 0;
    readerChunkIndex = start;
    const target = readerText.querySelector(`[data-chunk="${start}"]`);
    if (target) target.scrollIntoView({ block: "start" });
    if (readerSpeaking) startSpeaking(start);
    else setReaderStatus(`Chapter ${chapterIndex + 1}. Press “Read aloud” to listen.`);
  });

  function renderBooks() {
    const list = activeGenre === "all" ? books : books.filter((book) => book.genre === activeGenre);
    bookGrid.innerHTML = list.map((book) => {
      const genreLabel = genres.find((g) => g.id === book.genre).label;
      return `
        <button type="button" class="book-card genre-${book.genre}" data-book="${book.id}" aria-label="Read ${esc(book.title)}">
          <div class="book-cover">
            <span class="book-emoji" aria-hidden="true">${book.emoji}</span>
            <span class="book-genre-tag">${genreLabel}</span>
          </div>
          <div class="book-body">
            <h3>${esc(book.title)}</h3>
            <p class="book-author">${esc(book.author)}</p>
            <p class="book-blurb">${esc(book.blurb)}</p>
            <p class="book-spark">✨ ${esc(book.spark)}</p>
            <div class="book-meta"><span>Ages ${esc(book.ages)}</span><span>Free · Public domain</span></div>
            <span class="book-read">Read the whole story →</span>
          </div>
        </button>
      `;
    }).join("");
    $$(".book-card", bookGrid).forEach((card) => {
      card.addEventListener("click", () => openBook(card.dataset.book));
    });
    bookCount.textContent = `Showing ${list.length} of ${books.length} free books.`;
  }

  genres.forEach((genre) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.setAttribute("aria-pressed", String(genre.id === "all"));
    chip.innerHTML = `<span aria-hidden="true">${genre.emoji}</span> ${genre.label}`;
    chip.addEventListener("click", () => {
      activeGenre = genre.id;
      $$(".chip", genreChips).forEach((btn) => btn.setAttribute("aria-pressed", "false"));
      chip.setAttribute("aria-pressed", "true");
      renderBooks();
    });
    genreChips.appendChild(chip);
  });

  renderBooks();

  /* ---------- Translate ---------- */

  const translateInput = $("#translate-input");
  const translateGo = $("#translate-go");
  const translateStatus = $("#translate-status");
  const translateGrid = $("#translate-grid");

  const translateLangs = [
    { code: "ja", name: "Japanese", country: "Japan", flagUrl: "https://flagcdn.com/w80/jp.png", note: "日本語" },
    { code: "ko", name: "Korean", country: "South Korea", flagUrl: "https://flagcdn.com/w80/kr.png", note: "한국어" },
    { code: "zh", name: "Chinese", country: "China", flagUrl: "https://flagcdn.com/w80/cn.png", note: "中文" },
    { code: "it", name: "Italian", country: "Italy", flagUrl: "https://flagcdn.com/w80/it.png", note: "italiano" },
    { code: "es", name: "Spanish", country: "Spain", flagUrl: "https://flagcdn.com/w80/es.png", note: "español" },
    { code: "ar", name: "Arabic", country: "Saudi Arabia", flagUrl: "https://flagcdn.com/w80/sa.png", note: "العربية" }
  ];

  const flagMarkup = (lang) =>
    `<img class="translate-flag" src="${lang.flagUrl}" alt="${lang.country} flag" width="28" height="20" loading="lazy" decoding="async" />`;

  const translateCache = new Map();

  function isCompleteTranslation(entry) {
    if (!entry) return false;
    return translateLangs.every((lang) => {
      const item = entry[lang.code];
      const translation = item && item.translation;
      return typeof translation === "string" && translation.trim() && translation.trim() !== "—";
    });
  }

  function renderTranslateLoading() {
    translateGrid.innerHTML = translateLangs.map((lang) => `
      <article class="translate-card">
        <div class="translate-card-head">${flagMarkup(lang)}<h3>${lang.name}</h3></div>
        <p class="translate-text translate-loading">Translating…</p>
        <p class="translate-written"></p>
      </article>
    `).join("");
  }

  function renderTranslateResult(data) {
    translateGrid.innerHTML = translateLangs.map((lang) => {
      const item = (data && data[lang.code]) || {};
      const translation = item.translation || "—";
      const written = item.written || "";
      return `
        <article class="translate-card">
          <div class="translate-card-head">${flagMarkup(lang)}<h3>${lang.name}</h3><span class="translate-native">${lang.note}</span></div>
          <p class="translate-text">${esc(translation)}</p>
          <p class="translate-written"><span class="translate-written-label">How it’s written:</span> ${esc(written || "—")}</p>
        </article>
      `;
    }).join("");
  }

  async function doTranslate() {
    const text = (translateInput.value || "").trim();
    if (!text) {
      translateStatus.textContent = "Type a word, phrase, or full sentence first.";
      return;
    }
    const cached = translateCache.get(text);
    if (cached && isCompleteTranslation(cached)) {
      renderTranslateResult(cached);
      translateStatus.textContent = "Translated (cached).";
      return;
    }
    try {
      const stored = localStorage.getItem("pauleila:translate:" + text);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isCompleteTranslation(parsed)) {
          translateCache.set(text, parsed);
          renderTranslateResult(parsed);
          translateStatus.textContent = "Translated (cached).";
          return;
        }
      }
    } catch (error) {
      /* ignore bad cache */
    }
    renderTranslateLoading();
    translateStatus.textContent = "Translating…";
    const prompt = `Translate the following English text into Japanese, Korean, Simplified Chinese, Italian, Spanish, and Arabic. The text may be a word, phrase, or complete sentence. Return ONLY valid JSON with this exact shape:
{"ja":{"translation":"...","written":"..."},"ko":{"translation":"...","written":"..."},"zh":{"translation":"...","written":"..."},"it":{"translation":"...","written":"..."},"es":{"translation":"...","written":"..."},"ar":{"translation":"...","written":"..."}}
Rules:
- "translation" is a natural, fluent translation in the target language's native script. For whole sentences, translate the complete meaning naturally rather than word-for-word; keep the tone, names, numbers, and punctuation.
- "written" is how the full translation is written or pronounced for a learner: Japanese romaji; Korean revised romanization; Chinese pinyin with tone marks; Italian pronunciation in plain Latin letters; Spanish pronunciation in plain Latin letters; Arabic transliteration in plain Latin letters.
- Include all six keys even when the text is a short word or number.
- Keep numbers, names and meaning accurate.
- No markdown, no extra text.

English: ${JSON.stringify(text)}`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 60000);
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai-fast",
          temperature: 0,
          max_tokens: 1800,
          messages: [
            { role: "system", content: "You are a precise translator. Output only JSON." },
            { role: "user", content: prompt }
          ]
        }),
        signal: controller.signal
      });
      clearTimeout(timer);
      if (!response.ok) throw new Error("Translation service returned " + response.status);
      const data = await response.json();
      const raw = data?.choices?.[0]?.message?.content || "";
      const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON in response");
      const parsed = JSON.parse(match[0]);
      for (const lang of translateLangs) {
        if (!parsed[lang.code]) parsed[lang.code] = { translation: "—", written: "" };
      }
      translateCache.set(text, parsed);
      try {
        localStorage.setItem("pauleila:translate:" + text, JSON.stringify(parsed));
      } catch (error) {
        /* storage may be blocked */
      }
      renderTranslateResult(parsed);
      translateStatus.textContent = "Translated.";
    } catch (error) {
      translateGrid.innerHTML = "";
      translateStatus.textContent = "Could not translate right now. Please try again.";
    }
  }

  translateGo.addEventListener("click", doTranslate);
  translateInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      doTranslate();
    }
  });


  /* ---------- Quiz Bee ---------- */

  const quizBank = window.QUIZ_BANK || {};
  const quizSubjects = [
    { id: "math", label: "Mathematics", icon: "➗", blurb: "Numbers, shapes, and clever problems." },
    { id: "science", label: "Science", icon: "🔬", blurb: "Living things, Earth, and space." },
    { id: "english", label: "English and Language Arts", icon: "📚", blurb: "Words, grammar, and stories." },
    { id: "history", label: "Philippine History", icon: "🇵🇭", blurb: "Heroes, places, and turning points." },
    { id: "gk", label: "General Knowledge", icon: "🌍", blurb: "The wonderful world around us." }
  ];

  const quizSubjectEl = $("#quiz-subjects");
  const quizGradeEl = $("#quiz-grades");
  const quizStepSubject = $("#quiz-step-subject");
  const quizStepGrade = $("#quiz-step-grade");
  const quizStepPlay = $("#quiz-step-play");
  const quizStepResult = $("#quiz-step-result");
  const quizCrumb = $("#quiz-crumb");
  const quizPlayCrumb = $("#quiz-play-crumb");
  const quizQuestionNumber = $("#quiz-question-number");
  const quizScorePill = $("#quiz-score-pill");
  const quizProgressBar = $("#quiz-progress-bar");
  const quizQuestion = $("#quiz-question");
  const quizChoices = $("#quiz-choices");
  const quizFeedback = $("#quiz-feedback");
  const quizNext = $("#quiz-next");
  const quizCongrats = $("#quiz-congrats");
  const quizReview = $("#quiz-review");
  const quizRestart = $("#quiz-restart");
  const quizAgain = $("#quiz-again");
  const quizBackSubject = $("#quiz-back-subject");

  let quizState = null;

  function quizNumericChoices(answer, allowNegative = false) {
    const values = [String(answer)];
    for (const offset of [1, -1, 2, -2, 3, -3, 5, -5, 10, -10]) {
      const candidate = Number(answer) + offset;
      if ((allowNegative || candidate >= 0) && !values.includes(String(candidate))) values.push(String(candidate));
      if (values.length === 4) break;
    }
    let extra = 1;
    while (values.length < 4) {
      const candidate = Number(answer) + extra;
      if ((allowNegative || candidate >= 0) && !values.includes(String(candidate))) values.push(String(candidate));
      extra += 1;
    }
    return values;
  }

  function quizDecimalChoices(answer) {
    const values = [Number(answer).toFixed(1)];
    for (const offset of [0.1, -0.1, 0.2, -0.2, 0.5, -0.5, 1]) {
      const candidate = (Number(answer) + offset).toFixed(1);
      if (Number(candidate) >= 0 && !values.includes(candidate)) values.push(candidate);
      if (values.length === 4) break;
    }
    return values;
  }

  function quizFractionChoices(numerator, denominator) {
    const values = [`${numerator}/${denominator}`];
    for (const diff of [1, -1, 2, -2, 3, -3]) {
      const n = numerator + diff;
      if (n > 0 && n < denominator && !values.includes(`${n}/${denominator}`)) values.push(`${n}/${denominator}`);
      if (values.length === 4) break;
    }
    return values;
  }

  function generateMathQuiz(grade) {
    const questions = [];
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const add = (prompt, answer, choices) => {
      questions.push({ q: prompt, choices: choices || quizNumericChoices(answer), answer: 0 });
    };

    if (grade === 1) {
      for (let i = 0; i < 5; i += 1) {
        const a = rand(1, 9);
        const b = rand(1, 9);
        add(`${a} + ${b} = ?`, a + b);
      }
      for (let i = 0; i < 5; i += 1) {
        const a = rand(5, 18);
        const b = rand(1, a);
        add(`${a} - ${b} = ?`, a - b);
      }
      for (let i = 0; i < 5; i += 1) {
        const n = rand(1, 15);
        add(`What is 10 more than ${n}?`, n + 10);
      }
      for (let i = 0; i < 5; i += 1) {
        const n = rand(11, 20);
        add(`What is 10 less than ${n}?`, n - 10);
      }
    } else if (grade === 2) {
      for (let i = 0; i < 5; i += 1) {
        const a = rand(10, 50);
        const b = rand(10, 40);
        add(`${a} + ${b} = ?`, a + b);
      }
      for (let i = 0; i < 5; i += 1) {
        const a = rand(30, 99);
        const b = rand(1, a - 10);
        add(`${a} - ${b} = ?`, a - b);
      }
      for (let i = 0; i < 5; i += 1) {
        const a = rand(2, 5);
        const b = rand(1, 10);
        add(`${a} × ${b} = ?`, a * b);
      }
      for (let i = 0; i < 5; i += 1) {
        const hundreds = rand(1, 9);
        const tens = rand(1, 9);
        const ones = rand(1, 9);
        const number = hundreds * 100 + tens * 10 + ones;
        add(`What is the value of the digit ${tens} in ${number}?`, tens * 10);
      }
    } else if (grade === 3) {
      for (let i = 0; i < 5; i += 1) {
        const a = rand(2, 10);
        const b = rand(2, 10);
        add(`${a} × ${b} = ?`, a * b);
      }
      for (let i = 0; i < 5; i += 1) {
        const divisor = rand(2, 9);
        const quotient = rand(2, 10);
        add(`${divisor * quotient} ÷ ${divisor} = ?`, quotient);
      }
      const fractionRounds = [
        { base: "1/2", equal: "2/4", wrong: ["1/3", "2/3", "3/4"] },
        { base: "1/3", equal: "2/6", wrong: ["1/2", "2/3", "3/4"] },
        { base: "1/4", equal: "2/8", wrong: ["1/2", "2/3", "3/4"] },
        { base: "2/3", equal: "4/6", wrong: ["1/2", "1/3", "3/4"] },
        { base: "3/4", equal: "6/8", wrong: ["1/2", "1/3", "2/3"] }
      ];
      fractionRounds.forEach((round) => {
        add(`Which fraction is equal to ${round.base}?`, round.equal, [round.equal, ...round.wrong]);
      });
      for (let i = 0; i < 5; i += 1) {
        const length = rand(2, 10);
        const width = rand(1, 8);
        add(`A rectangle is ${length} cm long and ${width} cm wide. What is its perimeter?`, 2 * (length + width));
      }
    } else if (grade === 4) {
      for (let i = 0; i < 5; i += 1) {
        const a = rand(12, 40);
        const b = rand(2, 9);
        add(`${a} × ${b} = ?`, a * b);
      }
      for (let i = 0; i < 5; i += 1) {
        const divisor = rand(2, 9);
        const quotient = rand(4, 15);
        add(`${divisor * quotient} ÷ ${divisor} = ?`, quotient);
      }
      for (let i = 0; i < 5; i += 1) {
        const denominator = rand(6, 10);
        const first = 1;
        const second = rand(1, denominator - 3);
        const sum = first + second;
        add(`${first}/${denominator} + ${second}/${denominator} = ?`, `${sum}/${denominator}`, quizFractionChoices(sum, denominator));
      }
      for (let i = 0; i < 5; i += 1) {
        const length = rand(4, 12);
        const width = rand(3, 9);
        add(`A rectangle is ${length} cm long and ${width} cm wide. What is its area?`, length * width);
      }
    } else if (grade === 5) {
      for (let i = 0; i < 5; i += 1) {
        const denominator = rand(5, 10);
        const first = rand(1, denominator - 3);
        const second = rand(1, denominator - first - 1);
        const sum = first + second;
        add(`${first}/${denominator} + ${second}/${denominator} = ?`, `${sum}/${denominator}`, quizFractionChoices(sum, denominator));
      }
      for (let i = 0; i < 5; i += 1) {
        const a = rand(10, 50) / 10;
        const b = rand(10, 30) / 10;
        const sum = Number((a + b).toFixed(1));
        add(`${a.toFixed(1)} + ${b.toFixed(1)} = ?`, sum, quizDecimalChoices(sum));
      }
      const percents = [10, 20, 25, 50, 10];
      percents.forEach((percent) => {
        const base = rand(1, 10) * 20;
        add(`What is ${percent}% of ${base}?`, (base * percent) / 100);
      });
      for (let i = 0; i < 5; i += 1) {
        const length = rand(2, 6);
        const width = rand(2, 5);
        const height = rand(2, 4);
        add(`A box is ${length} cm long, ${width} cm wide, and ${height} cm tall. What is its volume?`, length * width * height);
      }
    } else {
      const ratioRounds = [
        { a: 2, b: 3, factor: 4 },
        { a: 3, b: 5, factor: 2 },
        { a: 1, b: 4, factor: 5 },
        { a: 4, b: 7, factor: 3 },
        { a: 5, b: 6, factor: 2 }
      ];
      ratioRounds.forEach((round) => {
        const correct = `${round.a}:${round.b}`;
        add(`Simplify the ratio ${round.a * round.factor}:${round.b * round.factor}.`, correct, [
          correct,
          `${round.a + 1}:${round.b}`,
          `${round.a}:${round.b + 1}`,
          `${round.b}:${round.a}`
        ]);
      });
      for (let i = 0; i < 5; i += 1) {
        const a = rand(-10, 10);
        const b = rand(-10, 10);
        add(`${a} + ${b} = ?`, a + b, quizNumericChoices(a + b, true));
      }
      for (let i = 0; i < 5; i += 1) {
        const x = rand(2, 12);
        const b = rand(2, 10);
        add(`If x + ${b} = ${x + b}, what is x?`, x);
      }
      for (let i = 0; i < 5; i += 1) {
        const base = rand(2, 8) * 2;
        const height = rand(2, 10);
        add(`A triangle has a base of ${base} cm and a height of ${height} cm. What is its area?`, (base * height) / 2);
      }
    }

    return questions;
  }

  function prepareQuizQuestion(item) {
    const choices = shuffle(item.choices.map((text, index) => ({ text, correct: index === item.answer })));
    return {
      prompt: item.q,
      choices: choices.map((choice) => choice.text),
      answer: choices.findIndex((choice) => choice.correct)
    };
  }

  function buildQuiz(subjectId, grade) {
    if (subjectId === "math") return generateMathQuiz(grade).map(prepareQuizQuestion);
    const bank = quizBank[subjectId];
    if (!bank) return [];
    const band = grade <= 3 ? "lower" : "upper";
    const pool = [...(bank[band] || []), ...(bank.general || [])];
    return shuffle(pool).slice(0, 20).map(prepareQuizQuestion);
  }

  function renderQuizSubjects() {
    quizSubjectEl.innerHTML = quizSubjects.map((subject) => `
      <button class="quiz-subject" type="button" data-subject="${subject.id}" aria-pressed="false">
        <span class="quiz-subject-icon" aria-hidden="true">${subject.icon}</span>
        <strong>${esc(subject.label)}</strong>
        <span>${esc(subject.blurb)}</span>
      </button>
    `).join("");
  }

  function selectQuizSubject(subjectId) {
    const subject = quizSubjects.find((entry) => entry.id === subjectId);
    if (!subject) return;
    quizState = { subject: subject.id, subjectLabel: subject.label, grade: null, questions: [], index: 0, score: 0, answered: false, answers: [] };
    $$(".quiz-subject", quizSubjectEl).forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.subject === subjectId)));
    quizCrumb.textContent = subject.label;
    quizStepSubject.hidden = true;
    quizStepGrade.hidden = false;
    quizStepPlay.hidden = true;
    quizStepResult.hidden = true;
    quizRestart.hidden = false;
    renderQuizGrades();
    quizGradeEl.querySelector(".quiz-grade")?.focus();
  }

  function renderQuizGrades() {
    quizGradeEl.innerHTML = [1, 2, 3, 4, 5, 6].map((grade) => `
      <button class="quiz-grade" type="button" data-grade="${grade}" aria-pressed="false">
        <span class="quiz-grade-num" aria-hidden="true">${grade}</span>
        <strong>Grade ${grade}</strong>
        <small>${grade <= 3 ? "Foundations" : "Challenge"}</small>
      </button>
    `).join("");
  }

  function startQuiz(grade) {
    if (!quizState) return;
    const questions = buildQuiz(quizState.subject, grade);
    if (!questions.length) return;
    quizState = { ...quizState, grade, questions, index: 0, score: 0, answered: false, answers: [] };
    quizPlayCrumb.textContent = `${quizState.subjectLabel} · Grade ${grade}`;
    quizStepGrade.hidden = true;
    quizStepPlay.hidden = false;
    quizStepResult.hidden = true;
    quizRestart.hidden = false;
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    if (!quizState || quizState.index >= quizState.questions.length) return;
    const question = quizState.questions[quizState.index];
    quizState.answered = false;
    quizQuestionNumber.textContent = `Question ${quizState.index + 1} of ${quizState.questions.length}`;
    quizScorePill.textContent = `${quizState.score} correct`;
    quizProgressBar.style.width = `${(quizState.index / quizState.questions.length) * 100}%`;
    quizQuestion.textContent = question.prompt;
    quizFeedback.textContent = "";
    quizFeedback.className = "quiz-feedback";
    quizNext.disabled = true;
    quizNext.textContent = quizState.index === quizState.questions.length - 1 ? "See my results 🐝" : "Next question →";
    quizChoices.innerHTML = question.choices.map((choice, index) => `
      <button class="quiz-choice" type="button" data-choice="${index}">
        <span class="quiz-choice-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
        <span>${esc(choice)}</span>
      </button>
    `).join("");
    $$(".quiz-choice", quizChoices).forEach((button) => {
      button.addEventListener("click", () => answerQuizQuestion(Number(button.dataset.choice)));
    });
  }

  function answerQuizQuestion(choiceIndex) {
    if (!quizState || quizState.answered) return;
    const question = quizState.questions[quizState.index];
    const isCorrect = choiceIndex === question.answer;
    quizState.answered = true;
    if (isCorrect) quizState.score += 1;
    quizState.answers.push({
      prompt: question.prompt,
      choices: question.choices,
      chosen: choiceIndex,
      correct: question.answer
    });
    $$(".quiz-choice", quizChoices).forEach((button, index) => {
      button.disabled = true;
      if (index === question.answer) button.classList.add("is-correct");
      if (index === choiceIndex && !isCorrect) button.classList.add("is-wrong");
    });
    quizScorePill.textContent = `${quizState.score} correct`;
    quizProgressBar.style.width = `${((quizState.index + 1) / quizState.questions.length) * 100}%`;
    if (isCorrect) {
      quizFeedback.textContent = "Correct! Sweet work, Quiz Bee.";
      quizFeedback.classList.add("is-good");
    } else {
      quizFeedback.textContent = `Not quite. The correct answer is ${question.choices[question.answer]}.`;
      quizFeedback.classList.add("is-bad");
    }
    quizNext.disabled = false;
    quizNext.focus({ preventScroll: true });
  }

  function advanceQuiz() {
    if (!quizState || !quizState.answered) return;
    if (quizState.index >= quizState.questions.length - 1) {
      finishQuiz();
      return;
    }
    quizState.index += 1;
    renderQuizQuestion();
  }

  function finishQuiz() {
    if (!quizState) return;
    const total = quizState.questions.length;
    const score = quizState.score;
    const message = score === total
      ? "Perfect score! You are the queen bee of this hive."
      : score >= Math.ceil(total * 0.7)
        ? "That is a strong finish — your brain is buzzing!"
        : "You finished every question, and that is how genius grows. Keep buzzing!";
    quizStepPlay.hidden = true;
    quizStepResult.hidden = false;
    quizCongrats.innerHTML = `
      <span class="quiz-trophy" aria-hidden="true">🐝</span>
      <p class="eyebrow">Quiz complete</p>
      <h3>Congratulations, Quiz Bee champion!</h3>
      <p>You answered <strong>${score} of ${total}</strong> questions correctly in <strong>${esc(quizState.subjectLabel)} · Grade ${quizState.grade}</strong>.</p>
      <p>${message}</p>
    `;
    quizReview.innerHTML = quizState.answers.map((answer, index) => {
      const selected = answer.choices[answer.chosen];
      const correct = answer.choices[answer.correct];
      const isCorrect = answer.chosen === answer.correct;
      return `
        <article class="quiz-review-item ${isCorrect ? "is-correct" : "is-wrong"}">
          <p class="quiz-review-q"><span>${index + 1}</span>${esc(answer.prompt)}</p>
          <p class="quiz-review-answer ${isCorrect ? "correct" : "wrong"}"><strong>Your answer:</strong> ${esc(selected)} ${isCorrect ? "✓" : "✕"}</p>
          ${isCorrect ? "" : `<p class="quiz-review-answer correct"><strong>Correct answer:</strong> ${esc(correct)}</p>`}
        </article>
      `;
    }).join("");
    quizStepResult.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  function resetQuiz() {
    quizState = null;
    quizStepSubject.hidden = false;
    quizStepGrade.hidden = true;
    quizStepPlay.hidden = true;
    quizStepResult.hidden = true;
    quizRestart.hidden = true;
    quizGradeEl.innerHTML = "";
    quizFeedback.textContent = "";
    quizFeedback.className = "quiz-feedback";
    quizNext.disabled = true;
    quizProgressBar.style.width = "0%";
    quizCongrats.innerHTML = "";
    quizReview.innerHTML = "";
    $$(".quiz-subject", quizSubjectEl).forEach((button) => button.setAttribute("aria-pressed", "false"));
    quizStepSubject.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
  }

  renderQuizSubjects();
  quizSubjectEl.addEventListener("click", (event) => {
    const button = event.target.closest(".quiz-subject");
    if (button) selectQuizSubject(button.dataset.subject);
  });
  quizGradeEl.addEventListener("click", (event) => {
    const button = event.target.closest(".quiz-grade");
    if (button) startQuiz(Number(button.dataset.grade));
  });
  quizNext.addEventListener("click", advanceQuiz);
  quizRestart.addEventListener("click", resetQuiz);
  quizAgain.addEventListener("click", resetQuiz);
  quizBackSubject.addEventListener("click", resetQuiz);


  /* ---------- Bible: Gospel of the day ---------- */

  const gospelCard = $("#gospel-card");
  const gospelDateEl = $("#gospel-date");
  const gospelSeason = $("#gospel-season");
  const gospelRefEl = $("#gospel-ref");
  const gospelTextEl = $("#gospel-text");
  const gospelNotice = $("#gospel-notice");
  const gospelFirst = $("#gospel-first");
  const gospelPsalm = $("#gospel-psalm");
  const gospelGospel = $("#gospel-gospel");
  const gospelSource = $("#gospel-source");
  const gospelLink = $("#gospel-link");
  const gospelRetry = $("#gospel-retry");
  const gospelSummaryList = $("#gospel-summary-list");
  const gospelSummaryBadge = $("#gospel-summary-badge");
  const gospelSummaryNote = $("#gospel-summary-note");
  const gospelSummaryRetry = $("#gospel-summary-retry");

  const OFFLINE_GOSPEL = {
    season: "A Gospel to keep close",
    gospel: "John 3:16-17",
    firstReading: "",
    psalm: "",
    usccbLink: "https://bible.usccb.org/",
    translation: "World English Bible",
    verses: [
      {
        verse: 16,
        text: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life."
      },
      {
        verse: 17,
        text: "For God didn’t send his Son into the world to judge the world, but that the world should be saved through him."
      }
    ],
    text: "For God so loved the world, that he gave his one and only Son, that whoever believes in him should not perish, but have eternal life. For God didn’t send his Son into the world to judge the world, but that the world should be saved through him."
  };

  const gospelState = { loading: false, data: null };
  const summaryState = { loading: false, triedFor: null };

  const todayISO = () => {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-");
  };

  const formatGospelDate = (iso) => {
    const date = new Date(iso + "T12:00:00");
    if (Number.isNaN(date.getTime())) return "Today";
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  };

  function flashGospel() {
    if (prefersReducedMotion) return;
    gospelCard.classList.remove("is-flashing");
    void gospelCard.offsetWidth;
    gospelCard.classList.add("is-flashing");
    window.setTimeout(() => gospelCard.classList.remove("is-flashing"), 1600);
  }

  function renderGospel(data, note = "") {
    gospelState.data = data;
    gospelDateEl.textContent = formatGospelDate(data.date || todayISO());
    gospelSeason.textContent = data.season || "Today's Mass";
    gospelRefEl.textContent = data.gospel || "Gospel";
    gospelFirst.textContent = data.firstReading || "—";
    gospelPsalm.textContent = data.psalm || "—";
    gospelGospel.textContent = data.gospel || "—";
    gospelSource.textContent = (data.translation || "World English Bible") + " · public domain";

    gospelTextEl.textContent = "";
    if (Array.isArray(data.verses) && data.verses.length > 0) {
      data.verses.forEach((verse) => {
        const number = document.createElement("sup");
        number.className = "verse-num";
        number.textContent = verse.verse;
        const text = document.createElement("span");
        text.textContent = verse.text + " ";
        gospelTextEl.append(number, text);
      });
    } else {
      gospelTextEl.textContent = data.text || "The Gospel text could not be loaded.";
    }

    const safeLink = typeof data.usccbLink === "string" && data.usccbLink.startsWith("https://bible.usccb.org/")
      ? data.usccbLink
      : "https://bible.usccb.org/";
    gospelLink.href = safeLink;

    if (note) {
      gospelNotice.textContent = note;
      gospelNotice.hidden = false;
      gospelRetry.hidden = false;
    } else {
      gospelNotice.hidden = true;
      gospelRetry.hidden = true;
    }

    if (Array.isArray(data.summary) && data.summary.length > 0) {
      renderSummary(data.summary, "ai");
    } else {
      setSummaryIdle();
      maybeSummarizeGospel();
    }

    gospelCard.setAttribute("aria-busy", "false");
    flashGospel();
  }

  function setSummaryIdle() {
    gospelSummaryList.textContent = "";
    const line = document.createElement("li");
    line.className = "summary-placeholder";
    line.textContent = "A short summary will appear here.";
    gospelSummaryList.appendChild(line);
    gospelSummaryBadge.textContent = "AI summary";
    gospelSummaryNote.textContent = "A short AI summary. The passage above is the exact text.";
    gospelSummaryRetry.hidden = true;
    gospelSummaryList.removeAttribute("aria-busy");
  }

  function setSummaryLoading() {
    gospelSummaryList.textContent = "";
    const line = document.createElement("li");
    line.className = "summary-loading";
    line.textContent = "Making a short summary…";
    gospelSummaryList.appendChild(line);
    gospelSummaryList.setAttribute("aria-busy", "true");
    gospelSummaryBadge.textContent = "AI summary";
    gospelSummaryNote.textContent = "Writing a short summary… The Gospel above is ready to read now.";
    gospelSummaryRetry.hidden = true;
  }

  function renderSummary(bullets, source = "ai", note = "") {
    gospelSummaryList.textContent = "";
    bullets.forEach((bullet) => {
      const line = document.createElement("li");
      line.textContent = bullet;
      gospelSummaryList.appendChild(line);
    });
    gospelSummaryList.removeAttribute("aria-busy");
    gospelSummaryBadge.textContent = source === "ai" ? "AI summary" : "Key lines";
    gospelSummaryNote.textContent = note || (source === "ai"
      ? "AI-generated via Pollinations; it may paraphrase. The passage above is the exact text."
      : "The AI summary isn't available right now, so these are key lines from the passage.");
    gospelSummaryRetry.hidden = source === "ai";
  }

  function keyLines(data) {
    const verses = Array.isArray(data.verses)
      ? data.verses.filter((verse) => verse && typeof verse.text === "string" && verse.text.trim().length > 25)
      : [];
    if (verses.length === 0) return [];

    const picks = [verses[0]];
    if (verses.length > 2) picks.push(verses[Math.floor(verses.length / 2)]);
    if (verses.length > 1) picks.push(verses[verses.length - 1]);

    return picks.slice(0, 3).map((verse) => {
      const text = verse.text.trim().replace(/\s+/g, " ");
      const clipped = text.length > 185 ? text.slice(0, 182).trimEnd() + "…" : text;
      return `“${clipped}”`;
    });
  }

  function parseSummary(raw) {
    if (!raw) return [];
    const cleaned = String(raw)
      .split(/\r?\n/)
      .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").replace(/\*\*/g, "").trim())
      .filter((line) => line.length > 0 && !/^(summary|bullets?|here (is|are))\b/i.test(line));

    let bullets = cleaned;
    if (bullets.length < 2) {
      bullets = String(raw)
        .replace(/\s+/g, " ")
        .replace(/([.!?])\s+/g, "$1\n")
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
    }

    return bullets
      .filter((line) => line.length <= 240)
      .slice(0, 4)
      .map((line) => (line.length > 185 ? line.slice(0, 182).trimEnd() + "…" : line));
  }

  function renderSummaryFallback(data, note) {
    const lines = keyLines(data);
    if (lines.length > 0) {
      renderSummary(lines, "key", note);
    } else {
      renderSummary(["A summary isn't available right now. Read the Gospel above."], "key", note);
    }
  }

  async function loadGospelSummary(data) {
    if (!data || summaryState.loading) return;
    if (Array.isArray(data.summary) && data.summary.length > 0) {
      renderSummary(data.summary, "ai");
      return;
    }

    summaryState.loading = true;
    summaryState.triedFor = data.date;
    setSummaryLoading();

    const passage = typeof data.text === "string" && data.text.trim()
      ? data.text.trim()
      : (Array.isArray(data.verses) ? data.verses.map((verse) => verse.text).join(" ") : "");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 90000);
    const softTimer = window.setTimeout(() => {
      if (!summaryState.loading) return;
      renderSummaryFallback(data, "The AI summary is still working. Here are key lines for now.");
      gospelSummaryRetry.hidden = true;
    }, 25000);

    try {
      const response = await fetch("https://text.pollinations.ai/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "openai-fast",
          messages: [
            {
              role: "system",
              content: "You are a careful catechist. Summarize the Gospel for a 9-year-old in exactly 3 bullet points. Each bullet is one simple sentence under 15 words. Use only facts stated in the passage. Do not add lessons, applications, or ideas. Output only the bullets."
            },
            {
              role: "user",
              content: `Gospel (${data.gospel || "today's Gospel"}): ${passage}\n\nRead carefully, then return only the 3 bullets.`
            }
          ],
          temperature: 0,
          max_tokens: 1200
        })
      });
      if (!response.ok) throw new Error("summary service " + response.status);

      const payload = await response.json();
      const raw = payload && payload.choices && payload.choices[0] && payload.choices[0].message
        ? payload.choices[0].message.content
        : "";
      const bullets = parseSummary(raw);
      if (bullets.length < 2) throw new Error("summary too short");

      data.summary = bullets;
      if (!data.offline) store.set("gospel-" + data.date, data);
      renderSummary(bullets, "ai");
    } catch (error) {
      const note = error && error.name === "AbortError"
        ? "The AI summary took too long, so here are key lines from the passage. You can try again."
        : "The AI summary isn't available right now, so here are key lines from the passage. You can try again.";
      renderSummaryFallback(data, note);
    } finally {
      window.clearTimeout(timer);
      window.clearTimeout(softTimer);
      summaryState.loading = false;
    }
  }

  function maybeSummarizeGospel() {
    if (!gospelState.data) return;
    if (Array.isArray(gospelState.data.summary) && gospelState.data.summary.length > 0) {
      renderSummary(gospelState.data.summary, "ai");
      return;
    }
    if (summaryState.loading || summaryState.triedFor === gospelState.data.date) return;
    loadGospelSummary(gospelState.data);
  }

  function setGospelLoading() {
    gospelCard.setAttribute("aria-busy", "true");
    gospelDateEl.textContent = formatGospelDate(todayISO());
    gospelSeason.textContent = "Loading today's readings…";
    gospelRefEl.textContent = "Gospel";
    gospelTextEl.textContent = "Reaching for today's Gospel…";
    gospelFirst.textContent = "—";
    gospelPsalm.textContent = "—";
    gospelGospel.textContent = "—";
    gospelNotice.hidden = true;
    gospelRetry.hidden = true;
    gospelSource.textContent = "World English Bible · public domain";
    setSummaryIdle();
  }

  async function loadGospel({ force = false } = {}) {
    if (gospelState.loading) return;

    const iso = todayISO();
    const cacheKey = "gospel-" + iso;
    const cached = store.get(cacheKey, null);
    if (cached && !force) {
      renderGospel(cached);
      return;
    }

    gospelState.loading = true;
    setGospelLoading();

    try {
      const [year, month, day] = iso.split("-");
      const readingsResponse = await fetch(
        `https://cpbjr.github.io/catholic-readings-api/readings/${year}/${month}-${day}.json`,
        { cache: "no-store" }
      );
      if (!readingsResponse.ok) throw new Error("readings unavailable");
      const readings = await readingsResponse.json();
      const gospelRef = readings && readings.readings ? readings.readings.gospel : "";
      if (!gospelRef) throw new Error("no gospel reference");

      const passageResponse = await fetch(
        "https://bible-api.com/" + encodeURIComponent(gospelRef) + "?translation=web"
      );
      if (!passageResponse.ok) throw new Error("passage unavailable");
      const passage = await passageResponse.json();

      const data = {
        date: iso,
        season: readings.season || "",
        gospel: gospelRef,
        firstReading: readings.readings.firstReading || "",
        psalm: readings.readings.psalm || "",
        secondReading: readings.readings.secondReading || "",
        usccbLink: readings.usccbLink || "",
        translation: passage.translation_name || "World English Bible",
        verses: Array.isArray(passage.verses)
          ? passage.verses.map((verse) => ({ verse: verse.verse, text: verse.text }))
          : [],
        text: typeof passage.text === "string" ? passage.text : ""
      };

      if (!data.text && data.verses.length === 0) throw new Error("empty passage");

      store.set(cacheKey, data);
      renderGospel(data);
    } catch (error) {
      if (cached) {
        renderGospel(cached, "You're offline, so this is the Gospel saved for today.");
      } else {
        renderGospel(
          { ...OFFLINE_GOSPEL, date: iso, offline: true },
          "We couldn't reach today's readings just now. Here is a Gospel to read instead — try again in a moment."
        );
      }
    } finally {
      gospelState.loading = false;
      gospelCard.removeAttribute("aria-busy");
    }
  }

  $("#gospel-flash").addEventListener("click", () => {
    if (gospelState.data) flashGospel();
  });
  gospelRetry.addEventListener("click", () => loadGospel({ force: true }));
  gospelSummaryRetry.addEventListener("click", () => {
    if (!gospelState.data || summaryState.loading) return;
    summaryState.triedFor = null;
    loadGospelSummary(gospelState.data);
  });

  loadGospel();

  /* ---------- Game 1: Moonlight Memory ---------- */

  const memoryBoard = $("#memory-board");
  const memoryMoves = $("#memory-moves");
  const memoryBestLabel = $("#memory-best");
  const memoryStatus = $("#memory-status");
  const memoryEmojis = ["🦄", "🌙", "🔮", "🧠", "📚", "⭐"];

  const memoryState = {
    first: null,
    lock: false,
    moves: 0,
    matched: 0
  };

  function memoryBestText() {
    const best = store.get("memory-moves", null);
    return best === null ? "Your best will appear here." : `Best: ${best} moves`;
  }

  function updateMemoryStatus() {
    memoryMoves.textContent = `${memoryState.moves} move${memoryState.moves === 1 ? "" : "s"}`;
    memoryBestLabel.textContent = memoryBestText();
    if (memoryState.matched > 0 && memoryState.matched < memoryEmojis.length) {
      memoryStatus.textContent = `You found ${memoryState.matched} of ${memoryEmojis.length} pairs. Keep going.`;
      memoryStatus.className = "game-status good";
    }
  }

  function finishMemory() {
    memoryStatus.textContent = `All six pairs found in ${memoryState.moves} moves. Memory: excellent. 🎉`;
    memoryStatus.className = "game-status win";
    const best = store.get("memory-moves", null);
    if (best === null || memoryState.moves < best) store.set("memory-moves", memoryState.moves);
    memoryBestLabel.textContent = memoryBestText();
  }

  function flipMemory(card) {
    if (memoryState.lock) return;
    if (card.classList.contains("flipped") || card.classList.contains("matched")) return;

    card.classList.add("flipped");
    card.setAttribute("aria-label", `Card showing ${card.dataset.emoji}`);
    card.disabled = true;

    if (!memoryState.first) {
      memoryState.first = card;
      return;
    }

    memoryState.moves += 1;
    const first = memoryState.first;
    memoryState.first = null;
    updateMemoryStatus();

    if (first.dataset.emoji === card.dataset.emoji) {
      first.classList.add("matched");
      card.classList.add("matched");
      first.classList.remove("flipped");
      card.classList.remove("flipped");
      memoryState.matched += 1;
      updateMemoryStatus();
      if (memoryState.matched === memoryEmojis.length) finishMemory();
      return;
    }

    memoryState.lock = true;
    memoryStatus.textContent = "Not a pair — try to remember where they live.";
    memoryStatus.className = "game-status";
    window.setTimeout(() => {
      first.classList.remove("flipped");
      card.classList.remove("flipped");
      first.setAttribute("aria-label", "Hidden card");
      card.setAttribute("aria-label", "Hidden card");
      first.disabled = false;
      card.disabled = false;
      memoryState.lock = false;
      updateMemoryStatus();
    }, 780);
  }

  function startMemory() {
    Object.assign(memoryState, { first: null, lock: false, moves: 0, matched: 0 });
    memoryBoard.innerHTML = "";
    shuffle([...memoryEmojis, ...memoryEmojis]).forEach((emoji) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "mcard";
      card.dataset.emoji = emoji;
      card.setAttribute("aria-label", "Hidden card");
      card.innerHTML = `
        <span class="mcard-inner">
          <span class="mface back" aria-hidden="true">✦</span>
          <span class="mface front" aria-hidden="true">${emoji}</span>
        </span>
      `;
      card.addEventListener("click", () => flipMemory(card));
      memoryBoard.appendChild(card);
    });
    updateMemoryStatus();
    memoryStatus.textContent = "Tap two cards to find a matching pair.";
    memoryStatus.className = "game-status";
  }

  startMemory();
  $("#memory-restart").addEventListener("click", startMemory);

  /* ---------- Game 2: Math Sprint ---------- */

  const mathScoreLabel = $("#math-score");
  const mathBestLabel = $("#math-best");
  const mathQuestion = $("#math-question");
  const mathOptions = $("#math-options");
  const mathStatus = $("#math-status");
  const mathStart = $("#math-start");
  const mathBar = $("#math-timerbar");

  const mathState = {
    running: false,
    score: 0,
    timeLeft: 30000,
    answer: null,
    interval: null,
    questionLocked: false
  };

  function mathBestText() {
    const best = store.get("math-best", 0);
    return best > 0 ? `Best: ${best} pts` : "No best score yet.";
  }

  function resetMathBar() {
    mathBar.style.width = "100%";
  }

  function stopMathTimer() {
    if (mathState.interval !== null) {
      window.clearInterval(mathState.interval);
      mathState.interval = null;
    }
  }

  function endMath(message = true) {
    if (!mathState.running) return;
    mathState.running = false;
    stopMathTimer();
    mathState.questionLocked = true;
    mathStart.textContent = "Play again";
    $$(".math-option", mathOptions).forEach((btn) => { btn.disabled = true; });
    mathQuestion.textContent = `${mathState.score} point${mathState.score === 1 ? "" : "s"}!`;
    if (message) {
      mathStatus.textContent = mathState.score >= 10
        ? `Time! ${mathState.score} points — lightning brain. ⚡`
        : `Time! You scored ${mathState.score}. Try once more and beat it.`;
      mathStatus.className = mathState.score >= 10 ? "game-status win" : "game-status good";
    }
    mathBar.style.width = "0%";
    const best = store.get("math-best", 0);
    if (mathState.score > best) {
      store.set("math-best", mathState.score);
      mathBestLabel.textContent = mathBestText();
    }
  }

  function mathQuestionBuild() {
    mathState.questionLocked = false;
    mathOptions.innerHTML = "";

    const useMultiply = Math.random() < 0.3;
    let a;
    let b;
    let answer;
    let symbol;

    if (useMultiply) {
      a = Math.floor(Math.random() * 6) + 2;
      b = Math.floor(Math.random() * 8) + 2;
      answer = a * b;
      symbol = "×";
    } else {
      const adding = Math.random() < 0.55;
      if (adding) {
        a = Math.floor(Math.random() * 40) + 6;
        b = Math.floor(Math.random() * 40) + 4;
        answer = a + b;
        symbol = "+";
      } else {
        a = Math.floor(Math.random() * 40) + 20;
        b = Math.floor(Math.random() * 18) + 2;
        answer = a - b;
        symbol = "−";
      }
    }

    mathState.answer = answer;
    mathQuestion.textContent = `${a} ${symbol} ${b} = ?`;

    const options = new Set([answer]);
    while (options.size < 4) {
      const spread = useMultiply ? Math.max(3, Math.round(answer * 0.25)) : 9;
      const candidate = answer + (Math.floor(Math.random() * (spread * 2 + 1)) - spread);
      if (candidate >= 0 && candidate !== answer) options.add(candidate);
    }

    shuffle([...options]).forEach((value) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "math-option";
      button.textContent = value;
      button.addEventListener("click", () => chooseMath(button, value));
      mathOptions.appendChild(button);
    });
  }

  function chooseMath(button, value) {
    if (!mathState.running || mathState.questionLocked) return;
    mathState.questionLocked = true;

    if (value === mathState.answer) {
      mathState.score += 1;
      mathScoreLabel.textContent = `${mathState.score} pt${mathState.score === 1 ? "" : "s"}`;
      button.classList.add("correct");
      mathStatus.textContent = "Correct. Next one!";
      mathStatus.className = "game-status good";
      window.setTimeout(() => {
        if (!mathState.running) return;
        mathQuestionBuild();
        mathStatus.textContent = "Keep going — you have seconds left.";
      }, 320);
    } else {
      $$(".math-option", mathOptions).forEach((btn) => {
        btn.disabled = true;
        if (Number(btn.textContent) === mathState.answer) btn.classList.add("correct");
      });
      button.classList.add("wrong");
      mathStatus.textContent = `Not quite — it was ${mathState.answer}.`;
      mathStatus.className = "game-status";
      window.setTimeout(() => {
        if (!mathState.running) return;
        mathQuestionBuild();
      }, 850);
    }
  }

  function startMath() {
    stopMathTimer();
    if (mathState.running) return;

    mathState.running = true;
    mathState.score = 0;
    mathState.timeLeft = 30000;
    mathScoreLabel.textContent = "0 pts";
    mathStart.textContent = "Sprinting…";
    mathStatus.textContent = "Go go go!";
    mathStatus.className = "game-status good";
    resetMathBar();
    mathQuestionBuild();

    const started = Date.now();
    mathState.interval = window.setInterval(() => {
      const elapsed = Date.now() - started;
      mathState.timeLeft = Math.max(0, 30000 - elapsed);
      mathBar.style.width = `${(mathState.timeLeft / 30000) * 100}%`;
      if (mathState.timeLeft <= 0) endMath(true);
    }, 100);
  }

  mathBestLabel.textContent = mathBestText();
  mathStart.addEventListener("click", startMath);

  /* ---------- Game 3: Word Scramble ---------- */

  const scrambleList = [
    { word: "RAINBOW", hint: "Seven colours after the rain" },
    { word: "LIBRARY", hint: "A quiet kingdom of books" },
    { word: "PUZZLE", hint: "Pieces that click together" },
    { word: "PLANET", hint: "Earth is one" },
    { word: "SPARKLE", hint: "What a star does" },
    { word: "GENIUS", hint: "A very clever mind" },
    { word: "ORBIT", hint: "A path around a planet" },
    { word: "JUPITER", hint: "The biggest planet" },
    { word: "GALAXY", hint: "A city of stars" },
    { word: "KEYBOARD", hint: "Where your fingers dance" },
    { word: "MAGNET", hint: "It attracts" },
    { word: "GIRAFFE", hint: "The tallest animal" }
  ];

  const scrambleTiles = $("#scramble-tiles");
  const scrambleInput = $("#scramble-input");
  const scrambleHint = $("#scramble-hint");
  const scrambleStatus = $("#scramble-status");
  const scrambleSolvedLabel = $("#scramble-solved");

  const scrambleState = { index: 0, solved: 0, hintUsed: false };

  function scrambleLetters(word) {
    let letters = shuffle(word.split(""));
    let attempts = 0;
    while (attempts < 12 && letters.join("") === word) {
      letters = shuffle(word.split(""));
      attempts += 1;
    }
    return letters;
  }

  function renderScramble() {
    const entry = scrambleList[scrambleState.index];
    scrambleTiles.innerHTML = scrambleLetters(entry.word)
      .map((letter) => `<span class="letter-tile">${letter}</span>`)
      .join("");
    scrambleInput.value = "";
    scrambleHint.textContent = "";
    scrambleState.hintUsed = false;
    scrambleStatus.textContent = `${entry.word.length} letters. Press Enter or tap Check when you have it.`;
    scrambleStatus.className = "game-status";
  }

  function checkScramble() {
    const entry = scrambleList[scrambleState.index];
    const guess = scrambleInput.value.trim().toUpperCase().replace(/[^A-Z]/g, "");
    if (!guess) {
      scrambleStatus.textContent = "Type a word first — even a guess counts.";
      return;
    }
    if (guess === entry.word) {
      scrambleState.solved += 1;
      scrambleSolvedLabel.textContent = `${scrambleState.solved} solved`;
      scrambleStatus.textContent = scrambleState.hintUsed
        ? `Yes! ${entry.word} — with a little help. 🌟`
        : `Yes! ${entry.word} — all by yourself. 🌟`;
      scrambleStatus.className = "game-status win";
      scrambleInput.value = "";
      window.setTimeout(() => {
        scrambleState.index = (scrambleState.index + 1) % scrambleList.length;
        renderScramble();
      }, 1100);
    } else {
      scrambleStatus.textContent = `Not ${guess}. Try rearranging the tiles.`;
      scrambleStatus.className = "game-status";
      scrambleInput.focus();
      scrambleInput.select();
    }
  }

  $("#scramble-next").addEventListener("click", () => {
    scrambleState.index = (scrambleState.index + 1) % scrambleList.length;
    renderScramble();
  });

  $("#scramble-hintbtn").addEventListener("click", () => {
    scrambleState.hintUsed = true;
    scrambleHint.textContent = `Hint: ${scrambleList[scrambleState.index].hint}.`;
  });

  $("#scramble-check").addEventListener("click", checkScramble);
  scrambleInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      checkScramble();
    }
  });

  renderScramble();

  /* ---------- Game 4: Flag Detective ---------- */

  const flagCountries = [
    { code: "ph", name: "Philippines" },
    { code: "jp", name: "Japan" },
    { code: "kr", name: "South Korea" },
    { code: "cn", name: "China" },
    { code: "in", name: "India" },
    { code: "th", name: "Thailand" },
    { code: "vn", name: "Vietnam" },
    { code: "id", name: "Indonesia" },
    { code: "my", name: "Malaysia" },
    { code: "sg", name: "Singapore" },
    { code: "au", name: "Australia" },
    { code: "nz", name: "New Zealand" },
    { code: "us", name: "United States" },
    { code: "ca", name: "Canada" },
    { code: "mx", name: "Mexico" },
    { code: "br", name: "Brazil" },
    { code: "ar", name: "Argentina" },
    { code: "gb", name: "United Kingdom" },
    { code: "fr", name: "France" },
    { code: "de", name: "Germany" },
    { code: "it", name: "Italy" },
    { code: "es", name: "Spain" },
    { code: "pt", name: "Portugal" },
    { code: "nl", name: "Netherlands" },
    { code: "se", name: "Sweden" },
    { code: "no", name: "Norway" },
    { code: "ch", name: "Switzerland" },
    { code: "gr", name: "Greece" },
    { code: "tr", name: "Turkey" },
    { code: "eg", name: "Egypt" },
    { code: "za", name: "South Africa" },
    { code: "ke", name: "Kenya" },
    { code: "ng", name: "Nigeria" },
    { code: "sa", name: "Saudi Arabia" },
    { code: "ae", name: "United Arab Emirates" },
    { code: "ru", name: "Russia" },
    { code: "ua", name: "Ukraine" },
    { code: "pl", name: "Poland" },
    { code: "ie", name: "Ireland" },
    { code: "at", name: "Austria" },
    { code: "dk", name: "Denmark" },
    { code: "fi", name: "Finland" },
    { code: "is", name: "Iceland" },
    { code: "be", name: "Belgium" }
  ];

  const flagImageEl = $("#flag-image");
  const flagPlaceholder = $("#flag-placeholder");
  const flagProgress = $("#flag-progress");
  const flagOptions = $("#flag-options");
  const flagScore = $("#flag-score");
  const flagStatus = $("#flag-status");
  const flagStart = $("#flag-start");
  const flagReview = $("#flag-review");

  const flagState = {
    playing: false,
    locked: false,
    round: 0,
    score: 0,
    questions: [],
    timer: null
  };

  const flagUrl = (code, width = 320) => `https://flagcdn.com/w${width}/${code}.png`;

  function startFlagGame() {
    if (flagState.timer !== null) {
      window.clearTimeout(flagState.timer);
      flagState.timer = null;
    }
    flagState.playing = true;
    flagState.locked = false;
    flagState.round = 0;
    flagState.score = 0;
    flagState.questions = shuffle(flagCountries).slice(0, 10).map((country) => {
      const distractors = shuffle(flagCountries.filter((entry) => entry.code !== country.code)).slice(0, 3);
      return { country, choices: shuffle([country, ...distractors]), chosen: null };
    });
    flagScore.textContent = "0 / 10";
    flagStart.textContent = "Restart challenge";
    flagReview.hidden = true;
    flagReview.innerHTML = "";
    flagStatus.textContent = "Which country does this flag belong to?";
    flagStatus.className = "game-status";
    renderFlagQuestion();
  }

  function renderFlagQuestion() {
    const question = flagState.questions[flagState.round];
    if (!question) return;
    flagState.locked = false;
    flagImageEl.src = flagUrl(question.country.code);
    flagImageEl.alt = "Mystery flag";
    flagImageEl.hidden = false;
    flagPlaceholder.hidden = true;
    flagProgress.textContent = `Flag ${flagState.round + 1} of 10`;
    flagOptions.innerHTML = question.choices.map((country, index) => `
      <button class="flag-option" type="button" data-index="${index}">${esc(country.name)}</button>
    `).join("");
    $$(".flag-option", flagOptions).forEach((button) => {
      button.addEventListener("click", () => chooseFlag(Number(button.dataset.index)));
    });
  }

  function chooseFlag(index) {
    if (!flagState.playing || flagState.locked) return;
    flagState.locked = true;
    const question = flagState.questions[flagState.round];
    const selected = question.choices[index];
    const isCorrect = selected.code === question.country.code;
    question.chosen = index;
    if (isCorrect) flagState.score += 1;
    flagScore.textContent = `${flagState.score} / 10`;
    $$(".flag-option", flagOptions).forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === index) button.classList.add("is-chosen");
    });
    flagStatus.textContent = "Guess saved. Next flag…";
    flagStatus.className = "game-status good";
    flagState.timer = window.setTimeout(() => {
      flagState.timer = null;
      if (!flagState.playing) return;
      if (flagState.round >= flagState.questions.length - 1) {
        finishFlagGame();
        return;
      }
      flagState.round += 1;
      renderFlagQuestion();
    }, 500);
  }

  function finishFlagGame() {
    flagState.playing = false;
    flagState.locked = true;
    flagImageEl.hidden = true;
    flagPlaceholder.hidden = false;
    flagPlaceholder.innerHTML = '<span aria-hidden="true">🏁</span><small>All 10 flags</small>';
    flagProgress.textContent = `You named ${flagState.score} of 10`;
    flagOptions.innerHTML = "";
    flagStart.textContent = "Play again";
    const message = flagState.score >= 8
      ? "Flag master!"
      : flagState.score >= 5
        ? "Sharp eyes!"
        : "Every flag is a new place to learn.";
    flagStatus.textContent = `${message} You got ${flagState.score} of 10. The correct answers are below.`;
    flagStatus.className = flagState.score >= 8 ? "game-status win" : "game-status good";
    flagReview.hidden = false;
    flagReview.innerHTML = `
      <h4>Correct answers</h4>
      <div class="flag-review-grid">
        ${flagState.questions.map((question, index) => {
          const chosen = question.choices[question.chosen];
          const isCorrect = chosen.code === question.country.code;
          return `
            <div class="flag-review-row ${isCorrect ? "is-correct" : "is-wrong"}">
              <img src="${flagUrl(question.country.code, 80)}" alt="${esc(question.country.name)} flag" width="38" height="26" loading="lazy" decoding="async" />
              <div>
                <strong>${index + 1}. ${esc(question.country.name)}</strong>
                <span>Your guess: ${esc(chosen.name)} ${isCorrect ? "✓" : "✕"}</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  flagStart.addEventListener("click", startFlagGame);


  /* ---------- Game 5: Pattern Path ---------- */

  const patternSequenceEl = $("#pattern-sequence");
  const patternProgress = $("#pattern-progress");
  const patternOptions = $("#pattern-options");
  const patternScore = $("#pattern-score");
  const patternFeedback = $("#pattern-feedback");
  const patternStart = $("#pattern-start");
  const patternNext = $("#pattern-next");
  const patternReview = $("#pattern-review");

  const patternState = {
    playing: false,
    locked: false,
    answered: false,
    round: 0,
    score: 0,
    questions: []
  };

  function patternChoices(answer) {
    const values = [answer];
    for (const offset of [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 10, -10]) {
      const candidate = answer + offset;
      if (candidate >= 0 && !values.includes(candidate)) values.push(candidate);
      if (values.length === 4) break;
    }
    let extra = 1;
    while (values.length < 4) {
      if (!values.includes(answer + extra)) values.push(answer + extra);
      extra += 1;
    }
    return values;
  }

  function makePatternQuestion() {
    const type = Math.floor(Math.random() * 4);
    if (type === 0) {
      const start = 1 + Math.floor(Math.random() * 12);
      const step = 2 + Math.floor(Math.random() * 8);
      return {
        sequence: [start, start + step, start + 2 * step, start + 3 * step],
        answer: start + 4 * step,
        rule: `Add ${step} each time.`
      };
    }
    if (type === 1) {
      const start = 1 + Math.floor(Math.random() * 3);
      const factor = 2 + Math.floor(Math.random() * 2);
      return {
        sequence: [start, start * factor, start * factor ** 2, start * factor ** 3],
        answer: start * factor ** 4,
        rule: `Multiply by ${factor} each time.`
      };
    }
    if (type === 2) {
      const start = 1 + Math.floor(Math.random() * 8);
      const first = 2 + Math.floor(Math.random() * 4);
      let second = 1 + Math.floor(Math.random() * 4);
      if (second === first) second += 1;
      return {
        sequence: [start, start + first, start + first + second, start + 2 * first + second],
        answer: start + 2 * first + 2 * second,
        rule: `Add ${first}, then ${second}, and repeat.`
      };
    }
    const start = 1 + Math.floor(Math.random() * 4);
    return {
      sequence: [start * start, (start + 1) ** 2, (start + 2) ** 2, (start + 3) ** 2],
      answer: (start + 4) ** 2,
      rule: "These are square numbers."
    };
  }

  function startPatternGame() {
    const questions = [];
    const seen = new Set();
    let attempts = 0;
    while (questions.length < 8 && attempts < 300) {
      const question = makePatternQuestion();
      const key = question.sequence.join(",");
      attempts += 1;
      if (seen.has(key)) continue;
      seen.add(key);
      const choices = shuffle(patternChoices(question.answer));
      questions.push({ ...question, choices, chosen: null });
    }
    let fallback = 1;
    while (questions.length < 8) {
      const step = 2 + (fallback % 5);
      const start = fallback * 4 + 1;
      const sequence = [start, start + step, start + 2 * step, start + 3 * step];
      const key = sequence.join(",");
      if (!seen.has(key)) {
        seen.add(key);
        const answer = start + 4 * step;
        questions.push({
          sequence,
          answer,
          rule: `Add ${step} each time.`,
          choices: shuffle(patternChoices(answer)),
          chosen: null
        });
      }
      fallback += 1;
    }
    Object.assign(patternState, { playing: true, locked: false, answered: false, round: 0, score: 0, questions });
    patternScore.textContent = "0 / 8";
    patternStart.textContent = "Restart puzzles";
    patternFeedback.textContent = "Find the rule and choose what comes next.";
    patternFeedback.className = "logic-feedback";
    patternReview.hidden = true;
    patternReview.innerHTML = "";
    renderPatternQuestion();
  }

  function renderPatternQuestion() {
    const question = patternState.questions[patternState.round];
    if (!question) return;
    patternState.locked = false;
    patternState.answered = false;
    patternProgress.textContent = `Puzzle ${patternState.round + 1} of 8`;
    patternSequenceEl.innerHTML = [
      ...question.sequence.map((value) => `<span class="pattern-tile">${value}</span>`),
      '<span class="pattern-tile is-missing">?</span>'
    ].join("");
    patternOptions.innerHTML = question.choices.map((value, index) => `
      <button class="logic-option" type="button" data-index="${index}">${value}</button>
    `).join("");
    $$(".logic-option", patternOptions).forEach((button) => {
      button.addEventListener("click", () => choosePattern(Number(button.dataset.index)));
    });
    patternNext.hidden = true;
    patternFeedback.textContent = "What comes next?";
    patternFeedback.className = "logic-feedback";
  }

  function choosePattern(index) {
    if (!patternState.playing || patternState.locked) return;
    patternState.locked = true;
    patternState.answered = true;
    const question = patternState.questions[patternState.round];
    const selected = question.choices[index];
    const correct = selected === question.answer;
    question.chosen = index;
    if (correct) patternState.score += 1;
    patternScore.textContent = `${patternState.score} / 8`;
    $$(".logic-option", patternOptions).forEach((button, buttonIndex) => {
      button.disabled = true;
      if (question.choices[buttonIndex] === question.answer) button.classList.add("is-correct");
      if (buttonIndex === index && !correct) button.classList.add("is-wrong");
    });
    patternFeedback.textContent = correct
      ? `Correct! ${question.rule}`
      : `Not quite. ${question.rule} The answer is ${question.answer}.`;
    patternFeedback.className = `logic-feedback ${correct ? "is-good" : "is-bad"}`;
    patternNext.hidden = false;
    patternNext.textContent = patternState.round === patternState.questions.length - 1 ? "See answers →" : "Next puzzle →";
  }

  function advancePattern() {
    if (!patternState.playing || !patternState.answered) return;
    if (patternState.round >= patternState.questions.length - 1) {
      finishPatternGame();
      return;
    }
    patternState.round += 1;
    renderPatternQuestion();
  }

  function finishPatternGame() {
    patternState.playing = false;
    patternState.locked = true;
    patternState.answered = false;
    patternOptions.innerHTML = "";
    patternNext.hidden = true;
    patternStart.textContent = "Play again";
    patternSequenceEl.innerHTML = '<span class="logic-idle">All 8 patterns solved. Answers below.</span>';
    patternProgress.textContent = "8 of 8 solved";
    const message = patternState.score >= 7
      ? "Pattern master!"
      : patternState.score >= 5
        ? "Sharp thinking!"
        : "Patterns are rules in disguise. Try again!";
    patternFeedback.textContent = `${message} You solved ${patternState.score} of 8.`;
    patternFeedback.className = patternState.score >= 7 ? "logic-feedback is-good" : "logic-feedback";
    patternReview.hidden = false;
    patternReview.innerHTML = `
      <h4>Pattern answers</h4>
      <div class="logic-review-list">
        ${patternState.questions.map((question, index) => {
          const chosen = question.chosen === null ? "—" : question.choices[question.chosen];
          const correct = question.chosen !== null && question.choices[question.chosen] === question.answer;
          return `
            <div class="logic-review-row ${correct ? "is-correct" : "is-wrong"}">
              <span class="logic-review-num">${index + 1}</span>
              <div>
                <strong>${question.sequence.join(" → ")} → ${question.answer}</strong>
                <span>Your answer: ${chosen}. ${question.rule}</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  patternStart.addEventListener("click", startPatternGame);
  patternNext.addEventListener("click", advancePattern);


  /* ---------- Game 6: Odd One Out ---------- */

  const oddPuzzles = [
    { items: ["Apple", "Banana", "Carrot", "Mango"], odd: "Carrot", reason: "A carrot is a vegetable; the others are fruits." },
    { items: ["Circle", "Square", "Triangle", "Cube"], odd: "Cube", reason: "A cube is 3D; the others are flat shapes." },
    { items: ["Dog", "Cat", "Eagle", "Cow"], odd: "Eagle", reason: "An eagle is a bird; the others are mammals." },
    { items: ["2", "4", "6", "9"], odd: "9", reason: "9 is odd; the others are even." },
    { items: ["Red", "Blue", "Green", "Circle"], odd: "Circle", reason: "A circle is a shape; the others are colors." },
    { items: ["Rose", "Tulip", "Daisy", "Oak"], odd: "Oak", reason: "An oak is a tree; the others are flowers." },
    { items: ["Piano", "Guitar", "Violin", "Drum"], odd: "Drum", reason: "A drum is percussion; the others are string instruments." },
    { items: ["Eyes", "Ears", "Nose", "Gloves"], odd: "Gloves", reason: "Gloves are clothing; the others are body parts." },
    { items: ["Manila", "Cebu", "Davao", "Tokyo"], odd: "Tokyo", reason: "Tokyo is in Japan; the others are cities in the Philippines." },
    { items: ["Mercury", "Venus", "Earth", "Moon"], odd: "Moon", reason: "The Moon is a moon; the others are planets." },
    { items: ["Triangle", "Square", "Rectangle", "Sphere"], odd: "Sphere", reason: "A sphere is 3D; the others are flat shapes." },
    { items: ["3", "5", "7", "9"], odd: "9", reason: "9 is composite; 3, 5, and 7 are prime." },
    { items: ["Happy", "Joyful", "Glad", "Angry"], odd: "Angry", reason: "Angry is not a synonym for happy." },
    { items: ["Book", "Pencil", "Notebook", "Spoon"], odd: "Spoon", reason: "A spoon is not a school supply." },
    { items: ["Basketball", "Soccer", "Tennis", "Chess"], odd: "Chess", reason: "Chess is a board game; the others are sports." },
    { items: ["Luzon", "Visayas", "Mindanao", "Palawan"], odd: "Palawan", reason: "Palawan is an island; the others are the three main island groups of the Philippines." },
    { items: ["Peso", "Yen", "Dollar", "Manila"], odd: "Manila", reason: "Manila is a city; the others are currencies." },
    { items: ["Rain", "Snow", "Hail", "Sunshine"], odd: "Sunshine", reason: "Sunshine is not precipitation; the others fall from clouds." }
  ];

  const oddPrompt = $("#odd-prompt");
  const oddProgress = $("#odd-progress");
  const oddOptions = $("#odd-options");
  const oddScore = $("#odd-score");
  const oddFeedback = $("#odd-feedback");
  const oddStart = $("#odd-start");
  const oddNext = $("#odd-next");
  const oddReview = $("#odd-review");

  const oddState = {
    playing: false,
    locked: false,
    answered: false,
    round: 0,
    score: 0,
    questions: []
  };

  function startOddGame() {
    const questions = shuffle(oddPuzzles).slice(0, 8).map((puzzle) => {
      const items = shuffle([...puzzle.items]);
      return {
        items,
        odd: puzzle.odd,
        reason: puzzle.reason,
        answerIndex: items.indexOf(puzzle.odd),
        chosen: null
      };
    });
    Object.assign(oddState, { playing: true, locked: false, answered: false, round: 0, score: 0, questions });
    oddScore.textContent = "0 / 8";
    oddStart.textContent = "Restart puzzles";
    oddPrompt.textContent = "Which one doesn't belong?";
    oddFeedback.textContent = "Choose the item that breaks the pattern.";
    oddFeedback.className = "logic-feedback";
    oddReview.hidden = true;
    oddReview.innerHTML = "";
    renderOddQuestion();
  }

  function renderOddQuestion() {
    const question = oddState.questions[oddState.round];
    if (!question) return;
    oddState.locked = false;
    oddState.answered = false;
    oddProgress.textContent = `Puzzle ${oddState.round + 1} of 8`;
    oddOptions.innerHTML = question.items.map((item, index) => `
      <button class="logic-option" type="button" data-index="${index}">${esc(item)}</button>
    `).join("");
    $$(".logic-option", oddOptions).forEach((button) => {
      button.addEventListener("click", () => chooseOdd(Number(button.dataset.index)));
    });
    oddNext.hidden = true;
    oddFeedback.textContent = "Which item is the odd one out?";
    oddFeedback.className = "logic-feedback";
  }

  function chooseOdd(index) {
    if (!oddState.playing || oddState.locked) return;
    oddState.locked = true;
    oddState.answered = true;
    const question = oddState.questions[oddState.round];
    const correct = index === question.answerIndex;
    question.chosen = index;
    if (correct) oddState.score += 1;
    oddScore.textContent = `${oddState.score} / 8`;
    $$(".logic-option", oddOptions).forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === question.answerIndex) button.classList.add("is-correct");
      if (buttonIndex === index && !correct) button.classList.add("is-wrong");
    });
    oddFeedback.textContent = correct
      ? `Correct! ${question.reason}`
      : `Not quite. ${question.reason}`;
    oddFeedback.className = `logic-feedback ${correct ? "is-good" : "is-bad"}`;
    oddNext.hidden = false;
    oddNext.textContent = oddState.round === oddState.questions.length - 1 ? "See answers →" : "Next puzzle →";
  }

  function advanceOdd() {
    if (!oddState.playing || !oddState.answered) return;
    if (oddState.round >= oddState.questions.length - 1) {
      finishOddGame();
      return;
    }
    oddState.round += 1;
    renderOddQuestion();
  }

  function finishOddGame() {
    oddState.playing = false;
    oddState.locked = true;
    oddState.answered = false;
    oddOptions.innerHTML = "";
    oddNext.hidden = true;
    oddStart.textContent = "Play again";
    oddPrompt.textContent = "All 8 puzzles solved";
    oddProgress.textContent = "8 of 8 solved";
    const message = oddState.score >= 7
      ? "Logic master!"
      : oddState.score >= 5
        ? "Sharp eyes!"
        : "Every puzzle teaches you a new rule. Try again!";
    oddFeedback.textContent = `${message} You solved ${oddState.score} of 8.`;
    oddFeedback.className = oddState.score >= 7 ? "logic-feedback is-good" : "logic-feedback";
    oddReview.hidden = false;
    oddReview.innerHTML = `
      <h4>Odd-one-out answers</h4>
      <div class="logic-review-list">
        ${oddState.questions.map((question, index) => {
          const chosen = question.chosen === null ? "—" : question.items[question.chosen];
          const correct = question.chosen === question.answerIndex;
          return `
            <div class="logic-review-row ${correct ? "is-correct" : "is-wrong"}">
              <span class="logic-review-num">${index + 1}</span>
              <div>
                <strong>Odd one out: ${esc(question.odd)}</strong>
                <span>${esc(question.reason)} Your answer: ${esc(chosen)}.</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  oddStart.addEventListener("click", startOddGame);
  oddNext.addEventListener("click", advanceOdd);


  /* ---------- Game 7: Moonbase Manager ---------- */

  const moonSol = $("#moon-sol");
  const moonStart = $("#moon-start");
  const moonNext = $("#moon-next");
  const moonStatus = $("#moon-status");
  const moonLog = $("#moon-log");
  const moonActions = $("#moon-actions");
  const moonReview = $("#moon-review");

  const moonResourcesList = ["oxygen", "food", "energy"];
  const moonResourceEls = {
    oxygen: { value: $("#moon-oxygen"), bar: $("#moon-oxygen-bar"), card: $("#moon-oxygen-card") },
    food: { value: $("#moon-food"), bar: $("#moon-food-bar"), card: $("#moon-food-card") },
    energy: { value: $("#moon-energy"), bar: $("#moon-energy-bar"), card: $("#moon-energy-card") }
  };

  const moonActionsList = [
    { id: "food", label: "Plant crops", note: "+3 food · −1 energy", delta: { food: 3, energy: -1 } },
    { id: "oxygen", label: "Run scrubbers", note: "+3 oxygen · −1 food", delta: { oxygen: 3, food: -1 } },
    { id: "energy", label: "Charge cells", note: "+3 energy · −1 oxygen", delta: { energy: 3, oxygen: -1 } }
  ];

  const moonEvents = [
    { text: "A dust storm drains the batteries.", note: "−2 energy", delta: { energy: -2 } },
    { text: "A tiny meteor punctures an air line.", note: "−2 oxygen", delta: { oxygen: -2 } },
    { text: "The hydroponics bay blooms.", note: "+2 food", delta: { food: 2 } },
    { text: "A solar flare overloads the grid.", note: "−1 oxygen, −1 energy", delta: { oxygen: -1, energy: -1 } },
    { text: "A supply pod lands nearby.", note: "+1 to every supply", delta: { oxygen: 1, food: 1, energy: 1 } },
    { text: "A quiet sol passes on the base.", note: "No change", delta: {} },
    { text: "The recycler needs a reset.", note: "−1 oxygen", delta: { oxygen: -1 } },
    { text: "The crew finds an ice pocket.", note: "+1 oxygen", delta: { oxygen: 1 } },
    { text: "A micrometeorite chips a solar panel.", note: "−1 energy", delta: { energy: -1 } },
    { text: "The crew shares a morale-boosting meal.", note: "−1 food", delta: { food: -1 } }
  ];

  const moonState = {
    playing: false,
    locked: false,
    awaitingNext: false,
    sol: 0,
    resources: { oxygen: 6, food: 6, energy: 6 },
    log: []
  };

  function moonClamp(value) {
    return Math.max(0, Math.min(12, value));
  }

  function moonApplyDelta(delta) {
    moonResourcesList.forEach((key) => {
      moonState.resources[key] = moonClamp(moonState.resources[key] + Number(delta[key] || 0));
    });
  }

  function renderMoonResources() {
    moonResourcesList.forEach((key) => {
      const value = moonState.resources[key];
      const refs = moonResourceEls[key];
      refs.value.textContent = String(value);
      refs.bar.style.width = `${(value / 12) * 100}%`;
      refs.card.classList.toggle("is-low", value <= 2);
    });
  }

  function renderMoonLog() {
    const entries = moonState.log.slice(-4);
    moonLog.innerHTML = entries.length
      ? entries.map((entry) => `<p class="${entry.type}">${esc(entry.text)}</p>`).join("")
      : "Choose an action to begin Sol 1.";
  }

  function renderMoonActions() {
    moonActions.innerHTML = moonActionsList.map((action) => `
      <button class="moon-action" type="button" data-action="${action.id}">
        <strong>${action.label}</strong>
        <small>${action.note}</small>
      </button>
    `).join("");
    $$(".moon-action", moonActions).forEach((button) => {
      button.addEventListener("click", () => chooseMoonAction(button.dataset.action));
    });
  }

  function startMoonGame() {
    Object.assign(moonState, {
      playing: true,
      locked: false,
      awaitingNext: false,
      sol: 0,
      resources: { oxygen: 6, food: 6, energy: 6 },
      log: []
    });
    moonSol.textContent = "Sol 1 / 8";
    moonStart.textContent = "Restart mission";
    moonNext.hidden = true;
    moonReview.hidden = true;
    moonReview.innerHTML = "";
    moonStatus.textContent = "Choose one action for Sol 1.";
    moonStatus.className = "game-status";
    renderMoonResources();
    renderMoonLog();
    renderMoonActions();
  }

  function chooseMoonAction(actionId) {
    if (!moonState.playing || moonState.locked) return;
    const action = moonActionsList.find((entry) => entry.id === actionId);
    if (!action) return;
    moonState.locked = true;
    const solNumber = moonState.sol + 1;

    moonApplyDelta(action.delta);
    moonState.log.push({ type: "log-action", text: `Sol ${solNumber}: ${action.label} (${action.note}).` });

    const event = moonEvents[Math.floor(Math.random() * moonEvents.length)];
    moonApplyDelta(event.delta);
    moonState.log.push({ type: "log-event", text: `Event: ${event.text} ${event.note}.` });
    moonState.awaitingNext = true;

    renderMoonResources();
    $$(".moon-action", moonActions).forEach((button) => {
      button.disabled = true;
      if (button.dataset.action === action.id) button.classList.add("is-chosen");
    });

    const lost = moonResourcesList.some((key) => moonState.resources[key] <= 0);
    if (lost) {
      finishMoonGame(false);
      return;
    }
    if (moonState.sol >= 7) {
      finishMoonGame(true);
      return;
    }

    moonNext.hidden = false;
    moonStatus.textContent = "Action logged. Review the event, then continue.";
    moonStatus.className = "game-status good";
    renderMoonLog();
  }

  function advanceMoon() {
    if (!moonState.playing || !moonState.awaitingNext) return;
    moonState.sol += 1;
    moonState.awaitingNext = false;
    moonState.locked = false;
    moonNext.hidden = true;
    moonSol.textContent = `Sol ${moonState.sol + 1} / 8`;
    moonStatus.textContent = `Choose one action for Sol ${moonState.sol + 1}.`;
    moonStatus.className = "game-status";
    renderMoonActions();
  }

  function finishMoonGame(success) {
    moonState.playing = false;
    moonState.locked = true;
    moonState.awaitingNext = false;
    moonNext.hidden = true;
    moonStart.textContent = "Play again";
    $$(".moon-action", moonActions).forEach((button) => { button.disabled = true; });

    const survived = success ? 8 : moonState.sol + 1;
    const supplies = moonState.resources.oxygen + moonState.resources.food + moonState.resources.energy;
    const score = survived * 10 + supplies;
    const title = success ? "Mission complete" : `Base lost on Sol ${survived}`;

    moonSol.textContent = `Sol ${survived} / 8`;
    moonState.log.push({
      type: success ? "log-action" : "log-alert",
      text: success ? "Mission complete: the base survived all eight sols." : `Base lost on Sol ${survived}.`
    });
    renderMoonResources();
    renderMoonLog();

    moonStatus.textContent = success
      ? `Mission complete! The crew survived all eight sols with a score of ${score}.`
      : `A critical supply ran out on Sol ${survived}. Mission score: ${score}.`;
    moonStatus.className = success ? "game-status win" : "game-status";
    moonReview.hidden = false;
    moonReview.innerHTML = `
      <h4>Mission report</h4>
      <div class="logic-review-list">
        <div class="logic-review-row ${success ? "is-correct" : "is-wrong"}">
          <span class="logic-review-num">${success ? "✓" : "!"}</span>
          <div>
            <strong>${title}</strong>
            <span>Final supplies — oxygen ${moonState.resources.oxygen}, food ${moonState.resources.food}, energy ${moonState.resources.energy}. Score: ${score}. ${success ? "Your resource planning kept the colony alive." : "Watch the lowest supply and replenish it before it empties."}</span>
          </div>
        </div>
      </div>
    `;
  }

  moonStart.addEventListener("click", startMoonGame);
  moonNext.addEventListener("click", advanceMoon);


  /* ---------- Game 8: Riddle & Trivia ---------- */

  const riddleRiddles = [
    { type: "Riddle", prompt: "What has keys but can't open locks?", choices: ["A piano", "A map", "A clock", "A book"], answer: "A piano", explanation: "A piano has keys you press, not keys for locks." },
    { type: "Riddle", prompt: "What has hands but can't clap?", choices: ["A clock", "A river", "A chair", "A candle"], answer: "A clock", explanation: "A clock's hands point to the time." },
    { type: "Riddle", prompt: "What gets wetter the more it dries?", choices: ["A towel", "A sponge", "A cloud", "A mirror"], answer: "A towel", explanation: "A towel absorbs water as it dries things." },
    { type: "Riddle", prompt: "What has many teeth but never bites?", choices: ["A comb", "A saw", "A zipper", "A fork"], answer: "A comb", explanation: "A comb's teeth are for hair, not biting." },
    { type: "Riddle", prompt: "What has a head, a tail, but no body?", choices: ["A coin", "A snake", "A kite", "A pencil"], answer: "A coin", explanation: "A coin has heads and tails." },
    { type: "Riddle", prompt: "What has one eye but cannot see?", choices: ["A needle", "A potato", "A camera", "A storm"], answer: "A needle", explanation: "A needle has an eye for thread." },
    { type: "Riddle", prompt: "What can travel around the world while staying in a corner?", choices: ["A stamp", "A map", "A clock", "A mirror"], answer: "A stamp", explanation: "A stamp travels on mail from its corner." },
    { type: "Riddle", prompt: "What has legs but doesn't walk?", choices: ["A table", "A spider", "A bird", "A robot"], answer: "A table", explanation: "A table has legs that hold it up." },
    { type: "Riddle", prompt: "What goes up but never comes down?", choices: ["Your age", "A balloon", "A rocket", "A kite"], answer: "Your age", explanation: "Your age only increases." },
    { type: "Riddle", prompt: "What has words but never speaks?", choices: ["A book", "A radio", "A parrot", "A phone"], answer: "A book", explanation: "A book uses words without a voice." },
    { type: "Riddle", prompt: "What has a neck but no head?", choices: ["A bottle", "A giraffe", "A shirt", "A guitar"], answer: "A bottle", explanation: "A bottle has a neck but no head." },
    { type: "Riddle", prompt: "What is full of holes but still holds water?", choices: ["A sponge", "A net", "A basket", "A sieve"], answer: "A sponge", explanation: "A sponge is porous but absorbs water." }
  ];

  const riddleTrivia = [
    { type: "Trivia", prompt: "Which planet is known as the Red Planet?", choices: ["Mars", "Venus", "Jupiter", "Mercury"], answer: "Mars", explanation: "Mars looks red because of iron oxide in its soil." },
    { type: "Trivia", prompt: "What is the capital of the Philippines?", choices: ["Manila", "Cebu", "Davao", "Baguio"], answer: "Manila", explanation: "Manila is the capital city of the Philippines." },
    { type: "Trivia", prompt: "Who wrote Noli Me Tangere?", choices: ["Jose Rizal", "Andres Bonifacio", "Emilio Aguinaldo", "Lope K. Santos"], answer: "Jose Rizal", explanation: "Jose Rizal wrote the novel Noli Me Tangere." },
    { type: "Trivia", prompt: "What is the largest ocean on Earth?", choices: ["Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], answer: "Pacific Ocean", explanation: "The Pacific is the largest and deepest ocean." },
    { type: "Trivia", prompt: "How many continents are there?", choices: ["7", "5", "6", "8"], answer: "7", explanation: "There are seven continents." },
    { type: "Trivia", prompt: "What is H2O?", choices: ["Water", "Salt", "Sugar", "Oxygen"], answer: "Water", explanation: "H2O is the chemical formula for water." },
    { type: "Trivia", prompt: "Which is the fastest land animal?", choices: ["Cheetah", "Lion", "Horse", "Gazelle"], answer: "Cheetah", explanation: "A cheetah can sprint faster than any other land animal." },
    { type: "Trivia", prompt: "What is the national bird of the Philippines?", choices: ["Philippine eagle", "Maya", "Parrot", "Dove"], answer: "Philippine eagle", explanation: "The Philippine eagle is the country's national bird." },
    { type: "Trivia", prompt: "Which ancient civilization is credited with inventing paper?", choices: ["China", "Egypt", "Greece", "Rome"], answer: "China", explanation: "Papermaking was developed in ancient China." },
    { type: "Trivia", prompt: "What is the longest river in the world?", choices: ["Nile", "Amazon", "Yangtze", "Mississippi"], answer: "Nile", explanation: "The Nile is traditionally considered the longest river." },
    { type: "Trivia", prompt: "Which is the largest planet in our solar system?", choices: ["Jupiter", "Saturn", "Neptune", "Earth"], answer: "Jupiter", explanation: "Jupiter is the largest planet in the solar system." },
    { type: "Trivia", prompt: "What does ASEAN stand for?", choices: ["Association of Southeast Asian Nations", "Asian Sports and Education Network", "Alliance of South East African Nations", "Association of Southern European and Asian Nations"], answer: "Association of Southeast Asian Nations", explanation: "ASEAN is the Association of Southeast Asian Nations." }
  ];

  const riddleType = $("#riddle-type");
  const riddleProgress = $("#riddle-progress");
  const riddlePrompt = $("#riddle-prompt");
  const riddleOptions = $("#riddle-options");
  const riddleScore = $("#riddle-score");
  const riddleFeedback = $("#riddle-feedback");
  const riddleStart = $("#riddle-start");
  const riddleNext = $("#riddle-next");
  const riddleReview = $("#riddle-review");

  const riddleState = {
    playing: false,
    locked: false,
    answered: false,
    round: 0,
    score: 0,
    questions: []
  };

  function startRiddleGame() {
    const questions = shuffle([
      ...shuffle(riddleRiddles).slice(0, 5),
      ...shuffle(riddleTrivia).slice(0, 5)
    ]).map((question) => {
      const choices = shuffle([...question.choices]);
      return { ...question, choices, answerIndex: choices.indexOf(question.answer), chosen: null };
    });
    Object.assign(riddleState, { playing: true, locked: false, answered: false, round: 0, score: 0, questions });
    riddleScore.textContent = "0 / 10";
    riddleStart.textContent = "Restart challenge";
    riddleReview.hidden = true;
    riddleReview.innerHTML = "";
    riddleType.textContent = "Ready";
    riddleType.classList.remove("is-trivia");
    renderRiddleQuestion();
  }

  function renderRiddleQuestion() {
    const question = riddleState.questions[riddleState.round];
    if (!question) return;
    riddleState.locked = false;
    riddleState.answered = false;
    riddleType.textContent = question.type;
    riddleType.classList.toggle("is-trivia", question.type === "Trivia");
    riddleProgress.textContent = `Challenge ${riddleState.round + 1} of 10`;
    riddlePrompt.textContent = question.prompt;
    riddleOptions.innerHTML = question.choices.map((choice, index) => `
      <button class="logic-option" type="button" data-index="${index}">${esc(choice)}</button>
    `).join("");
    $$(".logic-option", riddleOptions).forEach((button) => {
      button.addEventListener("click", () => chooseRiddle(Number(button.dataset.index)));
    });
    riddleNext.hidden = true;
    riddleFeedback.textContent = question.type === "Riddle" ? "Think sideways." : "Choose the best answer.";
    riddleFeedback.className = "logic-feedback";
  }

  function chooseRiddle(index) {
    if (!riddleState.playing || riddleState.locked) return;
    riddleState.locked = true;
    riddleState.answered = true;
    const question = riddleState.questions[riddleState.round];
    const correct = index === question.answerIndex;
    question.chosen = index;
    if (correct) riddleState.score += 1;
    riddleScore.textContent = `${riddleState.score} / 10`;
    $$(".logic-option", riddleOptions).forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === question.answerIndex) button.classList.add("is-correct");
      if (buttonIndex === index && !correct) button.classList.add("is-wrong");
    });
    riddleFeedback.textContent = correct
      ? `Correct! ${question.explanation}`
      : `Not quite. ${question.explanation}`;
    riddleFeedback.className = `logic-feedback ${correct ? "is-good" : "is-bad"}`;
    riddleNext.hidden = false;
    riddleNext.textContent = riddleState.round === riddleState.questions.length - 1 ? "See answers →" : "Next challenge →";
  }

  function advanceRiddle() {
    if (!riddleState.playing || !riddleState.answered) return;
    if (riddleState.round >= riddleState.questions.length - 1) {
      finishRiddleGame();
      return;
    }
    riddleState.round += 1;
    renderRiddleQuestion();
  }

  function finishRiddleGame() {
    riddleState.playing = false;
    riddleState.locked = true;
    riddleState.answered = false;
    riddleOptions.innerHTML = "";
    riddleNext.hidden = true;
    riddleStart.textContent = "Play again";
    riddleType.textContent = "Complete";
    riddleType.classList.remove("is-trivia");
    riddleProgress.textContent = "10 of 10 solved";
    riddlePrompt.textContent = "All 10 challenges completed.";
    const message = riddleState.score >= 8
      ? "Riddle and trivia master!"
      : riddleState.score >= 5
        ? "Sharp mind!"
        : "Every riddle teaches you a new way to think.";
    riddleFeedback.textContent = `${message} You answered ${riddleState.score} of 10 correctly.`;
    riddleFeedback.className = riddleState.score >= 8 ? "logic-feedback is-good" : "logic-feedback";
    riddleReview.hidden = false;
    riddleReview.innerHTML = `
      <h4>Riddle &amp; trivia answers</h4>
      <div class="logic-review-list">
        ${riddleState.questions.map((question, index) => {
          const chosen = question.chosen === null ? "—" : question.choices[question.chosen];
          const correct = question.chosen === question.answerIndex;
          return `
            <div class="logic-review-row ${correct ? "is-correct" : "is-wrong"}">
              <span class="logic-review-num">${index + 1}</span>
              <div>
                <strong>${question.type}: ${esc(question.prompt)}</strong>
                <span>Answer: ${esc(question.answer)}. ${esc(question.explanation)} Your answer: ${esc(chosen)}.</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  riddleStart.addEventListener("click", startRiddleGame);
  riddleNext.addEventListener("click", advanceRiddle);


  /* ---------- Game 9: Guess the Capital ---------- */

  const capitalCountries = [
    { code: "ph", name: "Philippines", capital: "Manila" },
    { code: "jp", name: "Japan", capital: "Tokyo" },
    { code: "kr", name: "South Korea", capital: "Seoul" },
    { code: "cn", name: "China", capital: "Beijing" },
    { code: "in", name: "India", capital: "New Delhi" },
    { code: "th", name: "Thailand", capital: "Bangkok" },
    { code: "vn", name: "Vietnam", capital: "Hanoi" },
    { code: "id", name: "Indonesia", capital: "Jakarta" },
    { code: "my", name: "Malaysia", capital: "Kuala Lumpur" },
    { code: "au", name: "Australia", capital: "Canberra" },
    { code: "nz", name: "New Zealand", capital: "Wellington" },
    { code: "us", name: "United States", capital: "Washington, D.C." },
    { code: "ca", name: "Canada", capital: "Ottawa" },
    { code: "mx", name: "Mexico", capital: "Mexico City" },
    { code: "br", name: "Brazil", capital: "Brasília" },
    { code: "ar", name: "Argentina", capital: "Buenos Aires" },
    { code: "gb", name: "United Kingdom", capital: "London" },
    { code: "fr", name: "France", capital: "Paris" },
    { code: "de", name: "Germany", capital: "Berlin" },
    { code: "it", name: "Italy", capital: "Rome" },
    { code: "es", name: "Spain", capital: "Madrid" },
    { code: "pt", name: "Portugal", capital: "Lisbon" },
    { code: "nl", name: "Netherlands", capital: "Amsterdam" },
    { code: "se", name: "Sweden", capital: "Stockholm" },
    { code: "no", name: "Norway", capital: "Oslo" },
    { code: "ch", name: "Switzerland", capital: "Bern" },
    { code: "gr", name: "Greece", capital: "Athens" },
    { code: "tr", name: "Turkey", capital: "Ankara" },
    { code: "eg", name: "Egypt", capital: "Cairo" },
    { code: "za", name: "South Africa", capital: "Pretoria" },
    { code: "ke", name: "Kenya", capital: "Nairobi" },
    { code: "ng", name: "Nigeria", capital: "Abuja" },
    { code: "sa", name: "Saudi Arabia", capital: "Riyadh" },
    { code: "ae", name: "United Arab Emirates", capital: "Abu Dhabi" },
    { code: "ru", name: "Russia", capital: "Moscow" },
    { code: "ua", name: "Ukraine", capital: "Kyiv" },
    { code: "pl", name: "Poland", capital: "Warsaw" },
    { code: "ie", name: "Ireland", capital: "Dublin" },
    { code: "at", name: "Austria", capital: "Vienna" },
    { code: "dk", name: "Denmark", capital: "Copenhagen" },
    { code: "fi", name: "Finland", capital: "Helsinki" },
    { code: "is", name: "Iceland", capital: "Reykjavík" },
    { code: "be", name: "Belgium", capital: "Brussels" },
    { code: "ma", name: "Morocco", capital: "Rabat" },
    { code: "pe", name: "Peru", capital: "Lima" },
    { code: "cl", name: "Chile", capital: "Santiago" },
    { code: "co", name: "Colombia", capital: "Bogotá" },
    { code: "cu", name: "Cuba", capital: "Havana" },
    { code: "jm", name: "Jamaica", capital: "Kingston" },
    { code: "gh", name: "Ghana", capital: "Accra" },
    { code: "et", name: "Ethiopia", capital: "Addis Ababa" },
    { code: "pk", name: "Pakistan", capital: "Islamabad" },
    { code: "bd", name: "Bangladesh", capital: "Dhaka" },
    { code: "np", name: "Nepal", capital: "Kathmandu" },
    { code: "kh", name: "Cambodia", capital: "Phnom Penh" },
    { code: "mm", name: "Myanmar", capital: "Naypyidaw" },
    { code: "mn", name: "Mongolia", capital: "Ulaanbaatar" },
    { code: "lk", name: "Sri Lanka", capital: "Sri Jayawardenepura Kotte" }
  ];

  const capitalImage = $("#capital-image");
  const capitalPlaceholder = $("#capital-placeholder");
  const capitalCountry = $("#capital-country");
  const capitalProgress = $("#capital-progress");
  const capitalOptions = $("#capital-options");
  const capitalScore = $("#capital-score");
  const capitalFeedback = $("#capital-feedback");
  const capitalStart = $("#capital-start");
  const capitalNext = $("#capital-next");
  const capitalReview = $("#capital-review");

  const capitalState = {
    playing: false,
    locked: false,
    answered: false,
    round: 0,
    score: 0,
    questions: []
  };

  function startCapitalGame() {
    const questions = shuffle(capitalCountries).slice(0, 10).map((country) => {
      const distractors = shuffle(capitalCountries.filter((entry) => entry.capital !== country.capital)).slice(0, 3);
      const choices = shuffle([country.capital, ...distractors.map((entry) => entry.capital)]);
      return { country, choices, answerIndex: choices.indexOf(country.capital), chosen: null };
    });
    Object.assign(capitalState, { playing: true, locked: false, answered: false, round: 0, score: 0, questions });
    capitalScore.textContent = "0 / 10";
    capitalStart.textContent = "Restart challenge";
    capitalReview.hidden = true;
    capitalReview.innerHTML = "";
    renderCapitalQuestion();
  }

  function renderCapitalQuestion() {
    const question = capitalState.questions[capitalState.round];
    if (!question) return;
    capitalState.locked = false;
    capitalState.answered = false;
    capitalImage.src = flagUrl(question.country.code);
    capitalImage.alt = `Flag of ${question.country.name}`;
    capitalImage.hidden = false;
    capitalPlaceholder.hidden = true;
    capitalCountry.textContent = question.country.name;
    capitalProgress.textContent = `Country ${capitalState.round + 1} of 10`;
    capitalOptions.innerHTML = question.choices.map((choice, index) => `
      <button class="logic-option" type="button" data-index="${index}">${esc(choice)}</button>
    `).join("");
    $$(".logic-option", capitalOptions).forEach((button) => {
      button.addEventListener("click", () => chooseCapital(Number(button.dataset.index)));
    });
    capitalNext.hidden = true;
    capitalFeedback.textContent = "Choose the capital city of this country.";
    capitalFeedback.className = "logic-feedback";
  }

  function chooseCapital(index) {
    if (!capitalState.playing || capitalState.locked) return;
    capitalState.locked = true;
    capitalState.answered = true;
    const question = capitalState.questions[capitalState.round];
    const correct = index === question.answerIndex;
    question.chosen = index;
    if (correct) capitalState.score += 1;
    capitalScore.textContent = `${capitalState.score} / 10`;
    $$(".logic-option", capitalOptions).forEach((button, buttonIndex) => {
      button.disabled = true;
      if (buttonIndex === question.answerIndex) button.classList.add("is-correct");
      if (buttonIndex === index && !correct) button.classList.add("is-wrong");
    });
    capitalFeedback.textContent = correct
      ? `Correct! ${question.country.capital} is the capital of ${question.country.name}.`
      : `Not quite. The capital of ${question.country.name} is ${question.country.capital}.`;
    capitalFeedback.className = `logic-feedback ${correct ? "is-good" : "is-bad"}`;
    capitalNext.hidden = false;
    capitalNext.textContent = capitalState.round === capitalState.questions.length - 1 ? "See answers →" : "Next country →";
  }

  function advanceCapital() {
    if (!capitalState.playing || !capitalState.answered) return;
    if (capitalState.round >= capitalState.questions.length - 1) {
      finishCapitalGame();
      return;
    }
    capitalState.round += 1;
    renderCapitalQuestion();
  }

  function finishCapitalGame() {
    capitalState.playing = false;
    capitalState.locked = true;
    capitalState.answered = false;
    capitalOptions.innerHTML = "";
    capitalNext.hidden = true;
    capitalImage.hidden = true;
    capitalPlaceholder.hidden = false;
    capitalPlaceholder.innerHTML = '<span aria-hidden="true">🌍</span><small>All 10 countries</small>';
    capitalCountry.textContent = "World tour complete";
    capitalProgress.textContent = `You named ${capitalState.score} of 10 capitals`;
    capitalStart.textContent = "Play again";
    const message = capitalState.score >= 8
      ? "Capital expert!"
      : capitalState.score >= 5
        ? "Good exploring!"
        : "Every capital is a new place on the map.";
    capitalFeedback.textContent = `${message} You got ${capitalState.score} of 10. The correct answers are below.`;
    capitalFeedback.className = capitalState.score >= 8 ? "logic-feedback is-good" : "logic-feedback";
    capitalReview.hidden = false;
    capitalReview.innerHTML = `
      <h4>Capital answers</h4>
      <div class="logic-review-list">
        ${capitalState.questions.map((question, index) => {
          const chosen = question.chosen === null ? "—" : question.choices[question.chosen];
          const correct = question.chosen === question.answerIndex;
          return `
            <div class="logic-review-row ${correct ? "is-correct" : "is-wrong"}">
              <img class="capital-review-flag" src="${flagUrl(question.country.code, 80)}" alt="${esc(question.country.name)} flag" width="32" height="22" loading="lazy" decoding="async" />
              <span class="logic-review-num">${index + 1}</span>
              <div>
                <strong>${esc(question.country.name)} — ${esc(question.country.capital)}</strong>
                <span>Your answer: ${esc(chosen)} ${correct ? "✓" : "✕"}</span>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  capitalStart.addEventListener("click", startCapitalGame);
  capitalNext.addEventListener("click", advanceCapital);


  /* ---------- Flying unicorn orbit ---------- */

  const orbitHost = $(".title-orbit");
  const orbitTitle = orbitHost ? $(".hero-title", orbitHost) : null;
  const orbitUnicorn = orbitHost ? $(".unicorn", orbitHost) : null;
  const glitterCanvas = orbitHost ? $(".orbit-glitter", orbitHost) : null;

  if (orbitHost && orbitTitle && orbitUnicorn) {
    const DURATION = 13000;
    const SHAPES = ["circle", "oval", "infinity"];
    const glitterCtx = glitterCanvas ? glitterCanvas.getContext("2d") : null;
    const particles = [];
    let geometry = null;
    let frameId = null;
    let resizeTimer = null;
    let lastGlitterSpawn = 0;
    let dpr = 1;

    const orbit = {
      phase: Math.random() * Math.PI * 2,
      speed: 1,
      speedTarget: 1,
      direction: Math.random() < 0.5 ? 1 : -1,
      shape: "oval",
      rx: 0,
      ry: 0,
      mix: 0,
      target: { rx: 0, ry: 0, mix: 0 },
      nextShapeAt: 0,
      last: null,
      facing: 1,
      prevX: null,
      prevY: null
    };

    const sizeGlitter = (width, height) => {
      if (!glitterCanvas || !glitterCtx) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      glitterCanvas.width = Math.max(1, Math.round(width * dpr));
      glitterCanvas.height = Math.max(1, Math.round(height * dpr));
      glitterCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const measureOrbit = () => {
      const host = orbitHost.getBoundingClientRect();
      const title = orbitTitle.getBoundingClientRect();
      const viewport = document.documentElement.clientWidth;
      const glyphW = orbitUnicorn.offsetWidth || 42;
      const glyphH = orbitUnicorn.offsetHeight || 35;
      const gutter = 8;
      const titleCenterX = title.left + title.width / 2;
      const titleCenterY = title.top + title.height / 2;

      let rx = title.width / 2 + 14 + glyphW / 2;
      const maxRx = viewport / 2 - glyphW / 2 - gutter;
      rx = Math.min(rx, Math.max(title.width / 2 + glyphW / 2, maxRx));

      const minCenterX = rx + glyphW / 2 + gutter;
      const maxCenterX = viewport - gutter - glyphW / 2 - rx;
      const orbitCenterX = Math.min(Math.max(titleCenterX, minCenterX), maxCenterX);
      const canvasRect = glitterCanvas ? glitterCanvas.getBoundingClientRect() : null;

      geometry = {
        baseRx: rx,
        baseRy: title.height / 2 + 18 + glyphH / 2,
        dx: orbitCenterX - (host.left + host.width / 2),
        dy: titleCenterY - (host.top + host.height / 2),
        cw: host.width,
        ch: host.height,
        gx: canvasRect ? host.left - canvasRect.left : 0,
        gy: canvasRect ? host.top - canvasRect.top : 0,
        gw: canvasRect ? canvasRect.width : host.width,
        gh: canvasRect ? canvasRect.height : host.height
      };

      sizeGlitter(geometry.gw, geometry.gh);
      if (orbit.rx === 0) {
        orbit.target = shapeFor(orbit.shape);
        orbit.rx = orbit.target.rx;
        orbit.ry = orbit.target.ry;
        orbit.mix = orbit.target.mix;
      }
    };

    function shapeFor(kind) {
      const g = geometry;
      if (!g) return { rx: 0, ry: 0, mix: 0 };
      if (kind === "circle") {
        const radius = Math.min(g.baseRx, g.baseRy + (orbitUnicorn.offsetHeight || 35) * 1.4, 100);
        return { rx: radius, ry: radius, mix: 0 };
      }
      if (kind === "infinity") {
        return {
          rx: g.baseRx * 0.92,
          ry: Math.max(g.baseRy * 1.55, 82),
          mix: 1
        };
      }
      return { rx: g.baseRx, ry: g.baseRy, mix: 0 };
    }

    function chooseShape(now) {
      const options = SHAPES.filter((shape) => shape !== orbit.shape);
      orbit.shape = options[Math.floor(Math.random() * options.length)];
      orbit.target = shapeFor(orbit.shape);
      orbit.speedTarget = 0.8 + Math.random() * 0.38;
      orbit.nextShapeAt = now + 9500 + Math.random() * 5500;
      orbitHost.dataset.orbitShape = orbit.shape;
    }

    function drawGlitter(x, y, dt, now) {
      if (!glitterCtx || !geometry) return;
      glitterCtx.clearRect(0, 0, geometry.gw, geometry.gh);
      if (prefersReducedMotion) return;

      if (now - lastGlitterSpawn > 16) {
        lastGlitterSpawn = now;
        for (let i = 0; i < 2; i += 1) {
          if (particles.length > 110) particles.shift();
          particles.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28 + 0.06,
            life: 1,
            decay: 0.0009 + Math.random() * 0.0008,
            size: 1.1 + Math.random() * 2.4,
            tone: Math.random() < 0.55 ? "gold" : "lilac",
            spin: Math.random() * Math.PI
          });
        }
      }

      glitterCtx.save();
      glitterCtx.globalCompositeOperation = "lighter";
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.life -= particle.decay * dt;
        if (particle.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        particle.x += particle.vx * (dt / 16);
        particle.y += particle.vy * (dt / 16);
        const alpha = Math.max(0, particle.life);
        const color = particle.tone === "gold"
          ? `rgba(253, 230, 138, ${alpha})`
          : `rgba(240, 171, 252, ${alpha})`;
        const size = particle.size * (0.55 + particle.life * 0.55);

        glitterCtx.save();
        glitterCtx.translate(particle.x, particle.y);
        glitterCtx.rotate(particle.spin);
        glitterCtx.fillStyle = color;
        glitterCtx.beginPath();
        glitterCtx.moveTo(0, -size);
        glitterCtx.lineTo(size * 0.38, 0);
        glitterCtx.lineTo(0, size);
        glitterCtx.lineTo(-size * 0.38, 0);
        glitterCtx.closePath();
        glitterCtx.fill();
        if (size > 2.2) {
          glitterCtx.globalAlpha = alpha * 0.55;
          glitterCtx.fillRect(-size * 0.09, -size * 0.75, size * 0.18, size * 1.5);
          glitterCtx.fillRect(-size * 0.75, -size * 0.09, size * 1.5, size * 0.18);
          glitterCtx.globalAlpha = 1;
        }
        glitterCtx.restore();
      }
      glitterCtx.restore();
    }

    const place = (now) => {
      if (!geometry) measureOrbit();
      const dt = orbit.last === null ? 16 : Math.min(Math.max(now - orbit.last, 0), 48);
      orbit.last = now;

      if (now >= orbit.nextShapeAt) chooseShape(now);

      const ease = 1 - Math.exp(-dt / 700);
      orbit.rx += (orbit.target.rx - orbit.rx) * ease;
      orbit.ry += (orbit.target.ry - orbit.ry) * ease;
      orbit.mix += (orbit.target.mix - orbit.mix) * ease;
      orbit.speed += (orbit.speedTarget - orbit.speed) * ease;

      orbit.phase += (dt / DURATION) * Math.PI * 2 * orbit.speed * orbit.direction;
      const angle = orbit.phase;
      const ellipseX = Math.cos(angle) * orbit.rx;
      const ellipseY = Math.sin(angle) * orbit.ry;
      const infinityX = Math.sin(angle) * orbit.rx;
      const infinityY = Math.sin(angle * 2) * orbit.ry * 0.55;
      const x = geometry.dx + ellipseX + (infinityX - ellipseX) * orbit.mix;
      const y = geometry.dy + ellipseY + (infinityY - ellipseY) * orbit.mix;

      let vx = 0;
      let vy = 0;
      if (orbit.prevX !== null) {
        vx = x - orbit.prevX;
        vy = y - orbit.prevY;
      }
      if (vx > 0.12) orbit.facing = 1;
      else if (vx < -0.12) orbit.facing = -1;

      const bank = Math.max(-14, Math.min(14, (vy / (Math.abs(vx) + 2.2)) * 10)) * orbit.facing;
      const depth = 0.92 + ((Math.sin(angle) + 1) / 2) * 0.14;
      orbitUnicorn.style.transform =
        `translate(-50%, -50%) translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${bank.toFixed(2)}deg) scale(${(orbit.facing * depth).toFixed(3)}, ${depth.toFixed(3)})`;

      orbit.prevX = x;
      orbit.prevY = y;

      drawGlitter(
        geometry.gx + geometry.cw / 2 + x,
        geometry.gy + geometry.ch / 2 + y,
        dt,
        now
      );

      if (!prefersReducedMotion) frameId = window.requestAnimationFrame(place);
    };

    const startOrbit = () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      orbit.last = null;
      if (prefersReducedMotion) {
        place(performance.now());
        return;
      }
      frameId = window.requestAnimationFrame(place);
    };

    const refreshOrbit = () => {
      measureOrbit();
      orbit.target = shapeFor(orbit.shape);
      if (prefersReducedMotion) place(performance.now());
    };

    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(refreshOrbit, 120);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(refreshOrbit).catch(() => {});
    }

    measureOrbit();
    orbit.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    orbit.target = shapeFor(orbit.shape);
    orbit.rx = orbit.target.rx;
    orbit.ry = orbit.target.ry;
    orbit.mix = orbit.target.mix;
    orbit.speed = orbit.speedTarget = 0.82 + Math.random() * 0.32;
    orbit.nextShapeAt = performance.now() + 9000 + Math.random() * 5000;
    orbitHost.dataset.orbitShape = orbit.shape;
    startOrbit();
  }
})();
