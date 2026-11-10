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

  const dayOfYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
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
    { setup: "Why do bees have sticky hair?", punch: "Because they use honeycombs." }
  ];

  const featureHost = $("#joke-feature");
  const jokeGrid = $("#joke-grid");
  let featureIndex = dayOfYear() % jokes.length;

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
    const joke = jokes[featureIndex];
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
    jokes.forEach((joke, index) => {
      if (index !== featureIndex) jokeGrid.appendChild(jokeCard(joke, index));
    });
  }

  renderFeatureJoke();
  renderJokeGrid();

  $("#joke-shuffle").addEventListener("click", () => {
    let next = Math.floor(Math.random() * jokes.length);
    if (next === featureIndex) next = (next + 1) % jokes.length;
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
    }
  ];

  let wordIndex = dayOfYear() % words.length;

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

  renderWord();

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

  /* ---------- Books ---------- */

  const genres = [
    { id: "all", label: "All genres", emoji: "✦" },
    { id: "fantasy", label: "Fantasy", emoji: "🐉" },
    { id: "mystery", label: "Mystery", emoji: "🔍" },
    { id: "adventure", label: "Adventure", emoji: "🧭" },
    { id: "science", label: "Science", emoji: "🚀" },
    { id: "humor", label: "Humor", emoji: "😂" },
    { id: "poetry", label: "Poetry", emoji: "🌿" }
  ];

  const books = [
    {
      title: "The Girl Who Drank the Moon",
      author: "Kelly Barnhill",
      genre: "fantasy",
      ages: "9–12",
      emoji: "🌙",
      blurb: "A witch, a swamp monster, a perfectly tiny dragon, and a girl filled with moonlight.",
      spark: "Read it for the feeling that magic is hiding just past the edge of the map."
    },
    {
      title: "Amari and the Night Brothers",
      author: "B. B. Alston",
      genre: "fantasy",
      ages: "9–12",
      emoji: "✨",
      blurb: "A hidden bureau of magic, a missing brother, and a girl who refuses to give up.",
      spark: "A fast, funny adventure with a heroine who keeps choosing brave."
    },
    {
      title: "The Mysterious Benedict Society",
      author: "Trenton Lee Stewart",
      genre: "mystery",
      ages: "9–12",
      emoji: "🔍",
      blurb: "Four extraordinary kids, one peculiar test, and a school hiding a very strange secret.",
      spark: "A puzzle box of a book — perfect for a mind that notices everything."
    },
    {
      title: "Greenglass House",
      author: "Kate Milford",
      genre: "mystery",
      ages: "9–12",
      emoji: "🏠",
      blurb: "A snowbound inn, a house full of secrets, and a girl born to solve them.",
      spark: "Cozy and clever at the same time, like a mystery told beside a fireplace."
    },
    {
      title: "Nancy Drew: The Secret of the Old Clock",
      author: "Carolyn Keene",
      genre: "mystery",
      ages: "8–12",
      emoji: "🕵️",
      blurb: "The original girl detective, a blue roadster, and a mystery that will not stay shut.",
      spark: "Meet the detective who made generations of girls want a magnifying glass."
    },
    {
      title: "The Explorer",
      author: "Katherine Rundell",
      genre: "adventure",
      ages: "8–12",
      emoji: "🧭",
      blurb: "Four kids, a crashed plane, and a jungle that keeps its own rules.",
      spark: "Wild, funny, and full of the feeling that you could survive almost anything."
    },
    {
      title: "Holes",
      author: "Louis Sachar",
      genre: "adventure",
      ages: "9–12",
      emoji: "🕳️",
      blurb: "Digging holes in the desert — and unearthing a family curse that connects everything.",
      spark: "Every clue snaps into place. Read it once for the story, twice for the trick."
    },
    {
      title: "Journey to the River Sea",
      author: "Eva Ibbotson",
      genre: "adventure",
      ages: "9–12",
      emoji: "🛶",
      blurb: "A girl, a boat, and the Amazon waiting to be discovered.",
      spark: "For anyone who has ever wanted to trade a tidy room for a wild river."
    },
    {
      title: "The Thing About Jellyfish",
      author: "Ali Benjamin",
      genre: "science",
      ages: "10–13",
      emoji: "🪼",
      blurb: "Grief, jellyfish, and a scientist's mind learning how to feel.",
      spark: "Proof that facts and feelings can live in the same brilliant brain."
    },
    {
      title: "George's Secret Key to the Universe",
      author: "Lucy & Stephen Hawking",
      genre: "science",
      ages: "8–12",
      emoji: "🚀",
      blurb: "A supercomputer, a space adventure, and real science tucked into every chapter.",
      spark: "The rare book that makes physics feel like a trip with your funniest friend."
    },
    {
      title: "Sideways Stories from Wayside School",
      author: "Louis Sachar",
      genre: "humor",
      ages: "7–11",
      emoji: "🏫",
      blurb: "A school thirty stories tall where the weirdest things are completely normal.",
      spark: "Thirty tiny chapters of pure nonsense — in the best possible way."
    },
    {
      title: "The Terrible Two",
      author: "Mac Barnett & Jory John",
      genre: "humor",
      ages: "8–12",
      emoji: "😼",
      blurb: "A prank war between a local legend and the new kid who wants the crown.",
      spark: "Very funny, slightly sneaky, and full of ideas you should not try at school."
    },
    {
      title: "Where the Sidewalk Ends",
      author: "Shel Silverstein",
      genre: "poetry",
      ages: "7–11",
      emoji: "🌿",
      blurb: "Silly, strange, and secretly wise poems about everything from homework to hugging.",
      spark: "The fastest way to discover that poetry can be funny and a little bit wild."
    },
    {
      title: "Out of Wonder: Poems Celebrating Poets",
      author: "Kwame Alexander",
      genre: "poetry",
      ages: "9–12",
      emoji: "🎨",
      blurb: "Poems that celebrate the poets who came before, each one a different colour of voice.",
      spark: "A gallery of poems — read one aloud before bed and let it sit with you."
    }
  ];

  const genreChips = $("#genre-chips");
  const bookGrid = $("#book-grid");
  const bookCount = $("#book-count");
  let activeGenre = "all";

  function renderBooks() {
    const list = activeGenre === "all" ? books : books.filter((book) => book.genre === activeGenre);
    bookGrid.innerHTML = list.map((book) => {
      const genreLabel = genres.find((g) => g.id === book.genre).label;
      return `
        <article class="book-card genre-${book.genre}">
          <div class="book-cover">
            <span class="book-emoji" aria-hidden="true">${book.emoji}</span>
            <span class="book-genre-tag">${genreLabel}</span>
          </div>
          <div class="book-body">
            <h3>${book.title}</h3>
            <p class="book-author">${book.author}</p>
            <p class="book-blurb">${book.blurb}</p>
            <p class="book-spark">✨ ${book.spark}</p>
            <div class="book-meta"><span>Ages ${book.ages}</span><span>${genreLabel}</span></div>
          </div>
        </article>
      `;
    }).join("");
    bookCount.textContent = `Showing ${list.length} of ${books.length} books.`;
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
})();
