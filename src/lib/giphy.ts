import { GiphyFetch } from '@giphy/js-fetch-api';
import { GiphyClip } from './types';
import { optimizeQuery, validateQueryLength, createFallbackQuery } from './query-optimizer';

if (!process.env.GIPHY_API_KEY) {
  throw new Error('Please add your Giphy API key to .env');
}

const gf = new GiphyFetch(process.env.GIPHY_API_KEY);

export async function searchFilmClips(query: string, limit: number = 10): Promise<GiphyClip[]> {
  try {
    // Optimize the query to prevent URI Too Long errors
    let optimizedQuery = optimizeQuery(query, true);
    
    // Validate query length
    const validation = validateQueryLength(optimizedQuery);
    if (!validation.isValid) {
      console.warn(`[Giphy] Query still too long after optimization: ${validation.length}/${validation.maxLength} chars`);
      optimizedQuery = createFallbackQuery(query);
    }
    
    console.log(`[Giphy] Searching with query: "${optimizedQuery}"`);
    const { data } = await gf.search(optimizedQuery, { limit, type: 'gifs' });
    
    return data.map((gif: any) => ({
      id: gif.id,
      url: gif.url,
      title: gif.title,
      images: {
        original: {
          url: gif.images.original.url,
        },
        fixed_height: {
          url: gif.images.fixed_height.url,
        },
      },
    }));
  } catch (error) {
    console.error('Error searching Giphy:', error);
    return [];
  }
}

export async function getTrendingFilmClips(limit: number = 10): Promise<GiphyClip[]> {
  try {
    const { data } = await gf.trending({ limit, type: 'gifs' });
    
    return data.map((gif: any) => ({
      id: gif.id,
      url: gif.url,
      title: gif.title,
      images: {
        original: {
          url: gif.images.original.url,
        },
        fixed_height: {
          url: gif.images.fixed_height.url,
        },
      },
    }));
  } catch (error) {
    console.error('Error fetching trending clips:', error);
    return [];
  }
}