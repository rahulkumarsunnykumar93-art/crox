document.addEventListener('DOMContentLoaded', () => {
  // Navigation Toggle
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    siteNav.classList.toggle('active');
  });

  // Footer Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // User Authentication State
  let currentUser = JSON.parse(localStorage.getItem('dropzone_user')) || null;
  const navLoginBtn = document.getElementById('nav-login-btn');

  function updateAuthUI() {
    if (currentUser) {
      navLoginBtn.textContent = currentUser.username;
      navLoginBtn.classList.remove('btn--outline');
      navLoginBtn.classList.add('btn--ghost');
    } else {
      navLoginBtn.textContent = 'Sign In';
      navLoginBtn.classList.add('btn--outline');
      navLoginBtn.classList.remove('btn--ghost');
    }
  }

  updateAuthUI();

  // Sample Squads Data
  let squads = [
    { id: 1, name: 'Headshot Kings', leader: 'Alpha', uid: '591238412', game: 'PUBG', mode: 'Squad', rank: 'Platinum', region: 'South Asia', style: 'Aggressive hot drops', mic: true },
    { id: 2, name: 'Rushers Gang', leader: 'Viper', uid: '882194012', game: 'Free Fire', mode: 'Duo', rank: 'Diamond', region: 'South Asia', style: 'Rank push, calm comms', mic: true },
    { id: 3, name: 'Zone Captures', leader: 'Ghost', uid: '310492812', game: 'PUBG', mode: 'Squad', rank: 'Gold', region: 'Europe', style: 'Tactical survival', mic: false }
  ];

  const squadGrid = document.getElementById('squad-grid');
  const emptyState = document.getElementById('empty');
  const resultCount = document.getElementById('result-count');
  const openCount = document.getElementById('open-count');

  function renderSquads(filteredSquads) {
    squadGrid.innerHTML = '';
    
    if (filteredSquads.length === 0) {
      emptyState.hidden = false;
      resultCount.textContent = '0 squads found';
    } else {
      emptyState.hidden = true;
      resultCount.textContent = `Showing ${filteredSquads.length} squad(s)`;

      filteredSquads.forEach(squad => {
        const card = document.createElement('article');
        card.className = 'squad-card';
        card.innerHTML = `
          <div>
            <div class="squad-card-header">
              <h3>${squad.name}</h3>
              <span class="badge">${squad.game}</span>
            </div>
            <p class="squad-card-meta">Leader: <b>${squad.leader}</b> (UID: ${squad.uid})</p>
            <p class="squad-card-meta">${squad.mode} · ${squad.rank} · ${squad.region}</p>
            <p class="squad-card-style">"${squad.style || 'Looking for teammates'}"</p>
          </div>
          <div class="squad-card-footer">
            <span style="font-size: 0.85rem; color: var(--text-muted);">
              ${squad.mic ? '🎙️ Mic On' : '🔇 No Mic'}
            </span>
            <button class="btn btn--primary btn--sm request-btn" data-id="${squad.id}">Join Squad</button>
          </div>
        `;
        squadGrid.appendChild(card);
      });
    }

    openCount.textContent = squads.length;
  }

  renderSquads(squads);

  // Filters logic
  let activeGame = 'all';
  const segBtns = document.querySelectorAll('.seg-btn');
  const queryInput = document.getElementById('f-query');
  const modeSelect = document.getElementById('f-mode');
  const rankSelect = document.getElementById('f-rank');
  const regionSelect = document.getElementById('f-region');

  segBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      segBtns.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      activeGame = btn.getAttribute('data-game');
      applyFilters();
    });
  });

  function applyFilters() {
    const q = queryInput.value.toLowerCase();
    const m = modeSelect.value;
    const r = rankSelect.value;
    const reg = regionSelect.value;

    const filtered = squads.filter(s => {
      const matchGame = activeGame === 'all' || s.game === activeGame;
      const matchQuery = s.name.toLowerCase().includes(q) || s.style.toLowerCase().includes(q);
      const matchMode = m === 'all' || s.mode === m;
      const matchRank = r === 'all' || s.rank === r;
      const matchRegion = reg === 'all' || s.region === reg;

      return matchGame && matchQuery && matchMode && matchRank && matchRegion;
    });

    renderSquads(filtered);
  }

  [queryInput, modeSelect, rankSelect, regionSelect].forEach(el => {
    el.addEventListener('input', applyFilters);
  });

  document.getElementById('reset-filters').addEventListener('click', () => {
    queryInput.value = '';
    modeSelect.value = 'all';
    rankSelect.value = 'all';
    regionSelect.value = 'all';
    activeGame = 'all';
    segBtns.forEach(b => b.classList.remove('is-active'));
    segBtns[0].classList.add('is-active');
    applyFilters();
  });

  // Login Modal
  const loginDialog = document.getElementById('login-dialog');
  const openLoginBtns = document.querySelectorAll('[data-open-login]');
  const loginCancelBtn = document.getElementById('login-cancel');
  const loginForm = document.getElementById('login-form');

  openLoginBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentUser) {
        if (confirm(`Logged in as ${currentUser.username} (UID: ${currentUser.uid}). Want to logout?`)) {
          localStorage.removeItem('dropzone_user');
          currentUser = null;
          updateAuthUI();
          showToast('Logged out successfully');
        }
      } else {
        loginDialog.showModal();
      }
    });
  });

  loginCancelBtn.addEventListener('click', () => loginDialog.close());

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const username = formData.get('username').trim();
    const uid = formData.get('uid').trim();

    if (!username || !uid) return;

    currentUser = { username, uid };
    localStorage.setItem('dropzone_user', JSON.stringify(currentUser));
    
    updateAuthUI();
    loginDialog.close();
    loginForm.reset();
    showToast(`Welcome, ${username}!`);
  });

  // Create Squad Dialog
  const createDialog = document.getElementById('create-dialog');
  const openCreateBtns = document.querySelectorAll('[data-open-create]');
  const createCancelBtn = document.getElementById('create-cancel');
  const createForm = document.getElementById('create-form');

  openCreateBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentUser) {
        showToast('Please Sign In first to create a squad!');
        loginDialog.showModal();
      } else {
        createDialog.showModal();
      }
    });
  });

  createCancelBtn.addEventListener('click', () => createDialog.close());

  createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(createForm);
    const name = formData.get('name').trim();

    if (!name) return;

    const newSquad = {
      id: Date.now(),
      name: name,
      leader: currentUser ? currentUser.username : 'Player',
      uid: currentUser ? currentUser.uid : 'N/A',
      game: formData.get('game'),
      mode: formData.get('mode'),
      rank: formData.get('rank'),
      region: formData.get('region'),
      style: formData.get('style'),
      mic: formData.get('mic') === 'on'
    };

    squads.unshift(newSquad);
    renderSquads(squads);
    createForm.reset();
    createDialog.close();
    showToast('Squad posted successfully!');
  });

  // Request Join Click
  squadGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('request-btn')) {
      if (!currentUser) {
        showToast('Please Sign In first to join squads!');
        loginDialog.showModal();
        return;
      }
      showToast(`Join Request sent with your UID: ${currentUser.uid}`);
      e.target.textContent = 'Requested';
      e.target.disabled = true;
    }
  });

  const toast = document.getElementById('toast');
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
});
