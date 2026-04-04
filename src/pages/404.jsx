import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logOut } from "@/store/api/auth/authSlice";
// import ErrorImage from "@/assets/images/all-img/404.svg";
import ErrorImage from "@/assets/images/logo/edunex-logo.png";
import Button from "@/components/ui/Button";

function Error() {
    const { isAuth, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogOut = () => {
        dispatch(logOut());
        navigate("/");
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center py-20 container mx-auto ">
            <div className="max-w-[546px] mx-auto w-full mt-12">
                <img src={ErrorImage} alt="" className=" h-[90px] mx-auto" />
                <h4 className="  capitalize text-4xl my-4">
                    <span className=" text-5xl text-red-500 font-bold">404</span> - Page
                    Not Found
                </h4>
                <div className=" text-base font-normal mb-10">
                    {user?.Access?.length === 0 ? (
                        <p className="text-danger-500 font-bold">
                            Warning: Your account has no assigned permissions. Please contact your administrator.
                        </p>
                    ) : (
                        <p>The page you are looking for does not exist or you do not have permission to view it.</p>
                    )}
                </div>
            </div>
            <div className="max-w-[300px] mx-auto w-full space-y-4">
                <Link
                    to={!isAuth ? "/" : "/dashboard"}
                    className="btn btn-primary light transition-all duration-150 block text-center"
                >
                    Go to homepage
                </Link>
                {isAuth && (
                    <Button
                        text="Sign Out & Return to Login"
                        className="btn-danger w-full"
                        onClick={handleLogOut}
                    />
                )}
            </div>
        </div>
    );
}

export default Error;
