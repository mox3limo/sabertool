/* js/tabs/prediction.js */
import { PLAYERS, DB } from '../core/data.js';

// --- 既存の予測機能（BABIPなど） ---
let seasonMode = 'batter';

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
    // (既存のコードのまま)
    try {
        const getNum = (id) => { const el = document.getElementById(id); return el ? parseFloat(el.innerText) || 0 : 0; };
        const babip = getNum('res_babip');
        const fip = getNum('res_fip');
        const nextAvg = (babip - 0.300) * 0.5 + getNum('res_avg');
        const nextEra = (fip + getNum('res_era')) / 2;

        const elNextAvg = document.getElementById('next_avg');
        const elNextEra = document.getElementById('next_era');
        if(elNextAvg) elNextAvg.innerText = nextAvg.toFixed(3).replace(/^0\./, '.');
        if(elNextEra) elNextEra.innerText = nextEra.toFixed(2);
        
        // ... (省略: 必要なら既存コードを残してください) ...
    } catch (e) { console.error(e); }
}

export function calcCareer() {
    // (既存のコードのまま)
}


// ▼▼▼ 勝利確率シミュレーター (Win Probability) ▼▼▼

let wpIsTop = false; // false=裏(自チーム攻撃), true=表(自チーム守備)

// 表裏切り替えUI
export function selectTopBottom(type) {
    const btnTop = document.getElementById('btn_top');
    const btnBot = document.getElementById('btn_bot');
    const boxMy = document.getElementById('score_box_my'); // UI強化版があれば
    const boxOpp = document.getElementById('score_box_opp');
    
    // スタイル定義 (UI強化版に対応)
    const activeBtn = "flex-1 rounded text-xs font-bold bg-white shadow-sm text-slate-700 transition border border-slate-200";
    const inactiveBtn = "flex-1 rounded text-xs font-bold text-slate-400 transition hover:bg-slate-50";

    if (type === 'top') {
        wpIsTop = true;
        if(btnTop) btnTop.className = activeBtn;
        if(btnBot) btnBot.className = inactiveBtn;
        if(boxOpp) boxOpp.classList.add('border-indigo-500', 'bg-white', 'shadow-md');
        if(boxMy) boxMy.classList.remove('border-indigo-500', 'bg-white', 'shadow-md');
    } else {
        wpIsTop = false; // 裏
        if(btnBot) btnBot.className = activeBtn;
        if(btnTop) btnTop.className = inactiveBtn;
        if(boxMy) boxMy.classList.add('border-indigo-500', 'bg-white', 'shadow-md');
        if(boxOpp) boxOpp.classList.remove('border-indigo-500', 'bg-white', 'shadow-md');
    }
}

