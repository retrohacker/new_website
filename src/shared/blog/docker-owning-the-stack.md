@title|Docker: Owning the Stack
@created|20150425

![slide1](/_static/docker_owning_stack_slide1.png)

_This is the third post of a 3-part series on docker. This series was transformed from a talk I gave at an STL DevOps meetup._

Here we are going to dive into the implications of developers taking ownership of their stacks through docker, and the [work](https://github.com/nodesource/docker-node) I have been doing at [NodeSource](https://nodesource.com/) to help developers take ownership of their [Node.js](https://nodejs.org/) stacks. If you haven’t already, take a few minutes to skim through the [previous article](/2015/04/24/How-Docker-Changes-Things.html) in this series which lays the groundwork for this topic.

![slide2](/_static/docker_owning_stack_slide2.png)

In my previous article, we introduced the concept of developers owning the stack. Now let’s follow that rabbit hole down into the work I’ve been doing at NodeSource. When developers take ownership of their stack, they are no longer simply running Node 0.10.34, they are deploying all of the packages bundled in the image with that version of Node.

We are still in the exploratory phase of using docker at NodeSource, so when I was looking at pinning deployments to a specific version of Node it became apparent that there was something lacking in the [official repositories](https://github.com/joyent/docker-node): only the most recent versions of Node have Dockerfiles.

![slide3](/_static/docker_owning_stack_slide3.png)

When the docker registry builds official images, it doesn’t displace legacy tags when they disappear from the image’s [definition files](https://github.com/docker-library/official-images/blob/master/library/node). This results in that tag staying in the registry allowing users to pin to specific versions of an official image, but this prevents legacy versions from being rebuilt.

Node 0.12.0 is no longer officially maintained, which means its stack is stale. It no longer receives the updates pushed to buildpacks-deps:jessie, nor are any of the packages installed to support Node.js properly maintained. Essentially the entire stack in the legacy Node.js containers are going stale.

![slide4](/_static/docker_owning_stack_slide4.png)

So how bad is this? Let’s try to run updates on the most recent release of Node.js 0.12 and compare that to its original release.

```
$ docker run -it node:0.12.2 \
> sh -c "apt-get update && apt-get upgrade"
...
The following packages will be upgraded:
  curl libcurl3 libcurl3-gnutls libcurl4-openssl-dev libsystemd0
  libudev1 systemd systemd-sysv udev
9 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
Need to get 4638 kB of archives.
$ docker run -it node:0.12.0 \
> sh -c "apt-get update && apt-get upgrade"
...
The following packages will be upgraded:
  apt bsdutils bzip2 coreutils curl debconf debconf-i18n dmsetup
  dpkg dpkg-dev gnupg gpgv initscripts krb5-multidev
  libapt-pkg4.12 libavahi-client3 libavahi-common-data
  libavahi-common3 libblkid1 libbz2-1.0 libbz2-dev libc-bin 
  libc-dev-bin libc6 libc6-dev libcap2 libcap2-bin libcurl3
  libcurl3-gnutls libcurl4-openssl-dev libdevmapper1.02.1
  libdpkg-perl libgcrypt20 libgssapi-krb5-2 libgssrpc4 libicu52
  libk5crypto3 libkadm5clnt-mit9 libkadm5srv-mit9 libkdb5-7
  libkrb5-3 libkrb5support0 libldap-2.4-2 libmount1
  libmysqlclient-dev libmysqlclient18 libprocps3
  libpython-stdlib librtmp1 libsasl2-2 libsasl2-modules-db
  libsmartcols1 libssh2-1 libssl-dev libssl-doc libssl1.0.0
  libsvn1 libsystemd0 libtasn1-6 libtiff5 libtiff5-dev
  libtiffxx5 libudev1 libuuid1 linux-libc-dev mount
  multiarch-support mysql-common openssh-client openssl perl
  perl-base perl-modules procps python python-minimal subversion
  systemd systemd-sysv sysv-rc sysvinit-utils tzdata udev
  util-linux
84 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
Need to get 53.6 MB of archives.
```

You can see that the stack for a legacy version of Node has already gone incredibly stale. There are updates for 84 of the 405 packages installed in the Node.js 0.12.0 image compared to only 9 for the 0.12.2 release. This is where the work I’m doing at NodeSource comes into play. To safely allow version pinning when deploying Node.js applications in Docker, you have to properly maintain the Dockerfiles used to build each version you would like to pin against.

![slide5](/_static/docker_owning_stack_slide5.png)

The process of installing 0.12.0 from a .deb is the same as installing 0.12.2. To simplify the maintaining all of the permutations of Dockerfiles necessary to fully support version pinning, I create [template files](https://github.com/nodesource/docker-node/tree/master/dockerfiles) which can be populated with the version of Node we will be installing. I also create a [manifest file](https://github.com/nodesource/docker-node/blob/master/dockerfiles/dists.js) which defines all of the permutations of distributions, releases, projects, and versions of server side javascript we will want to deploy against along with capturing special information for edge cases.

This all results in the [ability to build](https://github.com/nodesource/docker-node/blob/master/generate.js) 104 Dockerfiles supporting 4 Linux distributions and their individual releases for each version of iojs and Node.js supported by the official [NodeSource PPAs](https://github.com/nodesource/distributions). These are then setup on the docker registry as automated builds that rebuild themselves when the underlying Linux distribution image updates.

All of this work results in a stack that remains up-to-date while allowing you to ship your code on specific versions of the Node.js and iojs projects.
