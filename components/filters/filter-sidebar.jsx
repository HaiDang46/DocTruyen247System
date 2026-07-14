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
    <aside className="rounded-lg border border-line bg-surface p-4 shadow-soft lg:sticky lg:top-24 lg:self-start">
      {/* Mobile Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between font-black text-ink lg:hidden text-sm"
      >
        <span className="flex items-center gap-2">
          <span>🔍</span> Bộ lọc tìm kiếm
        </span>
        <span className="text-xs font-bold text-primary">
          {isOpen ? "Thu gọn ▲" : "Mở rộng ▼"}
        </span>
      </button>

      {/* Filter Body - Collapsible on mobile, always visible on desktop */}
      <div
        className={`mt-4 lg:mt-0 space-y-4 ${isOpen ? "block" : "hidden lg:block"}`}
      >
        <div>
          <p className="text-sm font-black text-ink">Thể loại</p>
          <div className="mt-3 flex flex-wrap gap-2 lg:block lg:space-y-2 lg:max-h-[300px] lg:overflow-y-auto pr-2 custom-scrollbar">
            <button
              onClick={() => setActiveCategory("Tất cả")}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition lg:w-full lg:text-left ${
                activeCategory === "Tất cả"
                  ? "border-primary bg-primary text-white"
                  : "border-line bg-canvas text-subtle hover:border-primary hover:text-primary"
              }`}
            >
              Tất cả
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition lg:w-full lg:text-left ${
                  activeCategory === category
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-canvas text-subtle hover:border-primary hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>


        <div>
          <p className="text-sm font-black text-ink">Trạng thái</p>
          <select
            value={activeStatus}
            onChange={(e) => setActiveStatus(e.target.value)}
            className="mt-3 w-full rounded-lg border border-line bg-canvas px-3 py-3 text-sm font-semibold text-ink outline-none transition focus:border-primary"
          >
            {statusList.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="text-sm font-black text-ink">Sắp xếp</p>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="mt-3 w-full rounded-lg border border-line bg-canvas px-3 py-3 text-sm font-semibold text-ink outline-none transition focus:border-primary"
          >
            <option value="Mới cập nhật">Mới cập nhật</option>
            <option value="Đang thịnh hành">Đang thịnh hành</option>
            <option value="Đánh giá cao">Đánh giá cao</option>
            <option value="Xem nhiều nhất">Xem nhiều nhất</option>
          </select>
        </div>
      </div>
    </aside>
  );
}