// ★勝率計算実行 (チーム連携版)
export function calcWinProb() {
    // 1. 入力値取得
    const inning = parseInt(document.getElementById('wp_inning').value);
    const myScore = parseInt(document.getElementById('wp_my_score').value) || 0;
    const oppScore = parseInt(document.getElementById('wp_opp_score').value) || 0;
    
    let outs = 0;
    document.querySelectorAll('input[name="wp_outs"]').forEach(r => { if(r.checked) outs = parseInt(r.value); });
    const r1 = document.getElementById('runner_1').checked;
    const r2 = document.getElementById('runner_2').checked;
    const r3 = document.getElementById('runner_3').checked;

    // ★連携: チームタブのDOMからデータを取得する
    const getTeamBatterStats = (orderIndex) => {
        const tbody = document.getElementById('lineup_tbody');
        if (!tbody) return null;
        const rows = tbody.querySelectorAll('tr');
        if (rows.length <= orderIndex) return null;
        
        const inputs = rows[orderIndex].querySelectorAll('input');
        // inputs[1]=出塁率, inputs[2]=長打率
        if (inputs.length < 3) return null;

        const obp = parseFloat(inputs[1].value);
        const slg = parseFloat(inputs[2].value);
        if (isNaN(obp) || isNaN(slg)) return null;

        return { obp, slg };
    };

    // 現在の打順 (0~8)
    const currentOrder = parseInt(document.getElementById('wp_batter_order')?.value) || 0;
    // 相手投手ランク
    const pitcherRank = parseFloat(document.getElementById('wp_pitcher_rank')?.value) || 1.0;

    // 2. シミュレーション設定
    const SIM_COUNT = 1500;
    let winCount = 0;
    let tieCount = 0;
    const BASE_PROBS = [0.16, 0.03, 0.005, 0.025, 0.09, 0.69]; 

    // 確率計算ロジック
    const calcProbsFromStats = (obp, slg, pRank) => {
        // 投手ランク補正 (高いほど打てない)
        const adjObp = obp / pRank;
        const adjSlg = slg / pRank;

        const iso = Math.max(0, adjSlg - (adjObp * 0.8)); // 簡易ISO
        
        let hr = iso * 0.25;
        let bb = adjObp * 0.20; 
        let hits = adjObp - bb - hr;
        if (hits < 0) hits = 0.1;

        let h1 = hits * 0.75;
        let h2 = hits * 0.20;
        let h3 = hits * 0.05;

        let out = 1.0 - (h1 + h2 + h3 + hr + bb);
        if (out < 0) out = 0;

        const total = h1 + h2 + h3 + hr + bb + out;
        const probs = [h1, h2, h3, hr, bb, out].map(p => p / total);

        return probs.reduce((acc, val, i) => [...acc, (acc[i-1]||0) + val], []);
    };

    // 1試合シミュレーション
    const simGame = () => {
        let curInn = inning;
        let isTop = wpIsTop; // true=表, false=裏
        let curMyScore = myScore;
        let curOppScore = oppScore;
        let curOuts = outs;
        let runners = [r1 ? 1 : 0, r2 ? 1 : 0, r3 ? 1 : 0];
        
        // 打順管理
        let myBatterIndex = currentOrder; 
        let oppBatterIndex = 0; 

        while (curInn <= 12) {
            // 現在どちらの攻撃か
            // 表(isTop=true)なら相手攻撃、裏(isTop=false)なら自チーム攻撃
            // ただし「自チームが先攻(表)」の設定なら逆になるが、
            // 今回は簡易的に「ユーザーは常に後攻(裏)視点」または「自チーム攻撃=裏」とするのが一般的
            
            // wpIsTop は「シミュレーション開始時点」の状態。
            // ここではシンプルに isTop が true なら相手攻撃、false なら自チーム攻撃とする
            // (ユーザー設定がどうあれ、UI上の"表"は相手、"裏"は自分として処理)
            
            let isMyAttack = !isTop; 

            // 確率分布決定
            let cumProbs;
            if (isMyAttack) {
                const stats = getTeamBatterStats(myBatterIndex);
                if (stats) {
                    cumProbs = calcProbsFromStats(stats.obp, stats.slg, pitcherRank);
                } else {
                    cumProbs = BASE_PROBS.reduce((acc, val, i) => [...acc, (acc[i-1]||0) + val], []);
                }
            } else {
                // 相手攻撃 (平均的と仮定)
                cumProbs = BASE_PROBS.reduce((acc, val, i) => [...acc, (acc[i-1]||0) + val], []);
            }

            while (curOuts < 3) {
                // サヨナラ勝ち判定 (9回以降、裏、自チーム得点が上回った瞬間)
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

            if (isTop) { // 表終了 -> 裏へ
                isTop = false;
                // 9回表終了時点で、後攻(自チーム)が勝っていれば試合終了
                if (curInn >= 9 && curMyScore > curOppScore) return 'win'; 
                // もし表の攻撃で相手が勝ち越し、かつ9回裏がない場合(ここは簡易的に裏はあるとする)
            } else { // 裏終了 -> 次の回へ
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
    
    // 結果表示
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