let gamepadIndex = null;


const status =
document.getElementById("connection-status");

const tester =
document.getElementById("tester");

const controllerName =
document.getElementById("controller-name");

const controllerType =
document.getElementById("controller-type");

const controllerImage =
document.querySelector(".gamepad-svg");

const details =
document.getElementById("details");

const vibrationButton =
document.getElementById("vibrate");




window.addEventListener(
"gamepadconnected",
(event)=>{


const gp = event.gamepad;


gamepadIndex = gp.index;


const type =
detectController(gp);



status.innerHTML =
"✅ Joystick conectado";



controllerName.innerHTML =
gp.id;



controllerType.innerHTML =
"Layout: " + type;



controllerImage.src =
"assets/" + type + ".svg";



tester.classList.remove(
"hidden"
);



startLoop();



});






window.addEventListener(
"gamepaddisconnected",
()=>{


gamepadIndex=null;


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
id.includes("dualsense")
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





function startLoop(){


requestAnimationFrame(
updateGamepad
);


}





function updateGamepad(){


if(gamepadIndex !== null){


const gp =
navigator.getGamepads()
[gamepadIndex];



if(gp){


updateButtons(gp);


updateSticks(gp);


updateInfo(gp);


}



}



requestAnimationFrame(
updateGamepad
);


}








function updateButtons(gp){


gp.buttons.forEach(
(button,index)=>{


if(button.pressed){


console.log(
"Botón:",
index
);


}


});


}








function updateSticks(gp){


const lx =
gp.axes[0] || 0;


const ly =
gp.axes[1] || 0;


const rx =
gp.axes[2] || 0;


const ry =
gp.axes[3] || 0;



const left =
Math.round(
Math.sqrt(
lx*lx + ly*ly
)*100
);



const right =
Math.round(
Math.sqrt(
rx*rx + ry*ry
)*100
);



details.innerHTML = `

Stick izquierdo:
${left}%


<br>

Stick derecho:
${right}%


<br><br>


Botones:
${gp.buttons.length}


<br>


Ejes:
${gp.axes.length}

`;



}






function updateInfo(gp){

console.log(gp);

}








vibrationButton.addEventListener(
"click",
()=>{


const gp =
navigator.getGamepads()
[gamepadIndex];



if(
gp &&
gp.vibrationActuator
){


gp.vibrationActuator.playEffect(
"dual-rumble",
{

duration:1000,

strongMagnitude:1,

weakMagnitude:.7

}

);


}

});
