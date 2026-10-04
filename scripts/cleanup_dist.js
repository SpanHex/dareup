const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, '..', 'dist');
if (fs.existsSync(dist)) {
  const legacyHtmlFolders = ['admin', 'judge', 'ngc', 'profile', 'register', 'rules'];
  legacyHtmlFolders.forEach((folder) => {
    const htmlFile = path.join(dist, folder, 'index.html');
    if (fs.existsSync(htmlFile)) {
      try {
        fs.unlinkSync(htmlFile);
        console.log(`Cleaned legacy ${folder}/index.html from dist`);
      } catch (err) {
        console.warn(`Could not remove ${htmlFile}:`, err.message);
      }
    }
  });

  const legacyRootHtml = path.join(dist, 'index.html.original');
  if (fs.existsSync(legacyRootHtml)) {
    try {
      fs.unlinkSync(legacyRootHtml);
    } catch (_) {}
  }
}
