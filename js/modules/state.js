/* js/modules/state.js */

// 状態を保持するオブジェクト
export const state = {
    currentLeague: 'Central'
};

// リーグを設定する関数
export function setLeague(lg) {
    // 安全装置: 不正な値が来た場合はCentralにリセット
    if (typeof lg !== 'string' || (lg !== 'Central' && lg !== 'Pacific')) {
        console.warn('Invalid league data detected, resetting to Central:', lg);
        lg = 'Central';
    }

    state.currentLeague = lg;

    // UIの更新
    const btnCl = document.getElementById('btn_league_cl');
    const btnPl = document.getElementById('btn_league_pl');

    if (btnCl && btnPl) {
        if (lg === 'Central') {
            btnCl.className = "px-4 py-1.5 text-xs font-bold rounded-md bg-slate-100 text-slate-800 shadow-sm transition-colors";
            btnPl.className = "px-4 py-1.5 text-xs font-bold rounded-md text-slate-400 hover:text-slate-600 transition-colors";
        } else {
            btnPl.className = "px-4 py-1.5 text-xs font-bold rounded-md bg-slate-100 text-slate-800 shadow-sm transition-colors";
            btnCl.className = "px-4 py-1.5 text-xs font-bold rounded-md text-slate-400 hover:text-slate-600 transition-colors";
        }
    }

    // 関連する計算を更新
    if (typeof window.calcBatter === 'function') window.calcBatter();
    if (typeof window.calcPitcher === 'function') window.calcPitcher();
    if (typeof window.initComparisonChart === 'function') window.initComparisonChart();
}