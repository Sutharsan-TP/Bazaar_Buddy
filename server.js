const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("./config");

const app = express();
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://bazaar-buddy-zeta.vercel.app",
            "https://bazaar-buddy.vercel.app/",
          ]
        : ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
  })
);
app.use(express.json());

// Serve index.html for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// MongoDB Connection
mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Connection string:", config.MONGODB_URI);
  });

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// User Schema with Geolocation
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["supplier", "stall_owner", "buyer"],
    required: true,
  },
  phone: String,
  address: String,
  businessName: String,
  businessType: String,
  profileImage: String,
  isVerified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
});

// Product Schema (unchanged)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  unit: { type: String, required: true },
  quantity: { type: Number, required: true },
  minimumOrder: { type: Number, default: 1 },
  description: String,
  images: [String],
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  supplierName: String,
  supplierContact: String,
  supplierRating: Number,
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [String],
  nutritionalInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },
  harvestDate: Date,
  expiryDate: Date,
  origin: String,
  certifications: [String],
  bulkPricing: [
    {
      minQuantity: Number,
      price: Number,
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Order Schema (unchanged from original)
const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
      unit: String,
      subtotal: Number,
    },
  ],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "prepared",
      "ready_for_pickup",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cash_on_delivery", "upi", "card", "bank_transfer"],
    default: "cash_on_delivery",
  },
  orderDate: { type: Date, default: Date.now },
  deliveryDate: Date,
  estimatedDeliveryTime: String,
  deliveryAddress: {
    street: String,
    area: String,
    city: String,
    pincode: String,
    landmark: String,
  },
  notes: String,
  customerNotes: String,
  supplierNotes: String,
  trackingUpdates: [
    {
      status: String,
      timestamp: { type: Date, default: Date.now },
      description: String,
    },
  ],
});

// Rating Schema (unchanged)
const ratingSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: String,
  aspects: {
    quality: Number,
    delivery: Number,
    packaging: Number,
    communication: Number,
  },
  createdAt: { type: Date, default: Date.now },
});

// Wishlist Schema (unchanged)
const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  createdAt: { type: Date, default: Date.now },
});

// Cart Schema (unchanged)
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      addedAt: { type: Date, default: Date.now },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const Rating = mongoose.model("Rating", ratingSchema);
const Wishlist = mongoose.model("Wishlist", wishlistSchema);
const Cart = mongoose.model("Cart", cartSchema);

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `BB${timestamp}${random}`;
};

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Routes
app.post("/api/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      businessName,
      businessType,
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      businessName,
      businessType,
    });

    await user.save();

    // Create empty wishlist and cart for the user
    await new Wishlist({ user: user._id, products: [] }).save();
    await new Cart({ user: user._id, items: [] }).save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        businessType: user.businessType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        businessType: user.businessType,
        rating: user.rating,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Product Routes (unchanged from original, keeping all existing functionality)
