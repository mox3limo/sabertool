/* js/modules/ui.js */
import { updateChartTheme } from '../core/charts.js';

// タブ切り替え機能
export function switchTab(tabId, btnElement) {
    // 1. 全セクションを隠す
    const sections = ['batter', 'pitcher', 'team', 'prediction', 'comparison', 'tools'];
    sections.forEach(id => {
        const el = document.getElementById(id + '-section');
        if (el) {
            el.classList.add('hidden');
            el.classList.remove('fade-in');
        }
    });

    // 2. 対象セクションを表示
    const target = document.getElementById(tabId + '-section');
    if (target) {
        target.classList.remove('hidden');
    }

    // 3. ボタンのアクティブ表示切り替え
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    // 4. 各タブ固有の処理
    try {
        if (tabId === 'team' && typeof window.calcTeam === 'function') window.calcTeam();
        if (tabId === 'prediction' && typeof window.calcPrediction === 'function') window.calcPrediction();

        // 比較タブのチャート初期化
        if (tabId === 'comparison') {
            if (!window.myChart && typeof window.initComparisonChart === 'function') {
                window.initComparisonChart();
            } else if (window.myChart) {
                setTimeout(() => window.myChart.resize(), 0);
            }
        }
    } catch (e) {
        console.warn('Tab init warning:', e);
    }
}

// ダークモード切り替え
export function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');

    const btn = document.getElementById('dark_mode_btn');
    if (btn) {
        btn.innerHTML = isDark
            ? '<i class="fa-solid fa-sun text-yellow-400"></i>'
            : '<i class="fa-solid fa-moon text-slate-400"></i>';
    }

    localStorage.setItem('sabermetrics_dark_mode', isDark ? 'on' : 'off');
    updateChartTheme(isDark);
}

// アコーディオン（パネル開閉）機能
export function togglePanel(id, btn) {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.toggle('hidden');

    const icon = btn.querySelector('i.fa-chevron-up, i.fa-chevron-down');
    if (icon) {
        if (el.classList.contains('hidden')) {
            icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            btn.classList.add('bg-slate-200');
        } else {
            icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
            btn.classList.remove('bg-slate-200');
        }
    }
}