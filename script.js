/* =========================================================
   GLOBAL STATE
========================================================= */
const state = {
  score: 0,
  selectedGame: 'ttt',
  difficulty: { ttt: 'normal', rps: 'normal', memory: 'normal' },
  unlocked: new Set(),
  stats: {
    tttWins: 0, tttPlayed: 0,
    rpsWins: 0, rpsStreakBest: 0, rpsStreak: 0, rpsW:0, rpsL:0, rpsD:0,
    memBestMoves: {}, memGamesWon: 0,
    clickerTotal: 0, clickerUpgradesBought: 0
  }
};

const RANKS = [
  { min: 0, name: 'Rookie' },
  { min: 100, name: 'Player' },
  { min: 300, name: 'Contender' },
  { min: 700, name: 'Ace' },
  { min: 1500, name: 'Legend' },
  { min: 3000, name: 'Arcade God' }
];

const ACHIEVEMENTS = [
  { id: 'first_win', icon: '🥇', name: 'First Blood', desc: 'Win any game for the first time.' },
  { id: 'ttt_hard_win', icon: '🧠', name: 'Unbeatable Mind', desc: 'Beat the CPU at Tic-Tac-Toe on Hard.' },
  { id: 'ttt_5wins', icon: '⭕', name: 'Grid Master', desc: 'Win 5 games of Tic-Tac-Toe.' },
  { id: 'rps_streak3', icon: '🔥', name: 'Hot Streak', desc: 'Win 3 Rock-Paper-Scissors rounds in a row.' },
  { id: 'rps_streak5', icon: '⚡', name: 'On Fire', desc: 'Win 5 Rock-Paper-Scissors rounds in a row.' },
  { id: 'mem_win', icon: '🧩', name: 'Sharp Eye', desc: 'Complete a Memory Matrix game.' },
  { id: 'mem_perfect', icon: '💎', name: 'Perfect Recall', desc: 'Win Memory Matrix in the minimum possible moves.' },
  { id: 'mem_hard_win', icon: '🌀', name: 'Photographic', desc: 'Win Memory Matrix on Hard.' },
  { id: 'clicker_100', icon: '⬡', name: 'Spark', desc: 'Earn 100 energy in Idle Core.' },
  { id: 'clicker_1000', icon: '☄️', name: 'Reactor Online', desc: 'Earn 1,000 energy in Idle Core.' },
  { id: 'clicker_upgrade', icon: '🛠️', name: 'Automated', desc: 'Buy your first Idle Core upgrade.' },
  { id: 'score_500', icon: '🏆', name: 'High Roller', desc: 'Reach a total score of 500.' }
];

function addScore(n){
  state.score += n;
  document.getElementById('hudScore').textContent = Math.floor(state.score);
  updateRank();
  if (state.score >= 500) unlock('score_500');
}

function updateRank(){
  let rank = RANKS[0].name;
  for (const r of RANKS) if (state.score >= r.min) rank = r.name;
  document.getElementById('hudRank').textContent = rank;
}

function unlock(id){
  if (state.unlocked.has(id)) return;
  state.unlocked.add(id);
  const a = ACHIEVEMENTS.find(x => x.id === id);
  showToast(`🏆 Achievement unlocked: ${a.name}`);
  renderAchievements();
  document.getElementById('achCount').textContent = state.unlocked.size;
}

function showToast(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
}

function renderAchievements(){
  const grid = document.getElementById('achGrid');
  grid.innerHTML = '';
  ACHIEVEMENTS.forEach(a => {
    const on = state.unlocked.has(a.id);
    const card = document.createElement('div');
    card.className = 'ach-card' + (on ? ' unlocked' : '');
    card.innerHTML = `<div class="ach-icon">${a.icon}</div>
      <div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div>`;
    grid.appendChild(card);
  });
}

/* =========================================================
   HUD / MODAL / NAV
========================================================= */
document.getElementById('achTotal').textContent = ACHIEVEMENTS.length;
document.getElementById('achBtn').addEventListener('click', () => {
  document.getElementById('achModal').classList.add('active');
});
document.getElementById('achClose').addEventListener('click', () => {
  document.getElementById('achModal').classList.remove('active');
});
document.getElementById('achModal').addEventListener('click', e => {
  if (e.target.id === 'achModal') e.currentTarget.classList.remove('active');
});

function showScreen(id){
  document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
  document.getElementById('floorScreen').style.display = 'none';
  if (id === 'floor') {
    document.getElementById('floorScreen').style.display = 'flex';
  } else {
    document.getElementById('screen-' + id).classList.add('active');
  }
}

