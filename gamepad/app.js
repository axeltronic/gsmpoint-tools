let gamepadIndex = null;

const status = document.getElementById("connection-status");
const tester = document.getElementById("tester");
const controllerName = document.getElementById("controller-name");
const controllerType = document.getElementById("controller-type");
const progressSpan = document.getElementById("progress");
const chipsContainer = document.getElementById("chips");
const vibeNote = document.getElementById("vibe-note");

// =========================================================
// NOMBRES DE BOTONES
// =========================================================

const buttonNames = [
  "✕", "○", "□", "△",
  "L1", "R1",
  "L2", "R2",
  "Share", "Options",
  "L3", "R3",
  "↑", "↓", "←", "→",
  "Home"
];

let testedButtons = [];

// =========================================================
// CONEXIÓN
// =========================================================

window.addEventListener("gamepadconnected", (e) => {

  gamepadIndex = e.gamepad.index;

  const type = detectController(e.gamepad);

  status.innerHTML = "✅ Joystick conectado";
  controllerName.textContent = e.gamepad.id;
  controllerType.textContent = "Layout: " + type;

  tester.classList.remove("hidden");

  createButtonChips();

});

window.addEventListener("gamepaddisconnected", () => {

  gamepadIndex = null;

  status.innerHTML = "❌ Joystick desconectado";

  tester.classList.add("hidden");

  testedButtons = [];

  progressSpan.textContent = "0";

  chipsContainer.innerHTML = "";

});

// =========================================================
// DETECTAR CONTROLADOR
// =========================================================

function detectController(gp) {

  const id = gp.id.toLowerCase();

  if (
    id.includes("sony") ||
    id.includes("dualshock") ||
    id.includes("dualsense") ||
    id.includes("054c")
  ) {
    return "playstation";
  }

  if (
    id.includes("xbox") ||
    id.includes("microsoft")
  ) {
    return "xbox";
  }

  if (
    id.includes("switch") ||
    id.includes("nintendo")
  ) {
    return "switch";
  }

  return "generic";
}

// =========================================================
// CHIPS
// =========================================================

function createButtonChips() {

  chipsContainer.innerHTML = "";

  buttonNames.forEach((name, index) => {

    const chip = document.createElement("span");

    chip.className = "chip";
    chip.id = "chip-" + index;
    chip.textContent = name;

    chipsContainer.appendChild(chip);

  });

}

// =========================================================
// MAIN LOOP
// =========================================================

function update() {

  if (gamepadIndex !== null) {

    const gamepads = navigator.getGamepads();

    const gp = gamepads[gamepadIndex];

    if (gp) {

      updateButtons(gp);

      updateSticks(gp);

      updateTriggers(gp);

    }

  }

  requestAnimationFrame(update);

}

update();

// =========================================================
// BOTONES
// =========================================================

function updateButtons(gp) {

  for (let i = 0; i <= 16; i++) {

    const button = gp.buttons[i];

    if (!button) continue;

    /*
      Compatible con:
      data-btn="0"
      y con el SVG nuevo:
      data-button="0"
    */

    const element =
      document.querySelector(`[data-btn="${i}"]`) ||
      document.querySelector(`[data-button="${i}"]`);

    if (!element) continue;

    if (button.pressed) {

      element.classList.add("pressed");

      markButtonTested(i);

    } else {

      element.classList.remove("pressed");

    }

  }

}

// =========================================================
// STICKS
// =========================================================

const stickState = {

  left: {
    x: 245,
    y: 218,
    percent: 0
  },

  right: {
    x: 435,
    y: 218,
    percent: 0
  }

};

// ---------------------------------------------------------
// UPDATE STICKS
// ---------------------------------------------------------

function updateSticks(gp) {

  updateStickSVG(
    "left",
    gp.axes[0],
    gp.axes[1]
  );

  updateStickSVG(
    "right",
    gp.axes[2],
    gp.axes[3]
  );

}

// ---------------------------------------------------------
// UPDATE STICK SVG
// ---------------------------------------------------------

function updateStickSVG(side, rawX, rawY) {

  const analog = document.querySelector(
    `.analog[data-stick="${side}"]`
  );

  if (!analog) return;

  const knob =
    analog.querySelector(".analog-knob");

  const highlight =
    analog.querySelector(".analog-highlight");

  const percent =
    analog.querySelector(".analog-percent");

  const progress =
    analog.querySelector(".analog-progress");

  if (!knob) return;

  let x = Number.isFinite(rawX)
    ? rawX
    : 0;

  let y = Number.isFinite(rawY)
    ? rawY
    : 0;

  // =======================================================
  // DEAD ZONE
  // =======================================================

  const deadZone = 0.08;

  if (Math.abs(x) < deadZone) {
    x = 0;
  }

  if (Math.abs(y) < deadZone) {
    y = 0;
  }

  // =======================================================
  // MAGNITUD
  // =======================================================

  let magnitude = Math.hypot(x, y);

  magnitude = Math.min(
    magnitude,
    1
  );

  // =======================================================
  // CENTRO
  // =======================================================

  const cx =
    side === "left"
      ? 245
      : 435;

  const cy = 218;

  // =======================================================
  // MOVIMIENTO DEL KNOB
  // =======================================================

  const travel = 17;

  const knobX =
    cx + x * travel;

  const knobY =
    cy + y * travel;

  knob.setAttribute(
    "cx",
    knobX
  );

  knob.setAttribute(
    "cy",
    knobY
  );

  // =======================================================
  // HIGHLIGHT
  // =======================================================

  if (highlight) {

    highlight.setAttribute(
      "cx",
      knobX - 5
    );

    highlight.setAttribute(
      "cy",
      knobY - 5
    );

  }

  // =======================================================
  // PORCENTAJE
  // =======================================================

  const value =
    Math.round(
      magnitude * 100
    );

  if (percent) {

    percent.textContent =
      value + "%";

  }

  // =======================================================
  // ARO DE PROGRESO
  // =======================================================

  if (progress) {

    const radius = 33;

    const circumference =
      2 * Math.PI * radius;

    progress.style.strokeDasharray =
      circumference;

    progress.style.strokeDashoffset =
      circumference -
      circumference * magnitude;

    progress.classList.toggle(
      "active",
      magnitude > 0.05
    );

  }

  // =======================================================
  // GUARDAR ESTADO
  // =======================================================

  stickState[side] = {

    x: x,

    y: y,

    percent: value

  };

}

