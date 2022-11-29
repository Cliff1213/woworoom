"use strict";

console.clear();
var url = 'https://livejs-api.hexschool.io/api/livejs/v1';
var path = 'cliff2022';
var token = '5bBQ25vhH9fZiZP8Ykd3xHgoCZu2';
var renderData;
var cartProducts; // 所有產品資料取得

var getData = function getData() {
  axios({
    url: "".concat(url, "/customer/").concat(path, "/products"),
    headers: {
      'Authorization': token
    }
  }).then(function (res) {
    renderData = res.data.products;
    render(res.data.products);
  })["catch"](function (err) {
    return console.log(err.message);
  });
};

getData(); // 首頁產品列表渲染

var render = function render(data) {
  var productList = document.querySelector('#productList');
  var renderStr = '';
  data.forEach(function (i) {
    var id = i['id'],
        imgUrl = i['images'],
        title = i['title'],
        originPrice = i['origin_price'].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        price = i['price'].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    renderStr += "\n    <li class=\"col-md-6 col-lg-3 mb-7\">\n        <div class=\"product-card position-relative\">\n          <div class=\"product-img\">\n            <img src=\"".concat(imgUrl, "\" class=\"w-100\" alt=\"img_product\">\n          </div>\n          <a href=\"#\" class=\"product-btn text-light bg-dark d-block py-3 text-center\" data-id=\"").concat(id, "\" onclick=\"addCart(event)\">\u52A0\u5165\u8CFC\u7269\u8ECA</a>\n          <h4 class=\"mt-2\">").concat(title, "</h4>\n          <p class=\"text-decoration-line-through\">").concat(originPrice, "</p>\n          <p class=\"fs-2\">").concat(price, "</p>\n          <p class=\"card-decoration position-absolute top-0 end-0 text-light bg-dark py-2 px-6\">\u65B0\u54C1</p>\n        </div>\n      </li>");
  });
  productList.innerHTML = renderStr;
}; // 首頁產品篩選


var filterProducts = function filterProducts(event) {
  var selectValue = event.target.value;
  var filterList = renderData.filter(function (i) {
    return selectValue === i['category'] || selectValue === "全部";
  });
  render(filterList);
}; // 使用者購物車資料取得


var getCartsList = function getCartsList() {
  axios({
    url: "".concat(url, "/customer/").concat(path, "/carts"),
    headers: {
      'Authorization': token
    }
  }).then(function (res) {
    cartProducts = res.data.carts; // 避免後續重新請求

    renderCart(res.data.carts);
  })["catch"](function (err) {
    return console.log(err.message);
  });
};

getCartsList(); // 加入購物車

var addCart = function addCart(event) {
  event.preventDefault();
  var addProductId = event.target.dataset.id;
  var accumulateQuantity = 1;
  cartProducts.forEach(function (i) {
    i['product']['id'] === addProductId ? accumulateQuantity += i['quantity'] : accumulateQuantity += 0;
  });
  axios({
    url: "".concat(url, "/customer/").concat(path, "/carts"),
    method: 'post',
    headers: {
      'Authorization': token
    },
    data: {
      "data": {
        "productId": "".concat(addProductId),
        "quantity": accumulateQuantity
      }
    }
  }).then(function (res) {
    alert('成功加入購物車');
    renderCart(res.data.carts);
  })["catch"](function (err) {
    return console.log(err.message);
  });
}; // 首頁購物車列表渲染


var renderCart = function renderCart(data) {
  var cartDataList = document.querySelector('#cartDataList');
  var renderStr = '';
  data.forEach(function (i) {
    var id = i['id'],
        imgUrl = i['product']['images'],
        title = i['product']['title'],
        price = i['product']['price'],
        priceSwitch = price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","),
        quantity = i['quantity'],
        accumulatePrice = (price * quantity).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
    renderStr += "\n    <tr class=\"border-bottom\">\n      <th scope=\"row\">\n        <div class=\"d-flex align-items-center\">\n          <img src=\"".concat(imgUrl, "\" class=\"me-4 d-none d-lg-block\" alt=\"img_cart\" width=\"80px\" height=\"80px\">\n          <p>").concat(title, "</p>\n        </div>\n      </th>\n      <td>").concat(priceSwitch, "</td>\n      <td>").concat(quantity, "</td>\n      <td>").concat(accumulatePrice, "</td>\n      <td class=\"text-center\">\n        <a href=\"#\" class=\"material-icons\" data-id=\"").concat(id, "\" onclick=\"deleteProduct(event)\">clear</a>\n      </td>\n    </tr>");
  });
  cartDataList.innerHTML = renderStr;
  var priceGroup = data.map(function (i) {
    return i.product.price;
  });
  var totalPrice = priceGroup.reduce(function (acc, cur) {
    return acc + cur;
  }, 0).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  document.querySelector('#totalPrice').textContent = "$NT ".concat(totalPrice); // console.log(data)

  cartProducts = data;
}; // 刪除購物車所有品項


