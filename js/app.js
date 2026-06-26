/* ============================================================
   Society of Inquiry
   Established circa 1847
   app.js — core application
   ============================================================ */

// ── Investigator State ────────────────────────────────────────
const investigator = {
  alias: null,
  recoveryCode: null,
  completedRecords: [],
  lexicon: [],
  currentRecordId: null,
  hintPetitions: {}
};

// ── App Root ──────────────────────────────────────────────────
const app = document.getElementById('app');

// ── Utilities ─────────────────────────────────────────────────
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function normalizeFinding(str) {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

function generateRecoveryCode() {
  const words = [
    'ANCHOR','BRIDGE','CEDAR','CHRONICLE','COMPASS','DELTA','DOSSIER',
    'EMBER','EPOCH','FORGE','GAZETTE','GROVE','HAVEN','HERALD','INLET',
    'JOURNAL','KEEL','LANTERN','LEDGER','MARBLE','MERIDIAN','NORTH',
    'OBSERVE','OAK','PILLAR','PRESERVE','QUILL','RECORD','RIDGE',
    'SOCIETY','STONE','TORCH','TOME','UMBER','VAULT','VIGIL','WILLOW'
  ];
  const pick = () => words[Math.floor(Math.random() * words.length)];
  const num = () => Math.floor(Math.random() * 900) + 100;
  return `${pick()}-${num()}-${pick()}`;
}

function saveInvestigator() {
  localStorage.setItem('soi_investigator', JSON.stringify(investigator));
}

function loadInvestigator() {
  const saved = localStorage.getItem('soi_investigator');
  if (saved) {
    try {
      Object.assign(investigator, JSON.parse(saved));
      return true;
    } catch(e) {
      return false;
    }
  }
  return false;
}

// ── Scroll to bottom ──────────────────────────────────────────
function scrollToBottom() {
  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }, 100);
}

// ── Masthead ──────────────────────────────────────────────────
function masthead(designation) {
  return `
    <header class="site-masthead">
      <span class="society-name">Society of Inquiry</span>
      <span class="society-established">Est. circa 1847</span>
      ${designation ? `<span class="record-designation">${designation}</span>` : ''}
    </header>
  `;
}

// ── Typewriter Engine ─────────────────────────────────────────
function typewriteElement(element, text, mode, onComplete) {
  element.textContent = '';
  element.style.visibility = 'visible';

  const isCurator = mode === 'curator';
  const backspaceMoments = isCurator ? selectBackspaceMoments(text) : [];

  let i = 0;
  let displayed = '';
  let correcting = false;

  function next() {
    if (i >= text.length) {
      if (onComplete) setTimeout(onComplete, 200);
      return;
    }

    const char = text[i];
    const peek = text[i + 1] || '';

    if (isCurator && backspaceMoments.includes(i) && !correcting) {
      correcting = true;
      const wrong = getWrongChar(char);
      displayed += wrong;
      element.textContent = displayed;

      setTimeout(() => {
        displayed = displayed.slice(0, -1);
        element.textContent = displayed;
        setTimeout(() => {
          correcting = false;
          displayed += char;
          element.textContent = displayed;
          i++;
          setTimeout(next, charDelay(char, peek, mode));
        }, randomBetween(100, 200));
      }, randomBetween(200, 350));
      return;
    }

    displayed += char;
    element.textContent = displayed;
    i++;

    // Scroll to keep typing visible
    element.scrollIntoView({ behavior: 'smooth', block: 'end' });

    setTimeout(next, charDelay(char, peek, mode));
  }

  const startPause = isCurator
    ? randomBetween(400, 700)
    : randomBetween(150, 300);

  setTimeout(next, startPause);
}

function charDelay(char, next, mode) {
  const isCurator = mode === 'curator';
  const slow = isCurator ? 1 : 0.6;

  if ('.!?'.includes(char))  return randomBetween(500, 800) * slow;
  if (',;:'.includes(char))  return randomBetween(200, 380) * slow;
  if (char === '—')          return randomBetween(280, 460) * slow;
  if (char === ' ')          return randomBetween(35, 110) * slow;
  return randomBetween(25, 52) * slow;
}

