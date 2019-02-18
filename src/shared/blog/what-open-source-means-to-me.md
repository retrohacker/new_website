@title|What Open Source Means to Me
@created|20180717

I've noticed a significant shift in my views on open source. I was blind to the shift while it was happening, but in retrospect it is fairly clear. The perfect storm of having read bunny's [The Hardware Hacker](https://nostarch.com/hardwarehacker) and seeing a [twitter thread](https://twitter.com/reconbot/status/1019247536463327232) got me thinking that it was time to write my thoughts down. I'm sure my views on open source aren't done changing, but maybe future me will find this snapshot entertaining.

# How it Started

I came from modest means. As a kid, when I was first introduced to open source, I was interested _solely_ in the price of the software: free. Open source (and freemium software) gave me access to the means of production, which meant I could _afford_ to do software development. Having these tools gave me extreme economic mobility. I attribute a vast majority of my where I am today to having free access to the tools necessary to enter the field of software development; the remainder I attribute to pure luck.

To drive this point home, I've always been interested in hardware. I've always _wanted_ to build physical things, but I've only very recently started. In retrospect, this was because making software was _free_ but making hardware was prohibitively expensive. So far I've made a few toys, they are fun but are far from anything practical. I've invested hundreds of dollars in equipment and hardware to get here. That wasn't possible when I was a kid.

# How I've changed

The economic mobility that was afforded to me by free - as in "free beer" - software has brought me to a point where I am (almost) financially stable. I have expendable income where I can afford to pay for "professional licenses" of freemium software, and I can afford to pay full price for proprietary software. Even though I now have this luxury, I still _choose_ to avoid proprietary systems as much as possible.

My laptop is a well understood piece of proprietary hardware from 2018 (the Lenovo X200T). While it is "proprietary," it has been in the open long enough that the hardware is well understood and it can be extended, repaired, and modified as necessary - though perhaps not to the extent that a [novena](https://www.crowdsupply.com/sutajio-kosagi/novena) could. It runs [Libreboot](https://libreboot.org/); avoiding a proprietary boot loader allows me to do [awesome stuff](https://libreboot.org/docs/gnulinux/encrypted_debian.html) with my boot partition that would otherwise be incredibly difficult - which translates into impossible for most users, myself included. The OS and userspace is 100% open source: Debian with no binary blobs. The only proprietary software on my laptop is software where I personally have access to the source: tools built by the company I work at.

My laptop is mine. I have full domain over it.

Sometimes when talking about why I choose this hardware/software I feel silly: I've invested an incredible amount of time and effort into this system and I prevent myself from enjoying some of the more "cutting edge" tools in the industry. But then I think about how I feel when I use alternative systems like OSX. When something doesn't work the way I want it on _my_ laptop, I know that I _can_ change it if I have enough time. In the process of changing it, I will learn an incredible amount along the way. With my setup **I control my device**. On OSX that isn't true, **that device controls me**.

The significant change in my behavior now, compared to when I was a kid, is that I no longer use "freemium" software and I avoid binary blobs wherever I can - also I know what a "binary blob" is, I didn't when I was a kid!

_Note: The exception to this is my web browser, the web is [fundamentally broken](https://www.gnu.org/philosophy/javascript-trap.html) as a platform for freedom respecting software._

# Open Source is NOT about the Source Code

I don't believe open source was ever about source code. I believe that when we try to make open source about the source code we see terrible behaviors emerge. Large companies co-opt open source projects expecting the community to deal with the cost of maintenance. Maintainers are under paid, burned out, and abused. Using an open source project is often viewed as a line item savings. Likewise, companies open source projects as a way to supplement staffing issues. Open Source Evangelists are tasked with cultivating community engagement; companies expect that every dollar they are spending on evangelism is amplified by free community contributions to their code base.

I think that when we make open source about the code, it will always be viewed as a way to generate/consume code without spending as much money. It will be viewed by many companies the same way that I viewed it as a kid: open source is free beer.

So if open source isn't about source code, then what is it about?

# Open Source is about FREEDOM

When part of the "free software" community [split off into the open source community](https://www.gnu.org/philosophy/free-software-for-freedom.en.html), we lost a large part of what free software was all about. I personally don't care what we call it - free software, freedom respecting software, open source - the core philosophy in my eyes are the same even if a large part of the community is blind to it: _Freedom respecting_ licenses give the user domain over their products.

The right to modify, extend, automate, repair, and understand the devices we use in our everyday lives should be a fundamental right as a consumer. These rights are increasingly being stripped from us by over-reaching intellectual property laws. Technology massively influences our society, and is a large part of everyday life for most of us in the developed world, however we are increasingly being distanced from the right to access and understand this technology. Google sums this up well in their [SRE book](https://landing.google.com/sre/book.html).

> While other organizations might have an important piece of equipment without a readily accessible API, software for which no source code is available, or another impediment to complete control over production operations, Google generally avoids such scenarios. We have built APIs for systems when no API was available from the vendor. Even though purchasing software for a particular task would have been much cheaper in the short term, we chose to write our own solutions, because doing so produced APIs with the potential for much greater long-term benefits.

_Note: It is interesting that Google's culture values the right to extend, modify, repair, and automate their systems but they don't generally afford that same right to their customers!_

Open Source licenses, true freedom respecting licenses, push back against this trend of diminishing consumer rights. They return the right to have domain over technology to the consumer. As consumers, it is critical that we exercise, invest, and defend our rights.

# Corollary: Source Code is NOT Enough

Having a license that offers you domain over a product, and having access to the source code for that product, is a great start. If everything we owned came with this, I believe society would function much better. But this is not sufficient for giving you true domain over your products.

Having access to source code that is obscure, poorly documented, and hard to compile in theory _allows_ users to take control of their devices but it still is prohibitively hard for a vast majority of users. Most user's aren't technical, they don't spend 7 hours a day 5 days a week working on building technology. In order to truly realize the goals of the freedom respecting devices movement, we need to invest in better education, better documentation, and build our software/hardware in such a way that it is _easy_ to open and work with.

Only when the typical user is empowered to have full domain over their devices will we have succeeded in truly liberating consumers.
