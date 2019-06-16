@app
website

@domain
blankenship.io

@http
get /
get /date/:year
get /date/:year/:month
get /file/:file
get /rss/:version
get /atom/:version
get /json/:version

@static
staging blankenshipio-static-assets-staging
production blankenshipio-static-assets-production
