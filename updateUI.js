const fs = require('fs');

const updateTab = (file) => {
  let content = fs.readFileSync(file, 'utf8');

  // Update useCurrency import/destructuring
  content = content.replace(
    'const { currencyCode } = useCurrency();',
    'const { currencyCode, convertAmount, refresh: refreshCurrency } = useCurrency();'
  );

  // Update useFocusEffect
  content = content.replace(
    /useFocusEffect\(\s*useCallback\(\(\) => \{\s*refresh\(\);\s*\}, \[refresh\]\)\s*\);/m,
    `useFocusEffect(
    useCallback(() => {
      refresh();
      refreshCurrency();
    }, [refresh, refreshCurrency])
  );`
  );

  // File specific changes
  if (file.includes('debts.tsx') || file.includes('credits.tsx')) {
    content = content.replace(
      'const totalPending = getTotalPendingAmount();',
      'const totalPending = getTotalPendingAmount(convertAmount);'
    );
  } else if (file.includes('subscriptions.tsx')) {
    content = content.replace(
      'const totalAmount = getTotalAmount();',
      'const totalAmount = getTotalAmount(convertAmount);'
    );
  } else if (file.includes('spending.tsx')) {
    content = content.replace(
      'const todayTotal = getTotalForDay(new Date());',
      'const todayTotal = getTotalForDay(new Date(), convertAmount);'
    );
    content = content.replace(
      'const weekTotal = getTotalForWeek();',
      'const weekTotal = getTotalForWeek(convertAmount);'
    );
    content = content.replace(
      'const monthTotal = getTotalForMonth(new Date());',
      'const monthTotal = getTotalForMonth(new Date(), convertAmount);'
    );
    content = content.replace(
      'const yearTotal = getTotalForYear(new Date());',
      'const yearTotal = getTotalForYear(new Date(), convertAmount);'
    );
    content = content.replace(
      'const highestDay = getHighestSpendingDay(timeRange);',
      'const highestDay = getHighestSpendingDay(timeRange, convertAmount);'
    );
    content = content.replace(
      'const comparison = getComparisonStats(timeRange);',
      'const comparison = getComparisonStats(timeRange, convertAmount);'
    );
    content = content.replace(
      'const filteredEntries = getEntriesForRange(timeRange);',
      `const filteredEntries = getEntriesForRange(timeRange);
  const currentRangeTotal = getTotalForRange(timeRange, convertAmount);`
    );
    content = content.replace(
      'const currentRangeTotal = getTotalForRange(timeRange);',
      '' // we merged it above or if it already exists, wait
    );
    
    // Oh wait, `currentRangeTotal` is computed in spending.tsx:
    content = content.replace(
      /const currentRangeTotal = getTotalForRange\(timeRange\);/g,
      'const currentRangeTotal = getTotalForRange(timeRange, convertAmount);'
    );
  }

  fs.writeFileSync(file, content, 'utf8');
};

['app/(tabs)/debts.tsx', 'app/(tabs)/credits.tsx', 'app/(tabs)/subscriptions.tsx', 'app/(tabs)/spending.tsx'].forEach(updateTab);

// Update Chart Components inside spending.tsx to pass convertAmount
let spendingContent = fs.readFileSync('app/(tabs)/spending.tsx', 'utf8');

// The chart has timeRange, let's see if we need to pass convertAmount to it...
// Actually `SpendingTrendChart` has `getDailyData` internally?
// Let's check `SpendingTrendChart.tsx`
fs.writeFileSync('app/(tabs)/spending.tsx', spendingContent, 'utf8');
console.log('UI updated');
