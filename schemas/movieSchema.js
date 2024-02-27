const z = require("zod");

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be a string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().min(1900).max(2024),
  director: z.string(),
  duration: z.number().positive(),
  poster: z.string().url({
    message: "Poster must be a valid URL",
  }),
  genre: z.array(
    z.enum([
      "Action",
      "Sci-fi",
      "Drama",
      "Crime",
      "Adventure",
      "Romance",
      "Animation",
      "Biography",
    ])
  ),
  rate: z.number().min(0).max(10),
});

function validateSchema(object) {
  return movieSchema.safeParse(object);
}

function partialValidation(object) {
    return movieSchema.partial().safeParse(object);
}

module.exports = {
  validateSchema,
  partialValidation
};
