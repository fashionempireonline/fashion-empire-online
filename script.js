let cart = [];

/* =========================
FIREBASE PRODUCTS LOAD
========================= */

async function loadFirebaseProducts(){

const querySnapshot =
await getDocs(
collection(db,"products")
);

let container =
document.getElementById("products");

container.innerHTML = "";

querySnapshot.forEach((doc)=>{

let product = doc.data();

container.innerHTML += `

<div class="card"
data-category="${product.category}">

<div class="image">

<img src="${product.image}">

</div>

<div class="info">

<h3>${product.title}</h3>

<p>${product.description}</p>

<div class="price">

<span class="new">
₹${product.price}
</span>

<span class="old">
₹${product.oldPrice || ""}
</span>

</div>

<div class="rating">
⭐ 4.8
</div>

<div class="card-buttons">

<button class="cart-btn"
onclick="addToCart('${product.title}',${product.price})">

Add To Cart

</button>

<button class="view-btn"

onclick="viewProduct(
'${product.title}',
${product.price},
'${product.image}',
'${product.description}'
)">

View

</button>

</div>

<button class="whatsapp-btn"

onclick="orderWhatsApp('${product.title}')">

Order On WhatsApp

</button>

</div>

</div>

`;

});

}

loadFirebaseProducts();


/* =========================
SEARCH
========================= */

function searchProducts(){

let input =
document.getElementById("searchInput")
.value.toLowerCase();

let cards =
document.querySelectorAll(".card");

cards.forEach(card=>{

let title =
card.querySelector("h3")
.innerText.toLowerCase();

if(title.includes(input)){

card.style.display = "block";

}else{

card.style.display = "none";

}

});

}


/* =========================
CATEGORY FILTER
========================= */

function filterCategory(category){

document.getElementById("searchInput").value = "";

let cards =
document.querySelectorAll(".card");

cards.forEach(card=>{

if(category === "all"){

card.style.display = "block";
return;

}

if(card.dataset.category === category){

card.style.display = "block";

}else{

card.style.display = "none";

}

});

}


/* =========================
ADD TO CART
========================= */

function addToCart(name,price){

cart.push({name,price});

renderCart();

openCart();

}


/* =========================
RENDER CART
========================= */

function renderCart(){

let cartItems =
document.getElementById("cart-items");

cartItems.innerHTML = "";

if(cart.length === 0){

cartItems.innerHTML =
"<p>Your cart is empty</p>";

return;

}

cart.forEach((item,index)=>{

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

function removeItem(index){

cart.splice(index,1);

renderCart();

}


/* =========================
OPEN CART
========================= */

function openCart(){

document
.getElementById("cartPopup")
.classList.add("active");

}


/* =========================
CLOSE CART
========================= */

function closeCart(){

document
.getElementById("cartPopup")
.classList.remove("active");

}


/* =========================
WHATSAPP ORDER
========================= */

function orderWhatsApp(product){

let phone = "919174709695";

let message =
`Hello I want to order ${product}`;

window.open(
`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
"_blank"
);

}


/* =========================
PRODUCT VIEW POPUP
========================= */

function viewProduct(
product,
price,
image,
description
){

let modal = document.createElement("div");

modal.classList.add("product-modal");

modal.innerHTML = `

<div class="modal-content">

<span class="close-modal"
onclick="closeModal()">

&times;

</span>

<img src="${image}">

<h2>${product}</h2>

<p class="modal-price">

₹${price}

</p>

<p>

${description}

</p>

<button onclick="addToCart('${product}',${price})">

Add To Cart

</button>

</div>

`;

document.body.appendChild(modal);

}


/* =========================
CLOSE MODAL
========================= */

function closeModal(){

document
.querySelector(".product-modal")
.remove();

}