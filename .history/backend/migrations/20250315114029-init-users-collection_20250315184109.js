module.exports = {
  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async up(db) {
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["username", "email", "password"],
          properties: {
            username: {
              bsonType: "string",
              description: "Tên người dùng - bắt buộc và phải là string"
            },
            email: {
              bsonType: "string",
              pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
              description: "Email - bắt buộc và phải đúng định dạng"
            },
            password: {
              bsonType: "string",
              minLength: 6,
              description: "Mật khẩu - bắt buộc và tối thiểu 6 ký tự"
            },
            role: {
              bsonType: "string",
              enum: ["user", "admin"],
              description: "Vai trò người dùng"
            },
            passwordResetToken: {
              bsonType: ["string", "null"],
              description: "Token đặt lại mật khẩu"
            },
            passwordResetExpires: {
              bsonType: ["date", "null"],
              description: "Thời hạn token đặt lại mật khẩu"
            }
          }
        }
      }
    });

    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
  },

  /**
   * @param db {import('mongodb').Db}
   * @param client {import('mongodb').MongoClient}
   * @returns {Promise<void>}
   */
  async down(db) {
    await db.collection('users').drop();
  }
};
