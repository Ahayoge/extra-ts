import React, { useEffect, useState } from "react";
import axios from "axios";

interface Product {
  id: number;
  title: string;
  price: number;
}

interface OrderItem {
  product_id: number;
  quantity: number;
}

interface SaveOrderResponse {
  success: boolean;
  code: string;
}

const OrderPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get("https://dev-su.eda1.ru/test_task/products.php")
      .then(response => {
        if (response.data.success) {
          setProducts(response.data.products);
        }
      })
      .catch(error => console.error("Ошибка получения данных", error));
  }, []);

  const addProductToOrder = () => {
    if (selectedProductId && quantity > 0) {
      const existingOrderItemIndex = orderItems.findIndex(
        item => item.product_id === selectedProductId
      );
      if (existingOrderItemIndex > -1) {
        const updatedOrderItems = [...orderItems];
        updatedOrderItems[existingOrderItemIndex].quantity += quantity;
        setOrderItems(updatedOrderItems);
      } else {
        const newOrderItem = { product_id: selectedProductId, quantity };
        setOrderItems([...orderItems, newOrderItem]);
      }
      const selectedProduct = products.find(product => product.id === selectedProductId);
      if (selectedProduct) {
        setTotalCost(totalCost + selectedProduct.price * quantity);
      }
    }
  };

  const saveOrder = () => {
    if (!totalCost) {
      alert("Вы ничего не заказали");
      return;
    }

    axios
      .post("https://dev-su.eda1.ru/test_task/save.php", { products: orderItems })
      .then(response => {
        const data: SaveOrderResponse = response.data;
        if (data.success) {
          setOrderCode(data.code);
        }
      })
      .catch(error => console.error("Error saving order:", error));
  };

  return (
    <div className="wrapper">
      <h1 className="title">Оформление заказа</h1>
      <div className="select-area flex">
        <select className="select"
          onChange={e => setSelectedProductId(Number(e.target.value))}
          value={selectedProductId || ""}>
          <option value="" disabled>
            Выберите продукт
          </option>
          {products.map(product => (
            <option key={product.id} value={product.id}>
              {product.title} - {product.price} руб.
            </option>
          ))}
        </select>
        <input className="input"
          type="number"
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          min="1"
        />
        <button className="button" onClick={addProductToOrder}>
          Добавить
        </button>
      </div>

      <span className="separator"></span>

      <h2 className="title">Корзина</h2>
      <table className="table">
        <thead className="thead">
          <tr className="tr">
            <th className="th">Название позиции</th>
            <th className="th">Количество единиц</th>
            <th className="th">Стоимость позиции итоговая</th>
          </tr>
        </thead>
        <tbody className="tbody">
          {orderItems.length == 0 && (
            <tr className="tr">
              <th className="th">-</th>
              <th className="th">-</th>
              <th className="th">-</th>
            </tr>
          )}
          {orderItems.map((item, index) => {
            const product = products.find(product => product.id === item.product_id);
            return (
              <tr className="tr" key={index}>
                <td className="td">{product?.title}</td>
                <td className="td">{item.quantity}</td>
                <td className="td">{product ? product.price * item.quantity : 0} руб.</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <p className="total-price">Итоговая стоимость: {totalCost.toFixed(2)} руб.</p>

      <button className="button" onClick={saveOrder}>
        Заказать
      </button>

      {orderCode && <p className="order-info">Номер заказа: {orderCode}</p>}
    </div>
  );
};

export default OrderPage;
