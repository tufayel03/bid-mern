const fs = require('fs');
let methods = fs.readFileSync('src/panel/AdminMethods.js', 'utf8');
if (methods.charCodeAt(0) === 0xFEFF) methods = methods.slice(1);
const idx = methods.indexOf('defaultCourierSettings() {', 0);
if (idx > -1) {
    methods = 'const SAFE_HTTP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);\nexport const adminMethods = {\n  ' + methods.substring(idx);
    fs.writeFileSync('src/panel/AdminMethods.js', methods);
}
console.log('Fixed top.');
