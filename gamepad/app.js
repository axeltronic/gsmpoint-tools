let gamepadIndex = null;

const status = document.getElementById("connection-status");
const tester = document.getElementById("tester");
const controllerName = document.getElementById("controller-name");
const controllerType = document.getElementById("controller-type");
const progressSpan = document.getElementById("progress");
const chipsContainer = document.getElementById("chips");
const vibeNote = document.getElementById("vibe-note");

// Nombres para los chips de botones probados
const buttonNames = [
  "✕", "○", "□", "△",      // 0-3
  "L1", "R1",              // 4-5
  "L2", "R2",              // 6-7
  "Share", "Options",      // 8-9
  "L3", "R3",              // 10-11
  "↑", "↓", "←", "→",      // 12-15
  "Home"                   // 16
];

let testedButtons = [];

// Conexión
window.addEventListener("gamepadconnected", (e) => {
  gamepadIndex = e.gamepad.index;
  let type = detectController(e.gamepad);

  status.innerHTML = "✅ Joystick conectado";
  controllerName.innerHTML = e.gamepad.id;
  controllerType.innerHTML = "Layout: " + type;

  tester.classList.remove("hidden");
  createButtonChips();   // crea los chips iniciales
});

window.addEventListener("gamepaddisconnected", () => {
  gamepadIndex = null;
  status.innerHTML = "❌ Joystick desconectado";
  tester.classList.add("hidden");
  testedButtons = [];
  progressSpan.textContent = "0";
  chipsContainer.innerHTML = "";
});

function detectController(gp) {
  let id = gp.id.toLowerCase();
  if (id.includes("sony") || id.includes("dualshock") || id.includes("dualsense") || id.includes("054c"))
    return "playstation";
  if (id.includes("xbox") || id.includes("microsoft"))
    return "xbox";
  if (id.includes("switch") || id.includes("nintendo"))
    return "switch";
  return "generic";
}

// Crear chips de botones
function createButtonChips() {
  chipsContainer.innerHTML = "";
  buttonNames.forEach((name, index) => {
    let chip = document.createElement("span");
    chip.className = "chip";
    chip.id = "chip-" + index;
    chip.textContent = name;
    chipsContainer.appendChild(chip);
  });
}

/* ===========================
   STICK PRO RING
=========================== */

const stickHistory = {
    "stick-l": new Array(720).fill(false),
    "stick-r": new Array(720).fill(false)
};

const ringSegments = {
    "stick-l": [],
    "stick-r": []
};

function createRing(id){

    const svg = document.querySelector(`#${id} .dial svg`);

    if(!svg) return;

    const NS = "http://www.w3.org/2000/svg";

    const group = document.createElementNS(NS,"g");

    group.classList.add("ring");

    const segments=[];

    const total=180;

    const r1=42;
    const r2=48;

    for(let i=0;i<total;i++){

        const a=(i/total)*Math.PI*2-Math.PI/2;

        const x1=50+Math.cos(a)*r1;
        const y1=50+Math.sin(a)*r1;

        const x2=50+Math.cos(a)*r2;
        const y2=50+Math.sin(a)*r2;

        const line=document.createElementNS(NS,"line");

        line.setAttribute("x1",x1);
        line.setAttribute("y1",y1);

        line.setAttribute("x2",x2);
        line.setAttribute("y2",y2);

        line.classList.add("checkpoint");

        group.appendChild(line);

        segments.push(line);

    }

    svg.insertBefore(group,svg.firstChild);

    stickHistory[id]=segments;

}

function update() {
  if (gamepadIndex !== null) {
    let gp = navigator.getGamepads()[gamepadIndex];

    if (gp) {
      updateButtons(gp);
      updateSticks(gp);
      updateTriggers(gp);
    }
  }

  requestAnimationFrame(update);
}

createRing("stick-l");
createRing("stick-r");

update();

// Botones
function updateButtons(gp) {
  // Iteramos sobre los índices que usamos (0-16)
  for (let i = 0; i <= 16; i++) {
    let button = gp.buttons[i];
    if (!button) continue;
    let element = document.querySelector(`[data-btn="${i}"]`);
    if (!element) continue;

    if (button.pressed) {
      element.classList.add("pressed");
      markButtonTested(i);
    } else {
      element.classList.remove("pressed");
    }
  }
}

/* ===========================
   STICKS
=========================== */

