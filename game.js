import * as THREE from 'three';

const $ = (id) => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#a9c5c0');
scene.fog = new THREE.FogExp2('#a9c5c0', 0.0065);
const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 260);
const renderer = new THREE.WebGLRenderer({ canvas: $('world'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.outputColorSpace = THREE.SRGBColorSpace;

scene.add(new THREE.HemisphereLight(0xdff0e9, 0x786750, 2.15));
const sun = new THREE.DirectionalLight(0xffdfb0, 3.15);
sun.position.set(-34, 48, 24);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
sun.shadow.camera.left = -55; sun.shadow.camera.right = 55;
sun.shadow.camera.top = 55; sun.shadow.camera.bottom = -55;
sun.shadow.bias = -0.00025;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xc0e2e8, 0.65); fill.position.set(30, 18, -30); scene.add(fill);

const mat = (color, roughness = 0.9) => new THREE.MeshStandardMaterial({ color, roughness });
const M = {
  grass: mat('#91a977'), grass2: mat('#a1b582'), darkGrass: mat('#738d69'), sand: mat('#d7c9a7'),
  road: mat('#667274'), line: mat('#e9d8a8'), stone: mat('#d6cbb3'), stone2: mat('#bdb29c'),
  wood: mat('#956e4e'), wood2: mat('#b48a5c'), leaf: mat('#668b69'), leaf2: mat('#78976c'),
  roof: mat('#9e6654'), roof2: mat('#547d7a'), cream: mat('#e6d9bb'), white: mat('#f0e9d7'),
  water: new THREE.MeshStandardMaterial({ color:'#639a9d', roughness:.34, metalness:.08 }),
  trunk: mat('#7a5a43'), metal: mat('#485d5d'), flower1: mat('#d48372'), flower2: mat('#e5bd70'),
  lamp: new THREE.MeshStandardMaterial({color:'#ffdf9a',emissive:'#ffbc5f',emissiveIntensity:1.6})
};
const geo = {
  box: new THREE.BoxGeometry(1,1,1), sphere: new THREE.SphereGeometry(1, 12, 9),
  cyl: new THREE.CylinderGeometry(1,1,1,10), cone: new THREE.ConeGeometry(1,1,8),
  plane: new THREE.PlaneGeometry(1,1)
};
const world = new THREE.Group(); scene.add(world);
function addMesh(parent, geometry, material, x=0, y=0, z=0, sx=1, sy=1, sz=1, cast=true) {
  const o = new THREE.Mesh(geometry, material); o.position.set(x,y,z); o.scale.set(sx,sy,sz); o.castShadow=cast; o.receiveShadow=true; parent.add(o); return o;
}
function box(parent, material, x,y,z,sx,sy,sz, cast=true){return addMesh(parent,geo.box,material,x,y,z,sx,sy,sz,cast)}
function seeded(seed=239){let n=seed;return()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296}}
const rand=seeded();
function groundPatch(x,z,w,d,material,y=.015){return box(world,material,x,y,z,w,.03,d,false)}

// Soft, storybook coastal landscape
addMesh(world, new THREE.PlaneGeometry(240,240), M.grass, 0,-.08,0,1,1,1,false).rotation.x=-Math.PI/2;
// distant water and a pale sandy shoreline at the edge of town
box(world,M.water,0,-.02,-99,240,.12,48,false);
box(world,M.sand,0,-.005,-70,240,.08,12,false);
// gentle grassy clearings and paths
for(let i=0;i<24;i++){
  const x=(rand()-.5)*122,z=(rand()-.5)*116;
  if(Math.abs(x)<32&&Math.abs(z)<31)continue;
  const patch=addMesh(world,new THREE.CircleGeometry(1,12),i%3?M.grass2:M.darkGrass,x,.002,z,2+rand()*5,1,1.5+rand()*4,false);patch.rotation.x=-Math.PI/2;patch.rotation.z=rand()*Math.PI;
}
// a compact walkable town square ring road
const roadW=7.2, rx=24, rz=22;
box(world,M.road,0,.015,-rz,rx*2+roadW,.09,roadW,false);
box(world,M.road,0,.015,rz,rx*2+roadW,.09,roadW,false);
box(world,M.road,-rx,.015,0,roadW,.09,rz*2,false);
box(world,M.road,rx,.015,0,roadW,.09,rz*2,false);
// sidewalks and raised curb lines
for(const z of [-rz-4.1,-rz+4.1,rz-4.1,rz+4.1])box(world,M.stone2,0,.08,z,rx*2+roadW,.15,.65,false);
for(const x of [-rx-4.1,-rx+4.1,rx-4.1,rx+4.1])box(world,M.stone2,x,.08,0,.65,.15,rz*2,false);
// dashed road markings
for(let x=-20;x<=20;x+=5){box(world,M.line,x,.071,-rz,.85,.012,.12,false);box(world,M.line,x,.071,rz,.85,.012,.12,false)}
for(let z=-18;z<=18;z+=5){box(world,M.line,-rx,.071,z,.12,.012,.85,false);box(world,M.line,rx,.071,z,.12,.012,.85,false)}
// crosswalks, stone plaza and a fountain
for(const z of [-rz,rz])for(let i=-2;i<=2;i++)box(world,M.white,i*.7,.073,z+(z<0?3.5:-3.5),.38,.014,2.4,false);
for(const x of [-rx,rx])for(let i=-2;i<=2;i++)box(world,M.white,x+(x<0?3.5:-3.5),.073,i*.7,2.4,.014,.38,false);
groundPatch(0,0,28,25,M.sand,.018);
const plaza=addMesh(world,new THREE.CircleGeometry(1,32),M.stone,0,.038,0,7.4,1,6.6,false);plaza.rotation.x=-Math.PI/2;
// radial paving around fountain
for(let i=0;i<20;i++){const a=i*Math.PI/10;box(world,M.stone2,Math.cos(a)*5.5,.07,Math.sin(a)*4.9,.13,.025,.75,false).rotation.y=-a}
const fountain=new THREE.Group();world.add(fountain);
addMesh(fountain,geo.cyl,M.stone2,0,.22,0,2.5,.38,2.5,false);
addMesh(fountain,geo.cyl,M.stone,0,.48,0,1.95,.28,1.95,false);
addMesh(fountain,geo.cyl,M.water,0,.64,0,1.63,.08,1.63,false);
addMesh(fountain,geo.cyl,M.stone2,0,.9,0,.43,.65,.43);
addMesh(fountain,geo.sphere,M.water,0,1.28,0,.37,.45,.37);
for(let i=0;i<4;i++){const a=i*Math.PI/2;addMesh(fountain,geo.cyl,M.water,Math.cos(a)*.78,.85,Math.sin(a)*.78,.08,.42,.08).rotation.z=Math.cos(a)*-.65;}

// cottages with visible doors, windows, porches and pitched roofs
function makeHouse(x,z,bodyColor,roofColor,scale=1,rotation=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;g.scale.setScalar(scale);world.add(g);
  const bodyMat=mat(bodyColor);box(g,bodyMat,0,1.35,0,5.5,2.7,4.6);
  box(g,mat('#624b3e'),0,.58,2.34,1.1,1.15,.1);
  box(g,M.wood2,0,.12,2.55,1.5,.18,.55);
  for(const wx of [-1.72,1.72]){
    box(g,M.wood,wx,1.58,2.34,1.15,.95,.12);
    box(g,mat('#b4d2cc'),wx,1.58,2.415,.86,.67,.04);
    box(g,M.wood,wx,1.58,2.45,.09,1,.08);box(g,M.wood,wx,1.58,2.45,.95,.09,.08);
    box(g,M.wood2,wx,2.13,2.48,1.42,.12,.22);
  }
  // two sloping roof planes, ridge along depth
  const left=box(g,mat(roofColor),-1.42,3.04,0,3.45,.22,5.3);left.rotation.z=-.42;
  const right=box(g,mat(roofColor),1.42,3.04,0,3.45,.22,5.3);right.rotation.z=.42;
  box(g,M.wood2,0,3.77,0,.16,.18,5.35);
  box(g,M.wood2,0,.2,2.75,3.7,.18,.65);
  for(const px of [-1.55,1.55])box(g,M.wood,px,1,2.88,.12,1.8,.12);
  return g;
}
makeHouse(-34,-30,'#d7c6a4','#9d6553',1.08,-.12);
makeHouse(33,-30,'#c7d4be','#547c78',1.04,.12);
makeHouse(-34,30,'#d6b99b','#b7775d',1.08,.14);
makeHouse(34,30,'#e1d6b8','#9b6b56',1.1,-.12);
makeHouse(-2,-34,'#e5d7b8','#587e7b',.8,Math.PI);

// tiny market stalls, benches, flower tubs and lanterns
function makeBench(x,z,rotation=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;world.add(g);box(g,M.wood2,0,.55,0,2.2,.18,.65);box(g,M.wood2,0,.94,-.24,2.2,.65,.16);for(const px of [-.8,.8]){box(g,M.metal,px,.25,0,.12,.55,.12);box(g,M.metal,px,.66,-.24,.12,.6,.1)}}
makeBench(-10,7,.45);makeBench(10,-7,Math.PI-.45);makeBench(-11,-7,-.3);
function makeLamp(x,z){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);addMesh(g,geo.cyl,M.metal,0,2.1,0,.1,4.2,.1);box(g,M.metal,0,4.2,0,.65,.1,.65);addMesh(g,geo.sphere,M.lamp,0,3.85,0,.23,.28,.23,false);}
for(const [x,z] of [[-16,-14],[16,-14],[-16,14],[16,14],[-27,0],[27,0]])makeLamp(x,z);
function flowerBox(x,z){box(world,M.wood2,x,.32,z,1.6,.55,.7);for(let i=0;i<7;i++){const fx=x-.62+i*.2,fz=z+(rand()-.5)*.24;addMesh(world,geo.sphere,i%2?M.flower1:M.flower2,fx,.68+rand()*.1,fz,.12,.16,.12);addMesh(world,geo.cyl,M.leaf,fx,.48,fz,.035,.38,.035,false)}}
flowerBox(-7,-12);flowerBox(8,12);flowerBox(-13,2);flowerBox(13,-2);
// little timber stack: a recurring resource pickup
const woodpile=new THREE.Group();woodpile.position.set(-13,0,10);world.add(woodpile);
for(let i=0;i<5;i++){const log=addMesh(woodpile,geo.cyl,M.wood2,(i%2)*.34,.27+Math.floor(i/2)*.22,(i%2)*.27, .23,.92,.23);log.rotation.z=Math.PI/2;}
box(woodpile,M.wood,-.1,.12,.9,1.6,.2,.11);

