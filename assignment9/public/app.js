
const loginPanel = document.getElementById("loginPanel");
const appPanel = document.getElementById("appPanel");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const itemsMessage = document.getElementById("itemsMessage");
const createMessage = document.getElementById("createMessage");
const itemsList = document.getElementById("itemsList");
const createForm = document.getElementById("createForm");

let token = sessionStorage.getItem("campuseats_token") || "";
let currentUser = JSON.parse(
  sessionStorage.getItem("campuseats_user") || "null"
);

// API helper function
async function api(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
}

// Show application after successful login
function showSignedIn() {
  loginPanel.classList.add("hidden");
  appPanel.classList.remove("hidden");

  document.getElementById("userInfo").textContent =
    `${currentUser.name} | Role: ${currentUser.role}`;

  // Only restaurant/admin can see create form
  createForm.classList.toggle(
    "hidden",
    !["restaurant", "admin"].includes(currentUser.role)
  );

  loadItems();
}

// Logout function
function showSignedOut() {
  token = "";
  currentUser = null;

  sessionStorage.removeItem("campuseats_token");
  sessionStorage.removeItem("campuseats_user");

  appPanel.classList.add("hidden");
  loginPanel.classList.remove("hidden");

  itemsList.innerHTML = "";
}

// Load menu items from protected API
async function loadItems() {
  itemsMessage.textContent = "Loading items...";

  try {
    const result = await api("/items");

    itemsList.innerHTML = "";

    result.items.forEach((item) => {
      const card = document.createElement("article");
      card.className = "item";

      const name = document.createElement("h3");
      name.textContent = item.name;

      const price = document.createElement("p");
      price.className = "price";
      price.textContent = `₹${item.price}`;

      const status = document.createElement("span");
      status.className = `status${item.available ? "" : " off"}`;
      status.textContent = item.available
        ? "AVAILABLE"
        : "NOT AVAILABLE";

      card.append(name, price, status);
      itemsList.append(card);
    });

    itemsMessage.textContent =
      `Loaded ${result.items.length} items.`;

  } catch (error) {
    itemsMessage.textContent = error.message;

    if (/token/i.test(error.message)) {
      showSignedOut();
    }
  }
}

// Login form
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  loginMessage.textContent = "Signing in...";

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    // Store JWT token and user information
    token = data.token;
    currentUser = data.user;

    sessionStorage.setItem("campuseats_token", token);
    sessionStorage.setItem(
      "campuseats_user",
      JSON.stringify(currentUser)
    );

    loginMessage.textContent = "";

    showSignedIn();

  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

// Logout button
document
  .getElementById("logoutButton")
  .addEventListener("click", showSignedOut);

// Refresh menu items
document
  .getElementById("refreshButton")
  .addEventListener("click", loadItems);

// Create new menu item
createForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  createMessage.textContent = "Creating item...";

  try {
    const result = await api("/items", {
      method: "POST",

      body: JSON.stringify({
        name: document.getElementById("itemName").value,
        price: Number(
          document.getElementById("itemPrice").value
        ),
        available: document.getElementById("itemAvailable").checked
      })
    });

    createMessage.textContent =
      `Created "${result.item.name}" successfully.`;

    createForm.reset();

    document.getElementById("itemAvailable").checked = true;

    await loadItems();

  } catch (error) {
    createMessage.textContent = error.message;
  }
});

// Restore login session when page reloads
if (token && currentUser) {
  showSignedIn();
}
