let gamepadIndex = null;

let activeController = null;


const status =
document.getElementById("connection-status");


const tester =
document.getElementById("tester");


const controllerName =
document.getElementById("controller-name");


const controllerType =
document.getElementById("controller-type");


const gamepadContainer =
document.getElementById("gamepad-container");

const details =
document.getElementById("details");



let svgDoc = null;




// ===============================
// CONEXIÓN
// ===============================


window.addEventListener(
"gamepadconnected",
(e)=>{


activeController = e.gamepad;

gamepadIndex = e.gamepad.index;



let type =
detectController(e.gamepad);



status.innerHTML =
"✅ Joystick conectado";



controllerName.innerHTML =
e.gamepad.id;



controllerType.innerHTML =
"Layout: " + type;



loadControllerSVG(type);



tester.classList.remove(
"hidden"
);



console.log(
e.gamepad
);



});





window.addEventListener(
"gamepaddisconnected",
()=>{


gamepadIndex=null;

activeController=null;


status.innerHTML =
"❌ Joystick desconectado";


tester.classList.add(
"hidden"
);


});







// ===============================
// DETECCIÓN
// ===============================


function detectController(gp){


let id =
gp.id.toLowerCase();



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
id.includes("microsoft")
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







// ===============================
// LOOP
// ===============================


function update(){


if(gamepadIndex !== null){


let gp =
navigator.getGamepads()
[gamepadIndex];



if(gp){


updateButtons(gp);

updateSticks(gp);

updateTriggers(gp);

showInfo(gp);


}



}


requestAnimationFrame(update);


}


update();







// ===============================
// BOTONES
// ===============================


function updateButtons(gp){



const map = {


0:"button-cross",

1:"button-circle",

2:"button-square",

3:"button-triangle",


4:"button-l1",

5:"button-r1"


};



gp.buttons.forEach(
(button,index)=>{


let id =
map[index];


if(!id)
return;



let element =
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







// ===============================
// STICKS
// ===============================


function updateSticks(gp){


let lx =
gp.axes[0] || 0;


let ly =
gp.axes[1] || 0;



let rx =
gp.axes[2] || 0;


let ry =
gp.axes[3] || 0;





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



let leftPercent =
Math.round(
Math.sqrt(lx*lx+ly*ly)*100
);



let rightPercent =
Math.round(
Math.sqrt(rx*rx+ry*ry)*100
);



details.innerHTML = `

Stick izquierdo:
${leftPercent}%


<br>

Stick derecho:
${rightPercent}%


`;



}





function moveStick(id,x,y){



let stick =
document.getElementById(id);



if(!stick)
return;



let moveX =
x*18;


let moveY =
y*18;



stick.style.transform =
`translate(${moveX}px,${moveY}px)`;



}







// ===============================
// GATILLOS
// ===============================


function updateTriggers(gp){


let l2 =
gp.buttons[6]?.value || 0;


let r2 =
gp.buttons[7]?.value || 0;



let left =
document.getElementById(
"trigger-l2"
);



let right =
document.getElementById(
"trigger-r2"
);




if(left){

left.style.opacity =
0.4 + l2;

}



if(right){

right.style.opacity =
0.4 + r2;

}



}







function showInfo(gp){


details.innerHTML += `

<br><br>

Botones:
${gp.buttons.length}


<br>

Ejes:
${gp.axes.length}

`;

}

async function loadControllerSVG(type){


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


}
