/* js/core/utils.js */

// 数値変換・入力取得

export function toNumberInput(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'string') {
        v = v.trim().replace(/,/g, '.');
    }
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
}

export function maybeNumber(v) {
    if (v === null || v === undefined) return v;
    const n = parseFloat(String(v).replace(/[^0-9\.\-]/g, ''));
    return (String(v).trim() !== '' && !isNaN(n)) ? n : String(v).trim();
}

export function getVal(id) {
    const el = document.getElementById(id);
    return el ? Math.max(0, toNumberInput(el.value)) : 0;
}

// 入力欄に値をセットする関数 (スマート入力機能などで使用)
export function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) {
        el.value = val;
    }
}

// ==========================================
// 表示更新・フォーマット
// ==========================================

export function setTxt(id, v, m = 'std') {
    const el = document.getElementById(id); if (!el) return;
    if (typeof v === 'string') { el.innerText = v; return; }
    if (typeof v !== 'number' || !isFinite(v)) { el.innerText = "---"; return; }

    if (m === 'rate') {
        // 率 (打率など): .300
        el.innerText = v.toFixed(3).replace(/^0\./, '.');
    } else if (m === 'pct') {
        // パーセント: 12.3%
        el.innerText = (v * 100).toFixed(1) + '%';
    } else if (m === 'std') {
        // 標準 (防御率など): 1.23
        el.innerText = v.toFixed(2);
    } else {
        // その他 (整数やデフォルト)
        el.innerText = v.toFixed(3); // 指定なしの場合
    }
}

// 投球回（.1=1/3, .2=2/3）のパース処理
export function parseIP(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'string') v = v.trim();

    // "100 1/3" 形式への対応
    if (typeof v === 'string' && /\d+\s*[+ ]?\s*1\/3/.test(v)) {
        const num = parseInt(v.match(/\d+/)[0], 10);
        return isNaN(num) ? 0 : num + 1 / 3;
    }
    if (typeof v === 'string' && /\d+\s*[+ ]?\s*2\/3/.test(v)) {
        const num = parseInt(v.match(/\d+/)[0], 10);
        return isNaN(num) ? 0 : num + 2 / 3;
    }

    // 通常の数値パース
    const n = toNumberInput(v);
    if (!isFinite(n) || n <= 0) return 0;
    const intPart = Math.floor(n);
    const decimal = Math.round((n - intPart) * 10);

    // .1 -> 1/3, .2 -> 2/3 の変換
    if (decimal === 1) return intPart + 1 / 3;
    if (decimal === 2) return intPart + 2 / 3;

    // 小数点以下が微妙な場合の補正
    const frac = n - intPart;
    if (frac > 0.2 && frac < 0.5) return intPart + 1 / 3;
    if (frac >= 0.5 && frac < 0.85) return intPart + 2 / 3;

    return intPart;
}

// ==========================================
// その他ユーティリティ
// ==========================================

// HTMLエスケープ (XSS対策)
export function escapeHtml(s) {
    if (!s) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// バリデーション・エラー表示
export function showError(message) {
    const alert = document.getElementById('error_alert') || document.getElementById('error_container'); // ID揺れに対応
    const msgEl = document.getElementById('error_message') || document.getElementById('error_msg');

    if (alert && msgEl) {
        msgEl.innerText = message;
        alert.classList.remove('hidden');
        setTimeout(() => hideError(), 5000);
    } else {
        // 万が一HTML側に要素がない場合のアラート
        console.warn('Error UI elements not found:', message);
    }
}

export function hideError() {
    const alert = document.getElementById('error_alert') || document.getElementById('error_container');
    if (alert) alert.classList.add('hidden');
}

export function setFieldError(fieldId, hasError) {
    const field = document.getElementById(fieldId);
    if (field) {
        if (hasError) field.classList.add('input-error', 'ring-2', 'ring-red-500'); // クラス名を補強
        else field.classList.remove('input-error', 'ring-2', 'ring-red-500');
    }
}

export function clearAllErrors() {
    document.querySelectorAll('.input-error, .error').forEach(el => {
        el.classList.remove('input-error', 'error', 'ring-2', 'ring-red-500');
    });
    hideError();
}

// デバウンス関数（連続入力時の処理遅延）
export function debounce(fn, wait) {
    let t = null;
    return function (...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}