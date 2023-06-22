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
const { size: appleSize, class: appleClass, color: appleColor } = appleInfo;
const { size: tailSize, class: tailClass, color: tailColor } = tailInfo;
const SPEED = 500; // in miliseconds
let applePositionIndex = 0;

const playground = SVG()
  .addTo("body")
  .size(playgroundSize, playgroundSize)
  .addClass("playground");

const tail = playground.group();
const snakeHead = SVG()
  .rect(headSize, headSize)
  .addClass(headClass)
  .attr({ fill: headColor });
const tailPart = SVG()
  .rect(tailSize, tailSize)
  .addClass(tailClass)
  .attr({ fill: tailColor });

const apple = SVG()
  .circle(appleSize)
  .addClass(appleClass)
  .attr({ fill: appleColor });

tail.addTo(playground);
snakeHead.addTo(playground);
apple.addTo(playground);

moveApple();
addTail();

function moveApple() {
  const { x, y } = APPLE_POSITIONS[applePositionIndex];
  apple.move(x * headSize, y * headSize);
  applePositionIndex++;
}

function addTail() {
  const tailClone = tailPart.clone().move(0, 0);

  tailClone.addTo(tail);
}

function updateTailMove() {
  let prevX, prevY;
  tail.each(function (i, children) {
    if (!i) {
      prevX = snakeHead.x();
      prevY = snakeHead.y();
    }

    const tempX = this.x();
    const tempY = this.y();

    this.move(prevX, prevY);
    prevX = tempX;
    prevY = tempY;
  });
}

function restart() {
  tail.clear();
  snakeHead.move(
    headStartPosition.x * headSize,
    headStartPosition.y * headSize
  );
  applePositionIndex = 0;
  moveApple();
}

function isPlaygroundCollision(headX, headY, playgroundSize) {
  return (
    headX < 0 || headX >= playgroundSize || headY < 0 || headY >= playgroundSize
  );
}

function isAppleCollision(headX, headY, appleX, appleY) {
  return headX === appleX && headY === appleY;
}

function update() {
  const headX = snakeHead.x();
  const headY = snakeHead.y();
  const appleX = apple.x();
  const appleY = apple.y();

  // addTail();
  updateTailMove();
  snakeHead.move(headX + headSize, headY);

  if (isPlaygroundCollision(headX, headY, playgroundSize)) {
    restart();
    return;
  }

  if (isAppleCollision(headX, headY, appleX, appleY)) {
    addTail();
    moveApple();
  }
}

setInterval(update, SPEED);
