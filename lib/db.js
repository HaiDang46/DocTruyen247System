import sql from "mssql/msnodesqlv8";

let pool;

export async function getDbConnection() {
  if (pool) return pool;

  const config = {
    server: process.env.DB_SERVER || "(localdb)\\MSSQLLocalDB",
    database: process.env.DB_NAME || "DocTruyen247",
    user: process.env.DB_USER || undefined,
    password: process.env.DB_PASSWORD || undefined,
    driver: process.env.DB_DRIVER || "ODBC Driver 17 for SQL Server",
    options: {
      trustedConnection: process.env.DB_USER ? false : true,
      encrypt: false,
    },
  };

  try {
    pool = await new sql.ConnectionPool(config).connect();
    console.log("Connected to SQL Server (LocalDB)");
    return pool;
  } catch (err) {
    console.error("Database Connection Failed! Bad Config: ", err);
    throw err;
  }
}

export { sql };
