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
import { Shield, Mail, Lock, AlertCircle, RefreshCw } from "lucide-react"

export default function AdminLoginPage() {
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
                toast.error("Please verify your email address before accessing the admin panel.")
                setLoading(false)
                return
            }
            router.push("/admin")
        } catch (error: any) {
            console.error("Login error:", error)
            if (error.code === "auth/user-not-found") {
                toast.error("No admin account found with this email address.")
            } else if (error.code === "auth/wrong-password") {
                toast.error("Incorrect password. Please try again.")
            } else if (error.code === "auth/invalid-email") {
                toast.error("Please enter a valid email address.")
            } else if (error.code === "auth/too-many-requests") {
                toast.error("Too many failed attempts. Please try again later.")
            } else {
                toast.error("Invalid admin credentials. Please try again.")
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden pt-6">

            <div className="flex items-center justify-center px-4">
                <div className="w-full max-w-xl">
                    <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 card-hover">
                        <CardHeader className="text-center space-y-6 pb-8">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl animate-float">
                                <Shield className="h-10 w-10 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-4xl font-bold text-gradient-primary mb-2">Admin Access</CardTitle>
                                <CardDescription className="text-slate-600 text-lg">
                                    Sign in to ShopTax Pro Administrative Panel
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            {/* Email Verification Prompt */}
                            {showVerificationPrompt && (
                                <div className="mb-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl shadow-lg">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="h-6 w-6 text-yellow-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-yellow-800 text-lg mb-2">Email Verification Required</h3>
                                            <p className="text-yellow-700 mb-4 leading-relaxed">
                                                Your admin account exists but your email address hasn't been verified yet. Please check your
                                                email and click the verification link, or request a new one below.
                                            </p>
                                            <Button
                                                onClick={handleResendVerification}
                                                disabled={sendingVerification}
                                                className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
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

                            <form onSubmit={handleLogin} className="space-y-6">
                                <div className="space-y-3">
                                    <Label htmlFor="email" className="text-lg font-bold text-slate-700 flex items-center">
                                        <Mail className="h-5 w-5 mr-3 text-blue-600" />
                                        Admin Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter your admin email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                                        required
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="password" className="text-lg font-bold text-slate-700 flex items-center">
                                        <Lock className="h-5 w-5 mr-3 text-blue-600" />
                                        Admin Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your admin password"
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
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                            Accessing Admin Panel...
                                        </div>
                                    ) : (
                                        <>
                                            <Shield className="h-6 w-6 mr-3" />
                                            Access Admin Panel
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Security Notice */}
                            <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <Shield className="h-5 w-5 text-blue-600" />
                                    <p className="text-sm text-blue-700 font-medium">
                                        This system is restricted to authorized administrative personnel only.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 text-center">
                                <Link
                                    href="/"
                                    className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors text-lg"
                                >
                                    ← Back to Home
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
