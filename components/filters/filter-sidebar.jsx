"use client";

import { useState } from "react";
import { categories } from "@/lib/mock-data";

const statusList = ["Tất cả", "Đang ra", "Hoàn thành", "Tạm ngưng"];
const types = ["Tất cả", "Manga"];

export function FilterSidebar({
  activeCategory,
  setActiveCategory,
  activeType,
  setActiveType,
  activeStatus,
  setActiveStatus,
  sortOption,
  setSortOption,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="rounded-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 lg:sticky lg:top-24 lg:self-start">
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between font-bold text-gray-800 dark:text-gray-200 lg:hidden text-sm"
      >
        <span className="flex items-center gap-2">
          <span>🔍</span> Lọc Truyện
        </span>
        <span className="text-xs font-bold text-netpurple">
          {isOpen ? "Thu gọn ▲" : "Mở rộng ▼"}
        </span>
      </button>

      {/* Filter Body - Collapsible on mobile, always visible on desktop */}
      <div
        className={`mt-4 lg:mt-0 space-y-4 ${isOpen ? "block" : "hidden lg:block"}`}
      >
        <div>
          <h3 className="text-[15px] font-bold text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">Thể loại</h3>
          <div className="flex flex-wrap gap-1.5 lg:block lg:space-y-1 lg:max-h-[350px] lg:overflow-y-auto pr-2 custom-scrollbar">
            <button
              onClick={() => setActiveCategory("Tất cả")}
              className={`block w-full text-left px-2 py-1.5 text-[13px] transition ${
                activeCategory === "Tất cả"
                  ? "text-netred font-bold"
                  : "text-gray-700 dark:text-gray-300 hover:text-netpurple"
              }`}
            >
              {activeCategory === "Tất cả" ? "▶ Tất cả" : "Tất cả"}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`block w-full text-left px-2 py-1.5 text-[13px] transition border-t border-gray-100 dark:border-gray-700/50 ${
                  activeCategory === category
                    ? "text-netred font-bold"
                    : "text-gray-700 dark:text-gray-300 hover:text-netpurple"
                }`}
              >
                {activeCategory === category ? `▶ ${category}` : category}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">Tình trạng</h3>
          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            className="w-full rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-[13px] outline-none"
          >
            {statusList.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <h3 className="text-[15px] font-bold text-gray-800 dark:text-gray-200 mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">Sắp xếp</h3>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full rounded-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-2 py-1.5 text-[13px] outline-none"
          >
            <option value="Mới cập nhật">Mới cập nhật</option>
            <option value="Đang thịnh hành">Top View</option>
            <option value="Đánh giá cao">Đánh giá cao</option>
            <option value="Xem nhiều nhất">Lượt xem</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
