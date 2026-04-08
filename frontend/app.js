const topics = [
  { name: 'Design', description: 'UI feedback, prototyping, and visual experiments.', members: 128, tone: 'Soft glow' },
  { name: 'Study', description: 'Low-pressure accountability rooms for focus sprints.', members: 91, tone: 'Calm mode' },
  { name: 'Late Night', description: 'Spontaneous conversations after the day winds down.', members: 204, tone: 'Pulse' },
  { name: 'Mental Health', description: 'Supportive and anonymous check-ins.', members: 73, tone: 'Safe space' },
  { name: 'Music', description: 'Share tracks, moodboards, and quick reactions.', members: 64, tone: 'Warm wave' },
  { name: 'Gaming', description: 'Co-op talk, chill lobbies, and temporary squads.', members: 118, tone: 'Arcade' },
  { name: 'Building', description: 'Hackathon rooms, quick demos, and shipping energy.', members: 147, tone: 'Launch pad' },
];

const rooms = [
  {
    title: 'Pixel cafe',
    category: 'Design',
    users: '12/15',
    status: 'Active now',
    description: 'A lightweight room for sharing mockups and feedback.',
    selected: true,
  },
  {
    title: 'Quiet sprint',
    category: 'Study',
    users: '8/15',
    status: '4 min ago',
    description: 'Focus timers and short accountability check-ins.',
    selected: false,
  },
  {
    title: 'Late ping',
    category: 'Random',
    users: '15/15',
    status: '2 min ago',
    description: 'Temporary space for short, spontaneous conversations.',
    selected: false,
  },
  {
    title: 'Sunrise notes',
    category: 'Morning',
    users: '6/15',
    status: 'Just now',
    description: 'A calmer room for early ideas and fresh starts.',
    selected: false,
  },
  {
    title: 'Neon frame',
    category: 'Night',
    users: '9/15',
    status: '7 min ago',
    description: 'A late-night room for loose thoughts and quick feedback.',
    selected: false,
  },
];

const messages = [
  { author: 'EchoBloom', text: 'Dropped a rough sketch. Feedback is welcome but keep it easy.', time: '2m', me: false },
  { author: 'User436', text: 'The glass effect makes it feel calm instead of noisy.', time: '1m', me: false },
  { author: 'You', text: 'Testing the low-pressure vibe. No pressure, just ideas.', time: 'now', me: true },
];

const anonymousIcons = ['◈', '◉', '⬢', '✦', '✶', '◆', '⬡', '◍'];
const anonymousNames = ['EchoBloom', 'QuietNova', 'MistyOrbit', 'DriftPulse', 'LunaThread', 'VelvetNode', 'Afterglow', 'SoftSignal'];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const anonymousUser = {
  icon: pickRandom(anonymousIcons),
  name: pickRandom(anonymousNames),
  status: 'Online · Veteran tier',
};

const state = {
  view: 'home',
  room: rooms.find((room) => room.selected) ?? rooms[0],
  search: '',
  topicFilter: 'all',
  theme: localStorage.getItem('vibehack-theme') || 'night',
  sidebarCollapsed: false,
};

const els = {
  viewRoot: document.getElementById('viewRoot'),
  pageTitle: document.getElementById('pageTitle'),
  pageSubtitle: document.getElementById('pageSubtitle'),
  createRoomBtn: document.getElementById('createRoomBtn'),
  sidebarRoomTitle: document.getElementById('sidebarRoomTitle'),
  sidebarRoomMeta: document.getElementById('sidebarRoomMeta'),
  jumpToRoomBtn: document.getElementById('jumpToRoomBtn'),
  roomModal: document.getElementById('roomModal'),
  closeRoomModal: document.getElementById('closeRoomModal'),
  profileModal: document.getElementById('profileModal'),
  closeProfileBtn: document.getElementById('closeProfileBtn'),
  profileName: document.getElementById('profileName'),
  profileAvatar: document.getElementById('profileAvatar'),
  sidebarAvatar: document.getElementById('sidebarAvatar'),
  sidebarDisplayName: document.getElementById('sidebarDisplayName'),
  sidebarStatusText: document.getElementById('sidebarStatusText'),
  themeButtons: document.querySelectorAll('.theme-btn'),
  sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
  appShell: document.querySelector('.app-shell'),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function setView(view) {
  state.view = view;
  document.querySelectorAll('.nav-link').forEach((item) => {
    item.classList.toggle('active', item.dataset.view === view);
  });
  render();
}

function setRoom(roomTitle) {
  const nextRoom = rooms.find((room) => room.title === roomTitle);
  if (!nextRoom) {
    return;
  }
  state.room = nextRoom;
  rooms.forEach((room) => {
    room.selected = room.title === nextRoom.title;
  });
  render();
}

function openModal(modal) {
  modal.classList.remove('hidden');
}

function closeModal(modal) {
  modal.classList.add('hidden');
}

function applyTheme(theme) {
  state.theme = theme;
  document.body.dataset.theme = theme;
  localStorage.setItem('vibehack-theme', theme);
  els.themeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.theme === theme);
  });
}

