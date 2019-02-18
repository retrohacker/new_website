@title|left-pad and Proper Engineering Principles
@created|20160401

A recent event in the Node.js ecosystem received widespread attention. There has been a surprising amount of logical fallacies, conflation of problems, and general misinformation about what transpired. This post is me throwing my hat in the ring as a voice in the conversation.

In this article, we will separate out each individual conversation that has been taking place around the events of [#npmgate](http://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm), we will put forward the reason it caused as much trouble as it did, and how you could have protected yourself from what transpired. This will be entirely from an engineering perspective. The "people", "legal", and "philisophical" questions will be saved for another time.

# Separation of Concerns

Much of the misunderstanding and borderline panic has been caused by the conflation of several problems. Before we dive into the opinionated section of this piece, I'm going to take a moment to separate out the individual issues that are being discussed, and identify which ones we are going to tackle in this article.

This section isn't meant to be comprehensive, to capture every angle of every viewer of the events that transpired would be an impossible task. Instead, this section summarizes the topics I have seen commented on within the community through my narrow lens known as twitter.

## Issue #1: npm inc's name dispute policy

npm has a documented [dispute policy](https://www.npmjs.com/policies/disputes). This was used in determining who had claim to the package `kik`. While this is something I believe has implications within the Node.js ecosystem, this is a "people" and "legal" problem. It is outside of the scope of this article.

## Issue #2: `unpublish`

The npm registry allows for packages to be unpublished. While I have strong opinions on this topic, it is a philosophical debate. It comes down to code ownership. Is npm a commons as [Forrest Norvell so eloquently put](https://github.com/npm/npm/issues/12045#issuecomment-200976024) or is it something else. What commitments are we making as open source contributors? I may take a pass at this issue in a future blog post, but it is outside of the technical discussion we will be having today.

## Issue #3: 3rd party code in your project

I believe this is the point that has been the most misrepresented throughout this conversation. This will be a central theme of this blog post. We will zero in on the benefits and costs of bringing in 3rd part codebases into your project, and what responsibilities that entails. We will also speak to the relevance of this conversation in regards to the events that transpired.

## Issue #4: The Internet broke

False. You posted about the internet being broken to the internet during the time you claimed the internet was broken. HTTP wasn't broken. Web browsers weren't broken. User facing applications were not broken.

Builds were broken. Builds are not the internet. Builds are not your consumer facing products. Builds breaking do not break the internet. Semantically speaking, what you are referring to as the internet isn't even the internet but I'm not going to be that person.

If your production system came down because of this, you had done something terribly terribly wrong. Yes, two 'terribly's. If you take objection to that statement, read on.

> Note: a valid reason for your production server to have gone down because of this is if your production server is in the business of building and running other people's Node.js applications. Then you have a valid reason for your production system to not function. But even then, this COULD and SHOULD have been mitigated. You too should read on.

This, or a variation of this, was published by many large news outlets including:

* [Business Insider](http://www.businessinsider.com/npm-left-pad-controversy-explained-2016-3)
* [ars technica](http://arstechnica.com/information-technology/2016/03/rage-quit-coder-unpublished-17-lines-of-javascript-and-broke-the-internet/)
* et.al.

## Issue #5: 3rd party services as a single point of failure

And here is the point that I have seen widely missed throughout this conversation. What failed here was not a bug in a 3rd party code dependency. The code in left-pad functions _exactly_ the same today as it did 3 weeks ago.

The failure here was the _exact_ same type of failure as if the npm registry had gone offline during this period. Your builds failed because you failed to protect yourself from a single point of failure that you had no control over. That isn't Azer's fault. That isn't left-pad's fault. That isn't npm's fault. That is your fault.

## Review

What we have done here is extremely important when trying to have a rational conversation about what transpired. We have separated the many discussions that are happening into distinct conversations that we can address individually. In this article, we are going to zero in on issues three and five, while spelling out how you should have been prepared for issue four and why your builds should have been unaffected.

# Bass Drop

Let's tackle the root of the problem head on. It is not third party modules or super simple JavaScript dependencies. It is having a third party service as a single point of failure. This event should not have caught anybody off guard. This section is where we address issue five.

npm `unpublish` is not new. It was not unveiled moments before Azer used it to unpublish left-pad. In fact, it is not unheard of for the entire npm registry to go offline. If you ran `npm install` for an existing project the day that Azer unpublished left-pad, and your build failed, you failed to protect yourself from that known risk.

I have been involved with the Node community for two years now. I vividly remember that, in the first few months of being part of this amazing community, I had a conversation with someone at JSConf. We talked about the possibility of someone running `npm unpublish color` and the catastrophic consequences it would have on the ecosystem. This was a concern at a time where the npm registry was still going offline every so often.

This is something I have personally recommended since that conversation at JSConf. You as a company, or as an individual, are using a third party service that you have absolutely no control over. If continuity of your builds is important to you, you _absolutely_ need to have a buffer between you and that external service. The buffer between you and npm could be as simple as a [squid HTTP cache](http://www.squid-cache.org/) or [`npm --cache-min 999999`](https://github.com/npm/npm/issues/2568) to something as comprehensive as [Artifactory](https://www.jfrog.com/confluence/display/RTF/Npm+Repositories) or [Nexus](https://books.sonatype.com/nexus-book/reference/npm-configuring.html).

Personally, I recommend [registry-static](https://github.com/davglass/registry-static). It has been battle tested by enterprise scale companies, it is entirely open source, and it is able to be backed by a custom datastore. You can drop registry-static on top of S3. Super light-weight, highly available, and guarantees that your build process won't be affected by fluctuations in npm. In response to this event, registry-static now [supports ignoring unpublish requests from the upstream npm registry](https://github.com/davglass/registry-static/pull/65). Running this will protect you from the future removal of modules.


# Code dependencies

I'm going to be rather blunt about the module discussion we are having in the development community: It is fallacious.

Building black boxes that encapsulate functionality is a _fundamental engineering principle_. The act of building black boxes is _exactly_ the practice that has enabled us to build the massively complex systems that we interact with every day.

Not to mention, relying on third party code isn't even what caused this problem in the first place, it was blind trust in a third party service that the individuals affected had no control over.

Here is where we address issue three.

## Black boxes and responsibility

As [Mike Groseclose](https://medium.freecodecamp.com/in-defense-of-hyper-modular-javascript-33934c79e113) put it, the size of the module is a red herring. It doesn't matter if the module is 17 lines of code or 10,000. What matters is that you have a well tested, well thought out, library that you can depend on to perform.

But here is the catch: 3rd party modules are _not_ a delegation of responsibility. You still own _EVERY_ execution pathway in your application. This goes all the way down to the hardware.

CeeJ did a fantastic job of describing this both [here](https://twitter.com/ceejbot/status/712798926462517248) and [here](https://twitter.com/ceejbot/status/712991768103378944).

When you ship to production, the application you are shipping, all of its linked libraries, all of its modules, every system call invocation, even the hardware it is executing on, that is your responsibility.

When the hard disk fails on your local server, that is not Seagate's responsibility, that is yours. You are still responsible for diagnosing and replacing that hard drive to bring that server back up.

When you deploy to AWS, you are not delegating the responsibility of your application's uptime. When an AWS data center goes down, and your application goes down, you are responsible for that downtime.

This is called risk. It is a risk that you own by putting your faith in those products and services.

This is not an inherently bad thing. By taking on these abstractions, from hardware to code, we are reducing the complexity of the layer we are working on and benefiting from the work of many engineers. It is far riskier to handroll solutions ourselves, having limited domain knowledge, than it is to share the collective domain knowledge across an industry to build something that is truly reliable.

## The evolution of small modules

Now for an anecdote.

I vividly remember having a conversation my freshman year in college with a fellow student. This student, like many others, _hated_ JQuery. In fact, this student disapproved of JQuery so much that instead of using it as a dependency, they would hand roll their own solution inline for the problem.

Now, as a learning exercise, this is a great practice. It is a great practice because the best way to learn is to fail, which is exactly what happened. It happened all the time. But this wasn't for a learning exercise. They would do this for consulting work and projects they planned for others to use.

The result? Well it was not good. There were edge cases everywhere that were not handled properly by their code. Across browsers, operating systems, and user behavior patterns, their code would behave in unexpected ways.

Why? Because the understanding of any one engineer within a problem domain is inherently limited unless they have spent an incredible amount of time in that domain. JQuery did an incredible job of addressing this. It was a black box that provided a standard interface for performing actions across different browsers. Those with the knowledge in that domain collectively worked together to capture it in this black box so that everyone could benefit from it.

Why would this student choose to roll their own solution as opposed to using the well-rounded solutions from JQuery? They found it absurd to include a massive dependency when they only needed two or three functions. This was back in 2010, and it was _not_ a unique opinion.

Now lets fast forward to 2016. Quite a bit of effort has been put in by quite a few people to take these utility libraries and break them up into small modules that can individually be required in. Many of these functions are incredibly simple, but that isn't the point. These modules are black boxes that provide an interface to a single function. This directly addresses the problems many people had with these massive libraries.

We now have the best of both worlds. We have a codebase that is heavily tested and contains the collective domain knowledge of a problem, much like JQuery, lodash, and similar projects. We are also able to cherry pick our dependencies to keep what we ship to production small.

## Size doesn't matter

There have been quite a few posts, tweets, and comments digging up small seemingly senseless modules and using them as examples of how we [have forgotten how to code](http://www.haneycodes.net/npm-left-pad-have-we-forgotten-how-to-program/).

Yes, packages like [isArray](https://www.npmjs.com/package/isarray) exist. And yes, looking at the code shows that it is a single line of code. But it is much more than that.

The argument here would be entirely valid if it were framed as "the JavaScript standard library is lacking". This is entirely true. `isArray` should probably have been part of the specification for quite some time, but `Array.isArray` is relatively new to the scene.

Thus it falls to developers to implement this functionality in a cross-browser and backwards compatible way. The one-liner you see there is only one of the [many potential ways](http://stackoverflow.com/questions/4775722/check-if-object-is-array) `isArray` could be implemented.

JavaScript is run on many different interpreters on many different systems in many different ways. The implementation you see in this module, that one-liner, is one of the _only reliable_ methods of checking if an object is an array. Taking a quick look at this module's [readme](https://github.com/juliangruber/isarray#readme), we see that it is tested across 27 browsers by default. Without being a domain expert in JavaScript Array's, you would be hard pressed to make the assertion that your one-line solution to checking an array is both performant and universally valid. This module can make that assertion.

It is a black box that abstracts away all the hard problems of cross-browser compatibility for you. You ask it to do something, it does it, and the only time you care about what is in the box is when it behaves in an unexpected way.

Black boxs, no matter how small and trivial or large and complex, are tasked with encompassing an entire problem domain drawn by that box's API. And that is a good thing.

## Copying and pasting code

This post is getting incredibly long, so I'll try to make this section brief. I've seen the following quote [floating around recently](https://divan.github.io/posts/leftpad_and_go/):

> It's better to have a little duplication than a little dependency

I understand this. This is part of the responsibility conversation that will be continued below. And I agree with this to an extent. If you take on a dependency, you should be prepared to fork it at some point in the future, or even at the moment you bring it into your codebase as a dependency. But a _literal_ copy and paste is a terrible idea.

Why? You loose all version control from the upstream project. At least a git fork allows you to selectively bring in security and performance updates from the upstream project. You can be as involved or uninvolved with this process as you like.

When you copy and paste, you are now tasked with either A) disregarding all updates from the upstream project or B) manually doing the work of a version control system by watching the projects you copied from, where they map to in your codebase, and hand copying the updates in as needed.

Version control exists for a reason. Let it do its job.

## Vetting modules

Now, there is a very valid concern that has been raised regarding depending on third party code: reliability. And many of the arguments made against third party code in the past few days are scarecrow arguments.

These arguments uncover trivial npm modules and use them as representations of modern software development. They then throw stones at this constructed argument. One of the modules that stones have been thrown at isn't all that trivial in the first place.

Let's put the conversation of third part code dependencies in perspective. the Node.js platform is a third party code dependency. As are the go compiler and the Linux kernel. These are projects maintained by third party engineers that many of us implicitly trust to work as described. And they often don't. These third party code bases often behave in unexpected ways, from memory leaks to full-fledged crashing. Yet we gladly take on that risk because writing an operating system and compiler from scratch when breaking ground on a project would be genuinely insane.

Yes, this is, of course, taking the argument to the extreme. That is the point. At some point, you place trust in third party code. The question isn't whether or not to place trust in third party code, the question is: what third party code should I trust?

If you go out into the npm ecosystem, search for "pad string" and `npm install` the first thing you find, you are probably going to have a bad time. You may get lucky, but the quality of your project is going to slowly deteriorate over time with this approach.

Every third-party codebase you bring into your project you _own_. Every codebase from the golang compiler to the `isArray` module, you _own_. You are responsible for your application's behavior when using that codebase. It is not a delegation of responsibility.

So what does this translate into? This means you _must_ have a personal process for vetting the quality of every codebase you are bringing into your project.

Personally, in regards to Node.js modules, I have a list of developers I know produce modules that are high quality. When I'm in need of some functionality, I'll check in with these developer's GitHub repositories to see if they have modules I can bring into my codebase. I do this knowing full well that I will own any bugs in their project if my application uncovers them.

If I find a module on their GitHub, I don't blindly trust it. I start poking around in the code. I look at how they are solving the problem and make sure I agree with the approach. I then look at their `package.json` and make sure it looks like they are doing a similar, sane, vetting process for their dependencies.

If I don't find a module in my group of trusted developers, I search the broader npm ecosystem. If I find some modules that align with what I'm trying to do, I'll inspect them and put them through a thorough vetting process to determine if I can trust these modules.

I won't list the developers I trust, this is a list you need to build yourself, but I usually look for these things in a codebase:

* Near 100% test coverage
* Code is well commented if non-trivial
* Readme is complete and describes the API well
* No transpiling process
* Functions are named
* Rare (ideally no) use of `throw`
* When was the last commit? How many issues have been left unresolved since then?
* Is the license compatible with my license and use?
* and much more

If any of my criteria fail, I write my own module.

Yes, this process takes time, but that is part of being an engineer. I'm not willing to delegate the responsibility of my application. I own the code I'm bringing in as a dependency so I need to know I can trust it. You can't tell that just by reading the project's readme. I strongly suggest you develop a similar set of criteria.

This article is published on April Fools day. There is a takeaway from this unofficial holiday: Trust no one, vet everything. This is a life lesson you should be applying to all of your dependencies.

## The real problems with modules

None of this is to say that Node.js's approach to dependencies is without problems. There are absolutely dragons lurking in the shadows. Every package manager has dragons. I believe Justin Searls does a fantastic job describing the shortcomings in npm and beyond [in this talk](https://www.youtube.com/watch?v=HFRU6eQKp4Y&feature=youtu.be&t=4m48s). Transitive dependencies shift, packages that use singletons have conflicting versions, shrinkwrap isn't always reliable, the list goes on. 

But these valid concerns are entirely tangential to the conversation we are having. The transitive dependency issue he mentions comes close. A dependency shifts versions out from under his project breaking the build. This is what shrinkwrap and even forking can be used for.

But, contained in the conversation he is having, there is a theme totally inline with what is being spelled out here: ownership of dependencies.

# Drops Mic

This is the conclusion of this post. There are some key takeaways you should have from this article:

1. All engineers have limits to their understanding of a single problem domain, no matter how trivial it may seem. Sharing code increases the quality of our applications by sharing the collective domain knowledge across many engineers.
3. You own every execution path of your application, open source is not a delegation of responsibility just like AWS isn't a delegation of uptime.
2. Don't trust a third party service you have no control over. Cache the hell out of it so when the world burns, you are protected.




