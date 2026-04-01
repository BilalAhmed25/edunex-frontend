import React from "react";
import Select from "./Select";

const MultiSelect = (props) => {
  return <Select {...props} isMulti={true} />;
};

export default MultiSelect;
