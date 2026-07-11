const fs = require('fs');

const path = 'c:\\Users\\HAI DANG\\OneDrive\\Documents\\DocTruyen247\\doctruyen247\\lib\\actions.js';
let content = fs.readFileSync(path, 'utf8');

const helper = `
function isUUID(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
`;

if (!content.includes('function isUUID')) {
  content = content.replace('export async function isDbConnected', helper + '\nexport async function isDbConnected');
}

// updateStoryDb
content = content.replace(
  'export async function updateStoryDb(storyId, data) {\n  try {',
  'export async function updateStoryDb(storyId, data) {\n  if (!isUUID(storyId)) return { success: false, error: "Không thể thay đổi dữ liệu mẫu (Mock Data)." };\n  try {'
);

// deleteStoryDb
content = content.replace(
  'export async function deleteStoryDb(storyId) {\n  try {',
  'export async function deleteStoryDb(storyId) {\n  if (!isUUID(storyId)) return { success: false, error: "Không thể xóa dữ liệu mẫu (Mock Data)." };\n  try {'
);

// updateChapterDb
content = content.replace(
  'export async function updateChapterDb(chapterId, data) {\n  try {',
  'export async function updateChapterDb(chapterId, data) {\n  if (!isUUID(chapterId)) return { success: false, error: "Không thể thay đổi dữ liệu mẫu (Mock Data)." };\n  try {'
);

// deleteChapterDb
content = content.replace(
  'export async function deleteChapterDb(chapterId) {\n  try {',
  'export async function deleteChapterDb(chapterId) {\n  if (!isUUID(chapterId)) return { success: false, error: "Không thể xóa dữ liệu mẫu (Mock Data)." };\n  try {'
);

fs.writeFileSync(path, content, 'utf8');
console.log('actions.js updated!');
