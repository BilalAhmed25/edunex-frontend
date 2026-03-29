import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { NavLink } from "react-router-dom";
import Icon from "@/components/ui/Icon";

const Dropdown = ({
  label = "Dropdown",
  wrapperClass = "d-inline-block",
  labelClass = "",
  children,
  classMenuItems = "mt-2",
  items = [
    {
      label: "Action",
      link: "#",
    },
    {
      label: "Another action",
      link: "#",
    },
    {
      label: "Something else here",
      link: "#",
    },
  ],
  classItem = "px-3 py-2",
  className = "",
}) => {
  return (
    <div className={`dropdown position-relative ${wrapperClass}`}>
      <Menu as="div" className={`w-100 ${className}`}>
        <Menu.Button as="div" className="dropdown-button w-100 cursor-pointer">
          <div className={labelClass}>{label}</div>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={`dropdown-menu show position-absolute end-0 shadow border border-light rounded-lg z-modal ${classMenuItems}`}
            style={{ minWidth: "220px" }}
          >
            <div className="py-1">
              {children
                ? children
                : items?.map((item, index) => (
                    <Menu.Item key={index}>
                      {({ active }) => (
                        <div
                          className={`dropdown-item ${
                            active ? "active" : ""
                          } ${
                            item.hasDivider ? "border-top border-light mt-1 pt-1" : ""
                          }`}
                        >
                          {item.link ? (
                            <NavLink
                              to={item.link}
                              className="text-decoration-none d-block w-100"
                              style={{ color: "inherit" }}
                            >
                              <div className={`d-flex align-items-center ${classItem}`}>
                                {item.icon && (
                                  <span className="me-2 fs-5 d-flex align-items-center">
                                    <Icon icon={item.icon} />
                                  </span>
                                )}
                                <span className="small">
                                  {item.label}
                                </span>
                              </div>
                            </NavLink>
                          ) : (
                            <div
                              className="d-block w-100 cursor-pointer"
                              onClick={item.onClick}
                            >
                              <div className={`d-flex align-items-center ${classItem}`}>
                                {item.icon && (
                                  <span className="me-2 fs-5 d-flex align-items-center">
                                    <Icon icon={item.icon} />
                                  </span>
                                )}
                                <span className="small">
                                  {item.label}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Menu.Item>
                  ))}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default Dropdown;

