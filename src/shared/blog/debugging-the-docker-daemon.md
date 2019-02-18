@title|Debugging the Docker Daemon
@created|20160225

This week I needed to dive deeper into some performance issues I have been experiencing with [dante](http://github.com/retrohacker/dante). The first section will detail the struggle that lead me to this point. If you want the quick-n-dirty DIY instructions for profiling Docker, feel free to skip ahead.

# Background

At [NodeSource](http://nodesource.com), I'm building hundreds ([literally hundreds](https://github.com/nodesource/docker-node)) of Docker Images. This has lead to the pressing need of parallelizing these. Currently, I'm provisioning a 32-core box and triggering 100 simultaneous builds to burn through my 600+ images. I've noticed though that, at any one time, there is never more than ~25 layers actively running. Somewhere, there is a bottleneck. Running `ps` shows me that Dante is indeed spawning 100 `docker build` commands, so it would seem the docker daemon isn't keeping pace.

# Diving into the Daemon

So [golang](http://golang.org) has a built-in profiler called [pprof](https://golang.org/pkg/net/http/pprof/). Luckily, docker [exposes some of pprof](https://github.com/docker/docker/blob/1fb144cb230fb5e26a19263bd0a159f3c9bd700b/api/server/profiler.go) on the daemon's socket when it is started in debug mode. In order to bring up the daemon in debug mode, you first need to shutdown the docker daemon. For example, on Debian Jessie, run:

```
$ /etc/init.d/docker stop
```

Next, open up another terminal window (or start a [tmux](https://tmux.github.io) session), and run

```
$ docker daemon -D
```

This will run the daemon in the foreground with debug output. For many problems, this may be enough to see what is going on inside the daemon. If not, read on!

Next, we want to wire up docker's Unix socket up to a TCP socket. Luckily, there is a fancy [socat](http://www.cyberciti.biz/faq/linux-unix-tcp-port-forwarding/) that does just this. Simply run:

```
$ socat -d -d TCP-LISTEN:8080,fork,bind=[host_ip] UNIX:/var/run/docker.sock
```

Now, the go tool can talk directly to the daemon. For example:

```
$ go tool pprof http://[host_ip]:8080/debug/pprof/profile
```

Though, this isn't going to give us anything very interesting. For some visually stimulating data, we can use [go-torch](https://github.com/uber/go-torch). So let us get that setup. First, download and install go-torch via it's [README.md](https://github.com/uber/go-torch#installation).

Next, clone the Brendan Gregg's fabulous repo for generating the SVG:

```
$ git clone https://github.com/brendangregg/FlameGraph.git
$ cd FlameGraph
```

Now you can gather the same data as before, but as a pretty svg:

```
$ go-torch --time=15 --file "docker.svg" --url http://[host_ip]:8080/debug/pprof
```

This will give us an image like this: 

![svg](/_static/docker_profile.svg)

The svg includes a link to some javascript in the repo, so if you open it in a webbrowser directly from your filesystem, it will be interactive.

# Conclusion

This graph shows that walking the filesystem for the creation and flattening of tarfiles is taking a pretty large amount of time. If I go further down this rabbit whole, I'll upload further findings here!

I hope this helps you!
