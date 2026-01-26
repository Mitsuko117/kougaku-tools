// ============================================================
// main.js - UI制御専門ファイル
// ============================================================

// HTML要素を取得
const judgeBtn = document.getElementById('judge-btn');
const incomeInput = document.getElementById('income');
const resultDiv = document.getElementById('result');
const resultSection = document.getElementById('result-section');

/**
 * エラーを安全に表示する関数
 */
function showError(message) {
    resultDiv.innerHTML = '<p class="result-error">' + message + '</p>';
    resultSection.style.display = 'block';
}

/**
 * 判定ボタンがクリックされた時の処理
 */
judgeBtn.addEventListener('click', function() {
    // 1. 入力された年収を取得
    const income = incomeInput.value;
    
    // 2. 入力の検証
    const validation = validateIncome(income);
    
    if (!validation.valid) {
        showError(validation.error);
        return;
    }
    
    // 3. 数値に変換
    const incomeNum = Number(income);
    
    // 4. 区分を判定
    const category = determineCategory(incomeNum);
    
    // 5. 各時期のデータを取得
    const detailsGenkyo = getCategoryDetailsByRevision(category, '現行');
    const detailsR8 = getCategoryDetailsByRevision(category, 'R8.8');
    const detailsR9 = getCategoryDetailsByRevision(category, 'R9.8');
    
    // 6. 結果を表示
    let resultHTML = '';
    
    // 結果カード開始
    resultHTML += '<div style="background: var(--color-white); border: 2.5px solid var(--color-green); border-radius: 18px; padding: 48px 32px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);">';
    
    // 区分表示
    resultHTML += '<p style="font-size: 24px; color: #3d3d3d; text-align: center; margin-bottom: 24px;">あなたの区分は</p>';
    resultHTML += '<p style="font-size: 56px; font-weight: 700; color: #2d6f4d; text-align: center; margin: 32px 0;">「' + category + '」</p>';
    resultHTML += '<p style="font-size: 18px; color: #3d3d3d; text-align: center; margin-bottom: 32px;">です</p>';
    
    // 段階的引き上げの説明
    resultHTML += '<div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 10px; padding: 20px; margin-bottom: 32px;">';
    resultHTML += '<p style="font-size: 16px; font-weight: 700; color: #856404; margin-bottom: 8px; text-align: center;">⚠️ 制度改定のお知らせ</p>';
    resultHTML += '<p style="font-size: 14px; color: #856404; margin: 0; text-align: center; line-height: 1.6;">高額療養費制度は2026年8月と2027年8月に段階的に引き上げられます。<br>2027年8月からは全ての区分が年収により細分化されます。</p>';
    resultHTML += '</div>';
    
    // 3つの時期を横並びで表示（PC）/ 縦並びで表示（スマホ）
    resultHTML += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 32px 0;">';
    
    // 現行（〜2026年7月）
    resultHTML += '<div style="background: #e8f8f0; border: 3px solid #2d6f4d; border-radius: 12px; padding: 24px;">';
    resultHTML += '<p style="font-size: 16px; font-weight: 700; color: #2d6f4d; text-align: center; margin-bottom: 16px;">〜2026年7月</p>';
    resultHTML += '<p style="font-size: 14px; color: #666; margin-bottom: 8px;">自己負担限度額</p>';
    resultHTML += '<p style="font-size: 20px; font-weight: 700; color: #2d6f4d; margin-bottom: 16px;">' + detailsGenkyo.limit + '</p>';
    resultHTML += '<p style="font-size: 14px; color: #666; margin-bottom: 8px;">多数該当</p>';
    resultHTML += '<p style="font-size: 18px; font-weight: 700; color: #a14774;">' + detailsGenkyo.tasuGaito + '</p>';
    resultHTML += '</div>';
    
    // 2026年8月〜
    resultHTML += '<div style="background: #fff8e1; border: 3px solid #ffa726; border-radius: 12px; padding: 24px;">';
    resultHTML += '<p style="font-size: 16px; font-weight: 700; color: #f57c00; text-align: center; margin-bottom: 16px;">2026年8月〜</p>';
    resultHTML += '<p style="font-size: 14px; color: #666; margin-bottom: 8px;">自己負担限度額</p>';
    resultHTML += '<p style="font-size: 20px; font-weight: 700; color: #f57c00; margin-bottom: 16px;">' + detailsR8.limit + '</p>';
    resultHTML += '<p style="font-size: 14px; color: #666; margin-bottom: 8px;">多数該当</p>';
    resultHTML += '<p style="font-size: 18px; font-weight: 700; color: #a14774; margin-bottom: ' + (detailsR8.yearLimit ? '12px' : '0') + ';">' + detailsR8.tasuGaito + '</p>';
    if (detailsR8.yearLimit) {
        resultHTML += '<p style="font-size: 13px; color: #f57c00; font-weight: 600; text-align: center;">' + detailsR8.yearLimit + '</p>';
    }
    resultHTML += '</div>';
    
    // 2027年8月〜（該当範囲のみ表示）
    resultHTML += '<div style="background: #ffebee; border: 3px solid #ef5350; border-radius: 12px; padding: 24px;">';
    resultHTML += '<p style="font-size: 16px; font-weight: 700; color: #c62828; text-align: center; margin-bottom: 16px;">2027年8月〜</p>';
    
    // 区分ごとに該当する細分化データを取得
    let applicableDetail = null;
    if (category === 'ア') {
        const details = getCategoryADetailR9(incomeNum);
        applicableDetail = details.find(d => d.highlight);
    } else if (category === 'イ') {
        const details = getCategoryIDetailR9(incomeNum);
        applicableDetail = details.find(d => d.highlight);
    } else if (category === 'ウ') {
        const details = getCategoryUDetailR9(incomeNum);
        applicableDetail = details.find(d => d.highlight);
    } else if (category === 'エ') {
        const details = getCategoryEDetailR9(incomeNum);
        applicableDetail = details.find(d => d.highlight);
    }
    
    // 該当する範囲のみ表示
    if (applicableDetail) {
        resultHTML += '<p style="font-size: 13px; color: #c62828; font-weight: 600; text-align: center; margin-bottom: 12px;">（' + applicableDetail.range + '）</p>';
        resultHTML += '<p style="font-size: 14px; color: #666; margin-bottom: 8px;">自己負担限度額</p>';
        resultHTML += '<p style="font-size: 20px; font-weight: 700; color: #c62828; margin-bottom: 16px;">' + applicableDetail.limit + '</p>';
        resultHTML += '<p style="font-size: 14px; color: #666; margin-bottom: 8px;">多数該当</p>';
        resultHTML += '<p style="font-size: 18px; font-weight: 700; color: #a14774; margin-bottom: ' + (applicableDetail.yearLimit ? '12px' : '0') + ';">' + applicableDetail.tasuGaito + '</p>';
        if (applicableDetail.yearLimit) {
            resultHTML += '<p style="font-size: 13px; color: #c62828; font-weight: 600; text-align: center;">' + applicableDetail.yearLimit + '</p>';
        }
    }
    
    resultHTML += '</div>';
    resultHTML += '</div>';
    
    // 注意書き
    resultHTML += '<p style="font-size: 13px; color: #6b6b6b; background: #fffbf7; padding: 20px; border-radius: 10px; margin-top: 20px; line-height: 1.8;">';
    resultHTML += '※多数該当：直近12ヶ月で3ヶ月以上（連続しなくてもよい）高額療養費制度を利用し、医療費の払い戻しを受けた場合、4ヶ月目以降は自己負担限度額が引き下げられます。';
    resultHTML += '</p>';
    
    // 結果カード終了
    resultHTML += '</div>';
    
    // 250万円未満の区分エの場合、減免情報を追加
    if (category === 'エ' && incomeNum < 250) {
        resultHTML += '<div style="background: #fbedf4; border: 1.5px solid #f8dce8; border-radius: 10px; padding: 20px; margin-top: 20px;">';
        resultHTML += '<p style="font-size: 14px; color: #3d3d3d; line-height: 1.8; margin: 0;">';
        resultHTML += '💡 年度途中に失業や疾病などで収入が大幅に減った場合、お住まいの市区町村に住民税の減免申請ができる場合があります。';
        resultHTML += '減免は申請日以降の分が対象となるため、該当する可能性がある方は早めにご相談ください。';
        resultHTML += '</p>';
        resultHTML += '</div>';
    }
    
    // 結果を表示
    resultDiv.innerHTML = resultHTML;
    resultSection.style.display = 'block';
    
    // 結果にスムーズスクロール
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

/**
 * Enterキーでも判定できるようにする
 */
incomeInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        judgeBtn.click();
    }
});
