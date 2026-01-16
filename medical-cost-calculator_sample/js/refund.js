/**
 * 払い戻し計算ページのスクリプト
 */

let hospitalCount = 2;

// 初期化
document.addEventListener('DOMContentLoaded', function() {
  const calculateBtn = document.getElementById('calculate-btn');
  const categorySelect = document.getElementById('category');
  const addHospitalBtn = document.getElementById('add-hospital-btn');

  // 今月をデフォルトで設定
  const today = new Date();
  const monthStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
  document.getElementById('target-month').value = monthStr;

  // URLパラメータから区分を取得
  const urlCategory = getUrlParameter('category');
  if (urlCategory) {
    categorySelect.value = urlCategory;
  }

  // 計算ボタンイベント
  calculateBtn.addEventListener('click', calculateRefund);

  // 医療機関追加ボタンイベント
  addHospitalBtn.addEventListener('click', addHospital);

  // 最初の2つの医療機関の入力イベント
  setupHospitalInputEvents(1);
  setupHospitalInputEvents(2);
  
  // 削除ボタンの表示を更新
  updateRemoveButtons();
});

/**
 * 医療機関を追加
 */
function addHospital() {
  hospitalCount++;
  const hospitalList = document.getElementById('hospital-list');

  const hospitalItem = document.createElement('div');
  hospitalItem.className = 'hospital-card';
  hospitalItem.setAttribute('data-index', hospitalCount);
  
  hospitalItem.innerHTML = `
    <div class="hospital-card-header">
      <span class="hospital-label">受診先 ${hospitalCount}</span>
      <button class="btn-remove-icon" data-index="${hospitalCount}" aria-label="削除">×</button>
    </div>
    <div class="hospital-card-body">
      <div class="form-item">
        <label class="field-label-sm">メモ（任意）</label>
        <input type="text" class="input-field-sm hospital-memo" placeholder="例：○○病院 内科" data-index="${hospitalCount}">
      </div>
      <div class="form-item">
        <label class="field-label-sm">支払額（3割負担後）</label>
        <div class="input-with-unit">
          <input type="number" class="input-field-sm hospital-cost" min="0" placeholder="50000" data-index="${hospitalCount}" inputmode="numeric">
          <span class="unit-suffix">円</span>
        </div>
      </div>
    </div>
    <div class="cost-warning" style="display:none;">
      21,000円未満のため合算対象外です
    </div>
  `;

  hospitalList.appendChild(hospitalItem);
  
  setupHospitalInputEvents(hospitalCount);
  setupRemoveButtonEvent(hospitalCount);
  updateRemoveButtons();
}

/**
 * 削除ボタンのイベントを設定
 */
function setupRemoveButtonEvent(index) {
  const removeBtn = document.querySelector(`.btn-remove-icon[data-index="${index}"]`);
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      removeHospital(index);
    });
  }
}

/**
 * 医療機関を削除
 */
function removeHospital(index) {
  const hospitalItem = document.querySelector(`.hospital-card[data-index="${index}"]`);
  if (hospitalItem) {
    hospitalItem.remove();
  }
  updateRemoveButtons();
}

/**
 * 削除ボタンの表示を更新
 */
function updateRemoveButtons() {
  const hospitalItems = document.querySelectorAll('.hospital-card');
  const removeButtons = document.querySelectorAll('.btn-remove-icon');
  
  if (hospitalItems.length > 1) {
    removeButtons.forEach(btn => {
      btn.style.display = 'flex';
    });
  } else {
    removeButtons.forEach(btn => {
      btn.style.display = 'none';
    });
  }
}

/**
 * 医療機関の入力イベントを設定
 */
function setupHospitalInputEvents(index) {
  const costInput = document.querySelector(`.hospital-cost[data-index="${index}"]`);
  
  if (costInput) {
    costInput.addEventListener('input', function() {
      const cost = Number(this.value);
      const warning = this.closest('.hospital-card').querySelector('.cost-warning');
      
      if (cost > 0 && cost < 21000) {
        warning.style.display = 'block';
      } else {
        warning.style.display = 'none';
      }
    });
  }
}

/**
 * 払い戻し金額を計算
 */
function calculateRefund() {
  const category = document.getElementById('category').value;
  const targetMonth = document.getElementById('target-month').value;
  const isMultiple = document.getElementById('is-multiple').checked;

  if (!category) {
    showRefundError('区分を選択してください。');
    return;
  }

  if (!targetMonth) {
    showRefundError('対象月を選択してください。');
    return;
  }

  const allHospitalCosts = [];
  const hospitalItems = document.querySelectorAll('.hospital-card');
  
  hospitalItems.forEach((item, idx) => {
    const index = item.getAttribute('data-index');
    const memoInput = document.querySelector(`.hospital-memo[data-index="${index}"]`);
    const memo = memoInput ? memoInput.value.trim() : '';
    const costInput = document.querySelector(`.hospital-cost[data-index="${index}"]`);
    const cost = costInput ? Number(costInput.value) : 0;
    
    if (cost > 0) {
      allHospitalCosts.push({ 
        name: memo || `受診先${idx + 1}`, 
        cost: cost, 
        isEligible: cost >= 21000 
      });
    }
  });

  if (allHospitalCosts.length === 0) {
    showRefundError('少なくとも1つの医療費を入力してください。');
    return;
  }

  const eligibleCosts = allHospitalCosts.filter(h => h.isEligible);
  const totalEligibleCost = eligibleCosts.reduce((sum, h) => sum + h.cost, 0);

  if (eligibleCosts.length === 0) {
    showRefundError('21,000円以上の医療費がないため、高額療養費の対象外です。');
    return;
  }

  const totalMedicalCost = Math.round(totalEligibleCost / 0.3);
  const selfPaymentLimit = calculateSelfPaymentLimit(category, totalMedicalCost, isMultiple);
  const refundAmount = Math.max(0, totalEligibleCost - selfPaymentLimit);

  displayRefundResult({
    category,
    targetMonth,
    allHospitalCosts,
    eligibleCosts,
    totalEligibleCost,
    totalMedicalCost,
    selfPaymentLimit,
    refundAmount,
    isMultiple
  });
}

