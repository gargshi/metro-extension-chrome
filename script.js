/* ======================================================
 🧭 ELEMENT REFERENCES
====================================================== */
const openSettingsButton = document.getElementById('open-settings');
const settingSidebar = document.getElementById('settings-sidebar');
const closeSettingsButton = document.getElementById('close-settings');

const bgImgBtn = document.getElementById('background-img-set');
const bgImgUrl = document.getElementById('background-img-url');
const grid = document.querySelector('.grid');

const bgTgCheckbox = document.getElementById('background-toggle-checkbox');
const bgColorInput = document.getElementById('background-color');

const delBmConfirm = document.getElementById('confirm-modal');
const editModeToggle = document.getElementById('edit-mode-toggle');

/* ======================================================
 ⚙️ SETTINGS & STATE
====================================================== */
let settingsJSON = {
  numCols: 5,
  usingBackgroundImage: false,
  backgroundColor: '#000000',
  background: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=60&w=1920'
};

let editMode = false;

//edit mode

function toggleEditMode() {
  editMode = !editMode;
  editModeToggle.textContent = editMode ? 'Exit Edit Mode [SHIFT + E]' : 'Enter Edit Mode[SHIFT + E]';
  loadBookmarks();
}
editModeToggle.addEventListener('click', toggleEditMode);

/* ======================================================
 🎹 KEYBOARD SHORTCUTS
====================================================== */
document.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.key.toLowerCase() === 'e') {
    e.preventDefault();
    toggleEditMode();
  }
});

/* ======================================================
 🧩 SETTINGS LOCAL STORAGE HANDLERS
====================================================== */
loadSettingsFromLocalStorage();

function loadSettingsFromLocalStorage(clearLS = false) {
  if (clearLS) {
    localStorage.clear();
    return;
  }
  if (localStorage.getItem('settings')) {
    for (const [key, value] of Object.entries(JSON.parse(localStorage.getItem('settings')))) {
      settingsJSON[key] = value;
    }
  }
}

function saveSettingsToLocalStorage(setting, value) {
  if (!setting || !value) return;
  settingsJSON[setting] = value;
  localStorage.setItem('settings', JSON.stringify(settingsJSON));
}

/* ======================================================
 🎨 BACKGROUND HANDLING
====================================================== */
bgColorInput.addEventListener('input', () => {
  if (!bgTgCheckbox.checked) {
    document.body.style.backgroundColor = bgColorInput.value;
  }
  settingsJSON.backgroundColor = bgColorInput.value;
  saveSettingsToLocalStorage('backgroundColor', settingsJSON.backgroundColor);
});

bgImgBtn.addEventListener('click', () => {
  const imgUrl = bgImgUrl.value;
  if (imgUrl) {
    settingsJSON.background = imgUrl;
    saveSettingsToLocalStorage('background', settingsJSON.background);
    if (bgTgCheckbox.checked) {
      document.body.style.setProperty('--background', `url(${settingsJSON.background})`);
    }
  }
  window.location.reload();
});

bgTgCheckbox.addEventListener('change', () => {
  if (!bgTgCheckbox.checked) {
    document.body.style.setProperty('--background', `url()`);
    document.body.style.backgroundColor = settingsJSON.backgroundColor;
    settingsJSON.usingBackgroundImage = false;
    saveSettingsToLocalStorage('backgroundColor', settingsJSON.backgroundColor);
  } else {
    document.body.style.setProperty('--background', `url(${settingsJSON.background})`);
    settingsJSON.usingBackgroundImage = true;
  }
  saveSettingsToLocalStorage('usingBackgroundImage', settingsJSON.usingBackgroundImage);
  window.location.reload();
});

/* ======================================================
 🪟 SIDEBAR CONTROL
====================================================== */
function handleKeyPress(e) {
  if (e.key === 'Escape') closeSidebar(settingSidebar);
}

function openSidebar(settingSidebar) {
  settingSidebar.classList.remove('hidden');
  settingSidebar.classList.add('visible');
  document.addEventListener('keydown', handleKeyPress);
  document.addEventListener('click', handleOutsideClick);
  // disable interactions on grid
  grid.classList.add('disabled-interactions');
}

