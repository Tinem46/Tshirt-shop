import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Button,
  Drawer,
  message,
  Upload,
} from "antd";
import { EyeOutlined, PlusOutlined, ClusterOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useForm } from "antd/es/form/Form";
import api from "../../../config/api";
import DashboardTemplate from "../../../components/dashboard-template";
import "./index.scss";

function ManagementProducts() {
  const [fileList, setFileList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = useForm();
  const [products, setProducts] = useState([]);
  const [drawerRecord, setDrawerRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- VARIANT STATE ---
  const [variantDrawer, setVariantDrawer] = useState({
    open: false,
    productId: null,
    productName: "",
  });
  const [variants, setVariants] = useState([]);
  const [variantForm] = useForm();
  const [variantLoading, setVariantLoading] = useState(false);

  // Lấy danh mục và sản phẩm
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse] = await Promise.all([
          api.get("Category", { params: { PageSize: 100 } }),
        ]);
        setCategories(
          Array.isArray(categoriesResponse.data?.data.data)
            ? categoriesResponse.data?.data.data
            : []
        );
      } catch (err) {
        message.error("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- VARIANT FUNCTIONS ---
  const openVariantDrawer = async (productId, productName) => {
    setVariantDrawer({ open: true, productId, productName });
    loadVariants(productId);
  };
  const closeVariantDrawer = () => {
    setVariantDrawer({ open: false, productId: null, productName: "" });
    setVariants([]);
    variantForm.resetFields();
  };
  const loadVariants = async (productId) => {
    setVariantLoading(true);
    try {
      const res = await api.get(`/ProductVariant?productId=${productId}`);
      setVariants(
        Array.isArray(res.data?.data?.data) ? res.data.data.data : []
      );
    } catch {
      setVariants([]);
    } finally {
      setVariantLoading(false);
    }
  };
  const handleCreateVariant = async (values) => {
    try {
      await api.post("/ProductVariant", {
        ...values,
        productId: variantDrawer.productId,
      });
      message.success("Tạo biến thể thành công!");
      variantForm.resetFields();
      loadVariants(variantDrawer.productId);
    } catch {
      message.error("Lỗi khi tạo biến thể!");
    }
  };

  // Cấu hình cột Table
  const columns = [
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (text) => `${Number(text).toLocaleString("vi-VN")}đ`,
    },
    { title: "Tồn kho", dataIndex: "quantity", key: "quantity" },
    {
      title: "Danh mục",
      dataIndex: "categoryId",
      key: "categoryId",
      render: (id) => categories.find((c) => c.id === id)?.name || null,
    },
    {
      title: "Ảnh",
      dataIndex: "images",
      key: "images",
      render: (text) => {
        let images = [];
        try {
          images = typeof text === "string" ? JSON.parse(text) : text || [];
        } catch (e) {
          images = [];
        }
        return images?.length > 0 ? (
          <img
            src={images[0]}
            alt="product"
            style={{ width: 40, borderRadius: 6 }}
          />
        ) : null;
      },
    },
  ];

  // Form nhập sản phẩm
  const formItems = (
    <>
      <Form.Item
        name="name"
        label="Tên sản phẩm"
        rules={[{ required: true, message: "Tên sản phẩm là bắt buộc" }]}
      >
        <Input placeholder="Nhập tên sản phẩm..." />
      </Form.Item>
      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: "Nhập mô tả" }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item
        name="price"
        label="Giá"
        rules={[
          { required: true, message: "Giá là bắt buộc" },
          { type: "number", min: 0.01, message: "Giá phải lớn hơn 0" },
        ]}
      >
        <InputNumber style={{ width: "100%" }} min={0.01} />
      </Form.Item>
      <Form.Item name="salePrice" label="Giá sale">
        <InputNumber style={{ width: "100%" }} min={0} />
      </Form.Item>
      <Form.Item name="sku" label="SKU" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="categoryId"
        label="Danh mục"
        rules={[{ required: true, message: "Chọn danh mục" }]}
      >
        <Select>
          {categories.map((c) => (
            <Select.Option key={c.id} value={c.id}>
              {c.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="material"
        label="Chất liệu"
        rules={[{ required: true, message: "Chọn chất liệu" }]}
      >
        <Select>
          <Select.Option value={0}>Cotton</Select.Option>
          <Select.Option value={1}>Silk</Select.Option>
          {/* Thêm options đúng backend */}
        </Select>
      </Form.Item>
      <Form.Item
        name="season"
        label="Mùa"
        rules={[{ required: true, message: "Chọn mùa" }]}
      >
        <Select>
          <Select.Option value={0}>Xuân</Select.Option>
          <Select.Option value={1}>Hạ</Select.Option>
          <Select.Option value={2}>Thu</Select.Option>
          <Select.Option value={3}>Đông</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="metaTitle" label="Meta title">
        <Input />
      </Form.Item>
      <Form.Item name="metaDescription" label="Meta desc">
        <Input />
      </Form.Item>
      <Form.Item name="slug" label="Slug">
        <Input />
      </Form.Item>
      <Form.Item
        name="status"
        label="Trạng thái"
        rules={[{ required: true, message: "Chọn trạng thái sản phẩm" }]}
      >
        <Select>
          <Select.Option value={0}>Đang bán</Select.Option>
          <Select.Option value={1}>Tạm dừng</Select.Option>
          <Select.Option value={2}>Hết hàng</Select.Option>
          <Select.Option value={3}>Ngừng bán</Select.Option>
        </Select>
      </Form.Item>
      {/* <Form.Item
        name="images"
        label="Ảnh sản phẩm"
        // rules={[{ required: true, message: "Tối thiểu 1 ảnh" }]}
        valuePropName="fileList"
        getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
      > */}
      {/* Bạn có thể dùng Upload Dragger hoặc custom Upload nhiều ảnh ở đây.
          Tuy nhiên bạn cần map fileList về array object: [{id, url, isPrimary}]
          Nếu chỉ nhập url đơn giản thì để Input, còn nếu muốn Upload ảnh thì nên dùng Upload của AntD. */}
      {/* <Upload
          listType="picture-card"
          beforeUpload={() => false} // chặn upload tự động, handle ở FE hoặc call API upload riêng
          multiple
        >
          <div>
            <PlusOutlined />
            <div>Upload</div>
          </div>
        </Upload>
         */}
      {/* </Form.Item> */}
      <Form.Item
        name="images"
        label="Ảnh sản phẩm (mỗi dòng 1 URL)"
        // rules={[{ required: true, message: "Ít nhất 1 ảnh" }]}
      >
        <Input.TextArea placeholder="https://..." autoSize />
      </Form.Item>
    </>
  );

  // Chuẩn hóa khi edit
  const prepareFormForEdit = (record) => {
    if (!record) return;
    form.setFieldsValue({
      ...record,
      availableColors: Array.isArray(record.availableColors)
        ? record.availableColors.join(", ")
        : record.availableColors,
      availableSizes: Array.isArray(record.availableSizes)
        ? record.availableSizes.join(", ")
        : record.availableSizes,
    });
    if (record.images) {
      let images = [];
      try {
        images =
          typeof record.images === "string"
            ? JSON.parse(record.images)
            : record.images;
      } catch {
        images = [];
      }
      setFileList(
        images.map((url, idx) => ({
          uid: String(idx),
          name: `image${idx}.jpg`,
          status: "done",
          url,
        }))
      );
    }
  };

  // Drawer hiển thị chi tiết sản phẩm
  const renderDrawerContent = (record) => {
    if (!record) return null;
    const images =
      typeof record.images === "string"
        ? JSON.parse(record.images || "[]")
        : record.images || [];
    const colors = record.availableColors
      ? JSON.parse(record.availableColors || "[]")
      : [];
    const sizes = record.availableSizes
      ? JSON.parse(record.availableSizes || "[]")
      : [];
    return (
      <div className="product-detail-container">
        <div className="product-detail-header">{record.name}</div>
        {images.length > 0 && (
          <div className="product-detail-images">
            {images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`product${idx}`}
                className="product-detail-image"
              />
            ))}
          </div>
        )}
        <DetailRow label="Mô tả" value={record.description} />
        <DetailRow
          label="Giá gốc"
          value={`${Number(record.price).toLocaleString("vi-VN")}đ`}
        />
        <DetailRow
          label="Giá sale"
          value={`${Number(record.salePrice).toLocaleString("vi-VN")}đ`}
        />
        <DetailRow label="SKU" value={record.sku} />
        <DetailRow label="Tồn kho" value={record.quantity} />
        <DetailRow label="Chất liệu" value={record.material} />
        <DetailRow label="Mùa" value={record.season} />
        <DetailRow label="Khối lượng" value={`${record.weight} kg`} />
        <DetailRow label="Min Order" value={record.minOrderQuantity} />
        <DetailRow label="Max Order" value={record.maxOrderQuantity} />
        <DetailRow
          label="Featured"
          value={record.isFeatured ? "✅ Có" : "❌ Không"}
        />
        <DetailRow
          label="Bestseller"
          value={record.isBestseller ? "✅ Có" : "❌ Không"}
        />
        <DetailRow
          label="Danh mục"
          value={categories.find((c) => c.id === record.categoryId)?.name || ""}
        />
        <DetailRow label="Màu sắc" value={colors.join(", ")} />
        <DetailRow label="Size" value={sizes.join(", ")} />
      </div>
    );
  };

  // ----- Thêm nút VARIANTS cho mỗi sản phẩm -----
  const customActions = [
    {
      label: <EyeOutlined style={{ marginRight: 4 }} />,
      className: "detail-button",
      condition: () => true,
      action: (id) => setDrawerRecord(products.find((p) => p.id === id)),
    },
    {
      label: (
        <span>
          <ClusterOutlined style={{ marginRight: 4 }} />
          Variants
        </span>
      ),
      className: "variants-button",
      condition: () => true,
      action: (id) => {
        const product = products.find((p) => p.id === id);
        openVariantDrawer(id, product?.name || "");
      },
    },
  ];

  // Sửa để mở Modal create/edit
  const [open, setOpen] = useState(false);

  return (
    <>
      <DashboardTemplate
        title="Product"
        columns={columns}
        apiURI="Product"
        formItems={formItems}
        onEdit={(record) => {
          prepareFormForEdit(record);
          setEditingRecord(record);
          setOpen(true);
        }}
        resetImage={() => setFileList([])}
        form={form}
        loading={loading}
        showEditDelete={true}
        customActions={customActions}
      />

      <Drawer
        title="Chi tiết sản phẩm"
        placement="right"
        width={500}
        onClose={() => setDrawerRecord(null)}
        open={!!drawerRecord}
      >
        {renderDrawerContent(drawerRecord)}
      </Drawer>

      {/* ----- Drawer quản lý biến thể sản phẩm ----- */}
      <Drawer
        title={`Biến thể của: ${variantDrawer.productName}`}
        placement="right"
        width={500}
        onClose={closeVariantDrawer}
        open={variantDrawer.open}
      >
        <Form
          form={variantForm}
          layout="vertical"
          onFinish={handleCreateVariant}
          style={{
            marginBottom: 24,
            background: "#fafafa",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <Form.Item name="color" label="Màu sắc" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="size" label="Size" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="variantSku" label="SKU" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Tồn kho"
            rules={[{ required: true }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="priceAdjustment" label="Chênh lệch giá">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="imageUrl" label="Ảnh Variant">
            <Input />
          </Form.Item>
          <Form.Item
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Đang bán</Checkbox>
          </Form.Item>
          <Button htmlType="submit" type="primary" loading={variantLoading}>
            Thêm biến thể
          </Button>
        </Form>

        <div>
          <b>Danh sách biến thể</b>
          {variants.length === 0 ? (
            <div style={{ color: "#888", marginTop: 12 }}>
              Chưa có biến thể nào.
            </div>
          ) : (
            <ul style={{ paddingLeft: 16, margin: 0 }}>
              {variants.map((v, idx) => (
                <li key={v.id || idx} style={{ marginBottom: 6 }}>
                  <b>{v.color}</b> - <b>{v.size}</b>
                  {v.variantSku ? ` | SKU: ${v.variantSku}` : ""}
                  {v.quantity !== undefined ? ` | SL: ${v.quantity}` : ""}
                  {v.priceAdjustment !== undefined
                    ? ` | Giá: ${v.priceAdjustment}`
                    : ""}
                  {v.isActive === false ? " | Ẩn" : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Drawer>
    </>
  );
}

const DetailRow = ({ label, value }) => (
  <div className="detail-row">
    <span>{label}:</span>
    <span>{value}</span>
  </div>
);

export default ManagementProducts;
