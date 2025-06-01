import { useState, useEffect } from "react";
import { useDispatch } from "react-redux"; // Corrected import
import "./index.scss";
import { Image, Table, Button, Space, Select, Popconfirm } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
// import api from "../../config/api";
// import { reset, syncWithApi } from "../../redux/features/cartSlice";
import { toast } from "react-toastify";
import FormatCost from "../../components/formatCost";
// import NavBar from "../../components/navigation2";

function Cart() {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [subTotal, setSubTotal] = useState(0);
  const [shippingPee, setShippingPee] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [vouchers, setVouchers] = useState([]);

  //   const navigate = useNavigate();
  //   const dispatch = useDispatch();

  //   const fetchCart = async () => {
  //     try {
  //       const response = await api.get('Cart');
  //       const cartData = response.data.activeCartDetails || [];
  //       setCart(cartData);
  //       dispatch(syncWithApi(cartData));
  //       setCartId(response.data.id);
  //       await updateCartTotal(response.data.id);
  //     } catch (error) {
  //       console.error("Failed to fetch cart:", error.response);
  //       setCart([]);
  //       dispatch(syncWithApi([])); // Sync với Redux store khi có lỗi
  //     }
  //   };

  //   const fetchVouchers = async () => {
  //     try {
  //       const response = await api.get('voucher');
  //       const activeVouchers = response.data.filter(v => v.is_active);
  //       setVouchers(activeVouchers);
  //     } catch (error) {
  //       console.error("Failed to fetch vouchers:", error);
  //       toast.error("Failed to load vouchers");
  //     }
  //   };

  //   useEffect(() => {
  //     fetchCart();
  //     fetchVouchers();
  //   }, []);

  //   const handleRemove = async (id) => {
  //     try {
  //       await api.delete(`Cart/${id}`);
  //       const updatedCart = cart.filter(item => item.id !== id);
  //       setCart(updatedCart);
  //       if (updatedCart.length === 0) {
  //         dispatch(reset());
  //       }
  //       await updateCartTotal(cartId); // Update cart total after removing item
  //     } catch (error) {
  //       console.error("Failed to remove item:", error.response ? error.data : error);
  //     }
  //   };

  //   const handleApplyVoucher = () => {
  //     updateCartTotal(cartId, voucherCode);
  //   };

  //   const updateCartTotal = async (cartId, voucherCode) => {
  //     if (!cartId) {
  //       console.error("Cart ID is not available");
  //       return;
  //     }
  //     try {
  //       const response = await api.get(`Cart/total`, {
  //         params: {
  //           cartId,
  //           voucherCode: voucherCode || undefined
  //         }
  //       });
  //       const { subTotal = 0, shippingPee = 0, totalAmount = 0 } = response.data;
  //       setSubTotal(subTotal);
  //       setShippingPee(shippingPee);
  //       setTotalAmount(totalAmount);
  //     } catch (error) {
  //       console.error("Failed to fetch cart total:", error.response ? error.response.data : error);
  //       toast.error("Failed to apply voucher. Please check your code and try again.");
  //       setSubTotal(0);
  //       setShippingPee(0);
  //       setTotalAmount(0);
  //     }
  //   };

  const columns = [
    {
      title: "Picture",
      dataIndex: "image",
      key: "image",
      render: (image) => <Image src={image} width={100} />,
    },
    {
      title: "Product",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
    },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title={`Are you sure you want to delete ${record.name}?`}
          //   onConfirm={() => handleRemove(record.id)}
        >
          <Button danger>Remove</Button>
        </Popconfirm>
      ),
    },
  ];

  //   const handleProceedToCheckout = async () => {
  //     try {
  //       // Create the order here
  //       const orderData = {
  //         orderDate: new Date().toISOString(),
  //         voucherCode: voucherCode,
  //         orderStatus: "PENDING",
  //         subTotal,
  //         shippingPee,
  //         totalAmount
  //       };

  //       const orderResponse = await api.post('order', orderData);
  //       const orderId = orderResponse.data.id;

  //       navigate('/checkout', {
  //         state: {
  //           orderId,
  //           subTotal,
  //           shippingPee,
  //           totalAmount,
  //           cart,
  //         }
  //       });
  //     } catch (error) {
  //       console.error("Failed to create order:", error);
  //       toast.error("An error occurred while creating the order. Please try again.");
  //     }
  //   };

  return (
    <>
      <div className="outlet-Cart">
        <div className="cart">
          <span className="title-Cart">Cart</span>
          <ShoppingCartOutlined className="icon-Cart" />
          {Array.isArray(cart) && cart.length === 0 ? (
            <div className="empty-cart">
              <img
                src="https://png.pngtree.com/png-clipart/20230418/original/pngtree-order-confirm-line-icon-png-image_9065104.png"
                alt="Empty Cart"
              />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={cart.map((item) => ({
                key: item.id,
                name: item.name,
                price: new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(item.price),
                image: item.image,
                id: item.id,
              }))}
            />
          )}
        </div>
        <div className="return-update-cart">
          <Link to="/">
            <Button >Return To Shop</Button>
          </Link>
        </div>
        <div className="coupon-Checkout">
          <Space.Compact className="coupon-Input">
            <Select
              style={{ width: 200 }}
              placeholder="Select a voucher"
              value={voucherCode}
              onChange={(value) => setVoucherCode(value)}
              options={vouchers.map((v) => ({
                label: `${v.description}`,
                value: v.code,
              }))}
            />
            <Button type="primary" onClick={() => alert("hello")}>
              Apply Voucher
            </Button>
          </Space.Compact>
          <section className="checkOut-Box">
            <h1>Cart Total</h1>
            <div className="modify-Checkout">
              <p>Subtotal: </p>
              <p>
                <FormatCost value={subTotal} />
              </p>
            </div>
            <div className="modify-Checkout">
              <p>Shipping: </p>
              <p>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(shippingPee)}
              </p>
            </div>
            <div className="modify-Checkout">
              <p>Total amount: </p>
              <p>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(totalAmount)}
              </p>
            </div>
            <br />
            {Array.isArray(cart) && cart.length > 0 && (
              <button onClick={() => alert("hello")}>
                Proceed to checkout
              </button>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default Cart;
