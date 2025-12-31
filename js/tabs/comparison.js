/* js/tabs/comparison.js */
import { DB, PLAYERS } from '../core/data.js';
import { drawRadar } from '../core/charts.js';
import { state } from '../modules/state.js';

let currentCompMode = 'batter';

// 初期描画関数
export function initComparisonChart() {
    try {
        const getNum = (id) => { const el = document.getElementById(id); return el ? parseFloat(el.innerText) || 0 : 0; };
        
        let u;
        if (currentCompMode === 'batter') {
            u = { ops: getNum('res_ops'), avg: getNum('res_avg'), slg: getNum('res_slg'), obp: getNum('res_obp') };
        } else {
            u = { era: getNum('res_era'), fip: getNum('res_fip'), k9: getNum('res_k9'), bb9: getNum('res_bb9'), whip: getNum('res_whip') };
        }

        const currentLg = (state && typeof state.currentLeague === 'string') ? state.currentLeague : 'Central';
        const lgDB = DB[currentLg] || DB['Central'];
        const lgData = (lgDB && lgDB[currentCompMode==='batter'?'bat':'pit']) || {};
        
        if(typeof drawRadar === 'function') {
            drawRadar(u, { name: '比較なし', data: {} }, lgData, currentCompMode);
        }
    } catch (e) {
        console.error("Chart init failed:", e);
    }
}

export function toggleCompMode(m) { 
    currentCompMode = m; 
    const bB=document.getElementById('btn_comp_bat'), bP=document.getElementById('btn_comp_pit');
    if (bB && bP) {
        if(m==='batter') { 
            bB.className="flex-1 py-2 text-xs font-bold rounded bg-white shadow-sm text-purple-600 transition"; 
            bP.className="flex-1 py-2 text-xs font-bold rounded text-slate-400 transition"; 
        } else { 
            bP.className="flex-1 py-2 text-xs font-bold rounded bg-white shadow-sm text-purple-600 transition"; 
            bB.className="flex-1 py-2 text-xs font-bold rounded text-slate-400 transition"; 
        }
    }
    initComparisonChart();
}

