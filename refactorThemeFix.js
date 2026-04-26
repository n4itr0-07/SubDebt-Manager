const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "components/SwipeableRow.tsx",
  "components/SubscriptionIcon.tsx",
  "components/SubscriptionCard.tsx",
  "components/SpendingChart.tsx",
  "components/SkeletonLoader.tsx",
  "components/SearchBar.tsx",
  "components/GlassPillFilter.tsx",
  "components/GlassCard.tsx",
  "components/GlassInput.tsx",
  "components/GlassBadge.tsx",
  "components/FloatingNavBar.tsx",
  "components/GlassButton.tsx",
  "components/EmptyState.tsx",
  "components/CurrencyPicker.tsx",
  "components/AppPopup.tsx",
  "components/DebtCard.tsx",
  "app/modals/add-subscription.tsx",
  "app/modals/edit-subscription.tsx",
  "app/modals/settings.tsx",
  "app/modals/edit-debt.tsx",
  "app/modals/add-debt.tsx",
  "app/onboarding.tsx",
  "app/(tabs)/subscriptions.tsx",
  "app/(tabs)/debts.tsx"
];

const workspace = 'c:/Coding/SubDebt-Manager';

for (const file of filesToUpdate) {
  const filePath = path.join(workspace, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Let's ensure the hook calls are present if getStyles is present.
  if (content.includes('const getStyles')) {
    // If it is missing 'const styles = getStyles(colors)', we need to inject it into every function component body
    
    // For "export function Name"
    content = content.replace(/(export function \w+\(.*?\)\s*{(?!\s*const { colors } = useTheme\(\);))/g, "$1\n  const { colors } = useTheme();\n  const styles = getStyles(colors);");
    
    // For "export default function Name"
    content = content.replace(/(export default function \w+\(.*?\)\s*{(?!\s*const { colors } = useTheme\(\);))/g, "$1\n  const { colors } = useTheme();\n  const styles = getStyles(colors);");
    
    // For "export const Name = (...) => {"
    content = content.replace(/(export const \w+\s*=\s*\([^)]*\)(?:: React\.FC<[^>]+>)?\s*=>\s*{(?!\s*const { colors } = useTheme\(\);))/g, "$1\n  const { colors } = useTheme();\n  const styles = getStyles(colors);");

    // For "const Name: React.FC<...> = (...) => {"
    content = content.replace(/(const \w+:\s*React\.FC<[^>]+>\s*=\s*\([^)]*\)\s*=>\s*{(?!\s*const { colors } = useTheme\(\);))/g, "$1\n  const { colors } = useTheme();\n  const styles = getStyles(colors);");

  }

  fs.writeFileSync(filePath, content);
}
console.log('Fix script complete.');
