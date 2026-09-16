const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path"); // ఇక్కడ path మోడ్యూల్ యాడ్ చేశాను బ్రో

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname, { index: false }));

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT) || 13743,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// database connection check
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ database log: Connection failed -', err.message);
    } else {
        console.log('🚀 database log: Aiven MySQL Connected Successfully!');
        connection.release();
    }
});

// Save JSON API
app.post("/api/save-json", (req, res) => {
    const fullJsonData = JSON.stringify(req.body);
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ai_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            json_content LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createTableQuery, (tableErr) => {
        if (tableErr) {
            console.error("❌ Table creation error:", tableErr);
            return res.status(500).json({ error: "Database Table Error!" });
        }

        const insertQuery = "INSERT INTO ai_data (json_content) VALUES (?)";
        db.query(insertQuery, [fullJsonData], (err) => {
            if (err) {
                console.error("❌ Insert error:", err);
                return res.status(500).json({ error: "Database Insert Error!" });
            }
            res.json({ message: "JSON data saved successfully!" });
        });
    });
});

// Get JSON API
app.get("/api/get-json", (req, res) => {
    const fetchQuery = "SELECT * FROM ai_data ORDER BY id DESC";
    db.query(fetchQuery, (err, results) => {
        if (err) {
            console.error("❌ Database Fetch Error:", err);
            return res.status(500).json({ error: "Database Fetch Error!" });
        }
        res.json(results || []);
    });
});

// 1. ఎవరైనా సైట్ ఓపెన్ చేయగానే ఫస్ట్ LOGIN PAGE ఓపెన్ అవుతుంది (డూప్లికేట్ రూట్ ఫిక్స్ చేసాను)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// 2. లాగిన్ సక్సెస్ అయ్యాక మాత్రమే index.html (మెయిన్ టేబుల్ పేజీ) ఓపెన్ అవుతుంది
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. లాగిన్ క్రిడెన్షియల్స్ చెక్ చేసే API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // ఇక్కడ యూజర్ నేమ్: admin, పాస్‌వర్డ్: 12345 ఇచ్చాను. మార్చుకోవాలంటే ఇక్కడ మార్చుకో బ్రో
    if (username === 'admin' && password === '12345') {
        res.json({ success: true, redirectUrl: '/dashboard' });
    } else {
        res.json({ success: false, message: 'Invalid Username or Password!' });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}...`);
});
