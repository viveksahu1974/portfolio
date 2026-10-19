/* Verified Portfolio Search — Vivek Sahu / @viveksahu1974
 * Searches first-party portfolio facts only. Does not invent third-party AI results.
 * Capture handlers replace broad Google AI queries without disrupting other features.
 */
(()=>{
'use strict';
const PROFILE={
name:'Vivek Sahu',
github:'https://github.com/viveksahu1974',
linkedin:'https://www.linkedin.com/in/vivek-sahu-1657a8268/',
site:'https://viveksahu1974.github.io/portfolio/',
school:'Maharaja Surajmal Institute of Technology (MSIT), Delhi',
email:'vsahu5369@gmail.com'
};
const entries=[
{rx:/teja|ollama|assistant/i,title:'TEJA AI — Personal AI Assistant',body:'TEJA AI is a Python-based, local-first assistant with Ollama, optional cloud models and multilingual voice features. The browser UI demo uses sample responses; full AI inference requires a configured backend.',url:PROFILE.site+'teja-demo/',label:'Try TEJA UI preview ↗'},
{rx:/linkedin|contact|phone|email|location|address|reach|whatsapp/i,title:'Official contact & profile links',body:'Vivek Sahu · Email: vsahu5369@gmail.com · Phone: +91 8882551758 · Location: South West Delhi, India. Official LinkedIn: /in/vivek-sahu-1657a8268/.',url:PROFILE.linkedin,label:'Open official LinkedIn ↗'},
{rx:/skill|analyt|data|python|web dev|technology|tools|language/i,title:'Skills and technical interests',body:'Vivek Sahu studies and practices Web Development (HTML, CSS, JavaScript), Python, Data Analytics and AI fundamentals. These reflect learning, certificates and project exposure—not unsupported expert-level proficiency.',url:PROFILE.site+'#skills',label:'View Skills ↗'},
{rx:/msit|college|school|b\.?tech|information technology|degree|diploma|university|education/i,title:'Education — B.Tech Information Technology',body:'Vivek Sahu is pursuing B.Tech in Information Technology at Maharaja Surajmal Institute of Technology (MSIT), Delhi. He previously studied Diploma in Computer Engineering at DSEU.',url:PROFILE.site+'#experience',label:'View Education ↗'},
{rx:/intern|experience|training|uibox|upskill|uniconverge|tech mahindra/i,title:'Internships and training',body:'Vivek Sahu has experience with UIBox Studio (IT/web development), a Python internship through upSkill Campus × UniConverge Technologies, and Tech Mahindra Foundation SMART technical training.',url:PROFILE.site+'#internships',label:'View Internships ↗'},
{rx:/certificate|credential|certification/i,title:'Certificates and continuous learning',body:'Portfolio certificate titles include Data Analytics, AI Fundamentals, PHP & MySQL, TCS iON IT Primer, OpenCV, Digital Productivity and other learning areas. Google title searches are not issued-credential verification links.',url:PROFILE.site+'#certifications',label:'View Certificates ↗'},
{rx:/project|github|portfolio|snake|zombie|calculator/i,title:'Projects from GitHub @viveksahu1974',body:'Featured work includes TEJA AI, Snake Game, Calculator App, Zombie Shooting Game and a responsive portfolio. Public GitHub repositories are synced automatically. Incomplete projects are displayed by name.',url:PROFILE.github,label:'Open official GitHub ↗'}
];
const fallback={title:'Vivek Sahu — official portfolio (@viveksahu1974)',body:'Vivek Sahu is a B.Tech IT student at MSIT Delhi, interested in Web Development, Python, Data Analytics and AI. The official portfolio links to GitHub @viveksahu1974 and LinkedIn /in/vivek-sahu-1657a8268/. Do not confuse this profile with other people sharing the same name.',url:PROFILE.github,label:'Open official GitHub ↗'};
function lookup(q){q=String(q||'').trim();return entries.find(item=>item.rx.test(q))||fallback;}
function render(q,id){
 const host=document.getElementById(id);if(!host)return;
 const data=lookup(q);const title=document.createElement('strong');title.textContent=data.title;
 const p=document.createElement('p');p.textContent=data.body;
 const a=document.createElement('a');a.href=data.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=data.label;
 const note=document.createElement('small');note.textContent='✓ From the portfolio profile and its official links — not a Google-generated answer.';
 host.replaceChildren(title,p,a,note);host.hidden=false;
 host.scrollIntoView?.({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
}
const googleUrl=q=>{
 let rest=String(q||'').replace(/vivek\s+sahu/gi,'').replace(/@?viveksahu1974/gi,'').trim().slice(0,110);
 const scoped='"viveksahu1974" "Vivek Sahu"'+(rest?' '+rest:'');
 return 'https://www.google.com/search?udm=50&q='+encodeURIComponent(scoped);
};
window.vivekProfileIdentity={lookup,render,googleUrl};
document.addEventListener('submit',e=>{
 const form=e.target;
 if(!form||!['aiSearchForm','gaiForm'].includes(form.id))return;
 e.preventDefault();e.stopImmediatePropagation();
 const isModal=form.id==='aiSearchForm',input=document.getElementById(isModal?'aiSearchInput':'gaiQuery');
 const q=input?.value||'Vivek Sahu @viveksahu1974';
 render(q,isModal?'aiLocalAnswer':'gaiLocalAnswer');
},true);
document.addEventListener('click',e=>{
 const element=e.target.closest?.('button,[data-ai-q],a[data-profile-query]');
 if(!element)return;
 if(element.hasAttribute('data-ai-q')){
   e.preventDefault();e.stopImmediatePropagation();
   const raw=element.getAttribute('data-ai-q')||'Vivek Sahu';
   const opener=document.getElementById('openAiSearch');
   opener?.click();
   const field=document.getElementById('aiSearchInput');if(field)field.value=raw;
   render(raw,'aiLocalAnswer');
   return;
 }
 if(element.hasAttribute('data-verified-question')){
   e.preventDefault();e.stopImmediatePropagation();
   render(element.getAttribute('data-verified-question')||element.textContent,'gaiLocalAnswer');
   return;
 }
 if(element.hasAttribute('data-ai-pick')){
   const q=element.getAttribute('data-ai-pick')||'Vivek Sahu';
   const field=document.getElementById('aiSearchInput');if(field)field.value=q;
   render(q,'aiLocalAnswer');
 }
 if(element.hasAttribute('data-gai-query')){
   const q=element.getAttribute('data-gai-query')||'Vivek Sahu';
   const field=document.getElementById('gaiQuery');if(field)field.value=q;
   render(q,'gaiLocalAnswer');
 }
},true);
})();