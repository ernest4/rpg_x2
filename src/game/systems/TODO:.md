TODO:

benchmark your ECS against these:
https://github.com/ddmills/js-ecs-benchmarks

TODO:

1. use SoA (Structure of Arrays) to organize components
2. user for loops over query results to iterator over entities

3. use this nice bitset hack (or similar) to check component ownership https://github.com/EnderShadow8/wolf-ecs/blob/73b2097b8cebc28db63bf6b2d293ca22f45a4b62/src/ecs.ts#L75

4. User groups to optimize queries https://skypjack.github.io/2019-03-21-ecs-baf-part-2-insights/

5. User clever entityId recycling https://skypjack.github.io/2019-05-06-ecs-baf-part-3/

6. tombstone entity for even faster presence look ups!
   https://skypjack.github.io/2020-08-02-ecs-baf-part-9/

7. iterate components backwards to avoid issues with add/remove mid iteration in the same component type
   https://skypjack.github.io/2020-08-02-ecs-baf-part-9/
