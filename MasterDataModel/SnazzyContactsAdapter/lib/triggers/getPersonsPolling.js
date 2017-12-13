"use strict";
const request = require('request-promise');
const messages = require('elasticio-node').messages;

const snazzy = require('../actions/snazzy.js');

exports.process = processTrigger;

/**
 *  This method will be called from elastic.io platform providing following data
 *
 * @param msg
 * @param cfg
 */
function processTrigger(msg, cfg) {

  let contacts = [];
  let self = this;

// Create a session in snazzycontacts and then make a post request to get all persons saved by a specific user in snazzycontacts
  snazzy.createSession(cfg, () => {

    let apiKey = cfg.apikey;
    let cookie = cfg.mp_cookie;
    let uri = `https://snazzycontacts.com/mp_contact/json_respond/address_contactperson/json_mainview?&mp_cookie=${cookie}`;

    let requestOptions = {
      json: {
        max_hits: 100,
        print_address_data_only: 1
      },
      headers: {
        'X-API-KEY': apiKey
      }
    };

    // Make a post request to get all persons saved by a specific user in snazzycontacts
    request.post(uri, requestOptions)
    .then((res) => {
      contacts = res.content;
      emitData();
    }, (err) => {
      emitError();
    });

  });

  // Emit data from promise depending on the result
  function emitData() {
    let data = messages.newMessageWithBody({
      "persons": contacts
    });
    console.log('Emitdata: '+ JSON.stringify(data, undefined, 2));
    self.emit('data', data);
  }

  function emitError(e) {
    console.log(`ERROR: ${e}`);

    self.emit('error', e);
  }
}