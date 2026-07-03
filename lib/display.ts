import type { Story } from "@/lib/mock-data";

export function formatStoryType(type: Story["type"]) {
  return type === "NOVEL" ? "TRUYỆN CHỮ" : "MANGA";
}

export function formatStoryStatus(status: Story["status"]) {
  const statusMap: Record<Story["status"], string> = {
    Ongoing: "Đang ra",
    Completed: "Hoàn thành",
    Hiatus: "Tạm ngưng",
  };

  return statusMap[status];
}
