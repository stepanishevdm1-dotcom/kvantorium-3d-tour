import * as THREE from 'three';

/* ============================================================
   КОНФИГ — заменишь, когда скачаешь фото
   ============================================================

   Формат:
   const scenes = {
     'hall': {
       name: 'Холл',
       variants: [
         { label: 'Обычная', image: 'холл.jpg' },
         { label: 'ИИ',      image: 'холл_ии.jpg' }    // необязательно
       ],
       hotspots: [
         { yaw: 0.5, pitch: -0.1, label: 'Кабинет 1', target: 'room1',
           returnYaw: 3.64, returnPitch: -0.1 },
         { yaw: 2.3, pitch: 0.05, label: 'Лаборатория', target: 'lab',
           returnYaw: 5.44, returnPitch: 0.05 }
       ]
     },
     'room1': { ... }
   };

   returnYaw / returnPitch — куда смотреть при входе в целевую сцену
   (обычно yaw+PI от хотспота, который ведёт обратно).
*/

const scenes = {
  'main_entrance': {
    name: 'Главный вход',
    variants: [
      { label: 'Обычная', image: 'Главный вход.jpg' }
    ],
    hotspots: [
      { yaw: 2.822, pitch: -0.002, label: 'Охрана', target: 'security',
        returnYaw: 5.964, returnPitch: -0.002 }
    ]
  },
  'security': {
    name: 'Охрана',
    variants: [
      { label: 'Обычная', image: 'у охраны 1 .jpg' }
    ],
    hotspots: [
      { yaw: 2.067, pitch: -0.126, label: 'Главный вход', target: 'main_entrance',
        returnYaw: 5.964, returnPitch: -0.002 },
      { yaw: 0.136, pitch: -0.054, label: 'Третий этаж', target: 'floor3',
        returnYaw: 3.278, returnPitch: 0.1, stairs: true }
    ]
  },
  'floor3': {
    name: '3 этаж',
    variants: [
      { label: 'Обычная', image: '3 этаж.jpg' }
    ],
    hotspots: [
      { yaw: 3.2, pitch: -0.1, label: 'Охрана', target: 'security',
        returnYaw: 0.136, returnPitch: -0.054 }
    ]
  }
};

const DEFAULT_SCENE = 'main_entrance';
const SMOOTH = 0.18;
const MIN_FOV = 20;
const MAX_FOV = 120;
const SPHERE_RADIUS = 500;
const HOTSPOT_DISTANCE = 480;

/* ============================================================
   STATE
   ============================================================ */
let currentSceneId = '';
let currentVariantIdx = 0;
let aiMode = false;
let isTransitioning = false;
let yaw = 0;
let pitch = 0;
let targetYaw = 0;
let targetPitch = 0;
let fov = 75;
let targetFov = 75;
let isDragging = false;
let prevPointer = { x: 0, y: 0 };
let sidebarOpen = false;
let debugVisible = false;
let draggedDistance = 0;
let imageCache = {};

/* ============================================================
   THREE.JS
   ============================================================ */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.prepend(renderer.domElement);

const sphereGeo = new THREE.SphereGeometry(SPHERE_RADIUS, 64, 64);
const sphereMat = new THREE.MeshBasicMaterial({ side: THREE.BackSide });
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(sphere);

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const hotspotVec = new THREE.Vector3(0, 0, -1);

/* ============================================================
   LOADING / PRELOAD
   ============================================================ */
const preloadList = document.getElementById('preload-list');
const loadingStatus = document.getElementById('loading-status');
const loadingEl = document.getElementById('loading');

function getAllImages() {
  const imgs = [];
  for (const id in scenes) {
    const s = scenes[id];
    for (const v of s.variants) {
      if (v.image) imgs.push({ id, label: s.name, file: v.image, variant: v.label || '' });
    }
  }
  return imgs;
}

function humanSize(bytes) {
  const mb = bytes / (1024 * 1024);
  if (mb < 0.01) return '0MB';
  return mb.toFixed(1) + 'MB';
}

