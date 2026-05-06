/* ==========================================================================
   dynamic_ui.js — DOM Manipulation & Dynamic UI Behaviors
   Cooking & Recipe Website | COM209 – Internet Technology
   Author : Mahmoud Gad
   Note   : Must be loaded AFTER main.js on every page.
            Depends on utility functions from window.CookingApp.

   Sections:
     1.  Core Show / Hide / Toggle
     2.  View Mode Switcher        (recipes.html)
     3.  Filter Panel Toggle       (recipes.html)
     4.  Live Search Filter        (recipes.html)
     5.  Tabs                      (recipe-details.html, auth.html, blog.html)
     6.  Review Form Toggle        (recipe-details.html)
     7.  Ingredient Checkboxes     (recipe-details.html)
     8.  Dynamic Ingredient Rows   (submit-recipe.html)
     9.  Dynamic Step Rows         (submit-recipe.html)
     10. Character Counter         (submit-recipe.html, contact.html)
     11. Admin Table Search        (admin.html)
     12. Admin Panel Switcher      (admin.html)
     13. Accordion                 (contact.html)
     14. Live Chat Toggle          (contact.html)
     15. Cart Logic                (grocery.html)
     16. Meal Planner              (planner.html)
     17. Auto-Init on DOMReady
   ========================================================================== */


/* ==========================================================================
   1. CORE — Show / Hide / Toggle
   ========================================================================== */

/**
 * Show an element by removing the "hidden" class.
 * @param {string|Element} target — CSS selector or DOM element
 */
function showElement(target) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (el) el.classList.remove("hidden");
}

/**
 * Hide an element by adding the "hidden" class.
 * @param {string|Element} target — CSS selector or DOM element
 */
function hideElement(target) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (el) el.classList.add("hidden");
}

/**
 * Toggle the "hidden" class on an element.
 * @param {string|Element} target — CSS selector or DOM element
 */
function toggleElement(target) {
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (el) el.classList.toggle("hidden");
}


/* ==========================================================================
   2. VIEW MODE SWITCHER — recipes.html
   Switches between List View / Grid View / Details View.
   ========================================================================== */

/**
 * Switch the results container between list-view, grid-view, details-view.
 * @param {string} mode — "list" | "grid" | "details"
 */
function switchView(mode) {
  const container = document.querySelector(".results-container");
  const buttons = document.querySelectorAll(".view-btn");
  if (!container) return;

  // Remove all view classes, add the selected one
  container.classList.remove("list-view", "grid-view", "details-view");
  container.classList.add(`${mode}-view`);

  // Update active state on the switcher buttons
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === mode);
  });

  // Persist preference so the page remembers it on reload
  localStorage.setItem("preferredView", mode);
}

function initViewSwitcher() {
  const buttons = document.querySelectorAll(".view-btn");
  if (!buttons.length) return;

  // Apply saved preference on load (default: grid)
  const saved = localStorage.getItem("preferredView") || "grid";
  switchView(saved);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });
}


/* ==========================================================================
   3. FILTER PANEL TOGGLE — recipes.html
   Show / hide the advanced filter sidebar when the filter button is clicked.
   ========================================================================== */

function initFilterPanel() {
  const filterBtn = document.querySelector(".filter-toggle-btn");
  const filterPanel = document.querySelector(".filter-panel");
  if (!filterBtn || !filterPanel) return;

  filterBtn.addEventListener("click", () => {
    const isOpen = filterPanel.classList.toggle("hidden");
    filterBtn.setAttribute("aria-expanded", !isOpen);
  });
}


/* ==========================================================================
   4. LIVE SEARCH FILTER — recipes.html
   Filters recipe cards in real time as the user types in the search bar.
   Uses debounce() from main.js to avoid firing on every keystroke.
   ========================================================================== */

function initLiveSearch() {
  const searchInput = document.querySelector(".search-input");
  const cards = document.querySelectorAll(".recipe-card");
  const noResults = document.querySelector(".no-results");
  if (!searchInput || !cards.length) return;

  const filter = window.CookingApp.debounce((query) => {
    const q = query.toLowerCase().trim();
    let visibleCount = 0;

    cards.forEach((card) => {
      const title = card.querySelector(".card__title")?.textContent.toLowerCase() || "";
      const cuisine = card.dataset.cuisine?.toLowerCase() || "";
      const matches = title.includes(q) || cuisine.includes(q);

      card.classList.toggle("hidden", !matches);
      if (matches) visibleCount++;
    });

    // Show "no results" message if nothing matched
    if (noResults) noResults.classList.toggle("hidden", visibleCount > 0);
  }, 300);

  searchInput.addEventListener("input", (e) => filter(e.target.value));
}


