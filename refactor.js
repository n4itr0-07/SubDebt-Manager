const fs = require('fs');

let content = fs.readFileSync('hooks/useDailySpending.ts', 'utf8');

// Add ConvertFn to top
if (!content.includes('export type ConvertFn')) {
  content = content.replace(
    "import * as Crypto from 'expo-crypto';",
    "import * as Crypto from 'expo-crypto';\n\nexport type ConvertFn = (amount: number, fromCurrency: string) => number;"
  );
}

// Replace exact matches
content = content.replace(
  /getTotalForDay = useCallback\(\(date: Date\)/g,
  'getTotalForDay = useCallback((date: Date, convertFn?: ConvertFn)'
);
content = content.replace(
  /getTotalForWeek = useCallback\(\(\)/g,
  'getTotalForWeek = useCallback((convertFn?: ConvertFn)'
);
content = content.replace(
  /getTotalForMonth = useCallback\(\(date: Date\)/g,
  'getTotalForMonth = useCallback((date: Date, convertFn?: ConvertFn)'
);
content = content.replace(
  /getTotalForYear = useCallback\(\(date: Date\)/g,
  'getTotalForYear = useCallback((date: Date, convertFn?: ConvertFn)'
);
content = content.replace(
  /getTotalForRange = useCallback\(\(range: TimeRange\)/g,
  'getTotalForRange = useCallback((range: TimeRange, convertFn?: ConvertFn)'
);
content = content.replace(
  /getDailyAverage = useCallback\(\(range\?: TimeRange\)/g,
  'getDailyAverage = useCallback((range?: TimeRange, convertFn?: ConvertFn)'
);
content = content.replace(
  /getWeeklyData = useCallback\(\(\): WeeklyDayData\[\] =>/g,
  'getWeeklyData = useCallback((convertFn?: ConvertFn): WeeklyDayData[] =>'
);
content = content.replace(
  /getDailyData = useCallback\(\(days: number\): MonthlyDayData\[\] =>/g,
  'getDailyData = useCallback((days: number, convertFn?: ConvertFn): MonthlyDayData[] =>'
);
content = content.replace(
  /getYearlyMonthlyData = useCallback\(\(\): YearlyMonthData\[\] =>/g,
  'getYearlyMonthlyData = useCallback((convertFn?: ConvertFn): YearlyMonthData[] =>'
);
content = content.replace(
  /getCategoryTotals = useCallback\(\(range\?: TimeRange\)/g,
  'getCategoryTotals = useCallback((range?: TimeRange, convertFn?: ConvertFn)'
);
content = content.replace(
  /getComparisonStats = useCallback\(\(range: TimeRange\)/g,
  'getComparisonStats = useCallback((range: TimeRange, convertFn?: ConvertFn)'
);
content = content.replace(
  /getHighestSpendingDay = useCallback\(\(range: TimeRange\)/g,
  'getHighestSpendingDay = useCallback((range: TimeRange, convertFn?: ConvertFn)'
);

// Replace sum logic
content = content.replace(
  /\(total, entry\) => total \+ entry\.amount/g,
  '(total, entry) => total + (convertFn ? convertFn(entry.amount, entry.currency) : entry.amount)'
);
content = content.replace(
  /\(sum, e\) => sum \+ e\.amount/g,
  '(sum, e) => sum + (convertFn ? convertFn(e.amount, e.currency) : e.amount)'
);
content = content.replace(
  /\(totals\.get\(entry\.category\) \|\| 0\) \+ entry\.amount/g,
  '(totals.get(entry.category) || 0) + (convertFn ? convertFn(entry.amount, entry.currency) : entry.amount)'
);
content = content.replace(
  /\(dayMap\.get\(key\) \|\| 0\) \+ entry\.amount/g,
  '(dayMap.get(key) || 0) + (convertFn ? convertFn(entry.amount, entry.currency) : entry.amount)'
);

fs.writeFileSync('hooks/useDailySpending.ts', content, 'utf8');
console.log('useDailySpending updated');