var deleteAllProducts = function deleteAllProducts() {
  axios({
    url: "".concat(url, "/customer/").concat(path, "/carts"),
    method: 'delete',
    headers: {
      'Authorization': token
    }
  }).then(function (res) {
    alert(res.data.message);
    renderCart(res.data.carts);
  })["catch"](function (err) {
    return alert(err.response.data.message);
  });
}; // 刪除購物車指定品項


var deleteProduct = function deleteProduct(event) {
  event.preventDefault();
  var deleteProductId = event.target.dataset.id;
  console.log(deleteProductId);
  axios({
    url: "".concat(url, "/customer/").concat(path, "/carts/").concat(deleteProductId),
    method: 'delete',
    headers: {
      'Authorization': token
    }
  }).then(function (res) {
    alert('已成功刪除該品項');
    renderCart(res.data.carts);
  })["catch"](function (err) {
    return console.log(err);
  });
}; // 送出訂單


var orderForm = document.querySelector('#orderForm');

var sendOrder = function sendOrder(event) {
  event.preventDefault();

  if (cartProducts.length === 0) {
    alert('購物車是空的');
    return;
  } else if (formValidation() !== undefined) {
    alert('請填入正確訂單資訊');
    return;
  }

  var orderName = document.querySelector('#orderName'),
      orderTel = document.querySelector('#orderTel'),
      orderEmail = document.querySelector('#orderEmail'),
      orderAddress = document.querySelector('#orderAddress'),
      orderPayment = document.querySelector('#orderPayment');
  axios({
    url: "".concat(url, "/customer/").concat(path, "/orders"),
    method: 'post',
    headers: {
      'Authorization': token
    },
    data: {
      "data": {
        "user": {
          "name": "".concat(orderName.value),
          "tel": "".concat(orderTel.value),
          "email": "".concat(orderEmail.value),
          "address": "".concat(orderAddress.value),
          "payment": "".concat(orderPayment.value)
        }
      }
    }
  }).then(function (res) {
    alert('訂單已送出');
    cartProducts = []; // 送出訂單後清空購物車並再次渲染

    renderCart(cartProducts);
    orderForm.reset();
  })["catch"](function (err) {
    return console.log(err);
  });
}; // 表單驗證


var formValidation = function formValidation() {
  var constraints = {
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
  };
  var inputList = document.querySelectorAll('#orderForm input[type=text]');
  var idList = [];
  inputList.forEach(function (i) {
    return idList.push(i.getAttribute('id'));
  });
  var errorMessage = validate(orderForm, constraints);
  idList.forEach(function (domId) {
    document.querySelector("#".concat(domId)).nextElementSibling.textContent = null; // console.log(errorMessage)
    // ! Object.entries/key/value 踩雷：（如果結果為 undefined、null，皆會回傳錯誤，解決方法可加入 {} 與原物件做比較，避免最終結果為空）

    Object.entries(errorMessage || {}).forEach(function (i) {
      if (domId === i[0]) {
        document.querySelector("#".concat(domId)).nextElementSibling.textContent = i[1];
      }
    });
  });
  return errorMessage;
};
"use strict";

// 訂單取得
var getOrders = function getOrders() {
  axios({
    url: "".concat(url, "/admin/").concat(path, "/orders"),
    headers: {
      'Authorization': token
    }
  }).then(function (res) {
    renderChart(res.data.orders);
    renderTable(res.data.orders);
  })["catch"](function (err) {
    return console.log(err);
  });
};

getOrders(); // 圖表渲染

