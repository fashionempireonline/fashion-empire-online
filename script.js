import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";


/* FIREBASE CONFIG */

const firebaseConfig = {

    apiKey: "AIzaSyBw6dKBEDGfuh-he23WHJGG-L6mRDH_lFo",

    authDomain: "fashion-empire-online.firebaseapp.com",

    projectId: "fashion-empire-online",

    storageBucket: "fashion-empire-online.firebasestorage.app",

    messagingSenderId: "270445447440",

    appId: "1:270445447440:web:17b31b34a0bbecbe87bd95"

};


/* FIREBASE START */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* GLOBAL CART */

let cart = [];

/* GLOBAL WISHLIST */

let wishlist = [];

/* PRODUCT STORAGE */

let allProducts = {};


/* AUTO DISCOUNT */

function calculateDiscount(oldPrice, price){

    if(!oldPrice || !price) return "";

    let discount =
    Math.round(
        ((oldPrice - price) / oldPrice) * 100
    );

    return `${discount}% OFF`;

}


/* FIREBASE PRODUCTS LOAD */

async function loadFirebaseProducts() {

    try {

        const querySnapshot = await getDocs(
            collection(db, "products")
        );

        let container =
        document.getElementById("products");

        container.innerHTML = "";

        querySnapshot.forEach((doc) => {

            let product = doc.data();

            allProducts[doc.id || product.title] = product;

            container.innerHTML += `

            <div class="card"
            data-category="${(product.category || 'all').toLowerCase()}">

                <div class="image">

                    <img src="${product.image1 || ''}">

                </div>

                <div class="info">

                    <h3>${product.title || 'Product'}</h3>

                    <p class="description"
                    style="display:none;">
                    ${product.description || ""}
                    </p>

                    <div class="price">

                        <span class="new">
                            ₹${product.price || 0}
                        </span>

                        <span class="old">
                            ₹${product.oldprice || ""}
                        </span>

                        <span class="discount">
                            ${calculateDiscount(product.oldprice, product.price)}
                        </span>

                    </div>

                    <div class="rating">
                        ⭐⭐⭐⭐⭐ 4.8
                    </div>

                    <div class="card-buttons">

                        <button class="cart-btn"
                        onclick="addToCart(
                        '${product.title || ''}',
                        ${product.price || 0},
                        '${product.image1 || ''}'
                        )">

                            Add To Cart

                        </button>

                        <button class="view-btn"
                        onclick="viewProductByIndex('${doc.id || product.title}')">

                            View Product

                        </button>

                    </div>

                    <button class="whatsapp-btn"
                    onclick="orderWhatsApp('${product.title || ''}')">

                        <i class="fa-brands fa-whatsapp"></i>

                        Order On WhatsApp

                    </button>

                </div>

            </div>

            `;

        });

    } catch (error) {

        console.log("Firebase Error:", error);

    }

}

loadFirebaseProducts();


/* VIEW PRODUCT */

window.viewProductByIndex = function(id){

    let product = allProducts[id];

    if(!product) return;

    viewProduct(
        product.title || "",
        product.price || 0,
        product.image1 || "",
        product.image2 || "",
        product.image3 || "",
        product.image4 || "",
        product.image5 || "",
        product.description || ""
    );

};


/* CATEGORY FILTER */