function preloadAll() {
  const images = getAllImages();
  const total = images.length;
  let loadedFiles = 0;
  let totalBytes = 0;
  let loadedBytes = 0;

  if (total === 0) {
    loadingEl.classList.add('hidden');
    setTimeout(startViewer, 100);
    return;
  }

  // Узнаём размеры всех файлов перед загрузкой
  Promise.all(images.map(img =>
    fetch(encodeURI(img.file), { method: 'HEAD' })
      .then(r => parseInt(r.headers.get('content-length') || 0))
      .catch(() => 0)
  )).then(sizes => {
    totalBytes = sizes.reduce((a, b) => a + b, 0);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const fileSize = sizes[i];

      const item = document.createElement('div');
      item.className = 'preload-item' + (img.variant ? ' variant' : '');
      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      nameSpan.textContent = img.label + (img.variant ? ' (' + img.variant + ')' : '');
      const progSpan = document.createElement('span');
      progSpan.className = 'progress';
      progSpan.textContent = '0B/' + humanSize(fileSize) + ' 0%';
      item.appendChild(nameSpan);
      item.appendChild(progSpan);
      preloadList.appendChild(item);

      const url = encodeURI(img.file);
      const cacheKey = img.file;

      (async () => {
        try {
          const response = await fetch(url);
          const reader = response.body.getReader();
          let recv = 0;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            recv += value.length;
            const filePct = fileSize ? Math.round((recv / fileSize) * 100) : 0;
            progSpan.textContent = humanSize(recv) + '/' + humanSize(fileSize) + ' ' + filePct + '%';
            loadedBytes += value.length;
            loadingStatus.textContent = 'Загрузка… ' + humanSize(loadedBytes) + '/' + humanSize(totalBytes) + ' ' + (totalBytes ? Math.round((loadedBytes / totalBytes) * 100) : 0) + '%';
          }

          loadedFiles++;
          progSpan.textContent = humanSize(fileSize) + '/' + humanSize(fileSize) + ' 100%';

          if (loadedFiles === total) {
            loadingStatus.textContent = 'Загрузка… ' + humanSize(totalBytes) + '/' + humanSize(totalBytes) + ' 100%';
            setTimeout(() => {
              loadingEl.classList.add('hidden');
              startViewer();
            }, 400);
          }
        } catch (e) {
          loadedFiles++;
          progSpan.textContent = 'Ошибка';
          if (loadedFiles === total) {
            setTimeout(() => {
              loadingEl.classList.add('hidden');
              startViewer();
            }, 400);
          }
        }
      })();
    }
  });
}

/* ============================================================
   TEXTURE LOADING
   ============================================================ */
function loadTexture(url) {
  if (imageCache[url]) return Promise.resolve(imageCache[url]);
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(encodeURI(url), tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = -1;
      tex.needsUpdate = true;
      imageCache[url] = tex;
      resolve(tex);
    }, undefined, reject);
  });
}

async function setScene(id, variantIdx, preserveRotation = false) {
  if (isTransitioning) return;
  const s = scenes[id];
  if (!s) return;

  const imgUrl = s.variants[variantIdx].image;
  if (!imgUrl) return;

  if (!preserveRotation) {
    yaw = 0; targetYaw = 0;
    pitch = 0; targetPitch = 0;
  }

  try {
    const tex = await loadTexture(imgUrl);
    sphere.material.map = tex;
    sphere.material.needsUpdate = true;
    currentSceneId = id;
    currentVariantIdx = variantIdx;
    updateUI();
    buildHotspots();
    buildSidebar();
  } catch (e) {
    console.error('Failed to load texture:', imgUrl, e);
  }
}

function startViewer() {
  setScene(DEFAULT_SCENE, 0);
}

/* ============================================================
   HOTSPOTS
   ============================================================ */
let hotspotMeshes = [];

function createHotspotSprite(label) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1024;
  canvas.height = 256;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = 100, cy = 128;
  ctx.beginPath();
  ctx.arc(cx, cy, 80, 0, Math.PI * 2);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 60;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 54, 0, Math.PI * 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 12;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, Math.PI * 2);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 48;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 52px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 12;
  ctx.fillText(label, 200, 132);
  ctx.shadowBlur = 0;

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(300, 75, 1);
  return sprite;
}

