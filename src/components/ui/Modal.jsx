import { Dialog, Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import Icon from "@/components/ui/Icon";

const Modal = ({
    activeModal,
    onClose,
    enterFrom,
    leaveFrom,
    disableBackdrop,
    className = "max-w-lg",
    children,
    footerContent,
    centered = true,
    scrollContent,
    title,
    uncontrolled,
    label = "Basic Modal",
    labelClass,
    isBlur,
}) => {
    const [showModal, setShowModal] = useState(false);

    const closeModal = () => {
        setShowModal(false);
    };

    const openModal = () => {
        setShowModal(!showModal);
    };
    const returnNull = () => {
        return null;
    };

    return (
        <>
            {uncontrolled ? (
                <>
                    <button
                        type="button"
                        onClick={openModal}
                        className={`btn ${labelClass}`}
                    >
                        {label}
                    </button>
                    <Transition appear show={showModal} as={Fragment}>
                        <Dialog
                            as="div"
                            className="relative z-[99999]"
                            onClose={!disableBackdrop ? closeModal : returnNull}
                        >
                            {!disableBackdrop && (
                                <Transition.Child
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="fixed inset-0 bg-white/50 dark:bg-black/60 backdrop-blur-md" />
                                </Transition.Child>
                            )}

                            <div className="fixed inset-0 overflow-y-auto">
                                <div className={`flex min-h-full justify-center text-center p-6 ${centered ? "items-center" : "items-start "}`} >
                                    <Transition.Child
                                        as={Fragment}
                                        enter={"duration-300  ease-out"}
                                        enterFrom={`opacity-0 ${enterFrom} `}
                                        enterTo={`opacity-100  ${leaveFrom}`}
                                        leave={"duration-200 ease-in"}
                                        leaveFrom={`opacity-100  ${leaveFrom}`}
                                        leaveTo={`opacity-0 ${enterFrom}`}
                                    >
                                        <Dialog.Panel className={`w-full transform overflow-hidden rounded-3xl bg-white dark:bg-[#111111] text-left align-middle shadow-2xl transition-all border dark:border-[#2f3336] ${className}`}>
                                            {title && (
                                                <div className={`relative overflow-hidden py-5 px-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center`}>
                                                    <h2 className="capitalize leading-6 font-bold text-lg text-slate-800 dark:text-slate-100 ">
                                                        {title}
                                                    </h2>
                                                    <button onClick={closeModal} className="text-[22px]">
                                                        <Icon icon="heroicons-outline:x" />
                                                    </button>
                                                </div>
                                            )}
                                            <div
                                                className={`px-6 py-8 ${scrollContent ? "overflow-y-auto max-h-[400px]" : ""
                                                    }`}
                                            >
                                                {children}
                                            </div>
                                            {footerContent && (
                                                <div className="px-4 py-3 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
                                                    {footerContent}
                                                </div>
                                            )}
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </div>
                        </Dialog>
                    </Transition>
                </>
            ) : (
                <Transition appear show={activeModal} as={Fragment}>
                    <Dialog as="div" className="relative z-[99999]" onClose={onClose}>
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-white/30 dark:bg-black/60 backdrop-blur-sm" />
                        </Transition.Child>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className={`flex min-h-full justify-center text-center p-6 ${centered ? "items-center" : "items-start "}`} >
                                <Transition.Child
                                    as={Fragment}
                                    enter={"duration-300  ease-out"}
                                    enterFrom={`opacity-0 ${enterFrom} `}
                                    enterTo={`opacity-100  ${leaveFrom}`}
                                    leave={"duration-200 ease-in"}
                                    leaveFrom={`opacity-100  ${leaveFrom}`}
                                    leaveTo={`opacity-0 ${enterFrom}`}
                                >
                                    <Dialog.Panel className={`w-full transform overflow-hidden rounded-3xl bg-white dark:bg-[#111111] text-left align-middle shadow-2xl border dark:border-[#2f3336] transition-all ${className}`}>
                                        {title && (
                                            <div className={`relative overflow-hidden py-4 px-8 border-b border-slate-100 dark:border-slate-700 text-slate-800 flex justify-between items-center`}>
                                                <h2 className="capitalize leading-6 text-lg dark:text-slate-100 ">
                                                    {title}
                                                </h2>
                                                <button onClick={onClose} className="text-[22px]">
                                                    <Icon icon="heroicons-outline:x" />
                                                </button>
                                            </div>
                                        )}
                                        <div
                                            className={`px-6 py-8 ${scrollContent ? "overflow-y-auto max-h-[400px]" : ""
                                                }`}
                                        >
                                            {children}
                                        </div>
                                        {footerContent && (
                                            <div className="px-4 py-3 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-700">
                                                {footerContent}
                                            </div>
                                        )}
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            )}
        </>
    );
};

export default Modal;