/* ==========================================================================
   5. TABS — recipe-details.html / auth.html / blog.html
   Clicking a tab shows its panel and hides all others.
   ========================================================================== */

/**
 * Initialize all tab groups on the page.
 * Expects .tabs-group > .tab-btn[data-tab] and .tab-panel[data-tab] siblings.
 */
function initTabs() {
  const tabGroups = document.querySelectorAll(".tabs-group");

  tabGroups.forEach((group) => {
    const buttons = group.querySelectorAll(".tab-btn");
    // Panels live outside the group — find by data-tab in the closest parent section
    const parent = group.closest("section") || group.parentElement;
    const panels = parent ? parent.querySelectorAll(".tab-panel") : [];

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;

        // Update button active states
        buttons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Show matching panel, hide others
        panels.forEach((panel) => {
          panel.classList.toggle("active", panel.dataset.tab === target);
        });
      });
    });

    // Activate the first tab by default if none is active
    if (!group.querySelector(".tab-btn.active")) {
      buttons[0]?.click();
    }
  });
}


/* ==========================================================================
   6. REVIEW FORM TOGGLE — recipe-details.html
   Show / hide the "Leave a Review" form when the button is clicked.
   ========================================================================== */

function initReviewFormToggle() {
  const toggleBtn = document.querySelector(".toggle-review-btn");
  const reviewForm = document.querySelector(".review-form");
  if (!toggleBtn || !reviewForm) return;

  toggleBtn.addEventListener("click", () => {
    const isHidden = reviewForm.classList.toggle("hidden");
    toggleBtn.textContent = isHidden ? "Leave a Review" : "Cancel";

    // Scroll to the form when it opens
    if (!isHidden) {
      reviewForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}


/* ==========================================================================
   7. INGREDIENT CHECKBOXES — recipe-details.html
   Clicking a checkbox strikes through the ingredient row.
   ========================================================================== */

function initIngredientCheckboxes() {
  const ingredientList = document.querySelector(".ingredients-list");
  if (!ingredientList) return;

  ingredientList.addEventListener("change", (e) => {
    if (e.target.type !== "checkbox") return;
    const row = e.target.closest(".ingredient-item");
    if (row) row.classList.toggle("checked", e.target.checked);
  });
}


/* ==========================================================================
   8. DYNAMIC INGREDIENT ROWS — submit-recipe.html
   Add / remove ingredient input rows dynamically.
   ========================================================================== */

function initDynamicIngredients() {
  const addBtn = document.querySelector(".add-ingredient-btn");
  const container = document.querySelector(".ingredients-container");
  if (!addBtn || !container) return;

  let rowIndex = container.querySelectorAll(".ingredient-row").length;

  addBtn.addEventListener("click", () => {
    rowIndex++;
    const row = document.createElement("div");
    row.className = "ingredient-row";
    row.style.animation = "fadeSlideIn 0.2s ease";
    row.innerHTML = `
      <input type="number" class="form-control" name="qty-${rowIndex}"
             placeholder="Qty" min="0" step="0.1" style="width:80px;">
      <select class="form-control" name="unit-${rowIndex}" style="width:110px;">
        <option value="cups">cups</option>
        <option value="grams">grams</option>
        <option value="tbsp">tbsp</option>
        <option value="tsp">tsp</option>
        <option value="ml">ml</option>
        <option value="oz">oz</option>
        <option value="pcs">pcs</option>
      </select>
      <input type="text" class="form-control" name="ingredient-${rowIndex}"
             placeholder="Ingredient name" style="flex:1;">
      <button type="button" class="btn btn-danger btn-sm remove-ingredient-btn"
              aria-label="Remove ingredient">✕</button>
    `;
    container.appendChild(row);
  });

  // Event delegation — handles all remove buttons including future ones
  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-ingredient-btn")) {
      const row = e.target.closest(".ingredient-row");
      if (row && container.querySelectorAll(".ingredient-row").length > 1) {
        row.remove();
      }
    }
  });
}


/* ==========================================================================
   9. DYNAMIC STEP ROWS — submit-recipe.html
   Add / remove numbered instruction steps dynamically.
   ========================================================================== */

