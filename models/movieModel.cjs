const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGODB_URI
);

const movieSchema = mongoose.Schema({
  movieName: String,
  movieId: Number,
  moviePoster: String,
});

module.exports = mongoose.model("movie", movieSchema);
