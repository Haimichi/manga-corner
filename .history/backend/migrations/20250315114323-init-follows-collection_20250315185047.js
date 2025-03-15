module.exports = {
  async up(db) {
    await db.createCollection('follows', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "mangaId"],
          properties: {
            userId: {
              bsonType: "objectId",
              description: "ID người dùng - bắt buộc"
            },
            mangaId: {
              bsonType: "objectId",
              description: "ID manga - bắt buộc"
            },
            lastReadChapter: {
              bsonType: "string",
              description: "Chapter đọc gần nhất"
            },
            notifications: {
              bsonType: "bool",
              description: "Bật/tắt thông báo"
            },
            followedAt: {
              bsonType: "date",
              description: "Thời gian theo dõi"
            }
          }
        }
      }
    });

    await db.collection('follows').createIndex({ userId: 1, mangaId: 1 }, { unique: true });
  },

  async down(db) {
    await db.collection('follows').drop();
  }
};