function applySidebarState() {
  els.appShell.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
  els.sidebarToggleBtn.textContent = '☰';
  els.sidebarToggleBtn.setAttribute('aria-pressed', state.sidebarCollapsed ? 'true' : 'false');
}

function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  applySidebarState();
}

function matchesSearch(value) {
  return value.toLowerCase().includes(state.search.trim().toLowerCase());
}

function getVisibleRooms() {
  return rooms.filter((room) => {
    const categoryMatches = state.topicFilter === 'all' || room.category.toLowerCase() === state.topicFilter;
    const searchMatches = matchesSearch(`${room.title} ${room.category} ${room.description}`);
    return categoryMatches && searchMatches;
  });
}

function setTopicFilter(filter) {
  state.topicFilter = filter;
  render();
}

function syncSidebarRoom() {
  els.sidebarRoomTitle.textContent = state.room.title;
  els.sidebarRoomMeta.textContent = `${state.room.category} · ${state.room.users} online · temporary room`;
}

function renderHome() {
  const selectedRoom = state.room;
  els.pageTitle.textContent = 'Home';
  els.pageSubtitle.textContent = 'Your active chat sits front and center.';
  syncSidebarRoom();

  els.viewRoot.innerHTML = `
    <section class="view-panel chat-shell">
      <div class="chat-topline">
        <div>
          <p class="label">Active room</p>
          <h3>${escapeHtml(selectedRoom.title)}</h3>
          <div class="chat-meta">
            <span>${escapeHtml(selectedRoom.category)}</span>
            <span>${escapeHtml(selectedRoom.users)} online</span>
            <span>Temporary chat</span>
          </div>
        </div>
        <span class="room-badge">24h expiry</span>
      </div>
      <div class="message-feed" id="messageFeed"></div>
      <form class="composer" id="messageComposer">
        <input id="messageInput" type="text" maxlength="140" placeholder="Post something low-pressure..." />
        <button class="cta-button" type="submit">Send</button>
      </form>
    </section>
  `;

  const feed = document.getElementById('messageFeed');
  feed.innerHTML = messages
    .map(
      (message) => `
        <article class="message-row ${message.me ? 'me' : ''}">
          <strong>${escapeHtml(message.author)}</strong>
          <p>${escapeHtml(message.text)}</p>
          <small>${escapeHtml(message.time)} · temporary message</small>
        </article>
      `,
    )
    .join('');

  document.getElementById('messageComposer').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text) {
      return;
    }
    messages.unshift({ author: 'You', text, time: 'just now', me: true });
    input.value = '';
    renderHome();
  });
}

