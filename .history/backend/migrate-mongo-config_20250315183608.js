const config = require('./src/config/config');

module.exports = {
    mongodb: {
      url: config.MONGODB_URI,
      databaseName: "manga_db",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    migrationsDir: "migrations",
    changelogCollectionName: "changelog",
    migrationFileExtension: ".js",
    useFileHash: false
  };