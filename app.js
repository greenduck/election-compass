"use strict";

const locale=document.documentElement.dataset.locale;
const copy=TRANSLATIONS[locale]||TRANSLATIONS.he;
const t=copy.ui;
const values=[-2,-1,0,1,2];
const storageKey="electionMatcherAnswers";

function languageLink(href,code,label){
  const current=locale===code?' aria-current="page"':'';
  return `<a href="${href}" lang="${code}" hreflang="${code}"${current}>${label}</a>`;
}

document.getElementById("app").innerHTML=`
<div class="language-bar"><div class="wrap"><div class="language-switcher" aria-label="${t.language}">${languageLink("index.html","he","עברית")}${languageLink("en.html","en","English")}${languageLink("ru.html","ru","Русский")}</div></div></div>
<header><div class="wrap hero"><div class="eyebrow">${t.eyebrow}</div><h1>${t.title}</h1><p>${t.hero}</p><div class="notice">${t.notice}</div></div></header>
<nav><div class="wrap"><a href="#quiz">${t.quizNav}</a><a href="#results">${t.resultsNav}</a><a href="#parties">${t.partiesNav}</a><a href="#method">${t.methodNav}</a></div></nav>
<main class="wrap">
  <section class="intro-grid"><div class="stat"><strong>${copy.questions.length}</strong>${t.issues}</div><div class="stat"><strong>${PARTIES.length}</strong>${t.profiles}</div><div class="stat"><strong>5 ${t.degrees}</strong>${t.degreesText}</div></section>
  <section id="quiz"><h2>${t.quizTitle}</h2><p class="sub">${t.quizSub}</p><div class="toolbar"><div class="progress-shell"><div class="progress" id="progress"></div></div><span class="counter" id="counter">0 ${t.of} ${copy.questions.length}</span></div><form id="quizForm"><div id="questions"></div><div class="actions"><button class="primary" type="submit">${t.submit}</button><button class="secondary" type="button" id="resetButton">${t.reset}</button></div></form></section>
  <section id="results" class="hidden" aria-live="polite"><h2>${t.resultsTitle}</h2><p class="sub">${t.resultsSub}</p><div class="result-hero"><div class="matches" id="topMatches"></div><div class="all-results" id="allResults"></div></div></section>
  <section id="landscape"><h2>${t.changesTitle}</h2><div class="method"><p>${t.changesText}</p><p>${t.pollingNote}</p><a href="RESEARCH-2026-10-23.md">${t.reviewLink}</a></div></section>
  <section id="parties"><h2>${t.partiesTitle}</h2><p class="sub">${t.partiesSub}</p><div class="party-grid" id="partyGrid"></div></section>
  <section id="method"><h2>${t.methodTitle}</h2><div class="method"><p>${t.method1}</p><p>${t.method2}</p><p>${t.sources}: <a href="RESEARCH-2026-10-23.md">${t.reviewLink}</a>, <a href="https://www.gov.il/en/departments/units/central-elections-committee" target="_blank" rel="noreferrer">${locale==="he"?"ועדת הבחירות המרכזית":"Central Elections Committee"}</a>, ${t.sourceSuffix}</p></div></section>
  <div class="footer">${t.footer}</div>
</main>`;

const questionRoot=document.getElementById("questions");
copy.questions.forEach((question,index)=>{
  const box=document.createElement("section");
  box.className="question";
  box.innerHTML=`<div class="qhead"><span class="num">${index+1}</span><div class="qbody"><h3>${question}</h3><div class="answers">${t.labels.map((label,labelIndex)=>`<label><input type="radio" name="q${index}" value="${values[labelIndex]}"><span class="answer">${label}</span></label>`).join("")}</div><label class="importance"><input type="checkbox" name="important${index}"> ${t.important}</label></div></div>`;
  questionRoot.appendChild(box);
});

function partyText(party){return copy.parties[party.id]}
function partyStatus(party){return `<span class="confidence">${t.status}: ${t.statusLabels[party.status]}</span>`}
function updateProgress(){
  const answered=document.querySelectorAll('input[type="radio"]:checked').length;
  document.getElementById("counter").textContent=`${answered} ${t.of} ${copy.questions.length}`;
  document.getElementById("progress").style.width=`${answered/copy.questions.length*100}%`;
}
function assessParty(party,answers,weights){
  let distance=0,knownWeight=0,answeredWeight=0,compared=0,answered=0;
  answers.forEach((answer,index)=>{
    if(answer===null)return;
    answered++;answeredWeight+=weights[index];
    if(party.p[index]===null)return;
    compared++;knownWeight+=weights[index];
    distance+=Math.abs(answer-party.p[index])*weights[index];
  });
  const score=knownWeight?Math.round(100*(1-distance/(4*knownWeight))):null;
  const coverage=answeredWeight?knownWeight/answeredWeight:0;
  // A display safeguard, not a claim of statistical reliability.
  const eligible=score!==null && coverage>=0.5 && compared>=Math.min(5,answered);
  return {score,coverage,compared,answered,eligible};
}
function scoreParty(party,answers,weights){return assessParty(party,answers,weights).score}
function coverageText(result){
  return `${t.coverage}: ${result.compared}/${result.answered} ${t.matchedQuestions} · ${Math.round(result.coverage*100)}% ${t.weightedCoverage}`;
}
function positionDetails(party){
  return `<details class="position-details"><summary>${t.positionDetails}</summary><p>${t.evidenceNote}</p><ol>${copy.questions.map((question,index)=>{
    const position=party.p[index];
    const source=party.topicEvidence?.[index];
    return `<li>${question}<br><strong>${position===null?t.unknown:`${t.position}: ${t.labels[position+2]}`}</strong>${source?` · <a href="${source}" target="_blank" rel="noreferrer">${t.source}</a>`:""}</li>`;
  }).join("")}</ol></details>`;
}
function scoreMarkup(result){
  return result.score===null?"":`<div class="bar"><i style="width:${result.score}%"></i></div>`;
}