function initDynamicSteps() {
  const addBtn = document.querySelector(".add-step-btn");
  const container = document.querySelector(".steps-container");
  if (!addBtn || !container) return;

  function updateStepNumbers() {
    container.querySelectorAll(".step-row").forEach((row, i) => {
      const label = row.querySelector(".step-number");
      if (label) label.textContent = `Step ${i + 1}`;
    });
  }

  addBtn.addEventListener("click", () => {
    const stepCount = container.querySelectorAll(".step-row").length + 1;
    const row = document.createElement("div");
    row.className = "step-row";
    row.style.animation = "fadeSlideIn 0.2s ease";
    row.innerHTML = `
      <span class="step-number font-bold text-primary">Step ${stepCount}</span>
      <textarea class="form-control" name="step-${stepCount}" rows="2"
                placeholder="Describe this step..."></textarea>
      <button type="button" class="btn btn-danger btn-sm remove-step-btn"
              aria-label="Remove step">✕</button>
    `;
    container.appendChild(row);
  });

  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-step-btn")) {
      const row = e.target.closest(".step-row");
      if (row && container.querySelectorAll(".step-row").length > 1) {
        row.remove();
        updateStepNumbers();
      }
    }
  });
}


/* ==========================================================================
   10. CHARACTER COUNTER — submit-recipe.html / contact.html
   Shows live character count below any textarea with data-max-chars.
   ========================================================================== */

function initCharCounters() {
  document.querySelectorAll("[data-max-chars]").forEach((textarea) => {
    const max = parseInt(textarea.dataset.maxChars, 10);
    const counter = document.createElement("span");
    counter.className = "char-counter";
    textarea.after(counter);

    function update() {
      const remaining = max - textarea.value.length;
      counter.textContent = `${textarea.value.length} / ${max}`;
      counter.classList.remove("near-limit", "at-limit");
      if (remaining <= 0) counter.classList.add("at-limit");
      else if (remaining <= max * 0.1) counter.classList.add("near-limit");

      // Enforce max length
      if (textarea.value.length > max) {
        textarea.value = textarea.value.slice(0, max);
      }
    }

    textarea.addEventListener("input", update);
    update(); // Initialize on load
  });
}


/* ==========================================================================
   11. ADMIN TABLE SEARCH — admin.html
   Filters table rows live as the user types in the search input above a table.
   ========================================================================== */

function initAdminTableSearch() {
  document.querySelectorAll(".table-search-input").forEach((input) => {
    const tableId = input.dataset.table;
    const table = document.querySelector(`#${tableId}`);
    if (!table) return;

    const filter = window.CookingApp.debounce((query) => {
      const q = query.toLowerCase().trim();
      table.querySelectorAll("tbody tr").forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.classList.toggle("hidden", !text.includes(q));
      });
    }, 250);

    input.addEventListener("input", (e) => filter(e.target.value));
  });
}


/* ==========================================================================
   12. ADMIN PANEL SWITCHER — admin.html
   Clicking a sidebar link shows the corresponding panel and hides others.
   ========================================================================== */

function initAdminPanels() {
  const sidebarLinks = document.querySelectorAll(".admin-nav-link");
  const panels = document.querySelectorAll(".admin-panel");
  if (!sidebarLinks.length || !panels.length) return;

  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.dataset.panel;

      // Update active sidebar link
      sidebarLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Show matching panel, hide others
      panels.forEach((panel) => {
        panel.classList.toggle("hidden", panel.id !== target);
      });
    });
  });

  // Activate the first link by default
  sidebarLinks[0]?.click();
}


/* ==========================================================================
   13. ACCORDION — contact.html
   Clicking a question header toggles its answer open/closed.
   ========================================================================== */

function initAccordion() {
  const items = document.querySelectorAll(".accordion__item");
  if (!items.length) return;

  items.forEach((item) => {
    const header = item.querySelector(".accordion__header");
    const body = item.querySelector(".accordion__body");
    if (!header || !body) return;

    header.addEventListener("click", () => {
      const isOpen = item.classList.toggle("open");
      body.classList.toggle("open", isOpen);
      header.setAttribute("aria-expanded", isOpen);
    });
  });
}


/* ==========================================================================
   14. LIVE CHAT TOGGLE — contact.html
   Opens / closes the mock floating chat panel.
   ========================================================================== */

function initLiveChat() {
  const chatBtn = document.querySelector(".live-chat-btn");
  const chatPanel = document.querySelector(".chat-panel");
  if (!chatBtn || !chatPanel) return;

  chatBtn.addEventListener("click", () => {
    const isOpen = chatPanel.classList.toggle("hidden");
    chatBtn.setAttribute("aria-expanded", !isOpen);
    chatBtn.setAttribute("aria-label", isOpen ? "Open chat" : "Close chat");
  });

  // Close chat when close button inside panel is clicked
  const closeBtn = chatPanel.querySelector(".chat-panel__close");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      chatPanel.classList.add("hidden");
      chatBtn.setAttribute("aria-expanded", false);
    });
  }
}


