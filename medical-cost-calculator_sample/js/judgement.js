/**
 * 限度額判定ページのスクリプト
 */

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  const judgeBtn = document.getElementById('judge-btn');
  const incomeInput = document.getElementById('income');
  const gotoRefundBtn = document.getElementById('goto-refund-btn');

  // 判定ボタンのイベント
  judgeBtn.addEventListener('click', judgeCategory);

  // Enterキーでも判定
  incomeInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      judgeCategory();
    }
  });

  // 払い戻し計算へのリンク
  if (gotoRefundBtn) {
    gotoRefundBtn.addEventListener('click', function() {
      const category = determineCategory(Number(incomeInput.value));
      window.location.href = 'refund.html?category=' + category;
    });
  }
});

/**
 * 区分を判定
 */
function judgeCategory() {
  const income = Number(document.getElementById('income').value);
  const resultSection = document.getElementById('result-section');
  const resultDiv = document.getElementById('result');
  const nextStepSection = document.getElementById('next-step');

  // 入力チェック
  if (!income || income <= 0) {
    showError('年収を入力してください。');
    return;
  }

  // 区分判定
  const category = determineCategory(income);
  const categoryData = CATEGORY_DATA[category];

  // 結果表示
  displayResult(category, categoryData, income);

  // 結果セクションを表示
  resultSection.style.display = 'block';
  nextStepSection.style.display = 'block';

  // スムーズスクロール
  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

/**
 * 年収から区分を判定
 */
function determineCategory(income) {
  if (income >= 1160) return 'ア';
  if (income >= 770) return 'イ';
  if (income >= 370) return 'ウ';
  return 'エ';
}

/**
 * 結果を表示
 */
function displayResult(category, data, income) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';
  resultDiv.classList.add('show');

  // 区分タイトル
  const categoryDiv = document.createElement('div');
  categoryDiv.className = 'result-category';
  categoryDiv.textContent = '区分：' + category;

  // ハイライト
  const highlightDiv = document.createElement('div');
  highlightDiv.className = 'result-highlight';
  
  if (data.rate > 0) {
    const example = calculateSelfPaymentLimit(category, 1000000, false);
    highlightDiv.textContent = formatNumber(data.baseAmount) + '円〜';
  } else {
    highlightDiv.textContent = formatNumber(data.baseAmount) + '円';
  }

  // 計算内訳
  const breakdownDiv = document.createElement('div');
  breakdownDiv.className = 'result-breakdown';

  const items = [
    { label: '入力年収', value: formatNumber(income) + '万円' },
    { label: '判定区分', value: data.name },
    { label: '自己負担限度額（通常）', value: data.rate > 0 ? formatNumber(data.baseAmount) + '円〜' : formatNumber(data.baseAmount) + '円' },
    { label: '自己負担限度額（多数該当）', value: formatNumber(data.multipleAmount) + '円' }
  ];

  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'result-breakdown-item';
    
    const labelSpan = document.createElement('span');
    labelSpan.textContent = item.label;
    
    const valueSpan = document.createElement('span');
    valueSpan.textContent = item.value;
    
    itemDiv.appendChild(labelSpan);
    itemDiv.appendChild(valueSpan);
    breakdownDiv.appendChild(itemDiv);
  });

  // 説明文
  const noteDiv = document.createElement('div');
  noteDiv.className = 'result-note';
  
  let noteText = '【自己負担限度額について】\n\n';
  
  if (data.rate > 0) {
    noteText += `• 総医療費が${formatNumber(data.threshold)}円を超えた場合、超過分の1%が加算されます。\n\n`;
    noteText += `• 計算式：${formatNumber(data.baseAmount)}円 + (総医療費 - ${formatNumber(data.threshold)}円) × 1%\n\n`;
  } else {
    noteText += `• 区分${category}の自己負担限度額は一律${formatNumber(data.baseAmount)}円です。\n\n`;
  }
  
  noteText += `• 多数該当（過去12ヶ月で3回以上高額療養費を利用）の場合は${formatNumber(data.multipleAmount)}円に軽減されます。\n\n`;
  noteText += '• この判定はあくまで目安です。実際の区分は、標準報酬月額や課税所得などをもとに加入している保険者（健康保険組合、全国健康保険協会（協会けんぽ）、市町村国保、国民健康保険組合、共済組合等）が決定します。';
  
  noteDiv.style.whiteSpace = 'pre-line';
  noteDiv.textContent = noteText;

  // DOM に追加
  resultDiv.appendChild(categoryDiv);
  resultDiv.appendChild(highlightDiv);
  resultDiv.appendChild(breakdownDiv);
  resultDiv.appendChild(noteDiv);
}

/**
 * エラーメッセージを表示
 */
function showError(message) {
  const resultSection = document.getElementById('result-section');
  const resultDiv = document.getElementById('result');
  const nextStepSection = document.getElementById('next-step');

  resultDiv.innerHTML = '';
  resultDiv.classList.add('show');

  const errorDiv = document.createElement('div');
  errorDiv.className = 'result-error';
  errorDiv.textContent = '⚠️ ' + message;

  resultDiv.appendChild(errorDiv);

  resultSection.style.display = 'block';
  nextStepSection.style.display = 'none';
}
