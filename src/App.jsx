import React, { useState, useEffect } from 'react';
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx';
import MovieCard from './components/MovieCard.jsx';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js';

// From API Document.
const API_BASE_URL = 'https://api.themoviedb.org/3'
// From .env file.
const API_KEY = import.meta.env.VITE_TMDB_API_TOKEN;
// API Options obj.
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [debounceSearchTerm, setDebounceSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessaage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingerrorMessage, setTrendingErrorMessaage] = useState('');
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);

  // Debounce the search term
  useDebounce(() => setDebounceSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessaage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();
      setMovieList(data.results || []);
      
      // Only update search count if we have a valid search with results
      if (query && query.trim() && data.results && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error('Error in fetchMovies:', error);
      setErrorMessaage(' Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      setIsTrendingLoading(true);
      setTrendingErrorMessaage("");
      const movies = await getTrendingMovies();
      // Ensure movies is always an array
      setTrendingMovies(Array.isArray(movies) ? movies : []);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
      setTrendingErrorMessaage('Error fetching trending movies');
      setTrendingMovies([]); // Set empty array on error
    } finally {
      setIsTrendingLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
          <img 
            src="/movie_app/hero.png" 
            alt="Hero Banner" 
            loading="lazy"
            onError={(e) => {
              e.target.src = '/movie_app/hero-bg.png';
            }}
          />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
          </h1>
        </header>
        
        {/* Trending Movies Section */}
        <section className="trending">
          <h2>Trending Movies</h2>
          {isTrendingLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : trendingerrorMessage ? (
            <p className="text-red-500 text-center">{trendingerrorMessage}</p>
          ) : trendingMovies.length > 0 ? (
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={`${movie.searchTerm}-${index}`}>
                  <p>{index + 1}</p>
                  <img 
                    src={movie.poster_url || '/movie_app/no-movie.png'} 
                    alt={movie.searchTerm || `Movie ${index + 1}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = '/movie_app/no-movie.png';
                    }}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No trending searches yet</p>
          )}
        </section>
        
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        
        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : errorMessage ? (
            <p className="text-red-500 text-center">{errorMessage}</p>
          ) : movieList.length > 0 ? (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-500">No movies found</p>
          )}
        </section>
      </div>
    </main>
  )
}

export default App;