function renderDiscover() {
  const filteredTopics = topics.filter((topic) => {
    const haystack = `${topic.name} ${topic.description} ${topic.tone}`.toLowerCase();
    return haystack.includes(state.search.trim().toLowerCase());
  });
  const filteredRooms = getVisibleRooms();

  els.pageTitle.textContent = 'Discover';
  els.pageSubtitle.textContent = 'Tap a bubble to see rooms for that category and create your own space.';
  syncSidebarRoom();

  els.viewRoot.innerHTML = `
    <section class="view-panel">
      <div class="panel-head">
        <div>
          <p class="label">Context feeds</p>
          <h3>Topic streams (choose a category)</h3>
        </div>
        <span class="tier-pill">${filteredTopics.length} topics</span>
      </div>
      <div class="bubble-grid">
        <button class="bubble-chip ${state.topicFilter === 'all' ? 'active' : ''}" data-topic="all" type="button">
          <span>All rooms</span>
          <small>${rooms.length} spaces</small>
        </button>
        ${topics
          .map(
            (topic) => `
              <button class="bubble-chip ${state.topicFilter === topic.name.toLowerCase() ? 'active' : ''}" data-topic="${escapeHtml(topic.name.toLowerCase())}" type="button">
                <span>${escapeHtml(topic.name)}</span>
                <small>${topic.members} rooms/users</small>
              </button>
            `,
          )
          .join('')}
      </div>
    </section>
    <section class="view-panel">
      <div class="panel-head compact">
        <div>
          <p class="label">Rooms in category</p>
          <h3>${state.topicFilter === 'all' ? 'All active rooms' : state.topicFilter}</h3>
        </div>
        <button class="ghost-button" id="createRoomInlineBtn" type="button">Create your room</button>
      </div>
      <div class="feed-grid">
        ${filteredRooms
          .map(
            (room) => `
              <article class="feed-card">
                <div class="feed-top">
                  <div>
                    <h4>${escapeHtml(room.title)}</h4>
                    <p>${escapeHtml(room.description)}</p>
                  </div>
                  <span class="tag-pill">${escapeHtml(room.category)}</span>
                </div>
                <small>${escapeHtml(room.users)} online · ${escapeHtml(room.status)} · temporary room</small>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;

  document.getElementById('createRoomInlineBtn').addEventListener('click', () => openModal(els.roomModal));
  document.querySelectorAll('.bubble-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      setTopicFilter(chip.dataset.topic);
    });
  });
}

