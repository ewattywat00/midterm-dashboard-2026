(function(){
"use strict";
var LEANTXT={SD:"Solid D",LD:"Likely D",TD:"Lean D",T:"Toss-up",TR:"Lean R",LR:"Likely R",SR:"Solid R",N:"No Senate/Gov race"};
var LEANCOL={SD:"#1d4ed8",LD:"#3b82f6",TD:"#93c5fd",T:"#c084fc",TR:"#fca5a5",LR:"#ef4444",SR:"#b91c1c",N:"#cbd5e1"};
var DARK={SD:1,LD:1,LR:1,SR:1};
var SMALL=["VT","NH","MA","RI","CT","NJ","DE","MD","DC"];
var NS="http://www.w3.org/2000/svg";
var DATA=null, selected=null;
var DEFSUM="Positions not summarized in this build \u2014 see the candidate's campaign site or Ballotpedia.";
function el(t,a,txt){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(txt)e.textContent=txt;return e;}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function link(u,t){u=(DATA&&DATA.urls&&DATA.urls[u])||u;return u?'<a href="'+esc(u)+'" target="_blank" rel="noopener">'+esc(t||"source")+'</a>':"";}
function pcls(p){return {D:"D",R:"R",I:"I",L:"L"}[p]||"Other";}
function fmtDate(d){if(!d)return "date n/a";var m=d.match(/^(\d{4})-(\d{2})-(\d{2})/);if(!m)return d;var M=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];return M[+m[2]-1]+" "+(+m[3])+", "+m[1];}

function drawMap(){
  var svg=document.getElementById("map"), P=window.US_PATHS;
  Object.keys(P).forEach(function(ab){
    var s=DATA.states[ab]; if(!s)return;
    var p=el("path",{d:P[ab].d,"class":"st L-"+s.lean,"data-ab":ab,tabindex:"0",role:"button","aria-label":s.name+": "+LEANTXT[s.lean]});
    svg.appendChild(p);
  });
  Object.keys(P).forEach(function(ab){
    if(SMALL.indexOf(ab)>=0||ab==="HI")return; var s=DATA.states[ab]; if(!s)return;
    var c=P[ab].c, dx={FL:12,MI:10,LA:-8,KY:4,ID:-2,AK:0}[ab]||0, dy={MI:18,FL:0,ID:12}[ab]||0;
    svg.appendChild(el("text",{x:c[0]+dx,y:c[1]+4+dy,"text-anchor":"middle","class":DARK[s.lean]?"lt":""},ab));
  });
  var hc=P.HI.c; svg.appendChild(el("text",{x:hc[0],y:hc[1]+22,"text-anchor":"middle"},"HI"));
  // callout boxes for small eastern states (big tap targets)
  SMALL.forEach(function(ab,i){
    var s=DATA.states[ab]; if(!s)return; var y=95+i*42, x=965, c=P[ab].c;
    svg.appendChild(el("line",{x1:c[0],y1:c[1],x2:x,y2:y+15,stroke:"#94a3b8","stroke-width":".7"}));
    var r=el("rect",{x:x,y:y,width:62,height:32,rx:6,"class":"cb L-"+s.lean,"data-ab":ab,tabindex:"0",role:"button","aria-label":s.name+": "+LEANTXT[s.lean]});
    svg.appendChild(r);
    svg.appendChild(el("text",{x:x+31,y:y+20,"text-anchor":"middle","class":DARK[s.lean]?"lt":""},ab));
  });
  svg.addEventListener("click",function(e){var ab=e.target.getAttribute("data-ab");if(ab)openState(ab);});
  svg.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&e.target.getAttribute("data-ab")){e.preventDefault();openState(e.target.getAttribute("data-ab"));}});
}
function drawPickers(){
  var sel=document.getElementById("pick"), chips=document.getElementById("chips");
  Object.keys(DATA.states).sort(function(a,b){return DATA.states[a].name.localeCompare(DATA.states[b].name);}).forEach(function(ab){
    var s=DATA.states[ab]; var o=document.createElement("option"); o.value=ab; o.textContent=s.name+" — "+LEANTXT[s.lean]; sel.appendChild(o);
    var b=document.createElement("button"); b.className="chip"+(DARK[s.lean]?" dark":""); b.style.background=LEANCOL[s.lean]; b.textContent=ab; b.title=s.name; b.setAttribute("aria-label",s.name);
    b.onclick=function(){openState(ab);}; chips.appendChild(b);
  });
  sel.onchange=function(){if(sel.value)openState(sel.value);};
}
function raceHTML(r){
  var h='<div class="race"><h3>'+esc(r.label)+'</h3>';
  var inc=r.incumbent; h+='<div class="kv"><b>Incumbent:</b> <span class="'+pcls(inc.party)+'">'+esc(inc.name)+' ('+esc(inc.party)+')</span> — '+esc(inc.status)+'</div>';
  // ratings
  h+='<div class="kv"><b>Ratings / lean:</b></div><ul class="pl">';
  r.ratings.forEach(function(x){h+='<li><span class="tag">'+esc(x.value)+'</span>'+esc(x.source)+', '+fmtDate(x.date)+' '+link(x.url)+'</li>';});
  h+='</ul>';
  h+='<div class="kv"><b>Polling averages:</b></div><ul class="pl">';
  if(r.averages.length) r.averages.forEach(function(x){h+='<li><b>'+esc(x.value)+'</b> — '+esc(x.source)+', '+fmtDate(x.date)+' '+link(x.url)+(x.via?' · '+link(x.via,"via"):'')+'</li>';});
  else h+='<li>Unavailable — no published average found for this race.</li>';
  h+='</ul>';
  h+='<div class="kv"><b>Win probability:</b></div><ul class="pl">';
  if(r.odds.length) r.odds.forEach(function(x){h+='<li><b>'+esc(x.value)+'</b> — '+esc(x.source)+', '+fmtDate(x.date)+' '+link(x.url)+'</li>';});
  else h+='<li>Unavailable — no freely published probability found; use the rating/poll average above as the lean.</li>';
  h+='</ul>';
  h+='<div class="kv"><b>Recent polls (NYT/Siena, Marist, Quinnipiac & others):</b></div><ul class="pl">';
  if(r.polls.length) r.polls.forEach(function(p){h+='<li><b>'+esc(p.pollster)+'</b> ('+esc(p.dates)+(p.sample?', '+esc(p.sample):'')+'): '+esc(p.result)+' '+link(p.url)+(p.note?'<br><span class="small">'+esc(p.note)+'</span>':'')+'</li>';});
  else h+='<li>No individual public poll captured for this race in this build.</li>';
  h+='</ul>';
  h+='<details open><summary>Candidates &amp; stated positions</summary>';
  r.candidates.forEach(function(c){h+='<div class="cand"><span class="nm '+pcls(c.party)+'">'+esc(c.name)+' ('+esc(c.party)+')</span> — <span class="small">'+esc(c.role)+'</span><br>'+esc(c.summary||DEFSUM)+(c.source?' <span class="small">'+link(c.source,"summary source")+'</span>':'')+'</div>';});
  h+='</details></div>';
  return h;
}
function openState(ab){
  var s=DATA.states[ab]; if(!s)return; selected=ab;
  document.querySelectorAll("#map .sel").forEach(function(n){n.classList.remove("sel");});
  document.querySelectorAll('#map [data-ab="'+ab+'"]').forEach(function(n){n.classList.add("sel");});
  document.getElementById("ptitle").innerHTML=esc(s.name)+' <span class="badge" style="background:'+LEANCOL[s.lean]+';color:'+(DARK[s.lean]?"#fff":"#0f172a")+'">'+LEANTXT[s.lean]+'</span>';
  var h="";
  if(s.note) h+='<p class="kv">'+esc(s.note)+'</p>';
  var sen=s.races.filter(function(r){return r.type==="senate";});
  if(!sen.length && ab!=="DC") h+='<p class="small">No U.S. Senate race in this state in 2026.</p>';
  s.races.forEach(function(r){h+=raceHTML(r);});
  var H=s.house; h+='<div class="race"><h3>U.S. House — competitive seats</h3>';
  if(H.seats.length){h+='<ul class="pl">';H.seats.forEach(function(x){h+='<li><span class="tag">'+esc(x.cook)+'</span><b>'+esc(x.district)+'</b> — '+esc(x.incumbent_or_status)+'</li>';});h+='</ul>';}
  else h+='<p class="kv">'+esc(H.note)+'</p>';
  h+='<p class="small">Source: '+esc(H.source)+', '+fmtDate(H.date)+' '+link(H.url)+'. District-level public polling not compiled in this build.</p></div>';
  h+='<p class="small">National context: '+esc(DATA.national.house_context)+'</p>';
  document.getElementById("pbody").innerHTML=h; document.getElementById("pbody").scrollTop=0;
  document.getElementById("panel").classList.add("open"); document.getElementById("panel").setAttribute("aria-hidden","false");
  document.getElementById("scrim").classList.add("open");
  document.getElementById("pick").value=ab;
  if(history.replaceState) history.replaceState(null,"","#"+ab);
}
function closePanel(){document.getElementById("panel").classList.remove("open");document.getElementById("panel").setAttribute("aria-hidden","true");document.getElementById("scrim").classList.remove("open");if(history.replaceState)history.replaceState(null,"",location.pathname);}
function drawNational(){
  var n=DATA.national, h='<h2>National picture</h2><p class="kv">'+esc(n.senate_context)+'</p><p class="kv">'+esc(n.house_context)+'</p>';
  h+='<div class="kv"><b>Generic congressional ballot — averages</b></div><ul class="pl">';
  n.averages.forEach(function(x){h+='<li><b>'+esc(x.value)+'</b> — '+esc(x.source)+(x.date?', '+fmtDate(x.date):'')+' '+link(x.url)+'</li>';});
  h+='</ul><div class="kv"><b>Generic ballot — named pollsters</b></div><ul class="pl">';
  n.generic_ballot.forEach(function(p){h+='<li><b>'+esc(p.pollster)+'</b> ('+esc(p.dates)+(p.sample?', '+esc(p.sample):'')+'): '+esc(p.result)+' '+link(p.url)+(p.note?'<br><span class="small">'+esc(p.note)+'</span>':'')+'</li>';});
  h+='</ul><p class="small">'+esc(n.nyt_note)+'</p>';
  document.getElementById("nat").innerHTML=h;
}
document.getElementById("close").onclick=closePanel;
document.getElementById("scrim").onclick=closePanel;
document.addEventListener("keydown",function(e){if(e.key==="Escape")closePanel();});
fetch("data/races.json",{cache:"no-cache"}).then(function(r){return r.json();}).then(function(d){
  DATA=d; document.getElementById("upd").textContent=d.generated_pt;
  drawMap(); drawPickers(); drawNational();
  var h=(location.hash||"").replace("#","").toUpperCase(); if(DATA.states[h]) openState(h);
}).catch(function(e){document.getElementById("nat").innerHTML="<p>Could not load data/races.json ("+esc(e.message)+").</p>";});
})();
