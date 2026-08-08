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
            detectController(
                e.gamepad
            );

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

            tester.classList.remove(
                "hidden"
            );

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

            tester.classList.add(
                "hidden"
            );

        }

        testedButtons = [];

        if (progressSpan) {

            progressSpan.textContent =
                "0";

        }

        if (chipsContainer) {

            chipsContainer.innerHTML =
                "";

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

    chipsContainer.innerHTML =
        "";

    buttonNames.forEach(
        (name, index) => {

            const chip =
                document.createElement(
                    "span"
                );

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

            window.__currentGamepad =
                gp;

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


/* =========================================================
   BOTONES
========================================================= */

function updateButtons(gp) {

    const maxButtons =
        Math.min(
            gp.buttons.length,
            17
        );


    for (
        let i = 0;
        i < maxButtons;
        i++
    ) {

        const button =
            gp.buttons[i];

        if (!button) continue;


        const pressed =
            Boolean(
                button.pressed ||
                button.value > 0.1
            );


        updateButtonVisual(
            i,
            pressed,
            gp
        );


        if (pressed) {

            markButtonTested(i);

        }

    }

}


/* =========================================================
   VISUAL DEL BOTÓN
========================================================= */

function updateButtonVisual(
    index,
    pressed,
    gp
) {

    const element =
        getButtonElement(index);


    if (element) {

        element.classList.toggle(
            "pressed",
            pressed
        );

    }


    /*
       D-PAD

       El mando SVG tiene una sola pieza
       visual para el D-Pad.

       Las 4 direcciones tienen sus
       propios data-btn.
    */

    if (
        index >= 12 &&
        index <= 15
    ) {

        const dpad =
            document.querySelector(
                ".dpad-main"
            );


        if (dpad) {

            let anyPressed = false;


            for (
                let i = 12;
                i <= 15;
                i++
            ) {

                if (
                    gp.buttons[i]?.pressed ||
                    gp.buttons[i]?.value > 0.1
                ) {

                    anyPressed = true;

                    break;

                }

            }


            dpad.classList.toggle(
                "pressed",
                anyPressed
            );

        }

    }

}


/* =========================================================
   MARCAR BOTÓN PROBADO
========================================================= */

function markButtonTested(index) {

    if (
        testedButtons.includes(index)
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


    if (progressSpan) {

        progressSpan.textContent =
            testedButtons.length;

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


/*
   Cantidad de checkpoints
*/

const CHECKPOINT_COUNT =
    72;


/*
   Radio externo
*/

const CHECKPOINT_RADIUS =
    40;


/*
   Radio interno
*/

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


    /*
       Activamos el sistema de
       checkpoints sobre el grupo SVG.
    */

    container.classList.add(
        "ring"
    );


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

    if (
        !elements?.container
    ) {

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


        /*
           Lo ponemos detrás del knob
           pero delante del fondo.
        */

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
       Ocultamos el antiguo círculo
       de progreso porque ahora
       usamos los checkpoints reales.
    */

    if (
        elements.progress
    ) {

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
        getStickElements(
            side
        );


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
        rawMagnitude <=
        deadZone
    ) {

        x = 0;

        y = 0;

    }

    else {

        /*
           Quitamos la zona muerta
           para que el porcentaje
           sea más preciso.
        */

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
       POSICIÓN REAL DEL KNOB SVG
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


    /*
       IMPORTANTE:

       NO usamos:

       style.transform

       porque el knob es un
       elemento SVG.

       Modificamos directamente
       cx / cy.
    */

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


    if (
        elements.percent
    ) {

        elements.percent.textContent =
            percentage +
            "%";

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
        !Number.isFinite(
            angle
        )
    ) {

        angle = 0;

    }


    /* =====================================================
       DIRECCIÓN LEGACY
    ===================================================== */

    updateDirectionVisuals(
        elements,
        angle,
        magnitude,
        cfg
    );


    /* =====================================================
       CHECKPOINT
    ===================================================== */

    updateStickCheckpoint(
        side,
        angle,
        magnitude,
        elements
    );

}


/* =========================================================
   DIRECCIÓN
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


    if (
        elements.line
    ) {

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


    if (
        elements.dot
    ) {

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
   CHECKPOINTS
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


    if (
        magnitude <
        0.08
    ) {

        state.current =
            -1;


        updateCheckpointClasses(
            elements,
            side
        );


        return;

    }


    /*
       0 = ARRIBA

       18 = DERECHA

       36 = ABAJO

       54 = IZQUIERDA
    */

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


    state.visited.add(
        index
    );


    /*
       Suavizamos el movimiento
       agregando vecinos.
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

    if (
        !elements?.container
    ) {

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
                state.visited.has(
                    index
                )
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
        l2
    );


    updateTrigger(
        "r2",
        r2
    );

}


/* =========================================================
   UPDATE TRIGGER
========================================================= */

function updateTrigger(
    side,
    value
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
                Number(value) ||
                0
            )
        );


    const percentage =
        Math.round(
            normalized *
            100
        );


    /* =====================================================
       BARRA
    ===================================================== */

    const fill =
        widget.querySelector(
            ".trigger-fill"
        );


    const track =
        widget.querySelector(
            ".trigger-track"
        );


    if (fill) {

        const trackY =
            Number(
                track?.getAttribute(
                    "y"
                )
            ) ||
            38;


        const trackHeight =
            Number(
                track?.getAttribute(
                    "height"
                )
            ) ||
            92;


        const height =
            trackHeight *
            normalized;


        const bottom =
            trackY +
            trackHeight;


        fill.setAttribute(
            "height",
            height.toFixed(2)
        );


        fill.setAttribute(
            "y",
            (
                bottom -
                height
            ).toFixed(2)
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
            percentage +
            "%";

    }


    /* =====================================================
       ESTADO ACTIVO
    ===================================================== */

    widget.classList.toggle(
        "active",
        normalized >
        0.01
    );


    /* =====================================================
       BOTÓN
    ===================================================== */

    const button =
        widget.querySelector(
            "[data-button]"
        )
        ||
        widget.querySelector(
            "[data-btn]"
        );


    if (button) {

        button.classList.toggle(
            "pressed",
            normalized >
            0.1
        );

    }


    /*
       L2/R2 también cuentan
       como botones probados.
    */

    if (
        normalized >
        0.1
    ) {

        markButtonTested(
            side === "l2"
                ? 6
                : 7
        );

    }

}


/* =========================================================
   VIBRACIÓN
========================================================= */

document
    .querySelectorAll(
        ".vibe-btn"
    )
    .forEach(
        (btn) => {

            btn.addEventListener(
                "click",
                async () => {

                    if (
                        gamepadIndex ===
                        null
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
                            [gamepadIndex];


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
                        type ===
                        "light"
                    ) {

                        params.strongMagnitude =
                            0.3;

                        params.weakMagnitude =
                            0.3;

                    }


                    else if (
                        type ===
                        "heavy"
                    ) {

                        params.strongMagnitude =
                            1;

                        params.weakMagnitude =
                            0.3;

                    }


                    else if (
                        type ===
                        "full"
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


    if (progressSpan) {

        progressSpan.textContent =
            "0";

    }


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


    document
        .querySelectorAll(
            ".chip"
        )
        .forEach(
            (chip) => {

                chip.classList.remove(
                    "active"
                );

            }
        );


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


            if (
                elements.knob
            ) {

                elements.knob.setAttribute(
                    "cx",
                    cfg.cx
                );

                elements.knob.setAttribute(
                    "cy",
                    cfg.cy
                );

                elements.knob.style.transform =
                    "none";

            }


            if (
                elements.percent
            ) {

                elements.percent.textContent =
                    "0%";

            }


            if (
                elements.line
            ) {

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


            if (
                elements.dot
            ) {

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


    document
        .querySelectorAll(
            ".trigger-widget"
        )
        .forEach(
            (widget) => {

                widget.classList.remove(
                    "active"
                );


                const fill =
                    widget.querySelector(
                        ".trigger-fill"
                    );


                const percent =
                    widget.querySelector(
                        ".trigger-percent"
                    );


                const track =
                    widget.querySelector(
                        ".trigger-track"
                    );


                if (fill) {

                    const trackY =
                        Number(
                            track?.getAttribute(
                                "y"
                            )
                        ) ||
                        38;


                    const trackHeight =
                        Number(
                            track?.getAttribute(
                                "height"
                            )
                        ) ||
                        92;


                    fill.setAttribute(
                        "height",
                        "0"
                    );


                    fill.setAttribute(
                        "y",
                        trackY +
                        trackHeight
                    );

                }


                if (percent) {

                    percent.textContent =
                        "0%";

                }

            }
        );


    window.__currentGamepad =
        null;

}
