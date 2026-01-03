/* js/main.js */
import { setLeague } from './modules/state.js';
import { switchTab, toggleDarkMode, togglePanel } from './modules/ui.js';
import { hideError } from './core/utils.js';

import { calcBatter, applyStadiumPf } from './tabs/batter.js';
import { calcPitcher } from './tabs/pitcher.js';

// ★修正: team.js から必要な関数を全てインポート
import { calcTeam, optimizeLineup, clearLineup, moveBatter, updateLineupData, loadTeamPreset } from './tabs/team.js';
// ※ runLineupSimulation 等が team.js にない場合はここから除外してください。
// 今回の team.js に合わせて調整しました。

import { calcPrediction, calcCareer, toggleSeasonMode, selectTopBottom, calcWinProb } from './tabs/prediction.js';

import { toggleCompMode, findSimilarPlayer, selectSimilar, initComparisonChart, openPlayerDetailModal, closePlayerDetailModal } from './tabs/comparison.js';

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

import { exportAsImage } from './modules/export.js';


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

// Team
window.calcTeam = calcTeam;
window.optimizeLineup = optimizeLineup;
window.clearLineup = clearLineup;
window.moveBatter = moveBatter;
window.updateLineupData = updateLineupData;
// window.runLineupSimulation = runLineupSimulation; // もしあれば
window.loadTeamPreset = loadTeamPreset; // ★これを確実に登録

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
    if(typeof tippy !== 'undefined') tippy('[data-tippy-content]', { allowHTML: true, theme: 'custom' });

    initTools();
    setupAutoSave();

    if(typeof calcBatter === 'function') calcBatter();
    if(typeof calcPitcher === 'function') calcPitcher();
    if(typeof calcTeam === 'function') calcTeam();
    
    // デフォルトタブ設定
    const batterBtn = document.querySelector('.nav-btn'); 
    if (batterBtn) {
        switchTab('batter', batterBtn);
    }
});