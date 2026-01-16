/**
 * 共通関数ライブラリ
 */

/**
 * 区分情報の定義（5区分）
 */
const CATEGORY_DATA = {
  'ア': {
    name: 'ア（年収約1,160万円以上）',
    formula: '252,600 + (totalCost - 842,000) * 0.01',
    baseAmount: 252600,
    threshold: 842000,
    rate: 0.01,
    multipleAmount: 140100
  },
  'イ': {
    name: 'イ（年収約770万円〜1,160万円）',
    formula: '167,400 + (totalCost - 558,000) * 0.01',
    baseAmount: 167400,
    threshold: 558000,
    rate: 0.01,
    multipleAmount: 93000
  },
  'ウ': {
    name: 'ウ（年収約370万円〜770万円）',
    formula: '80,100 + (totalCost - 267,000) * 0.01',
    baseAmount: 80100,
    threshold: 267000,
    rate: 0.01,
    multipleAmount: 44400
  },
  'エ': {
    name: 'エ（年収約370万円未満）',
    formula: '57,600',
    baseAmount: 57600,
    threshold: 0,
    rate: 0,
    multipleAmount: 44400
  },
  'オ': {
    name: 'オ（住民税非課税世帯）',
    formula: '35,400',
    baseAmount: 35400,
    threshold: 0,
    rate: 0,
    multipleAmount: 24600
  }
};

/**
 * 自己負担限度額を計算
 * @param {string} category - 区分（ア〜オ）
 * @param {number} totalMedicalCost - 総医療費（10割）
 * @param {boolean} isMultiple - 多数該当かどうか
 * @returns {number} 自己負担限度額
 */
function calculateSelfPaymentLimit(category, totalMedicalCost, isMultiple = false) {
  const data = CATEGORY_DATA[category];
  if (!data) return 0;

  if (isMultiple) {
    return data.multipleAmount;
  }

  if (data.rate > 0) {
    const excess = Math.max(0, totalMedicalCost - data.threshold);
    return Math.ceil(data.baseAmount + excess * data.rate);
  }

  return data.baseAmount;
}

/**
 * 数値を3桁区切りでフォーマット
 * @param {number} num - 数値
 * @returns {string} フォーマットされた文字列
 */
function formatNumber(num) {
  return num.toLocaleString('ja-JP');
}

/**
 * URLパラメータを取得
 * @param {string} name - パラメータ名
 * @returns {string|null} パラメータの値
 */
function getUrlParameter(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * URLパラメータを設定
 * @param {string} name - パラメータ名
 * @param {string} value - パラメータの値
 */
function setUrlParameter(name, value) {
  const url = new URL(window.location.href);
  url.searchParams.set(name, value);
  window.history.replaceState({}, '', url);
}
