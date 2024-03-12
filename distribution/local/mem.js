id = require('../util/id.js');

let context = {gid: 'local'};
let mem = {
  records: new Map(),
  get: function(key, callback=(e, v)=>{}) {
    if (key === null) {
      keys = [];
      for (let ele of this.records.keys()) {
        if (ele.split('#')[0]===context.gid) {
          keys.push(ele.split('#')[1]);
        }
      }
      callback(null, keys);
    } else if (this.records.has(context.gid+'#'+key)) {
      callback(null, this.records.get(context.gid+'#'+key));
    } else {
      callback(Error('Key not found'), null);
    }
  },
  put: function(obj, key, callback=(e, v)=>{
    console.log('e is '+ e + 'value is : '+v);
  }) {
    if (key === null) {
      key = id.getID(obj);
    }
    this.records.set(context.gid+'#'+key, obj);
    callback(null, this.records.get(context.gid+'#'+key));
  },
  del: function(key, callback=(e, v)=>{}) {
    if (this.records.has(context.gid+'#'+key)) {
      const deletedRecord = this.records.get(context.gid+'#'+key);
      this.records.delete(context.gid+'#'+key);
      callback(null, deletedRecord);
    } else {
      callback(Error('Key not found for deleting'), null);
    }
  },
};

module.exports = mem;

