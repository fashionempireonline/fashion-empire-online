import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBw6dKBEDGfuh-he23WHJGG-L6mRDH_lFo",
  authDomain: "fashion-empire-online.firebaseapp.com",
  projectId: "fashion-empire-online",
  storageBucket: "fashion-empire-online.firebasestorage.app",
  messagingSenderId: "270445447440",
  appId: "1:270445447440:web:17b31b34a0bbecbe87bd95"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let cart = [];
let wishlist = [];
let allProducts = {};

/* ============================
   TOAST
============================ */
function showToast(msg){
  let t = document.getElementById("toast");
  if(!t) return;
  t.innerText = msg;
  t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 2500);
}

/* ============================
   DISCOUNT CALC
============================ */
function calculateDiscount(oldPrice, price){
  if(!oldPrice || !price) return "";
  return Math.round(((oldPrice - price) / oldPrice) * 100) + "% OFF";
}

/* ============================
   SKELETON LOADER
============================ */
function showSkeletons(){
  let container = document.getElementById("products");
  if(!container) return;
  container.innerHTML = Array(8).fill(`
    <div class="card skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-line short"></div>
    </div>`).join("");
}

/* ============================
   FIREBASE LOAD PRODUCTS
============================ */
async function loadFirebaseProducts(){
  showSkeletons();
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    let container = document.getElementById("products");
    if(!container) return;
    container.innerHTML = "";

    if(querySnapshot.empty){
      container.innerHTML = `<p style="padding:20px;color:#888;grid-column:1/-1;text-align:center;">Koi products nahi mile.</p>`;
      return;
    }

    querySnapshot.forEach((doc) => {
      let p = doc.data();
      allProducts[doc.id] = p;
      let discount = calculateDiscount(p.oldprice, p.price);

      let card = document.createElement("div");
      card.className = "card";
      card.dataset.category = (p.category || "all").toLowerCase();
      card.dataset.price = p.price || 0;
      card.dataset.id = doc.id;
      card.style.animation = "fadeInUp 0.5s ease both";

      card.innerHTML = `
        <div class="image">
          <img src="${p.image1 || ''}" alt="${p.title || 'Product'}" loading="lazy">
          ${discount ? `<span class="badge-discount">${discount}</span>` : ""}
          <button class="wishlist-card-btn" onclick="toggleWishlist('${doc.id}')" id="wbtn-${doc.id}">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>
        <div class="info">
          <h3>${p.title || 'Product'}</h3>
          <div class="price">
            <span class="new">₹${p.price || 0}</span>
            ${p.oldprice ? `<span class="old">₹${p.oldprice}</span>` : ""}
          </div>
          <div class="card-buttons">
            <button class="cart-btn" onclick="addToCart('${doc.id}')">
              <i class="fa-solid fa-cart-plus"></i> Add To Cart
            </button>
            <button class="view-btn" onclick="window.location.href='product.html?id=${doc.id}'">
              <i class="fa-solid fa-eye"></i> View
            </button>
          </div>
          <button class="whatsapp-btn" onclick="orderWhatsApp('${(p.title||'').replace(/'/g,"\\'")}')">
            <i class="fa-brands fa-whatsapp"></i> Order On WhatsApp
          </button>
        </div>`;

      container.appendChild(card);
    });

  } catch(err){
    console.error("Firebase Error:", err);
    let c = document.getElementById("products");
    if(c) c.innerHTML = `<p style="padding:20px;color:#e00;grid-column:1/-1;text-align:center;">Products load nahi hue. Refresh karein.</p>`;
  }
}
loadFirebaseProducts();

/* ============================
   CART
============================ */
window.addToCart = function(id){
  let p = allProducts[id];
  if(!p) return;
  let existing = cart.find(i => i.id === id);
  if(existing){ existing.qty++; }
  else { cart.push({ id, name: p.title, price: p.price, image: p.image1, qty: 1 }); }
  renderCart();
  updateBadges();
  showToast("🛒 Cart mein add ho gaya!");
};

window.increaseQty = function(id){
  let item = cart.find(i => i.id === id);
  if(item){ item.qty++; renderCart(); updateBadges(); }
};

window.decreaseQty = function(id){
  let idx = cart.findIndex(i => i.id === id);
  if(idx === -1) return;
  if(cart[idx].qty > 1){ cart[idx].qty--; }
  else { cart.splice(idx, 1); }
  renderCart();
  updateBadges();
};

window.removeItem = function(id){
  cart = cart.filter(i => i.id !== id);
  renderCart();
  updateBadges();
  showToast("🗑️ Item remove ho gaya");
};

function renderCart(){
  let cartItems = document.getElementById("cart-items");
  let cartFooter = document.getElementById("cart-footer");
  if(!cartItems) return;
  cartItems.innerHTML = "";

  if(cart.length === 0){
    cartItems.innerHTML = "<p class='empty-msg'>🛒 Cart is empty</p>";
    if(cartFooter) cartFooter.style.display = "none";
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    cartItems.innerHTML += `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p class="cart-item-price">₹${item.price}</p>
        <div class="qty-row">
          <button class="qty-btn" onclick="decreaseQty('${item.id}')">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="increaseQty('${item.id}')">+</button>
          <button class="remove-btn" onclick="removeItem('${item.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>`;
  });

  document.getElementById("cart-total-price").innerText = `₹${total}`;
  if(cartFooter) cartFooter.style.display = "block";
}

