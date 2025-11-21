// src/services/jamendo.js
import axios from "axios";

// Remplace "TA_CLIENT_ID" par ton Client ID Jamendo
const CLIENT_ID = "034aa05c";
const BASE_URL = "https://api.jamendo.com/v3.0";

export const getTopTracks = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/tracks`, {
      params: {
        client_id: CLIENT_ID,
        format: "json",
        limit: 10,               // nombre de chansons à récupérer
        order: "popularity_total" // les plus populaires
      }
    });
    return response.data.results;
  } catch (error) {
    console.error("Erreur API Jamendo:", error);
    return [];
  }
};
