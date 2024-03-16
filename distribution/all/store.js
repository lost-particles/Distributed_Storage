const id = require('../util/id');
const localGroups = require('../local/groups');
const localComm = require('../local/comm');
const util = require('../util/util');


let store = (config) => {
  let context = {};
  context.gid = config.gid || 'all'; // node group
  context.hash = config.hash || id.naiveHash;
  return {
    get: function(key, callback=(e, v)=>{}) {
      if (key === null) {
        const remote = {service: 'store', method: 'get'};
        const message = [context.gid + '#null'];
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
              service: 'store', method: 'get'};
            const message = [context.gid + '#' + key];
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
            service: 'store', method: 'put'};
          const message = [obj, context.gid + '#' + key];
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
            service: 'store', method: 'del'};
          const message = [context.gid + '#' + key];
          localComm.send(message, remote, callback);
        }
      });
    }, reconf: function(prevGroup, callback = (e, v)=>{}) {
      const prevNids = [];
      const prevNodeHashes = new Map();
      const currentNids = [];
      const currentNodeHashes = new Map();
      const relocationMapping = new Map();
      Object.entries(prevGroup).forEach((node)=>{
        prevNids.push(id.getID(node[1]));
        prevNodeHashes.set(id.getID(node[1]), node[1]);
      });
      localGroups.get(context.gid, (e, v)=>{
        if (e) {
          callback(e, null);
        } else {
          Object.entries(v).forEach((node)=>{
            currentNids.push(id.getID(node[1]));
            currentNodeHashes.set(id.getID(node[1]), node[1]);
          });
          this.get(null, (e, allKeys)=>{
            if (e && Object.entries(e).length !== 0) {
              callback(e, null);
            } else {
              allKeys.forEach((eachKey)=>{
                let previousTargetHash = context.hash(id.getID(eachKey),
                    prevNids);
                let currentTargetHash = context.hash(id.getID(eachKey),
                    currentNids);
                if (prevNodeHashes.get(previousTargetHash) !==
                    currentNodeHashes.get(currentTargetHash)) {
                  const routeMapping = {};
                  routeMapping['source'] =
                      prevNodeHashes.get(previousTargetHash);
                  routeMapping['dest'] =
                      currentNodeHashes.get(currentTargetHash);
                  relocationMapping.set(eachKey, routeMapping);
                }
              });
              let relocationCount = 0;
              const totalRelocation = relocationMapping.size;

              relocationMapping.forEach((mapping, eachKey)=>{
                let remote = {node: mapping['source'],
                  service: 'store', method: 'get'};
                let message = [context.gid+'#'+eachKey];
                localComm.send(message, remote, (e, v)=>{
                  if (e && Object.entries(e).length !== 0) {
                    callback(e, null);
                  } else {
                    remote = {node: mapping['dest'],
                      service: 'store', method: 'put'};
                    message = [v, context.gid+'#'+eachKey];
                    localComm.send(message, remote, (ee, vv)=>{
                      if (ee && Object.entries(ee).length !== 0) {
                        callback(ee, null);
                      } else {
                        remote = {node: mapping['source'],
                          service: 'store', method: 'del'};
                        message = [context.gid+'#'+eachKey];
                        localComm.send(message, remote, (eee, vvv)=>{
                          relocationCount++;
                          if (eee && Object.entries(eee).length !== 0) {
                            callback(eee, null);
                          } else if (relocationCount === totalRelocation) {
                            callback(eee, vvv);
                          }
                        });
                      }
                    });
                  }
                });
              });
            }
          });
        }
      });
    },
  };
};


module.exports = store;
