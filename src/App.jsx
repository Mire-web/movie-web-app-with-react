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

	const fetchMovies = async (query='') => {
		try{
			setIsLoading(true);
			setErrorMsg('');
			const searchUrl = query ? `https://api.themoviedb.org/3/search/${type}?query=${encodeURIComponent(query)}&include_adult=true` : '';
			const res = await fetch(searchUrl ? searchUrl : mainUrl, options);

			if (!res.ok){
				throw new Error("Failed to fetch movies.");
			}
			const data = await res.json();
			if (data.response === 'False'){
				setErrorMsg(data.Error || "Failed to fetch movies.");
				setMovieList([]);
				return;
			}
			setMovieList(data.results || []);
			setTotalPageNumber(data.total_pages > 500 ? 500 : data.total_pages);
			if (query && data.results.length > 0) {
				await updateSearchCount(query, data.results[0]);
			}
		} catch (err){
			setErrorMsg(err);
		} finally{
			setIsLoading(false);
		}
	};

	const fetchTrendingMovies = async () =>{
		try{
			const result = await getTrendingSearch();
			if (result.length > 0){
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
	const decrementPageNumber = () =>{
		document.getElementById(currentPageNumber).classList.remove('active');
		document.getElementById(currentPageNumber - 1).classList.add('active');
		setCurrentPageNumber(currentPageNumber - 1);
	}

  return (
	<main>
		<div className="pattern"/>
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
			<Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
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
					<p className="text-white">Loading...</p>
				) : 
				errorMsg ? (
				<p className="text-red-500">{errorMsg.message}</p>
			) : (
					<ul>
					{movieList.map((movie) => {
						return ( <MovieCard key={movie.id} movie={movie}/> )
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