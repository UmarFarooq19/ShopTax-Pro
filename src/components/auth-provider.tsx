"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

interface AuthContextType {
    user: User | null
    userRole: "shop_owner" | "admin" | null
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
    const [userRole, setUserRole] = useState<"shop_owner" | "admin" | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let unsubscribe: (() => void) | undefined

        // Only set up auth listener on client side
        if (typeof window !== "undefined") {
            unsubscribe = onAuthStateChanged(auth, async (user) => {
                try {
                    setUser(user)

                    if (user) {
                        // Get user role from Firestore
                        const userDoc = await getDoc(doc(db, "users", user.uid))
                        if (userDoc.exists()) {
                            const userData = userDoc.data()
                            setUserRole(userData.role || "shop_owner")
                        } else {
                            setUserRole("shop_owner")
                        }
                    } else {
                        setUserRole(null)
                    }
                } catch (error) {
                    console.error("Error in auth state change:", error)
                    setUserRole(null)
                } finally {
                    setLoading(false)
                }
            })
        } else {
            // On server side, just set loading to false
            setLoading(false)
        }

        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [])

    return <AuthContext.Provider value={{ user, userRole, loading }}>{children}</AuthContext.Provider>
}
