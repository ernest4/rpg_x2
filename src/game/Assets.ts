import { assetsPath } from "../utils/environment";

export enum Resources {
  image,
  sound,
}

type Manifest = { images: string[]; sounds: string[] };

class Assets {
  private manifest: string[][] = [];
  private indexes: { [resourceName: string]: number }[] = [];

  // constructor(manifestPath: string) {
  //   // TODO: fix async loading...
  //   // // TODO: chunk manifest into manifest pieces later when the time comes?
  //   // fetch(`${location.origin}${manifestPath}`)
  //   //   .then(response => response.json())
  //   //   .then(data => {
  //   //     this.parseManifest(data);
  //   //     this.buildIndexes();
  //   //   });

  //   // TESTING with sync data:
  //   const data = {
  //     images: [
  //       "block_T.png",
  //       "bump_map_example_pixel.png",
  //       "bump_map_example.png",
  //       "grass_T.png",
  //       "item_T.png",
  //       "unit_T.png",
  //       "water_T.png",
  //     ],
  //     sounds: ["We+Are+Already+Dead+instrumental.mp3"],
  //   };
  //   this.parseManifest(data);
  //   this.buildIndexes();
  // }

  constructor(manifest: Manifest) {
    this.parseManifest(manifest);
    this.buildIndexes();
  }

  getIndex = (resourceType: Resources, resource: string): number => {
    const index = this.indexes[resourceType][resource];
    if (index === undefined) throw new Error(`accessing non existing resource: ${resource}`);

    return index;
  };

  getResource = (resourceType: Resources, index: number): any => {
    if (index === -1) return null;

    const resource = this.manifest[resourceType][index];
    if (resource === undefined) throw new Error(`accessing non existing index: ${index}`);

    return resource;
  };

  putResource = (resourceType: Resources, resource: any): number => {
    const index = this.manifest[resourceType].push(resource) - 1;
    // this.indexes[resourceType][index] = index;
    return index;
  };

  private parseManifest = ({ images, sounds }: Manifest) => {
    const { manifest } = this;
    manifest[Resources.image] = images;
    manifest[Resources.sound] = sounds;
  };

  private buildIndexes = () => {
    const { indexes, manifest } = this;

    for (let i = 0, l = manifest.length; i < l; i++) {
      const index = {};
      const resource = manifest[i];
      for (let k = 0, ll = resource.length; k < ll; k++) {
        index[resource[k]] = k;
      }
      indexes[i] = index;
    }
  };
}

// Singleton
// export default new Assets(assetsPath("manifest.json"));
export default Assets;
