// Society of Inquiry
// app.js — core application

const app = document.getElementById('app');

function showScreen(screenName, data = {}) {
  app.innerHTML = screens[screenName](data);
}

const screens = {

  firstEncounter: () => `
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
          <button class="btn-primary" onclick="showScreen('register')">Begin</button>
        </div>
      </main>
    </div>
  `,

  register: () => `
    <div class="screen">
      <header class="site-header">
        <span class="society-name">Society of Inquiry</span>
      </header>
      <main class="screen-content">
        <div class="curator-panel">
          <p class="curator-voice">Registration coming soon.</p>
        </div>
      </main>
    </div>
  `

};

// Start the application
showScreen('firstEncounter');
