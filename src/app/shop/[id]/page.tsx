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
import { ArrowLeft, Store, User, Phone, MapPin, Calendar, Building2, Globe } from 'lucide-react'
import Link from "next/link"
import firebase from "firebase/compat/app"
import Image from "next/image"
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
    createdAt: firebase.firestore.Timestamp
    updatedAt?: firebase.firestore.Timestamp
    userId: string
    userCountry?: string
    userCountryName?: string
    userCity?: string
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading shop details...</p>
                </div>
            </div>
        )
    }

    if (!shop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <Store className="h-12 w-12 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Shop not found</h2>
                    <p className="text-gray-600 mb-6">The shop you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
                    <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <Button asChild variant="ghost" size="sm" className="hover:bg-blue-50">
                            <Link href="/dashboard">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Shop Details</h1>
                                <p className="text-sm text-gray-600">Complete information about your business</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Shop Information */}
                        <Card className="shadow-lg border-0 bg-white">
                            <CardHeader className="border-b border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                                            <Store className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl text-gray-900">{shop.shopName}</CardTitle>
                                            <CardDescription className="text-gray-600">Business Information & Details</CardDescription>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={shop.taxStatus === "paid" ? "default" : "destructive"}
                                        className={`${shop.taxStatus === "paid" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"} font-semibold text-sm border`}
                                    >
                                        {shop.taxStatus === "paid" ? "✅ Tax Paid" : "❌ Tax Pending"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {shop.imageUrl && (
                                    <div className="aspect-video rounded-xl overflow-hidden shadow-md bg-gray-100">
                                        <Image
                                            src={shop.imageUrl || "/placeholder.svg"}
                                            alt={shop.shopName}
                                            className="w-full h-full object-cover"
                                            width={500}
                                            height={500}
                                        />
                                    </div>
                                )}

                                <div className="grid gap-4">
                                    <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Store className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-600 font-semibold">Shop Name</p>
                                            <p className="font-bold text-blue-900 text-lg">{shop.shopName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <User className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-green-600 font-semibold">Owner Name</p>
                                            <p className="font-bold text-green-900 text-lg">{shop.ownerName}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Phone className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-purple-600 font-semibold">Contact Number</p>
                                            <p className="font-bold text-purple-900 text-lg">{shop.contactNumber}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start space-x-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <MapPin className="h-5 w-5 text-orange-600 mt-1" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-orange-600 font-semibold">Address</p>
                                            <p className="font-bold text-orange-900">{shop.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="h-5 w-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 font-semibold">Registered On</p>
                                            <p className="font-bold text-gray-900">{shop.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}</p>
                                        </div>
                                    </div>

                                    {shop.userCountryName && (
                                        <div className="flex items-center space-x-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
                                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                                <Globe className="h-5 w-5 text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-teal-600 font-semibold">Owner Location</p>
                                                <p className="font-bold text-teal-900">
                                                    {shop.userCity ? `${shop.userCity}, ` : ""}{shop.userCountryName}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map */}
                        <Card className="shadow-lg border-0 bg-white">
                            <CardHeader className="border-b border-gray-100">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                                        <MapPin className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl text-gray-900">Shop Location</CardTitle>
                                        <CardDescription className="text-gray-600">
                                            Exact geographical location of your business
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <MapComponent
                                    center={shop.location}
                                    zoom={15}
                                    selectedLocation={shop.location}
                                    height="450px"
                                />
                                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <MapPin className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-blue-600 font-semibold">GPS Coordinates</p>
                                            <p className="font-mono text-blue-900 font-bold">
                                                {shop.location.lat.toFixed(6)}, {shop.location.lng.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
