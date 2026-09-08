const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// 1. MySQL డేటాబేస్ కనెక్షన్ సెట్టింగ్స్
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',       // మీ MySQL యూజర్‌నేమ్
    password: '',       // మీ MySQL పాస్‌వర్డ్ (ఉంటే ఇవ్వండి, లేదంటే ఖాళీగా ఉంచండి)
    database: 'ai_studio_db' // మీ డేటాబేస్ పేరు
});

db.connect((err) => {
    if (err) {
        console.error('డేటాబేస్ కనెక్ట్ అవ్వలేదు: ' + err.stack);
        return;
    }
    console.log('✅ MySQL డేటాబేస్ కనెక్ట్ అయ్యింది!');
});

// 2. వెబ్‌సైట్ నుండి JSON డేటా తీసుకోవడానికి API ఎండ్‌పాయింట్
app.post('/api/save-json', (req, res) => {
    const fullJsonData = JSON.stringify(req.body); // పూర్తి JSON ని స్ట్రింగ్‌లా మారుస్తున్నాం
    
    // 'ai_data' అనే టేబుల్‌లో 'json_content' అనే కాలమ్‌లో సేవ్ చేయడానికి క్వెరీ
    const query = "INSERT INTO ai_data (json_content) VALUES (?)"; 
    
    db.query(query, [fullJsonData], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "డేటాబేస్ ఎర్రర్!" });
        }
        res.json({ message: "డేటాబేస్‌లో JSON డేటా విజయవంతంగా సేవ్ అయ్యింది!" });
    });
});

app.listen(5000, () => console.log('🚀 సర్వర్ పోర్ట్ 5000 లో రన్ అవుతుంది...'));
