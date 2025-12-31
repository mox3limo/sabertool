/* js/tabs/team.js */

import { getVal, setTxt, clearAllErrors, setFieldError, showError } from '../core/utils.js';

// ==========================================
// チーム分析 (Pythagorean Expectation)
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
    const rs=getVal('t_rs'), ra=getVal('t_ra'), w=getVal('t_win'), l=getVal('t_loss'), g=w+l;
    
    const exp = 2; 
    const pyth=(rs**exp)/(rs**exp+ra**exp);
    const expectedWins = pyth * g;
    const luck = w - expectedWins;
    
    setTxt('res_pyth', pyth, 'rate'); 
    setTxt('res_luck_win', (luck>0?"+":"")+luck.toFixed(1));
    setTxt('res_rdiff', rs-ra); 
    setTxt('res_r_g', g>0?rs/g:0); 
    setTxt('res_ra_g', g>0?ra/g:0);
    
    const diffGEl = document.getElementById('res_diff_g');
    if (diffGEl) diffGEl.innerText = (g>0 ? (rs-ra)/g : 0).toFixed(2);
    
    const wlCard=document.getElementById('luck_card'), wlVal=document.getElementById('res_luck_win'), wlDesc=document.getElementById('luck_desc');
    if (wlCard && wlVal && wlDesc) {
        if (Math.abs(luck) > 3) {
            wlCard.className=`p-4 rounded-xl border flex justify-between items-center shadow-sm ${luck>0?'bg-blue-50 border-blue-200':'bg-red-50 border-red-200'}`;
            wlVal.className=`text-2xl font-black ${luck>0?'text-blue-600':'text-red-600'}`;
            wlDesc.innerText=luck>0?"LUCKY (+)":"UNLUCKY (-)";
            wlDesc.className=`text-[10px] font-bold ${luck>0?'text-blue-500':'text-red-500'}`;
        } else {
            wlCard.className="p-4 rounded-xl border flex justify-between items-center bg-white border-slate-200 shadow-sm";
            wlVal.className="text-2xl font-black text-slate-600";
            wlDesc.innerText="NEUTRAL";
            wlDesc.className="text-[10px] font-bold text-slate-400";
        }
    }
    
    const remain = 143 - g;
    const finalW = w + (remain * 0.5);
    const savings = w - l;

    if (document.getElementById('sim_500_pct')) document.getElementById('sim_500_pct').innerText = (finalW/143).toFixed(3).replace(/^0+/, '');
    const savEl = document.getElementById('sim_savings');
    if (savEl) {
        savEl.innerText = (savings>0?"+":"") + savings;
        savEl.className = `text-xl font-bold ${savings>0?'text-blue-600':savings<0?'text-red-600':'text-slate-600'}`;
    }
    if (document.getElementById('sim_final_w')) document.getElementById('sim_final_w').innerText = `${Math.round(finalW)}勝 ${143-Math.round(finalW)}敗`;
}

// ==========================================
// Lineup Simulator Logic (Drag & Drop)
// ==========================================

let lineupData = Array(9).fill(null).map((_, i) => ({ 
    name: `打者${i+1}`, obp: 0.310, slg: 0.370 
}));

const ORDER_WEIGHTS = [4.65, 4.55, 4.45, 4.35, 4.25, 4.15, 4.05, 3.95, 3.85];

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('lineup_tbody')) {
        renderLineupTable();
        calcLineupScore();
        initLineupSortable(); // ★追加: Sortable初期化
    }
});

