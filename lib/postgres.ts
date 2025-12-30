import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://admin:password123@localhost:5432/micro_account';

const sql = postgres(DATABASE_URL);

export default sql;
