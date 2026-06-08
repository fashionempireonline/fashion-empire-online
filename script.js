import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit, getDocs as getDocsQ } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBw6dKBEDGfuh-he23WHJGG-L6mRDH_lFo",
  authDomain: "fashion-empire-online.firebaseapp.com",
  projectId: "fashion-empire-online",
  storageBucket: "fashion-empire-online.firebasestorage.app",
  messagingSenderId: "270445447440",
  appId: "1:270445447440:web:17b31b34a0bbecbe87bd95"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

/* ============================
   CART & WISHLIST — localStorage se load
============================ */
let cart     = JSON.parse(localStorage.getItem("fe_cart")     || "[]");
let wishlist = JSON.parse(localStorage.getItem("fe_wishlist") || "[]");
let allProducts = {};

/* ============================
   SAVE TO LOCALSTORAGE
============================ */
function saveCart()    { localStorage.setItem("fe_cart",     JSON.stringify(cart));     }
function saveWishlist(){ localStorage.setItem("fe_wishlist", JSON.stringify(wishlist));  }

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
window.showToast = showToast;

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
  let c = document.getElementById("products");
  if(!c) return;
  c.innerHTML = Array(8).fill(`
    <div class="card skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-line short"></div>
    </div>`).join("");
}

/* ============================
   BUILD CARD
============================ */
function buildCard(docId, p){
  let discount  = calculateDiscount(p.oldprice, p.price);
  let inWish    = wishlist.find(i => i.id === docId);
  let card      = document.createElement("div");
  card.className     = "card";
  card.dataset.category = (p.category || "all").toLowerCase();
  card.dataset.price    = p.price || 0;
  card.dataset.id       = docId;
  card.style.animation  = "fadeInUp 0.5s ease both";
  card.innerHTML = `
    <div class="image">
      <img src="${p.image1||''}" alt="${p.title||'Product'}" loading="lazy">
      ${discount ? `<span class="badge-discount">${discount}</span>` : ""}
      <button class="wishlist-card-btn" onclick="toggleWishlist('${docId}')" id="wbtn-${docId}">
        <i class="${inWish ? 'fa-solid' : 'fa-regular'} fa-heart" ${inWish ? 'style="color:#ff416c;"' : ''}></i>
      </button>
    </div>
    <div class="info">
      <h3>${p.title||'Product'}</h3>
      <div class="price">
        <span class="new">₹${p.price||0}</span>
        ${p.oldprice ? `<span class="old">₹${p.oldprice}</span>` : ""}
      </div>
      <div class="card-rating" id="rating-${docId}">
        <span class="stars" style="color:#ddd;">★★★★★</span>
        <span class="rating-count">loading...</span>
      </div>
      <div class="card-buttons">
        <button class="cart-btn" onclick="addToCart('${docId}')">
          <i class="fa-solid fa-cart-plus"></i> Add To Cart
        </button>
        <button class="view-btn" onclick="window.location.href='product.html?id=${docId}'">
          <i class="fa-solid fa-eye"></i> View
        </button>
      </div>
      <button class="whatsapp-btn" onclick="orderWhatsApp('${(p.title||'').replace(/'/g,"\\'")}','${docId}')">
        <i class="fa-brands fa-whatsapp"></i> Order On WhatsApp
      </button>
    </div>`;
  return card;
}

/* ============================
   LOAD PRODUCTS
============================ */
async function loadFirebaseProducts(){
  showSkeletons();
  try {
    const snap = await getDocs(collection(db, "products"));
    let container = document.getElementById("products");
    if(!container) return;
    container.innerHTML = "";

    if(snap.empty){
      container.innerHTML = `<p style="padding:20px;color:#888;grid-column:1/-1;text-align:center;">Koi products nahi mile.</p>`;
      return;
    }

    snap.forEach(d => {
      let p = d.data();
      allProducts[d.id] = p;
      container.appendChild(buildCard(d.id, p));
    });

    loadAllRatings();
    loadFeatured();
    loadRecommended();
  } catch(err){
    console.error(err);
    let c = document.getElementById("products");
    if(c) c.innerHTML = `<p style="padding:20px;color:#e00;grid-column:1/-1;text-align:center;">Products load nahi hue. Refresh karein.</p>`;
  }
}
loadFirebaseProducts();