/* ==========================================================================
   15. CART LOGIC — grocery.html
   Add / remove items, update badge count and sidebar in real time.
   ========================================================================== */

const cart = {}; // { productId: { name, price, image, qty } }

function initGroceryCart() {
  const productGrid = document.querySelector(".product-grid");
  const cartSidebar = document.querySelector(".cart-sidebar");
  const cartBadge = document.querySelector(".cart-badge");
  const cartList = document.querySelector(".cart-list");
  const cartSubtotal = document.querySelector(".cart-subtotal");
  const emptyMsg = document.querySelector(".cart-empty-msg");
  const cartToggleBtn = document.querySelector(".cart-toggle-btn");

  if (!productGrid) return;

  // --- Open / close cart sidebar ---
  if (cartToggleBtn && cartSidebar) {
    cartToggleBtn.addEventListener("click", () => {
      cartSidebar.classList.toggle("cart-open");
    });
  }

  // --- Add to cart ---
  productGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart-btn")) {
      const card = e.target.closest(".product-card");
      if (!card) return;

      const id = card.dataset.productId;
      const name = card.querySelector(".product-name")?.textContent || "";
      const price = parseFloat(card.dataset.price) || 0;
      const image = card.querySelector(".product-img")?.src || "";

      if (cart[id]) {
        cart[id].qty++;
      } else {
        cart[id] = { name, price, image, qty: 1 };
      }

      renderCart(cartList, cartBadge, cartSubtotal, emptyMsg);
    }
  });

  // --- Quantity stepper on product cards ---
  productGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".product-card");
    if (!card) return;
    const id = card.dataset.productId;

    if (e.target.classList.contains("qty-increase-btn")) {
      if (cart[id]) { cart[id].qty++; renderCart(cartList, cartBadge, cartSubtotal, emptyMsg); }
    }

    if (e.target.classList.contains("qty-decrease-btn")) {
      if (cart[id] && cart[id].qty > 1) { cart[id].qty--; renderCart(cartList, cartBadge, cartSubtotal, emptyMsg); }
    }
  });

  // --- Remove from cart (event delegation on sidebar) ---
  if (cartList) {
    cartList.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-cart-btn")) {
        const id = e.target.dataset.productId;
        delete cart[id];
        renderCart(cartList, cartBadge, cartSubtotal, emptyMsg);
      }
    });
  }

  // --- Category filter tabs ---
  const filterTabs = document.querySelectorAll(".category-tab");
  const productCards = document.querySelectorAll(".product-card");

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      filterTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const category = tab.dataset.category;
      productCards.forEach((card) => {
        const matches = category === "all" || card.dataset.category === category;
        card.classList.toggle("hidden", !matches);
      });
    });
  });
}

