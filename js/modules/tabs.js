/* js/modules/tabs.js */

export function setupTabs() {
    // 初期表示処理
}

export function switchTab(tabId, btn) {
    // 1. すべてのセクションを隠す
    const sections = ['batter-section', 'pitcher-section', 'team-section', 'prediction-section', 'comparison-section', 'tools-section'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // 2. 指定されたセクションを表示
    const target = document.getElementById(tabId + '-section');
    if (target) {
        target.classList.remove('hidden');

        target.classList.remove('opacity-0', 'translate-y-4');
        target.classList.add('opacity-100', 'translate-y-0');
    }

    // 3. ナビゲーションボタンのスタイル更新
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(b => {
        b.classList.remove('active');
    });

    if (btn) {
        btn.classList.add('active');
    }

    // 4. チャート再描画などの調整
    if (tabId === 'comparison' && typeof window.initComparisonChart === 'function') {
        window.initComparisonChart();
    }
    if (tabId === 'team' && typeof window.updateLineupData === 'function') {
    }
}