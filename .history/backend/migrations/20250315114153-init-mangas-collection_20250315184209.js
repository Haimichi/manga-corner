module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    await db.createCollection('mangas', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["mangadexId", "title"],
          properties: {
            mangadexId: {
              bsonType: "string",
              description: "ID từ MangaDex - bắt buộc"
            },
            title: {
              bsonType: "object",
              required: ["en"],
              properties: {
                en: {
                  bsonType: "string",
                  description: "Tiêu đề tiếng Anh"
                },
                vi: {
                  bsonType: "string",
                  description: "Tiêu đề tiếng Việt"
                }
              }
            },
            description: {
              bsonType: "object",
              properties: {
                en: {
                  bsonType: "string",
                  description: "Mô tả tiếng Anh"
                },
                vi: {
                  bsonType: "string",
                  description: "Mô tả tiếng Việt"
                }
              }
            },
            status: {
              bsonType: "string",
              enum: ["ongoing", "completed", "hiatus", "cancelled"],
              description: "Trạng thái truyện"
            },
            genres: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            coverImage: {
              bsonType: "string",
              description: "URL ảnh bìa"
            },
            lastChapter: {
              bsonType: "string",
              description: "Chapter mới nhất"
            },
            updatedAt: {
              bsonType: "date",
              description: "Thời gian cập nhật"
            }
          }
        }
      }
    });

    await db.collection('mangas').createIndex({ mangadexId: 1 }, { unique: true });
    await db.collection('mangas').createIndex({ "title.en": "text", "title.vi": "text" });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    await db.collection('mangas').drop();
  }
};
