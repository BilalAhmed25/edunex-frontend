import React from "react";
import Dropdown from "@/components/ui/Dropdown";
import Icon from "@/components/ui/Icon";
import Button from "@/components/ui/Button";
import { Menu, Transition } from "@headlessui/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "@/store/api/auth/authSlice";
import clsx from "clsx";
import UserAvatar from "@/assets/images/placeholder/blank-profile.png";

const ProfileLabel = ({ sticky, user }) => {
    return (
        <div
            className={clsx(" rounded-full transition-all duration-300 border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden", {
                "h-9 w-9": sticky,
                "lg:h-12 lg:w-12 h-7 w-7": !sticky,
            })}
        >
            <img
                src={user?.Photo || UserAvatar}
                alt="Avatar"
                className="block w-full h-full object-cover"
            />
        </div>
    );
};

const Profile = ({ sticky }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);

    const ProfileMenu = [
        {
            label: "Update Profile",
            icon: "ph:user-circle-bold",
            status: "blue",
            action: () => navigate("/user-profile"),
        },
        {
            label: "Customize Dashboard",
            icon: "ph:squares-four-bold",
            status: "green",
            action: () => navigate("/settings/dashboard"),
        },
        {
            label: "Update Password",
            icon: "ph:lock-key-bold",
            status: "yellow",
            action: () => navigate("/user-profile?tab=password"),
        },
    ];


    const handleLogout = () => {
        dispatch(logOut());
        navigate("/");
    };
    return (
        <Dropdown
            label={<ProfileLabel sticky={sticky} user={user} />}
            classMenuItems="w-[350px] top-[58px] rounded-2xl shadow-xl border-2 border-slate-500 dark:border-slate-800 bg-white dark:bg-[#111111]"
        >
            <div className="flex items-center px-4 py-2 border-b border-gray-100 dark:border-slate-800 mb-2 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex-none mr-3">
                    <div className="h-14 w-14 rounded-full border-2 bg-slate-100 border-white dark:border-slate-600 shadow-sm overflow-hidden">
                        <img
                            src={user?.Photo || UserAvatar}
                            alt="Avatar"
                            className="block w-full h-full object-cover"
                        />
                    </div>
                </div>
                <div className="flex-1 text-slate-800 dark:text-slate-100 text-sm font-bold">
                    <span className="truncate w-[220px] block">{user?.FirstName ? `${user.FirstName} ${user.LastName || ''}` : user?.Email}</span>
                    <span className="block font-medium text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">
                        {user?.RoleName ?? ""}
                    </span>
                </div>
            </div>
            <div className="space-y-3">
                {ProfileMenu.map((item, index) => (
                    <Menu.Item key={index}>
                        {({ active }) => (
                            <div
                                onClick={() => item.action()}
                                className={`${active
                                    ? " text-indigo-500 "
                                    : "text-gray-600 dark:text-gray-300"
                                    } block transition-all duration-150 group     `}
                            >
                                <div className={`block cursor-pointer px-4 `}>
                                    <div className="flex items-center space-x-3 rtl:space-x-reverse ">
                                        <span
                                            className={`flex-none h-9 w-9  inline-flex items-center justify-center group-hover:scale-110 transition-all duration-200  rounded-full text-2xl text-white
                                                    ${item.status === "cyan" ? "bg-cyan-500 " : ""} 
                                                    ${item.status === "blue" ? "bg-indigo-500 " : ""} 
                                                    ${item.status === "red" ? "bg-red-500 " : ""} 
                                                    ${item.status === "green" ? "bg-green-500 " : ""}${item.status === "yellow" ? "bg-yellow-500 " : ""
                                                }
                                            `}
                                        >
                                            <Icon icon={item.icon} />
                                        </span>
                                        <span className="block text-sm">{item.label}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Menu.Item>
                ))}
                <Menu.Item onClick={handleLogout}>
                    <div className="px-4 border-t border-gray-100 dark:border-slate-700 py-2 mt-2 pt-3">
                        <button className="flex items-center space-x-3 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 group">
                            <span className="flex-none h-9 w-9 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                <Icon icon="ph:sign-out-bold" />
                            </span>
                            <span className="text-sm font-bold">Logout</span>
                        </button>
                    </div>
                </Menu.Item>
            </div>
        </Dropdown>
    );
};

export default Profile;
