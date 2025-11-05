require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const carouselModel = require("./models/carouselPostersModel.cjs");
const movieModel = require("./models/movieModel.cjs");
const theatreModel = require("./models/theatreModel.cjs");
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
  "http://192.168.1.5:5173",
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

//* Paths for theatres

app.get("/readTheatres", async (req, res) => {
  try {
    const theatres = await theatreModel.find();
    res.send(theatres);
  } catch (err) {
    res.status(500).send({ error: "Failed to read theatres" });
  }
});

app.post("/addTheatre", async (req, res) => {
  try {
    const { theatreName, movieId, filledSeats } = req.body;
    const created = await theatreModel.create({
      theatreName,
      movieId,
      filledSeats: Array.isArray(filledSeats) ? filledSeats : [],
    });
    res.status(201).send(created);
  } catch (err) {
    res.status(500).send({ error: "Failed to add theatre" });
  }
});

// Seed/reset default theatres with random movies and cleared seats on each call
app.post("/resetTheatres", async (req, res) => {
  try {
    const defaultTheatreNames = [
      "INOX Janakpuri, Janak Place",
      "PVR Vegas, Dwarka",
      "M2K Rohini, Sec-3",
      "Cinepolis Unity One, Rohini",
      "Chand Miraj Cinemas, Mayur Vihar Phase 1",
    ];

    const movies = await movieModel.find({}, { movieId: 1, _id: 0 });
    if (!movies || movies.length === 0) {
      return res.status(400).send({ error: "No movies found to assign" });
    }

    const movieIds = movies.map((m) => m.movieId);
    const pickRandomMovieId = () => movieIds[Math.floor(Math.random() * movieIds.length)];

    const results = await Promise.all(
      defaultTheatreNames.map((name) =>
        theatreModel.findOneAndUpdate(
          { theatreName: name },
          { $set: { movieId: pickRandomMovieId(), filledSeats: [] } },
          { new: true, upsert: true }
        )
      )
    );

    res.send(results);
  } catch (err) {
    res.status(500).send({ error: "Failed to reset theatres" });
  }
});

// Append seat codes (e.g., A1, B5) to a theatre's filledSeats without duplicates
app.post("/addFilledSeats", async (req, res) => {
  try {
    const { theatreId, seats } = req.body;
    if (!theatreId || !Array.isArray(seats)) {
      return res.status(400).send({ error: "theatreId and seats[] are required" });
    }

    const updated = await theatreModel.findByIdAndUpdate(
      theatreId,
      { $addToSet: { filledSeats: { $each: seats } } },
      { new: true }
    );

    if (!updated) return res.status(404).send({ error: "Theatre not found" });
    res.send(updated);
  } catch (err) {
    res.status(500).send({ error: "Failed to add filled seats" });
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
