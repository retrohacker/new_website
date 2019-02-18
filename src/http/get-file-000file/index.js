var sortPosts = require('@architect/shared/sortPosts')
var blog = require('@architect/shared/blog')
var template = require('@architect/shared/template')
var months = require('@architect/shared/months')

exports.handler = async function http(req) {

  console.log({ req })

  const file = blog[req.params.file]

  if(!file) {
    console.log('did not find file')
    return {
      status: 404,
      type: 'text/html; charset=utf8',
      body: blog['404'] || '<h1>Not Found</h1>'
    }
  }

  console.log('found file')

  const year = file['@created'].substring(0,4);
  const month = file['@created'].substring(4,6);
  const title = file['@title'];
  let nav = '<li><a href="/">Home</a></li>'
  nav += `<li><a href="/date/${year}">${year}</a></li>`
  nav += `<li><a href="/date/${year}/${month}">${months[month]}</a></li>`
  nav += `<li>${title}</li>`
  console.log('Built navbar', {nav})

  console.log('Filling template')
  body = template
    .replace('{{NAV}}', nav)
    .replace('{{CONTENT}}', file.html)

  console.log('Sending back payload')
  return { type: 'text/html; charset=utf8', body }
}
