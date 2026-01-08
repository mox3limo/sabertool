/* js/core/storage.js */
import { state, setLeague } from '../modules/state.js';
import { calcBatter } from '../tabs/batter.js';
import { calcPitcher } from '../tabs/pitcher.js';
import { calcTeam } from '../tabs/team.js';
import { calcPrediction, calcCareer } from '../tabs/prediction.js';
import { PLAYERS, normalizePlayers } from './data.js';

const STORAGE_KEY = 'sabermetrics_profiles';
const CURRENT_PROFILE_KEY = 'sabermetrics_current_profile';
const STORAGE_SCHEMA_VERSION = 2;
const HISTORY_KEY = 'sabermetrics_profiles_history';

const INPUT_FIELDS = {
    batter: ['b_ab', 'b_h', 'b_2b', 'b_3b', 'b_hr', 'b_bb', 'b_ibb', 'b_hbp', 'b_sf', 'b_k', 'batter_pf'],
    pitcher: ['p_ip', 'p_er', 'p_r', 'p_w', 'p_h', 'p_hr', 'p_bb', 'p_ibb', 'p_hbp', 'p_k', 'p_const'],
    team: ['t_rs', 't_ra', 't_win', 't_loss'],
    prediction: ['pred_played', 'pred_total'],
    career: ['career_age', 'career_h', 'career_w', 'career_pace_type']
};

function pushProfileHistory(profileName, data) {
    try {
        const hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
        hist[profileName] = hist[profileName] || [];
        const snap = { ts: new Date().toISOString(), data: data };
        hist[profileName].unshift(snap);
        if (hist[profileName].length > 10) hist[profileName].pop();
        localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    } catch (e) { console.warn('history push failed', e); }
}

function getProfileHistory(profileName) {
    try {
        const hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
        return hist[profileName] || [];
    } catch (e) { return []; }
}

export function showHistoryModal() {
    const modal = document.getElementById('history_modal');
    const list = document.getElementById('history_list');
    const profile = localStorage.getItem(CURRENT_PROFILE_KEY) || 'default';
    list.innerHTML = '';
    const hist = getProfileHistory(profile);
    if (hist.length === 0) {
        list.innerHTML = '<div class="p-4 text-sm text-slate-500">履歴がありません</div>';
    } else {
        hist.forEach((h, idx) => {
            const el = document.createElement('div');
            el.className = 'p-3 border-b flex justify-between items-center';
            el.innerHTML = `<div class="text-sm text-slate-700">${new Date(h.ts).toLocaleString()}</div><div><button class="text-xs px-2 py-1 bg-white border rounded mr-2" onclick="restoreHistory('${profile}', ${idx})">復元</button><button class="text-xs px-2 py-1 bg-red-50 border rounded" onclick="deleteHistory('${profile}', ${idx})">削除</button></div>`;
            list.appendChild(el);
        });
    }
    if (modal) modal.classList.remove('hidden');
}

export function hideHistoryModal() { const modal = document.getElementById('history_modal'); if (modal) modal.classList.add('hidden'); }

export function restoreHistory(profileName, idx) {
    const hist = getProfileHistory(profileName);
    if (!hist[idx]) return alert('履歴が見つかりません');
    if (!confirm('この履歴で上書きしますか？現在の入力は上書きされます。')) return;
    const data = hist[idx].data || {};
    setAllInputData(data);
    hideHistoryModal();
    alert('復元しました');
}

export function deleteHistory(profileName, idx) {
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
    if (!hist[profileName] || !hist[profileName][idx]) return;
    if (!confirm('この履歴を削除しますか？')) return;
    hist[profileName].splice(idx, 1);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    showHistoryModal();
}

function getAllInputData() {
    const currentLeague = state.currentLeague || 'Central';
    const data = { league: currentLeague, batter: {}, pitcher: {}, team: {}, prediction: {}, career: {} };
    Object.keys(INPUT_FIELDS).forEach(section => {
        INPUT_FIELDS[section].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (el.tagName && el.tagName.toUpperCase() === 'SELECT') {
                    data[section][id] = (el.options[el.selectedIndex] && el.options[el.selectedIndex].value) || '';
                } else {
                    data[section][id] = el.value;
                }
            }
        });
    });
    return data;
}