var renderChart = function renderChart(data) {
  var newData = {};
  data.forEach(function (order) {
    order.products.forEach(function (product) {
      if (!newData[product['title']]) {
        newData[product['title']] = product['quantity'];
      } else {
        newData[product['title']] += product['quantity'];
      }
    });
  });
  var chartData = Object.entries(newData);
  settingChart(chartData);
}; // 表格渲染


var renderTable = function renderTable(data) {
  var manageList = document.querySelector('#manageList');
  var str = '';
  data.forEach(function (i) {
    var timeStamp = new Date(i['createdAt'] * 1000);
    var createDate = "".concat(timeStamp.getFullYear(), "/").concat(timeStamp.getMonth() + 1, "/").concat(timeStamp.getDate());
    var orderProducts = i['products'].map(function (item) {
      return "<p>".concat(item['title'], " x ").concat(item['quantity'], "</p>");
    }).join("");
    var orderStatus = '';

    if (!i['paid']) {
      orderStatus = '未處理';
    } else {
      orderStatus = '已處理';
    }

    str += "\n    <tr>\n      <td>".concat(i['id'], "</td>\n      <td>").concat(i['user']['name'], "<br>").concat(i['user']['tel'], "</td>\n      <td>").concat(i['user']['address'], "</td>\n      <td>").concat(i['user']['email'], "</td>\n      <td>").concat(orderProducts, "</td>\n      <td>").concat(createDate, "</td>\n      <td class=\"text-center\">\n        <a href=\"#\" class=\"text-decoration-underline text-primary\" data-id=\"").concat(i['id'], "\" data-status=\"").concat(i['paid'], "\" onclick=\"switchStatus(event)\">").concat(orderStatus, "</a>\n      </td>\n      <td class=\"text-center\">\n        <a href=\"#\" class=\"btn btn-danger\" data-id=\"").concat(i['id'], "\" onclick=\"deleteOrder(event)\">\u522A\u9664</a>\n      </td>\n    </tr>");
  });
  manageList.innerHTML = str;
}; // 圖表設定


var settingChart = function settingChart(data) {
  var chart = c3.generate({
    bindto: '#chart',
    data: {
      columns: data,
      type: 'pie'
    }
  });
}; // 狀態切換


var switchStatus = function switchStatus(event) {
  event.preventDefault();
  var orderId = event.target.dataset.id;
  var orderStatus = event.target.dataset.status;

  if (orderStatus === 'false') {
    axios({
      url: "".concat(url, "/admin/").concat(path, "/orders"),
      method: 'put',
      headers: {
        'Authorization': token
      },
      data: {
        "data": {
          "id": orderId,
          "paid": true
        }
      }
    }).then(function (res) {
      renderChart(res.data.orders);
      renderTable(res.data.orders);
    })["catch"](function (err) {
      return console.log(err);
    });
  } else {
    axios({
      url: "".concat(url, "/admin/").concat(path, "/orders"),
      method: 'put',
      headers: {
        'Authorization': token
      },
      data: {
        "data": {
          "id": orderId,
          "paid": false
        }
      }
    }).then(function (res) {
      renderChart(res.data.orders);
      renderTable(res.data.orders);
    })["catch"](function (err) {
      return console.log(err);
    });
  }
}; // 刪除指定訂單


var deleteOrder = function deleteOrder(event) {
  event.preventDefault();
  var deleteId = event.target.dataset.id;
  axios({
    url: "".concat(url, "/admin/").concat(path, "/orders/").concat(deleteId),
    method: 'delete',
    headers: {
      'Authorization': token
    }
  }).then(function (res) {
    alert('已刪除該筆訂單');
    renderChart(res.data.orders);
    renderTable(res.data.orders);
  })["catch"](function (err) {
    return console.log(err);
  });
}; // 清除全部訂單


var deleteAllOrders = function deleteAllOrders(event) {
  event.preventDefault();
  axios({
    url: "".concat(url, "/admin/").concat(path, "/orders"),
    method: 'delete',
    headers: {
      'Authorization': token
    }
  }).then(function (res) {
    alert(res.data.message);
    renderChart(res.data.orders);
    renderTable(res.data.orders);
  })["catch"](function (err) {
    return console.log(err);
  });
};
"use strict";

var swiper = new Swiper(".mySwiper", {
  spaceBetween: 30,
  breakpoints: {
    768: {
      slidesPerView: 2
    },
    1200: {
      slidesPerView: 3
    }
  }
});
//# sourceMappingURL=all.js.map
