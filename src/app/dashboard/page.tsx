"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, MapPin, Phone, User, Plus } from "lucide-react"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"

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
        } finally {
            setLoadingShops(false)
        }
    }

    const handleLogout = async () => {
        await signOut(auth)
        router.push("/")
    }

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Shop Owner Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                        <Button onClick={handleLogout} variant="outline">
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">My Shops</h2>
                        <p className="text-gray-600 mt-2">Manage your registered shops</p>
                    </div>
                    <Button asChild>
                        <Link href="/shop/register">
                            <Plus className="h-4 w-4 mr-2" />
                            Register New Shop
                        </Link>
                    </Button>
                </div>

                {loadingShops ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : shops.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No shops registered</h3>
                            <p className="text-gray-600 mb-6">Get started by registering your first shop</p>
                            <Button asChild>
                                <Link href="/shop/register">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Register Your First Shop
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shops.map((shop) => (
                            <Card key={shop.id} className="overflow-hidden">
                                {shop.imageUrl && (
                                    <div className="h-48 bg-gray-200">
                                        <img
                                            src={shop.imageUrl || "/placeholder.svg"}
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{shop.shopName}</CardTitle>
                                        <Badge variant={shop.taxStatus === "paid" ? "default" : "destructive"}>
                                            {shop.taxStatus === "paid" ? "Tax Paid" : "Tax Pending"}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <User className="h-4 w-4 mr-2" />
                                        {shop.ownerName}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {shop.contactNumber}
                                    </div>
                                    <div className="flex items-start text-sm text-gray-600">
                                        <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                                        <span className="line-clamp-2">{shop.address}</span>
                                    </div>
                                    <Button asChild variant="outline" className="w-full bg-transparent">
                                        <Link href={`/shop/${shop.id}`}>View Details</Link>
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
