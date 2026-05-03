// Central API Configuration
// When building for production (npm run build), this will automatically point 
// to your Render URL. In local development, it points to 127.0.0.1:8000.

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://med-ai-clinical-decision-api.onrender.com' // Replace this with your Render URL later
  : 'http://127.0.0.1:8000';

export default API_BASE_URL;
