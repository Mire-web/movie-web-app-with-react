import React, { useEffect, useState } from "react"
import Search from "./components/Search"
import MovieCard from "./components/MovieCard";
import { getTrendingSearch, updateSearchCount } from "./appwrite";
import { getPagination } from "./pagination";

const App = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [movieList, setMovieList] = useState([]);
	const [trending, setTrending] = useState([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [errorMsg, setErrorMsg] = useState('');
	const [sort, setSort] = useState('popularity.desc');
	const [currentPageNumber, setCurrentPageNumber] = useState(1);
	const [totalPageNumber, setTotalPageNumber] = useState(1);
	const [type, setType] = useState('movie')
	const date = new Date();

	const mainUrl = `https://api.themoviedb.org/3/discover/${type}?include_adult=true&include_video=true&language=en-US&page=${currentPageNumber}&release_date.lte=${date.toISOString()}&sort_by=${sort}`;
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`
		}
	};

	const fetchMovies = async (query = '') => {
		try {
			setIsLoading(true);
			setErrorMsg('');
			const searchUrl = query ? `https://api.themoviedb.org/3/search/${type}?query=${encodeURIComponent(query)}&include_adult=true` : '';
			const res = await fetch(searchUrl ? searchUrl : mainUrl, options);

			if (!res.ok) {
				throw new Error("Failed to fetch movies.");
			}
			const data = await res.json();
			if (data.response === 'False') {
				setErrorMsg(data.Error || "Failed to fetch movies.");
				setMovieList([]);
				return;
			}
			setMovieList(data.results || []);
			setTotalPageNumber(data.total_pages > 500 ? 500 : data.total_pages);
			if (query && data.results.length > 0) {
				await updateSearchCount(query, data.results[0]);
			}
		} catch (err) {
			setErrorMsg(err);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchTrendingMovies = async () => {
		try {
			const result = await getTrendingSearch();
			if (result.length > 0) {
				setTrending(result);
			}
		} catch (err) {
			console.log(err)
		}
	}

	useEffect(() => {
		const tm = setTimeout(() => {
			fetchMovies(searchTerm);
		}, 500);
		return () => clearTimeout(tm);
	}, [searchTerm]);

	useEffect(() => {
		fetchMovies(searchTerm);
	}, [sort, currentPageNumber, type]);

	useEffect(() => {
		fetchTrendingMovies();
	}, []);

	const handlePageChange = (e) => {
		Array.from(document.querySelectorAll('.page_number')).map((pgn) => pgn.classList.contains('active') && pgn.classList.remove('active'));
		// set current page number
		setCurrentPageNumber(e.target.id);
		// add background to current page
		e.target.classList.add('active');
	}

	const incrementPageNumber = () => {
		document.getElementById(currentPageNumber).classList.remove('active');
		document.getElementById(currentPageNumber + 1).classList.add('active');
		setCurrentPageNumber(currentPageNumber + 1);
	}
	const decrementPageNumber = () => {
		document.getElementById(currentPageNumber).classList.remove('active');
		document.getElementById(currentPageNumber - 1).classList.add('active');
		setCurrentPageNumber(currentPageNumber - 1);
	}

	return (
		<main>
			<div className="pattern" />
			<div className="wrapper">
				<header>
					<img src="/hero.png" alt="Hero Banner" />
					<h1>Kill Boredom And Elevate Your Lifestyle With Awesome <span className="text-gradient">Movies</span></h1>
				</header>
				{trending.length > 0 && (
					<section className="trending">
						<h2>Trending Movies</h2>
						<ul>
							{
								trending.map((movie, index) =>
								(
									<li key={movie.$id}>
										<p>{index + 1}</p>
										<img src={movie.poster_path || 'no-movie.png'} alt={movie.title} />
									</li>
								)
								)
							}
						</ul>
					</section>
				)}
				<section className="all-movies">
					<Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
					<h2>All Movies</h2>
					<div className="flex">
						<div>
							<label htmlFor="sort" className="text-white font-bold">Sort By</label>
							<select name="sort" id="sort" className="rounded-lg outline-hidden block w-[100px] sm:w-[150px] p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 sort-text" onChange={(e) => setSort(e.target.value)}>
								<option value="title.asc">A to Z</option>
								<option value="title.desc">Z to A</option>
								<option value="popularity.desc" selected>popularity_descending</option>
								<option value="popularity.asc">popularity_ascending</option>
								<option value="primary_release_date.desc">release_date_descending</option>
								<option value="primary_release_date.asc">release_date_ascending</option>
							</select>
						</div>
						<div className="ml-5">
							<label htmlFor="Type" className="text-white font-bold">Type</label>
							<select name="Type" id="type" className="rounded-lg outline-hidden block w-[100px] sm:w-[150px] p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 sort-text" onChange={(e) => setType(e.target.value)}>
								<option value="movie" selected>Movie</option>
								<option value="tv">Tv Shows</option>
							</select>
						</div>
					</div>

					{isLoading ? (

						<div role="status">
							<svg aria-hidden="true" class="w-[100px] h-[100px] ml-auto mr-auto mt-[150px] mb-[150px] animate-spin text-gray-600 fill-indigo-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
								<path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
							</svg>
							<span class="sr-only">Loading...</span>
						</div>

					) :
						errorMsg ? (
							<p className="text-red-500">{errorMsg.message}</p>
						) : (
							<ul>
								{movieList.map((movie) => {
									return (<MovieCard key={movie.id} movie={movie} />)
								})}
							</ul>
						)}
					<div className="pagination">
						{searchTerm === '' && <button className="mr-3" onClick={() => currentPageNumber > 1 && decrementPageNumber()}>{'<'}</button>}
						<ul>
							{
								searchTerm === '' && getPagination(currentPageNumber, totalPageNumber).map((index) => (
									<li key={index === "..." ? Math.random() : index} id={index} className={`page_number ${currentPageNumber === index && 'active'}`} onClick={handlePageChange}>{index}</li>
								))
							}
						</ul>
						{searchTerm === '' && <button className="ml-3" onClick={() => currentPageNumber < totalPageNumber && incrementPageNumber()}>{'>'}</button>}
					</div>
				</section>
			</div>
		</main>
	)
}

export default App