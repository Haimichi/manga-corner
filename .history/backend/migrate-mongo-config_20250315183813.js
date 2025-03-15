const config = {
  mongodb: {
    url: "mongodb://localhost:27017",
    databaseName: "manga_db",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  migrationsDir: "./migrations",  // Đường dẫn tương đối đến thư mục migrations
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false
};

module.exports = config;