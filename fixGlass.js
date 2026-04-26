const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) {}
  });
  return filelist;
};

const dirs = [path.join(__dirname, 'app'), path.join(__dirname, 'components')];
let allFiles = [];
dirs.forEach(d => {
  if (fs.existsSync(d)) allFiles = allFiles.concat(walkSync(d));
});

const tsxFiles = allFiles.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

// Maps hardcoded RGBA to dynamic colors object
const replacements = [
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.0[3456]\)'/g, replace: 'colors.glass.card' },
  { regex: /"rgba\(255,\s*255,\s*255,\s*0\.0[3456]\)"/g, replace: 'colors.glass.card' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.1\)'/g, replace: 'colors.glass.cardBorder' },
  { regex: /"rgba\(255,\s*255,\s*255,\s*0\.1\)"/g, replace: 'colors.glass.cardBorder' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.15\)'/g, replace: 'colors.glass.navBorder' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.08\)'/g, replace: 'colors.glass.buttonSecondary' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.95\)'/g, replace: 'colors.text.primary' },
  { regex: /'#ffffff'/g, replace: 'colors.text.primary' },
  { regex: /'#fff'/g, replace: 'colors.text.primary' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.7\)'/g, replace: 'colors.text.secondary' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.5\)'/g, replace: 'colors.text.tertiary' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.4\)'/g, replace: 'colors.text.muted' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.35\)'/g, replace: 'colors.text.placeholder' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.3\)'/g, replace: 'colors.text.placeholder' },
  { regex: /"rgba\(255,\s*255,\s*255,\s*0\.3\)"/g, replace: 'colors.text.placeholder' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.2\)'/g, replace: 'colors.glass.cardTopBorder' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.25\)'/g, replace: 'colors.glass.cardTopBorder' },
  { regex: /'rgba\(255,\s*255,\s*255,\s*0\.6\)'/g, replace: 'colors.text.secondary' },
  { regex: /"rgba\(255,\s*255,\s*255,\s*0\.6\)"/g, replace: 'colors.text.secondary' },
  { regex: /"rgba\(255,\s*255,\s*255,\s*0\.4\)"/g, replace: 'colors.text.muted' },
  { regex: /"rgba\(255,\s*255,\s*255,\s*0\.15\)"/g, replace: 'colors.glass.navBorder' },
  { regex: /"rgba\(255,\s*255,\s*255,\s*0\.04\)"/g, replace: 'colors.glass.card' },
  { regex: /"rgba\(255,\s*255,\s*255,\s*0\.06\)"/g, replace: 'colors.glass.card' },
  { regex: /"rgba\(255,\s*255,\s*255,\s*0\.08\)"/g, replace: 'colors.glass.buttonSecondary' },
];

for (const file of tsxFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  replacements.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
}
console.log('Glass RGBA fixed.');
