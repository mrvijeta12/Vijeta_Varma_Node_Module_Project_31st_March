
// const express = require('express');
// const fs = require('fs');
// const app = express();

// // Read and parse User dataset
// const userData = JSON.parse(fs.readFileSync('user_data.json'));

// // Read and parse Movie dataset
// const movieData = JSON.parse(fs.readFileSync('movie_data.json'));

// // Read and parse User Preference dataset
// const userPreferenceData = JSON.parse(fs.readFileSync('user_preference.json'));

// // Read and parse Related Users dataset
// const relatedUsersData = JSON.parse(fs.readFileSync('related_users.json'));

// // Parsing datasets into usable format
// const users = userData.map(user => ({
//     id: user.user_id,
//     name: user.name
// }));

// const movies = movieData.map(movie => ({
//     id: movie.movie_id,
//     genres: movie.genres,
//     release_date: new Date(movie.release_date)
// }));

// const userPreferences = userPreferenceData.map(preference => ({
//     user_id: preference.user_id,
//     genre: preference.genre,
//     preference_score: preference.preference_score
// }));

// // Initialize an object to store related users
// const relatedUsers = {};

// // Loop through the keys of the relatedUsersData object
// for (const userId in relatedUsersData) {
//     if (Object.hasOwnProperty.call(relatedUsersData, userId)) {
//         // Extract the array of related users for the current user ID
//         const relatedUsersArray = relatedUsersData[userId];

//         // Store the related users array in the relatedUsers object
//         relatedUsers[userId] = relatedUsersArray;
//     }
// }

// // Function to calculate time delta and apply Gaussian decay
// function calculateRelevance(movie) {
//     const timeDelta = Math.abs(new Date() - movie.release_date) / (1000 * 60 * 60 * 24); // Time delta in days
//     const decayFactor = 0.5; // Adjust decay factor as needed
//     const timeImpact = Math.exp(-decayFactor * timeDelta);
//     return timeImpact;
// }

// // Function to calculate user's preference towards the movie based on genres
// function calculateUserPreference(movie, userId) {
//     const userPreference = userPreferences.find(preference => preference.user_id === userId && preference.genre === movie.genres);
//     return userPreference ? userPreference.preference_score : 0;
// }

// // Function to calculate preference towards the movie by related users
// function calculateRelatedUsersPreference(movie, userId) {
//     const relatedUserIds = relatedUsers[userId] || [];
//     const totalRelatedUsers = relatedUserIds.length;
//     if (totalRelatedUsers === 0) return 0;

//     const relatedUsersPreferenceSum = relatedUserIds.reduce((sum, relatedUserId) => {
//         const userPreference = calculateUserPreference(movie, relatedUserId);
//         return sum + userPreference;
//     }, 0);
    
//     return relatedUsersPreferenceSum / totalRelatedUsers;
// }

// // Route to get top 10 movie recommendations for a user
// app.get('/user/:userId/movies', (req, res) => {
//     const userId = parseInt(req.params.userId);
//     const user = users.find(user => user.id === userId);
//     if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//     }

//     const rankedMovies = movies.map(movie => {
//         const timeImpact = calculateRelevance(movie);
//         const userPreference = calculateUserPreference(movie, userId);
//         const relatedUsersPreference = calculateRelatedUsersPreference(movie, userId);
//         const relevanceScore = (0.5 * timeImpact) + (0.3 * userPreference) + (0.2 * relatedUsersPreference);
//         return {
//             id: movie.id,
//             genres: movie.genres,
//             release_date: movie.release_date,
//             relevanceScore: relevanceScore
//         };
//     }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);

//     res.json(rankedMovies);
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });




// const express = require('express');
// const moment = require('moment');
// const fs = require('fs');
// const path = require('path');


// const app = express();

// // Load datasets
// const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, "user_data.json")));
// // console.log(usersData);
// const relatedUsersData = JSON.parse(fs.readFileSync(path.join(__dirname, 'related_users.json')));
// const moviesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'movie_data.json')));
// const userPreferencesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'user_preference.json')));

