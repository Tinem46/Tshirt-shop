import { Button, Form, Input, Modal, Popconfirm, Table } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "antd/es/form/Form";
import PropTypes from "prop-types";
import React from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import api from "../../config/api";
import "./index.scss";
import Swal from "sweetalert2";

function DashboardTemplate(props) {
  const {
    columns,
    apiURI,
    formItems,
    title,
    customActions,
    disableCreate,
    showEditDelete,
    hideEdit,
    resetImage,
    onEdit,
    dataSource,
    bulkDeleteApi,
    bulkDeleteText,
    hideDelete,
    enableBulk = true,

    form: propForm,
  } = props;

  const [dashboard, setDashboard] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = useForm();
  const formInstance = propForm || form;
  const [loading, setLoading] = useState(false);
  const [setFileList] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const fetchDashboard = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const uri = typeof apiURI === "function" ? apiURI("get") : apiURI;
      const response = await api.get(uri, {
        params: { PageSize: size, PageNumber: page },
      });
      // Lấy dữ liệu
      let dataArr = [];
      if (Array.isArray(response.data)) {
        dataArr = response.data;
      } else if (Array.isArray(response.data.data)) {
        dataArr = response.data.data;
      } else if (response.data.data && Array.isArray(response.data.data.data)) {
        dataArr = response.data.data.data;
      } else if (response.data.items && Array.isArray(response.data.items)) {
        // CHỈ lọc khi là items
        dataArr = response.data.items.filter((x) => x.status !== 0);
      } else {
        dataArr = [];
      }

      setDashboard(dataArr);

      setTotal(
        response.data?.totalCount ||
          response.data?.data?.totalCount ||
          dataArr.length
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while fetching dashboard"
      );
      setDashboard([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const tablePagination = props.pagination || {
    current,
    pageSize,
    total,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    onChange: (page, size) => {
      setCurrent(page);
      setPageSize(size);
    },
  };

  useEffect(() => {
    if (!props.dataSource) {
      fetchDashboard(current, pageSize);
    }
  }, [current, pageSize]);

  const handleCustomAction = async (actionConfig, recordId, record) => {
    setActionLoading((prev) => ({
      ...prev,
      [`${actionConfig.label}-${recordId}`]: true,
    }));
    try {
      await actionConfig.action(recordId, record); // <-- Truyền cả record
      if (!dataSource) {
        await fetchDashboard();
      }
    } catch (err) {
      toast.error(
        actionConfig.errorMessage || err.response?.data || "An error occurred"
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`${actionConfig.label}-${recordId}`]: false,
      }));
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    onEdit && onEdit(record);
    formInstance.setFieldsValue(record);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const uri = typeof apiURI === "function" ? apiURI("delete") : apiURI;
      await api.delete(`${uri}/${id}`);
      toast.success("Delete successful");
      if (!dataSource) {
        await fetchDashboard();
      }
    } catch (err) {
      toast.error(err.response?.data || "An error occurred");
    }
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${bulkDeleteText} ${selectedRowKeys.length} selected items?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      // Nếu là hàm custom → gọi trực tiếp
      if (typeof bulkDeleteApi === "function") {
        await bulkDeleteApi(selectedRowKeys);
      }
      // Nếu là endpoint string
      else {
        // Nếu API cần lý do hủy (ví dụ: bulk-cancel)
        if (bulkDeleteApi.toLowerCase().includes("cancel")) {
          const { value: reason } = await Swal.fire({
            title: "Enter Reason",
            input: "text",
            inputPlaceholder: "Reason for cancellation",
            inputLabel: "Cancellation reason",
            showCancelButton: true,
            inputValidator: (value) => {
              if (!value || !value.trim()) return "Reason is required!";
            },
          });

          if (!reason) return;

          await api.post(bulkDeleteApi, {
            orderIds: selectedRowKeys,
            reason: reason.trim(),
          });
        } else {
          // Mặc định cho các API không cần lý do
          await api.post(bulkDeleteApi, { ids: selectedRowKeys });
        }
      }

      toast.success("Bulk delete successful!");
      setSelectedRowKeys([]);
      await fetchDashboard();
    } catch (err) {
      toast.error("Bulk delete failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    console.log("DATA POST TO BACKEND:", values);
    console.log(values);
    setLoading(true);
    const images = Array.isArray(values.images)
      ? values.images
          .filter((img) => img.url && img.url.trim() !== "")
          .map((img) => ({
            ...img, // bao gồm cả id nếu là update
            url: img.url,
            isPrimary: img.isPrimary ?? false,
          }))
      : [];
    const payload = { ...values, images };

    try {
      // if (values.image) {
      //   const img = await uploadFile(values.image.fileList[0].originFileObj);
      //   console.log(img);
      //   values.image = img;
      // }
      const uri =
        typeof apiURI === "function"
          ? apiURI(editingRecord ? "put" : "post")
          : apiURI;
      if (editingRecord) {
        await api.put(`${uri}/${values.id}`, payload);

        toast.success("Update successful");
      } else {
        const response = await api.post(`${uri}`, values);
        toast.success("Create successful");
        setDashboard((prevDashboard) => [...prevDashboard, response.data]);
        resetImage && resetImage();
      }
      setOpen(false);
      setEditingRecord(null);
      if (!dataSource) {
        await fetchDashboard(); // <-- luôn fetch lại sau update/create!
      }
    } catch (err) {
      const errorData = err.response?.data;

      if (!errorData) {
        toast.error("Đã xảy ra lỗi không xác định");
        return;
      }

      // Nếu là string (có thể là lỗi chung)
      if (typeof errorData === "string") {
        toast.error(errorData);
        return;
      }

      // Nếu là object (dạng validation error từ backend)
      if (typeof errorData === "object") {
        Object.entries(errorData).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(`${field}: ${msg}`));
          } else {
            toast.error(`${field}: ${messages}`);
          }
        });
        return;
      }

      // Trường hợp fallback
      toast.error("Đã xảy ra lỗi không xác định");
    } finally {
      setLoading(false);
      resetImage();
    }
  };

  const getColumns = () => [
    ...columns,
    ...(showEditDelete || (customActions && customActions.length > 0)
      ? [
          {
            title: (
              <div
                style={{
                  textAlign: "center",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                Actions
              </div>
            ),
            className: "actions-column",
            key: "actions",
            align: "center", // Thêm dòng này để căn giữa nội dung cột
            render: (_, record) => (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                {customActions &&
                  customActions.map(
                    (action, index) =>
                      typeof action.condition === "function" &&
                      action.condition(record) && (
                        <Button
                          key={`custom-${index}`}
                          onClick={() =>
                            handleCustomAction(action, record.id, record)
                          }
                          loading={
                            actionLoading[`${action.label}-${record.id}`]
                          }
                          style={{
                            backgroundColor: action.color || "#52c41a",
                            borderColor: action.color || "#1890ff",
                            color: "white",
                          }}
                        >
                          {action.label}
                        </Button>
                      )
                  )}
                {showEditDelete && (
                  <>
                    {!hideEdit && (
                      <Button type="primary" onClick={() => handleEdit(record)}>
                        <EditOutlined />
                      </Button>
                    )}
                    {!hideDelete && (
                      <Popconfirm
                        title={`Are you sure you want to delete ${record.name}?`}
                        onConfirm={() => handleDelete(record.id)}
                      >
                        <Button
                          type="primary"
                          danger
                          style={{
                            backgroundColor: "#f44336",
                            borderColor: "#f44336",
                          }}
                        >
                          <DeleteOutlined />
                        </Button>
                      </Popconfirm>
                    )}
                  </>
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  const handleCancel = () => {
    setOpen(false);
    formInstance.resetFields();
    if (!editingRecord) {
      setFileList([]);
    }
    setEditingRecord(null);
  };

  return (
    <div>
      {!disableCreate && (
        <Button
          onClick={() => {
            formInstance.resetFields();
            setOpen(true);
            setEditingRecord(null);
            if (resetImage) resetImage();
          }}
        >
          Create new {title.toLowerCase()}
        </Button>
      )}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          fontSize: 16,
          gap: 8,
          fontWeight: 500,
          border: "1px solid #f0f0f0",
          padding: "8px 16px",
          borderRadius: 4,
          backgroundColor: "#fafafa",
          marginTop: 16,
        }}
      >
        Tổng số {title.toLowerCase()}:{" "}
        <span style={{ fontWeight: 700 }}>{total}</span>
      </div>
      {enableBulk && (
        <Button
          danger
          disabled={selectedRowKeys.length === 0}
          onClick={handleBulkDelete}
          style={{ marginBottom: 12 }}
        >
          {bulkDeleteText || "Xoá các mục đã chọn"}
        </Button>
      )}
      <Table
        columns={getColumns()}
        dataSource={dataSource || dashboard}
        loading={loading}
        rowKey="id"
        pagination={tablePagination}
        rowSelection={
          enableBulk
            ? {
                selectedRowKeys,
                onChange: setSelectedRowKeys,
              }
            : null
        }
      />
      <Modal
        title={`${editingRecord ? "Edit" : "Create"} ${title}`}
        open={open}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" type="dashed" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => formInstance.submit()}
            loading={loading}
          >
            Save
          </Button>,
        ]}
      >
        <Form
          labelCol={{ span: 24 }}
          onFinish={handleSubmit}
          form={formInstance}
        >
          <Form.Item name="id" label="id" hidden>
            <Input />
          </Form.Item>
          {formItems}
        </Form>
      </Modal>
    </div>
  );
}

DashboardTemplate.propTypes = {
  columns: PropTypes.array.isRequired,
  apiURI: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  formItems: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  customActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node.isRequired,
      condition: PropTypes.func.isRequired,
      action: PropTypes.func.isRequired,
    })
  ),
  disableCreate: PropTypes.bool,
  showEditDelete: PropTypes.bool,
  hideEdit: PropTypes.bool,
  onEdit: PropTypes.func,
  dataSource: PropTypes.array,
  form: PropTypes.object,
  loading: PropTypes.bool,
  rowSelection: PropTypes.object, // thêm prop này!
};

DashboardTemplate.defaultProps = {
  showEditDelete: true,
  hideEdit: false,
};

export default DashboardTemplate;
