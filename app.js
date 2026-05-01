import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const EARTH_RADIUS = 2.42;
const TEXTURE_BASE = "https://threejs.org/examples/textures/planets/";
const TEXTURES = {
  earth: `${TEXTURE_BASE}earth_atmos_2048.jpg`,
  bump: `${TEXTURE_BASE}earth_normal_2048.jpg`,
  specular: `${TEXTURE_BASE}earth_specular_2048.jpg`,
  clouds: `${TEXTURE_BASE}earth_clouds_1024.png`,
  lights: `${TEXTURE_BASE}earth_lights_2048.png`,
};

const DEFAULT_STATION = {
  name: "上海",
  region: "上海市, 中国",
  lat: 31.2304,
  lon: 121.4737,
  source: "内置城市库",
  confidence: 100,
  timezone: "Asia/Shanghai",
};

const WEATHER_CODE = {
  0: ["晴朗", "sun"],
  1: ["少云", "cloud-sun"],
  2: ["多云间晴", "cloud-sun"],
  3: ["阴云", "cloud"],
  45: ["雾", "cloud-fog"],
  48: ["霜雾", "cloud-fog"],
  51: ["小毛毛雨", "cloud-drizzle"],
  53: ["毛毛雨", "cloud-drizzle"],
  55: ["强毛毛雨", "cloud-drizzle"],
  56: ["冻毛毛雨", "cloud-snow"],
  57: ["强冻毛毛雨", "cloud-snow"],
  61: ["小雨", "cloud-rain"],
  63: ["中雨", "cloud-rain"],
  65: ["大雨", "cloud-rain"],
  66: ["冻雨", "cloud-snow"],
  67: ["强冻雨", "cloud-snow"],
  71: ["小雪", "cloud-snow"],
  73: ["中雪", "cloud-snow"],
  75: ["大雪", "cloud-snow"],
  77: ["雪粒", "cloud-snow"],
  80: ["短时小雨", "cloud-rain"],
  81: ["短时阵雨", "cloud-rain"],
  82: ["强阵雨", "cloud-lightning"],
  85: ["小阵雪", "cloud-snow"],
  86: ["强阵雪", "cloud-snow"],
  95: ["雷暴", "cloud-lightning"],
  96: ["雷暴伴冰雹", "cloud-hail"],
  99: ["强雷暴伴冰雹", "cloud-hail"],
};

const CITY_FIXTURES = [
  ["上海", "上海市, 中国", 31.2304, 121.4737, ["上海市", "中国上海"]],
  ["南京", "江苏省南京市, 中国", 32.0438, 118.7789, ["南京市", "江苏南京", "中国南京", "中国江苏南京", "nanjing"]],
  ["北京", "北京市, 中国", 39.9042, 116.4074, ["北京市", "中国北京", "beijing"]],
  ["广州", "广东省广州市, 中国", 23.1291, 113.2644, ["广州市", "广东广州", "guangzhou"]],
  ["深圳", "广东省深圳市, 中国", 22.5431, 114.0579, ["深圳市", "广东深圳", "shenzhen"]],
  ["杭州", "浙江省杭州市, 中国", 30.2741, 120.1551, ["杭州市", "浙江杭州", "hangzhou"]],
  ["苏州", "江苏省苏州市, 中国", 31.2989, 120.5853, ["苏州市", "江苏苏州", "suzhou"]],
  ["成都", "四川省成都市, 中国", 30.5728, 104.0668, ["成都市", "四川成都", "chengdu"]],
  ["重庆", "重庆市, 中国", 29.563, 106.5516, ["重庆市", "chongqing"]],
  ["武汉", "湖北省武汉市, 中国", 30.5928, 114.3055, ["武汉市", "湖北武汉", "wuhan"]],
  ["西安", "陕西省西安市, 中国", 34.3416, 108.9398, ["西安市", "陕西西安", "xian", "xi an"]],
  ["天津", "天津市, 中国", 39.3434, 117.3616, ["天津市", "tianjin"]],
  ["青岛", "山东省青岛市, 中国", 36.0671, 120.3826, ["青岛市", "山东青岛", "qingdao"]],
  ["厦门", "福建省厦门市, 中国", 24.4798, 118.0894, ["厦门市", "福建厦门", "xiamen"]],
  ["长沙", "湖南省长沙市, 中国", 28.2282, 112.9388, ["长沙市", "湖南长沙", "changsha"]],
  ["郑州", "河南省郑州市, 中国", 34.7466, 113.6254, ["郑州市", "河南郑州", "zhengzhou"]],
  ["合肥", "安徽省合肥市, 中国", 31.8206, 117.2272, ["合肥市", "安徽合肥", "hefei"]],
  ["福州", "福建省福州市, 中国", 26.0745, 119.2965, ["福州市", "福建福州", "fuzhou"]],
  ["昆明", "云南省昆明市, 中国", 25.0389, 102.7183, ["昆明市", "云南昆明", "kunming"]],
  ["贵阳", "贵州省贵阳市, 中国", 26.647, 106.6302, ["贵阳市", "贵州贵阳", "guiyang"]],
  ["南宁", "广西壮族自治区南宁市, 中国", 22.817, 108.3669, ["南宁市", "广西南宁", "nanning"]],
  ["海口", "海南省海口市, 中国", 20.044, 110.1999, ["海口市", "海南海口", "haikou"]],
  ["三亚", "海南省三亚市, 中国", 18.2528, 109.5119, ["三亚市", "海南三亚", "sanya"]],
  ["宁波", "浙江省宁波市, 中国", 29.8683, 121.544, ["宁波市", "浙江宁波", "ningbo"]],
  ["无锡", "江苏省无锡市, 中国", 31.4912, 120.3119, ["无锡市", "江苏无锡", "wuxi"]],
  ["济南", "山东省济南市, 中国", 36.6512, 117.1201, ["济南市", "山东济南", "jinan"]],
  ["大连", "辽宁省大连市, 中国", 38.914, 121.6147, ["大连市", "辽宁大连", "dalian"]],
  ["沈阳", "辽宁省沈阳市, 中国", 41.8057, 123.4315, ["沈阳市", "辽宁沈阳", "shenyang"]],
  ["长春", "吉林省长春市, 中国", 43.8171, 125.3235, ["长春市", "吉林长春", "changchun"]],
  ["哈尔滨", "黑龙江省哈尔滨市, 中国", 45.8038, 126.5349, ["哈尔滨市", "黑龙江哈尔滨", "harbin"]],
  ["石家庄", "河北省石家庄市, 中国", 38.0428, 114.5149, ["石家庄市", "河北石家庄", "shijiazhuang"]],
  ["太原", "山西省太原市, 中国", 37.8706, 112.5489, ["太原市", "山西太原", "taiyuan"]],
  ["南昌", "江西省南昌市, 中国", 28.682, 115.8579, ["南昌市", "江西南昌", "nanchang"]],
  ["兰州", "甘肃省兰州市, 中国", 36.0611, 103.8343, ["兰州市", "甘肃兰州", "lanzhou"]],
  ["西宁", "青海省西宁市, 中国", 36.6171, 101.7782, ["西宁市", "青海西宁", "xining"]],
  ["银川", "宁夏回族自治区银川市, 中国", 38.4872, 106.2309, ["银川市", "宁夏银川", "yinchuan"]],
  ["乌鲁木齐", "新疆维吾尔自治区乌鲁木齐市, 中国", 43.8256, 87.6168, ["乌鲁木齐市", "新疆乌鲁木齐", "urumqi"]],
  ["拉萨", "西藏自治区拉萨市, 中国", 29.6502, 91.1322, ["拉萨市", "西藏拉萨", "lhasa"]],
  ["呼和浩特", "内蒙古自治区呼和浩特市, 中国", 40.8426, 111.7492, ["呼和浩特市", "内蒙古呼和浩特", "hohhot"]],
  ["纽约", "New York, United States", 40.7128, -74.006, ["new york", "nyc", "美国纽约"]],
  ["伦敦", "London, United Kingdom", 51.5072, -0.1276, ["london", "英国伦敦"]],
  ["东京", "東京都, 日本", 35.6762, 139.6503, ["tokyo", "日本东京", "東京"]],
  ["悉尼", "Sydney, Australia", -33.8688, 151.2093, ["sydney", "澳大利亚悉尼"]],
  ["巴黎", "Paris, France", 48.8566, 2.3522, ["paris", "法国巴黎"]],
  ["新加坡", "Singapore", 1.3521, 103.8198, ["singapore"]],
].map(([name, region, lat, lon, aliases]) => ({
  name,
  region,
  lat,
  lon,
  aliases,
  source: "内置城市库",
  confidence: 100,
}));

