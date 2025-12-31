/* js/tabs/pitcher.js */
import { getVal, setTxt, parseIP, clearAllErrors, setFieldError, showError } from '../core/utils.js';
import { DB } from '../core/data.js';
import { state } from '../modules/state.js';

function validatePitcherInput() {
    clearAllErrors();
    const errors = [];
    const ip = getVal('p_ip'), er = getVal('p_er'), r = getVal('p_r'), bb = getVal('p_bb'), ibb = getVal('p_ibb');
    if (er > r && r > 0) { errors.push('自責点が失点を超えています'); setFieldError('p_er', true); }
    if (ibb > bb && bb > 0) { errors.push('敬遠が与四球数を超えています'); setFieldError('p_ibb', true); }
    if (errors.length > 0) { showError(errors.join(' / ')); return false; }
    return true;
}

export function calcPitcher() {
    validatePitcherInput();
    const ip = parseIP(getVal('p_ip'));
    const er = getVal('p_er'), k = getVal('p_k'), bb = getVal('p_bb');
    const hr = getVal('p_hr'), h = getVal('p_h'), hbp = getVal('p_hbp'), r = getVal('p_r');
    const fipConst = getVal('p_const');

    if (ip <= 0) return;
    
    const era = er * 9 / ip;
    const fipRaw = (13 * hr + 3 * (bb + hbp) - 2 * k) / ip;
    const fip = fipRaw + fipConst;
    const diff = era - fip; // プラスなら防御率が悪い(運が悪い/守備が悪い), マイナスなら防御率が良い(運が良い)
    const bip = (ip * 3 + h) - k - hr;
    const whip = (bb + h) / ip;
    const k9 = k * 9 / ip;
    const bb9 = bb * 9 / ip;
    
    setTxt('res_era', era); 
    setTxt('res_fip', fip); 
    
    const lobDenom = h + bb + hbp - (1.4 * hr);
    const lob = lobDenom !== 0 ? (h + bb + hbp - r) / lobDenom : 0;
    setTxt('res_lob', lob, 'pct');
    setTxt('res_whip', whip); 
    setTxt('res_k9', k9); 
    setTxt('res_bb9', bb9); 
    setTxt('res_hr9', hr * 9 / ip);
    setTxt('res_p_babip', bip > 0 ? (h - hr) / bip : 0, 'rate');

    const bf = ip * 3 + h + bb + hbp;
    const k_pct = bf > 0 ? (k / bf) : 0;
    
    setTxt('res_kbb', bb > 0 ? k / bb : 0);
    setTxt('res_p_k_pct', k_pct, 'pct');
    
    const estimatedFb = bip * 0.4;
    const expectedHr = estimatedFb * 0.10;
    const xfip = ((13 * expectedHr + 3 * (bb + hbp) - 2 * k) / ip) + fipConst;
    setTxt('res_xfip', xfip);
    
    let siera = 0;
    if (bf > 0) {
        const k_pa = k / bf, bb_pa = bb / bf, hr_pa = hr / bf;
        siera = 6.145 - 16.986 * k_pa + 11.434 * bb_pa - 1.858 * hr_pa;
        setTxt('res_siera', siera > 0 ? siera : 0);
    }

    const currentLg = (state && state.currentLeague) ? state.currentLeague : 'Central';
    const lgData = (DB && DB[currentLg]) ? DB[currentLg].pit : {};
    
    if(lgData.era) setTxt('avg_era', `平均 ${lgData.era.toFixed(2)}`);
    if(lgData.fip) setTxt('avg_fip', `平均 ${lgData.fip.toFixed(2)}`);
    if(lgData.k9) setTxt('avg_k9', `平均 ${lgData.k9.toFixed(2)}`);
    if(lgData.bb9) setTxt('avg_bb9', `平均 ${lgData.bb9.toFixed(2)}`);
    if(lgData.hr9) setTxt('avg_hr9', `平均 ${lgData.hr9.toFixed(2)}`);
    if(lgData.whip) setTxt('avg_whip', `平均 ${lgData.whip.toFixed(2)}`);
    if(lgData.fip) setTxt('avg_xfip', `平均 ${lgData.fip.toFixed(2)}`);
    if(lgData.fip) setTxt('avg_siera', `平均 ${lgData.fip.toFixed(2)}`);

    // ★修正: Luck & Defense ゲージの挙動を細かくする
    const bar = document.getElementById('diff_bar');
    const bdg = document.getElementById('diff_badge');
    if(bar && bdg){
        // 差分が1.0以上でMAX幅になるように調整 (以前は1.25)
        let w = Math.min(Math.abs(diff) * 50, 50); 
        let l = diff > 0 ? 50 : 50 - w;
        bar.style.left = l + '%'; bar.style.width = w + '%';
        
        // 色とバッジ判定の細分化
        if (diff > 0.8) { 
            bar.className = 'absolute h-2 rounded-full top-1/2 -translate-y-1/2 bg-red-600 shadow-sm'; 
            bdg.innerText = "VERY UNLUCKY"; 
            bdg.className = "px-3 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200";
        } else if (diff > 0.2) { 
            bar.className = 'absolute h-2 rounded-full top-1/2 -translate-y-1/2 bg-red-400'; 
            bdg.innerText = "UNLUCKY"; 
            bdg.className = "px-3 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100";
        } else if (diff < -0.8) { 
            bar.className = 'absolute h-2 rounded-full top-1/2 -translate-y-1/2 bg-blue-600 shadow-sm'; 
            bdg.innerText = "VERY LUCKY"; 
            bdg.className = "px-3 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200";
        } else if (diff < -0.2) { 
            bar.className = 'absolute h-2 rounded-full top-1/2 -translate-y-1/2 bg-blue-400'; 
            bdg.innerText = "LUCKY"; 
            bdg.className = "px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100";
        } else { 
            bar.className = 'hidden'; 
            bdg.innerText = "NEUTRAL";
            bdg.className = "px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200";
        }
    }
    
    updatePitcherTypeBadges({ fip, k9, bb9, whip, lob, kbb: bb > 0 ? k / bb : 0 });

    if (typeof window.calcPrediction === 'function') window.calcPrediction();
}

