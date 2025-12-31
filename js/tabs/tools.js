/* js/tabs/tools.js */
import { getVal } from '../core/utils.js';
import { getWeights, saveWeights, resetWeights } from '../modules/settings.js';

// --- FIP定数計算（既存機能） ---
export function calcConstant() {
    const era = getVal('l_era');
    const ip = getVal('l_ip');
    const hr = getVal('l_hr');
    const bb = getVal('l_bb');
    const hbp = getVal('l_hbp');
    const k = getVal('l_k');

    if (ip <= 0) return;

    const rawFipNum = (13 * hr) + (3 * (bb + hbp)) - (2 * k);
    const rawFip = rawFipNum / ip;
    const constant = era - rawFip;

    const resEl = document.getElementById('res_const');
    if (resEl) resEl.innerText = constant.toFixed(3);
}

export function applyConstant() { 
    const resEl = document.getElementById('res_const');
    const targetEl = document.getElementById('p_const');
    
    if (resEl && targetEl) {
        targetEl.value = resEl.innerText;
        if (typeof window.switchTab === 'function') {
            const btns = document.querySelectorAll('.nav-btn');
            let pBtn = null;
            btns.forEach(btn => { if (btn.innerText.indexOf('投手') !== -1) pBtn = btn; });
            window.switchTab('pitcher', pBtn);
        }
        if (typeof window.calcPitcher === 'function') window.calcPitcher();
    } else {
        alert('エラー: 適用先の要素が見つかりません。');
    }
}

// --- ★追加: 係数設定UIの操作 ---

// 画面に現在の設定値を反映
export function loadSettingsToUI() {
    const w = getWeights();
    const set = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
    
    set('set_wbb', w.wbb);
    set('set_whbp', w.whbp);
    set('set_w1b', w.w1b);
    set('set_w2b', w.w2b);
    set('set_w3b', w.w3b);
    set('set_whr', w.whr);
    set('set_scale', w.woba_scale);
}

// 画面の値を保存
export function applySettingsFromUI() {
    const get = (id) => document.getElementById(id).value;
    const newWeights = {
        wbb: get('set_wbb'),
        whbp: get('set_whbp'),
        w1b: get('set_w1b'),
        w2b: get('set_w2b'),
        w3b: get('set_w3b'),
        whr: get('set_whr'),
        woba_scale: get('set_scale')
    };
    
    saveWeights(newWeights);
    
    // 保存ボタンの演出
    const btn = document.getElementById('btn_save_weights');
    if(btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i>保存完了';
        btn.classList.add('bg-green-600');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-green-600');
        }, 2000);
    }
}

// 初期値リセット
export function resetSettingsUI() {
    if(!confirm('係数をすべて初期値に戻しますか？')) return;
    resetWeights();
    loadSettingsToUI(); // 画面も戻す
    alert('初期値に戻しました。');
}

// 初期化処理
export function initTools() {
    const ids = ['l_era', 'l_ip', 'l_hr', 'l_bb', 'l_hbp', 'l_k'];
    ids.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', calcConstant);
    });
    calcConstant();
    
    // ★設定UIの初期表示
    loadSettingsToUI();
}