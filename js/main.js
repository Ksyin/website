let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(name, price) {
  cart.push({ name, price });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart");
}

function loadCart() {
  const list = document.getElementById("cartItems");
  if (!list) return;

  list.innerHTML = "";
  cart.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - KES ${item.price}`;
    list.appendChild(li);
  });
}

function checkout() {
  let message = "Cupcake Order:%0A";
  cart.forEach(i => message += `${i.name} - KES ${i.price}%0A`);
  window.open(`https://wa.me/254702837241?text=${message}`);
}

document.addEventListener("DOMContentLoaded", loadCart);
