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

    controllerName.textContent =
        e.gamepad.id;

    controllerType.textContent =
        "Layout: " + type;

    tester.classList.remove("hidden");

    createButtonChips();

});


window.addEventListener("gamepaddisconnected", () => {

    gamepadIndex = null;

    status.innerHTML =
        "❌ Joystick desconectado";

    tester.classList.add("hidden");

    testedButtons = [];

    progressSpan.textContent = "0";

    chipsContainer.innerHTML = "";

    resetStickHistory();

    resetTriggers();

});


// =========================================================
// DETECTAR CONTROLADOR
// =========================================================

function detectController(gp) {

    const id =
        gp.id.toLowerCase();


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

        const chip =
            document.createElement("span");

        chip.className = "chip";

        chip.id =
            "chip-" + index;

        chip.textContent =
            name;

        chipsContainer.appendChild(
            chip
        );

    });

}


// =========================================================
// STICK CHECKPOINT DATA
// =========================================================

const stickData = {

    "stick-l": {

        total: 180,

        visited:
            new Array(180).fill(false),

        segments: [],

        current: -1

    },

    "stick-r": {

        total: 180,

        visited:
            new Array(180).fill(false),

        segments: [],

        current: -1

    }

};


// =========================================================
// CREAR CHECKPOINTS
// =========================================================

function createRing(
    ringId,
    stickId
) {

    const group =
        document.getElementById(
            ringId
        );

    if (!group) return;

    const data =
        stickData[stickId];

    if (!data) return;


    // Evitar duplicados

    if (
        data.segments.length > 0
    ) {

        return;

    }


    const NS =
        "http://www.w3.org/2000/svg";

    const total =
        data.total;


    /*
        Centro = 50 / 50
        Radio interno = 42
        Radio externo = 48
    */

    const inner =
        42;

    const outer =
        48;


    for (
        let i = 0;
        i < total;
        i++
    ) {

        /*
            Primer checkpoint arriba.
        */

        const angle =
            (
                i /
                total
            ) *
            Math.PI *
            2 -
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


        data.segments.push(
            line
        );

    }

}


// =========================================================
// CREAR LOS DOS AROS
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
// RESETEAR AROS
// =========================================================

function resetStickHistory() {

    Object.keys(
        stickData
    ).forEach(stickId => {

        const data =
            stickData[stickId];

        data.visited.fill(false);

        data.current = -1;

        data.segments.forEach(
            segment => {

                segment.classList.remove(
                    "visited"
                );

                segment.classList.remove(
                    "current"
                );

            }
        );

    });

}


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
            gamepads[
                gamepadIndex
            ];


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
            Compatible con:

            data-btn="0"

            y

            data-button="0"
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


    const data =
        stickData[stickId];

    if (!data) return;


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

    const maxMove =
        stick.offsetWidth *
        0.16;


    const dx =
        x * maxMove;

    const dy =
        y * maxMove;


    knob.style.transform =
        `translate(
            calc(-50% + ${dx}px),
            calc(-50% + ${dy}px)
        )`;


    // =======================================================
    // DIRECCIÓN
    // =======================================================

    let angle =
        Math.atan2(
            y,
            x
        );


    const cx =
        50;

    const cy =
        50;

    const radius =
        46;


    const px =
        cx +
        Math.cos(angle) *
        radius;

    const py =
        cy +
        Math.sin(angle) *
        radius;


    // =======================================================
    // LÍNEA
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

    if (
        magnitude >=
        deadZone
    ) {

        /*
            Convertimos el ángulo
            a un índice entre 0 y 179.

            El índice 0 está arriba.
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
                data.total
            );


        if (
            index < 0
        ) {

            index = 0;

        }


        if (
            index >=
            data.total
        ) {

            index =
                data.total - 1;

        }


        // ===================================================
        // MARCAR ACTUAL
        // ===================================================

        data.visited[index] =
            true;


        /*
            Dos vecinos para evitar
            huecos entre movimientos.
        */

        data.visited[
            (
                index -
                1 +
                data.total
            ) %
            data.total
        ] = true;


        data.visited[
            (
                index +
                1
            ) %
            data.total
        ] = true;


        // ===================================================
        // PINTAR ARO
        // ===================================================

        for (
            let i = 0;
            i < data.total;
            i++
        ) {

            const segment =
                data.segments[i];

            if (!segment) continue;


            segment.classList.toggle(
                "visited",
                data.visited[i]
            );


            segment.classList.remove(
                "current"
            );

        }


        // ===================================================
        // CHECKPOINT ACTUAL
        // ===================================================

        if (
            data.segments[index]
        ) {

            data.segments[index]
                .classList.add(
                    "current"
                );

        }


        data.current =
            index;

    }


    // =======================================================
    // PORCENTAJE DEL RECORRIDO
    // =======================================================

    const visited =
        data.visited.filter(
            Boolean
        ).length;


    const coverage =
        Math.round(
            (
                visited /
                data.total
            ) *
            100
        );


    if (text) {

        text.textContent =
            coverage + "%";

    }

}