document.getElementById("partyGrid").innerHTML=PARTIES.map(party=>{
  const [name,people,description]=partyText(party);
  return `<article class="party"><h3>${name}</h3><div class="people">${people}</div><p>${description}</p><div class="links">${party.links.map(([label,url])=>`<a href="${url}" target="_blank" rel="noreferrer">${t.linkLabels[label]} ↗</a>`).join("")}</div><span class="confidence">${t.confidence}: ${t.confidenceLabels[party.confidence]}</span> ${partyStatus(party)}${positionDetails(party)}</article>`;
}).join("");

document.getElementById("quizForm").addEventListener("change",updateProgress);
document.getElementById("quizForm").addEventListener("submit",event=>{
  event.preventDefault();
  const answers=copy.questions.map((_,index)=>{const answer=document.querySelector(`input[name=q${index}]:checked`);return answer?Number(answer.value):null});
  if(answers.every(answer=>answer===null)){alert(t.empty);return}
  const weights=copy.questions.map((_,index)=>document.querySelector(`input[name=important${index}]`).checked?2:1);
  const assessed=PARTIES.map(party=>({...party,...assessParty(party,answers,weights)}));
  const ranked=assessed.filter(party=>party.eligible).sort((a,b)=>b.score-a.score || b.coverage-a.coverage);
  const limited=assessed.filter(party=>!party.eligible).sort((a,b)=>b.coverage-a.coverage);
  const fewAnswers=answers.filter(answer=>answer!==null).length<5?`<p class="evidence-note">${t.fewAnswers}</p>`:"";
  document.getElementById("topMatches").innerHTML=ranked.length?ranked.slice(0,3).map((party,index)=>{
    const [name]=partyText(party);
    return `<article class="match"><div class="rank">${t.rank} ${index+1}</div><h3>${name}</h3><div class="score">${party.score}%</div>${scoreMarkup(party)}<p class="evidence-note">${coverageText(party)}</p><span class="confidence">${t.confidence}: ${t.confidenceLabels[party.confidence]}</span> ${partyStatus(party)}</article>`;
  }).join(""):`<p>${t.noRanked}</p>`;
  function resultRow(party,index){
    const [name]=partyText(party);
    return `<div class="row"><b>${party.eligible?index+1:"—"}</b><span>${name}<br>${partyStatus(party)}<p class="evidence-note">${coverageText(party)}</p>${party.eligible?"":`<p class="evidence-note">${party.score===null?t.noEvidence:t.limitedEvidence}</p>`}${scoreMarkup(party)}</span><strong>${party.score===null?"—":`${party.score}%`}</strong></div>`;
  }
  document.getElementById("allResults").innerHTML=fewAnswers+ranked.map(resultRow).join("")+(limited.length?`<h3>${t.limitedTitle}</h3>`+limited.map(resultRow).join(""):"");
  document.getElementById("results").classList.remove("hidden");
  document.getElementById("results").scrollIntoView({behavior:"smooth"});
  localStorage.setItem(storageKey,JSON.stringify({version:DATA_VERSION,answers,weights}));
});

document.getElementById("resetButton").addEventListener("click",()=>{
  document.getElementById("quizForm").reset();
  document.getElementById("results").classList.add("hidden");
  localStorage.removeItem(storageKey);
  updateProgress();
});

try{
  const saved=JSON.parse(localStorage.getItem(storageKey));
  if(saved?.version===DATA_VERSION && Array.isArray(saved.answers) && saved.answers.length===copy.questions.length && saved.answers.every(answer=>answer===null||values.includes(answer))){
    saved.answers.forEach((answer,index)=>{
      if(answer!==null){const input=document.querySelector(`input[name=q${index}][value="${answer}"]`);if(input)input.checked=true}
      if(saved.weights?.[index]===2){const important=document.querySelector(`input[name=important${index}]`);if(important)important.checked=true}
    });
    updateProgress();
  }
}catch(error){/* Ignore malformed or unavailable browser storage. */}
