/* js/tabs/team.js */

import { getVal, setTxt, clearAllErrors, setFieldError, showError } from '../core/utils.js';
import { TEAM_PRESETS } from '../core/teams_data.js';

// ==========================================
// 1. チーム分析 (Pythagorean Expectation)
// ==========================================

export function validateTeamInput() {
    clearAllErrors();
    const errors = [];
    const w = getVal('t_win'), l = getVal('t_loss');

    if (w + l > 200) {
        errors.push('勝敗数の合計が異常に大きいです');
        setFieldError('t_win', true); setFieldError('t_loss', true);
    }
    if (errors.length > 0) {
        showError(errors.join(' / '));
        return false;
    }
    return true;
}

export function calcTeam() {
    validateTeamInput();
    const rs = getVal('t_rs'), ra = getVal('t_ra'), w = getVal('t_win'), l = getVal('t_loss'), g = w + l;

    const exp = 2;
    const pyth = (rs ** exp) / (rs ** exp + ra ** exp);
    const expectedWins = pyth * g;
    const luck = w - expectedWins;

    setTxt('res_pyth', pyth, 'rate');
    setTxt('res_luck_win', (luck > 0 ? "+" : "") + luck.toFixed(1));
    setTxt('res_rdiff', rs - ra);
    setTxt('res_r_g', g > 0 ? rs / g : 0);
    setTxt('res_ra_g', g > 0 ? ra / g : 0);

    const diffGEl = document.getElementById('res_diff_g');
    if (diffGEl) diffGEl.innerText = (g > 0 ? (rs - ra) / g : 0).toFixed(2);

    const wlCard = document.getElementById('luck_card'), wlVal = document.getElementById('res_luck_win'), wlDesc = document.getElementById('luck_desc');
    if (wlCard && wlVal && wlDesc) {
        if (Math.abs(luck) > 3) {
            wlCard.className = `p-4 rounded-xl border flex justify-between items-center shadow-sm ${luck > 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`;
            wlVal.className = `text-2xl font-black ${luck > 0 ? 'text-blue-600' : 'text-red-600'}`;
            wlDesc.innerText = luck > 0 ? "LUCKY (+)" : "UNLUCKY (-)";
            wlDesc.className = `text-[10px] font-bold ${luck > 0 ? 'text-blue-500' : 'text-red-500'}`;
        } else {
            wlCard.className = "p-4 rounded-xl border flex justify-between items-center bg-white border-slate-200 shadow-sm";
            wlVal.className = "text-2xl font-black text-slate-600";
            wlDesc.innerText = "NEUTRAL";
            wlDesc.className = "text-[10px] font-bold text-slate-400";
        }
    }

    const remain = 143 - g;
    const finalW = w + (remain * 0.5);
    const savings = w - l;

    if (document.getElementById('sim_500_pct')) document.getElementById('sim_500_pct').innerText = (finalW / 143).toFixed(3).replace(/^0+/, '');
    const savEl = document.getElementById('sim_savings');
    if (savEl) {
        savEl.innerText = (savings > 0 ? "+" : "") + savings;
        savEl.className = `text-xl font-bold ${savings > 0 ? 'text-blue-600' : savings < 0 ? 'text-red-600' : 'text-slate-600'}`;
    }
    if (document.getElementById('sim_final_w')) document.getElementById('sim_final_w').innerText = `${Math.round(finalW)}勝 ${143 - Math.round(finalW)}敗`;
}

// ==========================================
// 2. Lineup Simulator Logic (State & Drag-Drop)
// ==========================================

let lineupData = Array(9).fill(null).map((_, i) => ({
    name: `打者${i + 1}`, obp: 0.310, slg: 0.370
}));

const ORDER_WEIGHTS = [4.65, 4.55, 4.45, 4.35, 4.25, 4.15, 4.05, 3.95, 3.85];

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('lineup_tbody')) {
        renderLineupTable();
        calcLineupScore();
        initLineupSortable();
    }
});

function initLineupSortable() {
    const el = document.getElementById('lineup_tbody');
    if (!el || typeof Sortable === 'undefined') return;

    new Sortable(el, {
        animation: 150,
        handle: '.drag-handle',
        ghostClass: 'bg-indigo-50',
        onEnd: function (evt) {
            const newOrder = [];
            const rows = el.querySelectorAll('tr');
            rows.forEach(row => {
                const index = parseInt(row.getAttribute('data-index'));
                newOrder.push(lineupData[index]);
            });
            lineupData = newOrder;
            renderLineupTable();
            calcLineupScore();
        }
    });
}

