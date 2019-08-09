@title|Dynamic Middleware in Node.js
@created|20190809

_A.K.A.: Creating Knobs and Levers for Operating Node.js Services at Runtime_

# Context

If you came for a tutorial, skip ahead to the next section!

## What do I mean when I say “making middleware dynamic?”

Many Node.js web frameworks use [middleware](https://expressjs.com/en/guide/using-middleware.html). These have access to the request and response objects at specific points during the request-response cycle. Often times, middleware are created using constructor functions that take a configuration object. When I say I want to make middleware dynamic, I mean I want to change a middleware configuration (changing it’s behavior) after it’s been created, and I want to have those changes take effect immediately, all without having to cut a release and do a deploy.

The example I are going to use for this post: I have a middleware handler [bodyParser](http://restify.com/docs/plugins-api/#bodyparser) that buffers a request payload into memory and deserializes it. One of the configuration options for this middleware places an upper limit on the size of the request payload, responding with a 413 if that limit is exceeded.

## Why would I want to change behavior at runtime?

There are some values, particularly values controling infrastructure operations, that are handy to be able to tune at runtime. Load shedding is a good example where real world events and user behavior can change request patterns in a valid way that breaks the expectations of your load shedding implementation. When in the midst of an incident like this, being able to tune the load shedding configuration without have to cut a release and deploy is pretty handy!

An example of when this came in handy was when I took a pass at CPU based load shedding in Node.js. You can see the implementation for this load shedding algorithm in action [here](https://retrohacker.github.io/ls-live-test/). CPU based load shedding was built on the assumption that process saturation and cpu utilization were roughly equivalent. Since Node.js uses an event loop, and I had assumed all work was being done on the event loop, I believed the amount of “room” a process had left to handle requests could be measured by how much of the CPU was left un-utilized. I set a target to track for CPU utilization, and started shedding requests when that limit was exceeded.

This approach worked great for most services, but one day a native module started doing a considerable amount of work outside of the event loop. This resulted in CPU spiking while the service’s ability to handle requests was (mostly) unaffected. That didn’t stop the load shedding algorithm from dropping >50% of all requests on the floor!

Since this module was wired up to 

## But this skips your CI/CD process!

Yes, and that is the point. I want to make a configuration dynamic with a well defined range of valid values and unit tests checked into version control. This means the behavior I'm changing at runtime is well defined and well tested. On the other hand - during an incident - if I were to make a quick code change and try to ship it, I would either (a) have to spend extra time writing a test suite and doing proper code review for the change while delaying the outage or (b) skip all of my normal safety checks and ship an unreviewed/untested change to production.

I'd rather test this upfront and create a dynamic configuration I can change on a moments notice than ship a change during a partial outage that may make a bad situation worse!

# Let’s get to it!

I’ve explored quite a few ways of making middleware dynamic at runtime and, for now, have settled on hot-swapping the middleware when I want to reconfigure it. This approach has several benefits:

* Works the same across multiple web frameworks.
* Requires no code changes to the web framework or middleware plugin. No PRs for adding support!
* Places the dynamic bits alongside instantiation, making the behavior explicit when reading the code.
* Have found it has a low performance overhead in my benchmarks

So let’s start with a stripped down implementation to demonstrate the approach:

```js
let maxBodySize = config.get('maxBodySize');
// create references to the middleware I want to make dynamic
let [bodyReader, bodyParser] = bodyParser({maxBodySize});
// when the config changes, update the references
config.on('update:maxBodySize', function (maxBodySize) {
  [bodyReader, bodyParser] = restify.plugins.bodyParser({ maxBodySize });
});
/* Instead of passing the middleware directly to the server I instead create a
 * wrapper middleware that proxies invocations to the references I created
 * above. Then, when an update happens, I can swap out the middleware the
 * references point to and, voilà, I have a dynamic middleware! */ 
server.use((...args) => bodyReader(...args));
server.use((...args) => bodyParser(...args)); 
```

Now let’s talk error handling. This code gets executed on every request. If this breaks, I could drop every request on the floor, effectively causing a complete outage. The consequences here are high!

Some questions our code needs to answer:
* What does valid input look like?
* What do we do when we receive invalid input?
* How do we notify folks that we’ve received invalid input?

The last point is critical. While we can implement all sorts of error handling to protect ourselves from invalid input, that doesn’t make invalid input any less invalid. At the end of the day, if we receive an invalid value for `maxBodySize`, something is terribly wrong and someone needs to do something to fix it!

## Define Valid Input

Let’s first define what valid input looks like:
* Parsable by [`_.toNumber`](https://lodash.com/docs#toNumber) (I’ve found lodash’s implementation of `toNumber` handles edge cases really well for this use case)
* Greater than 0 (a negative number here is nonsensical - you can’t have a negative payload size!)

Filtering out values that are invalid can be summed up with:

```js
!_.toNumber(maxBodySize) || _.toNumber(maxBodySize) < 0
```

## Handling Invalid Input

If you look at the implementation above, there are two places where we receive input:
* When the service starts
* When the configuration is updated

For the first case - handling invalid configuration values when the process starts up - my initial thought was to treat this value the same as all of the other configuration options. I normally use the assert-plus module to validate that the input meets expectations - throwing an exception and crashing the process if it fails validation. Most configs are expected to be static, they are either directly checked into version control via a configuration file or are set using an environment variable provided by the deployment pipelines. This means that these configs go through our normal testing, canary, and deployment process. Crashing here is fine, since it gives us quick feedback that something is wrong before a change is rolled out to all of production.

`maxBodySize` is different, I expect it to be provided by an external service at runtime in some cases. This bypasses our normal deployment process, meaning it could impact all of production without warning. If an invalid value is pulled from the external service at process start, crashing the process will cause the process to be restarted, but the value will still be the same! This causes the process to go into an infinite loop of crashing and restarting. To put this another way, refusing to start when this value is invalid could translate into 100% downtime, not a great outcome!

Instead of asserting on the value at startup, I instead decided to fallback to a safe default value if it is unable to use the one provided. I chose `Number.MAX_SAFE_INTEGER`, which comes out to ~9 petabytes. This is a value so large that, in practice, all requests will be accepted. So, if I see an invalid value when starting up, I will accept requests of any size.

So now onto the next point, what to do when the configuration is changed to an invalid value after startup? Well, up until we received this value, our service had been chugging along handling requests with a valid middleware configuration! When we get a new value, we don’t have enough context to understand the intent of that value; was it trying to increase or decrease `maxBodySize`? Instead of trying to make an assumption about intent, we instead make no decision at all! We leave the previously configured middleware as is, and ignore the new value.

## Alerting and Logs

The purpose of this feature is to support quick mitigation when we discover the value of `maxBodySize` is incorrect for a use case. This means we expect this value to only be changed when someone is attempting to mitigate an incident. If you are the on-call engineer responding to the incident, and you accidentally provide an invalid value, you want to know! So how do we make that happen?

Our first line of defense is our alert tooling. Whenever we receive an invalid value, we publish a time series tagged with that value. Our metrics library includes tags for the instance as well (region, container id, service name, etc.):

```js
atlas
  .counter('nq.invalidProperty', {
    property: PROPERTIES_KEY_BODY_PARSER_MAX_BODY_SIZE,
    value: String(newMaxBodySize)
  })
  .increment();
```

We then created an alert that fires for any non-zero value published to these time-series. Since this time series is tagged with the container information, we can quickly see which services, clusters, regions, and individual instances are impacted. This lets us quickly identify the scope that the invalid property was applied to! And since the time-series is tagged with the invalid value, we also can see what the invalid property was, all from our alert!

We also leave a trail of logs. When a value is being updated, we log the provided value:

```js
log.info({ maxBodySize: String(newMaxBodySize) }, 'updating maxBodySize');
```

We log when we detect an invalid value at runtime:

```js
log.error(
  {
    maxBodySize: String(newMaxBodySize),
    parsedValue: String(parsedValue)
  },
  'invalid maxBodySize, ignoring'
);
```

And when we detect an invalid value at process start:

```js
log.error(
  {
    maxBodySize: String(newMaxBodySize),
    parsedValue: String(parsedValue),
    fallbackValue: String(fallbackValue)
  },
  'invalid maxBodySize, using fallback'
);
```

This allows us to go back after an incident and see the behavior of this module within the context of the rest of the process. If behavior of the service seems weird after updating this value, I can go to the logs and see:
* What requests are being handled by the service
* What requests are being rejected by this middleware
* What the value was set to
* Which error handling paths were executed

This can give us a pretty good understanding of why a service is behaving the way it is when maxBodySize is changed.

# Show me the code!

This is the final run in production copied verbatim from the NodeQuark repository as of February 2019. I hope you have fun studying it! Let me know what you think by tweeting @retrohack3r!

    const maxBodySize = config.get('maxBodySize');

    // Get middleware that are configured using the initial value for
    // maxBodySize load shedding. we can swap out these references at runtime
    // with new middleware to change the behavior dynamically in response
    // to updated config value
    let [bodyReader, bodyParser] = initMiddleware(maxBodySize, true);

    // Create a little factory that spits out bodyReaders and bodyParsers
    // allowing these to be dynamically re-created at runtime in response to
    // an updated config value
    function initMiddleware(newMaxBodySize, fallback) {
      log.info({ maxBodySize: String(newMaxBodySize) }, 'updating maxBodySize');
      // We want to be explicit here, in the event that we are passed an
      // invalid value, we turn off large payload shedding by saying any
      // payload size is valid.
      const fallbackValue = Number.MAX_SAFE_INTEGER;

      const bodyParserPlugin = restify.plugins.bodyParser;

      // Force max body size into an integer, this returns NaN (a falsy value)
      // if it fails, which we handle in the next if statement.
      let parsedValue = _.toNumber(newMaxBodySize);

      // If we get an invalid value for this config, ignore it but leave a log
      // trail so that we can trigger a page. This value is expected to always
      // be a positive integer! If not, something is seriously wrong and we
      // need to know!
      if (!parsedValue || parsedValue < 0) {
        //  First, emit a metric to atlas so we can wire it up to our pager.
        //  Since this should never be emitted under normal conditions, and
        //  when it is emitted the values will all be consistent across the
        //  scope an invalid property is applied, the dimensionality of
        //  newMaxBodySize should be relatively small and the number of time
        //  series this generates should be single digits (often 0). In this
        //  case, including it in atlas should be low cost.
        atlas
          .counter('nq.invalidProperty', {
            property: 'maxBodySize',
            value: String(newMaxBodySize)
          })
          .increment();
        // If this is happening at runtime, we want to leave the old middleware
        // in place instead of changing behavior. To put this another way, if
        // we are given a nonsense value we make _no decisions_ and instead
        // continue operating the way we have been. It seems the safest
        // decision to make is to make no decision at all!
        if (!fallback) {
          log.error(
            {
              maxBodySize: String(newMaxBodySize),
              parsedValue: String(parsedValue)
            },
            'invalid maxBodySize, ignoring'
          );
          return [bodyReader, bodyParser];
        }
        // If this was the initial value we read at boot time, instead of
        // refusing to start, start with this module disabled and set it up
        // so that we can be paged to respond.
        log.error(
          {
            maxBodySize: String(newMaxBodySize),
            parsedValue: String(parsedValue),
            fallbackValue: String(fallbackValue)
          },
          'invalid maxBodySize, using fallback'
        );
        parsedValue = fallbackValue;
      }
      // Returns [ bodyReader, bodyParser ]
      return bodyParserPlugin({ maxBodySize: parsedValue });
    }

    // The order of these two .use functions is _important_! We must first read
    // in the body _before_ we try parsing, otherwise the payload will be left
    // un-parsed!
    server.use(function initBodyReader(...args) {
      return bodyReader(...args);
    });

    server.use(function initBodyParser(...args) {
      return bodyParser(...args);
    });

    // Whenever this value is changed at runtime, we create new middleware
    // handlers and update their values.
    config.on(`update:maxBodySize`, function(key, val) {
        [bodyReader, bodyParser] = initMiddleware(val, false);
      }
    );

# Warning: Thar be Dragons

While I mentioned it above, it’s worth stating explicitly here: the consequences of this pattern can be high!

Since providing configuration values this way bypasses the normal deployment process, they have far fewer safety rails than baking configuration directly into the service. To drive this point home, I have seen large outages in the past caused by a bad dynamic configuration value being handled incorrectly by a service.

While we’ve taken a lot of care in this approach to handling configuration at runtime, this is still a trade-off. Being able to quickly roll out a new config this way can dramatically reduce the time it takes to mitigate an incident, but it can also cause an incident!
