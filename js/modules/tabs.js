/* js/modules/tabs.js */

export function setupTabs() {
    // 初期表示：保存されたタブがあればそれを開く、なければ打撃タブ
    // (ここでは簡易的に常にbatterを開くか、HTML側のclass指定に任せる)
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
        
        // アニメーション用のクラス付与（フェードインなど）
        target.classList.remove('opacity-0', 'translate-y-4');
        target.classList.add('opacity-100', 'translate-y-0');
    }

    // 3. ナビゲーションボタンのスタイル更新
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(b => {
        b.classList.remove('active');
        // アイコンの色などをリセット（必要なら）
    });

    // 押されたボタンをアクティブにする
    if (btn) {
        btn.classList.add('active');
    }
    
    // 4. 計算グラフなどが崩れないよう、Chart.jsなどの再描画トリガーが必要な場合の処理
    // (非表示状態から表示されるとcanvasサイズがおかしくなることがあるため)
    if (tabId === 'comparison' && typeof window.initComparisonChart === 'function') {
        window.initComparisonChart();
    }
    if (tabId === 'team' && typeof window.updateLineupData === 'function') {
        // チームタブ表示時にグラフ等の調整が必要ならここ
    }
}