function renderLineupTable() {
    const tbody = document.getElementById('lineup_tbody');
    if (!tbody) return;

    tbody.innerHTML = '';

    lineupData.forEach((d, i) => {
        const tr = document.createElement('tr');
        tr.className = "border-b border-slate-100 last:border-0 hover:bg-slate-50 transition bg-white group";
        tr.setAttribute('data-index', i);

        const ops = (d.obp + d.slg).toFixed(3);
        let opsClass = "text-slate-400";
        if ((d.obp + d.slg) >= 0.9) opsClass = "text-pink-500";
        else if ((d.obp + d.slg) >= 0.8) opsClass = "text-orange-500";
        else if ((d.obp + d.slg) >= 0.7) opsClass = "text-indigo-500";

        tr.innerHTML = `
            <td class="px-3 py-2 font-bold text-indigo-900 text-center bg-indigo-50 border-r border-indigo-100 cursor-move drag-handle select-none w-10">
                <i class="fa-solid fa-grip-vertical text-slate-300 mr-2 text-[10px]"></i>${i + 1}
            </td>
            <td class="px-3 py-2">
                <input type="text" class="w-full bg-transparent outline-none text-slate-700 placeholder-slate-300 font-bold" 
                    value="${d.name}" placeholder="選手名" onchange="window.updateLineupData(${i}, 'name', this.value)">
            </td>
            <td class="px-3 py-2 w-24">
                <input type="number" step="0.001" class="w-full text-center border rounded p-1 bg-white focus:border-indigo-500 outline-none font-bold text-indigo-600" 
                    value="${d.obp.toFixed(3)}" oninput="window.updateLineupData(${i}, 'obp', this.value)">
            </td>
            <td class="px-3 py-2 w-24">
                <input type="number" step="0.001" class="w-full text-center border rounded p-1 bg-white focus:border-indigo-500 outline-none font-bold text-indigo-600" 
                    value="${d.slg.toFixed(3)}" oninput="window.updateLineupData(${i}, 'slg', this.value)">
            </td>
            <td class="px-3 py-2 text-center font-mono font-black ${opsClass} ops-cell">
                ${ops}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// データの更新
export function updateLineupData(idx, key, val) {
    if (key === 'name') {
        lineupData[idx].name = val;
    } else {
        lineupData[idx][key] = parseFloat(val) || 0;
        // OPSセルの見た目だけ即時更新
        const rows = document.getElementById('lineup_tbody').querySelectorAll('tr');
        if (rows[idx]) {
            const opsCell = rows[idx].querySelector('.ops-cell');
            const ops = lineupData[idx].obp + lineupData[idx].slg;
            if (opsCell) {
                opsCell.innerText = ops.toFixed(3);
                if (ops >= 0.9) opsCell.className = "px-3 py-2 text-center font-mono font-black text-pink-500 ops-cell";
                else if (ops >= 0.8) opsCell.className = "px-3 py-2 text-center font-mono font-black text-orange-500 ops-cell";
                else if (ops >= 0.7) opsCell.className = "px-3 py-2 text-center font-mono font-black text-indigo-500 ops-cell";
                else opsCell.className = "px-3 py-2 text-center font-mono font-black text-slate-400 ops-cell";
            }
        }
        calcLineupScore();
    }
}
window.updateLineupData = updateLineupData;

// 予想得点計算ロジック
export function calcLineupScore() {
    let totalScore = 0;

    lineupData.forEach((d, i) => {
        const batterScore = (d.obp * 1.8 + d.slg);
        const weight = ORDER_WEIGHTS[i] / 4.25;
        totalScore += batterScore * weight * 0.55;
    });

    const scoreEl = document.getElementById('sim_lineup_score');
    const bigScoreEl = document.getElementById('estimated_runs') || document.querySelector('.text-5xl.font-black.text-yellow-400');

    let diffEl = document.getElementById('sim_lineup_diff');
    if (!diffEl && bigScoreEl) {
        diffEl = bigScoreEl.nextElementSibling;
        if (diffEl) diffEl.id = 'sim_lineup_diff';
    }

    const adviceEl = document.getElementById('lineup_advice');

    if (bigScoreEl || scoreEl) {
        const finalScore = Math.max(0, totalScore - 1.5) * 1.8;

        if (scoreEl) scoreEl.innerText = finalScore.toFixed(2);
        if (bigScoreEl) bigScoreEl.innerText = finalScore.toFixed(2);

        const diff = finalScore - 3.50; // 平均3.5点と仮定
        if (diffEl) {
            diffEl.innerText = (diff > 0 ? "+" : "") + diff.toFixed(2);
            diffEl.className = diff > 0 ? "text-xs font-bold text-green-400 mt-1" : "text-xs font-bold text-red-400 mt-1";
        }

        if (adviceEl) {
            adviceEl.innerHTML = '';
            const no2 = lineupData[1];
            if (no2.obp < 0.330) adviceEl.innerHTML += `<li><i class="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>2番の出塁率が低めです。</li>`;
            const no4 = lineupData[3];
            if (no4.slg < 0.400) adviceEl.innerHTML += `<li><i class="fa-solid fa-circle-info text-blue-400 mr-2"></i>4番の長打力が不足気味です。</li>`;
            const no1 = lineupData[0];
            if (no1.obp < 0.350) adviceEl.innerHTML += `<li><i class="fa-solid fa-circle-info text-blue-400 mr-2"></i>1番は出塁率重視で選びましょう。</li>`;

            if (adviceEl.innerHTML === '') {
                adviceEl.innerHTML = `<li><i class="fa-solid fa-circle-check text-green-500 mr-2"></i>バランスの良い打順です。</li>`;
            }
        }
    }
}
window.calcLineupScore = calcLineupScore;

