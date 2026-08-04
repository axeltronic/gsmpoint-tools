let gamepadIndex = null;


const status =
document.getElementById("connection-status");

const emptyState =
document.getElementById("empty-state");

const testerUI =
document.getElementById("tester-ui");


const controllerName =
document.getElementById("controller-name");


const buttons =
document.getElementById("buttons");


const axes =
document.getElementById("axes");



const visualButtons = [

document.getElementById("btn-0"),
document.getElementById("btn-1"),
document.getElementById("btn-2"),
document.getElementById("btn-3")

];




// conexión

window.addEventListener("gamepadconnected", (event)=>{


connectGamepad(event.gamepad);


});





function connectGamepad(gamepad){


gamepadIndex =
gamepad.index;


status.className =
"status-connected";


status.innerHTML =
"✅ Joystick conectado";



emptyState.classList.add("hidden");


testerUI.classList.remove("hidden");



controllerName.innerHTML =
gamepad.id;


}




// desconexión

window.addEventListener("gamepaddisconnected", ()=>{


gamepadIndex = null;


status.className =
"status-disconnected";


status.innerHTML =
"Ningún joystick conectado";



emptyState.classList.remove("hidden");


testerUI.classList.add("hidden");


});







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



if(visualButtons[index]){


if(button.pressed){


visualButtons[index]
.classList.add("pressed");


}else{


visualButtons[index]
.classList.remove("pressed");


}


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
.map(value=>value.toFixed(2))
.join(" | ");




}



}



requestAnimationFrame(update);


}



update();
