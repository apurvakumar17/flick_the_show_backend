require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const carouselModel = require("./models/carouselPostersModel.cjs");
const movieModel = require("./models/movieModel.cjs");
const cors = require("cors");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Explicit CORS to allow the deployed frontend
const allowedOrigins = [
  "https://flick-the-show.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
  })
);
app.use(express.static(path.join(__dirname, "public")));

//* Health and basic routes

app.get("/health", (req, res) => {
  res.status(200).send({ status: "ok" });
});

//* Paths for carousel posters

app.get("/readCarouselPosters", async (req, res) => {
  try {
    const allCarouselPosters = await carouselModel.find();
    res.send(allCarouselPosters);
  } catch (err) {
    res.status(500).send({ error: "Failed to read carousel posters" });
  }
});

app.post("/addCarouselPoster", async (req, res) => {
  try {
    const { movieName, movieId, posterLink } = req.body;
    const created = await carouselModel.create({ movieName, movieId, posterLink });
    res.status(201).send(created);
  } catch (err) {
    res.status(500).send({ error: "Failed to add carousel poster" });
  }
});

app.get("/deleteCarouselPoster/:id", async (req, res) => {
  try {
    const deletedPosterObj = await carouselModel.findOneAndDelete({ _id: req.params.id });
    res.send(deletedPosterObj);
  } catch (err) {
    res.status(500).send({ error: "Failed to delete carousel poster" });
  }
});

//* Paths for movies

app.get("/readMovies", async (req, res) => {
  try {
    const allMovies = await movieModel.find();
    res.send(allMovies);
  } catch (err) {
    res.status(500).send({ error: "Failed to read movies" });
  }
});

app.post("/addMovie", async (req, res) => {
  try {
    const { movieName, movieId, movieTrailer } = req.body;
    const movie = await movieModel.create({ movieName, movieId, movieTrailer });
    res.status(201).send(movie);
  } catch (err) {
    res.status(500).send({ error: "Failed to add movie" });
  }
});

app.get("/deleteMovie/:id", async (req, res) => {
  try {
    const deletedMovie = await movieModel.findOneAndDelete({ _id: req.params.id });
    res.send(deletedMovie);
  } catch (err) {
    res.status(500).send({ error: "Failed to delete movie" });
  }
});

// Added a path to get a movie's trailer link from the database
app.get("/getMovieTrailer/:id", async (req, res) => {
  try {
    const movie = await movieModel.findOne({ movieId: req.params.id });
    if (!movie) return res.status(404).send({ error: "Movie not found" });
    res.send(movie.movieTrailer);
  } catch (err) {
    res.status(500).send({ error: "Failed to get trailer" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
