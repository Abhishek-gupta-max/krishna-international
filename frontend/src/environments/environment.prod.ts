// Production configuration.
// Requests go to the same origin and are proxied to the Node API by the hosting platform
// (see vercel.json). This avoids CORS and keeps the API URL out of the bundle.
// If you host the API on a separate domain without a proxy, set the full URLs here instead,
// e.g. apiUrl: 'https://api.example.com/api', mediaUrl: 'https://api.example.com'.
export const environment = {
  production: true,
  apiUrl: '/api',
  mediaUrl: '',
  /** Optional backend route for a real AI model, e.g. '/api/assistant'. Empty = free demo mode. */
  assistantEndpoint: '',
};
