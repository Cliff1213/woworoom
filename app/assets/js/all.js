console.clear()

const url = 'https://livejs-api.hexschool.io/api/livejs/v1';
const path = 'cliff2022';
let token = '5bBQ25vhH9fZiZP8Ykd3xHgoCZu2';

let cartProducts;

// 所有產品資料取得
const getData = () => {
  axios({
    url: `${url}/customer/${path}/products`,
    headers: {
      'Authorization': token
    }
  })
    .then(res => {
      render(res.data.products)
    })
    .catch(err => console.log(err.message))
}
getData()

// 首頁產品列表渲染
const render = (data) => {
  const productList = document.querySelector('#productList');
  let renderStr = '';
  
  data.forEach(i => {
    const id = i['id'],
          imgUrl = i['images'],
          title = i['title'],
          originPrice = i['origin_price'].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
          price = i['price'].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

    renderStr += `
    <li class="col-md-6 col-lg-3 mb-7">
        <div class="product-card position-relative">
          <div class="product-img">
            <img src="${imgUrl}" class="w-100" alt="img_product">
          </div>
          <a href="#" class="product-btn text-light bg-dark d-block py-3 text-center" data-id="${id}" onclick="addCart(event)">加入購物車</a>
          <h4 class="mt-2">${title}</h4>
          <p class="text-decoration-line-through">${originPrice}</p>
          <p class="fs-2">${price}</p>
          <p class="card-decoration position-absolute top-0 end-0 text-light bg-dark py-2 px-6">新品</p>
        </div>
      </li>`
  })

  productList.innerHTML = renderStr;
}

// 首頁產品篩選
const filterProducts = (event) => {
  const selectValue = event.target.value;
  const filterList = renderData.filter(i => selectValue === i['category'] || selectValue === "全部");
  
  render(filterList)
}

// 使用者購物車資料取得
const getCartsList = () => {
  axios({
    url: `${url}/customer/${path}/carts`,
    headers: {
      'Authorization': token
    }
  })
  .then(res => {
    cartProducts = res.data.carts; // 避免後續重新請求
    renderCart(res.data.carts)
  })
  .catch(err => console.log(err.message))
}
getCartsList()


// 加入購物車
const addCart = (event) => {
  event.preventDefault();

  const addProductId = event.target.dataset.id;

  let accumulateQuantity = 1;

  cartProducts.forEach(i => {
    i['product']['id'] === addProductId? accumulateQuantity += i['quantity']: accumulateQuantity += 0;
  })

  axios({
    url: `${url}/customer/${path}/carts`,
    method: 'post',
    headers: {
      'Authorization': token
    },
    data: {
      "data": {
        "productId": `${addProductId}`,
        "quantity": accumulateQuantity
      }
    }
  })
    .then(res => {
      alert('成功加入購物車')
      renderCart(res.data.carts)
    })
    .catch(err => console.log(err.message))
}


// 首頁購物車列表渲染
const renderCart = (data) => {
  const cartDataList = document.querySelector('#cartDataList');
  let renderStr = '';

  data.forEach(i => {

    const id = i['id'],
          imgUrl = i['product']['images'],
          title = i['product']['title'],
          price = i['product']['price'],
          priceSwitch = price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
          quantity = i['quantity'],
          accumulatePrice = (price * quantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

    renderStr += `
    <tr class="border-bottom">
      <th scope="row">
        <div class="d-flex align-items-center">
          <img src="${imgUrl}" class="me-4 d-none d-lg-block" alt="img_cart" width="80px" height="80px">
          <p>${title}</p>
        </div>
      </th>
      <td>${priceSwitch}</td>
      <td>${quantity}</td>
      <td>${accumulatePrice}</td>
      <td class="text-center">
        <a href="#" class="material-icons" data-id="${id}" onclick="deleteProduct(event)">clear</a>
      </td>
    </tr>`
  })
  cartDataList.innerHTML = renderStr;

  const priceGroup = data.map(i => i.product.price);
  const totalPrice = priceGroup.reduce((acc, cur) => acc + cur, 0).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

  document.querySelector('#totalPrice').textContent = `$NT ${totalPrice}`;

  // console.log(data)
  cartProducts = data;
}

// 刪除購物車所有品項
const deleteAllProducts = () => {
  axios({
    url: `${url}/customer/${path}/carts`,
    method: 'delete',
    headers: {
      'Authorization': token
    }
  })
  .then(res => {
    alert(res.data.message)
    renderCart(res.data.carts)
  })
  .catch(err => alert(err.response.data.message))
}

// 刪除購物車指定品項
const deleteProduct = (event) => {
  event.preventDefault();

  const deleteProductId = event.target.dataset.id;
  console.log(deleteProductId)
  axios({
    url: `${url}/customer/${path}/carts/${deleteProductId}`,
    method: 'delete',
    headers: {
      'Authorization': token
    }
  })
    .then(res => {
      alert('已成功刪除該品項')
      renderCart(res.data.carts)
    })
    .catch(err => console.log(err))
}

// 送出訂單
const orderForm = document.querySelector('#orderForm');

const sendOrder = (event) => {
  event.preventDefault()

  if(cartProducts.length === 0) {
    alert('購物車是空的')
    return;
  }else if(formValidation() !== undefined) {
    alert('請填入正確訂單資訊')
    return;
  }

  const orderName = document.querySelector('#orderName'),
        orderTel = document.querySelector('#orderTel'),
        orderEmail = document.querySelector('#orderEmail'),
        orderAddress = document.querySelector('#orderAddress'),
        orderPayment = document.querySelector('#orderPayment');

  axios({
    url: `${url}/customer/${path}/orders`,
    method: 'post',
    headers: {
      'Authorization': token
    },
    data: {
      "data": {
        "user": {
          "name": `${orderName.value}`,
          "tel": `${orderTel.value}`,
          "email": `${orderEmail.value}`,
          "address": `${orderAddress.value}`,
          "payment": `${orderPayment.value}`
        }
      }
    }
  })
    .then(res => {
      alert('訂單已送出')
      cartProducts = [] // 送出訂單後清空購物車並再次渲染
      renderCart(cartProducts)
      orderForm.reset();
    })
    .catch(err => console.log(err))
}


// 表單驗證
const formValidation = () => {
  const constraints = {
    orderName: {
      presence: {
        message: '欄位必填'
      }
    },
    orderTel: {
      presence: {
        message: '欄位必填'
      },
      format: {
        pattern: /^[0-9]+$/,
        message: '只能是數字 0-9'
      }
    },
    orderEmail: {
      presence: {
        message: '此欄位必填'
      },
      format: {
        pattern: /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/,
        message: 'Email 格式錯誤'
      }
    },
    orderAddress: {
      presence: {
        message: '此欄位必填'
      }
    }
  }

  const inputList = document.querySelectorAll('#orderForm input[type=text]');

  const idList = [];
  inputList.forEach(i => idList.push(i.getAttribute('id')))
  
  const errorMessage = validate(orderForm, constraints)

  idList.forEach(domId => {
    document.querySelector(`#${domId}`).nextElementSibling.textContent = null;
    // console.log(errorMessage)

    // ! Object.entries/key/value 踩雷：（如果結果為 undefined、null，皆會回傳錯誤，解決方法可加入 {} 與原物件做比較，避免最終結果為空）
    Object.entries(errorMessage || {}).forEach(i => {
      if(domId === i[0]) {
        document.querySelector(`#${domId}`).nextElementSibling.textContent = i[1];
      }
    })
  })
  return errorMessage;
}