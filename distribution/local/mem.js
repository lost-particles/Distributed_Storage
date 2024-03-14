id = require('../util/id.js');

let context = {gid: 'local'};
let mem = {
  records: new Map(),
  get: function(key, callback=(e, v)=>{}) {
    let tempGid = context.gid;
    if (key instanceof Object) {
      tempGid = key.gid;
      key = key.key;
    }
    if (key === null || key.includes('null')) {
      if (key !==null && key.includes('null')) {
        tempGid = key.split('#')[0];
      }
      keys = [];
      for (let ele of this.records.keys()) {
        if (ele.split('#')[0]===tempGid) {
          keys.push(ele.split('#')[1]);
        }
      }
      callback(null, keys);
    } else {
      if (!key.includes('#')) {
        key = context.gid + '#' + key;
      }
      if (this.records.has(key)) {
        callback(null, this.records.get(key));
      } else {
        callback(Error('Key not found'), null);
      }
    }
  },
  put: function(obj, key, callback=(e, v)=>{
    console.log('e is '+ e + 'value is : '+v);
  }) {
    if (key === null) {
      key = context.gid+ '#' + id.getID(obj);
    } else if (key.includes('null')) {
      key = key.split('#')[0] + '#' + id.getID(obj);
    } else if (!key.includes('#')) {
      key = context.gid + '#' + key;
    }
    this.records.set(key, obj);
    callback(null, this.records.get(key));
  },
  del: function(key, callback=(e, v)=>{}) {
    if (!key.includes('#')) {
      key = context.gid + '#' + key;
    }
    if (this.records.has(key)) {
      const deletedRecord = this.records.get(key);
      this.records.delete(key);
      callback(null, deletedRecord);
    } else {
      callback(Error('Key not found for deleting'), null);
    }
  },
};

module.exports = mem;

