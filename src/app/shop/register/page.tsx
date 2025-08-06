"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { collection, addDoc, doc, getDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapComponent } from "@/components/map-component"
import { ArrowLeft, Upload, MapPin } from 'lucide-react'
import Link from "next/link"
import { toast } from "sonner"

interface UserData {
    country: string
    countryName: string
    city?: string
    location: {
        country: { lat: number; lng: number }
        city?: { lat: number; lng: number }
    }
}

export default function RegisterShopPage() {
    const { user } = useAuth()
    const router = useRouter()

    const [formData, setFormData] = useState({
        shopName: "",
        ownerName: "",
        contactNumber: "",
        address: "",
    })
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [image, setImage] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.209 })
    const [mapZoom, setMapZoom] = useState(10)

    useEffect(() => {
        if (user) {
            fetchUserData()
        }
    }, [user])

    const fetchUserData = async () => {
        if (!user) return

        try {
            const userDoc = await getDoc(doc(db, "users", user.uid))
            if (userDoc.exists()) {
                const data = userDoc.data() as UserData
                setUserData(data)

                // Set map center based on user's city or country
                if (data.location?.city) {
                    setMapCenter({ lat: data.location.city.lat, lng: data.location.city.lng })
                    setMapZoom(12)
                } else if (data.location?.country) {
                    setMapCenter({ lat: data.location.country.lat, lng: data.location.country.lng })
                    setMapZoom(6)
                }
            }
        } catch (error) {
            console.error("Error fetching user data:", error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!location) {
            toast.error("Please select a location on the map")
            return
        }

        if (!user) return

        setLoading(true)

        try {
            let imageUrl = ""

            // Upload image if provided
            if (image) {
                const imageRef = ref(storage, `shops/${user.uid}/${Date.now()}_${image.name}`)
                const snapshot = await uploadBytes(imageRef, image)
                imageUrl = await getDownloadURL(snapshot.ref)
            }

            // Save shop data to Firestore
            await addDoc(collection(db, "shops"), {
                ...formData,
                location,
                imageUrl,
                userId: user.uid,
                userCountry: userData?.country || "",
                userCountryName: userData?.countryName || "",
                userCity: userData?.city || "",
                taxStatus: "unpaid",
                createdAt: new Date(),
            })

            toast.success("Shop registered successfully!")

            router.push("/dashboard")
        } catch (error: any) {
            toast.error(error.message || "Error")
        } finally {
            setLoading(false)
        }
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
                        <h1 className="text-2xl font-bold text-gray-900">Register New Shop</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shop Registration Form</CardTitle>
                            <CardDescription>
                                Fill in the details below to register your shop
                                {userData && (
                                    <span className="block mt-1 text-blue-600">
                                        📍 Map showing: {userData.city ? `${userData.city}, ` : ""}{userData.countryName}
                                    </span>
                                )}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="shopName">Shop Name</Label>
                                        <Input
                                            id="shopName"
                                            value={formData.shopName}
                                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ownerName">Owner Name</Label>
                                        <Input
                                            id="ownerName"
                                            value={formData.ownerName}
                                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contactNumber">Contact Number</Label>
                                    <Input
                                        id="contactNumber"
                                        type="tel"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image">Shop Photo (Optional)</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                                            className="flex-1"
                                        />
                                        <Upload className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Shop Location *</Label>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Click on the map to select your shop's location or use your current location
                                    </p>
                                    <MapComponent
                                        onLocationSelect={setLocation}
                                        selectedLocation={location}
                                        center={mapCenter}
                                        zoom={mapZoom}
                                        height="400px"
                                        showCurrentLocation={true}
                                    />
                                    {location && (
                                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                                            <p className="text-sm text-green-700 font-medium">
                                                ✅ Location selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                            </p>
                                        </div>
                                    )}
                                    {!location && (
                                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                            <p className="text-sm text-yellow-700">
                                                📍 Please click on the map to select your shop's location or use the "Use Current Location" button
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Registering Shop..." : "Register Shop"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
