import express from "express";
import fs from "fs";
const app = express();

const userData = JSON.parse(fs.readFileSync("user_data.json"));

const movieData = JSON.parse(fs.readFileSync("movie_data.json"));

const userPreferenceData = JSON.parse(fs.readFileSync("user_preference.json"));

const relatedUsersData = JSON.parse(fs.readFileSync("related_users.json"));

const users = userData.map((user) => ({
  id: user.user_id,
  name: user.name,
}));

const movies = movieData.map((movie) => ({
  id: movie.movie_id,
  title: movie.movie_name,
  genres: movie.genres,
  release_date: new Date(movie.release_date),
}));

const userPreferences = userPreferenceData.reduce((acc, curr) => {
  curr.preference.forEach((pref) => {
    acc.push({
      user_id: curr.user_id,
      genre: pref.genre,
      preference_score: pref.preference_score,
    });
  });
  return acc;
}, []);

const relatedUsers = {};

for (const userId in relatedUsersData) {
  if (Object.hasOwnProperty.call(relatedUsersData, userId)) {
    const relatedUsersArray = relatedUsersData[userId];

    relatedUsers[userId] = relatedUsersArray;
  }
}

function calculateRelevance(movie) {
  const timeDelta =
    Math.abs(new Date() - movie.release_date) / (1000 * 60 * 60 * 24); // Time delta in days
  const decayFactor = 0.5;
  const timeImpact = Math.exp(-decayFactor * timeDelta);
  return timeImpact;
}

function calculateUserPreference(movie, userId) {
  const userPreference = userPreferences.find(
    (preference) =>
      preference.user_id === userId && movie.genres.includes(preference.genre)
  );
  return userPreference ? userPreference.preference_score : 0;
}

function calculateRelatedUsersPreference(movie, userId) {
  const relatedUserIds = relatedUsers[userId] || [];
  const totalRelatedUsers = relatedUserIds.length;
  if (totalRelatedUsers === 0) return 0;

  const relatedUsersPreferenceSum = relatedUserIds.reduce(
    (sum, relatedUserId) => {
      const userPreference = calculateUserPreference(movie, relatedUserId);
      return sum + userPreference;
    },
    0
  );

  return relatedUsersPreferenceSum / totalRelatedUsers;
}

app.get("/user/:userId/movies", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = users.find((user) => user.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const rankedMovies = movies
    .map((movie) => {
      const timeImpact = calculateRelevance(movie);
      const userPreference = calculateUserPreference(movie, userId);
      const relatedUsersPreference = calculateRelatedUsersPreference(
        movie,
        userId
      );
      const relevanceScore =
        0.5 * timeImpact + 0.3 * userPreference + 0.2 * relatedUsersPreference;

     
      return {
        id: movie.id,
        title: movie.title,
        genres: movie.genres,
        release_date: movie.release_date,
        relevanceScore: relevanceScore,

       
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 10);

  res.json(rankedMovies);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
