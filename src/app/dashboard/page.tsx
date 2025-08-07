"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, MapPin, Phone, User, Plus, LogOut, BarChart3, CheckCircle, XCircle, Building2 } from 'lucide-react'
import Link from "next/link"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

interface Shop {
    id: string
    shopName: string
    ownerName: string
    contactNumber: string
    address: string
    location: {
        lat: number
        lng: number
    }
    imageUrl?: string
    taxStatus: "paid" | "unpaid"
    createdAt: any
}

export default function DashboardPage() {
    const { user, userRole, loading } = useAuth()
    const router = useRouter()
    const [shops, setShops] = useState<Shop[]>([])
    const [loadingShops, setLoadingShops] = useState(true)

    useEffect(() => {
        if (!loading && (!user || userRole !== "shop_owner")) {
            router.push("/auth/login")
        }
    }, [user, userRole, loading, router])

    useEffect(() => {
        if (user) {
            fetchUserShops()
        }
    }, [user])

    const fetchUserShops = async () => {
        if (!user) return

        try {
            const shopsQuery = query(collection(db, "shops"), where("userId", "==", user.uid))
            const querySnapshot = await getDocs(shopsQuery)
            const shopsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Shop[]

            setShops(shopsData)
        } catch (error) {
            console.error("Error fetching shops:", error)
            toast.error("Failed to fetch shops data")
        } finally {
            setLoadingShops(false)
        }
    }

    const handleLogout = async () => {
        await signOut(auth)
        toast.success("Logged out successfully")
        router.push("/")
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        )
    }

    const paidShops = shops.filter(shop => shop.taxStatus === "paid").length
    const unpaidShops = shops.filter(shop => shop.taxStatus === "unpaid").length

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Shop Owner Dashboard
                                </h1>
                                <p className="text-gray-600">Manage your business operations</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                Welcome, {user.email}
                            </span>
                            <Button onClick={handleLogout} variant="outline" className="hover:bg-red-50 hover:text-red-600">
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Statistics Cards */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">Total Shops</CardTitle>
                            <Store className="h-5 w-5 opacity-80" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{shops.length}</div>
                            <p className="text-xs opacity-80 mt-1">Registered businesses</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">Tax Paid</CardTitle>
                            <CheckCircle className="h-5 w-5 opacity-80" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{paidShops}</div>
                            <p className="text-xs opacity-80 mt-1">Compliant shops</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">Tax Pending</CardTitle>
                            <XCircle className="h-5 w-5 opacity-80" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{unpaidShops}</div>
                            <p className="text-xs opacity-80 mt-1">Needs attention</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            My Shops
                        </h2>
                        <p className="text-gray-600 mt-2 text-lg">Manage and monitor your registered businesses</p>
                    </div>
                    <Button asChild className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                        <Link href="/shop/register">
                            <Plus className="h-5 w-5 mr-2" />
                            Register New Shop
                        </Link>
                    </Button>
                </div>

                {loadingShops ? (
                    <div className="flex justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 font-medium">Loading your shops...</p>
                        </div>
                    </div>
                ) : shops.length === 0 ? (
                    <Card className="text-center py-20 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                        <CardContent>
                            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-6">
                                <Store className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">No shops registered yet</h3>
                            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                                Start your journey by registering your first business with our platform
                            </p>
                            <Button asChild className="h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                                <Link href="/shop/register">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Register Your First Shop
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {shops.map((shop) => (
                            <Card key={shop.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2 bg-white/90 backdrop-blur-sm">
                                {shop.imageUrl && (
                                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                                        <img
                                            src={shop.imageUrl || "/placeholder.svg"}
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                )}
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {shop.shopName}
                                        </CardTitle>
                                        <Badge
                                            variant={shop.taxStatus === "paid" ? "default" : "destructive"}
                                            className={`${shop.taxStatus === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} font-semibold`}
                                        >
                                            {shop.taxStatus === "paid" ? "✅ Tax Paid" : "❌ Tax Pending"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center text-gray-600">
                                        <User className="h-4 w-4 mr-3 text-blue-500" />
                                        <span className="font-medium">{shop.ownerName}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <Phone className="h-4 w-4 mr-3 text-blue-500" />
                                        <span>{shop.contactNumber}</span>
                                    </div>
                                    <div className="flex items-start text-gray-600">
                                        <MapPin className="h-4 w-4 mr-3 mt-0.5 text-blue-500" />
                                        <span className="line-clamp-2 text-sm">{shop.address}</span>
                                    </div>
                                    <Button asChild variant="outline" className="w-full mt-4 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all duration-200">
                                        <Link href={`/shop/${shop.id}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
