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
        x: 4,
        y: 5,
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
