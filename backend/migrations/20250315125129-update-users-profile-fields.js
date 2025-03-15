module.exports = {
  async up(db) {
    await db.command({
      collMod: 'users',
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              bsonType: "string",
              description: "Tên người dùng - bắt buộc"
            },
            email: {
              bsonType: "string",
              pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
              description: "Email - bắt buộc"
            },
            password: {
              bsonType: "string",
              minLength: 6,
              description: "Mật khẩu - bắt buộc"
            },
            avatar: {
              bsonType: "string",
              description: "Đường dẫn ảnh đại diện"
            },
            bio: {
              bsonType: "string",
              maxLength: 200,
              description: "Giới thiệu bản thân"
            },
            dateOfBirth: {
              bsonType: "date",
              description: "Ngày sinh"
            },
            gender: {
              enum: ["male", "female", "other"],
              description: "Giới tính"
            },
            socialLinks: {
              bsonType: "object",
              properties: {
                facebook: { bsonType: "string" },
                twitter: { bsonType: "string" },
                instagram: { bsonType: "string" }
              }
            },
            readingHistory: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["manga"],
                properties: {
                  manga: { bsonType: "objectId" },
                  lastChapter: { bsonType: "objectId" },
                  lastReadAt: { bsonType: "date" }
                }
              }
            },
            favoriteGenres: {
              bsonType: "array",
              items: { bsonType: "string" }
            },
            notifications: {
              bsonType: "object",
              properties: {
                email: { bsonType: "bool" },
                newChapter: { bsonType: "bool" },
                comments: { bsonType: "bool" }
              }
            }
          }
        }
      }
    });
  },

  async down(db) {
    // Khôi phục schema cũ nếu cần
    await db.command({
      collMod: 'users',
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["username", "email", "password"],
          properties: {
            username: { bsonType: "string" },
            email: { bsonType: "string" },
            password: { bsonType: "string" }
          }
        }
      }
    });
  }
};