'use strict';

// Weather Example
// See https://wit.ai/sungkim/weather/stories and https://wit.ai/docs/quickstart
const Wit = require('node-wit').Wit;
const FB = require('./facebook.js');
const Config = require('./const.js');

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

// Bot actions
const actions = {
  say(sessionId, context, message, cb) {
    console.log("say:"+ message);

    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to from context
    // TODO: need to get Facebook user name
    const recipientId = context._fbid_;
    if (recipientId == 799299196845551){
      // Let's give the wheel back to our bot
      cb();
    } else if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      FB.fbMessage(recipientId, message, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err
          );
        }

        // Let's give the wheel back to our bot
        cb();
      });
    } else {
      console.log('Oops! Couldn\'t find user in context:', context);
      // Giving the wheel back to our bot
      cb();
    }
  },
  merge(sessionId, context, entities, message, cb) {
    console.log(entities);
    console.log(context);
    console.log("merge: " + message);
    // Retrieve the location entity and store it into a context field
    if (firstEntityValue(entities, 'seguro')) {
      context.insurance = firstEntityValue(entities, 'seguro'); // store it in context
    }
    if (firstEntityValue(entities, 'nome')) {
      context.name = firstEntityValue(entities, 'nome');; // store it in context
    }
    if (firstEntityValue(entities, 'age_of_person')) {
      context.age = firstEntityValue(entities, 'age_of_person'); // store it in context
    }
    if (firstEntityValue(entities, 'carroModelo')) {
      context.carModel = firstEntityValue(entities, 'carroModelo'); // store it in context
    }
    cb(context);
  },

  error(sessionId, context, error) {
    console.log(error.message);
  },

  // fetch-weather bot executes
  ['fetch-insurance'](sessionId, context, cb) {
    // Here should go the api call, e.g.:
    // context.forecast = apiCall(context.loc)
    context.insuranceValue = '2950.00';
    context.done = true;
    cb(context);
  },
};


const getWit = () => {
  return new Wit(Config.WIT_TOKEN, actions);
};

exports.getWit = getWit;

// bot testing mode
// http://stackoverflow.com/questions/6398196
if (require.main === module) {
  console.log("Bot testing mode.");
  const client = getWit();
  client.interactive();
}