const AQI_LEVELS = [
  [50, "优"],
  [100, "良"],
  [150, "轻度"],
  [200, "中度"],
  [300, "重度"],
  [500, "严重"],
];

const els = {
  canvas: document.querySelector("#earthCanvas"),
  stationName: document.querySelector("#stationName"),
  stationRegion: document.querySelector("#stationRegion"),
  stationCoords: document.querySelector("#stationCoords"),
  sourceBadge: document.querySelector("#sourceBadge"),
  confidenceBadge: document.querySelector("#confidenceBadge"),
  updateBadge: document.querySelector("#updateBadge"),
  temperature: document.querySelector("#temperature"),
  conditionText: document.querySelector("#conditionText"),
  conditionOrb: document.querySelector("#conditionOrb"),
  localTime: document.querySelector("#localTime"),
  timezoneText: document.querySelector("#timezoneText"),
  daylight: document.querySelector("#daylight"),
  feelsLike: document.querySelector("#feelsLike"),
  humidity: document.querySelector("#humidity"),
  windSpeed: document.querySelector("#windSpeed"),
  windGust: document.querySelector("#windGust"),
  pressure: document.querySelector("#pressure"),
  precipitation: document.querySelector("#precipitation"),
  cloudCover: document.querySelector("#cloudCover"),
  visibility: document.querySelector("#visibility"),
  uvIndex: document.querySelector("#uvIndex"),
  aqi: document.querySelector("#aqi"),
  sunrise: document.querySelector("#sunrise"),
  sunset: document.querySelector("#sunset"),
  riskLevel: document.querySelector("#riskLevel"),
  riskFill: document.querySelector("#riskFill"),
  riskNote: document.querySelector("#riskNote"),
  windRiskBar: document.querySelector("#windRiskBar"),
  rainRiskBar: document.querySelector("#rainRiskBar"),
  pressureRiskBar: document.querySelector("#pressureRiskBar"),
  uvRiskBar: document.querySelector("#uvRiskBar"),
  forecastRange: document.querySelector("#forecastRange"),
  forecastChart: document.querySelector("#forecastChart"),
  dailyForecast: document.querySelector("#dailyForecast"),
  dailySummary: document.querySelector("#dailySummary"),
  satelliteStamp: document.querySelector("#satelliteStamp"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  searchResults: document.querySelector("#searchResults"),
  geoButton: document.querySelector("#geoButton"),
  resetViewButton: document.querySelector("#resetViewButton"),
  soundButton: document.querySelector("#soundButton"),
  fullscreenButton: document.querySelector("#fullscreenButton"),
  qualitySlider: document.querySelector("#qualitySlider"),
  satelliteAge: document.querySelector("#satelliteAge"),
  favoriteButton: document.querySelector("#favoriteButton"),
  favoriteList: document.querySelector("#favoriteList"),
  recentList: document.querySelector("#recentList"),
  addCompareButton: document.querySelector("#addCompareButton"),
  compareList: document.querySelector("#compareList"),
  systemStatus: document.querySelector("#systemStatus"),
  refreshCountdown: document.querySelector("#refreshCountdown"),
  refreshButton: document.querySelector("#refreshButton"),
  shareButton: document.querySelector("#shareButton"),
  copyReportButton: document.querySelector("#copyReportButton"),
  toast: document.querySelector("#toast"),
};

const state = {
  station: loadJson("meteora-station-v2", readStationFromUrl() || DEFAULT_STATION),
  units: loadJson("meteora-units", "metric"),
  theme: loadJson("meteora-theme", "glacier"),
  chartMode: "temp",
  forecastHours: 24,
  layers: {
    satellite: true,
    clouds: true,
    wind: true,
    pins: true,
    night: true,
    atmosphere: true,
    rotate: true,
  },
  audioEnabled: localStorage.getItem("meteora-sound") !== "off",
  quality: Number(localStorage.getItem("meteora-quality") || "1.5"),
  satelliteOffset: Number(localStorage.getItem("meteora-satellite-offset") || "0"),
  favorites: loadJson("meteora-favorites-v2", []),
  recent: loadJson("meteora-recent-v2", []),
  compare: loadJson("meteora-compare-v2", []),
  currentWeather: null,
  hourly: [],
  daily: [],
  airQuality: null,
  weatherUnits: {},
  stationTimezone: "auto",
  baseTexture: null,
  satelliteTexture: null,
  aborter: null,
  searchAborter: null,
  cameraTween: null,
  pointerDown: null,
  lastToast: 0,
  refreshEvery: 10 * 60,
  refreshLeft: 10 * 60,
};

const audio = createAudioEngine();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas: els.canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
  powerPreference: "high-performance",
});
const controls = new OrbitControls(camera, renderer.domElement);
const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin("anonymous");

let earthMesh;
let cloudMesh;
let nightMesh;
let atmosphereMesh;
let selectionMarker;
let weatherHalo;
let windGroup;
let pinGroup;
let starField;
let raycaster;
let pointer;
let clock;

boot();

function boot() {
  document.body.dataset.theme = state.theme;
  els.qualitySlider.value = String(state.quality);
  els.satelliteAge.value = String(state.satelliteOffset);

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  setRendererQuality();

  camera.position.copy(latLonToVector(state.station.lat, state.station.lon, 7.2));
  camera.lookAt(0, 0, 0);

  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.minDistance = 4.25;
  controls.maxDistance = 10.8;
  controls.autoRotate = state.layers.rotate;
  controls.autoRotateSpeed = 0.28;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 0.72;

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  clock = new THREE.Clock();

  scene.add(new THREE.AmbientLight(0xffffff, 1.72));
  const sun = new THREE.DirectionalLight(0xffffff, 2.42);
  sun.position.set(5, 3, 4);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xa8f5ff, 1.2);
  rim.position.set(-5, -1, -4);
  scene.add(rim);

  createEarth();
  createAtmosphere();
  createStars();
  createWindField();
  createSelectionMarker();
  createWeatherHalo();
  createPins();
  bindEvents();
  hydrateUi();
  updateStation(state.station, { focus: true, quiet: true, skipRecent: true });
  loadSatelliteTexture(state.satelliteOffset);
  startTimers();
  animate();
  refreshIcons();
}

