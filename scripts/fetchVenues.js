import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';

// Base URL for Eventernote
const BASE_URL = 'https://www.eventernote.com/places';

// Update the list of prefectures to include all 47 prefectures in Japan and overseas
const PREFECTURES = Array.from({ length: 47 }, (_, i) => i + 1).concat(90);

// Function to fetch venues for a specific prefecture
async function fetchVenuesForPrefecture(prefectureId) {
  try {
    const url = `${BASE_URL}/prefecture/${prefectureId}`; // Correct URL structure
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const venues = new Map(); // Use a Map to ensure uniqueness

    // Updated selector to match venue links based on observed structure
    $('ul.gb_places_list li a').each((_, element) => {
      const venueName = $(element).text().trim();
      const venueId = $(element).attr('href').split('/').pop();

      // Ensure uniqueness by using venueId as the key
      if (!venues.has(venueId)) {
        venues.set(venueId, { id: venueId, name: venueName });
      }
    });

    return Array.from(venues.values()); // Convert Map back to an array
  } catch (error) {
    console.error(`Failed to fetch venues for prefecture ${prefectureId}:`, error);
    return [];
  }
}

// Main function to fetch all venues
async function fetchAllVenues() {
  const allVenues = [];

  for (const prefectureId of PREFECTURES) {
    console.log(`Fetching venues for prefecture ${prefectureId}...`);
    const venues = await fetchVenuesForPrefecture(prefectureId);

    // Transform data into the desired format
    venues.forEach((venue) => {
      allVenues.push({ venueId: venue.id, prefectureId });
    });
  }

  // Save to JSON file
  fs.writeFileSync(
    './venues.json',
    JSON.stringify(allVenues, null, 2),
    'utf-8'
  );

  console.log('All venues have been fetched and saved to venues.json');
}

// Run the script
fetchAllVenues();