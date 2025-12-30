// Simple localStorage-only version - works perfectly on GitHub Pages
export const updateSearchCount = async (searchTerm, movie) => {
  try {
    const searches = JSON.parse(localStorage.getItem('movie_searches') || '[]');
    const existing = searches.find(s => s.searchTerm === searchTerm);
    
    if (existing) {
      existing.count += 1;
    } else {
      searches.push({
        searchTerm,
        count: 1,
        movie_id: movie.id,
        movie_title: movie.title || movie.original_title || 'Unknown',
        poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        timestamp: Date.now()
      });
    }
    
    // Keep only top 100
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
    return searches
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(item => ({
        searchTerm: item.searchTerm,
        count: item.count,
        movie_id: item.movie_id,
        movie_title: item.movie_title,
        poster_url: item.poster_url
      }));
  } catch {
    return [];
  }
};