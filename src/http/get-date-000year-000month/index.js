var sortPosts = require('@architect/shared/sortPosts')
var blog = require('@architect/shared/blog')
var template = require('@architect/shared/template')
var months = require('@architect/shared/months')

exports.handler = async function http(req) {
  const { year, month } = req.params
  console.log({req})

  var posts = sortPosts(Object.values(blog)
    .filter((v) => v['@created'].startsWith(year + month)))
  console.log(`Sorted posts`)

  let nav = '<li><a href="/">Home</a></li>'
  nav += `<li><a href="/date/${year}">${year}</a></li>`
  nav += `<li>${months[month]}</li>`
  console.log('Built navbar', {nav})

  let content = ''

  console.log(`Populating content with posts`)
  for(var i = 0; i < 10 && i < posts.length; i++) {
    const post = posts[i]
    content += '<div class="post">'
    content += `<div class="post-title">`
    content += `<a href="/file/${post.name}">`
    content += post['@title']
    content += `</a></div>`
    content += post.preview
    content += '</div>'
  }

  console.log('Filling template')
  const body = template.replace('{{NAV}}', nav).replace('{{CONTENT}}', content)

  console.log('Sending back payload')
  return { type: 'text/html; charset=utf8', body }
}
