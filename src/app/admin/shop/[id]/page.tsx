"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapComponent } from "@/components/map-component"
import { ArrowLeft, Store, User, Phone, MapPin, Calendar, Camera } from 'lucide-react'
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
    updatedAt?: any
    userId: string
    userCountry?: string
    userCountryName?: string
    userCity?: string
}

export default function AdminShopDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user, userRole } = useAuth()
    const [shop, setShop] = useState<Shop | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (userRole !== "admin") {
            router.push("/auth/login")
            return
        }

        if (params.id) {
            fetchShopDetails(params.id as string)
        }
    }, [params.id, userRole])

    const fetchShopDetails = async (shopId: string) => {
        try {
            const shopDoc = await getDoc(doc(db, "shops", shopId))
            if (shopDoc.exists()) {
                const shopData = { id: shopDoc.id, ...shopDoc.data() } as Shop
                setShop(shopData)
            } else {
                router.push("/admin")
            }
        } catch (error) {
            console.error("Error fetching shop details:", error)
            router.push("/admin")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading shop details...</p>
                </div>
            </div>
        )
    }

    if (!shop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop not found</h2>
                    <Button asChild>
                        <Link href="/admin">Back to Admin Dashboard</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Button asChild variant="ghost" size="sm" className="hover:bg-blue-50">
                            <Link href="/admin">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Admin Dashboard
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Shop Details - Admin View
                            </h1>
                            <p className="text-sm text-gray-600">Complete shop information and management</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Shop Information */}
                        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Store className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl">{shop.shopName}</CardTitle>
                                            <CardDescription className="text-blue-100">Complete Shop Information</CardDescription>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={shop.taxStatus === "paid" ? "default" : "destructive"}
                                        className={`${shop.taxStatus === "paid" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} font-semibold`}
                                    >
                                        {shop.taxStatus === "paid" ? "✅ Tax Paid" : "❌ Tax Pending"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {shop.imageUrl && (
                                    <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                                        <img
                                            src={shop.imageUrl || "/placeholder.svg"}
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="grid gap-4">
                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <Store className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Shop Name</p>
                                            <p className="font-semibold text-gray-900">{shop.shopName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <User className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Owner Name</p>
                                            <p className="font-semibold text-gray-900">{shop.ownerName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <Phone className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Contact Number</p>
                                            <p className="font-semibold text-gray-900">{shop.contactNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Address</p>
                                            <p className="font-semibold text-gray-900">{shop.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">Registered On</p>
                                            <p className="font-semibold text-gray-900">
                                                {shop.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    {shop.updatedAt && (
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-gray-600 font-medium">Last Updated</p>
                                                <p className="font-semibold text-gray-900">
                                                    {shop.updatedAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {shop.userCountryName && (
                                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                            <MapPin className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <p className="text-sm text-blue-600 font-medium">Owner Location</p>
                                                <p className="font-semibold text-blue-900">
                                                    {shop.userCity ? `${shop.userCity}, ` : ""}{shop.userCountryName}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map */}
                        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                                <CardTitle className="text-xl">Shop Location</CardTitle>
                                <CardDescription className="text-green-100">
                                    Exact geographical location of the shop
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <MapComponent
                                    center={shop.location}
                                    zoom={15}
                                    selectedLocation={shop.location}
                                    height="450px"
                                />
                                <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-700 font-medium">
                                        <span className="text-blue-600">Coordinates:</span> {shop.location.lat.toFixed(6)}, {shop.location.lng.toFixed(6)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