/* ============================
   RATINGS
============================ */
async function loadAllRatings(){
  try {
    let snap = await getDocs(collection(db, "reviews"));
    let ratings = {};
    snap.forEach(d => {
      let r = d.data();
      if(!r.productId || !r.rating) return;
      if(!ratings[r.productId]) ratings[r.productId] = { sum:0, count:0 };
      ratings[r.productId].sum   += r.rating;
      ratings[r.productId].count += 1;
    });

    Object.keys(ratings).forEach(pid => {
      let avg   = (ratings[pid].sum / ratings[pid].count).toFixed(1);
      let count = ratings[pid].count;
      let el    = document.getElementById(`rating-${pid}`);
      if(el){
        let filled = Math.round(avg);
        let stars  = "★".repeat(filled) + "☆".repeat(5-filled);
        el.innerHTML = `<span class="stars" style="color:#f5a623;">${stars}</span> <span class="rating-count">${avg} (${count})</span>`;
      }
    });

    document.querySelectorAll(".card-rating").forEach(el => {
      if(el.querySelector(".rating-count")?.innerText === "loading..."){
        el.innerHTML = `<span class="stars" style="color:#ddd;">★★★★★</span> <span class="rating-count" style="color:#ccc;">No reviews yet</span>`;
      }
    });
  } catch(e){ console.error(e); }
}

/* ============================
   RECOMMENDED
============================ */
/* ============================
   FEATURED PRODUCTS
============================ */
function loadFeatured(){
  let section = document.getElementById("featuredSection");
  if(!section) return;

  let ids = Object.keys(allProducts);
  if(ids.length === 0){ section.style.display="none"; return; }

  // Pick first 4 products with discount as featured
  let featured = ids.filter(id => {
    let p = allProducts[id];
    return p.oldprice && p.price && p.oldprice > p.price;
  }).slice(0, 4);

  // If not enough discounted, fill with random
  if(featured.length < 4){
    ids.forEach(id => {
      if(!featured.includes(id)) featured.push(id);
    });
    featured = featured.slice(0, 4);
  }

  if(featured.length === 0){ section.style.display="none"; return; }

  let wrap = document.getElementById("featuredGrid");
  if(!wrap) return;
  wrap.innerHTML = "";
  featured.forEach(id => {
    let card = buildCard(id, allProducts[id]);
    wrap.appendChild(card);
  });
  section.style.display = "block";
}

function loadRecommended(){
  let section = document.getElementById("recommendedSection");
  if(!section) return;

  let lastCat = localStorage.getItem("fe_lastCategory") || null;
  let recIds  = [];

  Object.keys(allProducts).forEach(id => {
    let p = allProducts[id];
    if(!lastCat || (p.category||"").toLowerCase() === lastCat.toLowerCase()){
      recIds.push(id);
    }
  });

  if(recIds.length < 4){
    Object.keys(allProducts).forEach(id => {
      if(!recIds.includes(id)) recIds.push(id);
    });
  }

  recIds = recIds.slice(0, 4);
  if(recIds.length === 0){ section.style.display="none"; return; }

  let wrap = document.getElementById("recommendedGrid");
  if(!wrap) return;
  wrap.innerHTML = "";
  recIds.forEach(id => {
    let card = buildCard(id, allProducts[id]);
    wrap.appendChild(card);
  });
  section.style.display = "block";
}

/* ============================
   ADVANCED FILTER
============================ */
window.applyFilters = function(){
  let minP   = parseFloat(document.getElementById("filterMinPrice")?.value) || 0;
  let maxP   = parseFloat(document.getElementById("filterMaxPrice")?.value) || Infinity;
  let selCat = document.getElementById("filterCategory")?.value || "all";
  let hasDisc= document.getElementById("filterDiscount")?.checked;

  document.querySelectorAll(".card").forEach(card => {
    let price = parseFloat(card.dataset.price || 0);
    let cat   = card.dataset.category || "all";
    let id    = card.dataset.id;
    let p     = allProducts[id] || {};
    let hasD  = p.oldprice && p.price && p.oldprice > p.price;

    let show = price >= minP && price <= maxP;
    if(selCat !== "all" && cat !== selCat) show = false;
    if(hasDisc && !hasD) show = false;

    card.style.display = show ? "block" : "none";
  });

  closeFilterPanel();
  showToast("✅ Filter apply ho gaya!");
};

window.clearFilters = function(){
  let fields = ["filterMinPrice","filterMaxPrice","filterCategory","filterDiscount"];
  fields.forEach(id => {
    let el = document.getElementById(id);
    if(!el) return;
    if(el.type === "checkbox") el.checked = false;
    else el.value = el.tagName === "SELECT" ? "all" : "";
  });
  document.querySelectorAll(".card").forEach(c => c.style.display = "block");
  closeFilterPanel();
  showToast("🔄 Filters clear ho gaye!");
};

window.openFilterPanel  = () => {
  document.getElementById("filterPanel").classList.add("open");
  document.getElementById("filterOverlay").classList.add("open");
};
window.closeFilterPanel = () => {
  document.getElementById("filterPanel").classList.remove("open");
  document.getElementById("filterOverlay").classList.remove("open");
};