// // Function to calculate Gaussian decay function
// function calculateGaussianDecay(deltaDays, decayFactor = 0.5) {
//     return Math.exp(-decayFactor * deltaDays);
// }

// // Function to calculate time delta decay
// function calculateTimeDeltaDecay(movieReleaseDate) {
//     const today = moment();
//     const releaseDate = moment(movieReleaseDate);
//     const deltaDays = today.diff(releaseDate, 'days');
//     return calculateGaussianDecay(deltaDays);
// }

// // Function to calculate user's preference score towards the movie
// function calculateUserPreferenceScore(userId, movieGenres) {
//     const userPreferences = userPreferencesData.filter(pref => pref.user_id === userId);
//     let preferenceScore = 0;
//     let genreCount = 0;

//     for (const genre of movieGenres) {
//         const genrePreferences = userPreferences.filter(pref => pref.genre === genre);
//         const genrePreferenceSum = genrePreferences.reduce((acc, pref) => acc + pref.preference_score, 0);
//         preferenceScore += genrePreferenceSum;
//         genreCount++;
//     }

//     return genreCount === 0 ? 0 : preferenceScore / genreCount;
// }

// // Function to calculate average preference towards the movie by related users
// function calculateAverageRelatedUsersPreference(movieId) {
//     const relatedUserIds = relatedUsersData[movieId] || [];
//     if (relatedUserIds.length === 0) return 0;

//     let totalPreferenceScore = 0;
//     for (const userId of relatedUserIds) {
//         totalPreferenceScore += calculateUserPreferenceScore(userId, moviesData[movieId].genres);
//     }

//     return totalPreferenceScore / relatedUserIds.length;
// }

// // Function to calculate relevance score for a movie
// function calculateRelevanceScore(movie) {
//     const timeDeltaDecay = calculateTimeDeltaDecay(movie.release_date);
//     const userPreferenceScore = calculateUserPreferenceScore(movie.user_id, movie.genres);
//     const averageRelatedUsersPreference = calculateAverageRelatedUsersPreference(movie.movie_id);
//     return timeDeltaDecay + userPreferenceScore + averageRelatedUsersPreference;
// }

// // Function to generate personalized feed for a user
// function generatePersonalizedFeed(userId) {
//     const userMovies = moviesData.filter(movie => movie.user_id === userId);
//     const rankedMovies = userMovies.map(movie => ({ ...movie, relevance_score: calculateRelevanceScore(movie) }));
//     rankedMovies.sort((a, b) => b.relevance_score - a.relevance_score);
//     return rankedMovies.slice(0, 10);
// }

// // Route to get personalized feed for a user
// app.get('/recommendations/:userId', (req, res) => {
//     const userId = parseInt(req.params.userId);

//     if (!Number.isInteger(userId)) {
//         return res.status(400).json({ error: 'Invalid user ID' });
//     }

//     const personalizedFeed = generatePersonalizedFeed(userId);
//     res.json(personalizedFeed);
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });








// const express = require('express');
// const app = express();

// // Sample data for movies and user preferences
// const movies = [
//     { id: 1, title: 'The Shawshank Redemption', genre: 'Drama' },
//     { id: 2, title: 'The Godfather', genre: 'Crime' },
//     { id: 3, title: 'The Dark Knight', genre: 'Action' },
//     { id: 4, title: 'Pulp Fiction', genre: 'Crime' },
//     { id: 5, title: 'The Lord of the Rings: The Return of the King', genre: 'Fantasy' }
// ];

// const users = [
//     { id: 1, name: 'User1', preferredGenre: 'Drama' },
//     { id: 2, name: 'User2', preferredGenre: 'Action' },
//     { id: 3, name: 'User3', preferredGenre: 'Fantasy' },
//     { id: 4, name: 'User3', preferredGenre: 'Crime' }

