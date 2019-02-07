@title|Dockerizing your Node.js Infrastructure
@created|20151012

Cross post from [https://nodesource.com/blog/dockerizing-your-nodejs-infrastructure](https://nodesource.com/blog/dockerizing-your-nodejs-infrastructure)

This post is a deep dive into the concepts I introduced in my webinar: <a href="https://vimeo.com/139768813">Need to Node Ep. 2: Dockerizing your Node.js Infrastructure</a> from <a href="https://vimeo.com/nodesource">NodeSource</a> on <a href="https://vimeo.com">Vimeo</a>.

# Introduction

In our [last walk through](https://nodesource.com/blog/dockerizing-your-nodejs-applications), we tackled taking a Node.js application and getting it inside of a Docker container. This time around, we are going to look at Dockerizing our entire infrastructure.

We are going to start from the project we completed in the last blog post. This project should contain the following files:

```
$ ls
app.js Dockerfile package.json
```

> These examples will assume you are using terminal on a Unix style machine. If this assumption does not hold, you will need to translate the commands to your environment.

# Refresher

In the last blog post, we:
1. started from a basic Node.js application.
2. created a Dockerfile which we told the Docker daemon to build an image from.
3. tagged that image `myapp` (or `your_user_name/myapp` if you published to the Docker registry)
4. ran our application from inside of a Docker container.

However, the Nodex.js application had a service dependency that hadn’t yet been captured in the definition of our infrastructure. When we ran the Dockerized version of our application, there was a long pause at the end while our app attempted to connect to a database that wasn’t there. In this tutorial, we are going to use docker-compose to define that service dependency and link it to the container running our Node.js application.

# Getting Started

If you do not already have it, you will need a copy of docker-compose. The Docker team has created some great documentation to help you get it installed: [https://docs.docker.com/compose/install/](https://docs.docker.com/compose/install/)

# Define our service as infrastructure

With our handy-dandy Dockerfile in hand, we can now use our service as part of a larger infrastructure definition. We are going to start by creating a `docker-compose. yml` file in the base of our project directory:

```
myapp:
  build: .
```

The line `myapp:` defines a single named service in our infrastructure. The command [`build`](https://docs.docker.com/compose/yml/#build) tells `docker-compose` that you want the service to be built by running `docker build` in the path provided. By passing in relative folder paths within your repo to build, you can define multiple services within a single repository.

In this case, we have defined a single service, named `myapp`., which we have instructed `docker-compose` to build using the files in the current directory.

With this, we can now run `docker-compose build ` and `docker-compose up` to spin up our container, just like if we had run `docker build -t “myapp”` and `docker run -it “myapp”`:

```
$ docker-compose build
Building myapp…
Step 0: From nodesource/node:4
…
Successfully built bb71053fb002
$ docker-compose up
Creating dockertutorial_myapp_1
Attaching to dockertutorial_myapp_1
myapp_1 | Hello World!
Gracefully stopping… (press Ctrl+C again to force)
```

We are now prepared to add our database to the infrastructure definition. Let’s update  our `docker-compose.yml` file to look like this:

```
db:
  image: postgres
myapp:
  build: .
  links:
    - db
  environment:
    - PGHOST=db
    - PGDATABASE=postgres
    - PGUSER=postgres
```

Now we have defined a second service, and defined  the environment variables necessary for `myapp` to connect to it. Lets walk through this line by line.

First, we create a named service `db`. We instruct `docker-compose` to use the publically available Docker image [`postgres`](registry.hub.docker.com/_/postgres) from the Docker registry. Next, we instruct `docker-compose` to link our service to the db service using the [`links`](https://docs.docker.com/compose/yml/#links) key. This works by setting a value in `myapp`’s [`/etc/hosts`](http://www.tldp.org/LDP/solrhe/Securing-Optimizing-Linux-RH-Edition-v1.3/chap9sec95.html) file so that any DNS request for `db` will resolve to the `db` container. Finally, we define a set of [environment variables](https://wiki.archlinux.org/index.php/Environment_variables) that the [`pg`](https://github.com/brianc/node-postgres) module in our app will use to connect to `db`. You can see here that we provide `db` as the value for `PGHOST`. This is works thanks to the linking magic above.

> You can pretty much consider the link command to be magic right now. If you were to run `ping db` from inside the `my app` container linked like above, it would ping the `db` container. If you are interested in how this works, try running `cat /etc/hosts` from inside the `myapp` container to see the entry.

So now let’s take this file for a spin:


```
$ docker-compose up
Pulling db (postgres:latest)...
...
Creating dockertutorial_db_1...
Recreating dockertutorial_myapp_1…
db_1 | The files belonging to this database system will be owned by user “postgres”
…
myapp_1 | Hello World!
db_1 | PostgreSQL init process complete; ready for start up.
myapp_1 | Hello Postgres!
Gracefully stopping… (press Ctrl+C again to force)
Stopping dockertutorial_db_1…
Stopping dockertutorial_myapp_1...
...
```

Woah! Wasn’t that awesome? What we just did was start two containers, one containing our app and the other a postgres database, and linked the two together!

# You did it!

And that is all that is needed to wire a database up to your Dockerized application!

Using a single command `docker-compose up`, we were able to watch our infrastructure dance to life. What is more, instead of having to setup and configure an entire postgresql database from scratch for our service, we were able to get up and running with only 8 lines in our `docker-compose.yml` file.

In this tutorial we have only scratched the surface of what is possible with `docker-compose.yml`. If you are intrigued and want to learn more, I recommend checking out the excellent documentation put together by the Docker team: [https://docs.docker.com/compose/yml](https://docs.docker.com/compose/yml)

