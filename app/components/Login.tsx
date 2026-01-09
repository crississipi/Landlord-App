"use client";

import React, { useState } from 'react'
import { ChangePageProps } from '@/types'
import { RiHome9Line } from 'react-icons/ri'
import { signIn } from "next-auth/react";
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

// Tenant web app URL - this will be replaced with actual URL
const TENANT_APP_URL = process.env.NEXT_PUBLIC_TENANT_APP_URL || "http://localhost:3000";

const Login = ({ setPage }: ChangePageProps) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [redirecting, setRedirecting] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            // Step 1: Check user role first
            const checkRoleResponse = await fetch('/api/auth/check-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const roleData = await checkRoleResponse.json();

            if (!roleData.success) {
                setError(roleData.error || "Invalid username or password")
                setLoading(false)
                return
            }

            // Step 2: Handle based on role
            if (!roleData.allowLogin) {
                // User is a tenant - redirect to tenant app
                setRedirecting(true)
                setError("") // Clear any error
                
                // Show redirect message briefly before redirecting
                setTimeout(() => {
                    window.location.href = roleData.redirectUrl || TENANT_APP_URL;
                }, 1500);
                return
            }

            // Step 3: User is landlord/admin - proceed with login
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
                callbackUrl: "/"
            });

            if (result?.error) {
                setError("Invalid username or password")
            } else if (result?.ok) {
                // Login successful - session cookie is now set
                console.log("Login successful, session established")
                
                // Directly navigate to MainPage (page 0)
                setPage(0);
            }
        } catch (err) {
            console.error("Login error:", err)
            setError("An unexpected error occurred. Please try again.")
        } finally {
            if (!redirecting) {
                setLoading(false)
            }
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleLogin(e)
    }

    // Show redirecting state for tenants
    if (redirecting) {
        return (
            <div className='h-full w-full px-5 flex flex-col bg-gray-50 items-center justify-center'>
                <div className="text-center bg-white p-8 rounded-[1.5rem] shadow-xl border border-gray-100">
                    <div className="w-12 h-12 border-4 border-customViolet border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className='font-semibold text-xl text-gray-800 mb-2'>Tenant Account Detected</h2>
                    <p className='text-gray-500 text-sm'>Redirecting you to the Tenant Portal...</p>
                </div>
            </div>
        )
    }
    
    return (
        <div className='h-full w-full px-6 flex flex-col bg-gray-50 items-center justify-center'>
            <div className='w-full max-w-md bg-white rounded-[1.5rem] shadow-xl shadow-customViolet/5 p-8 border border-gray-100'>
                <div className='text-center mb-10'>
                    <h1 className='text-3xl font-bold text-customViolet mb-2'>Landlord Portal</h1>
                    <p className='text-gray-400 text-sm'>Please sign in to manage your properties</p>
                </div>

                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <HiOutlineUser className="h-5 w-5 text-gray-400 group-focus-within:text-customViolet transition-colors" />
                        </div>
                        <input 
                            type="text" 
                            className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-customViolet/20 focus:border-customViolet transition-all outline-none placeholder:text-gray-400"  
                            placeholder="Username" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <HiOutlineLockClosed className="h-5 w-5 text-gray-400 group-focus-within:text-customViolet transition-colors" />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-customViolet/20 focus:border-customViolet transition-all outline-none placeholder:text-gray-400"  
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-customViolet transition-colors"
                        >
                            {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                        </button>
                    </div>
                    
                    {error && (
                        <div className="bg-rose-50 border border-rose-100 text-rose-500 text-xs py-3 px-4 rounded-xl text-center font-medium flex items-center justify-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            {error}
                        </div>
                    )}
                    
                    <div className="flex justify-end">
                        <button 
                            className='text-xs font-medium text-gray-400 hover:text-customViolet transition-colors'
                            onClick={() => setPage(98)}
                            type="button"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <button 
                        type="submit"
                        className='w-full py-3.5 bg-customViolet text-white text-sm font-semibold rounded-xl shadow-lg shadow-customViolet/20 hover:shadow-customViolet/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100'
                        disabled={loading || !username || !password}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Signing in...
                            </span>
                        ) : "Sign In"}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                    <button 
                        type="button"
                        className='flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-customViolet transition-colors group'
                        onClick={() => setPage(100)}
                    >
                        <RiHome9Line className='text-lg group-hover:scale-110 transition-transform'/>
                        View Available Units
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Login