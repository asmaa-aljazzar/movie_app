import React from 'react';

//* To access all props we can use props obj.
//! The value of state change using only setting function.
const Search = ({ searchTerm, setSearchTerm }) => {
	return (
		<main>

			<div className='search'>
				<div>
					<img src="search.svg" alt="search" />
					<input
						type="text"
						placeholder='Search through thousands of movies'
						value={searchTerm}
						// onChange is important
						onChange={(e) => setSearchTerm(e.target.value)} // this how to change state value using input value
					/>
				</div>
			</div>
		</main>
	)
}

export default Search;