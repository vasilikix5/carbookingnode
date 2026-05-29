const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const JSON_FILE = path.join(__dirname, 'bookings.json');

// 1. Επιστροφή όλων των κρατήσεων για να τις βλέπει ο επόμενος χρήστης
app.get('/api/bookings', (req, res) => {
    fs.readFile(JSON_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Σφάλμα ανάγνωσης αρχείου" });
        res.json(JSON.parse(data || '[]'));
    });
});

// 2. Δημιουργία νέας κράτησης με έλεγχο ημερομηνιών
app.post('/api/bookings', (req, res) => {
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
        return res.status(400).json({ error: "Όλα τα πεδία είναι υποχρεωτικά!" });
    }

    fs.readFile(JSON_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: "Σφάλμα ανάγνωσης" });

        const bookings = JSON.parse(data || '[]');
        
        const startNew = new Date(startDate);
        const endNew = new Date(endDate);

        // Έλεγχος αν υπάρχει επικάλυψη ημερομηνιών
        const isOverlap = bookings.some(b => {
            const startExisting = new Date(b.startDate);
            const endExisting = new Date(b.endDate);
            return (startNew <= endExisting && endNew >= startExisting);
        });

        if (isOverlap) {
            return res.status(400).json({ error: "Το αυτοκίνητο είναι ήδη κλεισμένο για αυτές τις ημερομηνίες!" });
        }

        // Προσθήκη νέας κράτησης
        bookings.push({ name, startDate, endDate });

        fs.writeFile(JSON_FILE, JSON.stringify(bookings, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Σφάλμα αποθήκευσης" });
            res.json({ message: "Η κράτηση έγινε με επιτυχία!" });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
