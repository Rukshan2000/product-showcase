

 // Fetch product data from product.json
 fetch('products.json')
 .then(response => response.json())
 .then(products => {
     // Initialize IndexedDB and load products
     let db;
     const request = indexedDB.open('ProductDB', 1);

     request.onupgradeneeded = function(event) {
         db = event.target.result;
         if (!db.objectStoreNames.contains('cart')) {
             db.createObjectStore('cart', { keyPath: 'id' });
         }
     };

     request.onsuccess = function(event) {
         db = event.target.result;
         loadProducts(products);
         populateFilters(products);  // Load categories dynamically
     };

     request.onerror = function(event) {
         console.error('IndexedDB error:', event.target.errorCode);
     };

     // Load products into the grid
     function loadProducts(products) {
         const productGrid = document.getElementById('productGrid');
         productGrid.innerHTML = '';
         products.forEach(product => {
             const productCard = document.createElement('div');
             productCard.className = 'bg-white p-6 rounded-lg shadow';
             productCard.innerHTML = `
                 <img src="${product.image}" alt="${product.name}" class="w-full h-56 object-cover rounded">
                 <h3 class="text-lg font-semibold">${product.name}</h3>
                 <p class="text-gray-700">${product.description}</p>
                 <p class="text-lg font-bold">LKR ${product.price}</p>
                 <button type="button" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded" id="viewButton-${product.id}">
                     View
                 </button>
             `;
             productGrid.appendChild(productCard);

             // Add event listener for the view button
             document.getElementById(`viewButton-${product.id}`).addEventListener('click', function() {
                 viewProduct(product);
             });
         });
     }

     // Load categories dynamically
      // Function to fetch and populate the filters
      async function populateFilters() {
        try {
            const response = await fetch('categories.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log(data);  // Log the data to see if it's correct
            
            // Populate Category Filter
            const categoryFilter = document.getElementById("categoryFilter");
            data.categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
    
            // Populate Price Range Filter
            const priceFilter = document.getElementById("priceFilter");
            data.priceRanges.forEach(priceRange => {
                const option = document.createElement("option");
                option.value = priceRange.id;
                option.textContent = priceRange.range;
                priceFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching categories.json:', error);
        }
    }
    

    // Call the function on page load
    window.onload = populateFilters;
     // View product details
     function viewProduct(product) {
         document.getElementById('modalProductName').textContent = product.name;
         document.getElementById('modalProductDescription').textContent = product.description;
         document.getElementById('modalProductPrice').textContent = `LKR ${product.price}`;
         document.getElementById('productModal').classList.remove('hidden');

         // Update total price based on quantity input
         document.getElementById('quantity').oninput = function() {
             const quantity = parseInt(this.value, 10);
             const totalPrice = quantity * product.price;
             document.getElementById('modalTotalPrice').textContent = `Total: LKR ${totalPrice}`;
         };

         // Handle increase and decrease buttons
         document.getElementById('increaseQty').onclick = function() {
             let qty = parseInt(document.getElementById('quantity').value);
             qty++;
             document.getElementById('quantity').value = qty;
             document.getElementById('quantity').dispatchEvent(new Event('input'));
         };

         document.getElementById('decreaseQty').onclick = function() {
             let qty = parseInt(document.getElementById('quantity').value);
             if (qty > 1) {
                 qty--;
                 document.getElementById('quantity').value = qty;
                 document.getElementById('quantity').dispatchEvent(new Event('input'));
             }
         };

         document.getElementById('addToCart').onclick = function() {
             addToCart(product);
             document.getElementById('productModal').classList.add('hidden');
         };
     }

     // Add product to cart
     function addToCart(product) {
         const quantity = parseInt(document.getElementById('quantity').value, 10);
         const productWithQty = { ...product, qty: quantity };  // Change quantity to qty
         const transaction = db.transaction(['cart'], 'readwrite');
         const store = transaction.objectStore('cart');
         store.put(productWithQty);

         // Show notification
         const notification = document.getElementById('notification');
         notification.classList.remove('hidden');
         setTimeout(() => {
             notification.classList.add('hidden');
         }, 3000);
     }

     // Close modal
     document.getElementById('closeModal').onclick = function() {
         document.getElementById('productModal').classList.add('hidden');
     };

     // Filter products
     document.getElementById('categoryFilter').onchange = function() {
         const category = this.value;
         const filteredProducts = category === 'all' ? products : products.filter(p => p.category === category);
         updateProductGrid(filteredProducts);
     };

     document.getElementById('priceFilter').onchange = function() {
         const priceRange = this.value;
         let filteredProducts = products;
         if (priceRange !== 'all') {
             const [min, max] = priceRange.split('-').map(Number);
             filteredProducts = products.filter(p => p.price >= min && p.price <= max);
         }
         updateProductGrid(filteredProducts);
     };

     function updateProductGrid(filteredProducts) {
         const productGrid = document.getElementById('productGrid');
         productGrid.innerHTML = '';
         filteredProducts.forEach(product => {
             const productCard = document.createElement('div');
             productCard.className = 'bg-white p-6 rounded-lg shadow';
             productCard.innerHTML = `
                 <img src="${product.image}" alt="${product.name}" class="w-full h-56 object-cover rounded">
                 <h3 class="text-lg font-semibold">${product.name}</h3>
                 <p class="text-gray-700">${product.description}</p>
                 <p class="text-lg font-bold">LKR ${product.price}</p>
                 <button type="button" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded" id="viewButton-${product.id}">
                     View
                 </button>
             `;
             productGrid.appendChild(productCard);

             // Add event listener for the view button
             document.getElementById(`viewButton-${product.id}`).addEventListener('click', function() {
                 viewProduct(product);
             });
         });
     }
 })
 .catch(error => console.error('Error loading products:', error));


 //.......................................................................

 let db;

        // Initialize IndexedDB
        const request = indexedDB.open('ProductDB', 1);

        request.onupgradeneeded = function(event) {
            db = event.target.result;
            if (!db.objectStoreNames.contains('cart')) {
                db.createObjectStore('cart', { keyPath: 'id' });
            }
        };

        request.onsuccess = function(event) {
            db = event.target.result;
            loadCartItems();
        };

        request.onerror = function(event) {
            console.error('IndexedDB error:', event.target.errorCode);
        };

        // Load cart items into the cart page
        function loadCartItems() {
            const cartItems = document.getElementById('cartItems');
            const cartTotal = document.getElementById('cartTotal');
            cartItems.innerHTML = '';
            let total = 0;

            const transaction = db.transaction(['cart'], 'readonly');
            const store = transaction.objectStore('cart');
            const request = store.getAll();

            request.onsuccess = function(event) {
                const items = event.target.result;
                if (items.length === 0) {
                    cartItems.innerHTML = '<p class="text-gray-700 col-span-full">Your cart is empty.</p>';
                    cartTotal.innerHTML = '';
                } else {
                    items.forEach(item => {
                        // Ensure qty is initialized if undefined
                        if (item.qty === undefined) {
                            item.qty = 1;
                            const transaction = db.transaction(['cart'], 'readwrite');
                            const store = transaction.objectStore('cart');
                            store.put(item); // Update the cart item with default quantity
                        }

                        const cartItem = document.createElement('div');
                        cartItem.className = 'bg-white p-6 rounded-lg shadow-md flex flex-col justify-between space-y-4';
                        cartItem.innerHTML = `
                            <div>
                                <h3 class="text-xl font-semibold text-gray-800">${item.name}</h3>
                                <p class="text-gray-600">Price: LKR ${item.price}</p>
                            </div>
                            <div class="flex items-center justify-between space-x-4">
                                <div class="flex items-center space-x-2">
                                    <button onclick="decreaseQty(${item.id})" class="px-3 py-1 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300">-</button>
                                    <p class="text-gray-800">Qty: ${item.qty}</p>
                                    <button onclick="increaseQty(${item.id})" class="px-3 py-1 bg-gray-200 rounded-full text-gray-700 hover:bg-gray-300">+</button>
                                </div>
                                <div>
                                    <p class="text-lg font-bold text-gray-800">Total: LKR ${item.price * item.qty}</p>
                                    <button onclick="removeItem(${item.id})" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Remove</button>
                                </div>
                            </div>
                        `;
                        cartItems.appendChild(cartItem);
                        total += item.price * item.qty;
                    });

                    cartTotal.innerHTML = `<p class="font-semibold">Total: LKR ${total}</p>`;
                }
            };

            request.onerror = function(event) {
                console.error('Error loading cart items:', event.target.error);
            };
        }

        // Increase quantity of a product
        function increaseQty(productId) {
            const transaction = db.transaction(['cart'], 'readwrite');
            const store = transaction.objectStore('cart');
            const request = store.get(productId);

            request.onsuccess = function(event) {
                const product = event.target.result;
                product.qty += 1;
                store.put(product);
                loadCartItems(); // Reload cart items after update
            };

            request.onerror = function(event) {
                console.error('Error increasing quantity:', event.target.error);
            };
        }

        // Decrease quantity of a product
        function decreaseQty(productId) {
            const transaction = db.transaction(['cart'], 'readwrite');
            const store = transaction.objectStore('cart');
            const request = store.get(productId);

            request.onsuccess = function(event) {
                const product = event.target.result;
                if (product.qty > 1) {
                    product.qty -= 1;
                    store.put(product);
                    loadCartItems(); // Reload cart items after update
                }
            };

            request.onerror = function(event) {
                console.error('Error decreasing quantity:', event.target.error);
            };
        }

        // Remove item from cart
        function removeItem(productId) {
            const transaction = db.transaction(['cart'], 'readwrite');
            const store = transaction.objectStore('cart');
            store.delete(productId);
            loadCartItems(); // Reload cart items after removal
        }

        // Order now button functionality
        document.getElementById('orderNow').onclick = function() {
            const transaction = db.transaction(['cart'], 'readonly');
            const store = transaction.objectStore('cart');
            const request = store.getAll();

            request.onsuccess = function(event) {
                const items = event.target.result;
                if (items.length === 0) {
                    alert("Your cart is empty.");
                    return;
                }

                let total = 0;
                const message = items.map(item => {
                    total += item.price * item.qty;
                    return `${item.name} - LKR ${item.price} x ${item.qty}`;
                }).join('%0A');

                const whatsappUrl = `https://wa.me/+94779054385?text=Order Details:%0A${message}%0A%0ATotal: $${total}`;
                window.open(whatsappUrl, '_blank');
            };

            request.onerror = function(event) {
                console.error('Error fetching cart items:', event.target.error);
            };
        };