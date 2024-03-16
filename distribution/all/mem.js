const util = require('../util/util');
const id = require('../util/id');
const localComm = require('../local/comm');
const localGroups = require('../local/groups');

let mem = (config) => {
  let context = {};
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
  }, reconf: function(prevGroup, callback = (e, v)=>{}) {
    const prevNids = [];
    const prevNodeHashes = new Map();
    const currentNids = [];
    const currentNodeHashes = new Map();
    const relocationMapping = new Map();
    Object.entries(prevGroup).forEach((nodeSid, node)=>{
      prevNids.push(id.getID(node));
      prevNodeHashes.set(id.getID(node), node);
    });
    localGroups.get(context.gid, (e, v)=>{
      if (e) {
        callback(e, null);
      } else {
        Object.entries(v).forEach((nodeSid, node)=>{
          currentNids.push(id.getID(node));
          currentNodeHashes.set(id.getID(node), node);
        });
        this.get(null, (e, allKeys)=>{
          if (e) {
            callback(e, null);
          } else {
            allKeys.forEach((eachKey)=>{
              let previousTargetHash = context.hash(id.get(eachKey), prevNids);
              let currentTargetHash = context.hash(id.getID(eachKey),
                  currentNids);
              if (prevNodeHashes.get(previousTargetHash) !==
                  currentNodeHashes.get(currentTargetHash)) {
                relocationMapping.set(eachKey,
                    {source: prevNodeHashes.get(previousTargetHash),
                      dest: currentNodeHashes.get(currentTargetHash)});
              }
            });
            let relocationCount = 0;
            const totalRelocation = relocationMapping.size;

            relocationMapping.forEach((eachKey, mapping)=>{
              let remote = {node: mapping['source'],
                service: 'mem', method: 'get'};
              let message = [context.gid+'#'+eachKey];
              localComm.send(message, remote, (e, v)=>{
                if (e) {
                  callback(e, null);
                } else {
                  remote = {node: mapping['dest'],
                    service: 'mem', method: 'put'};
                  message = [v, context.gid+'#'+eachKey];
                  localComm.send(message, remote, (ee, vv)=>{
                    remote = {node: mapping['source'],
                      service: 'mem', method: 'del'};
                    message = [context.gid+'#'+eachKey];
                    localComm.send(message, remote, (eee, vvv)=>{
                      if (eee) {
                        callback(eee, null);
                      } else if (relocationCount === totalRelocation) {
                        callback(eee, vvv);
                      } else {
                        relocationCount++;
                      }
                    });
                  });
                }
              });
            });
          }
        });
      }
    });
  }};
};


module.exports = mem;
