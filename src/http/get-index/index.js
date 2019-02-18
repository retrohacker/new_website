const arc = require("@architect/functions")
var sortPosts = require('@architect/shared/sortPosts')
var blog = require('@architect/shared/blog')
var template = require('@architect/shared/template')
var months = require('@architect/shared/months')

function render() {
  var posts = sortPosts(Object.values(blog))
  console.log(`Sorted posts`)

  let nav = '<li><a href="/">Home</a></li>'
  console.log('Built navbar', {nav})

  // Filter by year
  let filter = posts
    .map((v) => Number(v['@created'].substring(0,4)))
    .reduce((a, c) => a.indexOf(c) >= 0 ? a : a.concat([c]), [])
    .sort((a, b) => b - a)
    .map((v) => `<a href="/date/${v}">${v}</a>`)
  console.log('Built filter', {filter})

  let content = `<div class="filter">Filter: ${filter.join('')}</div>`

  console.log(`Populating content with posts`)
  for(var i = 0; i < 100 && i < posts.length; i++) {
    const post = posts[i]
    content += '<div class="post">'
    content += `<div class="post-title">`
    content +=`<a href="/file/${post.name}">${post['@title']}</a>`
    content += `</div>`
    content += post.preview
    content += '</div>'
  }

  console.log('Filling template')
  return template.replace('{{NAV}}', nav).replace('{{CONTENT}}', content)
}

exports.handler = arc.proxy.public({
  async ssr(req) {
    console.log({req})
    const headers = {
      "content-type": "text/html; charset=utf8",
      "status": "200 Found"
    }
    const body = render()
    return {headers, body}
  }
})
