/* js/main.js */
import { setLeague } from './modules/state.js';
import { switchTab, toggleDarkMode, togglePanel } from './modules/ui.js';
import { hideError } from './core/utils.js';

import { calcBatter, applyStadiumPf } from './tabs/batter.js';
import { calcPitcher } from './tabs/pitcher.js';
import { calcTeam, optimizeLineup, clearLineup, moveBatter, updateLineupData, calcLineupScore, runLineupSimulation } from './tabs/team.js';
import { calcPrediction, calcCareer, toggleSeasonMode } from './tabs/prediction.js';

// ★追加: openPlayerDetailModal, closePlayerDetailModal をインポート
import { toggleCompMode, findSimilarPlayer, selectSimilar, initComparisonChart, openPlayerDetailModal, closePlayerDetailModal } from './tabs/comparison.js';

// ★追加: applySettingsFromUI, resetSettingsUI をインポート（係数設定用）
import { calcConstant, applyConstant, initTools, applySettingsFromUI, resetSettingsUI } from './tabs/tools.js';

import { openSmartInputModal, closeSmartInputModal, applySmartInput } from './modules/smartInput.js';

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

// --- Windowへの登録 ---

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

// Team (Lineup Simulation含む)
window.calcTeam = calcTeam;
window.optimizeLineup = optimizeLineup;
window.clearLineup = clearLineup;
window.moveBatter = moveBatter;
window.updateLineupData = updateLineupData;
window.runLineupSimulation = runLineupSimulation;

// Prediction
window.calcPrediction = calcPrediction;
window.calcCareer = calcCareer;
window.toggleSeasonMode = toggleSeasonMode;

// Comparison (詳細モーダル含む)
window.toggleCompMode = toggleCompMode;
window.findSimilarPlayer = findSimilarPlayer;
window.selectSimilar = selectSimilar;
window.initComparisonChart = initComparisonChart;
window.openPlayerDetailModal = openPlayerDetailModal; // ★登録
window.closePlayerDetailModal = closePlayerDetailModal; // ★登録

// Tools (係数設定含む)
window.calcConstant = calcConstant;
window.applyConstant = applyConstant;
window.applySettingsFromUI = applySettingsFromUI; // ★登録
window.resetSettingsUI = resetSettingsUI; // ★登録

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

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
    if(typeof tippy !== 'undefined') tippy('[data-tippy-content]', { allowHTML: true, theme: 'custom' });

    initTools();
    setupAutoSave();

    if(typeof calcBatter === 'function') calcBatter();
    if(typeof calcPitcher === 'function') calcPitcher();
    if(typeof calcTeam === 'function') calcTeam();
    if(typeof calcLineupScore === 'function') calcLineupScore();

    const batterBtn = document.querySelector('.nav-btn'); 
    if (batterBtn) {
        switchTab('batter', batterBtn);
    }
});