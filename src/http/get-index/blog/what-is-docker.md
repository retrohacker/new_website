@title|What Docker Is
@created|20150423

![slide1](/images/what_docker_is_slide1.png)

_This is the first post of a 3-part series on docker. This series was transformed from a talk I gave at an STL DevOps meetup._

Let’s take a moment, really quick, to bring everyone up to speed on what docker is. If you already understand what docker is — and why it is so great — feel free to skip ahead to the [next article](/2015/04/24/How-Docker-Changes-Things.html).

![slide2](/images/what_docker_is_slide2.png)

Docker started as an api on top of [Linux Containers](https://linuxcontainers.org/). It has grown to be a tool set and ecosystem for packaging and distributing applications. It’s api is built to be pluggable allowing the underlying technologies to be exchanged without any apparent changes to the end user.

Docker uses the primitives collectively known as “Linux Containers” including [Linux Control Groups](https://www.wikiwand.com/en/Cgroups), [Namespaces](http://man7.org/linux/man-pages/man7/namespaces.7.html), and [IPtables](https://www.wikiwand.com/en/Iptables) to create an isolated environment for processes to run in. It also uses a [Layered Filesystem](http://www.wikiwand.com/en/Aufs) for version control when storing these environments. All of these technologies brought together under the docker api has created an amazingly simple standard for shipping code.

For a much higher level explanation of why docker is fantastic check out [Solomon Hykes](https://twitter.com/solomonstre) talk.

<iframe style="margin-left:50px" width="560" height="315" src="https://www.youtube.com/embed/3N3n9FzebAA" frameborder="0" allowfullscreen></iframe>

![slide3](/images/what_docker_is_slide3.png)

Now that we are starting to understand the power of docker as a shipping tool, let’s take a minute to see just how efficient docker is. We are going to create a script called `gimmick.sh` which will accept an integer as a parameter.

```
#!/usr/bin/env bash
# Usage: gimmick.sh Int
# Spawns Int docker containers running a mongodb instance
echo "Starting $1 containers..."

# Let's use a high port number so there is less chance
# of conflict
port_start=44000
for i in `seq 1 $1`; do
  echo "Starting container $i..."
  docker run -dp port_start:27017 mongo
  # Increment port_start
  port_start=$((port_start + 1))
done
```

Now, if we run this from the command line, we can see just how fast docker is. Here is the readout on my machine:

```
$ time ./gimmick.sh 25
Starting 25 containers
Starting container 1 on port 44000
f74e2ba92460c42a986e1ba42d44a4739c80e23cbc5be5fa8d4438d1f134bb62
...
Starting container 25 on 44024
b1c037d6d4767ebf41758e279d07eb999511d14aeb4739fb6f7f103e80b94402
./gimmick.sh 25 0.39s user 0.07 system 1% cpu 37.932 total
```

We just deployed 25 isolated [MongoDB](https://www.mongodb.org/) instances on our local machine, each listening on its own port, in under 40 seconds. But what we did was far more than just deploy MongoDB, we deployed the entire stack required to run MongoDB. From the operating system to all of the dependencies, we spun up 25 virtual images that contained MongoDB.

For proof, we can take a look at the file system of the mongo image and the packages installed:

```
$ docker run -it mongo du -hs /*
4.7M /bin
4.0K /boot
0 /dev
1.8M /etc
4.0K /home
8.0M /lib
4.0K /lib64
4.0K /media
4.0K /mnt
4.0K /opt
0 /proc
120K /root
20K /run
3.0M /sbin
4.0K /srv
0 /sys
4.0K /tmp
238M /usr
5.8M /var
$ docker run -it mongo dpkg --get-selections
apt            install
base-files     install
base-passwd    install
bash           install
...
xz-utils       install
zlib1g:amd64   install
$ docker run -it mongo dpkg --get-selections | wc -l
107
```

From this output, we can see the mongo image contains the entire operating system, its folder structure, and a MongoDB instance for a total of 107 packages. The takeaway from this is that docker comes with almost all the advantages of running a virtual machine but doesn’t carry the overhead of a virtualization layer.

Take a look at our next article on the philosophy of Docker [here](/2015/04/24/How-Docker-Changes-Things.html).
