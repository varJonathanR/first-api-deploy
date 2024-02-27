const express = require("express");
const crypto = require("node:crypto");
const movies = require("./movies.json");
const { validateSchema, partialValidation } = require("./schemas/movieSchema");

const app = express();
app.use(express.json());
app.disable("x-powered-by");
const ACCEPTED_ORIGINS = ["http://localhost:1234", "http://localhost:8080"];

app.get("/movies", (req, res) => {
  const origin = req.header("origin");

  if (ACCEPTED_ORIGINS.includes(origin) || !origin)
    res.header("Access-Control-Allow-Origin", origin);

  const { total, genre } = req.query;

  if (total) {
    const totalRes = movies.slice(0, total);
    return res.json(totalRes);
  } else if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }
  res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);
  res.status(404).json({ message: "Movie not found!" });
});

app.post("/movies", (req, res) => {
  const validated = validateSchema(req.body);

  if (validated.error)
    return res.status(422).json({ error: JSON.parse(validated.error.message) });

  const newMovie = {
    id: crypto.randomUUID(),
    ...validated.data,
  };

  movies.push(newMovie);
  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const validated = partialValidation(req.body);

  if (!validated.success)
    return res.status(422).json({ error: JSON.parse(validated.error.message) });

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex < 0) return res.status(404).json({ error: "Movie not found" });

  const updatedMovie = {
    ...movies[movieIndex],
    ...validated.data,
  };

  movies[movieIndex] = updatedMovie;
  return res.json(updatedMovie);
});

app.options("/movies/:id", (req, res) => {
  const origin = req.header("origin");

  if (ACCEPTED_ORIGINS.includes(origin) || !origin)
    res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PACTH, DELETE");
});

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
