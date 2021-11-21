import { assetsPath } from "../utils/environment";

export enum Resources {
  image,
  sound,
}

class Assets {
  private manifest: string[][] = [];
  private indexes: { [resourceName: string]: number }[] = [];

  constructor(manifestPath: string) {
    // TODO: chunk manifest into manifest pieces later when the time comes?
    fetch(`${location.origin}${manifestPath}`)
      .then(response => response.json())
      .then(data => {
        console.log(data); // TODO: remove after testing
        // this.manifest = data;
        this.parseManifest(data);
        this.buildIndexes();
      });
  }

  getIndex = (resourceType: Resources, resource: string): number => {
    const index = this.indexes[resourceType][resource];
    if (index === undefined) throw new Error(`accessing non existing resource: ${resource}`);

    return index;
  };

  getResource = (resourceType: Resources, index: number) => {
    const resource = this.manifest[resourceType][index];
    if (resource === undefined) throw new Error(`accessing non existing index: ${index}`);

    return resource;
  };

  private parseManifest = ({ images, sounds }: { images: string[]; sounds: string[] }) => {
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
        index[resource[i]] = i;
      }
      indexes[i] = index;
    }
  };
}

// Singleton
export default new Assets(assetsPath("manifest.json"));
