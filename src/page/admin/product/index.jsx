import {
  Form,
  Input,
  InputNumber,
  Select,
  Checkbox,
  Button,
  Modal,
  message,
  Table,
} from "antd";
import { EyeOutlined, ClusterOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useForm } from "antd/es/form/Form";
import api from "../../../config/api";
import DashboardTemplate from "../../../components/dashboard-template";
import "./index.scss";
import uploadFile from "../../../utils/upload";
import { toast } from "react-toastify";
import ReviewStatsModal from "../../../components/reviewModal";

function ManagementProducts() {
  // ----------- State cho Sản phẩm -----------
  const [imageList, setImageList] = useState([]); // Ảnh sản phẩm
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [form] = useForm();
  const [editingRecord, setEditingRecord] = useState(null);
  const [open, setOpen] = useState(false);
  const [detailModalRecord, setDetailModalRecord] = useState(null);
  const [detailModalVariants, setDetailModalVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCate, setTotalCate] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedReviewVariant, setSelectedReviewVariant] = useState(null);
  const [reviewStatsLoading, setReviewStatsLoading] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const handlePreviewImage = (url) => {
    setPreviewImage(url);
    setPreviewVisible(true);
  };
  const closePreviewImage = () => {
    setPreviewVisible(false);
    setPreviewImage(null);
  };

  const fetchReviewStats = async (variantId) => {
    try {
      setReviewStatsLoading(true);
      const res = await api.get(`reviews/stats/${variantId}`);
      setReviewStats(res.data);
    } catch (err) {
      toast.error("Không thể lấy dữ liệu đánh giá.");
      setReviewStats(null);
    } finally {
      setReviewStatsLoading(false);
    }
  };

  // ----------- State cho Variant -----------
  const [variantModal, setVariantModal] = useState({
    open: false,
    productId: null,
    productName: "",
  });
  const [variants, setVariants] = useState([]);
  const [variantForm] = useForm();
  const [variantLoading, setVariantLoading] = useState(false);
  const [variantImage, setVariantImage] = useState(""); // Ảnh biến thể
  const [editingVariantId, setEditingVariantId] = useState(null);

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

  // --------- Upload Ảnh Sản phẩm (Product) ---------
  const handleSelectFiles = async (e) => {
    const files = Array.from(e.target.files); // cho phép chọn nhiều file
    const uploadedImages = [];
    for (const file of files) {
      const url = await uploadFile(file);
      uploadedImages.push({ url, isPrimary: false });
    }
    setImageList((prev) => [...prev, ...uploadedImages]);
    form.setFieldsValue({ images: [...imageList, ...uploadedImages] });
  };

  const handleRemoveImage = (idx) => {
    setImageList((prev) => {
      const newList = prev.filter((_, i) => i !== idx);
      form.setFieldsValue({ images: newList });
      return newList;
    });
  };

  // --------- Upload Ảnh Variant ---------
  const handleVariantImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = await uploadFile(file);
      setVariantImage(url);
      variantForm.setFieldsValue({ imageUrl: url });
    }
  };

  // --------- Xem chi tiết sản phẩm (kèm danh sách variant) ---------
  const handleShowDetail = async (record) => {
    setDetailModalRecord(record);
    if (record?.id) {
      const vs = await fetchVariants(record.id);
      setDetailModalVariants(vs);
    } else {
      setDetailModalVariants([]);
    }
  };

  // --------- API fetch variant ---------
  const fetchVariants = async (productId) => {
    const res = await api.get(`ProductVariant/product/${productId}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  };

  // --------- Mở modal quản lý variant ---------
  const openVariantModal = async (productId, productName) => {
    setVariantModal({ open: true, productId, productName });
    loadVariants(productId);
    setEditingVariantId(null);
    variantForm.resetFields();
    setVariantImage(""); // <-- CHỈ reset variant image!
  };

  const closeVariantModal = () => {
    setVariantModal({ open: false, productId: null, productName: "" });
    setVariants([]);
    setEditingVariantId(null);
    variantForm.resetFields();
    setVariantImage(""); // <-- CHỈ reset variant image!
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

  // --------- Thêm/Cập nhật variant ---------
  const handleCreateOrUpdateVariant = async (values) => {
    try {
      if (editingVariantId) {
        await api.put(`ProductVariant/${editingVariantId}`, {
          ...values,
          productId: variantModal.productId,
          id: editingVariantId,
        });
        message.success("Cập nhật biến thể thành công!");
      } else {
        await api.post("ProductVariant", {
          ...values,
          productId: variantModal.productId,
        });
        message.success("Tạo biến thể thành công!");
      }
      variantForm.resetFields();
      setEditingVariantId(null);
      setVariantImage("");
      loadVariants(variantModal.productId);
    } catch {
      message.error("Lỗi khi lưu biến thể!");
    }
  };

  // --------- Edit variant ---------
  const handleEditVariant = (record) => {
    setEditingVariantId(record.id);
    variantForm.setFieldsValue(record);
    setVariantImage(record.imageUrl || ""); // <-- CHỈ set variant image!
  };

  // --------- Xoá variant ---------
  const handleDeleteVariant = async (variantId) => {
    try {
      await api.delete(`ProductVariant/${variantId}`);
      message.success("Xoá biến thể thành công!");
      loadVariants(variantModal.productId);
      if (editingVariantId === variantId) {
        setEditingVariantId(null);
        variantForm.resetFields();
        setVariantImage("");
      }
    } catch {
      message.error("Lỗi khi xoá biến thể!");
    }
  };

  // --------- Form nhập sản phẩm ---------
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
      <Form.Item name="material" label="Chất liệu" rules={[{ required: true }]}>
        <Select>
          <Select.Option value={0}>Cotton 100%</Select.Option>
          <Select.Option value={1}>Cotton Polyester</Select.Option>
          <Select.Option value={2}>Polyester</Select.Option>
          <Select.Option value={3}>Cotton Organic</Select.Option>
          <Select.Option value={4}>Modal</Select.Option>
          <Select.Option value={5}>Bamboo</Select.Option>
          <Select.Option value={6}>Cotton Spandex</Select.Option>
          <Select.Option value={7}>Jersey</Select.Option>
          <Select.Option value={8}>Canvas</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item name="season" label="Mùa" rules={[{ required: true }]}>
        <Select>
          <Select.Option value={0}>Xuân</Select.Option>
          <Select.Option value={1}>Hè</Select.Option>
          <Select.Option value={2}>Thu</Select.Option>
          <Select.Option value={3}>Đông</Select.Option>
          <Select.Option value={4}>Tất cả mùa</Select.Option>
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
      <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
        <Select>
          <Select.Option value={0}>Đang bán</Select.Option>
          <Select.Option value={1}>Ngừng bán</Select.Option>
          <Select.Option value={2}>Hết hàng</Select.Option>
          <Select.Option value={3}>Ngừng sản xuất</Select.Option>
        </Select>
      </Form.Item>
      {/* Ảnh sản phẩm */}
      <Form.Item name="images" label="Ảnh sản phẩm" required>
        <input
          type="file"
          multiple // <-- CHO PHÉP NHIỀU ẢNH
          accept="image/*"
          onChange={handleSelectFiles}
        />
        <div
          style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}
        >
          {imageList.map((img, idx) => (
            <div
              key={idx}
              style={{ position: "relative", display: "inline-block" }}
            >
              <img
                src={img.url}
                alt=""
                style={{
                  width: 60,
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  objectFit: "cover",
                }}
                onClick={() => handlePreviewImage(img.url)}
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: 12,
                  lineHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Xoá ảnh"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </Form.Item>
    </>
  );

  // --------- Chuẩn hóa khi edit sản phẩm ---------
  const prepareFormForEdit = (record) => {
    if (!record) return;
    // Lấy đúng ảnh đầu tiên thôi
    let images =
      typeof record.images === "string"
        ? JSON.parse(record.images || "[]")
        : record.images || [];
    let firstImg =
      images.length > 0
        ? typeof images[0] === "string"
          ? { url: images[0], isPrimary: true }
          : images[0]
        : null;
    setImageList(firstImg ? [firstImg] : []);
    form.setFieldsValue({
      ...record,
      images: firstImg ? [firstImg] : [],
    });
    // KHÔNG reset ảnh variant ở đây!
  };

  // --------- Enum mapping ---------
  const SIZE_MAP = {
    0: "XS",
    1: "S",
    2: "M",
    3: "L",
    4: "XL",
    5: "XXL",
  };
  const COLOR_MAP = {
    0: "Đen",
    1: "Trắng",
    2: "Xám",
    3: "Đỏ",
    4: "Xanh dương",
    5: "Xanh navy",
    6: "Xanh lá",
    7: "Vàng",
    8: "Cam",
    9: "Tím",
    10: "Hồng",
    11: "Nâu",
    12: "Be",
  };
  const getSizeName = (val) => SIZE_MAP[val] || val;
  const getColorName = (val) => COLOR_MAP[val] || val;

  // --------- Table sản phẩm ---------
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
          <img
            src={url}
            alt=""
            style={{ width: 40, borderRadius: 6, cursor: "zoom-in" }}
            onClick={() => handlePreviewImage(url)}
          />
        ) : null;
      },
    },
  ];

  // --------- Custom action trên Table ---------
  const customActions = [
    {
      label: <EyeOutlined style={{ marginRight: 4 }} />,
      className: "detail-button",
      condition: () => true,
      action: (id, record) => handleShowDetail(record),
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
      action: (id, record) => openVariantModal(id, record?.name || ""),
    },
  ];

  // --------- Modal chi tiết sản phẩm ---------
  const renderModalContent = (record) => {
    if (!record) return null;
    let images =
      typeof record.images === "string"
        ? JSON.parse(record.images || "[]")
        : record.images || [];
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
            <img
              src={typeof images[0] === "string" ? images[0] : images[0].url}
              alt="product-img"
              className="product-detail-image"
              style={{ cursor: "zoom-in", width: 120 }}
              onClick={() =>
                handlePreviewImage(
                  typeof images[0] === "string" ? images[0] : images[0].url
                )
              }
            />
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
        {detailModalVariants.length > 0 && (
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
                {
                  title: "Đánh giá",
                  key: "reviews",
                  render: (_, record) => (
                    <Button
                      type="link"
                      onClick={async () => {
                        setSelectedReviewVariant(record);
                        await fetchReviewStats(record.id);
                        setIsReviewModalOpen(true);
                      }}
                    >
                      Xem đánh giá
                    </Button>
                  ),
                },
              ]}
              dataSource={detailModalVariants.map((v) => ({ ...v, key: v.id }))}
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

  // --------- Render ---------
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
        form={form}
        loading={loading}
        showEditDelete={true}
        customActions={customActions}
        // dataSource={products}
        products={products}
        setProducts={setProducts}
        resetImage={() => setImageList([])}
        bulkDeleteApi="/Product/bulk-delete"
        bulkDeleteText="Xoá sản phẩm đã chọn"
        hideDelete={true}
      />

      {/* Modal xem chi tiết sản phẩm */}
      <Modal
        title="Chi tiết sản phẩm"
        open={!!detailModalRecord}
        onCancel={() => setDetailModalRecord(null)}
        footer={null}
        width={1000}
        destroyOnClose
      >
        {renderModalContent(detailModalRecord)}
      </Modal>

      {/* Modal quản lý variant */}
      <Modal
        title={`Biến thể của: ${variantModal.productName}`}
        open={variantModal.open}
        onCancel={closeVariantModal}
        footer={null}
        width={700}
        destroyOnClose
      >
        <Form
          form={variantForm}
          layout="vertical"
          onFinish={handleCreateOrUpdateVariant}
          style={{
            marginBottom: 24,
            background: "#fafafa",
            padding: 12,
            borderRadius: 6,
          }}
        >
          <Form.Item name="color" label="Màu sắc" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={0}>Đen</Select.Option>
              <Select.Option value={1}>Trắng</Select.Option>
              <Select.Option value={2}>Xám</Select.Option>
              <Select.Option value={3}>Đỏ</Select.Option>
              <Select.Option value={4}>Xanh dương</Select.Option>
              <Select.Option value={5}>Xanh navy</Select.Option>
              <Select.Option value={6}>Xanh lá</Select.Option>
              <Select.Option value={7}>Vàng</Select.Option>
              <Select.Option value={8}>Cam</Select.Option>
              <Select.Option value={9}>Tím</Select.Option>
              <Select.Option value={10}>Hồng</Select.Option>
              <Select.Option value={11}>Nâu</Select.Option>
              <Select.Option value={12}>Be</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="size" label="Size" rules={[{ required: true }]}>
            <Select>
              <Select.Option value={0}>XS</Select.Option>
              <Select.Option value={1}>S</Select.Option>
              <Select.Option value={2}>M</Select.Option>
              <Select.Option value={3}>L</Select.Option>
              <Select.Option value={4}>XL</Select.Option>
              <Select.Option value={5}>XXL</Select.Option>
            </Select>
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
          {/* Ảnh variant */}
          <Form.Item name="imageUrl" label="Ảnh Variant">
            <input
              type="file"
              accept="image/*"
              onChange={handleVariantImageUpload}
            />
            {variantImage && (
              <img
                src={variantImage}
                alt=""
                style={{ width: 60, marginTop: 8, borderRadius: 6 }}
                onClick={() => handlePreviewImage(variantImage)}
              />
            )}
          </Form.Item>
          <Form.Item
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>Đang bán</Checkbox>
          </Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            loading={variantLoading}
            style={{ minWidth: 120 }}
          >
            {editingVariantId ? "Cập nhật" : "Thêm biến thể"}
          </Button>
          {editingVariantId && (
            <Button
              style={{ marginLeft: 12 }}
              onClick={() => {
                setEditingVariantId(null);
                variantForm.resetFields();
                setVariantImage("");
              }}
            >
              Huỷ sửa
            </Button>
          )}
        </Form>
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
                      cursor: "zoom-in",
                    }}
                    onClick={() => handlePreviewImage(url)}
                  />
                ) : null,
            },
            {
              title: "Thao tác",
              key: "actions",
              render: (_, record) => (
                <div>
                  <Button
                    type="link"
                    size="small"
                    onClick={() => handleEditVariant(record)}
                  >
                    Sửa
                  </Button>
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => {
                      if (
                        window.confirm("Bạn chắc chắn muốn xoá biến thể này?")
                      ) {
                        handleDeleteVariant(record.id);
                      }
                    }}
                  >
                    Xoá
                  </Button>
                </div>
              ),
            },
          ]}
          dataSource={variants.map((v) => ({ ...v, key: v.id }))}
          pagination={false}
          size="small"
          locale={{ emptyText: "Chưa có biến thể nào." }}
          style={{ marginTop: 16 }}
        />
      </Modal>
      {/* Review Stats Modal */}
      <ReviewStatsModal
        open={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        variant={selectedReviewVariant}
        reviewStats={reviewStats}
        loading={reviewStatsLoading}
      />

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={closePreviewImage}
        width={600}
        centered
        zIndex={3000}
        bodyStyle={{ textAlign: "center", padding: 0, background: "#222" }}
      >
        <img
          src={previewImage}
          alt="Preview"
          style={{
            width: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
            background: "#222",
          }}
        />
      </Modal>
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
