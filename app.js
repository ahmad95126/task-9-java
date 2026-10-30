const originalProducts = [
  { id: 1, name: 'Laptop', category: 'electronics', price: 25000, stock: 4 },
  { id: 2, name: 'Mouse', category: 'electronics', price: 350, stock: 0 },
  { id: 3, name: 'T-Shirt', category: 'clothes', price: 400, stock: 12 },
  { id: 4, name: 'Jacket', category: 'clothes', price: 1800, stock: 2 },
  { id: 5, name: 'Rice 5kg', category: 'food', price: 220, stock: 30 },
  { id: 6, name: 'Coffee', category: 'food', price: 300, stock: 0 },
  { id: 7, name: 'Headphones', category: 'electronics', price: 1500, stock: 7 },
  { id: 8, name: 'Shoes', category: 'clothes', price: 2200, stock: 5 },
];

let products = originalProducts.map(p => ({ ...p }));
let currentList = [...products];
let nextId = 9;

function updateAndDraw(newList) {
  currentList = newList;
  drawList();
}

function drawList() {
  const listEl = document.getElementById('product-list');
  listEl.innerHTML = '';

  currentList.forEach(product => {
    const li = document.createElement('li');
    if (product.stock === 0) {
      li.classList.add('out-of-stock');
    }

    const info = document.createElement('div');
    info.className = 'product-info';
    info.textContent = product.id + ' - ' + product.name + ' - ' + product.price + ' EGP - stock: ' + product.stock;
    li.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'product-actions';

    const btnPlus = document.createElement('button');
    btnPlus.textContent = '+1';
    btnPlus.addEventListener('click', function () {
      addStock(product.id);
    });
    actions.appendChild(btnPlus);

    const btnSell = document.createElement('button');
    btnSell.textContent = 'Sell';
    btnSell.addEventListener('click', function () {
      sellProduct(product.id);
    });
    actions.appendChild(btnSell);

    const btnRemove = document.createElement('button');
    btnRemove.textContent = 'Remove';
    btnRemove.className = 'danger';
    btnRemove.addEventListener('click', function () {
      removeProduct(product.id);
    });
    actions.appendChild(btnRemove);

    li.appendChild(actions);
    listEl.appendChild(li);
  });

  document.getElementById('count').textContent = currentList.length;

  const totalValue = currentList.reduce((sum, p) => sum + (p.price * p.stock), 0);
  document.getElementById('total-value').textContent = totalValue;

  let statusText = 'No products';
  if (currentList.length > 0) {
    const hasOutOfStock = currentList.some(p => p.stock === 0);
    const allInStock = currentList.every(p => p.stock > 0);
    if (allInStock) {
      statusText = 'Everything is in stock';
    } else if (hasOutOfStock) {
      statusText = 'Some products are out of stock';
    }
  }
  document.getElementById('status').textContent = statusText;

  if (currentList.length > 0) {
    const mostExpensive = currentList.reduce((max, p) => p.price > max.price ? p : max, currentList[0]);
    document.getElementById('most-expensive').textContent = mostExpensive.name;
  } else {
    document.getElementById('most-expensive').textContent = '-';
  }
}

function makeFilter(checkFn) {
  return function () {
    const filtered = products.filter(checkFn);
    updateAndDraw(filtered);
  };
}

const maxPrice = (limit) => makeFilter(p => p.price <= limit);
const minPrice = (limit) => makeFilter(p => p.price >= limit);

function clearCategory() {
  document.getElementById('categorySelect').value = '';
}

function showAll() {
  clearCategory();
  updateAndDraw([...products]);
}

function showInStock() {
  clearCategory();
  updateAndDraw(products.filter(p => p.stock > 0));
}

function showCheap() {
  clearCategory();
  maxPrice(500)();
}

function showExpensive() {
  clearCategory();
  minPrice(2000)();
}

function sortByPrice() {
  const sorted = [...currentList].sort((a, b) => a.price - b.price);
  updateAndDraw(sorted);
}

function applyDiscount() {
  products = products.map(p => ({
    ...p,
    price: Math.max(50, Math.floor(p.price * 0.9))
  }));
  const ids = currentList.map(p => p.id);
  updateAndDraw(products.filter(p => ids.includes(p.id)));
}

function resetProducts() {
  products = originalProducts.map(p => ({ ...p }));
  nextId = 9;
  clearCategory();
  updateAndDraw([...products]);
}

function addStock(id) {
  products = products.map(p => {
    if (p.id === id) {
      return { ...p, stock: p.stock + 1 };
    }
    return p;
  });
  refreshCurrentView();
}

function sellProduct(id) {
  products = products.map(p => {
    if (p.id === id) {
      return { ...p, stock: Math.max(0, p.stock - 1) };
    }
    return p;
  });
  refreshCurrentView();
}

function removeProduct(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  const confirmed = confirm('Remove ' + product.name + '?');
  if (confirmed) {
    products = products.filter(p => p.id !== id);
    refreshCurrentView();
  }
}

function refreshCurrentView() {
  const category = document.getElementById('categorySelect').value;
  let list;

  if (category) {
    list = products.filter(p => p.category === category);
  } else {
    const ids = currentList.map(p => p.id);
    list = products.filter(p => ids.includes(p.id));
  }
  updateAndDraw(list);
}

function filterByCategory() {
  const category = document.getElementById('categorySelect').value;
  if (!category) {
    updateAndDraw([...products]);
  } else {
    updateAndDraw(products.filter(p => p.category === category));
  }
}

function addProduct(event) {
  event.preventDefault();

  const nameInput = document.getElementById('name').value.trim();
  const category = document.getElementById('category').value;
  const priceInput = document.getElementById('price').value;
  const stockInput = document.getElementById('stock').value;
  const errorEl = document.getElementById('error-message');

  if (nameInput.length < 3) {
    errorEl.textContent = 'Name is required and must be at least 3 characters';
    return;
  }

  const exists = products.find(p => p.name.toLowerCase() === nameInput.toLowerCase());
  if (exists) {
    errorEl.textContent = exists.name + ' already exists (id ' + exists.id + ')';
    return;
  }

  if (!category) {
    errorEl.textContent = 'Category must be chosen';
    return;
  }

  const price = Number(priceInput);
  if (isNaN(price) || price <= 0) {
    errorEl.textContent = 'Price must be a number more than 0';
    return;
  }

  const stock = Number(stockInput);
  if (isNaN(stock) || stock < 0 || stock > 1000) {
    errorEl.textContent = 'Stock must be a number from 0 to 1000';
    return;
  }

  const newProduct = {
    id: nextId,
    name: nameInput,
    category: category,
    price: price,
    stock: stock
  };

  products.push(newProduct);
  nextId++;

  document.getElementById('add-form').reset();
  errorEl.textContent = '';

  clearCategory();
  updateAndDraw([...products]);
}

document.getElementById('btn-all').addEventListener('click', showAll);
document.getElementById('btn-in-stock').addEventListener('click', showInStock);
document.getElementById('btn-cheap').addEventListener('click', showCheap);
document.getElementById('btn-expensive').addEventListener('click', showExpensive);
document.getElementById('btn-sort').addEventListener('click', sortByPrice);
document.getElementById('btn-discount').addEventListener('click', applyDiscount);
document.getElementById('btn-reset').addEventListener('click', resetProducts);

document.getElementById('categorySelect').addEventListener('change', filterByCategory);

document.getElementById('add-form').addEventListener('submit', addProduct);

updateAndDraw([...products]);