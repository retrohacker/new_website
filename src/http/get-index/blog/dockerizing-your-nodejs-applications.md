@title|Dockerizing your Node.js Applications
@created|20150917

Cross post from [https://nodesource.com/blog/dockerizing-your-nodejs-infrastructure](https://nodesource.com/blog/dockerizing-your-nodejs-infrastructure)

This post is a deep dive into the concepts I introduced in my webinar: <a href="https://vimeo.com/139768813">Need to Node Ep. 2: Dockerizing your Node.js Infrastructure</a> from <a href="https://vimeo.com/nodesource">NodeSource</a> on <a href="https://vimeo.com">Vimeo</a>.

# Introduction

So you have Node apps, and you want to use them with Docker. In this tutorial, we will show you how to take your Node.js application and bake it into a Docker image. This is part one of a two part tutorial on Dockerizing your Node.js Infrastructure. If you are interested in a big picture talk on what Docker is, and why Node.js and Docker are a powerhouse couple, checkout my latest webinar recording from #NeedToNode.

Without further ado, let’s get started!

# Starting from a Node.js Project

I’ve put together a sample project for this tutorial. If you don’t have a GitHub account, you will need one for this step. Head over to [github.com/nodesource/docker-tutorial](https://github.com/nodesource/docker-tutorial) and make a copy of it for yourself by pressing the “fork” button, it should look like this:

![Fork](https://cldup.com/yBRkaUTo8u.png)

This project is a simple Hello-World app with a single service dependency. You can open `app.js` to find out which service, or wait for the magic to happen when we introduce `docker-compose`.

Once you have a clone of the project under your own name, go ahead and pull it down to your development machine using [git](http://git-scm.com/).

```
$ git clone https://github.com/[your_user_name]/docker-tutorial.git
…
$ cd docker-tutorial
$ ls
app.js package.json
```
> These examples will assume you are using terminal on a Unix style machine. If this assumption does not hold, you will need to translate the commands to your environment.

Now that we have the code, we can get right to work!

# Dockerizing the app

We are going to start by creating a single file called `Dockerfile` in the base of our project directory:

```
FROM nodesource/node:4.0

ADD package.json package.json
RUN npm install
ADD . .

CMD [“node”,”app.js”]
```

Lets walk through this line by line to see what is happening here, and why.

```
FROM nodesource/node:4.0
```

Here, we are building our Docker image off of the latest 4.0 release of Node.js from [NodeSource’s base Docker images](https://github.com/nodesource/docker-node). You always should to start your Dockerfile with a [`FROM`](https://docs.docker.com/reference/builder/#from) statement. This allows us to start building our Docker image from a point where Node.js and npm are already installed, along with most of the tools and libraries necessary to build most native modules in the npm ecosystem. If you wanted to build your project for another version of Node.js, or on a specific operating system, you can alter this line to reflect that like so:

```
FROM nodesource/centos7:0.12.7
```

For a full list of supported operating systems and Node.js versions, refer to the description at: https://hub.docker.com/r/nodesource/node/

Let’s take a look at the next three lines then.

```
ADD package.json package.json
RUN npm install
ADD . .
```

The [`ADD`](https://docs.docker.com/reference/builder/#add) command takes files and folders from your current working directory and puts them inside of the docker image at the location you specified. In this case, we are taking `package.json` from your project and placing in the docker image as `/usr/src/app/package.json`.

The [`RUN`](https://docs.docker.com/reference/builder/#run) command will execute a shell command inside of a Docker container and will commit the changes to the image. In this case, we have our `package.json` file present in the current working directory so we now want to run `npm install` to download and install all of our dependencies.

After we have all of our dependencies installed, which takes quite a while compared to the rest of our Dockerfile due to the dependence on network, we will add the rest of our source files to the Image. 

> You may have noticed that we didn’t specify `/usr/src/app/` when we specified where we wanted to place `package.json` and the rest of the files in our working directory. That is because the base NodeSource docker image handled setting up our project directory inside of the Docker image using the [`WORKDIR`](https://docs.docker.com/reference/builder/#workdir) command. You don’t need to worry too much about that now, just know that you can specify relative paths inside of a `Dockerfile` and, unless you override our `WORKDIR` command, you will be working out of `/usr/src/app`.

And now for the magic. We specify the command to start our application using [`CMD`](https://docs.docker.com/reference/builder/#cmd). This tells Docker how to run your application. With this completed file, we are now ready to build and run our shiny new Docker image.

After you finish this tutorial I recommend checking out the complete set of Dockerfile commands, using the fantastic reference provided by the Docker team: [https://docs.docker.com/reference/builder/](https://docs.docker.com/reference/builder/)

# Using your Docker Image

Now that we have defined our Docker image, let’s do something with it. We are going to start by building the image:

```
$ docker build -t “myapp” .
Step 0 : FROM nodesource/node:4
 ---> 813c5874eb90
Step 1 : ADD package.json package.json
 ---> 45726a0a7fb3
Removing intermediate container 78cd990108c5
Step 2 : RUN npm install
 ---> Running in 14a14e26e19f
retry@0.7.0 node_modules/retry
pg@4.4.1 node_modules/pg
├── packet-reader@0.2.0
├── pg-connection-string@0.1.3
├── buffer-writer@1.0.0
├── generic-pool@2.1.1
├── semver@4.3.6
├── pgpass@0.0.3 (split@0.3.3)
└── pg-types@1.10.0 (postgres-bytea@1.0.0, ap@0.2.0, postgres-date@1.0.0, postgres-array@1.0.0, postgres-interval@1.0.0)
 ---> 4b6ede2c7fd7
Removing intermediate container 14a14e26e19f
Step 3 : ADD . .
 ---> 0c5891f99c6c
Removing intermediate container 5bdc6717ea4c
Step 4 : CMD node app.js
 ---> Running in 5c75cb1759a7
 ---> fec7c6f133a9
Removing intermediate container 5c75cb1759a7
Successfully built fec7c6f133a9
```
> Your hashes, the alphanumeric strings that identify containers and images, will probably be different. As long as it says “Successfully built” on the last line, you are in good standing.

What we have done here is told the Docker daemon to build us an image using the `Dockerfile` located in the current working directory (specified by `.`), and to name it “myapp” (specified  by `-t “myapp”`).

When this command successfully finishes running, we will have built an entire environment capable of running our node application. So now let’s run it!

```
$ docker run -it “myapp”
Hello World
```

And there you have it! We just ran our first node application from inside a Docker container!

What did that command do? It told the Docker daemon to create and run a Docker container (specified by `run`) built from the “myapp” image (specified by `”myapp”`), and bind it to the current terminal’s stdin/stdout/stderr (specified by `-it`). That last bit isn’t too important, just know that if you want your process to run in the current terminal window, just like you had started it from outside of a container, you need to use the `-it` flags. If you want your container to run in the background (for example, a web server), you can use the `-d` flag in their place.

# Share it with the world (optional)

Now that we have our shiny new Docker image, we can share it with the world using the Docker registry. Head on over to hub.docker.com and set yourself up with an account. Then rebuild your Docker image, but use the new name: `your_user_name/myapp`

```
$ docker build -t “your_user_name/myapp” .
```

Now, we can login and push our image to the docker registry.

```
$ docker login
Username: your_user_name
Password:
Email: your_email@foo.bar
Login Successful!
$ docker push “your_user_name/myapp”
…
```
Now head over to the Docker registry to find your brand new image, available for the world to use. Good job you!

# You did it!

And that is all that is needed for putting your node app into a Docker image! But wait! There is more!

You may have noticed the long pause when running your node app inside of a Docker image. That is because our app depends on a database which isn’t present in our Docker image. In this tutorial, we showed you how you can Dockerize your Node.js apps. In the next tutorial, we will show you how you can Dockerize your Node.js infrastructure!


