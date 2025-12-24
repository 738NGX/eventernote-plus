import axios from 'axios';
import * as cheerio from 'cheerio';
import { getPrefectureNameById } from '../prefecture';
import { EventData } from '../events/eventdata';
import { parseDate, parseTime } from '../times';

/**
 * Fetches all events for a user from Eventernote across all pages.
 * @param username The username of the user.
 * @param userId The user ID of the user.
 * @returns A promise that resolves to an array of event objects.
 */
export async function fetchAllUserEvents(username: string, year?: string): Promise<EventData[]> {
  const events: EventData[] = [];

  try {
    let page = 1;
    let hasMorePages = true;
    const venueData = await fetchVenueData();

    while (hasMorePages) {
      const url = `https://www.eventernote.com/users/${username}/events?page=${page}&limit=1000${year ? `&year=${year}` : ''}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      const pageEvents: EventData[] = [];

      $('li.clearfix').each((_, element) => {
        const eventTitle = $(element).find('h4 a').text().trim();
        const eventLink = $(element).find('h4 a').attr('href');
        let eventId = eventLink?.split('/').pop() || '';
        eventId = eventId.split('?')[0].split('#')[0];

        const dateText = $(element).find('.date p').first().text().trim();
        const timeText = $(element).find('.place span.s').text().trim();
        const date = parseDate(dateText);
        const times = parseTime(timeText);

        const venueElement = $(element).find('.place a');
        const venue = venueElement.length
          ? {
            id: (() => {
              let vid = venueElement.attr('href')?.split('/').pop() || '';
              return vid.split('?')[0].split('#')[0];
            })(),
            name: venueElement.text().trim(),
            prefecture: {
              id: '',
              name: '',
            },
          }
          : { id: '', name: '', prefecture: { id: '', name: '' } };

        if (venue) {
          const venueMatch = venueData.find(v => String(v.venueId) === String(venue.id));
          if (venueMatch) {
            const prefectureId = venueMatch.prefectureId.toString();
            venue.prefecture.id = prefectureId;
            venue.prefecture.name = getPrefectureNameById(prefectureId);
          }
        }

        const performers = $(element)
          .find('.actor ul li a')
          .map((_, el) => ({
            name: $(el).text().trim(),
            id: (() => {
              let pid = $(el).attr('href')?.split('/').pop() || '';
              return pid.split('?')[0].split('#')[0];
            })(),
          }))
          .get();

        if (eventId && eventTitle) {
          pageEvents.push({
            id: eventId,
            title: eventTitle,
            date,
            times,
            participantCount: parseInt($(element).find('.note_count p').text().trim()) || 0,
            venue,
            performers,
          });
        }
      });

      if (pageEvents.length > 0) {
        events.push(...pageEvents);
        page++;
      } else {
        hasMorePages = false;
      }
    }

    return events;
  } catch (error) {
    console.error('Error fetching user events:', error);
    return events;
  }
}

// Updated fetchVenueData to use chrome.runtime.getURL for browser extension compatibility
export async function fetchVenueData(): Promise<[{ venueId: string, prefectureId: number }]> {
  const url = chrome.runtime.getURL('dist/venues.json'); // Get the correct URL for the extension environment
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to load venue data');
  }
  return response.json();
}
