import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Image,
  Popconfirm,
  message,
  InputNumber,
  Spin,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";
import "./index.scss";
import { toast } from "react-toastify";

const SIZE_ENUM_MAP = { 1: "S", 2: "M", 3: "L", 4: "XL", 5: "XXL" };

const COLOR_STYLE_MAP = {
  0: "#000", // Black
  1: "#ff3b30", // Red
  2: "#007aff", // Blue
  3: "#34c759", // Green
  4: "#ffcc00", // Yellow
};

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [cartDetails, setCartDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const [cartId, setCartId] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // (optional)

  // Lấy giỏ hàng khi mount
  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line
  }, []);

  // Lấy chi tiết biến thể hoặc sản phẩm cho từng item
  useEffect(() => {
    if (cart.length === 0) {
      setCartDetails([]);
      return;
    }
    setLoading(true);
    const fetchDetails = async () => {
      const detailedCart = await Promise.all(
        cart.map(async (item) => {
          let detail = {};
          // Nếu có biến thể, lấy qua API Variant
          if (item.productVariantId) {
            try {
              const res = await api.get(
                `ProductVariant/${item.productVariantId}`
              );
              detail = res.data?.data || {};
            } catch {
              detail = {};
            }
          } else if (item.productId) {
            // Nếu không có biến thể, lấy từ Product gốc
            try {
              const res = await api.get(`Product/${item.productId}`);
              detail = res.data?.data || {};
            } catch {
              detail = {};
            }
          }
          return {
            ...item,
            detail,
          };
        })
      );
      setCartDetails(detailedCart);
      setLoading(false);
    };
    fetchDetails();
  }, [cart]);

  // Lấy giỏ hàng gốc
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get("Cart");
      setCart(res.data || []);
      setCartId(res.data?.id || null);
    } catch (error) {
      setCart([]);
      message.error("Không thể tải giỏ hàng!");
      setLoading(false);
    }
  };

  // Thay đổi số lượng
  const handleQuantityChange = async (record, newQty) => {
    if (newQty < 1) {
      try {
        const res = await api.delete(`Cart`, {
          data: [record.id],
          headers: { "Content-Type": "application/json" },
        });
        console.log("Xóa sản phẩm:", res.data);
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
        fetchCart();
      } catch (e) {
        message.error("Số lượng không thể nhỏ hơn 1!");
      }
      return;
    }
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
  const variantIds = selectedRows.map((item) => item.productVariantId);
  const cartItemIds = selectedRows.map((item) => item.id);
  const handleRemoveSelected = async () => {
    try {
      await api.delete("Cart", {
        data: cartItemIds, // mảng các id đã chọn
        headers: { "Content-Type": "application/json" },
      });
      message.success("Đã xóa sản phẩm đã chọn khỏi giỏ hàng");
      fetchCart();
      setSelectedRowKeys([]); // reset chọn
      setSelectedRows([]);
      console.log("Xóa cartItemIds:", cartItemIds);
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
      state: { cart: selectedRows, cartId, variantIds, cartItemIds },
    });
  };

  // Cấu hình các cột Table hiển thị
  const columns = [
    {
      title: "Ảnh",
      dataIndex: "detail",
      key: "image",
      render: (detail) =>
        detail?.imageUrl ? (
          <Image src={detail.imageUrl} width={70} style={{ borderRadius: 7 }} />
        ) : (
          <span>—</span>
        ),
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "detail",
      key: "name",
      render: (detail) => detail?.productName || "Không rõ",
    },
    {
      title: "Size",
      dataIndex: "detail",
      key: "size",
      render: (detail) => SIZE_ENUM_MAP[detail?.size] || detail?.size || "—",
    },
    {
      title: "Màu",
      dataIndex: "detail",
      key: "color",
      render: (color) => {
        // Nếu color là object, lấy color.id hoặc color.name
        let colorKey = color;
        if (typeof color === "object" && color !== null) {
          colorKey = color.id ?? color.name ?? ""; // ưu tiên id trước
        }

        return (
          <span>
            <span
              style={{
                display: "inline-block",
                width: 20,
                height: 20,
                background: COLOR_STYLE_MAP[colorKey] || "#222",
                borderRadius: "50%",
                marginRight: 6,
                border: "1.5px solid #aaa",
                verticalAlign: "middle",
              }}
            />
          </span>
        );
      },
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
            disabled={updating || record.quantity <= 0}
            onClick={() => handleQuantityChange(record, record.quantity - 1)}
            style={{ fontWeight: 700 }}
          >
            -
          </Button>
          <InputNumber
            min={0}
            max={99}
            value={record.quantity}
            onChange={(val) => {
              if (val === null || val === undefined) return;
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
  ];

  return (
    <div className="outlet-Cart" data-aos="fade-up">
      <div className="cart">
        <span className="title-Cart">Giỏ Hàng</span>
        <ShoppingCartOutlined className="icon-Cart" />
        <div className="cart-header">
          {selectedRows.length > 0 && (
            <Popconfirm
              title={`Bạn chắc chắn muốn xóa ${selectedRows.length} sản phẩm đã chọn?`}
              onConfirm={handleRemoveSelected}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                danger
                className="btn-delete-selected"
                size="middle"
                style={{ marginLeft: 18, fontWeight: 600 }}
              >
                Xóa đã chọn
              </Button>
            </Popconfirm>
          )}
        </div>

        {!cartDetails.length ? (
          <div className="empty-cart">
            <img
              src="https://bizweb.dktcdn.net/100/368/179/themes/738982/assets/empty-cart.png?1712982025915"
              alt="Empty Cart"
            />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={cartDetails.map((item) => ({
              ...item,
              key: item.id,
            }))}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys, rows) => {
                setSelectedRowKeys(keys);
                setSelectedRows(rows); // Có thể dùng để lấy giá, v.v.
              },
              selections: [
                Table.SELECTION_ALL,
                Table.SELECTION_INVERT,
                Table.SELECTION_NONE,
              ],
            }}
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
        {cartDetails.length > 0 && (
          <Button
            type="primary"
            className="btn-checkout"
            onClick={handleCheckout}
            disabled={updating || !selectedRows.length}
          >
            Thanh toán {selectedRows.length ? `(${selectedRows.length})` : ""}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Cart;
