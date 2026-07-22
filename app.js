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
      { yaw: 2.836, pitch: 0.033, label: 'Охрана', target: 'security',
        returnYaw: 5.211, returnPitch: 0 }
    ]
  },
  'security': {
    name: 'Охрана',
    variants: [
      { label: 'Обычная', image: 'у охраны 1 .jpg' }
    ],
    hotspots: [
      { yaw: 2.069, pitch: -0.093, label: 'Главный вход', target: 'main_entrance',
        returnYaw: 5.978, returnPitch: 0 },
      { yaw: 0.106, pitch: -0.042, label: 'Третий этаж', target: 'floor3',
        returnYaw: 4.015, returnPitch: 0, stairs: true, climbText: 'Поднимаемся на 3 этаж' }
    ]
  },
  'floor3': {
    name: 'Третий этаж',
    variants: [
      { label: 'Обычная', image: '3 этаж.jpg' }
    ],
    hotspots: [
      { yaw: 0.873, pitch: -0.169, label: 'Охрана', target: 'security',
        returnYaw: 3.248, returnPitch: 0, descend: true, climbText: 'Спускаемся на 1 этаж' },
      { yaw: 4.684, pitch: -0.124, label: 'Третий этаж 1', target: 'floor3_1',
        returnYaw: 1.604, returnPitch: 0 }
    ]
  },
  'floor3_1': {
    name: 'Третий этаж 1',
    variants: [
      { label: 'Обычная', image: '3 этаж 1.jpg' }
    ],
    hotspots: [
      { yaw: 4.745, pitch: -0.084, label: 'Третий этаж', target: 'floor3',
        returnYaw: 1.543, returnPitch: 0 },
      { yaw: 1.429, pitch: -0.065, label: 'Третий этаж 2', target: 'floor3_2',
        returnYaw: 4.744, returnPitch: 0 }
    ]
  },
  'floor3_2': {
    name: 'Третий этаж 2',
    variants: [
      { label: 'Обычная', image: '3 этаж 2.jpg' }
    ],
    hotspots: [
      { yaw: 1.602, pitch: -0.045, label: 'Третий этаж 1', target: 'floor3_1',
        returnYaw: 4.571, returnPitch: 0 },
      { yaw: 4.660, pitch: -0.080, label: 'Третий этаж 3', target: 'floor3_3',
        returnYaw: 6.234, returnPitch: 0 }
    ]
  },
  'floor3_3': {
    name: 'Третий этаж 3',
    variants: [
      { label: 'Обычная', image: '3 этаж 3.jpg' }
    ],
    hotspots: [
      { yaw: 3.092, pitch: -0.056, label: 'Третий этаж 2', target: 'floor3_2',
        returnYaw: 1.519, returnPitch: 0 },
      { yaw: 6.262, pitch: -0.075, label: 'Третий этаж 4', target: 'floor3_4',
        returnYaw: 4.799, returnPitch: 0 }
    ]
  },
  'floor3_4': {
    name: 'Третий этаж 4',
    variants: [
      { label: 'Обычная', image: '3 этаж 4.jpg' }
    ],
    hotspots: [
      { yaw: 1.657, pitch: -0.094, label: 'Третий этаж 3', target: 'floor3_3',
        returnYaw: 3.121, returnPitch: 0 },
      { yaw: 3.257, pitch: -0.070, label: 'Третий этаж 5', target: 'floor3_5',
        returnYaw: 0.030, returnPitch: 0 }
    ]
  },
  'floor3_5': {
    name: 'Третий этаж 5',
    variants: [
      { label: 'Обычная', image: '3 этаж 5.jpg' }
    ],
    hotspots: [
      { yaw: 3.171, pitch: -0.065, label: 'Третий этаж 4', target: 'floor3_4',
        returnYaw: 0.116, returnPitch: 0 },
      { yaw: 6.248, pitch: -0.105, label: 'Третий этаж 6', target: 'floor3_6',
        returnYaw: 6.238, returnPitch: 0 }
    ]
  },
  'floor3_6': {
    name: 'Третий этаж 6',
    variants: [
      { label: 'Обычная', image: '3 этаж 6.jpg' }
    ],
    hotspots: [
      { yaw: 3.096, pitch: -0.059, label: 'Третий этаж 5', target: 'floor3_5',
        returnYaw: 3.107, returnPitch: 0 },
      { yaw: 6.282, pitch: -0.056, label: 'Третий этаж 7', target: 'floor3_7',
        returnYaw: 6.304, returnPitch: 0 },
      { yaw: 4.632, pitch: -0.150, label: 'Кабинет Промышленный дизайн', target: 'industrial_design',
        returnYaw: 3.110, returnPitch: 0 }
    ]
  },
  'floor3_7': {
    name: 'Третий этаж 7',
    variants: [
      { label: 'Обычная', image: '3 этаж 7.jpg' }
    ],
    hotspots: [
      { yaw: 3.162, pitch: -0.040, label: 'Третий этаж 6', target: 'floor3_6',
        returnYaw: 6.304, returnPitch: 0 },
      { yaw: 4.812, pitch: -0.126, label: 'Кабинет Робоквантум', target: 'robo',
        returnYaw: 5.385, returnPitch: 0 },
      { yaw: 6.202, pitch: -0.091, label: 'Третий этаж 8', target: 'floor3_8',
        returnYaw: 3.062, returnPitch: 0 }
    ]
  },
  'industrial_design': {
    name: 'Кабинет Промышленный дизайн',
    variants: [
      { label: 'Обычная', image: 'Промышленный дизайн.jpg' }
    ],
    hotspots: [
      { yaw: 6.251, pitch: -0.035, label: 'Третий этаж 6', target: 'floor3_6',
        returnYaw: 1.491, returnPitch: 0 },
      { yaw: 4.762, pitch: -0.030, label: 'Кабинет Промышленный дизайн 2', target: 'industrial_design_2',
        returnYaw: 3.142, returnPitch: 0 }
    ]
  },
  'industrial_design_2': {
    name: 'Кабинет Промышленный дизайн 2',
    variants: [
      { label: 'Обычная', image: 'Промышленный дизайн 2.jpg' }
    ],
    hotspots: [
      { yaw: 4.732, pitch: -0.059, label: 'Промышленный дизайн', target: 'industrial_design',
        returnYaw: 1.621, returnPitch: 0 },
      { yaw: 4.018, pitch: -0.101, label: 'Третий этаж 6', target: 'floor3_6',
        returnYaw: 3.142, returnPitch: 0 }
    ]
  },
  'robo': {
    name: 'Кабинет Робоквантум',
    variants: [
      { label: 'Обычная', image: 'Robo.jpg' }
    ],
    hotspots: [
      { yaw: 2.243, pitch: -0.059, label: 'Третий этаж 7', target: 'floor3_7',
        returnYaw: 1.671, returnPitch: 0 },
      { yaw: 0.708, pitch: -0.106, label: 'Третий этаж 8', target: 'floor3_8',
        returnYaw: 1.432, returnPitch: 0 }
    ]
  },
  'floor3_8': {
    name: 'Третий этаж 8',
    variants: [
      { label: 'Обычная', image: '3 этаж 8.jpg' }
    ],
    hotspots: [
      { yaw: 3.206, pitch: -0.075, label: 'Третий этаж 7', target: 'floor3_7',
        returnYaw: 3.062, returnPitch: 0 },
      { yaw: 4.573, pitch: -0.099, label: 'Кабинет Робоквантум', target: 'robo',
        returnYaw: 3.850, returnPitch: 0 },
      { yaw: 0.019, pitch: -0.056, label: 'Третий этаж 9', target: 'floor3_9',
        returnYaw: 6.278, returnPitch: 0 }
    ]
  },
  'floor3_9': {
    name: 'Третий этаж 9',
    variants: [
      { label: 'Обычная', image: '3 этаж 9.jpg' }
    ],
    hotspots: [
      { yaw: 3.136, pitch: -0.075, label: 'Третий этаж 8', target: 'floor3_8',
        returnYaw: 3.161, returnPitch: 0 },
      { yaw: 6.257, pitch: -0.040, label: 'Третий этаж 10', target: 'floor3_10',
        returnYaw: 1.628, returnPitch: 0 },
      { yaw: 4.732, pitch: -0.145, label: 'Кабинет 304', target: 'kabinet_304',
        returnYaw: 6.168, returnPitch: 0 }
    ]
  },
  'floor3_10': {
    name: 'Третий этаж 10',
    variants: [
      { label: 'Обычная', image: '3 этаж 10.jpg' }
    ],
    hotspots: [
      { yaw: 4.768, pitch: -0.084, label: 'Третий этаж 9', target: 'floor3_9',
        returnYaw: 3.099, returnPitch: 0 },
      { yaw: 0.096, pitch: -0.084, label: 'Третий этаж 11', target: 'floor3_11',
        returnYaw: 6.302, returnPitch: 0 }
    ]
  },
  'floor3_11': {
    name: 'Третий этаж 11',
    variants: [
      { label: 'Обычная', image: '3 этаж 11.jpg' }
    ],
    hotspots: [
      { yaw: 3.161, pitch: -0.070, label: 'Третий этаж 10', target: 'floor3_10',
        returnYaw: 3.238, returnPitch: 0 },
      { yaw: 6.276, pitch: -0.070, label: 'Третий этаж 12', target: 'floor3_12',
        returnYaw: 3.135, returnPitch: 0 }
    ]
  },
  'floor3_12': {
    name: 'Третий этаж 12',
    variants: [
      { label: 'Обычная', image: '3 этаж 12.jpg' }
    ],
    hotspots: [
      { yaw: 3.135, pitch: 0, label: 'Третий этаж 11', target: 'floor3_11',
        returnYaw: 3.238, returnPitch: 0 }
    ]
  },
  'kabinet_304': {
    name: 'Кабинет 304',
    variants: [
      { label: 'Обычная', image: 'Кабинет 304.jpg' }
    ],
    hotspots: [
      { yaw: 3.027, pitch: -0.209, label: 'Третий этаж 9', target: 'floor3_9',
        returnYaw: 1.388, returnPitch: 0 },
      { yaw: 0.243, pitch: -0.269, label: 'Коллективная радиостанция', target: 'radio_station',
        returnYaw: 3.142, returnPitch: 0 },
      { yaw: 4.743, pitch: -0.257, label: 'Кабинет Энерджиквантум', target: 'energikvantum',
        returnYaw: 3.142, returnPitch: 0 }
    ]
  },
  'radio_station': {
    name: 'Коллективная радиостанция',
    variants: [
      { label: 'Обычная', image: 'Коллективная радиостанция 4.jpg' }
    ],
    hotspots: [
      { yaw: 0, pitch: 0, label: 'Кабинет 304', target: 'kabinet_304',
        returnYaw: 3.385, returnPitch: 0 }
    ]
  },
  'energikvantum': {
    name: 'Кабинет Энерджиквантум',
    variants: [
      { label: 'Обычная', image: 'Энерджиквантум.jpg' }
    ],
    hotspots: [
      { yaw: 4.737, pitch: -0.140, label: 'Кабинет 304', target: 'kabinet_304',
        returnYaw: 1.602, returnPitch: 0 },
      { yaw: 3.013, pitch: -0.070, label: 'Энерджиквантум 2', target: 'energikvantum_2',
        returnYaw: 4.659, returnPitch: 0 }
    ]
  },
  'energikvantum_2': {
    name: 'Кабинет Энерджиквантум 2',
    variants: [
      { label: 'Обычная', image: 'Энерджиквантум 2.jpg' }
    ],
    hotspots: [
      { yaw: 1.517, pitch: -0.080, label: 'Энерджиквантум', target: 'energikvantum',
        returnYaw: 6.155, returnPitch: 0 }
    ]
  }
};

