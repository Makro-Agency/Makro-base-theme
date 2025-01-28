// cart upsell

$(document).ready(function () {
  $('.add_upsell').prop('checked', true);
  $('.productVariantId').toggleClass('active');

  $(".upsell_product_container .add_upsell").click(function() {
      // $(this).toggleClass('active');

      var addUpsellBoxID = $(this).attr('data-id');
      $('.productVariantId').filter(function() {
          return $(this).attr('data-id') === addUpsellBoxID;
      }).toggleClass('active');

      // updatting total payment of upsell
      updateTotalPayment();


  });

  $('#btn_addcart_upsell').click(function (event) {
      this.disabled = true;
      $('.loading__spinner').removeClass('hidden');

      event.preventDefault();
      var itemsToAddCart = [];
      i = 0;
      $('.upsell_product_container .productVariantId.active').each(function() {
          itemsToAddCart[i++] = $(this).val();
      });
      console.log('itemsToAddCart ', itemsToAddCart);
      
      // merging an array with comma (,)
      var newitemsToAddCart = [itemsToAddCart.join(',')];
      var newvalue = newitemsToAddCart;

      Shopify.queue = [];
      var newArray = newvalue.toString().split(',');
      for (var i = 0; i < newArray.length; i++) {
          product = newArray[i];
          Shopify.queue.push({
              variantId: product,
          });
      }

      Shopify.moveAlong = function () {
          // If we still have requests in the queue, let's process the next one.
          if (Shopify.queue.length) {
              var request = Shopify.queue.shift();
              var data = 'id=' + request.variantId + '&quantity=1'
              $.ajax({
                  type: 'POST',
                  url: '/cart/add.js',
                  dataType: 'json',
                  data: data,
                  success: function (response) {
                      Shopify.moveAlong();
                      // console.log('response ', response);
                      $('#btn_addcart_upsell').removeAttr('disabled');
                      $('.loading__spinner').addClass('hidden');

                      $('#cart-icon-bubble').load(location.href + " #cart-icon-bubble");
                      
                      //submit form after success 
                      // setTimeout(function () {
                      //     window.location.href = "/cart";
                      // }, 1000);
                  },
                  error: function (response) {
                      console.log('error response ', response);
                      $('#btn_addcart_upsell').removeAttr('disabled');
                      $('.loading__spinner').addClass('hidden');
                  }
              });
          }
      };
      Shopify.moveAlong();

      $('#cart-icon-bubble').trigger('click');
      setTimeout(function () {
          $('cart-drawer').addClass("active");
          $('.drawer__inner-empty').hide();
          $('cart-drawer').load(location.href + " #CartDrawer");
          $(".drawer").removeClass("is-empty");
      }, 3000);
      
  });


  const {
      host, hostname, href, origin, pathname, port, protocol, search
    } = window.location;

  function updateVariationDetails(variantOption, isChanged) {
      let currPID = $(variantOption).attr('data-pid');
      
      var selectedOption = $('option:selected', variantOption);
      var dataset = selectedOption[0].dataset;
      
      // Update price and title
      $('.selected_variation_price[data-pid="' + currPID + '"]').text(dataset.price);
      $('.selected_variation_title[data-pid="' + currPID + '"]').text(dataset.prodname +' - '+ dataset.title);
      
      // Update image src
      var prodImage = $('.selected_variation_image[data-pid="' + currPID + '"]')[0];
      prodImage.src = origin+'/cdn/shop/'+dataset.img_url;
      
      // Update selected variation id in input to pass value during add to cart
      $('.selected_variation_id[data-pid="' + currPID + '"]').val(variantOption.value);

      if (isChanged) {
          // updatting new id with new selected varient price
          var priceToUpdate = dataset.price.split('.');
          $('.selected_variation_id[data-pid="' + currPID + '"]').attr('id', 'price_'+priceToUpdate[1]);
          updateTotalPayment();
      }


  }

  $('.product_variations').each(function() {
      updateVariationDetails(this, false);
  });

  $('.product_variations').change(function() {
      updateVariationDetails(this, true);
      console.log('selecetd option ',this)
  });


  function updateTotalPayment() {
      i = 0;
      var upSellItems = [];
      $('.upsell_product_container .productVariantId.active').each(function() {
          upSellItems[i++] = $(this).attr('id');
      });
      console.log('upSellItems ', upSellItems);

      var totalPayment = 0;
      for (var i = 0; i < upSellItems.length; i++) {
          var parts = upSellItems[i].split('_');
          var value = parseFloat(parts[1].replace(',', ''));
          totalPayment += value;
      }
      console.log('totalPayment :', totalPayment.toFixed(2));

      // format price function as per store
      function localizeCurrency(amount) {
          const locale = window.Shopify.locale;
          const country = window.Shopify.country
          const currencyCode = window.Shopify.currency.active;
      
          return new Intl.NumberFormat(`${locale}-${country}`, {
              style: 'currency',
              currency: currencyCode,
          }).format(amount);
      }
  

      $('.total_payment').text(localizeCurrency(totalPayment));
      if (totalPayment <= 0) {
          $('#btn_addcart_upsell').prop('disabled', true);
          $('#btn_addcart_upsell span').text('Select Products to Buy');
      } else {
          $('#btn_addcart_upsell').removeAttr('disabled');
          $('#btn_addcart_upsell span').text('Add to cart Up-Sell');
      }
  }

  updateTotalPayment();
});


//limited offer
document.addEventListener("DOMContentLoaded", function () {
  const countdownElement = document.getElementById("countdown");

  // Set the end date for the offer
  const offerEndDate = new Date("2025-01-31T23:59:59"); // Adjust the date and time as needed

  function updateCountdown() {
    const now = new Date();
    const timeRemaining = offerEndDate - now;

    if (timeRemaining > 0) {
      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      document.getElementById("days").textContent = days.toString().padStart(2, "0");
      document.getElementById("hours").textContent = hours.toString().padStart(2, "0");
      document.getElementById("minutes").textContent = minutes.toString().padStart(2, "0");
      document.getElementById("seconds").textContent = seconds.toString().padStart(2, "0");
    } else {
      countdownElement.innerHTML = "Offer has ended!";
    }
  }

  // Update the countdown every second
  setInterval(updateCountdown, 1000);
  updateCountdown(); // Run immediately to avoid delay
});



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
