@title|Stop Saying Technical Debt!
@created|20190226

# Problems with Technical Debt

## Debt is a Four Letter Word

Technical debt is a negative word. It immediately frames the work as shitty but necessary.

Nobody likes technical debt. Very few people appreciate the work necessary to address technical debt. Most people don’t want to work on addressing technical debt, because the people around them don’t appreciate that work!

## Debt is the Wrong Word

The word “debt” carries with it a ton of cruft that has no business being in the conversation when talking about tooling, architecture, etc.

Let’s look at the definition of debt:

> 1 : SIN, TRESPASS
> 2 : something owed : OBLIGATION
> 3 : a state of being under obligation to pay or repay someone or something in return for something received : a state of owing
> 4 law, business : the common-law action for the recovery of money held to be due

The first definition implies that you’ve done something wrong, and you must account for your transgressions. But who have you transgressed? The company? The product? The users?

The other three imply you’ve taken out a loan, and it’s time to make a payment. Who is collecting the payment? Who is demanding payment? Why?

There are multiple ways for what folks call “technical debt” to accumulate in a system, and very rarely do they look anything like taking out a loan upfront or committing a wrong. Design decisions that were a perfect fit 2 years ago may no longer be a good fit for the company’s changing needs. Years of “quick fixes” that were great in isolation can take their toll on a system. Better tools become available as the industry moves forward. “Debt” doesn’t adequately describe these.

## Technical Debt isn’t Measurable

Technical debt is the thing that goes “bump” in the night. We never see it directly, but it makes us super uncomfortable and we spend a lot of time thinking about it.

Unlike the average American’s pile of credit card debt, technical debt is incredibly difficult to quantify. At worst, teams use it to justify migrating to trendy new tech having no measurement of the problem or a baseline for what success looks like. At best, teams can measure its symptoms. It’s incredibly difficult to go from the phrase “technical debt” to a value proposition for the business.

> “Our tests are flakey, tech debt!”

> “Our pager keeps going off, tech debt!”

> “We don’t use [trendy new thing], tech debt!”

Engineering work is an investment, and there should be a return on that investment. The phrase “technical debt” is all about the investment. Instead, use phrases that are about the return!

## Technical Debt Doesn’t Get Done

Because "technical debt” is a negative word that carries a lot of distracting cruft and isn’t measurable, the work necessary to address it almost always ends up being at odds with business objectives.

Engineers frequently find themselves fighting tooth-and-nail to get the time and space necessary to work on addressing technical debt. At best, the work is poorly prioritized and never happens. At worst, the work is something folks take on themselves - sacrificing their work/life balance - by working nights and weekends.

There is a better way!

# Talk About Value to the Business

When it comes to getting buy-in for engineering work, you need to align incentives. The motivations your team has for investing in tooling and architecture are likely valid, but they need to be framed with their value propositions front and center. Use words and phrases that describe the value proposition to the business. Take measurements of the problem you are trying to address and set clear definitions of success.

This approach puts the business on your side. Your team wants to do something that provides clear and measurable value, and that value can be weighed against the other objectives of the company. This sets everyone up for success since the data fosters an environment for having trade-off conversations. When the work doesn’t get prioritized there should be good reasons for that!

## Velocity Play

Long build times, flakey tests, heavily manual processes - these impact your team’s ability to get stuff done. That impact can be measured: how much time do you spend getting things done vs. fighting your development workflow and architecture. The business value of addressing this? Your team will be able to get more done in less time; you are unlocking velocity! The project velocity you unlock should justify the upfront investment for this work.

There are many ways to help your team move faster. Tightening feedback loops (thorough tests, canaries, 1% traffic tests) allow teams to innovate faster by getting feedback on changes quickly. Reducing support burdens through resilient processes and self-service tooling frees up folks to work on product innovation. Reducing opportunities for distraction by reducing the time tests take to run, boilerplate takes to generate, and deployments take to get to production keeps your team’s eyes on the work they are doing and off of twitter/slack/email.

Instead of calling this “technical debt” and asking for time to work on it, try stuff like:

> “Our builds and deployments aren’t consistent. We spend more time debugging production issues and helping developers get their builds working than we do working on new features as a result. Give us a quarter to address this, and the amount of feature work we get done in the following quarter will justify that investment.”

> “Our development process is heavily manual. Most of our features are similar, but the scaffolding and boilerplate necessary to implement them is expensive to set-up. On top of that, our tests take a long time to run. We spend more time context switching while waiting for tasks to finish than we do actually working. Give us a few weeks to address this and we can move faster!”

## Availability Play

Problems that are difficult to debug, scheduled maintenance, outages you learn about through twitier - these impact your product’s user experience. This can be measured by its impact on the user experience, user retention, and revenue.

In addition, if your team is constantly fire-fighting, it is taking time away from feature work. The value of the availability wins you unlock, and the time freed up to focus on feature work, should justify the upfront investment for this work.

Instead of calling this “technical debt” and asking for time to work on it, try something like:

> “Our team is constantly putting out fires in production. We are struggling to stay on top of incidents, let alone make any meaningful progress on product innovation. Give us a quarter to address this. In that time, we can improve the overall user experience and free up our time to focus on the product.”

## Mental Health and Quality of Life Play

Noisy pagers with lots of false positives, constant support requests, poor feedback loops, ancient technology - sometimes working on a system just makes life shitty. This can’t always be directly measured, but the effects absolutely can. The sentiment of your team, constantly hearing “I need a vacation,” people quitting, the inability to hire - these are all great indicators that something needs to change. Not to mention, if you are building a culture of trust, investing in improving the quality of life for your team is an excellent way to show that your organization truly cares.

The business value here? People want to work on your projects and at your company. On top of that, people who aren’t suffering from burnout work more effectively!

## Compounding Returns

The remarkable thing about the examples above? They yield compounding returns!

Teams that aren’t suffering from pager fatigue and burnout work more effectively. If you improve the reliability of your system, you can afford to take more risks on innovation. Teams that have more time to do feature work, well they do more feature work!

If you take a portion of the wins from this work and re-invest that time back into improving project velocity, you start seeing compounding returns! Do this enough, with similar strategies in the management chain, and you start seeing a competitive advantage. You can outpace competitors ability to innovate and do it with less hands-on-deck.

# Conclusion

Stop using the phrase “technical debt.” It gets in the way of having proper trade-off conversations about prioritizing important work. Instead, use phrases that frame the work you are doing in terms of the value it delivers to the business. Not only does this help the company prioritize work, but also it helps you improve the quality of your work experience!
