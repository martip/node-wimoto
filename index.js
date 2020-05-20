const Broadcast = require('./lib/broadcast');
const Climate = require('./lib/climate');

module.exports = {
  Broadcast: new Broadcast(),
  Climate: Climate
};