// =========================================================
// TRIGGERS L2 / R2
// =========================================================

function updateTriggers(gp) {

  const l2 =
    gp.buttons[6]?.value || 0;

  const r2 =
    gp.buttons[7]?.value || 0;

  updateTriggerSVG(
    "l2",
    l2
  );

  updateTriggerSVG(
    "r2",
    r2
  );

  // Compatibilidad con el sistema anterior

  const l2Btn =
    document.querySelector(
      '.trigger-2d.l2'
    );

  const r2Btn =
    document.querySelector(
      '.trigger-2d.r2'
    );

  if (l2Btn) {

    l2Btn.style.transform =
      `translateY(${l2 * 6}px)`;

    l2Btn.classList.toggle(
      "pressed",
      l2 > 0.1
    );

  }

  if (r2Btn) {

    r2Btn.style.transform =
      `translateY(${r2 * 6}px)`;

    r2Btn.classList.toggle(
      "pressed",
      r2 > 0.1
    );

  }

}

// ---------------------------------------------------------
// TRIGGER SVG
// ---------------------------------------------------------

function updateTriggerSVG(
  side,
  value
) {

  const widget =
    document.querySelector(
      `.trigger-widget[data-trigger="${side}"]`
    );

  if (!widget) return;

  const fill =
    widget.querySelector(
      ".trigger-fill"
    );

  const percent =
    widget.querySelector(
      ".trigger-percent"
    );

  const normalized =
    Math.max(
      0,
      Math.min(
        1,
        value
      )
    );

  const valuePercent =
    Math.round(
      normalized * 100
    );

  // =======================================================
  // BARRA
  // =======================================================

  if (fill) {

    const maxHeight = 92;

    const height =
      maxHeight * normalized;

    fill.setAttribute(
      "height",
      height
    );

    fill.setAttribute(
      "y",
      130 - height
    );

  }

  // =======================================================
  // PORCENTAJE
  // =======================================================

  if (percent) {

    percent.textContent =
      valuePercent + "%";

  }

  // =======================================================
  // ESTADO ACTIVO
  // =======================================================

  widget.classList.toggle(
    "active",
    normalized > 0.01
  );

}

// =========================================================
// PROGRESO DE BOTONES
// =========================================================

function markButtonTested(index) {

  if (
    testedButtons.includes(index)
  ) {
    return;
  }

  testedButtons.push(index);

  const chip =
    document.getElementById(
      "chip-" + index
    );

  if (chip) {

    chip.classList.add(
      "active"
    );

  }

  progressSpan.textContent =
    testedButtons.length;

}

// =========================================================
// VIBRACIÓN
// =========================================================

document
  .querySelectorAll(".vibe-btn")
  .forEach(btn => {

    btn.addEventListener(
      "click",
      async () => {

        if (gamepadIndex === null) {

          vibeNote.textContent =
            "Conectá un joystick primero";

          return;

        }

        const gp =
          navigator.getGamepads()
          [gamepadIndex];

        if (
          !gp ||
          !gp.vibrationActuator
        ) {

          vibeNote.textContent =
            "Vibración no soportada";

          return;

        }

        const type =
          btn.dataset.vibe;

        const params = {

          duration: 500,

          strongMagnitude: 0,

          weakMagnitude: 0

        };

        if (
          type === "light"
        ) {

          params.strongMagnitude =
            0.3;

          params.weakMagnitude =
            0.3;

        } else if (
          type === "heavy"
        ) {

          params.strongMagnitude =
            1.0;

          params.weakMagnitude =
            0.3;

        } else if (
          type === "full"
        ) {

          params.strongMagnitude =
            1.0;

          params.weakMagnitude =
            1.0;

        }

        try {

          await gp.vibrationActuator
            .playEffect(
              "dual-rumble",
              params
            );

          vibeNote.textContent =
            "Vibrando...";

        } catch (error) {

          console.error(
            "Error de vibración:",
            error
          );

          vibeNote.textContent =
            "Error de vibración";

        }

        setTimeout(() => {

          vibeNote.textContent =
            "";

        }, 500);

      }
    );

  });
