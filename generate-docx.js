const HTMLtoDOCX = require('html-to-docx');
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'DOSSIER_PROFESSIONNEL.html');
const outPath  = path.join(__dirname, 'DOSSIER_PROFESSIONNEL.docx');

const html = fs.readFileSync(htmlPath, 'utf8');

HTMLtoDOCX(html, null, {
  table:      { row: { cantSplit: true } },
  footer:     true,
  pageNumber: true,
  margins:    { top: 900, right: 900, bottom: 900, left: 900 },
  font:       'Calibri',
  fontSize:   22,
  lang:       'fr-FR',
})
.then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log('✅ DOSSIER_PROFESSIONNEL.docx généré avec succès !');
  console.log('📁 Fichier :', outPath);
})
.catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
