const fs = require('fs');
const files = ['lib/mock-data.js', 'lib/actions.js'];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/NOVEL/g, 'MANGA');
  content = content.replace(/novel/g, 'manga');
  content = content.replace(/Truyện chữ/g, 'Manga');
  fs.writeFileSync(f, content);
});
console.log('Fixed files');
