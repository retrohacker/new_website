const glob = require('glob')
const fs = require('fs')
const path = require('path')
const md = new require('markdown-it')({
  html: true,
  breaks: true,
  linkify: true,
})

const files = {}

function loadFile(file) {
  const result = {}
  result.name = path.basename(file, '.md')
  result.file = fs.readFileSync(file, 'utf8').split('\n')
  result.md = result
    .file
    .filter((v) => v[0] !== '@')
    .join('\n')
  result.preview = md.render(
    result.md.substring(0, 1000) + `\n\n[...truncated...](/file/${result.name})`
  )
  result.html = md.render(result.md)
  result
    .file
    .filter((v) => v[0] === '@')
    .map((v) => v.split('|', 2))
    .forEach((v) => result[v[0]] = v[1])
  files[result.name] = result
}

glob.sync(path.join(__dirname, '*.md')).forEach(loadFile)

module.exports = files
