"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapComponent } from "@/components/map-component"
import { toast } from "sonner"
import { Store, CheckCircle, XCircle, Users, Eye, Edit, Trash2, LogOut, BarChart3 } from 'lucide-react'
import { MapLegend } from "@/components/map-legend"
import Link from "next/link"

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
    userId: string
}

interface User {
    id: string
    email: string
    fullName: string
    role: string
    country: string
    countryName: string
    city?: string
    status: string
    createdAt: any
}

export default function AdminPage() {
    const { user, userRole, loading } = useAuth()
    const router = useRouter()
    const [shops, setShops] = useState<Shop[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [loadingData, setLoadingData] = useState(true)
    const [updatingTax, setUpdatingTax] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"overview" | "shops" | "users">("overview")

    useEffect(() => {
        if (!loading && (!user || userRole !== "admin")) {
            router.push("/auth/login")
        }
    }, [user, userRole, loading, router])

    useEffect(() => {
        if (user && userRole === "admin") {
            fetchAllData()
        }
    }, [user, userRole])

    const fetchAllData = async () => {
        try {
            // Fetch shops
            const shopsSnapshot = await getDocs(collection(db, "shops"))
            const shopsData = shopsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Shop[]

            // Fetch users
            const usersSnapshot = await getDocs(collection(db, "users"))
            const usersData = usersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as User[]

            setShops(shopsData)
            setUsers(usersData)
        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Failed to fetch data")
        } finally {
            setLoadingData(false)
        }
    }

    const updateTaxStatus = async (shopId: string, newStatus: "paid" | "unpaid") => {
        setUpdatingTax(shopId)

        try {
            await updateDoc(doc(db, "shops", shopId), {
                taxStatus: newStatus,
                updatedAt: new Date(),
            })

            setShops(shops.map((shop) => (shop.id === shopId ? { ...shop, taxStatus: newStatus } : shop)))
            toast.success(`Tax status updated to ${newStatus}`)
        } catch (error) {
            toast.error("Failed to update tax status")
        } finally {
            setUpdatingTax(null)
        }
    }

    const deleteShop = async (shopId: string) => {
        if (!confirm("Are you sure you want to delete this shop?")) return

        try {
            await deleteDoc(doc(db, "shops", shopId))
            setShops(shops.filter((shop) => shop.id !== shopId))
            toast.success("Shop deleted successfully")
        } catch (error) {
            toast.error("Failed to delete shop")
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
                    <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
                </div>
            </div>
        )
    }

    const paidShops = shops.filter((shop) => shop.taxStatus === "paid").length
    const unpaidShops = shops.filter((shop) => shop.taxStatus === "unpaid").length
    const totalRevenue = paidShops * 1000 // Assuming 1000 per shop
    const activeUsers = users.filter((user) => user.status === "active").length

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                                <BarChart3 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Admin Dashboard
                                </h1>
                                <p className="text-gray-600">Tax Management & System Control</p>
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
                {/* Navigation Tabs */}
                <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
                    {[
                        { id: "overview", label: "Overview", icon: BarChart3 },
                        { id: "shops", label: "Shops", icon: Store },
                        { id: "users", label: "Users", icon: Users },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${activeTab === tab.id
                                    ? "bg-white text-blue-600 shadow-md"
                                    : "text-gray-600 hover:text-gray-800"
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="space-y-8">
                        {/* Statistics Cards */}
                        <div className="grid md:grid-cols-4 gap-6">
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
                                    <p className="text-xs opacity-80 mt-1">Compliant businesses</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium opacity-90">Tax Unpaid</CardTitle>
                                    <XCircle className="h-5 w-5 opacity-80" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{unpaidShops}</div>
                                    <p className="text-xs opacity-80 mt-1">Pending payments</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium opacity-90">Active Users</CardTitle>
                                    <Users className="h-5 w-5 opacity-80" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold">{activeUsers}</div>
                                    <p className="text-xs opacity-80 mt-1">System users</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Map View */}
                        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                                <CardTitle className="text-xl">Shop Locations Overview</CardTitle>
                                <CardDescription className="text-blue-100">
                                    Interactive map showing all registered shops with real-time tax status
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid lg:grid-cols-4 gap-6">
                                    <div className="lg:col-span-3">
                                        <MapComponent
                                            shops={shops.map((shop) => ({
                                                id: shop.id,
                                                shopName: shop.shopName,
                                                location: shop.location,
                                                taxStatus: shop.taxStatus,
                                                ownerName: shop.ownerName,
                                                address: shop.address,
                                            }))}
                                            center={{ lat: 24.8607, lng: 67.0011 }}
                                            zoom={6}
                                            height="500px"
                                        />
                                    </div>
                                    <div className="lg:col-span-1">
                                        <MapLegend />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Shops Tab */}
                {activeTab === "shops" && (
                    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                            <CardTitle className="text-xl">Shop Management</CardTitle>
                            <CardDescription className="text-blue-100">
                                Manage all registered shops and their tax status
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loadingData ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gray-200">
                                                <TableHead className="font-semibold">Shop Details</TableHead>
                                                <TableHead className="font-semibold">Owner Info</TableHead>
                                                <TableHead className="font-semibold">Location</TableHead>
                                                <TableHead className="font-semibold">Tax Status</TableHead>
                                                <TableHead className="font-semibold">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {shops.map((shop) => (
                                                <TableRow key={shop.id} className="border-gray-100 hover:bg-gray-50">
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            {shop.imageUrl && (
                                                                <img
                                                                    src={shop.imageUrl || "/placeholder.svg"}
                                                                    alt={shop.shopName}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="font-semibold text-gray-900">{shop.shopName}</p>
                                                                <p className="text-sm text-gray-600">{shop.contactNumber}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{shop.ownerName}</p>
                                                            <p className="text-sm text-gray-600 max-w-xs truncate">{shop.address}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm text-gray-600">
                                                            {shop.location.lat.toFixed(4)}, {shop.location.lng.toFixed(4)}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={shop.taxStatus === "paid" ? "default" : "destructive"}
                                                            className={shop.taxStatus === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                                        >
                                                            {shop.taxStatus === "paid" ? "✅ Paid" : "❌ Unpaid"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                size="sm"
                                                                variant={shop.taxStatus === "paid" ? "outline" : "default"}
                                                                onClick={() => updateTaxStatus(shop.id, "paid")}
                                                                disabled={updatingTax === shop.id || shop.taxStatus === "paid"}
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                            >
                                                                {updatingTax === shop.id ? "..." : "Mark Paid"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant={shop.taxStatus === "unpaid" ? "outline" : "destructive"}
                                                                onClick={() => updateTaxStatus(shop.id, "unpaid")}
                                                                disabled={updatingTax === shop.id || shop.taxStatus === "unpaid"}
                                                            >
                                                                {updatingTax === shop.id ? "..." : "Mark Unpaid"}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                asChild
                                                                className="hover:bg-blue-50"
                                                            >
                                                                <Link href={`/admin/shop/${shop.id}`}>
                                                                    <Eye className="h-3 w-3" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => deleteShop(shop.id)}
                                                                className="hover:bg-red-50 hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                            <CardTitle className="text-xl">User Management</CardTitle>
                            <CardDescription className="text-blue-100">
                                Manage all system users and their roles
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {loadingData ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-gray-200">
                                                <TableHead className="font-semibold">User Details</TableHead>
                                                <TableHead className="font-semibold">Location</TableHead>
                                                <TableHead className="font-semibold">Role</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                                <TableHead className="font-semibold">Joined</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((user) => (
                                                <TableRow key={user.id} className="border-gray-100 hover:bg-gray-50">
                                                    <TableCell>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{user.fullName}</p>
                                                            <p className="text-sm text-gray-600">{user.email}</p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <p className="text-sm text-gray-900">{user.countryName}</p>
                                                            {user.city && <p className="text-xs text-gray-600">{user.city}</p>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                                                            {user.role === "admin" ? "Admin" : "Shop Owner"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={user.status === "active" ? "default" : "destructive"}>
                                                            {user.status || "Active"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm text-gray-600">
                                                            {user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                                                        </p>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    )
}