function renderRooms() {
  const filteredRooms = rooms.filter((room) => {
    const haystack = `${room.title} ${room.category} ${room.description}`.toLowerCase();
    return haystack.includes(state.search.trim().toLowerCase());
  });

  els.pageTitle.textContent = 'Active Rooms';
  els.pageSubtitle.textContent = 'Browse your temporary chatrooms and set the active room quickly.';
  syncSidebarRoom();

  els.viewRoot.innerHTML = `
    <section class="view-panel">
      <div class="panel-head">
        <div>
          <p class="label">Temporary rooms</p>
          <h3>Active chatrooms</h3>
        </div>
        <span class="tier-pill">${filteredRooms.length} visible</span>
      </div>
      <div class="room-grid">
        ${filteredRooms
          .map(
            (room) => `
              <article class="room-row ${room.selected ? 'selected' : ''}" data-room="${escapeHtml(room.title)}">
                <div class="room-top">
                  <div>
                    <p class="label">${escapeHtml(room.category)}</p>
                    <h4>${escapeHtml(room.title)}</h4>
                    <p>${escapeHtml(room.description)}</p>
                  </div>
                  <span class="room-badge">${escapeHtml(room.users)}</span>
                </div>
                <div class="room-actions">
                  <button class="ghost-button room-switch" type="button" data-room="${escapeHtml(room.title)}">Make active</button>
                  <button class="cta-button room-switch" type="button" data-room="${escapeHtml(room.title)}">Join</button>
                </div>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
  `;

  document.querySelectorAll('.room-switch').forEach((button) => {
    button.addEventListener('click', (event) => {
      const roomTitle = event.currentTarget.dataset.room;
      setRoom(roomTitle);
      setView('home');
    });
  });
}

function renderProfile() {
  els.pageTitle.textContent = 'Profile';
  els.pageSubtitle.textContent = 'Identity controls, trust growth, and safety tools in one place.';
  syncSidebarRoom();

  els.viewRoot.innerHTML = `
    <section class="view-panel profile-layout">
      <div class="profile-kpi">
        <div class="kpi-top">
          <div>
            <p class="label">Identity</p>
            <h3>${escapeHtml(anonymousUser.name)}</h3>
          </div>
          <span class="tier-pill">Veteran</span>
        </div>
        <div class="meter"><span style="width: 78%"></span></div>
        <div class="profile-grid">
          <div><span>Anonymity points</span><strong>742</strong></div>
          <div><span>Rooms joined</span><strong>18</strong></div>
          <div><span>Trust score</span><strong>96%</strong></div>
        </div>
        <div class="feature-grid">
          <article class="feature-card">
            <p class="label">Whispers</p>
            <strong>Private inbox</strong>
            <p>Receive anonymous one-to-one notes without exposing profile details.</p>
          </article>
          <article class="feature-card">
            <p class="label">Safety shield</p>
            <strong>Quick moderation</strong>
            <p>Report, mute, and block controls are available directly inside room cards.</p>
          </article>
          <article class="feature-card">
            <p class="label">Point streak</p>
            <strong>7 day activity</strong>
            <p>Gain trust points by positive participation in temporary rooms.</p>
          </article>
          <article class="feature-card">
            <p class="label">Room recap</p>
            <strong>Weekly summary</strong>
            <p>See which contexts you joined most often and where you helped most.</p>
          </article>
        </div>
      </div>
      <div class="settings-list">
        <div class="settings-row">
          <div>
            <p class="label">Profile visibility</p>
            <strong>Anonymous by default</strong>
          </div>
          <span class="toggle on"></span>
        </div>
        <div class="settings-row">
          <div>
            <p class="label">Temporary chats</p>
            <strong>Auto-delete after 24 hours</strong>
          </div>
          <span class="toggle on"></span>
        </div>
        <div class="settings-row">
          <div>
            <p class="label">Reports</p>
            <strong>Quick moderation access</strong>
          </div>
          <span class="toggle on"></span>
        </div>
        <div class="timeline">
          <div class="timeline-row">
            <span>Today</span>
            <strong>+24 points</strong>
          </div>
          <div class="timeline-row">
            <span>This week</span>
            <strong>3 rooms completed</strong>
          </div>
          <div class="timeline-row">
            <span>Trust milestone</span>
            <strong>Veteran maintained</strong>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderSettings() {
  els.pageTitle.textContent = 'Settings';
  els.pageSubtitle.textContent = 'Tune privacy, notifications, and moderation behavior.';
  syncSidebarRoom();

  els.viewRoot.innerHTML = `
    <section class="view-panel">
      <div class="panel-head">
        <div>
          <p class="label">Privacy</p>
          <h3>Control your anonymous presence</h3>
        </div>
      </div>
      <div class="settings-list">
        <div class="settings-row">
          <div>
            <p class="label">Whisper requests</p>
            <strong>Allow from trusted users only</strong>
          </div>
          <span class="toggle on"></span>
        </div>
        <div class="settings-row">
          <div>
            <p class="label">Room invites</p>
            <strong>Only from joined categories</strong>
          </div>
          <span class="toggle on"></span>
        </div>
        <div class="settings-row">
          <div>
            <p class="label">Moderation alerts</p>
            <strong>Immediate warnings</strong>
          </div>
          <span class="toggle on"></span>
        </div>
      </div>
    </section>
  `;
}

function hydrateAnonymousIdentity() {
  els.sidebarAvatar.textContent = anonymousUser.icon;
  els.sidebarDisplayName.textContent = anonymousUser.name;
  els.sidebarStatusText.textContent = anonymousUser.status;
  els.profileAvatar.textContent = anonymousUser.icon;
  els.profileName.textContent = `${anonymousUser.name}${Math.floor(Math.random() * 900) + 100}`;
}

function render() {
  if (state.view === 'home') {
    renderHome();
  } else if (state.view === 'discover') {
    renderDiscover();
  } else if (state.view === 'rooms') {
    renderRooms();
  } else if (state.view === 'profile') {
    renderProfile();
  } else if (state.view === 'settings') {
    renderSettings();
  }
}

document.querySelectorAll('.nav-link').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

els.themeButtons.forEach((button) => {
  button.addEventListener('click', () => applyTheme(button.dataset.theme));
});

els.sidebarToggleBtn.addEventListener('click', toggleSidebar);

els.createRoomBtn.addEventListener('click', () => openModal(els.roomModal));
els.jumpToRoomBtn.addEventListener('click', () => setView('home'));
els.closeRoomModal.addEventListener('click', () => closeModal(els.roomModal));
els.closeProfileBtn.addEventListener('click', () => closeModal(els.profileModal));

els.roomModal.addEventListener('click', (event) => {
  if (event.target === els.roomModal) {
    closeModal(els.roomModal);
  }
});

els.profileModal.addEventListener('click', (event) => {
  if (event.target === els.profileModal) {
    closeModal(els.profileModal);
  }
});

hydrateAnonymousIdentity();
applyTheme(state.theme);
applySidebarState();
render();