document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => showScreen('floor'));
});

/* =========================================================
   CAROUSEL (cabinet select)
========================================================= */
const GAME_ORDER = ['ttt', 'rps', 'memory', 'clicker'];
const GAME_NAMES = { ttt: 'TIC-TAC-TOE', rps: 'ROCK PAPER SCISSORS', memory: 'MEMORY MATRIX', clicker: 'IDLE CORE' };
let carouselIndex = 0;
const carousel = document.getElementById('carousel');

function updateCarousel(){
  carousel.style.transform = `rotateY(${carouselIndex * -90}deg)`;
  document.querySelectorAll('.cabinet').forEach(c => c.classList.remove('selected'));
  const current = GAME_ORDER[((carouselIndex % 4) + 4) % 4];
  document.querySelector(`.cabinet[data-game="${current}"]`).classList.add('selected');
  state.selectedGame = current;
  document.getElementById('playGameName').textContent = GAME_NAMES[current];
  const picker = document.getElementById('diffPicker');
  picker.style.display = current === 'clicker' ? 'none' : 'flex';
  if (current !== 'clicker') {
    document.querySelectorAll('.diff-opt').forEach(o => {
      o.classList.toggle('active', o.dataset.diff === state.difficulty[current]);
    });
  }
}

document.getElementById('turnRight').addEventListener('click', () => { carouselIndex++; updateCarousel(); });
document.getElementById('turnLeft').addEventListener('click', () => { carouselIndex--; updateCarousel(); });
document.querySelectorAll('.cabinet').forEach(cab => {
  cab.addEventListener('click', () => document.getElementById('playBtn').click());
});
document.querySelectorAll('.diff-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    const g = state.selectedGame;
    state.difficulty[g] = opt.dataset.diff;
    document.querySelectorAll('.diff-opt').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    const label = document.getElementById('diffLabel-' + g);
    if (label) label.textContent = opt.textContent;
  });
});

document.getElementById('playBtn').addEventListener('click', () => {
  const g = state.selectedGame;
  showScreen(g);
  if (g === 'ttt') startTTT();
  if (g === 'rps') startRPS();
  if (g === 'memory') startMemory();
  if (g === 'clicker') { /* clicker persists, just show */ }
});

updateCarousel();
renderAchievements();

/* =========================================================
   GAME 1 — TIC TAC TOE (vs CPU with difficulty)
========================================================= */
let tttBoardState, tttTurn, tttActive;

function startTTT(){
  tttBoardState = Array(9).fill(null);
  tttTurn = 'X';
  tttActive = true;
  document.getElementById('tttDiffShow').textContent = capitalize(state.difficulty.ttt);
  document.getElementById('tttStatus').textContent = 'Your move, X.';
  document.getElementById('tttTurn').textContent = 'X';
  renderTTT();
}

function renderTTT(){
  const board = document.getElementById('tttBoard');
  board.innerHTML = '';
  tttBoardState.forEach((val, i) => {
    const cell = document.createElement('div');
    cell.className = 'ttt-cell' + (val === 'O' ? ' o' : '') + (!tttActive || val ? ' disabled' : '');
    cell.textContent = val || '';
    cell.addEventListener('click', () => tttPlayerMove(i));
    board.appendChild(cell);
  });
}

function tttPlayerMove(i){
  if (!tttActive || tttBoardState[i] || tttTurn !== 'X') return;
  tttBoardState[i] = 'X';
  renderTTT();
  if (tttCheckEnd()) return;
  tttTurn = 'O';
  document.getElementById('tttTurn').textContent = 'O (CPU)';
  document.getElementById('tttStatus').textContent = 'CPU thinking...';
  setTimeout(() => {
    tttCpuMove();
    renderTTT();
    if (tttCheckEnd()) return;
    tttTurn = 'X';
    document.getElementById('tttTurn').textContent = 'X';
    document.getElementById('tttStatus').textContent = 'Your move, X.';
  }, 450);
}

const TTT_WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function tttWinner(bd){
  for (const [a,b,c] of TTT_WINS) {
    if (bd[a] && bd[a] === bd[b] && bd[a] === bd[c]) return { player: bd[a], line: [a,b,c] };
  }
  if (bd.every(v => v)) return { player: 'draw' };
  return null;
}

