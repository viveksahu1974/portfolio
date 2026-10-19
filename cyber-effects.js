/* VIVEK • CYBER MOTION ENGINE
   Responsive pointer-reactive neon field and matrix hacker day mode.
   Zero external dependencies; animation respects reduced-motion preferences. */
(()=>{
'use strict';
const doc=document,root=doc.documentElement,body=doc.body;
if(!body||doc.getElementById('cyberField'))return;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const fine=matchMedia('(pointer: fine)');
const canvas=doc.createElement('canvas');
canvas.id='cyberField';canvas.setAttribute('aria-hidden','true');
body.insertBefore(canvas,body.firstChild);
const aura=doc.createElement('div');aura.id='mouseAura';aura.setAttribute('aria-hidden','true');body.appendChild(aura);
const modeBadge=doc.createElement('div');modeBadge.id='cyberModeLabel';modeBadge.setAttribute('aria-hidden','true');body.appendChild(modeBadge);
const ctx=canvas.getContext('2d',{alpha:true});
if(!ctx)return;
const halo=doc.getElementById('pointerHalo');
const cursor=doc.createElement('div');cursor.id='neonCursorCore';cursor.setAttribute('aria-hidden','true');body.appendChild(cursor);
const trails=[];
if(fine.matches&&!reduced.matches){
  for(let i=0;i<6;i++){
    const d=doc.createElement('div');d.className='cursor-trail';
    d.style.width=d.style.height=Math.max(2,7-i)+'px';
    d.setAttribute('aria-hidden','true');body.appendChild(d);
    trails.push({el:d,x:innerWidth/2,y:innerHeight/2});
  }
}
const grid=doc.querySelector('.hero .cyber-grid');
const squares=doc.querySelector('.hero .digital-particles');
const portrait=doc.querySelector('.hero .hero-portrait');
const hero=doc.querySelector('.hero');
const mouse={x:innerWidth/2,y:innerHeight/2,tx:innerWidth/2,ty:innerHeight/2,active:false,velocityX:0,velocityY:0};
let w=innerWidth,h=innerHeight,dpr=1,points=[],drops=[],lastFrame=0,frame=0,themeIsNight=body.classList.contains('night');
const random=(min,max)=>min+Math.random()*(max-min);
function makePoint(){
 return{x:random(0,w),y:random(0,h),vx:random(-.22,.22),vy:random(-.18,.18),r:random(.8,2.6),seed:random(0,Math.PI*2)};
}
function makeDrops(){
 const step=w<650?23:29;
 drops=Array.from({length:Math.ceil(w/step)},(_,i)=>({x:i*step+random(-5,5),y:random(-h,h),speed:random(.9,3.3),count:random(6,15),phase:random(0,15)}));
}
function resize(){
 w=Math.max(1,innerWidth);h=Math.max(1,innerHeight);
 dpr=Math.min(window.devicePixelRatio||1,1.5);
 canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);
 canvas.style.width=w+'px';canvas.style.height=h+'px';
 ctx.setTransform(dpr,0,0,dpr,0,0);
 const count=w<600?23:w<1100?40:68;
 points=Array.from({length:count},makePoint);
 makeDrops();
}
function syncTheme(){
 themeIsNight=body.classList.contains('night');
 modeBadge.textContent=themeIsNight?'NIGHT MODE  /  CYAN NEON':'DAY MODE  /  MATRIX GREEN';
 modeBadge.style.borderColor=themeIsNight?'#00edff':'#56ff85';
 if(halo){halo.style.borderColor=themeIsNight?'#00faff':'#5aff8e';halo.style.boxShadow=themeIsNight?'0 0 23px #00f9ff':'0 0 23px #5cff80';}
}
new MutationObserver(syncTheme).observe(body,{attributes:true,attributeFilter:['class']});
syncTheme();
function onPointer(e){
 if(e.pointerType==='touch')return;
 mouse.tx=e.clientX;mouse.ty=e.clientY;mouse.active=true;
 const nx=(e.clientX/window.innerWidth-.5)*2,ny=(e.clientY/window.innerHeight-.5)*2;
 root.style.setProperty('--grid-parallax-x',(-nx*62).toFixed(2)+'px');
 root.style.setProperty('--grid-parallax-y',(-ny*44).toFixed(2)+'px');
 root.style.setProperty('--parallax-x',(nx*30).toFixed(2)+'px');
 root.style.setProperty('--parallax-y',(ny*24).toFixed(2)+'px');
 aura.style.transform='translate3d('+e.clientX+'px,'+e.clientY+'px,0)';
 cursor.style.opacity='1';
 if(fine.matches&&!reduced.matches&&hero){
   const r=hero.getBoundingClientRect();
   if(e.clientY>=r.top&&e.clientY<=r.bottom){
     const px=(e.clientX-r.left)/Math.max(1,r.width)-.5,py=(e.clientY-r.top)/Math.max(1,r.height)-.5;
     hero.style.setProperty('--hero-pointer-x',(px*100).toFixed(1)+'px');
     hero.style.setProperty('--hero-pointer-y',(py*75).toFixed(1)+'px');
   }
 }
}
doc.addEventListener('pointermove',onPointer,{passive:true});
doc.addEventListener('pointerleave',()=>{mouse.active=false;cursor.style.opacity='0';for(const t of trails)t.el.style.opacity='0';});
window.addEventListener('blur',()=>{mouse.active=false;cursor.style.opacity='0'});
window.addEventListener('resize',resize,{passive:true});
document.addEventListener('visibilitychange',()=>{lastFrame=0;});
function drawMatrix(dt){
 const fontSize=w<650?12:14;
 ctx.save();
 ctx.textBaseline='top';ctx.textAlign='center';ctx.font=fontSize+'px ui-monospace,Consolas,monospace';
 const glyphs='01<>/{}[]#$@';
 for(const drop of drops){
   drop.y+=drop.speed*dt*.72;
   if(drop.y>h+drop.count*fontSize){drop.y=-random(110,h);drop.speed=random(.9,3.2);}
   for(let j=0;j<drop.count;j++){
     const y=drop.y-j*fontSize*1.33;
     if(y<-30||y>h+20)continue;
     const alpha=(1-j/drop.count)*.2;
     ctx.fillStyle='rgba(77,255,117,'+alpha.toFixed(3)+')';
     ctx.fillText(glyphs[(Math.floor(drop.phase+frame*.15+j*1.7))%glyphs.length],drop.x,y);
   }
 }
 ctx.restore();
}
function drawPoints(dt){
 const green=!themeIsNight;
 const lineColor=green?'68,255,116':'0,235,255';
 const secondary=green?'155,255,89':'183,92,255';
 const mx=mouse.x,my=mouse.y;
 ctx.save();
 for(const p of points){
   p.x+=p.vx*dt*.75;p.y+=p.vy*dt*.75;
   if(p.x<-20)p.x=w+10;else if(p.x>w+20)p.x=-10;
   if(p.y<-20)p.y=h+10;else if(p.y>h+20)p.y=-10;
   // Nodes shift away from cursor — background reacts to real mouse movement.
   const dx=p.x-mx,dy=p.y-my,d2=dx*dx+dy*dy;
   if(mouse.active&&d2<42000&&d2>1){
     const dist=Math.sqrt(d2);
     const push=(1-dist/205)*1.8*dt;
     p.x+=dx/dist*push;p.y+=dy/dist*push;
   }
 }
 const cut=points.length;
 for(let i=0;i<cut;i++){
   const p=points[i];
   for(let j=i+1;j<cut;j++){
     const q=points[j],dx=q.x-p.x,dy=q.y-p.y,d2=dx*dx+dy*dy;
     if(d2>19000)continue;
     const opacity=(1-Math.sqrt(d2)/138)*.2;
     ctx.strokeStyle='rgba('+lineColor+','+opacity.toFixed(3)+')';
     ctx.lineWidth=.65;
     ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();
   }
   const tw=.65+.35*Math.sin(frame*.045+p.seed);
   ctx.fillStyle='rgba('+lineColor+','+(.37*tw).toFixed(3)+')';
   ctx.shadowBlur=13;ctx.shadowColor='rgba('+lineColor+',.7)';
   ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
   ctx.shadowBlur=0;
   if(mouse.active){
     const dx=p.x-mx,dy=p.y-my,dist=Math.hypot(dx,dy);
     if(dist<170){
       ctx.strokeStyle='rgba('+lineColor+','+(.4*(1-dist/170)).toFixed(3)+')';
       ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mx,my);ctx.stroke();
     }
   }
 }
 // Directional chevrons make motion obvious around the cursor.
 if(mouse.active){
   ctx.save();ctx.translate(mx,my);
   const angle=Math.atan2(mouse.velocityY,mouse.velocityX||.01);
   ctx.rotate(angle);
   for(let i=0;i<3;i++){
     const off=26+i*16;
     ctx.strokeStyle='rgba('+secondary+','+(.52-i*.12)+')';
     ctx.lineWidth=1.7-i*.25;
     ctx.beginPath();ctx.moveTo(-off-8,-9);ctx.lineTo(-off,0);ctx.lineTo(-off-8,9);ctx.stroke();
   }
   ctx.restore();
 }
 ctx.restore();
}
function draw(t){
 if(document.hidden){requestAnimationFrame(draw);return;}
 if(!lastFrame)lastFrame=t;
 const elapsed=t-lastFrame;
 const desired=matchMedia('(max-width:650px)').matches?38:30;
 if(elapsed<desired){requestAnimationFrame(draw);return;}
 lastFrame=t;frame++;
 const dt=Math.min(elapsed/16.7,2.1);
 mouse.velocityX+=(mouse.tx-mouse.x-mouse.velocityX)*.17;
 mouse.velocityY+=(mouse.ty-mouse.y-mouse.velocityY)*.17;
 mouse.x+=(mouse.tx-mouse.x)*.2;mouse.y+=(mouse.ty-mouse.y)*.2;
 cursor.style.transform='translate3d('+(mouse.x-4)+'px,'+(mouse.y-4)+'px,0)';
 for(let i=0;i<trails.length;i++){
  const q=trails[i], target=i?trails[i-1]:{x:mouse.x,y:mouse.y};
  q.x+=(target.x-q.x)*(.27-i*.025);q.y+=(target.y-q.y)*(.27-i*.025);
  q.el.style.transform='translate3d('+q.x+'px,'+q.y+'px,0)';
  q.el.style.opacity=mouse.active?String(Math.max(.12,.7-i*.1)):'0';
 }
 ctx.clearRect(0,0,w,h);
 if(!themeIsNight)drawMatrix(dt);
 drawPoints(dt);
 requestAnimationFrame(draw);
}
resize();
if(reduced.matches){
 ctx.clearRect(0,0,w,h);
 drawPoints(.02);
}else requestAnimationFrame(draw);
})();