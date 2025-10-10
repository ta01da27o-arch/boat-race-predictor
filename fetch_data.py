from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import json
from ai_predict import predict_race
import time

options = Options()
options.add_argument('--headless')
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
driver = webdriver.Chrome(options=options)

venues = {"芦屋": "01", "浜名湖": "02", "桐生": "03"}

data = {}

for venue_name, venue_code in venues.items():
    data[venue_name] = {"開催中": True, "レース": {}}
    for race_no in range(1, 13):
        url = f"https://www.boatrace.jp/owpc/pc/race/racelist?rno={race_no}&jcd={venue_code}"
        driver.get(url)
        time.sleep(3)  # JSレンダリング待ち
        soup = BeautifulSoup(driver.page_source, "html.parser")
        
        entries = []
        table = soup.find("table", class_="is-w-auto")  # 仮のクラス
        if table:
            rows = table.find_all("tr")[1:]
            for row in rows:
                cols = row.find_all("td")
                if len(cols) < 2:
                    continue
                course = int(cols[0].text.strip())
                name = cols[1].text.strip()
                entries.append({"選手名": name, "コース": course, "過去成績": {}})
        
        decision = predict_race(entries) if entries else "未取得"
        data[venue_name]["レース"][f"{race_no}R"] = {
            "出走表": entries,
            "決まり手": decision
        }

driver.quit()

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("データ取得完了")