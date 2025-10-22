const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGODB_URI
);

const carouselPostersSchema = mongoose.Schema({
  movieName: String,
  movieId: Number,
  posterLink: String,
});

module.exports = mongoose.model("carousel poster", carouselPostersSchema);
