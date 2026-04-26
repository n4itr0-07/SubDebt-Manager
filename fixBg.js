const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "app/modals/settings.tsx",
  "app/modals/edit-subscription.tsx",
  "app/modals/edit-debt.tsx",
  "app/modals/add-subscription.tsx",
  "app/modals/add-debt.tsx",
  "app/(tabs)/subscriptions.tsx",
  "app/(tabs)/debts.tsx"
];

const workspace = 'c:/Coding/SubDebt-Manager';

for (const file of filesToUpdate) {
  const filePath = path.join(workspace, file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace '#0c0c14' and '#161625' inside getStyles with colors.background.primary / colors.glass.card etc.
  content = content.replace(/backgroundColor:\s*'#0c0c14'/g, 'backgroundColor: colors.background.primary');
  // AppPopup has '#161625', let's check if there are others.
  content = content.replace(/backgroundColor:\s*'#161625'/g, 'backgroundColor: colors.glass.card');

  fs.writeFileSync(filePath, content);
}
console.log('Background colors fixed.');