// プリセット読込
export function loadTeamPreset(teamKey) {
    const data = TEAM_PRESETS[teamKey];
    if (!data) return;

    data.players.forEach((player, index) => {
        if (index < 9) {
            lineupData[index].name = player.name;
            lineupData[index].obp = player.obp;
            lineupData[index].slg = player.slg;
        }
    });

    renderLineupTable();
    calcLineupScore();
}
window.loadTeamPreset = loadTeamPreset;

// 並び替え機能
export function optimizeLineup(type) {
    if (type === 'obp') {
        lineupData.sort((a, b) => b.obp - a.obp);
    } else if (type === 'sabermetrics') {
        const sorted = [...lineupData].sort((a, b) => (b.obp + b.slg) - (a.obp + a.slg));
        const newOrder = Array(9).fill(null);
        newOrder[3] = sorted[0]; newOrder[1] = sorted[1]; newOrder[2] = sorted[2];
        newOrder[0] = sorted[3]; newOrder[4] = sorted[4]; newOrder[5] = sorted[5];
        newOrder[6] = sorted[6]; newOrder[7] = sorted[7]; newOrder[8] = sorted[8];
        lineupData = newOrder.map(d => d || sorted[8]);
    }
    renderLineupTable();
    calcLineupScore();
    alert('打順を最適化しました。');
}
window.optimizeLineup = optimizeLineup;

export function clearLineup() {
    if (!confirm('初期状態に戻しますか？')) return;
    lineupData = Array(9).fill(null).map((_, i) => ({ name: `打者${i + 1}`, obp: 0.310, slg: 0.370 }));
    renderLineupTable();
    calcLineupScore();
}
window.clearLineup = clearLineup;

export function moveBatter(idx, dir) { }
window.moveBatter = moveBatter;

// ==========================================
// 3. Monte Carlo Simulation (Chart.js)
// ==========================================

let simChartInstance = null;

