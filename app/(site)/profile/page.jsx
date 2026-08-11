"use client";

import { useEffect, useState } from "react";
import { ProgressBar } from "@/components/progress-bar";
import { SectionHeader } from "@/components/sections/section-header";
import { StoryCover } from "@/components/story/story-cover";
import { useAuth } from "@/lib/auth-context";
import { 
  isDbConnected, getReadingHistoryDb, getFavoritesDb, getFollowsDb, getStoriesDb,
  deleteReadingHistoryDb, clearReadingHistoryDb, toggleFavoriteDb, toggleFollowDb,
  getUserStatsDb, updateUserDb
} from "@/lib/actions";
import { stories as mockStories } from "@/lib/mock-data";
import Link from "next/link";
import { useRouter } from "next/navigation";

const tabs = ["Lịch sử đọc", "Yêu thích", "Đang theo dõi"];

export default function ProfilePage() {
  const { user, logout, login } = useAuth(); // Need login to update local context after update
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ readStories: 0, totalComments: 0, totalFavorites: 0 });
  const [isConnected, setIsConnected] = useState(false);
  
  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editOldPassword, setEditOldPassword] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const loadData = async () => {
    const connected = await isDbConnected();
    setIsConnected(connected);

    if (user && connected) {
      const statsRes = await getUserStatsDb(user.id);
      if (statsRes.success) {
        setStats(statsRes.data);
      }
    }

    if (activeTab === 0) {
      // Lịch sử đọc
      if (user && connected) {
        const res = await getReadingHistoryDb(user.id);
        if (res.success && res.data) {
          setItems(res.data);
        }
      } else {
        setItems([]);
      }
    } else if (activeTab === 1 || activeTab === 2) {
      // Yêu thích hoặc Đang theo dõi
      if (user && connected) {
        const fetchFn = activeTab === 1 ? getFavoritesDb : getFollowsDb;
        const res = await fetchFn(user.id);
        if (res.success && res.data) {
          setItems(res.data.map(story => ({ story })));
        }
      } else {
        // LocalStorage fallback
        const storageKey = activeTab === 1 ? "doc_truyen_favorites" : "doc_truyen_follows";
        const ids = JSON.parse(localStorage.getItem(storageKey) || "[]");
        
        let allStories = mockStories;
        if (connected) {
          const storiesRes = await getStoriesDb();
          if (storiesRes.success && storiesRes.data) {
            allStories = storiesRes.data;
          }
        } else {
           const savedStories = localStorage.getItem("doc_truyen_stories");
           if (savedStories) {
             try { allStories = JSON.parse(savedStories); } catch(e){}
           }
        }
        
        const filtered = allStories.filter(s => ids.includes(s.id)).map(story => ({ story }));
        setItems(filtered);
      }
    }
  };

  useEffect(() => {
    loadData();
    if (user) {
      setEditName(user.name || "");
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setEditError("");
    setEditSuccess("");
    if (!user || !isConnected) return;
    
    if (!editName.trim()) {
      setEditError("Tên không được để trống.");
      return;
    }

    const res = await updateUserDb(user.id, editName, editOldPassword || null, editPassword || null);
    if (res.success) {
      setEditSuccess("Cập nhật thành công!");
      login(res.data); // Update local user context
      setEditOldPassword("");
      setEditPassword("");
      setTimeout(() => setIsEditing(false), 1500);
    } else {
      setEditError(res.error || "Có lỗi xảy ra.");
    }
  };

  const handleRemoveItem = async (e, storyId) => {
    e.preventDefault(); // Ngăn Link trigger
    e.stopPropagation();

    if (!user || !isConnected) return; // Nếu ko login hoặc ko connect db, bỏ qua vì chưa support xóa fallback UI
    
    if (activeTab === 0) {
      await deleteReadingHistoryDb(user.id, storyId);
    } else if (activeTab === 1) {
      await toggleFavoriteDb(user.id, storyId);
    } else if (activeTab === 2) {
      await toggleFollowDb(user.id, storyId);
    }
    loadData(); // reload
  };

  const handleClearHistory = async () => {
    if (!user || !isConnected) return;
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử đọc?")) {
      await clearReadingHistoryDb(user.id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-sm bg-gray-100 dark:bg-gray-700 text-xl font-black text-gray-800 dark:text-gray-200 uppercase border border-gray-200 dark:border-gray-600 shadow-inner">
              {user ? user.name.charAt(0) : "DT"}
            </div>
            <div>
              <h1 className="text-2xl font-black text-ink">
                {user ? user.name : "Độc giả ẩn danh"}
              </h1>
              <p className="mt-1 text-sm text-subtle">
                {user ? user.email : "Đăng nhập để theo dõi và đồng bộ truyện"}
              </p>
              {user && (
                <div className="mt-2 text-xs font-bold text-gray-800 dark:text-gray-200 inline-block bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-sm">
                  Vai trò: {user.role === 99 ? "Quản trị viên" : "Độc giả"}
                </div>
              )}
            </div>
          </div>
          
          {user && (
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="rounded-sm border border-gray-200 dark:border-gray-600 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                {isEditing ? "Hủy" : "Sửa thông tin"}
              </button>
              <button 
                onClick={handleLogout}
                className="rounded-sm border border-netred bg-netred/10 px-4 py-2 text-sm font-bold text-netred hover:bg-netred hover:text-white transition"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>

        {/* Modal/Form sửa thông tin */}
        {isEditing && user && (
          <form onSubmit={handleUpdateProfile} className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-bold text-ink mb-4">Cập nhật thông tin</h3>
            <div className="grid gap-4 max-w-md">
              <div>
                <label className="block text-sm font-bold text-ink mb-1">Tên hiển thị</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm text-ink outline-none focus:border-netred transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">Mật khẩu cũ (Bắt buộc nếu muốn đổi mật khẩu)</label>
                <input 
                  type="password" 
                  value={editOldPassword}
                  onChange={(e) => setEditOldPassword(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm text-ink outline-none focus:border-netred transition"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-ink mb-1">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                <input 
                  type="password" 
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 text-sm text-ink outline-none focus:border-netred transition"
                />
              </div>
              {editError && <p className="text-xs text-netred font-bold">{editError}</p>}
              {editSuccess && <p className="text-xs text-green-500 font-bold">{editSuccess}</p>}
              <button type="submit" className="rounded-sm bg-netred py-2 text-sm font-bold text-white hover:bg-red-700 transition">
                Lưu thay đổi
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Thống kê cá nhân */}
      {user && isConnected && (
        <section className="grid grid-cols-3 gap-4">
          <div className="rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center shadow-sm">
            <p className="text-sm font-bold text-subtle mb-1">Truyện đã đọc</p>
            <p className="text-2xl font-black text-netred">{stats.readStories}</p>
          </div>
          <div className="rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center shadow-sm">
            <p className="text-sm font-bold text-subtle mb-1">Đã yêu thích</p>
            <p className="text-2xl font-black text-netred">{stats.totalFavorites}</p>
          </div>
          <div className="rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center shadow-sm">
            <p className="text-sm font-bold text-subtle mb-1">Bình luận</p>
            <p className="text-2xl font-black text-netred">{stats.totalComments}</p>
          </div>
        </section>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`whitespace-nowrap rounded-sm border px-4 py-2 text-sm font-bold transition ${
              index === activeTab
                ? "border-netred bg-netred text-white shadow-sm"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-netred hover:text-netred"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
          <h2 className="text-lg font-black text-ink uppercase flex items-center gap-2">
            <span className="w-2 h-4 bg-netred inline-block rounded-sm"></span>
            {tabs[activeTab]}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-subtle">{items.length} bộ truyện</span>
            {activeTab === 0 && items.length > 0 && user && (
              <button 
                onClick={handleClearHistory}
                className="text-xs font-bold text-netred hover:underline border border-netred/20 px-2 py-1 rounded-sm bg-netred/5"
              >
                Xóa tất cả
              </button>
            )}
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {items.length > 0 ? (
            items.map((item) => (
              <Link
                href={`/stories/${item.story.slug}`}
                key={item.story.id}
                className="relative grid grid-cols-[88px_1fr] gap-3 rounded-sm border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-3 transition hover:border-netred group cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
              >
                <StoryCover story={item.story} compact />
                <div className="min-w-0 pr-8">
                  <p className="truncate text-sm font-black text-ink group-hover:text-netred transition">
                    {item.story.title}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-subtle">
                    Đang xem: {item.chapter || "Chưa rõ"}
                  </p>
                  {activeTab === 0 && item.chapter && (
                    <div className="mt-4">
                      <ProgressBar value={item.progress || 0} />
                    </div>
                  )}
                </div>
                
                {/* Delete button (only show on hover if connected) */}
                {user && isConnected && (
                  <button 
                    onClick={(e) => handleRemoveItem(e, item.story.id)}
                    className="absolute right-3 top-3 p-1.5 rounded-sm bg-gray-200 dark:bg-gray-600 text-gray-500 hover:text-white hover:bg-netred opacity-0 group-hover:opacity-100 transition-all z-10"
                    title="Xóa khỏi danh sách"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                )}
              </Link>
            ))
          ) : (
            <p className="col-span-2 py-12 text-sm text-subtle text-center">
              {!user && activeTab === 0 
                ? "Vui lòng đăng nhập để lưu và xem lịch sử đọc." 
                : "Danh sách trống. Hãy khám phá và thêm truyện vào danh sách nhé!"}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
