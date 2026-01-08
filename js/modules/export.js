/* js/modules/export.js */
import { state } from './state.js';

// 画像として保存する関数 (html2canvas使用)
export async function exportAsImage(elementId, fileName = 'analysis_result.png') {
    const targetElement = document.getElementById(elementId);
    if (!targetElement) {
        alert('保存対象の要素が見つかりません');
        return;
    }

    if (typeof html2canvas === 'undefined') {
        alert('エラー: html2canvasライブラリが読み込まれていません。\nindex.htmlにスクリプトタグを追加してください。');
        return;
    }

    try {
        const canvas = await html2canvas(targetElement, {
            scale: 3,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,

            onclone: (clonedDoc) => {
                const clonedTarget = clonedDoc.getElementById(elementId);
                const originalInputs = targetElement.querySelectorAll('input, select');
                const clonedInputs = clonedTarget.querySelectorAll('input, select');

                clonedInputs.forEach((input, index) => {
                    const original = originalInputs[index];
                    const style = window.getComputedStyle(original);

                    // 値の取得
                    let value = input.value;
                    if (input.tagName === 'SELECT') {
                        value = input.options[input.selectedIndex]?.text || value;
                    }

                    // inputの代わりになるdivを作成
                    const div = clonedDoc.createElement('div');
                    div.innerText = value;

                    // スタイルのコピー
                    div.style.boxSizing = 'border-box';
                    div.style.width = style.width;
                    div.style.height = style.height;

                    div.style.border = style.border;
                    div.style.borderTopWidth = style.borderTopWidth;
                    div.style.borderBottomWidth = style.borderBottomWidth;
                    div.style.borderLeftWidth = style.borderLeftWidth;
                    div.style.borderRightWidth = style.borderRightWidth;
                    div.style.borderStyle = style.borderStyle;
                    div.style.borderColor = style.borderColor;
                    div.style.borderRadius = style.borderRadius;
                    div.style.backgroundColor = style.backgroundColor;
                    div.style.color = style.color;
                    div.style.fontFamily = style.fontFamily;
                    div.style.fontSize = style.fontSize;
                    div.style.fontWeight = style.fontWeight;
                    div.style.letterSpacing = style.letterSpacing;

                    // 配置の調整
                    div.style.display = 'flex';
                    div.style.alignItems = 'center';

                    div.style.paddingTop = '0px';
                    div.style.paddingBottom = '0px';
                    div.style.paddingLeft = style.paddingLeft;
                    div.style.paddingRight = style.paddingRight;

                    div.style.lineHeight = '1.1';

                    if (style.textAlign === 'center') {
                        div.style.justifyContent = 'center';
                    } else if (style.textAlign === 'right') {
                        div.style.justifyContent = 'flex-end';
                    } else {
                        div.style.justifyContent = 'flex-start';
                    }

                    if (input.parentNode) {
                        input.parentNode.replaceChild(div, input);
                    }
                });
            }
        });

        const link = document.createElement('a');
        link.download = fileName;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (e) {
        console.error('Image Export Failed:', e);
        alert('画像の保存に失敗しました。\n' + e.message);
    }
}