// シミュレーション実行関数
export function runLineupSimulation() {
    const games = 1000;
    const scores = {};
    let totalScore = 0;
    let wins = 0;

    const players = lineupData.map(d => {
        const estAvg = Math.max(0.150, d.obp - 0.060);
        const estIso = Math.max(0, d.slg - estAvg);
        const probBB = d.obp - estAvg;
        const probHit = estAvg;
        const probOut = 1 - d.obp;
        const hrRatio = Math.min(0.25, estIso * 0.8);
        const twoBaseRatio = Math.min(0.30, estIso * 1.0);

        return {
            probOut: probOut,
            probBB: probOut + probBB,
            prob1B: probOut + probBB + (probHit * (1 - hrRatio - twoBaseRatio)),
            prob2B: probOut + probBB + (probHit * (1 - hrRatio)),
        };
    });

    for (let g = 0; g < games; g++) {
        let gameScore = 0;
        let currentBatter = 0;
        for (let inning = 1; inning <= 9; inning++) {
            let outs = 0;
            let bases = [0, 0, 0];
            while (outs < 3) {
                const p = players[currentBatter];
                const roll = Math.random();
                if (roll < p.probOut) {
                    outs++;
                } else if (roll < p.probBB) {
                    if (bases[0]) { if (bases[1]) { if (bases[2]) { gameScore++; } bases[2] = 1; } bases[1] = 1; } bases[0] = 1;
                } else {
                    let hitScore = 0;
                    if (roll < p.prob1B) {
                        hitScore += bases[2];
                        if (bases[1]) { if (Math.random() > 0.4) { hitScore++; bases[1] = 0; } else { bases[2] = 1; bases[1] = 0; } }
                        bases[2] = bases[1]; if (bases[0]) bases[1] = 1; bases[0] = 1;
                    } else if (roll < p.prob2B) {
                        hitScore += bases[2] + bases[1]; if (bases[0]) { hitScore++; bases[0] = 0; }
                        bases[2] = 0; bases[1] = 1; bases[0] = 0;
                    } else {
                        hitScore += bases[0] + bases[1] + bases[2] + 1;
                        bases = [0, 0, 0];
                    }
                    gameScore += hitScore;
                }
                currentBatter = (currentBatter + 1) % 9;
            }
        }
        scores[gameScore] = (scores[gameScore] || 0) + 1;
        totalScore += gameScore;
        if (gameScore >= 4) wins++;
    }

    const avgScore = (totalScore / games).toFixed(2);
    const winRate = ((wins / games) * 100).toFixed(1);

    const avgEl = document.getElementById('sim_avg_score');
    if (avgEl) avgEl.innerText = avgScore;

    const winRateEl = document.getElementById('sim_win_rate');
    if (winRateEl) winRateEl.innerText = winRate;

    if (!avgEl) {
        const fallbackEl = document.querySelector('.text-xs.text-slate-500.mt-2');
        if (fallbackEl) fallbackEl.innerHTML = `平均: <b>${avgScore}</b>点　勝率(vs 3.5点): <b>${winRate}%</b>`;
    }

    drawSimChart(scores, games);

    const btn = document.querySelector('button[onclick="runLineupSimulation()"]');
    if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i>完了';
        setTimeout(() => btn.innerHTML = originalText, 1500);
    }
}
window.runLineupSimulation = runLineupSimulation;

function drawSimChart(scores, games) {
    let ctx = document.getElementById('simChart');

    if (!ctx) {
        const headers = Array.from(document.querySelectorAll('h3, div')).find(el => el.innerText && el.innerText.includes('得点力シミュレーション'));
        if (headers) {
            const container = headers.parentElement.querySelector('.bg-slate-50') || headers.parentElement;
            let graphDiv = container.querySelector('#sim_graph_container');
            if (!graphDiv) {
                graphDiv = document.createElement('div');
                graphDiv.id = 'sim_graph_container';
                graphDiv.style.height = '160px';
                graphDiv.style.marginTop = '10px';
                container.appendChild(graphDiv);
            }
            graphDiv.innerHTML = '<canvas id="simChart"></canvas>';
            ctx = document.getElementById('simChart');
        } else {
            return;
        }
    }

    const labels = [];
    const data = [];
    for (let i = 0; i <= 10; i++) {
        labels.push(i + '点');
        data.push(((scores[i] || 0) / games * 100).toFixed(1));
    }
    let over10 = 0;
    Object.keys(scores).forEach(s => { if (parseInt(s) > 10) over10 += scores[s]; });
    labels.push('11+');
    data.push((over10 / games * 100).toFixed(1));

    if (simChartInstance) simChartInstance.destroy();

    if (typeof Chart === 'undefined') {
        alert("Chart.jsライブラリが見つかりません。シミュレーション結果は平均点のみ表示されます。");
        return;
    }

    simChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '確率 (%)',
                data: data,
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, display: false },
                x: { grid: { display: false }, ticks: { font: { size: 10 } } }
            }
        }
    });
}