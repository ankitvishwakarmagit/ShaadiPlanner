
"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Modal, Button } from "react-bootstrap"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import onboardingImg from "../assets/images/onboarding.png"
// import "../styles/admin-auth.css"

const VendorResetRequest = () => {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const { requestVendorOtp, verifyVendorOtp, loading } = useAuth()
  const navigate = useNavigate()

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    const success = await requestVendorOtp(email)
    if (success) setShowOtpModal(true)
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    const success = await verifyVendorOtp(email, otp)
    if (success) {
      setShowOtpModal(false)
      navigate("/vendor/reset-password", { replace: true })
    }
  }

  return (
    <>
      <div className="main-container">
        <div className="logo-onboarding" style={{ backgroundImage: `url(${onboardingImg})` }}>
          <h1 className="logo">ShaadiPlanner</h1>
        </div>
        <div className="sign-in-form">
          <h4>Welcome to ShaadiPlanner</h4>
          <form id="vendor-reset-request-form" onSubmit={handleEmailSubmit}>
            <h5>Reset Password</h5>
            <label htmlFor="email">Email Address *</label>
            <div className="name-area">
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
                disabled={loading}
              />
            </div>
            <div className="back-forth-buttons">
              <div className="back-button">
                <Button type="button" onClick={() => navigate("/vendor/login")} disabled={loading}>
                  Back
                </Button>
              </div>
              <div className="submit-continue-button">
                <Button type="submit" disabled={loading}>
                  {loading ? "Sending OTP..." : "Continue"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered dialogClassName="otp-modal">
        <Modal.Body className="otp-modal-content">
          <h6>Enter OTP</h6>
          <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>
            We've sent a 6-digit OTP to <strong>{email}</strong>
          </p>
          <input
            type="text"
            id="otpInput"
            placeholder="Enter the OTP sent to your email"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading}
          />
          <Button className="verify-button" onClick={handleOtpSubmit} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
          <Button className="cancel-button" onClick={() => setShowOtpModal(false)} disabled={loading}>
            Cancel
          </Button>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </>
  )
}

export default VendorResetRequest
