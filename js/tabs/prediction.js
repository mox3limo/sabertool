import { getVal, setTxt, parseIP } from '../core/utils.js';

export function toggleSeasonMode(mode) {
    const bat = document.getElementById('season_res_bat'), pit = document.getElementById('season_res_pit');
    const btnBat = document.getElementById('btn_season_bat'), btnPit = document.getElementById('btn_season_pit');
    if(mode === 'batter') {
        bat.classList.remove('hidden'); pit.classList.add('hidden');
        btnBat.className="flex-1 py-1 text-xs font-bold rounded bg-white shadow-sm text-indigo-600 transition"; 
        btnPit.className="flex-1 py-1 text-xs font-bold rounded text-slate-400 transition";
    } else {
        bat.classList.add('hidden'); pit.classList.remove('hidden');
        btnPit.className="flex-1 py-1 text-xs font-bold rounded bg-white shadow-sm text-indigo-600 transition"; 
        btnBat.className="flex-1 py-1 text-xs font-bold rounded text-slate-400 transition";
    }
}

export function calcPrediction() {
    const played=getVal('pred_played'), total=getVal('pred_total');
    const pace = played > 0 ? total/played : 0;
    
    // Batter Projection
    setTxt('proj_h',Math.round(getVal('b_h')*pace)); 
    setTxt('proj_hr',Math.round(getVal('b_hr')*pace));
    const wraaEl=document.getElementById('res_wraa'); 
    setTxt('proj_wraa',Math.round((wraaEl?parseFloat(wraaEl.innerText)||0:0)*pace));
    
    // Pitcher Projection
    const k=getVal('p_k'), win=getVal('p_w');
    setTxt('proj_k', Math.round(k*pace)); 
    setTxt('proj_win', Math.round(win*pace));
    
    // Weighted ERA
    const era=parseFloat(document.getElementById('res_era')?.innerText)||0;
    const fip=parseFloat(document.getElementById('res_fip')?.innerText)||0;
    const ip=parseIP(getVal('p_ip'));
    const proj_ip=ip*pace, future_ip=Math.max(0, proj_ip-ip);
    setTxt('proj_final_era', proj_ip>0 ? ((era*ip + fip*future_ip)/proj_ip) : 0);

    // BABIP Regression & Next Season
    const curBabip = parseFloat(document.getElementById('res_babip')?.innerText) || 0;
    const regBabip = (curBabip+.300)/2; // 回帰
    const avg = parseFloat(document.getElementById('res_avg')?.innerText) || 0;
    
    setTxt('next_avg', curBabip>0?avg*(regBabip/curBabip):0, 'rate');
    setTxt('curr_babip', curBabip, 'rate');
    
    const ls=document.getElementById('luck_status');
    if(ls) { 
        ls.innerText=curBabip>.330?"幸運 (下がる)":curBabip<.270?"不運 (上がる)":"平均的"; 
        ls.className=curBabip>.330?"text-sm font-bold text-red-500":curBabip<.270?"text-sm font-bold text-blue-500":"text-sm font-bold text-slate-500"; 
    }
    setTxt('next_era', (era+fip)/2);
}

export function calcCareer() {
    const age = getVal('career_age') || 0;
    const h = getVal('career_h') || 0;
    const w = getVal('career_w') || 0;
    const paceRatio = parseFloat(document.getElementById('career_pace_type').value || '1');
    const played = getVal('pred_played') || 100;
    const total = getVal('pred_total') || 143;
    const seasonScale = played > 0 ? (total / played) : 1;

    // 現在の入力値を使用
    const seasonH = (document.getElementById('b_h') ? getVal('b_h') * seasonScale : 0);
    const seasonW = (document.getElementById('p_w') ? getVal('p_w') * seasonScale : 0);

    const hRem = Math.max(0, 2000 - h);
    const wRem = Math.max(0, 200 - w);

    document.getElementById('rem_2000h').innerText = hRem > 0 ? Math.round(hRem) : 0;
    document.getElementById('rem_200w').innerText = wRem > 0 ? Math.round(wRem) : 0;

    const hYears = (seasonH * paceRatio) > 0 ? (hRem / (seasonH * paceRatio)) : Infinity;
    const wYears = (seasonW * paceRatio) > 0 ? (wRem / (seasonW * paceRatio)) : Infinity;

    document.getElementById('pred_2000h').innerText = hRem <= 0 ? '達成済' : (Number(age) + hYears).toFixed(1) + '歳';
    document.getElementById('pred_200w').innerText = wRem <= 0 ? '達成済' : (Number(age) + wYears).toFixed(1) + '歳';
}