const sql = require('mssql/msnodesqlv8.js');

async function fixCoverImage() {
  try {
    const pool = await new sql.ConnectionPool({
      server: "(localdb)\\MSSQLLocalDB",
      database: "DocTruyen247",
      driver: "ODBC Driver 17 for SQL Server",
      options: {
        trustedConnection: true,
        encrypt: false,
      }
    }).connect();
    
    // Alter the cover_image column to allow max length for base64 strings
    await pool.request().query("ALTER TABLE stories ALTER COLUMN cover_image NVARCHAR(MAX);");
    
    console.log("Cập nhật cột cover_image thành công!");
    process.exit(0);
  } catch (error) {
    console.error("Lỗi:", error.message);
    process.exit(1);
  }
}

fixCoverImage();
