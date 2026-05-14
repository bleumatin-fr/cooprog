import i18next from "i18next";

i18next.init({
  fallbackLng: "en",
  preload: ["en", "fr"],
  ns: ["projects", "common"],
  defaultNS: "common",
  backend: {},
});

export default i18next;
