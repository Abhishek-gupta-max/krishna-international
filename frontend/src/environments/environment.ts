// Development configuration — the API runs separately on port 4000.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000/api',
  /** Origin that serves uploaded gallery images. */
  mediaUrl: 'http://localhost:4000',
  /** Optional backend route for a real AI model (see RemoteAssistantEngine). Empty = free demo mode. */
  assistantEndpoint: '',
};
