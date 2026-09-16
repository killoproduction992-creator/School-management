const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

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



// కనెక్షన్ విజయవంతం అయిందో లేదో మన లోకల్ టెర్మినల్‌లో చూడటానికి
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ database log: Connection failed -', err.message);
    } else {
        console.log('🚀 database log: Aiven MySQL Connected Successfully!');
        connection.release();
    }
});


// కనెక్షన్ విజయవంతం అయిందో లేదో మనకు తెలియడం కోసం ఈ చిన్న లాగ్ కోడ్
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ database log: Connection failed -', err.message);
    } else {
        console.log('🚀 database log: Aiven MySQL Connected Successfully!');
        connection.release();
    }
});


// Save JSON
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
            return res.status(500).json({
                error: "Database Table Error!"
            });
        }

        const insertQuery =
            "INSERT INTO ai_data (json_content) VALUES (?)";

        db.query(insertQuery, [fullJsonData], (err) => {

            if (err) {
                console.error("❌ Insert error:", err);
                return res.status(500).json({
                    error: "Database Insert Error!"
                });
            }

            res.json({
                message: "JSON data saved successfully!"
            });
        });
    });
});

// Get JSON
app.get("/api/get-json", (req, res) => {

    const fetchQuery =
        "SELECT * FROM ai_data ORDER BY id DESC";

    db.query(fetchQuery, (err, results) => {

        if (err) {
            console.error("❌ Database Fetch Error:", err);
            return res.status(500).json({
                error: "Database Fetch Error!"
            });
        }

        res.json(results || []);
    });
});

// Home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const PORT = process.env.PORT || 10000;
// 1. ఎవరైనా సైట్ ఓపెన్ చేయగానే ఫస్ట్ LOGIN PAGE ఓపెన్ అవుతుంది
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// 2. లాగిన్ సక్సెస్ అయ్యాక మాత్రమే index.html (టేబుల్ పేజీ) ఓపెన్ అవ్వడానికి రూట్
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 3. లాగిన్ క్రిడెన్షియల్స్ చెక్ చేసే API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    // ఇక్కడ నీకు నచ్చిన యూజర్ నేమ్, పాస్‌వర్డ్ సెట్ చేసుకో బ్రో (ప్రస్తుతానికి admin, 12345 ఇచ్చాను)
    if (username === 'admin' && password === '12345') {
        res.json({ success: true, redirectUrl: '/dashboard' });
    } else {
        res.json({ success: false, message: 'Invalid Username or Password!' });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}...`);
});