/* ============================================================
   Society of Inquiry
   Established circa 1847
   app.js — core application
   ============================================================ */

// ── Investigator State ────────────────────────────────────────
const investigator = {
  alias: null,
  recoveryCode: null,
  cloudId: null,
  completedRecords: [],
  lexicon: [],
  currentRecordId: null,
  currentStage: 0,
  hintPetitions: {},
  submissionCount: 0
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
let currentTypewriterSkipped = false;

function typewriteElement(element, text, mode, onComplete) {
  element.textContent = '';
  element.style.visibility = 'visible';

  function skipOnClick() { currentTypewriterSkipped = true; }
  element.addEventListener('click', skipOnClick);

  const isCurator = mode === 'curator';
  const backspaceMoments = isCurator ? selectBackspaceMoments(text) : [];

  let i = 0;
  let displayed = '';
  let correcting = false;

  function next() {
    if (currentTypewriterSkipped) {
      element.textContent = text;
      element.removeEventListener('click', skipOnClick);
      if (onComplete) setTimeout(onComplete, 200);
      return;
    }

    if (i >= text.length) {
      element.removeEventListener('click', skipOnClick);
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

    if (element.style.visibility !== 'hidden' && element.closest('.assignment-puzzle')?.style.opacity !== '0') {
      element.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }

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
  currentTypewriterSkipped = false;
  window.scrollTo(0, 0);
  app.innerHTML = screens[screenName](data);
  initScreen(screenName);
}

function initScreen(screenName) {
  app.querySelectorAll('[data-text]').forEach(el => {
    el.textContent = '';
    el.style.visibility = 'hidden';
    if (el.closest('.assignment-puzzle')) {
      el.dataset.skip = 'true';
    }
  });

  app.querySelectorAll(
    '.btn-primary, .btn-secondary, .finding-form, ' +
    '.investigation-prompt, .hint-section, ' +
    '.recovery-code-display, .historical-narrative, ' +
    '.lexicon-additions, .screen-actions, ' +
    '.screen-rule, .archive-header, ' +
    '.assignment-puzzle, .ledger-section, ' +
    '.assignment-puzzle .finding-form'
  ).forEach(el => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.7s ease';
    el.style.pointerEvents = 'none';
  });

  const sequence = [];

  if (screenName === 'firstEncounter') {
    app.querySelectorAll('.opening-statement [data-text]').forEach(el => {
      sequence.push({ element: el, mode: 'typeset' });
    });
  } else {
    app.querySelectorAll('.curator-panel [data-text]').forEach(el => {
      if (!el.dataset.skip) {
        sequence.push({ element: el, mode: 'curator' });
      }
    });
  }

  function skipTypingOnClick() {
    currentTypewriterSkipped = true;
    setTimeout(() => { currentTypewriterSkipped = false; }, 300);
  }
  app.addEventListener('click', skipTypingOnClick);

  typewriteSequence(sequence, () => {
    app.removeEventListener('click', skipTypingOnClick);
    setTimeout(() => {
      app.querySelectorAll(
        '.btn-primary, .btn-secondary, .finding-form, ' +
        '.investigation-prompt, .hint-section, ' +
        '.recovery-code-display, .historical-narrative, ' +
        '.lexicon-additions, .screen-actions, ' +
        '.screen-rule, .archive-header, ' +
        '.assignment-puzzle, .ledger-section, ' +
        '.assignment-puzzle .finding-form'
      ).forEach(el => {
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
      });

      if (screenName === 'archive') {
        const assignmentPanel = document.querySelector('.assignment-puzzle .curator-panel');
        const form = document.querySelector('.assignment-puzzle .finding-form');
        if (form) {
          form.style.opacity = '0';
          form.style.pointerEvents = 'none';
        }

        function runAssignmentTypewriter() {
          if (!assignmentPanel) return;
          const voices = Array.from(assignmentPanel.querySelectorAll('[data-text]'));
          voices.forEach(v => {
            v.textContent = '';
            v.style.visibility = 'hidden';
          });
          typewriteSequence(voices.map(el => ({ element: el, mode: 'curator' })), () => {
            if (form) {
              form.style.opacity = '1';
              form.style.pointerEvents = 'auto';
            }
            scrollToBottom();
          });
        }

        if (investigator.cloudId) {
          generateAssignment(
            investigator.cloudId,
            'r002',
            investigator.lexicon,
            investigator.completedRecords.length,
            [54, 50],
            investigator.alias
          ).then(result => {
            if (result && result.puzzle_content && result.puzzle_content.puzzle_text) {
              investigator.currentAssignmentId = result.assignment_id || null;
              investigator.currentStepId = result.step_id || null;
              const secondVoice = assignmentPanel ? assignmentPanel.querySelectorAll('[data-text]')[0] : null;
              if (secondVoice) {
                const puzzleText = result.puzzle_content.puzzle_text
                  .replace(/Present both results here,?\s*separated by a space or comma\.?/gi, 'Present both results here:');
                secondVoice.setAttribute('data-text', puzzleText);
              }
            }
            runAssignmentTypewriter();
          }).catch(() => {
            runAssignmentTypewriter();
          });
        } else {
          runAssignmentTypewriter();
        }
      } else {
        scrollToBottom();
      }
    }, 400);
  });
}

// ── Curator Response ──────────────────────────────────────────
function showCuratorResponse(container, paragraphs, onComplete) {
  currentTypewriterSkipped = false;
  container.innerHTML = `
    <div class="curator-panel curator-response">
      <p class="curator-label">The Curator</p>
      ${paragraphs.map(p =>
        `<p class="curator-voice" data-text="${p.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}"></p>`
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

// ── Stage Prompt ──────────────────────────────────────────────
function showStagePrompt(recordId, stageIndex) {
  investigator.currentStage = stageIndex;
  saveInvestigator();

  const record = getRecord(recordId);
  const tier = getInvestigationTier(record);
  const stages = tier.stages;
  const stage = stages[stageIndex];

  if (!stage) return;

  const screenContent = document.querySelector('.screen-content');

  const promptBlock = document.createElement('div');
  promptBlock.className = 'stage-prompt-block';
  promptBlock.innerHTML = `
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
        onclick="submitFinding('${recordId}')">
        Submit Finding
      </button>
    </div>
    <div id="curator-response-area"></div>
    <div class="hint-section" id="hint-section" style="display:none">
      <button
        class="btn-secondary"
        id="hint-btn"
        onclick="petitionForHint('${recordId}')">
        Petition the Curator for Guidance
      </button>
    </div>
  `;

  promptBlock.style.opacity = '0';
  promptBlock.style.transition = 'opacity 0.7s ease';
  screenContent.appendChild(promptBlock);

  setTimeout(() => {
    promptBlock.style.opacity = '1';
    scrollToBottom();
    const newInput = document.getElementById('finding-input');
    if (newInput) newInput.value = '';
  }, 200);
}

// ── Evaluate Finding ──────────────────────────────────────────
function evaluateFinding(finding, stage) {
  if (stage.multiAnswer) {
    const submitted = finding
      .toLowerCase()
      .split(/[\s,]+/)
      .map(w => w.trim())
      .filter(w => w.length > 0);

    return stage.acceptableFindings.every(required =>
      submitted.includes(required.toLowerCase())
    );
  } else {
    return stage.acceptableFindings.some(f => f === finding.trim());
  }
}

function isWrongCase(finding, stage) {
  if (stage.multiAnswer) return false;
  return stage.acceptableFindings.some(f =>
    f.toLowerCase() === finding.trim().toLowerCase() &&
    f !== finding.trim()
  );
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

    const tier = getInvestigationTier(record);
    const stages = tier.stages;
    const stage = stages[0];

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
          <p class="curator-voice" data-text="Your findings have been provisionally noted in the Society's records."></p>
          <p class="curator-voice" data-text="Before they may be formally entered into your Ledger, the Society asks that you establish an identity by which your contributions will be known. No personal information is required or desired."></p>
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

          <div class="historical-narrative">
            ${record.completion.narrative.map(p => `<p>${p}</p>`).join('')}
          </div>

          ${investigator.lexicon.length > 0 ? `
          <div class="lexicon-additions">
            <p class="lexicon-label">Your Lexicon</p>
            <ul class="lexicon-list">
              ${investigator.lexicon.map(entry =>
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

  archive: () => {
    const completedCount = investigator.completedRecords.length;
    const hasCompleted = completedCount > 0;

    return `
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
            <p class="curator-voice" data-text="Your Ledger has been entered into the Archive, Investigator ${investigator.alias}."></p>
            <p class="curator-voice" data-text="The Society has identified a site that warrants your attention. It stands where two of this region's defining histories meet — one drawn from the earth, the other grown upon it. Both have left their mark upon the landscape in ways that most who pass no longer notice."></p>
            <p class="curator-voice" data-text="Before the Society may disclose the location of the next Query Reference, it asks that you demonstrate your continued diligence. The answer to the following will unlock your assignment."></p>
          </div>

          <div class="assignment-puzzle" id="assignment-puzzle" style="opacity:0;pointer-events:none;">
            <div class="curator-panel">
              <p class="curator-label">The Curator</p>
              <p class="curator-voice" data-text="Multiply the count of stars composing a circle by the number of points upon each. From that product, subtract the combined letter count of RESPECT, LOYALTY, and COURAGE. Note the result. Then subtract instead the combined letter count of HONOR, DUTY, LOYALTY, and SACRIFICE. Note that result also. Present both results here:"></p>
            </div>
            <div class="finding-form" style="opacity:0;pointer-events:none;">
              <input
                type="text"
                id="assignment-input"
                class="finding-input"
                placeholder="Enter your answer"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
              />
              <button class="btn-primary" onclick="submitAssignment()">
                Submit
              </button>
            </div>
            <div id="assignment-response"></div>
          </div>

          ${hasCompleted ? `
          <div class="ledger-section" id="completed-records-section">
            <div class="lexicon-additions">
              <p class="lexicon-label">Records Recovered</p>
              <ul class="lexicon-list">
                ${investigator.completedRecords.map(id => {
                  const r = getRecord(id);
                  return r ? `<li class="lexicon-entry">${r.title}</li>` : '';
                }).join('')}
              </ul>
            </div>
          </div>` : ''}

          ${investigator.lexicon.length > 0 ? `
          <div class="ledger-section" id="lexicon-section">
            <div class="lexicon-additions">
              <p class="lexicon-label">Your Lexicon — ${investigator.lexicon.length} ${investigator.lexicon.length === 1 ? 'entry' : 'entries'}</p>
              <div class="lexicon-toggle" onclick="toggleLexicon()">
                <span id="lexicon-toggle-label">Show Lexicon</span>
              </div>
              <ul class="lexicon-list" id="lexicon-list" style="display:none">
                ${[...investigator.lexicon].sort().map(entry =>
                  `<li class="lexicon-entry">${entry}</li>`
                ).join('')}
              </ul>
            </div>
          </div>` : ''}

        </main>
      </div>
    `;
  },

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
  investigator.currentStage = 0;
  showScreen('investigation', { recordId });
}

function submitFinding(recordId) {
  const input = document.querySelector('.stage-prompt-block #finding-input') || document.getElementById('finding-input');
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

  investigator.submissionCount++;

  const tier = getInvestigationTier(record);
  const stages = tier.stages;
  const stage = stages[investigator.currentStage];

  const investigationPrompt = document.querySelector('.stage-prompt-block .investigation-prompt')
    || document.querySelector('.investigation-prompt');
  const findingForm = document.querySelector('.stage-prompt-block .finding-form')
    || document.querySelector('.finding-form');
  const hintSection = document.getElementById('hint-section');

  [investigationPrompt, findingForm, hintSection].forEach(el => {
    if (el) {
      el.style.transition = 'opacity 0.4s ease';
      el.style.opacity = '0';
      setTimeout(() => { if (el) el.style.display = 'none'; }, 400);
    }
  });

  responseArea.innerHTML = `
    <div class="reviewing-panel" id="reviewing-panel">
      <p class="curator-voice" data-text="The Curator is reviewing your finding. Patience is a virtue."></p>
    </div>
  `;

  const reviewPanel = document.getElementById('reviewing-panel');
  const reviewVoice = reviewPanel.querySelector('[data-text]');
  reviewVoice.style.visibility = 'hidden';

  typewriteElement(reviewVoice, reviewVoice.getAttribute('data-text'), 'curator', () => {
    setTimeout(() => {
      const p = document.getElementById('reviewing-panel');
      if (p) p.classList.add('breathing');
    }, 300);
  });

  function evaluateAndRespond() {
    const p = document.getElementById('reviewing-panel');
    if (p) p.classList.remove('breathing');

    const accepted = evaluateFinding(finding, stage);

    if (accepted) {
      console.log('Finding accepted. cloudId:', investigator.cloudId, 'stage:', investigator.currentStage);
      investigator.submissionCount = 0;

      if (stage.lexiconEntries) {
        stage.lexiconEntries.forEach(entry => {
          if (!investigator.lexicon.includes(entry)) {
            investigator.lexicon.push(entry);
          }
        });
      }
      saveInvestigator();

      if (investigator.cloudId) {
        if (stage.lexiconEntries) {
          stage.lexiconEntries.forEach(word => {
            console.log('Saving lexicon entry to cloud:', word, investigator.cloudId);
            saveLexiconEntry(investigator.cloudId, word, recordId);
          });
        }
      }

      const nextStageIndex = investigator.currentStage + 1;
      const hasNextStage = nextStageIndex < stages.length;

      if (hasNextStage) {
        showCuratorResponse(
          responseArea,
          stage.acceptanceResponse,
          () => {
            investigator.currentStage = nextStageIndex;
            saveInvestigator();
            showStagePrompt(recordId, nextStageIndex);
          }
        );
      } else {
        if (!investigator.completedRecords.includes(recordId)) {
          investigator.completedRecords.push(recordId);
        }
        saveInvestigator();

        if (investigator.cloudId) {
          console.log('Saving completed record to cloud:', recordId, investigator.cloudId);
          saveCompletedRecord(investigator.cloudId, recordId);
        }

        showCuratorResponse(
          responseArea,
          stage.acceptanceResponse,
          () => {
            if (!investigator.alias) {
              showRegistrationInline(recordId);
            } else {
              showScreen('completion', { recordId });
            }
          }
        );
      }

    } else {
      const hintSect = document.getElementById('hint-section');
      if (hintSect) hintSect.style.display = 'block';

      const wrongCase = isWrongCase(finding, stage);

      const incorrectMessage = wrongCase
        ? [
            'Your finding does not agree with other observations.',
            'The Society\'s records demand precision. Transcribe what you observe exactly as it is inscribed upon the memorial — every letter faithfully recorded.'
          ]
        : [
            'Your finding does not agree with other observations.',
            'Return your attention to what stands before you, and submit only what you are able to verify directly.'
          ];

      showCuratorResponse(
        responseArea,
        incorrectMessage,
        () => {
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
          scrollToBottom();
        }
      );
    }
  }

  reviewPanel.addEventListener('click', () => {
    currentTypewriterSkipped = true;
    clearTimeout(reviewTimeout);
    evaluateAndRespond();
  });

  const reviewTimeout = setTimeout(evaluateAndRespond, 15000 * investigator.submissionCount);
}

// ── Hint Petition ─────────────────────────────────────────────
function petitionForHint(recordId) {
  const record = getRecord(recordId);
  const responseArea = document.getElementById('curator-response-area');
  const hintBtn = document.getElementById('hint-btn');

  const tier = getInvestigationTier(record);
  const stages = tier.stages;
  const stage = stages[investigator.currentStage];

  if (!stage || !stage.hint1) return;

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
        petitionCount === 1 ? stage.hint1 : (stage.hint2 || stage.hint1),
        'The Society trusts that you will arrive at your finding through your own careful observation.'
      ],
      () => {
        scrollToBottom();
        if (hintBtn) hintBtn.disabled = false;
      }
    );
  }, hintDelay);
}

