/* js/tabs/batter.js */

import { getVal, setTxt, showError, hideError, clearAllErrors, setFieldError } from '../core/utils.js';
import { DB, POSITION_ADJUSTMENTS } from '../core/data.js';
import { state } from '../modules/state.js';
import { getWeights } from '../modules/settings.js';

export function applyStadiumPf() {
    const sel = document.getElementById('stadium_select');
    const input = document.getElementById('batter_pf');
    if (sel && input) {
        input.value = sel.value;
        calcBatter();
    }
}

function validateBatterInput() {
    clearAllErrors();
    const errors = [];
    const ab = getVal('b_ab'), h = getVal('b_h');
    const d2 = getVal('b_2b'), d3 = getVal('b_3b'), hr = getVal('b_hr');
    const bb = getVal('b_bb'), ibb = getVal('b_ibb');
    
    if (h > ab && ab > 0) { errors.push('安打数が打数を超えています'); setFieldError('b_h', true); }
    if ((d2 + d3 + hr) > h && h > 0) {
        errors.push('長打が安打数を超えています');
        setFieldError('b_2b', true); setFieldError('b_3b', true); setFieldError('b_hr', true);
    }
    if (ibb > bb && bb > 0) { errors.push('敬遠が四球数を超えています'); setFieldError('b_ibb', true); }
    
    if (errors.length > 0) { showError(errors.join(' / ')); return false; }
    hideError();
    return true;
}

export function calcBatter() {
    if (!validateBatterInput()) return;
    
    const ab=getVal('b_ab'), h=getVal('b_h'), d2=getVal('b_2b'), d3=getVal('b_3b'), hr=getVal('b_hr'), bb=getVal('b_bb'), k=getVal('b_k');
    const sf=getVal('b_sf'), ibb=getVal('b_ibb'), hbp=getVal('b_hbp');
    
    let pf = parseFloat(document.getElementById('batter_pf')?.value);
    if (isNaN(pf) || pf <= 0) pf = 1.00;

    const s1=h-d2-d3-hr, pa=ab+bb+hbp+sf;
    const avg=ab>0?h/ab:0, obp=pa>0?(h+bb+hbp)/pa:0, slg=ab>0?(s1+2*d2+3*d3+4*hr)/ab:0;
    
    const W = getWeights(); 
    
    const wobaNum = (W.wbb*(bb-ibb)) + (W.whbp*hbp) + (W.w1b*s1) + (W.w2b*d2) + (W.w3b*d3) + (W.whr*hr);
    const wobaDenom = (ab+bb-ibb+sf+hbp);
    const woba = wobaDenom>0 ? wobaNum/wobaDenom : 0;
    
    const wraa=((woba-0.310)/W.woba_scale)*pa;
    const rc=((h+bb+hbp)*(s1+2*d2+3*d3+4*hr))/(ab+bb+hbp);
    const rc27=(ab-h+sf)>0?(rc/(ab-h+sf))*27:0;
    const babip = (ab-k-hr+sf)>0 ? (h-hr)/(ab-k-hr+sf) : 0;

    let war = 0;
    if (pa > 0) {
        const posKey = document.getElementById('position_select')?.value || 'DH';
        const posAdjFull = (POSITION_ADJUSTMENTS && POSITION_ADJUSTMENTS[posKey]) || -17.5;
        const replacementLevelScore = 20.0; 
        const totalAdjPer600 = posAdjFull + replacementLevelScore;
        const adjScore = totalAdjPer600 * (pa / 600);
        war = (wraa + adjScore) / 10;
    }

    setTxt('res_ops',obp+slg,'rate'); 
    setTxt('res_woba',woba,'rate'); 
    setTxt('res_wraa',wraa);
    setTxt('res_war', war, 'std');

    setTxt('res_avg',avg,'rate'); setTxt('res_obp',obp,'rate'); setTxt('res_slg',slg,'rate');
    setTxt('res_isop',slg-avg,'rate'); setTxt('res_isod',obp-avg,'rate'); setTxt('res_bbk_bat',k>0?bb/k:0);
    setTxt('res_babip',babip,'rate'); setTxt('res_rc27',rc27);
    
    const currentLg = (state && state.currentLeague) ? state.currentLeague : 'Central';
    const lgData = (DB && DB[currentLg]) ? DB[currentLg].bat : {};
    
    const fmtRate = (v) => v !== undefined ? '平均 ' + v.toFixed(3).replace(/^0\./, '.') : '---';
    const fmtNum = (v) => v !== undefined ? '平均 ' + v.toFixed(2) : '---';

    setTxt('avg_ops', fmtRate(lgData.ops));
    setTxt('avg_woba', fmtRate(lgData.woba));
    setTxt('avg_avg', fmtRate(lgData.avg));
    setTxt('avg_obp', fmtRate(lgData.obp));
    setTxt('avg_slg', fmtRate(lgData.slg));
    setTxt('avg_isop', fmtRate(lgData.isop));
    setTxt('avg_rc27', fmtNum(lgData.rc27));
    setTxt('avg_babip', fmtRate(lgData.babip));
    setTxt('avg_isod', fmtRate(lgData.isod));
    setTxt('avg_bbk', fmtNum(lgData.bbk));
    
    const lgWoba = lgData.woba || 0.310;
    const lgRPA = lgData.r_pa || 0.105;
    let wrcPlus = 100;
    
    if (pa > 0) {
        const wraaPerPa = (woba - lgWoba) / W.woba_scale;
        const parkAdjPerPa = lgRPA - (pf * lgRPA);
        const num = wraaPerPa + lgRPA + parkAdjPerPa;
        wrcPlus = (num / lgRPA) * 100;
    }
    setTxt('res_wrc_plus', Math.round(wrcPlus), 'std');
    
    const wrcEl = document.getElementById('res_wrc_plus');
    if (wrcEl && pf !== 1.0) {
        wrcEl.style.color = pf > 1.0 ? '#0891b2' : '#e11d48'; 
    } else if (wrcEl) {
        wrcEl.style.color = '';
    }

    const kPct = pa > 0 ? (k / pa) : 0;
    const bbPct = pa > 0 ? (bb / pa) : 0;
    const hrPct = pa > 0 ? (hr / pa) : 0;

    setTxt('res_k_pct', kPct, 'pct');
    setTxt('res_bb_pct', bbPct, 'pct');
    setTxt('res_hr_pct', hrPct, 'pct');
    
    // ★追加: ゲージの長さを動的に変更
    const setBar = (id, val, max) => {
        const el = document.getElementById(id);
        if(el) el.style.width = Math.min((val * 100) / max * 100, 100) + '%';
    };
    setBar('bar_k_pct', kPct, 30);  // K%は30%でMAX
    setBar('bar_bb_pct', bbPct, 20); // BB%は20%でMAX
    setBar('bar_hr_pct', hrPct, 10); // HR%は10%でMAX

    updatePlayerTypeBadges({ avg, obp, slg, isop: slg-avg, isod: obp-avg, ops: obp+slg, bbk: k>0?bb/k:0, pa, war });

    if (typeof window.calcPrediction === 'function') window.calcPrediction();
    if (typeof window.calcCareer === 'function') window.calcCareer();
}

