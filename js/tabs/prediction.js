/* js/tabs/prediction.js */
import { PLAYERS, DB } from '../core/data.js';
import { state } from '../modules/state.js';

let seasonMode = 'batter';

// --- 既存の予測機能 ---

export function toggleSeasonMode(mode) {
    seasonMode = mode;
    const btnBat = document.getElementById('btn_season_bat');
    const btnPit = document.getElementById('btn_season_pit');
    const divBat = document.getElementById('season_res_bat');
    const divPit = document.getElementById('season_res_pit');

    if (mode === 'batter') {
        if(btnBat) btnBat.className = "flex-1 py-1 text-xs font-bold rounded bg-white shadow-sm text-indigo-600 transition";
        if(btnPit) btnPit.className = "flex-1 py-1 text-xs font-bold rounded text-slate-400 transition";
        if(divBat) divBat.classList.remove('hidden');
        if(divPit) divPit.classList.add('hidden');
    } else {
        if(btnPit) btnPit.className = "flex-1 py-1 text-xs font-bold rounded bg-white shadow-sm text-indigo-600 transition";
        if(btnBat) btnBat.className = "flex-1 py-1 text-xs font-bold rounded text-slate-400 transition";
        if(divPit) divPit.classList.remove('hidden');
        if(divBat) divBat.classList.add('hidden');
    }
    calcPrediction();
}

export function calcPrediction() {
    try {
        const getNum = (id) => { const el = document.getElementById(id); return el ? parseFloat(el.innerText) || 0 : 0; };
        const babip = getNum('res_babip');
        const fip = getNum('res_fip');
        
        // 簡易予測 (BABIP回帰 / FIP回帰)
        const nextAvg = (babip - 0.300) * 0.5 + getNum('res_avg'); // 適当な回帰
        const nextEra = (fip + getNum('res_era')) / 2;

        const elNextAvg = document.getElementById('next_avg');
        const elNextEra = document.getElementById('next_era');
        if(elNextAvg) elNextAvg.innerText = nextAvg.toFixed(3).replace(/^0\./, '.');
        if(elNextEra) elNextEra.innerText = nextEra.toFixed(2);

        document.getElementById('curr_babip').innerText = babip.toFixed(3).replace(/^0\./, '.');
        
        const luckEl = document.getElementById('luck_status');
        if (luckEl) {
            if (Math.abs(babip - 0.300) < 0.02) { luckEl.innerText = "適正"; luckEl.className = "font-bold text-slate-500"; }
            else if (babip > 0.320) { luckEl.innerText = "幸運"; luckEl.className = "font-bold text-blue-500"; }
            else { luckEl.innerText = "不運"; luckEl.className = "font-bold text-red-500"; }
        }

        // シーズン到達予測
        const played = parseFloat(document.getElementById('pred_played').value) || 1;
        const total = parseFloat(document.getElementById('pred_total').value) || 143;
        const rate = total / played;

        if (seasonMode === 'batter') {
            const h = parseFloat(document.getElementById('b_h')?.value) || 0;
            const hr = parseFloat(document.getElementById('b_hr')?.value) || 0;
            const wraa = getNum('res_wraa');

            document.getElementById('proj_h').innerText = Math.round(h * rate);
            document.getElementById('proj_hr').innerText = Math.round(hr * rate);
            document.getElementById('proj_wraa').innerText = (wraa * rate).toFixed(1);
        } else {
            const w = parseFloat(document.getElementById('p_w')?.value) || 0;
            const k = parseFloat(document.getElementById('p_k')?.value) || 0;
            
            document.getElementById('proj_win').innerText = Math.round(w * rate);
            document.getElementById('proj_k').innerText = Math.round(k * rate);
            document.getElementById('proj_final_era').innerText = nextEra.toFixed(2);
        }

    } catch (e) {
        console.error(e);
    }
}

