//  ________________________________________
// / NOTE: You should use absolute paths to \
// | make sure they are agnostic to where   |
// | your code is running from! Use the     |
// \ `path` module for that purpose.        /
//  ----------------------------------------
//         \   ^__^
//          \  (oo)\_______
//             (__)\       )\/\
//                 ||----w |
//                 ||     ||

const fs = require('fs');
const path = require('path');
const status = require('./status');
const util = require('../util/util');
let nid = null;

status.get(['nid'], (e, v)=>{
  nid = v;
});


const store = {
  dirPath: '../../store/'+nid+'/',
  get: function(key, callback=(e, v)=>{}) {
    fs.readFile(path.join(__dirname, self.dirPath+key), 'utf8', callback);
  },
  put: function(obj, key, callback=console.log) {
    if (key === null) {
      key = id.getID(obj);
    }
    fs.writeFile(path.join(__dirname, self.dirPath+key),
        util.serialize(obj), callback);
  },
  del: function(key, callback = console.log) {
    fs.unlink(path.join(__dirname, self.dirPath+key), (err) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, 'Successfully deleted the file');
      }
    });
  },
};


module.exports = store;


