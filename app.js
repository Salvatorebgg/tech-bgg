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
  lat: 31.2304,
  lon: 121.4737,
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

const els = {
  canvas: document.querySelector("#earthCanvas"),
  stationName: document.querySelector("#stationName"),
  stationCoords: document.querySelector("#stationCoords"),
  temperature: document.querySelector("#temperature"),
  conditionText: document.querySelector("#conditionText"),
  feelsLike: document.querySelector("#feelsLike"),
  humidity: document.querySelector("#humidity"),
  windSpeed: document.querySelector("#windSpeed"),
  windGust: document.querySelector("#windGust"),
  pressure: document.querySelector("#pressure"),
  precipitation: document.querySelector("#precipitation"),
  cloudCover: document.querySelector("#cloudCover"),
  daylight: document.querySelector("#daylight"),
  conditionOrb: document.querySelector("#conditionOrb"),
  windRose: document.querySelector("#windRose"),
  forecastRange: document.querySelector("#forecastRange"),
  forecastChart: document.querySelector("#forecastChart"),
  satelliteStamp: document.querySelector("#satelliteStamp"),
  riskLevel: document.querySelector("#riskLevel"),
  riskFill: document.querySelector("#riskFill"),
  riskNote: document.querySelector("#riskNote"),
  updatedAt: document.querySelector("#updatedAt"),
  systemStatus: document.querySelector("#systemStatus"),
  toast: document.querySelector("#toast"),
  searchForm: document.querySelector("#searchForm"),
  searchInput: document.querySelector("#searchInput"),
  soundButton: document.querySelector("#soundButton"),
  resetViewButton: document.querySelector("#resetViewButton"),
};

const state = {
  station: { ...DEFAULT_STATION },
  layers: {
    satellite: true,
    clouds: true,
    wind: true,
    rotate: true,
  },
  audioEnabled: localStorage.getItem("meteora-sound") !== "off",
  forecast: [],
  currentWeather: null,
  aborter: null,
  satelliteTexture: null,
  baseTexture: null,
  cameraTween: null,
  pointerDown: null,
  lastToast: 0,
};
const savedStation = loadSavedStation();
if (savedStation) {
  state.station = savedStation;
}

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
let windGroup;
let weatherHalo;
let starField;
let raycaster;
let pointer;
let clock;

boot();

function boot() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  camera.position.copy(latLonToVector(state.station.lat, state.station.lon, 7.2));
  camera.lookAt(0, 0, 0);

  controls.enableDamping = true;
  controls.dampingFactor = 0.065;
  controls.minDistance = 4.25;
  controls.maxDistance = 10.5;
  controls.autoRotate = state.layers.rotate;
  controls.autoRotateSpeed = 0.28;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 0.72;

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2();
  clock = new THREE.Clock();

  scene.add(new THREE.AmbientLight(0xffffff, 1.7));

  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(5, 3, 4);
  scene.add(sun);

  const rim = new THREE.DirectionalLight(0x96f0ff, 1.2);
  rim.position.set(-5, -1, -4);
  scene.add(rim);

  createEarth();
  createAtmosphere();
  createStars();
  createWindField();
  createSelectionMarker();
  createWeatherHalo();

  bindEvents();
  hydrateUi();
  updateStation(state.station, { focus: true, quiet: true });
  loadSatelliteTexture();
  animate();

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function createEarth() {
  state.baseTexture = createFallbackEarthTexture();
  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 160, 96);
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: state.baseTexture,
    bumpScale: 0.035,
    specular: new THREE.Color(0x3f6f8a),
    shininess: 18,
  });

  earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earthMesh);

  const cloudMaterial = new THREE.MeshLambertMaterial({
    map: createFallbackCloudTexture(),
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  });
  cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 144, 80), cloudMaterial);
  scene.add(cloudMesh);

  nightMesh = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.004, 144, 80),
    new THREE.MeshBasicMaterial({
      map: createFallbackLightsTexture(),
      color: 0xf7d493,
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
  const geometry = new THREE.SphereGeometry(EARTH_RADIUS * 1.055, 128, 80);
  const material = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    uniforms: {
      glowColor: { value: new THREE.Color(0x77d8f4) },
      power: { value: 2.7 },
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
  const colorA = new THREE.Color(0xd7fbff);
  const colorB = new THREE.Color(0xffd9c7);

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
  const palette = [0x7ce5d4, 0x83b8ff, 0xffd37e, 0xff9c8c];

  for (let i = 0; i < 84; i += 1) {
    const lat = THREE.MathUtils.randFloat(-58, 58);
    const lon = THREE.MathUtils.randFloat(-180, 180);
    const span = THREE.MathUtils.randFloat(16, 42);
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
    new THREE.TorusGeometry(0.12, 0.008, 12, 52),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending,
    }),
  );
  ring.rotation.x = Math.PI / 2;
  selectionMarker.add(ring);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 24, 16),
    new THREE.MeshBasicMaterial({
      color: 0xffd37e,
      transparent: true,
      opacity: 0.98,
    }),
  );
  core.position.y = 0.045;
  selectionMarker.add(core);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.34, 14),
    new THREE.MeshBasicMaterial({
      color: 0x9be1cf,
      transparent: true,
      opacity: 0.8,
    }),
  );
  stem.position.y = 0.22;
  selectionMarker.add(stem);
  scene.add(selectionMarker);
}