export function calcCareer() {
    try {
        const age = parseFloat(document.getElementById('career_age').value) || 25;
        const curH = parseFloat(document.getElementById('career_h').value) || 0;
        const curW = parseFloat(document.getElementById('career_w').value) || 0;
        const pace = parseFloat(document.getElementById('career_pace_type').value) || 1.0;

        const seasonH = parseFloat(document.getElementById('proj_h')?.innerText) || 0;
        const seasonW = parseFloat(document.getElementById('proj_win')?.innerText) || 0;

        // 2000本安打
        const remH = 2000 - curH;
        let yearsH = 0;
        if (seasonH > 0) {
            let tempH = 0;
            let currentPace = seasonH;
            while(tempH < remH && yearsH < 25) {
                tempH += currentPace;
                yearsH++;
                currentPace *= pace; // 経年劣化
            }
        }
        document.getElementById('rem_2000h').innerText = Math.max(0, remH);
        document.getElementById('pred_2000h').innerText = (remH <= 0) ? "達成済" : (yearsH >= 20 ? "困難" : (age + yearsH) + "歳");

        // 200勝
        const remW = 200 - curW;
        let yearsW = 0;
        if (seasonW > 0) {
            let tempW = 0;
            let currentPace = seasonW;
            while(tempW < remW && yearsW < 25) {
                tempW += currentPace;
                yearsW++;
                currentPace *= pace;
            }
        }
        document.getElementById('rem_200w').innerText = Math.max(0, remW);
        document.getElementById('pred_200w').innerText = (remW <= 0) ? "達成済" : (yearsW >= 20 ? "困難" : (age + yearsW) + "歳");

    } catch(e) { console.error(e); }
}


// ▼▼▼ 勝利確率シミュレーター (Win Probability) ▼▼▼

let wpIsTop = false; // false=裏(自チーム攻撃), true=表(自チーム守備)

// 表裏切り替えUI
export function selectTopBottom(type) {
    const btnTop = document.getElementById('btn_top');
    const btnBot = document.getElementById('btn_bot');
    
    if (type === 'top') {
        wpIsTop = true;
        btnTop.className = "flex-1 rounded text-xs font-bold bg-white shadow-sm text-slate-700 transition";
        btnBot.className = "flex-1 rounded text-xs font-bold text-slate-400 transition";
    } else {
        wpIsTop = false; // 裏
        btnBot.className = "flex-1 rounded text-xs font-bold bg-white shadow-sm text-slate-700 transition";
        btnTop.className = "flex-1 rounded text-xs font-bold text-slate-400 transition";
    }
}