function setAllInputData(data) {
    if (!data) return;
    if (data.league) setLeague(data.league);

    Object.keys(INPUT_FIELDS).forEach(section => {
        if (data[section]) {
            INPUT_FIELDS[section].forEach(id => {
                const el = document.getElementById(id);
                if (el && data[section][id] !== undefined) {
                    el.value = data[section][id];
                }
            });
        }
    });

    if (typeof calcBatter === 'function') calcBatter();
    if (typeof calcPitcher === 'function') calcPitcher();
    if (typeof calcTeam === 'function') calcTeam();
    if (typeof calcPrediction === 'function') calcPrediction();
    if (typeof calcCareer === 'function') calcCareer();
}

export function saveToLocalStorage(profileName, data, section) {
    try {
        const currentLeague = state.currentLeague || 'Central';
        const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const existing = profiles[profileName] || { schemaVersion: STORAGE_SCHEMA_VERSION, league: currentLeague, batter: {}, pitcher: {}, team: {}, prediction: {}, career: {} };

        if (section === 'batter') {
            existing.batter = data.batter || existing.batter;
        } else if (section === 'pitcher') {
            existing.pitcher = data.pitcher || existing.pitcher;
        } else if (section === 'auto') {
            if (data.league) existing.league = data.league;

            Object.keys(data).forEach(sec => {
                if (sec === 'league' || typeof data[sec] !== 'object' || data[sec] === null) return;

                if (!existing[sec]) existing[sec] = {};
                Object.keys(data[sec]).forEach(k => {
                    if (data[sec][k] !== undefined && data[sec][k] !== '') {
                        existing[sec][k] = data[sec][k];
                    }
                });
            });
        } else {
            Object.assign(existing, data);
        }

        existing.schemaVersion = STORAGE_SCHEMA_VERSION;
        existing.savedAt = new Date().toISOString();

        profiles[profileName] = existing;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
        localStorage.setItem(CURRENT_PROFILE_KEY, profileName);
        updateProfileSelector();

        const status = document.getElementById('autosave_status');
        const retry = document.getElementById('autosave_retry');
        if (status) status.innerText = '保存済み';
        if (retry) retry.classList.add('hidden');
        try { pushProfileHistory(profileName, existing); } catch (e) { }
        return true;
    } catch (e) {
        console.error('Save error:', e);
        const status = document.getElementById('autosave_status');
        const retry = document.getElementById('autosave_retry');
        if (status) status.innerText = '保存失敗';
        if (retry) retry.classList.remove('hidden');
        return false;
    }
}

export function loadFromLocalStorage(profileName) {
    try {
        const currentLeague = state.currentLeague || 'Central';
        const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (profiles[profileName]) {
            let stored = profiles[profileName];
            if (!stored.schemaVersion || stored.schemaVersion < STORAGE_SCHEMA_VERSION) {
                stored = migrateProfile(stored);
                profiles[profileName] = { ...stored, schemaVersion: STORAGE_SCHEMA_VERSION };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
            }
            setAllInputData(stored);
            localStorage.setItem(CURRENT_PROFILE_KEY, profileName);
            return true;
        }
        return false;
    } catch (e) {
        console.error('Load error:', e);
        alert('読み込みに失敗しました: ' + e.message);
        return false;
    }
}

function migrateProfile(old) {
    const currentLeague = state.currentLeague || 'Central';
    const migrated = { league: currentLeague, batter: {}, pitcher: {}, team: {}, prediction: {}, career: {} };
    if (!old || typeof old !== 'object') return migrated;

    if (old.batter || old.pitcher) {
        migrated.league = old.league || migrated.league;
        migrated.batter = old.batter || migrated.batter;
        migrated.pitcher = old.pitcher || migrated.pitcher;
        migrated.team = old.team || migrated.team;
        migrated.prediction = old.prediction || migrated.prediction;
        migrated.career = old.career || migrated.career;
        return migrated;
    }

    migrated.league = old.league || migrated.league;
    Object.keys(INPUT_FIELDS).forEach(section => {
        INPUT_FIELDS[section].forEach(id => {
            if (old[id] !== undefined) migrated[section][id] = old[id];
            if (old.data && old.data[section] && old.data[section][id] !== undefined) migrated[section][id] = old.data[section][id];
        });
    });

    return migrated;
}

function updateProfileSelector() {
    const selector = document.getElementById('profile_selector');
    if (!selector) return;

    const current = localStorage.getItem(CURRENT_PROFILE_KEY) || 'default';
    const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

    selector.innerHTML = '<option value="default">デフォルト</option>';
    Object.keys(profiles).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        if (name === current) option.selected = true;
        selector.appendChild(option);
    });
}