function createEarth() {
  state.baseTexture = createFallbackEarthTexture();
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS, 160, 96);
  const material = new THREE.MeshPhongMaterial({
    map: state.baseTexture,
    bumpScale: 0.035,
    specular: new THREE.Color(0x386f8d),
    shininess: 18,
  });
  earthMesh = new THREE.Mesh(geometry, material);
  scene.add(earthMesh);

  cloudMesh = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 144, 80),
    new THREE.MeshLambertMaterial({
      map: createFallbackCloudTexture(),
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
    }),
  );
  scene.add(cloudMesh);

  nightMesh = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.004, 144, 80),
    new THREE.MeshBasicMaterial({
      map: createFallbackLightsTexture(),
      color: 0xffd78c,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  scene.add(nightMesh);

  loadTexture(TEXTURES.earth, (texture) => {
    state.baseTexture = texture;
    if (!state.layers.satellite || !state.satelliteTexture) {
      earthMesh.material.map = texture;
      earthMesh.material.needsUpdate = true;
    }
  });
  loadTexture(TEXTURES.bump, (texture) => {
    earthMesh.material.bumpMap = texture;
    earthMesh.material.needsUpdate = true;
  });
  loadTexture(TEXTURES.specular, (texture) => {
    earthMesh.material.specularMap = texture;
    earthMesh.material.needsUpdate = true;
  });
  loadTexture(TEXTURES.clouds, (texture) => {
    cloudMesh.material.map = texture;
    cloudMesh.material.needsUpdate = true;
  });
  loadTexture(TEXTURES.lights, (texture) => {
    nightMesh.material.map = texture;
    nightMesh.material.needsUpdate = true;
  });
}

function createAtmosphere() {
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.06, 128, 80);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      glowColor: { value: new THREE.Color(0x72d8f4) },
      power: { value: 2.65 },
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      uniform float power;
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), power);
        gl_FragColor = vec4(glowColor, max(intensity, 0.0) * 0.52);
      }
    `,
  });
  atmosphereMesh = new THREE.Mesh(geometry, material);
  scene.add(atmosphereMesh);
}

function createStars() {
  const count = 900;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const colorA = new THREE.Color(0xd8fbff);
  const colorB = new THREE.Color(0xffd8c4);
  for (let i = 0; i < count; i += 1) {
    const radius = 26 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2));
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi);
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    const mixed = colorA.clone().lerp(colorB, Math.random() * 0.45);
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  starField = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    }),
  );
  scene.add(starField);
}

function createWindField() {
  windGroup = new THREE.Group();
  const palette = [0x77e7d4, 0x78b4ff, 0xffd56f, 0xff9785];
  for (let i = 0; i < 96; i += 1) {
    const lat = THREE.MathUtils.randFloat(-58, 58);
    const lon = THREE.MathUtils.randFloat(-180, 180);
    const span = THREE.MathUtils.randFloat(16, 44);
    const points = [];
    const curveHeight = THREE.MathUtils.randFloat(0.02, 0.08);
    for (let step = 0; step < 18; step += 1) {
      const t = step / 17;
      const wobble = Math.sin(t * Math.PI) * THREE.MathUtils.randFloat(-4.8, 4.8);
      points.push(latLonToVector(lat + wobble, lon + span * t, EARTH_RADIUS + 0.075 + curveHeight));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: palette[i % palette.length],
      transparent: true,
      opacity: 0.24,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const line = new THREE.Line(geometry, material);
    line.userData = {
      speed: THREE.MathUtils.randFloat(0.03, 0.11) * (i % 2 === 0 ? 1 : -1),
      phase: Math.random() * Math.PI * 2,
    };
    windGroup.add(line);
  }
  scene.add(windGroup);
}

function createSelectionMarker() {
  selectionMarker = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.008, 12, 56),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  selectionMarker.add(ring);
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xffd56f, transparent: true, opacity: 0.98 }),
  );
  core.position.y = 0.048;
  selectionMarker.add(core);
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.36, 14),
    new THREE.MeshBasicMaterial({ color: 0x9be8d5, transparent: true, opacity: 0.8 }),
  );
  stem.position.y = 0.23;
  selectionMarker.add(stem);
  scene.add(selectionMarker);
}

function createWeatherHalo() {
  weatherHalo = new THREE.Mesh(
    new THREE.RingGeometry(0.18, 0.46, 72),
    new THREE.MeshBasicMaterial({
      color: 0x76e5d4,
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  scene.add(weatherHalo);
}

function createPins() {
  pinGroup = new THREE.Group();
  scene.add(pinGroup);
  rebuildPins();
}

function bindEvents() {
  window.addEventListener("resize", onResize);
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".search-box")) hideSearchResults();
  });

  renderer.domElement.addEventListener("pointerdown", (event) => {
    state.pointerDown = { x: event.clientX, y: event.clientY, t: performance.now() };
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    if (!state.pointerDown) return;
    const distance = Math.hypot(event.clientX - state.pointerDown.x, event.clientY - state.pointerDown.y);
    const elapsed = performance.now() - state.pointerDown.t;
    state.pointerDown = null;
    if (distance <= 7 && elapsed < 650) selectFromCanvas(event);
  });

  els.searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = els.searchInput.value.trim();
    if (!query) return;
    await runSearch(query);
  });

  els.searchInput.addEventListener("input", debounce(async () => {
    const query = els.searchInput.value.trim();
    if (query.length < 2) {
      hideSearchResults();
      return;
    }
    const candidates = await previewSearch(query);
    renderSearchResults(candidates);
  }, 420));

  document.querySelectorAll("[data-unit]").forEach((button) => {
    button.addEventListener("click", () => {
      state.units = button.dataset.unit;
      saveJson("meteora-units", state.units);
      hydrateUnitButtons();
      renderAllWeather();
      audio.play("toggle");
    });
  });

  document.querySelectorAll("[data-chart]").forEach((button) => {
    button.addEventListener("click", () => {
      state.chartMode = button.dataset.chart;
      document.querySelectorAll("[data-chart]").forEach((item) => item.classList.toggle("is-active", item === button));
      drawForecast();
      audio.play("toggle");
    });
  });

  document.querySelectorAll("[data-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.forecastHours = Number(button.dataset.range);
      document.querySelectorAll("[data-range]").forEach((item) => item.classList.toggle("is-active", item === button));
      buildHourlyFromWeather();
      drawForecast();
      audio.play("toggle");
    });
  });

  document.querySelectorAll("[data-layer]").forEach((button) => {
    button.addEventListener("click", () => {
      const layer = button.dataset.layer;
      state.layers[layer] = !state.layers[layer];
      button.classList.toggle("is-active", state.layers[layer]);
      applyLayerState(layer);
      audio.play("toggle");
    });
  });

  document.querySelectorAll("[data-theme]").forEach((button) => {
    button.addEventListener("click", () => {
      state.theme = button.dataset.theme;
      saveJson("meteora-theme", state.theme);
      document.body.dataset.theme = state.theme;
      document.querySelectorAll("[data-theme]").forEach((item) => item.classList.toggle("is-active", item === button));
      audio.play("toggle");
    });
  });

  document.querySelectorAll("[data-city]").forEach((button) => {
    button.addEventListener("click", () => {
      updateStation(
        {
          name: button.dataset.city,
          region: `${button.dataset.city}, 预设站点`,
          lat: Number(button.dataset.lat),
          lon: Number(button.dataset.lon),
          source: "预设站点",
          confidence: 100,
        },
        { focus: true },
      );
      audio.play("select");
    });
  });

  document.addEventListener("pointerenter", (event) => {
    const target = event.target;
    if (target && typeof target.closest === "function" && target.closest("button, input, select")) {
      audio.play("hover");
    }
  }, true);

  els.geoButton.addEventListener("click", locateUser);
  els.resetViewButton.addEventListener("click", () => {
    focusCamera(state.station.lat, state.station.lon);
    controls.autoRotate = state.layers.rotate;
    audio.play("reset");
  });
  els.soundButton.addEventListener("click", () => {
    state.audioEnabled = !state.audioEnabled;
    localStorage.setItem("meteora-sound", state.audioEnabled ? "on" : "off");
    updateSoundButton();
    audio.play("toggle", true);
  });
  els.fullscreenButton.addEventListener("click", toggleFullscreen);
  els.qualitySlider.addEventListener("input", () => {
    state.quality = Number(els.qualitySlider.value);
    localStorage.setItem("meteora-quality", String(state.quality));
    setRendererQuality();
  });
  els.satelliteAge.addEventListener("change", () => {
    state.satelliteOffset = Number(els.satelliteAge.value);
    localStorage.setItem("meteora-satellite-offset", String(state.satelliteOffset));
    loadSatelliteTexture(state.satelliteOffset);
    audio.play("toggle");
  });
  els.favoriteButton.addEventListener("click", toggleFavorite);
  els.addCompareButton.addEventListener("click", addCurrentToCompare);
  els.refreshButton.addEventListener("click", () => refreshWeather({ force: true }));
  els.shareButton.addEventListener("click", copyShareLink);
  els.copyReportButton.addEventListener("click", copyWeatherReport);
}

function hydrateUi() {
  hydrateUnitButtons();
  updateSoundButton();
  document.querySelectorAll("[data-theme]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.theme === state.theme);
  });
  document.querySelectorAll("[data-layer]").forEach((button) => {
    button.classList.toggle("is-active", state.layers[button.dataset.layer]);
  });
  renderFavorites();
  renderRecent();
  renderCompare();
}

function hydrateUnitButtons() {
  document.querySelectorAll("[data-unit]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.unit === state.units);
  });
}

async function runSearch(query) {
  hideSearchResults();
  setStatus("校准城市坐标");
  try {
    const result = await geocodeStation(query);
    if (!result) {
      showToast("没有找到可信的城市坐标");
      setStatus("等待新的观测点");
      audio.play("error");
      return;
    }
    updateStation(result, { focus: true });
    els.searchInput.value = "";
    audio.play("select");
  } catch (error) {
    console.warn(error);
    showToast("地理编码服务暂时不可用");
    setStatus("城市定位受限");
    audio.play("error");
  }
}

async function previewSearch(query) {
  if (state.searchAborter) state.searchAborter.abort();
  state.searchAborter = new AbortController();
  const exact = resolveFixture(query);
  const candidates = exact ? [exact] : [];
  try {
    const nominatim = await searchNominatim(query, state.searchAborter.signal);
    candidates.push(...nominatim);
  } catch {
    // Preview is best-effort.
  }
  return dedupeStations(candidates).slice(0, 6);
}

async function geocodeStation(query) {
  const coords = parseCoordinateQuery(query);
  if (coords) {
    return {
      name: "自定义坐标",
      region: "手动输入",
      lat: coords.lat,
      lon: coords.lon,
      source: "坐标解析",
      confidence: 100,
    };
  }

  const fixture = resolveFixture(query);
  if (fixture) return fixture;

  let candidates = [];
  try {
    candidates = candidates.concat(await searchNominatim(query));
  } catch (error) {
    console.warn(error);
  }
  try {
    candidates = candidates.concat(await searchOpenMeteo(query));
  } catch (error) {
    console.warn(error);
  }
  return dedupeStations(candidates).sort((a, b) => b.score - a.score)[0] || null;
}

function resolveFixture(query) {
  const key = cityKey(query);
  const fixture = CITY_FIXTURES.find((city) => {
    const keys = [city.name, city.region, ...(city.aliases || [])].map(cityKey);
    return keys.includes(key);
  });
  if (!fixture) return null;
  return {
    ...fixture,
    score: 999,
    confidence: 100,
  };
}

async function searchNominatim(query, signal) {
  const country = inferCountry(query);
  const variants = buildQueryVariants(query);
  const results = [];
  for (const value of variants) {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", value);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("namedetails", "1");
    url.searchParams.set("dedupe", "1");
    url.searchParams.set("limit", "8");
    url.searchParams.set("accept-language", "zh-CN,en");
    if (country) url.searchParams.set("countrycodes", country);
    const data = await fetchJson(url, { signal, timeout: 9000 });
    if (Array.isArray(data)) {
      results.push(...data.map((item) => mapNominatim(item, query, country)).filter(Boolean));
    }
    if (results.some((item) => item.confidence >= 86)) break;
  }
  return results.sort((a, b) => b.score - a.score);
}

async function searchOpenMeteo(query) {
  const cleaned = cleanQuery(query);
  const variants = Array.from(new Set([cleaned, stripCountryWords(cleaned), query].filter(Boolean)));
  const results = [];
  for (const value of variants) {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", value);
    url.searchParams.set("count", "15");
    url.searchParams.set("language", "zh");
    url.searchParams.set("format", "json");
    const data = await fetchJson(url, { timeout: 8000 });
    if (Array.isArray(data.results)) {
      results.push(...data.results.map((item) => mapOpenMeteo(item, query)).filter(Boolean));
    }
  }
  return results.sort((a, b) => b.score - a.score);
}

function mapNominatim(item, query, country) {
  const lat = safeNumber(item.lat);
  const lon = safeNumber(item.lon);
  if (lat == null || lon == null) return null;
  const address = item.address || {};
  const name = item.name || address.city || address.town || address.county || address.state || "观测点";
  const region = item.display_name || [address.city, address.state, address.country].filter(Boolean).join(", ");
  const typeScore = {
    city: 34,
    town: 28,
    municipality: 28,
    administrative: 25,
    village: 12,
    hamlet: 6,
  }[item.addresstype || item.type] || 10;
  const exact = cityKey(name) === cityKey(query) || cityKey(region).includes(cityKey(query));
  const countryScore = !country || (address.country_code || "").toLowerCase() === country ? 18 : 0;
  const importance = safeNumber(item.importance) || 0;
  const score = typeScore + countryScore + importance * 90 + (exact ? 28 : 0);
  return {
    name,
    region,
    lat,
    lon,
    source: "OpenStreetMap Nominatim",
    confidence: Math.round(clamp(score, 45, 96)),
    score,
    timezone: undefined,
  };
}

function mapOpenMeteo(item, query) {
  const name = item.name || "观测点";
  const region = [item.admin2, item.admin1, item.country].filter(Boolean).join(", ");
  const key = cityKey(query);
  const exact = cityKey(name) === key || cityKey(region).includes(key);
  const cityLike = ["PPLC", "PPLA", "PPLA2", "PPLA3", "PPL"].includes(item.feature_code);
  const score = (exact ? 42 : 0) + (cityLike ? 18 : 5) + (item.country_code ? 8 : 0);
  return {
    name,
    region,
    lat: item.latitude,
    lon: item.longitude,
    source: "Open-Meteo Geocoding",
    confidence: Math.round(clamp(score, 40, 82)),
    score,
    timezone: item.timezone,
  };
}

function updateStation(station, options = {}) {
  state.station = normalizeStation(station);
  saveJson("meteora-station-v2", state.station);
  if (!options.skipRecent) addRecent(state.station);
  updateStationText();
  updateSelectionMarker();
  updateActivePreset();
  rebuildPins();
  updateUrlState();
  if (options.focus) focusCamera(state.station.lat, state.station.lon);
  if (!options.quiet) showToast(`${state.station.name} 已精准定位`);
  refreshWeather({ quiet: options.quiet });
}

async function refreshWeather(options = {}) {
  if (state.aborter) state.aborter.abort();
  const aborter = new AbortController();
  state.aborter = aborter;
  setLoadingWeather();
  setStatus("同步实时气象");
  state.refreshLeft = state.refreshEvery;

  try {
    const [weatherResult, airResult] = await Promise.allSettled([
      fetchWeather(state.station, aborter.signal),
      fetchAirQuality(state.station, aborter.signal),
    ]);
    if (aborter.signal.aborted) return;
    if (weatherResult.status !== "fulfilled") throw weatherResult.reason;

    const weather = weatherResult.value;
    state.currentWeather = weather.current || null;
    state.weatherUnits = weather.current_units || {};
    state.stationTimezone = weather.timezone || state.station.timezone || "auto";
    state.airQuality = airResult.status === "fulfilled" ? airResult.value.current : null;
    buildHourlyFromWeather(weather);
    buildDailyFromWeather(weather);
    renderAllWeather();
    saveJson(cacheKey(state.station), { savedAt: Date.now(), weather, air: state.airQuality });
    setStatus("实时气象已同步");
    if (!options.quiet) audio.play("success");
  } catch (error) {
    if (aborter.signal.aborted) return;
    console.warn(error);
    const cached = loadJson(cacheKey(state.station), null);
    if (cached?.weather) {
      state.currentWeather = cached.weather.current || null;
      state.weatherUnits = cached.weather.current_units || {};
      state.stationTimezone = cached.weather.timezone || state.station.timezone || "auto";
      state.airQuality = cached.air || null;
      buildHourlyFromWeather(cached.weather);
      buildDailyFromWeather(cached.weather);
      renderAllWeather();
      setStatus("显示最近一次可用读数");
      showToast("实时源暂不可达，已显示缓存");
    } else {
      setStatus("实时气象同步失败");
      showToast("无法连接实时气象源");
      audio.play("error");
    }
  }
}

async function fetchWeather(station, signal) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", station.lat.toFixed(5));
  url.searchParams.set("longitude", station.lon.toFixed(5));
  url.searchParams.set("current", [
    "temperature_2m",
    "relative_humidity_2m",
    "apparent_temperature",
    "is_day",
    "precipitation",
    "rain",
    "showers",
    "snowfall",
    "weather_code",
    "cloud_cover",
    "pressure_msl",
    "surface_pressure",
    "wind_speed_10m",
    "wind_direction_10m",
    "wind_gusts_10m",
  ].join(","));
  url.searchParams.set("hourly", [
    "temperature_2m",
    "apparent_temperature",
    "relative_humidity_2m",
    "precipitation_probability",
    "precipitation",
    "pressure_msl",
    "cloud_cover",
    "wind_speed_10m",
    "wind_direction_10m",
    "visibility",
    "uv_index",
    "weather_code",
  ].join(","));
  url.searchParams.set("daily", [
    "weather_code",
    "temperature_2m_max",
    "temperature_2m_min",
    "sunrise",
    "sunset",
    "daylight_duration",
    "uv_index_max",
    "precipitation_sum",
    "precipitation_probability_max",
    "wind_speed_10m_max",
  ].join(","));
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "auto");
  return fetchJson(url, { signal, timeout: 14000 });
}

async function fetchAirQuality(station, signal) {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", station.lat.toFixed(5));
  url.searchParams.set("longitude", station.lon.toFixed(5));
  url.searchParams.set("current", "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone");
  url.searchParams.set("timezone", "auto");
  return fetchJson(url, { signal, timeout: 12000 });
}

function renderAllWeather() {
  updateStationText();
  renderWeather();
  drawForecast();
  renderDaily();
  renderCompare();
}

function renderWeather() {
  const current = state.currentWeather || {};
  const hourlyNow = state.hourly[0] || {};
  const today = state.daily[0] || {};
  const [condition, icon] = WEATHER_CODE[current.weather_code] || ["未知天气", "cloud"];
  const temp = safeNumber(current.temperature_2m);
  const apparent = safeNumber(current.apparent_temperature);
  const humidity = safeNumber(current.relative_humidity_2m);
  const wind = safeNumber(current.wind_speed_10m);
  const gust = safeNumber(current.wind_gusts_10m);
  const pressure = safeNumber(current.pressure_msl ?? current.surface_pressure);
  const precipitation = safeNumber(current.precipitation);
  const cloud = safeNumber(current.cloud_cover);
  const visibility = safeNumber(hourlyNow.visibility);
  const uv = safeNumber(hourlyNow.uv ?? today.uvMax);
  const aqi = safeNumber(state.airQuality?.us_aqi);

  els.temperature.textContent = temp == null ? "--°" : formatTemp(temp);
  els.conditionText.textContent = condition;
  els.feelsLike.textContent = apparent == null ? "--" : formatTemp(apparent);
  els.humidity.textContent = humidity == null ? "--" : `${Math.round(humidity)}%`;
  els.windSpeed.textContent = wind == null ? "--" : formatSpeed(wind);
  els.windGust.textContent = gust == null ? "--" : formatSpeed(gust);
  els.pressure.textContent = pressure == null ? "--" : `${Math.round(pressure)} hPa`;
  els.precipitation.textContent = precipitation == null ? "--" : `${precipitation.toFixed(1)} mm`;
  els.cloudCover.textContent = cloud == null ? "--" : `${Math.round(cloud)}%`;
  els.visibility.textContent = visibility == null ? "--" : formatDistance(visibility / 1000);
  els.uvIndex.textContent = uv == null ? "--" : `${uv.toFixed(1)}`;
  els.aqi.textContent = aqi == null ? "--" : `${Math.round(aqi)} · ${aqiLabel(aqi)}`;
  els.daylight.textContent = current.is_day ? "昼间" : "夜间";
  els.sunrise.textContent = today.sunrise ? formatHour(today.sunrise, state.stationTimezone) : "--";
  els.sunset.textContent = today.sunset ? formatHour(today.sunset, state.stationTimezone) : "--";
  els.updateBadge.textContent = current.time ? `更新 ${formatHour(current.time, state.stationTimezone)}` : "--";
  setLucideIcon(els.conditionOrb, icon);
  updateWeatherMaterials(current, hourlyNow, today);
  updateRisk(current, hourlyNow, today);
}

function buildHourlyFromWeather(weather = null) {
  const data = weather || { hourly: state.rawHourly };
  const hourly = data.hourly || {};
  state.rawHourly = hourly;
  const times = hourly.time || [];
  if (!times.length) {
    state.hourly = [];
    return;
  }
  let start = times.findIndex((time) => new Date(time).getTime() >= Date.now() - 60 * 60 * 1000);
  if (start < 0) start = 0;
  state.hourly = times.slice(start, start + state.forecastHours).map((time, offset) => {
    const index = start + offset;
    return {
      time,
      temp: safeNumber(hourly.temperature_2m?.[index]),
      apparent: safeNumber(hourly.apparent_temperature?.[index]),
      humidity: safeNumber(hourly.relative_humidity_2m?.[index]),
      precipProbability: safeNumber(hourly.precipitation_probability?.[index]),
      precip: safeNumber(hourly.precipitation?.[index]),
      pressure: safeNumber(hourly.pressure_msl?.[index]),
      cloud: safeNumber(hourly.cloud_cover?.[index]),
      wind: safeNumber(hourly.wind_speed_10m?.[index]),
      windDirection: safeNumber(hourly.wind_direction_10m?.[index]),
      visibility: safeNumber(hourly.visibility?.[index]),
      uv: safeNumber(hourly.uv_index?.[index]),
      weatherCode: safeNumber(hourly.weather_code?.[index]),
    };
  });
}

function buildDailyFromWeather(weather) {
  const daily = weather.daily || {};
  const times = daily.time || [];
  state.daily = times.map((time, index) => ({
    time,
    code: safeNumber(daily.weather_code?.[index]),
    max: safeNumber(daily.temperature_2m_max?.[index]),
    min: safeNumber(daily.temperature_2m_min?.[index]),
    sunrise: daily.sunrise?.[index],
    sunset: daily.sunset?.[index],
    daylight: safeNumber(daily.daylight_duration?.[index]),
    uvMax: safeNumber(daily.uv_index_max?.[index]),
    precip: safeNumber(daily.precipitation_sum?.[index]),
    precipProbability: safeNumber(daily.precipitation_probability_max?.[index]),
    windMax: safeNumber(daily.wind_speed_10m_max?.[index]),
  }));
}

function drawForecast() {
  const canvas = els.forecastChart;
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth || 420;
  const height = canvas.clientHeight || 180;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const data = state.hourly.filter((item) => item.time);
  if (data.length < 2) {
    ctx.fillStyle = "rgba(80,97,113,0.72)";
    ctx.font = "13px system-ui";
    ctx.fillText("等待趋势数据", 18, 34);
    return;
  }

  const pad = { left: 38, right: 18, top: 20, bottom: 30 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const metric = chartMetric();
  const values = data.map(metric.value).filter((value) => value != null);
  const minValue = Math.floor(Math.min(...values) - metric.padding);
  const maxValue = Math.ceil(Math.max(...values) + metric.padding);
  const range = Math.max(1, maxValue - minValue);
  const x = (index) => pad.left + (index / (data.length - 1)) * chartW;
  const y = (value) => pad.top + (1 - (value - minValue) / range) * chartH;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(80,97,113,0.14)";
  for (let i = 0; i < 4; i += 1) {
    const gy = pad.top + (i / 3) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, gy);
    ctx.lineTo(width - pad.right, gy);
    ctx.stroke();
  }

  const gradient = ctx.createLinearGradient(pad.left, 0, width - pad.right, 0);
  metric.colors.forEach(([stop, color]) => gradient.addColorStop(stop, color));
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  data.forEach((item, index) => {
    const value = metric.value(item);
    if (value == null) return;
    const px = x(index);
    const py = y(value);
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  const fill = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
  fill.addColorStop(0, metric.fill);
  fill.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = fill;
  ctx.lineTo(width - pad.right, height - pad.bottom);
  ctx.lineTo(pad.left, height - pad.bottom);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(17,24,39,0.78)";
  ctx.font = "12px system-ui";
  ctx.fillText(`${maxValue}${metric.unit}`, 4, pad.top + 4);
  ctx.fillText(`${minValue}${metric.unit}`, 4, height - pad.bottom + 4);
  ctx.fillStyle = "rgba(80,97,113,0.78)";
  const first = data[0]?.time;
  const last = data[data.length - 1]?.time;
  if (first && last) {
    els.forecastRange.textContent = `${formatHour(first, state.stationTimezone)} - ${formatHour(last, state.stationTimezone)}`;
    ctx.fillText(formatHour(first, state.stationTimezone), pad.left, height - 8);
    const lastLabel = formatHour(last, state.stationTimezone);
    ctx.fillText(lastLabel, width - pad.right - ctx.measureText(lastLabel).width, height - 8);
  }
}

function chartMetric() {
  if (state.chartMode === "rain") {
    return {
      value: (item) => item.precipProbability ?? item.precip,
      padding: 6,
      unit: "%",
      fill: "rgba(59,130,246,0.24)",
      colors: [[0, "#3b82f6"], [1, "#12b8c8"]],
    };
  }
  if (state.chartMode === "wind") {
    return {
      value: (item) => speedValue(item.wind),
      padding: 3,
      unit: state.units === "imperial" ? "mph" : "km/h",
      fill: "rgba(31,199,165,0.22)",
      colors: [[0, "#1fc7a5"], [0.6, "#f2b94b"], [1, "#f47b58"]],
    };
  }
  if (state.chartMode === "pressure") {
    return {
      value: (item) => item.pressure,
      padding: 2,
      unit: "hPa",
      fill: "rgba(139,124,246,0.18)",
      colors: [[0, "#8b7cf6"], [1, "#3b82f6"]],
    };
  }
  return {
    value: (item) => tempValue(item.temp),
    padding: 2,
    unit: state.units === "imperial" ? "°F" : "°C",
    fill: "rgba(244,123,88,0.2)",
    colors: [[0, "#12b8c8"], [0.56, "#f2b94b"], [1, "#f47b58"]],
  };
}

function renderDaily() {
  els.dailyForecast.innerHTML = "";
  if (!state.daily.length) {
    els.dailySummary.textContent = "--";
    return;
  }
  const avgRain = state.daily.reduce((sum, item) => sum + (item.precipProbability || 0), 0) / state.daily.length;
  els.dailySummary.textContent = `平均降水概率 ${Math.round(avgRain)}%`;
  state.daily.forEach((day, index) => {
    const [condition, icon] = WEATHER_CODE[day.code] || ["天气", "cloud"];
    const card = document.createElement("article");
    card.className = "daily-card";
    card.innerHTML = `
      <small>${index === 0 ? "今天" : weekday(day.time, state.stationTimezone)}</small>
      <i data-lucide="${icon}" aria-hidden="true"></i>
      <strong>${formatTemp(day.max)} / ${formatTemp(day.min)}</strong>
      <small>${condition}</small>
      <small>雨 ${Math.round(day.precipProbability || 0)}%</small>
    `;
    els.dailyForecast.appendChild(card);
  });
  refreshIcons();
}

function updateRisk(current, hourlyNow, today) {
  const wind = safeNumber(current.wind_speed_10m) || 0;
  const gust = safeNumber(current.wind_gusts_10m) || 0;
  const rain = safeNumber(current.precipitation) || 0;
  const pressure = safeNumber(current.pressure_msl ?? current.surface_pressure) || 1013;
  const uv = safeNumber(hourlyNow.uv ?? today.uvMax) || 0;
  const windScore = clamp(wind * 1.05 + gust * 0.62, 0, 100);
  const rainScore = clamp(rain * 18 + (hourlyNow.precipProbability || 0) * 0.45, 0, 100);
  const pressureScore = clamp(Math.abs(1013 - pressure) * 2.1, 0, 100);
  const uvScore = clamp(uv * 10, 0, 100);
  const score = clamp(windScore * 0.34 + rainScore * 0.3 + pressureScore * 0.2 + uvScore * 0.16, 0, 100);

  let level = "平稳";
  let note = "气象要素处于舒适区间。";
  if (score >= 70) {
    level = "强关注";
    note = "风、降水、气压或 UV 中至少一项明显偏强。";
  } else if (score >= 42) {
    level = "关注";
    note = "局地天气有波动，适合继续观察。";
  }

  els.riskLevel.textContent = level;
  els.riskFill.style.setProperty("--risk-width", `${Math.max(8, score)}%`);
  els.riskNote.textContent = note;
  els.windRiskBar.style.setProperty("--bar-height", `${Math.max(5, windScore)}%`);
  els.rainRiskBar.style.setProperty("--bar-height", `${Math.max(5, rainScore)}%`);
  els.pressureRiskBar.style.setProperty("--bar-height", `${Math.max(5, pressureScore)}%`);
  els.uvRiskBar.style.setProperty("--bar-height", `${Math.max(5, uvScore)}%`);
}

function updateWeatherMaterials(current, hourlyNow, today) {
  const cloud = clamp(safeNumber(current.cloud_cover) ?? 45, 0, 100);
  const rain = clamp(safeNumber(current.precipitation) ?? 0, 0, 8);
  const wind = clamp(safeNumber(current.wind_speed_10m) ?? 0, 0, 95);
  const uv = clamp(safeNumber(hourlyNow.uv ?? today.uvMax) ?? 0, 0, 12);
  const code = Number(current.weather_code ?? 0);
  const stormy = code >= 80 || rain > 2 || wind > 48;
  const day = current.is_day !== 0;
  cloudMesh.material.opacity = state.layers.clouds ? 0.12 + cloud / 235 : 0;
  nightMesh.material.opacity = state.layers.night ? (day ? 0.12 : 0.34) : 0;
  weatherHalo.material.opacity = 0.16 + rain * 0.04 + wind / 400 + uv / 180;
  weatherHalo.material.color.set(stormy ? 0xf47b58 : day ? 0x76e5d4 : 0x8b7cf6);
  atmosphereMesh.material.uniforms.glowColor.value.set(stormy ? 0xff9a82 : day ? 0x72d8f4 : 0x9d96ff);
  windGroup.children.forEach((line) => {
    line.material.opacity = state.layers.wind ? 0.15 + wind / 335 : 0;
  });
}

function updateStationText() {
  els.stationName.textContent = state.station.name;
  els.stationRegion.textContent = state.station.region || "精准观测点";
  els.stationCoords.textContent = formatCoords(state.station.lat, state.station.lon);
  els.sourceBadge.textContent = state.station.source || "Geocoder";
  els.confidenceBadge.textContent = `置信度 ${state.station.confidence || "--"}%`;
  els.timezoneText.textContent = state.stationTimezone && state.stationTimezone !== "auto" ? state.stationTimezone : "自动时区";
  updateLocalTime();
}

function updateLocalTime() {
  els.localTime.textContent = formatClock(new Date(), state.stationTimezone);
}

function setLoadingWeather() {
  els.temperature.textContent = "--°";
  els.conditionText.textContent = "同步中";
  els.updateBadge.textContent = "同步中";
}

function renderSearchResults(candidates) {
  if (!candidates.length) {
    hideSearchResults();
    return;
  }
  els.searchResults.innerHTML = "";
  candidates.forEach((candidate) => {
    const button = document.createElement("button");
    button.className = "result-option";
    button.type = "button";
    button.setAttribute("role", "option");
    button.innerHTML = `
      <span>
        <strong>${escapeHtml(candidate.name)}</strong>
        <small>${escapeHtml(candidate.region || formatCoords(candidate.lat, candidate.lon))}</small>
      </span>
      <small>${Math.round(candidate.confidence || 70)}%</small>
    `;
    button.addEventListener("click", () => {
      hideSearchResults();
      els.searchInput.value = "";
      updateStation(candidate, { focus: true });
      audio.play("select");
    });
    els.searchResults.appendChild(button);
  });
  els.searchResults.classList.add("is-visible");
}

function hideSearchResults() {
  els.searchResults.classList.remove("is-visible");
}

function selectFromCanvas(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObject(earthMesh, false);
  if (!hits.length) return;
  const localPoint = earthMesh.worldToLocal(hits[0].point.clone());
  const coords = vectorToLatLon(localPoint);
  updateStation({
    name: coordinateName(coords.lat, coords.lon),
    region: "地球点选",
    lat: coords.lat,
    lon: coords.lon,
    source: "3D 点选",
    confidence: 100,
  }, { focus: false });
  audio.play("select");
}

function updateSelectionMarker() {
  const normal = latLonToVector(state.station.lat, state.station.lon, 1).normalize();
  selectionMarker.position.copy(normal.clone().multiplyScalar(EARTH_RADIUS * 1.018));
  selectionMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  weatherHalo.position.copy(normal.clone().multiplyScalar(EARTH_RADIUS * 1.026));
  weatherHalo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
}

function focusCamera(lat, lon) {
  const start = camera.position.clone();
  const target = latLonToVector(lat, lon, 7.2);
  state.cameraTween = { start, target, beganAt: performance.now(), duration: 860 };
}

function updateCameraTween() {
  if (!state.cameraTween) return;
  const elapsed = performance.now() - state.cameraTween.beganAt;
  const t = clamp(elapsed / state.cameraTween.duration, 0, 1);
  const eased = 1 - Math.pow(1 - t, 3);
  camera.position.lerpVectors(state.cameraTween.start, state.cameraTween.target, eased);
  camera.lookAt(0, 0, 0);
  if (t >= 1) state.cameraTween = null;
}

function applyLayerState(layer) {
  if (layer === "satellite") {
    if (state.layers.satellite) {
      if (state.satelliteTexture) {
        earthMesh.material.map = state.satelliteTexture;
        earthMesh.material.needsUpdate = true;
      } else {
        loadSatelliteTexture(state.satelliteOffset);
      }
    } else {
      earthMesh.material.map = state.baseTexture;
      earthMesh.material.needsUpdate = true;
    }
  }
  if (layer === "clouds") cloudMesh.visible = state.layers.clouds;
  if (layer === "wind") windGroup.visible = state.layers.wind;
  if (layer === "pins") pinGroup.visible = state.layers.pins;
  if (layer === "night") nightMesh.visible = state.layers.night;
  if (layer === "atmosphere") atmosphereMesh.visible = state.layers.atmosphere;
  if (layer === "rotate") controls.autoRotate = state.layers.rotate;
}

function loadSatelliteTexture(offset = 0) {
  const date = new Date(Date.now() - offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const url = buildGibsWmsUrl(date);
  els.satelliteStamp.textContent = "同步中";
  textureLoader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      state.satelliteTexture = texture;
      if (state.layers.satellite) {
        earthMesh.material.map = texture;
        earthMesh.material.needsUpdate = true;
      }
      els.satelliteStamp.textContent = date;
    },
    undefined,
    () => {
      if (offset < 4) {
        loadSatelliteTexture(offset + 1);
      } else {
        els.satelliteStamp.textContent = "基础图";
        state.layers.satellite = false;
        document.querySelector('[data-layer="satellite"]')?.classList.remove("is-active");
      }
    },
  );
}

function buildGibsWmsUrl(date) {
  const params = new URLSearchParams({
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetMap",
    LAYERS: "VIIRS_SNPP_CorrectedReflectance_TrueColor",
    STYLES: "",
    FORMAT: "image/jpeg",
    SRS: "EPSG:4326",
    BBOX: "-180,-90,180,90",
    WIDTH: "2048",
    HEIGHT: "1024",
    TIME: date,
  });
  return `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?${params}`;
}

function loadTexture(url, onLoad) {
  textureLoader.load(
    url,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      onLoad(texture);
    },
    undefined,
    () => console.warn(`Texture unavailable: ${url}`),
  );
}

function rebuildPins() {
  if (!pinGroup) return;
  pinGroup.clear();
  const stations = dedupeStations([
    state.station,
    ...CITY_FIXTURES.slice(0, 12),
    ...state.favorites,
  ]).slice(0, 28);
  stations.forEach((station) => {
    const pin = createPin(station);
    pinGroup.add(pin);
  });
}

function createPin(station) {
  const group = new THREE.Group();
  const normal = latLonToVector(station.lat, station.lon, 1).normalize();
  group.position.copy(normal.clone().multiplyScalar(EARTH_RADIUS * 1.024));
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  const color = station.name === state.station.name ? 0xffd56f : 0x8eead7;
  const dot = new THREE.Mesh(
    new THREE.SphereGeometry(station.name === state.station.name ? 0.034 : 0.024, 18, 12),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92 }),
  );
  group.add(dot);
  return group;
}

function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;
  updateCameraTween();
  controls.update();
  cloudMesh.rotation.y += delta * 0.018;
  nightMesh.rotation.y += delta * 0.002;
  atmosphereMesh.rotation.y -= delta * 0.004;
  starField.rotation.y -= delta * 0.006;
  selectionMarker.scale.setScalar(1 + Math.sin(elapsed * 3.2) * 0.045);
  weatherHalo.scale.setScalar(1 + Math.sin(elapsed * 2.2) * 0.09);
  weatherHalo.rotation.z += delta * 0.45;
  windGroup.children.forEach((line) => {
    line.rotation.y += delta * line.userData.speed;
    line.rotation.z = Math.sin(elapsed * 0.32 + line.userData.phase) * 0.03;
  });
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  setRendererQuality();
  drawForecast();
}

function startTimers() {
  window.setInterval(() => {
    updateLocalTime();
    state.refreshLeft = Math.max(0, state.refreshLeft - 1);
    els.refreshCountdown.textContent = `自动刷新 ${formatDuration(state.refreshLeft)}`;
    if (state.refreshLeft === 0) refreshWeather({ quiet: true });
  }, 1000);
}

function locateUser() {
  if (!navigator.geolocation) {
    showToast("当前浏览器不支持定位");
    return;
  }
  setStatus("等待浏览器定位授权");
  navigator.geolocation.getCurrentPosition(
    (position) => {
      updateStation({
        name: "当前位置",
        region: "浏览器定位",
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        source: "浏览器定位",
        confidence: Math.max(70, Math.round(100 - (position.coords.accuracy || 0) / 100)),
      }, { focus: true });
      audio.play("select");
    },
    () => {
      setStatus("定位未授权");
      showToast("没有取得当前位置权限");
      audio.play("error");
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  );
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
  audio.play("toggle");
}

function toggleFavorite() {
  const key = stationKey(state.station);
  const exists = state.favorites.some((item) => stationKey(item) === key);
  if (exists) {
    state.favorites = state.favorites.filter((item) => stationKey(item) !== key);
    showToast("已取消收藏");
  } else {
    state.favorites.unshift(state.station);
    state.favorites = dedupeStations(state.favorites).slice(0, 12);
    showToast("已加入收藏");
  }
  saveJson("meteora-favorites-v2", state.favorites);
  renderFavorites();
  rebuildPins();
  audio.play("toggle");
}

function addRecent(station) {
  state.recent.unshift(station);
  state.recent = dedupeStations(state.recent).slice(0, 10);
  saveJson("meteora-recent-v2", state.recent);
  renderRecent();
}

function renderFavorites() {
  renderStationList(els.favoriteList, state.favorites, "暂无收藏");
}

function renderRecent() {
  renderStationList(els.recentList, state.recent, "暂无最近站点");
}

function renderStationList(container, stations, emptyText) {
  container.innerHTML = "";
  if (!stations.length) {
    const empty = document.createElement("small");
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }
  stations.slice(0, 6).forEach((station) => {
    const button = document.createElement("button");
    button.type = "button";
    button.innerHTML = `<span>${escapeHtml(station.name)}<small>${escapeHtml(station.region || formatCoords(station.lat, station.lon))}</small></span><i data-lucide="chevron-right" aria-hidden="true"></i>`;
    button.addEventListener("click", () => updateStation(station, { focus: true }));
    container.appendChild(button);
  });
  refreshIcons();
}

function addCurrentToCompare() {
  state.compare.unshift(state.station);
  state.compare = dedupeStations(state.compare).slice(0, 4);
  saveJson("meteora-compare-v2", state.compare);
  renderCompare(true);
  showToast("已加入对比");
  audio.play("select");
}

async function renderCompare(fetchFresh = false) {
  els.compareList.innerHTML = "";
  if (!state.compare.length) {
    const empty = document.createElement("small");
    empty.textContent = "加入站点后可横向比较";
    els.compareList.appendChild(empty);
    return;
  }
  for (const station of state.compare) {
    const card = document.createElement("article");
    card.className = "compare-item";
    card.innerHTML = `
      <div>
        <strong>${escapeHtml(station.name)}</strong>
        <small>${escapeHtml(station.brief || formatCoords(station.lat, station.lon))}</small>
      </div>
      <button type="button" title="移除"><i data-lucide="x" aria-hidden="true"></i></button>
    `;
    card.querySelector("button").addEventListener("click", () => {
      state.compare = state.compare.filter((item) => stationKey(item) !== stationKey(station));
      saveJson("meteora-compare-v2", state.compare);
      renderCompare();
    });
    els.compareList.appendChild(card);
  }
  refreshIcons();
  if (fetchFresh) updateCompareBriefs();
}

async function updateCompareBriefs() {
  const next = [];
  for (const station of state.compare) {
    try {
      const weather = await fetchWeather(station, undefined);
      const temp = weather.current?.temperature_2m;
      const code = weather.current?.weather_code;
      const [condition] = WEATHER_CODE[code] || ["天气"];
      next.push({ ...station, brief: `${formatTemp(temp)} · ${condition}` });
    } catch {
      next.push(station);
    }
  }
  state.compare = next;
  saveJson("meteora-compare-v2", state.compare);
  renderCompare();
}

async function copyShareLink() {
  const url = new URL(window.location.href);
  url.searchParams.set("lat", state.station.lat.toFixed(5));
  url.searchParams.set("lon", state.station.lon.toFixed(5));
  url.searchParams.set("name", state.station.name);
  await copyText(url.toString());
  showToast("分享链接已复制");
  audio.play("success");
}

async function copyWeatherReport() {
  const report = [
    `${state.station.name} · ${state.station.region || ""}`,
    `坐标：${formatCoords(state.station.lat, state.station.lon)}`,
    `天气：${els.temperature.textContent} ${els.conditionText.textContent}`,
    `体感：${els.feelsLike.textContent}，湿度：${els.humidity.textContent}`,
    `风速：${els.windSpeed.textContent}，气压：${els.pressure.textContent}`,
    `AQI：${els.aqi.textContent}，UV：${els.uvIndex.textContent}`,
    `更新：${els.updateBadge.textContent}`,
  ].join("\n");
  await copyText(report);
  showToast("天气报告已复制");
  audio.play("success");
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function setRendererQuality() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, state.quality));
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateSoundButton() {
  els.soundButton.classList.toggle("is-active", state.audioEnabled);
  els.soundButton.innerHTML = `
    <i data-lucide="${state.audioEnabled ? "volume-2" : "volume-x"}" aria-hidden="true"></i>
    <span class="sr-only">音效</span>
  `;
  refreshIcons();
}

function updateActivePreset() {
  document.querySelectorAll("[data-city]").forEach((button) => {
    const lat = Number(button.dataset.lat);
    const lon = Number(button.dataset.lon);
    const active = Math.abs(lat - state.station.lat) < 0.08 && Math.abs(normalizeLon(lon - state.station.lon)) < 0.08;
    button.classList.toggle("is-active", active);
  });
}

function updateUrlState() {
  const url = new URL(window.location.href);
  url.searchParams.set("lat", state.station.lat.toFixed(5));
  url.searchParams.set("lon", state.station.lon.toFixed(5));
  url.searchParams.set("name", state.station.name);
  window.history.replaceState(null, "", url);
}

function setLucideIcon(container, name) {
  container.innerHTML = `<i data-lucide="${name}" aria-hidden="true"></i>`;
  refreshIcons();
}

function setStatus(message) {
  els.systemStatus.textContent = message;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  state.lastToast = Date.now();
  window.setTimeout(() => {
    if (Date.now() - state.lastToast >= 2200) {
      els.toast.classList.remove("is-visible");
    }
  }, 2300);
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons();
}

function createFallbackEarthTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#123e64");
  gradient.addColorStop(0.44, "#1c7c96");
  gradient.addColorStop(1, "#0f2f5b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(128, 196, 128, 0.78)";
  for (let i = 0; i < 28; i += 1) {
    ctx.beginPath();
    ctx.ellipse(Math.random() * canvas.width, Math.random() * canvas.height, 50 + Math.random() * 160, 18 + Math.random() * 80, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createFallbackCloudTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  for (let i = 0; i < 170; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.035 + Math.random() * 0.1})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * canvas.width, Math.random() * canvas.height, 18 + Math.random() * 72, 7 + Math.random() * 28, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createFallbackLightsTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "rgba(255, 214, 135, 0.72)";
  for (let i = 0; i < 460; i += 1) {
    const size = Math.random() * 1.8 + 0.5;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function latLonToVector(lat, lon, radius = EARTH_RADIUS) {
  const latRad = THREE.MathUtils.degToRad(lat);
  const uvLon = THREE.MathUtils.degToRad(lon + 180);
  const cosLat = Math.cos(latRad);
  return new THREE.Vector3(
    -radius * cosLat * Math.cos(uvLon),
    radius * Math.sin(latRad),
    radius * cosLat * Math.sin(uvLon),
  );
}

function vectorToLatLon(vector) {
  const normal = vector.clone().normalize();
  const lat = THREE.MathUtils.radToDeg(Math.asin(normal.y));
  const uvLon = THREE.MathUtils.radToDeg(Math.atan2(normal.z, -normal.x));
  const lon = normalizeLon(uvLon - 180);
  return { lat, lon };
}

function parseCoordinateQuery(query) {
  const cleaned = query.replace(/[，；;]+/g, ",").replace(/[°]/g, "").replace(/\s+/g, " ").trim();
  const parts = cleaned.match(/[+-]?\d+(?:\.\d+)?/g);
  if (!parts || parts.length < 2) return null;
  if (!/[, ]/.test(cleaned)) return null;
  let lat = Number(parts[0]);
  let lon = Number(parts[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  const upper = cleaned.toUpperCase();
  if (upper.includes("S")) lat = -Math.abs(lat);
  if (upper.includes("N")) lat = Math.abs(lat);
  if (upper.includes("W")) lon = -Math.abs(lon);
  if (upper.includes("E")) lon = Math.abs(lon);
  if (Math.abs(lat) > 90 && Math.abs(lon) <= 90) [lat, lon] = [lon, lat];
  if (Math.abs(lat) > 90 || Math.abs(lon) > 540) return null;
  return { lat: clamp(lat, -89.9, 89.9), lon: normalizeLon(lon) };
}

function cityKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/中华人民共和国|中国|china|province|市|省|自治区|特别行政区|地区|县|区/g, "")
    .replace(/[,\s·，。;；'’"“”()（）-]/g, "")
    .trim();
}

function cleanQuery(query) {
  return String(query || "").replace(/\s+/g, " ").replace(/[，；]/g, ",").trim();
}

function stripCountryWords(query) {
  return cleanQuery(query).replace(/中华人民共和国|中国|china/gi, "").trim();
}

function inferCountry(query) {
  const text = String(query || "").toLowerCase();
  if (/中国|中华人民共和国|\bchina\b|\bcn\b/.test(text)) return "cn";
  if (/日本|japan/.test(text)) return "jp";
  if (/美国|usa|united states/.test(text)) return "us";
  if (/英国|united kingdom|uk/.test(text)) return "gb";
  if (/法国|france/.test(text)) return "fr";
  if (/澳大利亚|australia/.test(text)) return "au";
  return "";
}

function buildQueryVariants(query) {
  const cleaned = cleanQuery(query);
  const stripped = stripCountryWords(cleaned);
  const country = inferCountry(query);
  const countryName = country === "cn" ? "中国" : "";
  return Array.from(new Set([
    cleaned,
    countryName && stripped ? `${stripped}, ${countryName}` : "",
    stripped,
  ].filter(Boolean)));
}

async function fetchJson(url, { signal, timeout = 10000 } = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function normalizeStation(station) {
  return {
    name: station.name || "观测点",
    region: station.region || "精准观测点",
    lat: clamp(Number(station.lat), -89.9, 89.9),
    lon: normalizeLon(Number(station.lon)),
    source: station.source || "Geocoder",
    confidence: Math.round(clamp(Number(station.confidence) || 70, 0, 100)),
    timezone: station.timezone,
  };
}

function dedupeStations(stations) {
  const seen = new Set();
  return stations.filter((station) => {
    if (!station || !Number.isFinite(Number(station.lat)) || !Number.isFinite(Number(station.lon))) return false;
    const key = stationKey(station);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function stationKey(station) {
  return `${cityKey(station.name)}:${Number(station.lat).toFixed(2)}:${Number(station.lon).toFixed(2)}`;
}

function cacheKey(station) {
  return `meteora-cache-v2:${Number(station.lat).toFixed(2)},${Number(station.lon).toFixed(2)}`;
}

function readStationFromUrl() {
  const url = new URL(window.location.href);
  const lat = safeNumber(url.searchParams.get("lat"));
  const lon = safeNumber(url.searchParams.get("lon"));
  if (lat == null || lon == null) return null;
  return {
    name: url.searchParams.get("name") || "分享站点",
    region: "分享链接",
    lat,
    lon,
    source: "分享链接",
    confidence: 100,
  };
}

function formatCoords(lat, lon) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}°${ns} · ${Math.abs(lon).toFixed(4)}°${ew}`;
}

