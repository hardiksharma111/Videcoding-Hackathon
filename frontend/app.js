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

const weeklyActivity = [
  { day: 'Mon', messages: 32, rooms: 2, whispers: 4 },
  { day: 'Tue', messages: 51, rooms: 3, whispers: 5 },
  { day: 'Wed', messages: 44, rooms: 2, whispers: 7 },
  { day: 'Thu', messages: 67, rooms: 4, whispers: 6 },
  { day: 'Fri', messages: 92, rooms: 5, whispers: 11 },
  { day: 'Sat', messages: 58, rooms: 3, whispers: 8 },
  { day: 'Sun', messages: 38, rooms: 2, whispers: 3 },
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

const STORAGE_KEY = 'vibehack-ui-state-v1';

const state = {
  view: 'home',
  room: rooms.find((room) => room.selected) ?? rooms[0],
  search: '',
  topicFilter: 'all',
  theme: localStorage.getItem('vibehack-theme') || 'night',
  sidebarCollapsed: false,
  settings: {
    whisperRequests: true,
    roomInvites: true,
    moderationAlerts: true,
  },
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
  roomNameInput: document.getElementById('roomNameInput'),
  roomTopicInput: document.getElementById('roomTopicInput'),
  roomVibeInput: document.getElementById('roomVibeInput'),
  confirmCreateRoomBtn: document.getElementById('confirmCreateRoomBtn'),
  profileModal: document.getElementById('profileModal'),
  closeProfileBtn: document.getElementById('closeProfileBtn'),
  roomDrawerBackdrop: document.getElementById('roomDrawerBackdrop'),
  roomDrawer: document.getElementById('roomDrawer'),
  closeRoomDrawerBtn: document.getElementById('closeRoomDrawerBtn'),
  drawerRoomTitle: document.getElementById('drawerRoomTitle'),
  drawerRoomMeta: document.getElementById('drawerRoomMeta'),
  drawerRoomDescription: document.getElementById('drawerRoomDescription'),
  drawerExpiry: document.getElementById('drawerExpiry'),
  drawerMembers: document.getElementById('drawerMembers'),
  toastStack: document.getElementById('toastStack'),
  profileName: document.getElementById('profileName'),
  profileAvatar: document.getElementById('profileAvatar'),
  sidebarAvatar: document.getElementById('sidebarAvatar'),
  sidebarDisplayName: document.getElementById('sidebarDisplayName'),
  sidebarStatusText: document.getElementById('sidebarStatusText'),
  themeButtons: document.querySelectorAll('.theme-btn'),
  sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
  appShell: document.querySelector('.app-shell'),
};

function savePersistentState() {
  const payload = {
    rooms,
    topics,
    weeklyActivity,
    state: {
      roomTitle: state.room?.title,
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      settings: state.settings,
    },
    anonymousUser,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadPersistentState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed.rooms) && parsed.rooms.length) {
      rooms.splice(0, rooms.length, ...parsed.rooms);
    }
    if (Array.isArray(parsed.topics) && parsed.topics.length) {
      topics.splice(0, topics.length, ...parsed.topics);
    }
    if (Array.isArray(parsed.weeklyActivity) && parsed.weeklyActivity.length) {
      weeklyActivity.splice(0, weeklyActivity.length, ...parsed.weeklyActivity);
    }

    if (parsed.state?.roomTitle) {
      state.room = rooms.find((room) => room.title === parsed.state.roomTitle) ?? state.room;
    }
    if (parsed.state?.theme) {
      state.theme = parsed.state.theme;
    }
    if (typeof parsed.state?.sidebarCollapsed === 'boolean') {
      state.sidebarCollapsed = parsed.state.sidebarCollapsed;
    }
    if (parsed.state?.settings) {
      state.settings = {
        ...state.settings,
        ...parsed.state.settings,
      };
    }

    if (parsed.anonymousUser?.icon && parsed.anonymousUser?.name) {
      anonymousUser.icon = parsed.anonymousUser.icon;
      anonymousUser.name = parsed.anonymousUser.name;
      anonymousUser.status = parsed.anonymousUser.status || anonymousUser.status;
    }
  } catch (_error) {
    // Keep defaults if storage content is malformed.
  }
}

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
  savePersistentState();
  render();
}

function openModal(modal) {
  modal.classList.remove('hidden');
}

function closeModal(modal) {
  modal.classList.add('hidden');
}

function applyTheme(theme, options = {}) {
  const { silent = false } = options;
  state.theme = theme;
  document.body.dataset.theme = theme;
  localStorage.setItem('vibehack-theme', theme);
  els.themeButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.theme === theme);
  });
  savePersistentState();
  if (!silent) {
    showToast(`Switched to ${theme} mode`, 'info');
  }
}

function applySidebarState() {
  els.appShell.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
  els.sidebarToggleBtn.textContent = '☰';
  els.sidebarToggleBtn.setAttribute('aria-pressed', state.sidebarCollapsed ? 'true' : 'false');
}

function toggleSidebar() {
  state.sidebarCollapsed = !state.sidebarCollapsed;
  applySidebarState();
  savePersistentState();
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

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  els.toastStack.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2800);
}

