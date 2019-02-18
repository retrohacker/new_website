var sortPosts = require('@architect/shared/sortPosts')
var blog = require('@architect/shared/blog')
var template = require('@architect/shared/template')
var months = require('@architect/shared/months')

exports.handler = async function http(req) {
  console.log({req})

  const year = req.params.year

  var posts = sortPosts(
    Object.values(blog).filter((v) => v['@created'].startsWith(year))
  )
  console.log(`Sorted posts`)

  let nav = '<li><a href="/home">Home</a></li>'
  nav += `<li><a href="/date/${year}">${year}</a></li>`
  console.log('Built navbar', {nav})

  let filter = posts
    .map((v) => Number(v['@created'].substring(4,6)))
    .reduce((a, c) => a.indexOf(c) >= 0 ? a : a.concat([c]), [])
    .sort((a, b) => a - b)
    .map((v) => v + '')
    .map((v) => v.length === 1 ? '0' + v : v)
    .map((v) => `<a href="/date/${year}/${v}">${months[v]}</a>`)
  console.log('Built filter', {filter})

  let content = `<div class="filter">Filter: ${filter.join()}</div>`

  console.log(`Populating content with posts`)
  for(var i = 0; i < 10 && i < posts.length; i++) {
    const post = posts[i]
    content += '<div class="post">'
    content += `<div class="post-title">`
    content +=`<a href="/file/${post.name}">${post['@title']}</a>`
    content += `</div>`
    content += post.preview
    content += '</div>'
  }

  console.log('Filling template')
  const body = template.replace('{{NAV}}', nav).replace('{{CONTENT}}', content)

  console.log('Sending back payload')
  return { type: 'text/html; charset=utf8', body }
}
