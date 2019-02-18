var template = require('path').join(__dirname, 'template.html')
module.exports = require('fs').readFileSync(template, 'utf8')
