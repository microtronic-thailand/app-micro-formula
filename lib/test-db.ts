import sql from './postgres';

async function testConnection() {
    try {
        const result = await sql`SELECT 1 + 1 as sum`;
        console.log('✅ Connection Successful:', result);

        const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('📁 Tables in DB:', tables.map(t => t.table_name));

    } catch (error) {
        console.error('❌ Connection Failed:', error);
    } finally {
        process.exit();
    }
}

testConnection();