const sidebarGroups = [
  { label: null, scenes: ['main_entrance', 'security'] },
  { label: 'Третий этаж', scenes: ['floor3', 'floor3_1', 'floor3_2', 'floor3_3', 'floor3_4', 'floor3_5', 'floor3_6', 'floor3_7', 'floor3_8', 'floor3_9', 'floor3_10', 'floor3_11', 'floor3_12'] },
  { label: 'Кабинеты', scenes: ['industrial_design', 'industrial_design_2', 'robo', 'kabinet_304', 'radio_station', 'energikvantum', 'energikvantum_2'] }
];

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
let loadingRotate = true;

/* ============================================================
   SETTINGS
   ============================================================ */
const SETTINGS_DEFAULTS = {
  hotspotStyle: 0,
  textSize: 44,
  textColor: '#ffffff',
  markerColor: '#ffffff',
  mouseSensitivity: 1,
  animations: true,
  transitionSpeed: 2500,
  language: 'ru'
};

const translations = {
  ru: {
    loading: 'Загрузка… ',
    loading_initial: 'Загрузка панорам…',
    error: 'Ошибка',
    vpn_hint: 'Если скорость скачивания медленная — выключите VPN и проверьте сигнал сети',
    bg_load: 'Загружать в фоне',
    settings_title: 'Настройки',
    rooms_title: 'Комнаты',
    back: '\u2190 Назад',
    hotspot_style: 'Внешность меток',
    text_size: 'Размер текста',
    text_color: 'Цвет текста',
    marker_color: 'Цвет меток',
    mouse_sensitivity: 'Чувствительность мыши',
    animations: 'Анимации между точками',
    transition_speed: 'Скорость перехода',
    on: 'Вкл',
    off: 'Выкл',
    debug_on: 'Отладка включена',
    copied: 'Скопировано: ',
    language: 'Язык / Language',
    px: 'px',
    s: 'с',
  },
  en: {
    loading: 'Loading\u2026 ',
    loading_initial: 'Loading panoramas\u2026',
    error: 'Error',
    vpn_hint: 'If download speed is slow \u2014 disable VPN and check your network signal',
    bg_load: 'Load in Background',
    settings_title: 'Settings',
    rooms_title: 'Rooms',
    back: '\u2190 Back',
    hotspot_style: 'Hotspot Style',
    text_size: 'Text Size',
    text_color: 'Text Color',
    marker_color: 'Marker Color',
    mouse_sensitivity: 'Mouse Sensitivity',
    animations: 'Transition Animations',
    transition_speed: 'Transition Speed',
    on: 'On',
    off: 'Off',
    debug_on: 'Debug enabled',
    copied: 'Copied: ',
    language: 'Language / Язык',
    px: 'px',
    s: 's',
  }
};