export function showSaveProfileModal() { document.getElementById('save_profile_modal').classList.remove('hidden'); document.getElementById('profile_name_input').value = ''; document.getElementById('profile_name_input').focus(); }
export function hideSaveProfileModal() { document.getElementById('save_profile_modal').classList.add('hidden'); }

export function saveProfile() {
    const name = document.getElementById('profile_name_input').value.trim();
    if (!name) { alert('プロファイル名を入力してください'); return; }
    if (name === 'default') { alert('「default」は使用できません'); return; }

    const data = getAllInputData();
    let scope = 'all';
    const radios = document.getElementsByName('save_scope');
    for (let r of radios) { if (r.checked) { scope = r.value; break; } }

    const ok = saveToLocalStorage(name, data, scope === 'all' ? undefined : scope);
    if (ok) {
        hideSaveProfileModal();
        const saveBtn = document.querySelector('#save_profile_modal button[onclick="saveProfile()"]');
        if (saveBtn) {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fa-solid fa-check mr-1"></i>保存完了';
            saveBtn.classList.add('bg-green-600');
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.classList.remove('bg-green-600');
            }, 2000);
        }
    }
}

export function loadProfile() {
    const selector = document.getElementById('profile_selector');
    const profileName = selector.value;

    if (profileName === 'default') {
        const defaultData = {
            league: 'Central',
            batter: { b_ab: '450', b_h: '135', b_2b: '25', b_3b: '2', b_hr: '20', b_bb: '50', b_ibb: '2', b_hbp: '5', b_sf: '3', b_k: '80' },
            pitcher: { p_ip: '160.0', p_er: '50', p_r: '55', p_w: '10', p_h: '140', p_hr: '15', p_bb: '40', p_ibb: '2', p_hbp: '5', p_k: '150', p_const: '3.00' },
            team: { t_rs: '555', t_ra: '424', t_win: '85', t_loss: '53' },
            prediction: { pred_played: '100', pred_total: '143' },
            career: { career_age: '25', career_h: '500', career_w: '30', career_pace_type: '1.0' }
        };
        setAllInputData(defaultData);
        localStorage.removeItem(CURRENT_PROFILE_KEY);
    } else {
        loadFromLocalStorage(profileName);
    }
}

export function deleteCurrentProfile() {
    const selector = document.getElementById('profile_selector');
    const profileName = selector.value;

    if (profileName === 'default') { alert('デフォルトプロファイルは削除できません'); return; }
    if (!confirm(`「${profileName}」を削除しますか？`)) return;

    try {
        const profiles = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        delete profiles[profileName];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
        if (localStorage.getItem(CURRENT_PROFILE_KEY) === profileName) {
            localStorage.removeItem(CURRENT_PROFILE_KEY);
        }
        updateProfileSelector();
        loadProfile();
    } catch (e) {
        alert('削除に失敗しました: ' + e.message);
    }
}

export function toggleExportMenu() {
    const modal = document.getElementById('export_modal');
    if (modal) modal.classList.remove('hidden');
    else { const menu = document.getElementById('export_menu'); if (menu) menu.classList.toggle('hidden'); }
}
export function hideExportModal() { const modal = document.getElementById('export_modal'); if (modal) modal.classList.add('hidden'); }

