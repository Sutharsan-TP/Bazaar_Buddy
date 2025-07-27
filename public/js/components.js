// SupplierCard Component
const SupplierCard = ({ supplier }) => {
  const renderStars = (rating) => {
    return "⭐".repeat(Math.round(rating || 0));
  };

  const getSupplierIcon = (businessType) => {
    return businessType === "farm"
      ? "🌾"
      : businessType === "wholesale"
      ? "🏪"
      : businessType === "organic"
      ? "🌱"
      : "🏭";
  };

  return (
    <div className="supplier-card">
      <div className="supplier-header">
        <div className="supplier-icon">
          {getSupplierIcon(supplier.businessType)}
        </div>
        <div>
          <div className="supplier-name">
            {supplier.businessName || supplier.name}
            {supplier.isVerified && (
              <span
                style={{ color: "var(--success-color)", marginLeft: "8px" }}
              >
                ✓
              </span>
            )}
          </div>
          <div className="supplier-type">
            {supplier.businessType || "Supplier"} •{" "}
            {supplier.address || "Location not specified"}
          </div>
        </div>
      </div>

      <div className="supplier-rating">
        {renderStars(supplier.rating)} {supplier.rating || 0} (
        {supplier.totalRatings || 0} reviews)
      </div>

      <div className="supplier-stats">
        <div className="stat-item">
          <div className="stat-value">{supplier.productCount || 0}</div>
          <div className="stat-label">Products</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{supplier.totalOrders || 0}</div>
          <div className="stat-label">Orders</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{supplier.rating || 0}</div>
          <div className="stat-label">Rating</div>
        </div>
      </div>

      {supplier.categories && supplier.categories.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "5px",
            }}
          >
            Specializes in:
          </div>
          <div className="supplier-categories">
            {supplier.categories.map((category) => (
              <span key={category} className="category-tag">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px" }}>
        <button className="btn btn-primary" style={{ flex: 1 }}>
          🛒 View Products
        </button>
        <button className="btn btn-secondary">📞 Contact</button>
      </div>

      {supplier.phone && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "var(--text-secondary)",
          }}
        >
          📱 {supplier.phone}
        </div>
      )}
    </div>
  );
};

