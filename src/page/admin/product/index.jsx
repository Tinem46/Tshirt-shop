import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Button,
  Drawer,
  message,
  Table,
} from "antd";
import { EyeOutlined, PlusOutlined, ClusterOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useForm } from "antd/es/form/Form";
import api from "../../../config/api";
import DashboardTemplate from "../../../components/dashboard-template";
import "./index.scss";
import uploadFile from "../../../utils/upload";

function ManagementProducts() {
  const [fileList, setFileList] = useState([]); // không dùng nữa nhưng giữ lại cho reset
  const [categories, setCategories] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = useForm();
  const [products, setProducts] = useState([]);
  const [drawerRecord, setDrawerRecord] = useState(null);
  const [drawerVariants, setDrawerVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCate, setTotalCate] = useState(0);
  const [imageList, setImageList] = useState([]); // [{url, isPrimary}]

  // Variant state
  const [variantDrawer, setVariantDrawer] = useState({
    open: false,
    productId: null,
    productName: "",
  });
  const [variants, setVariants] = useState([]);
  const [variantForm] = useForm();
  const [variantLoading, setVariantLoading] = useState(false);

  // Fetch categories + products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const categoriesResponse = await api.get("Category", {
          params: { PageSize: totalCate },
        });
        setTotalCate(categoriesResponse.data?.data?.totalCount || 0);
        setCategories(
          Array.isArray(categoriesResponse.data?.data.data)
            ? categoriesResponse.data?.data.data
            : []
        );
        const res = await api.get("Product", { params: { PageSize: 100 } });
        setProducts(
          Array.isArray(res.data?.data?.data) ? res.data.data.data : []
        );
      } catch (err) {
        message.error("Không thể tải dữ liệu!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [totalCate]);

  // Khi user chọn file, upload lên firebase
  const handleSelectFiles = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = [];
    for (const file of files) {
      const url = await uploadFile(file);
      uploadedImages.push({ url, isPrimary: false });
    }
    setImageList(uploadedImages);
    form.setFieldsValue({ images: uploadedImages });
    console.log("AFTER setFieldsValue, getFieldsValue:", form.getFieldsValue());
  };

  // VARIANT
  const fetchVariants = async (productId) => {
    const res = await api.get(`ProductVariant/product/${productId}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  };

  const handleShowDetail = async (record) => {
    setDrawerRecord(record);
    if (record?.id) {
      const vs = await fetchVariants(record.id);
      setDrawerVariants(vs);
    } else {
      setDrawerVariants([]);
    }
  };

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
      const vs = await fetchVariants(productId);
      setVariants(vs);
    } catch {
      setVariants([]);
    } finally {
      setVariantLoading(false);
    }
  };
  const handleCreateVariant = async (values) => {
    try {
      await api.post("ProductVariant", {
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

  // Cấu hình cột Table sản phẩm
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
      render: (images) => {
        let arr = [];
        try {
          arr = typeof images === "string" ? JSON.parse(images) : images || [];
        } catch {
          arr = [];
        }
        if (!Array.isArray(arr) || arr.length === 0) return null;
        const imgObj = arr.find((i) => i.isPrimary) || arr[0];
        const url = typeof imgObj === "string" ? imgObj : imgObj.url;
        return url ? (
          <img src={url} alt="" style={{ width: 40, borderRadius: 6 }} />
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
          {/* Thêm options đúng backend nếu cần */}
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
      <Form.Item name="images" label="Ảnh sản phẩm" required>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleSelectFiles}
        />
        <div style={{ marginTop: 8 }}>
          {imageList.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt=""
              style={{ width: 60, marginRight: 8, borderRadius: 6 }}
            />
          ))}
        </div>
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
      images:
        typeof record.images === "string"
          ? JSON.parse(record.images)
          : record.images || [],
    });
    setImageList(
      (typeof record.images === "string"
        ? JSON.parse(record.images)
        : record.images || []
      ).map((img) =>
        typeof img === "string" ? { url: img, isPrimary: false } : img
      )
    );
  };

  const SIZE_MAP = {
    1: "S",
    2: "M",
    3: "L",
    4: "XL",
    5: "XXL",
  };
  const COLOR_MAP = {
    0: "Trắng",
    1: "Đỏ",
    2: "Xanh dương",
    3: "Đen",
    4: "Vàng",
    5: "Xanh lá",
  };
  const getSizeName = (val) => SIZE_MAP[val] || val;
  const getColorName = (val) => COLOR_MAP[val] || val;

  // Drawer chi tiết sản phẩm
  const renderDrawerContent = (record) => {
    if (!record) return null;
    let images =
      typeof record.images === "string"
        ? JSON.parse(record.images || "[]")
        : record.images || [];
    // Hỗ trợ cả trường hợp array url hoặc array object
    images = images.map((img) =>
      typeof img === "string" ? { url: img } : img
    );
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
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
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
        <DetailRow
          label="Danh mục"
          value={categories.find((c) => c.id === record.categoryId)?.name || ""}
        />
        <DetailRow label="Màu sắc" value={colors.join(", ")} />
        <DetailRow label="Size" value={sizes.join(", ")} />

        {/* --- DANH SÁCH BIẾN THỂ --- */}
        {drawerVariants.length > 0 && (
          <div className="product-detail-variants">
            <div style={{ fontWeight: 600, margin: "16px 0 8px" }}>
              Các biến thể:
            </div>
            <Table
              columns={[
                {
                  title: "Màu sắc",
                  dataIndex: "color",
                  key: "color",
                  render: (val) => getColorName(val),
                },
                {
                  title: "Size",
                  dataIndex: "size",
                  key: "size",
                  render: (val) => getSizeName(val),
                },
                { title: "SKU", dataIndex: "variantSku", key: "variantSku" },
                { title: "Tồn kho", dataIndex: "quantity", key: "quantity" },
                {
                  title: "Giá",
                  dataIndex: "priceAdjustment",
                  key: "priceAdjustment",
                  render: (val) => (val ? `${val.toLocaleString()}đ` : "—"),
                },
                {
                  title: "Trạng thái",
                  dataIndex: "isActive",
                  key: "isActive",
                  render: (v) => (v ? "Đang bán" : "Ẩn"),
                },
                {
                  title: "Ảnh",
                  dataIndex: "imageUrl",
                  key: "imageUrl",
                  render: (url) =>
                    url ? (
                      <img
                        src={url}
                        alt=""
                        style={{
                          width: 38,
                          height: 38,
                          objectFit: "cover",
                          borderRadius: 5,
                        }}
                      />
                    ) : null,
                },
              ]}
              dataSource={drawerVariants.map((v) => ({ ...v, key: v.id }))}
              pagination={false}
              size="small"
              locale={{ emptyText: "Chưa có biến thể nào." }}
              style={{ marginTop: 8 }}
            />
          </div>
        )}
      </div>
    );
  };

  // ----- Nút custom trên Table -----
  const customActions = [
    {
      label: <EyeOutlined style={{ marginRight: 4 }} />,
      className: "detail-button",
      condition: () => true,
      action: (id, record) => handleShowDetail(record), // truyền record trực tiếp!
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
      action: (id, record) => openVariantDrawer(id, record?.name || ""),
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
        dataSource={products}
        products={products}
        setProducts={setProducts}
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
        <Table
          columns={[
            { title: "Màu sắc", dataIndex: "color", key: "color" },
            { title: "Size", dataIndex: "size", key: "size" },
            { title: "SKU", dataIndex: "variantSku", key: "variantSku" },
            { title: "Tồn kho", dataIndex: "quantity", key: "quantity" },
            {
              title: "Giá",
              dataIndex: "priceAdjustment",
              key: "priceAdjustment",
              render: (val) => (val ? `${val.toLocaleString()}đ` : "—"),
            },
            {
              title: "Trạng thái",
              dataIndex: "isActive",
              key: "isActive",
              render: (v) => (v ? "Đang bán" : "Ẩn"),
            },
            {
              title: "Ảnh",
              dataIndex: "imageUrl",
              key: "imageUrl",
              render: (url) =>
                url ? (
                  <img
                    src={url}
                    alt=""
                    style={{
                      width: 38,
                      height: 38,
                      objectFit: "cover",
                      borderRadius: 5,
                    }}
                  />
                ) : null,
            },
          ]}
          dataSource={variants.map((v) => ({ ...v, key: v.id }))}
          pagination={false}
          size="small"
          locale={{ emptyText: "Chưa có biến thể nào." }}
          style={{ marginTop: 16 }}
        />
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