function selectBackspaceMoments(text) {
  const moments = [];
  const len = text.length;
  if (len < 40) return moments;

  const candidates = [];
  for (let i = 12; i < len - 12; i++) {
    if (
      text[i].match(/[a-zA-Z]/) &&
      text[i-1] !== ' ' &&
      text[i+1] !== ' '
    ) {
      candidates.push(i);
    }
  }

  const count = Math.max(1, Math.floor(len / 220));
  const step = Math.floor(candidates.length / (count + 1));
  for (let n = 1; n <= count; n++) {
    const idx = candidates[step * n];
    if (idx) moments.push(idx);
  }
  return moments;
}

function getWrongChar(correct) {
  const adjacents = {
    'a':'s','b':'v','c':'x','d':'s','e':'r','f':'g','g':'h',
    'h':'j','i':'o','j':'k','k':'l','l':'k','m':'n','n':'m',
    'o':'i','p':'o','r':'e','s':'a','t':'r','u':'y','v':'b',
    'w':'e','y':'u','z':'x',
    'A':'S','B':'V','C':'X','D':'S','E':'R','F':'G','G':'H',
    'H':'J','I':'O','J':'K','K':'L','L':'K','M':'N','N':'M',
    'O':'I','P':'O','R':'E','S':'A','T':'R','U':'Y','V':'B',
    'W':'E','Y':'U','Z':'X'
  };
  return adjacents[correct] || (correct === correct.toUpperCase()
    ? correct.toLowerCase()
    : correct.toUpperCase());
}

// ── Typewrite a sequence of elements ─────────────────────────
function typewriteSequence(items, onComplete) {
  if (!items.length) {
    if (onComplete) onComplete();
    return;
  }

  const { element, mode } = items[0];
  const rest = items.slice(1);

  const text = element.getAttribute('data-text') || '';
  if (!text) {
    typewriteSequence(rest, onComplete);
    return;
  }

  element.textContent = '';
  element.style.visibility = 'visible';

  typewriteElement(element, text, mode, () => {
    const pause = mode === 'curator'
      ? randomBetween(450, 750)
      : randomBetween(200, 400);
    setTimeout(() => typewriteSequence(rest, onComplete), pause);
  });
}

// ── Screen Router ─────────────────────────────────────────────
function showScreen(screenName, data = {}) {
  window.scrollTo(0, 0);
  app.innerHTML = screens[screenName](data);
  initScreen(screenName);
}

function initScreen(screenName) {
  // Hide all typed elements
  app.querySelectorAll('[data-text]').forEach(el => {
    el.textContent = '';
    el.style.visibility = 'hidden';
  });

  // Hide everything below typing area
  app.querySelectorAll(
    '.btn-primary, .btn-secondary, .finding-form, ' +
    '.investigation-prompt, .hint-section, ' +
    '.recovery-code-display, .historical-narrative, ' +
    '.lexicon-additions, .screen-actions, ' +
    '.screen-rule, .archive-header'
  ).forEach(el => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.7s ease';
    el.style.pointerEvents = 'none';
  });

  // Build typing sequence
  const sequence = [];

  if (screenName === 'firstEncounter') {
    app.querySelectorAll('.opening-statement [data-text]').forEach(el => {
      sequence.push({ element: el, mode: 'typeset' });
    });
  } else {
    app.querySelectorAll('.curator-panel [data-text]').forEach(el => {
      sequence.push({ element: el, mode: 'curator' });
    });
  }

  // After typing completes — reveal everything below then scroll to it
  typewriteSequence(sequence, () => {
    setTimeout(() => {
      app.querySelectorAll(
        '.btn-primary, .btn-secondary, .finding-form, ' +
        '.investigation-prompt, .hint-section, ' +
        '.recovery-code-display, .historical-narrative, ' +
        '.lexicon-additions, .screen-actions, ' +
        '.screen-rule, .archive-header'
      ).forEach(el => {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      });
      // Scroll to bottom to reveal newly shown elements
      scrollToBottom();
    }, 400);
  });
}

