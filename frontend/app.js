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

const defaultRoomMessages = {
  'Pixel cafe': [
    { author: 'QuietNova', body: 'Shared a fresh card layout mockup. Need fast feedback.', me: false, time: '2m ago' },
    { author: anonymousUser.name, body: 'Looks clean. I would tighten spacing in the stats row.', me: true, time: '1m ago' },
  ],
  'Quiet sprint': [
    { author: 'SoftSignal', body: 'Starting 25 minute focus sprint now.', me: false, time: '5m ago' },
    { author: 'MistyOrbit', body: 'In. I will post progress at the 20 minute mark.', me: false, time: '4m ago' },
  ],
};

const roomMessages = {};

const STORAGE_KEY = 'vibehack-ui-state-v1';
const ONBOARDING_KEY = 'vibehack-onboarding-complete';

const onboardingSteps = [
  {
    title: 'Welcome to VibeHack',
    body: 'Anonymous, temporary rooms designed for low-pressure conversations and fast collaboration.',
  },
  {
    title: 'Discover and Join',
    body: 'Use Discover and Active Rooms to find a vibe, then hit Join to enter a real room interface.',
  },
  {
    title: 'Stay Safe',
    body: 'Use room moderation controls to mute or report. Actions stay in your local Safety history.',
  },
];

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
  chatDraft: '',
  mutedRooms: {},
  blockedUsers: {},
  moderationHistory: [],
  archivedRecaps: [],
  onboardingStep: 0,
  reportContextRoom: null,
  drawerRoomTitle: null,
  typingIndicatorRoom: null,
  touchStartX: 0,
  touchStartY: 0,
  searchDebounceTimer: null,
  walkthroughTimer: null,
  viewTransitionTimer: null,
  authMode: 'login',
  backendSyncReady: false,
  socketReady: false,
  socketId: null,
};

let socketClient = null;

