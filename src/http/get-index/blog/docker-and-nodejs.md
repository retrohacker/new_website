@title|Docker and Node.js
@created|20150913

Cross post from [https://nodesource.com/blog/dockerizing-nodejs](https://nodesource.com/blog/dockerizing-nodejs)

The barriers between developers and operations are slowly eroding, creating a healthy environment of rapid iteration, continuous integration, and horizontal scaling. Increasingly, the tools of choice when breaking down that barrier are powered by open source software that promise openness, power and freedom to see their technology and business dreams realized. This is what brought many of us to Node.js and Docker in the first place.

But as the pace of innovation has increased, the mission of creating a “full-stack” development shop has broadened to a need for a full-stack dev/DevOps/deployment organization. Docker will increasingly become a common part of that stack.

So, what do we get out of Dockerizing Node.js?

# Documenting dependencies beyond Node/npm

Part of the great appeal of Node.js is that it has a large, rich and [massive](https://medium.com/@nodesource/npm-is-massive-2bdd9417591c) package ecosystem. The management of Node module dependencies through npm is one of factors that give the platform and community such vitality.

But there are many system dependencies outside of what npm tracks that can greatly affect the operation of your Node applications. This includes libraries like graphicsmagick, curl, git, libncurses, etc. that are provided through the operating system's package manager. Docker enables you to document these system dependencies in a fairly straightforward way using a Dockerfile.

# Deploying Node Apps that “Just Work”

What many people like about Docker is that it shifts the responsibility of maintaining implicit service dependencies from the operations team to the developer. This enables the developer to capture their assumptions about infrastructure in their code, assumptions they may not have known they were making otherwise.  This is done through a combination of the Dockerfile mentioned above and the docker-compose.yml file which captures the infrastructure requirements and interdependencies of your services.

This fits in pretty well with the Node.js ethos: developers wanting to be more directly involved in the success of their applications. Frontend developers have expanded their world view to the backend. Likewise, Node developers (especially those that work in more agile, new generation software shops) are more invested in the runtime environment of their innovations, and the speed at which their code can reach end users. The collaborative nature of Node teams makes Docker a very attractive addition to their skill sets. And when developers are more invested in understanding both Node and non-Node dependencies and infrastructure, they are more likely to create applications that just work.

# Docker in Production

Finally, the most important point I can make about Docker and Node.js is that you don’t need to run Docker in production to realize real benefits. And what I mean by that\.\.\.

\.\.\.will be made abundantly clear in my upcoming Need to Node webinar:

>**Dockerizing Your Node.js Infrastructure**<br>
>*with William Blankenship*<br>
>Thursday September 17, 2015<br>
>10am PT<br>
>[Register](http://nsrc.io/1hYDgOo)

\#CliffHanger #NeedtoNode