function createWeatherHalo() {
  const geometry = new THREE.RingGeometry(0.18, 0.44, 72);
  const material = new THREE.MeshBasicMaterial({
    color: 0x7ce5d4,
    transparent: true,
    opacity: 0.34,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  weatherHalo = new THREE.Mesh(geometry, material);
  scene.add(weatherHalo);
}

function bindEvents() {
  window.addEventListener("resize", onResize);

  renderer.domElement.addEventListener("pointerdown", (event) => {
    state.pointerDown = {
      x: event.clientX,
      y: event.clientY,
      t: performance.now(),
    };
  });

  renderer.domElement.addEventListener("pointerup", (event) => {
    if (!state.pointerDown) return;
    const dx = event.clientX - state.pointerDown.x;
    const dy = event.clientY - state.pointerDown.y;
    const distance = Math.hypot(dx, dy);
    const elapsed = performance.now() - state.pointerDown.t;
    state.pointerDown = null;

    if (distance <= 7 && elapsed < 650) {
      selectFromCanvas(event);
    }
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

  document.querySelectorAll("[data-city]").forEach((button) => {
    button.addEventListener("click", () => {
      updateStation(
        {
          name: button.dataset.city,
          lat: Number(button.dataset.lat),
          lon: Number(button.dataset.lon),
        },
        { focus: true },
      );
      audio.play("select");
    });
  });

  document.addEventListener("pointerenter", (event) => {
    const target = event.target;
    if (target && typeof target.closest === "function" && target.closest("button, input")) {
      audio.play("hover");
    }
  }, true);

  els.searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = els.searchInput.value.trim();
    if (!query) return;
    await handleSearch(query);
  });

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
}

function hydrateUi() {
  document.querySelectorAll("[data-layer]").forEach((button) => {
    button.classList.toggle("is-active", state.layers[button.dataset.layer]);
  });
  updateSoundButton();
}

async function handleSearch(query) {
  const coords = parseCoordinateQuery(query);
  if (coords) {
    updateStation({ name: "自定义坐标", ...coords }, { focus: true });
    els.searchInput.value = "";
    audio.play("select");
    return;
  }

  setStatus("检索观测点");
  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", query);
    url.searchParams.set("count", "1");
    url.searchParams.set("language", "zh");
    url.searchParams.set("format", "json");
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Geocoding ${response.status}`);
    const data = await response.json();
    const result = data.results?.[0];
    if (!result) {
      showToast("没有找到匹配的观测点");
      setStatus("等待新的观测点");
      audio.play("error");
      return;
    }
    updateStation(
      {
        name: [result.name, result.admin1, result.country].filter(Boolean).join(" · "),
        lat: result.latitude,
        lon: result.longitude,
      },
      { focus: true },
    );
    els.searchInput.value = "";
    audio.play("select");
  } catch (error) {
    console.warn(error);
    showToast("城市检索暂时不可用");
    setStatus("气象源连接受限");
    audio.play("error");
  }
}

function updateStation(station, options = {}) {
  state.station = {
    name: station.name || "观测点",
    lat: clamp(Number(station.lat), -89.9, 89.9),
    lon: normalizeLon(Number(station.lon)),
  };

  els.stationName.textContent = state.station.name;
  els.stationCoords.textContent = formatCoords(state.station.lat, state.station.lon);
  updateSelectionMarker();
  updateActivePreset();
  saveStation();

  if (options.focus) {
    focusCamera(state.station.lat, state.station.lon);
  }
  if (!options.quiet) {
    showToast(`${state.station.name} 已同步`);
  }
  fetchWeather(state.station);
}

async function fetchWeather(station) {
  if (state.aborter) {
    state.aborter.abort();
  }
  const aborter = new AbortController();
  state.aborter = aborter;

  setLoadingWeather();
  setStatus("同步实时气象");

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", station.lat.toFixed(4));
  url.searchParams.set("longitude", station.lon.toFixed(4));
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
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
      "is_day",
    ].join(","),
  );
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation_probability",
      "precipitation",
      "pressure_msl",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
  );
  url.searchParams.set("forecast_days", "2");
  url.searchParams.set("timezone", "auto");

  try {
    const response = await fetch(url, { signal: aborter.signal });
    if (!response.ok) throw new Error(`Weather ${response.status}`);
    const data = await response.json();
    if (aborter.signal.aborted) return;

    state.currentWeather = data.current;
    state.forecast = buildForecast(data);
    renderWeather(data);
    drawForecast();
    setStatus("实时气象已同步");
    audio.play("success");
    localStorage.setItem(`meteora-cache:${station.lat.toFixed(2)},${station.lon.toFixed(2)}`, JSON.stringify({
      savedAt: Date.now(),
      data,
    }));
  } catch (error) {
    if (aborter.signal.aborted) return;
    console.warn(error);
    const cached = getCachedWeather(station);
    if (cached) {
      state.currentWeather = cached.current;
      state.forecast = buildForecast(cached);
      renderWeather(cached, true);
      drawForecast();
      setStatus("显示最近一次可用读数");
      showToast("实时源暂不可达，已显示缓存读数");
    } else {
      setStatus("实时气象同步失败");
      showToast("无法连接实时气象源");
      audio.play("error");
    }
  }
}

function renderWeather(data, cached = false) {
  const current = data.current || {};
  const units = data.current_units || {};
  const [condition, icon] = WEATHER_CODE[current.weather_code] || ["未知天气", "cloud"];
  const temp = safeNumber(current.temperature_2m);
  const apparent = safeNumber(current.apparent_temperature);
  const humidity = safeNumber(current.relative_humidity_2m);
  const wind = safeNumber(current.wind_speed_10m);
  const gust = safeNumber(current.wind_gusts_10m);
  const pressure = safeNumber(current.pressure_msl ?? current.surface_pressure);
  const precipitation = safeNumber(current.precipitation);
  const cloud = safeNumber(current.cloud_cover);
  const windDirection = safeNumber(current.wind_direction_10m);

  els.temperature.textContent = temp == null ? "--°" : `${Math.round(temp)}°`;
  els.conditionText.textContent = condition;
  els.feelsLike.textContent = apparent == null ? "--" : `${Math.round(apparent)}${units.apparent_temperature || "°C"}`;
  els.humidity.textContent = humidity == null ? "--" : `${Math.round(humidity)}${units.relative_humidity_2m || "%"}`;
  els.windSpeed.textContent = wind == null ? "--" : `${Math.round(wind)} ${units.wind_speed_10m || "km/h"}`;
  els.windGust.textContent = gust == null ? "--" : `${Math.round(gust)} ${units.wind_gusts_10m || "km/h"}`;
  els.pressure.textContent = pressure == null ? "--" : `${Math.round(pressure)} ${units.pressure_msl || "hPa"}`;
  els.precipitation.textContent = precipitation == null ? "--" : `${precipitation.toFixed(1)} ${units.precipitation || "mm"}`;
  els.cloudCover.textContent = cloud == null ? "--" : `${Math.round(cloud)}%`;
  els.daylight.textContent = current.is_day ? "昼" : "夜";
  els.updatedAt.textContent = cached ? "缓存" : formatTime(current.time || new Date());

  setLucideIcon(els.conditionOrb, icon);
  els.windRose.style.setProperty("--wind-angle", `${windDirection ?? 0}deg`);
  updateWeatherMaterials(current);
  updateRisk(current);
}

function buildForecast(data) {
  const hourly = data.hourly || {};
  const times = hourly.time || [];
  if (!times.length) return [];

  const nowIndex = Math.max(
    0,
    times.findIndex((time) => new Date(time).getTime() >= Date.now() - 60 * 60 * 1000),
  );

  return times.slice(nowIndex, nowIndex + 24).map((time, index) => ({
    time,
    temp: safeNumber(hourly.temperature_2m?.[nowIndex + index]),
    precip: safeNumber(hourly.precipitation?.[nowIndex + index]),
    precipProbability: safeNumber(hourly.precipitation_probability?.[nowIndex + index]),
    cloud: safeNumber(hourly.cloud_cover?.[nowIndex + index]),
    wind: safeNumber(hourly.wind_speed_10m?.[nowIndex + index]),
  }));
}

function drawForecast() {
  const canvas = els.forecastChart;
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth || 320;
  const height = canvas.clientHeight || 148;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const data = state.forecast.filter((item) => item.temp != null);
  if (data.length < 2) {
    ctx.fillStyle = "rgba(77,100,116,0.72)";
    ctx.font = "13px system-ui";
    ctx.fillText("等待趋势数据", 18, 34);
    return;
  }

  const pad = { left: 24, right: 16, top: 18, bottom: 28 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const temps = data.map((item) => item.temp);
  const precip = data.map((item) => item.precip ?? 0);
  const minTemp = Math.floor(Math.min(...temps) - 2);
  const maxTemp = Math.ceil(Math.max(...temps) + 2);
  const maxPrecip = Math.max(1, ...precip);

  const x = (index) => pad.left + (index / (data.length - 1)) * chartW;
  const yTemp = (value) => pad.top + (1 - (value - minTemp) / Math.max(1, maxTemp - minTemp)) * chartH;
  const yPrecip = (value) => pad.top + (1 - value / maxPrecip) * chartH;

  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(72,107,126,0.13)";
  for (let i = 0; i < 4; i += 1) {
    const y = pad.top + (i / 3) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
  }

  const precipGradient = ctx.createLinearGradient(0, pad.top, 0, height - pad.bottom);
  precipGradient.addColorStop(0, "rgba(75,142,232,0.32)");
  precipGradient.addColorStop(1, "rgba(75,142,232,0.02)");
  ctx.fillStyle = precipGradient;
  ctx.beginPath();
  ctx.moveTo(pad.left, height - pad.bottom);
  data.forEach((item, index) => {
    ctx.lineTo(x(index), yPrecip(item.precip ?? 0));
  });
  ctx.lineTo(width - pad.right, height - pad.bottom);
  ctx.closePath();
  ctx.fill();

  const tempGradient = ctx.createLinearGradient(pad.left, 0, width - pad.right, 0);
  tempGradient.addColorStop(0, "#34b3a0");
  tempGradient.addColorStop(0.55, "#e7b858");
  tempGradient.addColorStop(1, "#eb7866");
  ctx.strokeStyle = tempGradient;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.beginPath();
  data.forEach((item, index) => {
    const px = x(index);
    const py = yTemp(item.temp);
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.stroke();

  ctx.fillStyle = "rgba(16,34,53,0.76)";
  ctx.font = "12px system-ui";
  ctx.fillText(`${Math.round(maxTemp)}°`, 0, pad.top + 4);
  ctx.fillText(`${Math.round(minTemp)}°`, 0, height - pad.bottom + 4);

  ctx.fillStyle = "rgba(77,100,116,0.78)";
  const first = data[0]?.time;
  const last = data[data.length - 1]?.time;
  if (first && last) {
    els.forecastRange.textContent = `${formatHour(first)} - ${formatHour(last)}`;
    ctx.fillText(formatHour(first), pad.left, height - 8);
    const lastLabel = formatHour(last);
    const lastWidth = ctx.measureText(lastLabel).width;
    ctx.fillText(lastLabel, width - pad.right - lastWidth, height - 8);
  }
}

function updateRisk(current) {
  const wind = safeNumber(current.wind_speed_10m) || 0;
  const gust = safeNumber(current.wind_gusts_10m) || 0;
  const rain = safeNumber(current.precipitation) || 0;
  const pressure = safeNumber(current.pressure_msl ?? current.surface_pressure) || 1013;
  const cloud = safeNumber(current.cloud_cover) || 0;

  const score = clamp(
    wind * 0.42 + gust * 0.34 + rain * 13 + Math.max(0, 1008 - pressure) * 1.4 + cloud * 0.08,
    0,
    100,
  );

  let level = "平稳";
  let note = "气象要素处于舒适区间。";
  if (score >= 68) {
    level = "偏强";
    note = "风、降水或低压信号较明显。";
  } else if (score >= 38) {
    level = "关注";
    note = "局地天气有波动，适合继续观察。";
  }

  els.riskLevel.textContent = level;
  els.riskFill.style.setProperty("--risk-width", `${Math.max(10, score)}%`);
  els.riskNote.textContent = note;
}

function updateWeatherMaterials(current) {
  const cloud = clamp(safeNumber(current.cloud_cover) ?? 45, 0, 100);
  const rain = clamp(safeNumber(current.precipitation) ?? 0, 0, 8);
  const wind = clamp(safeNumber(current.wind_speed_10m) ?? 0, 0, 95);
  const code = Number(current.weather_code ?? 0);
  const stormy = code >= 80 || rain > 2 || wind > 48;
  const day = current.is_day !== 0;

  cloudMesh.material.opacity = state.layers.clouds ? 0.12 + cloud / 240 : 0;
  nightMesh.material.opacity = day ? 0.13 : 0.34;
  weatherHalo.material.opacity = 0.18 + rain * 0.04 + wind / 380;
  weatherHalo.material.color.set(stormy ? 0xeb7866 : day ? 0x7ce5d4 : 0x8f84d8);
  atmosphereMesh.material.uniforms.glowColor.value.set(stormy ? 0xffa78c : day ? 0x77d8f4 : 0x9c97ff);

  windGroup.children.forEach((line) => {
    line.material.opacity = state.layers.wind ? 0.16 + wind / 340 : 0;
  });
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
  updateStation(
    {
      name: coordinateName(coords.lat, coords.lon),
      lat: coords.lat,
      lon: coords.lon,
    },
    { focus: false },
  );
  audio.play("select");
}

function updateSelectionMarker() {
  const normal = latLonToVector(state.station.lat, state.station.lon, 1).normalize();
  const surface = normal.clone().multiplyScalar(EARTH_RADIUS * 1.018);
  selectionMarker.position.copy(surface);
  selectionMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
  weatherHalo.position.copy(normal.clone().multiplyScalar(EARTH_RADIUS * 1.026));
  weatherHalo.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
}

function focusCamera(lat, lon) {
  const target = latLonToVector(lat, lon, 7.2);
  const start = camera.position.clone();
  state.cameraTween = {
    start,
    target,
    beganAt: performance.now(),
    duration: 860,
  };
}

function updateCameraTween() {
  if (!state.cameraTween) return;
  const elapsed = performance.now() - state.cameraTween.beganAt;
  const t = clamp(elapsed / state.cameraTween.duration, 0, 1);
  const eased = 1 - Math.pow(1 - t, 3);
  camera.position.lerpVectors(state.cameraTween.start, state.cameraTween.target, eased);
  camera.lookAt(0, 0, 0);
  if (t >= 1) {
    state.cameraTween = null;
  }
}

function applyLayerState(layer) {
  if (layer === "satellite") {
    if (state.layers.satellite) {
      if (state.satelliteTexture) {
        earthMesh.material.map = state.satelliteTexture;
        earthMesh.material.needsUpdate = true;
      } else {
        loadSatelliteTexture();
      }
    } else {
      earthMesh.material.map = state.baseTexture;
      earthMesh.material.needsUpdate = true;
    }
  }

  if (layer === "clouds") {
    cloudMesh.visible = state.layers.clouds;
  }

  if (layer === "wind") {
    windGroup.visible = state.layers.wind;
  }

  if (layer === "rotate") {
    controls.autoRotate = state.layers.rotate;
  }
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
        if (state.layers.satellite) {
          state.layers.satellite = false;
          const button = document.querySelector('[data-layer="satellite"]');
          button?.classList.remove("is-active");
        }
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
    () => {
      console.warn(`Texture unavailable: ${url}`);
    },
  );
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
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  drawForecast();
}

function parseCoordinateQuery(query) {
  const cleaned = query
    .replace(/[，；;]+/g, ",")
    .replace(/[°]/g, "")
    .replace(/\s+/g, " ")
    .trim();
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

  if (Math.abs(lat) > 90 && Math.abs(lon) <= 90) {
    [lat, lon] = [lon, lat];
  }

  return {
    lat: clamp(lat, -89.9, 89.9),
    lon: normalizeLon(lon),
  };
}

function getCachedWeather(station) {
  try {
    const raw = localStorage.getItem(`meteora-cache:${station.lat.toFixed(2)},${station.lon.toFixed(2)}`);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.savedAt > 6 * 60 * 60 * 1000) return null;
    return cached.data;
  } catch {
    return null;
  }
}

function setLoadingWeather() {
  els.conditionText.textContent = "同步中";
  els.temperature.textContent = "--°";
}

function updateSoundButton() {
  els.soundButton.classList.toggle("is-active", state.audioEnabled);
  els.soundButton.innerHTML = `
    <i data-lucide="${state.audioEnabled ? "volume-2" : "volume-x"}" aria-hidden="true"></i>
    <span class="sr-only">音效</span>
  `;
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function updateActivePreset() {
  document.querySelectorAll("[data-city]").forEach((button) => {
    const lat = Number(button.dataset.lat);
    const lon = Number(button.dataset.lon);
    const active =
      Math.abs(lat - state.station.lat) < 0.08 &&
      Math.abs(normalizeLon(lon - state.station.lon)) < 0.08;
    button.classList.toggle("is-active", active);
  });
}

function setLucideIcon(container, name) {
  container.innerHTML = `<i data-lucide="${name}" aria-hidden="true"></i>`;
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function setStatus(message) {
  els.systemStatus.textContent = message;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  state.lastToast = Date.now();
  window.setTimeout(() => {
    if (Date.now() - state.lastToast >= 2100) {
      els.toast.classList.remove("is-visible");
    }
  }, 2200);
}

function saveStation() {
  localStorage.setItem("meteora-station", JSON.stringify(state.station));
}

function loadSavedStation() {
  try {
    const raw = localStorage.getItem("meteora-station");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Number.isFinite(Number(parsed.lat)) || !Number.isFinite(Number(parsed.lon))) return null;
    return {
      name: parsed.name || DEFAULT_STATION.name,
      lat: clamp(Number(parsed.lat), -89.9, 89.9),
      lon: normalizeLon(Number(parsed.lon)),
    };
  } catch {
    return null;
  }
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

  ctx.fillStyle = "rgba(127, 190, 125, 0.78)";
  for (let i = 0; i < 24; i += 1) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const w = 60 + Math.random() * 150;
    const h = 22 + Math.random() * 84;
    ctx.beginPath();
    ctx.ellipse(x, y, w, h, Math.random() * Math.PI, 0, Math.PI * 2);
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < 160; i += 1) {
    const opacity = 0.035 + Math.random() * 0.1;
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    ctx.beginPath();
    ctx.ellipse(
      Math.random() * canvas.width,
      Math.random() * canvas.height,
      18 + Math.random() * 72,
      7 + Math.random() * 28,
      Math.random() * Math.PI,
      0,
      Math.PI * 2,
    );
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
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 214, 135, 0.72)";
  for (let i = 0; i < 420; i += 1) {
    const size = Math.random() * 1.8 + 0.5;
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function latLonToVector(lat, lon, radius = EARTH_RADIUS) {
  const phi = THREE.MathUtils.degToRad(lat);
  const theta = THREE.MathUtils.degToRad(lon);
  const cosPhi = Math.cos(phi);
  return new THREE.Vector3(
    -radius * cosPhi * Math.cos(theta),
    radius * Math.sin(phi),
    radius * cosPhi * Math.sin(theta),
  );
}

function vectorToLatLon(vector) {
  const normal = vector.clone().normalize();
  const lat = THREE.MathUtils.radToDeg(Math.asin(normal.y));
  const lon = normalizeLon(THREE.MathUtils.radToDeg(Math.atan2(normal.z, -normal.x)));
  return { lat, lon };
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

function formatHour(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeLon(lon) {
  let normalized = lon;
  while (normalized > 180) normalized -= 360;
  while (normalized < -180) normalized += 360;
  return normalized;
}

function createAudioEngine() {
  let ctx;
  let lastHover = 0;

  const getContext = () => {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    return ctx;
  };

  const playTone = (context, frequency, start, duration, gain, type = "sine") => {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, start);
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
