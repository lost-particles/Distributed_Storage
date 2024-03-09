id = require('../util/id.js');

const mem = {
  records: new Map(),
  get: function(key, callback=(e, v)=>{}) {
    if (this.records.hasOwnProperty(key)) {
      callback(null, this.records.get(key));
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
    this.records.set(key, obj);
    callback(null, this.records.get(key));
  },
  del: function(key, callback=(e, v)=>{}) {
    if (this.records.hasOwnProperty(key)) {
      const deletedRecord = this.records.delete(key);
      callback(null, deletedRecord);
    } else {
      callback(Error('Key not found for deleting'), null);
    }
  },
};

module.exports = mem;

