const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\mssqllocaldb;Database=DocTruyen247;Trusted_Connection=yes;'
};

const mapping = {
  "Action": "Hành Động",
  "Adventure": "Phiêu Lưu",
  "Comedy": "Hài Hước",
  "Drama": "Bi Kịch",
  "Fantasy": "Kỳ Ảo",
  "Harem": "Harem",
  "Historical": "Cổ Đại",
  "Horror": "Kinh Dị",
  "Isekai": "Chuyển Sinh",
  "Martial Arts": "Võ Thuật",
  "Mystery": "Bí Ẩn",
  "Romance": "Tình Cảm",
  "School Life": "Học Đường",
  "Sci-fi": "Khoa Học Viễn Tưởng",
  "Shounen": "Thiếu Niên",
  "Slice of life": "Đời Thường",
  "Sports": "Thể Thao",
  "Supernatural": "Siêu Nhiên",
  "Tragedy": "Bi Kịch"
};

async function updateDbCategories() {
  try {
    const pool = await sql.connect(config);
    for (const [en, vi] of Object.entries(mapping)) {
      await pool.request()
        .input('en', sql.NVarChar, en)
        .input('vi', sql.NVarChar, vi)
        .query('UPDATE categories SET name = @vi WHERE name = @en');
    }
    
    // Check what categories exist now
    const res = await pool.request().query('SELECT name FROM categories');
    console.log("Current DB Categories:", res.recordset.map(r => r.name));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateDbCategories();
