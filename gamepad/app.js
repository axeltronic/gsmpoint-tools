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
// STICK CHECKPOINT DATA
// =========================================================

const stickHistory = {

  "stick-l":
    new Array(180).fill(false),

  "stick-r":
    new Array(180).fill(false)

};

const ringSegments = {

  "stick-l": [],

  "stick-r": []

};

// =========================================================
// CREAR RING DE CHECKPOINTS
// =========================================================

function createRing(ringId, stickId) {

  const group =
    document.getElementById(ringId);

  if (!group) return;

  // Evita duplicarlos
  if (
    ringSegments[stickId].length > 0
  ) {
    return;
  }

  const NS =
    "http://www.w3.org/2000/svg";

  const total = 180;

  const inner = 42;
  const outer = 48;

  for (
    let i = 0;
    i < total;
    i++
  ) {

    /*
      Empieza arriba y gira en sentido horario.
    */

    const angle =
      (i / total) *
      Math.PI * 2 -
      Math.PI / 2;

    const x1 =
      50 +
      Math.cos(angle) *
      inner;

    const y1 =
      50 +
      Math.sin(angle) *
      inner;

    const x2 =
      50 +
      Math.cos(angle) *
      outer;

    const y2 =
      50 +
      Math.sin(angle) *
      outer;

    const line =
      document.createElementNS(
        NS,
        "line"
      );

    line.setAttribute(
      "x1",
      x1
    );

    line.setAttribute(
      "y1",
      y1
    );

    line.setAttribute(
      "x2",
      x2
    );

    line.setAttribute(
      "y2",
      y2
    );

    line.classList.add(
      "checkpoint"
    );

    group.appendChild(
      line
    );

    ringSegments[stickId].push(
      line
    );

  }

}

// =========================================================
// CREAR LOS DOS RINGS
// =========================================================

createRing(
  "ring-l",
  "stick-l"
);

createRing(
  "ring-r",
  "stick-r"
);

// =========================================================
// MAIN LOOP
// =========================================================

function update() {

  if (
    gamepadIndex !== null
  ) {

    const gamepads =
      navigator.getGamepads();

    const gp =
      gamepads[gamepadIndex];

    if (gp) {

      updateButtons(gp);

      updateSticks(gp);

      updateTriggers(gp);

    }

  }

  requestAnimationFrame(
    update
  );

}

update();

// =========================================================
// BOTONES
// =========================================================

function updateButtons(gp) {

  for (
    let i = 0;
    i <= 16;
    i++
  ) {

    const button =
      gp.buttons[i];

    if (!button) continue;

    /*
      Soporta ambos sistemas:
      data-btn
      data-button
    */

    const element =
      document.querySelector(
        `[data-btn="${i}"]`
      ) ||
      document.querySelector(
        `[data-button="${i}"]`
      );

    if (!element) continue;

    if (
      button.pressed
    ) {

      element.classList.add(
        "pressed"
      );

      markButtonTested(i);

    } else {

      element.classList.remove(
        "pressed"
      );

    }

  }

}

// =========================================================
// STICKS
// =========================================================

function updateSticks(gp) {

  updateStick(
    "stick-l",
    "knob-l",
    "dial-l-line",
    "dial-l-dot",
    "dial-l-txt",
    gp.axes[0],
    gp.axes[1]
  );

  updateStick(
    "stick-r",
    "knob-r",
    "dial-r-line",
    "dial-r-dot",
    "dial-r-txt",
    gp.axes[2],
    gp.axes[3]
  );

}

// =========================================================
// UPDATE STICK
// =========================================================

