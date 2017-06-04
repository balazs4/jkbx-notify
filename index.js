const request = require('request-promise-native');

module.exports = ({ publish }) => async ({ payload, topic }) => {
  const title = payload['media-title'];

  const item = await request(`${process.env.SONGINFO}/${title}`, {
    method: 'GET',
    json: true,
    resolveWithFullResponse: true,
    simple: false
  });

  const { body: { artist, album, title, year, cover64 } } = item;

  const msg = {
    icon: cover64,
    title,
    body: [`by ${artist}`, `from ${album}`, year].join('\n')
  };
  await publish('/jukebox/notification', msg);
};
