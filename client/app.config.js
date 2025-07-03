import "dotenv/config";
import appJson from "./app.json";

export default ({ config }) => {
  return {
    ...appJson,
    extra: {
      ...appJson.extra,
      API_URL: process.env.API_URL,
    },
  };
};