app.get("/api/products", async (req, res) => {
  try {
    const {
      category,
      subcategory,
      search,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
      featured,
      supplier,
    } = req.query;

    let query = { isAvailable: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (subcategory) {
      query.subcategory = subcategory;
    }

    if (supplier) {
      query.supplier = supplier;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (featured === "true") {
      query.isFeatured = true;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .populate(
        "supplier",
        "name businessName phone rating totalRatings isVerified"
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// All other existing product routes remain unchanged...
app.get("/api/products/categories", async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isAvailable: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          subcategories: { $addToSet: "$subcategory" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/products/featured", async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isAvailable: true })
      .populate("supplier", "name businessName rating")
      .limit(10)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/products/my", authenticateToken, async (req, res) => {
  try {
    console.log("Backend: Getting products for user:", req.user.userId);
    const products = await Product.find({ supplier: req.user.userId }).sort({
      createdAt: -1,
    });
    console.log("Backend: Found products:", products.length);
    res.json(products);
  } catch (error) {
    console.error("Backend: Error getting products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "supplier",
      "name businessName phone address rating totalRatings isVerified"
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const ratings = await Rating.find({ product: product._id })
      .populate("buyer", "name businessName")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ product, ratings });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/products", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "supplier") {
      return res
        .status(403)
        .json({ message: "Only suppliers can add products" });
    }

    const supplier = await User.findById(req.user.userId);
    const productData = {
      ...req.body,
      supplier: req.user.userId,
      supplierName: supplier.businessName || supplier.name,
      supplierContact: supplier.phone,
      supplierRating: supplier.rating,
      updatedAt: new Date(),
    };

    const product = new Product(productData);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      supplier: req.user.userId,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, { ...req.body, updatedAt: new Date() });
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      supplier: req.user.userId,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Supplier Routes
app.get("/api/suppliers", async (req, res) => {
  try {
    const {
      search,
      businessType,
      rating,
      location,
      page = 1,
      limit = 20,
      sortBy = "rating",
    } = req.query;

    let query = { role: "supplier" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { businessName: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
      ];
    }

    if (businessType && businessType !== "all") {
      query.businessType = businessType;
    }

    if (location) {
      query.address = { $regex: location, $options: "i" };
    }

    if (rating) {
      query.rating = { $gte: parseFloat(rating) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Regular query with traditional sorting
    let sort = {};
    switch (sortBy) {
      case "rating":
        sort = { rating: -1, totalRatings: -1 };
        break;
      case "name":
        sort = { businessName: 1, name: 1 };
        break;
      case "newest":
        sort = { createdAt: -1 };
        break;
      default:
        sort = { rating: -1, totalRatings: -1 };
    }

    const suppliers = await User.find(query)
      .select(
        "name businessName businessType rating totalRatings address phone createdAt isVerified"
      )
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get additional stats for each supplier
    const suppliersWithStats = await Promise.all(
      suppliers.map(async (supplier) => {
        const productCount = await Product.countDocuments({
          supplier: supplier._id,
          isAvailable: true,
        });

        const totalOrders = await Order.countDocuments({
          supplier: supplier._id,
          status: "delivered",
        });

        const categories = await Product.distinct("category", {
          supplier: supplier._id,
          isAvailable: true,
        });

        const avgPriceResult = await Product.aggregate([
          { $match: { supplier: supplier._id, isAvailable: true } },
          { $group: { _id: null, avgPrice: { $avg: "$price" } } },
        ]);

        const avgPrice =
          avgPriceResult.length > 0 ? avgPriceResult[0].avgPrice : 0;

        return {
          ...supplier.toObject(),
          productCount,
          totalOrders,
          categories,
          avgPrice: Math.round(avgPrice),
        };
      })
    );

    const total = await User.countDocuments(query);

    res.json({
      suppliers: suppliersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalSuppliers: total,
        hasNext: skip + suppliers.length < total,
        hasPrev: page > 1,
      },
      sortBy: sortBy,
    });
  } catch (error) {
    console.error("Suppliers API error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get nearby suppliers endpoint
app.get("/api/suppliers/nearby", async (req, res) => {
  try {
    const { lat, lon, maxDistance = 10000 } = req.query; // default 10km

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude are required" });
    }

    const suppliers = await User.find({
      role: "supplier",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lon), parseFloat(lat)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).select("name businessName rating address location");

    // Add distance calculation
    const suppliersWithDistance = suppliers.map((supplier) => {
      const [supplierLon, supplierLat] = supplier.location.coordinates;
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lon),
        supplierLat,
        supplierLon
      );

      return {
        ...supplier.toObject(),
        distance: Math.round(distance * 10) / 10,
      };
    });

    res.json(suppliersWithDistance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Continue with all other existing routes (cart, orders, analytics, etc.) exactly as they were...
// Cart Routes
app.get("/api/cart", authenticateToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.userId }).populate({
      path: "items.product",
      populate: { path: "supplier", select: "name businessName rating" },
    });

    res.json(cart || { items: [] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/cart/add", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      cart = new Cart({ user: req.user.userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: { path: "supplier", select: "name businessName rating" },
    });

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/cart/update", authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      }
    }

    cart.updatedAt = new Date();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: { path: "supplier", select: "name businessName rating" },
    });

    res.json(populatedCart);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.delete("/api/cart/clear", authenticateToken, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { items: [], updatedAt: new Date() }
    );
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Wishlist Routes
app.get("/api/wishlist", authenticateToken, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.userId }).populate(
      {
        path: "products",
        populate: { path: "supplier", select: "name businessName rating" },
      }
    );

    res.json(wishlist || { products: [] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.post("/api/wishlist/toggle", authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user.userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.user.userId, products: [] });
    }

    const productIndex = wishlist.products.indexOf(productId);
    if (productIndex > -1) {
      wishlist.products.splice(productIndex, 1);
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
    res.json({ isWishlisted: productIndex === -1 });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Order Routes
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "stall_owner" && req.user.role !== "buyer") {
      return res
        .status(403)
        .json({ message: "Only stall owners and buyers can create orders" });
    }

    const orderData = {
      ...req.body,
      orderNumber: generateOrderNumber(),
      buyer: req.user.userId,
      trackingUpdates: [
        {
          status: "pending",
          description: "Order placed successfully",
        },
      ],
    };

    const order = new Order(orderData);
    await order.save();

    // Update product quantities
    for (const item of req.body.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity },
      });
    }

    // Clear cart after successful order
    await Cart.findOneAndUpdate(
      { user: req.user.userId },
      { items: [], updatedAt: new Date() }
    );

    const populatedOrder = await Order.findById(order._id)
      .populate("supplier", "name businessName phone")
      .populate("items.product", "name images");

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/orders/my", authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};

    if (req.user.role === "supplier") {
      query.supplier = req.user.userId;
    } else {
      query.buyer = req.user.userId;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate("buyer", "name businessName phone")
      .populate("supplier", "name businessName phone")
      .populate("items.product", "name images")
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalOrders: total,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/orders/:id", authenticateToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name businessName phone address")
      .populate("supplier", "name businessName phone address")
      .populate("items.product", "name images description");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user has access to this order
    if (
      order.buyer.toString() !== req.user.userId &&
      order.supplier.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.put("/api/orders/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only suppliers can update order status
    if (
      req.user.role !== "supplier" ||
      order.supplier.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    order.status = status;
    if (notes) {
      order.supplierNotes = notes;
    }

    // Add tracking update
    order.trackingUpdates.push({
      status,
      description: `Order ${status.replace("_", " ")}`,
    });

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Rating Routes
app.post("/api/ratings", authenticateToken, async (req, res) => {
  try {
    const { orderId, supplierId, productId, rating, review, aspects } =
      req.body;

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order || order.buyer.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Invalid order" });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      order: orderId,
      buyer: req.user.userId,
      product: productId,
    });

    if (existingRating) {
      return res
        .status(400)
        .json({ message: "Rating already exists for this product" });
    }

    const newRating = new Rating({
      order: orderId,
      buyer: req.user.userId,
      supplier: supplierId,
      product: productId,
      rating,
      review,
      aspects,
    });

    await newRating.save();

    // Update supplier's average rating
    const supplierRatings = await Rating.find({ supplier: supplierId });
    const avgRating =
      supplierRatings.reduce((sum, r) => sum + r.rating, 0) /
      supplierRatings.length;

    await User.findByIdAndUpdate(supplierId, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: supplierRatings.length,
    });

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Keep all existing supplier routes but add the new location-based ones above

app.get("/api/suppliers/business-types", async (req, res) => {
  try {
    const businessTypes = await User.distinct("businessType", {
      role: "supplier",
      businessType: { $exists: true, $ne: "" },
    });

    res.json(businessTypes);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

app.get("/api/suppliers/:id", async (req, res) => {
  try {
    const supplier = await User.findById(req.params.id).select(
      "name businessName rating totalRatings address phone createdAt"
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Get supplier's products
    const products = await Product.find({
      supplier: req.params.id,
      isAvailable: true,
    }).limit(20);

    // Get recent ratings
    const ratings = await Rating.find({ supplier: req.params.id })
      .populate("buyer", "name businessName")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      supplier,
      products,
      ratings,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Analytics Routes (for suppliers)
app.get("/api/analytics/supplier", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "supplier") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { period = "30" } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total orders and revenue
    const orderStats = await Order.aggregate([
      {
        $match: {
          supplier: new mongoose.Types.ObjectId(req.user.userId),
          orderDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          supplier: new mongoose.Types.ObjectId(req.user.userId),
          orderDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          supplier: new mongoose.Types.ObjectId(req.user.userId),
          orderDate: { $gte: startDate },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    // Daily sales trend
    const dailySales = await Order.aggregate([
      {
        $match: {
          supplier: new mongoose.Types.ObjectId(req.user.userId),
          orderDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$orderDate" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      overview: orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
      },
      ordersByStatus,
      topProducts,
      dailySales,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Search suggestions
app.get("/api/search/suggestions", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json([]);
    }

    const productSuggestions = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
      ],
      isAvailable: true,
    })
      .select("name category")
      .limit(5);

    const supplierSuggestions = await User.find({
      role: "supplier",
      $or: [
        { name: { $regex: q, $options: "i" } },
        { businessName: { $regex: q, $options: "i" } },
      ],
    })
      .select("name businessName")
      .limit(3);

    res.json({
      products: productSuggestions,
      suppliers: supplierSuggestions,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Bulk operations for suppliers
app.post("/api/products/bulk-update", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "supplier") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { productIds, updates } = req.body;

    await Product.updateMany(
      {
        _id: { $in: productIds },
        supplier: req.user.userId,
      },
      { ...updates, updatedAt: new Date() }
    );

    res.json({ message: "Products updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Inventory alerts
app.get("/api/inventory/alerts", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "supplier") {
      return res.status(403).json({ message: "Access denied" });
    }

    const lowStockProducts = await Product.find({
      supplier: req.user.userId,
      quantity: { $lte: 5 },
      isAvailable: true,
    }).select("name quantity unit category");

    const expiringSoon = await Product.find({
      supplier: req.user.userId,
      expiryDate: {
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      isAvailable: true,
    }).select("name expiryDate category");

    res.json({
      lowStock: lowStockProducts,
      expiringSoon,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    message: "Server error",
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// Start server
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🔗 MongoDB URI: ${config.MONGODB_URI ? "Configured" : "NOT CONFIGURED"}`
  );
});
