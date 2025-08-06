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
import { ArrowLeft, Store, User, Phone, MapPin, Calendar } from "lucide-react"
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

export default function ShopDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useAuth()
    const [shop, setShop] = useState<Shop | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchShopDetails(params.id as string)
        }
    }, [params.id])

    const fetchShopDetails = async (shopId: string) => {
        try {
            const shopDoc = await getDoc(doc(db, "shops", shopId))
            if (shopDoc.exists()) {
                const shopData = { id: shopDoc.id, ...shopDoc.data() } as Shop

                // Check if user owns this shop
                if (user && shopData.userId !== user.uid) {
                    router.push("/dashboard")
                    return
                }

                setShop(shopData)
            } else {
                router.push("/dashboard")
            }
        } catch (error) {
            console.error("Error fetching shop details:", error)
            router.push("/dashboard")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!shop) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop not found</h2>
                    <Button asChild>
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Button asChild variant="ghost" size="sm">
                            <Link href="/dashboard">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">Shop Details</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Shop Information */}
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl">{shop.shopName}</CardTitle>
                                        <CardDescription>Shop Details & Information</CardDescription>
                                    </div>
                                    <Badge variant={shop.taxStatus === "paid" ? "default" : "destructive"}>
                                        {shop.taxStatus === "paid" ? "Tax Paid" : "Tax Pending"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {shop.imageUrl && (
                                    <div className="aspect-video rounded-lg overflow-hidden">
                                        <img
                                            src={shop.imageUrl || "/placeholder.svg"}
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <Store className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Shop Name</p>
                                            <p className="font-medium">{shop.shopName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <User className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Owner Name</p>
                                            <p className="font-medium">{shop.ownerName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Phone className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Contact Number</p>
                                            <p className="font-medium">{shop.contactNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-3">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-sm text-gray-600">Address</p>
                                            <p className="font-medium">{shop.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Calendar className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-600">Registered On</p>
                                            <p className="font-medium">{shop.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Shop Location</CardTitle>
                                <CardDescription>Exact location of your shop on the map</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <MapComponent center={shop.location} zoom={15} selectedLocation={shop.location} />
                                <div className="mt-4 text-sm text-gray-600">
                                    <p>
                                        Coordinates: {shop.location.lat.toFixed(6)}, {shop.location.lng.toFixed(6)}
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
