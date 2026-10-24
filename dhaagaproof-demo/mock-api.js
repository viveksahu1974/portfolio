/* DHAAGAPROOF browser-only API simulator.
   All records are fictional, RAM-only, and reset on reload.
   Ports transparent cost/allocation formulas for demonstration;
   no Python backend, persistent SQLite, Ollama, audit hashes or banking.
*/
(function(){
'use strict';
const nativeFetch=window.fetch.bind(window);
const datePlus=n=>{const d=new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)};
let members=[
 {id:1,name:'Kiran',skill:'garments',capacity_per_day:9,consent:1,jobs_done:16,jobs_late:1},
 {id:2,name:'Meera',skill:'garments',capacity_per_day:8,consent:1,jobs_done:10,jobs_late:1},
 {id:3,name:'Pooja',skill:'garments',capacity_per_day:7,consent:1,jobs_done:12,jobs_late:3},
 {id:4,name:'Saira',skill:'garments',capacity_per_day:10,consent:1,jobs_done:18,jobs_late:1},
 {id:5,name:'Anjali',skill:'mixed',capacity_per_day:7,consent:1,jobs_done:8,jobs_late:1},
 {id:6,name:'Farida',skill:'garments',capacity_per_day:8,consent:1,jobs_done:9,jobs_late:2},
 {id:7,name:'Ritu',skill:'food',capacity_per_day:10,consent:1,jobs_done:14,jobs_late:2},
 {id:8,name:'Nusrat',skill:'mixed',capacity_per_day:7,consent:1,jobs_done:7,jobs_late:0}
];
let orders=[
 {id:1,buyer:'Sahyog Stores',product:'Handmade cotton tote bags',category:'garments',quantity:240,buyer_price_per_unit:165,material_per_unit:72,labour_rate_hour:72,minutes_per_unit:22,overhead_per_unit:8,target_margin_pct:22,due_date:datePlus(5),status:'active'},
 {id:2,buyer:'LokMart Collective',product:'Festival gift pouches',category:'garments',quantity:150,buyer_price_per_unit:118,material_per_unit:56,labour_rate_hour:72,minutes_per_unit:19,overhead_per_unit:7,target_margin_pct:20,due_date:datePlus(12),status:'draft'}
];
let assignments=[
 {id:1,order_id:1,member_id:1,allocated_units:45,completed_units:28,accepted_units:26,approved_payout:0},
 {id:2,order_id:1,member_id:2,allocated_units:39,completed_units:32,accepted_units:31,approved_payout:0},
 {id:3,order_id:1,member_id:3,allocated_units:35,completed_units:20,accepted_units:17,approved_payout:0},
 {id:4,order_id:1,member_id:4,allocated_units:50,completed_units:44,accepted_units:43,approved_payout:0},
 {id:5,order_id:1,member_id:5,allocated_units:34,completed_units:13,accepted_units:12,approved_payout:0},
 {id:6,order_id:1,member_id:6,allocated_units:37,completed_units:19,accepted_units:18,approved_payout:0}
];
let actions=[],drafts=[],history=[],counter=0;
const money=v=>Math.round((Number(v)+Number.EPSILON)*100)/100;
const now=()=>new Date().toISOString().replace('T',' ').slice(0,19);
function record(kind,detail){
 history.unshift({id:++counter,created_at:now(),kind,payload:JSON.stringify(detail),digest:'SESSION-ONLY-NO-HASH'});
}
record('fictional_demo_initialized',{members:8,orders:2,storage:'browser RAM only'});
const daysLeft=d=>Math.ceil((new Date(d+'T12:00:00')-new Date(new Date().toDateString()))/86400000);
function quote(o){
 const material=Number(o.material_per_unit),labour=Number(o.labour_rate_hour)*Number(o.minutes_per_unit)/60;
 const overhead=Number(o.overhead_per_unit),cost=material+labour+overhead,price=Number(o.buyer_price_per_unit);
 const min=Math.ceil(cost/Math.max(.01,1-Number(o.target_margin_pct)/100));
 return{material:money(material),labour:money(labour),overhead:money(overhead),unit_cost:money(cost),min_quote_for_target:min,
 buyer_price:price,margin_pct:price?money((price-cost)/price*100):-100,target_margin_pct:Number(o.target_margin_pct),
 total_order_value:money(price*o.quantity),projected_profit:money((price-cost)*o.quantity),below_cost:price<cost,below_target:price<min,
 assumptions:'Fictional, input-driven prices are not market or wage-law verification.'};
}
const unitWage=o=>Number(o.labour_rate_hour)*Number(o.minutes_per_unit)/60;
const reliability=m=>(m.jobs_done-m.jobs_late+3)/(m.jobs_done+4);
function gini(vals){const a=vals.slice().sort((x,y)=>x-y),sum=a.reduce((x,y)=>x+y,0);return sum?Math.round(a.reduce((x,v,i)=>x+(2*(i+1)-a.length-1)*v,0)/(a.length*sum)*1000)/1000:0;}
function byOrder(id){const order=orders.find(o=>o.id===Number(id));if(!order)throw Error('Sample order not found');return order;}
function workload(id,except){return assignments.filter(a=>a.member_id===id&&a.order_id!==except).reduce((s,a)=>s+a.allocated_units-a.completed_units,0);}
function allocate(o){
 const days=Math.min(90,Math.max(1,daysLeft(o.due_date)+1));
 const eligible=members.filter(m=>m.consent&&(m.skill===o.category||m.skill==='mixed')).map(m=>{
  const load=workload(m.id,o.id);return {id:m.id,name:m.name,daily:m.capacity_per_day,prior_load:load,reliability:reliability(m),
   capacity:Math.max(0,m.capacity_per_day*days-load),allocated:0};
 }).filter(m=>m.capacity>0);
 let remaining=Number(o.quantity);
 while(remaining>0){
  const choices=eligible.filter(m=>m.allocated<m.capacity);
  if(!choices.length)break;
  choices.sort((a,b)=>{
   const aa=(a.allocated+a.prior_load)/(a.daily*days)+(1-a.reliability)*.035;
   const bb=(b.allocated+b.prior_load)/(b.daily*days)+(1-b.reliability)*.035;
   return aa-bb||a.allocated-b.allocated||a.id-b.id;
  });
  choices[0].allocated++;remaining--;
 }
 const chosen=eligible.filter(m=>m.allocated).map(m=>({...m,suggested_wage:money(m.allocated*unitWage(o)),
 reason:m.daily+' units/day, '+Math.round(m.reliability*100)+'% illustrative reliability; balancing capacity and consent.'}));
 const allocated=Number(o.quantity)-remaining;
 return {order_id:o.id,days_available:days,allocations:chosen,allocated_units:allocated,unallocated_units:remaining,
 payout_per_accepted_unit:money(unitWage(o)),gini_allocation:gini(chosen.map(m=>m.allocated)),
 weighted_reliability:allocated?money(chosen.reduce((s,m)=>s+m.allocated*m.reliability,0)/allocated*100):0,
 status:remaining?'Capacity shortfall':'Ready for human approval',human_approval_required:true,
 explanation:'Port of transparent capacity logic from the Python prototype. Session-only work suggestions; no real assignments.'};
}
function assignmentRows(o){
 return assignments.filter(a=>a.order_id===o.id).map(a=>{
 const m=members.find(x=>x.id===a.member_id);
 const earned=money(a.accepted_units*unitWage(o));
 return {...a,member_name:m.name,capacity_per_day:m.capacity_per_day,product:o.product,
 labour_rate_hour:o.labour_rate_hour,minutes_per_unit:o.minutes_per_unit,
 earned,due_payout:money(Math.max(0,earned-a.approved_payout))};
 });
}
function signals(o){
 const arr=assignmentRows(o),qty=Number(o.quantity),done=arr.reduce((n,a)=>n+a.completed_units,0);
 const allocated=arr.reduce((n,a)=>n+a.allocated_units,0),c=quote(o),days=daysLeft(o.due_date);
 let out=[];
 if(c.below_cost)out.push({level:'critical',title:'Loss-making order',detail:'The example offer is below entered cost.'});
 else if(c.below_target)out.push({level:'warning',title:'Margin below target',detail:'Buyer offer is below the example target.'});
 if(o.status==='draft')out.push({level:'info',title:'Awaiting allocation',detail:'Review and approve a capacity-aware proposal.'});
 else{
  if(allocated<qty)out.push({level:'warning',title:'Unassigned pieces',detail:(qty-allocated)+' units lack an assigned member.'});
  if(days<0&&done<qty)out.push({level:'critical',title:'Deadline missed',detail:(qty-done)+' units incomplete.'});
  else if(days<=3&&done<qty)out.push({level:'warning',title:'Deadline approaching',detail:(qty-done)+' pieces incomplete with '+days+' days left.'});
  const accepted=arr.reduce((n,a)=>n+a.accepted_units,0);
  if(done&&(done-accepted)/done>.08)out.push({level:'warning',title:'Quality acceptance low',detail:'Request a human quality review.'});
 }
 if(!out.length)out=[{level:'ok',title:'No immediate exceptions',detail:'Collect further progress details.'}];
 return out;
}
function state(){
 const enriched=orders.map(o=>{
 const arr=assignmentRows(o),done=arr.reduce((n,a)=>n+a.completed_units,0),accepted=arr.reduce((n,a)=>n+a.accepted_units,0);
 return{...o,completed_units:done,accepted_units:accepted,assigned_units:arr.reduce((n,a)=>n+a.allocated_units,0),
 progress_pct:money(100*done/o.quantity),quote:quote(o),alerts:signals(o),assignments:arr,
 earnings_total:money(arr.reduce((n,a)=>n+a.earned,0)),
 payouts_approved:money(arr.reduce((n,a)=>n+a.approved_payout,0))};
 }).sort((a,b)=>b.id-a.id);
 return{demo_mode:true,security_notice:'Static simulation, fictional workers. No server or data storage.',members,orders:enriched,
 audit:history.slice(0,20),audit_valid:false,agent_actions:actions.slice().reverse(),message_drafts:drafts.slice().reverse(),
 metrics:{active_orders:enriched.filter(o=>o.status==='active').length,
 open_units:enriched.reduce((s,o)=>s+o.quantity-o.completed_units,0),
 approved_wages:money(enriched.reduce((s,o)=>s+o.payouts_approved,0)),
 order_value:money(enriched.reduce((s,o)=>s+o.quote.total_order_value,0)),
 alerts:enriched.flatMap(o=>o.alerts).filter(a=>a.level==='warning'||a.level==='critical').length}};
}
function settlement(o){
 const payments=assignmentRows(o).map(a=>({assignment_id:a.id,member:a.member_name,accepted_units:a.accepted_units,
 earned:a.earned,already_approved:a.approved_payout,new_due:a.due_payout}));
 return{order_id:o.id,members:payments,total_new_due:money(payments.reduce((s,p)=>s+p.new_due,0)),requires_approval:true,
 note:'Group approval records sample payables. Absolutely no bank, cash or UPI transfer.'};
}
function agent(o){
 const issues=signals(o),arr=assignmentRows(o),proposed=[];
 if(o.status==='draft')proposed.push({type:'review_allocation',label:'Review allocation plan',reason:allocate(o).allocated_units+' units available for proposal.'});
 else{
  for(const s of issues){
   if(s.title.includes('Deadline'))proposed.push({type:'contact_members',label:'Draft progress check-in',reason:'Ask members for delivery estimates before changing assignments.'});
   if(s.title.includes('Margin')||s.title.includes('Loss'))proposed.push({type:'review_quote',label:'Review quote economics',reason:'Recheck assumptions with the group and buyer.'});
   if(s.title.includes('Quality'))proposed.push({type:'quality_review',label:'Arrange human quality check',reason:'Do not reject handmade work automatically.'});
  }
 }
 if(!proposed.length)proposed.push({type:'collect_progress',label:'Collect member progress',reason:'Fresh counts improve deadline predictions.'});
 const ids=proposed.map(p=>{
  let existing=actions.find(a=>a.order_id===o.id&&a.action_type===p.type&&a.status==='proposed');
  if(existing)return existing.id;
  const obj={id:actions.length+1,order_id:o.id,action_type:p.type,title:p.label,reason:p.reason,status:'proposed',outcome:''};
  actions.push(obj);return obj.id;
 });
 record('agent_demo_proposals',{order_id:o.id,action_ids:ids,external_actions_executed:0});
 return{goal:'Deliver '+o.quantity+' '+o.product+' by '+o.due_date+' with transparent work and wages',
 cycle:['Observe order and member records','Evaluate cost, capacity and quality','Propose bounded next steps','Await group approval','Record every approved change'],
 model_type:'Transparent browser rules only — NO generative AI',
 proposed_actions:proposed.map(p=>({...p,human_approval:true})),
 action_ids:ids,signals:issues,execution:'Session-only proposals. No money moved or external messages sent.'};
}
function handle(path,payload){
 const u=new URL(path,location.origin),d=payload||{},p=u.pathname;
 if(p==='/api/state')return state();
 if(p==='/api/plan')return allocate(byOrder(Number(u.searchParams.get('order_id'))));
 if(p==='/api/settlement')return settlement(byOrder(Number(u.searchParams.get('order_id'))));
 if(p==='/api/plan/approve'){
  const o=byOrder(d.order_id);if(o.status!=='draft')throw Error('Order already approved');
  const plan=allocate(o);if(plan.unallocated_units)throw Error('Not enough consented capacity to approve this plan');
  let id=Math.max(0,...assignments.map(a=>a.id));
  for(const m of plan.allocations)assignments.push({id:++id,order_id:o.id,member_id:m.id,allocated_units:m.allocated,completed_units:0,accepted_units:0,approved_payout:0});
  o.status='active';record('demo_allocation_approved',{order_id:o.id,simulation:true});
  return{message:'Simulation approved: no real work assigned',plan};
 }
 if(p==='/api/progress'){
  const a=assignments.find(a=>a.id===Number(d.assignment_id));if(!a)throw Error('Assignment not found');
  const prod=Number(d.produced_increment),accepted=Number(d.accepted_increment);
  if(!Number.isInteger(prod)||!Number.isInteger(accepted)||prod<1||accepted<0||accepted>prod||a.completed_units+prod>a.allocated_units)throw Error('Accepted cannot exceed produced or remaining assigned pieces');
  a.completed_units+=prod;a.accepted_units+=accepted;record('sample_quality_recorded',{assignment_id:a.id,produced:prod,accepted});return{message:'Session sample quality saved'};
 }
 if(p==='/api/settlement/approve'){
  const o=byOrder(d.order_id),result=settlement(o);if(result.total_new_due<=0)throw Error('No pending accepted wages to approve');
  result.members.forEach(p=>{const a=assignments.find(a=>a.id===p.assignment_id);a.approved_payout=money(a.approved_payout+p.new_due)});
  record('simulated_wage_ledger_approved',{order_id:o.id,total:result.total_new_due,bank_transfer:false});
  return{message:'Sample payables approved only. No money transferred.',preview:result};
 }
 if(p==='/api/agent/run')return agent(byOrder(d.order_id));
 if(p==='/api/agent/approve'){
  const a=actions.find(x=>x.id===Number(d.action_id));if(!a||a.status!=='proposed')throw Error('Action not available');
  a.status='approved_prepared';a.outcome='Simulated internal preparation. Nothing sent externally.';
  if(a.action_type==='contact_members'||a.action_type==='collect_progress'){
   const o=byOrder(a.order_id);
   for(const as of assignmentRows(o).filter(x=>x.allocated_units>x.completed_units)){
    drafts.push({id:drafts.length+1,order_id:o.id,member_id:as.member_id,member_name:as.member_name,
     text:'UNSENT: Namaste '+as.member_name+' ji. Please share progress for your '+(as.allocated_units-as.completed_units)+' remaining pieces.',
     status:'UNSENT DEMO'});
   }
  }
  record('simulated_internal_action_approved',{id:a.id,external_messages_sent:0});
  return{message:'Demo action prepared in this session. No message sent.'};
 }
 if(p==='/api/consent'){
  const m=members.find(m=>m.id===Number(d.member_id));if(!m)throw Error('Worker not found');
  m.consent=d.consent?1:0;record('demo_member_consent_changed',{member_id:m.id,consent:!!m.consent});return{message:'Sample consent updated'};
 }
 if(p==='/api/orders'){
  const n={...d};
  for(const k of ['quantity','buyer_price_per_unit','material_per_unit','labour_rate_hour','minutes_per_unit','overhead_per_unit','target_margin_pct'])n[k]=Number(n[k]);
  if(!String(n.buyer||'').trim()||!String(n.product||'').trim()||!['garments','food','craft'].includes(n.category)||
    !Number.isInteger(n.quantity)||n.quantity<1||n.quantity>5000||n.minutes_per_unit<=0||n.target_margin_pct>=90||daysLeft(n.due_date)<0||
    ['buyer_price_per_unit','material_per_unit','labour_rate_hour','minutes_per_unit','overhead_per_unit','target_margin_pct'].some(k=>!Number.isFinite(n[k])||n[k]<0))
    throw Error('Review buyer, product, quantity, prices, margin, minutes and due date');
  n.id=Math.max(...orders.map(o=>o.id))+1;n.status='draft';n.buyer=String(n.buyer).slice(0,100);n.product=String(n.product).slice(0,140);
  orders.push(n);record('new_demo_order',{order_id:n.id,quantity:n.quantity});return{order_id:n.id};
 }
 if(p==='/api/assistant'){
  const o=byOrder(d.order_id),c=quote(o),arr=assignmentRows(o);
  return{mode:'RULE TEMPLATE — NOT AN LLM',answer:o.product+': '+arr.reduce((s,a)=>s+a.completed_units,0)+'/'+o.quantity+
   ' sample units made; offer ₹'+c.buyer_price+', cost ₹'+c.unit_cost+', estimated margin '+c.margin_pct+
   '%. Observations: '+signals(o).map(x=>x.title).join('; ')+
   '. Suggested next step: ask the group to review workload, quality and payables. No real payment or work assignment occurred.'};
 }
 throw Error('Unknown browser demo endpoint: '+p);
}
window.fetch=function(resource,options){
 const path=typeof resource==='string'?resource:(resource&&resource.url)||'';
 if(!path.startsWith('/api/'))return nativeFetch(resource,options);
 return Promise.resolve().then(()=>{
  try{
   const payload=options&&options.body?JSON.parse(options.body):undefined;
   return new Response(JSON.stringify(handle(path,payload)),{status:200,headers:{'Content-Type':'application/json'}});
  }catch(err){return new Response(JSON.stringify({error:String(err.message||err)}),{status:400,headers:{'Content-Type':'application/json'}});}
 });
};
})();