/* js/main.js */
import { setLeague } from './modules/state.js';
import { switchTab, toggleDarkMode } from './modules/ui.js';
import { togglePanel } from './modules/ui.js'; // togglePanelを追加
import { hideError } from './core/utils.js';

import { calcBatter, applyStadiumPf } from './tabs/batter.js';
import { calcPitcher } from './tabs/pitcher.js';
import { calcTeam, optimizeLineup, clearLineup, moveBatter, updateLineupData, calcLineupScore } from './tabs/team.js';
import { calcPrediction, calcCareer, toggleSeasonMode } from './tabs/prediction.js';
// ★修正: initComparisonChart を追加
import { toggleCompMode, findSimilarPlayer, selectSimilar, initComparisonChart } from './tabs/comparison.js';
import { calcConstant, applyConstant, initTools } from './tabs/tools.js';

import { openSmartInputModal, closeSmartInputModal, applySmartInput } from './modules/smartInput.js';

import { applySettingsFromUI, resetSettingsUI } from './tabs/tools.js';

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

// Window登録
window.setLeague = setLeague;
window.switchTab = switchTab;
window.toggleDarkMode = toggleDarkMode;
window.hideError = hideError;

window.calcBatter = calcBatter;
window.applyStadiumPf = applyStadiumPf;
window.calcPitcher = calcPitcher;
window.calcTeam = calcTeam;
window.optimizeLineup = optimizeLineup;
window.clearLineup = clearLineup;
window.moveBatter = moveBatter;
window.updateLineupData = updateLineupData;

window.calcPrediction = calcPrediction;
window.calcCareer = calcCareer;
window.toggleSeasonMode = toggleSeasonMode;

window.toggleCompMode = toggleCompMode;
window.findSimilarPlayer = findSimilarPlayer;
window.selectSimilar = selectSimilar;
// ★追加: 登録
window.initComparisonChart = initComparisonChart;

window.calcConstant = calcConstant;
window.applyConstant = applyConstant;

window.openSmartInputModal = openSmartInputModal;
window.closeSmartInputModal = closeSmartInputModal;
window.applySmartInput = applySmartInput;

window.applySettingsFromUI = applySettingsFromUI;
window.resetSettingsUI = resetSettingsUI;

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

window.togglePanel = togglePanel;

document.addEventListener('DOMContentLoaded', () => {
    if(typeof tippy !== 'undefined') tippy('[data-tippy-content]', { allowHTML: true, theme: 'custom' });

    initTools();
    setupAutoSave();

    calcBatter();
    calcPitcher();
    calcTeam();

    const batterBtn = document.querySelector('.nav-btn'); 
    if (batterBtn) {
        switchTab('batter', batterBtn);
    }
    
    if(typeof calcLineupScore === 'function') calcLineupScore();
});