const els = {
  authGate: document.getElementById('authGate'),
  appShellRoot: document.getElementById('appShellRoot'),
  authModeLoginBtn: document.getElementById('authModeLoginBtn'),
  authModeSignupBtn: document.getElementById('authModeSignupBtn'),
  authUsernameInput: document.getElementById('authUsernameInput'),
  authPasswordInput: document.getElementById('authPasswordInput'),
  authSwitchHint: document.getElementById('authSwitchHint'),
  authErrorText: document.getElementById('authErrorText'),
  authSubmitBtn: document.getElementById('authSubmitBtn'),
  authGuestBtn: document.getElementById('authGuestBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
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
  globalSearchInput: document.getElementById('globalSearchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  profileName: document.getElementById('profileName'),
  profileAvatar: document.getElementById('profileAvatar'),
  sidebarAvatar: document.getElementById('sidebarAvatar'),
  sidebarDisplayName: document.getElementById('sidebarDisplayName'),
  sidebarStatusText: document.getElementById('sidebarStatusText'),
  themeButtons: document.querySelectorAll('.theme-btn'),
  sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
  appShell: document.querySelector('.app-shell'),
  muteRoomBtn: document.getElementById('muteRoomBtn'),
  reportRoomBtn: document.getElementById('reportRoomBtn'),
  leaveRoomBtn: document.getElementById('leaveRoomBtn'),
  reportModal: document.getElementById('reportModal'),
  closeReportModal: document.getElementById('closeReportModal'),
  reportReasonInput: document.getElementById('reportReasonInput'),
  reportDetailsInput: document.getElementById('reportDetailsInput'),
  reportContextText: document.getElementById('reportContextText'),
  submitReportBtn: document.getElementById('submitReportBtn'),
  onboardingModal: document.getElementById('onboardingModal'),
  onboardingTitle: document.getElementById('onboardingTitle'),
  onboardingBody: document.getElementById('onboardingBody'),
  onboardingPrevBtn: document.getElementById('onboardingPrevBtn'),
  onboardingSkipBtn: document.getElementById('onboardingSkipBtn'),
  onboardingNextBtn: document.getElementById('onboardingNextBtn'),
  mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
};

function savePersistentState() {
  const payload = {
    rooms,
    topics,
    weeklyActivity,
    roomMessages,
    state: {
      roomTitle: state.room?.title,
      theme: state.theme,
      sidebarCollapsed: state.sidebarCollapsed,
      settings: state.settings,
      mutedRooms: state.mutedRooms,
      blockedUsers: state.blockedUsers,
      moderationHistory: state.moderationHistory,
      archivedRecaps: state.archivedRecaps,
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
    if (parsed.roomMessages && typeof parsed.roomMessages === 'object') {
      Object.assign(roomMessages, parsed.roomMessages);
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
    if (parsed.state?.mutedRooms && typeof parsed.state.mutedRooms === 'object') {
      state.mutedRooms = parsed.state.mutedRooms;
    }
    if (parsed.state?.blockedUsers && typeof parsed.state.blockedUsers === 'object') {
      state.blockedUsers = parsed.state.blockedUsers;
    }
    if (Array.isArray(parsed.state?.moderationHistory)) {
      state.moderationHistory = parsed.state.moderationHistory;
    }
    if (Array.isArray(parsed.state?.archivedRecaps)) {
      state.archivedRecaps = parsed.state.archivedRecaps;
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
    const isRoomsProxy = view === 'room' && item.dataset.view === 'rooms';
    const isActive = item.dataset.view === view || isRoomsProxy;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  els.mobileNavLinks.forEach((item) => {
    const isRoomsProxy = view === 'room' && item.dataset.view === 'rooms';
    const isActive = item.dataset.view === view || isRoomsProxy;
    item.classList.toggle('active', isActive);
    item.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
  renderLoadingState();
  clearTimeout(state.viewTransitionTimer);
  state.viewTransitionTimer = setTimeout(() => {
    render();
  }, 90);
}

function renderLoadingState() {
  els.viewRoot.innerHTML = `
    <section class="view-panel">
      <div class="stats-grid">
        <article class="stat-card skeleton"></article>
        <article class="stat-card skeleton"></article>
        <article class="stat-card skeleton"></article>
        <article class="stat-card skeleton"></article>
      </div>
    </section>
  `;
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

function setAuthError(message = '') {
  if (!message) {
    els.authErrorText.style.display = 'none';
    els.authErrorText.textContent = '';
    return;
  }
  els.authErrorText.style.display = 'block';
  els.authErrorText.textContent = message;
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isSignup = mode === 'signup';
  els.authModeLoginBtn.classList.toggle('active', !isSignup);
  els.authModeSignupBtn.classList.toggle('active', isSignup);
  els.authSubmitBtn.textContent = isSignup ? 'Create account' : 'Login';
  els.authSwitchHint.textContent = isSignup
    ? 'Already have an account? Switch to Login.'
    : 'New here? Switch to Sign up.';
  setAuthError('');
}

function showAppShell() {
  els.authGate.classList.add('hidden');
  els.appShellRoot.classList.remove('hidden');
}

function showAuthGate() {
  els.appShellRoot.classList.add('hidden');
  els.authGate.classList.remove('hidden');
}

async function handleAuthSubmit() {
  const username = els.authUsernameInput.value.trim();
  const password = els.authPasswordInput.value;

  if (state.authMode === 'signup') {
    const result = await window.AuthUtils.signupWithFallback({ username, password });
    if (!result.ok) {
      setAuthError(result.error);
      return;
    }
    showToast('Account created. Welcome to VibeHack.', 'success');
  } else {
    const result = await window.AuthUtils.loginWithFallback({ username, password });
    if (!result.ok) {
      setAuthError(result.error);
      return;
    }
    showToast('Login successful.', 'success');
  }

  setAuthError('');
  els.authPasswordInput.value = '';
  hydrateAnonymousIdentity();
  showAppShell();
  await bootstrapBackendConnections();
  render();
  ensureOnboarding();
}

async function continueAsGuest() {
  const guestSession = window.AuthUtils.loginAsGuest();
  els.authUsernameInput.value = guestSession.username;
  els.authPasswordInput.value = '';
  showToast('Continuing as guest', 'info');
  hydrateAnonymousIdentity();
  showAppShell();
  await bootstrapBackendConnections();
  render();
  ensureOnboarding();
}

function logout() {
  if (socketClient) {
    socketClient.disconnect();
    socketClient = null;
  }
  state.socketReady = false;
  state.socketId = null;
  state.backendSyncReady = false;
  window.AuthUtils.logout();
  showToast('Logged out', 'info');
  showAuthGate();
}

function mapBackendRoom(entry) {
  const count = Number(entry.user_count || 0);
  return {
    title: entry.room_name,
    category: entry.category || 'General',
    users: `${Math.min(count, 15)}/15`,
    status: 'Live',
    description: `Trending room with ${count} active participant${count === 1 ? '' : 's'}.`,
    selected: false,
    createdAt: Date.now(),
    expiresAt: Date.now() + 12 * 60 * 60000,
  };
}

async function syncTrendingRoomsFromBackend() {
  const apiBase = window.AuthUtils?.getApiBase() || '';
  try {
    const response = await fetch(`${apiBase}/api/rooms/trending`);
    if (!response.ok) {
      return;
    }
    const payload = await response.json();
    const trending = Array.isArray(payload.trending_rooms) ? payload.trending_rooms : [];
    if (!trending.length) {
      return;
    }

    const mapped = trending.map(mapBackendRoom);
    const existingTitles = new Set(rooms.map((room) => room.title));
    mapped.forEach((room) => {
      if (!existingTitles.has(room.title)) {
        rooms.unshift(room);
      }
    });

    savePersistentState();
  } catch (_error) {
    // Keep local fallback data if backend is unavailable.
  }
}

async function syncProfileFromBackend() {
  const session = window.AuthUtils.getSession();
  if (!session?.token) {
    return;
  }
  const apiBase = window.AuthUtils?.getApiBase() || '';
  try {
    const response = await fetch(`${apiBase}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    });
    if (!response.ok) {
      return;
    }
    const me = await response.json();
    if (me?.username) {
      anonymousUser.name = me.username;
      anonymousUser.status = `Online · ${Math.max(0, Number(me.auth_points || 0))} authenticity points`;
      hydrateAnonymousIdentity();
    }
  } catch (_error) {
    // Non-blocking profile sync.
  }
}

function connectSocketIfAvailable() {
  if (socketClient || typeof window.io !== 'function') {
    return;
  }

  const apiBase = window.AuthUtils?.getApiBase() || '';
  socketClient = window.io(apiBase || '/', {
    transports: ['websocket', 'polling'],
  });

  socketClient.on('connect', () => {
    state.socketReady = true;
    state.socketId = socketClient.id;
  });

  socketClient.on('disconnect', () => {
    state.socketReady = false;
    state.socketId = null;
  });

  socketClient.on('receive_message', (payload) => {
    const activeRoomTitle = state.room?.title;
    if (!activeRoomTitle) {
      return;
    }
    const messages = getRoomMessages(activeRoomTitle);
    messages.push({
      author: payload.sender || 'Ghost',
      body: payload.message || '',
      me: false,
      time: 'now',
    });
    savePersistentState();
    if (state.view === 'room') {
      renderRoomInterface();
    }
  });

  socketClient.on('system_message', (payload) => {
    showToast(payload.msg || 'Room update', 'info');
  });
}

async function bootstrapBackendConnections() {
  if (state.backendSyncReady) {
    return;
  }
  await syncTrendingRoomsFromBackend();
  await syncProfileFromBackend();
  connectSocketIfAvailable();
  state.backendSyncReady = true;
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

function getEmptyStateMarkup(title, description, actionLabel, actionId) {
  return `
    <article class="empty-state glass-subtle">
      <h4>${escapeHtml(title)}</h4>
      <p>${escapeHtml(description)}</p>
      ${actionLabel && actionId ? `<button class="ghost-button" id="${escapeHtml(actionId)}" type="button">${escapeHtml(actionLabel)}</button>` : ''}
    </article>
  `;
}

function resetAppState() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('vibehack-theme');
  showToast('Saved state reset. Reloading default demo...', 'warning');
  setTimeout(() => {
    window.location.reload();
  }, 450);
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
  state.drawerRoomTitle = room.title;
  els.roomDrawerBackdrop.classList.remove('hidden');
}

function closeRoomDrawer() {
  state.drawerRoomTitle = null;
  els.roomDrawerBackdrop.classList.add('hidden');
}

function getDrawerRoom() {
  return rooms.find((room) => room.title === state.drawerRoomTitle) || state.room;
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

function getRoomCountdownText(room) {
  ensureRoomExpiry(room);
  const totalMinutes = Math.max(0, Math.round((room.expiresAt - Date.now()) / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
}

function deterministicLifetimeMinutes(room) {
  const source = `${room.title}|${room.category}`;
  let hash = 0;
  for (let index = 0; index < source.length; index += 1) {
    hash = (hash << 5) - hash + source.charCodeAt(index);
    hash |= 0;
  }
  return 90 + Math.abs(hash % 990);
}

function ensureRoomExpiry(room) {
  if (!room.createdAt) {
    room.createdAt = Date.now();
  }
  if (!room.expiresAt) {
    const lifetimeMinutes = deterministicLifetimeMinutes(room);
    room.expiresAt = room.createdAt + lifetimeMinutes * 60000;
  }
}

function sweepExpiredRooms() {
  const now = Date.now();
  const survivors = [];
  let archived = 0;

  rooms.forEach((room) => {
    ensureRoomExpiry(room);
    if (room.expiresAt <= now) {
      state.archivedRecaps.unshift(getRoomRecap(room));
      archived += 1;
    } else {
      survivors.push(room);
    }
  });

  if (!archived) {
    return;
  }

  rooms.splice(0, rooms.length, ...survivors);
  state.archivedRecaps = state.archivedRecaps.slice(0, 12);

  if (!rooms.length) {
    const fallbackRoom = {
      title: 'Fresh lobby',
      category: 'General',
      users: '1/15',
      status: 'Just now',
      description: 'A newly initialized temporary room.',
      selected: true,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60000,
    };
    rooms.push(fallbackRoom);
  }

  if (!rooms.some((room) => room.title === state.room?.title)) {
    state.room = rooms[0];
  }

  rooms.forEach((room) => {
    room.selected = room.title === state.room.title;
  });

  logModerationAction('Rooms expired', `${archived} room(s) auto-archived`);
  showToast(`${archived} expired room(s) moved to recap archive`, 'info');
  savePersistentState();
}

function getRoomRecap(room) {
  const messages = getRoomMessages(room.title);
  return {
    roomTitle: room.title,
    category: room.category,
    highlights: [
      `${messages.length} total messages in sample`,
      `${room.users} online at archive time`,
      `Most recent vibe: ${room.description}`,
    ],
    archivedAt: new Date().toISOString(),
  };
}

function logModerationAction(action, detail) {
  state.moderationHistory.unshift({
    action,
    detail,
    when: new Date().toISOString(),
  });
  state.moderationHistory = state.moderationHistory.slice(0, 20);
  savePersistentState();
}

function getRoomMessages(roomTitle) {
  if (!roomMessages[roomTitle]) {
    roomMessages[roomTitle] = defaultRoomMessages[roomTitle]
      ? [...defaultRoomMessages[roomTitle]]
      : [{ author: 'System', body: 'Room started. Be respectful and keep it low-pressure.', me: false, time: 'now' }];
  }
  return roomMessages[roomTitle];
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

    <section class="view-panel">
      <div class="panel-head compact">
        <div>
          <p class="label">Safety center</p>
          <h3>Recent moderation activity</h3>
        </div>
      </div>
      <div class="feed-grid">
        ${
          state.moderationHistory.length
            ? state.moderationHistory
                .slice(0, 4)
                .map(
                  (entry) => `
                    <article class="feed-card">
                      <h4>${escapeHtml(entry.action)}</h4>
                      <p>${escapeHtml(entry.detail)}</p>
                      <small>${escapeHtml(new Date(entry.when).toLocaleString())}</small>
                    </article>
                  `,
                )
                .join('')
            : getEmptyStateMarkup('No moderation actions yet', 'Use room-level controls to report, mute, or leave. Safety history will appear here.')
        }
      </div>
    </section>

    <section class="view-panel">
      <div class="panel-head compact">
        <div>
          <p class="label">Archived recaps</p>
          <h3>Expired room snapshots</h3>
        </div>
      </div>
      <div class="feed-grid">
        ${
          state.archivedRecaps.length
            ? state.archivedRecaps
                .slice(0, 4)
                .map(
                  (recap) => `
                    <article class="feed-card">
                      <h4>${escapeHtml(recap.roomTitle)} · ${escapeHtml(recap.category)}</h4>
                      <p>${escapeHtml(recap.highlights[0])}</p>
                      <small>${escapeHtml(new Date(recap.archivedAt).toLocaleString())}</small>
                    </article>
                  `,
                )
                .join('')
            : getEmptyStateMarkup('No archived recaps yet', 'When a room expires or you leave one, a lightweight recap will show here.')
        }
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
        ${
          filteredTopics.length
            ? `
              <button class="bubble-chip ${state.topicFilter === 'all' ? 'active' : ''}" data-topic="all" type="button">
                <span>All rooms</span>
                <small>${rooms.length} spaces</small>
              </button>
              ${filteredTopics
                .map(
                  (topic) => `
                    <button class="bubble-chip ${state.topicFilter === topic.name.toLowerCase() ? 'active' : ''}" data-topic="${escapeHtml(topic.name.toLowerCase())}" type="button">
                      <span>${escapeHtml(topic.name)}</span>
                      <small>${topic.members} rooms/users</small>
                    </button>
                  `,
                )
                .join('')}
            `
            : getEmptyStateMarkup('No matching topics', 'Try a broader keyword or create a custom room topic.', 'Create topic room', 'discoverCreateRoomBtn')
        }
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
        ${
          filteredRooms.length
            ? filteredRooms
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
                .join('')
            : getEmptyStateMarkup('No rooms in this view', 'Create a new room to seed this category and keep the conversation moving.', 'Create room', 'discoverCreateRoomBtn')
        }
      </div>
    </section>
  `;

  const discoverCreateRoomBtn = document.getElementById('discoverCreateRoomBtn');
  if (discoverCreateRoomBtn) {
    discoverCreateRoomBtn.addEventListener('click', () => openModal(els.roomModal));
  }

  const createRoomInlineBtn = document.getElementById('createRoomInlineBtn');
  if (createRoomInlineBtn) {
    createRoomInlineBtn.addEventListener('click', () => openModal(els.roomModal));
  }

  document.querySelectorAll('.bubble-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      setTopicFilter(chip.dataset.topic);
    });
  });
}

function renderRoomInterface() {
  const activeRoom = state.room;
  const messages = getRoomMessages(activeRoom.title);
  const visibleMessages = messages.filter((message) => !state.blockedUsers[message.author]);
  const roomMuted = Boolean(state.mutedRooms[activeRoom.title]);
  const countdown = getRoomCountdownText(activeRoom);
  const isTypingHere = state.typingIndicatorRoom === activeRoom.title;

  els.pageTitle.textContent = activeRoom.title;
  els.pageSubtitle.textContent = 'Temporary room chat. Messages and context stay lightweight and private.';
  syncSidebarRoom();

  els.viewRoot.innerHTML = `
    <section class="view-panel chat-shell">
      <div class="chat-topline">
        <div>
          <p class="label">In room</p>
          <h3>${escapeHtml(activeRoom.title)}</h3>
          <div class="chat-meta">
            <span>${escapeHtml(activeRoom.category)}</span>
            <span>${escapeHtml(activeRoom.users)} online</span>
            <span>Auto delete in ${escapeHtml(countdown)}</span>
          </div>
        </div>
        <div class="profile-actions">
          <button class="ghost-button" id="roomDetailOpenBtn" type="button">Details</button>
          <button class="ghost-button" id="backToRoomsBtn" type="button">All rooms</button>
        </div>
      </div>

      ${roomMuted ? '<div class="chat-muted-banner">This room is muted for you. You can still read history, but sending is disabled.</div>' : ''}

      <div class="message-feed">
        ${visibleMessages
          .map((message, index) => {
            const previous = visibleMessages[index - 1];
            const grouped = Boolean(previous && previous.author === message.author);
            return `
              <article class="message-row ${message.me ? 'me' : ''} ${grouped ? 'grouped' : ''}">
                <div class="message-row-head">
                  ${grouped ? '<span></span>' : `<strong>${escapeHtml(message.author)}</strong>`}
                  ${!message.me ? `<button class="tiny-button block-user-btn" data-user="${escapeHtml(message.author)}" type="button">Block</button>` : ''}
                </div>
                <p>${escapeHtml(message.body)}</p>
                <small>${escapeHtml(message.time)}${message.me ? ' · Seen' : ''}</small>
              </article>
            `;
          })
          .join('')}
        ${isTypingHere ? '<article class="message-row"><small>Someone is typing...</small></article>' : ''}
      </div>

      <form class="composer ${roomMuted ? 'disabled' : ''}" id="roomComposerForm">
        <input id="roomComposerInput" type="text" placeholder="Send something kind and helpful..." value="${escapeHtml(state.chatDraft)}" />
        <button class="cta-button" type="submit">Send</button>
      </form>
    </section>
  `;

  const roomComposerForm = document.getElementById('roomComposerForm');
  const roomComposerInput = document.getElementById('roomComposerInput');
  const roomDetailOpenBtn = document.getElementById('roomDetailOpenBtn');
  const backToRoomsBtn = document.getElementById('backToRoomsBtn');

  roomComposerInput.addEventListener('input', (event) => {
    state.chatDraft = event.target.value;
    state.typingIndicatorRoom = event.target.value.trim() ? activeRoom.title : null;
  });

  roomComposerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (roomMuted) {
      showToast('Room is muted. Unmute from room controls to send.', 'warning');
      return;
    }
    const nextMessage = roomComposerInput.value.trim();
    if (!nextMessage) {
      return;
    }
    if (socketClient && state.socketReady) {
      socketClient.emit('send_message', { message: nextMessage });
    } else {
      messages.push({
        author: anonymousUser.name,
        body: nextMessage,
        me: true,
        time: 'now',
      });
      messages.push({
        author: 'System',
        body: `${anonymousUser.name} sent a new message`,
        me: false,
        time: 'just now',
      });
    }
    state.chatDraft = '';
    state.typingIndicatorRoom = null;
    savePersistentState();
    renderRoomInterface();
  });

  document.querySelectorAll('.block-user-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      const userName = event.currentTarget.dataset.user;
      state.blockedUsers[userName] = true;
      logModerationAction('Blocked user', `${userName} in ${activeRoom.title}`);
      showToast(`${userName} blocked locally`, 'warning');
      savePersistentState();
      renderRoomInterface();
    });
  });

  roomDetailOpenBtn.addEventListener('click', () => openRoomDrawer(activeRoom));
  backToRoomsBtn.addEventListener('click', () => setView('rooms'));
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
        ${
          filteredRooms.length
            ? filteredRooms
                .map(
                        (room) => {
                          const minutesLeft = Math.max(0, Math.round((room.expiresAt - Date.now()) / 60000));
                          const expiringSoon = minutesLeft <= 20;
                          return `
                          <article class="room-row ${room.selected ? 'selected' : ''} ${expiringSoon ? 'expiring' : ''}" data-room="${escapeHtml(room.title)}">
                      <div class="room-top">
                        <div>
                          <p class="label">${escapeHtml(room.category)}</p>
                          <h4>${escapeHtml(room.title)}</h4>
                          <p>${escapeHtml(room.description)}</p>
                          <small>Expires in ${escapeHtml(getRoomCountdownText(room))}</small>
                        </div>
                        <span class="room-badge">${escapeHtml(room.users)}</span>
                      </div>
                      <div class="room-actions">
                        <button class="ghost-button room-activate" type="button" data-room="${escapeHtml(room.title)}">Make active</button>
                        <button class="ghost-button room-details" type="button" data-room="${escapeHtml(room.title)}">Details</button>
                              <button class="cta-button room-join" type="button" data-room="${escapeHtml(room.title)}">${expiringSoon ? 'Join fast' : 'Join'}</button>
                      </div>
                    </article>
                        `;
                        },
                )
                .join('')
            : getEmptyStateMarkup('No rooms match your filter', 'Reset your search or create a new room to continue.', 'Create room', 'roomsCreateRoomBtn')
        }
      </div>
    </section>
  `;

  const roomsCreateRoomBtn = document.getElementById('roomsCreateRoomBtn');
  if (roomsCreateRoomBtn) {
    roomsCreateRoomBtn.addEventListener('click', () => openModal(els.roomModal));
  }

  document.querySelectorAll('.room-activate').forEach((button) => {
    button.addEventListener('click', (event) => {
      const roomTitle = event.currentTarget.dataset.room;
      setRoom(roomTitle);
      showToast(`Active room set to ${roomTitle}`, 'success');
    });
  });

  document.querySelectorAll('.room-join').forEach((button) => {
    button.addEventListener('click', (event) => {
      const roomTitle = event.currentTarget.dataset.room;
      setRoom(roomTitle);
      const session = window.AuthUtils.getSession();
      const room = rooms.find((entry) => entry.title === roomTitle);
      if (socketClient && state.socketReady) {
        socketClient.emit('join_room', {
          room_name: roomTitle,
          category: room?.category || 'General',
          permanent_username: session?.username || session?.name || 'guest',
        });
      } else {
        const roomLog = getRoomMessages(roomTitle);
        roomLog.push({ author: 'System', body: `${anonymousUser.name} joined the room`, me: false, time: 'now' });
        savePersistentState();
      }
      setView('room');
      showToast(`Entered ${roomTitle}`, 'success');
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
        <div class="feature-grid">
          <article class="feature-card">
            <p class="label">How points are earned</p>
            <strong>Transparent scoring</strong>
            <p>+4 for helpful messages, +8 for positive reports resolved, -10 for verified abuse reports.</p>
          </article>
          <article class="feature-card">
            <p class="label">Reputation badge</p>
            <strong>${state.moderationHistory.length > 8 ? 'Veteran' : 'Trusted'}</strong>
            <p>Badge updates from consistency, safety behavior, and room participation quality.</p>
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
          ${(state.moderationHistory.length
            ? state.moderationHistory.slice(0, 3).map((entry) => `
              <div class="timeline-row">
                <span>${escapeHtml(entry.action)}</span>
                <strong>${escapeHtml(new Date(entry.when).toLocaleDateString())}</strong>
              </div>
            `).join('')
            : `
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
            `)}
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
        <div class="settings-row">
          <div>
            <p class="label">Demo state</p>
            <strong>Clear local cache and restart with defaults</strong>
          </div>
          <button class="ghost-button danger" id="resetStateBtn" type="button">Reset</button>
        </div>
        <div class="settings-row">
          <div>
            <p class="label">Seed sample activity</p>
            <strong>Generate extra rooms and chat context for demos</strong>
          </div>
          <button class="ghost-button" id="seedDemoBtn" type="button">Seed</button>
        </div>
        <div class="settings-row">
          <div>
            <p class="label">Scripted walkthrough</p>
            <strong>Auto-cycle through views for judge presentations</strong>
          </div>
          <button class="ghost-button" id="walkthroughBtn" type="button">Run</button>
        </div>
      </div>

      <div class="panel-head compact" style="margin-top: 14px;">
        <div>
          <p class="label">Safety center</p>
          <h3>Moderation history</h3>
        </div>
      </div>
      <div class="feed-grid">
        ${
          state.moderationHistory.length
            ? state.moderationHistory
                .map(
                  (entry) => `
                    <article class="feed-card">
                      <h4>${escapeHtml(entry.action)}</h4>
                      <p>${escapeHtml(entry.detail)}</p>
                      <small>${escapeHtml(new Date(entry.when).toLocaleString())}</small>
                    </article>
                  `,
                )
                .join('')
            : getEmptyStateMarkup('No moderation events', 'Report or mute actions will appear here for quick review.')
        }
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

  const resetStateBtn = document.getElementById('resetStateBtn');
  const seedDemoBtn = document.getElementById('seedDemoBtn');
  const walkthroughBtn = document.getElementById('walkthroughBtn');
  if (resetStateBtn) {
    resetStateBtn.addEventListener('click', () => {
      resetAppState();
    });
  }
  if (seedDemoBtn) {
    seedDemoBtn.addEventListener('click', () => {
      seedDemoActivity();
    });
  }
  if (walkthroughBtn) {
    walkthroughBtn.addEventListener('click', () => {
      startWalkthroughMode();
    });
  }
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
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60000,
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

function openReportModal(room) {
  state.reportContextRoom = room;
  els.reportContextText.textContent = `Reporting activity in ${room.title}. Your identity remains anonymous.`;
  openModal(els.reportModal);
}

function submitReport() {
  const room = state.reportContextRoom || state.room;
  const reason = els.reportReasonInput.value;
  const details = els.reportDetailsInput.value.trim();
  const detailText = details ? `${reason}: ${details}` : reason;
  logModerationAction('Submitted report', `${room.title} · ${detailText}`);
  closeModal(els.reportModal);
  els.reportDetailsInput.value = '';
  showToast('Report submitted. Thanks for helping keep rooms safe.', 'success');
}

function seedDemoActivity() {
  const now = Date.now();
  const demoRoom = {
    title: `Demo room ${Math.floor(Math.random() * 90 + 10)}`,
    category: pickRandom(['Design', 'Building', 'Study', 'Music']),
    users: `${Math.floor(Math.random() * 8 + 3)}/15`,
    status: 'Just now',
    description: 'Auto-seeded demo conversation room.',
    selected: false,
    createdAt: now,
    expiresAt: now + (60 + Math.floor(Math.random() * 600)) * 60000,
  };

  rooms.unshift(demoRoom);
  const messages = getRoomMessages(demoRoom.title);
  messages.push({ author: 'System', body: 'Demo activity seeded for judge walkthrough.', me: false, time: 'now' });
  logModerationAction('Seeded demo', `Created ${demoRoom.title}`);
  showToast('Sample activity seeded', 'success');
  savePersistentState();
  render();
}

function startWalkthroughMode() {
  if (state.walkthroughTimer) {
    clearInterval(state.walkthroughTimer);
    state.walkthroughTimer = null;
    showToast('Walkthrough stopped', 'info');
    return;
  }

  const sequence = ['home', 'discover', 'rooms', 'room', 'profile', 'settings'];
  let index = 0;
  showToast('Walkthrough started', 'info');
  state.walkthroughTimer = setInterval(() => {
    const view = sequence[index % sequence.length];
    if (view === 'room') {
      setView('room');
    } else {
      setView(view);
    }
    index += 1;
    if (index >= sequence.length) {
      clearInterval(state.walkthroughTimer);
      state.walkthroughTimer = null;
      showToast('Walkthrough complete', 'success');
    }
  }, 1400);
}

function advanceOnboarding(stepDelta) {
  state.onboardingStep += stepDelta;
  if (state.onboardingStep < 0) {
    state.onboardingStep = 0;
  }

  if (state.onboardingStep >= onboardingSteps.length) {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    closeModal(els.onboardingModal);
    showToast('You are all set. Explore and join a room.', 'success');
    return;
  }

  const step = onboardingSteps[state.onboardingStep];
  els.onboardingTitle.textContent = step.title;
  els.onboardingBody.textContent = step.body;
  els.onboardingPrevBtn.disabled = state.onboardingStep === 0;
  els.onboardingNextBtn.textContent = state.onboardingStep === onboardingSteps.length - 1 ? 'Finish' : 'Next';
}

function ensureOnboarding() {
  const completed = localStorage.getItem(ONBOARDING_KEY) === 'true';
  if (completed) {
    return;
  }
  state.onboardingStep = 0;
  advanceOnboarding(0);
  openModal(els.onboardingModal);
}

function render() {
  sweepExpiredRooms();

  if (els.globalSearchInput.value !== state.search) {
    els.globalSearchInput.value = state.search;
  }

  if (state.view === 'home') {
    renderHome();
  } else if (state.view === 'room') {
    renderRoomInterface();
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

els.mobileNavLinks.forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

els.themeButtons.forEach((button) => {
  button.addEventListener('click', () => applyTheme(button.dataset.theme));
});

els.sidebarToggleBtn.addEventListener('click', toggleSidebar);
els.globalSearchInput.addEventListener('input', (event) => {
  clearTimeout(state.searchDebounceTimer);
  state.searchDebounceTimer = setTimeout(() => {
    state.search = event.target.value;
    render();
  }, 150);
});
els.clearSearchBtn.addEventListener('click', () => {
  state.search = '';
  els.globalSearchInput.value = '';
  render();
});

els.createRoomBtn.addEventListener('click', () => openModal(els.roomModal));
els.jumpToRoomBtn.addEventListener('click', () => setView('room'));
els.closeRoomModal.addEventListener('click', () => closeModal(els.roomModal));
els.closeProfileBtn.addEventListener('click', () => closeModal(els.profileModal));
els.confirmCreateRoomBtn.addEventListener('click', createRoomFromModal);
els.closeRoomDrawerBtn.addEventListener('click', closeRoomDrawer);
els.closeReportModal.addEventListener('click', () => closeModal(els.reportModal));
els.submitReportBtn.addEventListener('click', submitReport);

els.muteRoomBtn.addEventListener('click', () => {
  const roomTitle = getDrawerRoom().title;
  state.mutedRooms[roomTitle] = !state.mutedRooms[roomTitle];
  const isMuted = state.mutedRooms[roomTitle];
  logModerationAction(isMuted ? 'Muted room' : 'Unmuted room', roomTitle);
  showToast(isMuted ? `${roomTitle} muted` : `${roomTitle} unmuted`, isMuted ? 'warning' : 'success');
  savePersistentState();
  renderRoomInterface();
});

els.reportRoomBtn.addEventListener('click', () => openReportModal(getDrawerRoom()));
els.leaveRoomBtn.addEventListener('click', () => {
  const room = getDrawerRoom();
  const recap = getRoomRecap(room);
  state.archivedRecaps.unshift(recap);
  state.archivedRecaps = state.archivedRecaps.slice(0, 12);
  logModerationAction('Left room', `${room.title} moved to recap archive`);
  showToast(`Left ${room.title}. Recap saved in Home.`, 'info');

  const roomIndex = rooms.findIndex((entry) => entry.title === room.title);
  if (roomIndex >= 0) {
    rooms.splice(roomIndex, 1);
  }
  if (!rooms.length) {
    const now = Date.now();
    rooms.push({
      title: 'Fresh lobby',
      category: 'General',
      users: '1/15',
      status: 'Just now',
      description: 'A newly initialized temporary room.',
      selected: true,
      createdAt: now,
      expiresAt: now + 24 * 60 * 60000,
    });
  }
  if (state.room.title === room.title) {
    state.room = rooms[0];
  }
  savePersistentState();
  closeRoomDrawer();
  setView('rooms');
});

els.onboardingPrevBtn.addEventListener('click', () => advanceOnboarding(-1));
els.onboardingNextBtn.addEventListener('click', () => advanceOnboarding(1));
els.onboardingSkipBtn.addEventListener('click', () => {
  localStorage.setItem(ONBOARDING_KEY, 'true');
  closeModal(els.onboardingModal);
  showToast('Onboarding skipped. You can explore directly.', 'info');
});

els.authModeLoginBtn.addEventListener('click', () => setAuthMode('login'));
els.authModeSignupBtn.addEventListener('click', () => setAuthMode('signup'));
els.authSubmitBtn.addEventListener('click', handleAuthSubmit);
els.authGuestBtn.addEventListener('click', continueAsGuest);
els.logoutBtn.addEventListener('click', logout);

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

els.reportModal.addEventListener('click', (event) => {
  if (event.target === els.reportModal) {
    closeModal(els.reportModal);
  }
});

els.viewRoot.addEventListener('touchstart', (event) => {
  const touch = event.changedTouches[0];
  state.touchStartX = touch.clientX;
  state.touchStartY = touch.clientY;
});

els.viewRoot.addEventListener('touchend', (event) => {
  const touch = event.changedTouches[0];
  const dx = touch.clientX - state.touchStartX;
  const dy = touch.clientY - state.touchStartY;
  if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy)) {
    return;
  }

  const flow = ['discover', 'rooms', 'profile'];
  const current = state.view === 'room' ? 'rooms' : state.view;
  const index = flow.indexOf(current);
  if (index === -1) {
    return;
  }

  if (dx < 0 && index < flow.length - 1) {
    setView(flow[index + 1]);
  }
  if (dx > 0 && index > 0) {
    setView(flow[index - 1]);
  }
});

loadPersistentState();
hydrateAnonymousIdentity();
applyTheme(state.theme, { silent: true });
applySidebarState();
savePersistentState();
setAuthMode('login');

if (window.AuthUtils.getSession()) {
  showAppShell();
  bootstrapBackendConnections();
  render();
  ensureOnboarding();
} else {
  showAuthGate();
}
