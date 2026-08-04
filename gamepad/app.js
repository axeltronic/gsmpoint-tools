let gamepadIndex = null;


const status = document.getElementById("connection-status");
const emptyState = document.getElementById("empty-state");
const testerUI = document.getElementById("tester-ui");


const controllerName =
document.getElementById("controller-name");

const buttons =
document.getElementById("buttons");

const axes =
document.getElementById("axes");



// Detectar conexión
window.addEventListener("gamepadconnected", (event)=>{


    connectGamepad(event.gamepad);


});



// Detectar desconexión
window.addEventListener("gamepaddisconnected", ()=>{


    gamepadIndex = null;


    status.className =
    "status-disconnected";


    status.innerHTML =
    "Ningún joystick conectado";


    emptyState.classList.remove("hidden");

    testerUI.classList.add("hidden");


});




// Función conexión
function connectGamepad(gamepad){


    gamepadIndex = gamepad.index;


    status.className =
    "status-connected";


    status.innerHTML =
    "✅ Joystick conectado";


    emptyState.classList.add("hidden");


    testerUI.classList.remove("hidden");


    controllerName.innerHTML =
    gamepad.id;


    console.log("GAMEPAD:", gamepad);


}





// Actualizar datos
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