// ];

// // Function to generate personalized movie feed for a user
// function generateMovieFeed(userId) {
//     const user = users.find(user => user.id === userId);
//     if (!user) {
//         return { error: 'User not found' };
//     }

//     const recommendedMovies = movies.filter(movie => movie.genre === user.preferredGenre);
//     return recommendedMovies;
// }

// // Route to get personalized movie feed for a user
// app.get('/user/:userId/movies', (req, res) => {
//     const userId = parseInt(req.params.userId);
//     const movieFeed = generateMovieFeed(userId);
//     res.json(movieFeed);
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });







// const express = require('express');
// const app = express();

// // Sample data for movies and user preferences
// const movies = [
//     { id: 1, title: 'The Shawshank Redemption', genre: 'Drama', release_date: new Date('1994-10-14') },
//     { id: 2, title: 'The Godfather', genre: 'Crime', release_date: new Date('1972-03-24') },
//     { id: 3, title: 'The Dark Knight', genre: 'Action', release_date: new Date('2008-07-18') },
//     { id: 4, title: 'Pulp Fiction', genre: 'Crime', release_date: new Date('1994-10-14') },
//     { id: 5, title: 'The Lord of the Rings: The Return of the King', genre: 'Fantasy', release_date: new Date('2003-12-17') }
// ];

// const users = [
//     { id: 1, name: 'User1', preferredGenres: ['Drama', 'Crime'], relatedUsers: [2, 3] },
//     { id: 2, name: 'User2', preferredGenres: ['Action', 'Fantasy'], relatedUsers: [1] },
//     { id: 3, name: 'User3', preferredGenres: ['Action', 'Drama'], relatedUsers: [1] }
// ];

// // Function to calculate Gaussian decay for time delta
// function gaussianDecay(timeDelta) {
//     const decayFactor = 0.5; // Adjust decay factor as needed
//     return Math.exp(-decayFactor * timeDelta);
// }

// // Function to calculate relevance score for a movie
// function calculateRelevanceScore(movie, user) {
//     const timeDelta = Math.abs(new Date() - movie.release_date) / (1000 * 60 * 60 * 24); // Time delta in days
//     const timeImpact = gaussianDecay(timeDelta);
//     const genrePreference = user.preferredGenres.includes(movie.genre) ? 1 : 0;
//     const relatedUsers = users.filter(u => user.relatedUsers.includes(u.id));
//     const relatedUsersPreference = relatedUsers.reduce((sum, u) => {
//         return sum + (u.preferredGenres.includes(movie.genre) ? 1 : 0);
//     }, 0) / relatedUsers.length;

//     // Overall relevance score
//     return (0.5 * timeImpact) + (0.3 * genrePreference) + (0.2 * relatedUsersPreference);
// }

// // Function to generate personalized movie feed for a user
// function generateMovieFeed(userId) {
//     const user = users.find(user => user.id === userId);
//     if (!user) {
//         return { error: 'User not found' };
//     }

//     const rankedMovies = movies.map(movie => ({
//         ...movie,
//         relevanceScore: calculateRelevanceScore(movie, user)
//     })).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);

//     return rankedMovies;
// }

// // Route to get personalized movie feed for a user
// app.get('/user/:userId/movies', (req, res) => {
//     const userId = parseInt(req.params.userId);
//     const movieFeed = generateMovieFeed(userId);
//     res.json(movieFeed);
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });




// const express = require('express');
// const app = express();

// // Sample datasets
// const userData = [
//     { id: 1, name: 'User1', preferredGenres: ['Drama', 'Crime'], relatedUsers: [2, 3] },
//     { id: 2, name: 'User2', preferredGenres: ['Action', 'Fantasy'], relatedUsers: [1] },
//     { id: 3, name: 'User3', preferredGenres: ['Action', 'Drama'], relatedUsers: [1] }
// ];

