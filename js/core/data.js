/* js/core/data.js */

export const DB = {
    Central: { 
        bat: { avg:.247, obp:.310, slg:.370, ops:.680, woba:.310, isop:.123, isod:.063, babip:.295, bbk:0.41, rc27:3.80, r_pa: 0.105 }, 
        pit: { era:3.25, fip:3.40, k9:7.10, bb9:2.85, hr9:0.80, whip:1.20, lob:0.74 } 
    },
    Pacific: { 
        bat: { avg:.242, obp:.308, slg:.355, ops:.663, woba:.305, isop:.113, isod:.066, babip:.290, bbk:0.40, rc27:3.60, r_pa: 0.100 }, 
        pit: { era:3.10, fip:3.30, k9:7.30, bb9:3.00, hr9:0.75, whip:1.20, lob:0.75 } 
    }
};

export const DEFAULT_WEIGHTS = {
    wbb: 0.69, woba_scale: 1.24,
    whbp: 0.72, w1b: 0.87, w2b: 1.25, w3b: 1.58, whr: 2.05
};

export const STADIUMS = [
    { name: '平均的な球場', pf: 1.00 },
    { name: '神宮球場', pf: 1.25 },
    { name: '東京ドーム', pf: 1.15 },
    { name: '横浜スタジアム', pf: 1.10 },
    { name: 'マツダスタジアム', pf: 0.95 },
    { name: '甲子園球場', pf: 0.90 },
    { name: 'バンテリンドーム', pf: 0.85 },
    { name: 'ZOZOマリン', pf: 1.10 },
    { name: 'PayPayドーム', pf: 1.05 },
    { name: '楽天モバイル', pf: 1.05 },
    { name: 'ベルーナドーム', pf: 1.05 },
    { name: '京セラドーム', pf: 1.00 },
    { name: 'エスコンF', pf: 1.00 }
];

export const POSITION_ADJUSTMENTS = {
    'C':  12.5, 'SS': 7.5, '2B': 2.5, '3B': 2.5, 'CF': 2.5,
    'LF': -7.5, 'RF': -7.5, '1B': -12.5, 'DH': -17.5
};

