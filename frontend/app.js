const topics = [
  { name: 'Design', description: 'UI experiments, feedback, and quick critiques.', members: 128, tone: 'Soft glow' },
  { name: 'Study', description: 'Low-pressure accountability rooms for focus sprints.', members: 91, tone: 'Calm mode' },
  { name: 'Late Night', description: 'Spontaneous conversations after the day winds down.', members: 204, tone: 'Pulse' },
  { name: 'Mental Health', description: 'Supportive and anonymous check-ins.', members: 73, tone: 'Safe space' },
];

const rooms = [
  { title: 'Pixel cafe', category: 'Design', users: '12/15', status: '4 min ago', description: 'A lightweight room for sharing mockups and feedback.' },
  { title: 'Quiet sprint', category: 'Study', users: '8/15', status: 'Active now', description: 'Focus timers and short accountability check-ins.' },
  { title: 'Late ping', category: 'Random', users: '15/15', status: '2 min ago', description: 'Temporary space for short, spontaneous conversations.' },
];

const topicGrid = document.getElementById('topicGrid');
const roomList = document.getElementById('roomList');
const topicSearch = document.getElementById('topicSearch');
const createRoomBtn = document.getElementById('createRoomBtn');
const roomModal = document.getElementById('roomModal');
const closeModalBtn = document.getElementById('closeModalBtn');

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

function renderRooms(filter = '') {
  const query = filter.trim().toLowerCase();
  const filtered = rooms.filter((room) => {
    const haystack = `${room.title} ${room.category} ${room.description}`.toLowerCase();
    return haystack.includes(query);
  });

  roomList.innerHTML = filtered
    .map(
      (room) => `
        <article class="room-card">
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
            <button class="ghost-btn" type="button">View room</button>
            <button class="primary-btn" type="button">Join now</button>
          </div>
        </article>
      `,
    )
    .join('');
}

function setView(viewName) {
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.view === viewName);
  });
}

createRoomBtn.addEventListener('click', () => {
  roomModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
  roomModal.classList.add('hidden');
});

roomModal.addEventListener('click', (event) => {
  if (event.target === roomModal) {
    roomModal.classList.add('hidden');
  }
});

topicSearch.addEventListener('input', (event) => {
  renderTopics(event.target.value);
  renderRooms(event.target.value);
});

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => setView(item.dataset.view));
});

renderTopics();
renderRooms();