// ── Curator Response ──────────────────────────────────────────
function showCuratorResponse(container, paragraphs, onComplete) {
  container.innerHTML = `
    <div class="curator-panel curator-response">
      <p class="curator-label">The Curator</p>
      ${paragraphs.map(p =>
        `<p class="curator-voice" data-text="${p}"></p>`
      ).join('')}
    </div>
  `;

  const voices = container.querySelectorAll('[data-text]');
  voices.forEach(v => { v.style.visibility = 'hidden'; });

  const sequence = Array.from(voices).map(el => ({
    element: el,
    mode: 'curator'
  }));

  typewriteSequence(sequence, () => {
    if (onComplete) setTimeout(onComplete, 400);
  });
}

// ── Screens ───────────────────────────────────────────────────
const screens = {

  firstEncounter: (data = {}) => `
    <div class="screen" id="screen-firstEncounter">
      ${masthead()}
      <main class="screen-content">

        <div class="society-seal">✦ ✦ ✦</div>

        <div class="opening-statement">
          <p data-text="You have found what most pass without a second thought."></p>
          <p data-text="This place holds a history that has been contested, obscured, and — the Society has reason to believe — deliberately concealed. Since 1847, we have laboured to recover what remains. Much has been lost. What survives is not always to be trusted."></p>
          <p data-text="For this reason, our records are maintained in cipher. Those who discover our markers are invited to assist in their decipherment — to examine the evidence before them with patience and care, and to record only what they can honestly verify."></p>
          <p data-text="We do not ask for your name. We ask only that you look carefully."></p>
        </div>

        <hr class="screen-rule" />

        <div class="screen-actions">
          <button class="btn-primary" onclick="beginInvestigation('${data.recordId || 'r001'}')">
            I am willing to proceed
          </button>
        </div>

      </main>
    </div>
  `,

  investigation: (data = {}) => {
    const record = getRecord(data.recordId);
    if (!record) return screens.notFound();

    return `
      <div class="screen" id="screen-investigation">
        ${masthead(record.designation)}
        <main class="screen-content">

          <div class="record-title-block">
            <h1 class="record-title">${record.title}</h1>
          </div>

          <div class="curator-panel" id="curator-intro">
            <p class="curator-label">The Curator</p>
            ${record.curatorIntroduction.map(p =>
              `<p class="curator-voice" data-text="${p}"></p>`
            ).join('')}
          </div>

          <div class="investigation-prompt">
            <p class="prompt-text">${record.puzzle.prompt}</p>
            ${record.puzzle.instructions
              ? `<p class="prompt-instructions">${record.puzzle.instructions}</p>`
              : ''}
          </div>

          <div class="finding-form">
            <input
              type="text"
              id="finding-input"
              class="finding-input"
              placeholder="Enter your finding"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
            />
            <button
              class="btn-primary"
              id="submit-btn"
              onclick="submitFinding('${data.recordId}')">
              Submit Finding
            </button>
          </div>

          <div id="curator-response-area"></div>

          <div class="hint-section" id="hint-section" style="display:none">
            <button
              class="btn-secondary"
              id="hint-btn"
              onclick="petitionForHint('${data.recordId}')">
              Petition the Curator for Guidance
            </button>
          </div>

        </main>
      </div>
    `;
  },

  register: (data = {}) => `
    <div class="screen" id="screen-register">
      ${masthead()}
      <main class="screen-content">

        <div class="curator-panel" id="curator-register">
          <p class="curator-label">The Curator</p>
          <p class="curator-voice" data-text="Your finding has been provisionally noted in the Society's records."></p>
          <p class="curator-voice" data-text="Before it may be formally entered into your Ledger, the Society asks that you establish an identity by which your contributions will be known. No personal information is required or desired."></p>
          <p class="curator-voice" data-text="Choose any name you wish — a family name, an invented one, or something else entirely. It need only be yours, and you need only remember it."></p>
          <p class="curator-voice" data-text="By what name shall the Society know you?"></p>
        </div>

        <div class="finding-form">
          <input
            type="text"
            id="alias-input"
            class="finding-input"
            placeholder="Your chosen name"
            autocomplete="off"
            maxlength="30"
          />
          <button class="btn-primary" onclick="completeRegistration('${data.recordId}')">
            This is my name
          </button>
        </div>

      </main>
    </div>
  `,

  recoveryCode: (data = {}) => `
    <div class="screen" id="screen-recoveryCode">
      ${masthead()}
      <main class="screen-content">

        <div class="curator-panel" id="curator-recovery">
          <p class="curator-label">The Curator</p>
          <p class="curator-voice" data-text="Very well. The Society shall know you as Investigator ${investigator.alias}."></p>
          <p class="curator-voice" data-text="A Recovery Phrase has been assigned to your Ledger. This phrase is the sole means by which your record may be restored should you lose access to this device. The Society is not able to recover it on your behalf."></p>
          <p class="curator-voice" data-text="Write it down. Keep it somewhere apart from this device. Treat it as you would any document of genuine importance."></p>
        </div>

        <div class="recovery-code-display">
          <p class="recovery-code">${investigator.recoveryCode}</p>
          <p class="recovery-warning">Record this phrase before proceeding.</p>
        </div>

        <div class="screen-actions">
          <button class="btn-primary" onclick="showScreen('completion', {recordId: '${data.recordId}'})">
            I have recorded my Recovery Phrase
          </button>
        </div>

      </main>
    </div>
  `,

  completion: (data = {}) => {
    const record = getRecord(data.recordId);
    if (!record) return screens.notFound();

    return `
      <div class="screen" id="screen-completion">
        ${masthead(record.designation)}
        <main class="screen-content">

          <div class="record-title-block">
            <h1 class="record-title">${record.title}</h1>
            <p class="completion-label">Record Recovered</p>
          </div>

          <div class="curator-panel" id="curator-completion">
            <p class="curator-label">The Curator</p>
            ${record.completion.curatorAcknowledgement.map(p =>
              `<p class="curator-voice" data-text="${p}"></p>`
            ).join('')}
          </div>

          ${record.completion.narrative ? `
          <div class="historical-narrative">
            ${record.completion.narrative.map(p => `<p>${p}</p>`).join('')}
          </div>` : ''}

          ${record.lexiconEntries && record.lexiconEntries.length > 0 ? `
          <div class="lexicon-additions">
            <p class="lexicon-label">Added to your Lexicon</p>
            <ul class="lexicon-list">
              ${record.lexiconEntries.map(entry =>
                `<li class="lexicon-entry">${entry}</li>`
              ).join('')}
            </ul>
          </div>` : ''}

          <div class="screen-actions">
            <button class="btn-primary" onclick="showScreen('archive')">
              Enter the Archive
            </button>
          </div>

        </main>
      </div>
    `;
  },

  archive: () => `
    <div class="screen" id="screen-archive">
      ${masthead()}
      <main class="screen-content">

        <div class="archive-header">
          <h1 class="archive-title">The Archive</h1>
          ${investigator.alias
            ? `<p class="investigator-alias">Investigator ${investigator.alias}</p>`
            : ''}
        </div>

        <div class="curator-panel" id="curator-archive">
          <p class="curator-label">The Curator</p>
          <p class="curator-voice" data-text="Your Ledger is being prepared. The Society is consulting its records to determine which site would most benefit from your attention next. You will receive your assignment presently."></p>
          <p class="curator-voice" data-text="What you have already recovered is preserved below."></p>
        </div>

        ${investigator.completedRecords.length > 0 ? `
        <div class="lexicon-additions">
          <p class="lexicon-label">Records Recovered</p>
          <ul class="lexicon-list">
            ${investigator.completedRecords.map(id => {
              const r = getRecord(id);
              return r ? `<li class="lexicon-entry">${r.title}</li>` : '';
            }).join('')}
          </ul>
        </div>` : ''}

        ${investigator.lexicon.length > 0 ? `
        <div class="lexicon-additions">
          <p class="lexicon-label">Your Lexicon</p>
          <ul class="lexicon-list">
            ${investigator.lexicon.map(entry =>
              `<li class="lexicon-entry">${entry}</li>`
            ).join('')}
          </ul>
        </div>` : ''}

      </main>
    </div>
  `,

  notFound: () => `
    <div class="screen" id="screen-notFound">
      ${masthead()}
      <main class="screen-content">
        <div class="curator-panel">
          <p class="curator-label">The Curator</p>
          <p class="curator-voice" data-text="The Record you seek has not been found in the Archive. The Society regrets that it is unable to assist further at this time."></p>
        </div>
      </main>
    </div>
  `
};

