"use client";

import React, { useState } from 'react'
import { CustomInput } from './customcomponents'
import { ChangePageProps } from '@/types'
import { RiHome9Line } from 'react-icons/ri'
import { signIn } from "next-auth/react";

const Login = ({ setPage }: ChangePageProps) => {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const result = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid username or password")
            } else {
                // ✅ Login successful - redirect to Mainpage (page 0)
                console.log("Login successful, redirecting to Mainpage")
                setPage(0) // This will redirect to Mainpage
            }
        } catch (error) {
            console.error("Login error:", error)
            setError("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleLogin(e)
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
                        <div className="text-red-500 text-sm mb-4 text-center">
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
                        {loading ? "LOGGING IN..." : "LOGIN"}
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