const sceneNamesEn = {
  'main_entrance': 'Main Entrance',
  'security': 'Security Office',
  'floor3': 'Floor 3',
  'floor3_1': 'Floor 3 \u2014 1',
  'floor3_2': 'Floor 3 \u2014 2',
  'floor3_3': 'Floor 3 \u2014 3',
  'floor3_4': 'Floor 3 \u2014 4',
  'floor3_5': 'Floor 3 \u2014 5',
  'floor3_6': 'Floor 3 \u2014 6',
  'floor3_7': 'Floor 3 \u2014 7',
  'floor3_8': 'Floor 3 \u2014 8',
  'floor3_9': 'Floor 3 \u2014 9',
  'floor3_10': 'Floor 3 \u2014 10',
  'floor3_11': 'Floor 3 \u2014 11',
  'floor3_12': 'Floor 3 \u2014 12',
  'industrial_design': 'Industrial Design Room',
  'industrial_design_2': 'Industrial Design Room 2',
  'robo': 'Roboquantum Room',
  'kabinet_304': 'Room 304',
  'radio_station': 'Collective Radio Station',
  'energikvantum': 'Energiquantom Room',
  'energikvantum_2': 'Energiquantom Room 2',
};

const hotspotLabelEn = {
  '\u041e\u0445\u0440\u0430\u043d\u0430': 'Security',
  '\u0413\u043b\u0430\u0432\u043d\u044b\u0439 \u0432\u0445\u043e\u0434': 'Main Entrance',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436': 'Floor 3',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 1': 'Floor 3 \u2014 1',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 2': 'Floor 3 \u2014 2',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 3': 'Floor 3 \u2014 3',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 4': 'Floor 3 \u2014 4',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 5': 'Floor 3 \u2014 5',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 6': 'Floor 3 \u2014 6',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 7': 'Floor 3 \u2014 7',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 8': 'Floor 3 \u2014 8',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 9': 'Floor 3 \u2014 9',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 10': 'Floor 3 \u2014 10',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 11': 'Floor 3 \u2014 11',
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436 12': 'Floor 3 \u2014 12',
  '\u041a\u0430\u0431\u0438\u043d\u0435\u0442 \u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u044b\u0439 \u0434\u0438\u0437\u0430\u0439\u043d': 'Industrial Design Room',
  '\u041a\u0430\u0431\u0438\u043d\u0435\u0442 \u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u044b\u0439 \u0434\u0438\u0437\u0430\u0439\u043d 2': 'Industrial Design Room 2',
  '\u041a\u0430\u0431\u0438\u043d\u0435\u0442 \u0420\u043e\u0431\u043e\u043a\u0432\u0430\u043d\u0442\u0443\u043c': 'Roboquantum Room',
  '\u041a\u0430\u0431\u0438\u043d\u0435\u0442 304': 'Room 304',
  '\u041a\u043e\u043b\u043b\u0435\u043a\u0442\u0438\u0432\u043d\u0430\u044f \u0440\u0430\u0434\u0438\u043e\u0441\u0442\u0430\u043d\u0446\u0438\u044f': 'Collective Radio Station',
  '\u041a\u0430\u0431\u0438\u043d\u0435\u0442 \u042d\u043d\u0435\u0440\u0434\u0436\u0438\u043a\u0432\u0430\u043d\u0442\u0443\u043c': 'Energiquantom Room',
  '\u041a\u0430\u0431\u0438\u043d\u0435\u0442 \u042d\u043d\u0435\u0440\u0434\u0436\u0438\u043a\u0432\u0430\u043d\u0442\u0443\u043c 2': 'Energiquantom Room 2',
  '\u041f\u0440\u043e\u043c\u044b\u0448\u043b\u0435\u043d\u043d\u044b\u0439 \u0434\u0438\u0437\u0430\u0439\u043d': 'Industrial Design',
  '\u042d\u043d\u0435\u0440\u0434\u0436\u0438\u043a\u0432\u0430\u043d\u0442\u0443\u043c': 'Energiquantom',
  '\u042d\u043d\u0435\u0440\u0434\u0436\u0438\u043a\u0432\u0430\u043d\u0442\u0443\u043c 2': 'Energiquantom 2',
  '\u041f\u043e\u0434\u043d\u0438\u043c\u0430\u0435\u043c\u0441\u044f \u043d\u0430 3 \u044d\u0442\u0430\u0436': 'Going up to Floor 3',
  '\u0421\u043f\u0443\u0441\u043a\u0430\u0435\u043c\u0441\u044f \u043d\u0430 1 \u044d\u0442\u0430\u0436': 'Going down to Floor 1',
};

