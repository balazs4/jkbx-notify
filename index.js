const log = require('debug')('jukebox-songinfo');
const request = require('request-promise-native');

module.exports = ({ publish }) => async ({ payload, topic }) => {
  const { metadata, filename } = payload;

  if (filename === null || filename === undefined) {
    return; // probably the jukebox is about to stop, so just ignore it
  }

  if (metadata === null || metadata === undefined) {
    return;
  }

  const term = metadata['icy-title'];

  if (term === null || term === undefined || term === '') {
    return;
  }

  log(`Requesting information for '${term}'...`);

  const item = await request(`${process.env.SONGINFO}/${term}`, {
    method: 'GET',
    json: true,
    resolveWithFullResponse: true,
    simple: false
  });

  const prefix = term == payload['media-title'] ? 'NEXT' : 'NOW';
  const source = metadata['icy-name'] === 'STAR FM From Hell'
    ? `${prefix} on ${metadata['icy-name']}`
    : metadata['icy-name'];

  let msg = {
    title: term,
    body: source
  };

  if (item.statusCode === 200) {
    const { body: { artist, album, title, release_date, cover } } = item;

    await publish('/jukebox/songinfo', {
      title,
      artist,
      album,
      release_date,
      cover
    });

    msg = {
      iconUrl: cover,
      title,
      body: [`by ${artist}`, `from ${album}`, release_date, source].join('\n')
    };
  }

  await publish('/jukebox/notification', msg);
};