// low-poly trees around the town edges
function makeTree(x,z,scale=1){const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);world.add(g);addMesh(g,geo.cyl,M.trunk,0,1.05,0,.35,2.1,.35);addMesh(g,geo.sphere,rand()>.45?M.leaf:M.leaf2,0,2.55,0,1.35,1.55,1.3);addMesh(g,geo.sphere,M.leaf2,-.55,2.38,.16,.78,.9,.82);addMesh(g,geo.sphere,M.leaf,.5,2.25,-.2,.8,.86,.78);return g}
for(const [x,z,s] of [[-46,-42,1.6],[-46,-12,1.35],[-47,24,1.6],[-40,47,1.4],[-20,45,1.15],[0,48,1.4],[19,47,1.5],[46,44,1.4],[47,10,1.5],[47,-18,1.35],[44,-44,1.7],[19,-48,1.4],[-14,-48,1.2],[-50,40,1.3],[52,32,1.5],[-51,-32,1.4],[50,-37,1.2]])makeTree(x,z,s);

// Neighbors have simple schedules: they stroll around the square and pause to admire it.
const npcData=[
 {name:'Mara',role:'THE GARDENER',color:'#c87961',hair:'#483b36',x:-7,z:3,line:'The square has such lovely light this time of day. I keep thinking it could use a few more little touches.'},
 {name:'Jun',role:'BIKE MECHANIC',color:'#608a82',hair:'#443e38',x:8,z:5,line:'I rolled my bike all the way down from the lighthouse. The sea breeze makes every ride better.'},
 {name:'Sol',role:'FISHERMAN',color:'#d2a35f',hair:'#58463c',x:4,z:-9,line:'Best catch of the week, and I still made it back before the kettle boiled. Not bad, eh?'},
 {name:'Bea',role:'BAKER',color:'#8a7892',hair:'#3e393b',x:-9,z:-5,line:'I left a little honey cake cooling at the bakery. If you pass by, the smell might give it away.'}
];
const npcs=[];
function makeNPC(data,index){
 const g=new THREE.Group();g.position.set(data.x,0,data.z);world.add(g);
 const shirt=mat(data.color),skin=mat('#d7a981'),hair=mat(data.hair),pants=mat('#4b5c5b');
 const body=addMesh(g,geo.cyl,shirt,0,.92,0,.37,.9,.42);body.rotation.z=-.08;
 addMesh(g,geo.sphere,skin,0,1.62,0,.34,.39,.33);
 addMesh(g,geo.sphere,hair,0,1.81,-.04,.35,.27,.34);
 addMesh(g,geo.sphere,hair,-.25,1.65,.03,.13,.22,.28);
 const eyeMat=mat('#443d39');for(const ex of [-.11,.11])addMesh(g,geo.sphere,eyeMat,ex,1.64,.3,.025,.035,.02,false);
 const legs=[];for(const lx of [-.16,.16])legs.push(addMesh(g,geo.cyl,pants,lx,.34,0,.13,.55,.13));
 // distinctive accessory makes neighbors easy to spot
 if(index===0){addMesh(g,geo.cone,M.flower1,.4,1.6,0,.11,.32,.11).rotation.z=-.4;}
 if(index===1){addMesh(g,geo.cyl,M.wood2,.49,.8,0,.06,.8,.06).rotation.z=-.5;}
 const marker=addMesh(g,geo.sphere,M.lamp,0,2.38,0,.09,.09,.09,false);marker.visible=false;
 return {...data,group:g,legs,marker,home:new THREE.Vector3(data.x,0,data.z),target:new THREE.Vector3(data.x,0,data.z),phase:rand()*8,index};
}
npcData.forEach((d,i)=>npcs.push(makeNPC(d,i)));