const variantLabelEn = {
  '\u041e\u0431\u044b\u0447\u043d\u0430\u044f': 'Normal',
};

const sidebarGroupLabelEn = {
  '\u0422\u0440\u0435\u0442\u0438\u0439 \u044d\u0442\u0430\u0436': 'Floor 3',
  '\u041a\u0430\u0431\u0438\u043d\u0435\u0442\u044b': 'Rooms',
};

function t(key) {
  const lang = settings.language || 'ru';
  return (translations[lang] && translations[lang][key]) || (translations.ru && translations.ru[key]) || key;
}

function getSceneName(id) {
  const s = scenes[id];
  if (!s) return '';
  if (settings.language === 'en' && sceneNamesEn[id]) return sceneNamesEn[id];
  return s.name;
}

function getHSLabel(rus) {
  if (settings.language === 'en' && hotspotLabelEn[rus]) return hotspotLabelEn[rus];
  return rus;
}

function getVariantLabel(rus) {
  if (settings.language === 'en' && variantLabelEn[rus]) return variantLabelEn[rus];
  return rus;
}

function getSidebarGroupLabel(rus) {
  if (settings.language === 'en' && sidebarGroupLabelEn[rus]) return sidebarGroupLabelEn[rus];
  return rus;
}

let settings = {};

