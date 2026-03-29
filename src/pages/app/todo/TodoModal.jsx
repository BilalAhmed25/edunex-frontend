import React, { useState, useEffect } from "react";
import Select, { components } from "react-select";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import Flatpickr from "react-flatpickr";
import avatar1 from "@/assets/images/avatar/avatar-1.jpg";
import avatar2 from "@/assets/images/avatar/avatar-2.jpg";
import avatar3 from "@/assets/images/avatar/avatar-3.jpg";
import avatar4 from "@/assets/images/avatar/avatar-4.jpg";
import Modal from "@/components/ui/Modal";

const styles = {
  multiValue: (base, state) => {
    return state.data.isFixed ? { ...base, opacity: "0.5" } : base;
  },
  multiValueLabel: (base, state) => {
    return state.data.isFixed
      ? { ...base, color: "#626262", paddingRight: 6 }
      : base;
  },
  multiValueRemove: (base, state) => {
    return state.data.isFixed ? { ...base, display: "none" } : base;
  },
  option: (provided, state) => ({
    ...provided,
    fontSize: "14px",
  }),
};

const assigneeOptions = [
  { value: "jone", label: "Jone Doe", image: avatar1 },
  { value: "faruk", label: "Faruk", image: avatar2 },
  { value: "hasin", label: "Hasin", image: avatar3 },
  { value: "haq", label: "Salauddin", image: avatar4 },
];

const tagsOptions = [
  { value: "team", label: "team" },
  { value: "low", label: "low" },
  { value: "medium", label: "medium" },
  { value: "high", label: "high" },
  { value: "update", label: "update" },
];

const OptionComponent = ({ data, ...props }) => {
  return (
    <components.Option {...props}>
      <span className="flex items-center space-x-4">
        <div className="flex-none">
          <div className="h-7 w-7 rounded-full">
            <img
              src={data.image}
              alt=""
              className="w-full h-full rounded-full"
            />
          </div>
        </div>
        <span className="flex-1">{data.label}</span>
      </span>
    </components.Option>
  );
};

const TodoModal = ({ todo, showModal, onClose, onAdd, onEdit }) => {
  const [formData, setFormData] = useState({
    title: "",
    assign: [],
    tags: [],
    description: "",
    dueDate: new Date()
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || "",
        assign: todo.assign || [],
        tags: todo.category || [],
        description: todo.description || "",
        dueDate: todo.dueDate ? new Date(todo.dueDate) : new Date()
      });
    } else {
      setFormData({
        title: "",
        assign: [],
        tags: [],
        description: "",
        dueDate: new Date()
      });
    }
    setErrors({});
  }, [todo, showModal]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.assign || formData.assign.length === 0) newErrors.assign = "Assignee is required";
    if (!formData.tags || formData.tags.length === 0) newErrors.tags = "Tag is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      ...todo, // if edit
      title: formData.title,
      assign: formData.assign,
      category: formData.tags,
      description: formData.description,
      dueDate: formData.dueDate,
      completed: todo ? todo.completed : false
    };

    if (todo) {
      onEdit(data);
    } else {
      onAdd(data);
    }
  };

  return (
    <Modal
      title={todo ? "Edit Task" : "Add Task"}
      labelclassName="btn-outline-dark"
      activeModal={showModal}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <Textinput
          name="title"
          label="Title"
          type="text"
          placeholder="Enter title"
          value={formData.title}
          onChange={(e) => handleChange("title", e.target.value)}
          error={errors.title}
        />
        <div className={errors.assign ? "is-error" : ""}>
          <label className="form-label mb-2 block" htmlFor="assignees">
            Assignee
          </label>
          <Select
            options={assigneeOptions}
            styles={styles}
            className="react-select"
            classNamePrefix="select"
            isMulti
            components={{ Option: OptionComponent }}
            id="assignees"
            value={formData.assign}
            onChange={(val) => handleChange("assign", val)}
          />
          {errors.assign && (
            <div className="mt-2 text-red-600 block text-sm">
              {errors.assign}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="default-picker" className="form-label mb-2 block">
            Due Date
          </label>
          <Flatpickr
            className="form-control py-2"
            id="default-picker"
            value={formData.dueDate}
            onChange={(date) => handleChange("dueDate", date[0])}
          />
        </div>
        <div className={errors.tags ? "is-error" : ""}>
          <label className="form-label mb-2 block" htmlFor="tags">
            Tag
          </label>
          <Select
            options={tagsOptions}
            styles={styles}
            className="react-select"
            classNamePrefix="select"
            isMulti
            id="tags"
            value={formData.tags}
            onChange={(val) => handleChange("tags", val)}
          />
          {errors.tags && (
            <div className="mt-2 text-red-600 block text-sm">
              {errors.tags}
            </div>
          )}
        </div>
        <Textarea
          label="Description"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
        <div className="space-x-3 mt-3 flex justify-end">
          <button type="submit" className="btn btn-primary">
            {todo ? "Save" : "Add"} Task
          </button>
          <button type="button" onClick={onClose} className="btn btn-danger">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TodoModal;
