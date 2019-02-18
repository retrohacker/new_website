var blog = require('./blog')
var util = require('util')
var fs = require('fs')
var template = fs.readFileSync('./template.html', 'utf8')
var months = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
}

exports.handler = async function http(req) {
  console.log(req)
  console.log(Object.keys(blog))
  try {
    return router(req.path)
  } catch(e) {
    return {
      status: 500,
      body: util.inspect(e)
    }
  }
}

function sortPosts(posts) {
  return posts
    .sort(function(a, b) { Number(a['@created']) - Number(b['@created']) })
    .reverse()
}

function router(path) {
  const isHome = /^\/home\/?$/
  const isYear = /^\/date\/([0-9]{4})\/?$/
  const isMonth = /^\/date\/([0-9]{4})\/([0-9]{2})\/?$/
  const isFile = /^\/file\/(.*)$/

  if(isHome.test(path)) {
    return renderHome(...isHome.exec(path).slice(1));
  }

  if(isYear.test(path)) {
    return renderYear(...isYear.exec(path).slice(1));
  }

  if(isMonth.test(path)) {
    return renderMonth(...isMonth.exec(path).slice(1));
  }

  if(isFile.test(path)) {
    return renderFile(...isFile.exec(path).slice(1));
  }

  return render404();
}

function renderHome() {
  console.log('Sorting posts')
  var posts = sortPosts(Object.values(blog))
  console.log('Building navbar')
  let nav = '<li><a href="/home">Home</a></li>'
  console.log('Building filter')
  let filter = posts
    .map((v) => Number(v['@created'].substring(0,4)))
    .reduce((a, c) => a.indexOf(c) >= 0 ? a : a.concat([c]), [])
    .sort((a, b) => b - a)
    .map((v) => `<a href="/date/${v}">${v}</a>`)
  let content = `<div class="filter">Filter: ${filter.join('')}</div>`
  console.log('Populating posts')
  for(var i = 0; i < 100 && i < posts.length; i++) {
    const post = posts[i]
    content += '<div class="post">'
    content += `<div class="post-title">`
    content +=`<a href="/file/${post.name}">${post['@title']}</a>`
    content += `</div>`
    content += post.preview
    content += '</div>'
  }
  console.log('Sending back payload')
  return {
    type: 'text/html; charset=utf8',
    body: template
    .replace('{{NAV}}', nav)
    .replace('{{CONTENT}}', content)
  }
}

function renderYear(year) {
  var posts = sortPosts(
    Object.values(blog).filter((v) => v['@created'].startsWith(year))
  )
  let nav = '<li><a href="/home">Home</a></li>'
  nav += `<li><a href="/date/${year}">${year}</a></li>`
  let filter = posts
    .map((v) => Number(v['@created'].substring(4,6)))
    .reduce((a, c) => a.indexOf(c) >= 0 ? a : a.concat([c]), [])
    .sort((a, b) => a - b)
    .map((v) => v + '')
    .map((v) => v.length === 1 ? '0' + v : v)
    .map((v) => `<a href="/date/${year}/${v}">${months[v]}</a>`)
  let content = `<div class="filter">Filter: ${filter.join()}</div>`
  for(var i = 0; i < 10 && i < posts.length; i++) {
    const post = posts[i]
    content += '<div class="post">'
    content += `<div class="post-title">`
    content +=`<a href="/file/${post.name}">${post['@title']}</a>`
    content += `</div>`
    content += post.preview
    content += '</div>'
  }
  return {
    type: 'text/html; charset=utf8',
    body: template
    .replace('{{NAV}}', nav)
    .replace('{{CONTENT}}', content)
  }
}

function renderMonth(year, month) {
  var posts = sortPosts(Object.values(blog)
    .filter((v) => v['@created'].startsWith(year + month)))
  let nav = '<li><a href="/home">Home</a></li>'
  nav += `<li><a href="/date/${year}">${year}</a></li>`
  nav += `<li>${months[month]}</li>`
  let content = ''
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
  return {
    type: 'text/html; charset=utf8',
    body: template
    .replace('{{NAV}}', nav)
    .replace('{{CONTENT}}', content)
  }
}

function renderFile(filename) {
  const file = blog[filename]

  if(!file) {
    console.log('did not find file')
    return {
      status: 404,
      type: 'text/html; charset=utf8',
      body: blog['404'] || '<h1>Not Found</h1>'
    }
  }

  const year = file['@created'].substring(0,4);
  const month = file['@created'].substring(4,6);
  const title = file['@title'];
  let nav = '<li><a href="/home">Home</a></li>'
  nav += `<li><a href="/date/${year}">${year}</a></li>`
  nav += `<li><a href="/date/${year}/${month}">${months[month]}</a></li>`
  nav += `<li>${title}</li>`

  template.replace('{{NAV}}', nav)

  return {
    type: 'text/html; charset=utf8',
    body: template
    .replace('{{NAV}}', nav)
    .replace('{{CONTENT}}', file.html)
  }
}

function render404() {
  return {
    status: 404,
    type: 'text/html; charset=utf8',
    body: '<h1>Not Found</h1>'
  }
}
