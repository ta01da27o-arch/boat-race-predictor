// ===============================
// 展開解析（最低限・確実に表示）
// ===============================
function updateAnalysis(){

  const el = document.querySelector("#analysisSection .analysis-text");
  if(!el){
    return;
  }

  // 🔴 強制表示テスト（まずこれが出るか）
  el.textContent = "🔥 展開解析 起動確認";

  // ===== 必須データ確認 =====
  if(
    !Array.isArray(window.expectedValues) ||
    !Array.isArray(window.realKimarite)
  ){
    el.textContent = "⏳ データ解析中…";
    return;
  }

  // ===== 期待値 =====
  const ev = window.expectedValues.map(v => Number(v) || 0);
  const maxEV = Math.max(...ev);
  const topCourse = ev.indexOf(maxEV) + 1;

  const profitCount = Array.isArray(window.profitFlags)
    ? window.profitFlags.filter(v=>v).length
    : 0;

  // ===== 決まり手平均 =====
  let escapeAvg = 0;
  let attackAvg = 0;

  if(window.realKimarite.length === 6){
    window.realKimarite.forEach(k=>{
      escapeAvg += Number(k.escape) || 0;
      attackAvg +=
        (Number(k.sashi) || 0) +
        (Number(k.makuri) || 0) +
        (Number(k.makuriSashi) || 0);
    });

    escapeAvg /= 6;
    attackAvg /= 6;
  }

  // ===== 展開コメント =====
  let comment = "";

  if(maxEV >= 1.3 && escapeAvg >= 55){
    comment = "🔥 イン主導。堅め決着濃厚。";
  }
  else if(attackAvg >= 55){
    comment = "⚡ 差し・捲り警戒。外が面白い。";
  }
  else if(profitCount >= 3){
    comment = "💰 高配当狙い。狙い分散。";
  }
  else{
    comment = "📊 力関係拮抗。様子見。";
  }

  // ===== コース別コメント =====
  let courseComment = "";

  if(topCourse === 1){
    courseComment = "🟢【信頼】1号艇が踏み込めば即決。";
  }
  else if(topCourse <= 3){
    courseComment = `🟡【注意】${topCourse}号艇が鍵。`;
  }
  else{
    courseComment = `🔴【穴】${topCourse}号艇の一撃注意。`;
  }

  // ===== 最終表示 =====
  el.textContent =
    comment +
    "\n\n" + courseComment;
}

// ===============================
// 強制起動（超重要）
// ===============================
window.addEventListener("load", ()=>{
  updateAnalysis();
});
