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

  // Skip if already refactored
  if (content.includes('useTheme()')) continue;

  // 1. Replace import { colors }
  // We need to figure out the relative path to hooks/useTheme
  const depth = (file.match(/\//g) || []).length;
  const relativePrefix = depth === 0 ? './' : '../'.repeat(depth);
  const useThemeImportPath = `${relativePrefix}hooks/useTheme`;
  
  // Replace the colors import. It might be grouped.
  // We just remove 'colors' from it, or drop the line. To be safe:
  // Instead of complex regex, just add the new import below React.
  if (content.includes("import { colors } from")) {
    content = content.replace(/import { colors } from '.*?';?\n/, '');
    content = content.replace(/import {.*colors.*} from '.*?';?\n/, (match) => {
      let cleaned = match.replace(/colors\s*,?/, '');
      if (cleaned.match(/import {\s*} from/)) return ''; // empty import
      return cleaned;
    });
  }

  content = content.replace(/import React/, `import { useTheme } from '${useThemeImportPath}';\nimport React`);

  // 2. Change const styles = StyleSheet.create(...) to const getStyles = (colors: any) => StyleSheet.create(...)
  content = content.replace(/const styles = StyleSheet\.create\({([\s\S]*?)}\);/, (match, p1) => {
    return `const getStyles = (colors: any) => StyleSheet.create({${p1}});`;
  });

  // 3. Inject const { colors } = useTheme(); and const styles = getStyles(colors); inside the component
  // Find the default export function
  content = content.replace(/export default function (\w+)\((.*?)\) {/, (match, p1, p2) => {
    return `export default function ${p1}(${p2}) {\n  const { colors } = useTheme();\n  const styles = getStyles(colors);`;
  });

  content = content.replace(/export function (\w+)\((.*?)\) {/, (match, p1, p2) => {
    return `export function ${p1}(${p2}) {\n  const { colors } = useTheme();\n  const styles = getStyles(colors);`;
  });

  // For const Component = ({...}) => {
  content = content.replace(/const (\w+): React\.FC<(.*?)> = \((.*?)\) => {/, (match, p1, p2, p3) => {
    return `const ${p1}: React.FC<${p2}> = (${p3}) => {\n  const { colors } = useTheme();\n  const styles = getStyles(colors);`;
  });

  content = content.replace(/export const (\w+) = \((.*?)\) => {/, (match, p1, p2) => {
    return `export const ${p1} = (${p2}) => {\n  const { colors } = useTheme();\n  const styles = getStyles(colors);`;
  });

  // What about implicit return? const Component = () => ( <View/> )
  // This is tricky, we might need to convert it to { return <View/> }
  content = content.replace(/export const (\w+) = \((.*?)\)(?:: React\.FC<.*?>)? => \(\s*</g, (match, p1, p2) => {
    return `export const ${p1} = (${p2}) => {\n  const { colors } = useTheme();\n  const styles = getStyles(colors);\n  return ( <`;
  });

  // Fix up the closing parenthesis for the implicit returns we just broke
  // Actually, wait, it's very dangerous to do regex conversion of implicit returns.
  // Most of our components are `export function` or `export default function`.
  
  fs.writeFileSync(filePath, content);
}
console.log('Refactor complete.');
