import React, { useState } from 'react'

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, original_language} }) => {
  const [imgError, setImgError] = useState(false);
  
  const handleImageError = () => {
    setImgError(true);
  }

  return (
    <div className="movie-card">
      <img 
        src={imgError || !poster_path ? '/movie_app/no-movie.png' : `https://image.tmdb.org/t/p/w500/${poster_path}`} 
        alt={title} 
        loading="lazy"
        onError={handleImageError}
      />
      <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <img src="/movie_app/star.svg" alt="Star Icon" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
            <span>•</span>
            <p className="lang">{original_language}</p>
            <span>•</span>
            <p className="year">
              {release_date ? release_date.split('-')[0] : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard;