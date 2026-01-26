// ============================================================
// categories.js
// 年収から「どの区分（ア〜エ）か？」と、その区分の内容を教えるファイル
// ============================================================

/**
 * 年収から高額療養費の区分（ア・イ・ウ・エ）を判定する関数
 */
function determineCategory(income) {
    if (income >= 1160) return 'ア';
    if (income >= 770) return 'イ';
    if (income >= 370) return 'ウ';
    return 'エ';
}

/**
 * 区分と時期を指定して自己負担限度額を取得する関数
 */
function getCategoryDetailsByRevision(category, revision) {
    const allData = {
        '現行': {
            'ア': { 
                limit: '252,600円+（医療費-842,000円）×1%', 
                tasuGaito: '140,100円',
                yearLimit: ''
            },
            'イ': { 
                limit: '167,400円+（医療費-558,000円）×1%',  
                tasuGaito: '93,000円',
                yearLimit: ''
            },
            'ウ': { 
                limit: '80,100円+（医療費-267,000円）×1%', 
                tasuGaito: '44,400円',
                yearLimit: ''
            },
            'エ': { 
                limit: '57,600円', 
                tasuGaito: '44,400円',
                yearLimit: ''
            }
        },
        'R8.8': {
            'ア': { 
                limit: '270,300円 +1%', 
                tasuGaito: '140,100円',
                yearLimit: '年間上限：168万円'
            },
            'イ': { 
                limit: '179,100円 +1%',  
                tasuGaito: '93,000円',
                yearLimit: '年間上限：111万円'
            },
            'ウ': { 
                limit: '85,800円 +1%', 
                tasuGaito: '44,400円',
                yearLimit: '年間上限：53万円'
            },
            'エ': { 
                limit: '61,500円', 
                tasuGaito: '44,400円',
                yearLimit: '年間上限：53万円'
            }
        }
    };
    
    return allData[revision][category];
}

/**
 * R9.8（2027年8月以降）の区分ア細分化
 */
function getCategoryADetailR9(income) {
    const details = [
        { 
            range: '約1,650万円超', 
            limit: '342,000円 +1%', 
            tasuGaito: '140,100円',
            yearLimit: '年間上限：168万円',
            highlight: income >= 1650
        },
        { 
            range: '約1,410〜1,650万円', 
            limit: '303,000円 +1%', 
            tasuGaito: '140,100円',
            yearLimit: '年間上限：168万円',
            highlight: income >= 1410 && income < 1650
        },
        { 
            range: '約1,160〜1,410万円', 
            limit: '270,300円 +1%', 
            tasuGaito: '140,100円',
            yearLimit: '年間上限：168万円',
            highlight: income >= 1160 && income < 1410
        }
    ];
    return details;
}

/**
 * R9.8（2027年8月以降）の区分イ細分化
 */
function getCategoryIDetailR9(income) {
    const details = [
        { 
            range: '約1,040〜1,160万円', 
            limit: '209,400円 +1%', 
            tasuGaito: '93,000円',
            yearLimit: '年間上限：111万円',
            highlight: income >= 1040 && income < 1160
        },
        { 
            range: '約950〜1,040万円', 
            limit: '194,400円 +1%',  
            tasuGaito: '93,000円',
            yearLimit: '年間上限：111万円',
            highlight: income >= 950 && income < 1040
        },
        { 
            range: '約770〜950万円', 
            limit: '179,100円 +1%', 
            tasuGaito: '93,000円',
            yearLimit: '年間上限：111万円',
            highlight: income >= 770 && income < 950
        }
    ];
    return details;
}

/**
 * R9.8（2027年8月以降）の区分ウ細分化
 */
function getCategoryUDetailR9(income) {
    const details = [
        { 
            range: '約650〜770万円', 
            limit: '110,400円 +1%', 
            tasuGaito: '44,400円',
            yearLimit: '年間上限：53万円',
            highlight: income >= 650 && income < 770
        },
        { 
            range: '約510〜650万円', 
            limit: '98,100円 +1%', 
            tasuGaito: '44,400円',
            yearLimit: '年間上限：53万円',
            highlight: income >= 510 && income < 650
        },
        { 
            range: '約370〜510万円', 
            limit: '85,800円 +1%', 
            tasuGaito: '44,400円',
            yearLimit:  '年間上限：53万円',
            highlight: income >= 370 && income < 510
        }
    ];
    return details;
}

/**
 * R9.8（2027年8月以降）の区分エ細分化
 */
function getCategoryEDetailR9(income) {
    const details = [
        { 
            range: '約260〜370万円', 
            limit: '69,600円', 
            tasuGaito: '44,400円',
            yearLimit: '年間上限：53万円',
            highlight: income >= 260 && income < 370
        },
        { 
            range: '約200〜260万円', 
            limit: '65,400円', 
            tasuGaito: '44,400円',
            yearLimit: '年間上限：53万円',
            highlight: income >= 200 && income < 260
        },
        { 
            range: '〜約200万円', 
            limit: '61,500円', 
            tasuGaito: '34,500円',
            yearLimit: '年間上限：41万円',
            highlight: income < 200
        }
    ];
    return details;
}
