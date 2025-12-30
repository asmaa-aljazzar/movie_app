import { Client, ID, Query, Databases, Account } from "appwrite";

// Configuration
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';

// Check if we have valid credentials
const hasValidCredentials = PROJECT_ID && 
  PROJECT_ID !== 'YOUR_PROJECT_ID' && 
  !PROJECT_ID.includes('your_project');

let client = null;
let database = null;
let account = null;

// Initialize only if we have valid credentials
if (hasValidCredentials) {
  client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID);
  
  database = new Databases(client);
  account = new Account(client);
}

// Helper to create anonymous session
const ensureSession = async () => {
  if (!account) return false;
  
  try {
    await account.get();
    return true;
  } catch {
    try {
      await account.createAnonymousSession();
      return true;
    } catch (error) {
      console.warn('Failed to create anonymous session:', error);
      return false;
    }
  }
};

// LocalStorage fallback
const localStorageFallback = {
  updateSearch: (searchTerm, movie) => {
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
          poster_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
          timestamp: Date.now()
        });
      }
      
      // Keep only top 100 searches
      searches.sort((a, b) => b.count - a.count);
      if (searches.length > 100) searches.length = 100;
      
      localStorage.setItem('movie_searches', JSON.stringify(searches));
    } catch (error) {
      console.warn('LocalStorage fallback failed:', error);
    }
  },
  
  getTrending: () => {
    try {
      const searches = JSON.parse(localStorage.getItem('movie_searches') || '[]');
      return searches.sort((a, b) => b.count - a.count).slice(0, 5);
    } catch {
      return [];
    }
  }
};

export const updateSearchCount = async (searchTerm, movie) => {
  // Always update localStorage as backup
  localStorageFallback.updateSearch(searchTerm, movie);
  
  // Try Appwrite if available
  if (!hasValidCredentials || !database || !DATABASE_ID || !COLLECTION_ID) {
    console.warn('Appwrite not configured, using localStorage only');
    return;
  }
  
  try {
    // Ensure we have a session
    const hasSession = await ensureSession();
    if (!hasSession) {
      throw new Error('No Appwrite session');
    }
    
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal('searchTerm', searchTerm)
    ]);
    
    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
        lastUpdated: new Date().toISOString()
      });
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm,
        count: 1,
        movie_id: movie.id,
        poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.warn('Appwrite operation failed (using localStorage):', error.message);
    // Already updated localStorage above, so we're good
  }
};

export const getTrendingMovies = async () => {
  // Try Appwrite first
  if (hasValidCredentials && database && DATABASE_ID && COLLECTION_ID) {
    try {
      const hasSession = await ensureSession();
      if (!hasSession) {
        throw new Error('No Appwrite session');
      }
      
      const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
        Query.limit(5),
        Query.orderDesc("count"),
        Query.orderDesc("lastUpdated")
      ]);
      
      if (result.documents && result.documents.length > 0) {
        return result.documents;
      }
    } catch (error) {
      console.warn('Failed to get trending from Appwrite:', error.message);
    }
  }
  
  // Fallback to localStorage
  return localStorageFallback.getTrending();
};

// Debug function
export const debugAppwrite = () => {
  return {
    hasValidCredentials,
    projectId: PROJECT_ID ? 'Set' : 'Not set',
    databaseId: DATABASE_ID ? 'Set' : 'Not set',
    collectionId: COLLECTION_ID ? 'Set' : 'Not set',
    localStorageCount: JSON.parse(localStorage.getItem('movie_searches') || '[]').length
  };
};