function updateStick(
  stickId,
  knobId,
  lineId,
  dotId,
  textId,
  rawX,
  rawY
) {

  const stick =
    document.getElementById(
      stickId
    );

  const knob =
    document.getElementById(
      knobId
    );

  const line =
    document.getElementById(
      lineId
    );

  const dot =
    document.getElementById(
      dotId
    );

  const text =
    document.getElementById(
      textId
    );

  if (
    !stick ||
    !knob
  ) {
    return;
  }

  // =======================================================
  // VALORES
  // =======================================================

  let x =
    Number.isFinite(rawX)
      ? rawX
      : 0;

  let y =
    Number.isFinite(rawY)
      ? rawY
      : 0;

  // =======================================================
  // DEAD ZONE
  // =======================================================

  const deadZone =
    0.08;

  if (
    Math.abs(x) <
    deadZone
  ) {
    x = 0;
  }

  if (
    Math.abs(y) <
    deadZone
  ) {
    y = 0;
  }

  // =======================================================
  // MAGNITUD
  // =======================================================

  let magnitude =
    Math.hypot(
      x,
      y
    );

  magnitude =
    Math.min(
      magnitude,
      1
    );

  // =======================================================
  // MOVIMIENTO DEL KNOB
  // =======================================================

  const knobMove =
    stick.offsetWidth *
    0.16;

  const dx =
    x * knobMove;

  const dy =
    y * knobMove;

  /*
    Mantenemos el centro del knob.
  */

  knob.style.transform =
    `translate(
      calc(-50% + ${dx}px),
      calc(-50% + ${dy}px)
    )`;

  // =======================================================
  // PORCENTAJE DE INCLINACIÓN
  // =======================================================

  /*
    Si el stick está quieto,
    mostramos 0%.
  */

  if (
    magnitude < deadZone
  ) {

    if (text) {

      text.textContent =
        "0%";

    }

  }

  // =======================================================
  // DIRECCIÓN
  // =======================================================

  let angle =
    Math.atan2(
      y,
      x
    );

  /*
    Centro del dial.
  */

  const cx = 50;
  const cy = 50;

  const radius = 46;

  const px =
    cx +
    Math.cos(angle) *
    radius;

  const py =
    cy +
    Math.sin(angle) *
    radius;

  // =======================================================
  // LINEA
  // =======================================================

  if (line) {

    line.setAttribute(
      "x1",
      cx
    );

    line.setAttribute(
      "y1",
      cy
    );

    line.setAttribute(
      "x2",
      px
    );

    line.setAttribute(
      "y2",
      py
    );

  }

  // =======================================================
  // DOT
  // =======================================================

  if (dot) {

    dot.setAttribute(
      "cx",
      px
    );

    dot.setAttribute(
      "cy",
      py
    );

  }

  // =======================================================
  // CHECKPOINTS
  // =======================================================

  const ring =
    ringSegments[
      stickId
    ];

  const history =
    stickHistory[
      stickId
    ];

  if (
    ring &&
    history
  ) {

    /*
      Solo registramos recorrido
      cuando realmente se mueve.
    */

    if (
      magnitude >=
      deadZone
    ) {

      /*
        Convertimos el ángulo
        a 0-179.

        -PI/2 = arriba
        0     = derecha
        PI/2  = abajo
        PI    = izquierda
      */

      let index =
        Math.floor(
          (
            (
              angle +
              Math.PI / 2 +
              Math.PI * 2
            ) %
            (Math.PI * 2)
          ) /
          (Math.PI * 2) *
          180
        );

      if (
        index < 0
      ) {
        index = 0;
      }

      if (
        index >= 180
      ) {
        index = 179;
      }

      // ===================================================
      // MARCAR ACTUAL
      // ===================================================

      history[index] =
        true;

      // ===================================================
      // VECINOS
      // ===================================================

      history[
        (index - 1 + 180) %
        180
      ] = true;

      history[
        (index + 1) %
        180
      ] = true;

      // ===================================================
      // REPINTAR
      // ===================================================

      for (
        let i = 0;
        i < 180;
        i++
      ) {

        const segment =
          ring[i];

        if (!segment) {
          continue;
        }

        segment.classList.toggle(
          "visited",
          history[i]
        );

        segment.classList.remove(
          "current"
        );

      }

      // ===================================================
      // CHECKPOINT ACTUAL
      // ===================================================

      if (
        ring[index]
      ) {

        ring[index]
          .classList.add(
            "current"
          );

      }

    }

    // =====================================================
    // PORCENTAJE DE RECORRIDO
    // =====================================================

    const visited =
      history.filter(
        Boolean
      ).length;

    const coverage =
      Math.round(
        (
          visited /
          180
        ) *
        100
      );

    if (text) {

      text.textContent =
        coverage + "%";

    }

  }

}

// =========================================================
// TRIGGERS L2 / R2
// =========================================================

function updateTriggers(gp) {

  const l2 =
    gp.buttons[6]?.value ||
    0;

  const r2 =
    gp.buttons[7]?.value ||
    0;

  updateTriggerSVG(
    "l2",
    l2
  );

  updateTriggerSVG(
    "r2",
    r2
  );

  // -------------------------------------------------------
  // COMPATIBILIDAD CON SISTEMA ANTIGUO
  // -------------------------------------------------------

  const l2Btn =
    document.querySelector(
      ".trigger-2d.l2"
    );

  const r2Btn =
    document.querySelector(
      ".trigger-2d.r2"
    );

  if (l2Btn) {

    l2Btn.style.transform =
      `translateY(
        ${l2 * 6}px
      )`;

    l2Btn.classList.toggle(
      "pressed",
      l2 > 0.1
    );

  }

  if (r2Btn) {

    r2Btn.style.transform =
      `translateY(
        ${r2 * 6}px
      )`;

    r2Btn.classList.toggle(
      "pressed",
      r2 > 0.1
    );

  }

}

// =========================================================
// TRIGGER SVG
// =========================================================

function updateTriggerSVG(
  side,
  value
) {

  const widget =
    document.querySelector(
      `.trigger-widget[data-trigger="${side}"]`
    );

  if (!widget) {
    return;
  }

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

    const maxHeight =
      92;

    const height =
      maxHeight *
      normalized;

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
  // ACTIVO
  // =======================================================

  widget.classList.toggle(
    "active",
    normalized > 0.01
  );

}

// =========================================================
// PROGRESO DE BOTONES
// =========================================================

function markButtonTested(
  index
) {

  if (
    testedButtons.includes(
      index
    )
  ) {
    return;
  }

  testedButtons.push(
    index
  );

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
  .querySelectorAll(
    ".vibe-btn"
  )
  .forEach(
    btn => {

      btn.addEventListener(
        "click",
        async () => {

          if (
            gamepadIndex === null
          ) {

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

          // -------------------------------------------------
          // VIBRACIÓN SUAVE
          // -------------------------------------------------

          if (
            type === "light"
          ) {

            params.strongMagnitude =
              0.3;

            params.weakMagnitude =
              0.3;

          }

          // -------------------------------------------------
          // VIBRACIÓN FUERTE
          // -------------------------------------------------

          else if (
            type === "heavy"
          ) {

            params.strongMagnitude =
              1.0;

            params.weakMagnitude =
              0.3;

          }

          // -------------------------------------------------
          // VIBRACIÓN COMPLETA
          // -------------------------------------------------

          else if (
            type === "full"
          ) {

            params.strongMagnitude =
              1.0;

            params.weakMagnitude =
              1.0;

          }

          try {

            await gp
              .vibrationActuator
              .playEffect(
                "dual-rumble",
                params
              );

            vibeNote.textContent =
              "Vibrando...";

          }

          catch (error) {

            console.error(
              "Error de vibración:",
              error
            );

            vibeNote.textContent =
              "Error de vibración";

          }

          setTimeout(
            () => {

              vibeNote.textContent =
                "";

            },
            500
          );

        }
      );

    }
  );
