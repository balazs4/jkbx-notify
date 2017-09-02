const log = require('debug')('jukebox-songinfo');
const request = require('request-promise-native');

module.exports = ({ publish }) => async ({ payload, topic }) => {
  const { metadata, filename } = payload;

  await publish('/jukebox/i3status', {
    name: 'jukebox',
    full_text: ``
  });

  if (filename === null || filename === undefined) {
    return; // probably the jukebox is about to stop, so just ignore it
  }

  if (metadata === null || metadata === undefined) {
    return;
  }

  const source = metadata['icy-name'];
  const term =
    metadata['icy-title'] || `${metadata['artist']} - ${metadata['title']}`;

  publish('/jukebox/i3status', {
    name: 'jukebox',
    full_text: [term, source].filter(x => x).join(' | ')
  });

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

  if (item.statusCode === 200) {
    const { body: { artist, album, title, release_date, cover } } = item;

    await publish('/jukebox/notification', {
      iconUrl: cover,
      title,
      body: [`by ${artist}`, `from ${album}`, release_date, source].join('\n')
    });
    return;
  }

  await publish('/jukebox/notification', {
    title: term,
    body: source
  });
};
