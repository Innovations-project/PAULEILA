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
    { code: "ja", name: "Japanese", flag: "🇯🇵", note: "日本語" },
    { code: "ko", name: "Korean", flag: "🇰🇷", note: "한국어" },
    { code: "zh", name: "Chinese", flag: "🇨🇳", note: "中文" },
    { code: "it", name: "Italian", flag: "🇮🇹", note: "italiano" },
    { code: "es", name: "Spanish", flag: "🇪🇸", note: "español" },
    { code: "ar", name: "Arabic", flag: "🇸🇦", note: "العربية" }
  ];

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
        <div class="translate-card-head"><span class="translate-flag">${lang.flag}</span><h3>${lang.name}</h3></div>
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
          <div class="translate-card-head"><span class="translate-flag">${lang.flag}</span><h3>${lang.name}</h3><span class="translate-native">${lang.note}</span></div>
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
