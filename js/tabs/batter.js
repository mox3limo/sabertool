/* js/tabs/batter.js */
import { getVal, setTxt, setVal, clearAllErrors, setFieldError, showError } from '../core/utils.js';
import { DB } from '../core/data.js';
import { state } from '../modules/state.js';

// スマート入力モーダル関連
export function openSmartInputModal(type) {
    const m = document.getElementById('smart_input_modal');
    if (!m) return;
    m.classList.remove('hidden');
    // ... (前回と同様の実装がある前提、または省略可能ですが、念のため記述)
    // モーダル表示時にフォーカス等をリセット
    document.getElementById('smart_input_text').value = '';
    document.getElementById('smart_input_text').focus();
    // どちらのタブから呼ばれたかを保存
    m.dataset.targetType = type; // 'batter' or 'pitcher'
}

export function closeSmartInputModal() {
    const m = document.getElementById('smart_input_modal');
    if (m) m.classList.add('hidden');
}

export function applySmartInput() {
    const m = document.getElementById('smart_input_modal');
    const type = m.dataset.targetType || 'batter';
    const text = document.getElementById('smart_input_text').value;
    
    // 解析ロジック (簡易版)
    const parseVal = (regex) => {
        const match = text.match(regex);
        return match ? parseFloat(match[1]) : null;
    };

    // 数字の抽出パターン (例: "打率.300", "20本", "100安打")
    // 打者用
    if (type === 'batter') {
        const h = parseVal(/安打[:\s]?(\d+)/) || parseVal(/(\d+)安打/);
        const hr = parseVal(/本塁打[:\s]?(\d+)/) || parseVal(/(\d+)本/); // "本"は汎用的すぎるが簡易対応
        const rbi = parseVal(/打点[:\s]?(\d+)/);
        const sb = parseVal(/盗塁[:\s]?(\d+)/);
        const avg = parseVal(/打率[:\s]?\.(\d+)/); // .300 -> 300
        const ab = parseVal(/打数[:\s]?(\d+)/);
        
        // 反映 (nullでないもののみ)
        if (h !== null) setVal('b_h', h);
        if (hr !== null) setVal('b_hr', hr);
        if (ab !== null) setVal('b_ab', ab);
        // ...必要に応じて拡張
    } else {
        // 投手用
        const era = parseVal(/防御率[:\s]?(\d+\.\d+)/);
        const w = parseVal(/(\d+)勝/);
        const k = parseVal(/奪三振[:\s]?(\d+)/);
        const ip = parseVal(/投球回[:\s]?(\d+\.?\d*)/);
        
        if (w !== null) setVal('p_w', w);
        if (k !== null) setVal('p_k', k);
        if (ip !== null) setVal('p_ip', ip);
        if (era !== null) setVal('p_er', Math.round(era * (ip||1) / 9)); // 防御率から自責点逆算
    }

    // 計算実行
    if (type === 'batter') calcBatter();
    else if(window.calcPitcher) window.calcPitcher();
    
    closeSmartInputModal();
}

// 球場補正プルダウン変更時の処理
export function applyStadiumPf() {
    const sel = document.getElementById('stadium_select');
    const input = document.getElementById('batter_pf');
    if (sel && input) {
        input.value = sel.value;
        calcBatter();
    }
}

function validateInput() {
    // 簡易バリデーション
    clearAllErrors();
    const h = getVal('b_h'), ab = getVal('b_ab');
    const h2 = getVal('b_2b'), h3 = getVal('b_3b'), hr = getVal('b_hr');
    
    let isValid = true;
    if (h > ab && ab > 0) {
        setFieldError('b_h', true);
        showError('安打数が打数を超えています');
        isValid = false;
    }
    if ((h2 + h3 + hr) > h && h > 0) {
        showError('長打の合計が安打数を超えています');
        isValid = false;
    }
    return isValid;
}

