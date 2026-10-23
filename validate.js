"use strict";
// Dependency-free checks; DOM harness exercises app handlers, not browser layout.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const read=file=>fs.readFileSync(path.join(__dirname,file),"utf8");
const source=read("data.js")+"\n"+read("translations.js");
const data=vm.runInNewContext(source+";({PARTIES,TRANSLATIONS,DATA_VERSION,SOURCES})");
const {PARTIES,TRANSLATIONS,DATA_VERSION}=data;
const questionCount=22;
assert.equal(PARTIES.length,15);
assert.equal(new Set(PARTIES.map(p=>p.id)).size,15);
for(const retired of ["blueWhite","hadashTaal","balad","zionistHome"]){
 assert(!PARTIES.some(p=>p.id===retired));
}
for(const id of ["jointList","reservists","harediPublic","noam"]){assert(PARTIES.some(p=>p.id===id))}
for(const [locale,copy] of Object.entries(TRANSLATIONS)){
 assert.equal(copy.questions.length,questionCount,locale);
 assert.equal(new Set(copy.questions).size,questionCount,locale);
 assert.equal(Object.keys(copy.parties).length,15,locale);
 for(const party of PARTIES){
  assert.equal(copy.parties[party.id].length,3,party.id);
  assert(copy.parties[party.id].every(s=>typeof s==="string"&&s.length));
  assert(copy.ui.confidenceLabels[party.confidence]);
  assert(copy.ui.statusLabels[party.status]);
  assert.equal(party.p.length,questionCount);
  for(const index of [3,6,11,20,21]){
   if(party.p[index]!==null)assert.equal(new URL(party.topicEvidence[index]).protocol,"https:");
  }
  assert(party.p.every(v=>v===null||(Number.isInteger(v)&&v>=-2&&v<=2)));
  for(const [label,url] of party.links){assert(copy.ui.linkLabels[label]);assert.equal(new URL(url).protocol,"https:")}
 }
 const file={he:"index.html",en:"en.html",ru:"ru.html"}[locale];
 assert(read(file).includes(`dir="${locale==="he"?"rtl":"ltr"}"`));
}
function app(locale,saved){
 const elements=new Map(),inputs=new Map(),storage=new Map();
 if(saved!==undefined)storage.set("electionMatcherAnswers",typeof saved==="string"?saved:JSON.stringify(saved));
 function element(id){
  if(!elements.has(id))elements.set(id,{innerHTML:"",textContent:"",style:{},children:[],handlers:{},
   classList:{add(){},remove(){}},appendChild(child){this.children.push(child)},
   addEventListener(type,callback){this.handlers[type]=callback},scrollIntoView(){},
   reset(){for(const input of inputs.values())input.checked=false}});
  return elements.get(id);
 }
 for(let i=0;i<questionCount;i++){
  for(const value of [-2,-1,0,1,2])inputs.set(`q${i}:${value}`,{name:`q${i}`,value:String(value),checked:false});
  inputs.set(`important${i}`,{checked:false});
 }
 const context={document:{documentElement:{dataset:{locale}},getElementById:element,
  createElement:()=>({innerHTML:"",className:""}),
  querySelectorAll:()=>[...inputs.values()].filter(i=>i.name&&i.checked),
  querySelector(selector){
   let m=selector.match(/^input\[name=important(\d+)\]$/); if(m)return inputs.get(`important${m[1]}`);
   m=selector.match(/^input\[name=q(\d+)\]:checked$/); if(m)return [...inputs.values()].find(i=>i.name===`q${m[1]}`&&i.checked)||null;
   m=selector.match(/^input\[name=q(\d+)\]\[value="(-?\d+)"\]$/); if(m)return inputs.get(`q${m[1]}:${m[2]}`)||null;
   throw Error(`Unexpected selector: ${selector}`);
  }},localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,v)=>storage.set(key,v),removeItem:key=>storage.delete(key)},
  alert:()=>context.alerted=true};
 vm.createContext(context);
 vm.runInContext(source+"\n"+read("app.js"),context);
 return {context,elements,inputs,storage,submit:()=>element("quizForm").handlers.submit({preventDefault(){}})};
}
for(const locale of ["he","en","ru"]){
 const a=app(locale);
 assert.equal(a.elements.get("questions").children.length,questionCount);
 assert.equal((a.elements.get("partyGrid").innerHTML.match(/<article /g)||[]).length,15);
 assert(!a.elements.get("app").innerHTML.includes("undefined"));
 assert(!a.elements.get("partyGrid").innerHTML.includes("undefined"));
 assert.equal((a.elements.get("partyGrid").innerHTML.match(/<li>/g)||[]).length,15*questionCount);
 assert(a.elements.get("partyGrid").innerHTML.includes(TRANSLATIONS[locale].ui.unknown));
 a.submit();assert(a.context.alerted);
 a.inputs.get("q0:2").checked=true;a.inputs.get("q1:-2").checked=true;a.inputs.get("important1").checked=true;
 a.submit();
 const saved=JSON.parse(a.storage.get("electionMatcherAnswers"));assert.equal(saved.version,DATA_VERSION);
 assert.equal(saved.answers[0],2);assert.equal(saved.weights[1],2);
 const scores=[...a.elements.get("allResults").innerHTML.matchAll(/<strong>(\d+)%/g)].map(m=>Number(m[1]));
 assert(scores.length>0 && scores.length<15);assert(scores.every(v=>v>=0&&v<=100));
 assert.equal((a.elements.get("allResults").innerHTML.match(/class="row"/g)||[]).length,15);
 const mainScores=[...a.elements.get("allResults").innerHTML.split("<h3>")[0].matchAll(/<strong>(\d+)%/g)].map(m=>Number(m[1]));
 assert(mainScores.every((v,i)=>!i||mainScores[i-1]>=v));
 assert.equal((a.elements.get("topMatches").innerHTML.match(/<article /g)||[]).length,3);
 assert(!a.elements.get("allResults").innerHTML.includes("undefined"));
 const full=app(locale);
 for(let i=0;i<questionCount;i++)full.inputs.get(`q${i}:0`).checked=true;
 full.submit();
 assert.equal((full.elements.get("allResults").innerHTML.match(/class="row"/g)||[]).length,15);
 assert(!full.elements.get("allResults").innerHTML.includes("NaN"));
 assert(full.elements.get("allResults").innerHTML.includes(TRANSLATIONS[locale].ui.limitedEvidence));
 const restored=app(locale,saved);assert(restored.inputs.get("q0:2").checked);assert(restored.inputs.get("important1").checked);
 const legacy=app(locale,{answers:saved.answers,weights:saved.weights});assert(!legacy.inputs.get("q0:2").checked);
 for(const version of ["2026-10-23","2026-10-23-v2"]){
  const obsolete=app(locale,{...saved,version});assert(!obsolete.inputs.get("q0:2").checked);
 }
 const malformed=app(locale,"{broken");assert(!malformed.inputs.get("q0:2").checked);
 a.elements.get("resetButton").handlers.click();assert.equal(a.storage.size,0);assert(!a.inputs.get("q0:2").checked);
 assert.equal(a.context.scoreParty({p:[2,-2]},[2,2],[1,2]),33);
 assert.equal(a.context.scoreParty({p:[2,-2]},[2,null],[1,2]),100);
 assert.equal(a.context.scoreParty({p:[2]},[-2],[1]),0);
 assert.equal(a.context.scoreParty({p:[2]},[null],[1]),null);
 // Unknown is neither a neutral answer nor a disagreement.
 assert.equal(a.context.scoreParty({p:[null]},[0],[1]),null);
 assert.equal(a.context.scoreParty({p:[0]},[0],[1]),100);
 assert.equal(a.context.scoreParty({p:[null,2]},[-2,2],[2,1]),100);
 const sparse=a.context.assessParty({p:[null,2]},[-2,2],[2,1]);
 assert.equal(sparse.coverage,1/3);assert.equal(sparse.compared,1);assert.equal(sparse.eligible,false);
 const none=a.context.assessParty({p:[null,null]},[2,-2],[1,1]);
 assert.equal(none.score,null);assert.equal(none.coverage,0);assert.equal(none.eligible,false);
 const boundary=a.context.assessParty({p:[2,2,2,2,2,null,null,null,null,null]},Array(10).fill(2),Array(10).fill(1));
 assert.equal(boundary.eligible,true);assert.equal(boundary.coverage,0.5);
 const below=a.context.assessParty({p:[2,2,2,2,2,null,null,null,null,null]},Array(10).fill(2),[1,1,1,1,1,2,1,1,1,1]);
 assert.equal(below.eligible,false);
 assert.equal(a.context.assessParty({p:[2,2,null]},[2,2,2],[1,1,1]).eligible,false);
 const single=app(locale);single.inputs.get("q3:2").checked=true;single.submit();
 assert(!single.elements.get("allResults").innerHTML.includes("null%"));
 assert(!single.elements.get("allResults").innerHTML.includes("NaN"));
 assert(single.elements.get("allResults").innerHTML.includes(TRANSLATIONS[locale].ui.noEvidence));
 assert.equal((single.elements.get("topMatches").innerHTML.match(/<article /g)||[]).length,2);
 // All unknown answered topics must show fallback, never a manufactured winner.
 vm.runInContext('PARTIES.forEach(party=>party.p[3]=null)',single.context);single.submit();
 assert(single.elements.get("topMatches").innerHTML.includes(TRANSLATIONS[locale].ui.noRanked));
 assert.equal((single.elements.get("topMatches").innerHTML.match(/<article /g)||[]).length,0);
 for(const party of PARTIES){
  const weights=Array(questionCount).fill(1);
  assert.equal(a.context.scoreParty(party,party.p,weights),100);
  assert.equal(a.context.scoreParty({...party,status:"below"},party.p,weights),100);
 }
}
console.log("PASS: 15 lists, 22 questions × 3 locales; valid vectors/links; rendering harness, scoring, ranking, reset and versioned persistence.");