function tttCheckEnd(){
  const res = tttWinner(tttBoardState);
  if (!res) return false;
  tttActive = false;
  state.stats.tttPlayed++;
  if (res.player === 'draw') {
    document.getElementById('tttStatus').textContent = "It's a draw!";
    addScore(5);
  } else if (res.player === 'X') {
    document.getElementById('tttStatus').textContent = 'You win! 🎉';
    highlightTTT(res.line);
    const pts = { easy: 10, normal: 20, hard: 40 }[state.difficulty.ttt];
    addScore(pts);
    state.stats.tttWins++;
    document.getElementById('tttScore').textContent = state.stats.tttWins;
    unlock('first_win');
    if (state.difficulty.ttt === 'hard') unlock('ttt_hard_win');
    if (state.stats.tttWins >= 5) unlock('ttt_5wins');
  } else {
    document.getElementById('tttStatus').textContent = 'CPU wins. Try again!';
    highlightTTT(res.line);
  }
  renderTTT();
  return true;
}

function highlightTTT(line){
  if (!line) return;
  const cells = document.querySelectorAll('.ttt-cell');
  line.forEach(i => cells[i].classList.add('win'));
}

function tttCpuMove(){
  const diff = state.difficulty.ttt;
  const empty = tttBoardState.map((v,i) => v ? null : i).filter(v => v !== null);
  let move;
  if (diff === 'easy') {
    move = empty[Math.floor(Math.random() * empty.length)];
  } else if (diff === 'normal') {
    move = Math.random() < 0.5 ? findStrategicMove(empty) : empty[Math.floor(Math.random() * empty.length)];
  } else {
    move = minimaxBestMove();
  }
  tttBoardState[move] = 'O';
}

function findStrategicMove(empty){
  // try to win, then block, else random
  for (const i of empty) {
    const copy = [...tttBoardState]; copy[i] = 'O';
    if (tttWinner(copy)?.player === 'O') return i;
  }
  for (const i of empty) {
    const copy = [...tttBoardState]; copy[i] = 'X';
    if (tttWinner(copy)?.player === 'X') return i;
  }
  return empty[Math.floor(Math.random() * empty.length)];
}

function minimaxBestMove(){
  let bestScore = -Infinity, bestMove = null;
  tttBoardState.forEach((v, i) => {
    if (v) return;
    tttBoardState[i] = 'O';
    const score = minimax(tttBoardState, 0, false);
    tttBoardState[i] = null;
    if (score > bestScore) { bestScore = score; bestMove = i; }
  });
  return bestMove;
}

function minimax(bd, depth, isMax){
  const res = tttWinner(bd);
  if (res) {
    if (res.player === 'O') return 10 - depth;
    if (res.player === 'X') return depth - 10;
    return 0;
  }
  if (isMax) {
    let best = -Infinity;
    bd.forEach((v,i) => { if (!v) { bd[i]='O'; best = Math.max(best, minimax(bd, depth+1, false)); bd[i]=null; } });
    return best;
  } else {
    let best = Infinity;
    bd.forEach((v,i) => { if (!v) { bd[i]='X'; best = Math.min(best, minimax(bd, depth+1, true)); bd[i]=null; } });
    return best;
  }
}

document.getElementById('tttReset').addEventListener('click', startTTT);

/* =========================================================
   GAME 2 — ROCK PAPER SCISSORS
========================================================= */
function startRPS(){
  document.getElementById('rpsDiffShow').textContent = capitalize(state.difficulty.rps);
  document.getElementById('rpsStreak').textContent = state.stats.rpsStreak;
  document.getElementById('rpsRecord').textContent = `${state.stats.rpsW}-${state.stats.rpsL}-${state.stats.rpsD}`;
  document.getElementById('rpsStatus').textContent = 'Make your move.';
  document.getElementById('rpsPlayerHand').textContent = '❔';
  document.getElementById('rpsCpuHand').textContent = '❔';
}

const RPS_EMOJI = { rock: '✊', paper: '✋', scissors: '✌️' };
const RPS_BEATS = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
let rpsLastCpu = null;

document.querySelectorAll('.rps-choice').forEach(btn => {
  btn.addEventListener('click', () => rpsPlay(btn.dataset.choice));
});

function rpsCpuChoice(){
  const diff = state.difficulty.rps;
  const options = ['rock', 'paper', 'scissors'];
  if (diff === 'easy') {
    return options[Math.floor(Math.random() * 3)];
  }
  if (diff === 'hard') {
    // 40% chance CPU counters the player's last-known winning pattern (mild predictive bias), else random
    if (rpsLastCpu && Math.random() < 0.35) {
      // counter what beats the CPU's previous move (assume player might repeat their own win)
      const counter = Object.keys(RPS_BEATS).find(k => RPS_BEATS[k] === rpsLastCpu);
      return counter;
    }
    return options[Math.floor(Math.random() * 3)];
  }
  return options[Math.floor(Math.random() * 3)]; // normal: pure random
}

