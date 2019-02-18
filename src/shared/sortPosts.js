function compare(a, b) {
  return Number(a['@created']) - Number(b['@created'])
}

module.exports = function sortPosts(posts) {
  return posts
    .sort(compare)
    .reverse()
}
