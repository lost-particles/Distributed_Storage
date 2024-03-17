# M4: Distributed Storage
> Full name: `Subham Kumar Das`
> Email:  `subham_kumar_das@brown.edu`
> Username:  `sdas52`

## Summary
> Summarize your implementation, including key challenges you encountered

My implementation comprises `4` new software components, totaling `500` added lines of code over the previous implementation. Key challenges included `1> To distingusih between object stored by different groups, so that when queried we only return the relevant object for that particular group. To solve this i basically, combined the groupID with the key, and consequently separated them while inserting the record, inorder to use the groupId along with key to distingusih between same object but inserted by different groups.`.

## Correctness & Performance Characterization
> Describe how you characterized the correctness and performance of your implementation

*Correctness*: I wrote `6` tests; these tests take `0m3.787s` to execute.

*Performance*: Storing and retrieving 1000 5-property objects using a 3-node setup results in following average throughput and latency characteristics: `788.22`obj/sec and `1.27` (ms/object) (Note: these objects were pre-generated in memory to avoid accounting for any performance overheads of generating these objects between experiments).

## Key Feature
> Why is the `reconf` method designed to first identify all the keys to be relocated and then relocate individual objects instead of fetching all the objects immediately and then pushing them to their corresponding locations?

Because this will lead to more object writes which is unnecessary. By identifying the objects that needs to be relocated, we are basically not deleting and adding the object again if the object is at the deired node after a node leaves/joins.
## Time to Complete
> Roughly, how many hours did this milestone take you to complete?

Hours: `60`
