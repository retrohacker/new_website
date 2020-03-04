@title|Simplifying flow with early returns
@created|20200220

I spend most of my time reading and modifying code, only a small portion of it writing code from scratch. When I break ground on new code, I spend quite a bit of time trying to reason about how understandable it's structure will be to future programmers (myself included!).

I feel a program should read like a story - line by line it should tell you what the program is going to do when it runs. The closer I can bring my code into being a linear set of steps that I can follow from top to bottom, the easier it will be for me to grok in the future.

Take this trivial function for example:

```js
async function loadConfig() {
  const [ error, config ] = await readYaml('./config')
  // If we didn't run into an error, try parsing the config
  if(!error) {
    // Parse wibbles
    for(let i = 0; i < config.wibbles.length; i++) {
      // Is the wibble a wobble?
      if (isWobble(config.wibbles[i])) {
        config.wibbles[i] = parseWobble(config.wibbles[i]);
      // Is the wibble a ruble?
      } else if (isRuble(config.wibbles[i])) {
        config.wibbles[i] = parseRuble(config.wibbles[i]);
      // If the wibble isn't a wobble or ruble, abort!
      } else {
        return [ new Error('Invalid wibble!') ];
      }
    }
    // Woo! We have a valid config!
    return config;
  // If there is something wrong with the config file, abort!
  } else {
    return [ error ];
  }
}
```

To understand what is going on in this function block, your eyes have to dart around a bunch. There is a lot of state you have to build up in your head about what is happening. This is where early returns come into play. Returning early allows us to signal that, after this point in our code, a certain state is no longer relevant. It allows us to assert truths about our program as we build up state. Let's give it a try:

```js
async function loadConfig() {
  const [ error, config ] = await readYaml('./config')

  // If there is something wrong with the config file, abort!
  if(error) {
    return [ error ];
  }

  // Parse wibbles
  for(let i = 0; i < config.wibbles.length; i++) {
    // Is the wibble a wobble?
    if (isWobble(config.wibbles[i])) {
      config.wibbles[i] = parseWobble(config.wibbles[i]);
    // Is the wibble a ruble?
    } else if (isRuble(config.wibbles[i])) {
      config.wibbles[i] = parseRuble(config.wibbles[i]);
    // If the wibble isn't a wobble or ruble, abort!
    } else {
      return [ new Error('Invalid wibble!') ];
    }
  }

  // Woo! We have a valid config!
  return config;
}
```

This is cool! We removed a level of indentation! We also have the added benefit of clearly showing what our function is expected to return: the last line of our function returns a config assuming we don't encounter any errors! But there is still something that doesn't sit right with me: we have a return condition inside a for-loop. While this may not seem agregious at the surface, returning early inside nested flow control blocks obscures the state of your program for future developers. A future developer may come along and put some super critical piece of code after this for loop that they expect to _always_ run. In this trivial example, it's unlikely that we will miss our invalid wibble statement, but for more complex functions it can be easy to miss a nested early return. Because of this, I only do early returns from the top level of my function. So let's update our example:


```js
async function loadConfig() {
  const [ error, config ] = await readYaml('./config')

  // If there is something wrong with the config file, abort!
  if(error) {
    return [ error ];
  }

  // Parse wibbles
  let invalidWibble = false;
  for(let i = 0; i < config.wibbles.length; i++) {
    // Is the wibble a wobble?
    if (isWobble(config.wibbles[i])) {
      config.wibbles[i] = parseWobble(config.wibbles[i]);
      continue;
    }

    // Is the wibble a ruble?
    if (isRuble(config.wibbles[i])) {
      config.wibbles[i] = parseRuble(config.wibbles[i]);
      continue;
    }

    // If we reach this point, we can't parse the wibble
    invalidWibble = true;
    break;
  }

  // If a wibble is invalid, abort!
  if(invalidWibble) {
    return [ new Error('Invalid wibble!') ];
  }

  // Woo! We have a valid config!
  return config;
}
```

Cool! Now, hopefully, it's a lot more clear to a future reader that the function will abort when it encounters an invalid wibble!
