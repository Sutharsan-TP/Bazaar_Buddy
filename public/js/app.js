// Main App Component
const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Check if user is logged in on app load
  useEffect(() => {
    const savedUser = localStorage.getItem("bazaar_buddy_user");
    const savedToken = localStorage.getItem("bazaar_buddy_token");
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
  }, []);

  // Load cart from backend when user logs in (only for stall owners)
  useEffect(() => {
    const loadCart = async () => {
      if (!token || user?.role !== "stall_owner") return;

      setCartLoading(true);
      try {
        const cartData = await apiService.getCart(token);
        setCart(cartData.items || []);
      } catch (err) {
        console.error("Failed to load cart:", err);
      } finally {
        setCartLoading(false);
      }
    };

    loadCart();
  }, [token, user]);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: "", type: "success" });
  };

  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem("bazaar_buddy_user", JSON.stringify(userData));
    localStorage.setItem("bazaar_buddy_token", userToken);

    // Set appropriate default tab based on role
    if (userData.role === "supplier") {
      setActiveTab("products");
    } else {
      setActiveTab("products");
    }

    showNotification(`Welcome back, ${userData.name}!`);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCart([]);
    localStorage.removeItem("bazaar_buddy_user");
    localStorage.removeItem("bazaar_buddy_token");
    setActiveTab("products");
    setSearchTerm("");
    setProducts([]);
    setSuppliers([]);
    setOrders([]);
    setIsCartOpen(false);
    showNotification("Logged out successfully");
  };

  // Stall Owner Functions
  const handleAddToCart = async () => {
    try {
      const cartData = await apiService.getCart(token);
      setCart(cartData.items || []);
      showNotification("Item added to cart!");
    } catch (err) {
      console.error("Failed to refresh cart:", err);
      showNotification("Failed to update cart", "error");
    }
  };

  const handleUpdateCartQuantity = async (productId, newQuantity) => {
    if (!token) return;

    try {
      await apiService.updateCartQuantity(productId, newQuantity, token);
      const cartData = await apiService.getCart(token);
      setCart(cartData.items || []);
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to update cart",
        "error"
      );
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!token) return;

    try {
      await apiService.updateCartQuantity(productId, 0, token);
      const cartData = await apiService.getCart(token);
      setCart(cartData.items || []);
      showNotification("Item removed from cart");
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to remove item",
        "error"
      );
    }
  };

  const handleCheckout = async () => {
    if (!token || cart.length === 0) return;

    try {
      const orderData = {
        supplier: cart[0].product.supplier._id || cart[0].product.supplier,
        items: cart.map((item) => ({
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          unit: item.product.unit,
          subtotal: item.product.price * item.quantity,
        })),
        subtotal: cart.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
        totalAmount: cart.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
        deliveryAddress: {
          street: "Sample Address",
          area: "Sample Area",
          city: "Sample City",
          pincode: "123456",
        },
      };

      await apiService.createOrder(orderData, token);
      showNotification("Order placed successfully!");
      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to place order",
        "error"
      );
    }
  };

  // Supplier Functions
  const handleAddProduct = async (productData) => {
    if (!token) return;

    try {
      await apiService.addProduct(productData, token);
      // Refresh products list
      const data = await apiService.getMyProducts(token);
      setProducts(data || []); // Backend returns array directly
      showNotification("Product added successfully!");
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to add product",
        "error"
      );
    }
  };

  const handleEditProduct = async (productId, productData) => {
    if (!token) return;

    try {
      await apiService.updateProduct(productId, productData, token);
      // Refresh products list
      const data = await apiService.getMyProducts(token);
      setProducts(data || []); // Backend returns array directly
      showNotification("Product updated successfully!");
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to update product",
        "error"
      );
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!token) return;

    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await apiService.deleteProduct(productId, token);
      // Refresh products list
      const data = await apiService.getMyProducts(token);
      setProducts(data || []); // Backend returns array directly
      showNotification("Product deleted successfully!");
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to delete product",
        "error"
      );
    }
  };

  // Order Management Functions
  const handleStatusUpdate = async (orderId, newStatus, notes) => {
    if (!token) return;

    try {
      await apiService.updateOrderStatus(orderId, newStatus, notes, token);
      // Refresh orders list
      const data = await apiService.getOrders(token);
      setOrders(data.orders || []);
      showNotification(
        `Order status updated to ${newStatus.replace("_", " ")}`
      );
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to update order status",
        "error"
      );
    }
  };

  const handleRateSupplier = async (ratingData) => {
    if (!token) return;

    try {
      await apiService.submitRating(ratingData, token);
      showNotification("Rating submitted successfully!");

      // Refresh suppliers to show updated ratings
      await fetchSuppliers(searchTerm, { sortBy: "rating" });
    } catch (err) {
      showNotification(
        err.response?.data?.message || "Failed to submit rating",
        "error"
      );
    }
  };

  // Supplier fetching
  const fetchSuppliers = async (searchTerm = "", options = {}) => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        page: 1,
        limit: 20,
        sortBy: options.sortBy || "rating", // Default to rating
        ...options,
      };

      console.log("Fetching suppliers with params:", params);
      const data = await apiService.getSuppliers(params);
      setSuppliers(data.suppliers || []);
      console.log(
        `Loaded ${data.suppliers?.length || 0} suppliers, sorted by: ${
          params.sortBy
        }`
      );
    } catch (err) {
      console.error("Failed to load suppliers:", err);
      setError(err.response?.data?.message || "Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSearch = (searchTerm, options = {}) => {
    setSearchTerm(searchTerm);
    fetchSuppliers(searchTerm, options);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Fetch data based on active tab and user role
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoading(true);
      setError("");

      try {
        if (user.role === "supplier") {
          // Supplier-specific data fetching
          if (activeTab === "products") {
            console.log("Fetching supplier products with token:", token);
            console.log("User role:", user.role);
            console.log("User ID:", user.id);
            const data = await apiService.getMyProducts(token);
            console.log("Supplier products response:", data);
            setProducts(data || []); // Backend returns array directly
          } else if (activeTab === "orders" && token) {
            const data = await apiService.getOrders(token);
            setOrders(data.orders || []);
          }
        } else {
          // Stall owner data fetching
          if (activeTab === "products") {
            const params = searchTerm ? { search: searchTerm } : {};
            const data = await apiService.getProducts(params);
            setProducts(data.products || []);
          } else if (activeTab === "suppliers") {
            // Use supplier fetching
            fetchSuppliers(searchTerm);
          } else if (activeTab === "orders" && token) {
            const data = await apiService.getOrders(token);
            setOrders(data.orders || []);
          }
        }
      } catch (err) {
        if (activeTab !== "suppliers") {
          // Don't duplicate error for suppliers tab
          setError(err.response?.data?.message || "Failed to load data");
        }
      } finally {
        if (activeTab !== "suppliers") {
          // Don't interfere with suppliers loading state
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [activeTab, searchTerm, user, token]);

  // Show login page if user is not logged in
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Render different UI based on user role
  return (
    <div>
      <Header
        user={user}
        onSearch={setSearchTerm}
        onLogout={handleLogout}
        cartItemCount={cartItemCount}
        onCartToggle={() => setIsCartOpen(true)}
      />

      <Notification
        message={notification.message}
        type={notification.type}
        show={notification.show}
        onClose={hideNotification}
      />

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

      <div className="container">
        {/* Navigation Tabs - Different for each role */}
        <div className="nav-tabs">
          {user.role === "supplier" ? (
            // Supplier Navigation
            <>
              <button
                className={`nav-tab ${
                  activeTab === "products" ? "active" : ""
                }`}
                onClick={() => setActiveTab("products")}
              >
                📦 My Products
              </button>
              <button
                className={`nav-tab ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                📋 Received Orders
              </button>
              <button
                className={`nav-tab ${
                  activeTab === "analytics" ? "active" : ""
                }`}
                onClick={() => setActiveTab("analytics")}
              >
                📊 Analytics
              </button>
            </>
          ) : (
            // Stall Owner Navigation
            <>
              <button
                className={`nav-tab ${
                  activeTab === "products" ? "active" : ""
                }`}
                onClick={() => setActiveTab("products")}
              >
                🛒 Browse Products
              </button>
              <button
                className={`nav-tab ${
                  activeTab === "suppliers" ? "active" : ""
                }`}
                onClick={() => setActiveTab("suppliers")}
              >
                🏪 Browse Suppliers
              </button>
              <button
                className={`nav-tab ${activeTab === "orders" ? "active" : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                📋 My Orders
              </button>
            </>
          )}
        </div>

        {/* Supplier Dashboard */}
        {user.role === "supplier" && (
          <>
            {activeTab === "products" && (
              <SupplierDashboard
                user={user}
                products={products}
                loading={loading}
                onAddProduct={handleAddProduct}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === "orders" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ marginBottom: "5px" }}>Received Orders</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Manage and fulfill customer orders
                  </p>
                </div>

                {loading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                      ⏳
                    </div>
                    <div>Loading orders...</div>
                  </div>
                ) : orders.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    {orders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        isSupplier={true}
                        onStatusUpdate={handleStatusUpdate}
                        onRateSupplier={handleRateSupplier}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon="📋"
                    title="No orders yet"
                    description="Orders from customers will appear here."
                  />
                )}
              </div>
            )}

            {activeTab === "analytics" && <AnalyticsDashboard token={token} />}
          </>
        )}

        {/* Stall Owner Dashboard */}
        {user.role === "stall_owner" && (
          <>
            {activeTab === "products" && (
              <StallOwnerDashboard
                products={products}
                suppliers={suppliers}
                orders={orders}
                loading={loading}
                onAddToCart={handleAddToCart}
                token={token}
              />
            )}

            {activeTab === "suppliers" && (
              <LocationSupplierDashboard
                suppliers={suppliers}
                loading={loading}
                searchTerm={searchTerm}
                onSearch={handleSupplierSearch}
              />
            )}

            {activeTab === "orders" && (
              <div>
                <div style={{ marginBottom: "20px" }}>
                  <h2 style={{ marginBottom: "5px" }}>My Orders</h2>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Track your order history and current deliveries
                  </p>
                </div>

                {loading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <div style={{ fontSize: "24px", marginBottom: "10px" }}>
                      ⏳
                    </div>
                    <div>Loading orders...</div>
                  </div>
                ) : orders.length > 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    {orders.map((order) => (
                      <OrderCard
                        key={order._id}
                        order={order}
                        isSupplier={false}
                        onRateSupplier={handleRateSupplier}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon="📋"
                    title="No orders yet"
                    description="Your order history will appear here once you place your first order."
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Cart Sidebar - Only show for stall owners */}
      {user.role === "stall_owner" && (
        <CartSidebar
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          onUpdateQuantity={handleUpdateCartQuantity}
          onRemoveFromCart={handleRemoveFromCart}
          onCheckout={handleCheckout}
          loading={cartLoading}
        />
      )}
    </div>
  );
};
