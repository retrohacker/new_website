const feed = require('@architect/shared/feed')()

exports.handler = async function http(req) {

  console.log({ req })

  if(req.params.version !== 'v1.atom') {
    return {
      status: 404,
      type: 'text/html; charset=utf-8',
      body: '<h1>Not Found</h1>'
    }
  }

  return {
    type: 'application/atom+xml; charset=utf-8',
    body: feed.atom1()
  }
}