window.filterCategory = function (category) {

    category = category.toLowerCase();

    document.getElementById("searchInput").value = "";

    let cards =
    document.querySelectorAll(".card");

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


/* ADD TO CART */

window.addToCart = function (name, price, image) {

    let existing =
    cart.find(item => item.name === name);

    if(existing){

        existing.qty += 1;

    }else{

        cart.push({
            name,
            price,
            image,
            qty:1
        });

    }

    renderCart();

    openCart();

};


/* RENDER CART */

function renderCart() {

    let cartItems =
    document.getElementById("cart-items");

    cartItems.innerHTML = "";

    if (cart.length === 0) {

        cartItems.innerHTML =
        "<p>Your cart is empty</p>";

        return;

    }

    cart.forEach((item, index) => {

        cartItems.innerHTML += `

        <div class="cart-item"
        style="
        display:flex;
        gap:12px;
        margin-bottom:18px;
        align-items:center;
        background:#f7f7f7;
        padding:10px;
        border-radius:16px;
        ">

            <img
            src="${item.image}"
            style="
            width:70px;
            height:70px;
            object-fit:cover;
            border-radius:12px;
            ">

            <div style="flex:1;">

                <h4>${item.name}</h4>

                <p>₹${item.price}</p>

                <div style="
                display:flex;
                align-items:center;
                gap:8px;
                ">

                    <button
                    onclick="decreaseQty(${index})">
                    -
                    </button>

                    <span>${item.qty}</span>

                    <button
                    onclick="increaseQty(${index})">
                    +
                    </button>

                </div>

            </div>

        </div>

        `;

    });

}


/* INCREASE QTY */

window.increaseQty = function(index){

    cart[index].qty++;

    renderCart();

}


/* DECREASE QTY */

window.decreaseQty = function(index){

    if(cart[index].qty > 1){

        cart[index].qty--;

    }else{

        cart.splice(index,1);

    }

    renderCart();

}


/* LIVE SEARCH */

window.searchProducts = function () {

let search =
document.getElementById("searchInput")
.value
.toLowerCase()
.trim();

let cards =
document.querySelectorAll(".card");

cards.forEach(card => {

let title =
card.querySelector("h3")
?.innerText
.toLowerCase() || "";

let description =
card.querySelector(".description")
?.innerText
.toLowerCase() || "";

if(
title.includes(search) ||
description.includes(search)
){

card.style.display = "block";

}else{

card.style.display = "none";

}

});

}


/* REMOVE CART ITEM */

window.removeItem = function (index) {

    cart.splice(index, 1);

    renderCart();

};


/* OPEN CART */

window.openCart = function () {

    document
    .getElementById("cartPopup")
    .classList.add("active");

};


/* CLOSE CART */

window.closeCart = function () {

    document
    .getElementById("cartPopup")
    .classList.remove("active");

};


/* WISHLIST SYSTEM */

window.toggleWishlist = function(
    title,
    price,
    image
){

    let existing =
    wishlist.find(item => item.title === title);

    if(existing){

        wishlist =
        wishlist.filter(
            item => item.title !== title
        );

    } else {

        wishlist.push({
            title,
            price,
            image
        });

    }

    renderWishlist();

}


/* RENDER WISHLIST */

function renderWishlist(){

    let wishlistItems =
    document.getElementById("wishlist-items");

    if(!wishlistItems) return;

    wishlistItems.innerHTML = "";

    if(wishlist.length === 0){

        wishlistItems.innerHTML =
        "<p style='padding:20px;'>Wishlist is empty</p>";

        return;

    }

    wishlist.forEach((item,index)=>{

        wishlistItems.innerHTML += `

        <div class="wishlist-item"
        style="
        display:flex;
        align-items:center;
        gap:15px;
        padding:15px;
        border-bottom:1px solid #eee;
        ">

            <img src="${item.image}"
            style="
            width:70px;
            height:70px;
            object-fit:cover;
            border-radius:12px;
            ">

            <div style="flex:1;">

                <h4>${item.title}</h4>

                <p>₹${item.price}</p>

            </div>

            <button
            onclick="removeWishlist(${index})">

                Remove

            </button>

        </div>

        `;

    });

}


/* REMOVE WISHLIST */

window.removeWishlist = function(index){

    wishlist.splice(index,1);

    renderWishlist();

}


/* OPEN WISHLIST */

window.openWishlist = function(){

    document
    .getElementById("wishlistPopup")
    .classList.add("active");

}


/* CLOSE WISHLIST */

window.closeWishlist = function(){

    document
    .getElementById("wishlistPopup")
    .classList.remove("active");

}


/* WHATSAPP ORDER */

window.orderWhatsApp = function (product) {

    let phone = "919174709695";

    let message =
    `Hello I want to order ${product}`;

    window.open(
        `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
        "_blank"
    );

};


/* PRODUCT POPUP */

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

    let oldModal = document.querySelector(".product-modal");

    if(oldModal){

        oldModal.remove();

    }

    let modal =
    document.createElement("div");

    modal.classList.add("product-modal");

    modal.innerHTML = `

    <div class="product-modal-overlay">

        <div class="modal-content">

            <span class="close-modal"
            onclick="closeModal()">

                ✕

            </span>

            <div class="modal-left">

                <img src="${image1}"
                class="main-popup-image"
                id="mainPopupImage">

                <div class="gallery-row">

                    ${image1 ? `<img src="${image1}" onclick="changeMainImage('${image1}')">` : ""}
                    ${image2 ? `<img src="${image2}" onclick="changeMainImage('${image2}')">` : ""}
                    ${image3 ? `<img src="${image3}" onclick="changeMainImage('${image3}')">` : ""}
                    ${image4 ? `<img src="${image4}" onclick="changeMainImage('${image4}')">` : ""}
                    ${image5 ? `<img src="${image5}" onclick="changeMainImage('${image5}')">` : ""}

                </div>

            </div>

            <div class="modal-right">

                <h2 class="modal-title">

                    ${product}

                </h2>

                <p class="modal-price">

                    ₹${price}

                </p>

                <p class="modal-description">

                    ${description}

                </p>

                <div class="modal-buttons">

                    <button class="modal-cart-btn"
                    onclick="addToCart(
                    '${product}',
                    ${price},
                    '${image1}'
                    )">

                        Add To Cart

                    </button>

                    <button class="modal-whatsapp-btn"
                    onclick="orderWhatsApp('${product}')">

                        Order Now

                    </button>

                </div>

            </div>

        </div>

    </div>

    `;

    document.body.appendChild(modal);

};


/* CHANGE IMAGE */

window.changeMainImage = function(image){

    document
    .getElementById("mainPopupImage")
    .src = image;

}


/* CLOSE MODAL */

window.closeModal = function () {

    let modal =
    document.querySelector(".product-modal");

    if (modal) {

        modal.remove();

    }

};


/* INITIAL RENDER */

renderCart();
renderWishlist();
