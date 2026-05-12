const express = require('express');
const sql = require('mssql');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── SQL config ──
const dbConfig = {
    server: process.env.SQL_SERVER || '217066.database.windows.net',
    database: process.env.SQL_DATABASE || '217066',
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

let pool = null;

async function getPool() {
    if (!pool) {
        pool = await sql.connect(dbConfig);
        // Create table if not exists
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='runs' AND xtype='U')
            CREATE TABLE runs (
                id NVARCHAR(50) PRIMARY KEY,
                userId NVARCHAR(100) NOT NULL,
                date DATE NOT NULL,
                distance FLOAT NOT NULL,
                totalSec INT NOT NULL,
                feeling NVARCHAR(20) DEFAULT 'good',
                note NVARCHAR(500) DEFAULT '',
                createdAt DATETIME2 DEFAULT GETUTCDATE()
            )
        `);
    }
    return pool;
}

// ── API routes ──

// GET /api/runs
app.get('/api/runs', async (req, res) => {
    const userId = req.headers['x-user-id'] || 'anonymous';
    try {
        const p = await getPool();
        const result = await p.request()
            .input('userId', sql.NVarChar, userId)
            .query('SELECT * FROM runs WHERE userId = @userId ORDER BY date DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('GET /api/runs error:', err.message);
        res.status(500).json({ error: 'Nepodařilo se načíst běhy.' });
    }
});

// POST /api/runs
app.post('/api/runs', async (req, res) => {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const { date, distance, totalSec, feeling, note } = req.body;

    if (!date || !distance || !totalSec) {
        return res.status(400).json({ error: 'Chybí povinná pole.' });
    }

    const id = userId + '_' + Date.now();

    try {
        const p = await getPool();
        await p.request()
            .input('id', sql.NVarChar, id)
            .input('userId', sql.NVarChar, userId)
            .input('date', sql.Date, date)
            .input('distance', sql.Float, parseFloat(distance))
            .input('totalSec', sql.Int, parseInt(totalSec))
            .input('feeling', sql.NVarChar, feeling || 'good')
            .input('note', sql.NVarChar, note || '')
            .query('INSERT INTO runs (id, userId, date, distance, totalSec, feeling, note) VALUES (@id, @userId, @date, @distance, @totalSec, @feeling, @note)');

        res.status(201).json({ id, userId, date, distance: parseFloat(distance), totalSec: parseInt(totalSec), feeling, note });
    } catch (err) {
        console.error('POST /api/runs error:', err.message);
        res.status(500).json({ error: 'Nepodařilo se uložit běh.' });
    }
});

// DELETE /api/runs/:id
app.delete('/api/runs/:id', async (req, res) => {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const runId = req.params.id;

    try {
        const p = await getPool();
        await p.request()
            .input('id', sql.NVarChar, runId)
            .input('userId', sql.NVarChar, userId)
            .query('DELETE FROM runs WHERE id = @id AND userId = @userId');
        res.status(204).end();
    } catch (err) {
        console.error('DELETE /api/runs error:', err.message);
        res.status(500).json({ error: 'Nepodařilo se smazat běh.' });
    }
});

// Fallback to index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ──
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('RunLog running on port ' + PORT);
});
