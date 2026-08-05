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

// Loop de actualización
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

// Sticks con knob y dial
function updateSticks(gp) {
  // Stick izquierdo (axes 0,1)
  updateStick("stick-l", "knob-l", "dial-l-fill", "dial-l-txt", gp.axes[0], gp.axes[1]);
  // Stick derecho (axes 2,3)
  updateStick("stick-r", "knob-r", "dial-r-fill", "dial-r-txt", gp.axes[2], gp.axes[3]);
}

function updateStick(containerId, knobId, dialFillId, dialTextId, x, y) {
  const container = document.getElementById(containerId);
  const knob = document.getElementById(knobId);
  const fill = document.getElementById(dialFillId);
  const text = document.getElementById(dialTextId);
  if (!container || !knob || !fill || !text) return;

  // Limitar movimiento a un radio relativo al tamaño del stick
  const maxMove = container.offsetWidth * 0.25; // 25% del ancho del stick
  const dx = x * maxMove;
  const dy = y * maxMove;
  knob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;

  // Calcular magnitud y ángulo para el dial
  const magnitude = Math.sqrt(x * x + y * y);
  const percentage = Math.round(Math.min(magnitude, 1) * 100);
  text.textContent = percentage + "%";

  // Dibujar arco en el dial según magnitud
  if (magnitude > 0.01) {
    const angle = Math.atan2(y, x) * (180 / Math.PI); // grados
    const startAngle = -90; // comenzar desde arriba
    const endAngle = startAngle + angle;
    const r = 46;
    const cx = 50, cy = 50;
    const toRad = (deg) => deg * Math.PI / 180;
    const startRad = toRad(startAngle);
    const endRad = toRad(endAngle);
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = magnitude > 0.5 ? 1 : 0;
    fill.setAttribute("d", `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`);
    fill.setAttribute("opacity", "0.3");
  } else {
    fill.setAttribute("d", "M50 50 L50 4 A46 46 0 1 1 50.1 4 Z");
    fill.setAttribute("opacity", "0");
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
