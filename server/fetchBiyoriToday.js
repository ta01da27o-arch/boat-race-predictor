import fs from "fs";
import * as cheerio from "cheerio";
import fetch from "node-fetch";

const BASE_URL = "https://boatrace-biyori.com/";

async function fetchBiyoriToday() {
  console.log("🌊 ボートレース日和から本日の出走表を取得中...");

  try {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error(`HTTPエラー: ${res.status}`);
    const html = await res.text();

    const $ = cheerio.load(html);
    const results = [];

    $("a[href*='racecard']").each((_, el) => {
      const name = $(el).text().trim();
      const url = $(el).attr("href");
      if (url && name) {
        results.push({
          name,
          url: new URL(url, BASE_URL).href
        });
      }
    });

    fs.mkdirSync("./data", { recursive: true });
    fs.writeFileSync("./data/data.json", JSON.stringify(results, null, 2), "utf-8");

    console.log(`✅ 出走表リンクを取得しました（${results.length}場）`);
    results.forEach(r => console.log(`  - ${r.name}: ${r.url}`));
  } catch (err) {
    console.error("❌ エラー:", err.message);
  }
}

fetchBiyoriToday();
