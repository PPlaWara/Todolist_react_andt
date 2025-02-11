import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  List,
  Select,
  Modal,
  Form,
  DatePicker,
  Typography,
} from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { Title } = Typography;

export default function TodoApp() {
  const [tasks, setTasks] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterDate, setFilterDate] = useState("all");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();

  // Load tasks & filters from localStorage on first mount
  useEffect(() => {
    try {
      const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
      setTasks(storedTasks);

      const savedFilterType = localStorage.getItem("filterType") || "all";
      const savedFilterDate = localStorage.getItem("filterDate") || "all";
      setFilterType(savedFilterType);
      setFilterDate(savedFilterDate);
    } catch (error) {
      console.error("Error loading tasks from localStorage", error);
    }
  }, []);

  // Save tasks to localStorage whenever tasks state changes
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Save filters to localStorage whenever filters change
  useEffect(() => {
    localStorage.setItem("filterType", filterType);
    localStorage.setItem("filterDate", filterDate);
  }, [filterType, filterDate]);

  const openModal = (task = null) => {
    setEditingTask(task);
    setIsModalVisible(true);
    if (task) {
      form.setFieldsValue({
        topic: task.topic,
        description: task.description,
        dateTime: dayjs(task.dateTime),
        type: task.type,
      });
    } else {
      form.resetFields();
    }
  };

  const handleSubmit = (values) => {
    const newTask = {
      id: editingTask ? editingTask.id : Date.now(),
      topic: values.topic,
      description: values.description,
      dateTime: values.dateTime.format("YYYY-MM-DD HH:mm"),
      type: values.type,
    };

    if (editingTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === editingTask.id ? newTask : task))
      );
    } else {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    }

    setIsModalVisible(false);
    setEditingTask(null);
  };

  const deleteTask = (id) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    const isTypeMatch = filterType === "all" || task.type === filterType;
    const isDateMatch =
      filterDate === "all" ||
      (filterDate === "upcoming" && dayjs(task.dateTime).isAfter(dayjs())) ||
      (filterDate === "expired" && dayjs(task.dateTime).isBefore(dayjs()));

    return isTypeMatch && isDateMatch;
  });

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", textAlign: "center" }}>
      <Title level={2}>To-Do List</Title>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => openModal()}
        style={{ marginBottom: 20 }}
      >
        Add Task
      </Button>

      <div style={{ display: "flex", gap: "10px", marginBottom: 20 }}>
        <Select value={filterType} onChange={setFilterType} style={{ flex: 1 }}>
          <Option value="all">All Types</Option>
          <Option value="Meeting">Meeting</Option>
          <Option value="Task">Task</Option>
          <Option value="Event">Event</Option>
        </Select>

        <Select value={filterDate} onChange={setFilterDate} style={{ flex: 1 }}>
          <Option value="all">All Tasks</Option>
          <Option value="upcoming">Upcoming</Option>
          <Option value="expired">Expired</Option>
        </Select>
      </div>

      <List
        bordered
        dataSource={filteredTasks}
        renderItem={(task) => (
          <List.Item
            actions={[
              <EditOutlined onClick={() => openModal(task)} />,
              <DeleteOutlined
                onClick={() => deleteTask(task.id)}
                style={{ color: "red" }}
              />,
            ]}
          >
            <div style={{ textAlign: "left", width: "100%" }}>
              <strong>{task.topic}</strong>
              <p>{task.description}</p>
              <small>
                Date: {dayjs(task.dateTime).format("MMM D, YYYY h:mm A")}
              </small>
              <p>
                <strong>Type:</strong> {task.type}
              </p>
            </div>
          </List.Item>
        )}
      />

      <Modal
        title={editingTask ? "Edit Task" : "Add Task"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="topic"
            label="Topic"
            rules={[{ required: true, message: "Topic is required" }]}
          >
            <Input placeholder="Enter task topic" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Description is required" }]}
          >
            <Input.TextArea rows={3} placeholder="Enter task description" />
          </Form.Item>
          <Form.Item
            name="dateTime"
            label="Date & Time"
            rules={[{ required: true, message: "Select date & time" }]}
          >
            <DatePicker showTime style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Select task type" }]}
          >
            <Select>
              <Option value="Meeting">Meeting</Option>
              <Option value="Task">Task</Option>
              <Option value="Event">Event</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