function closeSidebar(settingSidebar) {
  settingSidebar.classList.remove('visible');
  settingSidebar.classList.add('hidden');
  document.removeEventListener('keydown', handleKeyPress);
  document.removeEventListener('click', handleOutsideClick);
  // disable interactions on grid
  grid.classList.remove('disabled-interactions');
}

function handleOutsideClick(event) {
  // Close only if click is outside the sidebar and not the button that opened it
  if (!settingSidebar.contains(event.target) && !openSettingsButton.contains(event.target)) {
    closeSidebar(settingSidebar);
  }
}

openSettingsButton.addEventListener('click', () => {
  openSidebar(settingSidebar)    
});
openSettingsButton.addEventListener('mouseenter', () => {
  document.getElementById('settings-icon').style.transform = 'rotate(90deg)';
});
openSettingsButton.addEventListener('mouseleave', () => {
  document.getElementById('settings-icon').style.transform = 'rotate(-90deg)';
});
closeSettingsButton.addEventListener('click', () => closeSidebar(settingSidebar));



/* ======================================================
 🧮 CONTROL VARIABLES & INITIAL STATE
====================================================== */
let NUM_COLS = settingsJSON.numCols;
let BG_IMAGE = settingsJSON.background;
let USING_BG_IMAGE = settingsJSON.usingBackgroundImage;
let BG_COLOR = settingsJSON.backgroundColor;

document.body.style.setProperty('--background', `url(${BG_IMAGE})`);
document.getElementById('num-tiles').value = NUM_COLS;
document.getElementById('num-tiles-value').textContent = NUM_COLS;
document.getElementById('background-img-url').value = BG_IMAGE;
document.getElementById('background-toggle-checkbox').checked = USING_BG_IMAGE;
document.getElementById('background-color').value = BG_COLOR;

if (USING_BG_IMAGE) {
  document.body.style.setProperty('--background', `url(${BG_IMAGE})`);
} else {
  document.body.style.setProperty('--background', `url()`);
  document.body.style.backgroundColor = BG_COLOR;
}

/* ======================================================
 🔖 BOOKMARK COLLECTION & RENDERING
====================================================== */
function collectBookmarks(nodes, list = []) {
  for (const node of nodes) {
    if (node.url) {
      // Skip local files
      if (node.url.startsWith('file://')) continue;
      list.push({
        title: node.title || node.url,
        url: node.url,
        icon: `https://www.google.com/s2/favicons?sz=64&domain=${new URL(node.url).hostname}`,
        dateAdded: node.dateAdded || 0
      });
    }
    //sort the list by creation date

    if (node.children) collectBookmarks(node.children, list);
  }
  list.sort((a, b) => b.dateAdded - a.dateAdded);
  return list;
}

function renderBookmarks(bookmarks) {
  const fallbackSVG = `
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" fill="currentColor"/>
      <path d="M15 34L24 28L33 34V14H15V34Z" fill="#fff"/>
    </svg>
  `;

  grid.innerHTML = '';

  bookmarks.forEach(bm => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.dataset.id = bm.id;
    tile.dataset.url = bm.url;
    tile.draggable = true;

    const iconHTML = bm.icon
      ? `<img class="tile-icon" src="${bm.icon}" alt="">`
      : fallbackSVG;

    tile.innerHTML = `
      ${editMode ? `<button class="close-btn" title="Delete bookmark" id="${bm.id}">&times;</button>` : ''}
      <div class="tile-content">
        ${iconHTML}
        <div class="tile-title">${bm.title}</div>
      </div>
    `;

    if (!editMode && bm.url) {
      tile.addEventListener('click', () => window.open(bm.url, '_blank'));
    }

    grid.appendChild(tile);
  });
}

/* ======================================================
 ❌ DELETE CONFIRMATION HANDLING
====================================================== */
grid.addEventListener('click', (e) => {
  if (e.target.classList.contains('close-btn')) {
    e.preventDefault();
    const tile = e.target.closest('.tile');
    const url = tile.dataset.url;
    getConfirmation(url);
  }
});

