
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory menu data
let items = [
    {
        id: 1,
        name: "Veg Burger",
        price: 80,
        available: true
    },
    {
        id: 2,
        name: "Cheese Pizza",
        price: 150,
        available: true
    },
    {
        id: 3,
        name: "Masala Dosa",
        price: 70,
        available: true
    },
    {
        id: 4,
        name: "Cold Coffee",
        price: 60,
        available: false
    }
];

let nextId = 5;

// ROUTE 1: GET all menu items
app.get('/items', (req, res) => {
    res.status(200).json(items);
});

// ROUTE 2: GET one menu item by ID
app.get('/items/:id', (req, res) => {
    const id = Number(req.params.id);

    const item = items.find(item => item.id === id);

    if (!item) {
        return res.status(404).json({
            error: "Menu item not found"
        });
    }

    res.status(200).json(item);
});

// ROUTE 3: POST a new menu item
app.post('/items', (req, res) => {
    const { name, price, available } = req.body;

    // Validation
    if (
        typeof name !== 'string' ||
        !name.trim() ||
        price === undefined ||
        price === null ||
        price === '' ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0 ||
        typeof available !== 'boolean'
    ) {
        return res.status(422).json({
            error: "Valid name, price and available fields are required"
        });
    }

    const newItem = {
        id: nextId++,
        name: name.trim(),
        price: Number(price),
        available: available
    };

    items.push(newItem);

    res.status(201).json(newItem);
});

// Start server
app.listen(PORT, () => {
    console.log(`CampusEats server running at http://localhost:${PORT}`);
});
