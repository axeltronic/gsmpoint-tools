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


        const element =
            getButtonElement(i);


        if (!element) continue;


        const pressed =
            Boolean(
                button.pressed ||
                button.value > 0.1
            );


        if (pressed) {

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
   OBTENER ELEMENTOS DEL STICK
========================================================= */

function getStickElements(side) {

    const stick =
        document.querySelector(
            `[data-stick="${side}"]`
        );


    if (stick) {

        return {

            container:
                stick,

            knob:
                stick.querySelector(
                    ".analog-knob"
                ),

            progress:
                stick.querySelector(
                    ".analog-progress"
                ),

            percent:
                stick.querySelector(
                    ".analog-percent"
                ),

            ring:
                stick.querySelector(
                    ".analog-ring"
                ),

            line:
                stick.querySelector(
                    ".analog-line"
                ),

            dot:
                stick.querySelector(
                    ".analog-dot"
                )

        };

    }


    /* -------------------------------------------------------
       COMPATIBILIDAD CON LA ESTRUCTURA ANTERIOR
    ------------------------------------------------------- */

    const oldId =
        side === "left"
            ? "stick-l"
            : "stick-r";


    return {

        container:
            document.getElementById(
                oldId
            ),

        knob:
            document.getElementById(
                side === "left"
                    ? "knob-l"
                    : "knob-r"
            ),

        progress:
            document.getElementById(
                side === "left"
                    ? "dial-l-progress"
                    : "dial-r-progress"
            ),

        percent:
            document.getElementById(
                side === "left"
                    ? "dial-l-txt"
                    : "dial-r-txt"
            ),

        ring:
            null,

        line:
            document.getElementById(
                side === "left"
                    ? "dial-l-line"
                    : "dial-r-line"
            ),

        dot:
            document.getElementById(
                side === "left"
                    ? "dial-l-dot"
                    : "dial-r-dot"
            )

    };

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
        !elements.container ||
        !elements.knob
    ) {

        return;

    }


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


    /* =====================================================
       MAGNITUD
    ===================================================== */

    const magnitude =
        Math.min(
            Math.hypot(
                x,
                y
            ),
            1
        );


    /* =====================================================
       POSICIÓN DEL KNOB
    ===================================================== */

    const container =
        elements.container;


    const size =
        Math.min(
            container.clientWidth ||
            0,

            container.clientHeight ||
            0
        );


    /*
       Distancia máxima del knob.

       Se calcula según el tamaño real
       del SVG para que no se deforme.
    */

    const maxMove =
        size * 0.27;


    const dx =
        x * maxMove;


    const dy =
        y * maxMove;


    elements.knob.style.transform =
        `translate(
            ${dx}px,
            ${dy}px
        )`;


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


    /* =====================================================
       PORCENTAJE DEL STICK
    ===================================================== */

    const percentage =
        Math.round(
            magnitude * 100
        );


    if (elements.percent) {

        elements.percent.textContent =
            percentage + "%";

    }


    /* =====================================================
       PROGRESO CIRCULAR SVG
    ===================================================== */

    if (
        elements.progress
    ) {

        const length =
            getCircleLength(
                elements.progress
            );


        if (length > 0) {

            elements.progress.style.strokeDasharray =
                length;


            elements.progress.style.strokeDashoffset =
                length -
                (
                    length *
                    magnitude
                );

        }

    }


    /* =====================================================
       LÍNEA / DOT
    ===================================================== */

    updateDirectionVisuals(
        elements,
        angle,
        magnitude
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
   LONGITUD DEL CÍRCULO
========================================================= */

function getCircleLength(
    element
) {

    if (
        typeof element.getTotalLength ===
        "function"
    ) {

        try {

            return element.getTotalLength();

        } catch (e) {}

    }


    const radius =
        parseFloat(
            element.getAttribute(
                "r"
            )
        );


    if (
        Number.isFinite(radius)
    ) {

        return (
            2 *
            Math.PI *
            radius
        );

    }


    return 0;

}


/* =========================================================
   DIRECCIÓN
========================================================= */

function updateDirectionVisuals(
    elements,
    angle,
    magnitude
) {

    const cx =
        50;

    const cy =
        50;


    const radius =
        42;


    const px =
        cx +
        Math.cos(angle) *
        radius *
        magnitude;


    const py =
        cy +
        Math.sin(angle) *
        radius *
        magnitude;


    /* -----------------------------------------------------
       LINE
    ----------------------------------------------------- */

    if (
        elements.line
    ) {

        elements.line.setAttribute(
            "x1",
            cx
        );

        elements.line.setAttribute(
            "y1",
            cy
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


    /* -----------------------------------------------------
       DOT
    ----------------------------------------------------- */

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

        return;

    }


    const total =
        180;


    /*
       Convertimos el ángulo
       para que 0 quede arriba.
    */

    let index =
        Math.round(
            (
                angle +
                Math.PI / 2 +
                Math.PI * 2
            ) %
            (Math.PI * 2) /
            (Math.PI * 2) *
            total
        );


    index =
        (
            index +
            total
        ) %
        total;


    state.visited.add(
        index
    );


    /*
       Agregamos vecinos para
       evitar huecos visuales.
    */

    state.visited.add(
        (
            index - 1 +
            total
        ) % total
    );


    state.visited.add(
        (
            index + 1
        ) % total
    );


    state.current =
        index;


    /* =====================================================
       SVG ANALOG-PROGRESS
    ===================================================== */

    if (
        elements.progress
    ) {

        elements.progress.classList.add(
            "active"
        );

    }


    /* =====================================================
       CHECKPOINTS EXISTENTES
    ===================================================== */

    const container =
        elements.container;


    if (!container) return;


    const checkpoints =
        container.querySelectorAll(
            ".checkpoint"
        );


    if (
        checkpoints.length
    ) {

        checkpoints.forEach(
            (checkpoint, i) => {

                checkpoint.classList.toggle(
                    "visited",
                    state.visited.has(i)
                );


                checkpoint.classList.toggle(
                    "current",
                    i === state.current
                );

            }
        );

    }

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
                value
            )
        );


    const percentage =
        Math.round(
            normalized * 100
        );


    /* =====================================================
       BARRA
    ===================================================== */

    const fill =
        widget.querySelector(
            ".trigger-fill"
        );


    if (fill) {

        /*
           Compatible con SVG <rect>
           y también con div.
        */

        const isSVG =
            fill instanceof
            SVGElement;


        if (isSVG) {

            const barHeight =
                Number(
                    fill.getAttribute(
                        "data-bar-height"
                    )
                ) ||
                Number(
                    fill.getAttribute(
                        "height"
                    )
                ) ||
                92;


            const barY =
                Number(
                    fill.getAttribute(
                        "data-bar-y"
                    )
                ) ||
                0;


            const height =
                barHeight *
                normalized;


            fill.setAttribute(
                "height",
                height
            );


            fill.setAttribute(
                "y",
                barY +
                (
                    barHeight -
                    height
                )
            );


        } else {

            fill.style.height =
                percentage + "%";

        }

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

    }


    /* =====================================================
       ESTADO ACTIVO
    ===================================================== */

    widget.classList.toggle(
        "active",
        normalized > 0.01
    );


    /* =====================================================
       BOTÓN
    ===================================================== */

    const button =
        widget.querySelector(
            "[data-button]"
        ) ||
        widget.querySelector(
            "[data-btn]"
        );


    if (button) {

        button.classList.toggle(
            "pressed",
            normalized > 0.1
        );

    }


    /*
       L2/R2 también cuentan
       como botón probado.
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

                        duration: 500,

                        strongMagnitude: 0,

                        weakMagnitude: 0

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


                    } catch (error) {

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


    /* -----------------------------------------------------
       BOTONES
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       CHIPS
    ----------------------------------------------------- */

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


    /* -----------------------------------------------------
       STICKS
    ----------------------------------------------------- */

    Object.keys(
        stickState
    ).forEach(
        (side) => {

            stickState[
                side
            ].visited.clear();


            stickState[
                side
            ].current = -1;

        }
    );


    document
        .querySelectorAll(
            ".analog-progress"
        )
        .forEach(
            (progress) => {

                progress.classList.remove(
                    "active"
                );


                const length =
                    getCircleLength(
                        progress
                    );


                if (
                    length
                ) {

                    progress.style.strokeDasharray =
                        length;


                    progress.style.strokeDashoffset =
                        length;

                }

            }
        );


    document
        .querySelectorAll(
            ".analog-percent"
        )
        .forEach(
            (text) => {

                text.textContent =
                    "0%";

            }
        );


    /* -----------------------------------------------------
       TRIGGERS
    ----------------------------------------------------- */

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


                if (fill) {

                    if (
                        fill instanceof
                        SVGElement
                    ) {

                        const barHeight =
                            Number(
                                fill.getAttribute(
                                    "data-bar-height"
                                )
                            ) ||
                            Number(
                                fill.getAttribute(
                                    "height"
                                )
                            ) ||
                            92;


                        const barY =
                            Number(
                                fill.getAttribute(
                                    "data-bar-y"
                                )
                            ) ||
                            0;


                        fill.setAttribute(
                            "height",
                            0
                        );


                        fill.setAttribute(
                            "y",
                            barY +
                            barHeight
                        );


                    } else {

                        fill.style.height =
                            "0%";

                    }

                }


                if (percent) {

                    percent.textContent =
                        "0%";

                }

            }
        );

}