function buildHotspots() {
  for (const m of hotspotMeshes) scene.remove(m);
  hotspotMeshes = [];

  const s = scenes[currentSceneId];
  if (!s) return;

  for (const hs of s.hotspots) {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(hs.pitch, hs.yaw, 0, 'YXZ'));
    const pos = hotspotVec.clone().applyQuaternion(q).multiplyScalar(HOTSPOT_DISTANCE);
    const sprite = createHotspotSprite(hs.label);
    sprite.position.copy(pos);
    sprite.userData = hs;
    scene.add(sprite);
    hotspotMeshes.push(sprite);
  }
}

/* ============================================================
   RAYCASTER
   ============================================================ */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function pickHotspot(clientX, clientY) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(hotspotMeshes);
  if (intersects.length > 0) {
    const obj = intersects[0].object;
    if (obj.userData && obj.userData.target) return obj.userData;
  }
  return null;
}

/* ============================================================
   POINTER EVENTS
   ============================================================ */
function getClientXY(e) {
  if ('touches' in e && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if ('changedTouches' in e && e.changedTouches.length > 0) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function onPointerDown(e) {
  const { x, y } = getClientXY(e);
  draggedDistance = 0;
  prevPointer.x = x;
  prevPointer.y = y;
  isDragging = true;
}

function onPointerUp(e) {
  const { x, y } = getClientXY(e);
  // Если мышь не двигалась — это клик, проверяем хотспот
  if (draggedDistance < 5) {
    const hs = pickHotspot(x, y);
    if (hs) {
      animateHotspotTransition(hs);
      isDragging = false;
      return;
    }
  }
  isDragging = false;
}

function onPointerMove(e) {
  const { x, y } = getClientXY(e);
  const dx = x - prevPointer.x;
  const dy = y - prevPointer.y;
  draggedDistance += Math.abs(dx) + Math.abs(dy);

  if (!isDragging) return;

  const sens = 0.005 * (fov / 75);
  targetYaw += dx * sens;
  targetPitch += dy * sens;
  targetPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetPitch));

  prevPointer.x = x;
  prevPointer.y = y;
}

/* ============================================================
   HOTSPOT TRANSITION
   ============================================================ */
let transitionAnimId = null;
let crossfadeStarted = false;

