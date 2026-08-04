let gamepadIndex = null;


const status =
document.getElementById(
"connection-status"
);


const tester =
document.getElementById(
"tester"
);



const controllerName =
document.getElementById(
"controller-name"
);



const controllerType =
document.getElementById(
"controller-type"
);



const controllerImage =
document.querySelector(
".gamepad-svg"
);



const details =
document.getElementById(
"details"
);



const vibrationButton =
document.getElementById(
"vibrate"
);





window.addEventListener(
"gamepadconnected",
(event)=>{


const gamepad =
event.gamepad;


gamepadIndex =
gamepad.index;



const type =
detectController(gamepad);




status.innerHTML =
"✅ Joystick conectado";



controllerName.innerHTML =
gamepad.id;



controllerType.innerHTML =
"Tipo detectado: " + type;



controllerImage.src =
"assets/" + type + ".svg";



details.innerHTML = `

Índice:
${gamepad.index}

<br>

Botones:
${gamepad.buttons.length}

<br>

Ejes:
${gamepad.axes.length}

`;



tester.classList.remove(
"hidden"
);



console.log(
gamepad
);



});







window.addEventListener(
"gamepaddisconnected",
()=>{


gamepadIndex = null;


status.innerHTML =
"❌ Joystick desconectado";


tester.classList.add(
"hidden"
);


});








function detectController(gamepad){


const id =
gamepad.id.toLowerCase();





if(
id.includes("sony") ||
id.includes("054c") ||
id.includes("dualshock") ||
id.includes("dualsense") ||
id.includes("wireless controller")
){

return "playstation";

}






if(
id.includes("xbox") ||
id.includes("microsoft") ||
id.includes("xinput")
){

return "xbox";

}






if(
id.includes("nintendo") ||
id.includes("switch")
){

return "switch";

}






return "generic";


}







vibrationButton.addEventListener(
"click",
()=>{


const gamepads =
navigator.getGamepads();


const gp =
gamepads[gamepadIndex];



if(
gp &&
gp.vibrationActuator
){


gp.vibrationActuator.playEffect(
"dual-rumble",
{

duration:800,

strongMagnitude:1,

weakMagnitude:.5

}
);


}else{


alert(
"Este mando no soporta vibración desde el navegador."
);


}



});
