const feed = require('@architect/shared/feed')()

exports.handler = async function http(req) {

  console.log({ req })

  if(req.params.version !== 'v2.rss') {
    return {
      status: 404,
      type: 'text/html; charset=utf-8',
      body: '<h1>Not Found</h1>'
    }
  }

  return {
    type: 'application/rss+xml; charset=utf-8',
    body: feed.rss2()
  }
}