// const movieData = [
//     { id: 1, title: 'The Shawshank Redemption', genre: 'Drama', release_date: '1994-10-14' },
//     { id: 2, title: 'The Godfather', genre: 'Crime', release_date: '1972-03-24' },
//     { id: 3, title: 'The Dark Knight', genre: 'Action', release_date: '2008-07-18' },
//     { id: 4, title: 'Pulp Fiction', genre: 'Crime', release_date: '1994-10-14' },
//     { id: 5, title: 'The Lord of the Rings: The Return of the King', genre: 'Fantasy', release_date: '2003-12-17' }
// ];

// // Parse datasets into usable format
// const users = userData.map(user => ({
//     id: user.id,
//     name: user.name,
//     preferredGenres: user.preferredGenres,
//     relatedUsers: user.relatedUsers
// }));

// const movies = movieData.map(movie => ({
//     id: movie.id,
//     title: movie.title,
//     genre: movie.genre,
//     release_date: new Date(movie.release_date)
// }));

// // Route to get parsed datasets
// app.get('/datasets', (req, res) => {
//     res.json({ users, movies });
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });




// const express = require('express');
// const app = express();

// // Sample datasets
// const userData = [
//     { id: 1, name: 'User1', preferredGenres: ['Drama', 'Crime'], relatedUsers: [2, 3] },
//     { id: 2, name: 'User2', preferredGenres: ['Action', 'Fantasy'], relatedUsers: [1] },
//     { id: 3, name: 'User3', preferredGenres: ['Action', 'Drama'], relatedUsers: [1] }
// ];

// const movieData = [
//     { id: 1, title: 'The Shawshank Redemption', genre: 'Drama', release_date: '1994-10-14' },
//     { id: 2, title: 'The Godfather', genre: 'Crime', release_date: '1972-03-24' },
//     { id: 3, title: 'The Dark Knight', genre: 'Action', release_date: '2008-07-18' },
//     { id: 4, title: 'Pulp Fiction', genre: 'Crime', release_date: '1994-10-14' },
//     { id: 5, title: 'The Lord of the Rings: The Return of the King', genre: 'Fantasy', release_date: '2003-12-17' }
// ];

// // Parse datasets into usable format
// const users = userData.map(user => ({
//     id: user.id,
//     name: user.name,
//     preferredGenres: user.preferredGenres,
//     relatedUsers: user.relatedUsers
// }));

// const movies = movieData.map(movie => ({
//     id: movie.id,
//     title: movie.title,
//     genre: movie.genre,
//     release_date: new Date(movie.release_date)
// }));

// // Function to calculate time delta and apply Gaussian decay
// function calculateRelevance(movie) {
//     const timeDelta = Math.abs(new Date() - movie.release_date) / (1000 * 60 * 60 * 24); // Time delta in days
//     const decayFactor = 0.5; // Adjust decay factor as needed
//     const timeImpact = Math.exp(-decayFactor * timeDelta);
//     return timeImpact;
// }

// // Function to calculate user's preference towards the movie based on genres
// function calculateUserPreference(movie, user) {
//     const genrePreference = user.preferredGenres.includes(movie.genre) ? 1 : 0;
//     return genrePreference;
// }

// // Function to calculate preference towards the movie by related users
// function calculateRelatedUsersPreference(movie, user) {
//     const relatedUsers = users.filter(u => user.relatedUsers.includes(u.id));
//     const relatedUsersPreference = relatedUsers.reduce((sum, u) => {
//         return sum + (u.preferredGenres.includes(movie.genre) ? 1 : 0);
//     }, 0) / relatedUsers.length;
//     return relatedUsersPreference;
// }

// // Route to get movie recommendations for a user
// app.get('/user/:userId/movies', (req, res) => {
//     const userId = parseInt(req.params.userId);
//     const user = users.find(user => user.id === userId);
//     if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//     }

