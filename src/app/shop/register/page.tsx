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
import { toast } from "sonner"
import { MapComponent } from "@/components/map-component"
import { AddressSearch } from "@/components/address-search"
import { ArrowLeft, Upload, Store, User, Phone, MapPin, Camera, Building2 } from 'lucide-react'
import Link from "next/link"

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
    const [mapCenter, setMapCenter] = useState({ lat: 24.8607, lng: 67.0011 }) // Default to Karachi
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

                // Set map center based on user's city or country, default to Karachi if not set
                if (data.location?.city) {
                    setMapCenter({ lat: data.location.city.lat, lng: data.location.city.lng })
                    setMapZoom(12)
                } else if (data.location?.country) {
                    setMapCenter({ lat: data.location.country.lat, lng: data.location.country.lng })
                    setMapZoom(6)
                } else {
                    // Default to Karachi, Pakistan if no location is set
                    setMapCenter({ lat: 24.8607, lng: 67.0011 })
                    setMapZoom(10)
                }
            } else {
                // Default to Karachi, Pakistan if user data doesn't exist
                setMapCenter({ lat: 24.8607, lng: 67.0011 })
                setMapZoom(10)
            }
        } catch (error) {
            console.error("Error fetching user data:", error)
            // Default to Karachi, Pakistan on error
            setMapCenter({ lat: 24.8607, lng: 67.0011 })
            setMapZoom(10)
        }
    }

    const handleAddressSelect = (addressData: { lat: number; lng: number; address: string }) => {
        setLocation({ lat: addressData.lat, lng: addressData.lng })
        setMapCenter({ lat: addressData.lat, lng: addressData.lng })
        setMapZoom(15)
        setFormData({ ...formData, address: addressData.address })
        toast.success("Location selected from address search!")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!location) {
            toast.error("Please select a location on the map or search for an address")
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
                updatedAt: new Date(),
            })

            toast.success("Shop registered successfully! 🎉")
            router.push("/dashboard")
        } catch (error: any) {
            toast.error("Failed to register shop. Please try again.")
        } finally {
            setLoading(false)
        }
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
                                <h1 className="text-2xl font-bold text-gray-900">Register New Shop</h1>
                                <p className="text-sm text-gray-600">Add your business to the tax management system</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Card className="shadow-lg border-0 bg-white">
                        <CardHeader className="border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                                    <Store className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl text-gray-900">Shop Registration Form</CardTitle>
                                    <CardDescription className="text-gray-600">
                                        Fill in the details below to register your shop
                                        {userData && (
                                            <span className="block mt-1 text-blue-600">
                                                📍 Default location: {userData.city ? `${userData.city}, ` : ""}{userData.countryName || "Karachi, Pakistan"}
                                            </span>
                                        )}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="shopName" className="text-sm font-semibold text-gray-700 flex items-center">
                                            <Store className="h-4 w-4 mr-2 text-blue-600" />
                                            Shop Name
                                        </Label>
                                        <Input
                                            id="shopName"
                                            placeholder="Enter your shop name"
                                            value={formData.shopName}
                                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ownerName" className="text-sm font-semibold text-gray-700 flex items-center">
                                            <User className="h-4 w-4 mr-2 text-blue-600" />
                                            Owner Name
                                        </Label>
                                        <Input
                                            id="ownerName"
                                            placeholder="Enter owner's full name"
                                            value={formData.ownerName}
                                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="contactNumber" className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Phone className="h-4 w-4 mr-2 text-blue-600" />
                                        Contact Number
                                    </Label>
                                    <Input
                                        id="contactNumber"
                                        type="tel"
                                        placeholder="Enter contact number"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                                        Shop Address & Location
                                    </Label>

                                    {/* Address Search */}
                                    <div className="space-y-2">
                                        <Label htmlFor="addressSearch" className="text-sm text-gray-600">
                                            Search for your shop address (e.g., "Orangi Town Karachi" or "Times Square New York")
                                        </Label>
                                        <AddressSearch
                                            onLocationSelect={handleAddressSelect}
                                            placeholder="Type your shop address to search..."
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Manual Address Input */}
                                    <div className="space-y-2">
                                        <Label htmlFor="address" className="text-sm text-gray-600">
                                            Or enter address manually
                                        </Label>
                                        <Textarea
                                            id="address"
                                            placeholder="Enter complete shop address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows={3}
                                            className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="image" className="text-sm font-semibold text-gray-700 flex items-center">
                                        <Camera className="h-4 w-4 mr-2 text-blue-600" />
                                        Shop Photo (Optional)
                                    </Label>
                                    <div className="flex items-center space-x-3 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                                            className="flex-1 border-0 p-0 h-auto"
                                        />
                                        <Upload className="h-5 w-5 text-gray-400" />
                                    </div>
                                    {image && (
                                        <p className="text-sm text-green-600 font-medium">✅ Image selected: {image.name}</p>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <Label className="text-sm font-semibold text-gray-700 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                                        Confirm Shop Location on Map *
                                    </Label>
                                    <p className="text-sm text-gray-600">
                                        The map will automatically update when you search for an address above. You can also click directly on the map to set your location.
                                    </p>
                                    <MapComponent
                                        onLocationSelect={setLocation}
                                        selectedLocation={location}
                                        center={mapCenter}
                                        zoom={mapZoom}
                                        height="450px"
                                        showCurrentLocation={true}
                                    />
                                    {location && (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                            <p className="text-sm text-green-700 font-semibold flex items-center">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                Location confirmed: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                            </p>
                                        </div>
                                    )}
                                    {!location && (
                                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                                            <p className="text-sm text-yellow-700 font-medium flex items-center">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                Please search for an address above or click on the map to select your shop's location
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                            Registering Shop...
                                        </div>
                                    ) : (
                                        <>
                                            <Store className="h-5 w-5 mr-2" />
                                            Register Shop
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
