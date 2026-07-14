export function formatStoryType(type) {
  return "MANGA";
}

export function formatStoryStatus(status) {
  const statusMap = {
    Ongoing: "Đang ra",
    Completed: "Hoàn thành",
    Hiatus: "Tạm ngưng",
  };

  return statusMap[status] || status;
}
