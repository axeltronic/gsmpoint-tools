let gamepadIndex = null;

const status = document.getElementById("connection-status");
const emptyState = document.getElementById("empty-state");
const testerUI = document.getElementById("tester-ui");

const controllerName = document.getElementById("controller-name");
const buttons = document.getElementById("buttons");
const axes = document.getElementById("axes");


// Cuando conecta un joystick
window.addEventListener("gamepadconnected", (event) => {

    gamepadIndex = event.gamepad.index;

    status.className = "status-connected";

    status.innerHTML =
    "✅ Joystick conectado: " + event.gamepad.id;


    emptyState.classList.add("hidden");

    testerUI.classList.remove("hidden");


    controllerName.innerHTML =
    event.gamepad.id;


    console.log("Conectado:", event.gamepad);

});


// Cuando desconecta
window.addEventListener("gamepaddisconnected", () => {

    gamepadIndex = null;

    status.className = "status-disconnected";

    status.innerHTML =
    "Ningún joystick conectado";


    emptyState.classList.remove("hidden");

    testerUI.classList.add("hidden");


});


// Actualizar datos del joystick
function update(){

    if(gamepadIndex !== null){

        const gamepad =
        navigator.getGamepads()[gamepadIndex];


        if(gamepad){

            let pressedButtons = [];


            gamepad.buttons.forEach((button,index)=>{

                if(button.pressed){

                    pressedButtons.push(index);

                }

            });


            buttons.innerHTML =
            pressedButtons.length
            ?
            pressedButtons.join(" | ")
            :
            "Ninguno";


            axes.innerHTML =
            gamepad.axes
            .map(value => value.toFixed(2))
            .join(" | ");


        }

    }


    requestAnimationFrame(update);

}


update();
