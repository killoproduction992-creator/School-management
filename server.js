const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// 100% పర్ఫెక్ట్ కనెక్షన్ పూల్ (ఇది కనెక్షన్‌ని ఎప్పటికీ క్లోజ్ అవ్వనివ్వదు బ్రో!)
// Aiven క్లౌడ్ డేటాబేస్ డైరెక్ట్ కనెక్షన్ పూల్ (ఎప్పటికీ క్లోజ్ అవ్వదు బ్రో)
const db = mysql.createPool({
    host: '://aivencloud.com',       
    user: 'avnadmin',       
    password: 'AVNS_BALZVt0VnvmtF9kyJvF',       
    database: 'defaultdb', 
    port: 13743,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// వెబ్‌సైట్ నుండి JSON డేటా తీసుకొని క్లౌడ్ లో సేవ్ చేయడానికి API
app.post('/api/save-json', (req, res) => {
    const fullJsonData = JSON.stringify(req.body); 
    
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ai_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            json_content LONGTEXT, 
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    db.query(createTableQuery, (tableErr) => {
        if (tableErr) {
            console.error("❌ Table creation error:", tableErr);
            return res.status(500).json({ error: "Database Table Error!" });
        }

        const insertQuery = "INSERT INTO ai_data (json_content) VALUES (?)"; 
        db.query(insertQuery, [fullJsonData], (err, result) => {
            if (err) {
                console.error("❌ Insert error:", err);
                return res.status(500).json({ error: "Database Insert Error!" });
            }
            res.json({ message: "JSON data saved successfully to Aiven Cloud!" });
        });
    });
});

// క్లౌడ్ డేటాబేస్ నుండి సేవ్ అయిన డేటాను సురక్షితంగా తెచ్చి వెబ్‌సైట్‌కి ఇవ్వడానికి API
app.get('/api/get-json', (req, res) => {
    const fetchQuery = "SELECT * FROM ai_data ORDER BY id DESC";
    
    db.query(fetchQuery, (err, results) => {
        if (err) {
            console.error("❌ Database Fetch Error:", err);
            return res.status(500).json({ error: "Database Fetch Error!" });
        }
        
        const dataRows = Array.isArray(results) ? results : (results ? results : []);
        res.json(dataRows);
    });
});

// వెబ్‌సైట్ ఓపెన్ చేసినప్పుడు ఆటోమేటిక్‌గా index.html పేజీని చూపించడానికి ఈ కోడ్
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}...`));
