@title|Making GitHub Repos Content Addressable
@created|20190805

What do I mean by "content addressable"?

When you make a commit with git, and then type `git log`, you see something like this:

```
commit 2b399aa97fb9b0b713ba48a2423fb8dfc51589c8
Author: retrohacker <code@blankenship.io>
Date:   Sun Jun 16 14:44:30 2019 -0700

    add rss feed

...
```

That string of random-looking nubmers and characters after the word `commit` is the SHA-1 hash of the commit's metadata - such as the date, message, author, previous commit's hash (blockchain!), etc. - and the file contents of the commit. This means that SHA-1 is derived from the _content_ of the commit. We want to use this SHA-1 as the "address" of the commit on GitHub so we can ask for it directly.

Newer versions of git allow you to [fetch the SHA-1 directly](https://stackoverflow.com/questions/3489173/how-to-clone-git-repository-with-specific-revision-changeset/3489576#3489576), but GitHub doesn't appear to support this. What we can do instead is create a temporary [git ref](https://git-scm.com/book/en/v2/Git-Internals-Git-References) that points directly to the commit, clone that, and then delete the reference! If that sounded like a tonne of technical jargon, another way of saying it is we are going to create a branch for the commit on GitHub, checkout the branch locally, and then remove the branch from GitHub. To do this, we are going to use the [GitHub v3 API](https://developer.github.com/v3/git/refs/)

Using the example commit above, we first make a request to the GitHub v3 API asking it to create the ref:

```bash
curl \
  -i \
  --header 'Authorization: token [TOKEN]' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/vnd.github.v3+json' \
  --request 'POST' \
  --data '{ "ref": "refs/heads/branch-2b399aa", "sha": "2b399aa97fb9b0b713ba48a2423fb8dfc51589c8" }' \
  https://api.github.com/repos/retrohacker/new_website/git/refs
```

```
HTTP/1.1 201 Created
Location: https://api.github.com/repos/retrohacker/new_website/git/refs/heads/branch-2b399aa
{
  "ref": "refs/heads/branch-2b399aa",
  "node_id": "[redacted]",
  "url": "https://api.github.com/repos/retrohacker/new_website/git/refs/heads/branch-2b399aa",
  "object": {
    "sha": "2b399aa97fb9b0b713ba48a2423fb8dfc51589c8",
    "type": "commit",
    "url": "https://api.github.com/repos/retrohacker/new_website/git/commits/2b399aa97fb9b0b713ba48a2423fb8dfc51589c8"
  }
}
```

> Note: to get your `[TOKEN]` follow [this guide](https://help.github.com/en/articles/creating-a-personal-access-token-for-the-command-line) and create a token with `repo` access

We now have a branch we can reference!

Let's try to check it out:

```
$ mkdir project
$ cd project
$ git init
Initialized empty Git repository in /home/retrohacker/project/.git
$ git remote add origin git@github.com:retrohacker/new_website
$ git fetch origin branch-2b399aa --depth=1
remote: Enumerating objects: 1676, done.
remote: Counting objects: 100% (1676/1676), done.
remote: Compressing objects: 100% (1607/1607), done.
remote: Total 1676 (delta 75), reused 1654 (delta 68), pack-reused 0
Receiving objects: 100% (1676/1676), 4.60 MiB | 1.64 MiB/s, done.
Resolving deltas: 100% (75/75), done.
From github.com:retrohacker/new_website
 * branch            branch-2b399aa -> FETCH_HEAD
 * [new branch]      branch-2b399aa -> origin/branch-2b399aa
$ git checkout branch-2b399aa
Branch branch-2b399aa set up to track remote branch branch-2b399aa from origin.
Switched to a new branch 'branch-2b399aa'
$ git log
commit 2b399aa97fb9b0b713ba48a2423fb8dfc51589c8
Author: retrohacker <code@blankenship.io>
Date:   Sun Jun 16 14:44:30 2019 -0700

    add rss feed
```

Nice! We were able to clone the exact commit given it's SHA-1!

Now let's delete the remote branch to clean up (totally optional, but I don't like having a bunch of branches laying around!)


```
curl \
  -i \
  --header 'Authorization: token [TOKEN]' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/vnd.github.v3+json' \
  --request 'DELETE' \
  https://api.github.com/repos/retrohacker/new_website/git/refs/heads/branch-2b399aa
```

```
HTTP/1.1 204 No Content
```

And that's it!

#### Recap

To make a commit content addressable on GitHub, we can use the GitHub v3 API to:

1. Create a remote pointing directly to the commit
2. Clone that branch locally
3. (optional) Delete the remote branch
