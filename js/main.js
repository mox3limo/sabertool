/* js/main.js */

// --- Modules ---
import { setLeague } from './modules/state.js';
import { setupTabs, switchTab } from './modules/tabs.js';
import { toggleDarkMode, togglePanel } from './modules/ui.js';
import { hideError } from './core/utils.js';

// --- Tabs ---
import { calcBatter, applyStadiumPf } from './tabs/batter.js';
import { calcPitcher, applyPitcherStadiumPf } from './tabs/pitcher.js';
import { calcTeam, optimizeLineup, clearLineup, moveBatter, updateLineupData, loadTeamPreset, runLineupSimulation } from './tabs/team.js';
import { calcPrediction, calcCareer, toggleSeasonMode, selectTopBottom, calcWinProb } from './tabs/prediction.js';
import { toggleCompMode, findSimilarPlayer, selectSimilar, initComparisonChart, openPlayerDetailModal, closePlayerDetailModal } from './tabs/comparison.js';
import { calcConstant, applyConstant, initTools, applySettingsFromUI, resetSettingsUI } from './tabs/tools.js';

// --- Smart Input ---
import { openSmartInputModal, closeSmartInputModal, applySmartInput } from './modules/smartInput.js';

// --- Storage & Data ---
import {
    loadProfile, saveProfile, deleteCurrentProfile,
    showSaveProfileModal, hideSaveProfileModal,
    toggleExportMenu, exportData, importData,
    hideExportModal, copyCurrentProfileToClipboard,
    openSafeImportModal, closeSafeImportModal, safeImportFileChanged,
    openSafeImportFromTextArea, previewSafeImport, applySafeImport,
    showHistoryModal, hideHistoryModal, restoreHistory, deleteHistory,
    setupAutoSave
} from './core/storage.js';

// --- Export ---
// export.js がない場合エラーになるため、必要に応じてutils.jsに変更してください
import { exportAsImage } from './modules/export.js';


// --- Windowへの登録 (HTMLから onclick で呼べるようにする) ---

// UI & State
window.setLeague = setLeague;
window.switchTab = switchTab;
window.toggleDarkMode = toggleDarkMode;
window.togglePanel = togglePanel;
window.hideError = hideError;

// Batter
window.calcBatter = calcBatter;
window.applyStadiumPf = applyStadiumPf;

// Pitcher
window.calcPitcher = calcPitcher;
window.applyPitcherStadiumPf = applyPitcherStadiumPf;

// Team
window.calcTeam = calcTeam;
window.optimizeLineup = optimizeLineup;
window.clearLineup = clearLineup;
window.moveBatter = moveBatter;
window.updateLineupData = updateLineupData;
window.runLineupSimulation = runLineupSimulation;
window.loadTeamPreset = loadTeamPreset;

// Prediction
window.calcPrediction = calcPrediction;
window.calcCareer = calcCareer;
window.toggleSeasonMode = toggleSeasonMode;
window.selectTopBottom = selectTopBottom;
window.calcWinProb = calcWinProb;

// Comparison
window.toggleCompMode = toggleCompMode;
window.findSimilarPlayer = findSimilarPlayer;
window.selectSimilar = selectSimilar;
window.initComparisonChart = initComparisonChart;
window.openPlayerDetailModal = openPlayerDetailModal;
window.closePlayerDetailModal = closePlayerDetailModal;

// Tools
window.calcConstant = calcConstant;
window.applyConstant = applyConstant;
window.applySettingsFromUI = applySettingsFromUI;
window.resetSettingsUI = resetSettingsUI;

// Smart Input
window.openSmartInputModal = openSmartInputModal;
window.closeSmartInputModal = closeSmartInputModal;
window.applySmartInput = applySmartInput;

// Storage & Export
window.loadProfile = loadProfile;
window.saveProfile = saveProfile;
window.deleteCurrentProfile = deleteCurrentProfile;
window.showSaveProfileModal = showSaveProfileModal;
window.hideSaveProfileModal = hideSaveProfileModal;
window.toggleExportMenu = toggleExportMenu;
window.exportData = exportData;
window.importData = importData;
window.hideExportModal = hideExportModal;
window.copyCurrentProfileToClipboard = copyCurrentProfileToClipboard;
window.openSafeImportModal = openSafeImportModal;
window.closeSafeImportModal = closeSafeImportModal;
window.safeImportFileChanged = safeImportFileChanged;
window.openSafeImportFromTextArea = openSafeImportFromTextArea;
window.previewSafeImport = previewSafeImport;
window.applySafeImport = applySafeImport;
window.showHistoryModal = showHistoryModal;
window.hideHistoryModal = hideHistoryModal;
window.restoreHistory = restoreHistory;
window.deleteHistory = deleteHistory;

// Export
window.exportAsImage = exportAsImage;


// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
    // Tippy.js (ツールチップ) の初期化
    if (typeof tippy !== 'undefined') tippy('[data-tippy-content]', { allowHTML: true, theme: 'custom' });

    // 各機能の初期化
    if (typeof setupTabs === 'function') setupTabs();
    if (typeof initTools === 'function') initTools();
    if (typeof setupAutoSave === 'function') setupAutoSave();

    // 計算実行
    if (typeof calcBatter === 'function') calcBatter();
    if (typeof calcPitcher === 'function') calcPitcher();
    if (typeof calcTeam === 'function') calcTeam();
    if (typeof calcPrediction === 'function') calcPrediction();
    if (typeof calcCareer === 'function') calcCareer();

    // プロファイル読み込み
    if (typeof loadProfile === 'function') loadProfile();

    // デフォルトタブ設定 (batterを開く)
    const batterBtn = document.querySelector('.nav-btn');
    if (batterBtn) {
        switchTab('batter', batterBtn);
    }
});