const mongoose = require("mongoose");

mongoose.connect(
  process.env.MONGODB_URI
);

const theatreSchema = mongoose.Schema({
  theatreName: String,
  movieId: Number,
  filledSeats: [String]
});

module.exports = mongoose.model("theatre", theatreSchema);
