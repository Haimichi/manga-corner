const Follow = require('../models/Follow');
const User = require('../models/User');
const emailService = require('./emailService');

class NotificationService {
  async notifyNewChapter(manga, chapter) {
    try {
      const follows = await Follow.find({
        mangaId: manga._id,
        notifications: true
      }).populate('userId');

      const notifications = follows.map(follow => {
        const user = follow.userId;
        return emailService.sendNewChapterNotification(
          user.email,
          {
            mangaTitle: manga.title.en,
            chapterNumber: chapter.chapterNumber,
            mangaId: manga._id
          }
        );
      });

      await Promise.all(notifications);
    } catch (error) {
      console.error('Lỗi gửi thông báo chapter mới:', error);
    }
  }
}

module.exports = new NotificationService(); 