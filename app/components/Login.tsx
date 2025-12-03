"use client";

import React, { useState } from 'react'
import { CustomInput } from './customcomponents'
import { ChangePageProps } from '@/types'
import { RiHome9Line } from 'react-icons/ri'
import { signIn } from "next-auth/react";

// Tenant web app URL - this will be replaced with actual URL
const TENANT_APP_URL = process.env.NEXT_PUBLIC_TENANT_APP_URL || "http://localhost:3000";

const Login = ({ setPage }: ChangePageProps) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
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
            <div className='max__size px-5 flex flex-col bg-customViolet items-center justify-center'>
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <h2 className='font-poppins text-2xl text-white font-light mb-2'>Tenant Account Detected</h2>
                    <p className='text-white/80 text-sm'>Redirecting you to the Tenant Portal...</p>
                </div>
            </div>
        )
    }
    
    return (
        <div className='max__size px-5 flex flex-col bg-customViolet'>
            <h1 className='font-poppins text-3xl text-white font-light w-full text-center mt-20'>Log In Account</h1>
            <div className='max__size flex__center__all flex-col'>
                <form onSubmit={handleSubmit} className="w-full">
                    <CustomInput 
                        placeholder='Username' 
                        inputType='text' 
                        marginBottom={true} 
                        hookValue={username} 
                        hookVariable={setUsername}
                    />
                    <CustomInput 
                        placeholder='Password' 
                        inputType='password' 
                        marginBottom={false} 
                        hookValue={password} 
                        hookVariable={setPassword}
                    />
                    
                    {error && (
                        <div className="bg-red-500/20 border border-red-400 text-red-100 text-sm py-2 px-4 rounded-lg mt-4 text-center">
                            {error}
                        </div>
                    )}
                    
                    <button 
                        className='click__action h-auto w-full text-lg text-right outline-none text-white no-underline hover:underline focus:underline mt-2 mb-14'
                        onClick={() => setPage(98)}
                        type="button"
                    >
                        forgot password?
                    </button>
                    <button 
                        type="submit"
                        className='px-14 primary__btn click__action hover__action focus__action bg-white text-customViolet text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full'
                        disabled={loading || !username || !password}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-5 h-5 border-2 border-customViolet border-t-transparent rounded-full animate-spin"></span>
                                LOGGING IN...
                            </span>
                        ) : "LOGIN"}
                    </button>
                </form>
            </div>
            <button 
                type="button"
                className='text-white flex gap-2 px-3 py-2 mb-10 mx-auto items-center border-b border-white hover:scale-105 focus:scale-105 ease-in-out duration-150'
                onClick={() => setPage(100)}
            >
                <RiHome9Line className='text-3xl'/>
                View Available Units
            </button>
        </div>
    )
}

export default Login