function updatePlayerTypeBadges(stats) {
    const container = document.getElementById('player_types');
    if (!container) return;
    
    container.innerHTML = '';
    const badges = [];

    const add = (text, color, icon) => {
        badges.push(`<span class="px-2 py-1 rounded text-[10px] font-bold bg-${color}-100 text-${color}-700 border border-${color}-200 flex items-center gap-1"><i class="fa-solid ${icon}"></i>${text}</span>`);
    };

    if (stats.pa < 10) {
        container.innerHTML = '<span class="text-[10px] text-slate-400">データ不足</span>';
        return;
    }

    if (stats.ops >= 1.000) add('レジェンド', 'yellow', 'fa-crown');
    else if (stats.ops >= .900) add('MVP級', 'orange', 'fa-medal');
    
    if (stats.avg >= .300) {
        add('安打製造機', 'blue', 'fa-bullseye');
    }
    
    if (stats.isop >= .200) {
        add('パワーヒッター', 'red', 'fa-bomb');
    } else if (stats.isop >= .150 && stats.avg < .260) {
        add('ロマン砲', 'rose', 'fa-wand-magic-sparkles');
    }

    if (stats.isod >= .080 || (stats.bbk >= 1.0 && stats.obp >= .350)) {
        add('選球眼の鬼', 'emerald', 'fa-eye');
    }

    if (stats.war >= 5.0) {
    } else if (stats.war <= -1.0) {
        add('要奮起', 'slate', 'fa-triangle-exclamation');
    }

    if (badges.length === 0 && stats.ops >= .700) {
        add('バランス型', 'indigo', 'fa-scale-balanced');
    }

    container.innerHTML = badges.join('');
}