import { Client, ID, Query , Databases} from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT;

const client = new Client()// from appwrite.
	.setEndpoint(ENDPOINT) // API Endpoint
	.setProject(PROJECT_ID);

const database = new Databases(client);
export const updateSearchCount = async (searchTerm, movie) => {
	// 1. Use Appwrite SDK/API to check if the search term exist in the database.
	try {
		// want list of documents in this table inside this database matching what we have in database with what the use is waiting for.
		const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
			Query.equal('searchTerm', searchTerm)
		]);
		// 2. If it does, update the count.
		if (result.documents.length > 0) {
			const doc = result.documents[0];
			// update the count
			await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
				count: doc.count + 1
			});
		}
		// 3. If it doesn't, create a new document with the search term and count and count as 1.
		else {
			await database.createDocument (DATABASE_ID, COLLECTION_ID, ID.unique (), {
				searchTerm,
				count: 1,
				movie_id: movie.id,
				poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
			})
		}
	} catch (error) {
		console.log(error);
	}
}

export const getTrendingMovies = async () => {
	try {
		const result = await database.listDocuments (DATABASE_ID, COLLECTION_ID, [
			Query.limit (5),
			Query.orderDesc ("count"),
		])
		return result.documents;
	} catch (error) {
		console.error (error);
	}
}