// ── Investigation Logic ───────────────────────────────────────
function beginInvestigation(recordId) {
  investigator.currentRecordId = recordId;
  showScreen('investigation', { recordId });
}

function submitFinding(recordId) {
  const input = document.getElementById('finding-input');
  const submitBtn = document.getElementById('submit-btn');
  const responseArea = document.getElementById('curator-response-area');
  const finding = input ? input.value : '';
  const record = getRecord(recordId);

  if (!finding.trim()) {
    showCuratorResponse(
      responseArea,
      ['The Society is unable to accept an empty finding. Observe carefully and submit only what the evidence before you supports.']
    );
    return;
  }

  // Hide the prompt, form, and hint during review
  const investigationPrompt = document.querySelector('.investigation-prompt');
  const findingForm = document.querySelector('.finding-form');
  const hintSection = document.querySelector('.hint-section');
// Reveal hint button after first wrong finding
          if (hintSection) hintSection.style.display = 'block';
  [investigationPrompt, findingForm, hintSection].forEach(el => {
    if (el) {
      el.style.transition = 'opacity 0.4s ease';
      el.style.opacity = '0';
      setTimeout(() => { el.style.display = 'none'; }, 400);
    }
  });

  // Show reviewing message — typed, then breathing
  responseArea.innerHTML = `
    <div class="reviewing-panel" id="reviewing-panel">
      <p class="curator-voice" data-text="The Curator is reviewing your finding. Patience is a virtue."></p>
    </div>
  `;

  const reviewPanel = document.getElementById('reviewing-panel');
  const reviewVoice = reviewPanel.querySelector('[data-text]');
  reviewVoice.style.visibility = 'hidden';

  // Type the message, then begin breathing
  typewriteElement(reviewVoice, reviewVoice.getAttribute('data-text'), 'curator', () => {
    setTimeout(() => {
      const p = document.getElementById('reviewing-panel');
      if (p) p.classList.add('breathing');
    }, 300);
  });

  // 15 second pause then evaluate
  setTimeout(() => {
    const p = document.getElementById('reviewing-panel');
    if (p) p.classList.remove('breathing');

    const normalized = normalizeFinding(finding);
    const accepted = record.puzzle.acceptableFindings.some(f =>
      normalizeFinding(f) === normalized
    );

    if (accepted) {
      if (record.lexiconEntries) {
        record.lexiconEntries.forEach(entry => {
          if (!investigator.lexicon.includes(entry)) {
            investigator.lexicon.push(entry);
          }
        });
      }
      if (!investigator.completedRecords.includes(recordId)) {
        investigator.completedRecords.push(recordId);
      }
      saveInvestigator();

      if (!investigator.alias) {
        showScreen('register', { recordId });
      } else {
        showScreen('completion', { recordId });
      }

    } else {
      // Show incorrect response, then restore prompt and form below
      showCuratorResponse(
        responseArea,
        [
          'Your finding does not agree with other observations.',
          'Return your attention to what stands before you, and submit only what you are able to verify directly.'
        ],
        () => {
          // Move and restore prompt, form, and hint BELOW the response
          const screenContent = document.querySelector('.screen-content');

          [investigationPrompt, findingForm, hintSection].forEach(el => {
            if (el) {
              screenContent.appendChild(el);
              el.style.display = el === findingForm ? 'flex' : 'block';
              el.style.opacity = '0';
              el.style.transition = 'opacity 0.6s ease';
              setTimeout(() => { el.style.opacity = '1'; }, 50);
            }
          });

          if (input) {
            input.disabled = false;
            input.value = '';
          }
          if (submitBtn) submitBtn.disabled = false;

          // Scroll to bottom to reveal restored elements
          scrollToBottom();
        }
      );
    }
  }, 15000);
}