function loadSettings() {
  try {
    const raw = localStorage.getItem('kvantorium_settings');
    if (raw) {
      settings = JSON.parse(raw);
      for (const k in SETTINGS_DEFAULTS) {
        if (settings[k] === undefined) settings[k] = SETTINGS_DEFAULTS[k];
      }
    } else {
      settings = { ...SETTINGS_DEFAULTS };
    }
  } catch {
    settings = { ...SETTINGS_DEFAULTS };
  }
}

function saveSettings() {
  try { localStorage.setItem('kvantorium_settings', JSON.stringify(settings)); } catch {}
}

loadSettings();

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

// Фон для экрана загрузки — медленно вращающийся Главный вход
loadTexture(scenes.main_entrance.variants[0].image).then(tex => {
  sphere.material.map = tex;
  sphere.material.needsUpdate = true;
});

/* ============================================================
   LOADING / PRELOAD
   ============================================================ */
const preloadList = document.getElementById('preload-list');
const loadingStatus = document.getElementById('loading-status');
const loadingEl = document.getElementById('loading');
const loadingHint = document.getElementById('loading-hint');
const bgLoadBtn = document.getElementById('bg-load-btn');
loadingStatus.textContent = t('loading_initial');
loadingHint.textContent = t('vpn_hint');
bgLoadBtn.textContent = t('bg_load');

function getAllImages() {
  const imgs = [];
  for (const id in scenes) {
    const s = scenes[id];
    for (const v of s.variants) {
      if (v.image) imgs.push({ id, label: getSceneName(id), file: v.image, variant: getVariantLabel(v.label || '') });
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
            loadingStatus.textContent = t('loading') + humanSize(loadedBytes) + '/' + humanSize(totalBytes) + ' ' + (totalBytes ? Math.round((loadedBytes / totalBytes) * 100) : 0) + '%';
          }

          loadedFiles++;
          progSpan.textContent = humanSize(fileSize) + '/' + humanSize(fileSize) + ' 100%';

          if (loadedFiles === total) {
            loadingStatus.textContent = t('loading') + humanSize(totalBytes) + '/' + humanSize(totalBytes) + ' 100%';
            setTimeout(() => {
              loadingEl.classList.add('hidden');
              if (!viewerStarted) startViewer();
            }, 400);
          }
        } catch (e) {
          loadedFiles++;
          progSpan.textContent = t('error');
          if (loadedFiles === total) {
            setTimeout(() => {
              loadingEl.classList.add('hidden');
              if (!viewerStarted) startViewer();
            }, 400);
          }
        }
      })();
    }
  });
}

let viewerStarted = false;

bgLoadBtn.addEventListener('click', () => {
  bgLoadBtn.remove();
  loadingEl.classList.add('hidden');
  startViewer();
});

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
    const firstHotspot = s.hotspots[0];
    yaw = firstHotspot ? firstHotspot.yaw : 0;
    pitch = firstHotspot ? firstHotspot.pitch : 0;
    targetYaw = yaw;
    targetPitch = pitch;
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
  loadingRotate = false;
  viewerStarted = true;
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

  const cx = 512, cy = 180;
  const style = settings.hotspotStyle;
  const tColor = settings.textColor;
  const tSize = settings.textSize;
  const mColor = settings.markerColor;

  if (style === 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, 60, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 30;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.strokeStyle = mColor;
    ctx.lineWidth = 12;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 24;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.strokeStyle = mColor;
    ctx.lineWidth = 6;
    ctx.stroke();
  } else if (style === 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, 28, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 18;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.strokeStyle = mColor;
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = mColor;
    ctx.fill();
  } else if (style === 2) {
    const r = 28;
    ctx.beginPath();
    ctx.roundRect(cx - r, cy - r, r * 2, r * 2, 10);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 18;
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(cx - r + 4, cy - r + 4, (r - 4) * 2, (r - 4) * 2, 8);
    ctx.strokeStyle = mColor;
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(cx - 8, cy - 8, 16, 16, 4);
    ctx.fillStyle = mColor;
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 35);
    ctx.lineTo(cx + 30, cy);
    ctx.lineTo(cx, cy + 35);
    ctx.lineTo(cx - 30, cy);
    ctx.closePath();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 18;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 27);
    ctx.lineTo(cx + 24, cy);
    ctx.lineTo(cx, cy + 27);
    ctx.lineTo(cx - 24, cy);
    ctx.closePath();
    ctx.strokeStyle = mColor;
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = mColor;
    ctx.fill();
  }

  ctx.fillStyle = tColor;
  ctx.font = 'bold ' + tSize + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 12;
  ctx.fillText(label, cx, 60);
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
    const sprite = createHotspotSprite(getHSLabel(hs.label));
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
  if (isTransitioning) return;
  const { x, y } = getClientXY(e);
  draggedDistance = 0;
  prevPointer.x = x;
  prevPointer.y = y;
  isDragging = true;
}

