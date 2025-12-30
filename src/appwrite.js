// appwrite.js - Fixed to track movies, not search terms
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    // We'll track movies by their ID, not by search term
    const searches = JSON.parse(localStorage.getItem('movie_searches') || '[]');
    
    // Find if this movie already exists (by movie ID)
    const existing = searches.find(s => s.movie_id === movie.id);
    
    if (existing) {
      // Movie already tracked - increase count
      existing.count += 1;
      existing.lastSearched = Date.now();
    } else {
      // New movie - add it
      searches.push({
        movie_id: movie.id,
        movie_title: movie.title || movie.original_title || 'Unknown',
        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        count: 1,
        lastSearched: Date.now()
      });
    }
    
    // Keep only top 100 movies
    if (searches.length > 100) {
      searches.sort((a, b) => b.count - a.count);
      searches.length = 100;
    }
    
    localStorage.setItem('movie_searches', JSON.stringify(searches));
  } catch (error) {
    console.log('Error saving search:', error);
  }
};

export const getTrendingMovies = async () => {
  try {
    const searches = JSON.parse(localStorage.getItem('movie_searches') || '[]');
    
    // Return movies sorted by count (most searched first)
    return searches
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(movie => ({
        id: movie.movie_id,
        title: movie.movie_title,
        poster_path: movie.poster_url ? movie.poster_url.replace('https://image.tmdb.org/t/p/w500', '') : null,
        poster_url: movie.poster_url,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        count: movie.count
      }));
  } catch {
    return [];
  }
};