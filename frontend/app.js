const topics = [
  { name: 'Design', description: 'UI feedback, prototyping, and visual experiments.', members: 128, tone: 'Soft glow' },
  { name: 'Study', description: 'Low-pressure accountability rooms for focus sprints.', members: 91, tone: 'Calm mode' },
  { name: 'Late Night', description: 'Spontaneous conversations after the day winds down.', members: 204, tone: 'Pulse' },
  { name: 'Mental Health', description: 'Supportive and anonymous check-ins.', members: 73, tone: 'Safe space' },
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
];

const messages = [
  { author: 'EchoBloom', text: 'Dropped a rough sketch. Feedback is welcome but keep it easy.', time: '2m', me: false },
  { author: 'User436', text: 'The glass effect makes it feel calm instead of noisy.', time: '1m', me: false },
  { author: 'You', text: 'Testing the low-pressure vibe. No pressure, just ideas.', time: 'now', me: true },
];

const state = {
  view: 'home',
  room: rooms.find((room) => room.selected) ?? rooms[0],
  search: '',
};

const els = {
  viewRoot: document.getElementById('viewRoot'),
  pageTitle: document.getElementById('pageTitle'),
  pageSubtitle: document.getElementById('pageSubtitle'),
  rightRail: document.getElementById('rightRail'),
  railRoomTitle: document.getElementById('railRoomTitle'),
  railRoomText: document.getElementById('railRoomText'),
  searchInput: document.getElementById('searchInput'),
  createRoomBtn: document.getElementById('createRoomBtn'),
  openProfileBtn: document.getElementById('openProfileBtn'),
  roomModal: document.getElementById('roomModal'),
  closeRoomModal: document.getElementById('closeRoomModal'),
  profileModal: document.getElementById('profileModal'),
  closeProfileBtn: document.getElementById('closeProfileBtn'),
  profileName: document.getElementById('profileName'),
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

function renderHome() {
  const selectedRoom = state.room;
  els.pageTitle.textContent = 'Home';
  els.pageSubtitle.textContent = 'Your active chat sits front and center.';
  els.rightRail.style.display = 'grid';
  els.railRoomTitle.textContent = selectedRoom.title;
  els.railRoomText.textContent = `${selectedRoom.users} users active · ${selectedRoom.status} · messages expire after 24 hours of inactivity.`;

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

  els.pageTitle.textContent = 'Discover';
  els.pageSubtitle.textContent = 'Browse topic feeds by interest and context.';
  els.rightRail.style.display = 'grid';
  els.railRoomTitle.textContent = 'Context feeds';
  els.railRoomText.textContent = 'Choose a topic and jump into a room built around it.';

  els.viewRoot.innerHTML = `
    <section class="view-panel">
      <div class="panel-head">
        <div>
          <p class="label">Context feeds</p>
          <h3>Topic streams</h3>
        </div>
        <span class="tier-pill">Search matched: ${filteredTopics.length}</span>
      </div>
      <div class="topic-grid">
        ${filteredTopics
          .map(
            (topic) => `
              <article class="topic-card">
                <p class="label">${escapeHtml(topic.tone)}</p>
                <h4>${escapeHtml(topic.name)}</h4>
                <p>${escapeHtml(topic.description)}</p>
                <small>${topic.members} people in this context</small>
              </article>
            `,
          )
          .join('')}
      </div>
    </section>
    <section class="view-panel">
      <div class="panel-head compact">
        <div>
          <p class="label">Featured posts</p>
          <h3>What people are talking about</h3>
        </div>
      </div>
      <div class="feed-grid">
        <article class="feed-card">
          <div class="feed-top">
            <div>
              <h4>Design critique room</h4>
              <p>People are sharing soft gradients, layout tests, and mobile-first feedback.</p>
            </div>
            <span class="tag-pill">Design</span>
          </div>
          <small>12 posts in the last hour · anonymous replies enabled</small>
        </article>
        <article class="feed-card">
          <div class="feed-top">
            <div>
              <h4>Study sprint check-in</h4>
              <p>Short focus check-ins and quiet accountability are keeping the room active.</p>
            </div>
            <span class="tag-pill">Study</span>
          </div>
          <small>8 posts in the last hour · rooms expire when inactive</small>
        </article>
      </div>
    </section>
  `;
}

function renderRooms() {
  const filteredRooms = rooms.filter((room) => {
    const haystack = `${room.title} ${room.category} ${room.description}`.toLowerCase();
    return haystack.includes(state.search.trim().toLowerCase());
  });

  els.pageTitle.textContent = 'Rooms';
  els.pageSubtitle.textContent = 'Browse temporary chatrooms and move your active room when needed.';
  els.rightRail.style.display = 'grid';
  els.railRoomTitle.textContent = 'Room directory';
  els.railRoomText.textContent = 'Each room supports anonymous chat with a 15 person limit.';

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
  els.pageSubtitle.textContent = 'Anonymous identity, points, and safety settings.';
  els.rightRail.style.display = 'grid';
  els.railRoomTitle.textContent = 'Profile';
  els.railRoomText.textContent = 'Other users only see avatar, username, and status.';

  els.viewRoot.innerHTML = `
    <section class="view-panel split-grid">
      <div class="profile-kpi">
        <div class="kpi-top">
          <div>
            <p class="label">Identity</p>
            <h3>EchoBloom</h3>
          </div>
          <span class="tier-pill">Veteran</span>
        </div>
        <div class="meter"><span style="width: 78%"></span></div>
        <div class="profile-grid">
          <div><span>Anonymity points</span><strong>742</strong></div>
          <div><span>Rooms joined</span><strong>18</strong></div>
          <div><span>Trust score</span><strong>96%</strong></div>
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
      </div>
    </section>
  `;
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
  }
}

document.querySelectorAll('.nav-link').forEach((button) => {
  button.addEventListener('click', () => setView(button.dataset.view));
});

els.searchInput.addEventListener('input', (event) => {
  state.search = event.target.value;
  render();
});

els.createRoomBtn.addEventListener('click', () => openModal(els.roomModal));
els.openProfileBtn.addEventListener('click', () => openModal(els.profileModal));
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

els.profileName.textContent = 'User436';
render();