function animateHotspotTransition(hs) {
  if (isTransitioning) return;
  isTransitioning = true;
  crossfadeStarted = false;

  const startFov = fov;
  const startYaw = yaw;
  const startPitch = pitch;
  const targetHsYaw = hs.yaw;
  const targetHsPitch = hs.pitch;

  let deltaYaw = targetHsYaw - startYaw;
  while (deltaYaw > Math.PI) deltaYaw -= 2 * Math.PI;
  while (deltaYaw < -Math.PI) deltaYaw += 2 * Math.PI;

  if (hs.stairs) {
    const stairsDuration = 2800;
    const stairsStart = performance.now();

    function stairsStep(now) {
      const t = Math.min((now - stairsStart) / stairsDuration, 1);
      const bob = Math.sin(t * Math.PI * 6) * 0.015;
      const lookUp = t * 0.12;

      yaw = startYaw + deltaYaw * (1 - Math.pow(1 - t, 2));
      pitch = startPitch + (targetHsPitch - startPitch) * t + lookUp + bob;
      targetYaw = yaw;
      targetPitch = pitch;
      fov = startFov + (30 - startFov) * t;
      targetFov = fov;

      if (t >= 1) {
        crossfadeStarted = true;
        doCrossfadeTransition(hs.target, hs.returnYaw, hs.returnPitch);
        setTimeout(() => {
          fov = 120;
          targetFov = 120;
          const fovStart = 120;
          const fovDuration = 500;
          const fovStartTime = performance.now();
          function fovStep(now2) {
            const ft = Math.min((now2 - fovStartTime) / fovDuration, 1);
            fov = fovStart + (75 - fovStart) * (1 - Math.pow(1 - ft, 3));
            targetFov = fov;
            if (ft < 1) requestAnimationFrame(fovStep);
            else isTransitioning = false;
          }
          requestAnimationFrame(fovStep);
        }, 50);
      } else {
        requestAnimationFrame(stairsStep);
      }
    }
    requestAnimationFrame(stairsStep);
    return;
  }

  const duration = 600;
  const startTime = performance.now();

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);

    yaw = startYaw + deltaYaw * ease;
    pitch = startPitch + (targetHsPitch - startPitch) * ease;
    targetYaw = yaw;
    targetPitch = pitch;
    fov = startFov + (20 - startFov) * ease;
    targetFov = fov;

    if (t >= 0.9 && !crossfadeStarted) {
      crossfadeStarted = true;
      doCrossfadeTransition(hs.target, hs.returnYaw, hs.returnPitch);
    }

    if (t < 1) {
      transitionAnimId = requestAnimationFrame(step);
    } else {
      setTimeout(() => {
        fov = 120;
        targetFov = 120;
        const fovStart = 120;
        const fovDuration = 500;
        const fovStartTime = performance.now();
        function fovStep(now2) {
          const ft = Math.min((now2 - fovStartTime) / fovDuration, 1);
          fov = fovStart + (75 - fovStart) * (1 - Math.pow(1 - ft, 3));
          targetFov = fov;
          if (ft < 1) requestAnimationFrame(fovStep);
          else isTransitioning = false;
        }
        requestAnimationFrame(fovStep);
      }, 50);
    }
  }
  transitionAnimId = requestAnimationFrame(step);
}

async function doCrossfadeTransition(targetId, returnYaw, returnPitch) {
  const s = scenes[targetId];
  if (!s) { isTransitioning = false; return; }

  const imgUrl = aiMode && s.variants[1] ? s.variants[1].image : s.variants[0].image;

  const crossfadeEl = document.createElement('div');
  crossfadeEl.style.cssText = 'position:fixed;inset:0;z-index:150;background:#000;opacity:0;transition:opacity 0.06s ease;pointer-events:none;';
  document.body.appendChild(crossfadeEl);
  requestAnimationFrame(() => { crossfadeEl.style.opacity = '1'; });

  await new Promise(r => setTimeout(r, 70));

  try {
    const tex = await loadTexture(imgUrl);
    sphere.material.map = tex;
    sphere.material.needsUpdate = true;

    if (returnYaw !== undefined) {
      yaw = returnYaw;
      pitch = returnPitch || 0;
      targetYaw = yaw;
      targetPitch = pitch;
    }

    currentSceneId = targetId;
    currentVariantIdx = aiMode && s.variants[1] ? 1 : 0;
    updateUI();
    buildHotspots();
    buildSidebar();

    crossfadeEl.style.opacity = '0';
    await new Promise(r => setTimeout(r, 70));
    crossfadeEl.remove();
  } catch (e) {
    console.error(e);
    crossfadeEl.remove();
  }
  // isTransitioning сбрасывается в конце анимации FOV, не здесь
}

/* ============================================================
   SIDEBAR NAVIGATION
   ============================================================ */
function navigateTo(id, variantIdx) {
  if (id === currentSceneId && variantIdx === currentVariantIdx) return;
  if (isTransitioning) return;
  isTransitioning = true;

  const s = scenes[id];
  if (!s) { isTransitioning = false; return; }

  const imgUrl = s.variants[variantIdx].image;

  const fadeEl = document.createElement('div');
  fadeEl.style.cssText = 'position:fixed;inset:0;z-index:150;background:#000;opacity:0;transition:opacity 0.3s ease;pointer-events:none;';
  document.body.appendChild(fadeEl);
  requestAnimationFrame(() => { fadeEl.style.opacity = '1'; });

  setTimeout(async () => {
    try {
      const tex = await loadTexture(imgUrl);
      sphere.material.map = tex;
      sphere.material.needsUpdate = true;

      currentSceneId = id;
      currentVariantIdx = variantIdx;
      updateUI();
      buildHotspots();
      buildSidebar();

      fadeEl.style.opacity = '0';
      setTimeout(() => fadeEl.remove(), 300);
    } catch (e) {
      console.error(e);
      fadeEl.remove();
    }
    isTransitioning = false;
  }, 350);
}

