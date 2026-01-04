/* js/tabs/prediction.js */
import { PLAYERS, DB } from '../core/data.js';

// シーズン予測モードの状態管理
let seasonMode = 'batter';

/**
 * 打者/投手モードの切り替え
 */
export function toggleSeasonMode(mode) {
    seasonMode = mode;
    const btnBat = document.getElementById('btn_season_bat');
    const btnPit = document.getElementById('btn_season_pit');
    const divBat = document.getElementById('season_res_bat');
    const divPit = document.getElementById('season_res_pit');

    // ボタンの見た目と表示エリアの切り替え
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
    
    // モード切替時に再計算
    calcPrediction();
}

/**
 * 予測計算のメイン関数
 * 1. 来季成績予測 (簡易版)
 * 2. シーズン終了時予測 (Pace)
 */
export function calcPrediction() {
    try {
        // --- ヘルパー関数: IDから数値を取得 ---
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? parseFloat(el.value) || 0 : 0;
        };
        const getTextNum = (id) => {
            const el = document.getElementById(id);
            if (!el) return 0;
            // ".300" などの文字列を数値に変換
            return parseFloat(el.innerText) || 0;
        };

        // ==========================================
        // 1. 来季成績予測 (簡易版) - BABIP/FIP回帰
        // ==========================================
        // 現在の指標を取得（別タブの計算結果を利用）
        const currentBabip = getTextNum('res_babip'); // 打者BABIP
        const currentAvg = getTextNum('res_avg');     // 打率
        const currentFip = getTextNum('res_fip');     // FIP
        const currentEra = getTextNum('res_era');     // 防御率

        // 予測ロジック
        // 来季打率 = (BABIP - .300)*0.5 + 現在打率 （BABIPが運の要素として平均に回帰すると仮定）
        // 実際はもっと複雑ですが、簡易版として
        const nextAvg = ((currentBabip - 0.300) * 0.5) + currentAvg;
        
        // 来季防御率 = (FIP + ERA) / 2 （FIPとERAの中間あたりに落ち着くと仮定）
        const nextEra = (currentFip + currentEra) / 2;

        // 表示更新
        const elNextAvg = document.getElementById('next_avg');
        const elNextEra = document.getElementById('next_era');
        const elCurrBabip = document.getElementById('curr_babip');
        const elLuck = document.getElementById('luck_status');

        if(elNextAvg) elNextAvg.innerText = nextAvg.toFixed(3).replace(/^0\./, '.');
        if(elNextEra) elNextEra.innerText = nextEra.toFixed(2);
        if(elCurrBabip) elCurrBabip.innerText = currentBabip.toFixed(3).replace(/^0\./, '.');

        // Luck判定 (BABIP基準)
        if(elLuck) {
            if(seasonMode === 'batter') {
                if(currentBabip > 0.330) elLuck.innerText = "幸運 (Lucky)";
                else if(currentBabip < 0.270) elLuck.innerText = "不運 (Unlucky)";
                else elLuck.innerText = "平均的 (Neutral)";
            } else {
                // 投手の場合は被BABIPを見るべきだが、簡易的にERA-FIP差で判定
                const diff = currentEra - currentFip;
                if(diff < -0.5) elLuck.innerText = "幸運 (ERA<FIP)";
                else if(diff > 0.5) elLuck.innerText = "不運 (ERA>FIP)";
                else elLuck.innerText = "実力通り";
            }
        }


        // ==========================================
        // 2. シーズン終了時予測 (Pace)
        // ==========================================
        const gamesPlayed = getVal('pred_played'); // 消化試合数
        const totalGames = getVal('pred_total');   // 全試合数 (例: 143)

        // ゼロ除算回避
        if (gamesPlayed <= 0) return;

        // ペース倍率 (残り試合も含めた最終着地倍率)
        const paceMultiplier = totalGames / gamesPlayed;

        if (seasonMode === 'batter') {
            // --- 打者ペース計算 ---
            // 入力タブから現在値を取得
            const curH = getVal('b_h');    // 安打
            const curHR = getVal('b_hr');  // 本塁打
            const curWRAA = getTextNum('res_wraa'); // wRAA (計算結果テキストから取得)

            // 最終予測値
            const projH = Math.round(curH * paceMultiplier);
            const projHR = Math.round(curHR * paceMultiplier);
            const projWRAA = (curWRAA * paceMultiplier).toFixed(1);

            // 表示
            const elProjH = document.getElementById('proj_h');
            const elProjHR = document.getElementById('proj_hr');
            const elProjWRAA = document.getElementById('proj_wraa');

            if(elProjH) elProjH.innerText = projH + " 本";
            if(elProjHR) elProjHR.innerText = projHR + " 本";
            if(elProjWRAA) elProjWRAA.innerText = projWRAA;

        } else {
            // --- 投手ペース計算 ---
            const curWin = getVal('p_w'); // 勝利
            const curK = getVal('p_k');   // 奪三振
            // 防御率は積み上げではないので、現状維持とみなす
            const curEra = getTextNum('res_era'); 

            // 最終予測値
            const projWin = Math.round(curWin * paceMultiplier);
            const projK = Math.round(curK * paceMultiplier);
            
            // 表示
            const elProjWin = document.getElementById('proj_win');
            const elProjK = document.getElementById('proj_k');
            const elProjEra = document.getElementById('proj_final_era');

            if(elProjWin) elProjWin.innerText = projWin + " 勝";
            if(elProjK) elProjK.innerText = projK + " 個";
            if(elProjEra) elProjEra.innerText = curEra.toFixed(2);
        }

        // 最後に通算記録予測も更新（ペースが変わるため）
        calcCareer();

    } catch (e) {
        console.error("calcPrediction error:", e);
    }
}