// Road traffic follows the perimeter route, eases through corners, and spaces itself naturally.
const route=[new THREE.Vector3(-21,0,-22),new THREE.Vector3(21,0,-22),new THREE.Vector3(24,0,-19),new THREE.Vector3(24,0,19),new THREE.Vector3(21,0,22),new THREE.Vector3(-21,0,22),new THREE.Vector3(-24,0,19),new THREE.Vector3(-24,0,-19)];
function routePoint(t){const total=route.length,scaled=((t%total)+total)%total,idx=Math.floor(scaled),f=scaled-idx;const p0=route[(idx-1+total)%total],p1=route[idx],p2=route[(idx+1)%total],p3=route[(idx+2)%total];return new THREE.Vector3(...['x','y','z'].map(k=>.5*((2*p1[k])+(-p0[k]+p2[k])*f+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*f*f+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*f*f*f)))}
function makeCar(color,accent,phase,speed){const g=new THREE.Group();world.add(g);const body=mat(color),glass=mat('#b9d1c9'),wheel=mat('#353f3d');box(g,body,0,.57,0,2.35,.72,1.18);box(g,body,-.12,1.02,0,1.25,.42,1.02);box(g,glass,-.12,1.04,.53,.78,.28,.035,false);box(g,glass,-.12,1.04,-.53,.78,.28,.035,false);box(g,mat(accent),1.01,.54,0,.25,.58,1.12);for(const x of [-.72,.72])for(const z of [-.57,.57])addMesh(g,geo.cyl,wheel,x,.35,z,.29,.15,.29).rotation.z=Math.PI/2;for(const z of [-.35,.35])addMesh(g,geo.sphere,M.lamp,1.2,.65,z,.07,.07,.07,false);return {group:g,t:phase,speed,previous:routePoint(phase)};}
const cars=[makeCar('#d5775f','#edbd81',0,.037),makeCar('#547c77','#b7d0bc',2.08,.031),makeCar('#e1bd78','#f0dfb8',4.2,.034),makeCar('#75849a','#b8c5c6',6.15,.029)];