function onPointerUp(e) {
  if (isTransitioning) return;
  if (!e.target || !renderer.domElement.contains(e.target)) return;
  const { x, y } = getClientXY(e);
  if (draggedDistance < 5) {
    const hs = pickHotspot(x, y);
    if (hs) {
      isDragging = false;
      if (settings.animations && settings.transitionSpeed > 0) {
        animateHotspotTransition(hs);
      } else {
        isTransitioning = true;
        doCrossfadeTransition(hs.target, hs.returnYaw, hs.returnPitch).then(() => {
          isTransitioning = false;
        });
      }
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
  draggedDistance += Math.abs(dx) + Math.abs(dy);

  if (!isDragging) return;

  const sens = 0.005 * (fov / 75) * settings.mouseSensitivity;
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

  const duration = settings.transitionSpeed || 2500;
  const climb = hs.stairs;
  const descend = hs.descend;
  let climbTextEl = null;
  if (hs.climbText) {
    climbTextEl = document.createElement('div');
    climbTextEl.textContent = getHSLabel(hs.climbText);
    climbTextEl.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:200;color:#fff;font:bold 32px -apple-system,sans-serif;text-shadow:0 0 20px rgba(0,0,0,0.8);pointer-events:none;opacity:0;transition:opacity 0.5s';
    document.body.appendChild(climbTextEl);
    requestAnimationFrame(() => { climbTextEl.style.opacity = '1'; });
  }

  const startTime = performance.now();

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);

    const stepPitch = (climb ? 1 : descend ? -1 : 0) * 0.025 * Math.sin(t * Math.PI * 10 + 1.2) * Math.min(t * 4, 1);
    const lean = climb ? t * 0.08 : descend ? -t * 0.08 : 0;
    const bob = climb || descend ? 0 : Math.sin(t * Math.PI * 7) * 0.012 * Math.min(t * 4, 1);

    if (crossfadeStarted) {
      yaw = hs.returnYaw;
      pitch = (hs.returnPitch || 0) + lean + stepPitch + bob;
      const postT = Math.min((t - 0.65) / 0.35, 1);
      fov = 120 + (75 - 120) * Math.pow(postT, 1.5);
    } else {
      yaw = startYaw + deltaYaw * (1 - Math.pow(1 - t, 2));
      pitch = startPitch + (targetHsPitch - startPitch) * t + lean + stepPitch + bob;
      fov = startFov + (55 - startFov) * Math.pow(t / 0.65, 1.5);
      if (t >= 0.65) {
        crossfadeStarted = true;
        doCrossfadeTransition(hs.target, hs.returnYaw, hs.returnPitch);
      }
    }
    targetYaw = yaw;
    targetPitch = pitch;
    targetFov = fov;

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      if (climbTextEl) {
        climbTextEl.style.opacity = '0';
        setTimeout(() => climbTextEl.remove(), 500);
      }
      isTransitioning = false;
    }
  }
  requestAnimationFrame(step);
}

async function doCrossfadeTransition(targetId, returnYaw, returnPitch) {
  const s = scenes[targetId];
  if (!s) { isTransitioning = false; return; }

  const imgUrl = aiMode && s.variants[1] ? s.variants[1].image : s.variants[0].image;

  try {
    const tex = await loadTexture(imgUrl);

    const mat2 = new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: tex, transparent: true, opacity: 0 });
    const sphere2 = new THREE.Mesh(sphereGeo, mat2);
    scene.add(sphere2);

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

    sphere.material.transparent = true;
    const cfStart = performance.now();
    const cfDur = 500;
    await new Promise(resolve => {
      function cfStep(now) {
        const t = Math.min((now - cfStart) / cfDur, 1);
        sphere.material.opacity = 1 - t;
        sphere2.material.opacity = t;
        if (t < 1) { requestAnimationFrame(cfStep); return; }
        scene.remove(sphere);
        sphere.material.dispose();
        sphere2.material.transparent = false;
        sphere2.material.opacity = 1;
        sphere = sphere2;
        resolve();
      }
      requestAnimationFrame(cfStep);
    });
  } catch (e) {
    console.error(e);
  }
}

/* ============================================================
   SIDEBAR NAVIGATION
   ============================================================ */
