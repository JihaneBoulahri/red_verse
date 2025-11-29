import axios from 'axios';

export async function getTopTracks() {
  try {
    const response = await axios.get('http://localhost:3001/api/deezer/tracks');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching Deezer tracks:', error);
    return [];
  }
}
