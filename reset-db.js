const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');

async function resetDb() {
  try {
    const configMaster = {
      server: "(localdb)\\MSSQLLocalDB",
      database: "master",
      driver: "ODBC Driver 17 for SQL Server",
      options: {
        trustedConnection: true,
        encrypt: false,
      }
    };
    
    console.log("Connecting to master to recreate database...");
    const poolMaster = await new sql.ConnectionPool(configMaster).connect();
    
    // Close existing connections and recreate database
    await poolMaster.request().query(`
      IF DB_ID('DocTruyen247') IS NOT NULL
      BEGIN
        ALTER DATABASE DocTruyen247 SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE DocTruyen247;
      END
      CREATE DATABASE DocTruyen247;
    `);
    
    await poolMaster.close();
    console.log("Database DocTruyen247 recreated successfully.");
    
    console.log("Connecting to DocTruyen247 to run schema...");
    const configDb = {
      server: "(localdb)\\MSSQLLocalDB",
      database: "DocTruyen247",
      driver: "ODBC Driver 17 for SQL Server",
      options: {
        trustedConnection: true,
        encrypt: false,
      }
    };
    const poolDb = await new sql.ConnectionPool(configDb).connect();
    
    const schemaSql = fs.readFileSync(path.join(__dirname, 'db', 'sql-server-schema.sql'), 'utf8');
    
    // We need to split the commands or execute them. node-mssql can execute multiple statements.
    await poolDb.request().query(schemaSql);
    
    console.log("Schema applied successfully.");
    await poolDb.close();
    process.exit(0);
  } catch (error) {
    console.error("Error resetting database:", error);
    process.exit(1);
  }
}

resetDb();
