(() => {
  "use strict";

  const WIDTH = 1365;
  const HEIGHT = 768;
  const BOUNDS = { left: 52, right: 1313, top: 118, bottom: 716 };
  const HERO_RADIUS = 34;

  const STAGES = [
    {
      id: "bear",
      icon: "🐻",
      name: "곰의 추격",
      mission: "곰에게 잡히지 말고 숲을 빠져나가세요!",
      description: "뒤쫓아 오는 곰과 거리를 벌리며 단풍 숲을 통과하세요.",
      tip: "곰과 반대 방향으로 크게 움직이고, 가까워지면 순간 날갯짓을 써보세요.",
      background: "assets/01-bear-forest.png",
      duration: 15,
    },
    {
      id: "landslide",
      icon: "🪨",
      name: "산길의 산사태",
      mission: "산비탈에서 떨어지는 낙석을 피하세요!",
      description: "산사태로 돌이 굴러 떨어져요. 바닥의 주황색 경고 원을 보고 안전한 곳으로 이동하세요.",
      tip: "경고 원과 아래쪽 화살표가 나타나면 옆으로 이동하세요. 돌이 떨어지기 전에 피할 시간이 있어요.",
      background: "assets/02-hiker-road.png",
      duration: 16,
    },
    {
      id: "crayfish",
      icon: "🦞",
      name: "계곡의 대왕가재",
      mission: "대왕가재의 집게와 물결을 피하세요!",
      description: "징검다리 사이에서 튀어나오는 붉은 집게와 빠른 물결을 피해 건너가세요.",
      tip: "집게는 대각선, 물결은 가로로 움직여요. 화면 위아래를 넓게 사용하세요.",
      background: "assets/03-crayfish-river.png",
      duration: 17,
    },
    {
      id: "ants",
      icon: "🐜",
      name: "개미 떼의 길",
      mission: "달려드는 개미 떼 사이를 통과하세요!",
      description: "양쪽에서 몰려오는 개미 떼의 빈틈을 찾아 정선 시내로 향하세요.",
      tip: "한 무리를 피한 뒤 바로 반대쪽을 살펴보세요. 개미 떼가 번갈아 나타나요.",
      background: "assets/04-ant-road.png",
      duration: 18,
    },
    {
      id: "bat",
      icon: "🦇",
      name: "동굴의 대왕박쥐",
      mission: "초음파를 피하고 순간 날갯짓으로 대왕박쥐를 공격하세요!",
      description: "수정 동굴을 지키는 대왕박쥐를 물리쳐야 도서관으로 가는 출구가 열려요.",
      tip: "초음파 고리가 커지는 동안 옆으로 피하세요. 방향키로 박쥐를 향해 이동하면서 Space를 누르면 돌진 공격!",
      background: "assets/05-cave-arena.png",
      duration: 0,
    },
    {
      id: "library",
      icon: "📚",
      name: "정선교육도서관 도착",
      mission: "빛나는 도서관 입구까지 날아가세요!",
      description: "마지막이에요. 황금빛으로 반짝이는 입구에 도착하면 모험 성공입니다.",
      tip: "위험은 모두 지나갔어요. 화면 가운데의 빛나는 입구로 이동하세요.",
      background: "assets/06-jeongseon-education-library.png",
      duration: 0,
    },
  ];

  const QA_MODE = new URLSearchParams(window.location.search).has("qa");
  if (QA_MODE) {
    STAGES.forEach((stage) => {
      if (stage.duration > 0) stage.duration = 0.8;
    });
  }

  const ASSET_PATHS = [
    "assets/00-title-map.png",
    ...STAGES.map((stage) => stage.background),
    "assets/sparrow-hero-transparent.png",
    "assets/giant-bat-transparent.png",
  ];

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d", { alpha: false });

  const ui = {
    hud: document.getElementById("hud"),
    stageBadge: document.getElementById("stageBadge"),
    stageName: document.getElementById("stageName"),
    missionText: document.getElementById("missionText"),
    progressBar: document.getElementById("progressBar"),
    progressLabel: document.getElementById("progressLabel"),
    heartDisplay: document.getElementById("heartDisplay"),
    bookmarkDisplay: document.getElementById("bookmarkDisplay"),
    pauseButton: document.getElementById("pauseButton"),
    soundButton: document.getElementById("soundButton"),
    startScreen: document.getElementById("startScreen"),
    startButton: document.getElementById("startButton"),
    howToButton: document.getElementById("howToButton"),
    howToScreen: document.getElementById("howToScreen"),
    closeHowToButton: document.getElementById("closeHowToButton"),
    howToStartButton: document.getElementById("howToStartButton"),
    stageScreen: document.getElementById("stageScreen"),
    stageIcon: document.getElementById("stageIcon"),
    stageKicker: document.getElementById("stageKicker"),
    stageTitle: document.getElementById("stageTitle"),
    stageDescription: document.getElementById("stageDescription"),
    stageTip: document.getElementById("stageTip"),
    continueButton: document.getElementById("continueButton"),
    gameOverScreen: document.getElementById("gameOverScreen"),
    gameOverMessage: document.getElementById("gameOverMessage"),
    retryButton: document.getElementById("retryButton"),
    homeButton: document.getElementById("homeButton"),
    completeScreen: document.getElementById("completeScreen"),
    finalBookmarks: document.getElementById("finalBookmarks"),
    finalTime: document.getElementById("finalTime"),
    playAgainButton: document.getElementById("playAgainButton"),
    completeHomeButton: document.getElementById("completeHomeButton"),
    pauseScreen: document.getElementById("pauseScreen"),
    resumeButton: document.getElementById("resumeButton"),
    pauseHomeButton: document.getElementById("pauseHomeButton"),
    mobileControls: document.getElementById("mobileControls"),
    dashButton: document.getElementById("dashButton"),
    toast: document.getElementById("toast"),
  };

  const images = new Map();
  let heroSprite = null;
  let batSprite = null;
  let audioContext = null;
  const backgroundMusic = new Audio("assets/small-wings-broad-sky.mp3");
  backgroundMusic.loop = true;
  backgroundMusic.preload = "auto";
  backgroundMusic.volume = 0.24;
  let muted = false;
  let toastTimer = 0;
  let transitionTimer = 0;

  const input = { left: false, right: false, up: false, down: false };
  const state = {
    mode: "loading",
    previousMode: null,
    stageIndex: 0,
    hearts: 3,
    bookmarks: 0,
    travelTime: 0,
    stageTime: 0,
    spawnTimer: 0,
    secondarySpawnTimer: 0,
    dashTime: 0,
    dashCooldown: 0,
    dashAttackReady: false,
    dashLockOn: false,
    invincibleTime: 0,
    shakeTime: 0,
    flashTime: 0,
    damageTaken: 0,
    lastTimestamp: 0,
    player: { x: 390, y: 470, vx: 0, vy: 0, facing: 1 },
    bear: { x: 100, y: 490, vx: 0, vy: 0 },
    bat: { x: 1030, y: 360, vx: 0, vy: 0, hp: 5, maxHp: 5, hitCooldown: 0, stunTime: 0 },
    hazards: [],
    particles: [],
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function loadImage(path) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        images.set(path, image);
        resolve(image);
      };
      image.onerror = () => reject(new Error(`이미지를 불러오지 못했습니다: ${path}`));
      image.src = path;
    });
  }

  async function loadAssets() {
    try {
      await Promise.all(ASSET_PATHS.map(loadImage));
      heroSprite = images.get("assets/sparrow-hero-transparent.png");
      batSprite = images.get("assets/giant-bat-transparent.png");
      state.mode = "start";
      ui.startButton.disabled = false;
      ui.startButton.innerHTML = "<span>모험 시작!</span>";
      ui.howToStartButton.disabled = false;
      ui.howToStartButton.textContent = "모험 시작!";
      draw();
    } catch (error) {
      console.error(error);
      state.mode = "error";
      ui.startButton.textContent = "이미지를 확인해 주세요";
      ui.howToStartButton.textContent = "이미지를 확인해 주세요";
      showToast("게임 이미지를 불러오지 못했어요.", 5000);
    }
  }

  function initializeAudio() {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioContext = new AudioContextClass();
    }
    if (audioContext?.state === "suspended") audioContext.resume();
  }

  function playBackgroundMusic(restart = false) {
    if (restart) backgroundMusic.currentTime = 0;
    backgroundMusic.muted = muted;
    const playPromise = backgroundMusic.play();
    playPromise?.catch((error) => {
      console.warn("배경음악을 재생하지 못했습니다.", error);
    });
  }

  function pauseBackgroundMusic(rewind = false) {
    backgroundMusic.pause();
    if (rewind) backgroundMusic.currentTime = 0;
  }

  function playTone(frequency, duration = 0.1, type = "sine", volume = 0.055, delay = 0) {
    if (muted || !audioContext) return;
    const startAt = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.03);
  }

  function playSuccessSound() {
    playTone(523, 0.16, "triangle", 0.05);
    playTone(659, 0.16, "triangle", 0.05, 0.13);
    playTone(784, 0.25, "triangle", 0.06, 0.26);
  }

  function playHitSound() {
    playTone(155, 0.18, "sawtooth", 0.035);
    playTone(110, 0.22, "square", 0.025, 0.08);
  }

  function resetInputs() {
    Object.keys(input).forEach((key) => { input[key] = false; });
    document.querySelectorAll(".move-button").forEach((button) => button.classList.remove("is-pressed"));
  }

  function resetPlayerForStage() {
    const stage = STAGES[state.stageIndex];
    state.player.x = stage.id === "library" ? 155 : stage.id === "bat" ? 240 : 410;
    state.player.y = stage.id === "library" ? 620 : stage.id === "bat" ? 530 : 455;
    state.player.vx = 0;
    state.player.vy = 0;
    state.player.facing = 1;
  }

  function resetStageRuntime() {
    const stage = STAGES[state.stageIndex];
    state.hearts = 3;
    state.stageTime = 0;
    state.spawnTimer = stage.id === "bat" ? 2.2 : 0.7;
    state.secondarySpawnTimer = stage.id === "bat" ? 3.8 : 2.2;
    state.dashTime = 0;
    state.dashCooldown = 0;
    state.dashAttackReady = false;
    state.dashLockOn = false;
    state.invincibleTime = 0;
    state.shakeTime = 0;
    state.flashTime = 0;
    state.hazards.length = 0;
    state.particles.length = 0;
    resetPlayerForStage();
    state.bear.x = 95;
    state.bear.y = 500;
    state.bear.vx = 0;
    state.bear.vy = 0;
    state.bat.x = 1030;
    state.bat.y = 360;
    state.bat.vx = 0;
    state.bat.vy = 0;
    state.bat.hp = state.bat.maxHp;
    state.bat.hitCooldown = 0;
    state.bat.stunTime = 0;
    resetInputs();
    updateHud();
  }

  function beginAdventure() {
    if (state.mode === "loading" || state.mode === "error") return;
    initializeAudio();
    playBackgroundMusic(true);
    clearTimeout(transitionTimer);
    state.stageIndex = 0;
    state.bookmarks = 0;
    state.travelTime = 0;
    state.damageTaken = 0;
    hideAllScreens();
    prepareStage(0);
  }

  function prepareStage(index) {
    state.stageIndex = clamp(index, 0, STAGES.length - 1);
    state.mode = "stage-card";
    resetStageRuntime();
    const stage = STAGES[state.stageIndex];
    ui.stageIcon.textContent = stage.icon;
    ui.stageKicker.textContent = `STAGE ${state.stageIndex + 1} / ${STAGES.length}`;
    ui.stageTitle.textContent = stage.name;
    ui.stageDescription.textContent = stage.description;
    ui.stageTip.textContent = `팁 · ${stage.tip}`;
    ui.continueButton.textContent = state.stageIndex === 0
      ? "도망치기 시작!"
      : state.stageIndex === STAGES.length - 1
        ? "도서관으로!"
        : stage.id === "bat"
          ? "대왕박쥐와 맞서기!"
          : "다음 길로!";
    hideAllScreens();
    ui.stageScreen.classList.remove("is-hidden");
    ui.hud.classList.add("is-hidden");
    ui.mobileControls.classList.add("is-hidden");
    draw();
  }

  function startStage() {
    if (state.mode !== "stage-card") return;
    initializeAudio();
    playBackgroundMusic();
    state.mode = "playing";
    state.lastTimestamp = performance.now();
    ui.stageScreen.classList.add("is-hidden");
    ui.hud.classList.remove("is-hidden");
    ui.mobileControls.classList.remove("is-hidden");
    canvas.focus({ preventScroll: true });
    showToast(STAGES[state.stageIndex].mission, 1900);
    playTone(440, 0.09, "triangle", 0.04);
  }

  function retryStage() {
    hideAllScreens();
    prepareStage(state.stageIndex);
  }

  function completeStage(message = null) {
    if (state.mode !== "playing") return;
    state.mode = "transition";
    state.bookmarks += 1;
    state.hazards.length = 0;
    updateHud(1);
    burst(state.player.x, state.player.y, "#ffd64c", 28);
    playSuccessSound();
    showToast(message || `책갈피 획득!  🔖 ${state.bookmarks}`, 1100);
    transitionTimer = window.setTimeout(() => prepareStage(state.stageIndex + 1), 950);
  }

  function completeGame() {
    if (state.mode !== "playing") return;
    state.mode = "complete";
    state.hazards.length = 0;
    burst(state.player.x, state.player.y, "#ffe063", 60);
    playSuccessSound();
    playTone(1047, 0.42, "triangle", 0.05, 0.42);
    updateHud(1);
    ui.hud.classList.add("is-hidden");
    ui.mobileControls.classList.add("is-hidden");
    ui.completeScreen.classList.remove("is-hidden");
    ui.finalBookmarks.textContent = `🔖 ${state.bookmarks} / ${STAGES.length - 1}`;
    ui.finalTime.textContent = formatTime(state.travelTime);
  }

  function showGameOver(reason) {
    state.mode = "game-over";
    resetInputs();
    ui.mobileControls.classList.add("is-hidden");
    ui.gameOverMessage.textContent = `${reason} 깃털을 모두 잃었어요. 지금 스테이지부터 다시 도전할 수 있어요.`;
    ui.gameOverScreen.classList.remove("is-hidden");
  }

  function goHome() {
    clearTimeout(transitionTimer);
    pauseBackgroundMusic(true);
    resetInputs();
    state.mode = "start";
    state.stageIndex = 0;
    state.bookmarks = 0;
    state.travelTime = 0;
    state.hazards.length = 0;
    state.particles.length = 0;
    hideAllScreens();
    ui.hud.classList.add("is-hidden");
    ui.mobileControls.classList.add("is-hidden");
    ui.startScreen.classList.remove("is-hidden");
    draw();
  }

  function hideAllScreens() {
    [
      ui.startScreen,
      ui.howToScreen,
      ui.stageScreen,
      ui.gameOverScreen,
      ui.completeScreen,
      ui.pauseScreen,
    ].forEach((screen) => screen.classList.add("is-hidden"));
  }

  function togglePause(forceResume = false) {
    if (state.mode === "playing" && !forceResume) {
      state.previousMode = "playing";
      state.mode = "paused";
      pauseBackgroundMusic();
      resetInputs();
      ui.pauseScreen.classList.remove("is-hidden");
      ui.mobileControls.classList.add("is-hidden");
    } else if (state.mode === "paused") {
      state.mode = "playing";
      playBackgroundMusic();
      state.lastTimestamp = performance.now();
      ui.pauseScreen.classList.add("is-hidden");
      ui.mobileControls.classList.remove("is-hidden");
      canvas.focus({ preventScroll: true });
    }
  }

  function toggleSound() {
    muted = !muted;
    backgroundMusic.muted = muted;
    ui.soundButton.textContent = muted ? "🔇" : "🔊";
    ui.soundButton.setAttribute("aria-label", muted ? "소리 켜기" : "소리 끄기");
    if (!muted) {
      initializeAudio();
      if (!["loading", "start", "error", "paused"].includes(state.mode)) {
        playBackgroundMusic();
      }
      playTone(660, 0.08, "triangle", 0.04);
    }
  }

  function dash() {
    if (state.mode !== "playing" || state.dashCooldown > 0) return;
    state.dashTime = 0.72;
    state.dashCooldown = 2.15;
    state.dashAttackReady = true;
    state.invincibleTime = Math.max(state.invincibleTime, 1.1);

    const stage = STAGES[state.stageIndex];
    state.dashLockOn = false;
    if (stage.id === "bat") {
      const toBatX = state.bat.x - state.player.x;
      const toBatY = state.bat.y - state.player.y;
      const batDistance = Math.max(1, Math.hypot(toBatX, toBatY));
      const inputX = Number(input.right) - Number(input.left);
      const inputY = Number(input.down) - Number(input.up);
      const inputLength = Math.hypot(inputX, inputY);
      const aimDot = inputLength === 0
        ? 1
        : (inputX / inputLength) * (toBatX / batDistance) + (inputY / inputLength) * (toBatY / batDistance);
      state.dashLockOn = batDistance <= 900 && aimDot > 0.15;
    }
    burst(state.player.x, state.player.y + 12, "#fff3a4", 13);
    playTone(820, 0.08, "sine", 0.035);
    playTone(1060, 0.1, "sine", 0.025, 0.05);
  }

  function update(delta) {
    if (state.mode !== "playing") return;
    const dt = Math.min(delta, 0.035);
    const stage = STAGES[state.stageIndex];
    state.travelTime += dt;
    state.stageTime += dt;
    state.spawnTimer -= dt;
    state.secondarySpawnTimer -= dt;
    state.dashTime = Math.max(0, state.dashTime - dt);
    if (state.dashTime === 0) {
      state.dashAttackReady = false;
      state.dashLockOn = false;
    }
    state.dashCooldown = Math.max(0, state.dashCooldown - dt);
    state.invincibleTime = Math.max(0, state.invincibleTime - dt);
    state.shakeTime = Math.max(0, state.shakeTime - dt);
    state.flashTime = Math.max(0, state.flashTime - dt);

    updatePlayer(dt);
    updateStage(dt, stage);
    updateHazards(dt);
    updateParticles(dt);
    updateHud();

    if (stage.duration > 0 && state.stageTime >= stage.duration && state.mode === "playing") {
      completeStage();
    }
  }

  function updatePlayer(dt) {
    let horizontal = Number(input.right) - Number(input.left);
    let vertical = Number(input.down) - Number(input.up);
    if (STAGES[state.stageIndex].id === "bat" && state.dashTime > 0 && state.dashLockOn) {
      const toBatX = state.bat.x - state.player.x;
      const toBatY = state.bat.y - state.player.y;
      const length = Math.max(1, Math.hypot(toBatX, toBatY));
      horizontal = toBatX / length;
      vertical = toBatY / length;
    } else if (horizontal !== 0 || vertical !== 0) {
      const length = Math.hypot(horizontal, vertical);
      horizontal /= length;
      vertical /= length;
    }

    const dashMultiplier = state.dashTime > 0 ? 2 : 1;
    const speed = 302 * dashMultiplier;
    const targetVx = horizontal * speed;
    const targetVy = vertical * speed;
    const response = 1 - Math.pow(0.001, dt);
    state.player.vx += (targetVx - state.player.vx) * response;
    state.player.vy += (targetVy - state.player.vy) * response;
    if (horizontal === 0) state.player.vx *= Math.pow(0.0015, dt);
    if (vertical === 0) state.player.vy *= Math.pow(0.0015, dt);
    state.player.x = clamp(state.player.x + state.player.vx * dt, BOUNDS.left + HERO_RADIUS, BOUNDS.right - HERO_RADIUS);
    state.player.y = clamp(state.player.y + state.player.vy * dt, BOUNDS.top + HERO_RADIUS, BOUNDS.bottom - HERO_RADIUS);
    if (Math.abs(state.player.vx) > 20) state.player.facing = Math.sign(state.player.vx);

    if (state.dashTime > 0 && Math.random() < 0.72) {
      state.particles.push({
        x: state.player.x - state.player.facing * 38,
        y: state.player.y + random(-15, 18),
        vx: -state.player.vx * 0.2 + random(-18, 18),
        vy: random(-20, 20),
        life: 0.35,
        maxLife: 0.35,
        color: "#fff0a2",
        size: random(4, 9),
      });
    }
  }

  function updateStage(dt, stage) {
    if (stage.id === "bear") {
      updateBear(dt);
    } else if (stage.id === "landslide") {
      if (state.spawnTimer <= 0) {
        spawnLandslideRock();
        state.spawnTimer = Math.max(0.78, 1.42 - state.stageTime * 0.02);
      }
    } else if (stage.id === "crayfish") {
      if (state.spawnTimer <= 0) {
        spawnClaw();
        state.spawnTimer = Math.max(0.72, 1.28 - state.stageTime * 0.018);
      }
      if (state.secondarySpawnTimer <= 0) {
        spawnWave();
        state.secondarySpawnTimer = random(3.2, 4.0);
      }
    } else if (stage.id === "ants") {
      if (state.spawnTimer <= 0) {
        spawnAntSwarm();
        state.spawnTimer = Math.max(0.76, 1.42 - state.stageTime * 0.018);
      }
      if (state.secondarySpawnTimer <= 0) {
        spawnAntSwarm(true);
        state.secondarySpawnTimer = random(3.0, 4.2);
      }
    } else if (stage.id === "bat") {
      updateBat(dt);
    } else if (stage.id === "library") {
      const goal = { x: 683, y: 512 };
      if (state.stageTime > 0.5 && (distance(state.player, goal) < 82 || QA_MODE)) completeGame();
    }
  }

  function updateBear(dt) {
    const bear = state.bear;
    const dx = state.player.x - bear.x;
    const dy = state.player.y - bear.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const speed = Math.min(190, 102 + state.stageTime * 4.1);
    const targetVx = (dx / length) * speed;
    const targetVy = (dy / length) * speed;
    bear.vx += (targetVx - bear.vx) * Math.min(1, dt * 2.4);
    bear.vy += (targetVy - bear.vy) * Math.min(1, dt * 2.4);
    bear.x += bear.vx * dt;
    bear.y = clamp(bear.y + bear.vy * dt, BOUNDS.top + 48, BOUNDS.bottom - 48);
    if (distance(state.player, bear) < HERO_RADIUS + 48) {
      hurt("곰에게 따라잡혔어요!");
      bear.x = Math.max(65, state.player.x - 400);
      bear.y = clamp(state.player.y + random(-220, 220), BOUNDS.top + 50, BOUNDS.bottom - 50);
      bear.vx = 0;
      bear.vy = 0;
    }
  }

  function spawnLandslideRock() {
    const target = {
      x: clamp(state.player.x + state.player.vx * 0.38 + random(-70, 70), BOUNDS.left + 30, BOUNDS.right - 30),
      y: clamp(state.player.y + state.player.vy * 0.38 + random(-25, 45), BOUNDS.top + 20, BOUNDS.bottom - 20),
    };
    const start = {
      x: clamp(target.x + random(-150, 150), BOUNDS.left + 20, BOUNDS.right - 20),
      y: BOUNDS.top - random(90, 145),
    };
    const angle = Math.atan2(target.y - start.y, target.x - start.x);
    const speed = random(290, 355);
    state.hazards.push({
      type: "landslideRock",
      x: start.x,
      y: start.y,
      targetX: target.x,
      targetY: target.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: random(19, 26),
      rotation: random(0, Math.PI * 2),
      spin: random(-4, 4),
      telegraph: 0.82,
      life: 5,
    });
    playTone(260, 0.05, "triangle", 0.018);
  }

  function spawnClaw() {
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -55 : WIDTH + 55;
    const startY = random(190, 680);
    const targetY = clamp(state.player.y + random(-70, 70), BOUNDS.top, BOUNDS.bottom);
    const speed = random(270, 340);
    state.hazards.push({
      type: "claw",
      x: startX,
      y: startY,
      baseY: startY,
      vx: fromLeft ? speed : -speed,
      vy: (targetY - startY) * 0.65,
      radius: 30,
      phase: random(0, Math.PI * 2),
      life: 5.5,
    });
  }

  function spawnWave() {
    const fromLeft = Math.random() < 0.5;
    state.hazards.push({
      type: "wave",
      x: fromLeft ? -180 : WIDTH + 180,
      y: random(230, 650),
      vx: fromLeft ? 340 : -340,
      vy: 0,
      radius: 34,
      width: 250,
      life: 6,
    });
    showToast("물결이 몰려와요!", 700);
    playTone(190, 0.18, "sine", 0.025);
  }

  function spawnAntSwarm(extra = false) {
    const fromLeft = extra ? state.stageTime % 2 < 1 : Math.random() < 0.5;
    const speed = random(245, 320) * (extra ? 1.08 : 1);
    state.hazards.push({
      type: "swarm",
      x: fromLeft ? -90 : WIDTH + 90,
      y: random(205, 680),
      baseY: random(205, 680),
      vx: fromLeft ? speed : -speed,
      vy: 0,
      radius: extra ? 48 : 42,
      phase: random(0, Math.PI * 2),
      amplitude: random(12, 36),
      life: 6,
      count: extra ? 9 : 7,
    });
  }

  function updateBat(dt) {
    const bat = state.bat;
    bat.hitCooldown = Math.max(0, bat.hitCooldown - dt);
    bat.stunTime = Math.max(0, bat.stunTime - dt);

    if (QA_MODE && state.stageTime > 0.8) {
      bat.hp = 0;
      completeStage("대왕박쥐 격파!  🔖 책갈피 획득");
      return;
    }

    if (bat.stunTime <= 0) {
      const targetX = 985 + Math.sin(state.stageTime * 0.72) * 165;
      const targetY = 360 + Math.sin(state.stageTime * 1.08 + 0.7) * 145;
      const response = 1 - Math.pow(0.035, dt);
      bat.vx += ((targetX - bat.x) * 1.7 - bat.vx) * response;
      bat.vy += ((targetY - bat.y) * 1.7 - bat.vy) * response;
      bat.x = clamp(bat.x + bat.vx * dt, 790, 1195);
      bat.y = clamp(bat.y + bat.vy * dt, 245, 560);
    } else {
      bat.vx *= Math.pow(0.03, dt);
      bat.vy *= Math.pow(0.03, dt);
    }

    if (state.spawnTimer <= 0) {
      spawnSonicFan();
      const enraged = 1 - bat.hp / bat.maxHp;
      state.spawnTimer = Math.max(1.8, 2.4 - enraged * 0.65);
    }
    if (state.secondarySpawnTimer <= 0) {
      spawnCaveRock();
      state.secondarySpawnTimer = random(3.8, 4.8);
    }

    const collisionDistance = distance(state.player, bat);
    const collisionRadius = state.dashTime > 0 ? HERO_RADIUS + 150 : HERO_RADIUS + 92;
    if (collisionDistance < collisionRadius) {
      if (state.dashTime > 0 && state.dashAttackReady && bat.hitCooldown <= 0) {
        damageBat();
      } else if (state.dashTime <= 0 && bat.stunTime <= 0) {
        if (hurt("대왕박쥐의 날개에 부딪혔어요!")) {
          const awayX = state.player.x - bat.x;
          const awayY = state.player.y - bat.y;
          const length = Math.max(1, Math.hypot(awayX, awayY));
          state.player.x = clamp(state.player.x + (awayX / length) * 90, BOUNDS.left + HERO_RADIUS, BOUNDS.right - HERO_RADIUS);
          state.player.y = clamp(state.player.y + (awayY / length) * 70, BOUNDS.top + HERO_RADIUS, BOUNDS.bottom - HERO_RADIUS);
        }
      }
    }
  }

  function damageBat() {
    const bat = state.bat;
    state.dashAttackReady = false;
    state.dashLockOn = false;
    const awayX = state.player.x - bat.x;
    const awayY = state.player.y - bat.y;
    const awayLength = Math.max(1, Math.hypot(awayX, awayY));
    state.player.x = clamp(state.player.x + (awayX / awayLength) * 82, BOUNDS.left + HERO_RADIUS, BOUNDS.right - HERO_RADIUS);
    state.player.y = clamp(state.player.y + (awayY / awayLength) * 62, BOUNDS.top + HERO_RADIUS, BOUNDS.bottom - HERO_RADIUS);
    state.player.vx = (awayX / awayLength) * 260;
    state.player.vy = (awayY / awayLength) * 220;
    bat.hp = Math.max(0, bat.hp - 1);
    bat.hitCooldown = 0.72;
    bat.stunTime = 0.42;
    state.invincibleTime = Math.max(state.invincibleTime, 0.75);
    state.shakeTime = 0.24;
    state.flashTime = 0.08;
    const knockDirection = state.player.x < bat.x ? 1 : -1;
    bat.x = clamp(bat.x + knockDirection * 42, 790, 1195);
    burst(bat.x, bat.y, "#78f2ff", 24);
    playTone(330, 0.09, "square", 0.035);
    playTone(690, 0.16, "triangle", 0.045, 0.06);

    if (bat.hp <= 0) {
      state.hazards.length = 0;
      burst(bat.x, bat.y, "#ffe066", 52);
      completeStage("대왕박쥐 격파!  🔖 책갈피 획득");
    } else {
      showToast(`공격 성공!  대왕박쥐 체력 ${bat.hp} / ${bat.maxHp}`, 900);
    }
  }

  function spawnSonicFan() {
    const bat = state.bat;
    const baseAngle = Math.atan2(state.player.y - bat.y, state.player.x - bat.x);
    const offsets = bat.hp <= 2 ? [-0.34, -0.17, 0, 0.17, 0.34] : [-0.23, 0, 0.23];
    const speed = bat.hp <= 2 ? 265 : 225;
    offsets.forEach((offset, index) => {
      const angle = baseAngle + offset;
      state.hazards.push({
        type: "sonic",
        x: bat.x + Math.cos(angle) * 88,
        y: bat.y + Math.sin(angle) * 65,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 23,
        phase: index * 0.8,
        telegraph: 0.6,
        life: 6.5,
      });
    });
    playTone(175, 0.28, "sine", 0.025);
    playTone(215, 0.22, "sine", 0.018, 0.04);
  }

  function spawnCaveRock() {
    const targetX = clamp(state.player.x + random(-130, 130), BOUNDS.left + 30, BOUNDS.right - 30);
    state.hazards.push({
      type: "caveRock",
      x: targetX,
      y: 92,
      targetX,
      targetY: BOUNDS.bottom,
      vx: random(-18, 18),
      vy: random(310, 370),
      radius: random(22, 31),
      rotation: random(0, Math.PI * 2),
      spin: random(-5, 5),
      telegraph: 0.68,
      life: 4,
    });
  }

  function updateHazards(dt) {
    for (let index = state.hazards.length - 1; index >= 0; index -= 1) {
      const hazard = state.hazards[index];
      hazard.life -= dt;
      if (hazard.type === "sonic") hazard.phase += dt * 8;
      if (hazard.telegraph > 0) {
        hazard.telegraph -= dt;
      } else {
        hazard.x += hazard.vx * dt;
        hazard.y += hazard.vy * dt;
        if (hazard.type === "landslideRock" || hazard.type === "caveRock") hazard.rotation += hazard.spin * dt;
        if (hazard.type === "claw") {
          hazard.phase += dt * 5;
          hazard.y += Math.sin(hazard.phase) * 32 * dt;
        }
        if (hazard.type === "swarm") {
          hazard.phase += dt * 4.4;
          hazard.y = hazard.baseY + Math.sin(hazard.phase) * hazard.amplitude;
        }

        const hitRadius = hazard.type === "wave" ? 30 : hazard.radius;
        const horizontalHit = hazard.type === "wave"
          ? Math.abs(state.player.x - hazard.x) < hazard.width * 0.48 + HERO_RADIUS
          : Math.abs(state.player.x - hazard.x) < hitRadius + HERO_RADIUS;
        const verticalHit = Math.abs(state.player.y - hazard.y) < hitRadius + HERO_RADIUS;
        if (horizontalHit && verticalHit) {
          const messages = {
            landslideRock: "떨어지는 낙석을 미처 피하지 못했어요!",
            claw: "대왕가재의 집게가 스쳤어요!",
            wave: "거센 물결에 휩쓸렸어요!",
            swarm: "개미 떼와 부딪혔어요!",
            sonic: "대왕박쥐의 초음파에 맞았어요!",
            caveRock: "동굴 천장에서 떨어진 돌에 맞았어요!",
          };
          if (hurt(messages[hazard.type])) {
            state.hazards.splice(index, 1);
            continue;
          }
        }
      }

      if (hazard.life <= 0 || hazard.x < -350 || hazard.x > WIDTH + 350 || hazard.y < -200 || hazard.y > HEIGHT + 200) {
        state.hazards.splice(index, 1);
      }
    }
  }

  function hurt(message) {
    if (state.invincibleTime > 0 || state.dashTime > 0 || state.mode !== "playing") return false;
    state.hearts -= 1;
    state.damageTaken += 1;
    state.invincibleTime = 1.35;
    state.shakeTime = 0.38;
    state.flashTime = 0.2;
    burst(state.player.x, state.player.y, "#fff0bd", 20);
    playHitSound();
    updateHud();
    if (state.hearts <= 0) {
      showGameOver(message);
    } else {
      showToast(`${message}  남은 깃털 ${state.hearts}개`, 1200);
    }
    return true;
  }

  function burst(x, y, color, count) {
    for (let index = 0; index < count; index += 1) {
      const angle = random(0, Math.PI * 2);
      const speed = random(45, 220);
      const life = random(0.35, 0.9);
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        color,
        size: random(3, 10),
      });
    }
  }

  function updateParticles(dt) {
    for (let index = state.particles.length - 1; index >= 0; index -= 1) {
      const particle = state.particles[index];
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 65 * dt;
      particle.vx *= Math.pow(0.2, dt);
      if (particle.life <= 0) state.particles.splice(index, 1);
    }
  }

  function getProgress() {
    const stage = STAGES[state.stageIndex];
    if (stage.id === "bat") {
      return clamp(1 - state.bat.hp / state.bat.maxHp, 0, 1);
    }
    if (stage.id === "library") {
      const goal = { x: 683, y: 512 };
      return clamp(1 - distance(state.player, goal) / 720, 0, 1);
    }
    return clamp(state.stageTime / stage.duration, 0, 1);
  }

  function updateHud(forceProgress = null) {
    const stage = STAGES[state.stageIndex];
    const progress = forceProgress ?? getProgress();
    ui.stageBadge.textContent = `${state.stageIndex + 1} / ${STAGES.length}`;
    ui.stageName.textContent = stage.name;
    ui.missionText.textContent = stage.mission;
    ui.progressBar.style.width = `${Math.round(progress * 100)}%`;
    ui.progressLabel.textContent = `${Math.round(progress * 100)}%`;
    ui.heartDisplay.textContent = `${"🪶 ".repeat(Math.max(0, state.hearts)).trim()}${state.hearts === 0 ? "—" : ""}`;
    ui.heartDisplay.setAttribute("aria-label", `남은 깃털 ${state.hearts}개`);
    ui.bookmarkDisplay.textContent = `🔖 ${state.bookmarks}`;
    const dashReady = state.dashCooldown <= 0;
    ui.dashButton.textContent = dashReady ? (stage.id === "bat" ? "돌진 공격!" : "날갯짓!") : `${state.dashCooldown.toFixed(1)}`;
    ui.dashButton.style.opacity = dashReady ? "1" : "0.62";
  }

  function draw() {
    ctx.save();
    if (state.shakeTime > 0) ctx.translate(random(-8, 8), random(-6, 6));
    drawBackground();
    if (!["loading", "start", "error"].includes(state.mode)) {
      drawStageDecor();
      drawHazards();
      drawPlayer();
      drawParticles();
      drawDashMeter();
    }
    if (state.flashTime > 0) {
      ctx.fillStyle = `rgba(255, 238, 215, ${state.flashTime * 1.8})`;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    ctx.restore();
  }

  function drawBackground() {
    let image = images.get("assets/00-title-map.png");
    if (!["loading", "start", "error"].includes(state.mode)) {
      image = images.get(STAGES[state.stageIndex].background) || image;
    }
    if (image) {
      const isLibraryPhoto = !["loading", "start", "error"].includes(state.mode)
        && STAGES[state.stageIndex].id === "library";
      drawImageCover(image, isLibraryPhoto ? 0.45 : 0.5);
    } else {
      const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      gradient.addColorStop(0, "#82cce5");
      gradient.addColorStop(1, "#cddc9a");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    if (!["loading", "start", "error"].includes(state.mode)) {
      const shade = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      shade.addColorStop(0, "rgba(18, 45, 37, 0.08)");
      shade.addColorStop(0.6, "rgba(16, 38, 31, 0)");
      shade.addColorStop(1, "rgba(14, 35, 29, 0.18)");
      ctx.fillStyle = shade;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  function drawImageCover(image, verticalCropBias = 0.5) {
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    const targetRatio = WIDTH / HEIGHT;
    const sourceRatio = sourceWidth / sourceHeight;
    let sourceX = 0;
    let sourceY = 0;
    let cropWidth = sourceWidth;
    let cropHeight = sourceHeight;

    if (sourceRatio > targetRatio) {
      cropWidth = sourceHeight * targetRatio;
      sourceX = (sourceWidth - cropWidth) / 2;
    } else if (sourceRatio < targetRatio) {
      cropHeight = sourceWidth / targetRatio;
      sourceY = (sourceHeight - cropHeight) * verticalCropBias;
    }

    ctx.drawImage(
      image,
      sourceX,
      sourceY,
      cropWidth,
      cropHeight,
      0,
      0,
      WIDTH,
      HEIGHT,
    );
  }

  function drawStageDecor() {
    const stage = STAGES[state.stageIndex];
    if (stage.id === "bear") {
      drawBear();
    } else if (stage.id === "landslide") {
      drawLandslideWarning();
    } else if (stage.id === "crayfish") {
      drawCrayfish();
    } else if (stage.id === "ants") {
      drawRoadMarker();
    } else if (stage.id === "bat") {
      drawBat();
    } else if (stage.id === "library") {
      drawLibraryGoal();
    }
  }

  function drawBear() {
    const bear = state.bear;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.translate(bear.x, bear.y);
    const bob = Math.sin(state.stageTime * 9) * 5;
    const stride = Math.sin(state.stageTime * 12) * 5;
    ctx.fillStyle = "rgba(17,33,25,0.24)";
    ctx.beginPath();
    ctx.ellipse(0, 46, 53, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(0, bob);

    ctx.fillStyle = "#4b2a19";
    ctx.beginPath(); ctx.ellipse(-25, 40 + stride, 18, 13, -0.15, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(25, 40 - stride, 18, 13, 0.15, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#684027";
    ctx.beginPath(); ctx.ellipse(0, 10, 45, 47, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#4b2a19";
    ctx.lineWidth = 17;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-33, -1); ctx.lineTo(-47, 22 + stride);
    ctx.moveTo(33, -1); ctx.lineTo(47, 22 - stride);
    ctx.stroke();

    ctx.fillStyle = "#4b2a19";
    ctx.beginPath(); ctx.arc(-30, -55, 17, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(30, -55, 17, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9b7049";
    ctx.beginPath(); ctx.arc(-30, -55, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(30, -55, 9, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#74472c";
    ctx.beginPath(); ctx.ellipse(0, -28, 45, 40, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#c99b67";
    ctx.beginPath(); ctx.ellipse(0, -17, 25, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#21150f";
    ctx.beginPath(); ctx.arc(-16, -34, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(16, -34, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -23, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#382116";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, -17); ctx.quadraticCurveTo(-7, -10, -13, -14);
    ctx.moveTo(0, -17); ctx.quadraticCurveTo(7, -10, 13, -14);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 1;
    ctx.translate(bear.x, bear.y);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    roundRect(ctx, -47, -101, 94, 27, 13);
    ctx.fill();
    ctx.fillStyle = "#6b3f22";
    ctx.font = '900 14px "Malgun Gothic"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("추격 중!", 0, -87);
    ctx.restore();
  }

  function drawLandslideWarning() {
    const x = 1182;
    const y = 238;
    const rumble = Math.sin(state.stageTime * 15) * 2;
    ctx.save();
    ctx.globalAlpha = 1;
    ctx.translate(x + rumble, y);
    ctx.fillStyle = "rgba(25,39,31,0.22)";
    ctx.beginPath();
    ctx.ellipse(4, 61, 86, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    const boulders = [
      { x: 42, y: 26, r: 35 },
      { x: -8, y: 37, r: 30 },
      { x: 70, y: 48, r: 24 },
      { x: -48, y: 49, r: 22 },
    ];
    boulders.forEach((boulder, index) => {
      ctx.fillStyle = index % 2 === 0 ? "#666760" : "#7a766b";
      ctx.strokeStyle = "#42443f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(boulder.x, boulder.y, boulder.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.strokeStyle = "#704525";
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(-76, 23); ctx.lineTo(-76, 91); ctx.stroke();
    ctx.fillStyle = "#f3c94d";
    ctx.strokeStyle = "#68472a";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-76, -44); ctx.lineTo(-119, 28); ctx.lineTo(-33, 28); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = "#5a3a25";
    ctx.font = '900 42px "Malgun Gothic"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", -76, 2);

    ctx.fillStyle = "rgba(255,255,255,0.92)";
    roundRect(ctx, -132, -84, 112, 28, 14);
    ctx.fill();
    ctx.fillStyle = "#664325";
    ctx.font = '900 14px "Malgun Gothic"';
    ctx.fillText("낙석 주의", -76, -70);
    ctx.restore();
  }

  function drawCrayfish() {
    ctx.save();
    ctx.translate(1135, 566 + Math.sin(state.stageTime * 3) * 6);
    ctx.fillStyle = "rgba(18,35,29,0.25)";
    ctx.beginPath(); ctx.ellipse(0, 45, 83, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.font = '142px "Segoe UI Emoji"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🦞", 0, 0);
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    roundRect(ctx, -76, -103, 152, 29, 14);
    ctx.fill();
    ctx.fillStyle = "#a23f32";
    ctx.font = '900 15px "Malgun Gothic"';
    ctx.fillText("대왕가재", 0, -88);
    ctx.restore();
  }

  function drawRoadMarker() {
    ctx.save();
    ctx.translate(1175, 625);
    ctx.fillStyle = "rgba(255,251,226,0.9)";
    roundRect(ctx, -95, -33, 190, 56, 14);
    ctx.fill();
    ctx.strokeStyle = "#704d2d";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.fillStyle = "#274f3d";
    ctx.font = '900 18px "Malgun Gothic"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("정선교육도서관  →", 0, -5);
    ctx.restore();
  }

  function drawBat() {
    if (!batSprite) return;
    const bat = state.bat;
    const bob = Math.sin(state.stageTime * 3.8) * 9;
    const hitPulse = bat.stunTime > 0 ? 1.06 : 1;
    const width = 330 * hitPulse;
    const height = width * (batSprite.height / batSprite.width);
    const drawY = bat.y + bob;

    ctx.save();
    const glow = ctx.createRadialGradient(bat.x, drawY, 15, bat.x, drawY, 150);
    glow.addColorStop(0, bat.stunTime > 0 ? "rgba(255,224,91,0.48)" : "rgba(82,224,255,0.27)");
    glow.addColorStop(1, "rgba(70,165,255,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(bat.x, drawY, 155, 0, Math.PI * 2); ctx.fill();
    if (bat.hitCooldown > 0 && Math.floor(bat.hitCooldown * 18) % 2 === 0) ctx.globalAlpha = 0.58;
    ctx.drawImage(batSprite, bat.x - width / 2, drawY - height / 2, width, height);
    ctx.restore();

    const barWidth = 286;
    const barX = clamp(bat.x - barWidth / 2, 34, WIDTH - barWidth - 34);
    const barY = clamp(drawY - height / 2 - 53, 134, 590);
    const hpRatio = bat.hp / bat.maxHp;
    ctx.save();
    ctx.fillStyle = "rgba(18,16,36,0.88)";
    roundRect(ctx, barX, barY, barWidth, 38, 16); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.17)";
    roundRect(ctx, barX + 82, barY + 10, barWidth - 94, 17, 8); ctx.fill();
    const hpGradient = ctx.createLinearGradient(barX + 82, 0, barX + barWidth - 12, 0);
    hpGradient.addColorStop(0, "#ffcc52");
    hpGradient.addColorStop(1, "#e15b85");
    ctx.fillStyle = hpGradient;
    roundRect(ctx, barX + 85, barY + 13, (barWidth - 100) * hpRatio, 11, 5); ctx.fill();
    ctx.fillStyle = "#fff2b0";
    ctx.font = '900 14px "Malgun Gothic"';
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("대왕박쥐", barX + 14, barY + 19);
    ctx.restore();
  }

  function drawLibraryGoal() {
    const goal = { x: 683, y: 512 };
    const pulse = 1 + Math.sin(state.stageTime * 4) * 0.12;
    ctx.save();
    const glow = ctx.createRadialGradient(goal.x, goal.y, 10, goal.x, goal.y, 100 * pulse);
    glow.addColorStop(0, "rgba(255,239,111,0.78)");
    glow.addColorStop(0.35, "rgba(255,203,55,0.38)");
    glow.addColorStop(1, "rgba(255,196,50,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(goal.x, goal.y, 105 * pulse, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `rgba(255, 230, 91, ${0.74 + Math.sin(state.stageTime * 4) * 0.2})`;
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(goal.x, goal.y, 65 * pulse, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(20,55,42,0.9)";
    roundRect(ctx, goal.x - 92, goal.y - 130, 184, 42, 18);
    ctx.fill();
    ctx.fillStyle = "#fff4ad";
    ctx.font = '900 19px "Malgun Gothic"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("📚  도착 지점", goal.x, goal.y - 109);
    ctx.restore();
  }

  function drawHazards() {
    state.hazards.forEach((hazard) => {
      if (hazard.type === "landslideRock" || hazard.type === "caveRock") drawRock(hazard);
      if (hazard.type === "claw") drawClaw(hazard);
      if (hazard.type === "wave") drawWave(hazard);
      if (hazard.type === "swarm") drawSwarm(hazard);
      if (hazard.type === "sonic") drawSonic(hazard);
    });
  }

  function drawRock(rock) {
    if (rock.telegraph > 0) {
      ctx.save();
      const alpha = 0.5 + Math.sin(rock.telegraph * 24) * 0.25;
      ctx.strokeStyle = `rgba(247, 124, 55, ${alpha})`;
      ctx.lineWidth = rock.type === "landslideRock" ? 7 : 8;
      ctx.setLineDash(rock.type === "landslideRock" ? [12, 9] : [18, 14]);
      if (rock.type === "landslideRock") {
        ctx.beginPath(); ctx.arc(rock.targetX, rock.targetY, 46, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 7;
        for (let index = 0; index < 3; index += 1) {
          const arrowY = rock.targetY - 125 + index * 32;
          ctx.beginPath();
          ctx.moveTo(rock.targetX - 17, arrowY - 10);
          ctx.lineTo(rock.targetX, arrowY + 8);
          ctx.lineTo(rock.targetX + 17, arrowY - 10);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        ctx.moveTo(rock.x, rock.y);
        ctx.lineTo(rock.targetX, rock.targetY);
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(247, 124, 55, ${alpha * 0.55})`;
      ctx.beginPath(); ctx.arc(rock.targetX, rock.targetY, 40, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    ctx.save();
    ctx.translate(rock.x, rock.y);
    ctx.rotate(rock.rotation);
    ctx.fillStyle = "#6e6b66";
    ctx.strokeStyle = "#403f3b";
    ctx.lineWidth = 5;
    ctx.beginPath();
    const points = 7;
    for (let index = 0; index < points; index += 1) {
      const angle = (index / points) * Math.PI * 2;
      const radius = rock.radius * (0.82 + (index % 2) * 0.16);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.beginPath(); ctx.arc(-rock.radius * 0.25, -rock.radius * 0.3, rock.radius * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawClaw(claw) {
    ctx.save();
    ctx.translate(claw.x, claw.y);
    if (claw.vx < 0) ctx.scale(-1, 1);
    ctx.font = '68px "Segoe UI Emoji"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🦞", 0, 0);
    ctx.restore();
  }

  function drawWave(wave) {
    ctx.save();
    ctx.translate(wave.x, wave.y);
    const gradient = ctx.createLinearGradient(-wave.width / 2, 0, wave.width / 2, 0);
    gradient.addColorStop(0, "rgba(92,211,235,0)");
    gradient.addColorStop(0.2, "rgba(74,198,228,0.78)");
    gradient.addColorStop(0.5, "rgba(226,251,255,0.94)");
    gradient.addColorStop(0.8, "rgba(74,198,228,0.78)");
    gradient.addColorStop(1, "rgba(92,211,235,0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(-wave.width / 2, 22);
    for (let x = -wave.width / 2; x <= wave.width / 2; x += 18) {
      ctx.lineTo(x, Math.sin((x + state.stageTime * 220) * 0.05) * 15 - 8);
    }
    ctx.lineTo(wave.width / 2, 36);
    ctx.lineTo(-wave.width / 2, 36);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  function drawSwarm(swarm) {
    ctx.save();
    ctx.translate(swarm.x, swarm.y);
    if (swarm.vx < 0) ctx.scale(-1, 1);
    ctx.font = '34px "Segoe UI Emoji"';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let index = 0; index < swarm.count; index += 1) {
      const column = (index % 3) - 1;
      const row = Math.floor(index / 3) - 1;
      const offsetX = column * 34 + (row % 2) * 12;
      const offsetY = row * 29 + Math.sin(state.stageTime * 8 + index) * 6;
      ctx.fillText("🐜", offsetX, offsetY);
    }
    ctx.strokeStyle = "rgba(255,241,190,0.75)";
    ctx.lineWidth = 4;
    for (let index = 0; index < 3; index += 1) {
      ctx.beginPath();
      ctx.moveTo(-78 - index * 18, -25 + index * 22);
      ctx.lineTo(-112 - index * 20, -25 + index * 22);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawSonic(sonic) {
    ctx.save();
    ctx.translate(sonic.x, sonic.y);
    ctx.rotate(Math.atan2(sonic.vy, sonic.vx));
    ctx.lineWidth = 5;
    const chargeScale = sonic.telegraph > 0 ? 1.6 - sonic.telegraph : 1;
    for (let ring = 0; ring < 3; ring += 1) {
      const radius = (16 + ring * 12 + Math.sin(sonic.phase + ring) * 3) * chargeScale;
      ctx.strokeStyle = `rgba(${112 + ring * 28}, ${224 + ring * 8}, 255, ${0.88 - ring * 0.2})`;
      ctx.beginPath();
      ctx.arc(0, 0, radius, -0.9, 0.9);
      ctx.stroke();
    }
    ctx.fillStyle = "rgba(190,248,255,0.86)";
    ctx.beginPath(); ctx.arc(2, 0, 7, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawPlayer() {
    if (!heroSprite) return;
    if (state.invincibleTime > 0 && Math.floor(state.invincibleTime * 12) % 2 === 0) return;
    const player = state.player;
    const bob = Math.sin((state.stageTime + state.travelTime) * 8) * 5;
    const sizeBoost = state.dashTime > 0 ? 1.09 : 1;
    const width = 122 * sizeBoost;
    const height = width * (heroSprite.height / heroSprite.width);
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.fillStyle = "rgba(18,34,28,0.25)";
    ctx.beginPath(); ctx.ellipse(0, 43, 42, 12, 0, 0, Math.PI * 2); ctx.fill();
    if (state.dashTime > 0) {
      ctx.strokeStyle = "rgba(255,232,104,0.82)";
      ctx.lineWidth = 7;
      ctx.beginPath(); ctx.arc(0, 0, 58 + Math.sin(state.stageTime * 20) * 4, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.scale(player.facing, 1);
    ctx.drawImage(heroSprite, -width / 2, -height / 2 + bob, width, height);
    ctx.restore();
  }

  function drawParticles() {
    state.particles.forEach((particle) => {
      ctx.save();
      ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.life / particle.maxLife) * Math.PI);
      ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.65);
      ctx.restore();
    });
  }

  function drawDashMeter() {
    if (state.mode !== "playing" || state.dashCooldown <= 0) return;
    const x = state.player.x;
    const y = state.player.y + 66;
    const progress = 1 - state.dashCooldown / 2.15;
    ctx.save();
    ctx.fillStyle = "rgba(18,47,38,0.72)";
    roundRect(ctx, x - 36, y - 6, 72, 12, 6); ctx.fill();
    ctx.fillStyle = "#ffd34f";
    roundRect(ctx, x - 33, y - 3, 66 * clamp(progress, 0, 1), 6, 3); ctx.fill();
    ctx.restore();
  }

  function roundRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function showToast(message, duration = 1200) {
    clearTimeout(toastTimer);
    ui.toast.textContent = message;
    ui.toast.classList.remove("is-hidden");
    toastTimer = window.setTimeout(() => ui.toast.classList.add("is-hidden"), duration);
  }

  function formatTime(seconds) {
    const total = Math.max(0, Math.round(seconds));
    const minutes = Math.floor(total / 60).toString().padStart(2, "0");
    const remainder = (total % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  }

  function frame(timestamp) {
    if (!state.lastTimestamp) state.lastTimestamp = timestamp;
    const delta = (timestamp - state.lastTimestamp) / 1000;
    state.lastTimestamp = timestamp;
    update(delta);
    draw();
    window.requestAnimationFrame(frame);
  }

  function setInputFromKey(code, pressed) {
    const mapping = {
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
      ArrowUp: "up",
      KeyW: "up",
      ArrowDown: "down",
      KeyS: "down",
    };
    const inputName = mapping[code];
    if (inputName) input[inputName] = pressed;
    return Boolean(inputName);
  }

  document.addEventListener("keydown", (event) => {
    const handledMove = setInputFromKey(event.code, true);
    if (handledMove || event.code === "Space") event.preventDefault();
    if (event.code === "Space" && !event.repeat) dash();
    if ((event.code === "Escape" || event.code === "KeyP") && !event.repeat) togglePause();
    if (event.code === "Enter" && !event.repeat && state.mode === "stage-card") startStage();
  });

  document.addEventListener("keyup", (event) => {
    if (setInputFromKey(event.code, false)) event.preventDefault();
  });

  window.addEventListener("blur", () => {
    resetInputs();
    if (state.mode === "playing") togglePause();
  });

  document.querySelectorAll(".move-button").forEach((button) => {
    const direction = button.dataset.key;
    const press = (event) => {
      event.preventDefault();
      input[direction] = true;
      button.classList.add("is-pressed");
      button.setPointerCapture?.(event.pointerId);
    };
    const release = (event) => {
      event.preventDefault();
      input[direction] = false;
      button.classList.remove("is-pressed");
    };
    button.addEventListener("pointerdown", press);
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("pointerleave", (event) => {
      if (event.buttons === 0) release(event);
    });
  });

  ui.startButton.addEventListener("click", beginAdventure);
  ui.howToButton.addEventListener("click", () => ui.howToScreen.classList.remove("is-hidden"));
  ui.closeHowToButton.addEventListener("click", () => ui.howToScreen.classList.add("is-hidden"));
  ui.howToStartButton.addEventListener("click", beginAdventure);
  ui.continueButton.addEventListener("click", startStage);
  ui.retryButton.addEventListener("click", retryStage);
  ui.homeButton.addEventListener("click", goHome);
  ui.playAgainButton.addEventListener("click", beginAdventure);
  ui.completeHomeButton.addEventListener("click", goHome);
  ui.pauseButton.addEventListener("click", () => togglePause());
  ui.resumeButton.addEventListener("click", () => togglePause(true));
  ui.pauseHomeButton.addEventListener("click", goHome);
  ui.soundButton.addEventListener("click", toggleSound);
  ui.dashButton.addEventListener("pointerdown", (event) => { event.preventDefault(); dash(); });

  // Small, read-only-friendly test surface for local verification.
  window.__sparrowGame = {
    getState: () => ({
      mode: state.mode,
      stageIndex: state.stageIndex,
      stageId: STAGES[state.stageIndex].id,
      hearts: state.hearts,
      bookmarks: state.bookmarks,
      progress: getProgress(),
      hazards: state.hazards.length,
      bossHp: state.bat.hp,
    }),
    start: beginAdventure,
    continueStage: startStage,
    skipStage: () => {
      if (state.mode !== "playing") return;
      if (state.stageIndex === STAGES.length - 1) completeGame();
      else completeStage();
    },
    setStage: (index) => prepareStage(Number(index)),
    dash,
  };

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  loadAssets();
  window.requestAnimationFrame(frame);
})();
