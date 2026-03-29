import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./common/login-form";
import useDarkMode from "@/hooks/useDarkMode";
import Logo from "@/assets/images/logo/logo-c.svg";
import VectorsImage from "@/assets/images/vectors-image/vectors-1.svg";

const login2 = () => {
	const [isDark] = useDarkMode();
	return (
		<div className="container-fluid p-0">
			<div className="row g-0 min-vh-100">
				{/* Background Illustration - Visible only on LG screens and above */}
				<div className="col-lg-7 col-xl-8 d-none d-lg-block bg-primary bg-opacity-10">
					<div className="w-100 h-100 d-flex align-items-center justify-content-center p-5">
						<img
							src={VectorsImage}
							alt="Authentication Illustration"
							className="img-fluid"
							style={{ maxWidth: "80%" }}
						/>
					</div>
				</div>

				{/* Login Form Section */}
				<div className="col-12 col-lg-5 col-xl-4 d-flex flex-column bg-white dark:bg-slate-900" style={{ minHeight: "100vh" }}>
					{/* Vertically centered form container */}
					<div className="flex-grow-1 d-flex flex-column justify-content-center px-4 px-md-5 py-5 w-100">
						<div className="mx-auto w-100" style={{ maxWidth: "400px" }}>
							<div className="mb-5">
								<Link to="/">
									<img
										src={Logo}
										alt="Edunex Logo"
										className="img-fluid"
										style={{ height: "48px" }}
									/>
								</Link>
							</div>

							<div className="mb-4">
								<h2 className="h4 fw-bold text-dark dark:text-white mb-2 poppins">
									Login to Edunex
								</h2>
								{/* <p className="text-muted mb-0">
									Please sign in to access your dashboard and manage your institution.
								</p> */}
							</div>

							<div className="mt-2">
								<LoginForm />
							</div>
						</div>
					</div>

					{/* Fixed Footer at the bottom */}
					<div className="p-4 text-center w-100">
						<div className="d-flex justify-content-center small text-muted gap-3 mb-3">
							<a href="#" className="text-decoration-none hover:text-primary transition-colors poppins font-medium">Privacy Notice</a>
							<span className="text-muted opacity-25">|</span>
							<a href="#" className="text-decoration-none hover:text-primary transition-colors poppins font-medium">Terms of Service</a>
						</div>
						<p className="small text-muted mb-0 opacity-50 poppins">
							&copy; {new Date().getFullYear()} Edunex. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default login2;