// ── Hint Petition ─────────────────────────────────────────────
function petitionForHint(recordId) {
  const record = getRecord(recordId);
  const responseArea = document.getElementById('curator-response-area');
  const hintBtn = document.getElementById('hint-btn');

  if (!record || !record.puzzle.hint) return;

  if (!investigator.hintPetitions[recordId]) {
    investigator.hintPetitions[recordId] = 0;
  }
  investigator.hintPetitions[recordId]++;
  const petitionCount = investigator.hintPetitions[recordId];

  if (hintBtn) hintBtn.disabled = true;

  const admonition = petitionCount === 1
    ? "Your petition has been received. The Curator's time is not without limit. Reflect carefully upon what you have already observed before the Curator's response arrives. Further petitions may require considerably more time."
    : "Your petition has been received. The Curator notes that this matter has required his attention previously. He asks that you make every effort to arrive at your finding independently before petitioning again.";

  showCuratorResponse(responseArea, [admonition]);

  const hintDelay = Math.min(15000 * petitionCount, 60000);

  setTimeout(() => {
    showCuratorResponse(
      responseArea,
      [
        'The Curator offers the following observation, in the hope that it may direct your attention more precisely.',
        record.puzzle.hint,
        'The Society trusts that you will arrive at your finding through your own careful observation.'
      ]
    );
    if (hintBtn) hintBtn.disabled = false;
  }, hintDelay);
}

