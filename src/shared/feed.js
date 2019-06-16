var sortPosts = require('@architect/shared/sortPosts')
var blog = require('@architect/shared/blog')
var Feed = require('feed').Feed

function getDate(date) {
  const year = date.slice(0,4)
  const month = date.slice(4,6)
  const day = date.slice(6,8)
  return new Date(year, month, day)
}

function render() {
  var posts = sortPosts(Object.values(blog))
  console.log(`Sorted posts`)

  const feed = new Feed({
    title: "blankenship.io",
    description: "William Blankenship",
    id: "http://blankenship.io/",
    link: "http://blankenship.io/",
    language: "en",
    copyright: "This work by William Blankenship is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.",
    feedLinks: {
      rss: "https://blankenship.io/rss/v2.rss",
      json: "https://blankenship.io/json/v1.json",
      atom: "https://blankenship.io/atom/v1.atom"
    },
    author: {
      name: "William Blankenship",
      email: "blog@blankenship.io",
      link: "https://blankenship.io"
    }
  });

  console.log('generating feed')
  posts.forEach(post => {
    feed.addItem({
      title: post['@title'],
      description: post['@title'],
      id: `https://blankenship.io/file/${post.name}`,
      link: `https://blankenship.io/file/${post.name}`,
      content: post.html,
      author: [
        {
          name: "William Blankenship",
          email: "blog@blankenship.io",
          link: "https://blankenship.io"
        },
      ],
      date: getDate(post['@created'])
    })
  })

  console.log('generated feed')
  return feed
}

module.exports = render
