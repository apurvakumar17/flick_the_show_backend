const express = require("express");
const app = express();
const path = require("path");
const carouselModel = require("./models/carouselPostersModel.cjs");
const movieModel = require("./models/movieModel.cjs");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

//* Paths for carousel posters

app.get("/readCarouselPosters", async (req, res) => {
  let allCarouselPosters = await carouselModel.find();
  res.send(allCarouselPosters);
});

app.post("/addCarouselPoster", async (req, res) => {
  //give these values to the name field in the frontend
  let { movieName, movieId, posterLink } = req.body;

  let carouselPoster = await carouselModel.create({
    movieName,
    movieId,
    posterLink,
  });

});

app.get("/deleteCarouselPoster/:id", async (req, res) => {
  let deletedPosterObj = await carouselModel.findOneAndDelete({
    _id: req.params.id,
  });

});

//* Paths for movies

app.get("/readMovies", async (req, res) => {
  const allMovies = await movieModel.find();
  res.send(allMovies);
});

app.post("/addMovie", async (req, res) => {
  let { movieName, movieId, movieTrailer } = req.body;

  let movie = await movieModel.create({
    movieName,
    movieId,
    movieTrailer,
  });

});

app.get("/deleteMovie/:id", async (req, res) => {
  let deletedMovie = await movieModel.findOneAndDelete({ _id: req.params.id });

});

// Added a path to get a movie's trailer link from the database
app.get("/getMovieTrailer/:id", async (req, res) => {
  let movie = await movieModel.find({ _id: req.params.id });
  res.send(movie);

});
app.listen(3000);
