(() => {
  // Sound effects
  const sfx = {
    correct: new Audio('bp-correct.mp3'),
    wrong: new Audio('bp-wrong.mp3'),
    click: new Audio('bp-click.mp3')
  };

  function safePlay(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  const THEME_STORAGE_KEY = 'bpQuizTheme_v1';
  const HISTORY_KEY = 'bpQuizHistory_v1';
  const FALLBACK_TEST_FILES = [
    'tests/cm-on-5b.json',
    'tests/math-basics.json',
    'tests/english-basics.json',
    'tests/science-basics.json'
  ];

  // Embedded dataset used if fetch is blocked (e.g., file:// without a server)
  const EMBEDDED_DATASETS = [
    {
      subjectId: 'polish',
      subjectName: 'Język polski',
      tests: [
        {
          id: 'cm-on-5b',
          name: 'Części mowy odmienne i nieodmienne 5B',
          topics: [
            { id: 'rzeczownik', name: 'Rzeczownik', ruleTitle: 'Rzeczownik - przypomnienie i uzupełnienie', ruleText: 'Rzeczownik to część mowy, która nazywa osoby, zwierzęta, rośliny, przedmioty, miejsca i pojęcia. Odpowiada na pytania: kto? co?', ruleUrl: 'https://epodreczniki.pl/a/rzeczownik/D2FQe8tts' },
            { id: 'przymiotnik', name: 'Przymiotnik', ruleTitle: 'Przymiotnik - stopniowanie i użycie', ruleText: 'Przymiotnik nazywa cechy osób, zwierząt i przedmiotów. Odpowiada na pytania: jaki? jaka? jakie? Można go stopniować: miły - milszy - najmilszy.', ruleUrl: 'https://epodreczniki.pl/a/przymiotnik/D1BtLqN9I' },
            { id: 'czasownik', name: 'Czasownik', ruleTitle: 'Czasownik - formy osobowe i nieosobowe', ruleText: 'Czasownik nazywa czynności i stany. Odpowiada na pytania: co robi? co się dzieje? Ma formy osobowe i nieosobowe (np. bezokolicznik: czytać, pisać).', ruleUrl: 'https://epodreczniki.pl/a/czasownik/Dm1fH4nL0' },
            { id: 'przyslowek', name: 'Przysłówek', ruleTitle: 'Przysłówek - jak? gdzie? kiedy?', ruleText: 'Przysłówek określa czasownik, przymiotnik lub inny przysłówek. Odpowiada m.in. na pytania: jak? gdzie? kiedy?', ruleUrl: 'https://epodreczniki.pl/a/przyslowek/D12G6JZ1n' },
            { id: 'liczebnik', name: 'Liczebnik', ruleTitle: 'Liczebnik - ilość i kolejność', ruleText: 'Liczebnik określa ilość, liczbę i kolejność obiektów. Np. trzy, dziesięć, piąty, troje.', ruleUrl: 'https://epodreczniki.pl/a/liczebnik/D1J2i2wsG' },
            { id: 'przyimek', name: 'Przyimek', ruleTitle: 'Przyimek - wyrażenia przyimkowe', ruleText: 'Przyimek łączy się z rzeczownikiem, tworząc wyrażenia przyimkowe, np. na stole, pod domem, do szkoły.', ruleUrl: 'https://epodreczniki.pl/a/przyimek/D1XfB5Scq' },
            { id: 'spojnik', name: 'Spójnik', ruleTitle: 'Spójnik - łączenie wyrazów i zdań', ruleText: 'Spójniki łączą wyrazy i zdania, np. i, oraz, ale, lecz, więc.', ruleUrl: 'https://epodreczniki.pl/a/spojnik/D17mkf9Wb' }
          ],
          questions: [
            { topicId: 'rzeczownik', q: 'Rzeczownik to część mowy, która nazywa:', options: ['cechy', 'czynności', 'osoby, zwierzęta i zjawiska', 'liczby'], answer: 2, expl: 'Rzeczownik nazywa osoby, zwierzęta, rośliny, przedmioty, miejsca i pojęcia.', ruleHtml: '<p><strong>Szybka ściąga</strong></p><ul><li>Odpowiada na pytania: <b>kto? co?</b></li><li>Przykłady: <em>pies</em>, <em>las</em>, <em>radość</em>.</li></ul>', ruleVideo: 'https://youtube.com/shorts/IDtF0ShYfjg?feature=share' },
            { topicId: 'rzeczownik', q: 'Które z poniższych jest rzeczownikiem pospolitym?', options: ['Wisła', 'Europa', 'dziewczynka', 'Marta'], answer: 2, expl: 'Rzeczownik pospolity to nazwa ogólna, np. "dziewczynka".' },
            { topicId: 'rzeczownik', q: 'Które słowo jest rzeczownikiem własnym?', options: ['książka', 'pies', 'Adam', 'lekarz'], answer: 2, expl: 'Rzeczowniki własne zapisujemy wielką literą, np. "Adam".' },
            { topicId: 'rzeczownik', q: 'W którym wyrażeniu rzeczownik występuje w liczbie mnogiej?', options: ['dom', 'dziecko', 'książki', 'drzewo'], answer: 2, expl: '"Książki" to liczba mnoga rzeczownika "książka".' },
            { topicId: 'przymiotnik', q: 'Przymiotnik określa zwykle:', options: ['liczbę', 'nazwę osoby', 'cechę', 'miejsce'], answer: 2, expl: 'Przymiotnik nazywa cechy, np. czerwony, wysoki, wesoły.' },
            { topicId: 'przymiotnik', q: 'Wskaż przymiotnik:', options: ['szybko', 'czerwony', 'dziewczynka', 'biega'], answer: 1, expl: '"Czerwony" to przymiotnik - określa kolor.' },
            { topicId: 'przymiotnik', q: 'Jak poprawnie stopniujemy przymiotnik "miły"?', options: ['miły - milszy - najmilszy', 'miły - bardziej miły - najbardziej miły', 'miły - najmilszy - milszy', 'miły - milszy - bardziej miły'], answer: 0, expl: 'Poprawne stopniowanie: miły - milszy - najmilszy.' },
            { topicId: 'czasownik', q: 'Czasownik to część mowy, która nazywa:', options: ['cechy', 'czynności i stany', 'przedmioty', 'uczucia'], answer: 1, expl: 'Czasownik nazywa czynności i stany, np. czytać, spać.' },
            { topicId: 'czasownik', q: 'Która forma jest nieosobową formą czasownika?', options: ['poszedł', 'pływać', 'idzie', 'siedzą'], answer: 1, expl: 'Bezokolicznik (np. "pływać") jest formą nieosobową.' },
            { topicId: 'czasownik', q: 'Do czego służy tryb rozkazujący?', options: ['opisywania przeszłości', 'wyrażania nakazów i próśb', 'opisywania cech', 'zadawania pytań'], answer: 1, expl: 'Tryb rozkazujący służy do wydawania poleceń, np. "Czytaj!".' },
            { topicId: 'przyslowek', q: 'Przysłówek określa zwykle:', options: ['czasownik', 'rzeczownik', 'liczebnik', 'zaimek'], answer: 0, expl: 'Przysłówek najczęściej określa czasownik: jak? gdzie? kiedy?' },
            { topicId: 'przyslowek', q: 'Wskaż przysłówek:', options: ['czerwony', 'wczoraj', 'dziewczynka', 'smaczny'], answer: 1, expl: '"Wczoraj" odpowiada na pytanie "kiedy?".' },
            { topicId: 'liczebnik', q: 'Liczebnik określa:', options: ['tylko kolor', 'cechę osoby', 'liczbę, ilość lub kolejność', 'rodzaj rzeczownika'], answer: 2, expl: 'Liczebnik określa ilość lub kolejność, np. trzy, piąty.' },
            { topicId: 'liczebnik', q: 'Wskaż liczebnik porządkowy:', options: ['pięć', 'piąty', 'piątka', 'pięcioro'], answer: 1, expl: '"Piąty" oznacza kolejność.' },
            { topicId: 'przyimek', q: 'Które słowo jest przyimkiem?', options: ['pod', 'bardzo', 'mama', 'niebieski'], answer: 0, expl: '"Pod" to przyimek - tworzy wyrażenia przyimkowe.' },
            { topicId: 'przyimek', q: 'W którym wyrażeniu poprawnie użyto przyimka?', options: ['idę dom', 'idę do domu', 'idę domem', 'idę domowi'], answer: 1, expl: 'Poprawna forma: "idę do domu".' },
            { topicId: 'spojnik', q: 'Spójnik to część mowy, która:', options: ['nazywa osoby', 'określa ilość', 'łączy wyrazy i zdania', 'określa cechy'], answer: 2, expl: 'Spójnik łączy wyrazy i zdania, np. i, ale, lub.' },
            { topicId: 'spojnik', q: 'Wskaż spójnik:', options: ['przez', 'oraz', 'w', 'pod'], answer: 1, expl: '"Oraz" to spójnik łączący wyrazy i zdania.' },
            { topicId: 'spojnik', q: 'Które zdanie zawiera spójnik przeciwstawny?', options: ['Lubię psy i koty.', 'Chciałem iść, ale padało.', 'Poszedłem do kina i na lody.', 'Kupiłem chleb oraz masło.'], answer: 1, expl: '"Ale" jest spójnikiem przeciwstawnym.' }
          ]
        }
      ]
    }
  ];

  const themes = {
    blackpink: {
      label: 'BlackPink',
      title: 'School Quiz',
      hero: 'url("themes/blackpink-1600x900.png")',
      vars: {
        '--primary': '#ff4da6',
        '--primary-soft': '#ff99cc',
        '--accent': '#ffe6f5',
        '--text': '#ffffff',
        '--muted': '#dddddd',
        '--bg-gradient': 'radial-gradient(circle at top, #2a1038 0, #08040b 40%, #000000 100%)',
        '--bg-overlay': 'radial-gradient(circle at 0 0, rgba(255, 77, 166, 0.25), transparent 60%), radial-gradient(circle at 100% 0, rgba(160, 100, 255, 0.25), transparent 60%)',
        '--card-gradient': 'linear-gradient(135deg, rgba(255, 77, 166, 0.08), rgba(17, 17, 17, 0.96))',
        '--card-border': 'rgba(255, 255, 255, 0.12)',
        '--card-glow': 'radial-gradient(circle, rgba(255, 255, 255, 0.18) 0, transparent 55%), radial-gradient(circle, rgba(255, 77, 166, 0.24) 0, transparent 60%)',
        '--badge-bg': 'rgba(10, 5, 15, 0.8)',
        '--sidebar-bg': 'rgba(10, 6, 16, 0.9)',
        '--control-bg': '#120b18',
        '--option-bg': 'rgba(12, 8, 18, 0.95)',
        '--option-border': 'rgba(255, 255, 255, 0.25)',
        '--button-border': 'rgba(255, 255, 255, 0.25)',
        '--primary-btn': 'linear-gradient(90deg, #ff4da6, #ff99cc)',
        '--primary-btn-text': '#1b0512',
        '--modal-bg': '#120a18',
        '--modal-border': 'rgba(255, 255, 255, 0.2)'
      }
    },
    strangerThings: {
      label: 'Stranger Things',
      title: 'School Quiz',
      hero: 'url("themes/stranger-1600x900.png")',
      vars: {
        '--primary': '#e50914',
        '--primary-soft': '#ff4b5c',
        '--accent': '#f9dada',
        '--text': '#f4f5f7',
        '--muted': '#c3c7d1',
        '--bg-gradient': 'radial-gradient(circle at 20% 0%, #2b0f14 0, #0a0408 40%, #010103 100%)',
        '--bg-overlay': 'radial-gradient(circle at 0 0, rgba(229, 9, 20, 0.32), transparent 55%), radial-gradient(circle at 100% 0, rgba(63, 98, 145, 0.22), transparent 60%)',
        '--card-gradient': 'linear-gradient(145deg, rgba(229, 9, 20, 0.08), rgba(12, 8, 16, 0.96))',
        '--card-border': 'rgba(255, 255, 255, 0.14)',
        '--card-glow': 'radial-gradient(circle, rgba(229, 9, 20, 0.2) 0, transparent 55%), radial-gradient(circle, rgba(63, 98, 145, 0.18) 0, transparent 60%)',
        '--badge-bg': 'rgba(16, 8, 12, 0.85)',
        '--sidebar-bg': 'rgba(14, 10, 18, 0.92)',
        '--control-bg': '#0f0a10',
        '--option-bg': 'rgba(12, 9, 14, 0.96)',
        '--option-border': 'rgba(255, 255, 255, 0.28)',
        '--button-border': 'rgba(255, 255, 255, 0.26)',
        '--primary-btn': 'linear-gradient(90deg, #e50914, #ff4b5c)',
        '--primary-btn-text': '#1a0608',
        '--modal-bg': '#120911',
        '--modal-border': 'rgba(255, 255, 255, 0.18)'
      }
    },
    hobbit: {
      label: 'Hobbit',
      title: 'School Quiz',
      hero: 'url("themes/hobbit-1600x900.png")',
      vars: {
        '--primary': '#d6a758',
        '--primary-soft': '#e8c788',
        '--accent': '#f3edd8',
        '--text': '#f8f6ec',
        '--muted': '#e2dcc6',
        '--bg-gradient': 'radial-gradient(circle at 30% 0%, #2b4a36 0, #0f2419 45%, #07150e 100%)',
        '--bg-overlay': 'radial-gradient(circle at 0 0, rgba(102, 153, 102, 0.3), transparent 60%), radial-gradient(circle at 100% 10%, rgba(214, 167, 88, 0.18), transparent 55%)',
        '--card-gradient': 'linear-gradient(145deg, rgba(214, 167, 88, 0.08), rgba(10, 18, 14, 0.95))',
        '--card-border': 'rgba(243, 237, 216, 0.18)',
        '--card-glow': 'radial-gradient(circle, rgba(214, 167, 88, 0.18) 0, transparent 55%), radial-gradient(circle, rgba(102, 153, 102, 0.22) 0, transparent 60%)',
        '--badge-bg': 'rgba(15, 24, 18, 0.85)',
        '--sidebar-bg': 'rgba(14, 22, 17, 0.9)',
        '--control-bg': '#16261c',
        '--option-bg': 'rgba(18, 28, 21, 0.94)',
        '--option-border': 'rgba(248, 246, 236, 0.26)',
        '--button-border': 'rgba(248, 246, 236, 0.26)',
        '--primary-btn': 'linear-gradient(90deg, #d6a758, #e8c788)',
        '--primary-btn-text': '#1a140c',
        '--modal-bg': '#17261c',
        '--modal-border': 'rgba(248, 246, 236, 0.22)'
      }
    },
    roblox: {
      label: 'Roblox',
      title: 'School Quiz',
      hero: 'url("themes/roblox-1600x900.png")',
      vars: {
        '--primary': '#ff4d4f',
        '--primary-soft': '#ff7875',
        '--accent': '#ffe7e7',
        '--text': '#fdfdfd',
        '--muted': '#dcdcdc',
        '--bg-gradient': 'radial-gradient(circle at 30% 0%, #2b0c0c 0, #0d0d0d 45%, #050505 100%)',
        '--bg-overlay': 'radial-gradient(circle at 0 0, rgba(255, 77, 79, 0.3), transparent 55%), radial-gradient(circle at 100% 10%, rgba(255, 193, 7, 0.16), transparent 55%)',
        '--card-gradient': 'linear-gradient(150deg, rgba(255, 77, 79, 0.08), rgba(15, 15, 15, 0.95))',
        '--card-border': 'rgba(255, 255, 255, 0.16)',
        '--card-glow': 'radial-gradient(circle, rgba(255, 77, 79, 0.2) 0, transparent 55%), radial-gradient(circle, rgba(255, 193, 7, 0.15) 0, transparent 60%)',
        '--badge-bg': 'rgba(20, 12, 12, 0.85)',
        '--sidebar-bg': 'rgba(18, 18, 18, 0.92)',
        '--control-bg': '#151515',
        '--option-bg': 'rgba(18, 18, 18, 0.95)',
        '--option-border': 'rgba(255, 255, 255, 0.22)',
        '--button-border': 'rgba(255, 255, 255, 0.22)',
        '--primary-btn': 'linear-gradient(90deg, #ff4d4f, #ff7875)',
        '--primary-btn-text': '#1a0b0b',
        '--modal-bg': '#161616',
        '--modal-border': 'rgba(255, 255, 255, 0.18)'
      }
    }
  };

  let allTests = [];
  let subjects = [];

  const state = {
    currentSubjectId: null,
    currentTestId: null,
    currentIndex: 0,
    answered: false,
    correctCount: 0,
    perTopic: {},
    historyKey: HISTORY_KEY,
    currentThemeId: 'blackpink',
    answers: []
  };

  // DOM references
  const themeSelectEl = document.getElementById('themeSelect');
  const subjectSelectEl = document.getElementById('subjectSelect');
  const testSelectEl = document.getElementById('testSelect');
  const questionTextEl = document.getElementById('questionText');
  const optionsEl = document.getElementById('optionsContainer');
  const feedbackEl = document.getElementById('feedbackContainer');
  const filterPanelEl = document.getElementById('filterPanel');
  const topicLabelEl = document.getElementById('topicLabel');
  const topicsSummaryEl = document.getElementById('topicsSummary');
  const quizStatsEl = document.getElementById('quizStats');
  const globalStatsEl = document.getElementById('globalStats');
  const historyContainerEl = document.getElementById('historyContainer');
  const questionCardEl = document.getElementById('questionCard');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const restartBtn = document.getElementById('restartBtn');
  const ruleTextTriggerEl = document.getElementById('ruleTextTrigger');
  const ruleVideoTriggerEl = document.getElementById('ruleVideoTrigger');
  const logoTitleEl = document.getElementById('logoTitle');

  const ruleModal = document.getElementById('ruleModal');
  const ruleTitleEl = document.getElementById('ruleTitle');
  const ruleTextEl = document.getElementById('ruleText');
  const ruleTextLinkEl = document.getElementById('ruleTextLink');
  const ruleVideoLinkEl = document.getElementById('ruleVideoLink');
  const ruleLinkEl = document.getElementById('ruleLink');
  const ruleMediaEl = document.getElementById('ruleMedia');

  function syncFilterPanelOpen() {
    if (!filterPanelEl) return;
    if (window.innerWidth > 900) {
      filterPanelEl.setAttribute('open', '');
    } else {
      filterPanelEl.removeAttribute('open');
    }
  }

  // Theme handling
  function applyTheme(themeId, persist = false) {
    const theme = themes[themeId] || themes.blackpink;
    state.currentThemeId = themes[themeId] ? themeId : 'blackpink';

    Object.entries(theme.vars).forEach(([cssVar, value]) => {
      document.documentElement.style.setProperty(cssVar, value);
    });

    const heroValue = theme.hero || 'none';
    document.documentElement.style.setProperty('--hero-image', heroValue);

    document.title = 'School Quiz';

    if (persist) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, state.currentThemeId);
      } catch (_) {}
    }
  }

  function initThemeSelect() {
    Object.entries(themes).forEach(([id, theme]) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = theme.label;
      themeSelectEl.appendChild(opt);
    });

    let saved = 'blackpink';
    try {
      const raw = localStorage.getItem(THEME_STORAGE_KEY);
      if (raw && themes[raw]) saved = raw;
    } catch (_) {}

    state.currentThemeId = saved;
    themeSelectEl.value = saved;
    applyTheme(saved);

    themeSelectEl.onchange = () => {
      safePlay(sfx.click);
      const selected = themeSelectEl.value;
      applyTheme(selected, true);
    };
  }

  // Data loading
  async function fetchJson(url) {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    return res.json();
  }

  async function listTestFiles() {
    try {
      const res = await fetch('tests/index.json', { cache: 'no-cache' });
      if (res.ok) {
        const files = await res.json();
        if (Array.isArray(files) && files.length) return files;
      }
    } catch (_) {}

    try {
      const res = await fetch('tests/', { cache: 'no-cache' });
      if (res.ok) {
        const text = await res.text();
        const matches = [...text.matchAll(/href="([^"]+\.json)"/gi)];
        const files = matches
          .map(m => m[1])
          .filter(Boolean)
          .map(href => href.startsWith('tests/') ? href : `tests/${href}`)
          .filter((v, i, arr) => arr.indexOf(v) === i);
        if (files.length) return files;
      }
    } catch (_) {}

    return FALLBACK_TEST_FILES.slice();
  }

  function normalizeDatasets(datasets) {
    const collectedTests = [];
    const collectedSubjects = new Map();

    datasets.forEach(dataset => {
      if (!dataset || !Array.isArray(dataset.tests)) return;
      const subjectId = dataset.subjectId || `subject-${Math.random().toString(16).slice(2, 8)}`;
      const subjectName = dataset.subjectName || 'Przedmiot';
      if (!collectedSubjects.has(subjectId)) {
        collectedSubjects.set(subjectId, { id: subjectId, name: subjectName });
      }

      dataset.tests.forEach(test => {
        if (!test || !Array.isArray(test.questions) || !Array.isArray(test.topics)) return;
        collectedTests.push({
          ...test,
          subjectId,
          subjectName
        });
      });
    });

    return {
      aggregatedTests: collectedTests,
      aggregatedSubjects: Array.from(collectedSubjects.values())
    };
  }

  async function loadAllTests() {
    const datasets = [];
    const files = await listTestFiles();

    for (const file of files) {
      try {
        const data = await fetchJson(file);
        datasets.push(data);
      } catch (err) {
        console.warn(err.message || err);
      }
    }

    if (!datasets.length) {
      datasets.push(...EMBEDDED_DATASETS);
    }

    const { aggregatedTests, aggregatedSubjects } = normalizeDatasets(datasets);
    if (!aggregatedTests.length) {
      console.error('No valid tests found.');
      return;
    }

    allTests = aggregatedTests;
    subjects = aggregatedSubjects;
    ensureStateDefaults();
    populateSubjectSelect();
    populateTestSelect(state.currentSubjectId);
  }

  // Subject and test selection
  function ensureStateDefaults() {
    if (!subjects.length) return;

    if (!state.currentSubjectId || !subjects.find(s => s.id === state.currentSubjectId)) {
      state.currentSubjectId = subjects[0].id;
    }

    const testsForSubject = allTests.filter(t => t.subjectId === state.currentSubjectId);
    if (!testsForSubject.length) {
      state.currentTestId = null;
      return;
    }

    if (!state.currentTestId || !testsForSubject.find(t => t.id === state.currentTestId)) {
      state.currentTestId = testsForSubject[0].id;
    }
  }

  function populateSubjectSelect() {
    subjectSelectEl.innerHTML = '';
    subjects.forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub.id;
      opt.textContent = sub.name;
      subjectSelectEl.appendChild(opt);
    });
    subjectSelectEl.value = state.currentSubjectId;

    subjectSelectEl.onchange = () => {
      safePlay(sfx.click);
      state.currentSubjectId = subjectSelectEl.value;
      ensureStateDefaults();
      populateTestSelect(state.currentSubjectId);
      resetTest();
    };
  }

  function populateTestSelect(subjectId) {
    const testsForSubject = allTests.filter(t => t.subjectId === subjectId);
    testSelectEl.innerHTML = '';

    testsForSubject.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      testSelectEl.appendChild(opt);
    });

    if (testsForSubject.length === 0) {
      const opt = document.createElement('option');
      opt.disabled = true;
      opt.textContent = 'Brak testów';
      testSelectEl.appendChild(opt);
      testSelectEl.onchange = null;
      state.currentTestId = null;
      return;
    }

    testSelectEl.value = state.currentTestId;
    testSelectEl.onchange = () => {
      safePlay(sfx.click);
      state.currentTestId = testSelectEl.value;
      resetTest();
    };
  }

  function updateQuizStats(currentIndex = state.currentIndex) {
    if (!quizStatsEl) return;
    const test = getCurrentTest();
    const total = test && test.questions ? test.questions.length : 0;
    if (!total) {
      quizStatsEl.textContent = 'Pytanie — / — | Skutecznosc: —';
      return;
    }
    const answeredTotal = state.answers.filter(Boolean).length;
    const acc = answeredTotal > 0 ? Math.round((state.correctCount / answeredTotal) * 100) : 0;
    quizStatsEl.textContent = `Pytanie ${currentIndex + 1} / ${total} | Skutecznosc: ${acc}%`;
  }

  function updateHeaderTestName() {
    const test = getCurrentTest();
    logoTitleEl.textContent = test ? test.name : 'Wybierz test';
  }

  // Quiz logic
  function getCurrentTest() {
    return allTests.find(t => t.id === state.currentTestId);
  }

  function getCurrentQuestion() {
    const test = getCurrentTest();
    if (!test) return null;
    return test.questions[state.currentIndex] || null;
  }

  function getTopicById(id) {
    const test = getCurrentTest();
    if (!test) return null;
    return test.topics.find(t => t.id === id) || null;
  }

  function resetPerTopic() {
    const test = getCurrentTest();
    state.perTopic = {};
    if (!test) return;
    test.topics.forEach(topic => {
      state.perTopic[topic.id] = { correct: 0, total: 0 };
    });
  }

  function showNoTestsMessage() {
    questionTextEl.textContent = 'Brak dostępnych testów.';
    optionsEl.innerHTML = '';
    feedbackEl.innerHTML = '';
    topicLabelEl.textContent = 'Temat: -';
    if (quizStatsEl) quizStatsEl.textContent = 'Pytanie — / — • Skuteczność: —';
    globalStatsEl.textContent = '';
    nextBtn.disabled = true;
    restartBtn.disabled = true;
  }

  function resetTest() {
    const test = getCurrentTest();
    updateHeaderTestName();
    if (!test) {
      showNoTestsMessage();
      updateSidebar();
      updateHistory();
      return;
    }

    resetPerTopic();
    state.currentIndex = 0;
    state.correctCount = 0;
    state.answered = false;
    state.answers = [];
    restartBtn.disabled = false;
    renderQuestion();
    updateSidebar();
    updateHistory();
  }

  function renderQuestion() {
    const test = getCurrentTest();
    if (!test) return;

    const total = test.questions.length;
    const q = getCurrentQuestion();
    if (!q) return;
    const topic = getTopicById(q.topicId);
    const saved = state.answers[state.currentIndex];

    questionCardEl.classList.remove('glitter');
    void questionCardEl.offsetWidth;
    questionCardEl.classList.add('glitter');

    questionTextEl.textContent = q.q;
    topicLabelEl.textContent = topic ? `Temat: ${topic.name}` : 'Temat: -';
    feedbackEl.innerHTML = '';
    state.answered = !!saved;

    optionsEl.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn option-enter';
      btn.innerHTML = `<span class="key">${letters[i] || ''}</span> ${opt}`;
      btn.addEventListener('click', () => handleAnswer(i));
      if (saved) {
        btn.classList.add('disabled');
        if (i === q.answer) btn.classList.add('correct');
        if (i === saved.selected && saved.selected !== q.answer) btn.classList.add('incorrect');
      }
      optionsEl.appendChild(btn);
    });

    const answeredTotal = state.answers.filter(Boolean).length;
    updateQuizStats(state.currentIndex);
    globalStatsEl.textContent = `Poprawnych odpowiedzi: ${state.correctCount} z ${answeredTotal} (na razie sprawdzonych pytań).`;

    const hasText = !!(q.ruleText || q.ruleHtml || (topic && (topic.ruleText || topic.ruleHtml)));
    const hasVideo = !!(q.ruleVideo || (topic && topic.ruleVideo));
    const hasAnyRule = hasText || hasVideo || !!(q.ruleUrl || (topic && topic.ruleUrl));

    ruleTextTriggerEl.style.display = hasText ? '' : 'none';
    ruleVideoTriggerEl.style.display = hasVideo ? '' : 'none';
    const inlineContainer = ruleTextTriggerEl.parentElement;
    if (inlineContainer) inlineContainer.style.display = hasAnyRule ? 'inline-flex' : 'none';

    ruleTextTriggerEl.onclick = (e) => {
      e.preventDefault();
      if (hasText) openRuleModal(q, topic, { show: 'text' });
    };
    ruleVideoTriggerEl.onclick = (e) => {
      e.preventDefault();
      if (hasVideo) openRuleModal(q, topic, { show: 'video' });
    };

    if (saved) {
      const fbDiv = document.createElement('div');
      fbDiv.className = 'feedback ' + (saved.correct ? 'correct' : 'incorrect');
      fbDiv.innerHTML = `<b>${saved.correct ? '✓ Dobrze!' : '✗ Niepoprawnie.'}</b><br>${q.expl}`;
      feedbackEl.innerHTML = '';
      feedbackEl.appendChild(fbDiv);
      nextBtn.disabled = state.currentIndex >= total - 1;
    } else {
      feedbackEl.innerHTML = '';
      nextBtn.disabled = true;
    }
    prevBtn.disabled = state.currentIndex === 0;
  }

  function handleAnswer(index) {
    if (state.answered) return;
    const q = getCurrentQuestion();
    const topic = getTopicById(q.topicId);
    if (!q) return;

    state.answered = true;
    safePlay(sfx.click);

    const optionButtons = optionsEl.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => btn.classList.add('disabled'));

    optionButtons[q.answer]?.classList.add('correct');

    let correct = false;
    if (index === q.answer) {
      correct = true;
      state.correctCount++;
      safePlay(sfx.correct);
    } else {
      optionButtons[index]?.classList.add('incorrect');
      safePlay(sfx.wrong);
    }

    if (topic && state.perTopic[topic.id]) {
      state.perTopic[topic.id].total++;
      if (correct) state.perTopic[topic.id].correct++;
    }

    const fbDiv = document.createElement('div');
    fbDiv.className = 'feedback ' + (correct ? 'correct' : 'incorrect');
    fbDiv.innerHTML = `<b>${correct ? '✓ Dobrze!' : '✗ Niepoprawnie.'}</b><br>${q.expl}`;
    feedbackEl.innerHTML = '';
    feedbackEl.appendChild(fbDiv);

    nextBtn.disabled = false;
    state.answers[state.currentIndex] = {
      selected: index,
      correct,
      answer: q.answer,
      topicId: q.topicId
    };

    const test = getCurrentTest();
    const total = test.questions.length;
    const answeredTotal = state.currentIndex + 1;
    const acc = Math.round((state.correctCount / answeredTotal) * 100);
    updateQuizStats(state.currentIndex);
    globalStatsEl.textContent = `Poprawnych odpowiedzi: ${state.correctCount} z ${answeredTotal}.`;

    updateSidebar();

    if (answeredTotal === total) {
      saveAttempt();
    }
  }

  function nextQuestion() {
    const test = getCurrentTest();
    if (!test) return;

    if (state.currentIndex < test.questions.length - 1) {
      safePlay(sfx.click);
      state.currentIndex++;
      renderQuestion();
    } else {
      safePlay(sfx.click);
      const total = test.questions.length;
      const acc = Math.round((state.correctCount / total) * 100);
      feedbackEl.innerHTML =
        `<div class="feedback correct"><b>Koniec testu!</b><br>` +
        `Twój wynik: ${state.correctCount} / ${total} (${acc}%).</div>`;
      nextBtn.disabled = true;
    }
  }

  function prevQuestion() {
    if (state.currentIndex > 0) {
      safePlay(sfx.click);
      state.currentIndex--;
      renderQuestion();
    }
  }

  function buildVideoEmbed(url) {
    if (!url) return '';
    const lower = url.toLowerCase();
    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
      let videoId = '';
      try {
        const ytUrl = new URL(url);
        const qpId = ytUrl.searchParams.get('v');
        const shortsMatch = ytUrl.pathname.match(/\/shorts\/([^/]+)/);
        const pathMatch = ytUrl.pathname.match(/\/(?:embed|v)\/([^/]+)/);
        if (qpId) {
          videoId = qpId;
        } else if (shortsMatch && shortsMatch[1]) {
          videoId = shortsMatch[1];
        } else if (pathMatch && pathMatch[1]) {
          videoId = pathMatch[1];
        }
      } catch (e) {
        // ignore URL parsing errors, fallback below
      }
      if (!videoId) {
        const ytIdMatch = url.match(/(?:v=|youtu\.be\/|\/shorts\/|\/embed\/|\/v\/)([^&#?/]+)/);
        if (ytIdMatch && ytIdMatch[1]) videoId = ytIdMatch[1];
      }
      const src = videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1`
        : url;
      return `<iframe src="${src}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen webkitallowfullscreen spellcheck="false"></iframe>`;
    }
    if (lower.includes('vimeo.com')) {
      const vmIdMatch = url.match(/vimeo\.com\/(\d+)/);
      const videoId = vmIdMatch && vmIdMatch[1] ? vmIdMatch[1] : '';
      const src = videoId ? `https://player.vimeo.com/video/${videoId}` : url;
      return `<iframe src="${src}" allowfullscreen></iframe>`;
    }
    return `<video src="${url}" controls></video>`;
  }

  function openRuleModal(question, topic, opts = {}) {
    const source = question && (question.ruleText || question.ruleHtml || question.ruleVideo || question.ruleUrl)
      ? question
      : topic || {};

    ruleTitleEl.textContent = source.ruleTitle || (topic ? topic.ruleTitle : 'Zasada') || 'Zasada';

    const hasText = !!(source.ruleHtml || source.ruleText);
    const hasVideo = !!source.ruleVideo;
    const hasLink = !!source.ruleUrl;
    const prefer = opts.show || (hasText ? 'text' : hasVideo ? 'video' : 'none');

    ruleTextEl.innerHTML = hasText ? (source.ruleHtml || source.ruleText) : '';
    ruleTextEl.style.display = hasText && prefer === 'text' ? 'block' : 'none';

    ruleTextLinkEl.style.display = hasText ? '' : 'none';
    ruleTextLinkEl.onclick = (e) => {
      e.preventDefault();
      if (hasText) {
        ruleTextEl.style.display = 'block';
        ruleMediaEl.style.display = 'none';
        if (hasVideo) {
          ruleMediaEl.innerHTML = '';
        }
      }
    };

    ruleLinkEl.href = source.ruleUrl || '#';
    ruleLinkEl.style.display = hasLink ? '' : 'none';

    ruleMediaEl.innerHTML = '';
    ruleMediaEl.style.display = 'none';
    ruleVideoLinkEl.style.display = hasVideo ? '' : 'none';
    if (hasVideo) {
      const videoHtml = buildVideoEmbed(source.ruleVideo);
      const showVideo = () => {
        ruleMediaEl.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'rule-media portrait';
        wrapper.innerHTML = videoHtml;
        ruleMediaEl.appendChild(wrapper);
        ruleMediaEl.style.display = 'flex';
        ruleTextEl.style.display = hasText ? 'none' : 'none';
      };
      showVideo();
      ruleVideoLinkEl.onclick = (e) => {
        e.preventDefault();
        showVideo();
      };
      if (prefer === 'video' || (!hasText && hasVideo)) {
        showVideo();
      } else {
        ruleMediaEl.style.display = 'none';
      }
    }

    if (prefer === 'text' && hasText) {
      ruleTextEl.style.display = 'block';
      ruleMediaEl.style.display = 'none';
    }

    ruleModal.classList.add('show');
  }

  function closeRuleModal() {
    ruleModal.classList.remove('show');
    // Stop any playing media by clearing iframe/video nodes
    if (ruleMediaEl) {
      ruleMediaEl.innerHTML = '';
      ruleMediaEl.style.display = 'none';
    }
  }

  function updateSidebar() {
    const test = getCurrentTest();
    topicsSummaryEl.innerHTML = '';
    if (!test) return;

    test.topics.forEach(topic => {
      const data = state.perTopic[topic.id] || { correct: 0, total: 0 };
      const total = data.total || 0;
      const correct = data.correct || 0;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

      const row = document.createElement('div');
      row.className = 'topic-row';

      const header = document.createElement('div');
      header.className = 'topic-header';
      const left = document.createElement('span');
      left.textContent = topic.name;
      const right = document.createElement('span');
      right.innerHTML =
        total === 0
          ? '<span class="topic-badge-bad">brak prób</span>'
          : (pct >= 80
            ? `${pct}% ✓`
            : `<span class="topic-badge-bad">${pct}% - warto powtórzyć</span>`);

      header.appendChild(left);
      header.appendChild(right);

      const bar = document.createElement('div');
      bar.className = 'topic-progress-bar';
      const fill = document.createElement('div');
      fill.className = 'topic-progress-fill';
      fill.style.width = pct + '%';
      bar.appendChild(fill);

      row.appendChild(header);
      row.appendChild(bar);
      topicsSummaryEl.appendChild(row);
    });
  }

  function saveAttempt() {
    const test = getCurrentTest();
    if (!test) return;
    const total = test.questions.length;
    const acc = Math.round((state.correctCount / total) * 100);
    const perTopicSummary = {};
    Object.keys(state.perTopic).forEach(id => {
      const data = state.perTopic[id];
      const tTotal = data.total || 0;
      const tAcc = tTotal > 0 ? Math.round((data.correct / tTotal) * 100) : 0;
      perTopicSummary[id] = { acc: tAcc, total: tTotal };
    });

    const attempt = {
      testId: test.id,
      subjectId: test.subjectId,
      timestamp: new Date().toISOString(),
      score: state.correctCount,
      total: total,
      acc,
      perTopic: perTopicSummary
    };

    let history = [];
    try {
      const raw = localStorage.getItem(state.historyKey);
      if (raw) history = JSON.parse(raw);
    } catch (_) {}

    history.push(attempt);
    try {
      localStorage.setItem(state.historyKey, JSON.stringify(history));
    } catch (_) {}
    updateHistory();
  }

  function updateHistory() {
    let history = [];
    try {
      const raw = localStorage.getItem(state.historyKey);
      if (raw) history = JSON.parse(raw);
    } catch (_) {}

    const test = getCurrentTest();
    if (!test) {
      historyContainerEl.innerHTML = '<div class="history-empty">Brak zapisanych prób.</div>';
      return;
    }

    const filtered = history
      .filter(h => h.testId === test.id)
      .slice(-8)
      .reverse();

    if (filtered.length === 0) {
      historyContainerEl.innerHTML = '<div class="history-empty">Brak zapisanych prób. Ukończ test, aby zapisać wynik.</div>';
      return;
    }

    const table = document.createElement('table');
    table.className = 'history-table';
    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th>Data</th><th>Wynik</th><th>Skuteczność</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    filtered.forEach(attempt => {
      const tr = document.createElement('tr');
      const date = new Date(attempt.timestamp);
      const dateStr =
        date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }) +
        ' ' +
        date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

      const tdDate = document.createElement('td');
      tdDate.textContent = dateStr;

      const tdScore = document.createElement('td');
      tdScore.textContent = `${attempt.score}/${attempt.total}`;

      const tdAcc = document.createElement('td');
      tdAcc.textContent = attempt.acc + '%';

      tr.appendChild(tdDate);
      tr.appendChild(tdScore);
      tr.appendChild(tdAcc);
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    historyContainerEl.innerHTML = '';
    historyContainerEl.appendChild(table);
  }

  // Init
  nextBtn.addEventListener('click', nextQuestion);
  prevBtn.addEventListener('click', prevQuestion);
  restartBtn.addEventListener('click', () => {
    safePlay(sfx.click);
    resetTest();
  });

  window.addEventListener('resize', syncFilterPanelOpen);
  syncFilterPanelOpen();

  initThemeSelect();
  loadAllTests()
    .then(() => {
      if (allTests.length) {
        resetTest();
      } else {
        showNoTestsMessage();
      }
    })
    .catch(() => showNoTestsMessage());

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
  }

  window.closeRuleModal = closeRuleModal;
})();
