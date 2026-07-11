const sql = require('mssql/msnodesqlv8.js');

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.log("Cách sử dụng: node make-admin.js <địa_chỉ_email>");
    process.exit(1);
  }

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
    
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query("UPDATE users SET role = 99 WHERE email = @email");
      
    if (result.rowsAffected[0] > 0) {
      console.log(`✅ Thành công! Đã cấp quyền Admin (role = 99) cho tài khoản: ${email}`);
    } else {
      console.log(`❌ Thất bại: Không tìm thấy tài khoản có email: ${email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Lỗi:", error.message);
    process.exit(1);
  }
}
makeAdmin();
