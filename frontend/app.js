const topics = [
  { name: 'Design', description: 'UI experiments, feedback, and quick critiques.', members: 128, tone: 'Soft glow' },
  { name: 'Study', description: 'Low-pressure accountability rooms for focus sprints.', members: 91, tone: 'Calm mode' },
  { name: 'Late Night', description: 'Spontaneous conversations after the day winds down.', members: 204, tone: 'Pulse' },
  { name: 'Mental Health', description: 'Supportive and anonymous check-ins.', members: 73, tone: 'Safe space' },
];

const rooms = [
  {
    title: 'Pixel cafe',
    category: 'Design',
    users: '12/15',
    status: '4 min ago',
    description: 'A lightweight room for sharing mockups and feedback.',
    selected: true,
  },
  {
    title: 'Quiet sprint',
    category: 'Study',
    users: '8/15',
    status: 'Active now',
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
  { author: 'User436', text: 'This palette feels soft. The glass effect helps it stay friendly.', time: '1m', me: false },
  { author: 'You', text: 'Testing the low-pressure vibe. No pressure, just ideas.', time: 'now', me: true },
];

const topicGrid = document.getElementById('topicGrid');
const roomList = document.getElementById('roomList');
const messageFeed = document.getElementById('messageFeed');
const activeRoomTitle = document.getElementById('activeRoomTitle');
const topicSearch = document.getElementById('topicSearch');
const createRoomBtn = document.getElementById('createRoomBtn');
const roomModal = document.getElementById('roomModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const profileModal = document.getElementById('profileModal');
const openUserCard = document.getElementById('openUserCard');
const closeProfileBtn = document.getElementById('closeProfileBtn');
const messageComposer = document.getElementById('messageComposer');
const messageInput = document.getElementById('messageInput');

let currentRoom = rooms.find((room) => room.selected) ?? rooms[0];

function renderTopics(filter = '') {
  const query = filter.trim().toLowerCase();
  const filtered = topics.filter((topic) => {
    const haystack = `${topic.name} ${topic.description} ${topic.tone}`.toLowerCase();
    return haystack.includes(query);
  });

  topicGrid.innerHTML = filtered
    .map(
      (topic) => `
        <article class="topic-card">
          <p class="label">${topic.tone}</p>
          <h4>${topic.name}</h4>
          <p>${topic.description}</p>
          <div class="topic-meta">
            <span>${topic.members} people</span>
            <span>Open feed</span>
          </div>
        </article>
      `,
    )
    .join('');
}

function setActiveRoom(roomTitle) {
  currentRoom = rooms.find((room) => room.title === roomTitle) ?? currentRoom;
  rooms.forEach((room) => {
    room.selected = room.title === currentRoom.title;
  });
  activeRoomTitle.textContent = currentRoom.title;
  renderRooms(topicSearch.value);
  renderMessages();
}

function renderRooms(filter = '') {
  const query = filter.trim().toLowerCase();
  const filtered = rooms.filter((room) => {
    const haystack = `${room.title} ${room.category} ${room.description}`.toLowerCase();
    return haystack.includes(query);
  });

  roomList.innerHTML = filtered
    .map(
      (room) => `
        <article class="room-card ${room.selected ? 'selected' : ''}" data-room="${room.title}">
          <div class="room-header">
            <div>
              <p class="label">${room.category}</p>
              <h4>${room.title}</h4>
              <p>${room.description}</p>
            </div>
            <span class="room-tag">${room.users}</span>
          </div>
          <div class="room-meta">
            <span>Temporary room</span>
            <span>${room.status}</span>
          </div>
          <div class="room-actions">
            <button class="ghost-btn view-room-btn" type="button" data-room="${room.title}">View room</button>
            <button class="primary-btn join-room-btn" type="button" data-room="${room.title}">Join now</button>
          </div>
        </article>
      `,
    )
    .join('');

  document.querySelectorAll('.room-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      const roomTitle = event.currentTarget.dataset.room;
      if (roomTitle) {
        setActiveRoom(roomTitle);
      }
    });
  });

  document.querySelectorAll('.view-room-btn, .join-room-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const roomTitle = event.currentTarget.dataset.room;
      if (roomTitle) {
        setActiveRoom(roomTitle);
      }
    });
  });
}

function renderMessages() {
  messageFeed.innerHTML = messages
    .map(
      (message) => `
        <article class="message-bubble ${message.me ? 'me' : ''}">
          <strong>${message.author}</strong>
          <p>${message.text}</p>
          <small>${message.time} · temporary message</small>
        </article>
      `,
    )
    .join('');
}

function setView(viewName) {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });

  const panels = {
    home: ['#homePanel', '#feedsPanel', '#roomsPanel', '#profilePanel'],
    feeds: ['#feedsPanel'],
    rooms: ['#roomsPanel'],
    profile: ['#profilePanel'],
  };

  const visiblePanels = panels[viewName] ?? panels.home;
  document.querySelectorAll('.content-column > .panel, .right-rail > .panel').forEach((panel) => {
    const shouldShow = visiblePanels.includes(`#${panel.id}`) || viewName === 'home';
    panel.style.display = shouldShow ? 'block' : 'none';
  });
}

function openModal(modalElement) {
  modalElement.classList.remove('hidden');
}

function closeModal(modalElement) {
  modalElement.classList.add('hidden');
}

createRoomBtn.addEventListener('click', () => openModal(roomModal));
closeModalBtn.addEventListener('click', () => closeModal(roomModal));

roomModal.addEventListener('click', (event) => {
  if (event.target === roomModal) {
    closeModal(roomModal);
  }
});

openUserCard.addEventListener('click', () => openModal(profileModal));
closeProfileBtn.addEventListener('click', () => closeModal(profileModal));

profileModal.addEventListener('click', (event) => {
  if (event.target === profileModal) {
    closeModal(profileModal);
  }
});

topicSearch.addEventListener('input', (event) => {
  renderTopics(event.target.value);
  renderRooms(event.target.value);
});

messageComposer.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();

  if (!text) {
    return;
  }

  messages.unshift({ author: 'You', text, time: 'just now', me: true });
  messageInput.value = '';
  renderMessages();
});

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => setView(item.dataset.view));
});

renderTopics();
renderRooms();
renderMessages();
setView('home');