// Buildable structures have clear silhouettes and a small set of starter recipes.
const recipes=[
 {id:'planter',name:'Flower planter',icon:'❀',description:'A bright patch of color',wood:2,coins:8},
 {id:'bench',name:'Garden bench',icon:'⌑',description:'A place to take it in',wood:3,coins:12},
 {id:'lamp',name:'Street lantern',icon:'✧',description:'A little light for later',wood:2,coins:16},
 {id:'tree',name:'Coastal tree',icon:'♣',description:'A bit more shade',wood:3,coins:10},
 {id:'cottage',name:'Tiny cottage',icon:'⌂',description:'Make room for a neighbor',wood:5,coins:28}
];
let selectedRecipe=null,ghost=null;
function makeBuildable(id){
 const g=new THREE.Group();
 if(id==='planter'){box(g,M.wood2,0,.28,0,1.5,.5,.75);for(let i=0;i<6;i++){const x=-.55+i*.22;addMesh(g,geo.cyl,M.leaf,x,.57,0,.045,.45,.045,false);addMesh(g,geo.sphere,i%2?M.flower1:M.flower2,x,.81,0,.13,.14,.13,false)}}
 if(id==='bench')makeBenchIn(g);
 if(id==='lamp'){addMesh(g,geo.cyl,M.metal,0,1.5,0,.09,3,.09);box(g,M.metal,0,2.98,0,.55,.1,.55);addMesh(g,geo.sphere,M.lamp,0,2.67,0,.2,.24,.2,false)}
 if(id==='tree'){addMesh(g,geo.cyl,M.trunk,0,.8,0,.26,1.6,.26);addMesh(g,geo.sphere,M.leaf,0,2.1,0,1.15,1.3,1.1);addMesh(g,geo.sphere,M.leaf2,-.4,1.95,.1,.7,.75,.7)}
 if(id==='cottage'){box(g,mat('#d9c9a9'),0,1.2,0,3.8,2.4,3.5);box(g,M.wood2,0,.55,1.78,.85,1.3,.12);const a=box(g,mat('#a76d56'),-.95,2.52,0,2.35,.2,3.9);a.rotation.z=-.48;const b=box(g,mat('#a76d56'),.95,2.52,0,2.35,.2,3.9);b.rotation.z=.48;}
 return g;
}
function makeBenchIn(g){box(g,M.wood2,0,.55,0,2.2,.18,.65);box(g,M.wood2,0,.94,-.24,2.2,.65,.16);for(const x of [-.8,.8]){box(g,M.metal,x,.25,0,.12,.55,.12);box(g,M.metal,x,.66,-.24,.12,.6,.1)}}
const placed=[];

