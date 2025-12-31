import { state } from './state.js';

// ヘルパー：画面上の全データを収集 (内部でのみ使用するのでexportしない)
function collectAllData() {
    const data = { 
        league: state.currentLeague, // stateモジュールから取得
        batter: {}, pitcher: {}, team: {}
    };
    document.querySelectorAll('input, select').forEach(el => {
        if (el.id) {
            if (el.id.startsWith('b_') || el.id === 'batter_pf') data.batter[el.id] = el.value;
            else if (el.id.startsWith('p_')) data.pitcher[el.id] = el.value;
            else if (el.id.startsWith('t_')) data.team[el.id] = el.value;
        }
    });
    return data;
}

function getText(id) {
    return document.getElementById(id)?.innerText || '';
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// クリップボードコピー
export function copyCurrentProfileToClipboard() {
    const data = collectAllData();
    const json = JSON.stringify(data, null, 2);
    // ... (既存のコピー処理) ...
}

// エクスポート実行
export function exportData(format) {
    const data = collectAllData();
    // ... (既存のJSON/CSV生成処理) ...
    // downloadBlob(...) を呼び出し
}