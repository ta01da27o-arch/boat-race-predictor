document.addEventListener("DOMContentLoaded", () => {

const courses = [1,2,3,4,5,6];


// =============================
// コース有利補正（実際寄り）
// =============================
const courseBonus = {
  1:1.25,
  2:1.10,
  3:1.00,
  4:0.95,
  5:0.90,
  6:0.85
};


// =============================
// ダミー過去実績（現状用）
// =============================
function dummyKimarite(course){

 if(course===1){
   return {逃げ:75,差され:12,捲られ:8,捲差:5};
 }

 return {
  差し:Math.floor(20+Math.random()*30),
  捲り:Math.floor(20+Math.random()*30),
  捲差:Math.floor(10+Math.random()*20),
  逃がし:Math.floor(10+Math.random()*20)
 };
}


// =============================
// 決まり手反映（NaN完全防止）
// =============================
function updateKimarite(){

 courses.forEach(c=>{

  const block=document.querySelector(`.kimarite-course.c${c}`);
  if(!block) return;

  const data=dummyKimarite(c);

  const rows=block.querySelectorAll(".kimarite-row");

  rows.forEach(row=>{

    const label=row.querySelector(".label").textContent.trim();
    const val=data[label] ?? 0;

    const bar=row.querySelector(".bar div");
    const text=row.querySelector(".value");

    bar.style.width=`${val}%`;
    text.textContent=`${val}%`;

  });

 });

}


// =============================
// 展開向きスコア算出
// =============================
function calcDevelopScore(){

 return courses.map(c=>{
   const base=50+Math.random()*50;
   return base*courseBonus[c];
 });

}


// =============================
// 総合期待度（3本バー）
// =============================
function updateExpectation(){

 const developScores=calcDevelopScore();

 const max=Math.max(...developScores);

 courses.forEach((c,i)=>{

   const row=document.querySelector(`.expectation-row.c${c}`);
   if(!row) return;

   const percent=Math.round(developScores[i]/max*100);

   const bars=row.querySelectorAll(".bar-fill");

   const base=percent*0.6;
   const predict=percent*0.8;
   const ai=percent;

   bars[0].style.width=base+"%";
   bars[1].style.width=predict+"%";
   bars[2].style.width=ai+"%";

   row.querySelector(".expectation-value").textContent=percent+"%";

 });

 return developScores;

}


// =============================
// 展開タイプ判定
// =============================
function judgeRaceType(scores){

 const max=Math.max(...scores);
 const idx=scores.indexOf(max)+1;

 let type="";

 if(idx===1) type="イン逃げ型";
 else if(idx<=3) type="中枠攻め型";
 else if(idx>=5) type="外伸び型";
 else type="超混戦";

 document.getElementById("race-type").textContent=type;

 return type;

}


// =============================
// 記者風コメント生成
// =============================
function makeComment(type){

 if(type==="イン逃げ型"){
return `スタート踏み込む1コースが先マイ体勢。
握って回る2コースが差しで続き、内有利の決着濃厚。
3コースは展開待ちで三着争いまで。
外枠勢は展開向かず厳しい一戦となりそうだ。`;
 }

 if(type==="中枠攻め型"){
return `スタート次第で2・3コースが果敢に攻める展開。
1コースは抵抗するが包まれる可能性もあり混戦模様。
内外入り乱れた攻防となりそうだ。`;
 }

 if(type==="外伸び型"){
return `ダッシュ勢のスピードが活きる展開。
内は守勢に回り外から一気の攻め込み十分。
波乱含みの一戦となりそうだ。`;
 }

 return `各コース拮抗した力関係。
スタートとターン精度次第で着順大きく入れ替わりそうだ。`;

}


// =============================
// 展開解析反映
// =============================
function updateAnalysis(type){
 document.querySelector(".analysis-text").textContent=makeComment(type);
}


// =============================
// 買い目生成
// =============================
function updateBets(scores){

 const order=[...scores].map((v,i)=>({v,i:i+1}))
   .sort((a,b)=>b.v-a.v);

 const honmei=document.querySelectorAll(".bet-col:nth-child(1) .bet-item");
 const taikou=document.querySelectorAll(".bet-col:nth-child(2) .bet-item");
 const nige=document.querySelectorAll(".bet-col:nth-child(3) .bet-item");

 honmei.forEach((el,i)=>{
  el.textContent=`${order[0].i}-${order[1].i}-${order[2].i}`;
 });

 taikou.forEach((el,i)=>{
  el.textContent=`${order[1].i}-${order[2].i}-${order[3].i}`;
 });

 nige.forEach((el,i)=>{
  el.textContent=`1-${order[1].i}-${order[2].i}`;
 });

}


// =============================
// 的中率シミュレーション
// =============================
function updateHitRate(scores){

 const max=Math.max(...scores);

 courses.forEach((c,i)=>{

   const rate=Math.round(scores[i]/max*100);

   const row=document.querySelector(`.hitrate-row.c${c}`);
   row.querySelector(".hitrate-value").textContent=rate+"%";
   row.querySelector(".hitrate-bar div").style.width=rate+"%";

 });

}


// =============================
// 信頼度メーター自動生成
// =============================
function createTrustMeter(){

 if(document.getElementById("trustSection")) return;

 const sec=document.createElement("section");
 sec.id="trustSection";

 sec.innerHTML=`
 <h2>信頼度メーター</h2>

 <div class="trust-row">堅さ指数 <span id="solidVal">0%</span>
 <div class="trust-bar"><div id="solidBar"></div></div></div>

 <div class="trust-row">荒れ指数 <span id="wildVal">0%</span>
 <div class="trust-bar"><div id="wildBar"></div></div></div>

 <div class="trust-row total">総合信頼度 <span id="trustVal">0%</span>
 <div class="trust-bar"><div id="trustBar"></div></div></div>
 `;

 document.body.appendChild(sec);
}


// =============================
// 信頼度更新
// =============================
function updateTrust(scores){

 const spread=Math.max(...scores)-Math.min(...scores);

 let solid=Math.max(20,100-spread);
 let wild=100-solid;
 let total=Math.round((solid+ (100-wild))/2);

 document.getElementById("solidVal").textContent=solid+"%";
 document.getElementById("wildVal").textContent=wild+"%";
 document.getElementById("trustVal").textContent=total+"%";

 document.getElementById("solidBar").style.width=solid+"%";
 document.getElementById("wildBar").style.width=wild+"%";
 document.getElementById("trustBar").style.width=total+"%";

}


// =============================
// メイン更新処理
// =============================
function runAll(){

 updateKimarite();

 const scores=updateExpectation();

 const type=judgeRaceType(scores);

 updateAnalysis(type);

 updateBets(scores);

 updateHitRate(scores);

 createTrustMeter();

 updateTrust(scores);

}


// 初期実行
runAll();

});