export function findSimilarPlayer() {
    try {
        const mode = currentCompMode;
        const card = document.getElementById('sim_result_card');
        const getNum = (id) => { const el = document.getElementById(id); return el ? parseFloat(el.innerText) || 0 : 0; };

        let u;
        if (mode === 'batter') {
            u = { ops: getNum('res_ops'), avg: getNum('res_avg'), slg: getNum('res_slg'), obp: getNum('res_obp') };
        } else {
            u = { era: getNum('res_era'), fip: getNum('res_fip'), k9: getNum('res_k9'), bb9: getNum('res_bb9'), whip: getNum('res_whip') };
        }

        let db = mode === 'batter' ? PLAYERS.filter(p => typeof p.ops !== 'undefined') : PLAYERS.filter(p => typeof p.era !== 'undefined');
        if (!db || db.length === 0) db = PLAYERS.slice(); 

        const norm = (v, min, max, invert) => {
            if (!isFinite(v)) return 0.5;
            let n = (v - min) / (max - min);
            n = Math.max(0, Math.min(1, n));
            return invert ? 1 - n : n;
        };

        const metricDefs = {
            ops: { min: 0.5, max: 1.0, inv: false },
            avg: { min: 0.20, max: 0.35, inv: false },
            slg: { min: 0.30, max: 0.60, inv: false },
            isop: { min: 0.03, max: 0.30, inv: false },
            bbk: { min: 0.2, max: 1.2, inv: false },
            era: { min: 1.0, max: 5.0, inv: true },
            fip: { min: 1.0, max: 5.0, inv: true },
            k9: { min: 4.0, max: 12.0, inv: false },
            bb9: { min: 0.5, max: 4.0, inv: true },
            whip: { min: 0.7, max: 1.6, inv: true }
        };

        const metrics = [];
        const syncWithRadar = document.getElementById('sim_sync_with_radar')?.checked;
        
        if (syncWithRadar) {
            if (mode === 'batter') metrics.push('avg','ops','slg','isop','bbk');
            else metrics.push('era','fip','k9','bb9','whip');
        } else {
            if (mode === 'batter') metrics.push('ops','avg','slg'); 
            else metrics.push('era','fip','k9');
            
            if (document.getElementById('sim_include_isop')?.checked) metrics.push('isop');
            if (document.getElementById('sim_include_bbk')?.checked) metrics.push('bbk');
            if (document.getElementById('sim_include_bb9')?.checked) metrics.push('bb9');
            if (document.getElementById('sim_include_whip')?.checked) metrics.push('whip');
        }

        const matches = [];
        db.forEach(p => {
            const uVec = [], pVec = [];
            metrics.forEach(m => {
                let mKey = m === 'ops' ? 'ops' : m; 
                const def = metricDefs[mKey] || metricDefs[m];
                if (!def) return;
                
                let uVal = u[m] !== undefined ? u[m] : (m === 'isop' ? ((u.slg||0)-(u.avg||0)) : 0);
                let pVal = p[m] !== undefined ? p[m] : (m === 'isop' ? ((p.slg||0)-(p.avg||0)) : 0);
                
                uVec.push(norm(uVal, def.min, def.max, def.inv));
                pVec.push(norm(pVal, def.min, def.max, def.inv));
            });

            let sum = 0;
            for (let i = 0; i < uVec.length; i++) {
                const mKey = metrics[i] === 'ops' ? 'ops' : metrics[i];
                let w = 1;
                try { const el = document.getElementById('weight_' + mKey); if (el) w = parseFloat(el.value) || 1; } catch(e) {}
                sum += (w * Math.pow(uVec[i] - pVec[i], 2));
            }
            const dist = Math.sqrt(sum);
            const maxDist = Math.sqrt(uVec.length); 
            const simPct = Math.max(0, (1 - dist / maxDist) * 100);
            matches.push({ player: p, sim: simPct });
        });

        if (matches.length === 0) { alert('類似選手が見つかりませんでした'); return; }

        matches.sort((a,b) => b.sim - a.sim);
        const topMatches = matches.slice(0, 8);
        window.lastSimMatches = topMatches;
        window.lastSimMode = mode;

        const primary = topMatches[0];
        if (card) card.style.display = 'block';
        document.getElementById('sim_name').innerText = primary.player.name || '--';
        document.getElementById('sim_team').innerText = primary.player.team || '--';
        document.getElementById('sim_type').innerText = `タイプ: ${primary.player.type || '--'}`;
        document.getElementById('sim_score').innerText = primary.sim.toFixed(1) + '%';

        const listEl = document.getElementById('sim_list');
        if (listEl) {
            listEl.innerHTML = '';
            topMatches.forEach((it, idx) => {
                const li = document.createElement('li');
                // ★修正: リストのデザイン調整と、Infoボタンの追加
                li.className = 'flex items-center justify-between p-2 border-b last:border-b-0 hover:bg-slate-50 transition rounded';
                li.innerHTML = `
                    <div class="flex-1 cursor-pointer" onclick="openPlayerDetailModal(${idx})">
                        <div class="font-bold text-slate-700 text-sm">${it.player.name}</div>
                        <div class="text-xs text-slate-400">${it.player.team || ''}</div>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="text-sm font-bold text-indigo-900">${it.sim.toFixed(1)}%</div>
                        <button onclick="openPlayerDetailModal(${idx})" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition" title="詳細データを見る">
                            <i class="fa-solid fa-circle-info text-lg"></i>
                        </button>
                        <button onclick="selectSimilar(${idx})" class="text-xs px-3 py-1.5 rounded bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm transition">
                            選択
                        </button>
                    </div>`;
                listEl.appendChild(li);
            });
        }

        const winProbEl = document.getElementById('match_win_prob');
        const outcomeEl = document.getElementById('match_outcome');
        if (winProbEl && outcomeEl) {
            let prob = 0.5;
            if (mode === 'batter') {
                const z = (u.ops - 0.72) / 0.08;
                prob = 1 / (1 + Math.exp(-z));
            } else {
                const z = (4.2 - u.fip) / 0.6;
                prob = 1 / (1 + Math.exp(-z));
            }
            let winPct = Math.round(Math.max(1, Math.min(99, prob * 100)));
            winProbEl.innerText = winPct + '%';
            outcomeEl.innerText = winPct >= 60 ? `有利（勝率 ${winPct}%）` : winPct <= 40 ? `不利（勝率 ${winPct}%）` : `互角（勝率 ${winPct}%）`;
            const mCard = document.getElementById('matchup_card');
            if (mCard) mCard.classList.remove('hidden');
        }

        if(typeof drawRadar === 'function') {
            const currentLg = (state && typeof state.currentLeague === 'string') ? state.currentLeague : 'Central';
            const lgDB = DB[currentLg] || DB['Central'];
            const lgData = (lgDB && lgDB[mode==='batter'?'bat':'pit']) || {};
            drawRadar(u, primary.player, lgData, mode);
        }
    } catch(e) {
        console.error("Find Similar Failed:", e);
    }
}

