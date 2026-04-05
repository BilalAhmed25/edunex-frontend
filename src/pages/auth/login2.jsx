import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./common/login-form";
import useDarkMode from "@/hooks/useDarkMode";
// import Logo from "@/assets/images/logo/Edunex-Square-Logo.png";
import Logo from "@/assets/images/logo/Edunex-Logo.png";
import VectorsImage from "@/assets/images/vectors-image/vectors-1.svg";
// import VectorsImage from "@/assets/images/vectors-image/login.jpg";

const login2 = () => {
	const [isDark] = useDarkMode();
	return (
		<div className="container-fluid p-0">
			<div className="row g-0 min-vh-100">
				{/* Background Illustration - Visible only on LG screens and above */}
				<div className="col-lg-7 col-xl-8 d-none d-lg-block bg-secondary bg-opacity-10 h-screen overflow-hidden">
					<div className="w-100 h-100 d-flex align-items-center justify-content-center p-4">
						<img
							src={VectorsImage}
							alt="Authentication Illustration"
							className="h-100 w-auto"
							style={{ objectFit: 'contain' }}
						/>
					</div>
				</div>

				{/* Login Form Section */}
				<div className="col-12 col-lg-5 col-xl-4 h-screen overflow-y-auto bg-white dark:bg-slate-900 custom-scrollbar flex flex-col">
					{/* Branding & Welcome Header - Fixed at Top */}
					<div className="flex-none p-8 px-md-5">
						<Link to="/">
							<img
								src={Logo}
								alt="Edunex Logo"
								className="img-fluid"
								style={{ height: "58px", marginLeft: '-5px' }}
							/>
						</Link>
					</div>

					{/* Vertically centered form container - Expands to fill space */}
					<div className="flex-grow-1 d-flex flex-column justify-content-center px-4 px-md-5 py-2 w-100 mb-5">
						<div className="mx-auto w-100" style={{ maxWidth: "540px" }}>
							<div className="mb-6">
								<h2 className="text-2xl font-bold text-slate-600 dark:text-slate-300 mb-2 poppins">
									Login to edunex.
								</h2>
								<p className="text-xs text-slate-400">
									Access your institutional dashboard
								</p>
							</div>
							<LoginForm />
						</div>
					</div>

					{/* Aligned Footer at the bottom */}
					<div className="flex-none p-8 text-center w-100">
						<div className="d-flex justify-content-center items-center small text-slate-800 gap-4 mb-3">
							<a href="#" className="text-decoration-none hover:text-primary transition-all poppins text-[11px]">Privacy Notice</a>
							<div className="h-1 w-1 bg-slate-300 rounded-full"></div>
							<a href="#" className="text-decoration-none hover:text-primary transition-all poppins text-[11px]">Terms of Service</a>
						</div>
						<p className="small text-slate-400 text-[11px] mb-0 poppins">
							&copy; {new Date().getFullYear()} Edunex. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default login2;



