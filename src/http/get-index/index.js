var sortPosts = require('@architect/shared/sortPosts')
var blog = require('@architect/shared/blog')
var template = require('@architect/shared/template')
var months = require('@architect/shared/months')

exports.handler = async function http(req) {
  return router(req.path)
}

function router(path) {
  return renderHome()
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
}
