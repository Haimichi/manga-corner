module.exports = {
  async up(db) {
    await db.createCollection('comments', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["userId", "content", "targetId", "targetType"],
          properties: {
            userId: {
              bsonType: "objectId",
              description: "ID người dùng - bắt buộc"
            },
            content: {
              bsonType: "string",
              description: "Nội dung bình luận - bắt buộc"
            },
            targetId: {
              bsonType: "objectId",
              description: "ID của manga hoặc chapter - bắt buộc"
            },
            targetType: {
              enum: ["manga", "chapter"],
              description: "Loại target (manga/chapter) - bắt buộc"
            },
            parentId: {
              bsonType: ["objectId", "null"],
              description: "ID comment cha (nếu là reply)"
            },
            likes: {
              bsonType: "array",
              items: {
                bsonType: "objectId"
              },
              description: "Danh sách user ID đã like"
            }
          }
        }
      }
    });

    await db.collection('comments').createIndex({ targetId: 1, targetType: 1 });
    await db.collection('comments').createIndex({ parentId: 1 });
  },

  async down(db) {
    await db.collection('comments').drop();
  }
}; 