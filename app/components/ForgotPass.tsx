"use client";
import React, { useRef, useState, useEffect } from "react";
import { ChangePageProps } from "@/types";
import { HiOutlineArrowNarrowLeft, HiOutlineArrowNarrowRight } from "react-icons/hi";

const ForgotPass = ({ setPage }: ChangePageProps) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // EMAIL PAGE
  const [email, setEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // OTP PAGE
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const refs = useRef<HTMLInputElement[]>([]);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // NEW PASSWORD PAGE
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passError, setPassError] = useState("");

  // --------------------
  // EMAIL VALIDATION
  // --------------------
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // --------------------
  // SEND OTP
  // --------------------
  const sendEmail = async () => {
    setEmailMsg("");
    if (!validateEmail(email)) {
      setEmailMsg("Invalid email format");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/forgot-password/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setStep(2);
      setOtp(["", "", "", "", "", ""]);
      setResendTimer(60);
      setCanResend(false);
    } else {
      setEmailMsg(data.message || "Email not found");
    }
  };

  // --------------------
  // OTP HANDLING
  // --------------------
  const handleInput = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }

    // Auto-submit if all digits filled
    if (newOtp.every((d) => d !== "")) verifyOtp(newOtp.join(""));
  };

  const verifyOtp = async (code?: string) => {
    const otpCode = code || otp.join("");

    const res = await fetch("/api/forgot-password/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp: otpCode, email: email }),
    });

    const data = await res.json();

    if (data.success) {
      setStep(3);
    } else {
      setOtpError("Invalid OTP");
    }
  };

  // --------------------
  // RESEND OTP TIMER
  // --------------------
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, step]);

  const resendOtp = async () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setResendTimer(60);
    setCanResend(false);
    
    const res = await fetch("/api/forgot-password/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!data.success) {
      setOtpError(data.message || "Error resending OTP");
    }
  };

  // --------------------
  // PASSWORD VALIDATION
  // --------------------
  const validatePassword = (pass: string) => {
    // Example: at least 6 chars
    return pass.length >= 6;
  };

  const submitNewPassword = async () => {
    if (password !== confirm) {
      setPassError("Passwords do not match");
      return;
    }
    if (!validatePassword(password)) {
      setPassError("Password must be at least 6 characters");
      return;
    }

    // Get the OTP code from state
    const otpCode = otp.join("");

    const res = await fetch("/api/forgot-password/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email, 
        otp: otpCode, 
        password 
      }),
    });

    const data = await res.json();

    if (data.success) {
      setPage(99); // Back to login
    } else {
      setPassError(data.error || "Error resetting password");
    }
  };

  return (
    <div className="max__size px-5 flex flex-col text-white transition-all duration-300 ease-in-out items-center justify-center lg:h-full lg:max-w-2xl lg:mx-auto">

      {/* ===========================
          STEP 1 — ENTER EMAIL
      ============================ */}
      {step === 1 && (
        <>
          <h1 className="font-poppins text-3xl font-light text-center mt-20 lg:text-4xl lg:mt-0 lg:mb-10">
            Recover Account
          </h1>

          <div className="max__size flex__center__all flex-col w-full mt-10 lg:mt-0 lg:w-3/4">
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 bg-transparent border border-white text-white text-lg rounded-lg px-4 outline-none lg:h-16 lg:text-xl transition-all focus:border-purple-300"
            />

            {emailMsg && <p className="text-red-400 mt-2 text-center">{emailMsg}</p>}

            <button
              className="primary__btn w-full bg-white text-customViolet mt-6 h-14 rounded-lg click__action hover__action focus__action lg:h-16 lg:text-xl font-medium transition-all hover:bg-gray-100"
              disabled={!email || loading}
              onClick={sendEmail}
            >
              {loading ? "SENDING..." : "SEND OTP"}
            </button>

            <button
              className="text-white underline mt-6 click__action lg:mt-8 lg:text-lg hover:text-purple-200 transition-colors"
              onClick={() => setPage(99)}
            >
              Back to Login
            </button>
          </div>
        </>
      )}

      {/* ===========================
          STEP 2 — ENTER OTP
      ============================ */}
      {step === 2 && (
        <>
          <h1 className="font-poppins text-3xl text-white font-light text-center mt-20 lg:text-4xl lg:mt-0 lg:mb-10">
            Verify OTP
          </h1>

          <div className="max__size flex__center__all flex-col w-full lg:w-3/4">
            <p className="text-center text-sm lg:text-base mb-2 opacity-90">
              We sent a code to <span className="font-medium">{email}</span>
            </p>
            
            <div className="h-44 w-full flex__center__x gap-3 mt-4 lg:h-auto lg:my-10 lg:gap-5">
              {otp.map((val, i) => (
                <input
                  key={i}
                  maxLength={1}
                  ref={(el) => { refs.current[i] = el! }}
                  className="focus__action click__action hover__action h-[4.5rem] w-14 rounded-md text-2xl text-white bg-transparent border border-white font-bold text-center outline-none lg:w-16 lg:h-20 lg:text-3xl transition-all focus:border-purple-300 focus:scale-105"
                  value={val}
                  onChange={(e) => handleInput(i, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !val && i > 0) {
                      refs.current[i - 1]?.focus();
                    }
                  }}
                />
              ))}
            </div>

            {otpError && <p className="text-red-400 mt-2 text-center font-medium lg:text-lg">{otpError}</p>}

            <div className="flex justify-between gap-3 mt-6 w-full lg:mt-8">
              <button
                className="border border-white px-3 py-2 rounded-md click__action hover__action focus__action flex__center__all lg:px-6 lg:py-3 lg:text-lg transition-all hover:bg-white/10"
                onClick={() => setStep(1)}
              >
                <HiOutlineArrowNarrowLeft className="text-3xl lg:mr-2" /> <span className="hidden lg:inline">BACK</span>
              </button>

              <div className="flex gap-2 items-center">
                <button
                  className={`bg-white rounded-md px-3 py-2 text-customViolet click__action hover__action focus__action flex__center__all lg:px-6 lg:py-3 lg:text-lg font-medium transition-all hover:bg-gray-100 ${!canResend ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={!canResend}
                  onClick={resendOtp}
                >
                  RESEND OTP
                </button>
                {!canResend && <span className="text-white lg:text-lg min-w-[2rem] text-center">{resendTimer}s</span>}
                <button
                  className="bg-white rounded-md px-3 py-2 text-customViolet click__action hover__action focus__action flex__center__all lg:px-6 lg:py-3 lg:text-lg font-medium transition-all hover:bg-gray-100"
                  onClick={() => verifyOtp()}
                >
                  <span className="hidden lg:inline mr-2">VERIFY</span> NEXT <HiOutlineArrowNarrowRight className="text-3xl lg:ml-2" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===========================
          STEP 3 — NEW PASSWORD
      ============================ */}
      {step === 3 && (
        <>
          <h1 className="font-poppins text-3xl font-light text-center mt-20 lg:text-4xl lg:mt-0 lg:mb-10">
            Set New Password
          </h1>

          <div className="max__size flex__center__all flex-col w-full mt-10 lg:mt-0 lg:w-3/4">
            <input
              type="password"
              placeholder="New Password"
              className="w-full h-14 bg-transparent border border-white text-white text-lg rounded-lg px-4 outline-none mb-4 lg:h-16 lg:text-xl lg:mb-6 transition-all focus:border-purple-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full h-14 bg-transparent border border-white text-white text-lg rounded-lg px-4 outline-none lg:h-16 lg:text-xl transition-all focus:border-purple-300"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />

            {passError && <p className="text-red-400 mt-2 text-center lg:text-lg">{passError}</p>}

            <button
              className="primary__btn w-full bg-white text-customViolet mt-6 h-14 rounded-lg click__action hover__action focus__action lg:h-16 lg:text-xl lg:mt-8 font-medium transition-all hover:bg-gray-100"
              disabled={!password || !confirm}
              onClick={submitNewPassword}
            >
              UPDATE PASSWORD
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ForgotPass;