export function exportData(format = 'json') {
    const data = getAllInputData();
    const currentProfile = localStorage.getItem(CURRENT_PROFILE_KEY) || 'default';
    const dateStr = new Date().toISOString().split('T')[0];

    if (format === 'json') {
        const exportObj = { version: '2.0', exportedAt: new Date().toISOString(), profileName: currentProfile, data: data };
        const json = JSON.stringify(exportObj, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sabermetrics_${currentProfile}_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else if (format === 'csv') {
        let csv = 'カテゴリ,項目,値\n';
        if (data.batter) {
            csv += '打者,打数,' + (data.batter.b_ab || 0) + '\n';
            csv += '打者,安打,' + (data.batter.b_h || 0) + '\n';
            csv += '打者,本塁打,' + (data.batter.b_hr || 0) + '\n';
        }
        if (data.pitcher) {
            csv += '投手,投球回,' + (data.pitcher.p_ip || 0) + '\n';
            csv += '投手,自責点,' + (data.pitcher.p_er || 0) + '\n';
        }
        const getNum = (id) => { const el = document.getElementById(id); return el ? (el.innerText || '0').replace(/[^\d.]/g, '') : '0'; };
        csv += '\n計算結果,項目,値\n';
        csv += '計算結果,OPS,' + getNum('res_ops') + '\n';
        csv += '計算結果,防御率,' + getNum('res_era') + '\n';

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sabermetrics_${currentProfile}_${dateStr}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    setTimeout(() => { const menu = document.getElementById('export_menu'); if (menu) menu.classList.add('hidden'); }, 100);
}

export function copyCurrentProfileToClipboard() {
    const payload = JSON.stringify(getAllInputData());
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(payload).then(() => { alert('クリップボードにコピーしました'); hideExportModal(); })
            .catch(err => alert('コピーに失敗しました'));
    } else {
        alert('このブラウザでは対応していません');
    }
}

export function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        const text = e.target.result;

        if (file.name.toLowerCase().endsWith('.csv')) {
            importLineupCSV(text);
        } else {
            try {
                const data = JSON.parse(text);

                if (typeof window.applySafeImport === 'function') {
                    alert('JSONファイルの読み込みは「安全インポート」ボタンから行ってください。');
                }
            } catch (err) {
                alert('ファイル形式が正しくありません。\n' + err);
            }
        }
    };

    reader.readAsText(file);

    event.target.value = '';
}

export function openSafeImportModal() { const m = document.getElementById('safe_import_modal'); if (!m) return; m.classList.remove('hidden'); document.getElementById('safe_import_text').value = ''; document.getElementById('safe_import_preview').innerHTML = ''; document.getElementById('safe_import_apply_btn').disabled = true; }
export function closeSafeImportModal() { const m = document.getElementById('safe_import_modal'); if (!m) return; m.classList.add('hidden'); }
export function safeImportFileChanged(ev) { const f = ev && ev.target && ev.target.files && ev.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = function (e) { document.getElementById('safe_import_text').value = e.target.result; previewSafeImport(); }; r.readAsText(f, 'utf-8'); }
export function openSafeImportFromTextArea() { const m = document.getElementById('safe_import_modal'); if (!m) return; m.classList.remove('hidden'); document.getElementById('safe_import_text').focus(); }

export function previewSafeImport() {
    const ta = document.getElementById('safe_import_text'); if (!ta) return;
    const txt = ta.value.trim(); const previewEl = document.getElementById('safe_import_preview'); if (!previewEl) return;
    previewEl.innerHTML = '';
    if (!txt) { previewEl.innerText = 'テキストが空です'; document.getElementById('safe_import_apply_btn').disabled = true; return; }

    if (txt.startsWith('{') || txt.startsWith('[')) {
        try {
            const obj = JSON.parse(txt);
            if (Array.isArray(obj)) {
                previewEl.innerHTML = renderPreviewTable(obj.slice(0, 5));
                document.getElementById('safe_import_apply_btn').disabled = false;
                previewEl.dataset.payload = JSON.stringify(obj);
                return;
            }
        } catch (e) { }
    }
    const lines = txt.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length > 0) {
        let sep = ','; if (lines[0].indexOf('\t') >= 0) sep = '\t'; else if (lines[0].indexOf(';') >= 0) sep = ';';
        const header = parseCSVLineSimple(lines[0], sep);
        const items = [];
        for (let i = 1; i < lines.length; i++) {
            const cols = parseCSVLineSimple(lines[i], sep);
            if (cols.length === 0) continue;
            const obj = {};
            for (let j = 0; j < header.length; j++) obj[header[j]] = maybeNumber(cols[j]);
            items.push(obj);
        }
        if (items.length > 0) {
            previewEl.innerHTML = renderPreviewTable(items.slice(0, 5));
            document.getElementById('safe_import_apply_btn').disabled = false;
            previewEl.dataset.payload = JSON.stringify(items);
            return;
        }
    }
    previewEl.innerText = '解析に失敗しました。';
    document.getElementById('safe_import_apply_btn').disabled = true;
}

