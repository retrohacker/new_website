let arc = require('@architect/functions')

exports.handler = arc.proxy.public({
  async ssr(req) {
    let headers = {
      'Content-Type': 'text/html',
      'Status': '302 Redirect',
      'Location': '/home'
    }
    let body = ''
    return { headers, body }
  }
})
