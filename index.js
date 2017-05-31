const request = require('request-promise-native');

module.exports = ({ publish }) => ({ payload, topic }) => {
  // check local cache process.env.DB
  // if payload already exists publish the value from the cache to /jkbx/songinfo
  // else hit spotfire server with the payload and publish the response to the /jkbx/songinfo
};
