import { Button, Form, Input, Modal, Popconfirm, Table } from "antd";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "antd/es/form/Form";
import PropTypes from "prop-types";
import React from "react";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import api from "../../config/api";
import uploadFile from "../../utils/upload";
import "./index.scss";

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
    form: propForm,
    loading: externalLoading,
    rowSelection, // <- nhận prop này để truyền cho Table
  } = props;

  const [dashboard, setDashboard] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = useForm();
  const formInstance = propForm || form;
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const uri = typeof apiURI === "function" ? apiURI("get") : apiURI;
      const response = await api.get(uri, {
        params: { PageSize: 100 },
      });
      // ===> Sửa tại đây:
      if (Array.isArray(response.data)) {
        setDashboard(response.data);
      } else if (Array.isArray(response.data.data)) {
        setDashboard(response.data.data);
      } else if (response.data.data && Array.isArray(response.data.data.data)) {
        setDashboard(response.data.data.data);
      } else {
        setDashboard([]);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "An error occurred while fetching dashboard"
      );
      setDashboard([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!dataSource) {
      fetchDashboard();
    }
  }, []);

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

  const handleSubmit = async (values) => {
    console.log(values);
    setLoading(true);
    try {
      if (values.image) {
        const img = await uploadFile(values.image.fileList[0].originFileObj);
        console.log(img);
        values.image = img;
      }
      const uri =
        typeof apiURI === "function"
          ? apiURI(editingRecord ? "put" : "post")
          : apiURI;
      if (editingRecord) {
        await api.put(`${uri}/${values.id}`, values);
        toast.success("Update successful");
      } else {
        const response = await api.post(`${uri}`, values);
        toast.success("Create successful");
        setDashboard((prevDashboard) => [...prevDashboard, response.data]);
        resetImage && resetImage();
      }
      setOpen(false);
      setEditingRecord(null);
      fetchDashboard();
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
            title: "Actions",
            key: "actions",
            render: (_, record) => (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {customActions &&
                  customActions.map(
                    (action, index) =>
                      typeof action.condition === "function" &&
                      action.condition(record) && (
                        <Button
                          key={`custom-${index}`}
                          onClick={() =>
                            handleCustomAction(action, record.id, record)
                          } // <-- PHẢI truyền thêm `record` ở đây!
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
            setFileList([]);
          }}
        >
          Create new {title.toLowerCase()}
        </Button>
      )}
      <Table
        columns={getColumns()}
        dataSource={dataSource || dashboard}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
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