//     const recommendedMovies = movies.map(movie => {
//         const timeImpact = calculateRelevance(movie);
//         const userPreference = calculateUserPreference(movie, user);
//         const relatedUsersPreference = calculateRelatedUsersPreference(movie, user);
//         const relevanceScore = (0.5 * timeImpact) + (0.3 * userPreference) + (0.2 * relatedUsersPreference);
//         return {
//             id: movie.id,
//             title: movie.title,
//             relevanceScore: relevanceScore
//         };
//     }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);

//     res.json(recommendedMovies);
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });







const express = require('express');
const app = express();

// Sample datasets
const userData = [
    { id: 1, name: 'User1', preferredGenres: ['Drama', 'Crime'], relatedUsers: [2, 3] },
    { id: 2, name: 'User2', preferredGenres: ['Action', 'Fantasy'], relatedUsers: [1] },
    { id: 3, name: 'User3', preferredGenres: ['Action', 'Drama'], relatedUsers: [1] }
];

const movieData = [
    { id: 1, title: 'The Shawshank Redemption', genre: 'Drama', release_date: '1994-10-14' },
    { id: 2, title: 'The Godfather', genre: 'Crime', release_date: '1972-03-24' },
    { id: 3, title: 'The Dark Knight', genre: 'Action', release_date: '2008-07-18' },
    { id: 4, title: 'Pulp Fiction', genre: 'Crime', release_date: '1994-10-14' },
    { id: 5, title: 'The Lord of the Rings: The Return of the King', genre: 'Fantasy', release_date: '2003-12-17' }
];

// Parse datasets into usable format
const users = userData.map(user => ({
    id: user.id,
    name: user.name,
    preferredGenres: user.preferredGenres,
    relatedUsers: user.relatedUsers
}));

const movies = movieData.map(movie => ({
    id: movie.id,
    title: movie.title,
    genre: movie.genre,
    release_date: new Date(movie.release_date)
}));

// Function to calculate time delta and apply Gaussian decay
function calculateRelevance(movie) {
    const timeDelta = Math.abs(new Date() - movie.release_date) / (1000 * 60 * 60 * 24); // Time delta in days
    const decayFactor = 0.5; // Adjust decay factor as needed
    const timeImpact = Math.exp(-decayFactor * timeDelta);
    return timeImpact;
}

// Function to calculate user's preference towards the movie based on genres
function calculateUserPreference(movie, user) {
    const genrePreference = user.preferredGenres.includes(movie.genre) ? 1 : 0;
    return genrePreference;
}

// Function to calculate preference towards the movie by related users
function calculateRelatedUsersPreference(movie, user) {
    const relatedUsers = users.filter(u => user.relatedUsers.includes(u.id));
    const relatedUsersPreference = relatedUsers.reduce((sum, u) => {
        return sum + (u.preferredGenres.includes(movie.genre) ? 1 : 0);
    }, 0) / relatedUsers.length;
    return relatedUsersPreference;
}

