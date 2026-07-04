export const categories = [
  "Kỳ ảo",
  "Lãng mạn",
  "Hành động",
  "Bí ẩn",
  "Đời thường",
  "Tu tiên",
  "Tâm lý",
  "Hài hước"
];

export const stories = [
  {
    id: "story-1",
    title: "Thư Viện Bóng Đêm",
    slug: "shadow-library",
    type: "NOVEL",
    status: "Ongoing",
    author: "Minh Vân",
    rating: 4.8,
    views: "12.8M",
    latestChapter: "Chương 124",
    tags: ["Kỳ ảo", "Bí ẩn", "Chậm rãi"],
    description:
      "Một thư viện bí mật lưu giữ những cuộc đời còn dang dở, nơi một độc giả tập sự phát hiện có những câu chuyện đang chờ tác giả của chúng biến mất.",
    coverClass: "bg-gradient-to-br from-slate-950 via-blue-800 to-sky-500",
    sourceUrl: "https://example.com/truyen/thu-vien-bong-dem"
  },
  {
    id: "story-2",
    title: "Văn Phòng Lưỡi Kiếm Neon",
    slug: "neon-blade-office",
    type: "MANGA",
    status: "Ongoing",
    author: "Park Tuấn",
    rating: 4.7,
    views: "9.4M",
    latestChapter: "Tập 48",
    tags: ["Hành động", "Cyberpunk", "Hài hước"],
    description:
      "Một người giao hàng với thanh kiếm mượn nhận những đơn hàng bất khả thi trong thành phố nơi ký ức cũng bị tính phí.",
    coverClass: "bg-gradient-to-br from-fuchsia-700 via-slate-950 to-cyan-500",
    sourceUrl: "https://example.com/manga/van-phong-luoi-kiem-neon"
  },
  {
    id: "story-3",
    title: "Giả Kim Sau Giờ Học",
    slug: "after-school-alchemy",
    type: "MANGA",
    status: "Completed",
    author: "Hạ Ly",
    rating: 4.6,
    views: "7.1M",
    latestChapter: "Tập 82",
    tags: ["Học đường", "Phép thuật", "Hài hước"],
    description:
      "Ba học sinh vô tình biến buổi phạt ở lại lớp thành cánh cổng dẫn tới những phép màu nhỏ nhưng đầy rắc rối.",
    coverClass: "bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-900"
  },
  {
    id: "story-4",
    title: "Trà Sư Cuối Cùng",
    slug: "the-last-tea-master",
    type: "NOVEL",
    status: "Ongoing",
    author: "An Khoa",
    rating: 4.9,
    views: "5.6M",
    latestChapter: "Chương 91",
    tags: ["Kiếm hiệp", "Tâm lý", "Chữa lành"],
    description:
      "Một nghệ nhân bị lưu đày đi qua các triều đình đối địch, pha những chén trà có thể hé lộ ký ức chân thật nhất của mỗi người.",
    coverClass: "bg-gradient-to-br from-stone-800 via-emerald-900 to-lime-600"
  },
  {
    id: "story-5",
    title: "Hiệp Hội Giao Hàng Dưới Trăng",
    slug: "moonlit-delivery-guild",
    type: "NOVEL",
    status: "Ongoing",
    author: "Minh Sora",
    rating: 4.5,
    views: "4.8M",
    latestChapter: "Chương 63",
    tags: ["Phiêu lưu", "Gia đình tìm thấy", "Phép thuật"],
    description:
      "Mỗi chuyến giao hàng lúc nửa đêm đều làm bản đồ thay đổi, nhưng người đưa thư mới nhất của hội chưa từng giao sai địa chỉ.",
    coverClass: "bg-gradient-to-br from-indigo-950 via-blue-900 to-amber-400"
  },
  {
    id: "story-6",
    title: "Kẻ Chạy Không Vương Miện",
    slug: "crownless-runner",
    type: "MANGA",
    status: "Hiatus",
    author: "Theo Vinh",
    rating: 4.3,
    views: "3.2M",
    latestChapter: "Tập 35",
    tags: ["Thể thao", "Tâm lý", "Đối thủ"],
    description:
      "Một nhà vô địch sa cơ bước vào giải chạy tiếp sức ngầm, nơi mỗi cuộc đua đều viết lại bảng xếp hạng của cả thành phố.",
    coverClass: "bg-gradient-to-br from-rose-700 via-orange-600 to-slate-950"
  },
  {
    id: "story-7",
    title: "Khu Vườn Sao Vỡ",
    slug: "garden-of-broken-stars",
    type: "NOVEL",
    status: "Completed",
    author: "Nam Khải",
    rating: 4.4,
    views: "6.0M",
    latestChapter: "Chương 140",
    tags: ["Khoa học viễn tưởng", "Lãng mạn", "Không gian"],
    description:
      "Hai nhà thực vật học trồng những loài hoa không tưởng trên trạm quỹ đạo bỏ hoang và đánh thức một điều cổ xưa nằm dưới rễ cây.",
    coverClass: "bg-gradient-to-br from-cyan-900 via-slate-950 to-pink-500"
  },
  {
    id: "story-8",
    title: "Bảng Lương Rồng Nhỏ",
    slug: "tiny-dragon-payroll",
    type: "MANGA",
    status: "Ongoing",
    author: "Mai Studio",
    rating: 4.6,
    views: "2.9M",
    latestChapter: "Tập 22",
    tags: ["Hài hước", "Công sở", "Kỳ ảo"],
    description:
      "Một kế toán văn phòng phát hiện linh vật công ty thật ra là vị giám đốc biết phun lửa và cực kỳ nghiêm khắc về chi phí.",
    coverClass: "bg-gradient-to-br from-yellow-500 via-red-500 to-slate-900"
  }
];

export const chapters = [
  { id: "chapter-1", number: 124, title: "Tiếng Chuông Dưới Đá", isPremium: true },
  { id: "chapter-2", number: 123, title: "Mực Đen Học Cách Gọi Tên", isPremium: false },
  { id: "chapter-3", number: 122, title: "Mưa Rơi Trên Kho Lưu Trữ", isPremium: false },
  { id: "chapter-4", number: 121, title: "Bậc Thang Giữa Hai Câu Chữ", isPremium: false },
  { id: "chapter-5", number: 120, title: "Những Chiếc Đèn Mượn", isPremium: false }
];

export const episodes = [
  { id: "episode-1", number: 48, title: "Tín Hiệu Trên Mặt Kính" },
  { id: "episode-2", number: 47, title: "Phí Qua Thành Phố" },
  { id: "episode-3", number: 46, title: "Thanh Kiếm Mượn" },
  { id: "episode-4", number: 45, title: "Chuyến Giao Muộn" }
];

export const profileItems = [
  { story: stories[0], chapter: "Chương 124", progress: 68 },
  { story: stories[1], chapter: "Tập 48", progress: 42 },
  { story: stories[3], chapter: "Chương 91", progress: 86 },
  { story: stories[6], chapter: "Chương 140", progress: 100 }
];