/**
 * 通算記録 到達予測シミュレーション
 */
export function calcCareer() {
    try {
        const getVal = (id) => { const el = document.getElementById(id); return el ? parseFloat(el.value) || 0 : 0; };
        
        // 入力値
        const currentAge = getVal('career_age');
        const careerH = getVal('career_h'); // 現在の通算安打
        const careerW = getVal('career_w'); // 現在の通算勝利
        const paceType = parseFloat(document.getElementById('career_pace_type').value) || 1.0; // 減衰率

        // 今季の予測最終成績を取得（これを「1年分の能力」とする）
        // ※まだ計算されていない場合やDOMが見つからない場合のガード
        let paceH = 0;
        let paceW = 0;

        const elProjH = document.getElementById('proj_h');
        const elProjW = document.getElementById('proj_win');

        if (elProjH && elProjH.innerText !== '--') {
            paceH = parseFloat(elProjH.innerText); // "150 本" -> 150
        } else {
            // 予測が出てない場合は入力値から簡易計算
            paceH = getVal('b_h') * (143 / (getVal('pred_played') || 1));
        }

        if (elProjW && elProjW.innerText !== '--') {
            paceW = parseFloat(elProjW.innerText);
        } else {
            paceW = getVal('p_w') * (143 / (getVal('pred_played') || 1));
        }

        // --- 2000本安打予測 ---
        const targetH = 2000;
        let remH = targetH - careerH;
        const elPred2000H = document.getElementById('pred_2000h');
        const elRem2000H = document.getElementById('rem_2000h');

        if (elRem2000H) elRem2000H.innerText = Math.max(0, remH);

        if (remH <= 0) {
            if(elPred2000H) elPred2000H.innerText = "達成済";
        } else if (paceH <= 5) {
            // ペースがあまりに遅い場合
            if(elPred2000H) elPred2000H.innerText = "---";
        } else {
            // シミュレーション
            let simAge = currentAge;
            let currentPace = paceH;
            let years = 0;
            
            // 最大20年後まで計算
            while (remH > 0 && years < 20) {
                remH -= currentPace;
                years++;
                simAge++;
                currentPace *= paceType; // 年々衰える
            }
            
            if (remH <= 0) {
                if(elPred2000H) elPred2000H.innerText = `${simAge} 歳`;
            } else {
                if(elPred2000H) elPred2000H.innerText = "困難";
            }
        }

        // --- 200勝予測 ---
        const targetW = 200;
        let remW = targetW - careerW;
        const elPred200W = document.getElementById('pred_200w');
        const elRem200W = document.getElementById('rem_200w');

        if (elRem200W) elRem200W.innerText = Math.max(0, remW);

        if (remW <= 0) {
            if(elPred200W) elPred200W.innerText = "達成済";
        } else if (paceW <= 1) {
             if(elPred200W) elPred200W.innerText = "---";
        } else {
            let simAge = currentAge;
            let currentPace = paceW;
            let years = 0;

            while (remW > 0 && years < 25) {
                remW -= currentPace;
                years++;
                simAge++;
                currentPace *= paceType;
            }

            if (remW <= 0) {
                if(elPred200W) elPred200W.innerText = `${simAge} 歳`;
            } else {
                if(elPred200W) elPred200W.innerText = "困難";
            }
        }

    } catch (e) {
        console.error("calcCareer error:", e);
    }
}