function coordinateName(lat, lon) {
  const ns = lat >= 0 ? "北纬" : "南纬";
  const ew = lon >= 0 ? "东经" : "西经";
  return `${ns}${Math.abs(lat).toFixed(1)} · ${ew}${Math.abs(lon).toFixed(1)}`;
}

function formatTemp(value) {
  if (value == null) return "--";
  const v = tempValue(value);
  return `${Math.round(v)}°${state.units === "imperial" ? "F" : "C"}`;
}

function tempValue(value) {
  if (value == null) return null;
  return state.units === "imperial" ? value * 1.8 + 32 : value;
}

function formatSpeed(value) {
  if (value == null) return "--";
  const v = speedValue(value);
  return `${Math.round(v)} ${state.units === "imperial" ? "mph" : "km/h"}`;
}

function speedValue(value) {
  if (value == null) return null;
  return state.units === "imperial" ? value * 0.621371 : value;
}

function formatDistance(valueKm) {
  if (valueKm == null) return "--";
  if (state.units === "imperial") return `${(valueKm * 0.621371).toFixed(1)} mi`;
  return `${valueKm.toFixed(1)} km`;
}

function formatHour(value, timezone = "auto") {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone && timezone !== "auto" ? timezone : undefined,
  }).format(date);
}

function formatClock(value, timezone = "auto") {
  const date = new Date(value);
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: timezone && timezone !== "auto" ? timezone : undefined,
  }).format(date);
}

