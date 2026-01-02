/* js/core/teams_data.js */

export const TEAM_PRESETS = {
    // --- セ・リーグ ---
    "tigers": {
        name: "阪神タイガース",
        players: [
            // 2025年: 佐藤輝明が40本塁打・102打点で二冠、近本が盗塁王
            { name: "近本 光司", obp: 0.348, slg: 0.353 }, 
            { name: "中野 拓夢", obp: 0.339, slg: 0.328 },
            { name: "森下 翔太", obp: 0.350, slg: 0.463 },
            { name: "佐藤 輝明", obp: 0.345, slg: 0.579 }, 
            { name: "大山 悠輔", obp: 0.363, slg: 0.396 }, 
            { name: "前川 右京", obp: 0.297, slg: 0.323 },
            { name: "坂本 誠志郎", obp: 0.357, slg: 0.326 },
            { name: "小幡 竜平", obp: 0.272, slg: 0.309 },
            { name: "投手", obp: 0.100, slg: 0.040 } 
        ]
    },
    "baystars": {
        name: "横浜DeNA",
        players: [
            { name: "蝦名 達夫", obp: 0.350, slg: 0.420 },
            { name: "桑原 将志", obp: 0.348, slg: 0.382 },
            { name: "筒香 嘉智", obp: 0.327, slg: 0.549 },
            { name: "牧 秀悟", obp: 0.325, slg: 0.475 },
            { name: "宮﨑 敏郎", obp: 0.335, slg: 0.389 },
            { name: "佐野 恵太", obp: 0.322, slg: 0.406 },
            { name: "山本 祐大", obp: 0.300, slg: 0.364 },
            { name: "石上 泰輝", obp: 0.314, slg: 0.348 },
            { name: "投手", obp: 0.100, slg: 0.040 }
        ]
    },
    "giants": {
        name: "読売ジャイアンツ",
        players: [
            // 2025年: 甲斐・R.マルティネスらが加入した大型補強打線
            { name: "丸 佳浩", obp: 0.345, slg: 0.399 },
            { name: "キャベッジ", obp: 0.331, slg: 0.450 },
            { name: "泉口 友汰", obp: 0.362, slg: 0.393 },
            { name: "岡本 和真", obp: 0.416, slg: 0.598 },
            { name: "岸田 行倫", obp: 0.355, slg: 0.417 },
            { name: "中山 礼都", obp: 0.319, slg: 0.282 }, 
            { name: "リチャード", obp: 0.269, slg: 0.384 }, 
            { name: "吉川 尚輝", obp: 0.349, slg: 0.351 },
            { name: "投手", obp: 0.100, slg: 0.040 } 
        ]
    },
    "dragons": {
        name: "中日ドラゴンズ",
        players: [
            // 岡林が最多安打(168)
            { name: "岡林 勇希", obp: 0.348, slg: 0.382 }, 
            { name: "田中 幹也", obp: 0.324, slg: 0.327 },
            { name: "上林 誠知", obp: 0.302, slg: 0.434 },
            { name: "細川 成也", obp: 0.367, slg: 0.489 },
            { name: "ボスラー", obp: 0.312, slg: 0.429 },
            { name: "福永 裕基", obp: 0.246, slg: 0.250 },
            { name: "山本 泰寛", obp: 0.265, slg: 0.323 },
            { name: "石伊 雄太", obp: 0.272, slg: 0.298 },
            { name: "投手", obp: 0.100, slg: 0.040 }
        ]
    },
    "carp": {
        name: "広島カープ",
        players: [
            // 小園が首位打者(.309)
            { name: "中村 奨成", obp: 0.321, slg: 0.439 },
            { name: "ファビアン", obp: 0.315, slg: 0.427 },
            { name: "小園 海斗", obp: 0.365, slg: 0.388 }, 
            { name: "末包 昇大", obp: 0.296, slg: 0.373 }, 
            { name: "坂倉 将吾", obp: 0.327, slg: 0.362 },
            { name: "モンテロ", obp: 0.301, slg: 0.391 },
            { name: "菊池 涼介", obp: 0.28, slg: 0.338 },
            { name: "佐々木 泰", obp: 0.294, slg: 0.293 },
            { name: "投手", obp: 0.100, slg: 0.100 }
        ]
    },
    "swallows": {
        name: "ヤクルト",
        players: [
            { name: "並木 秀尊", obp: 0.303, slg: 0.404 },
            { name: "長岡 秀樹", obp: 0.267, slg: 0.316 },
            { name: "内山 壮真", obp: 0.326, slg: 0.385 },
            { name: "村上 宗隆", obp: 0.379, slg: 0.663 },
            { name: "オスナ", obp: 0.307, slg: 0.377 },
            { name: "山田 哲人", obp: 0.300, slg: 0.388 },
            { name: "古賀 優大", obp: 0.319, slg: 0.345 },
            { name: "岩田 幸宏", obp: 0.322, slg: 0.317 },
            { name: "投手", obp: 0.100, slg: 0.040 }
        ]
    },
    // --- パ・リーグ (DH制) ---
    "hawks": {
        name: "ソフトバンク",
        players: [
            // 2025年日本一チーム
            { name: "周東 佑京", obp: 0.350, slg: 0.390 }, 
            { name: "柳町 達", obp: 0.335, slg: 0.400 },
            { name: "近藤 健介", obp: 0.395, slg: 0.540 },
            { name: "山川 穂高", obp: 0.345, slg: 0.570 },
            { name: "中村 晃", obp: 0.440, slg: 0.520 },
            { name: "栗原 陵矢", obp: 0.350, slg: 0.470 },
            { name: "野村 勇", obp: 0.330, slg: 0.430 },
            { name: "海野 隆司", obp: 0.310, slg: 0.360 }, 
            { name: "牧原 大成", obp: 0.290, slg: 0.340 } 
        ]
    },
    "fighters": {
        name: "日本ハム",
        players: [
            // レイエスが本塁打・打点二冠
            { name: "水谷 瞬", obp: 0.340, slg: 0.430 },
            { name: "清宮 幸太郎", obp: 0.320, slg: 0.350 },
            { name: "レイエス", obp: 0.370, slg: 0.500 },
            { name: "野村 佑希", obp: 0.360, slg: 0.560 }, // 本塁打(32)・打点(90)
            { name: "郡司 裕也", obp: 0.330, slg: 0.460 },
            { name: "万波 中正", obp: 0.345, slg: 0.410 },
            { name: "石井 一成", obp: 0.315, slg: 0.340 },
            { name: "水野 達稀", obp: 0.330, slg: 0.390 },
            { name: "五十幡 亮汰", obp: 0.300, slg: 0.350 }
        ]
    },
    "buffaloes": {
        name: "オリックス",
        players: [
            { name: "廣岡 大志", obp: 0.330, slg: 0.400 },
            { name: "西川 龍馬", obp: 0.325, slg: 0.370 },
            { name: "太田 椋", obp: 0.375, slg: 0.460 },
            { name: "杉本 裕太郎", obp: 0.340, slg: 0.430 },
            { name: "頓宮 裕真", obp: 0.320, slg: 0.470 },
            { name: "中川 圭太", obp: 0.315, slg: 0.370 },
            { name: "紅林 弘太郎", obp: 0.320, slg: 0.360 },
            { name: "若月 健矢", obp: 0.310, slg: 0.390 },
            { name: "宗 佑磨", obp: 0.280, slg: 0.310 }
        ]
    },
    "eagles": {
        name: "楽天イーグルス",
        players: [
            // 村林が最多安打(144)
            { name: "中島 大輔", obp: 0.330, slg: 0.340 },
            { name: "村林 一輝", obp: 0.325, slg: 0.370 }, // 最多安打
            { name: "黒川 史陽", obp: 0.365, slg: 0.440 },
            { name: "ボイト", obp: 0.340, slg: 0.430 },
            { name: "浅村 栄斗", obp: 0.335, slg: 0.370 },
            { name: "宗山 塁", obp: 0.320, slg: 0.380 },
            { name: "小郷 裕哉", obp: 0.305, slg: 0.400 },
            { name: "堀内 謙伍", obp: 0.290, slg: 0.330 },
            { name: "辰己 涼介", obp: 0.335, slg: 0.400 }
        ]
    },
    "lions": {
        name: "西武ライオンズ",
        players: [
            { name: "西川 愛也", obp: 0.320, slg: 0.410 }, // 新人(AS出場)
            { name: "滝澤 夏央", obp: 0.320, slg: 0.340 },
            { name: "渡部 聖弥", obp: 0.315, slg: 0.370 },
            { name: "ネビン", obp: 0.325, slg: 0.420 },
            { name: "外崎 修汰", obp: 0.355, slg: 0.390 },
            { name: "長谷川 信哉", obp: 0.335, slg: 0.430 },
            { name: "セデーニョ", obp: 0.310, slg: 0.360 },
            { name: "古賀 悠斗", obp: 0.295, slg: 0.330 },
            { name: "源田 壮亮", obp: 0.300, slg: 0.370 }
        ]
    },
    "marines": {
        name: "千葉ロッテ",
        players: [
            { name: "藤原 恭大", obp: 0.340, slg: 0.410 },
            { name: "寺地 隆成", obp: 0.355, slg: 0.390 },
            { name: "髙部 瑛斗", obp: 0.325, slg: 0.480 },
            { name: "山本 大斗", obp: 0.350, slg: 0.510 },
            { name: "西川 史礁", obp: 0.335, slg: 0.410 },
            { name: "ソト", obp: 0.345, slg: 0.420 },
            { name: "藤岡 裕大", obp: 0.315, slg: 0.360 },
            { name: "安田 尚憲", obp: 0.340, slg: 0.390 },
            { name: "友杉 篤輝", obp: 0.310, slg: 0.320 }
        ]
    },
};