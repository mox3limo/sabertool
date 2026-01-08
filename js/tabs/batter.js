/* js/tabs/batter.js */
import { getVal, setTxt, setVal, clearAllErrors, setFieldError, showError } from '../core/utils.js';
import { DB } from '../core/data.js';
import { state } from '../modules/state.js';

// スマート入力モーダル関連
export function openSmartInputModal(type) {
    const m = document.getElementById('smart_input_modal');
    if (!m) return;
    m.classList.remove('hidden');
    document.getElementById('smart_input_text').value = '';
    document.getElementById('smart_input_text').focus();
    m.dataset.targetType = type;
}

export function closeSmartInputModal() {
    const m = document.getElementById('smart_input_modal');
    if (m) m.classList.add('hidden');
}

export function applySmartInput() {
    const m = document.getElementById('smart_input_modal');
    const type = m.dataset.targetType || 'batter';
    const text = document.getElementById('smart_input_text').value;

    const parseVal = (regex) => {
        const match = text.match(regex);
        return match ? parseFloat(match[1]) : null;
    };

    if (type === 'batter') {
        const h = parseVal(/安打[:\s]?(\d+)/) || parseVal(/(\d+)安打/);
        const hr = parseVal(/本塁打[:\s]?(\d+)/) || parseVal(/(\d+)本/);
        const ab = parseVal(/打数[:\s]?(\d+)/);

        if (h !== null) setVal('b_h', h);
        if (hr !== null) setVal('b_hr', hr);
        if (ab !== null) setVal('b_ab', ab);
    } else {
        const era = parseVal(/防御率[:\s]?(\d+\.\d+)/);
        const w = parseVal(/(\d+)勝/);
        const k = parseVal(/奪三振[:\s]?(\d+)/);
        const ip = parseVal(/投球回[:\s]?(\d+\.?\d*)/);

        if (w !== null) setVal('p_w', w);
        if (k !== null) setVal('p_k', k);
        if (ip !== null) setVal('p_ip', ip);
        if (era !== null) setVal('p_er', Math.round(era * (ip || 1) / 9));
    }

    if (type === 'batter') calcBatter();
    else if (window.calcPitcher) window.calcPitcher();

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
    const pa = ab + bb + hbp + sf;

    if (pa === 0) return;

    const avg = ab > 0 ? h / ab : 0;
    const obp = (h + bb + hbp) / (ab + bb + hbp + sf);
    const slg = (h1 + h2 * 2 + h3 * 3 + hr * 4) / ab || 0;
    const ops = obp + slg;
    const isoP = slg - avg;
    const isoD = obp - avg;
    const babip = (ab - k - hr + sf) > 0 ? (h - hr) / (ab - k - hr + sf) : 0;
    const bb_k = k > 0 ? bb / k : 0;

    // wOBA計算
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
    const lgWoba = 0.320;
    const wobaScale = 1.24;
    const lgR_PA = 0.115;

    const wraa = ((woba - lgWoba) / wobaScale) * pa;
    setTxt('res_wraa', wraa.toFixed(1));

    const wrc = wraa + (lgR_PA * pa);

    // wRC+
    const parkAdjPerPA = lgR_PA * (1 - pf);
    const wrcScorePerPA = (wrc / pa) + parkAdjPerPA;
    const wrcPlus = (wrcScorePerPA / lgR_PA) * 100;

    setTxt('res_wrc_plus', Math.round(wrcPlus));

    // RC27
    const estRC = wrc;
    const outs = (ab - h) + sf;
    const rc27 = outs > 0 ? (estRC / outs) * 27 : 0;
    setTxt('res_rc27', rc27.toFixed(2));

    // WAR計算
    const parkAdjRuns = pa * lgR_PA * (1 - pf);
    const battingRuns = wraa + parkAdjRuns;

    const pos = document.getElementById('position_select').value;
    const posAdjMap = { 'C': 12.5, '1B': -12.5, '2B': 2.5, '3B': 2.5, 'SS': 7.5, 'LF': -7.5, 'CF': 2.5, 'RF': -7.5, 'DH': -17.5 };
    const posAdjPer143 = posAdjMap[pos] || 0;
    const posAdj = posAdjPer143 * (pa / 600);

    const repAdj = 20 * (pa / 600);

    const war = (battingRuns + posAdj + repAdj) / 10;
    setTxt('res_war', war.toFixed(1));

    // WARの文字色変更
    const warEl = document.getElementById('res_war');
    if (warEl && pf !== 1.0) {
        // 色変更ロジックが必要ならここに記述
    }

    // ▼▼▼ 修正: リーグ平均値の表示更新 (計算機能付き) ▼▼▼
    const currentLg = (state && state.currentLeague) ? state.currentLeague : 'Central';
    const lgDB = DB[currentLg] || DB['Central'];
    const lgData = lgDB ? lgDB.bat : {};

    // ヘルパー: 値があれば表示、なければ計算、それでもなければハイフン
    const setAvg = (id, val, format = 'std') => {
        const el = document.getElementById(id);
        if (!el) return;

        if (val !== undefined && val !== null && !isNaN(val)) {
            let str = '';
            if (format === 'rate') str = val.toFixed(3).replace(/^0\./, '.'); // .300
            else if (format === 'std') str = val.toFixed(2); // 3.45
            else if (format === 'pct') str = (val * 100).toFixed(1) + '%';
            else str = val.toString();
            el.innerText = `平均 ${str}`;
        } else {
            el.innerText = '平均 ---';
        }
    };

    // 1. 基本指標（DBにあるはずの値）
    setAvg('avg_avg', lgData.avg, 'rate');
    setAvg('avg_obp', lgData.obp, 'rate');
    setAvg('avg_slg', lgData.slg, 'rate');
    setAvg('avg_woba', lgData.woba, 'rate');
    setAvg('avg_babip', lgData.babip, 'rate');

    // 2. OPS（なければ計算）
    const lgOps = lgData.ops || ((lgData.obp && lgData.slg) ? lgData.obp + lgData.slg : undefined);
    if (document.getElementById('avg_ops')) {
        document.getElementById('avg_ops').innerText = lgOps ? `平均 ${lgOps.toFixed(3)}` : '平均 ---';
    }

    // 3. 派生指標（計算で算出）
    // IsoP = 長打率 - 打率
    const lgIsoP = (lgData.slg !== undefined && lgData.avg !== undefined) ? lgData.slg - lgData.avg : undefined;
    setAvg('avg_isop', lgIsoP, 'rate');

    // IsoD = 出塁率 - 打率
    const lgIsoD = (lgData.obp !== undefined && lgData.avg !== undefined) ? lgData.obp - lgData.avg : undefined;
    setAvg('avg_isod', lgIsoD, 'rate');

    // 4. その他の指標
    // これらはDBになければ計算困難なため、値がない場合は「---」を表示して "0.00" になるのを防ぎます
    // もしDBに 'bbk' や 'rc27' というキーで値を持たせれば表示されます
    setAvg('avg_bbk', lgData.bbk || lgData.bb_k, 'std');
    setAvg('avg_rc27', lgData.rc27, 'std');

    // wRC+の平均は定義上常に100
    const avgWrcEl = document.getElementById('avg_wrc_plus');
    if (avgWrcEl) avgWrcEl.innerText = 'リーグ平均=100';

    // ▲▲▲ 修正ここまで ▲▲▲


    // グラフ更新など
    updateBar('bar_k_pct', k / pa * 100, 30);
    updateBar('bar_bb_pct', bb / pa * 100, 20);
    updateBar('bar_hr_pct', hr / pa * 100, 10);

    updateBatterTypeBadges({ ops, wrcPlus, isoP, bb_k, pa, avg });

    if (typeof window.initComparisonChart === 'function') window.initComparisonChart();
    if (typeof window.calcPrediction === 'function') window.calcPrediction();
}

function updateBar(id, val, max) {
    const el = document.getElementById(id);
    if (el) {
        const pct = Math.min(100, Math.max(0, val / max * 100));
        el.style.width = pct + '%';
    }
    const txtId = id.replace('bar_', 'res_');
    const txt = document.getElementById(txtId);
    if (txt) txt.innerText = (val).toFixed(1) + '%';
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