function weekday(value, timezone = "auto") {
  return new Intl.DateTimeFormat("zh-CN", {
    weekday: "short",
    timeZone: timezone && timezone !== "auto" ? timezone : undefined,
  }).format(new Date(value));
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function aqiLabel(value) {
  const match = AQI_LEVELS.find(([limit]) => value <= limit);
  return match ? match[1] : "严重";
}

function safeNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeLon(lon) {
  let normalized = Number(lon);
  while (normalized > 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createAudioEngine() {
  let ctx;
  let lastHover = 0;
  const getContext = () => {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const playTone = (context, frequency, start, duration, gain, type = "sine") => {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1900, start);
    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + 0.018);
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  };
  const patterns = {
    hover: [659],
    toggle: [523, 784],
    select: [440, 659, 880],
    success: [523, 659, 988],
    reset: [392, 523, 784],
    error: [220, 196],
  };
  return {
    play(name, force = false) {
      if (!force && !state.audioEnabled) return;
      if (name === "hover" && Date.now() - lastHover < 90) return;
      if (name === "hover") lastHover = Date.now();
      try {
        const context = getContext();
        if (!context) return;
        const now = context.currentTime + 0.01;
        const notes = patterns[name] || patterns.select;
        notes.forEach((note, index) => {
          const duration = name === "hover" ? 0.055 : 0.12 + index * 0.012;
          const gain = name === "error" ? 0.035 : name === "hover" ? 0.012 : 0.03;
          playTone(context, note, now + index * 0.055, duration, gain, index % 2 ? "triangle" : "sine");
        });
      } catch (error) {
        console.warn(error);
      }
    },
  };
}

window.MeteoraDebug = {
  geocodeStation,
  parseCoordinateQuery,
  latLonToVector,
  vectorToLatLon,
  cityKey,
  state,
};
