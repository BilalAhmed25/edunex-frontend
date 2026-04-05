import React from "react";
import { Link } from "react-router-dom";
import ForgotPass from "./common/forgot-pass";
import useDarkMode from "@/hooks/useDarkMode";
import Logo from "@/assets/images/logo/Edunex-Square-Logo.png";
import VectorsImage from "@/assets/images/vectors-image/vectors-1.svg";

const ForgotPass2 = () => {
	const [isDark] = useDarkMode();
	return (
		<div className="container-fluid p-0">
			<div className="row g-0 min-vh-100">
				{/* Background Illustration - Matches login2 exactly */}
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

				{/* Forgot Password Form Section */}
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
								<h2 className="h3 fw-bold text-dark dark:text-white mb-2 ">
									Forgot Your Password?
								</h2>
								<p className="text-muted mb-0">
									No worries! Enter your email below to receive instructions on how to reset your account credentials.
								</p>
							</div>

							<div className="mt-2">
								<ForgotPass />
							</div>

							<div className="text-center text-sm mt-5 mb-1 text-muted">
								<span>Forget It, </span>
								<Link to="/login2" className="text-primary text-decoration-none fw-medium ">
									Send me back
								</Link>
								<span> to the sign in</span>
							</div>
						</div>
					</div>

					{/* Fixed Footer at the bottom */}
					<div className="p-4 text-center w-100">
						<div className="d-flex justify-content-center small text-muted gap-3 mb-3">
							<a href="#" className="text-decoration-none hover:text-primary transition-colors  font-medium">Privacy Notice</a>
							<span className="text-muted opacity-25">|</span>
							<a href="#" className="text-decoration-none hover:text-primary transition-colors  font-medium">Terms of Service</a>
						</div>
						<p className="small text-muted mb-0 opacity-50 ">
							&copy; {new Date().getFullYear()} Edunex. All rights reserved.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPass2;



