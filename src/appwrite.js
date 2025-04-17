import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const appwriteClient = new Client().setEndpoint('https://cloud.appwrite.io/v1').setProject(PROJECT_ID);
const DATABASE = new Databases(appwriteClient);

export const getTrendingSearch = async () => {
	try{
		const trendingMovies = await DATABASE.listDocuments(DATABASE_ID, COLLECTION_ID, [
			Query.limit(5),
			Query.orderDesc('count')
		])
		return trendingMovies.documents;
	} catch (err) {
		console.error(err);
	}
}

export const updateSearchCount = async (searchTerm, movie) => {
	// check if searchterm exists
	try {
		const found = await DATABASE.listDocuments(DATABASE_ID, COLLECTION_ID,
			[
				Query.equal('searchTerm', searchTerm)
			]
		);
		// if it does update the count
		if (found.documents.length > 0) {
			const doc = found.documents[0];

			await DATABASE.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
				count: doc.count + 1,
			})
		} else {
			// if it doesn't create new document and set count to 1
			await DATABASE.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
				searchTerm: searchTerm,
				count: 1,
				poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
				movie_id: movie.id
			})
		}
	} catch (err) {
		console.log(err);
	}
}