// Controls and camera
const player=new THREE.Vector3(0,0,10);
let yaw=0,pitch=.36,started=false,dialogueOpen=false,buildOpen=false;
const keys={};
const ray=new THREE.Raycaster();
let dragging=false,lastX=0,lastY=0;
camera.position.set(-31,17,31);camera.lookAt(0,2,0);
function updateCamera(dt){
 if(started&&!dialogueOpen&&!buildOpen){
  const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  const move=new THREE.Vector3();
  if(keys.KeyW||keys.ArrowUp||keys.mobileForward)move.add(forward);
  if(keys.KeyS||keys.ArrowDown||keys.mobileBack)move.sub(forward);
  if(keys.KeyD||keys.ArrowRight||keys.mobileRight)move.add(right);
  if(keys.KeyA||keys.ArrowLeft||keys.mobileLeft)move.sub(right);
  if(move.lengthSq()){move.normalize();const speed=(keys.ShiftLeft||keys.ShiftRight)?9.5:5.8;player.addScaledVector(move,speed*dt);player.x=THREE.MathUtils.clamp(player.x,-32,32);player.z=THREE.MathUtils.clamp(player.z,-31,31)}
 }
 const dist=started?9.2:23;
 const target=new THREE.Vector3(player.x,started?1.8:2.5,player.z);
 const angle=yaw+(started?0:Math.PI*.68);
 const desired=new THREE.Vector3(player.x+Math.sin(angle)*dist*Math.cos(pitch),player.y+Math.sin(pitch)*dist+5,player.z+Math.cos(angle)*dist*Math.cos(pitch));
 camera.position.lerp(desired,started?.11:.018);camera.lookAt(target);
}

addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyB'&&!dialogueOpen)toggleBuild();if(e.code==='KeyE'&&!buildOpen)talkNearest();if(e.code==='Escape'){closeDialogue();closeBuild();closeHelp()}});
addEventListener('keyup',e=>{keys[e.code]=false});
$('world').addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;$('world').setPointerCapture(e.pointerId)});
$('world').addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch+dy*.002,-.02,.78)});
$('world').addEventListener('pointerup',()=>dragging=false);

