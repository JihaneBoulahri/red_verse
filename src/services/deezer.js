import axios from 'axios';


export async function getTopTracks() {
  try {
    const response = await axios.get('http://localhost:3000/api/deezer/tracks');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching Deezer tracks:', error);
    return [];
  }
}

export async function getPlaylists() {
  try{
    const res = await axios.get("http://localhost:3000/api/deezer/playlists")
    return res?.data?.data || []
  } catch (err) {
    console.error('Error fetching playlists', err)
    return []
  }
}