// 比較用データベース
export let PLAYERS = [
    // --- 現役打者 ---
    {name:"近藤 健介(2023)", team:"ソフトバンク", type:"現役", avg:0.303, slg:0.528, obp:0.431, ops:0.959, bbk:1.35},
    {name:"宮﨑 敏郎(2023)", team:"DeNA", type:"現役", avg:0.326, slg:0.539, obp:0.395, ops:0.934, bbk:0.95},
    {name:"岡本 和真(2023)", team:"巨人", type:"現役", avg:0.278, slg:0.584, obp:0.374, ops:0.958, bbk:0.65},
    {name:"村上 宗隆(2022)", team:"ヤクルト", type:"現役", avg:0.318, slg:0.711, obp:0.458, ops:1.168, bbk:0.92},
    {name:"柳田 悠岐(2015)", team:"ソフトバンク", type:"現役", avg:0.363, slg:0.631, obp:0.469, ops:1.100, bbk:1.40},
    {name:"坂本 勇人(2019)", team:"巨人", type:"現役", avg:0.312, slg:0.575, obp:0.396, ops:0.971, bbk:0.62},
    {name:"山田 哲人(2015)", team:"ヤクルト", type:"現役", avg:0.329, slg:0.610, obp:0.416, ops:1.027, bbk:0.73},
    {name:"吉田 正尚(2020)", team:"オリックス", type:"現役", avg:0.350, slg:0.574, obp:0.453, ops:1.027, bbk:2.48},
    {name:"牧 秀悟(2023)", team:"DeNA", type:"現役", avg:0.293, slg:0.530, obp:0.337, ops:0.867, bbk:0.38},
    {name:"佐藤 輝明(2023)", team:"阪神", type:"現役", avg:0.263, slg:0.498, obp:0.339, ops:0.837, bbk:0.39},
    {name:"頓宮 裕真(2023)", team:"オリックス", type:"現役", avg:0.307, slg:0.463, obp:0.378, ops:0.841, bbk:0.62},
    {name:"万波 中正(2023)", team:"日本ハム", type:"現役", avg:0.265, slg:0.462, obp:0.321, ops:0.783, bbk:0.30},

    // --- 近年のメジャー移籍/スター ---
    {name:"鈴木 誠也(2021)", team:"広島", type:"Legend", avg:0.317, slg:0.639, obp:0.433, ops:1.072, bbk:1.00},
    {name:"大谷 翔平(2016)", team:"日本ハム", type:"Legend", avg:0.322, slg:0.588, obp:0.416, ops:1.004, bbk:0.55},
    {name:"秋山 翔吾(2015)", team:"西武", type:"Legend", avg:0.359, slg:0.522, obp:0.419, ops:0.941, bbk:0.87}, // 216安打
    {name:"筒香 嘉智(2016)", team:"DeNA", type:"Legend", avg:0.322, slg:0.680, obp:0.430, ops:1.110, bbk:0.82},

    // --- 昭和・平成のレジェンド打者 ---
    {name:"王 貞治(1973)", team:"巨人", type:"Legend", avg:0.355, slg:0.755, obp:0.532, ops:1.287, bbk:2.60},
    {name:"長嶋 茂雄(1963)", team:"巨人", type:"Legend", avg:0.341, slg:0.642, obp:0.437, ops:1.079, bbk:1.50},
    {name:"バース(1986)", team:"阪神", type:"Legend", avg:0.389, slg:0.777, obp:0.481, ops:1.258, bbk:1.17},
    {name:"イチロー(2000)", team:"オリックス", type:"Legend", avg:0.387, slg:0.539, obp:0.460, ops:0.999, bbk:1.50},
    {name:"松井 秀喜(2002)", team:"巨人", type:"Legend", avg:0.334, slg:0.692, obp:0.461, ops:1.153, bbk:1.55},
    {name:"落合 博満(1985)", team:"ロッテ", type:"Legend", avg:0.367, slg:0.763, obp:0.481, ops:1.244, bbk:2.50},
    {name:"張本 勲(1970)", team:"東映", type:"Legend", avg:0.383, slg:0.702, obp:0.467, ops:1.169, bbk:1.30},
    {name:"野村 克也(1963)", team:"南海", type:"Legend", avg:0.291, slg:0.627, obp:0.383, ops:1.010, bbk:1.00},
    {name:"バレンティン(2013)", team:"ヤクルト", type:"Legend", avg:0.330, slg:0.779, obp:0.455, ops:1.234, bbk:1.00},
    {name:"ローズ(2001)", team:"近鉄", type:"Legend", avg:0.327, slg:0.661, obp:0.421, ops:1.083, bbk:0.60},
    {name:"ラミレス(2003)", team:"ヤクルト", type:"Legend", avg:0.333, slg:0.616, obp:0.368, ops:0.984, bbk:0.30},
    {name:"金本 知憲(2005)", team:"阪神", type:"Legend", avg:0.327, slg:0.615, obp:0.429, ops:1.044, bbk:1.16},
    {name:"小笠原 道大(2003)", team:"日本ハム", type:"Legend", avg:0.360, slg:0.649, obp:0.473, ops:1.122, bbk:1.45},
    {name:"松中 信彦(2004)", team:"ダイエー", type:"Legend", avg:0.358, slg:0.715, obp:0.464, ops:1.179, bbk:1.25}, // 平成唯一の三冠王
    {name:"城島 健司(2003)", team:"ダイエー", type:"Legend", avg:0.330, slg:0.592, obp:0.399, ops:0.991, bbk:1.00},

    // --- 現役投手 ---
    {name:"山本 由伸(2023)", team:"オリックス", type:"現役", era:1.21, fip:1.60, k9:9.3, bb9:1.5, whip:0.88},
    {name:"佐々木 朗希(2023)", team:"ロッテ", type:"現役", era:1.78, fip:1.90, k9:13.4, bb9:1.7, whip:0.75},
    {name:"村上 頌樹(2023)", team:"阪神", type:"現役", era:1.75, fip:2.00, k9:8.5, bb9:0.9, whip:0.74},
    {name:"東 克樹(2023)", team:"DeNA", type:"現役", era:1.98, fip:2.44, k9:6.9, bb9:0.8, whip:0.96},
    {name:"今永 昇太(2023)", team:"DeNA", type:"現役", era:2.80, fip:2.50, k9:10.6, bb9:1.5, whip:1.05},
    {name:"平良 海馬(2023)", team:"西武", type:"現役", era:2.40, fip:2.80, k9:9.1, bb9:3.3, whip:1.15},

    // --- レジェンド投手 ---
    {name:"田中 将大(2013)", team:"楽天", type:"Legend", era:1.27, fip:2.00, k9:7.8, bb9:1.4, whip:0.94}, // 24勝0敗
    {name:"ダルビッシュ有(2011)", team:"日本ハム", type:"Legend", era:1.44, fip:1.50, k9:10.7, bb9:1.4, whip:0.83},
    {name:"大谷 翔平(2015)", team:"日本ハム", type:"Legend", era:2.24, fip:2.10, k9:11.0, bb9:2.6, whip:0.91}, // 投手大谷
    {name:"前田 健太(2015)", team:"広島", type:"Legend", era:2.09, fip:2.40, k9:7.6, bb9:1.8, whip:1.01}, // 沢村賞
    {name:"藤川 球児(2005)", team:"阪神", type:"Legend", era:1.36, fip:1.20, k9:13.6, bb9:2.0, whip:0.80},
    {name:"岩瀬 仁紀(2005)", team:"中日", type:"Legend", era:1.88, fip:2.10, k9:8.2, bb9:1.3, whip:0.95},
    {name:"佐々木 主浩(1998)", team:"横浜", type:"Legend", era:0.64, fip:1.30, k9:12.5, bb9:2.1, whip:0.80}, // 大魔神
    {name:"上原 浩治(1999)", team:"巨人", type:"Legend", era:2.09, fip:2.80, k9:8.2, bb9:1.1, whip:0.90}, // 20勝
    {name:"松坂 大輔(1999)", team:"西武", type:"Legend", era:2.60, fip:3.10, k9:9.0, bb9:4.3, whip:1.17}, // 平成の怪物
    {name:"斉藤 和巳(2006)", team:"ソフトバンク", type:"Legend", era:1.75, fip:2.20, k9:9.1, bb9:2.1, whip:0.96},
    {name:"野茂 英雄(1990)", team:"近鉄", type:"Legend", era:2.91, fip:2.50, k9:10.9, bb9:4.2, whip:1.18},
    {name:"江夏 豊(1968)", team:"阪神", type:"Legend", era:2.13, fip:1.80, k9:10.9, bb9:2.6, whip:0.96}, // 401奪三振
    {name:"稲尾 和久(1961)", team:"西鉄", type:"Legend", era:1.69, fip:2.10, k9:7.9, bb9:1.6, whip:0.95},
    {name:"金田 正一(1958)", team:"国鉄", type:"Legend", era:1.30, fip:1.50, k9:8.3, bb9:2.3, whip:0.85}, // 31勝
    {name:"江川 卓(1981)", team:"巨人", type:"Legend", era:2.29, fip:2.40, k9:9.2, bb9:2.0, whip:1.05}
];

