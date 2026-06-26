// Society of Inquiry
// app.js — core application

const app = document.getElementById('app');

// ─── Investigator State ───────────────────────────────────────────────────────
let investigator = {
  alias: null,
  recoveryCode: null,
  completedRecords: [],
  lexicon: [],
  currentRecordId: null
};

// ─── Screen Router ────────────────────────────────────────────────────────────
function showScreen(screenName, data = {}) {
  app.innerHTML = screens[screenName](data);
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function generateRecoveryCode() {
  const words = ['ANCHOR','BRIDGE','CEDAR','DELTA','EMBER','FORGE','GROVE',
    'HAVEN','INLET','JOURNAL','KEEL','LANTERN','MARBLE','NORTH','OAK',
    'PILLAR','QUILL','RIDGE','STONE','TORCH','UMBER','VAULT','WILLOW',
    'YARN','ZENITH'];
  const pick = () => words[Math.floor(Math.random() * words.length)];
  const num = () => Math.floor(Math.random() * 900) + 100;
  return `${pick()}-${num()}-${pick()}`;
}

function normalizeFinding(str) {
  return str.trim().toLowerCase();
}

// ─── Screens ──────────────────────────────────────────────────────────────────
const screens = {

  // First encounter — shown when QR code is scanned
  firstEncounter: (data = {}) => `
    <div class="screen">
      <header class="site-header">
        <span class="society-name">Society of Inquiry</span>
      </header>
      <main class="screen-content">
        <div class="curator-panel">
          <p class="curator-voice">You have found something few notice.</p>
          <p class="curator-voice">Before you stands evidence of a history worth recovering. The Society invites you to look carefully.</p>
        </div>
        <div class="screen-actions">
          <button class="btn-primary" onclick="showScreen('investigation', {recordId: '${data.recordId || 'r001'}'})">Begin</button>
        </div>
      </main>
    </div>
  `,

  // Investigation screen — the heart of the experience
  investigation: (data = {}) => {
    const record = getRecord(data.recordId);
    if (!record) return screens.notFound();

    return `
      <div class="screen">
        <header class="site-header">
          <span class="society-name">Society of Inquiry</span>
          <span class="record-designation">${record.designation}</span>
        </header>
        <main class="screen-content">

          <div class="record-title-block">
            <h1 class="record-title">${record.title}</h1>
          </div>

          ${record.curatorIntroduction ? `
          <div class="curator-panel">
            <p class="curator-label">The Curator</p>
            ${record.curatorIntroduction.map(p => `<p class="curator-voice">${p}</p>`).join('')}
          </div>` : ''}

          <div class="investigation-prompt">
            <p class="prompt-text">${record.puzzle.prompt}</p>
            ${record.puzzle.instructions ? `<p class="prompt-instructions">${record.puzzle.instructions}</p>` : ''}
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
            <button class="btn-primary" onclick="submitFinding('${data.recordId}')">
              Submit Finding
            </button>
          </div>

          <div id="hint-area"></div>

          ${record.puzzle.hint ? `
          <div class="hint-section">
            <button class="btn-secondary" onclick="showHint('${data.recordId}')">
              Request a Curator Hint
            </button>
          </div>` : ''}

        </main>
      </div>
    `;
  },

  // Registration screen
  register: (data = {}) => `
    <div class="screen">
      <header class="site-header">
        <span class="society-name">Society of Inquiry</span>
      </header>
      <main class="screen-content">
        <div class="curator-panel">
          <p class="curator-label">The Curator</p>
          <p class="curator-voice">Well observed, Investigator. Before your Discovery is preserved, the Society asks that you choose a name by which you will be known.</p>
          <p class="curator-voice">No personal information is required. Choose any name you wish.</p>
        </div>
        <div class="finding-form">
          <input 
            type="text" 
            id="alias-input" 
            class="finding-input" 
            placeholder="Choose your alias"
            autocomplete="off"
            maxlength="30"
          />
          <button class="btn-primary" onclick="completeRegistration('${data.recordId}')">
            Join the Society
          </button>
        </div>
      </main>
    </div>
  `,

  // Completion screen — shown after a record is solved
  completion: (data = {}) => {
    const record = getRecord(data.recordId);
    if (!record) return screens.notFound();

    return `
      <div class="screen">
        <header class="site-header">
          <span class="society-name">Society of Inquiry</span>
          <span class="record-designation">${record.designation}</span>
        </header>
        <main class="screen-content">

          <div class="record-title-block">
            <h1 class="record-title">${record.title}</h1>
            <p class="completion-label">Record Recovered</p>
          </div>

          <div class="curator-panel">
            <p class="curator-label">The Curator</p>
            ${record.completion.curatorAcknowledgement.map(p => 
              `<p class="curator-voice">${p}</p>`).join('')}
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
                `<li class="lexicon-entry">${entry}</li>`).join('')}
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

  // Archive screen — the investigator's personal record
  archive: () => `
    <div class="screen">
      <header class="site-header">
        <span class="society-name">Society of Inquiry</span>
      </header>
      <main class="screen-content">
        <div class="record-title-block">
          <h1 class="record-title">The Archive</h1>
          ${investigator.alias ? `<p class="investigator-alias">Investigator ${investigator.alias}</p>` : ''}
        </div>
        <div class="curator-panel">
          <p class="curator-label">The Curator</p>
          <p class="curator-voice">Archive coming soon. Your next assignment will appear here.</p>
        </div>
      </main>
    </div>
  `,

  // Not found
  notFound: () => `
    <div class="screen">
      <header class="site-header">
        <span class="society-name">Society of Inquiry</span>
      </header>
      <main class="screen-content">
        <div class="curator-panel">
          <p class="curator-voice">The Record you seek has not been found in the Archive.</p>
        </div>
      </main>
    </div>
  `

};

// ─── Investigation Logic ───────────────────────────────────────────────────────
function submitFinding(recordId) {
  const input = document.getElementById('finding-input');
  const finding = input ? input.value : '';
  const record = getRecord(recordId);

  if (!finding.trim()) {
    showCuratorResponse('The Society is unable to accept an empty finding. Observe carefully and submit what the evidence supports.');
    return;
  }

  const normalized = normalizeFinding(finding);
  const accepted = record.puzzle.acceptableFindings.some(f => 
    normalizeFinding(f) === normalized
  );

  if (accepted) {
    // Add lexicon entries
    if (record.lexiconEntries) {
      investigator.lexicon.push(...record.lexiconEntries);
    }
    investigator.completedRecords.push(recordId);

    // Go to registration if new, completion if returning
    if (!investigator.alias) {
      showScreen('register', { recordId });
    } else {
      showScreen('completion', { recordId });
    }
  } else {
    showCuratorResponse('Your finding appears inconsistent with the evidence. Continue your observation and submit only what the evidence supports.');
  }
}

function showCuratorResponse(message) {
  const hintArea = document.getElementById('hint-area');
  if (hintArea) {
    hintArea.innerHTML = `
      <div class="curator-panel curator-response">
        <p class="curator-label">The Curator</p>
        <p class="curator-voice">${message}</p>
      </div>
    `;
  }
}

function showHint(recordId) {
  const record = getRecord(recordId);
  if (record && record.puzzle.hint) {
    showCuratorResponse(record.puzzle.hint);
  }
}

function completeRegistration(recordId) {
  const input = document.getElementById('alias-input');
  const alias = input ? input.value.trim() : '';

  if (!alias) {
    return;
  }

  investigator.alias = alias;
  investigator.recoveryCode = generateRecoveryCode();

  showScreen('recoveryCode', { recordId });
}

// ─── Recovery Code Screen ─────────────────────────────────────────────────────
screens.recoveryCode = (data = {}) => `
  <div class="screen">
    <header class="site-header">
      <span class="society-name">Society of Inquiry</span>
    </header>
    <main class="screen-content">
      <div class="curator-panel">
        <p class="curator-label">The Curator</p>
        <p class="curator-voice">Welcome, Investigator ${investigator.alias}.</p>
        <p class="curator-voice">Your Recovery Phrase has been assigned. Record it somewhere safe — not on this device. It is the only means by which your progress may be restored should this device be lost.</p>
      </div>
      <div class="recovery-code-display">
        <p class="recovery-code">${investigator.recoveryCode}</p>
      </div>
      <div class="screen-actions">
        <button class="btn-primary" onclick="showScreen('completion', {recordId: '${data.recordId}'})">
          I have recorded my Recovery Phrase
        </button>
      </div>
    </main>
  </div>
`;

// ─── Data ─────────────────────────────────────────────────────────────────────
function getRecord(recordId) {
  return records[recordId] || null;
}

// Records will be loaded from data/records.json
// For now, a placeholder record for development
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
      instructions: 'Enter the finding as a number, Roman numeral, or written word.',
      hint: 'Count the stars carefully, then consider whether their number corresponds to the names preserved here.',
      acceptableFindings: ['15', 'fifteen', 'XV', 'xv']
    },
    lexiconEntries: ['memorial', 'circle', 'servicemen'],
    completion: {
      curatorAcknowledgement: [
        'Well observed, Investigator.',
        'The circle contains fifteen stars, honoring the fifteen servicemen named by the memorial.'
      ],
      narrative: [
        'This arrangement was not accidental. The designer chose to honor each name individually, placing a star for every life given in service.',
        'Most pass this memorial daily without noticing what you have now recovered.'
      ]
    }
  }
};

// ─── Initialise ───────────────────────────────────────────────────────────────
// Check URL for record ID from QR code
const urlParams = new URLSearchParams(window.location.search);
const recordFromUrl = urlParams.get('r');

if (recordFromUrl && records[recordFromUrl]) {
  investigator.currentRecordId = recordFromUrl;
  showScreen('firstEncounter', { recordId: recordFromUrl });
} else {
  showScreen('firstEncounter', { recordId: 'r001' });
}