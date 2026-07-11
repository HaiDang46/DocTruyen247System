const sql = require('mssql/msnodesqlv8.js');

async function fixDb() {
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
    
    // First, convert existing roles to integers safely
    await pool.request().query("UPDATE users SET role = '0' WHERE role = 'user' OR role IS NULL;");
    await pool.request().query("UPDATE users SET role = '99' WHERE role = 'admin';");
    
    // Drop existing constraints if they exist
    await pool.request().query(`
      DECLARE @ConstraintName nvarchar(200)
      SELECT @ConstraintName = Name FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('users') AND definition LIKE '%role%'
      IF @ConstraintName IS NOT NULL
      EXEC('ALTER TABLE users DROP CONSTRAINT ' + @ConstraintName)
    `);
    
    // Drop the default constraint dynamically
    await pool.request().query(`
      DECLARE @DefName nvarchar(200)
      SELECT @DefName = name 
      FROM sys.default_constraints 
      WHERE parent_object_id = OBJECT_ID('users') AND parent_column_id = COLUMNPROPERTY(OBJECT_ID('users'), 'role', 'ColumnId')
      
      IF @DefName IS NOT NULL
      EXEC('ALTER TABLE users DROP CONSTRAINT ' + @DefName)
    `);
    
    await pool.request().query("ALTER TABLE users ALTER COLUMN role INT NOT NULL;");
    await pool.request().query("ALTER TABLE users ADD CONSTRAINT df_users_role DEFAULT 0 FOR role;");
    
    // Recreate index if it doesn't exist
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'ix_users_role' AND object_id = OBJECT_ID('users'))
      CREATE INDEX ix_users_role ON users (role)
    `);
    
    console.log("Database schema updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
fixDb();
