import IntervalTree from "./node_modules/@flatten-js/interval-tree/index.js";
import { GAME_OBJECTS } from "./game-objects.js";
import { APPLE_POSITIONS } from "./apple-positions.js";

class Node {
  constructor(score, moveX, moveY, head) {
    this.head = head;
    this.score = score;
    this.moveX = moveX;
    this.moveY = moveY;
    this.left = null;
    this.right = null;
    this.forward = null;
    this.backward = null;
  }
}

const POSSIBLE_MOVEMENTS = [
  { x: -20, y: 0 },
  { x: 0, y: -20 },
  { x: 20, y: 0 },
  { x: 0, y: 20 },
];

const tree = new Node(0, null, null);
let currNode = tree;

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
const SPEED = 50; // in miliseconds
let applePositionIndex = 0;

const playground = SVG()
  .addTo("body")
  .size(playgroundSize, playgroundSize)
  .addClass("playground");

const tail = playground.group();
const snakeHead = SVG()
  .rect(headSize, headSize)
  .addClass(headClass)
  .attr({ fill: headColor })
  .move(headStartPosition.x * headSize, headStartPosition.y * headSize);
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

function isCloserToApple(newX, newY, prevHeadX, prevHeadY) {
  const appleX = apple.x();
  const appleY = apple.y();

  return (
    Math.abs(appleX - newX) < Math.abs(appleX - prevHeadX) ||
    Math.abs(appleY - newY) < Math.abs(appleY - prevHeadY)
  );
}

function updateTailMove(prevHeadX, prevHeadY) {
  let prevX, prevY;
  tail.each(function (i, children) {
    if (!i) {
      prevX = prevHeadX;
      prevY = prevHeadY;
    }

    const tempX = this.x();
    const tempY = this.y();

    this.move(prevX, prevY);

    prevX = tempX;
    prevY = tempY;
  });
}

function restart() {
  currNode = currNode.head;
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

function isCollisionWithTail(headX, headY) {
  let isCollision = false;

  tail.each(function (i, children) {
    if (isCollision) {
      return;
    }
    const tailPartX = children[i].x();
    const tailPartY = children[i].y();

    isCollision = headX === tailPartX && headY === tailPartY;
  });
  return isCollision;
}

function chooseMove(prevHeadX, prevHeadY) {
  const randomNumFrom0To3 = Math.floor(Math.random() * 4);
  const nextMove = POSSIBLE_MOVEMENTS[randomNumFrom0To3];
  const newX = snakeHead.x() + nextMove.x;
  const newY = snakeHead.y() + nextMove.y;

  const firstTailPartX = tail.first()?.x();
  const firstTailPartY = tail.first()?.y();

  if (newX === firstTailPartX && newY === firstTailPartY) {
    return chooseMove(prevHeadX, prevHeadY);
  } else {
    const addedScore = isCloserToApple(newX, newY, prevHeadX, prevHeadY)
      ? 10
      : -10;
    const score = currNode.score + addedScore;

    if (score < -30) {
      restart();
    }

    if (currNode.left?.score > 0 && currNode.left?.score >= score) {
      currNode = currNode.left;
      return [prevHeadX + currNode.moveX, prevHeadY + currNode.moveY];
    } else if (currNode.right?.score > 0 && currNode.right?.score >= score) {
      currNode = currNode.right;
      return [prevHeadX + currNode.moveX, prevHeadY + currNode.moveY];
    } else if (
      currNode.forward?.score > 0 &&
      currNode.forward?.score >= score
    ) {
      currNode = currNode.forward;
      return [prevHeadX + currNode.moveX, prevHeadY + currNode.moveY];
    } else if (
      currNode.backward?.score > 0 &&
      currNode.backward?.score >= score
    ) {
      currNode = currNode.backward;
      return [prevHeadX + currNode.moveX, prevHeadY + currNode.moveY];
    }

    if (randomNumFrom0To3 === 0 && !currNode.left) {
      currNode.left = new Node(score, nextMove.x, nextMove.y, tree);
      currNode = currNode.left;
    } else if (randomNumFrom0To3 === 1 && !currNode.forward) {
      currNode.forward = new Node(score, nextMove.x, nextMove.y, tree);
      currNode = currNode.forward;
    } else if (randomNumFrom0To3 === 2 && !currNode.right) {
      currNode.right = new Node(score, nextMove.x, nextMove.y, tree);
      currNode = currNode.right;
    } else if (randomNumFrom0To3 === 3 && !currNode.backward) {
      currNode.backward = new Node(score, nextMove.x, nextMove.y, tree);
      currNode = currNode.backward;
    } else {
      return chooseMove(prevHeadX, prevHeadY);
    }

    console.log(tree);
    return [newX, newY];
  }
}

function update() {
  const prevHeadX = snakeHead.x();
  const prevHeadY = snakeHead.y();

  const appleX = apple.x();
  const appleY = apple.y();

  const [newHeadX, newHeadY] = chooseMove(prevHeadX, prevHeadY);

  //move snake
  // addTail();
  snakeHead.move(newHeadX, newHeadY);
  updateTailMove(prevHeadX, prevHeadY);

  //check collision with borders
  if (
    isPlaygroundCollision(newHeadX, newHeadY, playgroundSize) ||
    isCollisionWithTail(newHeadX, newHeadY)
  ) {
    restart();
    return;
  }

  //check collision with apple
  if (isAppleCollision(newHeadX, newHeadY, appleX, appleY)) {
    addTail();
    moveApple();
  }
}

setInterval(update, SPEED);
