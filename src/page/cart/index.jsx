"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Button,
  Image,
  Popconfirm,
  message,
  InputNumber,
  Spin,
  Checkbox,
} from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import api from "../../config/api";
import FormatCost from "../../components/formatCost";
import "./index.scss";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const SIZE_ENUM_MAP = { 1: "S", 2: "M", 3: "L", 4: "XL", 5: "XXL" };
const COLOR_STYLE_MAP = {
  0: "#000", // Black
  1: "#ff3b30", // Red (keeping for color display, but will be grayscale in UI)
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
  const [selectedRows, setSelectedRows] = useState([]);

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
    const maxQty = record.detail?.quantity || 1;
    if (newQty < 1) {
      const result = await Swal.fire({
        title: "xóa sản phẩm",
        text: "Bạn có muốn xóa sản phẩm này khỏi giỏ hàng",
        icon: "warning",
        showCancelButton: "true",
        confirmButtonText: "xóa",
        cancleButtonText: "Hủy",
        reverseButtons: true,
      });
      if (result.isConfirmed) {
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
      }
      return;
    }
    if (newQty > maxQty) {
      toast.warning(`chỉ còn lại ${maxQty} sản phẩm`);
      newQty = maxQty;
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
        data: cartItemIds,
        headers: { "Content-Type": "application/json" },
        
      });
      
      message.success("Đã xóa sản phẩm đã chọn khỏi giỏ hàng");
      fetchCart();
      setSelectedRowKeys([]);
      setSelectedRows([]);
      console.log("Xóa cartItemIds:", cartItemIds);
    } catch {
      message.error("Không thể xóa sản phẩm khỏi giỏ hàng");
    }
  };

  const handleCheckout = () => {
    if (!selectedRows.length) {
      message.warning("Vui lòng chọn sản phẩm để thanh toán!");
      return;
    }
    navigate("/checkout", {
      state: { cart: selectedRows, cartId, variantIds, cartItemIds },
    });
  };

  // Handle individual item selection
  const handleItemSelect = (item, checked) => {
    if (checked) {
      setSelectedRowKeys([...selectedRowKeys, item.id]);
      setSelectedRows([...selectedRows, item]);
    } else {
      setSelectedRowKeys(selectedRowKeys.filter((key) => key !== item.id));
      setSelectedRows(selectedRows.filter((row) => row.id !== item.id));
    }
  };

  // Handle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRowKeys(cartDetails.map((item) => item.id));
      setSelectedRows([...cartDetails]);
    } else {
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
  };

  const isAllSelected =
    cartDetails.length > 0 && selectedRowKeys.length === cartDetails.length;
  const isIndeterminate =
    selectedRowKeys.length > 0 && selectedRowKeys.length < cartDetails.length;

  // Calculate subtotal for selected items
  const subtotal = useMemo(() => {
    return selectedRows.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );
  }, [selectedRows]);

  return (
    <div className="outlet-Cart" data-aos="fade-up">
      <div className="cart">
        <div className="cart-title-section">
          <span className="title-Cart">Giỏ Hàng</span>
          <ShoppingCartOutlined className="icon-Cart" />
        </div>

        <div className="cart-content-wrapper">
          <div className="cart-products-column">
            <div className="cart-header">
              {cartDetails.length > 0 && (
                <div className="select-all-section">
                  <Checkbox
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={isAllSelected}
                  >
                    Chọn tất cả ({cartDetails.length})
                  </Checkbox>
                </div>
              )}

              {selectedRows.length > 0 && (
                <Popconfirm
                  title={`Bạn chắc chắn muốn xóa ${selectedRows.length} sản phẩm đã chọn?`}
                  onConfirm={handleRemoveSelected}
                  okText="Xóa"
                  cancelText="Hủy"
                >
                  <Button danger className="btn-delete-selected" size="middle">
                    Xóa đã chọn ({selectedRows.length})
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
                <h2>Giỏ hàng của bạn đang trống</h2>
                <p>
                  Hãy thêm các sản phẩm yêu thích vào giỏ hàng để bắt đầu mua
                  sắm!
                </p>
              </div>
            ) : (
              <div className="cart-items-container">
                {cartDetails.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    <div className="item-checkbox">
                      <Checkbox
                        checked={selectedRowKeys.includes(item.id)}
                        onChange={(e) =>
                          handleItemSelect(item, e.target.checked)
                        }
                      />
                    </div>

                    <div className="item-image">
                      {item.detail?.imageUrl ? (
                        <Image
                          src={item.detail.imageUrl || "/placeholder.svg"}
                          width={80}
                          height={80}
                          style={{ borderRadius: 0, objectFit: "cover" }} // Sharp corners
                        />
                      ) : (
                        <div className="no-image">—</div>
                      )}
                    </div>

                    <div className="item-info">
                      <div className="item-name">
                        {item.detail?.productName || "Không rõ"}
                      </div>

                      <div className="item-attributes">
                        <div className="item-size">
                          <span className="label">Size:</span>
                          <span className="value">
                            {SIZE_ENUM_MAP[item.detail?.size] ||
                              item.detail?.size ||
                              "—"}
                          </span>
                        </div>

                        <div className="item-color">
                          <span className="label">Màu:</span>
                          <span className="color-display">
                            <span
                              className="color-circle"
                              style={{
                                background:
                                  COLOR_STYLE_MAP[
                                    item.detail?.color?.id || item.detail?.color
                                  ] || "#222",
                              }}
                            />
                          </span>
                        </div>
                      </div>

                      <div className="item-price">
                        <FormatCost value={item.unitPrice} />
                      </div>
                    </div>

                    <div className="item-quantity">
                      <div className="quantity-label">Số lượng</div>
                      <div className="quantity-controls">
                        <Button
                          size="small"
                          disabled={updating || item.quantity <= 0}
                          onClick={() =>
                            handleQuantityChange(item, item.quantity - 1)
                          }
                          className="qty-btn"
                        >
                          -
                        </Button>
                        <InputNumber
                          min={0}
                          max={99}
                          value={item.quantity}
                          onChange={(val) => {
                            if (val === null || val === undefined) return;
                            handleQuantityChange(item, val);
                          }}
                          className="qty-input"
                          disabled={updating}
                        />
                        <Button
                          size="small"
                          disabled={updating}
                          onClick={() =>
                            handleQuantityChange(item, item.quantity + 1)
                          }
                          className="qty-btn"
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <div className="item-total">
                      <div className="total-label">Thành tiền</div>
                      <div className="total-price">
                        <FormatCost value={item.unitPrice * item.quantity} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="return-update-cart">
              <Link to="/">
                <Button>Tiếp tục mua sắm</Button>
              </Link>
            </div>
          </div>

          <div className="cart-summary-column">
            <div className="summary-card">
              <h3 className="summary-title">Tóm tắt đơn hàng</h3>
              <div className="summary-item">
                <span>Tổng số sản phẩm đã chọn:</span>
                <span>{selectedRows.length}</span>
              </div>
              <div className="summary-item total-amount">
                <span>Tổng cộng:</span>
                <FormatCost value={subtotal} />
              </div>
              <Button
                type="primary"
                className="btn-checkout"
                onClick={handleCheckout}
                disabled={updating || !selectedRows.length}
              >
                Thanh toán{" "}
                {selectedRows.length ? `(${selectedRows.length})` : ""}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
