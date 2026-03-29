import React, { useState } from "react";
import Textinput from "@/components/ui/Textinput";
import Textarea from "@/components/ui/Textarea";

const ValidationTypes = () => {
  const [formData, setFormData] = useState({
    username: "",
    number: "",
    betweenNumber: "",
    alphabetic: "",
    length: "",
    password: "",
    url: "",
    message: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Username is required";
    if (!formData.number) newErrors.number = "Number is required";
    if (formData.betweenNumber && (formData.betweenNumber < 1 || formData.betweenNumber > 10)) {
        newErrors.betweenNumber = "Must be between 1 and 10";
    }
    if (formData.length && formData.length.length < 3) {
        newErrors.length = "Minimum 3 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log(formData);
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Textinput
          label="Username"
          type="text"
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          error={errors.username}
        />
        <Textinput
          label="Must only consist of numbers"
          type="text"
          placeholder="Enter Number Only"
          name="number"
          value={formData.number}
          onChange={handleChange}
          error={errors.number}
        />
        <Textinput
          label="Range Value"
          type="text"
          placeholder="Enter Number between 1 & 10"
          name="betweenNumber"
          value={formData.betweenNumber}
          onChange={handleChange}
          error={errors.betweenNumber}
        />

        <Textinput
          label="alphabetic characters"
          type="text"
          placeholder="Enter Character Only"
          name="alphabetic"
          value={formData.alphabetic}
          onChange={handleChange}
          error={errors.alphabetic}
        />

        <Textinput
          label="Length should not be less than the specified length : 3"
          type="text"
          placeholder="Enter minimum 3 Characters"
          name="length"
          value={formData.length}
          onChange={handleChange}
          error={errors.length}
        />
        <Textinput
          label="Password"
          type="password"
          placeholder="8+ characters, 1 Capital letter"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Textinput
          label="Must be a valid url"
          type="url"
          placeholder="Enter Valid URL"
          name="url"
          value={formData.url}
          onChange={handleChange}
          error={errors.url}
        />
        <Textarea
          label="Message"
          placeholder="Write Your Message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          error={errors.message}
        />

        <div className="lg:col-span-2 col-span-1">
          <div className="ltr:text-right rtl:text-left">
            <button type="submit" className="btn btn-dark text-center">Submit</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ValidationTypes;
