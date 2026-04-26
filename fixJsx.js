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

const tsxFiles = allFiles.filter(f => f.endsWith('.tsx'));

for (const file of tsxFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Find any property assignment like prop=colors.foo.bar and wrap it in {}
  // e.g., fill=colors.text.muted -> fill={colors.text.muted}
  content = content.replace(/(\w+)=colors\.([a-zA-Z.]+)/g, "$1={colors.$2}");

  if (content !== original) {
    fs.writeFileSync(file, content);
  }
}
console.log('JSX props fixed.');
