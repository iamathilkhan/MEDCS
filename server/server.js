const app = require('./index');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 MEDCS Backend Server running on http://localhost:${PORT}`);
    console.log('--- Documentation Ready ---');
    console.log(`- Health Check: http://localhost:${PORT}/api/health`);
    console.log(`- Schemes: http://localhost:${PORT}/api/schemes`);
    console.log(`- Tracking: ON (SQLite with better-sqlite3)`);
});
