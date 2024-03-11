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
    fs.readFile(path.join(__dirname, this.dirPath+key+'.txt'), 'utf8',
        (err, data) => {
          if (err) {
            callback(Error('File could not be found'), null);
          } else {
            callback(null, util.deserialize(data));
          }
        });
  },
  put: function(obj, key, callback=console.log) {
    if (key === null) {
      key = id.getID(obj);
    }
    const filePath = path.join(__dirname, this.dirPath+key+'.txt');
    fs.mkdir(this.dirPath, {recursive: true}, (err) => {
      // There could be issue down the line due to the
      // use of flag { flag: 'wx' }
      fs.writeFile(filePath,
          util.serialize(obj), (err) => {
            if (err) {
              callback(err, null);
            } else {
              callback(null, obj);
            }
          });
    });
  },
  del: function(key, callback = console.log) {
    fs.unlink(path.join(__dirname, this.dirPath+key), (err) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, 'Successfully deleted the file');
      }
    });
  },
};


module.exports = store;


