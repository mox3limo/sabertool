/* js/modules/settings.js */
import { DEFAULT_WEIGHTS } from '../core/data.js';
import { calcBatter } from '../tabs/batter.js';

let currentWeights = { ...DEFAULT_WEIGHTS };

// 初期化：ローカルストレージから読み込み
try {
    const saved = localStorage.getItem('sabermetrics_weights');
    if (saved) {
        currentWeights = { ...DEFAULT_WEIGHTS, ...JSON.parse(saved) };
    }
} catch (e) { console.error('Settings load error', e); }

// 係数を取得する関数
export function getWeights() {
    return currentWeights;
}

// 係数を保存して再計算
export function saveWeights(newWeights) {
    currentWeights = {
        ...DEFAULT_WEIGHTS,
        ...Object.keys(newWeights).reduce((acc, key) => {
            acc[key] = parseFloat(newWeights[key]) || DEFAULT_WEIGHTS[key];
            return acc;
        }, {})
    };

    localStorage.setItem('sabermetrics_weights', JSON.stringify(currentWeights));

    // 再計算トリガー
    calcBatter();
}

// 初期値にリセット
export function resetWeights() {
    currentWeights = { ...DEFAULT_WEIGHTS };
    localStorage.removeItem('sabermetrics_weights');
    calcBatter();
    return currentWeights;
}