export function normalizePlayers(arr) {
    if (!Array.isArray(arr)) return 0;
    const map = {
        name: ['name','player','display_name','選手名','名前'],
        team: ['team','club','team_name','所属'],
        ops: ['ops','ＯＰＳ'],
        obp: ['obp','出塁率'],
        slg: ['slg','長打率'],
        avg: ['avg','打率'],
        isop: ['isop','iso'],
        bbk: ['bbk','bb/k'],
        era: ['era','防御率'],
        fip: ['fip'],
        k9: ['k9','k/9'],
        bb9: ['bb9','bb/9'],
        whip: ['whip']
    };

    const lookup = {};
    Object.keys(map).forEach(k => map[k].forEach(s => lookup[s.toLowerCase()] = k));

    let mappedCount = 0;
    for (let i = 0; i < arr.length; i++) {
        const src = arr[i];
        if (!src || typeof src !== 'object') continue;
        const dest = {};
        Object.keys(src).forEach(key => {
            const lk = String(key).trim().toLowerCase();
            const canon = lookup[lk] || lk;
            let val = src[key];
            if (typeof val === 'string') {
                val = val.trim();
                if (/^[0-9]+(\.[0-9]+)?%$/.test(val)) val = parseFloat(val.replace('%',''))/100;
                else if (/^[0-9,.]+$/.test(val.replace(/,/g,''))) val = parseFloat(val.replace(/,/g,''));
            }
            dest[canon] = val;
        });
        if (!dest.ops && dest.obp && dest.slg) dest.ops = dest.obp + dest.slg;
        if (!dest.isop && dest.slg && dest.avg) dest.isop = dest.slg - dest.avg;
        
        Object.keys(dest).forEach(k => { src[k] = dest[k]; });
    }
    return mappedCount;
}

normalizePlayers(PLAYERS);