/**
 * 払い戻し結果を表示
 */
function displayRefundResult(data) {
  const resultSection = document.getElementById('result-section');
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';
  resultDiv.classList.add('show');

  const titleDiv = document.createElement('div');
  titleDiv.className = 'result-category';
  titleDiv.textContent = '計算結果（概算）';

  const highlightDiv = document.createElement('div');
  highlightDiv.className = 'result-highlight';
  highlightDiv.textContent = '払い戻し目安：約' + formatNumber(data.refundAmount) + '円';

  const hospitalBreakdownDiv = document.createElement('div');
  hospitalBreakdownDiv.className = 'result-breakdown';
  
  const hospitalTitle = document.createElement('div');
  hospitalTitle.style.fontWeight = '700';
  hospitalTitle.style.marginBottom = '12px';
  hospitalTitle.style.color = 'var(--color-pink-text)';
  hospitalTitle.textContent = '受診先別の支払額';
  hospitalBreakdownDiv.appendChild(hospitalTitle);

  data.allHospitalCosts.forEach((hospital) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'result-breakdown-item';
    itemDiv.style.fontSize = '14px';
    
    const labelSpan = document.createElement('span');
    labelSpan.textContent = hospital.name + (hospital.isEligible ? '' : ' ※合算対象外');
    labelSpan.style.color = hospital.isEligible ? 'var(--color-text)' : 'var(--color-text-light)';
    
    const valueSpan = document.createElement('span');
    valueSpan.textContent = formatNumber(hospital.cost) + '円';
    valueSpan.style.color = hospital.isEligible ? 'var(--color-text)' : 'var(--color-text-light)';
    
    itemDiv.appendChild(labelSpan);
    itemDiv.appendChild(valueSpan);
    hospitalBreakdownDiv.appendChild(itemDiv);
  });

  const breakdownDiv = document.createElement('div');
  breakdownDiv.className = 'result-breakdown';
  breakdownDiv.style.marginTop = '16px';

  const items = [
    { label: '合算対象の支払額', value: formatNumber(data.totalEligibleCost) + '円' },
    { label: '総医療費（10割）', value: formatNumber(data.totalMedicalCost) + '円' },
    { label: '自己負担限度額（目安）', value: formatNumber(data.selfPaymentLimit) + '円' + (data.isMultiple ? '（多数該当）' : '') },
    { label: '実際の自己負担額（目安）', value: formatNumber(data.selfPaymentLimit) + '円' }
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

  const noteDiv = document.createElement('div');
  noteDiv.className = 'result-note';
  
  let noteText = '【重要な注意事項】\n\n';
  
  if (data.refundAmount > 0) {
    noteText += '• この金額はあくまで概算です。実際の払い戻し額は、加入している医療保険による審査後に確定します。\n\n';
    noteText += '• 払い戻しには申請が必要です。限度額適用認定証を事前に医療機関に提示していた場合は、窓口での支払い時点で自己負担限度額までとなります。\n\n';
  } else {
    noteText += '• 合算対象の支払額が自己負担限度額以下のため、払い戻しの可能性は低いと思われます。\n\n';
  }
  
  noteText += '• 同一月内（1日〜末日）で21,000円以上支払った医療機関のみが合算対象です。21,000円未満の支払いは自動的に計算から除外されます。\n\n';
  noteText += '• 付加給付制度：一部の健康保険組合では、法定の自己負担限度額よりもさらに低い独自の上限額を設定している場合があります（付加給付）。この場合、さらに多くの払い戻しを受けられる可能性があります。詳しくは加入している健康保険組合にお問い合わせください。';
  
  noteDiv.style.whiteSpace = 'pre-line';
  noteDiv.textContent = noteText;

  resultDiv.appendChild(titleDiv);
  resultDiv.appendChild(highlightDiv);
  resultDiv.appendChild(hospitalBreakdownDiv);
  resultDiv.appendChild(breakdownDiv);
  resultDiv.appendChild(noteDiv);

  resultSection.style.display = 'block';
  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

/**
 * エラーメッセージを表示
 */
function showRefundError(message) {
  const resultSection = document.getElementById('result-section');
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';
  resultDiv.classList.add('show');

  const errorDiv = document.createElement('div');
  errorDiv.className = 'result-error';
  errorDiv.textContent = '⚠️ ' + message;

  resultDiv.appendChild(errorDiv);

  resultSection.style.display = 'block';
}
