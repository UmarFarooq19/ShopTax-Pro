"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import Link from "next/link"
import { Building2, Mail, Lock, AlertCircle, RefreshCw } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [sendingVerification, setSendingVerification] = useState(false)
    const [showVerificationPrompt, setShowVerificationPrompt] = useState(false)
    const [unverifiedUser, setUnverifiedUser] = useState<any>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setShowVerificationPrompt(false)

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const user = userCredential.user

            // Check if email is verified
            if (!user.emailVerified) {
                // Sign out the user immediately
                await auth.signOut()
                setUnverifiedUser(user)
                setShowVerificationPrompt(true)
                toast.error("Please verify your email address before logging in.")
                setLoading(false)
                return
            }

            toast.success("Welcome back! Logged in successfully")
            router.push("/dashboard")
        } catch (error: any) {
            console.error("Login error:", error)
            if (error.code === "auth/user-not-found") {
                toast.error("No account found with this email address.")
            } else if (error.code === "auth/wrong-password") {
                toast.error("Incorrect password. Please try again.")
            } else if (error.code === "auth/invalid-email") {
                toast.error("Please enter a valid email address.")
            } else if (error.code === "auth/too-many-requests") {
                toast.error("Too many failed attempts. Please try again later.")
            } else {
                toast.error("Invalid email or password. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleResendVerification = async () => {
        if (!unverifiedUser) return

        setSendingVerification(true)
        try {
            await sendEmailVerification(unverifiedUser)
            toast.success("Verification email sent! Please check your inbox and spam folder.")
        } catch (error: any) {
            console.error("Verification email error:", error)
            if (error.code === "auth/too-many-requests") {
                toast.error("Too many requests. Please wait before requesting another verification email.")
            } else {
                toast.error("Failed to send verification email. Please try again.")
            }
        } finally {
            setSendingVerification(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md animate-fade-in-up">
                <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
                    <CardHeader className="text-center space-y-4 pb-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Welcome Back
                            </CardTitle>
                            <CardDescription className="text-gray-600 mt-2">Sign in to your ShopTax Pro account</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Email Verification Prompt */}
                        {showVerificationPrompt && (
                            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-yellow-800 mb-1">Email Verification Required</h3>
                                        <p className="text-sm text-yellow-700 mb-3">
                                            Your account exists but your email address hasn't been verified yet. Please check your email and
                                            click the verification link, or request a new one below.
                                        </p>
                                        <Button
                                            onClick={handleResendVerification}
                                            disabled={sendingVerification}
                                            size="sm"
                                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold"
                                        >
                                            {sendingVerification ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Resend Verification Email
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center">
                                    <Mail className="h-4 w-4 mr-1" />
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center">
                                    <Lock className="h-4 w-4 mr-1" />
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Signing In...
                                    </div>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Lock className="h-4 w-4 text-blue-600" />
                                <p className="text-xs text-blue-700 font-medium">
                                    For security, only verified email addresses can access the system.
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-600">Don't have an account? </span>
                            <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                Create one here
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