// HUD, quests and dialogue
let talkCount=0,coins=120,wood=8,visitedWood=false;
function startGame(){started=true;$('intro-card').classList.add('gone');$('hud').classList.remove('hidden');$('mobile-controls').classList.remove('hidden');$('loading').classList.add('done');yaw=0;pitch=.36;player.set(0,0,10);}
$('start-btn').addEventListener('click',startGame);
$('help-btn').addEventListener('click',()=>{$('help-modal').classList.remove('hidden')});$('help-close').addEventListener('click',closeHelp);$('got-it').addEventListener('click',closeHelp);function closeHelp(){ $('help-modal').classList.add('hidden') }
let clockHour=16,clockMinute=32;setInterval(()=>{clockMinute=(clockMinute+1)%60;if(clockMinute===0)clockHour=(clockHour+1)%24;$('clock').textContent=`${clockHour%12||12}:${String(clockMinute).padStart(2,'0')} ${clockHour>=12?'PM':'AM'}`},5000);
function toast(text){$('toast-text').textContent=text;$('toast').classList.remove('hidden');clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('toast').classList.add('hidden'),2600)}
function talkNearest(){
 let nearest=null,dist=999;
 for(const n of npcs){const d=n.group.position.distanceTo(player);if(d<dist&&d<3.1){dist=d;nearest=n}}
 if(nearest)openDialogue(nearest);else if(player.distanceTo(woodpile.position)<4.2)gatherWood();else toast('Walk closer to a neighbor or the timber stack.');
}
function openDialogue(n){dialogueOpen=true;n.marker.visible=true;$('dialogue').classList.remove('hidden');$('npc-avatar').textContent=n.name[0];$('npc-name').textContent=n.name;$('npc-role').textContent=n.role;$('dialogue-text').textContent=n.line;
 const opts=$('dialogue-options');opts.innerHTML='';
 const choices=[['What brings you here?','I came to add a little life to the square. Harborlight has a way of making you feel at home.'],['How is town today?','Good things are starting again. I have my eye on a few corners that could use a planter or a bench.'],['A lovely day.','It really is. Stay awhile—there’s no need to hurry here.']];
 choices.forEach(([label,response])=>{const b=document.createElement('button');b.className='dialogue-option'+(label==='A lovely day.'?' primary':'');b.textContent=label;b.onclick=()=>{$('dialogue-text').textContent=response;if(!n.talked){n.talked=true;talkCount++;updateQuest();coins+=4;$('coins').textContent=coins;toast('New conversation · +4 coins')}};opts.appendChild(b)});
}
function closeDialogue(){$('dialogue').classList.add('hidden');dialogueOpen=false;npcs.forEach(n=>n.marker.visible=false)}
$('dialogue-close').addEventListener('click',closeDialogue);$('mobile-talk').addEventListener('click',talkNearest);
function gatherWood(){if(!visitedWood){visitedWood=true;wood+=3;$('wood').textContent=wood;toast('Collected timber · +3 wood');updateQuest()}else toast('The pile is still tidied for tomorrow.')}
function updateQuest(){
 const done=Math.min(3,talkCount+(visitedWood?1:0));$('quest-count').textContent=`${done} / 3`; $('quest-progress').style.width=`${done/3*100}%`;
 if(done===0){$('quest-title').textContent='A place to begin';$('quest-copy').textContent='The sun is out and the town is waking up. Say hello to someone nearby.'}
 else if(done<3){$('quest-title').textContent='Making a little history';$('quest-copy').textContent='Meet the locals and gather what you need. Harborlight is beginning to know you.'}
 else{$('quest-title').textContent='Welcome home';$('quest-copy').textContent='You have found your first foothold. Open the build menu and shape the square.'}
}

