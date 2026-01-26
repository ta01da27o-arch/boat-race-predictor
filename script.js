// ================================
// 共通取得
// ================================

function getVal(course){
  const row=document.querySelector(`.expectation-row.c${course}`);
  if(!row) return 0;
  return parseInt(row.querySelector(".expectation-value").textContent.replace("%",""))||0;
}

// ================================
// 攻め指数 AI算出ロジック
// ================================

function getAttackPower(course){

  const rows=document.querySelectorAll(
    `.kimarite-course.c${course} .kimarite-row`
  );

  let attack=0;

  rows.forEach(row=>{
    const label=row.querySelector(".label").textContent.trim();
    const v=parseInt(row.querySelector(".value").textContent.replace("%",""))||0;

    if(label==="捲り") attack+=v*1.2;
    if(label==="捲差") attack+=v*1.0;
    if(label==="差し") attack+=v*0.8;
    if(label==="逃げ") attack+=v*0.6;
  });

  return attack;
}


// ================================
// 展開補正AI
// ================================

function applyRaceFlow(course,base){

  const inner=getVal(1);
  let mod=1;

  // イン強いと外減衰
  if(inner>=70 && course>=3) mod-=0.25;

  // イン弱いと外強化
  if(inner<=40 && course>=3) mod+=0.25;

  // まくり有利ゾーン
  if(course===3||course===4) mod+=0.15;

  // 大外減衰
  if(course===6) mod-=0.15;

  let val=Math.round(base*mod);

  return Math.max(Math.min(val,100),0);
}


// ================================
// 攻め指数グラフ生成
// ================================

function buildAttackBars(){

  for(let i=1;i<=6;i++){

    const row=document.querySelector(`.expectation-row.c${i}`);
    if(!row) continue;

    const barBox=row.querySelector(".expectation-bar");

    if(!barBox.querySelector(".attack-base")){
      
      barBox.innerHTML=`
        <div class="attack-base"></div>
        <div class="attack-predict"></div>
        <div class="attack-ai"></div>
      `;
    }
  }
}


// ================================
// 攻め指数更新
// ================================

function updateAttackGraphs(){

  let raw=[];

  for(let i=1;i<=6;i++){
    raw.push(getAttackPower(i));
  }

  const max=Math.max(...raw,1);

  for(let i=1;i<=6;i++){

    const row=document.querySelector(`.expectation-row.c${i}`);
    if(!row) continue;

    const baseBar=row.querySelector(".attack-base");
    const predictBar=row.querySelector(".attack-predict");
    const aiBar=row.querySelector(".attack-ai");

    const basePercent=Math.round(raw[i-1]/max*100);

    const predicted=Math.round(basePercent*(
      i===1?1.15:
      i===2?1.05:
      i===5?0.9:
      i===6?0.85:1
    ));

    const aiVal=applyRaceFlow(i,basePercent);

    baseBar.style.width=basePercent+"%";
    predictBar.style.width=Math.min(predicted,100)+"%";
    aiBar.style.width=aiVal+"%";
  }
}


// ================================
// 展開タイプ細分化
// ================================

function detectRaceType(){

  const arr=[];

  for(let i=1;i<=6;i++){
    arr.push({course:i,value:getVal(i)});
  }

  arr.sort((a,b)=>b.value-a.value);

  const top=arr[0];
  const second=arr[1];

  let type="混戦型";

  if(top.course===1 && top.value>=75 && top.value-second.value>=20)
    type="イン逃げ支配型";

  else if(top.course===2 && top.value>=65)
    type="差し主導型";

  else if(top.course>=3 && top.value>=65 && top.course<=4)
    type="まくり一撃型";

  else if(top.course>=5)
    type="外強襲波乱型";

  else if(Math.abs(top.value-second.value)<=5)
    type="超混戦型";

  document.getElementById("race-type").textContent=
    "展開タイプ："+type;
}


// ================================
// 監視連動
// ================================

function observeAll(){

  const obs=new MutationObserver(()=>{
    buildAttackBars();
    updateAttackGraphs();
    detectRaceType();
  });

  document.querySelectorAll(".value,.expectation-value").forEach(el=>{
    obs.observe(el,{
      childList:true,
      characterData:true,
      subtree:true
    });
  });
}


// ================================
// 初期実行
// ================================

setTimeout(()=>{
  buildAttackBars();
  updateAttackGraphs();
  detectRaceType();
  observeAll();
},300);