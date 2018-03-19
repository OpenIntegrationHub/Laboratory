"use strict";
const request = require('request-promise');
const messages = require('elasticio-node').messages;

const wice = require('./../actions/wice');

exports.process = processTrigger;

/**
 *  This method will be called from elastic.io platform providing following data
 *
 * @param msg
 * @param cfg
 */
function processTrigger(msg, cfg) {

  let articles = [];
  let self = this;

  // Create a session in wice and then make a request to get all articles

  wice.createSession(cfg, () => {

      let uri = `https://oihwice.wice-net.de/plugin/wp_elasticio_backend/json?method=get_all_articles&cookie=${cfg.cookie}`;
      let requestOptions = {
        uri,
        headers: {
          'X-API-KEY': cfg.apikey
        }
      };
      // Make a get request to get all articles
      request.get(requestOptions).then((res) => {

        let resObj = JSON.parse(res);
        articles = resObj.loop_articles;
        emitData();
        // console.log(`ARTICLES LENGTH:${resObj.loop_addresses.length}`);
        // console.log(JSON.stringify(resObj.loop_addresses, undefined, 2));

      }, (err) => {
        emitError();
      }).catch((e) => {
        console.log(`ERROR: ${e}`);
      });

  });

  // Emit data from promise depending on the result
  function emitData() {
    let data = messages.newMessageWithBody({
      "articles": articles
    });
    console.log('Emit data: '+ JSON.stringify(data, undefined, 2));
    self.emit('data', data);
  }

  function emitError(e) {
    console.log(`ERROR: ${e}`);

    self.emit('error', e);
  }
}