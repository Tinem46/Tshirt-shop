import React, { useEffect, useState } from "react";
import { Table, Button, Image, Popconfirm, message, InputNumber } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";
import "./index.scss";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const fetchCart = async () => {
    try {
      const res = await api.get("Cart/my-cart");
      setCart(res.data || []);
    } catch (error) {
      setCart([]);
      message.error("Không thể tải giỏ hàng!");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("Product");
      setProducts(res.data?.data?.data || []);
    } catch {
      setProducts([]);
    }
  };

  // Thay đổi số lượng
  const handleQuantityChange = async (record, newQty) => {
    if (newQty < 1) return;
    setUpdating(true);
    try {
      await api.put(`Cart/${record.id}`, {
        ...record,
        quantity: newQty,
      });
      fetchCart();
    } catch {
      message.error("Không thể cập nhật số lượng!");
    }
    setUpdating(false);
  };

  const handleRemove = async (id) => {
    try {
      await api.delete(`Cart/${id}`);
      message.success("Đã xóa sản phẩm khỏi giỏ hàng");
      fetchCart();
    } catch {
      message.error("Không thể xóa sản phẩm khỏi giỏ hàng");
    }
  };

  const handleCheckout = () => {
    if (!cart.length) {
      message.warning("Giỏ hàng rỗng!");
      return;
    }
    navigate("/checkout", {
      state: { cart },
    });
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (image) => (
        <Image src={image} width={70} style={{ borderRadius: 7 }} />
      ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price) => <FormatCost value={price} />,
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Button
            size="small"
            disabled={updating || record.quantity <= 1}
            onClick={() => handleQuantityChange(record, record.quantity - 1)}
            style={{ fontWeight: 700 }}
          >
            -
          </Button>
          <InputNumber
            min={1}
            max={99}
            value={record.quantity}
            onChange={(val) => {
              if (!val) return;
              handleQuantityChange(record, val);
            }}
            style={{ width: 48 }}
            disabled={updating}
          />
          <Button
            size="small"
            disabled={updating}
            onClick={() => handleQuantityChange(record, record.quantity + 1)}
            style={{ fontWeight: 700 }}
          >
            +
          </Button>
        </div>
      ),
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_, record) => (
        <FormatCost value={record.unitPrice * record.quantity} />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title={`Bạn chắc chắn xóa ${record.name}?`}
          onConfirm={() => handleRemove(record.id)}
        >
          <Button danger>Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  const dataSource = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId) || {};
    return {
      ...item,
      key: item.id,
      name: product.name || "Không rõ",
      image:
        product.images?.[0] ||
        "https://th.bing.com/th/id/OIP.7ZxepcJaDNoUZqs3JZPxKwHaHa?w=199&h=200&c=7&r=0&o=7&dpr=1.4&pid=1.7&rm=3",
    };
  });

  return (
    <div className="outlet-Cart" data-aos="fade-up">
      <div className="cart">
        <span className="title-Cart">Giỏ Hàng</span>
        <ShoppingCartOutlined className="icon-Cart" />
        {!cart.length ? (
          <div className="empty-cart">
            <img
              src="https://bizweb.dktcdn.net/100/368/179/themes/738982/assets/empty-cart.png?1712982025915"
              alt="Empty Cart"
            />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            style={{ marginBottom: 28 }}
          />
        )}
      </div>

      <div className="return-update-cart">
        <Link to="/">
          <Button>Tiếp tục mua sắm</Button>
        </Link>
      </div>

      {/* Nút thanh toán để sang phải, dưới cùng */}
      <div className="cart-footer-action">
        {cart.length > 0 && (
          <Button
            type="primary"
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={updating}
          >
            Thanh toán
          </Button>
        )}
      </div>
    </div>
  );
};

export default Cart;