// Route to get top 10 movie recommendations for a user
app.get('/user/:userId/movies', (req, res) => {
    const userId = parseInt(req.params.userId);
    const user = users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const rankedMovies = movies.map(movie => {
        const timeImpact = calculateRelevance(movie);
        const userPreference = calculateUserPreference(movie, user);
        const relatedUsersPreference = calculateRelatedUsersPreference(movie, user);
        const relevanceScore = (0.5 * timeImpact) + (0.3 * userPreference) + (0.2 * relatedUsersPreference);
        return {
            id: movie.id,
            title: movie.title,
            relevanceScore: relevanceScore
        };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);

    res.json(rankedMovies);
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});









// const express = require('express');
// const fs = require('fs');
// const app = express();

// // Read and parse User dataset
// const userData = JSON.parse(fs.readFileSync('user_data.json'));

// // Read and parse Movie dataset
// const movieData = JSON.parse(fs.readFileSync('movie_data.json'));

// // Read and parse User Preference dataset
// const userPreferenceData = JSON.parse(fs.readFileSync('user_preference.json'));

// // Read and parse Related Users dataset
// const relatedUsersData = JSON.parse(fs.readFileSync('related_users.json'));

// // Parsing datasets into usable format
// const users = userData.map(user => ({
//     id: user.user_id,
//     name: user.name
// }));

// const movies = movieData.map(movie => ({
//     id: movie.movie_id,
//     genres: movie.genres,
//     release_date: new Date(movie.release_date)
// }));

// // const userPreferences = userPreferenceData.map(preference => ({
// //     user_id: preference.user_id,
// //     genre: preference.genre,
// //     preference_score: preference.preference_score
// // }));

// //  userPreferenceData.map(preference => 
// //     // (
// //         {
// //     console.log(preference.preference.preference_score)
// //     //     user_id: preference.user_id,
// //     //     genre: preference.genre,
// //     //     preference_score: preference.preference_score
// //     }
// //     // )
// //     );



// // Initialize an object to store related users
// const relatedUsers = {};

// // Loop through the keys of the relatedUsersData object
// for (const userId in relatedUsersData) {
//     if (Object.hasOwnProperty.call(relatedUsersData, userId)) {
//         // Extract the array of related users for the current user ID
//         const relatedUsersArray = relatedUsersData[userId];

//         // Store the related users array in the relatedUsers object
//         relatedUsers[userId] = relatedUsersArray;
//     }
// }





// function calculateRelevance(movie) {
//     const timeDelta = Math.abs(new Date() - movie.release_date) / (1000 * 60 * 60 * 24); // Time delta in days
//     // console.log("Time Delta:", timeDelta);
//     const decayFactor = 0.5; // Adjust decay factor as needed
//     const timeImpact = Math.exp(-decayFactor * timeDelta);
//     // console.log("Time Impact:", timeImpact);
//     return timeImpact;
// }

// function calculateUserPreference(movie, userId) {
//     const userPreference = userPreferences.find(preference => preference.user_id === userId && movie.genres.includes(preference.genre));
//     // console.log("User Preference for Movie", movie.id, "by User", userId, ":", userPreference ? userPreference.preference_score : 0);
//     return userPreference ? userPreference.preference_score : 0;
// }

// function calculateRelatedUsersPreference(movie, userId) {
//     const relatedUserIds = relatedUsers[userId] || [];
//     const totalRelatedUsers = relatedUserIds.length;
//     // console.log("Total Related Users for User", userId, ":", totalRelatedUsers);
//     if (totalRelatedUsers === 0) return 0;

//     const relatedUsersPreferenceSum = relatedUserIds.reduce((sum, relatedUserId) => {
//         const userPreference = calculateUserPreference(movie, relatedUserId);
//         // console.log("User Preference for Movie", movie.id, "by Related User", relatedUserId, ":", userPreference);
//         return sum + userPreference;
//     }, 0);

//     // console.log("Related Users Preference Sum for Movie", movie.id, ":", relatedUsersPreferenceSum);
//     return relatedUsersPreferenceSum / totalRelatedUsers;
// }

    

// // Route to get top 10 movie recommendations for a user
// app.get('/user/:userId/movies', (req, res) => {
//     const userId = parseInt(req.params.userId);
//     const user = users.find(user => user.id === userId);
//     if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//     }

//     const rankedMovies = movies.map(movie => {
//         const timeImpact = calculateRelevance(movie);
//         const userPreference = calculateUserPreference(movie, userId);
//         const relatedUsersPreference = calculateRelatedUsersPreference(movie, userId);
//         const relevanceScore = (0.5 * timeImpact) + (0.3 * userPreference) + (0.2 * relatedUsersPreference);
//         return {
//             id: movie.id,
//             genres: movie.genres,
//             release_date: movie.release_date,
//             relevanceScore: relevanceScore
//         };
//     }).sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 10);

//     res.json(rankedMovies);
// });

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });




