// ── Registration ──────────────────────────────────────────────
function completeRegistration(recordId) {
  const input = document.getElementById('alias-input');
  const alias = input ? input.value.trim() : '';

  if (!alias) {
    const area = document.createElement('div');
    area.style.marginTop = '1rem';
    input.parentNode.appendChild(area);
    showCuratorResponse(area, ['The Society requires a name before it may proceed.']);
    return;
  }

  investigator.alias = alias;
  investigator.recoveryCode = generateRecoveryCode();
  saveInvestigator();

  showScreen('recoveryCode', { recordId });
}

// ── Records ───────────────────────────────────────────────────
function getRecord(recordId) {
  return records[recordId] || null;
}

const records = {
  'r001': {
    id: 'r001',
    designation: 'Record I',
    title: 'The Circle of Fifteen',
    curatorIntroduction: [
      'Welcome, Investigator. Before you stands a memorial whose arrangement carries meaning beyond its inscription.',
      'Observe carefully. Every detail has purpose.'
    ],
    puzzle: {
      prompt: 'How many stars form the memorial\'s circle?',
      instructions: 'Enter your finding as a number, Roman numeral, or written word.',
      hint: 'Count the stars carefully, then consider whether their number corresponds to the names preserved upon the memorial.',
      acceptableFindings: ['15', 'fifteen', 'XV', 'xv']
    },
    lexiconEntries: ['memorial', 'circle', 'servicemen'],
    completion: {
      curatorAcknowledgement: [
        'Well observed, Investigator.',
        'The circle contains fifteen stars, honouring the fifteen servicemen named by the memorial.'
      ],
      narrative: [
        'This arrangement was not accidental. The designer chose to honour each name individually, placing a star for every life given in service to this community.',
        'Most pass this memorial daily without noticing what you have now recovered.'
      ]
    }
  }
};

// ── Initialise ────────────────────────────────────────────────
loadInvestigator();

const urlParams = new URLSearchParams(window.location.search);
const recordFromUrl = urlParams.get('r');

if (recordFromUrl && records[recordFromUrl]) {
  investigator.currentRecordId = recordFromUrl;
  showScreen('firstEncounter', { recordId: recordFromUrl });
} else {
  showScreen('firstEncounter', { recordId: 'r001' });
}