TODO:

benchmark your ECS against these:
https://github.com/ddmills/js-ecs-benchmarks

TODO:

5. User clever entityId recycling https://skypjack.github.io/2019-05-06-ecs-baf-part-3/

7. iterate components backwards to avoid issues with add/remove mid iteration in the same component type
   https://skypjack.github.io/2020-08-02-ecs-baf-part-9/

8. Adding removing components one at a time is expensive because each
step is archetype change. Perhaps can 'buffer' these commands, in particular
bunch together add / remove into one command. Buffer gets flushed when new command type comes in.

e.g. 1

addComponent(entity1...) => buffer command
addComponent(entity1...) => buffer command
view(...) => flush command buffer. combine the 2 add commands into one dataStream and run single add

e.g. 2

addComponent(entity1...) => buffer
addComponent(entity1...) => buffer
removeComponent(entity1...) => buffer
addComponent(entity2...) => buffer
addComponent(entity3...) => buffer
removeComponent(entity1...) => buffer
view(...) => flush buffer