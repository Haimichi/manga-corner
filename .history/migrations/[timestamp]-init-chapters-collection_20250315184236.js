module.exports = {
  async up(db) {
    await db.createCollection('chapters', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["mangaId", "chapterNumber", "mangadexId"],
          properties: {
            mangaId: {
              bsonType: "objectId",
              description: "ID của manga - bắt buộc"
            },
            mangadexId: {
              bsonType: "string",
              description: "ID chapter từ MangaDex - bắt buộc"
            },
            chapterNumber: {
              bsonType: "string",
              description: "Số chapter - bắt buộc"
            },
            title: {
              bsonType: "string",
              description: "Tiêu đề chapter"
            },
            language: {
              bsonType: "string",
              description: "Ngôn ngữ của chapter"
            },
            pages: {
              bsonType: "array",
              items: {
                bsonType: "string"
              },
              description: "Danh sách URL các trang"
            },
            uploadedAt: {
              bsonType: "date",
              description: "Thời gian upload"
            },
            scanlationGroupId: {
              bsonType: "string",
              description: "ID nhóm dịch"
            }
          }
        }
      }
    });

    await db.collection('chapters').createIndex({ mangaId: 1, chapterNumber: 1 });
    await db.collection('chapters').createIndex({ mangadexId: 1 }, { unique: true });
  },

  async down(db) {
    await db.collection('chapters').drop();
  }
}; 