function rpsPlay(playerChoice){
  const cpuChoice = rpsCpuChoice();
  rpsLastCpu = cpuChoice;
  const playerHand = document.getElementById('rpsPlayerHand');
  const cpuHand = document.getElementById('rpsCpuHand');
  playerHand.classList.add('shake');
  cpuHand.classList.add('shake');
  setTimeout(() => {
    playerHand.textContent = RPS_EMOJI[playerChoice];
    cpuHand.textContent = RPS_EMOJI[cpuChoice];
    playerHand.classList.remove('shake');
    cpuHand.classList.remove('shake');

    let result;
    if (playerChoice === cpuChoice) result = 'draw';
    else if (RPS_BEATS[playerChoice] === cpuChoice) result = 'win';
    else result = 'lose';

    const statusEl = document.getElementById('rpsStatus');
    if (result === 'win') {
      state.stats.rpsW++;
      state.stats.rpsStreak++;
      state.stats.rpsStreakBest = Math.max(state.stats.rpsStreakBest, state.stats.rpsStreak);
      const pts = { easy: 5, normal: 10, hard: 18 }[state.difficulty.rps];
      addScore(pts);
      statusEl.textContent = `You win! ${capitalize(playerChoice)} beats ${cpuChoice}.`;
      unlock('first_win');
      if (state.stats.rpsStreak >= 3) unlock('rps_streak3');
      if (state.stats.rpsStreak >= 5) unlock('rps_streak5');
    } else if (result === 'lose') {
      state.stats.rpsL++;
      state.stats.rpsStreak = 0;
      statusEl.textContent = `CPU wins. ${capitalize(cpuChoice)} beats ${playerChoice}.`;
    } else {
      state.stats.rpsD++;
      statusEl.textContent = "It's a draw.";
    }
    document.getElementById('rpsStreak').textContent = state.stats.rpsStreak;
    document.getElementById('rpsRecord').textContent = `${state.stats.rpsW}-${state.stats.rpsL}-${state.stats.rpsD}`;
  }, 350);
}

/* =========================================================
   GAME 3 — MEMORY MATRIX (Fisher-Yates shuffle)
========================================================= */
const MEM_ICONS = ['🍀','🔥','🌙','⚡','💎','🎯','🪐','🎲','🦋','🧿'];
let memState = { cards: [], flipped: [], matched: 0, moves: 0, lock: false, timer: null, seconds: 0 };

function fisherYatesShuffle(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function startMemory(){
  clearInterval(memState.timer);
  const diff = state.difficulty.memory;
  const pairCount = { easy: 6, normal: 8, hard: 10 }[diff];
  document.getElementById('memDiffShow').textContent = capitalize(diff);
  document.getElementById('memPairsTotal').textContent = pairCount;
  document.getElementById('memPairs').textContent = 0;
  document.getElementById('memMoves').textContent = 0;
  document.getElementById('memTimer').textContent = '0s';
  document.getElementById('memStatus').textContent = 'Flip two cards to find a pair.';

  const icons = MEM_ICONS.slice(0, pairCount);
  const deck = fisherYatesShuffle([...icons, ...icons].map((icon, idx) => ({ icon, id: idx })));

  memState = { cards: deck, flipped: [], matched: 0, moves: 0, lock: false, seconds: 0, pairCount, timer: null };
  memState.timer = setInterval(() => {
    memState.seconds++;
    document.getElementById('memTimer').textContent = memState.seconds + 's';
  }, 1000);

  renderMemory();
}

function renderMemory(){
  const grid = document.getElementById('memGrid');
  grid.style.gridTemplateColumns = `repeat(${memState.pairCount <= 6 ? 4 : 5}, 72px)`;
  grid.innerHTML = '';
  memState.cards.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'mem-card' + (card.flipped || card.matched ? ' flipped' : '') + (card.matched ? ' matched' : '');
    el.innerHTML = `
      <div class="mem-face mem-back">?</div>
      <div class="mem-face mem-front">${card.icon}</div>`;
    el.addEventListener('click', () => memFlip(i));
    grid.appendChild(el);
  });
}

