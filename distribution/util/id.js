const assert = require('assert');
var crypto = require('crypto');

// The ID is the SHA256 hash of the JSON representation of the object
function getID(obj) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
}

// The NID is the SHA256 hash of the JSON representation of the node
function getNID(node) {
  node = {ip: node.ip, port: node.port};
  return getID(node);
}

// The SID is the first 5 characters of the NID
function getSID(node) {
  return getNID(node).substring(0, 5);
}


function idToNum(id) {
  let n = parseInt(id, 16);
  // let n = BigInt('0x'+id);
  assert(!isNaN(n), 'idToNum: id is not in KID form!');
  return n;
}

function naiveHash(kid, nids) {
  nids.sort();
  return nids[idToNum(kid) % nids.length];
}

function consistentHash(kid, nids) {
  const ringList = [];
  const hexToDecMap = new Map();
  nids.forEach((nid)=>{
    ringList.push(idToNum(nid));
    hexToDecMap.set(idToNum(nid), nid);
  });
  ringList.sort();
  objId = idToNum(kid);
  nodeId = hexToDecMap.get(ringList[0]);
  for (let i = 0; i < ringList.length; i++) {
    if (ringList[i] >= objId) {
      nodeId = hexToDecMap.get(ringList[i]);
      break;
    }
  }
  return nodeId;
}


function rendezvousHash(kid, nids) {
  const ringList = [];
  const hexToDecMap = new Map();
  nids.forEach((nid)=>{
    const combinedHashedId = idToNum(getID(nid+kid));
    ringList.push(combinedHashedId);
    hexToDecMap.set(combinedHashedId, nid);
  });
  ringList.sort();
  return hexToDecMap.get(ringList[ringList.length-1]);
}

module.exports = {
  getNID: getNID,
  getSID: getSID,
  getID: getID,
  idToNum: idToNum,
  naiveHash: naiveHash,
  consistentHash: consistentHash,
  rendezvousHash: rendezvousHash,
};
