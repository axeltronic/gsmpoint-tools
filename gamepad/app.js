let gamepadIndex = null;

const status = document.getElementById("connection-status");
const tester = document.getElementById("tester");
const controllerName = document.getElementById("controller-name");
const controllerType = document.getElementById("controller-type");
const progressSpan = document.getElementById("progress");
const chipsContainer = document.getElementById("chips");
const vibeNote = document.getElementById("vibe-note");

const buttonNames = [
    "✕","○","□","△",
    "L1","R1",
    "L2","R2",
    "Share","Options",
    "L3","R3",
    "↑","↓","←","→",
    "Home"
];

let testedButtons = [];

/* =====================================
   STICK DATA
===================================== */

const stickData = {

    "stick-l":{

        visited:new Array(180).fill(false),
        segments:[],
        coverage:0

    },

    "stick-r":{

        visited:new Array(180).fill(false),
        segments:[],
        coverage:0

    }

};

/* =====================================
   GAMEPAD
===================================== */

window.addEventListener("gamepadconnected",e=>{

    gamepadIndex=e.gamepad.index;

    status.innerHTML="✅ Joystick conectado";

    controllerName.textContent=e.gamepad.id;

    controllerType.textContent=
        "Layout: "+detectController(e.gamepad);

    tester.classList.remove("hidden");

    createButtonChips();

});

window.addEventListener("gamepaddisconnected",()=>{

    gamepadIndex=null;

    tester.classList.add("hidden");

    status.innerHTML="❌ Joystick desconectado";

    testedButtons=[];

    progressSpan.textContent="0";

    chipsContainer.innerHTML="";

});

/* =====================================
   CONTROLLER TYPE
===================================== */

function detectController(gp){

    const id=gp.id.toLowerCase();

    if(
        id.includes("sony") ||
        id.includes("dualshock") ||
        id.includes("dualsense") ||
        id.includes("054c")
    ) return "playstation";

    if(
        id.includes("xbox") ||
        id.includes("microsoft")
    ) return "xbox";

    if(
        id.includes("switch") ||
        id.includes("nintendo")
    ) return "switch";

    return "generic";

}

/* =====================================
   BUTTON CHIPS
===================================== */

function createButtonChips(){

    chipsContainer.innerHTML="";

    buttonNames.forEach((name,index)=>{

        const chip=document.createElement("span");

        chip.className="chip";

        chip.id="chip-"+index;

        chip.textContent=name;

        chipsContainer.appendChild(chip);

    });

}

/* =====================================
   CREATE RING
===================================== */

function createRing(ringId,stickId){

    const group=document.getElementById(ringId);

    if(!group) return;

    const NS="http://www.w3.org/2000/svg";

    const total=180;

    const inner=42;

    const outer=48;

    for(let i=0;i<total;i++){

        const a=(i/total)*Math.PI*2-Math.PI/2;

        const x1=50+Math.cos(a)*inner;

        const y1=50+Math.sin(a)*inner;

        const x2=50+Math.cos(a)*outer;

        const y2=50+Math.sin(a)*outer;

        const line=document.createElementNS(NS,"line");

        line.setAttribute("x1",x1);

        line.setAttribute("y1",y1);

        line.setAttribute("x2",x2);

        line.setAttribute("y2",y2);

        line.classList.add("checkpoint");

        group.appendChild(line);

        stickData[stickId].segments.push(line);

    }

}

createRing("ring-l","stick-l");
createRing("ring-r","stick-r");

/* =====================================
   MAIN LOOP
===================================== */

function update(){

    if(gamepadIndex!==null){

        const gp=navigator.getGamepads()[gamepadIndex];

        if(gp){

            updateButtons(gp);

            updateSticks(gp);

            updateTriggers(gp);

        }

    }

    requestAnimationFrame(update);

}

update();

/* =====================================
   BUTTONS
===================================== */

function updateButtons(gp){

    for(let i=0;i<=16;i++){

        const button=gp.buttons[i];

        if(!button) continue;

        const element=document.querySelector(`[data-btn="${i}"]`);

        if(!element) continue;

        if(button.pressed){

            element.classList.add("pressed");

            markButtonTested(i);

        }else{

            element.classList.remove("pressed");

        }

    }

}

/* =====================================
   STICKS
===================================== */

function updateSticks(gp){

    updateStick(
        "stick-l",
        "knob-l",
        "dial-l-line",
        "dial-l-dot",
        "dial-l-txt",
        gp.axes[0],
        gp.axes[1]
    );

    updateStick(
        "stick-r",
        "knob-r",
        "dial-r-line",
        "dial-r-dot",
        "dial-r-txt",
        gp.axes[2],
        gp.axes[3]
    );

}

function updateStick(

    stickId,
    knobId,
    lineId,
    dotId,
    textId,
    x,
    y

){

    x=Number.isFinite(x)?x:0;
    y=Number.isFinite(y)?y:0;

    const knob=document.getElementById(knobId);
    const line=document.getElementById(lineId);
    const dot=document.getElementById(dotId);
    const txt=document.getElementById(textId);

    const stick=document.getElementById(stickId);

    if(!stick) return;

    const radiusMove=stick.offsetWidth*0.25;

    const dx=x*radiusMove;
    const dy=y*radiusMove;

    knob.style.transform=
    `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;

    const magnitude=Math.min(
        Math.sqrt(x*x+y*y),
        1
    );

    /* porcentaje */

    if(txt){

        const visited=
        stickData[stickId].visited.filter(Boolean).length;

        txt.textContent=
        Math.round((visited/180)*100)+"%";

    }

    /* dirección */

    const angle=Math.atan2(y,x);

    const r=46;

    const px=50+Math.cos(angle)*r;
    const py=50+Math.sin(angle)*r;

    if(line){

        line.setAttribute("x2",px);

        line.setAttribute("y2",py);

    }

    if(dot){

        dot.setAttribute("cx",px);

        dot.setAttribute("cy",py);

    }

    /* zona muerta */

    if(magnitude<0.15)
        return;

    /* checkpoint actual */

    let deg=
        (angle*180/Math.PI+450)%360;

    let index=
        Math.round(deg/2);

    if(index>=180)
        index=0;

    stickData[stickId].visited[index]=true;

    /* vecinos */

    stickData[stickId].visited[
        (index+179)%180
    ]=true;

    stickData[stickId].visited[
        (index+1)%180
    ]=true;

    /* repintar */

    const ring=
        stickData[stickId].segments;

    for(let i=0;i<180;i++){

        ring[i].classList.remove("current");

        if(stickData[stickId].visited[i]){

            ring[i].classList.add("visited");

        }

    }

    ring[index].classList.add("current");

}
