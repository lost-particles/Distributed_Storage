const util = require('../util/util');
const id = require('../util/id');
const localComm = require('../local/comm');
const localGroups = require('../local/groups');

let context = {};
let mem = (config) => {
  context.gid = config.gid || 'all'; // node group
  context.hash = config.hash || id.naiveHash; // hash function
  return {get: function(key, callback=(e, v)=>{}) {
    if (key === null) {
      const remote = {service: 'mem', method: 'get'};
      const message = [context.gid+'#null'];
      distribution[context.gid].comm.send(message, remote, (e, v)=>{
        // let aggregatedErrors = [];
        let aggregatedKeys = [];
        // Object.keys(e).forEach((ele)=>{
        //   aggregatedErrors = [...aggregatedErrors, ...e[ele]];
        // });
        Object.keys(v).forEach((ele)=>{
          aggregatedKeys = [...aggregatedKeys, ...v[ele]];
        });
        callback(e, aggregatedKeys);
      });
    } else {
      localGroups.get(context.gid, (e, v)=>{
        const nodeHashes = new Map();
        const nids =[];
        if (e && Object.keys(e).length !== 0) {
          callback(e, null);
        } else {
          Object.keys(v).forEach((sid)=>{
            nids.push(id.getID(v[sid]));
            nodeHashes.set(id.getID(v[sid]), v[sid]);
          });
          targetNid = context.hash(id.getID(key), nids);
          const remote = {node: nodeHashes.get(targetNid),
            service: 'mem', method: 'get'};
          const message = [context.gid+'#'+key];
          localComm.send(message, remote, callback);
        }
      });
    }
  }, put: (obj, key, callback = console.log) => {
    if (key === null) {
      key = id.getID(obj);
    }
    localGroups.get(context.gid, (e, v)=>{
      console.log('Inside global groups'+ util.serialize(v));
      const nodeHashes = new Map();
      const nids =[];
      if (e && Object.keys(e).length !== 0) {
        callback(e, null);
      } else {
        Object.keys(v).forEach((sid)=>{
          nids.push(id.getID(v[sid]));
          nodeHashes.set(id.getID(v[sid]), v[sid]);
        });
        targetNid = context.hash(id.getID(key), nids);
        const remote = {node: nodeHashes.get(targetNid),
          service: 'mem', method: 'put'};
        const message = [obj, context.gid+'#'+key];
        localComm.send(message, remote, callback);
      }
    });
  }, del: function(key, callback=(e, v)=>{}) {
    localGroups.get(context.gid, (e, v)=>{
      const nodeHashes = new Map();
      const nids =[];
      if (e && Object.keys(e).length !== 0) {
        callback(e, null);
      } else {
        Object.keys(v).forEach((sid)=>{
          nids.push(id.getID(v[sid]));
          nodeHashes.set(id.getID(v[sid]), v[sid]);
        });
        targetNid = context.hash(id.getID(key), nids);
        const remote = {node: nodeHashes.get(targetNid),
          service: 'mem', method: 'del'};
        const message = [context.gid+'#'+key];
        localComm.send(message, remote, callback);
      }
    });
  }, reconf: () => {}};
};


module.exports = mem;
