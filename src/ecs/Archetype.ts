import Component from "./Component";

class Archetype {
  components: Component<any>[];

  constructor(...components: Component<any>[]) {
    this.components = components;
    // this.mask = TODO: generate mask based on component ids
  }

  iterable = () => {
    const count = this.components[0].all()[1];
    return [...this.components, count];
  };
}

export default Archetype;

// TODO: need to get soa archetype working
// only chance to get good perf...