export function selectSimilar(idx) {
    try {
        const arr = window.lastSimMatches || [];
        const mode = window.lastSimMode || currentCompMode;
        if (!arr[idx]) return;
        const sel = arr[idx].player;
        
        document.getElementById('sim_name').innerText = sel.name || '--';
        document.getElementById('sim_team').innerText = sel.team || '--';
        document.getElementById('sim_type').innerText = `タイプ: ${sel.type || '--'}`;
        document.getElementById('sim_score').innerText = (arr[idx].sim||0).toFixed(1) + '%';
        
        const getNum = (id) => { const el = document.getElementById(id); return el ? parseFloat(el.innerText) || 0 : 0; };
        let u;
        if (mode === 'batter') u = { ops: getNum('res_ops'), avg: getNum('res_avg'), slg: getNum('res_slg'), obp: getNum('res_obp') };
        else u = { era: getNum('res_era'), fip: getNum('res_fip'), k9: getNum('res_k9'), bb9: getNum('res_bb9'), whip: getNum('res_whip') };
        
        if(typeof drawRadar === 'function') {
            const currentLg = (state && typeof state.currentLeague === 'string') ? state.currentLeague : 'Central';
            const lgDB = DB[currentLg] || DB['Central'];
            const lgData = (lgDB && lgDB[mode==='batter'?'bat':'pit']) || {};
            drawRadar(u, sel, lgData, mode);
        }
    } catch(e) { console.error(e); }
}

// ★追加: 詳細モーダルを開く関数
export function openPlayerDetailModal(idx) {
    const match = window.lastSimMatches && window.lastSimMatches[idx];
    if (!match) return;
    const p = match.player;
    const mode = window.lastSimMode || currentCompMode;

    document.getElementById('pd_name').innerText = p.name || 'Unknown';
    document.getElementById('pd_team').innerText = p.team || '所属なし';
    document.getElementById('pd_type').innerText = p.type || (mode === 'batter' ? '打者' : '投手');

    const container = document.getElementById('pd_stats_container');
    container.innerHTML = '';

    // データ項目生成ヘルパー
    const createItem = (label, val, unit='') => `
        <div class="p-2 bg-white rounded-lg shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <div class="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">${label}</div>
            <div class="text-xl font-black text-slate-700">${val}<span class="text-xs font-normal text-slate-400 ml-0.5">${unit}</span></div>
        </div>`;

    let html = '';
    if (mode === 'batter') {
        html += createItem('打率', p.avg ? p.avg.toFixed(3).replace(/^0\./, '.') : '---');
        html += createItem('OPS', p.ops ? p.ops.toFixed(3) : '---');
        html += createItem('出塁率', p.obp ? p.obp.toFixed(3).replace(/^0\./, '.') : '---');
        html += createItem('長打率', p.slg ? p.slg.toFixed(3).replace(/^0\./, '.') : '---');
        html += createItem('BB/K', p.bbk ? p.bbk.toFixed(2) : '---');
        // 保存データにHRがあれば表示（なければハイフン）
        html += createItem('本塁打', p.hr !== undefined ? p.hr : '---', '本'); 
    } else {
        html += createItem('防御率', p.era ? p.era.toFixed(2) : '---');
        html += createItem('FIP', p.fip ? p.fip.toFixed(2) : '---');
        html += createItem('WHIP', p.whip ? p.whip.toFixed(2) : '---');
        html += createItem('K/9', p.k9 ? p.k9.toFixed(1) : '---');
        html += createItem('BB/9', p.bb9 ? p.bb9.toFixed(1) : '---');
        html += createItem('奪三振', p.k !== undefined ? p.k : '---', '個');
    }
    container.innerHTML = html;

    const modal = document.getElementById('player_detail_modal');
    modal.classList.remove('hidden');
}

export function closePlayerDetailModal() {
    document.getElementById('player_detail_modal').classList.add('hidden');
}