function memFlip(i){
  const card = memState.cards[i];
  if (memState.lock || card.flipped || card.matched) return;
  card.flipped = true;
  memState.flipped.push(i);
  renderMemory();

  if (memState.flipped.length === 2) {
    memState.moves++;
    document.getElementById('memMoves').textContent = memState.moves;
    memState.lock = true;
    const [a, b] = memState.flipped;
    if (memState.cards[a].icon === memState.cards[b].icon) {
      memState.cards[a].matched = true;
      memState.cards[b].matched = true;
      memState.matched++;
      document.getElementById('memPairs').textContent = memState.matched;
      memState.flipped = [];
      memState.lock = false;
      renderMemory();
      if (memState.matched === memState.pairCount) memoryWin();
    } else {
      setTimeout(() => {
        memState.cards[a].flipped = false;
        memState.cards[b].flipped = false;
        memState.flipped = [];
        memState.lock = false;
        renderMemory();
      }, 700);
    }
  }
}

function memoryWin(){
  clearInterval(memState.timer);
  const diff = state.difficulty.memory;
  const pts = { easy: 30, normal: 60, hard: 100 }[diff];
  const bonus = Math.max(0, 40 - memState.seconds); // speed bonus
  addScore(pts + bonus);
  document.getElementById('memStatus').textContent = `Solved in ${memState.moves} moves / ${memState.seconds}s! +${pts + bonus} pts`;
  state.stats.memGamesWon++;
  unlock('first_win');
  unlock('mem_win');
  if (diff === 'hard') unlock('mem_hard_win');
  if (memState.moves === memState.pairCount) unlock('mem_perfect');
}

document.getElementById('memReset').addEventListener('click', startMemory);

/* =========================================================
   GAME 4 — CLICKER / IDLE
========================================================= */
const UPGRADES = [
  { id: 'cursor', name: 'Auto Cursor', desc: '+1 energy/sec', baseCost: 15, rate: 1 },
  { id: 'drone', name: 'Mining Drone', desc: '+5 energy/sec', baseCost: 80, rate: 5 },
  { id: 'reactor', name: 'Micro Reactor', desc: '+20 energy/sec', baseCost: 400, rate: 20 },
  { id: 'satellite', name: 'Orbital Satellite', desc: '+90 energy/sec', baseCost: 1800, rate: 90 },
  { id: 'aicore', name: 'AI Core', desc: '+400 energy/sec', baseCost: 9000, rate: 400 },
];

const clicker = {
  points: 0,
  rate: 0,
  owned: {}
};
UPGRADES.forEach(u => clicker.owned[u.id] = 0);

function clickerCost(u){
  return Math.floor(u.baseCost * Math.pow(1.15, clicker.owned[u.id]));
}

document.getElementById('coreBtn').addEventListener('click', (e) => {
  clicker.points += 1;
  state.stats.clickerTotal += 1;
  updateClickerUI();
  checkClickerAchievements();
});

function updateClickerUI(){
  document.getElementById('clickerPoints').textContent = Math.floor(clicker.points);
  document.getElementById('clickerRate').textContent = clicker.rate;
}

function renderShop(){
  const list = document.getElementById('shopList');
  list.innerHTML = '';
  UPGRADES.forEach(u => {
    const cost = clickerCost(u);
    const div = document.createElement('div');
    div.className = 'shop-item' + (clicker.points < cost ? ' disabled' : '');
    div.innerHTML = `
      <div>
        <div class="shop-item-name">${u.name} <span class="shop-item-count">x${clicker.owned[u.id]}</span></div>
        <div class="shop-item-desc">${u.desc}</div>
      </div>
      <div class="shop-item-cost">${cost} ⬡</div>`;
    div.addEventListener('click', () => buyUpgrade(u));
    list.appendChild(div);
  });
}

function buyUpgrade(u){
  const cost = clickerCost(u);
  if (clicker.points < cost) return;
  clicker.points -= cost;
  clicker.owned[u.id]++;
  clicker.rate += u.rate;
  state.stats.clickerUpgradesBought++;
  updateClickerUI();
  renderShop();
  unlock('clicker_upgrade');
}

setInterval(() => {
  if (clicker.rate > 0) {
    clicker.points += clicker.rate / 10;
    state.stats.clickerTotal += clicker.rate / 10;
    updateClickerUI();
    checkClickerAchievements();
  }
}, 100);

function checkClickerAchievements(){
  if (state.stats.clickerTotal >= 100) unlock('clicker_100');
  if (state.stats.clickerTotal >= 1000) unlock('clicker_1000');
}

renderShop();
updateClickerUI();

/* =========================================================
   UTIL
========================================================= */
function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

updateRank();


