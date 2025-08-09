"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { Building2, Mail, Lock, ArrowRight, Shield, Loader2 } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await signInWithEmailAndPassword(auth, email, password)
            toast.success("Welcome back! Logged in successfully")
            // Let the auth provider handle the redirection
        } catch (error: any) {
            toast.error("Invalid email or password. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div
                className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
                style={{ animationDelay: "2s" }}
            ></div>
            <div
                className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
                style={{ animationDelay: "4s" }}
            ></div>

            <div className="flex items-center justify-center min-h-screen px-4 py-12">
                <div className="w-full max-w-md animate-fade-in-up">
                    <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 card-hover">
                        <CardHeader className="text-center space-y-6 pb-8">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl animate-float">
                                <Building2 className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-4xl font-bold text-gradient-primary mb-2">Welcome Back</CardTitle>
                                <CardDescription className="text-slate-600 text-lg">
                                    Sign in to your ShopTax Pro account
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-lg font-bold text-slate-700 flex items-center">
                                        <Mail className="h-5 w-5 mr-3 text-blue-600" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="password" className="text-lg font-bold text-slate-700 flex items-center">
                                        <Lock className="h-5 w-5 mr-3 text-blue-600" />
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-16 btn-primary rounded-xl text-xl font-bold"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                                            Signing In...
                                        </div>
                                    ) : (
                                        <>
                                            <Shield className="h-6 w-6 mr-3" />
                                            Sign In
                                            <ArrowRight className="h-6 w-6 ml-3" />
                                        </>
                                    )}
                                </Button>
                            </form>
                            <div className="mt-8 text-center">
                                <p className="text-slate-600 text-lg">
                                    Don't have an account?{" "}
                                    <Link
                                        href="/auth/register"
                                        className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors"
                                    >
                                        Create one here
                                    </Link>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