// =========================================================
// TRIGGERS L2 / R2
// =========================================================

function updateTriggers(gp) {

    const l2 =
        gp.buttons[6]?.value || 0;

    const r2 =
        gp.buttons[7]?.value || 0;


    updateTrigger(
        "l2",
        l2
    );


    updateTrigger(
        "r2",
        r2
    );

}


// =========================================================
// UPDATE TRIGGER
// =========================================================

function updateTrigger(
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


    const button =
        widget.querySelector(
            "[data-btn]"
        );


    // =======================================================
    // NORMALIZAR 0 - 1
    // =======================================================

    const normalized =
        Math.max(
            0,
            Math.min(
                1,
                Number(value) || 0
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

        fill.style.height =
            `${valuePercent}%`;

    }


    // =======================================================
    // PORCENTAJE
    // =======================================================

    if (percent) {

        percent.textContent =
            `${valuePercent}%`;

    }


    // =======================================================
    // ESTADO ACTIVO
    // =======================================================

    widget.classList.toggle(
        "active",
        normalized > 0.01
    );


    // =======================================================
    // BOTÓN
    // =======================================================

    if (button) {

        button.classList.toggle(
            "pressed",
            normalized > 0.1
        );

    }

}


// =========================================================
// RESET TRIGGERS
// =========================================================

function resetTriggers() {

    document
        .querySelectorAll(
            ".trigger-widget"
        )
        .forEach(widget => {

            const fill =
                widget.querySelector(
                    ".trigger-fill"
                );

            const percent =
                widget.querySelector(
                    ".trigger-percent"
                );

            const button =
                widget.querySelector(
                    "[data-btn]"
                );


            if (fill) {

                fill.style.height =
                    "0%";

            }


            if (percent) {

                percent.textContent =
                    "0%";

            }


            widget.classList.remove(
                "active"
            );


            if (button) {

                button.classList.remove(
                    "pressed"
                );

            }

        });

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
                        gamepadIndex ===
                        null
                    ) {

                        vibeNote.textContent =
                            "Conectá un joystick primero";

                        return;

                    }


                    const gp =
                        navigator
                            .getGamepads()
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


                    // -----------------------------------------
                    // SUAVE
                    // -----------------------------------------

                    if (
                        type === "light"
                    ) {

                        params.strongMagnitude =
                            0.3;

                        params.weakMagnitude =
                            0.3;

                    }


                    // -----------------------------------------
                    // FUERTE
                    // -----------------------------------------

                    else if (
                        type === "heavy"
                    ) {

                        params.strongMagnitude =
                            1.0;

                        params.weakMagnitude =
                            0.3;

                    }


                    // -----------------------------------------
                    // COMPLETA
                    // -----------------------------------------

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


                    } catch (error) {

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
