const sql = require('mssql/msnodesqlv8');

const config = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=(localdb)\\mssqllocaldb;Database=DocTruyen247;Trusted_Connection=yes;'
};

async function getTags() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query(`SELECT tags FROM stories`);
    
    const allTags = new Set();
    result.recordset.forEach(row => {
      if (row.tags) {
        try {
          const parsed = JSON.parse(row.tags);
          parsed.forEach(tag => allTags.add(tag));
        } catch (e) {
          // not json
        }
      }
    });

    console.log("Existing tags in DB:", Array.from(allTags));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

getTags();
