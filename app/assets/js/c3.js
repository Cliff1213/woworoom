// 訂單取得
const getOrders = () => {

  axios({
    url: `${url}/admin/${path}/orders`,
    headers: {
      'Authorization': token
    }
  })
    .then(res => {
      renderChart(res.data.orders)
      renderTable(res.data.orders)
    })
    .catch(err => console.log(err))
}
getOrders()

// 圖表渲染
const renderChart = (data) => {
  const newData = {}

  data.forEach(order => {
    order.products.forEach(product => {

      if(!newData[product['title']]) {
        newData[product['title']] = product['quantity'];
      }else {
        newData[product['title']] += product['quantity'];
      }
    })
  })

  const chartData = Object.entries(newData)
  settingChart(chartData)
}

// 表格渲染
const renderTable = (data) => {
  const manageList = document.querySelector('#manageList');
  let str = '';

  data.forEach(i => {

    const timeStamp = new Date(i['createdAt'] * 1000);
    const createDate = `${timeStamp.getFullYear()}/${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;
    const orderProducts = i['products'].map(item => `<p>${item['title']} x ${item['quantity']}</p>`).join("");

    let orderStatus = '';
    if(!i['paid']) {
      orderStatus = '未處理';
    }else {
      orderStatus = '已處理';
    }

    str += `
    <tr>
      <td>${i['id']}</td>
      <td>${i['user']['name']}<br>${i['user']['tel']}</td>
      <td>${i['user']['address']}</td>
      <td>${i['user']['email']}</td>
      <td>${orderProducts}</td>
      <td>${createDate}</td>
      <td class="text-center">
        <a href="#" class="text-decoration-underline text-primary" data-id="${i['id']}" data-status="${i['paid']}" onclick="switchStatus(event)">${orderStatus}</a>
      </td>
      <td class="text-center">
        <a href="#" class="btn btn-danger" data-id="${i['id']}" onclick="deleteOrder(event)">刪除</a>
      </td>
    </tr>`
  })
  manageList.innerHTML = str;
}

// 圖表設定
const settingChart = (data) => {
  const chart = c3.generate({
    bindto: '#chart',
    data: {
      columns: data,
      type: 'pie',
    }
  })
}

// 狀態切換
const switchStatus = (event) => {
  event.preventDefault();

  const orderId = event.target.dataset.id;
  const orderStatus = event.target.dataset.status;

  if(orderStatus === 'false') {
    axios({
      url: `${url}/admin/${path}/orders`,
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
    })
      .then(res => {
        renderChart(res.data.orders)
        renderTable(res.data.orders)
      })
      .catch(err => console.log(err))
  } else {
    axios({
      url: `${url}/admin/${path}/orders`,
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
    })
      .then(res => {
        renderChart(res.data.orders)
        renderTable(res.data.orders)
      })
      .catch(err => console.log(err))
  }
}

// 刪除指定訂單
const deleteOrder = (event) => {
  event.preventDefault();

  const deleteId = event.target.dataset.id;

  axios({
    url: `${url}/admin/${path}/orders/${deleteId}`,
    method: 'delete',
    headers: {
      'Authorization': token
    }
  })
    .then(res => {
      alert('已刪除該筆訂單')
      renderChart(res.data.orders)
      renderTable(res.data.orders)
    })
    .catch(err => console.log(err))
}

// 清除全部訂單
const deleteAllOrders = (event) => {
  event.preventDefault()

  axios({
    url: `${url}/admin/${path}/orders`,
    method: 'delete',
    headers: {
      'Authorization': token
    }
  })
    .then(res => {
      alert(res.data.message)
      renderChart(res.data.orders)
      renderTable(res.data.orders)
    })
    .catch(err => console.log(err))
}