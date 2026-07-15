import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[#1a1b1e] text-[#a0a0a0] py-12 mt-12 border-t border-[#2c2e33]">
      <div className="mx-auto max-w-[1600px] px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Cột 1: Thông tin liên hệ & Logo */}
        <div className="space-y-6">
          <Link href="/" className="inline-block">
            <Image 
              src="/logo.png" 
              alt="DocTruyen247" 
              width={200} 
              height={56} 
              className="h-[50px] w-auto object-contain brightness-0 invert"
            />
          </Link>
          
          <div className="space-y-2 text-sm font-semibold">
            <p>
              <Link href="#" className="hover:text-white transition">Giới thiệu</Link> | <Link href="#" className="hover:text-white transition">Liên hệ</Link>
            </p>
            <p>
              <Link href="#" className="hover:text-white transition">Điều Khoản</Link> | <Link href="#" className="hover:text-white transition">Chính Sách Bảo Mật</Link>
            </p>
            <p>
              <Link href="#" className="hover:text-white transition">Cam kết tuân thủ</Link>
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <h3 className="text-xl font-bold text-white">Liên hệ đặt quảng cáo</h3>
            <p className="text-sm">Email: <a href="mailto:support@doctruyen247.com" className="hover:text-white transition">support@doctruyen247.com</a></p>
            <p className="text-sm">Copyright © 2026 DocTruyen247</p>
            <p className="text-sm">561 Điện Biên Phủ, Ho Chi Minh City, Vietnam</p>
          </div>
        </div>

        {/* Cột 2: Miễn trừ trách nhiệm */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Miễn trừ trách nhiệm</h3>
          <p className="text-sm leading-relaxed text-justify">
            Trang web của chúng tôi chỉ cung cấp dịch vụ đọc truyện tranh online với mục đích giải trí và chia sẻ nội dung. Toàn bộ các truyện tranh được đăng tải trên trang web được sưu tầm từ nhiều nguồn trên internet và chúng tôi không chịu trách nhiệm về bản quyền hoặc quyền sở hữu đối với bất kỳ nội dung nào. Nếu bạn là chủ sở hữu bản quyền và cho rằng nội dung trên trang vi phạm quyền của bạn, vui lòng liên hệ với chúng tôi để tiến hành gỡ bỏ nội dung vi phạm một cách kịp thời.
          </p>
          <p className="text-sm leading-relaxed text-justify">
            Ngoài ra, chúng tôi không chịu trách nhiệm về các nội dung quảng cáo hiển thị trên trang web, bao gồm nhưng không giới hạn ở việc quảng cáo sản phẩm hoặc dịch vụ của bên thứ ba. Những quảng cáo này không phản ánh quan điểm hoặc cam kết của chúng tôi. Người dùng cần tự cân nhắc và chịu trách nhiệm khi tương tác với các quảng cáo đó.
          </p>
        </div>

        {/* Cột 3: Nhà phát triển */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-white">Nhà phát triển</h3>
          <ul className="space-y-2 text-sm text-[#a0a0a0]">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Nguyễn Hải Đăng
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              Lê Gia Bảo
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
