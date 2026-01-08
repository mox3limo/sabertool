/* js/modules/smartInput.js */
import { calcBatter } from '../tabs/batter.js';
import { calcPitcher } from '../tabs/pitcher.js';

let currentInputMode = 'batter';

export function openSmartInputModal(mode) {
    currentInputMode = mode;
    const m = document.getElementById('smart_input_modal');
    if (m) {
        m.classList.remove('hidden');
        const title = document.querySelector('#smart_input_modal h3');
        const area = document.getElementById('smart_input_text');

        if (mode === 'batter') {
            title.innerHTML = '<i class="fa-solid fa-baseball-bat-ball text-blue-500 mr-2"></i>野手成績テキスト読込';
            area.placeholder = "例:\n打率.310 試合140 打数500 安打155 本塁打30 打点90...";
        } else {
            title.innerHTML = '<i class="fa-solid fa-baseball text-red-500 mr-2"></i>投手成績テキスト読込';
            area.placeholder = "例:\n防御率1.20 15勝 5敗 奪三振150 投球回160 完封2...";
        }
        area.value = '';
        area.focus();
    }
}

export function closeSmartInputModal() {
    const m = document.getElementById('smart_input_modal');
    if (m) m.classList.add('hidden');
}

export function applySmartInput() {
    const text = document.getElementById('smart_input_text').value;
    if (!text) return;

    const cleanText = text.replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    let count = 0;

    if (currentInputMode === 'batter') {
        const bPatterns = {
            'b_hr': /(?:本塁打|本|HR)[:\s]*(\d+)|(\d+)(?:本|HR)/i,
            'b_k': /(?:三振|K|SO)[:\s]*(\d+)|(\d+)(?:三振|K|SO)/i,
            'b_bb': /(?:四球|BB)[:\s]*(\d+)|(\d+)(?:四球|BB)/i,
            'b_hbp': /(?:死球|HBP)[:\s]*(\d+)|(\d+)(?:死球|HBP)/i,
            'b_sf': /(?:犠飛|SF)[:\s]*(\d+)|(\d+)(?:犠飛|SF)/i,
            'b_ibb': /(?:敬遠|IBB)[:\s]*(\d+)|(\d+)(?:敬遠|IBB)/i,
            'b_h': /(?:安打|H)[:\s]*(\d+)|(\d+)(?:安打|H)/i,
            'b_2b': /(?:二塁打|2B)[:\s]*(\d+)|(\d+)(?:二塁打|2B)/i,
            'b_3b': /(?:三塁打|3B)[:\s]*(\d+)|(\d+)(?:三塁打|3B)/i,
            'b_ab': /(?:打数|AB)[:\s]*(\d+)|(\d+)(?:打数|AB)/i
        };
        count = matchAndSet(cleanText, bPatterns);
        if (count > 0) calcBatter();

    } else {
        const pPatterns = {
            'p_ip': /(?:投球回|IP)[:\s]*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)(?:回|IP)/i,
            'p_er': /(?:自責点|ER)[:\s]*(\d+)|(\d+)(?:自責点|ER)/i,
            'p_r': /(?:失点|R)[:\s]*(\d+)|(\d+)(?:失点|R)/i,
            'p_w': /(?:勝利|勝|W)[:\s]*(\d+)|(\d+)(?:勝|W)/i,
            'p_h': /(?:被安打|H)[:\s]*(\d+)|(\d+)(?:被安打|H)/i,
            'p_hr': /(?:被本塁打|HR)[:\s]*(\d+)|(\d+)(?:被本塁打|HR|本)/i,
            'p_bb': /(?:与四球|BB)[:\s]*(\d+)|(\d+)(?:与四球|BB)/i,
            'p_ibb': /(?:敬遠|IBB)[:\s]*(\d+)|(\d+)(?:敬遠|IBB)/i,
            'p_hbp': /(?:死球|HBP)[:\s]*(\d+)|(\d+)(?:死球|HBP)/i,
            'p_k': /(?:奪三振|K|SO)[:\s]*(\d+)|(\d+)(?:奪三振|K|SO)/i
        };
        count = matchAndSet(cleanText, pPatterns);
        if (count > 0) calcPitcher();
    }

    if (count > 0) {
        closeSmartInputModal();
        alert(`${count}項目のデータを抽出・反映しました！`);
    } else {
        alert('有効なデータが見つかりませんでした。');
    }
}

function matchAndSet(text, patterns) {
    let c = 0;
    Object.keys(patterns).forEach(id => {
        const match = text.match(patterns[id]);
        if (match) {
            const val = match[1] || match[2];
            if (val !== undefined) {
                const el = document.getElementById(id);
                if (el) { el.value = val; c++; }
            }
        }
    });
    return c;
}