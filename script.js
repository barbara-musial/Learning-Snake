import { GAME_OBJECTS } from "./game-objects.js";
import { APPLE_POSITIONS } from "./apple-positions.js";

const { playground: playgroundInfo, snake: snakeInfo } = GAME_OBJECTS;
const { size: playgroundSize, class: playgroundClass } = playgroundInfo;
const { head: headInfo, tail: tailInfo, apple: appleInfo } = snakeInfo;
const {
  color: headColor,
  class: headClass,
  size: headSize,
  startPosition: headStartPosition,
} = headInfo;
const { size: appleSize } = appleInfo;
const { size: tailSize, class: tailClass, color: tailColor } = tailInfo;
const SPEED = 1000; // in miliseconds
let applePositionIndex = 2;

const draw = SVG()
  .addTo("body")
  .size(playgroundSize, playgroundSize)
  .addClass("playground");

const snakeHead = draw
  .rect(headSize, headSize)
  .attr({ class: headClass, fill: headColor })
  .center(headStartPosition.x, headStartPosition.y);

const tailPart = draw
  .rect(tailSize, tailSize)
  .attr({ class: tailClass })
  .hide();
// const tailPart = draw
//   .rect(tailSize)
//   .attr({ class: tailClass, fill: tailColor })
//   .hide();

const apple = draw.circle(appleSize, appleSize);

draw.add(snakeHead);
addNewApple();

let i = 1;
const moveInterval = setInterval(() => {
  snakeHead.animate(300, 0, "absolute").move(i * headSize, 0);
  if (i === 6) {
    addTail();
  }
  i++;
}, SPEED);

function addNewApple() {
  const { x, y } = APPLE_POSITIONS[applePositionIndex];
  apple.move(x * headSize, y * headSize);
  applePositionIndex++;
}

function addTail() {
  const tailPartCopy = tailPart
    .clone()
    .show()
    .center(draw.last().cx(), draw.last().cy());

  draw.add(tailPartCopy);
}

function updateMove() {
  const headPosition = {
    x: snakeHead.cx(),
    y: snakeHead.cy(),
  };

  let xDiff, yDiff;
  draw.each(function (i, children) {
    const classList = Object.values(this.node.classList);
    const isSnakePart =
      classList.includes(headClass) || classList.includes(tailClass);

    if (isSnakePart) {
      xDiff = Math.abs(headPosition.x - this.cx());
      yDiff = Math.abs(headPosition.y - this.cy());
    }
  });
}

function restart() {
  clearInterval(moveInterval);

  draw.each(function (i, children) {
    const isSnakeHead = Object.values(this.node.classList).includes(headClass);

    if (isSnakeHead) {
      return;
    }

    this.hide();
  });

  snakeHead.move(headStartPosition.x, headStartPosition.y);
  draw.clear();
  draw.add(snakeHead);
  applePositionIndex = 0;
  addNewApple();
}
