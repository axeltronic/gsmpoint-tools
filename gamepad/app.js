let gamepadIndex = null;



const status =
document.getElementById("connection-status");


const tester =
document.getElementById("tester");


const controllerName =
document.getElementById("controller-name");


const controllerType =
document.getElementById("controller-type");


const progress =
document.getElementById("test-progress");


const buttonList =
document.getElementById("button-list");


let testedButtons = [];


const gamepadContainer =
document.getElementById("gamepad-container");


const details =
document.getElementById("details");


const vibrationButton =
document.getElementById("vibrate");


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

"Touchpad"

];






// =====================
// CONEXION
// =====================


window.addEventListener(
"gamepadconnected",
(e)=>{


gamepadIndex =
e.gamepad.index;



let type =
detectController(e.gamepad);



status.innerHTML =
"✅ Joystick conectado";



controllerName.innerHTML =
e.gamepad.id;



controllerType.innerHTML =
"Layout: " + type;



tester.classList.remove(
"hidden"
);



loadControllerSVG(type);



 createButtonList(); 

  

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








function detectController(gp){


let id =
gp.id.toLowerCase();



if(
id.includes("sony") ||
id.includes("dualshock") ||
id.includes("dualsense") ||
id.includes("054c")
)
return "playstation";



if(
id.includes("xbox") ||
id.includes("microsoft")
)
return "xbox";



if(
id.includes("switch") ||
id.includes("nintendo")
)
return "switch";



return "generic";


}







// =====================
// SVG INLINE
// =====================


async function loadControllerSVG(type){


let response =
await fetch(
"assets/"+type+".svg"
);



let svg =
await response.text();



gamepadContainer.innerHTML =
svg;



console.log(
"SVG cargado"
);


}








// =====================
// LOOP
// =====================


function update(){


if(gamepadIndex!==null){


let gp =
navigator.getGamepads()
[gamepadIndex];



if(gp){


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








// =====================
// BOTONES
// =====================


function updateButtons(gp){



const map={


0:"button-cross",

1:"button-circle",

2:"button-square",

3:"button-triangle",


4:"button-l1",

5:"button-r1",


6:"trigger-l2",

7:"trigger-r2",


8:"button-share",

9:"button-options",

10:"button-l3",

11:"button-r3",


12:"dpad-up",

13:"dpad-down",

14:"dpad-left",

15:"dpad-right"


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



if(button.pressed)

element.classList.add("pressed");

else

element.classList.remove("pressed");



});


}








// =====================
// STICKS
// =====================


function updateSticks(gp){


moveStick(
"stick-left",
gp.axes[0],
gp.axes[1]
);



moveStick(
"stick-right",
gp.axes[2],
gp.axes[3]
);



}



function moveStick(id,x,y){


let stick =
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








// =====================
// TRIGGERS
// =====================


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



if(left)

left.style.opacity =
0.3+l2;



if(right)

right.style.opacity =
0.3+r2;



}








// =====================
// VIBRACION
// =====================


vibrationButton.addEventListener(
"click",
()=>{


let gp =
navigator.getGamepads()
[gamepadIndex];



if(
gp &&
gp.vibrationActuator
){


gp.vibrationActuator.playEffect(
"dual-rumble",
{

duration:800,

strongMagnitude:1,

weakMagnitude:1

}

);


}


});

function createButtonList(){


buttonList.innerHTML="";


buttonNames.forEach(
(name,index)=>{


let div =
document.createElement("div");


div.className =
"test-button";


div.id =
"test-"+index;


div.innerHTML =
name;


buttonList.appendChild(div);



});


}
