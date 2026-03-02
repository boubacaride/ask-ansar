const fs = require('fs');
const sql = fs.readFileSync('scripts/seed-duas.sql', 'utf8');

// Convert to a JavaScript string literal with all non-ASCII chars as \uXXXX
let escaped = '';
for (let i = 0; i < sql.length; i++) {
  const code = sql.charCodeAt(i);
  if (code > 127) {
    escaped += '\\u' + code.toString(16).padStart(4, '0');
  } else if (sql[i] === '\\') {
    escaped += '\\\\';
  } else if (sql[i] === '"') {
    escaped += '\\"';
  } else if (sql[i] === '\n') {
    escaped += '\\n';
  } else if (sql[i] === '\r') {
    escaped += '\\r';
  } else {
    escaped += sql[i];
  }
}

const js = 'window.monaco.editor.getModels()[0].setValue("' + escaped + '"); "done"';
fs.writeFileSync('scripts/inject-sql-escaped.js', js);
console.log('JS file size:', js.length);
