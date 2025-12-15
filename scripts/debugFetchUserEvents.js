const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function fetchAllUserEvents(username, userId) {
  const events = [];

  try {
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const url = `https://www.eventernote.com/users/${username}/events?page=${page}&user_id=${userId}`;
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);

      // Debugging: Save the HTML response to a file for inspection
      fs.writeFileSync(`./debug_user_events_page_${page}.html`, response.data, 'utf-8');

      const pageEvents = [];

      $('h4 a').each((_, element) => {
        const eventTitle = $(element).text().trim();
        const eventLink = $(element).attr('href');
        const eventId = eventLink?.split('/').pop() || '';

        const date = $(element).closest('div').find('.date-class').text().trim() || '';
        const openTime = $(element).closest('div').find('.open-time-class').text().trim() || '';
        const startTime = $(element).closest('div').find('.start-time-class').text().trim() || '';
        const endTime = $(element).closest('div').find('.end-time-class').text().trim() || '';

        const venueElement = $(element).closest('div').find('.venue-class a');
        const venue = {
          id: venueElement.attr('href')?.split('/').pop() || '',
          name: venueElement.text().trim(),
          prefecture: {
            id: $(element).closest('div').find('.prefecture-class').attr('data-id') || '',
            name: $(element).closest('div').find('.prefecture-class').text().trim() || '',
          },
        };

        const performers = $(element)
          .closest('div')
          .find('.performers-class a')
          .map((_, el) => ({
            name: $(el).text().trim(),
            id: $(el).attr('href')?.split('/').pop() || '',
          }))
          .get();

        if (eventId && eventTitle) {
          pageEvents.push({
            id: eventId,
            title: eventTitle,
            date,
            openTime,
            startTime,
            endTime,
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

// Example usage
fetchAllUserEvents('exampleUsername', 'exampleUserId');