// 勝率計算実行
export function calcWinProb() {
    // 1. 入力値取得
    const inning = parseInt(document.getElementById('wp_inning').value);
    const myScore = parseInt(document.getElementById('wp_my_score').value) || 0;
    const oppScore = parseInt(document.getElementById('wp_opp_score').value) || 0;
    
    // ラジオボタンからアウトカウント取得
    let outs = 0;
    document.querySelectorAll('input[name="wp_outs"]').forEach(r => {
        if(r.checked) outs = parseInt(r.value);
    });

    // ランナー
    const r1 = document.getElementById('runner_1').checked;
    const r2 = document.getElementById('runner_2').checked;
    const r3 = document.getElementById('runner_3').checked;
    
    // 2. シミュレーション設定
    const SIM_COUNT = 1000;
    let winCount = 0;
    let tieCount = 0;

    // 平均的な打撃成績 (セ・リーグ平均相当)
    const PROBS = [0.16, 0.03, 0.005, 0.025, 0.09, 0.69]; 
    const CUM_PROBS = PROBS.reduce((acc, val, i) => [...acc, (acc[i-1]||0) + val], []);

    // 1試合のシミュレーション関数
    const simGame = () => {
        let curInn = inning;
        let isTop = wpIsTop;
        let curMyScore = myScore;
        let curOppScore = oppScore;
        
        let curOuts = outs;
        let runners = [r1 ? 1 : 0, r2 ? 1 : 0, r3 ? 1 : 0];

        while (curInn <= 12) {
            while (curOuts < 3) {
                if (curInn >= 9 && !isTop && curMyScore > curOppScore) return 'win';

                const r = Math.random();
                let result = 5; 
                if (r < CUM_PROBS[0]) result = 0;
                else if (r < CUM_PROBS[1]) result = 1;
                else if (r < CUM_PROBS[2]) result = 2;
                else if (r < CUM_PROBS[3]) result = 3;
                else if (r < CUM_PROBS[4]) result = 4;

                if (result === 5) {
                    curOuts++;
                } else {
                    let score = 0;
                    if (result === 3) { // HR
                        score = 1 + runners[0] + runners[1] + runners[2];
                        runners = [0, 0, 0];
                    } else if (result === 4) { // BB
                        if (runners[0] && runners[1] && runners[2]) { score++; runners=[1,1,1]; }
                        else if (runners[0] && runners[1]) runners=[1,1,1];
                        else if (runners[0]) runners=[1,1,0];
                        else runners=[1,0,0];
                    } else { // Hit
                        if (result === 0) { // 1B
                            if (runners[2]) { score++; runners[2]=0; }
                            if (runners[1]) { if (Math.random() > 0.5) { score++; runners[1]=0; } else { runners[2]=1; runners[1]=0; } }
                            if (runners[0]) { runners[1]=1; runners[0]=0; }
                            runners[0] = 1;
                        } else if (result === 1) { // 2B
                            score += runners[0] + runners[1] + runners[2];
                            runners = [0, 1, 0];
                        } else if (result === 2) { // 3B
                            score += runners[0] + runners[1] + runners[2];
                            runners = [0, 0, 1];
                        }
                    }

                    if (isTop) curOppScore += score;
                    else curMyScore += score;
                    
                    if (curInn >= 9 && !isTop && curMyScore > curOppScore) return 'win';
                }
            }

            curOuts = 0;
            runners = [0, 0, 0];

            if (isTop) {
                isTop = false;
                if (curInn >= 9 && curOppScore > curMyScore) return 'lose';
            } else {
                if (curInn >= 9) {
                    if (curMyScore > curOppScore) return 'win';
                    if (curOppScore > curMyScore) return 'lose';
                    if (curInn === 12) return 'tie';
                }
                isTop = true;
                curInn++;
            }
        }
        return 'tie';
    };

    for (let i = 0; i < SIM_COUNT; i++) {
        const res = simGame();
        if (res === 'win') winCount++;
        else if (res === 'tie') tieCount++;
    }

    const winRate = ((winCount + tieCount * 0.5) / SIM_COUNT * 100);
    
    const resEl = document.getElementById('wp_result');
    const txtEl = document.getElementById('wp_text');
    const advEl = document.getElementById('wp_advantage');
    const circle = document.getElementById('wp_circle');
    
    const offset = 552 - (552 * winRate / 100);
    circle.style.strokeDashoffset = offset;

    if (winRate >= 60) {
        circle.classList.remove('text-pink-500', 'text-slate-400', 'text-blue-500');
        circle.classList.add('text-pink-500');
        txtEl.innerText = "優勢";
        txtEl.className = "text-xs font-bold text-pink-500 mt-1";
        advEl.innerText = "有利";
        advEl.className = "font-bold text-pink-500";
    } else if (winRate <= 40) {
        circle.classList.remove('text-pink-500', 'text-slate-400', 'text-blue-500');
        circle.classList.add('text-blue-500');
        txtEl.innerText = "劣勢";
        txtEl.className = "text-xs font-bold text-blue-500 mt-1";
        advEl.innerText = "不利";
        advEl.className = "font-bold text-blue-500";
    } else {
        circle.classList.remove('text-pink-500', 'text-slate-400', 'text-blue-500');
        circle.classList.add('text-slate-400');
        txtEl.innerText = "互角";
        txtEl.className = "text-xs font-bold text-slate-500 mt-1";
        advEl.innerText = "互角";
        advEl.className = "font-bold text-slate-500";
    }

    let current = 0;
    const step = winRate / 20;
    const timer = setInterval(() => {
        current += step;
        if (current >= winRate) {
            current = winRate;
            clearInterval(timer);
        }
        resEl.innerText = current.toFixed(1) + '%';
    }, 20);
}