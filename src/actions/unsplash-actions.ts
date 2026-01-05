'use server';

// This interface defines the clean, simple structure of the image data
// that we will send back to the client.
interface UnsplashImage {
  id: string;
  url: string;
  alt: string;
  user: {
    name: string;
    link: string;
  };
}

/**
 * A Server Action to securely search for images on Unsplash.
 * This function runs ONLY on the server, protecting the API key.
 * @param query The search term entered by the user.
 * @returns A promise that resolves to an array of simplified image objects.
 */
export async function searchUnsplashImages(query: string): Promise<UnsplashImage[]> {
  // 1. Securely access the Unsplash API key from environment variables.
  // This value is only available on the server.
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.error("Unsplash API key is missing from .env.local");
    throw new Error('Unsplash API key is not configured on the server.');
  }

  // 2. Handle empty search queries gracefully.
  if (!query || query.trim() === "") {
    return [];
  }

  const encodedQuery = encodeURIComponent(query);
  const apiUrl = `https://api.unsplash.com/search/photos?query=${encodedQuery}&per_page=9&orientation=landscape`;

  try {
    // 3. Make the API call from the server to Unsplash.
    // The secret `accessKey` is never exposed to the browser.
    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
      // Optional: Add caching to reduce API calls for the same search term.
      // This will cache the result for 1 hour (3600 seconds).
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      // If the API returns an error, log it on the server and throw a generic error to the client.
      console.error('Failed to fetch from Unsplash:', await response.text());
      throw new Error('Could not retrieve images from Unsplash at this time.');
    }

    const data = await response.json();
  
    // 4. Shape the complex data from Unsplash into a simple, clean format
    // before sending it back to the client component. This reduces the amount
    // of data sent over the network.
    const shapedData: UnsplashImage[] = data.results.map((img: any) => ({
      id: img.id,
      url: img.urls.small, // 'small' is perfect for previews
      alt: img.alt_description || 'An image from Unsplash',
      user: {
          name: img.user.name,
          link: img.user.links.html
      }
    }));

    return shapedData;

  } catch (error) {
    console.error("An unexpected error occurred while searching Unsplash:", error);
    throw new Error("An unexpected error occurred. Please try again later.");
  }
}