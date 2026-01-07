/**
 * NOTE: You will need to run `npm install blessed` once in your terminal.
 */
var blessed = require("blessed");

class SnakeGame {
  constructor(height, width) {
    // Initialize game; snake should start:
    //  - at approximately the center of the grid,
    //  - with length 3, and
    //  - moving to the right.
    this.height = height;
    this.width = width;
    this.direction = "d";

    // Initialize snake body with 3 segments at the center, moving right
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height / 2);

    // snake is an array of three [x, y] coordinates
    this.snake = [
      [startX, startY], // head
      [startX - 1, startY], // body
      [startX - 2, startY], // tail
    ];
  }

  grid() {
    // Render the grid fresh on every step
    // Start with an empty board
    const board = [];
    for (let r = 0; r < this.height; r++) {
      const row = [];
      for (let c = 0; c < this.width; c++) {
        row.push(" ");
      }
      board.push(row);
    }

    // Place snake pieces on board at row y and column x
    for (const [x, y] of this.snake) {
      board[y][x] = "*";
    }

    return board;
  }

  setDirection(keypress) {
    // Update the direction the snake is currently moving in.
    // Assume keypress is 'w', 'a', 's', 'd', or null.

    // Only accept valid direction keys and ignore null
    // This shouldn't be necessary based on the prompt, but when I was testing,
    // I kept ending the game early by fatfingering a wrong key
    if (!["w", "a", "s", "d"].includes(keypress)) {
      return;
    }

    this.direction = keypress;
  }

  step() {
    // Move the snake along in the current direction.
    // Return false if the game ends by the snake hitting a boundary or itself.

    // Calculate new head position
    const head = this.snake[0];
    let newX = head[0];
    let newY = head[1];

    switch (this.direction) {
      case "w":
        newY -= 1; // up
        break;
      case "s":
        newY += 1; // down
        break;
      case "a":
        newX -= 1; // left
        break;
      case "d":
        newX += 1; // right
        break;
    }

    // Check for boundary collision on x axis (side walls)
    if (newX < 0 || newX >= this.width) {
      return false;
    }
    // Check for boundary collision on y axis (top and bottom walls)
    if (newY < 0 || newY >= this.height) {
      return false;
    }

    // Check for running into itself
    // Loop through each segment of the snake and check if the new head position
    // matches any of its segments
    for (const segment of this.snake) {
      if (segment[0] === newX && segment[1] === newY) {
        return false;
      }
    }

    // Add new head to beginning of body
    // There's no need to actually move the non-head segments. The snake appears to move because
    // the head changes and the tail disappears.
    this.snake = [[newX, newY], ...this.snake]; // prepend
    // Remove tail (like a gecko!)
    this.snake.pop();

    return true;
  }
}

// You don't need to modify anything in the GameRunner function.
class GameRunner {
  constructor(height, width, screen, tickRate = 500) {
    this.game = new SnakeGame(height, width);
    this.screen = screen;
    this.tickRate = tickRate;

    // Set up key capturing.
    this.screen.key(["escape", "q", "C-c"], () => process.exit(0));
    this.keypress = null;
    this.screen.on("keypress", (ch, key) => {
      this.keypress = key.name;
    });

    // Set up a loop that calls tick() at the specified tickRate.
    this.interval = setInterval(this.tick.bind(this), this.tickRate);

    // Set up a box for rendering.
    this.box = blessed.box({
      width: width + 2,
      height: height + 2,
      content: "",
      tags: true,
      border: {
        type: "line",
      },
      style: {
        border: {
          fg: "#f0f0f0",
        },
      },
    });
    this.screen.append(this.box);
  }

  // The primary game loop.
  tick() {
    this.game.setDirection(this.keypress);

    if (!this.game.step()) {
      const gameOver = blessed.text({});
      gameOver.setContent("Game over!");
      this.screen.append(gameOver);
      this.screen.render();
      setTimeout(() => process.exit(0), 5000);
      return;
    }

    const renderedGrid = gridToStr(this.game.grid());
    this.box.setContent(renderedGrid);
    this.screen.render();
  }
}

// Takes a 2d grid of chars and renders it as a single multi-line string.
function gridToStr(grid) {
  return grid.map((row) => row.join("")).join("\n");
}

function play() {
  const screen = blessed.screen();
  new GameRunner(10, 20, screen);
}

function test() {
  const game = new SnakeGame(10, 10);
  console.log(gridToStr(game.grid()));
  console.log();
  game.step();
  console.log(gridToStr(game.grid()));
}

if (require.main === module) {
  // process.argv = [path_to_node, path_to_script, ...args]
  const command = process.argv[2];

  if (command === "test") {
    test();
  } else {
    play();
  }
}
