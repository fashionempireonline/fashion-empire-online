let db = window.db;
let collection = window.collection;
let getDocs = window.getDocs;

let cart = [];

/* =========================
FIREBASE PRODUCTS LOAD
========================= */

async function loadFirebaseProducts() {
    try {
        const querySnapshot = await getDocs(
            collection(db, "products")
        );

        let container = document.getElementById("products");
        container.innerHTML = "";

        querySnapshot.forEach((doc) => {
            let product = doc.data();

            container.innerHTML += `
                <div class="card" data-category="${product.category || 'all'}">

                    <div class="image">
                        <img src="${product.image1 || ''}" alt="${product.title || ''}">
                    </div>

                    <div class="info">
                        <h3>${product.title || 'Product'}</h3>
                        <p>${product.discount || ''}</p>

                        <div class="price">
                            <span class="new">
                                ₹${product.price || 0}
                            </span>

                            <span class="old">
                                ₹${product.oldprice || ""}
                            </span>
                        </div>

                        <div class="rating">
                            ⭐ 4.8
                        </div>

                        <div class="card-buttons">

                            <button class="cart-btn"
                                onclick="addToCart('${product.title}', ${product.price || 0})">
                                Add To Cart
                            </button>

                            <button class="view-btn"
                                onclick="viewProduct(
                                    '${product.title || ''}',
                                    ${product.price || 0},
                                    '${product.image1 || ''}',
                                    '${product.image2 || ''}',
                                    '${product.image3 || ''}',
                                    '${product.image4 || ''}',
                                    '${product.image5 || ''}',
                                    '${product.description || ''}'
                                )">
                                View
                            </button>

                        </div>

                        <button class="whatsapp-btn"
                            onclick="orderWhatsApp('${product.title || ''}')">
                            Order On WhatsApp
                        </button>

                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.log("Firebase Load Error:", error);
    }
}

loadFirebaseProducts();


/* =========================
SEARCH
========================= */

window.searchProducts = function () {
    let input = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    let cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        let title = card
            .querySelector("h3")
            .innerText
            .toLowerCase();

        if (title.includes(input)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
};


/* =========================
CATEGORY FILTER
========================= */

window.filterCategory = function (category) {
    document.getElementById("searchInput").value = "";

    let cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        if (category === "all") {
            card.style.display = "block";
            return;
        }

        if (card.dataset.category === category) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }
    });
};


/* =========================
ADD TO CART
========================= */

window.addToCart = function (name, price) {
    cart.push({ name, price });

    renderCart();
    openCart();
};


/* =========================
RENDER CART
========================= */

function renderCart() {
    let cartItems = document.getElementById("cart-items");
    cartItems.innerHTML = "";

    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty</p>";
        return;
    }

    cart.forEach((item, index) => {
        cartItems.innerHTML += `
            <div class="cart-item">

                <div>
                    <h3>${item.name}</h3>
                    <p>₹${item.price}</p>
                </div>

                <button class="remove-btn"
                    onclick="removeItem(${index})">
                    Remove
                </button>

            </div>
        `;
    });
}


/* =========================
REMOVE ITEM
========================= */

window.removeItem = function (index) {
    cart.splice(index, 1);
    renderCart();
};


/* =========================
OPEN CART
========================= */

window.openCart = function () {
    document
        .getElementById("cartPopup")
        .classList.add("active");
};


/* =========================
CLOSE CART
========================= */

window.closeCart = function () {
    document
        .getElementById("cartPopup")
        .classList.remove("active");
};


/* =========================
WHATSAPP ORDER
========================= */

window.orderWhatsApp = function (product) {
    let phone = "919174709695";

    let message = `Hello, I want to order ${product}`;

    window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
    );
};


/* =========================
PRODUCT VIEW POPUP
========================= */

window.viewProduct = function (
    product,
    price,
    image1,
    image2,
    image3,
    image4,
    image5,
    description
) {
    let modal = document.createElement("div");
    modal.classList.add("product-modal");

    modal.innerHTML = `
        <div class="product-modal-overlay">

            <div class="modal-content">

                <span class="close-modal"
                    onclick="closeModal()">
                    &times;
                </span>

                <div class="gallery">

                    <img src="${image1}" class="main-popup-image">

                    <div class="gallery-row">
                        <img src="${image1}">
                        <img src="${image2}">
                        <img src="${image3}">
                        <img src="${image4}">
                        <img src="${image5}">
                    </div>

                </div>

                <h2>${product}</h2>

                <p class="modal-price">
                    ₹${price}
                </p>

                <p class="modal-description">
                    ${description}
                </p>

                <button class="modal-cart-btn"
                    onclick="addToCart('${product}', ${price})">
                    Add To Cart
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
};


/* =========================
CLOSE MODAL
========================= */

window.closeModal = function () {
    let modal = document.querySelector(".product-modal");

    if (modal) {
        modal.remove();
    }
};
