module.exports = {
    mongodb: {
      url: process.env.MONGO_URI,
      databaseName: "mangaDB",
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
    migrationsDir: "migrations",
    changelogCollectionName: "changelog",
    migrationFileExtension: ".js",
  };