function updatePitcherTypeBadges(stats) {
    const container = document.getElementById('pitcher_types');
    if (!container) return;
    
    container.innerHTML = '';
    const badges = [];

    const add = (text, color, icon) => {
        badges.push(`<span class="px-2 py-1 rounded text-[10px] font-bold bg-${color}-100 text-${color}-700 border border-${color}-200 flex items-center gap-1"><i class="fa-solid ${icon}"></i>${text}</span>`);
    };

    if (stats.fip <= 2.00) add('神の領域', 'yellow', 'fa-crown');
    else if (stats.fip <= 2.80) add('エース級', 'orange', 'fa-medal');
    
    if (stats.k9 >= 10.0) {
        add('ドクターK', 'red', 'fa-fire');
    } else if (stats.k9 >= 8.5) {
        add('本格派', 'rose', 'fa-baseball');
    }

    if (stats.bb9 <= 1.5) {
        add('精密機械', 'emerald', 'fa-crosshairs');
    } else if (stats.kbb >= 4.0) {
        add('高K/BB', 'teal', 'fa-scale-balanced');
    }

    if (stats.whip <= 0.90) {
        add('支配的', 'blue', 'fa-gavel');
    } else if (stats.lob >= 0.80) {
        add('粘りの投球', 'cyan', 'fa-anchor');
    }

    if (stats.k9 < 6.0 && stats.bb9 <= 2.5 && stats.fip <= 3.80) {
        add('軟投派', 'slate', 'fa-wind');
    }

    if (badges.length === 0 && stats.fip <= 3.80) {
        add('バランス型', 'indigo', 'fa-star');
    } else if (stats.fip > 4.50) {
        add('要修正', 'slate', 'fa-triangle-exclamation');
    }

    container.innerHTML = badges.join('');
}