// Supplier Dashboard Component
const LocationSupplierDashboard = ({
  suppliers,
  loading,
  searchTerm,
  onSearch,
}) => {
  const [sortBy, setSortBy] = useState("rating");

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    const searchOptions = {
      sortBy: newSortBy,
    };
    onSearch(searchTerm, searchOptions);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "5px" }}>Browse Suppliers</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Connect with trusted farmers and wholesalers
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              🔄 Sort By
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {[
                { value: "rating", label: "⭐ Rating" },
                { value: "name", label: "📝 Name" },
                { value: "newest", label: "🆕 Newest" },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`btn btn-sm ${
                    sortBy === option.value ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() => handleSortChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
          <div>Loading suppliers...</div>
        </div>
      ) : suppliers.length > 0 ? (
        <div className="supplier-grid">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier._id} supplier={supplier} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No suppliers found"
          description="Try adjusting your search criteria or browse all suppliers."
        />
      )}
    </div>
  );
}; // React Components
const { useState, useEffect, useRef } = React;

// Notification Component
const Notification = ({ message, type = "success", show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div className={`notification ${show ? "show" : ""} ${type}`}>
      {message}
    </div>
  );
};

// Analytics Dashboard Component
const AnalyticsDashboard = ({ token }) => {
  const [analytics, setAnalytics] = useState(null);
  const [inventoryAlerts, setInventoryAlerts] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    loadAnalytics();
    loadInventoryAlerts();
  }, [selectedPeriod]);

  useEffect(() => {
    if (analytics && analytics.dailySales) {
      renderChart();
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [analytics]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAnalytics(token, selectedPeriod);
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryAlerts = async () => {
    try {
      const data = await apiService.getInventoryAlerts(token);
      setInventoryAlerts(data);
    } catch (error) {
      console.error("Failed to load inventory alerts:", error);
    }
  };

  const renderChart = () => {
    if (!chartRef.current || !analytics.dailySales) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: analytics.dailySales.map((day) => {
          const date = new Date(day._id);
          return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
        }),
        datasets: [
          {
            label: "Revenue (₹)",
            data: analytics.dailySales.map((day) => day.revenue),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.1)",
            fill: true,
            tension: 0.4,
          },
          {
            label: "Orders",
            data: analytics.dailySales.map((day) => day.orders),
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            fill: false,
            yAxisID: "y1",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Revenue (₹)",
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Orders",
            },
            grid: {
              drawOnChartArea: false,
            },
          },
        },
      },
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
        <div>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "5px" }}>Analytics Dashboard</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Track your sales performance and business insights
        </p>
      </div>

      {/* Overview Cards */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Revenue</h3>
          <div className="analytics-value">
            {formatCurrency(analytics?.overview?.totalRevenue || 0)}
          </div>
          <div className="analytics-change positive">+12% from last period</div>
        </div>

        <div className="analytics-card">
          <h3>Total Orders</h3>
          <div className="analytics-value">
            {analytics?.overview?.totalOrders || 0}
          </div>
          <div className="analytics-change positive">+8% from last period</div>
        </div>

        <div className="analytics-card">
          <h3>Average Order Value</h3>
          <div className="analytics-value">
            {formatCurrency(analytics?.overview?.avgOrderValue || 0)}
          </div>
          <div className="analytics-change negative">-3% from last period</div>
        </div>

        <div className="analytics-card">
          <h3>Products Listed</h3>
          <div className="analytics-value">
            {analytics?.topProducts?.length || 0}
          </div>
          <div className="analytics-change positive">+2 new products</div>
        </div>
      </div>

      {/* Period Selector and Chart */}
      <div className="chart-container">
        <div className="chart-header">
          <h3>Sales Trend</h3>
          <div className="period-selector">
            {["7", "30", "90"].map((period) => (
              <button
                key={period}
                className={`period-btn ${
                  selectedPeriod === period ? "active" : ""
                }`}
                onClick={() => setSelectedPeriod(period)}
              >
                {period} days
              </button>
            ))}
          </div>
        </div>
        <canvas ref={chartRef}></canvas>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}
      >
        {/* Top Products */}
        <div className="top-products-list">
          <h3 style={{ marginBottom: "15px" }}>Top Selling Products</h3>
          {analytics?.topProducts?.length > 0 ? (
            analytics.topProducts.slice(0, 5).map((product, index) => (
              <div key={product._id} className="product-rank">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <div className="rank-number">{index + 1}</div>
                  <div>
                    <div style={{ fontWeight: "600" }}>{product.name}</div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {product.totalQuantity} units sold
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{ fontWeight: "600", color: "var(--primary-color)" }}
                  >
                    {formatCurrency(product.totalRevenue)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                padding: "20px",
              }}
            >
              No sales data available
            </div>
          )}
        </div>

        {/* Inventory Alerts */}
        <div className="top-products-list">
          <h3 style={{ marginBottom: "15px" }}>Inventory Alerts</h3>
          {inventoryAlerts?.lowStock?.length > 0 ? (
            <>
              <h4
                style={{
                  fontSize: "14px",
                  color: "var(--error-color)",
                  marginBottom: "10px",
                }}
              >
                Low Stock Items
              </h4>
              {inventoryAlerts.lowStock.map((product) => (
                <div
                  key={product._id}
                  style={{
                    padding: "8px 12px",
                    background: "#fee2e2",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  <div style={{ fontWeight: "600" }}>{product.name}</div>
                  <div style={{ color: "var(--error-color)" }}>
                    Only {product.quantity} {product.unit} left
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {inventoryAlerts?.expiringSoon?.length > 0 ? (
            <>
              <h4
                style={{
                  fontSize: "14px",
                  color: "var(--secondary-color)",
                  marginBottom: "10px",
                }}
              >
                Expiring Soon
              </h4>
              {inventoryAlerts.expiringSoon.map((product) => (
                <div
                  key={product._id}
                  style={{
                    padding: "8px 12px",
                    background: "#fef3c7",
                    borderRadius: "6px",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  <div style={{ fontWeight: "600" }}>{product.name}</div>
                  <div style={{ color: "var(--secondary-color)" }}>
                    Expires: {new Date(product.expiryDate).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </>
          ) : null}

          {!inventoryAlerts?.lowStock?.length &&
            !inventoryAlerts?.expiringSoon?.length && (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  padding: "20px",
                }}
              >
                All inventory levels look good! 👍
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Header Component
const Header = ({ user, onSearch, onLogout, cartItemCount, onCartToggle }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">🥬 Bazaar Buddy</div>

          <div className="search-bar">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              className="search-input"
              placeholder={
                user.role === "supplier"
                  ? "Search for products to manage..."
                  : "Search for fresh vegetables, fruits, suppliers..."
              }
              value={searchValue}
              onChange={handleSearch}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {user.role === "stall_owner" && (
              <button className="btn btn-secondary" onClick={onCartToggle}>
                🛒 Cart ({cartItemCount})
              </button>
            )}

            <div className="user-info">
              <span>{user.name}</span>
              <span className="user-role-badge">
                {user.role.replace("_", " ").toUpperCase()}
              </span>
            </div>

            <button className="btn btn-secondary" onClick={onLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

// SUPPLIER-SPECIFIC COMPONENTS
const SupplierDashboard = ({
  user,
  products,
  loading,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "vegetables",
    price: "",
    quantity: "",
    unit: "kg",
    description: "",
    images: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      onEditProduct(editingProduct._id, formData);
    } else {
      onAddProduct(formData);
    }
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      category: "vegetables",
      price: "",
      quantity: "",
      unit: "kg",
      description: "",
      images: [],
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      unit: product.unit,
      description: product.description || "",
      images: product.images || [],
    });
    setShowAddForm(true);
  };

  return (
    <div>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "5px" }}>My Products</h2>
          <p style={{ color: "var(--text-secondary)" }}>
            Manage your product inventory and pricing
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          ➕ Add New Product
        </button>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <div className="card-body">
            <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div>
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="dairy">Dairy</option>
                    <option value="grains">Grains</option>
                  </select>
                </div>
                <div>
                  <label>Price (₹)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div>
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    required
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "4px",
                    }}
                  />
                </div>
                <div>
                  <label>Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="kg">Kilogram (kg)</option>
                    <option value="g">Gram (g)</option>
                    <option value="pieces">Pieces</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: "15px" }}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "4px",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                    setFormData({
                      name: "",
                      category: "vegetables",
                      price: "",
                      quantity: "",
                      unit: "kg",
                      description: "",
                      images: [],
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
          <div>Loading products...</div>
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <SupplierProductCard
              key={product._id}
              product={product}
              onEdit={handleEdit}
              onDelete={onDeleteProduct}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="📦"
          title="No products yet"
          description="Add your first product to start selling!"
        />
      )}
    </div>
  );
};

const SupplierProductCard = ({ product, onEdit, onDelete }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const getProductEmoji = (category) => {
    return category === "vegetables"
      ? "🥬"
      : category === "fruits"
      ? "🍎"
      : category === "dairy"
      ? "🥛"
      : "🛒";
  };

  return (
    <div className="product-card">
      <div className="product-image">{getProductEmoji(product.category)}</div>
      <div className="product-content">
        <div className="product-name">{product.name}</div>
        <div className="product-category">{product.category}</div>
        <div className="product-price">
          {formatPrice(product.price)}/{product.unit}
        </div>
        <div
          style={{
            color: "var(--text-secondary)",
            fontSize: "13px",
            marginBottom: "15px",
          }}
        >
          Stock: {product.quantity} {product.unit}
        </div>
        {product.description && (
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "15px",
            }}
          >
            {product.description}
          </p>
        )}

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={() => onEdit(product)}
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={() => onDelete(product._id)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// STALL OWNER-SPECIFIC COMPONENTS
const StallOwnerDashboard = ({
  products,
  suppliers,
  orders,
  loading,
  onAddToCart,
  token,
}) => {
  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ marginBottom: "5px" }}>Fresh Products</h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Discover fresh vegetables, fruits, and more from local suppliers
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
          <div>Loading products...</div>
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              token={token}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🔍"
          title="No products found"
          description="Try adjusting your search to find what you're looking for."
        />
      )}
    </div>
  );
};

// ProductCard Component (for stall owners)
const ProductCard = ({ product, onAddToCart, token }) => {
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const getProductEmoji = (category) => {
    return category === "vegetables"
      ? "🥬"
      : category === "fruits"
      ? "🍎"
      : category === "dairy"
      ? "🥛"
      : "🛒";
  };

  const handleAddToCart = async () => {
    if (!token) {
      return;
    }

    setAddingToCart(true);
    try {
      await apiService.addToCart(product._id, quantity, token);
      onAddToCart && onAddToCart();
      setQuantity(1);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image">{getProductEmoji(product.category)}</div>
      <div className="product-content">
        <div className="product-name">{product.name}</div>
        <div className="product-category">{product.category}</div>
        <div className="product-price">
          {formatPrice(product.price)}/{product.unit}
        </div>
        <div className="product-supplier">
          📍 {product.supplier?.businessName || product.supplierName} | Stock:{" "}
          {product.quantity} {product.unit}
        </div>
        {product.description && (
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginBottom: "15px",
            }}
          >
            {product.description}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div className="quantity-controls">
            <button
              className="quantity-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              −
            </button>
            <span className="quantity-display">{quantity}</span>
            <button
              className="quantity-btn"
              onClick={() =>
                setQuantity(Math.min(product.quantity || 99, quantity + 1))
              }
            >
              +
            </button>
          </div>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: "100%" }}
          onClick={handleAddToCart}
          disabled={addingToCart || product.quantity <= 0}
        >
          {addingToCart
            ? "Adding..."
            : product.quantity <= 0
            ? "Out of Stock"
            : "🛒 Add to Cart"}
        </button>
      </div>
    </div>
  );
};

// CartSidebar Component
const CartSidebar = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveFromCart,
  onCheckout,
  loading,
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const getProductEmoji = (category) => {
    return category === "vegetables"
      ? "🥬"
      : category === "fruits"
      ? "🍎"
      : category === "dairy"
      ? "🥛"
      : "🛒";
  };

  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />
      <div className={`cart-sidebar ${isOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h3>Shopping Cart</h3>
          <button
            className="quantity-btn"
            onClick={onClose}
            style={{ fontSize: "16px" }}
          >
            ×
          </button>
        </div>

        <div className="cart-content">
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
              <div>Loading cart...</div>
            </div>
          ) : cart.length === 0 ? (
            <EmptyState
              icon="🛒"
              title="Your cart is empty"
              description="Add some fresh products to get started!"
            />
          ) : (
            cart.map((item) => (
              <div key={item.product._id} className="cart-item">
                <div className="cart-item-image">
                  {getProductEmoji(item.product.category)}
                </div>
                <div className="cart-item-details">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-price">
                    {formatPrice(item.product.price)}/{item.product.unit}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "8px",
                    }}
                  >
                    <div className="quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          onUpdateQuantity(item.product._id, item.quantity - 1)
                        }
                      >
                        −
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() =>
                          onUpdateQuantity(item.product._id, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onRemoveFromCart(item.product._id)}
                      style={{
                        background: "var(--error-color)",
                        color: "white",
                        padding: "4px 8px",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Delivery:</span>
                <span>Free</span>
              </div>
              <div className="cart-summary-row total">
                <span>Total:</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={onCheckout}
            >
              Checkout {formatPrice(cartTotal)}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// OrderCard Component with Management Features
const OrderCard = ({
  order,
  onStatusUpdate,
  isSupplier = false,
  onRateSupplier,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.supplierNotes || "");
  const [showRatingModal, setShowRatingModal] = useState(false);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      prepared: "#8b5cf6",
      ready_for_pickup: "#06b6d4",
      out_for_delivery: "#06b6d4",
      delivered: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "prepared", label: "Prepared" },
    { value: "ready_for_pickup", label: "Ready for Pickup" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const handleStatusUpdate = async () => {
    if (!onStatusUpdate || newStatus === order.status) return;

    setUpdating(true);
    try {
      await onStatusUpdate(order._id, newStatus, notes);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleCall = (phone) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleWhatsApp = (phone, orderNumber) => {
    const message = `Hello! This is regarding your order #${orderNumber} from Bazaar Buddy. `;
    const url = `https://wa.me/${phone.replace(
      /[^0-9]/g,
      ""
    )}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="card">
      <div className="card-body">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <div>
            <h4>Order #{order.orderNumber}</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
              {new Date(order.orderDate).toLocaleDateString()} at{" "}
              {new Date(order.orderDate).toLocaleTimeString()} •{" "}
              {isSupplier
                ? order.buyer?.businessName || order.buyer?.name
                : order.supplier?.businessName || order.supplier?.name}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                background: getStatusColor(order.status),
                color: "white",
                padding: "4px 12px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {order.status.replace("_", " ").toUpperCase()}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "View Details"}
            </button>
          </div>
        </div>

        {/* Order Items Summary */}
        <div style={{ marginBottom: "15px" }}>
          <h5 style={{ marginBottom: "10px" }}>
            Items ({order.items.length}):
          </h5>
          {order.items
            .slice(0, showDetails ? order.items.length : 2)
            .map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "5px",
                  padding: "5px 0",
                }}
              >
                <span>
                  {item.name} ({item.quantity} {item.unit})
                </span>
                <span>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          {!showDetails && order.items.length > 2 && (
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "12px",
                fontStyle: "italic",
              }}
            >
              +{order.items.length - 2} more items...
            </p>
          )}
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div
            style={{
              marginBottom: "15px",
              padding: "15px",
              background: "var(--bg-light)",
              borderRadius: "8px",
            }}
          >
            {/* Customer/Supplier Information */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                marginBottom: "15px",
              }}
            >
              <div>
                <h6
                  style={{ marginBottom: "8px", color: "var(--text-primary)" }}
                >
                  {isSupplier ? "Customer Details" : "Supplier Details"}
                </h6>
                <div style={{ fontSize: "14px" }}>
                  <p>
                    <strong>Name:</strong>{" "}
                    {isSupplier ? order.buyer?.name : order.supplier?.name}
                  </p>
                  <p>
                    <strong>Business:</strong>{" "}
                    {isSupplier
                      ? order.buyer?.businessName
                      : order.supplier?.businessName}
                  </p>
                  {(isSupplier
                    ? order.buyer?.phone
                    : order.supplier?.phone) && (
                    <p>
                      <strong>Phone:</strong>
                      <span style={{ marginLeft: "8px" }}>
                        {isSupplier
                          ? order.buyer?.phone
                          : order.supplier?.phone}
                        {isSupplier && (
                          <span style={{ marginLeft: "10px" }}>
                            <button
                              className="btn btn-sm"
                              style={{
                                padding: "2px 6px",
                                background: "#25D366",
                                color: "white",
                                marginRight: "5px",
                              }}
                              onClick={() =>
                                handleWhatsApp(
                                  order.buyer?.phone,
                                  order.orderNumber
                                )
                              }
                            >
                              📱 WhatsApp
                            </button>
                            <button
                              className="btn btn-sm"
                              style={{
                                padding: "2px 6px",
                                background: "var(--primary-color)",
                                color: "white",
                              }}
                              onClick={() => handleCall(order.buyer?.phone)}
                            >
                              📞 Call
                            </button>
                          </span>
                        )}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Information */}
              {order.deliveryAddress && (
                <div>
                  <h6
                    style={{
                      marginBottom: "8px",
                      color: "var(--text-primary)",
                    }}
                  >
                    Delivery Address
                  </h6>
                  <div style={{ fontSize: "14px" }}>
                    <p>{order.deliveryAddress.street}</p>
                    <p>{order.deliveryAddress.area}</p>
                    <p>
                      {order.deliveryAddress.city} -{" "}
                      {order.deliveryAddress.pincode}
                    </p>
                    {order.deliveryAddress.landmark && (
                      <p>
                        <strong>Landmark:</strong>{" "}
                        {order.deliveryAddress.landmark}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information */}
            <div style={{ marginBottom: "15px" }}>
              <h6 style={{ marginBottom: "8px", color: "var(--text-primary)" }}>
                Payment Details
              </h6>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "10px",
                  fontSize: "14px",
                }}
              >
                <p>
                  <strong>Method:</strong>{" "}
                  {order.paymentMethod?.replace("_", " ").toUpperCase() ||
                    "COD"}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    style={{
                      color:
                        order.paymentStatus === "paid"
                          ? "var(--success-color)"
                          : "var(--secondary-color)",
                      fontWeight: "600",
                    }}
                  >
                    {order.paymentStatus?.toUpperCase() || "PENDING"}
                  </span>
                </p>
              </div>
            </div>

            {/* Order Timeline */}
            {order.trackingUpdates && order.trackingUpdates.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <h6
                  style={{ marginBottom: "8px", color: "var(--text-primary)" }}
                >
                  Order Timeline
                </h6>
                <div style={{ maxHeight: "150px", overflowY: "auto" }}>
                  {order.trackingUpdates.map((update, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "8px 12px",
                        margin: "5px 0",
                        background: "var(--bg-white)",
                        borderRadius: "6px",
                        fontSize: "13px",
                        borderLeft: "3px solid var(--primary-color)",
                      }}
                    >
                      <div style={{ fontWeight: "600" }}>
                        {update.status.replace("_", " ").toUpperCase()}
                      </div>
                      <div style={{ color: "var(--text-secondary)" }}>
                        {update.description} •{" "}
                        {new Date(update.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {(order.customerNotes || order.supplierNotes) && (
              <div style={{ marginBottom: "15px" }}>
                <h6
                  style={{ marginBottom: "8px", color: "var(--text-primary)" }}
                >
                  Notes
                </h6>
                {order.customerNotes && (
                  <div style={{ marginBottom: "8px" }}>
                    <strong>Customer Notes:</strong>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        margin: "4px 0",
                      }}
                    >
                      {order.customerNotes}
                    </p>
                  </div>
                )}
                {order.supplierNotes && (
                  <div>
                    <strong>Supplier Notes:</strong>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "var(--text-secondary)",
                        margin: "4px 0",
                      }}
                    >
                      {order.supplierNotes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Supplier Order Management */}
        {isSupplier && (
          <div
            style={{
              marginBottom: "15px",
              padding: "15px",
              background: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
            }}
          >
            <h6 style={{ marginBottom: "10px", color: "var(--text-primary)" }}>
              Order Management
            </h6>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                marginBottom: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  Update Status:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "end" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === order.status}
                  style={{ width: "100%" }}
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Supplier Notes:
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes for this order (optional)"
                rows="3"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "6px",
                  fontSize: "14px",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        )}

        {/* Order Total */}
        <div
          style={{
            borderTop: "1px solid var(--border-color)",
            paddingTop: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong>Total: {formatPrice(order.totalAmount)}</strong>
            {order.deliveryFee > 0 && (
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                (Includes delivery: {formatPrice(order.deliveryFee)})
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {isSupplier && order.buyer?.phone && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  handleWhatsApp(order.buyer.phone, order.orderNumber)
                }
              >
                💬 Contact
              </button>
            )}
            {!isSupplier && order.status === "delivered" && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowRatingModal(true)}
              >
                ⭐ Rate Supplier
              </button>
            )}
            {(order.status === "confirmed" || order.status === "prepared") && (
              <button className="btn btn-primary btn-sm">📦 Track Order</button>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={onRateSupplier}
          order={order}
          supplier={order.supplier}
        />
      )}
    </div>
  );
};

// RatingModal Component
const RatingModal = ({ isOpen, onClose, onSubmit, order, supplier }) => {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState("");
  const [aspects, setAspects] = useState({
    quality: 5,
    delivery: 5,
    packaging: 5,
    communication: 5,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;

    setSubmitting(true);
    try {
      await onSubmit({
        orderId: order._id,
        supplierId: supplier._id,
        productId: order.items[0]?.product, // For simplicity, rating the first product
        rating,
        review,
        aspects,
      });
      onClose();
    } catch (error) {
      console.error("Failed to submit rating:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAspectChange = (aspect, value) => {
    setAspects((prev) => ({ ...prev, [aspect]: value }));
  };

  const renderStars = (value, onChange) => {
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: star <= value ? "#ffd700" : "#e5e7eb",
            }}
          >
            ⭐
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "24px",
          maxWidth: "500px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0 }}>Rate Your Experience</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Overall Rating */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Overall Rating *
            </label>
            {renderStars(rating, setRating)}
            <p style={{ marginTop: "4px", fontSize: "14px", color: "#6b7280" }}>
              {rating} out of 5 stars
            </p>
          </div>

          {/* Detailed Aspects */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontWeight: "600",
              }}
            >
              Rate Specific Aspects
            </label>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                { key: "quality", label: "Product Quality" },
                { key: "delivery", label: "Delivery Service" },
                { key: "packaging", label: "Packaging" },
                { key: "communication", label: "Communication" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>{label}</span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>
                      {aspects[key]} stars
                    </span>
                  </div>
                  {renderStars(aspects[key], (value) =>
                    handleAspectChange(key, value)
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "600",
              }}
            >
              Review (Optional)
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this supplier..."
              rows="4"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                resize: "vertical",
              }}
            />
          </div>

          {/* Order Info */}
          <div
            style={{
              background: "#f9fafb",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            <p style={{ margin: "0 0 4px 0", fontWeight: "600" }}>
              Order #{order.orderNumber}
            </p>
            <p style={{ margin: "0 0 4px 0", color: "#6b7280" }}>
              Supplier: {supplier.businessName || supplier.name}
            </p>
            <p style={{ margin: 0, color: "#6b7280" }}>
              {order.items.length} item{order.items.length !== 1 ? "s" : ""} •{" "}
              {new Date(order.orderDate).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div
            style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                background: "white",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                background: submitting ? "#9ca3af" : "#3b82f6",
                color: "white",
                cursor: submitting ? "not-allowed" : "pointer",
                fontSize: "14px",
              }}
            >
              {submitting ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// EmptyState Component
const EmptyState = ({ icon, title, description }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <div className="empty-state-title">{title}</div>
    <div style={{ fontSize: "14px" }}>{description}</div>
  </div>
);

// Login Component with Registration
const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "stall_owner",
    phone: "",
    address: "",
    businessName: "",
    businessType: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "stall_owner",
      phone: "",
      address: "",
      businessName: "",
      businessType: "",
    });
    setError("");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login logic
        const response = await apiService.login({
          email: formData.email,
          password: formData.password,
        });
        onLogin(response.user, response.token);
      } else {
        // Registration logic
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          setLoading(false);
          return;
        }

        const registrationData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          address: formData.address,
        };

        // Add business fields for suppliers
        if (formData.role === "supplier") {
          registrationData.businessName = formData.businessName;
          registrationData.businessType = formData.businessType;
        }

        const response = await apiService.register(registrationData);
        onLogin(response.user, response.token);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isLogin
            ? "Login failed. Please try again."
            : "Registration failed. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "var(--bg-white)",
          borderRadius: "16px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          maxWidth: isLogin ? "420px" : "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "32px", marginBottom: "10px" }}>🥬</div>
          <h2
            style={{ fontSize: "24px", fontWeight: "700", marginBottom: "8px" }}
          >
            {isLogin ? "Welcome Back" : "Join Bazaar Buddy"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {isLogin
              ? "Sign in to your account"
              : "Create your account to get started"}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "var(--error-color)",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Registration-only fields */}
          {!isLogin && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    color: "var(--text-primary)",
                  }}
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    color: "var(--text-primary)",
                  }}
                >
                  I am a *
                </label>
                <select
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    background: "white",
                  }}
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  disabled={loading}
                >
                  <option value="stall_owner">🏪 Stall Owner (Buyer)</option>
                  <option value="supplier">
                    🌾 Supplier (Farmer/Wholesaler)
                  </option>
                </select>
                <p
                  style={{
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                    marginTop: "4px",
                  }}
                >
                  {formData.role === "stall_owner"
                    ? "I want to buy fresh products for my business"
                    : "I want to sell my products to local businesses"}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "15px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      color: "var(--text-primary)",
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                    disabled={loading}
                  />
                </div>

                {formData.role === "supplier" && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "6px",
                        fontWeight: "500",
                        color: "var(--text-primary)",
                      }}
                    >
                      Business Type
                    </label>
                    <select
                      style={{
                        width: "100%",
                        padding: "12px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        fontSize: "14px",
                        background: "white",
                      }}
                      value={formData.businessType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          businessType: e.target.value,
                        })
                      }
                      disabled={loading}
                    >
                      <option value="">Select type</option>
                      <option value="farm">🌾 Farm</option>
                      <option value="wholesale">🏪 Wholesale</option>
                      <option value="organic">🌱 Organic Producer</option>
                      <option value="cooperative">🤝 Cooperative</option>
                    </select>
                  </div>
                )}
              </div>

              {formData.role === "supplier" && (
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "500",
                      color: "var(--text-primary)",
                    }}
                  >
                    Business Name *
                  </label>
                  <input
                    type="text"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid var(--border-color)",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                    value={formData.businessName}
                    onChange={(e) =>
                      setFormData({ ...formData, businessName: e.target.value })
                    }
                    required={formData.role === "supplier"}
                    placeholder="Enter your business/farm name"
                    disabled={loading}
                  />
                </div>
              )}

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    color: "var(--text-primary)",
                  }}
                >
                  Address {formData.role === "supplier" ? "*" : ""}
                </label>
                <textarea
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required={formData.role === "supplier"}
                  placeholder={
                    formData.role === "supplier"
                      ? "Enter your business address (used for location-based searches)"
                      : "Enter your address (optional)"
                  }
                  disabled={loading}
                  rows="3"
                />
                {formData.role === "supplier" && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      marginTop: "4px",
                    }}
                  >
                    📍 This helps customers find suppliers near them
                  </p>
                )}
              </div>
            </>
          )}

          {/* Common fields */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontWeight: "500",
                color: "var(--text-primary)",
              }}
            >
              Email Address *
            </label>
            <input
              type="email"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                fontSize: "14px",
              }}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div
            style={{
              display: isLogin ? "block" : "grid",
              gridTemplateColumns: isLogin ? "1fr" : "1fr 1fr",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                }}
              >
                Password *
              </label>
              <input
                type="password"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="Enter your password"
                disabled={loading}
                minLength={isLogin ? undefined : 6}
              />
            </div>

            {!isLogin && (
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "500",
                    color: "var(--text-primary)",
                  }}
                >
                  Confirm Password *
                </label>
                <input
                  type="password"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  placeholder="Confirm your password"
                  disabled={loading}
                  minLength={6}
                />
              </div>
            )}
          </div>

          {!isLogin && (
            <div
              style={{
                background: "var(--bg-light)",
                padding: "15px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "13px",
                color: "var(--text-secondary)",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px 0",
                  fontWeight: "500",
                  color: "var(--text-primary)",
                }}
              >
                📋 Account Requirements:
              </p>
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li>Password must be at least 6 characters</li>
                <li>Valid email address required</li>
                {formData.role === "supplier" && (
                  <>
                    <li>Business name and address required for suppliers</li>
                    <li>Address used for location-based customer searches</li>
                  </>
                )}
              </ul>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading}
          >
            {loading
              ? isLogin
                ? "Signing In..."
                : "Creating Account..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <div
          style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}
        >
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            style={{
              color: "var(--primary-color)",
              cursor: "pointer",
              fontWeight: "500",
            }}
            onClick={toggleMode}
          >
            {isLogin ? "Register here" : "Sign in here"}
          </span>
        </div>

        {!isLogin && (
          <div
            style={{
              textAlign: "center",
              marginTop: "15px",
              fontSize: "12px",
              color: "var(--text-secondary)",
              lineHeight: "1.4",
            }}
          >
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </div>
        )}
      </div>
    </div>
  );
};
