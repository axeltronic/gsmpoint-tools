/* =========================================================
   GAMEPAD TESTER
   GSMPoint Tools
========================================================= */

let gamepadIndex = null;


/* =========================================================
   ELEMENTOS PRINCIPALES
========================================================= */

const status =
    document.getElementById("connection-status");

const tester =
    document.getElementById("tester");

const controllerName =
    document.getElementById("controller-name");

const controllerType =
    document.getElementById("controller-type");

const progressSpan =
    document.getElementById("progress");

const progressPercent =
    document.getElementById("progress-percent");

const chipsContainer =
    document.getElementById("chips");

const vibeNote =
    document.getElementById("vibe-note");


/* =========================================================
   NOMBRES DE BOTONES
========================================================= */

const buttonNames = [
    "✕",
    "○",
    "□",
    "△",
    "L1",
    "R1",
    "L2",
    "R2",
    "Share",
    "Options",
    "L3",
    "R3",
    "↑",
    "↓",
    "←",
    "→",
    "Home"
];

const TOTAL_BUTTONS =
    buttonNames.length;

let testedButtons = [];


/* =========================================================
   CONEXIÓN
========================================================= */

window.addEventListener(
    "gamepadconnected",
    (e) => {

        gamepadIndex =
            e.gamepad.index;

        const type =
            detectController(e.gamepad);

        if (status) {
            status.textContent =
                "✅ Joystick conectado";
        }

        if (controllerName) {
            controllerName.textContent =
                e.gamepad.id;
        }

        if (controllerType) {
            controllerType.textContent =
                "Layout: " + type;
        }

        if (tester) {
            tester.classList.remove("hidden");
        }

        createButtonChips();
        resetVisualState();

    }
);


window.addEventListener(
    "gamepaddisconnected",
    () => {

        gamepadIndex = null;

        if (status) {
            status.textContent =
                "❌ Joystick desconectado";
        }

        if (tester) {
            tester.classList.add("hidden");
        }

        testedButtons = [];

        updateProgress();

        if (chipsContainer) {
            chipsContainer.innerHTML = "";
        }

        resetVisualState();

    }
);


/* =========================================================
   DETECTAR CONTROLADOR
========================================================= */

