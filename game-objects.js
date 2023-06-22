export const GAME_OBJECTS = {
  playground: {
    size: 400,
    class: "playground",
  },
  snake: {
    head: {
      class: "snake-head",
      size: 20,
      color: "red",
      startPosition: {
        x: 0,
        y: 0,
      },
    },
    tail: {
      class: "tail-part",
      size: 20,
      color: "blue",
    },
    apple: {
      size: 20,
      class: "apple",
      color: "green",
    },
  },
};
