let cart = [];

/* SEARCH */

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


/* CATEGORY FILTER */

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


/* ADD TO CART */

function addToCart(name,price){

cart.push({name,price});

renderCart();

openCart();

}


/* RENDER CART */

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


/* REMOVE ITEM */

function removeItem(index){

cart.splice(index,1);

renderCart();

}


/* OPEN CART */

function openCart(){

document
.getElementById("cartPopup")
.classList.add("active");

}


/* CLOSE CART */

function closeCart(){

document
.getElementById("cartPopup")
.classList.remove("active");

}


/* WHATSAPP */

function orderWhatsApp(product){

let phone = "919174709695";

let message =
`Hello I want to order ${product}`;

window.open(
`https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
"_blank"
);

}


/* PRODUCT VIEW POPUP */

function viewProduct(product,price,image){

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

Premium fashion product with best quality.

</p>

<button onclick="addToCart('${product}',${price})">

Add To Cart

</button>

</div>

`;

document.body.appendChild(modal);

}


/* CLOSE MODAL */

function closeModal(){

document
.querySelector(".product-modal")
.remove();

}