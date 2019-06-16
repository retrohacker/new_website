const feed = require('@architect/shared/feed')()

exports.handler = async function http(req) {

  console.log({ req })

  if(req.params.version !== 'v1.json') {
    return {
      status: 404,
      type: 'text/html; charset=utf-8',
      body: '<h1>Not Found</h1>'
    }
  }

  return {
    type: 'application/json; charset=utf-8',
    body: feed.json1()
  }
}