// ── Registration ──────────────────────────────────────────────
function showRegistrationInline(recordId) {
  const screenContent = document.querySelector('.screen-content');
  if (!screenContent) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="curator-panel" id="curator-register">
      <p class="curator-label">The Curator</p>
      <p class="curator-voice" data-text="Your findings have been provisionally noted in the Society's records."></p>
      <p class="curator-voice" data-text="Before they may be formally entered into your Ledger, the Society asks that you establish an identity by which your contributions will be known. No personal information is required or desired."></p>
      <p class="curator-voice" data-text="Choose any name you wish — a family name, an invented one, or something else entirely. It need only be yours, and you need only remember it."></p>
      <p class="curator-voice" data-text="By what name shall the Society know you?"></p>
    </div>
    <div class="finding-form registration-form" style="opacity:0;transition:opacity 0.7s ease;pointer-events:none;">
      <input
        type="text"
        id="alias-input"
        class="finding-input"
        placeholder="Your chosen name"
        autocomplete="off"
        maxlength="30"
      />
      <button class="btn-primary" onclick="completeRegistration('${recordId}')">
        This is my name
      </button>
    </div>
  `;

  wrapper.querySelectorAll('[data-text]').forEach(el => {
    el.textContent = '';
    el.style.visibility = 'hidden';
  });

  wrapper.style.opacity = '0';
  wrapper.style.transition = 'opacity 0.5s ease';
  const currentScrollY = window.scrollY;
  screenContent.appendChild(wrapper);

  setTimeout(() => {
    wrapper.style.opacity = '1';
    window.scrollTo(0, currentScrollY);
    scrollToBottom();
  }, 50);

  const sequence = [];
  wrapper.querySelectorAll('.curator-panel [data-text]').forEach(el => {
    sequence.push({ element: el, mode: 'curator' });
  });

  const findingForm = wrapper.querySelector('.finding-form');

  typewriteSequence(sequence, () => {
    setTimeout(() => {
      if (findingForm) {
        findingForm.style.opacity = '1';
        findingForm.style.pointerEvents = 'auto';
      }
      scrollToBottom();
    }, 400);
  });
}

async function completeRegistration(recordId) {
  const input = document.getElementById('alias-input');
  const alias = input ? input.value.trim() : '';

  if (!alias) {
    const area = document.createElement('div');
    area.style.marginTop = '1rem';
    input.parentNode.appendChild(area);
    showCuratorResponse(area, ['The Society requires a name before it may proceed.']);
    return;
  }

  const available = await checkAliasAvailable(alias);
  if (!available) {
    const findingForm = document.querySelector('.registration-form') || document.querySelector('.finding-form');
    if (findingForm) {
      findingForm.style.transition = 'opacity 0.4s ease';
      findingForm.style.opacity = '0';
      setTimeout(() => { findingForm.style.display = 'none'; }, 400);
    }
    const responseArea = document.createElement('div');
    responseArea.style.marginTop = '1rem';
    document.querySelector('.screen-content').appendChild(responseArea);
    showCuratorResponse(responseArea, ['The name you have chosen is already recorded in the Society\'s Ledger. Each Investigator must be known by a distinct name. The Society asks that you choose another.'], () => {
      const screenContent = document.querySelector('.screen-content');
      if (findingForm) {
        screenContent.appendChild(findingForm);
        findingForm.style.display = 'flex';
        findingForm.style.opacity = '0';
        findingForm.style.transition = 'opacity 0.6s ease';
        setTimeout(() => { findingForm.style.opacity = '1'; }, 50);
      }
      if (input) input.value = '';
      scrollToBottom();
    });
    return;
  }

  investigator.alias = alias;

  const societyWords = ['TRUTH', 'SOCIETY', 'DISCOVERY', 'DISCERNMENT', alias.toUpperCase()];
  societyWords.forEach(word => {
    if (!investigator.lexicon.includes(word)) {
      investigator.lexicon.push(word);
    }
  });

  investigator.recoveryCode = generateRecoveryCode();
  saveInvestigator();

  const cloudRecord = await saveInvestigatorToCloud({
    alias: investigator.alias,
    recovery_phrase: investigator.recoveryCode,
    investigator_number: Date.now()
  });
  if (cloudRecord) {
    investigator.cloudId = cloudRecord.id;
    saveInvestigator();

    societyWords.forEach(word => {
      saveLexiconEntry(investigator.cloudId, word, 'society');
    });

    investigator.lexicon.forEach(word => {
      if (!societyWords.includes(word)) {
        saveLexiconEntry(investigator.cloudId, word, investigator.currentRecordId);
      }
    });

    investigator.completedRecords.forEach(recordId => {
      saveCompletedRecord(investigator.cloudId, recordId);
    });
  }

  showScreen('recoveryCode', { recordId });
}

// ── Records ───────────────────────────────────────────────────
function getRecord(recordId) {
  return records[recordId] || null;
}

function getInvestigationTier(record) {
  const tiers = record.investigation.tiers;
  const completed = investigator.completedRecords.length;
  const sorted = [...tiers].sort((a, b) => b.minRecords - a.minRecords);
  for (const tier of sorted) {
    if (completed >= tier.minRecords) return tier;
  }
  return tiers[0];
}

const records = {
  'r001': {
    id: 'r001',
    designation: 'Record I',
    title: 'The Circle of Fifteen',

    curatorIntroduction: [
      'Before you stand fifteen, arranged in a circle — a memorial whose arrangement carries meaning beyond the names it bears.',
      'Observe carefully. Each position has been chosen with purpose. Number the north as one. Name the core value designated by the tenth.'
    ],

    investigation: {
      tiers: [
        {
          minRecords: 0,
          label: 'Apprentice',
          stages: [
            {
              prompt: 'What core value is designated by the tenth position?',
              instructions: 'Record the value precisely as it appears upon the memorial.',
              hint1: 'Accuracy is paramount in the Society\'s records. Transcribe what you observe exactly as it is inscribed — every letter as it appears.',
              acceptableFindings: ['RESPECT'],
              multiAnswer: false,
              lexiconEntries: ['RESPECT'],
              acceptanceResponse: [
                'Your finding is consistent with previous observations.',
                'Respect. It is among the most enduring of virtues, and among the most difficult to sustain under trial. It has been entered into your Lexicon.',
                'The Society asks that you look further. Four additional virtues are memorialized here alongside Respect. Name them.'
              ]
            },
            {
              prompt: 'Four additional core values are memorialized upon this circle alongside Respect. Name them.',
              instructions: 'Enter the four values separated by commas or spaces, in any order. Record them precisely as they appear.',
              hint1: 'Examine each star in the circle carefully. Four bear inscriptions you have not yet recorded. Transcribe each exactly as it appears.',
              acceptableFindings: ['LOYALTY', 'DUTY', 'COURAGE', 'HONOR'],
              multiAnswer: true,
              lexiconEntries: ['LOYALTY', 'DUTY', 'COURAGE', 'HONOR'],
              acceptanceResponse: [
                'These findings concur with previous investigations.',
                'Loyalty, Duty, Courage, and Honor have been entered into your Lexicon.',
                'Your diligence here is appreciated. The Society invites you to preserve these findings in your Ledger.'
              ]
            }
          ]
        },
        {
          minRecords: 1,
          label: 'Novice',
          stages: [
            {
              prompt: 'Number the north as one. Name the core value designated by the tenth.',
              instructions: 'Record the value precisely as it appears upon the memorial.',
              hint1: 'Accuracy is paramount in the Society\'s records. Transcribe what you observe exactly as it is inscribed — every letter as it appears.',
              acceptableFindings: ['RESPECT'],
              multiAnswer: false,
              lexiconEntries: ['RESPECT'],
              acceptanceResponse: [
                'Your finding is consistent with previous observations.',
                'The Society asks that you continue your examination of this Record.'
              ]
            }
          ]
        }
      ]
    },

    completion: {
      curatorAcknowledgement: [
        'This Record has been recovered.',
        `Well observed, Investigator ${investigator.alias}.`
      ],
      narrative: [
        'These five core values — Respect, Loyalty, Duty, Courage, and Honor — were not chosen arbitrarily. They were inscribed here to remind those who pass that the fifteen honoured by this memorial did not fall by accident.',
        'They fell in the exercise of these qualities, carried to their final measure.',
        'Most pass this memorial without reading what it has taken such care to preserve. You have not.'
      ]
    }
  },

  'r002': {
    id: 'r002',
    designation: 'Record II',
    title: 'Stonework \'82',

    curatorIntroduction: [
      'Before you stands a work of stone — two columns rising from a common base, their surfaces telling different stories depending on which face you examine.',
      'The sculptor left a mark upon the north face. Find it, and record precisely what you observe.'
    ],

    investigation: {
      tiers: [
        {
          minRecords: 0,
          label: 'Apprentice',
          stages: [
            {
              prompt: 'What inscription appears on the north-facing stone surface?',
              instructions: 'Record the inscription exactly as it appears — every character, every mark.',
              hint1: 'Examine the naturally rough north-facing surface carefully. The inscription is modest in size. Transcribe every character precisely as it appears, including punctuation.',
              hint2: 'The inscription includes a name and a year, separated by a space. The year is abbreviated. Transcribe exactly what you see.',
              acceptableFindings: ["S Kunishima '82"],
              multiAnswer: false,
              lexiconEntries: ['KUNISHIMA'],
              acceptanceResponse: [
                'Your finding is consistent with previous observations.',
                'S Kunishima \'82. A sculptor\'s mark — modest, precise, and easy to overlook.',
                'The Society has entered KUNISHIMA into your Lexicon. The full story behind this work rewards further investigation.'
              ]
            }
          ]
        },
        {
          minRecords: 1,
          label: 'Novice',
          stages: [
            {
              prompt: 'The inscription gives only an abbreviated name and year. What is the sculptor\'s full name, and what is the complete year this work was completed?',
              instructions: 'Enter the full name followed by the year. External research is permitted.',
              hint1: 'The abbreviated name on the stone follows a common convention — a first initial followed by a family name. The year is abbreviated to its final two digits.',
              hint2: 'Search for the sculptor Kunishima who was active in Southern California in the early 1980s. The full first name and the complete four-digit year are your findings.',
              acceptableFindings: ['Seiji Kunishima 1982'],
              multiAnswer: false,
              lexiconEntries: ['SEIJI'],
              acceptanceResponse: [
                'Your finding is consistent with previous investigations.',
                'Seiji Kunishima completed this work in 1982. SEIJI has been entered into your Lexicon.',
                'The Society notes that the work stands at the intersection of two named streets — La Entrada and Valencia Avenue. Both names carry their own histories.'
              ]
            }
          ]
        }
      ]
    },

    completion: {
      curatorAcknowledgement: [
        'This Record has been recovered.',
        `Well observed, Investigator ${investigator.alias}.`
      ],
      narrative: [
        'Seiji Kunishima completed this sculpture in 1982. The contrast between the rough outer faces and the smooth inner surfaces was deliberate — the tension between what is exposed to the world and what is turned inward.',
        'Most who pass read neither the inscription nor the surfaces. You have read both.',
        'La Entrada. Valencia Avenue. The names around this place carry histories of their own, should you wish to pursue them.'
      ]
    }
  }
};

// ── Lexicon Toggle ────────────────────────────────────────────
function toggleLexicon() {
  const list = document.getElementById('lexicon-list');
  const label = document.getElementById('lexicon-toggle-label');
  if (!list || !label) return;
  const isHidden = list.style.display === 'none' || list.style.display === '';
  list.style.display = isHidden ? 'flex' : 'none';
  label.textContent = isHidden ? 'Hide Lexicon' : 'Show Lexicon';
}

// ── Assignment Submission ─────────────────────────────────────
async function submitAssignment() {
  const input = document.getElementById('assignment-input');
  const responseArea = document.getElementById('assignment-response');
  const btn = document.querySelector('#assignment-puzzle .btn-primary');
  const answer = input ? input.value.trim() : '';

  if (!answer) return;

  if (input) input.disabled = true;
  if (btn) btn.disabled = true;

  function addCorrectLexiconEntries() {
    ['TRUTH', 'SOCIETY', 'DISCOVERY', 'DISCERNMENT'].forEach(word => {
      if (!investigator.lexicon.includes(word)) investigator.lexicon.push(word);
    });
    saveInvestigator();
    if (investigator.cloudId) {
      ['TRUTH', 'SOCIETY', 'DISCOVERY', 'DISCERNMENT'].forEach(word => {
        saveLexiconEntry(investigator.cloudId, word, 'assignment');
      });
    }
    const lexiconList = document.getElementById('lexicon-list');
    const lexiconLabel = document.querySelector('#lexicon-section .lexicon-label');
    if (lexiconList) {
      lexiconList.innerHTML = [...investigator.lexicon].sort().map(entry =>
        `<li class="lexicon-entry">${entry}</li>`
      ).join('');
    }
    if (lexiconLabel) {
      const count = investigator.lexicon.length;
      lexiconLabel.textContent = `Your Lexicon — ${count} ${count === 1 ? 'entry' : 'entries'}`;
    }
  }

  function showIncorrect() {
    if (input) input.disabled = false;
    if (btn) btn.disabled = false;
    showCuratorResponse(responseArea, [
      'That does not accord with the Society\'s calculation. Return your attention to the question and submit only what the arithmetic supports.'
    ]);
  }

  if (investigator.currentStepId) {
    const result = await verifyAnswer(investigator.currentStepId, answer);

    if (result && result.correct) {
      const location = await revealLocation(investigator.currentAssignmentId, 'dms');
      addCorrectLexiconEntries();

      const coordLine = (location && location.coordinates)
        ? location.coordinates
        : '33°__\'54"N  117°__\'57"W';

      showCuratorResponse(responseArea, [
        'Your calculation is correct.',
        'The Society discloses the following coordinates for your next assignment.',
        coordLine,
        'Complete the coordinates above with entries in your Lexicon, and you shall be prepared to investigate your next Record.',
        'Seek the Marker. It will make itself known.'
      ], () => { scrollToBottom(); });

    } else {
      showIncorrect();
    }

  } else {
    const parts = answer.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
    const isCorrect = parts.length === 2 &&
      ((parts[0] === '54' && parts[1] === '50') || (parts[0] === '50' && parts[1] === '54'));

    if (isCorrect) {
      addCorrectLexiconEntries();
      showCuratorResponse(responseArea, [
        'Your calculation is correct.',
        'The Society discloses the following coordinates for your next assignment.',
        '33°__\'54"N  117°__\'57"W',
        'Complete the coordinates above with entries in your Lexicon, and you shall be prepared to investigate your next Record.',
        'Seek the Marker. It will make itself known.'
      ], () => { scrollToBottom(); });

    } else {
      showIncorrect();
    }
  }
}

// ── Dev Utilities ─────────────────────────────────────────────
function devReset() {
  localStorage.clear();
  Object.assign(investigator, {
    alias: null,
    recoveryCode: null,
    completedRecords: [],
    lexicon: [],
    currentRecordId: null,
    currentStage: 0,
    hintPetitions: {},
    submissionCount: 0
  });
  showScreen('firstEncounter', { recordId: 'r001' });
}
window.devReset = devReset;

function devGoArchive(cloudId = null) {
  localStorage.clear();
  Object.assign(investigator, {
    alias: 'TestInvestigator',
    recoveryCode: 'TEST-000-TEST',
    cloudId: null,
    completedRecords: ['r001'],
    lexicon: ['RESPECT', 'LOYALTY', 'DUTY', 'COURAGE', 'HONOR', 'TRUTH', 'SOCIETY', 'DISCOVERY', 'DISCERNMENT', 'TESTINVESTIGATOR'],
    currentRecordId: 'r001',
    currentStage: 0,
    hintPetitions: {},
    submissionCount: 0
  });
  if (cloudId) investigator.cloudId = cloudId;
  saveInvestigator();
  showScreen('archive');
}

function devGoInvestigation(recordId = 'r001') {
  localStorage.clear();
  Object.assign(investigator, {
    alias: null,
    recoveryCode: null,
    cloudId: null,
    completedRecords: [],
    lexicon: [],
    currentRecordId: recordId,
    currentStage: 0,
    hintPetitions: {},
    submissionCount: 0
  });
  saveInvestigator();
  showScreen('firstEncounter', { recordId });
}

function devGoCompletion(recordId = 'r001') {
  localStorage.clear();
  Object.assign(investigator, {
    alias: 'TestInvestigator',
    recoveryCode: 'TEST-000-TEST',
    cloudId: null,
    completedRecords: [recordId],
    lexicon: ['RESPECT', 'LOYALTY', 'DUTY', 'COURAGE', 'HONOR'],
    currentRecordId: recordId,
    currentStage: 0,
    hintPetitions: {},
    submissionCount: 0
  });
  saveInvestigator();
  showScreen('completion', { recordId });
}

window.devGoArchive = devGoArchive;
window.devGoInvestigation = devGoInvestigation;
window.devGoCompletion = devGoCompletion;

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