function getConfirmation(url) {
  if (!url) return;
  delBmConfirm.style.transform = 'translateY(0%)';

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') delBmConfirm.style.transform = 'translateY(-100%)';
  }, { once: true });

  document.getElementById('close-modal').addEventListener('click', () => {
    delBmConfirm.style.transform = 'translateY(-100%)';
  }, { once: true });

  document.getElementById('confirm-delete').addEventListener('click', () => {
    deleteBookmarkByUrl(url);
    delBmConfirm.style.transform = 'translateY(-100%)';
  }, { once: true });

  document.getElementById('cancel-delete').addEventListener('click', () => {
    delBmConfirm.style.transform = 'translateY(-100%)';
  }, { once: true });
}

function deleteBookmarkByUrl(url) {
  chrome.bookmarks.search({ url }, (results) => {
    if (results.length) {
      chrome.bookmarks.remove(results[0].id, loadBookmarks);
    } else {
      console.warn('No Chrome bookmark found for', url);
    }
  });
}

/* ======================================================
 🗂️ LOAD BOOKMARKS
====================================================== */
function loadBookmarks() {
  chrome.bookmarks.getTree((nodes) => {
    const bookmarks = collectBookmarks(nodes);
    renderBookmarks(bookmarks);

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = bookmarks.filter(b =>
        b.title.toLowerCase().includes(q) || b.url.toLowerCase().includes(q)
      );
      renderBookmarks(filtered);
    });
  });
}

loadBookmarks();

/* ======================================================
 🧱 TILE SIZE + GRID CALCULATIONS
====================================================== */
function adjustTileWidth(initial_load = false) {
  const gridWidth = grid.getBoundingClientRect().width;
  const borderSize = parseFloat(getComputedStyle(grid).getPropertyValue('--tile-border-size')) || 0;
  const gap = parseFloat(getComputedStyle(grid).getPropertyValue('--gap')) || 0;

  const totalBorder = borderSize * 2 * NUM_COLS;
  const totalGap = gap * (NUM_COLS - 1);
  const tileWidth = (gridWidth - totalBorder - totalGap) / NUM_COLS;

  document.documentElement.style.setProperty('--tile-width', `${tileWidth}px`);
}

window.addEventListener('resize', adjustTileWidth);
window.addEventListener('load', () => {
  adjustTileWidth(true);
  setTimeout(() => adjustTileWidth(true), 100);
});

/* ======================================================
 🧩 GRID DRAG SYSTEM
====================================================== */
let draggingTile = null;

// alert(tileWidth + " + " + tileGap + " + " + SHIFT);
let gridModel = { cols: 0, tileW: 0, tileH: 0, gapX: 10, gapY: 10, rect: null };

let lastTargetIndex = -1;
let lastUpdateTime = 0;
const tileRect = { left: 0, right: 0, top: 0, bottom: 0 };

// === HELPERS ===
function computeShift() {
  const kids = Array.from(grid.children);
  if (kids.length >= 2) {
    const a = kids[0].getBoundingClientRect();
    const b = kids[1].getBoundingClientRect();
    SHIFT = Math.round(b.left - a.left);
  } else if (kids.length === 1) {
    SHIFT = Math.round(kids[0].getBoundingClientRect().width);
  }
}

function translateTiles(tiles, direction) {
  const distance = direction === 'right' ? SHIFT : -SHIFT;
  tiles.forEach(tile => {
    tile.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
    tile.style.transform = `translateX(${distance}px)`;
  });
}

function resetTransforms(except = null) {
  Array.from(grid.children).forEach(tile => {
    if (tile !== except) {
      tile.style.transform = '';
    }

  });
}

// --- Logical grid snapshot ---
function computeGridModel() {
  const rect = grid.getBoundingClientRect();
  const first = grid.children[0].getBoundingClientRect();
  const style = getComputedStyle(grid);
  const gap = parseFloat(style.gap || 10);
  const cols = Math.max(1, Math.floor(rect.width / (first.width + gap)));
  gridModel = {
    cols,
    tileW: first.width,
    tileH: first.height,
    gapX: gap,
    gapY: gap,
    rect
  };
}

