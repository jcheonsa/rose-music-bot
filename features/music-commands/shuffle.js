// Shuffle module

module.exports = {
  shuffle: (songs) => {
    if (songs.length < 3) {
      return songs;
    }
    for (let i = songs.length - 2; i > 1; --i) {
      const j = 1 + Math.floor(Math.random() * i);
      [songs[i], songs[j]] = [songs[j], songs[i]];
    }
    return songs;
  },
};
