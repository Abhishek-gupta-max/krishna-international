// Development configuration — the API runs separately on port 4000.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api',
  /** Origin that serves uploaded gallery images. */
  mediaUrl: 'http://localhost:4000',
};
