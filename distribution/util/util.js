const serialization = require('./serialization');
const id = require('./id');
const wire = require('./wire');

const idToNum = function(kid) {
  return parseInt(kid, 16);
};

const naiveHash = function(kid, nids) {
  nids.sort();
  return nids[idToNum(kid) % nids.length];
};

module.exports = {
  serialize: serialization.serialize,
  deserialize: serialization.deserialize,
  id: id,
  wire: wire,
  naiveHash: naiveHash,
  idToNum: idToNum,
};
