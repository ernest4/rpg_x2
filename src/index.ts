import "./css/main.css"; // including here ensures it's in the project
import Game from "./Game";
import { DEVELOPMENT, VERSION } from "./utils/environment";

const game = new Game();
game.run();

console.log(`Running in ${DEVELOPMENT ? "development" : "production"} mode`);
console.log(`Version: ${VERSION}`);
