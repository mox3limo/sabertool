/* js/core/charts.js */
import { DB } from './data.js';
import { state } from '../modules/state.js';

// グローバル変数として定義
window.myChart = null;

// ヘルパー
export function downloadDataUrl(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

// PNG保存
export function exportChartPNG(canvasId) {
    const c = document.getElementById(canvasId);
    if (!c) { alert('チャートが見つかりません: ' + canvasId); return; }
    try {
        const scale = Math.min(4, Math.max(2, (window.devicePixelRatio || 1) * 2));
        const tmp = document.createElement('canvas');
        tmp.width = Math.ceil((c.width || c.offsetWidth) * scale);
        tmp.height = Math.ceil((c.height || c.offsetHeight) * scale);
        const ctx = tmp.getContext('2d');

        const isDark = document.body.classList.contains('dark');
        ctx.fillStyle = isDark ? '#1e293b' : '#ffffff';
        ctx.fillRect(0, 0, tmp.width, tmp.height);

        ctx.drawImage(c, 0, 0, tmp.width, tmp.height);
        const data = tmp.toDataURL('image/png');
        downloadDataUrl(data, `${canvasId}_${new Date().toISOString().split('T')[0]}.png`);
    } catch (e) {
        alert('チャートのエクスポートに失敗しました: ' + (e && e.message ? e.message : e));
    }
}

export function exportAllChartsPNG() {
    if (document.getElementById('radarChart')) {
        exportChartPNG('radarChart');
    } else {
        alert('エクスポート可能なチャートが見つかりません');
    }
}

export function updateChartTheme(isDark) {
    if (!window.myChart) return;

    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? '#475569' : '#e2e8f0';
    const backdropColor = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)';

    const opts = window.myChart.options;

    if (opts.scales && opts.scales.r) {
        opts.scales.r.grid.color = gridColor;
        opts.scales.r.angleLines.color = gridColor;
        opts.scales.r.pointLabels.color = textColor;
        opts.scales.r.ticks.backdropColor = backdropColor;
        opts.scales.r.ticks.color = isDark ? '#94a3b8' : '#64748b';
    }

    if (opts.plugins && opts.plugins.legend) {
        opts.plugins.legend.labels.color = textColor;
    }

    window.myChart.update();
}

export function drawRadar(u, m, avg, mode) {
    const ctxEl = document.getElementById('radarChart');
    if (!ctxEl) return;
    const ctx = ctxEl.getContext('2d');

    // 既存のチャートがあれば破棄
    if (window.myChart) window.myChart.destroy();

    const isDark = document.body.classList.contains('dark');
    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? '#475569' : '#e2e8f0';
    const backdropColor = isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)';

    let uVals, mVals, aVals, labels;
    const getNum = (id) => { const el = document.getElementById(id); return el ? parseFloat(el.innerText) || 0 : 0; };

    const lgName = (state && state.currentLeague) || 'Central';
    const lgDataRaw = avg || (DB[lgName] ? DB[lgName][mode === 'batter' ? 'bat' : 'pit'] : {});

    if (mode === 'batter') {
        labels = ['AVG', 'OBP', 'SLG', 'IsoP', 'BB/K'];
        const norm = (v, min, max) => Math.max(0, Math.min(100, (v - min) / (max - min) * 100));
        const uFull = { avg: getNum('res_avg'), obp: getNum('res_obp'), slg: getNum('res_slg'), isop: getNum('res_isop'), bbk: getNum('res_bbk_bat') };

        const map = (d) => [
            norm(d.avg || 0, .2, .35),
            norm(d.obp || 0, .25, .45),
            norm(d.slg || 0, .3, .6),
            norm(d.isop || ((d.slg || 0) - (d.avg || 0)), .05, .3),
            norm(d.bbk || 0, 0.2, 1.2)
        ];

        uVals = map(uFull);
        try { mVals = map(m); } catch (e) { mVals = map({}); }
        try { aVals = map(lgDataRaw); } catch (e) { aVals = map({}); }

    } else {
        labels = ['ERA', 'FIP', 'K/9', 'BB/9', 'WHIP'];
        const norm = (v, min, max, inv) => Math.max(0, Math.min(100, inv ? (1 - (v - min) / (max - min)) * 100 : (v - min) / (max - min) * 100));
        const uFull = { era: getNum('res_era'), fip: getNum('res_fip'), k9: getNum('res_k9'), bb9: getNum('res_bb9'), whip: getNum('res_whip') };

        const map = (d) => [
            norm(d.era, 1.0, 5.0, true),
            norm(d.fip, 1.0, 5.0, true),
            norm(d.k9, 4, 12, false),
            norm(d.bb9, 1, 5, true),
            norm(d.whip, 0.8, 1.6, true)
        ];

        uVals = map(uFull);
        try { mVals = map(m); } catch (e) { mVals = map({}); }
        try { aVals = map(lgDataRaw); } catch (e) { aVals = map({}); }
    }

    // window.myChart に代入
    window.myChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [
                { label: 'あなた', data: uVals, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.2)' },
                { label: m.name, data: mVals, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.2)' },
                { label: lgName + '平均', data: aVals, borderColor: '#94a3b8', borderDash: [5, 5], pointRadius: 0 }
            ]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                r: {
                    min: 0, max: 100,
                    ticks: { display: false, backdropColor: backdropColor },
                    grid: { color: gridColor },
                    angleLines: { color: gridColor },
                    pointLabels: { color: textColor, font: { size: 12 } }
                }
            },
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            }
        }
    });
}