export function applySafeImport() {
    const previewEl = document.getElementById('safe_import_preview'); if (!previewEl) return;
    const payload = previewEl.dataset && previewEl.dataset.payload ? JSON.parse(previewEl.dataset.payload) : null;
    if (!payload || !Array.isArray(payload)) { alert('データがありません'); return; }
    if (!confirm('PLAYERS を上書きしてよいですか？')) return;

    PLAYERS.length = 0;
    payload.forEach(p => PLAYERS.push(p));
    normalizePlayers(PLAYERS);

    alert('インポート完了');
    closeSafeImportModal();
}

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderPreviewTable(items) {
    if (!items || items.length === 0) return '<div>表示するデータがありません</div>';
    const keys = Object.keys(items[0]);
    let html = '<table class="w-full text-sm border-collapse">';

    html += '<thead><tr>' + keys.map(k => `<th class="border px-2 py-1 bg-gray-50">${escapeHtml(k)}</th>`).join('') + '</tr></thead>';
    html += '<tbody>' + items.map(it => ' <tr>' + keys.map(k => `<td class="border px-2 py-1">${escapeHtml(it[k] !== undefined ? it[k] : '')}</td>`).join('') + '</tr>').join('') + '</tbody>';

    html += '</table>';
    return html;
}

function parseCSVLineSimple(line, sep = ',') {
    const out = []; let cur = ''; let inq = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') { if (inq && line[i + 1] === '"') { cur += '"'; i++; } else { inq = !inq; } continue; }
        if (c === sep && !inq) { out.push(cur); cur = ''; continue; } cur += c;
    }
    out.push(cur);
    return out.map(s => s.trim().replace(/^"|"$/g, ''));
}

function maybeNumber(v) {
    if (v === null || v === undefined) return v;
    const n = parseFloat(String(v).replace(/[^0-9\.\-]/g, ''));
    return (String(v).trim() !== '' && !isNaN(n)) ? n : String(v).trim();
}

// 自動保存
let autoSaveTimeout;
export function autoSave() {
    clearTimeout(autoSaveTimeout);
    const status = document.getElementById('autosave_status');
    if (status) status.innerText = '保存中...';
    autoSaveTimeout = setTimeout(() => {
        const currentProfile = localStorage.getItem(CURRENT_PROFILE_KEY);
        if (currentProfile && currentProfile !== 'default') {
            const data = getAllInputData();
            const ok = saveToLocalStorage(currentProfile, data, 'auto');
            if (ok) {
                if (status) status.innerText = '保存済み';
                const retry = document.getElementById('autosave_retry');
                if (retry) retry.classList.add('hidden');
            }
        } else {
            if (status) status.innerText = '未保存';
        }
    }, 2000);
}

export function setupAutoSave() {
    const allIds = [
        ...INPUT_FIELDS.batter, ...INPUT_FIELDS.pitcher,
        ...INPUT_FIELDS.team, ...INPUT_FIELDS.prediction, ...INPUT_FIELDS.career
    ];
    allIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', autoSave);
    });
}

// ==========================================
// CSVインポート機能
// ==========================================

export function importLineupCSV(csvText) {
    try {
        const rows = csvText.split(/\r\n|\n/).map(row => row.trim()).filter(row => row);
        if (rows.length === 0) throw new Error('データが空です');

        const tableBody = document.getElementById('lineup_tbody');
        if (!tableBody) throw new Error('打順表が見つかりません。「チーム」タブを開いてから実行してください。');

        const trs = tableBody.querySelectorAll('tr');

        // ヘッダー行スキップ判定
        let startIndex = 0;
        const firstRowCols = rows[0].split(',').map(c => c.trim());
        if (isNaN(parseFloat(firstRowCols[1])) && isNaN(parseFloat(firstRowCols[2]))) {
            startIndex = 1;
        }

        let updateCount = 0;

        for (let i = 0; i < trs.length; i++) {
            const csvRow = rows[startIndex + i];
            if (!csvRow) break;

            const cols = csvRow.split(',').map(c => c.trim());
            const inputs = trs[i].querySelectorAll('input');

            if (inputs.length >= 3) {
                // 名前 (1列目)
                if (cols[0]) inputs[0].value = cols[0];

                // 出塁率 (2列目)
                const obp = parseFloat(cols[1]);
                if (!isNaN(obp)) {
                    inputs[1].value = obp.toFixed(3);
                    inputs[1].dispatchEvent(new Event('input'));
                }

                // 長打率 (3列目)
                const slg = parseFloat(cols[2]);
                if (!isNaN(slg)) {
                    inputs[2].value = slg.toFixed(3);
                    inputs[2].dispatchEvent(new Event('input'));
                }

                updateCount++;
            }
        }

        if (typeof window.updateLineupData === 'function') {
            window.updateLineupData();
        }

    } catch (e) {
        console.error(e);
        alert('CSVインポートエラー: ' + e.message);
    }
}