async function navigateTo(id, variantIdx) {
  if (id === currentSceneId && variantIdx === currentVariantIdx) return;
  if (isTransitioning) return;
  isTransitioning = true;

  const s = scenes[id];
  if (!s) { isTransitioning = false; return; }

  const imgUrl = s.variants[variantIdx].image;

  try {
    const tex = await loadTexture(imgUrl);

    const mat2 = new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: tex, transparent: true, opacity: 0 });
    const sphere2 = new THREE.Mesh(sphereGeo, mat2);
    scene.add(sphere2);

    const h = s.hotspots[0];
    if (h) {
      yaw = h.yaw + Math.PI;
      pitch = h.pitch || 0;
      if (yaw > Math.PI * 2) yaw -= Math.PI * 2;
      targetYaw = yaw;
      targetPitch = pitch;
    }

    currentSceneId = id;
    currentVariantIdx = variantIdx;
    updateUI();
    buildHotspots();
    buildSidebar();

    sphere.material.transparent = true;
    const cfStart = performance.now();
    const cfDur = 500;
    function step(now) {
      const t = Math.min((now - cfStart) / cfDur, 1);
      sphere.material.opacity = 1 - t;
      sphere2.material.opacity = t;
      if (t < 1) { requestAnimationFrame(step); return; }
      scene.remove(sphere);
      sphere.material.dispose();
      sphere2.material.transparent = false;
      sphere2.material.opacity = 1;
      sphere = sphere2;
      fov = 120;
      targetFov = 120;
      const zStart = performance.now();
      function zoomStep(now2) {
        const zt = Math.min((now2 - zStart) / 500, 1);
        fov = 120 + (75 - 120) * (1 - Math.pow(1 - zt, 3));
        targetFov = fov;
        if (zt < 1) { requestAnimationFrame(zoomStep); return; }
        isTransitioning = false;
      }
      requestAnimationFrame(zoomStep);
    }
    requestAnimationFrame(step);
  } catch (e) {
    console.error(e);
    isTransitioning = false;
  }
}

/* ============================================================
   UI
   ============================================================ */
const sceneNameEl = document.getElementById('scene-name');
const variantsEl = document.getElementById('variants');