function openRoomDrawer(room) {
  const memberNames = Array.from({ length: 5 }, () => pickRandom(anonymousNames));
  els.drawerRoomTitle.textContent = room.title;
  els.drawerRoomMeta.textContent = `${room.category} · ${room.users} · ${room.status}`;
  els.drawerRoomDescription.textContent = room.description;
  els.drawerExpiry.textContent = room.selected ? '23h 12m left' : '22h 48m left';
  els.drawerMembers.innerHTML = memberNames
    .map(
      (name, index) => `
        <div class="drawer-member">
          <span>${escapeHtml(name)}${index + 1}</span>
          <span class="room-badge">${index < 2 ? 'Online' : 'Idle'}</span>
        </div>
      `,
    )
    .join('');
  els.roomDrawerBackdrop.classList.remove('hidden');
}

function closeRoomDrawer() {
  els.roomDrawerBackdrop.classList.add('hidden');
}

function syncSidebarRoom() {
  els.sidebarRoomTitle.textContent = state.room.title;
  els.sidebarRoomMeta.textContent = `${state.room.category} · ${state.room.users} online · temporary room`;
}

function getPeakDayBy(field) {
  return weeklyActivity.reduce((peak, day) => (day[field] > peak[field] ? day : peak), weeklyActivity[0]);
}

function getMonthlySummary() {
  return weeklyActivity.reduce(
    (acc, day) => {
      acc.messages += day.messages;
      acc.rooms += day.rooms;
      acc.whispers += day.whispers;
      return acc;
    },
    { messages: 0, rooms: 0, whispers: 0 },
  );
}

