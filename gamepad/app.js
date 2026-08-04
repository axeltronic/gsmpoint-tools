let gamepadIndex = null;

const status = document.getElementById("connection-status");
const tester = document.getElementById("tester");

const controllerName = document.getElementById("controller-name");
const controllerType = document.getElementById("controller-type");

const gamepadContainer = document.getElementById("gamepad-container");

const details = document.getElementById("details");





// =============================
// CONEXIÓN DEL GAMEPAD
// =============================

window.addEventListener(
"gamepadconnected",
(event)=>{


const gamepad = event.gamepad;


gamepadIndex = gamepad.index;



const type = detectController(gamepad);



status.innerHTML =
"✅ Joystick conectado";



controllerName.innerHTML =
gamepad.id;



controllerType.innerHTML =
"Layout: " + type;



tester.classList.remove(
"hidden"
);



loadControllerSVG(type);



console.log(
"Conectado:",
gamepad
);



});






// =============================
// DESCONEXIÓN
// =============================

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







// =============================
// DETECTAR TIPO DE MANDO
// =============================

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








// =============================
// CARGAR SVG INLINE
// =============================

async function loadControllerSVG(type){


try{


const response =
await fetch(
"assets/" + type + ".svg"
);



const svg =
await response.text();



gamepadContainer.innerHTML =
svg;



console.log(
"SVG cargado:",
type
);



initSVGControls();



}
catch(error){


console.error(
"Error cargando SVG:",
error
);


}


}







// =============================
// INICIALIZAR SVG
// =============================

function initSVGControls(){


const parts =
document.querySelectorAll(
".gamepad-part"
);



console.log(
"Partes SVG encontradas:",
parts.length
);



}







// =============================
// LOOP PRINCIPAL
// =============================

function update(){


if(gamepadIndex !== null){


const gamepad =
navigator.getGamepads()
[gamepadIndex];



if(gamepad){


updateButtons(gamepad);


updateSticks(gamepad);


updateInfo(gamepad);


}


}



requestAnimationFrame(
update
);


}



update();







// =============================
// BOTONES
// =============================

function updateButtons(gamepad){



const buttonMap = {


0:"button-cross",

1:"button-circle",

2:"button-square",

3:"button-triangle",

4:"button-l1",

5:"button-r1",

6:"trigger-l2",

7:"trigger-r2"


};




gamepad.buttons.forEach(
(button,index)=>{


const id =
buttonMap[index];



if(!id)
return;



const element =
document.getElementById(id);



if(!element)
return;



if(button.pressed){


element.classList.add(
"pressed"
);



}else{


element.classList.remove(
"pressed"
);


}



});


}








// =============================
// STICKS
// =============================

function updateSticks(gamepad){


const lx =
gamepad.axes[0] || 0;


const ly =
gamepad.axes[1] || 0;


const rx =
gamepad.axes[2] || 0;


const ry =
gamepad.axes[3] || 0;



moveStick(
"stick-left",
lx,
ly
);



moveStick(
"stick-right",
rx,
ry
);



const left =
Math.round(
Math.sqrt(lx*lx + ly*ly)
*100
);



const right =
Math.round(
Math.sqrt(rx*rx + ry*ry)
*100
);



details.innerHTML = `

Stick izquierdo:
${left}%


<br>

Stick derecho:
${right}%


<br><br>

Botones:
${gamepad.buttons.length}


<br>

Ejes:
${gamepad.axes.length}

`;



}






function moveStick(id,x,y){


const stick =
document.getElementById(id);



if(!stick)
return;



stick.style.transform =
`
translate(
${x*18}px,
${y*18}px
)
`;



}







// =============================
// INFORMACIÓN
// =============================

function updateInfo(gamepad){


console.log(
gamepad
);


}
