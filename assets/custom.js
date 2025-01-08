document.addEventListener('DOMContentLoaded', () => {
  // Set default selected swatch on page load
  const firstAvailableSwatch = document.querySelector('.swatch:not(.swatch--disabled)');
  if (firstAvailableSwatch) {
    firstAvailableSwatch.classList.add('swatch--selected');
    const variantId = firstAvailableSwatch.getAttribute('data-variant-id');
    const addToCartButton = document.querySelector('.add-to-cart-button');
    addToCartButton.setAttribute('data-product-id', variantId);
    document.querySelector('#product-variant').value = variantId;
  }

  // Swatch selection logic
  document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', function () {
      if (this.classList.contains('swatch--disabled')) return; // Skip disabled swatches

      // Deselect other swatches
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('swatch--selected'));

      // Select clicked swatch
      this.classList.add('swatch--selected');

      // Update hidden input value with the selected variant ID
      const variantId = this.getAttribute('data-variant-id');
      const addToCartButton = document.querySelector('.add-to-cart-button');
      addToCartButton.setAttribute('data-product-id', variantId);
      document.querySelector('#product-variant').value = variantId;
    });
  });

  // Quantity buttons logic
  document.querySelector('.quantity-minus').addEventListener('click', function () {
    const quantityInput = document.querySelector('#product-quantity');
    let quantity = parseInt(quantityInput.value, 10);
    if (quantity > 1) quantityInput.value = quantity - 1;
  });

  document.querySelector('.quantity-plus').addEventListener('click', function () {
    const quantityInput = document.querySelector('#product-quantity');
    let quantity = parseInt(quantityInput.value, 10);
    quantityInput.value = quantity + 1;
  });

  // Add to Cart logic
  document.querySelector('.add-to-cart-button').addEventListener('click', function () {
    const productId = this.getAttribute('data-product-id'); // Get variant ID from the button
    const quantity = document.querySelector('#product-quantity').value; // Get quantity from input field

    if (!productId) {
      console.error('No product variant ID selected');
      alert('Please select a variant before adding to cart.');
      return; // Prevent further execution
    }

    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [{ id: parseInt(productId, 10), quantity: parseInt(quantity, 10) }]
      })
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to add item to cart');
        return response.json();
      })
      .then(data => {
        console.log('Item added to cart:', data);
        updateCartIcon(); // Call this function to update the cart icon
      })
      .catch(error => {
        console.error('Error adding product to cart:', error);
      });
  });

  // Function to update the cart icon with the product count
  function updateCartIcon() {
    fetch('/cart.js')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch cart data');
        return response.json();
      })
      .then(cart => {
        console.log('Cart:', cart); // Debugging: Log the cart object
        const cartCount = cart.item_count; // Total number of items in the cart
        const cartIcon = document.querySelector('.cart-icon');

        if (cartIcon) {
          if (cartCount > 0) {
            cartIcon.classList.add('has-items');
            cartIcon.querySelector('.cart-count').textContent = cartCount;
          } else {
            cartIcon.classList.remove('has-items');
            cartIcon.querySelector('.cart-count').textContent = '';
          }
        }
      })
      .catch(error => console.error('Error updating cart icon:', error));
  }
});
