export function formatStoryType(type) {
  return type === "NOVEL" ? "TRUYỆN CHỮ" : "MANGA";
}

export function formatStoryStatus(status) {
  const statusMap = {
    Ongoing: "Đang ra",
    Completed: "Hoàn thành",
    Hiatus: "Tạm ngưng",
  };

  return statusMap[status] || status;
}