function renderCart(cartList, cartBadge, cartSubtotal, emptyMsg) {
  if (!cartList) return;

  const items = Object.entries(cart);

  // Badge count
  const totalQty = items.reduce((sum, [, item]) => sum + item.qty, 0);
  if (cartBadge) cartBadge.textContent = totalQty;

  // Empty state
  if (emptyMsg) emptyMsg.classList.toggle("hidden", items.length > 0);

  // Build cart list HTML
  cartList.innerHTML = items.map(([id, item]) => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" class="cart-item__img">
      <div class="cart-item__info">
        <p class="cart-item__name">${item.name}</p>
        <p class="cart-item__price">${item.qty} × ${item.price.toFixed(2)} EGP</p>
      </div>
      <button class="btn btn-danger btn-sm remove-cart-btn" data-product-id="${id}">✕</button>
    </div>
  `).join("");

  // Subtotal
  const subtotal = items.reduce((sum, [, item]) => sum + item.price * item.qty, 0);
  if (cartSubtotal) cartSubtotal.textContent = `${subtotal.toFixed(2)} EGP`;
}


/* ==========================================================================
   16. MEAL PLANNER — planner.html
   Add / remove meals from table cells, random fill, clear week.
   ========================================================================== */

// Sample recipe pool for Random Plan button
const RECIPE_POOL = [
  { name: "Koshari",   img: "assets/images/recipe-koshari.jpg",   cal: 420 },
  { name: "Pasta",     img: "assets/images/recipe-pasta.jpg",     cal: 510 },
  { name: "Salad",     img: "assets/images/recipe-salad.jpg",     cal: 210 },
  { name: "Burger",    img: "assets/images/recipe-burger.jpg",    cal: 680 },
  { name: "Soup",      img: "assets/images/recipe-soup.jpg",      cal: 290 },
  { name: "Pancakes",  img: "assets/images/recipe-pancakes.jpg",  cal: 390 },
  { name: "Pizza",     img: "assets/images/recipe-pizza.jpg",     cal: 620 },
  { name: "Steak",     img: "assets/images/recipe-steak.jpg",     cal: 750 },
];

function initMealPlanner() {
  const plannerTable = document.querySelector(".planner-table");
  const clearBtn = document.querySelector(".clear-week-btn");
  const randomBtn = document.querySelector(".random-plan-btn");
  if (!plannerTable) return;

  // --- Add meal: clicking "+" in an empty cell ---
  plannerTable.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-meal-btn")) {
      const cell = e.target.closest("td");
      if (!cell) return;
      const recipe = RECIPE_POOL[window.CookingApp.getRandomInt(0, RECIPE_POOL.length - 1)];
      fillCell(cell, recipe);
      updateCalorieSummary(plannerTable);
    }

    // --- Remove meal: clicking "×" on a filled cell ---
    if (e.target.classList.contains("remove-meal-btn")) {
      const cell = e.target.closest("td");
      if (cell) {
        clearCell(cell);
        updateCalorieSummary(plannerTable);
      }
    }
  });

  // --- Clear Week button ---
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      plannerTable.querySelectorAll("td.meal-cell").forEach(clearCell);
      updateCalorieSummary(plannerTable);
    });
  }

  // --- Random Plan button ---
  if (randomBtn) {
    randomBtn.addEventListener("click", () => {
      plannerTable.querySelectorAll("td.meal-cell").forEach((cell) => {
        const recipe = RECIPE_POOL[window.CookingApp.getRandomInt(0, RECIPE_POOL.length - 1)];
        fillCell(cell, recipe);
      });
      updateCalorieSummary(plannerTable);
    });
  }
}

function fillCell(cell, recipe) {
  cell.innerHTML = `
    <div class="card card--mini">
      <img src="${recipe.img}" alt="${recipe.name}" class="card__img">
      <div class="card__body">
        <p class="card__title">${recipe.name}</p>
        <small class="text-muted">${recipe.cal} kcal</small>
      </div>
    </div>
    <button class="btn btn-danger btn-sm remove-meal-btn" aria-label="Remove meal">✕</button>
  `;
  cell.dataset.calories = recipe.cal;
}

function clearCell(cell) {
  cell.innerHTML = `<button class="btn btn-outline btn-sm add-meal-btn" aria-label="Add meal">+</button>`;
  delete cell.dataset.calories;
}

function updateCalorieSummary(table) {
  // Calculate total calories per day column (1–7)
  const summaryRows = document.querySelectorAll(".day-calorie-total");
  if (!summaryRows.length) return;

  const headerCells = table.querySelectorAll("thead th");
  headerCells.forEach((_, colIndex) => {
    if (colIndex === 0) return; // skip row-label column
    const cells = table.querySelectorAll(`tbody tr td:nth-child(${colIndex + 1}).meal-cell`);
    const total = Array.from(cells).reduce((sum, cell) => {
      return sum + (parseInt(cell.dataset.calories, 10) || 0);
    }, 0);

    if (summaryRows[colIndex - 1]) {
      summaryRows[colIndex - 1].textContent = total > 0 ? `${total} kcal` : "—";
    }
  });
}


/* ==========================================================================
   17. AUTO-INIT — runs after DOMContentLoaded
   Each function checks for its required elements before running,
   so it's safe to call all of them on every page.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Universal
  initTabs();
  initAccordion();
  initCharCounters();

  // recipes.html
  initViewSwitcher();
  initFilterPanel();
  initLiveSearch();

  // recipe-details.html
  initReviewFormToggle();
  initIngredientCheckboxes();

  // submit-recipe.html
  initDynamicIngredients();
  initDynamicSteps();

  // admin.html
  initAdminTableSearch();
  initAdminPanels();

  // contact.html
  initLiveChat();

  // grocery.html
  initGroceryCart();

  // planner.html
  initMealPlanner();
});


/* ==========================================================================
   EXPOSE — make functions available globally for inline HTML use if needed
   ========================================================================== */

window.DynamicUI = {
  showElement,
  hideElement,
  toggleElement,
  switchView,
  fillCell,
  clearCell,
};
