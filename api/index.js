const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Hardcoded users for demo
const users = [
  {
    id: "1",
    name: "John Supplier",
    email: "supplier@demo.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    role: "supplier",
    businessName: "Fresh Farms Co.",
    businessType: "Organic Produce",
    rating: 4.5,
    totalRatings: 12,
  },
  {
    id: "2",
    name: "Sarah Stall Owner",
    email: "stall@demo.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    role: "stall_owner",
    businessName: "Sarah's Food Stall",
    businessType: "Street Food",
    rating: 0,
    totalRatings: 0,
  },
  {
    id: "3",
    name: "Mike Buyer",
    email: "buyer@demo.com",
    password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // "password"
    role: "buyer",
    businessName: "",
    businessType: "",
    rating: 0,
    totalRatings: 0,
  },
];

// Demo products
const products = [
  {
    id: "1",
    name: "Fresh Tomatoes",
    category: "Vegetables",
    price: 2.5,
    unit: "kg",
    quantity: 100,
    supplier: "1",
    supplierName: "Fresh Farms Co.",
    isAvailable: true,
  },
  {
    id: "2",
    name: "Organic Carrots",
    category: "Vegetables",
    price: 1.8,
    unit: "kg",
    quantity: 75,
    supplier: "1",
    supplierName: "Fresh Farms Co.",
    isAvailable: true,
  },
  {
    id: "3",
    name: "Fresh Spinach",
    category: "Leafy Greens",
    price: 3.2,
    unit: "kg",
    quantity: 50,
    supplier: "1",
    supplierName: "Fresh Farms Co.",
    isAvailable: true,
  },
];

// Demo orders
const orders = [
  {
    id: "1",
    orderNumber: "ORD001",
    buyer: "2",
    supplier: "1",
    items: [
      {
        product: "1",
        name: "Fresh Tomatoes",
        price: 2.5,
        quantity: 5,
        unit: "kg",
        subtotal: 12.5,
      },
    ],
    subtotal: 12.5,
    totalAmount: 12.5,
    status: "confirmed",
    orderDate: new Date().toISOString(),
  },
];

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  );
};

// Auth Routes
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        businessType: user.businessType,
        rating: user.rating,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Product Routes
app.get("/api/products", (req, res) => {
  res.json({ products });
});

app.get("/api/products/my", authenticateToken, (req, res) => {
  const userProducts = products.filter((p) => p.supplier === req.user.userId);
  res.json(userProducts);
});

// Supplier Routes
app.get("/api/suppliers", (req, res) => {
  const suppliers = users
    .filter((u) => u.role === "supplier")
    .map((u) => ({
      id: u.id,
      name: u.name,
      businessName: u.businessName,
      businessType: u.businessType,
      rating: u.rating,
      totalRatings: u.totalRatings,
      address: "Demo Address",
      phone: "+1234567890",
      createdAt: new Date().toISOString(),
    }));

  res.json({ suppliers });
});

// Order Routes
app.get("/api/orders/my", authenticateToken, (req, res) => {
  const userOrders = orders.filter(
    (o) => o.buyer === req.user.userId || o.supplier === req.user.userId
  );
  res.json({ orders: userOrders });
});

// Cart Routes
app.get("/api/cart", authenticateToken, (req, res) => {
  res.json({ items: [] });
});

app.post("/api/cart/add", authenticateToken, (req, res) => {
  res.json({ message: "Item added to cart" });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    message: "Demo mode - no database required",
  });
});

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Export for Vercel
module.exports = app;