window.checkoutWhatsApp = function(){
  let phone = "919174709695";
  let msg = "Hello! Mujhe ye products order karne hain:\n\n";
  let total = 0;
  cart.forEach(item => {
    msg += `• ${item.name} x${item.qty} = ₹${item.price * item.qty}\n`;
    total += item.price * item.qty;
  });
  msg += `\n*Total: ₹${total}*\n\nKripya order confirm karein.`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
};

window.openCart  = () => document.getElementById("cartPopup").classList.add("active");
window.closeCart = () => document.getElementById("cartPopup").classList.remove("active");

/* ============================
   WISHLIST
============================ */
window.toggleWishlist = function(id){
  let p = allProducts[id];
  if(!p) return;
  let idx = wishlist.findIndex(i => i.id === id);
  let btn = document.getElementById(`wbtn-${id}`);

  if(idx !== -1){
    wishlist.splice(idx, 1);
    if(btn) btn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
    showToast("💔 Wishlist se hata diya");
  } else {
    wishlist.push({ id, title: p.title, price: p.price, image: p.image1 });
    if(btn) btn.innerHTML = `<i class="fa-solid fa-heart" style="color:#ff416c;"></i>`;
    showToast("❤️ Wishlist mein add ho gaya!");
  }
  renderWishlist();
  updateBadges();
};

window.removeWishlist = function(id){
  wishlist = wishlist.filter(i => i.id !== id);
  let btn = document.getElementById(`wbtn-${id}`);
  if(btn) btn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
  renderWishlist();
  updateBadges();
  showToast("💔 Wishlist se hata diya");
};

function renderWishlist(){
  let el = document.getElementById("wishlist-items");
  if(!el) return;
  el.innerHTML = "";
  if(wishlist.length === 0){
    el.innerHTML = "<p class='empty-msg'>💔 Wishlist is empty</p>";
    return;
  }
  wishlist.forEach(item => {
    el.innerHTML += `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}">
      <div class="cart-item-info">
        <h4>${item.title}</h4>
        <p class="cart-item-price">₹${item.price}</p>
        <div class="qty-row">
          <button class="cart-btn" style="padding:8px 12px;font-size:12px;" onclick="addToCart('${item.id}'); closeWishlist(); openCart();">
            <i class="fa-solid fa-cart-plus"></i> Add to Cart
          </button>
          <button class="remove-btn" onclick="removeWishlist('${item.id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    </div>`;
  });
}

window.openWishlist  = () => document.getElementById("wishlistPopup").classList.add("active");
window.closeWishlist = () => document.getElementById("wishlistPopup").classList.remove("active");

/* ============================
   BADGES
============================ */
function updateBadges(){
  let cartCount = cart.reduce((s,i)=> s + i.qty, 0);
  let wishCount = wishlist.length;
  let cb = document.getElementById("cartBadge");
  let wb = document.getElementById("wishlistBadge");
  if(cb){ cb.innerText = cartCount; cb.style.display = cartCount > 0 ? "flex" : "none"; }
  if(wb){ wb.innerText = wishCount; wb.style.display = wishCount > 0 ? "flex" : "none"; }
}

/* ============================
   CATEGORY FILTER
============================ */
window.filterCategory = function(category, el){
  category = category.toLowerCase();
  document.getElementById("searchInput").value = "";
  document.querySelectorAll(".category").forEach(c => c.classList.remove("active-cat"));
  if(el) el.classList.add("active-cat");
  document.querySelectorAll(".card").forEach(card => {
    card.style.display = (category === "all" || card.dataset.category === category) ? "block" : "none";
  });
};

/* ============================
   LIVE SEARCH
============================ */
window.searchProducts = function(){
  let search = document.getElementById("searchInput").value.toLowerCase().trim();
  document.querySelectorAll(".card").forEach(card => {
    let title = card.querySelector("h3")?.innerText.toLowerCase() || "";
    card.style.display = title.includes(search) ? "block" : "none";
  });
};

/* ============================
   SORT
============================ */
window.sortProducts = function(){
  let val = document.getElementById("sortSelect").value;
  let container = document.getElementById("products");
  let cards = [...document.querySelectorAll(".card")];

  cards.sort((a,b)=>{
    let pa = parseFloat(a.dataset.price || 0);
    let pb = parseFloat(b.dataset.price || 0);
    if(val === "low") return pa - pb;
    if(val === "high") return pb - pa;
    return 0;
  });

  cards.forEach(c => container.appendChild(c));
  showToast("✅ Products sort ho gaye!");
};

/* ============================
   WHATSAPP SINGLE
============================ */
window.orderWhatsApp = function(product){
  let msg = `Hello! Mujhe ye product order karna hai: *${product}*\n\nKripya price aur availability batayein.`;
  window.open(`https://wa.me/919174709695?text=${encodeURIComponent(msg)}`, "_blank");
};

/* ============================
   LOGOUT
============================ */
window.logoutUser = function(){
  signOut(auth).then(()=>{
    localStorage.removeItem("fe_userName");
    localStorage.removeItem("fe_userEmail");
    showToast("👋 Logout ho gaye!");
    setTimeout(()=>{ window.location.href = "login.html"; }, 1200);
  }).catch(err => console.log(err));
};

/* INIT */
renderCart();
renderWishlist();