// メイン計算ロジック
export function calcBatter() {
    if (!validateInput()) return;

    // 入力取得
    const ab = getVal('b_ab');
    const h = getVal('b_h');
    const h2 = getVal('b_2b');
    const h3 = getVal('b_3b');
    const hr = getVal('b_hr');
    const bb = getVal('b_bb');
    const ibb = getVal('b_ibb');
    const hbp = getVal('b_hbp');
    const sf = getVal('b_sf');
    const k = getVal('b_k');
    
    // PF取得
    let pf = parseFloat(document.getElementById('batter_pf').value);
    if (isNaN(pf) || pf <= 0) pf = 1.00;

    // 基本計算
    const h1 = h - h2 - h3 - hr;
    const pa = ab + bb + hbp + sf; // 犠打(SH)は簡易ツールのため除外または打席に含めない前提
    
    if (pa === 0) return;

    const avg = ab > 0 ? h / ab : 0;
    const obp = (h + bb + hbp) / (ab + bb + hbp + sf);
    const slg = (h1 + h2 * 2 + h3 * 3 + hr * 4) / ab || 0;
    const ops = obp + slg;
    const isoP = slg - avg;
    const isoD = obp - avg;
    const babip = (ab - k - hr + sf) > 0 ? (h - hr) / (ab - k - hr + sf) : 0;
    const bb_k = k > 0 ? bb / k : 0;

    // wOBA計算 (係数は一旦固定値、またはToolsで設定された値があれば使う)
    // 標準的な係数 (NPB近似)
    const wBB = 0.69, wHBP = 0.72, w1B = 0.89, w2B = 1.27, w3B = 1.62, wHR = 2.10;
    const wobaNumer = (wBB * (bb - ibb)) + (wHBP * hbp) + (w1B * h1) + (w2B * h2) + (w3B * h3) + (wHR * hr);
    const wobaDenom = ab + bb - ibb + sf + hbp;
    const woba = wobaDenom > 0 ? wobaNumer / wobaDenom : 0;

    // 表示更新 (基本指標)
    setTxt('res_avg', avg.toFixed(3).replace(/^0\./, '.'));
    setTxt('res_obp', obp.toFixed(3).replace(/^0\./, '.'));
    setTxt('res_slg', slg.toFixed(3).replace(/^0\./, '.'));
    setTxt('res_ops', ops.toFixed(3).replace(/^0\./, '.'));
    setTxt('res_isop', isoP.toFixed(3).replace(/^0\./, '.'));
    setTxt('res_isod', isoD.toFixed(3).replace(/^0\./, '.'));
    setTxt('res_babip', babip.toFixed(3).replace(/^0\./, '.'));
    setTxt('res_woba', woba.toFixed(3).replace(/^0\./, '.'));
    setTxt('res_bbk_bat', bb_k.toFixed(2));

    // 高度指標 (wRAA, wRC, WAR)
    const lgWoba = 0.320; // リーグ平均wOBA (仮)
    const wobaScale = 1.24; // スケール
    const lgR_PA = 0.115; // リーグ平均得点/打席 (WAR計算用)

    // wRAA = ((wOBA - lgwOBA) / wOBA_Scale) * PA
    const wraa = ((woba - lgWoba) / wobaScale) * pa;
    setTxt('res_wraa', wraa.toFixed(1));

    // wRC = (((wOBA - lgwOBA) / wobaScale) + (lgR/PA)) * PA
    // 簡易的には wRAA + (lgR/PA * PA)
    const wrc = wraa + (lgR_PA * pa);
    
    // wRC+ = (((wRAA/PA + lgR/PA) + (lgR/PA - (PF * lgR/PA))) / lgR/PA) * 100
    // 分子 = (wRC/PA) + (リーグR/PA * (1-PF))
    // 補正 = パークファクターによる得点補正
    const parkAdjPerPA = lgR_PA * (1 - pf); 
    const wrcScorePerPA = (wrc / pa) + parkAdjPerPA;
    const wrcPlus = (wrcScorePerPA / lgR_PA) * 100;

    setTxt('res_wrc_plus', Math.round(wrcPlus));
    
    // RC27 (Run Created / 27 outs)
    // 簡易RC = (H+BB)*TB / (AB+BB) ではなく wOBAベースで算出も可能だが
    // ここでは伝統的な簡易式: RC = ((H+BB+HBP-CS-GIDP)*(TB+0.26(BB-IBB+HBP)) + 0.52(SF+SH+SB)) / (AB+BB+HBP+SH+SF)
    // 入力が足りないので wOBAベースの推定RCを使用
    const estRC = wrc; 
    const outs = (ab - h) + sf; // 簡易アウト数
    const rc27 = outs > 0 ? (estRC / outs) * 27 : 0;
    setTxt('res_rc27', rc27.toFixed(2));

    // WAR計算
    // WAR = (BattingRuns + BaseRunning + Fielding + Positional + League + Replacement) / RunsPerWin
    // BattingRuns = wRAA + (lgR/PA - (PF * lgR/PA)) * PA  <-- ★ここを修正しました
    // つまり wRAA に「球場補正(Runs)」を足す
    
    const parkAdjRuns = pa * lgR_PA * (1 - pf); // PF>1ならマイナス(ハンデ), PF<1ならプラス
    const battingRuns = wraa + parkAdjRuns;

    // 守備位置補正 (Positional Adjustment)
    const pos = document.getElementById('position_select').value;
    const posAdjMap = { 'C': 12.5, '1B': -12.5, '2B': 2.5, '3B': 2.5, 'SS': 7.5, 'LF': -7.5, 'CF': 2.5, 'RF': -7.5, 'DH': -17.5 };
    const posAdjPer143 = posAdjMap[pos] || 0;
    const posAdj = posAdjPer143 * (pa / 600); // 600打席換算で比例配分

    // 代替レベル補正 (Replacement Level)
    // 通常、リーグ平均に対して +20点/600打席程度
    const repAdj = 20 * (pa / 600);

    // WAR = (BattingRuns + PosAdj + RepAdj) / 10
    // ※守備(UZR)と走塁(BsR)はデータがないので0とする
    const war = (battingRuns + posAdj + repAdj) / 10;
    
    setTxt('res_war', war.toFixed(1));

    // WARの文字色変更 (PF補正が効いていることを視覚的に)
    const warEl = document.getElementById('res_war');
    if (warEl && pf !== 1.0) {
        // PF>1(打者有利)ならWARは下がる(厳しい評価) -> 色を変える等の演出
        // ここではシンプルにそのまま
    }

    // グラフ更新など
    updateBar('bar_k_pct', k / pa * 100, 30); // 30%をMAXとする
    updateBar('bar_bb_pct', bb / pa * 100, 20); // 20%をMAX
    updateBar('bar_hr_pct', hr / pa * 100, 10); // 10%をMAX

    updateBatterTypeBadges({ ops, wrcPlus, isoP, bb_k, pa, avg });
    
    // 比較タブなどの更新
    if(typeof window.initComparisonChart === 'function') window.initComparisonChart();
    if(typeof window.calcPrediction === 'function') window.calcPrediction();
}

