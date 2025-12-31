// ==========================================
// js/core/utils.js
// ==========================================

// 数値変換・フォーマット
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
    const n = parseFloat(String(v).replace(/[^0-9\.\-]/g,''));
    return (String(v).trim()!=='' && !isNaN(n)) ? n : String(v).trim();
}

export function getVal(id) { 
    const el = document.getElementById(id); 
    return el ? Math.max(0, toNumberInput(el.value)) : 0; 
}

export function setTxt(id, v, m='std') { 
    const el = document.getElementById(id); if(!el) return; 
    if(typeof v === 'string') { el.innerText = v; return; }
    if(typeof v!=='number'||!isFinite(v)){ el.innerText="---"; return; }
    if (m === 'rate') {
        el.innerText = v.toFixed(3).replace(/^0\./, '.'); // 0.300 -> .300 表記にする場合ここを調整可能
    } else if (m === 'pct') {
        el.innerText = (v*100).toFixed(1) + '%';
    } else {
        el.innerText = v.toFixed(2);
    }
}

// 投球回（.1=1/3, .2=2/3）のパース処理
export function parseIP(v) {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'string') v = v.trim();

    if (typeof v === 'string' && /\d+\s*[+ ]?\s*1\/3/.test(v)) {
        const num = parseInt(v.match(/\d+/)[0], 10);
        return isNaN(num) ? 0 : num + 1/3;
    }
    if (typeof v === 'string' && /\d+\s*[+ ]?\s*2\/3/.test(v)) {
        const num = parseInt(v.match(/\d+/)[0], 10);
        return isNaN(num) ? 0 : num + 2/3;
    }

    const n = toNumberInput(v);
    if (!isFinite(n) || n <= 0) return 0;
    const intPart = Math.floor(n);
    const decimal = Math.round((n - intPart) * 10);
    if (decimal === 1) return intPart + 1/3;
    if (decimal === 2) return intPart + 2/3;
    const frac = n - intPart;
    if (frac > 0.2 && frac < 0.5) return intPart + 1/3;
    if (frac >= 0.5 && frac < 0.85) return intPart + 2/3;
    return intPart;
}

// HTMLエスケープ
export function escapeHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// バリデーション・エラー表示
export function showError(message) {
    const alert = document.getElementById('error_alert');
    const msgEl = document.getElementById('error_message');
    if (alert && msgEl) {
        msgEl.innerText = message;
        alert.classList.remove('hidden');
        setTimeout(() => hideError(), 5000);
    }
}

export function hideError() {
    const alert = document.getElementById('error_alert');
    if (alert) alert.classList.add('hidden');
}

export function setFieldError(fieldId, hasError) {
    const field = document.getElementById(fieldId);
    if (field) {
        if (hasError) field.classList.add('error');
        else field.classList.remove('error');
    }
}

export function clearAllErrors() {
    document.querySelectorAll('.input-field.error').forEach(el => {
        el.classList.remove('error');
    });
}

// デバウンス関数（連続入力時の処理遅延）
export function debounce(fn, wait) {
    let t = null;
    return function(...args) {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
}