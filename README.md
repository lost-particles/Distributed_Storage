# M4: Distributed Storage
> Full name: `<first last>`
> Email:  `<email@brown.edu>`
> Username:  `cslogin`

## Summary
> Summarize your implementation, including key challenges you encountered

My implementation comprises `<number>` new software components, totaling `<number>` added lines of code over the previous implementation. Key challenges included `<1, 2, 3 + how you solved them>`.

## Correctness & Performance Characterization
> Describe how you characterized the correctness and performance of your implementation

*Correctness*: I wrote `<number>` tests; these tests take `<time>` to execute.

*Performance*: Storing and retrieving 1000 5-property objects using a 3-node setup results in following average throughput and latency characteristics: `<avg. throughput>`obj/sec and `<avg. latency>` (ms/object) (Note: these objects were pre-generated in memory to avoid accounting for any performance overheads of generating these objects between experiments).

## Key Feature
> Why is the `reconf` method designed to first identify all the keys to be relocated and then relocate individual objects instead of fetching all the objects immediately and then pushing them to their corresponding locations?

## Time to Complete
> Roughly, how many hours did this milestone take you to complete?

Hours: `<time>`