function detectController(gp) {

    const id =
        String(
            gp?.id || ""
        ).toLowerCase();


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


/* =========================================================
   CHIPS
========================================================= */

function createButtonChips() {

    if (!chipsContainer) return;

    chipsContainer.innerHTML = "";

    buttonNames.forEach(
        (name, index) => {

            const chip =
                document.createElement("span");

            chip.className =
                "chip";

            chip.id =
                "chip-" + index;

            chip.textContent =
                name;

            chipsContainer.appendChild(
                chip
            );

        }
    );
}


/* =========================================================
   BUSCAR BOTÓN DEL SVG
========================================================= */

function getButtonElement(index) {

    return (

        document.querySelector(
            `[data-button="${index}"]`
        )

        ||

        document.querySelector(
            `[data-btn="${index}"]`
        )

    );
}


/* =========================================================
   LOOP PRINCIPAL
========================================================= */

function update() {

    if (gamepadIndex !== null) {

        const gamepads =
            navigator.getGamepads();

        const gp =
            gamepads[gamepadIndex];

        if (gp) {

            window.__currentGamepad =
                gp;

            updateButtons(gp);
            updateSticks(gp);
            updateTriggers(gp);

        }
    }

    requestAnimationFrame(update);
}

update();


/* =========================================================
   BOTONES
========================================================= */

function updateButtons(gp) {

    if (!gp?.buttons) return;

    const maxButtons =
        Math.min(
            gp.buttons.length,
            TOTAL_BUTTONS
        );


    for (
        let i = 0;
        i < maxButtons;
        i++
    ) {

        const button =
            gp.buttons[i];

        if (!button) continue;

        /*
         * Para botones normales:
         * pressed = true
         *
         * Para sticks y triggers:
         * también existe value.
         *
         * En los botones usamos un umbral
         * muy pequeño para evitar falsos estados.
         */

        const pressed =
            Boolean(
                button.pressed ||
                button.value > 0.5
            );


        updateButtonVisual(
            i,
            pressed
        );


        if (pressed) {
            markButtonTested(i);
        }

    }
}


/* =========================================================
   VISUAL INDIVIDUAL DE BOTÓN
========================================================= */

function updateButtonVisual(
    index,
    pressed
) {

    const element =
        getButtonElement(index);


    /* =====================================================
       D-PAD
    ===================================================== */

    if (
        index >= 12 &&
        index <= 15
    ) {

        /*
         * Cada dirección es independiente.
         *
         * 12 = arriba
         * 13 = abajo
         * 14 = izquierda
         * 15 = derecha
         */

        if (element) {

            element.classList.toggle(
                "pressed",
                pressed
            );

        }


        updateDpadArrow(
            index,
            pressed
        );

        return;
    }


    /* =====================================================
       BOTONES NORMALES
    ===================================================== */

    if (element) {

        element.classList.toggle(
            "pressed",
            pressed
        );

    }
}


/* =========================================================
   D-PAD
========================================================= */

function updateDpadArrow(
    index,
    pressed
) {

    const dpad =
        document.querySelector(".dpad");

    if (!dpad) return;


    const arrows =
        dpad.querySelectorAll(
            ".dpad-arrow"
        );

    if (!arrows.length) return;


    /*
     * Orden esperado dentro del SVG:
     *
     * 0 = ↑
     * 1 = ↓
     * 2 = ←
     * 3 = →
     */

    const arrowIndex =
        index - 12;

    const arrow =
        arrows[arrowIndex];


    if (arrow) {

        arrow.classList.toggle(
            "pressed",
            pressed
        );

    }
}


/* =========================================================
   MARCAR BOTÓN PROBADO
========================================================= */

function markButtonTested(index) {

    if (
        index < 0 ||
        index >= TOTAL_BUTTONS
    ) {
        return;
    }


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


    updateProgress();
}


/* =========================================================
   PROGRESO GLOBAL
========================================================= */

function updateProgress() {

    const completed =
        Math.min(
            testedButtons.length,
            TOTAL_BUTTONS
        );


    const percentage =
        Math.round(
            (
                completed /
                TOTAL_BUTTONS
            ) * 100
        );


    if (progressSpan) {

        progressSpan.textContent =
            completed;

    }


    if (progressPercent) {

        progressPercent.textContent =
            percentage + "%";

    }
}


/* =========================================================
   STICKS
========================================================= */

const stickState = {

    left: {

        visited:
            new Set(),

        current:
            -1
    },


    right: {

        visited:
            new Set(),

        current:
            -1
    }

};


/* =========================================================
   COORDENADAS REALES DEL SVG
========================================================= */

const STICK_CONFIG = {

    left: {

        cx: 245,
        cy: 218

    },


    right: {

        cx: 435,
        cy: 218

    }

};


/* =========================================================
   CHECKPOINTS
========================================================= */

const CHECKPOINT_COUNT =
    72;

const CHECKPOINT_RADIUS =
    40;

const CHECKPOINT_INNER_RADIUS =
    35;


/* =========================================================
   OBTENER ELEMENTOS DEL STICK
========================================================= */

function getStickElements(side) {

    const container =
        document.querySelector(
            `[data-stick="${side}"]`
        );


    if (!container) {
        return null;
    }


    container.classList.add("ring");


    const elements = {

        container:

            container,


        knob:

            container.querySelector(
                ".analog-knob"
            ),


        progress:

            container.querySelector(
                ".analog-progress"
            ),


        percent:

            container.querySelector(
                ".analog-percent"
            ),


        ring:

            container.querySelector(
                ".analog-ring"
            ),


        line:

            container.querySelector(
                ".analog-line"
            ),


        dot:

            container.querySelector(
                ".analog-dot"
            )

    };


    ensureCheckpointRing(
        elements,
        side
    );


    return elements;
}


/* =========================================================
   CREAR CHECKPOINTS
========================================================= */

function ensureCheckpointRing(
    elements,
    side
) {

    if (!elements?.container) {
        return;
    }


    let ring =
        elements.container.querySelector(
            ".checkpoint-ring"
        );


    if (!ring) {

        ring =
            document.createElementNS(
                "http://www.w3.org/2000/svg",
                "g"
            );


        ring.classList.add(
            "checkpoint-ring"
        );


        elements.container.insertBefore(
            ring,
            elements.container.firstChild
        );


        const cfg =
            STICK_CONFIG[side];


        for (
            let i = 0;
            i < CHECKPOINT_COUNT;
            i++
        ) {

            const angle =
                -Math.PI / 2 +
                (
                    i /
                    CHECKPOINT_COUNT
                ) *
                Math.PI *
                2;


            const x1 =
                cfg.cx +
                Math.cos(angle) *
                CHECKPOINT_INNER_RADIUS;


            const y1 =
                cfg.cy +
                Math.sin(angle) *
                CHECKPOINT_INNER_RADIUS;


            const x2 =
                cfg.cx +
                Math.cos(angle) *
                CHECKPOINT_RADIUS;


            const y2 =
                cfg.cy +
                Math.sin(angle) *
                CHECKPOINT_RADIUS;


            const line =
                document.createElementNS(
                    "http://www.w3.org/2000/svg",
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


            ring.appendChild(
                line
            );
        }
    }


    /*
     * Ocultamos el círculo antiguo.
     */

    if (elements.progress) {

        elements.progress.style.stroke =
            "transparent";

        elements.progress.style.strokeDasharray =
            "none";

        elements.progress.style.strokeDashoffset =
            "0";

        elements.progress.removeAttribute(
            "transform"
        );

    }


    updateCheckpointClasses(
        elements,
        side
    );
}


/* =========================================================
   UPDATE STICKS
========================================================= */

function updateSticks(gp) {

    updateStick(
        "left",
        gp.axes?.[0] ?? 0,
        gp.axes?.[1] ?? 0
    );


    updateStick(
        "right",
        gp.axes?.[2] ?? 0,
        gp.axes?.[3] ?? 0
    );

}


/* =========================================================
   UPDATE INDIVIDUAL STICK
========================================================= */

function updateStick(
    side,
    rawX,
    rawY
) {

    const elements =
        getStickElements(side);


    if (
        !elements?.container ||
        !elements.knob
    ) {
        return;
    }


    const cfg =
        STICK_CONFIG[side];


    let x =
        Number.isFinite(rawX)
            ? rawX
            : 0;


    let y =
        Number.isFinite(rawY)
            ? rawY
            : 0;


    /* =====================================================
       DEAD ZONE
    ===================================================== */

    const deadZone =
        0.06;


    const rawMagnitude =
        Math.min(
            Math.hypot(
                x,
                y
            ),
            1
        );


    if (
        rawMagnitude <= deadZone
    ) {

        x = 0;
        y = 0;

    }

    else {

        const normalizedMagnitude =
            Math.min(
                (
                    rawMagnitude -
                    deadZone
                ) /
                (
                    1 -
                    deadZone
                ),
                1
            );


        const factor =
            normalizedMagnitude /
            rawMagnitude;


        x *= factor;
        y *= factor;
    }


    const magnitude =
        Math.min(
            Math.hypot(
                x,
                y
            ),
            1
        );


    /* =====================================================
       POSICIÓN KNOB
    ===================================================== */

    const maxMove =
        15;


    const knobX =
        cfg.cx +
        x *
        maxMove;


    const knobY =
        cfg.cy +
        y *
        maxMove;


    elements.knob.setAttribute(
        "cx",
        knobX.toFixed(2)
    );


    elements.knob.setAttribute(
        "cy",
        knobY.toFixed(2)
    );


    /* =====================================================
       PORCENTAJE
    ===================================================== */

    const percentage =
        Math.round(
            magnitude *
            100
        );


    if (elements.percent) {

        elements.percent.textContent =
            percentage + "%";

    }


    /* =====================================================
       ÁNGULO
    ===================================================== */

    let angle =
        Math.atan2(
            y,
            x
        );


    if (
        !Number.isFinite(angle)
    ) {
        angle = 0;
    }


    updateDirectionVisuals(
        elements,
        angle,
        magnitude,
        cfg
    );


    updateStickCheckpoint(
        side,
        angle,
        magnitude,
        elements
    );

}


/* =========================================================
   DIRECCIÓN DEL STICK
========================================================= */

function updateDirectionVisuals(
    elements,
    angle,
    magnitude,
    cfg
) {

    const radius =
        42;


    const px =
        cfg.cx +
        Math.cos(angle) *
        radius *
        magnitude;


    const py =
        cfg.cy +
        Math.sin(angle) *
        radius *
        magnitude;


    if (elements.line) {

        elements.line.setAttribute(
            "x1",
            cfg.cx
        );

        elements.line.setAttribute(
            "y1",
            cfg.cy
        );

        elements.line.setAttribute(
            "x2",
            px
        );

        elements.line.setAttribute(
            "y2",
            py
        );

    }


    if (elements.dot) {

        elements.dot.setAttribute(
            "cx",
            px
        );

        elements.dot.setAttribute(
            "cy",
            py
        );

    }

}


/* =========================================================
   CHECKPOINT DEL STICK
========================================================= */

function updateStickCheckpoint(
    side,
    angle,
    magnitude,
    elements
) {

    const state =
        stickState[side];


    if (!state) return;


    if (magnitude < 0.08) {

        state.current =
            -1;

        updateCheckpointClasses(
            elements,
            side
        );

        return;
    }


    let index =
        Math.round(
            (
                (
                    angle +
                    Math.PI / 2 +
                    Math.PI * 2
                ) %
                (
                    Math.PI * 2
                )
            ) /
            (
                Math.PI * 2
            ) *
            CHECKPOINT_COUNT
        );


    index =
        (
            index +
            CHECKPOINT_COUNT
        ) %
        CHECKPOINT_COUNT;


    state.visited.add(index);


    /*
     * Agregamos vecinos para que
     * el recorrido quede continuo.
     */

    state.visited.add(
        (
            index -
            1 +
            CHECKPOINT_COUNT
        ) %
        CHECKPOINT_COUNT
    );


    state.visited.add(
        (
            index +
            1
        ) %
        CHECKPOINT_COUNT
    );


    state.current =
        index;


    updateCheckpointClasses(
        elements,
        side
    );

}


/* =========================================================
   PINTAR CHECKPOINTS
========================================================= */

function updateCheckpointClasses(
    elements,
    side
) {

    if (!elements?.container) {
        return;
    }


    const state =
        stickState[side];


    if (!state) return;


    const checkpoints =
        elements.container.querySelectorAll(
            ".checkpoint-ring .checkpoint"
        );


    checkpoints.forEach(
        (
            checkpoint,
            index
        ) => {

            checkpoint.classList.toggle(
                "visited",
                state.visited.has(index)
            );


            checkpoint.classList.toggle(
                "current",
                index ===
                state.current
            );

        }
    );
}


/* =========================================================
   TRIGGERS L2 / R2
========================================================= */

function updateTriggers(gp) {

    /*
     * DualSense / PlayStation:
     *
     * 6 = L2
     * 7 = R2
     */

    const l2 =
        Number(
            gp.buttons?.[6]?.value ||
            0
        );


    const r2 =
        Number(
            gp.buttons?.[7]?.value ||
            0
        );


    updateTrigger(
        "l2",
        l2,
        6
    );


    updateTrigger(
        "r2",
        r2,
        7
    );

}


/* =========================================================
   COLOR DEL GATILLO
========================================================= */

function getTriggerColor(value) {

    const start = {
        r: 32,
        g: 41,
        b: 54
    };


    const end = {
        r: 22,
        g: 163,
        b: 74
    };


    const t =
        Math.max(
            0,
            Math.min(
                1,
                Number(value) || 0
            )
        );


    const eased =
        t * t *
        (
            3 -
            2 * t
        );


    const r =
        Math.round(
            start.r +
            (
                end.r -
                start.r
            ) *
            eased
        );


    const g =
        Math.round(
            start.g +
            (
                end.g -
                start.g
            ) *
            eased
        );


    const b =
        Math.round(
            start.b +
            (
                end.b -
                start.b
            ) *
            eased
        );


    return `rgb(${r}, ${g}, ${b})`;
}


/* =========================================================
   COLOR DEL BORDE
========================================================= */

function getTriggerStroke(value) {

    const start = {
        r: 17,
        g: 24,
        b: 39
    };


    const end = {
        r: 21,
        g: 128,
        b: 61
    };


    const t =
        Math.max(
            0,
            Math.min(
                1,
                Number(value) || 0
            )
        );


    const r =
        Math.round(
            start.r +
            (
                end.r -
                start.r
            ) *
            t
        );


    const g =
        Math.round(
            start.g +
            (
                end.g -
                start.g
            ) *
            t
        );


    const b =
        Math.round(
            start.b +
            (
                end.b -
                start.b
            ) *
            t
        );


    return `rgb(${r}, ${g}, ${b})`;
}


/* =========================================================
   MOVIMIENTO FÍSICO L2 / R2
========================================================= */

/*
 * IMPORTANTE
 *
 * Los gatillos del SVG aprobado están colocados:
 *
 *       L2
 *       L1
 *
 * y:
 *
 *       R2
 *       R1
 *
 * La parte curva queda hacia el EXTERIOR.
 *
 * El movimiento de L2/R2 se interpreta desde
 * una vista superior del mando.
 *
 * Por eso NO hacemos una rotación diagonal
 * grande.
 *
 * El movimiento principal es hacia ABAJO.
 *
 * Esto representa visualmente el hundimiento
 * del gatillo.
 *
 * El SVG debe contener:
 *
 * .trigger-widget[data-trigger="l2"]
 * .trigger-widget[data-trigger="r2"]
 */


/* =========================================================
   TRANSFORMACIÓN DEL GATILLO
========================================================= */

function getTriggerTransform(
    side,
    value
) {

    const t =
        Math.max(
            0,
            Math.min(
                1,
                Number(value) || 0
            )
        );


    /*
     * Suavizado.
     */

    const eased =
        t * t *
        (
            3 -
            2 * t
        );


    /*
     * Movimiento vertical.
     *
     * NO desplazamos horizontalmente.
     * NO hacemos una rotación exagerada.
     *
     * El gatillo se hunde hacia abajo.
     */

    const verticalMove =
        eased * 11;


    /*
     * Una rotación mínima solamente para
     * conservar sensación mecánica.
     *
     * El movimiento visual principal continúa
     * siendo vertical.
     */

    const smallRotation =
        eased * 1.5;


    if (side === "l2") {

        return `
            translate(
                0
                ${verticalMove.toFixed(3)}
            )
            rotate(
                ${(-smallRotation).toFixed(3)}
                99
                38
            )
        `;

    }


    return `
        translate(
            0
            ${verticalMove.toFixed(3)}
        )
        rotate(
            ${smallRotation.toFixed(3)}
            581
            38
        )
    `;
}


/* =========================================================
   UPDATE TRIGGER INDIVIDUAL
========================================================= */

function updateTrigger(
    side,
    value,
    buttonIndex
) {

    const widget =
        document.querySelector(
            `.trigger-widget[data-trigger="${side}"]`
        );


    if (!widget) return;


    const normalized =
        Math.max(
            0,
            Math.min(
                1,
                Number(value) || 0
            )
        );


    const percentage =
        Math.round(
            normalized *
            100
        );


    /* =====================================================
       CUERPO
    ===================================================== */

    const body =
        widget.querySelector(
            ".trigger-body"
        );


    if (body) {

        body.style.fill =
            getTriggerColor(
                normalized
            );


        body.style.stroke =
            getTriggerStroke(
                normalized
            );

    }


    /* =====================================================
       MOVIMIENTO
    ===================================================== */

    widget.setAttribute(
        "transform",
        getTriggerTransform(
            side,
            normalized
        )
    );


    widget.style.transition =
        "none";


    /* =====================================================
       REFLEJO
    ===================================================== */

    const highlight =
        widget.querySelector(
            ".trigger-highlight"
        );


    if (highlight) {

        highlight.style.opacity =
            String(
                0.75 -
                normalized *
                0.35
            );

    }


    /* =====================================================
       PORCENTAJE
    ===================================================== */

    const percent =
        widget.querySelector(
            ".trigger-percent"
        );


    if (percent) {

        percent.textContent =
            percentage + "%";


        percent.style.fill =
            normalized > 0.55
                ? "#ffffff"
                : "#cbd5e1";

    }


    /* =====================================================
       ESTADO PRESSED
    ===================================================== */

    widget.classList.toggle(
        "pressed",
        normalized > 0.05
    );


    if (body) {

        body.classList.toggle(
            "pressed",
            normalized > 0.10
        );

    }


    /* =====================================================
       MARCAR L2/R2 COMO PROBADOS
    ===================================================== */

    if (normalized > 0.10) {

        markButtonTested(
            buttonIndex
        );

    }

}


/* =========================================================
   VIBRACIÓN
========================================================= */

document
    .querySelectorAll(".vibe-btn")
    .forEach(
        (btn) => {

            btn.addEventListener(
                "click",
                async () => {

                    if (
                        gamepadIndex === null
                    ) {

                        if (vibeNote) {

                            vibeNote.textContent =
                                "Conectá un joystick primero";

                        }

                        return;
                    }


                    const gp =
                        navigator
                            .getGamepads()
                            [
                                gamepadIndex
                            ];


                    if (
                        !gp ||
                        !gp.vibrationActuator
                    ) {

                        if (vibeNote) {

                            vibeNote.textContent =
                                "Vibración no soportada";

                        }

                        return;
                    }


                    const type =
                        btn.dataset.vibe;


                    const params = {

                        duration:
                            500,

                        strongMagnitude:
                            0,

                        weakMagnitude:
                            0

                    };


                    if (
                        type === "light"
                    ) {

                        params.strongMagnitude =
                            0.3;

                        params.weakMagnitude =
                            0.3;

                    }


                    else if (
                        type === "heavy"
                    ) {

                        params.strongMagnitude =
                            1;

                        params.weakMagnitude =
                            0.3;

                    }


                    else if (
                        type === "full"
                    ) {

                        params.strongMagnitude =
                            1;

                        params.weakMagnitude =
                            1;

                    }


                    try {

                        await gp
                            .vibrationActuator
                            .playEffect(
                                "dual-rumble",
                                params
                            );


                        if (vibeNote) {

                            vibeNote.textContent =
                                "Vibrando...";

                        }

                    }


                    catch (error) {

                        console.error(
                            "Error de vibración:",
                            error
                        );


                        if (vibeNote) {

                            vibeNote.textContent =
                                "Error de vibración";

                        }

                    }


                    setTimeout(
                        () => {

                            if (vibeNote) {
                                vibeNote.textContent =
                                    "";
                            }

                        },
                        500
                    );

                }
            );

        }
    );


/* =========================================================
   RESET VISUAL
========================================================= */

function resetVisualState() {

    testedButtons = [];

    updateProgress();


    /* =====================================================
       LIMPIAR BOTONES
    ===================================================== */

    document
        .querySelectorAll(
            "[data-button], [data-btn]"
        )
        .forEach(
            (element) => {

                element.classList.remove(
                    "pressed"
                );

            }
        );


    /* =====================================================
       LIMPIAR CHIPS
    ===================================================== */

    document
        .querySelectorAll(".chip")
        .forEach(
            (chip) => {

                chip.classList.remove(
                    "active"
                );

            }
        );


    /* =====================================================
       LIMPIAR D-PAD
    ===================================================== */

    document
        .querySelectorAll(
            ".dpad-arrow"
        )
        .forEach(
            (arrow) => {

                arrow.classList.remove(
                    "pressed"
                );

            }
        );


    /* =====================================================
       RESET STICKS
    ===================================================== */

    Object.keys(
        stickState
    ).forEach(
        (side) => {

            stickState[
                side
            ].visited.clear();


            stickState[
                side
            ].current =
                -1;

        }
    );


    [
        "left",
        "right"
    ].forEach(
        (side) => {

            const elements =
                getStickElements(
                    side
                );


            const cfg =
                STICK_CONFIG[
                    side
                ];


            if (!elements) return;


            if (elements.knob) {

                elements.knob.setAttribute(
                    "cx",
                    cfg.cx
                );


                elements.knob.setAttribute(
                    "cy",
                    cfg.cy
                );

            }


            if (elements.percent) {

                elements.percent.textContent =
                    "0%";

            }


            if (elements.line) {

                elements.line.setAttribute(
                    "x1",
                    cfg.cx
                );


                elements.line.setAttribute(
                    "y1",
                    cfg.cy
                );


                elements.line.setAttribute(
                    "x2",
                    cfg.cx
                );


                elements.line.setAttribute(
                    "y2",
                    cfg.cy
                );

            }


            if (elements.dot) {

                elements.dot.setAttribute(
                    "cx",
                    cfg.cx
                );


                elements.dot.setAttribute(
                    "cy",
                    cfg.cy
                );

            }


            updateCheckpointClasses(
                elements,
                side
            );

        }
    );


    /* =====================================================
       RESET L2 / R2
    ===================================================== */

    document
        .querySelectorAll(
            ".trigger-widget"
        )
        .forEach(
            (widget) => {

                widget.classList.remove(
                    "active"
                );


                widget.classList.remove(
                    "pressed"
                );


                /*
                 * Volver exactamente a la posición
                 * original definida por el SVG.
                 */

                widget.removeAttribute(
                    "transform"
                );


                widget.style.transition =
                    "none";


                const body =
                    widget.querySelector(
                        ".trigger-body"
                    );


                const highlight =
                    widget.querySelector(
                        ".trigger-highlight"
                    );


                const percent =
                    widget.querySelector(
                        ".trigger-percent"
                    );


                if (body) {

                    body.style.fill =
                        "#202936";


                    body.style.stroke =
                        "#111827";


                    body.classList.remove(
                        "pressed"
                    );

                }


                if (highlight) {

                    highlight.style.opacity =
                        ".9";

                }


                if (percent) {

                    percent.textContent =
                        "0%";


                    percent.style.fill =
                        "#cbd5e1";

                }

            }
        );


    window.__currentGamepad =
        null;

}
