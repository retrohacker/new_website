@title|How Docker Changes Things
@created|20150424

![slide1](/images/docker_changes_things_slide1.png)

_This is the second post of a 3-part series on docker. This series was transformed from a talk I gave at an STL DevOps meetup._

We are going to talk about “owning the stack” via [docker](https://www.docker.com/), and what that means to us as developers. If this post is successful, you will understand the full meaning and depth of that statement by the time you are done reading this. For a quick primer on what docker is, and why it is fantastic, check out the precursor to this blog post [here](http://127.0.0.1:4000/2015/04/23/What-Is-Docker.html).

![slide2](/images/docker_changes_things_slide2.png)

Often, when we hear people [talk](http://opensource.com/resources/what-docker) [about](http://searchenterpriselinux.techtarget.com/definition/Docker) [docker](http://stackoverflow.com/questions/16047306/how-is-docker-io-different-from-a-normal-virtual-machine) [being](http://www.zdnet.com/article/what-is-docker-and-why-is-it-so-darn-popular/) [awesome](http://www.centurylinklabs.com/what-is-docker-and-when-to-use-it/), these four bullet points are the reasons they cite.

Docker’s biggest strength is that it standardizes the deployment process. Developers no longer need to follow long complex installation instructions walking them through setting up databases, setting environment variables, running configuration scripts, and running make files. Docker promises the ability to work at the container level, spinning up complex configurations with a simple [docker-compose](https://docs.docker.com/compose/) script.

If you are deploying on an [internal private cloud](http://www.techopedia.com/definition/26648/internal-cloud), docker offers an excellent alternative to virtual machines. Since resources do not need to be allocated up front for containers, you can run many more applications on the same physical machine allowing them to share the physical hardware's resources.
Docker also has insanely fast — can be sub-second — spin up times compared to that of a virtual machine. This makes them even more appealing for internal private clouds. When you need to elastically expand resources under an abnormal load, docker will get your services up and running quicker.

Finally, the [Layered File Systems](https://docs.docker.com/terms/layer/) that docker uses allows docker clients to pull only the changes to a docker image when an update occurs. Compared to downloading an updated virtual disk image for a VM, this saves a considerable amount of time and network resources.
For a deep comparison of native vs. docker vs. virtualization, check out this [awesome paper from IBM](http://domino.research.ibm.com/library/cyberdig.nsf/papers/0929052195DD819C85257D2300681E7B/$File/rc25482.pdf).

![slide3](/images/docker_changes_things_slide3.png)

Yes, there are many technical reasons why docker is great, but they all fall short of the true change docker is bringing to our industry. Docker’s promise is more than just deploying and updating vast quantities of images quickly, it's a philosophical stance on how deploying our applications should look and where responsibility lies in that deployment process. It is a true paradigm shift that will fundamentally change the way we approach developing modern applications.

![slide4](/images/docker_changes_things_slide4.png)

Solomon Hykes has spoken at lengths to this, but nearly every review of docker fails to state this. Docker promises to transform server side programming in the same way that web browsers transformed client side programming. A docker container can run on any machine running docker, and any machine running docker can run any docker container. Windows, Mac, Ubuntu, Debian, Fedora, the [list goes on](https://docs.docker.com/installation/#installation), these are all capable of deploying applications in the same exact way with the same exact results. This means that the process of deploying on these operating systems is not only exactly the same, but that if the application runs on one of them it will run on all of them. Deploying to your laptop is exactly the same as deploying in production, and if it works on your laptop it will work in production.

This is a two-way street. An application can be shipped to production from a developer the same way that it can be shipped to a developer from production. If you are a new developer on a team, getting a production environment running on your laptop is now as simple as running a docker compose file. Your CI server can run tests on top of the same exact container(s) and configuration that will be deployed into production. The list of benefits that come with a fully portable container goes on and on. This will fundamentally change the way we look at shipping code.

![slide5](/images/docker_changes_things_slide5.png)

The “Stack as a Dependency” is the biggest philosophical shift that docker brings with it. When we as developers break ground on our applications, we make a lot of assumptions about the environment those applications will run in. Our development environment becomes an implicit dependency for our application, and we often fail to appreciate that fact.

Imagine starting the development of an application on a fresh, clean, empty laptop. The first thing you will do is install an operating system, and that decision is the first dependency of your application. Running your final code base in Ubuntu versus Fedora may be a wildly different experience, and may not even be possible without modification of your code. By using breaking ground on development using a specific operating system, you have created a dependency before writing a single line of code.

Next, you will probably decide on a programming language. This is your second dependency but it's more than just the language you choose, it is the specific version of that language’s tools that you installed. Yes, your final product may run the same on python 2.7.9 as it does on 2.7.8 but that is only an assumption, not a guarantee.

This list goes on, maybe mysql 5.5.43 and redis 2.6.17 become dependencies, or maybe you have a wildly different stack. Whatever your final stack becomes, every aspect of it is a dependency for your application. From the way your mysql server is configured to the python packages you installed as direct dependencies, they are required to be properly in place for your application to run.

Currently, when we develop our applications, we either try to match production as closely as possible in our development environment to satisfy the applications dependencies (and vice versa). This results in long lists of requirements being handed off to the DevOps team when it is time to ship code. Developers must be meticulous to match production, and DevOps must meticulously maintain a production environment that works with the code base.

Docker delivers an alternative to this, a brighter future. By making docker part of the development process, we capture the assumptions that developers are making in [Dockerfiles](https://docs.docker.com/reference/builder/). This is the developer owning the stack. These Dockerfiles become images which can be shipped as containers. The responsibility of maintaining the production stack shifts from the DevOps team to the developers.

The years of experience your DevOps team has in configuring your stack is still hugely valuable, that experience will translate into pull requests against your developer’s Dockerfiles. The advantage of shifting the responsibility of the stack to the developers is that your DevOps team no longer has to worry about getting code to work in production, it is already guaranteed to work if it worked in development. DevOps can now focus on getting containers from development, through continuous integration, and into production quickly and safely.

To take a look at the work I have been doing to help developers own their own stacks with Node.js, take a look at my next article [here]().
