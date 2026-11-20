const WORDS="time year people way day man thing woman life child world school state family student group country problem hand part place case week company system program question work government number night point home water room mother area money story fact month lot right study book eye job word business issue side kind head house service friend father power hour game line end member law car city community name team minute idea kid body information back parent face others level office door health person art war history party result change morning reason research girl guy moment air teacher force education foot boy age policy music market sense nation plan college interest death course someone experience behind reach local kill six remain effect yeah suggest class control raise care perhaps little late hard past real simple whole strong happen allow create north river quick bright market planet forest silver window garden travel engine castle bridge anchor pocket button candle pepper thunder canyon rocket marble velvet orange basket meadow lantern harbor shadow ticket spring summer winter autumn clever gentle honest steady".split(" ");
const BOTS=["kiwi_kaos","zenwrist","tapsmith","nullkey","quillbert","dashfox","mochi","ratatype","blitzen","sleepyfingers","homerow_hank","vexel","pebblepace","cobalt","dusty_keys","oatmilk"];
const $=id=>document.getElementById(id);
const wk=()=>{const d=new Date();d.setUTCHours(0,0,0,0);d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10)};
const addDays=(s,n)=>{const d=new Date(s+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d};
const W=wk(),PREV=addDays(W,-7).toISOString().slice(0,10);
const pid=Math.random().toString(36).slice(2,9);
let S={xp:0,races:0,wins:0,best:0,accSum:0,wpmSum:0},L={week:W,elo:0,prev:null},db,room,user,uid,statsRef,lbRef,session=0,R=null,unsubs=[];
const lvl=xp=>Math.floor(Math.sqrt(xp/120))+1,lvBase=l=>(l-1)*(l-1)*120;
function show(v){["idle","q","r","res"].forEach(k=>$("v-"+k).classList.toggle("hide",k!==v))}
function hud(){const l=lvl(S.xp);$("lv").textContent=l;$("xp").textContent=S.xp;$("xpb").style.width=(100*(S.xp-lvBase(l))/(lvBase(l+1)-lvBase(l)))+"%";$("elo").textContent=L.elo.toFixed(1);
 const f=(a,b)=>`<div><small>${a}</small><b>${b}</b></div>`;
 $("stats").innerHTML=f("races",S.races)+f("wins",S.wins)+f("win rate",S.races?Math.round(100*S.wins/S.races)+"%":"–")+f("best wpm",Math.round(S.best))+f("avg wpm",S.races?Math.round(S.wpmSum/S.races):"–")+f("avg accuracy",S.races?(S.accSum/S.races).toFixed(1)+"%":"–")}
setInterval(()=>{const ms=addDays(W,7)-Date.now();if(ms<=0){location.reload();return}const h=Math.floor(ms/36e5);$("rs").textContent=Math.floor(h/24)+"d "+(h%24)+"h "+Math.floor(ms/6e4%60)+"m"},1000);
const eloFor=(r,w)=>r.week===w?r.elo:(r.prev&&r.prev.week===w?r.prev.elo:null);
async function drawLB(rows){let ps={};try{ps=await user.profiles(rows.map(r=>r.id))}catch(e){}
 const nm=id=>(ps[id]&&ps[id].name)||"Racer";
 const cur=rows.map(r=>({id:r.id,e:eloFor(r,W)})).filter(r=>r.e!=null).sort((a,b)=>b.e-a.e).slice(0,10);
 $("lb").innerHTML="";cur.forEach((r,i)=>{const tr=document.createElement("tr");tr.innerHTML="<td></td><td></td>";tr.children[0].textContent=(i+1)+". "+nm(r.id)+(r.id===uid?" (you)":"");tr.children[1].textContent=r.e.toFixed(1);$("lb").appendChild(tr)});
 if(!cur.length)$("lb").innerHTML='<tr><td style="color:var(--mu)">No racers yet</td></tr>';
 const lw=rows.map(r=>({id:r.id,e:eloFor(r,PREV)})).filter(r=>r.e!=null).sort((a,b)=>b.e-a.e)[0];
 $("champ").textContent=lw?"Last week’s champion: "+nm(lw.id)+" ("+lw.e.toFixed(1)+" elo)":""}
async function init(){hud();
 try{if(typeof claude!=="undefined"){user=await claude.use("user");db=await claude.use("db");room=await claude.use("room")}}catch(e){}
 if(user&&db){try{uid=await user.id();const me=await user.me();$("who").textContent=(me&&me.name)||"you";
  statsRef=db.collection("data/users/"+uid).doc("stats");lbRef=db.collection("lb").doc(uid);
  const a=await statsRef.get();if(a.exists)S=Object.assign(S,a.data());
  const b=await lbRef.get();if(b.exists){L=b.data();if(L.week!==W)L={week:W,elo:0,prev:{week:L.week,elo:L.elo}}}
  db.collection("lb").onSnapshot(s=>drawLB(s.docs.map(d=>({id:d.id,...d.data()}))),()=>{});hud()}catch(e){db=null}}
 if(!db){try{const j=JSON.parse(localStorage.getItem("sweaty_v1")||"null");if(j){S=Object.assign(S,j.S);L=j.L.week===W?j.L:{week:W,elo:0,prev:{week:j.L.week,elo:j.L.elo}}}}catch(e){}
  $("note").textContent="Local mode: stats are saved in this browser only. Plug in a backend for accounts and a shared leaderboard.";hud()}
 if(room){room.onPeers(onPeers);room.on("match",m=>{const d=m.data||{};if(d.to===pid&&R&&R.ph==="q")begin(d.seed,{pid:d.from,uid:d.uid})});
  room.on("prog",m=>{const d=m.data||{};if(R&&R.opp&&d.to===pid&&d.from===R.opp.pid)R.op=d.p});
  room.on("fin",m=>{const d=m.data||{};if(R&&R.ph==="go"&&R.opp&&d.to===pid&&d.from===R.opp.pid)finish(false)})}}
function onPeers(c){if(!R||R.ph!=="q")return;const o=c.peers.find(p=>!p.isMe&&p.presence&&p.presence.st==="q"&&p.presence.pid);
 if(o&&pid<o.presence.pid){const seed=Math.floor(Math.random()*2**31);room.emit("match",{to:o.presence.pid,from:pid,uid,seed});begin(seed,{pid:o.presence.pid,uid:o.presence.uid})}}
function rng(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function queue(){if(R)return;R={ph:"q",t0:Date.now()};show("q");if(room)room.presence({st:"q",pid,uid});
 R.iv=setInterval(()=>{const s=Math.floor((Date.now()-R.t0)/1000);$("qs").textContent=s+"s";if(s>=7)begin(Math.floor(Math.random()*2**31),{bot:true})},500)}
function cancel(){if(R)clearInterval(R.iv);R=null;if(room)room.presence({st:null,pid:null});show("idle")}
async function begin(seed,opp){clearInterval(R.iv);const r=rng(seed),words=[];for(let i=0;i<30;i++)words.push(WORDS[Math.floor(r()*WORDS.length)]);
 if(opp.bot){const avg=S.races?S.wpmSum/S.races:42;opp.name=BOTS[Math.floor(Math.random()*BOTS.length)];opp.wpm=Math.max(24,Math.min(130,avg+(Math.random()*18-8)))}
 else{let n="Racer";try{const p=await user.profiles([opp.uid]);n=(p[opp.uid]&&p[opp.uid].name)||n}catch(e){}opp.name=n}
 R={ph:"cd",words,opp,wi:0,cur:"",hist:[],passed:0,done:0,ks:0,ok:0,p:0,op:0,total:words.join(" ").length};
 if(room)room.presence({st:"r",pid,uid});show("r");
 $("lanes").innerHTML=`<div class="lane"><span>you</span><div class="bar"><i id="b0"></i></div><em id="w0" class="mono">0 wpm</em></div><div class="lane"><span></span><div class="bar"><i id="b1"></i></div><em id="w1" class="mono"></em></div>`;
 const sp=$("lanes").children[1].firstChild;sp.textContent=opp.name;if(opp.bot){const t=document.createElement("span");t.className="tag";t.textContent="bot";t.style.cssText="width:auto";sp.appendChild(t)}
 paint();let c=3;$("cd").textContent=c;$("cd").classList.remove("hide");
 const iv=setInterval(()=>{c--;if(c>0)$("cd").textContent=c;else{clearInterval(iv);$("cd").classList.add("hide");R.ph="go";R.t0=Date.now();R.tick=setInterval(tick,100)}},1000)}
function paint(){const x=R;$("txt").innerHTML=x.words.map((w,i)=>{const ty=i<x.wi?x.hist[i]:i===x.wi?x.cur:"";let h="";
 for(let j=0;j<Math.max(w.length,ty.length);j++){const ch=j<w.length?w[j]:ty[j];const k=j<ty.length?(ty[j]===w[j]?"c":"x"):"";h+=`<span class="${k}${i===x.wi&&j===ty.length?" cr":""}">${ch}</span>`}return`<span class="w">${h}</span>`}).join("")}
const okLen=()=>{const w=R.words[R.wi];let n=0;while(n<R.cur.length&&R.cur[n]===w[n])n++;return n};
const prog=()=>(R.passed+okLen())/R.total;
function wpmNow(){const m=(Date.now()-R.t0)/6e4;return m>0?(R.done+okLen())/5/m:0}
function tick(){const x=R,el=(Date.now()-x.t0)/1000;x.p=prog();
 if(x.opp.bot){x.op=Math.min(1,el*(x.opp.wpm*5/60)*(0.94+Math.random()*0.12)/x.total);if(x.op>=1)return finish(false)}
 else if(room)room.emit("prog",{to:x.opp.pid,from:pid,p:x.p});
 $("b0").style.width=x.p*100+"%";$("b1").style.width=x.op*100+"%";$("w0").textContent=Math.round(wpmNow())+" wpm";if(x.opp.bot)$("w1").textContent=Math.round(x.opp.wpm)+" wpm";if(el>120)finish(false)}
document.addEventListener("keydown",e=>{if(!R)return;if(e.key==="Escape"){if(R.ph==="q")cancel();else if(R.ph==="go")finish(false);return}
 if(R.ph!=="go"||e.ctrlKey||e.metaKey||e.altKey)return;const x=R,w=x.words[x.wi];
 if(e.key==="Backspace"){x.cur=x.cur.slice(0,-1);e.preventDefault()}
 else if(e.key===" "){e.preventDefault();if(!x.cur)return;if(x.cur===w)x.done+=w.length+1;x.passed+=w.length+1;x.hist[x.wi]=x.cur;x.wi++;x.cur="";if(x.wi>=x.words.length)return finish(true)}
 else if(/^[a-z]$/.test(e.key)){e.preventDefault();x.ks++;if(w.startsWith(x.cur+e.key)&&x.cur===w.slice(0,x.cur.length))x.ok++;if(x.cur.length<w.length+4)x.cur+=e.key;
  if(x.wi===x.words.length-1&&x.cur===w){x.done+=w.length;x.hist[x.wi]=x.cur;return finish(true)}}
 else return;paint()});
async function finish(won){const x=R;if(!x||x.ph!=="go")return;x.ph="end";clearInterval(x.tick);
 if(won&&room&&!x.opp.bot)room.emit("fin",{to:x.opp.pid,from:pid});
 const wpm=wpmNow(),acc=x.ks?100*x.ok/x.ks:100,valid=x.ks>=20;session++;
 const sm=Math.min(session-1,10),xp=valid?Math.round((10+wpm*0.8+(won?25:0))*(1+sm*0.05)):0;
 const ab=acc>=100?24:acc>=99?19:acc>=98?15:acc>=96?10:acc>=93?6:acc>=90?3:0;
 const elo=valid?+(4+ab+wpm*0.08+Math.min(session-1,15)*0.2+(won?4:0)).toFixed(1):0;
 S.xp+=xp;S.races++;S.wins+=won?1:0;S.best=Math.max(S.best,wpm);S.accSum+=acc;S.wpmSum+=wpm;L.elo=+(L.elo+elo).toFixed(1);L.week=W;
 if(db){try{await statsRef.set(S);await lbRef.set(L)}catch(e){}}
 else{try{localStorage.setItem("sweaty_v1",JSON.stringify({S,L}))}catch(e){}}
 hud();R=null;if(room)room.presence({st:null,pid:null});
 $("rt").textContent=won?"You won":"You lost";$("rt").className=won?"win":"lose";
 $("rg").innerHTML=[["wpm",Math.round(wpm)],["accuracy",acc.toFixed(1)+"%"],["session",session+" races"],["xp","+"+xp],["elo","+"+elo],["opponent",x.opp.name]].map(a=>`<div><b></b><small>${a[0]}</small></div>`).join("");
 [...$("rg").children].forEach((d,i)=>d.firstChild.textContent=[Math.round(wpm),acc.toFixed(1)+"%",session+" races","+"+xp,"+"+elo,x.opp.name][i]);
 show("res")}
$("go").onclick=queue;$("again").onclick=queue;$("cx").onclick=cancel;init();
