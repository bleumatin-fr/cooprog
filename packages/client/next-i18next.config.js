module.exports = {
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
  },
  debug: false,
  ns: [
    "authentication",
    "common",
    "home",
    "landing",
    "mails",
    "notifications",
    "projects",
    "users",
  ],
  serializeConfig: false,
  react: { useSuspense: false },
  interpolation: {
    format: function (value, format, lng, options) {
      if (format === "projectTitle") {
        if (typeof value === "object" && value !== null) {
          const work = value.work?.trim();
          const artist = value.artist?.trim();
          const preposition = lng === "fr" ? "de" : "of";
          if (work) {
            return `${work} ${preposition} ${artist}`;
          } else {
            return artist;
          }
        }
      }
      return value;
    },
  },
};
