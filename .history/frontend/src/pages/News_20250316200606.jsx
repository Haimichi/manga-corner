import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Dữ liệu mẫu cho tin tức
  const dummyNews = [
    {
      id: 1,
      title: 'Ra mắt manga mới: Dragon Slayer Academy',
      slug: 'ra-mat-manga-moi-dragon-slayer-academy',
      image: 'https://source.unsplash.com/random/800x450?manga&sig=1',
      category: 'new-release',
      author: 'Admin',
      date: '2023-06-15T08:30:00',
      excerpt: 'Series manga mới từ tác giả của One Piece đã chính thức ra mắt vào tuần này...',
      content: `<p>Eiichiro Oda, tác giả nổi tiếng của bộ manga One Piece, đã chính thức ra mắt series manga mới có tên là "Dragon Slayer Academy" sau nhiều tháng úp mở.</p>
      <p>Bộ truyện lấy bối cảnh tại một học viện đào tạo các thợ săn rồng trong một thế giới giả tưởng, nơi các loài rồng đe dọa sự tồn tại của loài người. Nhân vật chính là một cậu bé có khả năng giao tiếp với rồng - điều mà không ai trong thế giới này có thể làm được.</p>
      <p>Chương đầu tiên đã nhận được sự đón nhận nồng nhiệt từ độc giả và giới phê bình. Nhiều người cho rằng đây sẽ là series tiếp theo thành công của Oda sau khi One Piece kết thúc.</p>
      <p>Bạn có thể đọc manga này trên ứng dụng của chúng tôi từ ngày hôm nay.</p>`,
      views: 4500,
      isFeatured: true
    },
    {
      id: 2,
      title: 'Anime adaptation cho "The Dark Mage Returns After 4000 Years"',
      slug: 'anime-adaptation-cho-the-dark-mage-returns-after-4000-years',
      image: 'https://source.unsplash.com/random/800x450?anime&sig=2',
      category: 'anime',
      author: 'Moderator',
      date: '2023-06-10T10:15:00',
      excerpt: 'Studio MAPPA đã thông báo sẽ chuyển thể manga nổi tiếng thành anime vào năm 2024...',
      content: `<p>Studio MAPPA, studio đứng sau những siêu phẩm như Jujutsu Kaisen và Attack on Titan Final Season, đã công bố sẽ chuyển thể manhwa nổi tiếng "The Dark Mage Returns After 4000 Years" thành anime.</p>
      <p>Dự án này dự kiến sẽ được phát hành vào mùa xuân 2024 với sự tham gia của nhiều seiyuu nổi tiếng. Theo thông tin rò rỉ, đạo diễn của dự án này sẽ là người từng làm nên thành công của Jujutsu Kaisen.</p>
      <p>Manhwa gốc kể về câu chuyện của Lucas Traumen, một pháp sư huyền thoại bị trừng phạt và bị phong ấn bởi Thần Chiến Tranh. Sau 4000 năm, anh ta trở lại trong cơ thể của một học sinh yếu đuối tại học viện pháp thuật và bắt đầu hành trình trả thù.</p>
      <p>Bạn có thể theo dõi trailer đầu tiên <a href="#" class="text-primary-600 hover:underline">tại đây</a>.</p>`,
      views: 3800,
      isFeatured: true
    },
    {
      id: 3,
      title: 'Top 10 manga được yêu thích nhất quý 2/2023',
      slug: 'top-10-manga-duoc-yeu-thich-nhat-quy-2-2023',
      image: 'https://source.unsplash.com/random/800x450?reading&sig=3',
      category: 'ranking',
      author: 'Editor',
      date: '2023-06-05T14:45:00',
      excerpt: 'Danh sách 10 manga được độc giả bình chọn nhiều nhất trong quý vừa qua...',
      content: `<p>Cuộc khảo sát vừa được thực hiện với hơn 50,000 độc giả đã cho ra kết quả top 10 manga được yêu thích nhất trong quý 2 năm 2023.</p>
      <p>One Piece vẫn giữ vững ngôi vị số 1 không thể lung lay với số phiếu bình chọn áp đảo. Bất ngờ lớn nhất là sự vươn lên của "Solo Leveling" - tác phẩm đến từ Hàn Quốc đã vượt qua nhiều cái tên gạo cội của Nhật Bản để đứng ở vị trí thứ 2.</p>
      <p>Dưới đây là danh sách đầy đủ:</p>
      <ol>
        <li>One Piece</li>
        <li>Solo Leveling</li>
        <li>Jujutsu Kaisen</li>
        <li>Chainsaw Man</li>
        <li>My Hero Academia</li>
        <li>Demon Slayer</li>
        <li>Tokyo Revengers</li>
        <li>Blue Lock</li>
        <li>Spy x Family</li>
        <li>The Beginning After the End</li>
      </ol>`,
      views: 6200,
      isFeatured: false
    },
    {
      id: 4,
      title: 'Tác giả Jujutsu Kaisen tiết lộ kế hoạch kết thúc manga',
      slug: 'tac-gia-jujutsu-kaisen-tiet-lo-ke-hoach-ket-thuc-manga',
      image: 'https://source.unsplash.com/random/800x450?artist&sig=4',
      category: 'update',
      author: 'Admin',
      date: '2023-06-02T09:00:00',
      excerpt: 'Gege Akutami chia sẻ rằng manga Jujutsu Kaisen sẽ kết thúc trong khoảng 2 năm nữa...',
      content: `<p>Trong một cuộc phỏng vấn gần đây với tạp chí Weekly Shonen Jump, Gege Akutami - tác giả của bộ manga đình đám Jujutsu Kaisen đã tiết lộ kế hoạch kết thúc manga này.</p>
      <p>Theo chia sẻ của Akutami, Jujutsu Kaisen dự kiến sẽ kết thúc trong vòng 2 năm tới với khoảng 250 chương. Hiện tại, manga đã đạt mốc 220 chương và đang ở giai đoạn cao trào của arc cuối cùng.</p>
      <p>"Tôi đã lên kế hoạch cho cái kết từ khi bắt đầu viết Jujutsu Kaisen. Tôi không muốn câu chuyện kéo dài quá lâu và mất đi sự hấp dẫn ban đầu," Akutami chia sẻ.</p>
      <p>Tin tức này khiến nhiều fan của series lo lắng nhưng cũng háo hức chờ đợi cái kết mà tác giả đã dành nhiều tâm huyết chuẩn bị.</p>`,
      views: 5100,
      isFeatured: false
    },
    {
      id: 5,
      title: 'Sự kiện Manga Con 2023 sẽ được tổ chức tại Hà Nội vào tháng 8',
      slug: 'su-kien-manga-con-2023-se-duoc-to-chuc-tai-ha-noi-vao-thang-8',
      image: 'https://source.unsplash.com/random/800x450?event&sig=5',
      category: 'event',
      author: 'Event Team',
      date: '2023-05-28T11:30:00',
      excerpt: 'Sự kiện thường niên lớn nhất dành cho người hâm mộ manga và anime sẽ quay trở lại...',
      content: `<p>Ban tổ chức Manga Con vừa công bố sự kiện thường niên lớn nhất dành cho người hâm mộ manga và anime sẽ được tổ chức tại Cung Văn hóa Hữu nghị Việt Xô, Hà Nội từ ngày 20 đến 22 tháng 8 năm 2023.</p>
      <p>Manga Con 2023 dự kiến sẽ có sự tham gia của nhiều tác giả manga nổi tiếng đến từ Nhật Bản và Hàn Quốc. Các hoạt động chính của sự kiện bao gồm: triển lãm tác phẩm manga, giao lưu với tác giả, workshop vẽ manga, cosplay contest, và khu vực mua sắm với nhiều sản phẩm độc quyền.</p>
      <p>Đặc biệt, năm nay sự kiện sẽ có thêm khu vực VR cho phép người tham dự trải nghiệm "sống" trong thế giới manga yêu thích của mình.</p>
      <p>Vé tham dự sự kiện sẽ được mở bán từ ngày 15/7/2023. Bạn có thể đăng ký mua vé sớm <a href="#" class="text-primary-600 hover:underline">tại đây</a> để nhận những ưu đãi đặc biệt.</p>`,
      views: 3400,
      isFeatured: true
    },
    {
      id: 6,
      title: 'Interview độc quyền với tác giả Solo Leveling',
      slug: 'interview-doc-quyen-voi-tac-gia-solo-leveling',
      image: 'https://source.unsplash.com/random/800x450?interview&sig=6',
      category: 'interview',
      author: 'Senior Editor',
      date: '2023-05-20T13:45:00',
      excerpt: 'Chugong chia sẻ về quá trình sáng tác và những dự án tương lai sau thành công của Solo Leveling...',
      content: `<p>Chúng tôi vừa có cuộc phỏng vấn độc quyền với Chugong - tác giả của manhwa đình đám Solo Leveling, người đã chia sẻ nhiều điều thú vị về quá trình sáng tác cũng như các dự án tương lai.</p>
      <p>Theo chia sẻ của Chugong, ý tưởng về Solo Leveling đến từ trải nghiệm chơi game của chính tác giả: "Tôi luôn tự hỏi điều gì sẽ xảy ra nếu một người chơi yếu nhất trong game MMORPG đột nhiên nhận được khả năng độc nhất vô nhị. Từ đó, tôi phát triển ý tưởng này thành câu chuyện của Sung Jin-Woo."</p>
      <p>Về dự án tương lai, Chugong tiết lộ đang phát triển một prequel cho Solo Leveling, tập trung vào các Thợ Săn cấp S đầu tiên và sự xuất hiện của các cổng.</p>
      <p>Bạn có thể đọc toàn bộ cuộc phỏng vấn <a href="#" class="text-primary-600 hover:underline">tại đây</a>.</p>`,
      views: 4800,
      isFeatured: false
    },
    {
      id: 7,
      title: 'Phim điện ảnh "Your Name" sẽ có phần tiếp theo',
      slug: 'phim-dien-anh-your-name-se-co-phan-tiep-theo',
      image: 'https://source.unsplash.com/random/800x450?cinema&sig=7',
      category: 'anime',
      author: 'Film Critic',
      date: '2023-05-15T16:20:00',
      excerpt: 'Đạo diễn Makoto Shinkai xác nhận đang phát triển phần tiếp theo cho bộ phim anime đình đám...',
      content: `<p>Trong sự kiện Anime Expo 2023, đạo diễn Makoto Shinkai đã chính thức xác nhận đang phát triển phần tiếp theo cho bộ phim anime đình đám "Your Name" (Kimi no Na wa).</p>
      <p>Phần phim mới sẽ lấy bối cảnh 5 năm sau các sự kiện trong phần đầu, khi Taki và Mitsuha đã trưởng thành và bắt đầu cuộc sống mới. Tuy nhiên, định mệnh sẽ một lần nữa đưa họ đến với nhau thông qua một hiện tượng siêu nhiên mới.</p>
      <p>"Tôi luôn muốn kể tiếp câu chuyện của Taki và Mitsuha. Họ đã trải qua quá nhiều thứ cùng nhau và tôi nghĩ khán giả cũng muốn biết điều gì xảy ra với họ sau khi gặp nhau ở cầu thang vào cuối phim," Shinkai chia sẻ.</p>
      <p>Phim dự kiến sẽ ra mắt vào mùa hè 2025. Dàn diễn viên lồng tiếng và đội ngũ sản xuất vẫn chưa được công bố.</p>`,
      views: 7200,
      isFeatured: true
    },
    {
      id: 8,
      title: 'Hướng dẫn đọc manga dành cho người mới bắt đầu',
      slug: 'huong-dan-doc-manga-danh-cho-nguoi-moi-bat-dau',
      image: 'https://source.unsplash.com/random/800x450?reading&sig=8',
      category: 'guide',
      author: 'Content Team',
      date: '2023-05-10T09:15:00',
      excerpt: 'Những điều cần biết khi bắt đầu hành trình khám phá thế giới manga...',
      content: `<p>Nếu bạn mới bắt đầu tìm hiểu về manga, đây là bài viết dành cho bạn. Manga là truyện tranh xuất phát từ Nhật Bản với phong cách nghệ thuật và cách kể chuyện độc đáo.</p>
      <p><strong>1. Cách đọc manga</strong></p>
      <p>Khác với truyện tranh phương Tây, manga được đọc từ phải qua trái, từ trên xuống dưới. Điều này có thể hơi khó làm quen lúc đầu, nhưng bạn sẽ nhanh chóng thích nghi.</p>
      <p><strong>2. Các thể loại manga phổ biến</strong></p>
      <ul>
        <li>Shonen: dành cho nam thiếu niên, thường có nhiều cảnh hành động (One Piece, Naruto)</li>
        <li>Shojo: dành cho nữ thiếu niên, thường xoay quanh tình cảm, lãng mạn (Fruits Basket)</li>
        <li>Seinen: dành cho nam thanh niên, có nội dung trưởng thành hơn (Berserk, Vagabond)</li>
        <li>Josei: dành cho nữ thanh niên (Nana, Honey and Clover)</li>
      </ul>
      <p><strong>3. Một số manga gợi ý cho người mới</strong></p>
      <p>Nếu bạn mới bắt đầu, hãy thử đọc những series dễ tiếp cận như Death Note, Fullmetal Alchemist, hoặc Demon Slayer.</p>
      <p>Bạn có thể tìm đọc các manga này trên ứng dụng của chúng tôi hoặc tại các hiệu sách lớn.</p>`,
      views: 9500,
      isFeatured: false
    },
    {
      id: 9,
      title: 'Triển lãm nghệ thuật manga tại Bảo tàng Mỹ thuật TP.HCM',
      slug: 'trien-lam-nghe-thuat-manga-tai-bao-tang-my-thuat-tphcm',
      image: 'https://source.unsplash.com/random/800x450?art&sig=9',
      category: 'event',
      author: 'Art Reporter',
      date: '2023-05-05T10:00:00',
      excerpt: 'Lần đầu tiên một triển lãm quy mô lớn về nghệ thuật manga được tổ chức tại Việt Nam...',
      content: `<p>Bảo tàng Mỹ thuật TP.HCM sẽ tổ chức triển lãm "Nghệ thuật Manga: Từ giấy đến kỹ thuật số" từ ngày 15/7 đến 15/9/2023. Đây là triển lãm quy mô lớn đầu tiên về nghệ thuật manga được tổ chức tại Việt Nam.</p>
      <p>Triển lãm sẽ trưng bày hơn 200 tác phẩm gốc từ các mangaka nổi tiếng của Nhật Bản, trong đó có những bản phác thảo chưa từng được công bố của Osamu Tezuka - "Cha đẻ của manga hiện đại".</p>
      <p>Ngoài ra, triển lãm còn có các khu vực tương tác cho phép khách tham quan trải nghiệm quy trình sáng tạo manga từ truyền thống đến kỹ thuật số, cũng như cơ hội tham gia các workshop do các nghệ sĩ manga chuyên nghiệp hướng dẫn.</p>
      <p>Vé tham quan có giá 100.000 VND cho người lớn và 50.000 VND cho học sinh, sinh viên. Triển lãm mở cửa từ 9h đến 17h hàng ngày, trừ thứ Hai.</p>`,
      views: 2800,
      isFeatured: false
    },
    {
      id: 10,
      title: 'Manga "Spy x Family" sẽ được chuyển thể thành live-action',
      slug: 'manga-spy-x-family-se-duoc-chuyen-the-thanh-live-action',
      image: 'https://source.unsplash.com/random/800x450?family&sig=10',
      category: 'adaptation',
      author: 'Entertainment Editor',
      date: '2023-05-01T14:30:00',
      excerpt: 'Sau thành công của anime, series manga ăn khách sẽ có phiên bản phim người đóng...',
      content: `<p>Hãng phim Toho của Nhật Bản vừa công bố kế hoạch chuyển thể manga "Spy x Family" thành phim điện ảnh live-action, dự kiến ra mắt vào mùa hè 2024.</p>
      <p>Đây là thông tin khiến nhiều fan của series háo hức nhưng cũng lo lắng. "Spy x Family" với những nhân vật có khả năng đặc biệt như Anya có thể đọc tâm trí sẽ là thách thức lớn khi chuyển thể sang định dạng người thật đóng.</p>
      <p>Theo thông tin ban đầu, đạo diễn nổi tiếng Takeshi Miike sẽ đảm nhận vai trò chỉ đạo dự án này. Dàn diễn viên vẫn chưa được công bố nhưng nhiều nguồn tin cho biết những cái tên hot nhất của điện ảnh Nhật Bản đang được cân nhắc cho vai Loid và Yor.</p>
      <p>Trước đó, phiên bản anime của "Spy x Family" đã đạt được thành công vang dội với hơn 300 triệu lượt xem trên các nền tảng phát trực tuyến toàn cầu.</p>`,
      views: 6100,
      isFeatured: false
    }
  ];

  const fetchNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Trong dự án thực, bạn sẽ thay đổi API call này
      // const response = await api.getNews({ category: activeCategory });
      // setNews(response.data);
      
      // Dùng dữ liệu mẫu cho demo
      setTimeout(() => {
        if (activeCategory === 'all') {
          setNews(dummyNews);
        } else {
          setNews(dummyNews.filter(item => item.category === activeCategory));
        }
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Lỗi khi tải tin tức:", err);
      setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Các danh mục tin tức
  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'new-release', name: 'Phát hành mới' },
    { id: 'update', name: 'Cập nhật' },
    { id: 'anime', name: 'Anime' },
    { id: 'event', name: 'Sự kiện' },
    { id: 'interview', name: 'Phỏng vấn' },
    { id: 'ranking', name: 'Bảng xếp hạng' },
    { id: 'adaptation', name: 'Chuyển thể' },
    { id: 'guide', name: 'Hướng dẫn' }
  ];

  // Hàm format thời gian
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Không rõ';
    }
  };

  // Lấy tin tức nổi bật
  const featuredNews = dummyNews.filter(item => item.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tin tức Manga</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Cập nhật những tin tức mới nhất về manga, anime và văn hóa Nhật Bản.
          </p>
        </div>

        {/* Featured News */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tin tức nổi bật</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredNews.map(news => (
              <div key={news.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
                <Link to={`/news/${news.slug}`} className="block relative">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={news.image} 
                      alt={news.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full">
                      Nổi bật
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{formatDate(news.date)}</span>
                    <span className="mx-2">•</span>
                    <span>{categories.find(cat => cat.id === news.category)?.name || news.category}</span>
                  </div>
                  <Link to={`/news/${news.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {news.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 line-clamp-2 mb-4">{news.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <Link 
                      to={`/news/${news.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                    >
                      Đọc tiếp
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </Link>
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      {news.views}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* News Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* News List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Đã xảy ra lỗi</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={fetchNews}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Thử lại
            </button>
          </div>
        ) : news.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Không có tin tức</h2>
            <p className="text-gray-600 mb-6">Không tìm thấy tin tức nào cho danh mục này.</p>
            <button
              onClick={() => setActiveCategory('all')}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Xem tất cả tin tức
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map(item => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden group hover:shadow-lg transition-shadow">
                <Link to={`/news/${item.slug}`} className="block">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <span>{formatDate(item.date)}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{categories.find(cat => cat.id === item.category)?.name || item.category}</span>
                  </div>
                  <Link to={`/news/${item.slug}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 line-clamp-2 mb-4">{item.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <Link 
                      to={`/news/${item.slug}`}
                      className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
                    >
                      Đọc tiếp
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </Link>
                    <div className="flex items-center text-gray-500 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      {item.views}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0 md:mr-8">
                <h3 className="text-2xl md:text-3xl font-bold text