// ▼▼▼ 勝利確率シミュレーター (Win Probability) ▼▼▼
// ※ここは以前のコードと同じですが、ファイルを上書きするため含めておきます

let wpIsTop = false;

// 表裏切り替えUI
export function selectTopBottom(type) {
    const btnTop = document.getElementById('btn_top');
    const btnBot = document.getElementById('btn_bot');
    
    // スタイル定義
    const activeBtn = "flex-1 rounded text-xs font-bold bg-white shadow-sm text-slate-700 transition border border-slate-200";
    const inactiveBtn = "flex-1 rounded text-xs font-bold text-slate-400 transition hover:bg-slate-50";

    if (type === 'top') {
        wpIsTop = true;
        if(btnTop) btnTop.className = activeBtn;
        if(btnBot) btnBot.className = inactiveBtn;
    } else {
        wpIsTop = false; // 裏
        if(btnBot) btnBot.className = activeBtn;
        if(btnTop) btnTop.className = inactiveBtn;
    }
}

// 勝率計算実行
export function calcWinProb() {
    const inning = parseInt(document.getElementById('wp_inning').value);
    const myScore = parseInt(document.getElementById('wp_my_score').value) || 0;
    const oppScore = parseInt(document.getElementById('wp_opp_score').value) || 0;
    
    let outs = 0;
    document.querySelectorAll('input[name="wp_outs"]').forEach(r => { if(r.checked) outs = parseInt(r.value); });
    const r1 = document.getElementById('runner_1').checked;
    const r2 = document.getElementById('runner_2').checked;
    const r3 = document.getElementById('runner_3').checked;

    // チームタブ連携
    const getTeamBatterStats = (orderIndex) => {
        const tbody = document.getElementById('lineup_tbody');
        if (!tbody) return null;
        const rows = tbody.querySelectorAll('tr');
        if (rows.length <= orderIndex) return null;
        
        const inputs = rows[orderIndex].querySelectorAll('input');
        if (inputs.length < 3) return null;

        const obp = parseFloat(inputs[1].value);
        const slg = parseFloat(inputs[2].value);
        if (isNaN(obp) || isNaN(slg)) return null;

        return { obp, slg };
    };

    const currentOrder = parseInt(document.getElementById('wp_batter_order')?.value) || 0;
    const pitcherRank = 1.0; 

    const SIM_COUNT = 1500;
    let winCount = 0;
    let tieCount = 0;
    const BASE_PROBS = [0.16, 0.03, 0.005, 0.025, 0.09, 0.69]; 

    const calcProbsFromStats = (obp, slg, pRank) => {
        const adjObp = obp / pRank;
        const adjSlg = slg / pRank;
        const iso = Math.max(0, adjSlg - (adjObp * 0.8));
        let hr = iso * 0.25;
        let bb = adjObp * 0.20; 
        let hits = adjObp - bb - hr;
        if (hits < 0) hits = 0.1;
        let h1 = hits * 0.75; let h2 = hits * 0.20; let h3 = hits * 0.05;
        let out = 1.0 - (h1 + h2 + h3 + hr + bb);
        if (out < 0) out = 0;
        const total = h1 + h2 + h3 + hr + bb + out;
        const probs = [h1, h2, h3, hr, bb, out].map(p => p / total);
        return probs.reduce((acc, val, i) => [...acc, (acc[i-1]||0) + val], []);
    };

    const simGame = () => {
        let curInn = inning;
        let isTop = wpIsTop;
        let curMyScore = myScore;
        let curOppScore = oppScore;
        let curOuts = outs;
        let runners = [r1 ? 1 : 0, r2 ? 1 : 0, r3 ? 1 : 0];
        let myBatterIndex = currentOrder; 
        let oppBatterIndex = 0; 

        while (curInn <= 12) {
            let isMyAttack = !isTop; 
            let cumProbs;
            if (isMyAttack) {
                const stats = getTeamBatterStats(myBatterIndex);
                if (stats) cumProbs = calcProbsFromStats(stats.obp, stats.slg, pitcherRank);
                else cumProbs = BASE_PROBS.reduce((acc, val, i) => [...acc, (acc[i-1]||0) + val], []);
            } else {
                cumProbs = BASE_PROBS.reduce((acc, val, i) => [...acc, (acc[i-1]||0) + val], []);
            }

            while (curOuts < 3) {
                if (curInn >= 9 && !isTop && curMyScore > curOppScore) return 'win';
                const r = Math.random();
                let result = 5; 
                if (r < cumProbs[0]) result = 0;
                else if (r < cumProbs[1]) result = 1;
                else if (r < cumProbs[2]) result = 2;
                else if (r < cumProbs[3]) result = 3;
                else if (r < cumProbs[4]) result = 4;

                if (result === 5) {
                    curOuts++;
                    if(isMyAttack) myBatterIndex = (myBatterIndex + 1) % 9;
                    else oppBatterIndex = (oppBatterIndex + 1) % 9;
                } else {
                    if(isMyAttack) myBatterIndex = (myBatterIndex + 1) % 9;
                    else oppBatterIndex = (oppBatterIndex + 1) % 9;
                    let score = 0;
                    if (result === 3) { // HR
                        score = 1 + runners[0] + runners[1] + runners[2];
                        runners = [0, 0, 0];
                    } else if (result === 4) { // BB
                        if (runners[0] && runners[1] && runners[2]) { score++; runners=[1,1,1]; }
                        else if (runners[0] && runners[1]) runners=[1,1,1];
                        else if (runners[0]) runners=[1,1,0];
                        else runners=[1,0,0];
                    } else { 
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
                if (curInn >= 9 && curMyScore > curOppScore) return 'win'; 
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
    
    // UI更新
    const resEl = document.getElementById('wp_result');
    const txtEl = document.getElementById('wp_text');
    const advEl = document.getElementById('wp_advantage');
    const circle = document.getElementById('wp_circle');
    
    if(resEl) {
        let current = 0;
        const step = winRate / 20;
        const timer = setInterval(() => {
            current += step;
            if (current >= winRate) { current = winRate; clearInterval(timer); }
            resEl.innerText = current.toFixed(1) + '%';
        }, 20);
    }
    
    if(circle) {
        const offset = 552 - (552 * winRate / 100);
        circle.style.strokeDashoffset = offset;
        circle.classList.remove('text-pink-500', 'text-slate-400', 'text-blue-500');
        if (winRate >= 60) {
            circle.classList.add('text-pink-500');
            if(txtEl) { txtEl.innerText = "優勢"; txtEl.className = "text-xs font-bold text-pink-500 mt-1"; }
            if(advEl) { advEl.innerText = "有利"; advEl.className = "font-bold text-pink-500"; }
        } else if (winRate <= 40) {
            circle.classList.add('text-blue-500');
            if(txtEl) { txtEl.innerText = "劣勢"; txtEl.className = "text-xs font-bold text-blue-500 mt-1"; }
            if(advEl) { advEl.innerText = "不利"; advEl.className = "font-bold text-blue-500"; }
        } else {
            circle.classList.add('text-slate-400');
            if(txtEl) { txtEl.innerText = "互角"; txtEl.className = "text-xs font-bold text-slate-500 mt-1"; }
            if(advEl) { advEl.innerText = "互角"; advEl.className = "font-bold text-slate-500"; }
        }
    }
}