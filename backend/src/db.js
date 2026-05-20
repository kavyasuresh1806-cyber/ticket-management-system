import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "ticketdb",
  password: "postgre123",
  port: 5432,
});

pool.connect()
  .then(() => console.log("PostgreSQL Connected"))
  .catch(err => console.log(err));

export default pool;