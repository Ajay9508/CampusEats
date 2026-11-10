
require("dotenv").config({
    path: require("path").join(__dirname, ".env")
});

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// Check JWT secret
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    console.error(
        "ERROR: JWT_SECRET must be at least 32 characters in .env"
    );
    process.exit(1);
}

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Assignment 08: CampusEats menu data
let items = [
    {
        id: 1,
        name: "Veg Thali",
        price: 90,
        available: true
    },
    {
        id: 2,
        name: "Paneer Roll",
        price: 70,
        available: true
    },
    {
        id: 3,
        name: "Masala Dosa",
        price: 80,
        available: false
    }
];

// Seed users with bcrypt password hashes
const users = [
    {
        id: 1,
        name: "Ajay Customer",
        email: "ajay@campus.edu",
        role: "customer",
        passwordHash: bcrypt.hashSync(
            process.env.CUSTOMER_SEED_PASSWORD || "customer123",
            10
        )
    },
    {
        id: 2,
        name: "MealHub Restaurant",
        email: "mealhub@campus.edu",
        role: "restaurant",
        passwordHash: bcrypt.hashSync(
            process.env.RESTAURANT_SEED_PASSWORD || "resto123",
            10
        )
    },
    {
        id: 3,
        name: "Campus Manager",
        email: "manager@campus.edu",
        role: "admin",
        passwordHash: bcrypt.hashSync(
            process.env.MANAGER_SEED_PASSWORD || "manager123",
            10
        )
    }
];

// ========================================
// POST /login
// Verify credentials and generate JWT
// ========================================

app.post("/login", (req, res) => {

    const { email, password } = req.body || {};

    if (!email || !password) {
        return res.status(422).json({
            error: "Email and password are required"
        });
    }

    const user = users.find(
        (u) => u.email.toLowerCase() === String(email).toLowerCase()
    );

    if (
        !user ||
        !bcrypt.compareSync(String(password), user.passwordHash)
    ) {
        return res.status(401).json({
            error: "Invalid email or password"
        });
    }

    // Generate JWT token
    const token = jwt.sign(
        {
            userId: user.id,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "1h"
        }
    );

    return res.status(200).json({
        message: "Login successful",
        token: token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        expiresIn: "1h"
    });
});

// ========================================
// Authentication Middleware
// Verify JWT token
// ========================================

function auth(req, res, next) {

    const authorization = req.get("Authorization") || "";

    const parts = authorization.split(" ");

    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer" ||
        !parts[1]
    ) {
        return res.status(401).json({
            error: "Missing or malformed Bearer token"
        });
    }

    try {

        const token = parts[1];

        // Verify JWT
        req.user = jwt.verify(token, JWT_SECRET);

        next();

    } catch (error) {

        return res.status(401).json({
            error: "Invalid or expired token"
        });

    }
}

// ========================================
// Role Authorization Middleware
// ========================================

const requireRole = (...allowedRoles) => {

    return (req, res, next) => {

        if (
            !req.user ||
            !allowedRoles.includes(req.user.role)
        ) {
            return res.status(403).json({
                error: "Forbidden: insufficient role"
            });
        }

        next();
    };
};

// ========================================
// GET /items
// Protected route: any authenticated user
// ========================================

app.get("/items", auth, (req, res) => {

    return res.status(200).json({
        items: items,
        requestedBy: req.user.role
    });

});

// ========================================
// GET /items/:id
// Protected route: any authenticated user
// ========================================

app.get("/items/:id", auth, (req, res) => {

    const id = Number(req.params.id);

    const item = items.find(
        (item) => item.id === id
    );

    if (!item) {
        return res.status(404).json({
            error: "Item not found"
        });
    }

    return res.status(200).json(item);

});

// ========================================
// POST /items
// Only restaurant/admin can create items
// ========================================

app.post(
    "/items",
    auth,
    requireRole("restaurant", "admin"),
    (req, res) => {

        const {
            name,
            price,
            available = true
        } = req.body || {};

        // Validate input
        if (
            typeof name !== "string" ||
            !name.trim() ||
            price === undefined ||
            price === null ||
            price === "" ||
            !Number.isFinite(Number(price)) ||
            Number(price) < 0
        ) {
            return res.status(422).json({
                error: "Valid name and non-negative price are required"
            });
        }

        // Create new menu item
        const newItem = {
            id: items.length
                ? Math.max(...items.map((item) => item.id)) + 1
                : 1,

            name: name.trim(),
            price: Number(price),
            available: Boolean(available)
        };

        items.push(newItem);

        return res.status(201).json({
            message: "Item created successfully",
            item: newItem
        });

    }
);

// ========================================
// GET /health
// Public health check
// ========================================

app.get("/health", (req, res) => {

    res.status(200).json({
        status: "ok",
        message: "CampusEats API is running"
    });

});

// ========================================
// Error Handling Middleware
// ========================================

app.use((err, req, res, next) => {

    if (
        err instanceof SyntaxError &&
        err.status === 400 &&
        "body" in err
    ) {
        return res.status(400).json({
            error: "Invalid JSON body"
        });
    }

    console.error(err);

    return res.status(500).json({
        error: "Internal server error"
    });

});

// ========================================
// Start Server
// ========================================

app.listen(PORT, () => {

    console.log(
        `CampusEats API running at http://localhost:${PORT}`
    );

    console.log("Customer: ajay@campus.edu");
    console.log("Restaurant: mealhub@campus.edu");

});
