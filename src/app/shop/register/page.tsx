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
import { ArrowLeft, Upload, Store, User, Phone, MapPin, Camera, Building2, Loader2 } from "lucide-react"
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
    const [addressSearchValue, setAddressSearchValue] = useState("")

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
        setAddressSearchValue(addressData.address)
        toast.success("Location selected from address search!")
    }

    const handleAddressChange = (value: string) => {
        setAddressSearchValue(value)
        setFormData({ ...formData, address: value })
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
        } catch (error) {
            if (error instanceof Error)
                toast.error(error.message || "Failed to register shop. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <header className="bg-white/95 backdrop-blur-sm shadow-lg border-b border-slate-200">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center space-x-6">
                        <Button asChild variant="ghost" size="lg" className="hover:bg-blue-50 text-slate-600 hover:text-blue-600">
                            <Link href="/dashboard">
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back to Dashboard
                            </Link>
                        </Button>
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <Building2 className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Register New Shop</h1>
                                <p className="text-slate-600 text-lg">Add your business to the tax management system</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
                                    <Store className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-3xl text-slate-900">Shop Registration Form</CardTitle>
                                    <CardDescription className="text-slate-600 text-lg mt-2">
                                        Fill in the details below to register your shop
                                        {userData && (
                                            <span className="block mt-2 text-blue-600 font-semibold">
                                                📍 Default location: {userData.city ? `${userData.city}, ` : ""}
                                                {userData.countryName || "Karachi, Pakistan"}
                                            </span>
                                        )}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10">
                            <form onSubmit={handleSubmit} className="space-y-10">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="shopName" className="text-lg font-bold text-slate-700 flex items-center">
                                            <Store className="h-5 w-5 mr-3 text-blue-600" />
                                            Shop Name
                                        </Label>
                                        <Input
                                            id="shopName"
                                            placeholder="Enter your shop name"
                                            value={formData.shopName}
                                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                            className="h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label htmlFor="ownerName" className="text-lg font-bold text-slate-700 flex items-center">
                                            <User className="h-5 w-5 mr-3 text-blue-600" />
                                            Owner Name
                                        </Label>
                                        <Input
                                            id="ownerName"
                                            placeholder="Enter owner's full name"
                                            value={formData.ownerName}
                                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                            className="h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="contactNumber" className="text-lg font-bold text-slate-700 flex items-center">
                                        <Phone className="h-5 w-5 mr-3 text-blue-600" />
                                        Contact Number
                                    </Label>
                                    <Input
                                        id="contactNumber"
                                        type="tel"
                                        placeholder="Enter contact number"
                                        value={formData.contactNumber}
                                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                        className="h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                                        required
                                    />
                                </div>

                                <div className="space-y-6">
                                    <Label className="text-lg font-bold text-slate-700 flex items-center">
                                        <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                                        Shop Address & Location
                                    </Label>

                                    {/* Address Search */}
                                    <div className="space-y-3">
                                        <Label htmlFor="addressSearch" className="text-base text-slate-600 font-semibold">
                                            🔍 Search for your shop address (e.g., &quot;Tariq Road Karachi&quot; or &quot;Times Square New York&quot;)
                                        </Label>
                                        <AddressSearch
                                            onLocationSelect={handleAddressSelect}
                                            placeholder="Type your shop address to search and auto-locate on map..."
                                            className="w-full"
                                            value={addressSearchValue}
                                            onChange={handleAddressChange}
                                        />
                                    </div>

                                    {/* Manual Address Input */}
                                    <div className="space-y-3">
                                        <Label htmlFor="address" className="text-base text-slate-600 font-semibold">
                                            📝 Or enter/edit address manually
                                        </Label>
                                        <Textarea
                                            id="address"
                                            placeholder="Enter complete shop address"
                                            value={formData.address}
                                            onChange={(e) => {
                                                setFormData({ ...formData, address: e.target.value })
                                                setAddressSearchValue(e.target.value)
                                            }}
                                            rows={4}
                                            className="border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none rounded-xl text-lg shadow-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="image" className="text-lg font-bold text-slate-700 flex items-center">
                                        <Camera className="h-5 w-5 mr-3 text-blue-600" />
                                        Shop Photo (Optional)
                                    </Label>
                                    <div className="flex items-center space-x-4 p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 transition-colors bg-slate-50">
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                                            className="flex-1 border-0 p-0 h-auto bg-transparent text-lg"
                                        />
                                        <Upload className="h-6 w-6 text-slate-400" />
                                    </div>
                                    {image && (
                                        <p className="text-base text-emerald-600 font-bold flex items-center">
                                            ✅ Image selected: {image.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <Label className="text-lg font-bold text-slate-700 flex items-center">
                                        <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                                        Confirm Shop Location on Map *
                                    </Label>
                                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200">
                                        <p className="text-base text-blue-800 font-semibold mb-2">🗺️ Interactive Map Instructions:</p>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• The map automatically updates when you search for an address above</li>
                                            <li>• You can also click directly on the map to set your location</li>
                                            <li>• Use the &quot;Get Location&quot; button to use your current GPS location</li>
                                        </ul>
                                    </div>
                                    <MapComponent
                                        onLocationSelect={setLocation}
                                        selectedLocation={location}
                                        center={mapCenter}
                                        zoom={mapZoom}
                                        height="500px"
                                        showCurrentLocation={true}
                                    />
                                    {location && (
                                        <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl shadow-lg">
                                            <p className="text-lg text-emerald-700 font-bold flex items-center">
                                                <MapPin className="h-6 w-6 mr-3" />✅ Location confirmed: {location.lat.toFixed(6)},{" "}
                                                {location.lng.toFixed(6)}
                                            </p>
                                            <p className="text-sm text-emerald-600 mt-2">
                                                Your shop location has been successfully set on the map!
                                            </p>
                                        </div>
                                    )}
                                    {!location && (
                                        <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl shadow-lg">
                                            <p className="text-lg text-yellow-700 font-bold flex items-center">
                                                <MapPin className="h-6 w-6 mr-3" />
                                                ⚠️ Location Required
                                            </p>
                                            <p className="text-sm text-yellow-600 mt-2">
                                                Please search for an address above or click on the map to select your shop&apos;s location
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 text-xl"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <Loader2 className="h-7 w-7 mr-3 animate-spin" />
                                            Registering Shop...
                                        </div>
                                    ) : (
                                        <>
                                            <Store className="h-6 w-6 mr-3" />
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
