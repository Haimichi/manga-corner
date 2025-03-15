// In migrate-mongo-config.js
const path = require('path');

const config = {
  mongodb: {
    url: "mongodb://localhost:27017",
    databaseName: "manga_db",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  migrationsDir: path.join(__dirname, "migrations"),
  changelogCollectionName: "changelog",
  migrationFileExtension: ".js",
  useFileHash: false,
  moduleSystem: 'commonjs',
  template: path.join(__dirname, "migrations", "template.js") // Thêm đường dẫn đến template
};

module.exports = config;