/* ============================================================
   UI
   ============================================================ */
const sceneNameEl = document.getElementById('scene-name');
const variantsEl = document.getElementById('variants');

function updateUI() {
  const s = scenes[currentSceneId];
  if (!s) return;
  sceneNameEl.textContent = s.name;

  variantsEl.innerHTML = '';
  if (s.variants.length > 1) {
    for (let i = 0; i < s.variants.length; i++) {
      const btn = document.createElement('button');
      btn.textContent = s.variants[i].label;
      if (i === currentVariantIdx) btn.classList.add('active');
      btn.addEventListener('click', () => switchVariant(i));
      variantsEl.appendChild(btn);
    }
  }
}

function switchVariant(idx) {
  const s = scenes[currentSceneId];
  if (!s || idx === currentVariantIdx) return;
  currentVariantIdx = idx;
  const imgUrl = s.variants[idx].image;
  loadTexture(imgUrl).then(tex => {
    sphere.material.map = tex;
    sphere.material.needsUpdate = true;
    updateUI();
  });
}

/* ============================================================
   SIDEBAR
   ============================================================ */
const sidebarBtn = document.getElementById('sidebar-btn');
const sidebar = document.getElementById('sidebar');
const sidebarList = document.getElementById('sidebar-list');
const overlay = document.getElementById('overlay');

function buildSidebar() {
  sidebarList.innerHTML = '';
  for (const id in scenes) {
    const s = scenes[id];
    const item = document.createElement('div');
    item.className = 'sidebar-item' + (id === currentSceneId ? ' active' : '');
    const dot = document.createElement('span');
    dot.className = 'dot';
    item.appendChild(dot);
    const label = document.createTextNode(s.name);
    item.appendChild(label);
    item.addEventListener('click', () => {
      closeSidebar();
      const vi = aiMode && s.variants[1] ? 1 : 0;
      navigateTo(id, vi);
    });
    sidebarList.appendChild(item);
  }
}

function openSidebar() {
  sidebarOpen = true;
  sidebar.classList.add('open');
  overlay.classList.add('show');
}

function closeSidebar() {
  sidebarOpen = false;
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

sidebarBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (sidebarOpen) closeSidebar(); else openSidebar();
});

overlay.addEventListener('click', closeSidebar);

/* ============================================================
   WHEEL ZOOM
   ============================================================ */
renderer.domElement.addEventListener('wheel', e => {
  e.preventDefault();
  targetFov += e.deltaY * 0.08;
  targetFov = Math.max(MIN_FOV, Math.min(MAX_FOV, targetFov));
}, { passive: false });

/* ============================================================
   MOUSE
   ============================================================ */
renderer.domElement.addEventListener('mousedown', onPointerDown);
window.addEventListener('mouseup', onPointerUp);
window.addEventListener('mousemove', onPointerMove);

/* ============================================================
   TOUCH
   ============================================================ */
let touchDist = 0;
renderer.domElement.addEventListener('touchstart', e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    touchDist = Math.sqrt(dx * dx + dy * dy);
  } else if (e.touches.length === 1) {
    onPointerDown(e);
  }
}, { passive: false });

renderer.domElement.addEventListener('touchmove', e => {
  if (e.touches.length === 2) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const delta = touchDist - dist;
    targetFov += delta * 0.15;
    targetFov = Math.max(MIN_FOV, Math.min(MAX_FOV, targetFov));
    touchDist = dist;
  } else if (e.touches.length === 1 && isDragging) {
    onPointerMove(e);
  }
}, { passive: false });

renderer.domElement.addEventListener('touchend', e => {
  if (e.touches.length < 2) touchDist = 0;
  if (e.touches.length === 0) onPointerUp(e);
});

