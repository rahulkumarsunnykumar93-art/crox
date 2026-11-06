document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const navToggle = document.getElementById('nav-toggle');
  const siteNav = document.getElementById('site-nav');

  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    siteNav.classList.toggle('active');
  });

  // Footer Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Mock Squad Data
  let squads = [
    { id: 1, name: 'Headshot Kings', game: 'PUBG', mode: 'Squad', rank: 'Platinum', region: 'South Asia', style: 'Aggressive hot drops & fast rotations', mic: true },
    { id: 2, name: 'Rushers Gang', game: 'Free Fire', mode: 'Duo', rank: 'Diamond', region: 'South Asia', style: 'Rank push, calm comms only', mic: true },
    { id: 3, name: 'Zone Captures', game: 'PUBG', mode: 'Squad', rank: 'Gold', region: 'Europe', style: 'Tactical survival & placement points', mic: false },
    { id: 4, name: 'Booyah Hunters', game: 'Free Fire', mode: 'Squad', rank: 'Master', region: 'Southeast Asia', style: 'Pro playstyle & daily scrims', mic: true }
  ];

  const squadGrid = document.getElementById('squad-grid');
  const emptyState = document.getElementById('empty');
  const resultCount = document.getElementById('result-count');
  const openCount = document.getElementById('open-count');

  // Render Squad Cards
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
            <p class="squad-card-meta">${squad.mode} · ${squad.rank} · ${squad.region}</p>
            <p class="squad-card-style">"${squad.style || 'Looking for good team players'}"</p>
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

  // Initial Render
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

  // Dialog & Form logic
  const dialog = document.getElementById('create-dialog');
  const openCreateBtns = document.querySelectorAll('[data-open-create]');
  const cancelBtn = document.getElementById('create-cancel');
  const createForm = document.getElementById('create-form');
  const toast = document.getElementById('toast');

  openCreateBtns.forEach(btn => {
    btn.addEventListener('click', () => dialog.showModal());
  });

  cancelBtn.addEventListener('click', () => dialog.close());

  createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(createForm);
    const name = formData.get('name').trim();

    if (!name) return;

    const newSquad = {
      id: Date.now(),
      name: name,
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
    dialog.close();
    showToast('Squad posted successfully!');
  });

  // Request Join Click
  squadGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('request-btn')) {
      showToast('Join Request Sent!');
      e.target.textContent = 'Requested';
      e.target.disabled = true;
    }
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
});
