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
    const details = getCategoryDetails(category);
    
    // 5. 結果を表示
    let resultHTML = '';
    
    // 結果カード開始
    resultHTML += '<div style="background: var(--color-white); border: 2.5px solid var(--color-green); border-radius: 18px; padding: 48px 32px; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);">';
    
    // 区分表示
    resultHTML += '<p style="font-size: 24px; color: #3d3d3d; text-align: center; margin-bottom: 24px;">あなたの区分は</p>';
    resultHTML += '<p style="font-size: 56px; font-weight: 700; color: #2d6f4d; text-align: center; margin: 32px 0;">「' + category + '」</p>';
    resultHTML += '<p style="font-size: 18px; color: #3d3d3d; text-align: center; margin-bottom: 32px;">です</p>';
    
    // 自己負担限度額
    resultHTML += '<div style="background: #e8f8f0; padding: 32px; border-radius: 14px; margin: 32px 0;">';
    resultHTML += '<p style="font-size: 16px; font-weight: 600; color: #6b6b6b; margin-bottom: 12px; text-align: center;">自己負担限度額</p>';
    resultHTML += '<p style="font-size: 28px; font-weight: 700; color: #2d6f4d; text-align: center;">' + details.limit + '</p>';
    resultHTML += '</div>';
    
    // 多数該当
    resultHTML += '<div style="background: #fffbf7; padding: 20px; border-radius: 10px; margin-top: 20px;">';
    resultHTML += '<div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 2px solid #f8dce8; font-size: 15px; font-weight: 600;">';
    resultHTML += '<span style="color: #6b6b6b;">多数該当の場合</span>';
    resultHTML += '<span style="color: #a14774; font-size: 20px; font-weight: 700;">' + details.tasuGaito + '</span>';
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
