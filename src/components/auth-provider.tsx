"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface AuthContextType {
    user: User | null
    userRole: "admin" | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userRole: null,
    loading: true,
})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [userRole, setUserRole] = useState<"admin" | null>(null)
    const [loading, setLoading] = useState(true)
    const [initialLoad, setInitialLoad] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let unsubscribe: (() => void) | undefined

        // Only set up auth listener on client side
        if (typeof window !== "undefined") {
            unsubscribe = onAuthStateChanged(auth, async (user) => {
                try {
                    setUser(user)

                    if (user) {
                        // Check if email is verified
                        if (!user.emailVerified) {
                            // Sign out unverified users
                            await auth.signOut()
                            setUser(null)
                            setUserRole(null)

                            if (initialLoad) {
                                const currentPath = window.location.pathname
                                if (!currentPath.startsWith("/auth") && currentPath !== "/") {
                                    toast.error("Please verify your email address to access the admin panel.")
                                    router.push("/auth/login")
                                }
                            }
                            return
                        }

                        // Get user role from Firestore - only allow admin role
                        const userDoc = await getDoc(doc(db, "users", user.uid))
                        if (userDoc.exists()) {
                            const userData = userDoc.data()
                            const role = userData.role

                            // Only allow admin users
                            if (role !== "admin") {
                                await auth.signOut()
                                setUser(null)
                                setUserRole(null)
                                toast.error("Access denied. This system is for administrators only.")
                                router.push("/auth/login")
                                return
                            }

                            setUserRole("admin")

                            // Update email verification status in Firestore if needed
                            if (!userData.emailVerified) {
                                await updateDoc(doc(db, "users", user.uid), {
                                    emailVerified: true,
                                    lastLoginAt: new Date(),
                                })
                            }

                            // Handle redirection after initial load
                            if (initialLoad) {
                                const currentPath = window.location.pathname
                                if (!currentPath.startsWith("/admin") && !currentPath.startsWith("/shop")) {
                                    router.push("/admin")
                                }
                            }
                        } else {
                            // No user document found - sign out
                            await auth.signOut()
                            setUser(null)
                            setUserRole(null)
                            toast.error("Admin account not found.")
                            router.push("/auth/login")
                        }
                    } else {
                        setUserRole(null)
                        // Only redirect to login if not already on auth pages or home
                        if (initialLoad) {
                            const currentPath = window.location.pathname
                            if (!currentPath.startsWith("/auth") && currentPath !== "/") {
                                router.push("/auth/login")
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error in auth state change:", error)
                    setUserRole(null)
                    // Sign out on error to prevent inconsistent state
                    if (user) {
                        await auth.signOut()
                    }
                } finally {
                    setLoading(false)
                    setInitialLoad(false)
                }
            })
        } else {
            // On server side, just set loading to false
            setLoading(false)
            setInitialLoad(false)
        }

        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [router, initialLoad])

    return <AuthContext.Provider value={{ user, userRole, loading }}>{children}</AuthContext.Provider>
}
