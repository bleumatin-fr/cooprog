import { Admin, Resource } from "react-admin";
import httpClient from "./httpClient";

import authProvider from "./authProvider";
import jsonDataProvider from "./dataProvider";
import projects from "./projects";
import users from "./users";
import configurations from "./configurations";
import engMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";

const dataProvider = jsonDataProvider(
  import.meta.env.VITE_APP_API_URL || "http://localhost:3000/admin/api",
  httpClient
);

const i18nProvider = polyglotI18nProvider(
  (locale) => engMessages,
  "en",
  ["en"],
  {
    allowMissing: true,
    onMissingKey: (key: any) => {
      console.warn(`Translation key missing: ${key}`);

      return key;
    },
  }
);

const App = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    i18nProvider={i18nProvider}
    disableTelemetry
    darkTheme={null}
  >
    <Resource name="projects" {...projects} />
    <Resource name="users" {...users} />
    <Resource name="configurations" {...configurations} />
  </Admin>
);

export default App;
