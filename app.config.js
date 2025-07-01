// app.config.js
export default {
  expo: {
    name: "Cuisineberg",
    slug: "Cuisineberg",
    version: "1.0.0",
    userInterfaceStyle: "automatic",
    extra: {
      API_URL: "https://api.hirearrive.in",
    },
    updates: {
      enabled: true,
      fallbackToCacheTimeout: 0
    }
  }
};
