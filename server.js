const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Aiven క్లౌడ్ MySQL డేటాబేస్ కనెక్షన్ సెట్టింగ్స్ (100% పర్ఫెక్ట్ సింటాక్స్)
const db = mysql.createConnection({
    host: 'mysql-16c0f46e-killoproduction992-5a4d.e.aivencloud.com', // ఇక్కడ ఈ పూర్తి పెద్ద అడ్రస్ ఉండాలి బ్రో
    user: 'avnadmin',       
    password: 'AVNS_BALZVt0VnvmtF9kyJvF',       
    database: 'defaultdb', 
    port: 13743,
    ssl: {
        rejectUnauthorized: false
    }
});



db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('✅ MySQL Database Connected to Aiven Cloud!');
});

// వెబ్‌సైట్ నుండి JSON డేటా తీసుకోవడానికి API ఎండ్‌పాయింట్
app.post('/api/save-json', (req, res) => {
    const fullJsonData = JSON.stringify(req.body); 
    
    // Aiven క్లౌడ్ డేటాబేస్‌లో 'ai_data' టేబుల్ లేకపోతే క్రియేట్ చేయడానికి ఒక క్వెరీ
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ai_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            json_content LONGTEXT, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    db.query(createTableQuery, (tableErr) => {
        if (tableErr) {
            console.error("Table creation error:", tableErr);
            return res.status(500).json({ error: "Database Table Error!" });
        }

        // టేబుల్ ఉన్నాక డేటా ఇన్సర్ట్ చేయడం
        const insertQuery = "INSERT INTO ai_data (json_content) VALUES (?)"; 
        db.query(insertQuery, [fullJsonData], (err, result) => {
            if (err) {
                console.error("Insert error:", err);
                return res.status(500).json({ error: "Database Insert Error!" });
            }
            res.json({ message: "JSON data saved successfully to Aiven Cloud!" });
        });
    });
});

// వెబ్‌సైట్ ఓపెన్ చేసినప్పుడు ఆటోమేటిక్‌గా index.html పేజీని చూపించడానికి ఈ కోడ్
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}...`));