function initLineupSortable() {
    const el = document.getElementById('lineup_tbody');
    if (!el || typeof Sortable === 'undefined') return;

    new Sortable(el, {
        animation: 150,
        handle: '.drag-handle', // ハンドル部分でのみドラッグ可能にする
        ghostClass: 'bg-indigo-50', // ドラッグ中のスタイル
        onEnd: function (evt) {
            // ドラッグ終了後、見た目の順序に合わせてデータを並べ替える
            const newOrder = [];
            const rows = el.querySelectorAll('tr');
            rows.forEach(row => {
                const index = parseInt(row.getAttribute('data-index'));
                newOrder.push(lineupData[index]);
            });
            lineupData = newOrder;
            
            // テーブル再描画（番号を振り直すため）と再計算
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
        tr.className = "border-b hover:bg-slate-50 transition bg-white";
        tr.setAttribute('data-index', i); // 元のインデックスを保持
        
        tr.innerHTML = `
            <td class="px-3 py-2 font-bold text-indigo-900 text-center bg-indigo-50 border-r border-indigo-100 cursor-move drag-handle select-none">
                <i class="fa-solid fa-grip-vertical text-slate-300 mr-2 text-[10px]"></i>${i + 1}
            </td>
            <td class="px-3 py-2"><input type="text" class="w-full bg-transparent outline-none text-slate-700 placeholder-slate-300" value="${d.name}" placeholder="選手名" onchange="updateLineupData(${i}, 'name', this.value)"></td>
            <td class="px-3 py-2"><input type="number" step="0.001" class="w-20 text-center border rounded p-1 bg-white focus:border-indigo-500 outline-none" value="${d.obp.toFixed(3)}" oninput="updateLineupData(${i}, 'obp', this.value)"></td>
            <td class="px-3 py-2"><input type="number" step="0.001" class="w-20 text-center border rounded p-1 bg-white focus:border-indigo-500 outline-none" value="${d.slg.toFixed(3)}" oninput="updateLineupData(${i}, 'slg', this.value)"></td>
            <td class="px-3 py-2 text-center text-slate-400 font-mono">${(d.obp + d.slg).toFixed(3)}</td>
            <td class="px-3 py-2 text-center">
                </td>
        `;
        tbody.appendChild(tr);
    });
}

export function updateLineupData(idx, key, val) {
    if (key === 'name') {
        lineupData[idx].name = val;
    } else {
        lineupData[idx][key] = parseFloat(val) || 0;
        // 入力中はテーブル全体を再描画せず、計算だけ更新する（フォーカス外れ防止）
        // ただしOPS表示の更新は必要
        const rows = document.getElementById('lineup_tbody').querySelectorAll('tr');
        if(rows[idx]) {
            const opsCell = rows[idx].cells[4];
            if(opsCell) opsCell.innerText = (lineupData[idx].obp + lineupData[idx].slg).toFixed(3);
        }
        calcLineupScore();
    }
}

export function calcLineupScore() {
    let totalScore = 0;
    const avgScore = 4.0;
    
    lineupData.forEach((d, i) => {
        const batterScore = (d.obp * 1.8 + d.slg);
        const weight = ORDER_WEIGHTS[i] / 4.25; 
        totalScore += batterScore * weight * 0.55;
    });

    const scoreEl = document.getElementById('sim_lineup_score');
    const diffEl = document.getElementById('sim_lineup_diff');
    const adviceEl = document.getElementById('lineup_advice');
    
    if (scoreEl) {
        const finalScore = Math.max(0, totalScore - 1.5); 
        scoreEl.innerText = finalScore.toFixed(2);
        
        const diff = finalScore - avgScore;
        if (diffEl) {
            diffEl.innerText = (diff > 0 ? "+" : "") + diff.toFixed(2);
            diffEl.className = diff > 0 ? "font-bold text-green-400" : "font-bold text-red-400";
        }
        
        if (adviceEl) {
            adviceEl.innerHTML = '';
            const no2 = lineupData[1];
            if (no2.obp < 0.330) {
                adviceEl.innerHTML += `<li><i class="fa-solid fa-triangle-exclamation text-amber-500 mr-2"></i>2番の出塁率が低めです。現代野球では最強打者を置く傾向があります。</li>`;
            }
            const no4 = lineupData[3];
            if (no4.slg < 0.400) {
                adviceEl.innerHTML += `<li><i class="fa-solid fa-circle-info text-blue-400 mr-2"></i>4番の長打力が不足気味です。</li>`;
            }
            const no1 = lineupData[0];
            if (no1.obp < 0.350) {
                adviceEl.innerHTML += `<li><i class="fa-solid fa-circle-info text-blue-400 mr-2"></i>1番はとにかく出塁率が高い選手を選びましょう。</li>`;
            }
            if (adviceEl.innerHTML === '') {
                adviceEl.innerHTML = `<li><i class="fa-solid fa-circle-check text-green-500 mr-2"></i>バランスの良い打順です。</li>`;
            }
        }
    }
}

// 以前の moveBatter 関数は削除しました（ドラッグで代用するため）
export function moveBatter(idx, dir) {} 

export function optimizeLineup(type) {
    if (type === 'obp') {
        lineupData.sort((a, b) => b.obp - a.obp);
    } else if (type === 'sabermetrics') {
        const sorted = [...lineupData].sort((a, b) => (b.obp + b.slg) - (a.obp + a.slg));
        const newOrder = Array(9).fill(null);
        newOrder[1] = sorted[0]; newOrder[3] = sorted[1]; newOrder[0] = sorted[2];
        newOrder[2] = sorted[3]; newOrder[4] = sorted[4]; newOrder[5] = sorted[5];
        newOrder[6] = sorted[6]; newOrder[7] = sorted[7]; newOrder[8] = sorted[8];
        lineupData = newOrder;
    }
    renderLineupTable();
    calcLineupScore();
    alert('打順を最適化しました。');
}

export function clearLineup() {
    if(!confirm('初期状態に戻しますか？')) return;
    lineupData = Array(9).fill(null).map((_, i) => ({ name: `打者${i+1}`, obp: 0.310, slg: 0.370 }));
    renderLineupTable();
    calcLineupScore();
}