function getCellFromCursor(x, y) {
  const gx = x - gridModel.rect.left;
  const gy = y - gridModel.rect.top;
  const col = Math.floor(gx / (gridModel.tileW + gridModel.gapX));
  const row = Math.floor(gy / (gridModel.tileH + gridModel.gapY));
  return { row: Math.max(0, row), col: Math.max(0, col) };
}

function getIndexFromCell(row, col) {
  const i = row * gridModel.cols + col;
  return Math.min(Math.max(i, 0), grid.children.length - 1);
}

let dragStart = { x: 0, y: 0 };

// === GRID-BASED SMOOTH DRAG SYSTEM ===
grid.addEventListener('dragstart', (e) => {
  const tile = e.target.closest('.tile');
  if (!tile || editMode) return;

  draggingTile = tile;
  tile.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', tile.dataset.id);

  computeShift();
  computeGridModel(); // snapshot grid layout

  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
});

grid.addEventListener('dragover', (e) => {
  e.preventDefault();
  if (!draggingTile) return;

  const { row, col } = getCellFromCursor(e.clientX, e.clientY);
  const targetIdx = getIndexFromCell(row, col);
  const tiles = Array.from(grid.children);
  const draggingIdx = tiles.indexOf(draggingTile);

  // reset transforms
  resetTransforms(draggingTile);

  if (targetIdx > draggingIdx) {
    const toLeft = tiles.slice(draggingIdx + 1, targetIdx + 1);
    translateTiles(toLeft, 'left');
  } else if (targetIdx < draggingIdx) {
    const toRight = tiles.slice(targetIdx, draggingIdx);
    translateTiles(toRight, 'right');
  }

  draggingTile.dataset.targetIndex = targetIdx;
});


grid.addEventListener('drop', (e) => {
  e.preventDefault();
  lastTargetIndex = -1;
  if (!draggingTile) return;

  const idx = parseInt(draggingTile.dataset.targetIndex || -1);
  if (idx < 0) return;

  const tiles = Array.from(grid.children);
  const draggingIdx = tiles.indexOf(draggingTile);
  const before = tiles[idx];

  if (before && before !== draggingTile) {
    if (draggingIdx < idx) {
      grid.insertBefore(draggingTile, before.nextSibling);
    } else {
      grid.insertBefore(draggingTile, before);
    }
  }

  resetTransforms();
  draggingTile.classList.remove('dragging');
  draggingTile = null;
});

grid.addEventListener('dragend', () => {
  if (draggingTile) draggingTile.classList.remove('dragging');
  resetTransforms();
  draggingTile = null;
});

/* ======================================================
 🌄 PARALLAX BACKGROUND SCROLL
====================================================== */
let bgImageHeight = 0;

function computeBackgroundHeight(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img.height);
    img.src = url;
  });
}

async function initParallax() {
  const bgUrl = getComputedStyle(document.body).backgroundImage
    .replace(/^url\(["']?/, '')
    .replace(/["']?\)$/, '');
  bgImageHeight = await computeBackgroundHeight(bgUrl);
  window.addEventListener('scroll', updateParallax);
  updateParallax();
}

function updateParallax() {
  const scrollY = window.scrollY;
  const scrollMax = document.body.scrollHeight - window.innerHeight;
  if (scrollMax <= 0) return;
  const extra = Math.max(0, bgImageHeight - window.innerHeight);
  const offsetY = (scrollY / scrollMax) * extra;
  document.body.style.backgroundPosition = `center -${offsetY}px`;
}

initParallax();

/* ======================================================
 🔧 MISC LISTENERS
====================================================== */
window.addEventListener('resize', () => {
  if (draggingTile) computeGridModel();
});

document.getElementById('num-tiles').addEventListener('input', () => {
  NUM_COLS = document.getElementById('num-tiles').value;
  document.getElementById('num-tiles-value').textContent = NUM_COLS;
  saveSettingsToLocalStorage('numCols', NUM_COLS);
  adjustTileWidth();
});