// Build menu
function toggleBuild(){buildOpen=!buildOpen;if(buildOpen){$('build-panel').classList.remove('hidden');renderBuildList()}else closeBuild()}
function closeBuild(){buildOpen=false;$('build-panel').classList.add('hidden');if(ghost){scene.remove(ghost);ghost=null}selectedRecipe=null}
function renderBuildList(){const list=$('build-list');list.innerHTML='';recipes.forEach(r=>{const b=document.createElement('button');b.className='build-item';b.innerHTML=`<span class="build-icon">${r.icon}</span><span class="build-info"><b>${r.name}</b><small>${r.description}</small></span><span class="build-cost">${r.wood} ◈ · ${r.coins} ◉</span>`;b.onclick=()=>selectRecipe(r,b);list.appendChild(b)})}
function selectRecipe(r,b){selectedRecipe=r;document.querySelectorAll('.build-item').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');if(ghost)scene.remove(ghost);ghost=makeBuildable(r.id);ghost.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.58;o.material.depthWrite=false}});ghost.position.copy(player);ghost.position.y=.05;world.add(ghost);toast(`${r.name} selected · choose a place`)}
$('build-close').addEventListener('click',closeBuild);$('mobile-build').addEventListener('click',toggleBuild);
$('world').addEventListener('contextmenu',e=>e.preventDefault());
$('world').addEventListener('click',e=>{if(!ghost||!selectedRecipe)return;ray.setFromCamera(new THREE.Vector2((e.clientX/innerWidth)*2-1,-(e.clientY/innerHeight)*2+1),camera);const ground=new THREE.Plane(new THREE.Vector3(0,1,0),0);const p=new THREE.Vector3();if(ray.ray.intersectPlane(ground,p)){p.x=THREE.MathUtils.clamp(p.x,-34,34);p.z=THREE.MathUtils.clamp(p.z,-32,32);if(p.distanceTo(player)>12){toast('Build closer to your character');return}if(wood<selectedRecipe.wood||coins<selectedRecipe.coins){toast('Not enough resources for that one');return}wood-=selectedRecipe.wood;coins-=selectedRecipe.coins;$('wood').textContent=wood;$('coins').textContent=coins;const placedObj=makeBuildable(selectedRecipe.id);placedObj.position.copy(p);placedObj.position.y=.05;world.add(placedObj);placed.push(placedObj);toast(`${selectedRecipe.name} placed`);closeBuild();updateQuest()}});

// Touch controls
for(const b of document.querySelectorAll('[data-move]')){const dir=b.dataset.move;const prop=`mobile${dir[0].toUpperCase()+dir.slice(1)}`;b.addEventListener('pointerdown',e=>{e.preventDefault();keys[prop]=true;b.setPointerCapture(e.pointerId)});b.addEventListener('pointerup',()=>keys[prop]=false);b.addEventListener('pointercancel',()=>keys[prop]=false)}

// Mobile swipe look
$('world').addEventListener('touchmove',()=>{}, {passive:false});

// NPC and traffic animation
const clock=new THREE.Clock();function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
 updateCamera(dt);
 npcs.forEach(n=>{if(!dialogueOpen){n.phase+=dt*.13;n.target.set(n.home.x+Math.sin(n.phase*1.7+n.index)*1.15,n.home.y,n.home.z+Math.cos(n.phase*1.3+n.index)*.85);n.group.position.lerp(n.target,.012);n.group.rotation.y=Math.atan2(n.target.x-n.group.position.x,n.target.z-n.group.position.z)}n.marker.position.y=2.42+Math.sin(t*3+n.index)*.08});
 cars.forEach(c=>{c.t=(c.t+c.speed*dt)%route.length;const pos=routePoint(c.t),prev=c.previous;const target=new THREE.Vector3(pos.x,0,pos.z);c.group.position.lerp(target,.18);const dir=target.clone().sub(prev);if(dir.lengthSq()>1e-5)c.group.rotation.y=Math.atan2(dir.x,dir.z);c.previous.copy(pos)});
 if(ghost&&started){const nearest=$('world');/* keep ghost at player until clicked */ghost.position.lerp(new THREE.Vector3(player.x,.05,player.z),.12)}
 let nearestNpc=null,nearestD=999;for(const n of npcs){const d=n.group.position.distanceTo(player);if(d<nearestD){nearestD=d;nearestNpc=n}}$('interaction-hint').classList.toggle('hidden',!started||dialogueOpen||buildOpen||nearestD>=3.2&&player.distanceTo(woodpile.position)>=4.2);if(nearestD<3.2&&nearestNpc){$('hint-name').textContent=nearestNpc.name}else if(player.distanceTo(woodpile.position)<4.2)$('hint-name').textContent='timber pile';
 renderer.render(scene,camera);
}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setSize(innerWidth,innerHeight)});
setTimeout(()=>{if($('loading')&&!$('loading').classList.contains('done'))$('loading').classList.add('done')},2200);