/* ============================================================
   KEYBOARD
   ============================================================ */
window.addEventListener('keydown', e => {
  const code = e.code;

  // D — показать/скрыть отладку
  if (code === 'KeyD') {
    debugVisible = !debugVisible;
    updateDebugHUD();
    if (debugVisible) showDebug('Отладка включена');
    return;
  }

  // V (англ.) / В (рус.) — скопировать yaw,pitch в буфер
  if (code === 'KeyV' || code === 'KeyB') {
    const yawDeg = yaw * 180 / Math.PI;
    const pitchDeg = pitch * 180 / Math.PI;
    const str = yawDeg.toFixed(1) + ',' + pitchDeg.toFixed(1);
    navigator.clipboard.writeText(str).catch(() => {});
    showDebug('Скопировано: ' + str);
    return;
  }

  // Стрелки
  const step = 0.04;
  if (code === 'ArrowLeft') targetYaw -= step;
  if (code === 'ArrowRight') targetYaw += step;
  if (code === 'ArrowUp') targetPitch -= step;
  if (code === 'ArrowDown') targetPitch += step;

  // Zoom
  if (code === 'Equal' || code === 'NumpadAdd') {
    targetFov = Math.max(MIN_FOV, fov - 5);
  }
  if (code === 'Minus' || code === 'NumpadSubtract') {
    targetFov = Math.min(MAX_FOV, fov + 5);
  }

  targetPitch = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetPitch));
});

/* ============================================================
   DEBUG HUD
   ============================================================ */
let debugHUD = null;

function updateDebugHUD() {
  if (!debugHUD) {
    debugHUD = document.createElement('div');
    debugHUD.id = 'debug-hud';
    debugHUD.style.cssText = 'position:fixed;top:12px;right:12px;z-index:500;background:rgba(0,0,0,0.7);padding:8px 12px;border-radius:6px;font-family:"Courier New",monospace;font-size:0.75rem;color:#8f8;pointer-events:none;opacity:0;transition:opacity 0.3s;line-height:1.6;';
    document.body.appendChild(debugHUD);
  }
  debugHUD.style.opacity = debugVisible ? '1' : '0';
}

function refreshDebugHUD() {
  if (!debugHUD || !debugVisible) return;
  const yawDeg = (yaw * 180 / Math.PI).toFixed(1);
  const pitchDeg = (pitch * 180 / Math.PI).toFixed(1);
  debugHUD.innerHTML = 'yaw: ' + yawDeg + '°<br>pitch: ' + pitchDeg + '°<br>fov: ' + fov.toFixed(0) + '°';
}

/* ============================================================
   DEBUG TOAST
   ============================================================ */
let debugToast = null;
function showDebug(msg) {
  if (!debugToast) {
    debugToast = document.createElement('div');
    debugToast.id = 'debug-toast';
    document.body.appendChild(debugToast);
  }
  debugToast.textContent = msg;
  debugToast.classList.add('show');
  clearTimeout(debugToast._timeout);
  debugToast._timeout = setTimeout(() => debugToast.classList.remove('show'), 2000);
}

/* ============================================================
   RESIZE
   ============================================================ */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ============================================================
   RENDER LOOP
   ============================================================ */
function animate() {
  requestAnimationFrame(animate);

  yaw += (targetYaw - yaw) * SMOOTH;
  pitch += (targetPitch - pitch) * SMOOTH;
  fov += (targetFov - fov) * SMOOTH;

  euler.set(pitch, yaw, 0);
  camera.quaternion.setFromEuler(euler);
  camera.fov = fov;
  camera.updateProjectionMatrix();

  renderer.render(scene, camera);

  if (debugVisible) refreshDebugHUD();
}

/* ============================================================
   INIT
   ============================================================ */
animate();
preloadAll();
buildSidebar();
updateDebugHUD();

setInterval(() => { if (isTransitioning) isTransitioning = false; }, 10000);

window.__debug = { scenes, yaw, pitch, fov };
