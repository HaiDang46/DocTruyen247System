import sql from "mssql/msnodesqlv8";

let pool;

export async function getDbConnection() {
  if (pool) return pool;

  const config = {
    server: "(localdb)\\MSSQLLocalDB",
    database: "DocTruyen247",
    driver: "ODBC Driver 17 for SQL Server",
    options: {
      trustedConnection: true,
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
