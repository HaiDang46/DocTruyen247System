import { getDbConnection } from './lib/db.js';

async function fixDb() {
  try {
    const pool = await getDbConnection();
    
    // First, convert existing roles to integers safely
    await pool.request().query("UPDATE users SET role = '0' WHERE role = 'user' OR role IS NULL;");
    await pool.request().query("UPDATE users SET role = '99' WHERE role = 'admin';");
    
    // Drop existing constraints if they exist. In SQL Server we must query the constraint name if it was generated.
    await pool.request().query(`
      DECLARE @ConstraintName nvarchar(200)
      SELECT @ConstraintName = Name FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('users') AND definition LIKE '%role%'
      IF @ConstraintName IS NOT NULL
      EXEC('ALTER TABLE users DROP CONSTRAINT ' + @ConstraintName)
    `);
    
    // Drop df_users_role if it exists
    await pool.request().query(`
      IF OBJECT_ID('df_users_role', 'D') IS NOT NULL
      ALTER TABLE users DROP CONSTRAINT df_users_role
    `);
    
    // Alter column to INT
    await pool.request().query("ALTER TABLE users ALTER COLUMN role INT NOT NULL;");
    
    // Add default constraint
    await pool.request().query("ALTER TABLE users ADD CONSTRAINT df_users_role DEFAULT 0 FOR role;");
    
    console.log("Database schema updated successfully!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
fixDb();
