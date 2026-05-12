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

alert(name + " added to cart");

}

/* RENDER CART */

function renderCart(){

let cartItems =
document.getElementById("cart-items");

cartItems.innerHTML = "";

cart.forEach(item=>{

cartItems.innerHTML += `

<div class="cart-item">

<h3>${item.name}</h3>

<p>₹${item.price}</p>

</div>

`;

});

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

let phone = "+91 9174709695";

let message =
`Hello I want to order ${product}`;

window.open(
`https://wa.me/${9174709695}?text=${encodeURIComponent(message)}`,
"_blank"
);

}

/* PRODUCT VIEW */

function viewProduct(){

alert("Product Details Coming Soon");

}