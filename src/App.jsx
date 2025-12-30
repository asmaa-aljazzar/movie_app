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
		// What kind of data would be accepted by the app.
		accept: 'application/json', // The API will send json object.
		//? This tells TMDb: “Here is my key; allow me to access the API.
		Authorization: `Bearer ${API_KEY}`
	}
}

const App = () => {
	// To search we should set the state here and pass it as a prop.

	const [debounceSearchTerm, setDebounceSearchTerm] = useState('');
	const [searchTerm, setSearchTerm] = useState('');

	const [movieList, setMovieList] = useState([]);
	const [errorMessage, setErrorMessaage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const [trendingMovies, setTrendingMovies] = useState([]);
	const [trendingerrorMessage, setTrendingErrorMessaage] = useState('');
	const [isTrendingLoading, setIsTrendingLoading] = useState(false);

	//?
	//  Debounce the search term to prevent making too many API requests.
	useDebounce(() => setDebounceSearchTerm(searchTerm), 500, // 500 ms
		[searchTerm])
	const fetchMovies = async (query = '') => { // query is for search result
		setIsLoading(true);
		setErrorMessaage('');

		try {
			// to fetch all movies sorted descending by popularity
			const endpoint = query
				? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` // No matter witch kind of characters in searchTerm 'utf8'
				: `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
			const response = await fetch(endpoint, API_OPTIONS);

			// If error while fetching data:
			if (!response.ok)
				throw new Error('Failed to fetch movies'); // throw it to the nearest catch

			const data = await response.json();
			setMovieList(data.results || []);
			if (query && data.results.length > 0)
				await updateSearchCount(query, data.results[0]);
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
			setTrendingMovies(movies);
		} catch (error) {
			console.error(`Error fetching trending movies: ${error}`);
			setTrendingErrorMessaage('Error fetching trending movies. Try again later');
		}
		finally {
			setIsTrendingLoading(false);
		}
	}

	useEffect(() => {
		fetchMovies(debounceSearchTerm); // to delay the search
	}, [debounceSearchTerm]);
	// Because we don't want the trending run each time someone search for a movie.
	// because the first one depend on search term 
	useEffect(() => {
		loadTrendingMovies();
	}, []); // empty means only run at the start.
	return (
		<main>
			<div className="pattern" />
			<div className="wrapper">
				<header>
					<img src="./hero.png" alt="Hero Banner" />
					<h1>
						Find <span className="text-gradient">Movies</span> You'll Enjoy Without the Hassle
					</h1>
				</header>
				{isTrendingLoading && <Spinner />}

				{!isTrendingLoading && trendingerrorMessage && (
					<p className="text-red-500">{trendingerrorMessage}</p>
				)}

				{!isTrendingLoading && !trendingerrorMessage && trendingMovies.length > 0 && (
					<section className="trending">
						<h2>Trending Movies</h2>
						<ul>
							{trendingMovies.map((movie, index) => (
								<li key={movie.$id}>
									<p>{index + 1}</p>
									<img src={movie.poster_url} alt={movie.title} />
								</li>
							))}
						</ul>
					</section>
				)}
				<Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
				<section className="all-movies">
					<h2>All Movies</h2>
					{isLoading ? (
						<Spinner />
					) : errorMessage ? (
						<p className="text-red-500">{errorMessage}</p>
					) : (
						<ul>
							{movieList.map((movie) => (
								<MovieCard key={movie.id} movie={movie} />
							))}
						</ul>
					)}
				</section>
			</div>
		</main>
	)

}

export default App