/* ============================
   CART
============================ */
window.addToCart = function(id){
  let p = allProducts[id];
  if(!p) return;
  let existing = cart.find(i => i.id === id);
  if(existing){ existing.qty++; }
  else { cart.push({ id, name: p.title, price: p.price, image: p.image1, qty: 1 }); }
  saveCart();
  renderCart();
  updateBadges();
  showToast("🛒 Cart mein add ho gaya!");
  localStorage.setItem("fe_lastCategory", (p.category||"").toLowerCase());
};

window.increaseQty = function(id){
  let item = cart.find(i => i.id === id);
  if(item){ item.qty++; saveCart(); renderCart(); updateBadges(); }
};

window.decreaseQty = function(id){
  let idx = cart.findIndex(i => i.id === id);
  if(idx === -1) return;
  if(cart[idx].qty > 1){ cart[idx].qty--; }
  else { cart.splice(idx, 1); }
  saveCart(); renderCart(); updateBadges();
};

window.removeItem = function(id){
  cart = cart.filter(i => i.id !== id);
  saveCart(); renderCart(); updateBadges();
  showToast("🗑️ Item remove ho gaya");
};

function renderCart(){
  let cartItems  = document.getElementById("cart-items");
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
  let msg = "Hello! Mujhe ye products order karne hain:\n\n";
  let total = 0;
  cart.forEach(item => {
    msg += `• ${item.name} x${item.qty} = ₹${item.price * item.qty}\n`;
    total += item.price * item.qty;
  });
  msg += `\n*Total: ₹${total}*\n\nKripya order confirm karein.`;
  window.open(`https://wa.me/919174709695?text=${encodeURIComponent(msg)}`, "_blank");
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
  saveWishlist(); renderWishlist(); updateBadges();
};

window.removeWishlist = function(id){
  wishlist = wishlist.filter(i => i.id !== id);
  let btn = document.getElementById(`wbtn-${id}`);
  if(btn) btn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
  saveWishlist(); renderWishlist(); updateBadges();
  showToast("💔 Wishlist se hata diya");
};

function renderWishlist(){
  let el = document.getElementById("wishlist-items");
  if(!el) return;
  el.innerHTML = "";
  if(wishlist.length === 0){ el.innerHTML = "<p class='empty-msg'>💔 Wishlist is empty</p>"; return; }
  wishlist.forEach(item => {
    el.innerHTML += `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.title}">
      <div class="cart-item-info">
        <h4>${item.title}</h4>
        <p class="cart-item-price">₹${item.price}</p>
        <div class="qty-row">
          <button class="cart-btn" style="padding:8px 12px;font-size:12px;"
            onclick="addToCart('${item.id}'); closeWishlist(); openCart();">
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
  let cc = cart.reduce((s,i)=>s+i.qty, 0);
  let wc = wishlist.length;
  let cb = document.getElementById("cartBadge");
  let wb = document.getElementById("wishlistBadge");
  if(cb){ cb.innerText=cc; cb.style.display=cc>0?"flex":"none"; }
  if(wb){ wb.innerText=wc; wb.style.display=wc>0?"flex":"none"; }
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
    card.style.display = (category==="all" || card.dataset.category===category) ? "block" : "none";
  });
  if(category !== "all") localStorage.setItem("fe_lastCategory", category);
};

/* ============================
   LIVE SEARCH
============================ */
window.searchProducts = function(){
  let s = document.getElementById("searchInput").value.toLowerCase().trim();
  document.querySelectorAll(".card").forEach(card => {
    let t = card.querySelector("h3")?.innerText.toLowerCase()||"";
    card.style.display = t.includes(s) ? "block" : "none";
  });
};

/* ============================
   SORT
============================ */
window.sortProducts = function(){
  let val  = document.getElementById("sortSelect").value;
  let cont = document.getElementById("products");
  let cards= [...document.querySelectorAll("#products .card")];
  cards.sort((a,b)=>{
    let pa=parseFloat(a.dataset.price||0), pb=parseFloat(b.dataset.price||0);
    if(val==="low")  return pa-pb;
    if(val==="high") return pb-pa;
    return 0;
  });
  cards.forEach(c => cont.appendChild(c));
  showToast("✅ Products sort ho gaye!");
};

/* ============================
   WHATSAPP SINGLE — product link bhi bhejo
============================ */
window.orderWhatsApp = function(product, id){
  let productLink = id
    ? `${window.location.origin}/product.html?id=${id}`
    : window.location.href;
  let msg = `Hello! Mujhe ye product order karna hai:\n\n*${product}*\n\n🔗 Product Link:\n${productLink}\n\nKripya price aur availability batayein.`;
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
    setTimeout(()=>{ window.location.href="login.html"; }, 1200);
  });
};

/* ============================
   INIT — render saved cart & wishlist
============================ */
renderCart();
renderWishlist();
updateBadges();