function updateUI() {
  const s = scenes[currentSceneId];
  if (!s) return;
  sceneNameEl.textContent = getSceneName(currentSceneId);

  variantsEl.innerHTML = '';
  if (s.variants.length > 1) {
    for (let i = 0; i < s.variants.length; i++) {
      const btn = document.createElement('button');
      btn.textContent = getVariantLabel(s.variants[i].label);
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
  for (const group of sidebarGroups) {
    if (group.label) {
      const header = document.createElement('div');
      header.style.cssText = 'padding:8px 16px 4px;font-size:0.72rem;color:#888;text-transform:uppercase;letter-spacing:0.5px;';
      header.textContent = getSidebarGroupLabel(group.label);
      sidebarList.appendChild(header);
    }
    for (const id of group.scenes) {
      const s = scenes[id];
      if (!s) continue;
      const item = document.createElement('div');
      item.className = 'sidebar-item' + (id === currentSceneId ? ' active' : '');
      if (group.label) item.style.paddingLeft = '28px';
      const dot = document.createElement('span');
      dot.className = 'dot';
      item.appendChild(dot);
      const label = document.createTextNode(getSceneName(id));
      item.appendChild(label);
      item.addEventListener('click', () => {
        closeSidebar();
        const vi = aiMode && s.variants[1] ? 1 : 0;
        navigateTo(id, vi);
      });
      sidebarList.appendChild(item);
    }
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
   SETTINGS PANEL
   ============================================================ */
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const sidebarTitle = document.getElementById('sidebar-title');
settingsBtn.title = t('settings_title');
let settingsPanelBuilt = false;

function rebuildHotspots() {
  buildHotspots();
}

function applySettings() {
  rebuildHotspots();
}

function rebuildLanguageUI() {
  settingsPanelBuilt = false;
  settingsPanel.innerHTML = '';
  buildSettingsPanel();
  if (!sidebarList.classList.contains('hidden')) {
    buildSidebar();
  } else {
    sidebarTitle.textContent = t('settings_title');
  }
  settingsBtn.title = t('settings_title');
  updateUI();
  buildHotspots();
}

const STYLE_NAMES = ['Круги', 'Точка', 'Квадрат', 'Ромб'];
const STYLE_NAMES_EN = ['Circles', 'Dot', 'Square', 'Diamond'];

function buildSettingsPanel() {
  if (settingsPanelBuilt) return;
  settingsPanelBuilt = true;

  const back = document.createElement('div');
  back.id = 'settings-back';
  back.textContent = t('back');
  back.addEventListener('click', showSceneList);
  settingsPanel.appendChild(back);

  function addGroup(label, content) {
    const g = document.createElement('div');
    g.className = 'setting-group';
    const l = document.createElement('label');
    l.className = 'setting-label';
    l.textContent = label;
    g.appendChild(l);
    if (typeof content === 'function') content(g);
    else g.appendChild(content);
    settingsPanel.appendChild(g);
  }

  // 1. Hotspot style
  addGroup(t('hotspot_style'), (g) => {
    const div = document.createElement('div');
    div.className = 'setting-style-options';
    STYLE_NAMES.forEach((name, i) => {
      const btn = document.createElement('div');
      btn.className = 'setting-style-btn' + (i === settings.hotspotStyle ? ' active' : '');
      btn.textContent = settings.language === 'en' ? STYLE_NAMES_EN[i] : name;
      btn.addEventListener('click', () => {
        settings.hotspotStyle = i;
        saveSettings();
        div.querySelectorAll('.setting-style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applySettings();
      });
      div.appendChild(btn);
    });
    g.appendChild(div);
  });

  // 2. Text size
  addGroup(t('text_size'), (g) => {
    const input = document.createElement('input');
    input.type = 'range';
    input.min = 24;
    input.max = 60;
    input.value = settings.textSize;
    const val = document.createElement('span');
    val.style.cssText = 'color:#aaa;font-size:0.72rem;margin-left:6px';
    val.textContent = settings.textSize + t('px');
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center';
    wrap.appendChild(input);
    wrap.appendChild(val);
    g.appendChild(wrap);
    input.addEventListener('input', () => {
      settings.textSize = parseInt(input.value);
      val.textContent = settings.textSize + t('px');
      saveSettings();
      applySettings();
    });
  });

  // 3. Text color
  addGroup(t('text_color'), (g) => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = settings.textColor;
    g.appendChild(input);
    input.addEventListener('input', () => {
      settings.textColor = input.value;
      saveSettings();
      applySettings();
    });
  });

  // 4. Marker color
  addGroup(t('marker_color'), (g) => {
    const input = document.createElement('input');
    input.type = 'color';
    input.value = settings.markerColor;
    g.appendChild(input);
    input.addEventListener('input', () => {
      settings.markerColor = input.value;
      saveSettings();
      applySettings();
    });
  });

  // 5. Mouse sensitivity
  addGroup(t('mouse_sensitivity'), (g) => {
    const input = document.createElement('input');
    input.type = 'range';
    input.min = 0.25;
    input.max = 3;
    input.step = 0.25;
    input.value = settings.mouseSensitivity;
    const val = document.createElement('span');
    val.style.cssText = 'color:#aaa;font-size:0.72rem;margin-left:6px';
    val.textContent = settings.mouseSensitivity.toFixed(2) + 'x';
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center';
    wrap.appendChild(input);
    wrap.appendChild(val);
    g.appendChild(wrap);
    input.addEventListener('input', () => {
      settings.mouseSensitivity = parseFloat(input.value);
      val.textContent = settings.mouseSensitivity.toFixed(2) + 'x';
      saveSettings();
    });
  });

  // 7. Animations toggle
  addGroup(t('animations'), (g) => {
    const wrap = document.createElement('div');
    wrap.className = 'setting-toggle';
    const l = document.createElement('span');
    l.className = 'setting-toggle-label';
    l.textContent = settings.animations ? t('on') : t('off');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = settings.animations;
    wrap.appendChild(l);
    wrap.appendChild(input);
    g.appendChild(wrap);
    input.addEventListener('change', () => {
      settings.animations = input.checked;
      l.textContent = settings.animations ? t('on') : t('off');
      saveSettings();
    });
  });

  // 8. Transition speed (slider)
  addGroup(t('transition_speed'), (g) => {
    const input = document.createElement('input');
    input.type = 'range';
    input.min = 500;
    input.max = 3000;
    input.step = 100;
    input.value = settings.transitionSpeed;
    const val = document.createElement('span');
    val.style.cssText = 'color:#aaa;font-size:0.72rem;margin-left:6px';
    val.textContent = (settings.transitionSpeed / 1000).toFixed(1) + t('s');
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;align-items:center';
    wrap.appendChild(input);
    wrap.appendChild(val);
    g.appendChild(wrap);
    input.addEventListener('input', () => {
      settings.transitionSpeed = parseInt(input.value);
      val.textContent = (settings.transitionSpeed / 1000).toFixed(1) + t('s');
      saveSettings();
    });
  });

  // 9. Language selector
  addGroup(t('language'), (g) => {
    const div = document.createElement('div');
    div.className = 'setting-style-options';
    ['RU', 'EN'].forEach((code, i) => {
      const btn = document.createElement('div');
      const lang = i === 0 ? 'ru' : 'en';
      btn.className = 'setting-style-btn' + (settings.language === lang ? ' active' : '');
      btn.textContent = code;
      btn.addEventListener('click', () => {
        if (settings.language === lang) return;
        settings.language = lang;
        saveSettings();
        div.querySelectorAll('.setting-style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        rebuildLanguageUI();
      });
      div.appendChild(btn);
    });
    g.appendChild(div);
  });
}

function showSettings() {
  buildSettingsPanel();
  sidebarList.classList.add('hidden');
  settingsPanel.classList.remove('hidden');
  sidebarTitle.textContent = t('settings_title');
}

function showSceneList() {
  sidebarList.classList.remove('hidden');
  settingsPanel.classList.add('hidden');
  sidebarTitle.textContent = t('rooms_title');
}

settingsBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (sidebarList.classList.contains('hidden')) {
    showSceneList();
  } else {
    showSettings();
  }
});

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
    if (debugVisible) showDebug(t('debug_on'));
    return;
  }

  // V (англ.) / В (рус.) — скопировать yaw,pitch в буфер
  if (code === 'KeyV' || code === 'KeyB') {
    const yawDeg = yaw * 180 / Math.PI;
    const pitchDeg = pitch * 180 / Math.PI;
    const str = yawDeg.toFixed(1) + ',' + pitchDeg.toFixed(1);
    navigator.clipboard.writeText(str).catch(() => {});
    showDebug(t('copied') + str);
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
  if (loadingRotate) targetYaw += 0.002;

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
