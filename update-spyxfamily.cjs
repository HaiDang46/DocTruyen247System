const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\mssqllocaldb;Database=DocTruyen247;Trusted_Connection=yes;'
};

async function updateDescription() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query(`
        UPDATE stories 
        SET description = N'SPY x Family là một bộ truyện tranh (manga) hấp dẫn của tác giả Tatsuya Endo, kể về điệp viên Twilight (hay Lloyd Forger) và nhiệm vụ "bất đắc dĩ" của anh: tạo dựng một gia đình giả để tiếp cận mục tiêu.'
        WHERE title LIKE '%Spy%' OR title LIKE '%Family%' OR title LIKE '%Sakamoto%'
      `);
    console.log("Rows affected:", result.rowsAffected);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateDescription();