function updateBar(id, val, max) {
    const el = document.getElementById(id);
    if (el) {
        const pct = Math.min(100, Math.max(0, val / max * 100));
        el.style.width = pct + '%';
    }
    // 数値表示更新
    const txtId = id.replace('bar_', 'res_');
    const txt = document.getElementById(txtId);
    if(txt) txt.innerText = (val).toFixed(1) + '%';
}

function updateBatterTypeBadges(s) {
    const container = document.getElementById('player_types');
    if (!container) return;
    
    container.innerHTML = '';
    const badges = [];

    const add = (text, color, icon) => {
        badges.push(`<span class="px-2 py-1 rounded text-[10px] font-bold bg-${color}-100 text-${color}-700 border border-${color}-200 flex items-center gap-1"><i class="fa-solid ${icon}"></i>${text}</span>`);
    };

    if (s.wrcPlus >= 160) add('MVP級', 'yellow', 'fa-crown');
    else if (s.wrcPlus >= 140) add('トップ打者', 'orange', 'fa-star');
    
    if (s.isoP >= 0.250) add('スラッガー', 'red', 'fa-fire');
    else if (s.isoP >= 0.200) add('長距離砲', 'rose', 'fa-bomb');
    
    if (s.bb_k >= 1.0 && s.pa > 100) add('選球眼◎', 'emerald', 'fa-eye');
    
    if (s.avg >= 0.300 && s.isoP < 0.150) add('アベレージ型', 'blue', 'fa-bullseye');
    
    if (s.wrcPlus < 80 && s.pa > 200) add('要改善', 'slate', 'fa-triangle-exclamation');

    container.innerHTML = badges.join('');
}