function updateSticks(gp) {

  updateStick(
    "stick-l",
    "knob-l",
    "dial-l-progress",
    "dial-l-txt",
    gp.axes[0],
    gp.axes[1]
  );

  updateStick(
    "stick-r",
    "knob-r",
    "dial-r-progress",
    "dial-r-txt",
    gp.axes[2],
    gp.axes[3]
  );

}

function updateStick(containerId, knobId, progressId, textId, x, y) {

  const container = document.getElementById(containerId);
  const knob = document.getElementById(knobId);

  const progress = document.getElementById(progressId);
  const text = document.getElementById(textId);

  const dot = document.getElementById(
    progressId.replace("progress", "dot")
  );

  const line = document.getElementById(
    progressId.replace("progress", "line")
  );

  if (!container || !knob) return;

  x = Number.isFinite(x) ? x : 0;
  y = Number.isFinite(y) ? y : 0;

  const maxMove = container.offsetWidth * 0.25;

  const dx = x * maxMove;
  const dy = y * maxMove;

  knob.style.transform =
    `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

  const magnitude = Math.min(
    Math.sqrt(x * x + y * y),
    1
  );

  text.textContent =
    Math.round(magnitude * 100) + "%";

  /* progreso circular */

  if (progress) {

    const circumference = 2 * Math.PI * 46;

    progress.style.strokeDasharray = circumference;

    progress.style.strokeDashoffset =
      circumference - (circumference * magnitude);

  }

  /* dirección */

  const angle = Math.atan2(y, x);

  const radius = 46;

  const px = 50 + Math.cos(angle) * radius;

  const py = 50 + Math.sin(angle) * radius;

  if (dot) {

    dot.setAttribute("cx", px);
    dot.setAttribute("cy", py);

  }

  if (line) {

    line.setAttribute("x2", px);
    line.setAttribute("y2", py);

  }

  /* ===========================
     NUEVO ANILLO DE CHECKPOINTS
  ============================ */

  const ring = stickHistory[containerId];

  if (ring && ring.length) {

    const current = Math.floor(
      ((angle + Math.PI) / (Math.PI * 2)) * ring.length
    );

    const distance = Math.floor(
      magnitude * 10
    );

    ring.forEach(segment => {
      segment.classList.remove("current");
    });

    for (let i = -distance; i <= distance; i++) {

      const index =
        (current + i + ring.length) % ring.length;

      ring[index].classList.add("visited");

    }

    ring[current].classList.add("current");

  }

}

// Gatillos (L2/R2) analógicos
function updateTriggers(gp) {
  const l2 = gp.buttons[6]?.value || 0;
  const r2 = gp.buttons[7]?.value || 0;

  const l2Btn = document.querySelector('[data-btn="6"]');
  const r2Btn = document.querySelector('[data-btn="7"]');
  if (l2Btn) {
    l2Btn.style.transform = `translateY(${l2 * 6}px)`;
    if (l2 > 0.1) l2Btn.classList.add("pressed");
    else l2Btn.classList.remove("pressed");
  }
  if (r2Btn) {
    r2Btn.style.transform = `translateY(${r2 * 6}px)`;
    if (r2 > 0.1) r2Btn.classList.add("pressed");
    else r2Btn.classList.remove("pressed");
  }
}

// Progreso de botones probados
function markButtonTested(index) {
  if (testedButtons.includes(index)) return;
  testedButtons.push(index);

  let chip = document.getElementById("chip-" + index);
  if (chip) {
    chip.classList.add("active");
  }

  progressSpan.textContent = testedButtons.length;
}

// Vibración con tres intensidades
document.querySelectorAll(".vibe-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    let gp = navigator.getGamepads()[gamepadIndex];
    if (!gp || !gp.vibrationActuator) {
      vibeNote.textContent = "Vibración no soportada";
      return;
    }
    const type = btn.dataset.vibe;
    let params = { duration: 500, strongMagnitude: 0, weakMagnitude: 0 };
    if (type === "light") {
      params.strongMagnitude = 0.3;
      params.weakMagnitude = 0.3;
    } else if (type === "heavy") {
      params.strongMagnitude = 1.0;
      params.weakMagnitude = 0.3;
    } else if (type === "full") {
      params.strongMagnitude = 1.0;
      params.weakMagnitude = 1.0;
    }
    gp.vibrationActuator.playEffect("dual-rumble", params);
    vibeNote.textContent = "Vibrando...";
    setTimeout(() => { vibeNote.textContent = ""; }, 500);
  });
});