function renderHome() {
  const selectedRoom = state.room;
  const monthly = getMonthlySummary();
  const peakMessages = getPeakDayBy('messages');
  const peakRooms = getPeakDayBy('rooms');
  const peakWhispers = getPeakDayBy('whispers');
  const maxMessages = Math.max(...weeklyActivity.map((d) => d.messages));

  els.pageTitle.textContent = 'Home';
  els.pageSubtitle.textContent = 'Track activity, momentum, and communication patterns across your temporary rooms.';
  syncSidebarRoom();

  els.viewRoot.innerHTML = `
    <section class="view-panel">
      <div class="panel-head">
        <div>
          <p class="label">Overview</p>
          <h3>Your communication dashboard</h3>
        </div>
        <span class="tier-pill">Current room: ${escapeHtml(selectedRoom.title)}</span>
      </div>
      <div class="stats-grid">
        <article class="stat-card">
          <p class="label">Daily messages</p>
          <strong>${weeklyActivity[weeklyActivity.length - 1].messages}</strong>
          <small class="bar-label">Today</small>
        </article>
        <article class="stat-card">
          <p class="label">Monthly messages</p>
          <strong>${monthly.messages}</strong>
          <small class="bar-label">Rolling 7-day sample</small>
        </article>
        <article class="stat-card">
          <p class="label">Rooms joined</p>
          <strong>${monthly.rooms}</strong>
          <small class="bar-label">This period</small>
        </article>
        <article class="stat-card">
          <p class="label">Whispers sent</p>
          <strong>${monthly.whispers}</strong>
          <small class="bar-label">This period</small>
        </article>
      </div>
    </section>

    <section class="view-panel">
      <div class="panel-head compact">
        <div>
          <p class="label">Highlights</p>
          <h3>Best performing days</h3>
        </div>
      </div>
      <div class="highlights-grid">
        <article class="highlight-card">
          <p class="label">Most messages</p>
          <strong>${peakMessages.day}</strong>
          <p>${peakMessages.messages} messages</p>
        </article>
        <article class="highlight-card">
          <p class="label">Most room activity</p>
          <strong>${peakRooms.day}</strong>
          <p>${peakRooms.rooms} rooms joined</p>
        </article>
        <article class="highlight-card">
          <p class="label">Most whispers</p>
          <strong>${peakWhispers.day}</strong>
          <p>${peakWhispers.whispers} whispers sent</p>
        </article>
      </div>
    </section>

    <section class="view-panel">
      <div class="panel-head compact">
        <div>
          <p class="label">Weekly pattern</p>
          <h3>Messages by day</h3>
        </div>
      </div>
      <div class="weekly-chart">
        ${weeklyActivity
          .map((entry) => {
            const height = Math.max(24, Math.round((entry.messages / maxMessages) * 140));
            return `
              <div class="bar-wrap">
                <div class="bar" style="height:${height}px"></div>
                <span class="bar-value">${entry.messages}</span>
                <span class="bar-label">${entry.day}</span>
              </div>
            `;
          })
          .join('')}
      </div>
    </section>
  `;
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
                  <button class="ghost-button room-details" type="button" data-room="${escapeHtml(room.title)}">Details</button>
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
      showToast(`Active room set to ${roomTitle}`, 'success');
    });
  });

  document.querySelectorAll('.room-details').forEach((button) => {
    button.addEventListener('click', (event) => {
      const roomTitle = event.currentTarget.dataset.room;
      const room = rooms.find((entry) => entry.title === roomTitle);
      if (room) {
        openRoomDrawer(room);
      }
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
        <div class="mini-chart-grid">
          <article class="mini-chart">
            <p class="label">Weekly points trend</p>
            <div class="mini-chart-bars">
              ${weeklyActivity.map((d) => `<span class="mini-chart-bar" style="height:${Math.max(10, d.messages)}px"></span>`).join('')}
            </div>
          </article>
          <article class="mini-chart">
            <p class="label">Trust trend</p>
            <div class="mini-chart-bars">
              ${weeklyActivity.map((d) => `<span class="mini-chart-bar" style="height:${Math.max(10, d.whispers * 8)}px"></span>`).join('')}
            </div>
          </article>
        </div>
      </div>
      <div class="settings-list">
        <div class="settings-row">
          <div>
            <p class="label">Profile visibility</p>
            <strong>Anonymous by default</strong>
          </div>
          <button class="toggle ${state.settings.whisperRequests ? 'on' : ''}" data-setting="whisperRequests" aria-label="Toggle whisper requests"></button>
        </div>
        <div class="settings-row">
          <div>
            <p class="label">Temporary chats</p>
            <strong>Auto-delete after 24 hours</strong>
          </div>
          <button class="toggle ${state.settings.roomInvites ? 'on' : ''}" data-setting="roomInvites" aria-label="Toggle room invites"></button>
        </div>
        <div class="settings-row">
          <div>
            <p class="label">Reports</p>
            <strong>Quick moderation access</strong>
          </div>
          <button class="toggle ${state.settings.moderationAlerts ? 'on' : ''}" data-setting="moderationAlerts" aria-label="Toggle moderation alerts"></button>
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

  document.querySelectorAll('.toggle[data-setting]').forEach((toggleButton) => {
    toggleButton.addEventListener('click', () => {
      const settingKey = toggleButton.dataset.setting;
      state.settings[settingKey] = !state.settings[settingKey];
      showToast('Setting updated', 'success');
      savePersistentState();
      renderProfile();
    });
  });
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
          <button class="toggle ${state.settings.whisperRequests ? 'on' : ''}" data-setting="whisperRequests" aria-label="Toggle whisper requests"></button>
        </div>
        <div class="settings-row">
          <div>
            <p class="label">Room invites</p>
            <strong>Only from joined categories</strong>
          </div>
          <button class="toggle ${state.settings.roomInvites ? 'on' : ''}" data-setting="roomInvites" aria-label="Toggle room invites"></button>
        </div>
        <div class="settings-row">
          <div>
            <p class="label">Moderation alerts</p>
            <strong>Immediate warnings</strong>
          </div>
          <button class="toggle ${state.settings.moderationAlerts ? 'on' : ''}" data-setting="moderationAlerts" aria-label="Toggle moderation alerts"></button>
        </div>
      </div>
    </section>
  `;

  document.querySelectorAll('.toggle[data-setting]').forEach((toggleButton) => {
    toggleButton.addEventListener('click', () => {
      const settingKey = toggleButton.dataset.setting;
      state.settings[settingKey] = !state.settings[settingKey];
      showToast('Setting updated', 'success');
      savePersistentState();
      renderSettings();
    });
  });
}

function hydrateAnonymousIdentity() {
  els.sidebarAvatar.textContent = anonymousUser.icon;
  els.sidebarDisplayName.textContent = anonymousUser.name;
  els.sidebarStatusText.textContent = anonymousUser.status;
  els.profileAvatar.textContent = anonymousUser.icon;
  els.profileName.textContent = `${anonymousUser.name}${Math.floor(Math.random() * 900) + 100}`;
}

function createRoomFromModal() {
  const title = els.roomNameInput.value.trim();
  const category = els.roomTopicInput.value.trim();
  const vibe = els.roomVibeInput.value.trim();

  if (!title || !category) {
    showToast('Room name and topic are required', 'warning');
    return;
  }

  rooms.unshift({
    title,
    category,
    users: '1/15',
    status: 'Just now',
    description: vibe ? `Room vibe: ${vibe}` : 'Newly created temporary room.',
    selected: false,
  });

  const topicExists = topics.some((topic) => topic.name.toLowerCase() === category.toLowerCase());
  if (!topicExists) {
    topics.push({
      name: category,
      description: 'Custom category created from room setup.',
      members: 1,
      tone: 'Fresh',
    });
  }

  els.roomNameInput.value = '';
  els.roomTopicInput.value = '';
  els.roomVibeInput.value = '';
  closeModal(els.roomModal);
  showToast('Room created successfully', 'success');
  savePersistentState();
  setView('rooms');
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
els.confirmCreateRoomBtn.addEventListener('click', createRoomFromModal);
els.closeRoomDrawerBtn.addEventListener('click', closeRoomDrawer);

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

els.roomDrawerBackdrop.addEventListener('click', (event) => {
  if (event.target === els.roomDrawerBackdrop) {
    closeRoomDrawer();
  }
});

loadPersistentState();
hydrateAnonymousIdentity();
applyTheme(state.theme, { silent: true });
applySidebarState();
savePersistentState();
render();
