"use client"

import { AddressSearch } from "@/components/address-search"
import { useAuth } from "@/components/auth-provider"
import { MapComponent } from "@/components/map-component"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { db, storage } from "@/lib/firebase"
import { addDoc, collection } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import {
    ArrowLeft,
    Building2,
    Camera,
    CheckCircle,
    DollarSign,
    Loader2,
    MapPin,
    Phone,
    Receipt,
    Store,
    Upload,
    User,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { useState } from "react"
import { toast } from "sonner"

export default function RegisterShopPage() {
    const { user, userRole } = useAuth()
    const router = useRouter()

    const [formData, setFormData] = useState({
        shopName: "",
        ownerName: "",
        contactNumber: "",
        address: "",
        challanAmount: "",
    })
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [shopImage, setShopImage] = useState<File | null>(null)
    const [challanImage, setChallanImage] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [mapCenter, setMapCenter] = useState({ lat: 24.8607, lng: 67.0011 }) // Default to Karachi
    const [mapZoom, setMapZoom] = useState(12)
    const [addressSearchValue, setAddressSearchValue] = useState("")


    const handleAddressSelect = (addressData: { lat: number; lng: number; address: string }) => {
        setLocation({ lat: addressData.lat, lng: addressData.lng })
        setMapCenter({ lat: addressData.lat, lng: addressData.lng })
        setMapZoom(16)
        setFormData({ ...formData, address: addressData.address })
        setAddressSearchValue(addressData.address)
        toast.success("📍 Location selected from address search!")
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

        // Validate challan amount
        const amount = Number.parseFloat(formData.challanAmount)
        if (isNaN(amount) || amount <= 0) {
            toast.error("Please enter a valid challan amount")
            return
        }

        setLoading(true)

        try {
            let shopImageUrl = ""
            let challanImageUrl = ""

            // Upload shop image if provided
            if (shopImage) {
                const shopImageRef = ref(storage, `shops/${Date.now()}_shop_${shopImage.name}`)
                const shopSnapshot = await uploadBytes(shopImageRef, shopImage)
                shopImageUrl = await getDownloadURL(shopSnapshot.ref)
            }

            // Upload challan image if provided
            if (challanImage) {
                const challanImageRef = ref(storage, `challans/${Date.now()}_challan_${challanImage.name}`)
                const challanSnapshot = await uploadBytes(challanImageRef, challanImage)
                challanImageUrl = await getDownloadURL(challanSnapshot.ref)
            }

            // Save shop data to Firestore
            await addDoc(collection(db, "shops"), {
                ...formData,
                challanAmount: amount,
                location,
                imageUrl: shopImageUrl,
                challanImageUrl: challanImageUrl,
                registeredBy: user.uid, // Admin who registered this shop
                registeredByEmail: user.email,
                taxStatus: "unpaid",
                createdAt: new Date(),
                updatedAt: new Date(),
            })

            toast.success("🎉 Shop registered successfully!")
            router.push("/admin")
        } catch (error: any) {
            console.error("Registration error:", error)
            toast.error("Failed to register shop. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    // Redirect non-admin users
    if (!user || userRole !== "admin") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Checking admin access...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div
                className="absolute top-40 right-20 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
                style={{ animationDelay: "2s" }}
            ></div>

            <header className="bg-white/95 backdrop-blur-sm shadow-xl border-b border-slate-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center space-x-6">
                        <Button
                            asChild
                            variant="ghost"
                            size="lg"
                            className="hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-semibold"
                        >
                            <Link href="/admin">
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back to Admin Dashboard
                            </Link>
                        </Button>
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl animate-float">
                                <Building2 className="h-9 w-9 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gradient-primary">Register New Business</h1>
                                <p className="text-slate-600 text-xl">Add a new business to the tax management system</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto">
                    <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm card-hover">
                        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-t-2xl mx-10">
                            <div className="flex items-center space-x-6 my-auto">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center shadow-xl">
                                    <Store className="h-10 w-10 text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-4xl text-slate-900 font-bold">Business Registration Form</CardTitle>
                                    <CardDescription className="text-slate-600 text-xl mt-3">
                                        Fill in the details below to register a new business in the system
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-12">
                            <form onSubmit={handleSubmit} className="space-y-12">
                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <Label htmlFor="shopName" className="text-xl font-bold text-slate-700 flex items-center">
                                            <Store className="h-6 w-6 mr-3 text-blue-600" />
                                            Business Name
                                        </Label>
                                        <Input
                                            id="shopName"
                                            placeholder="Enter business name"
                                            value={formData.shopName}
                                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                            className="h-16 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl text-xl shadow-xl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label htmlFor="ownerName" className="text-xl font-bold text-slate-700 flex items-center">
                                            <User className="h-6 w-6 mr-3 text-blue-600" />
                                            Owner Name
                                        </Label>
                                        <Input
                                            id="ownerName"
                                            placeholder="Enter owner's full name"
                                            value={formData.ownerName}
                                            onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                            className="h-16 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl text-xl shadow-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <Label htmlFor="contactNumber" className="text-xl font-bold text-slate-700 flex items-center">
                                            <Phone className="h-6 w-6 mr-3 text-blue-600" />
                                            Contact Number
                                        </Label>
                                        <Input
                                            id="contactNumber"
                                            type="tel"
                                            placeholder="Enter contact number"
                                            value={formData.contactNumber}
                                            onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                                            className="h-16 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl text-xl shadow-xl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <Label htmlFor="challanAmount" className="text-xl font-bold text-slate-700 flex items-center">
                                            <DollarSign className="h-6 w-6 mr-3 text-green-600" />
                                            Challan Amount (PKR)
                                        </Label>
                                        <Input
                                            id="challanAmount"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Enter challan amount"
                                            value={formData.challanAmount}
                                            onChange={(e) => setFormData({ ...formData, challanAmount: e.target.value })}
                                            className="h-16 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl text-xl shadow-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <Label className="text-xl font-bold text-slate-700 flex items-center">
                                        <MapPin className="h-6 w-6 mr-3 text-blue-600" />
                                        Business Address & Location
                                    </Label>

                                    {/* Address Search */}
                                    <div className="space-y-4">
                                        <Label htmlFor="addressSearch" className="text-lg text-slate-600 font-bold">
                                            🔍 Search for business address
                                        </Label>
                                        <AddressSearch
                                            onLocationSelect={handleAddressSelect}
                                            placeholder="Type business address to search and auto-locate on map..."
                                            className="w-full"
                                            value={addressSearchValue}
                                            onChange={handleAddressChange}
                                        />
                                    </div>

                                    {/* Manual Address Input */}
                                    <div className="space-y-4">
                                        <Label htmlFor="address" className="text-lg text-slate-600 font-bold">
                                            📝 Or enter/edit address manually
                                        </Label>
                                        <Textarea
                                            id="address"
                                            placeholder="Enter complete business address"
                                            value={formData.address}
                                            onChange={(e) => {
                                                setFormData({ ...formData, address: e.target.value })
                                                setAddressSearchValue(e.target.value)
                                            }}
                                            rows={4}
                                            className="border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 resize-none rounded-2xl text-xl shadow-xl"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <Label htmlFor="shopImage" className="text-xl font-bold text-slate-700 flex items-center">
                                            <Camera className="h-6 w-6 mr-3 text-blue-600" />
                                            Business Photo (Optional)
                                        </Label>
                                        <div className="flex items-center space-x-6 p-8 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-400 transition-colors bg-slate-50/50">
                                            <Input
                                                id="shopImage"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setShopImage(e.target.files?.[0] || null)}
                                                className="flex-1 border-0 p-0 h-auto bg-transparent text-xl"
                                            />
                                            <Upload className="h-8 w-8 text-slate-400" />
                                        </div>
                                        {shopImage && (
                                            <div className="flex items-center space-x-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                                                <p className="text-lg text-emerald-700 font-bold">Business image: {shopImage.name}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <Label htmlFor="challanImage" className="text-xl font-bold text-slate-700 flex items-center">
                                            <Receipt className="h-6 w-6 mr-3 text-green-600" />
                                            Challan Receipt Image
                                        </Label>
                                        <div className="flex items-center space-x-6 p-8 border-2 border-dashed border-green-300 rounded-2xl hover:border-green-400 transition-colors bg-green-50/50">
                                            <Input
                                                id="challanImage"
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => setChallanImage(e.target.files?.[0] || null)}
                                                className="flex-1 border-0 p-0 h-auto bg-transparent text-xl"
                                                required
                                            />
                                            <Receipt className="h-8 w-8 text-green-400" />
                                        </div>
                                        {challanImage && (
                                            <div className="flex items-center space-x-3 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                                                <CheckCircle className="h-6 w-6 text-green-600" />
                                                <p className="text-lg text-green-700 font-bold">Challan receipt: {challanImage.name}</p>
                                            </div>
                                        )}
                                        {!challanImage && (
                                            <p className="text-sm text-red-600 font-medium">
                                                * Challan receipt image is required for registration
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <Label className="text-xl font-bold text-slate-700 flex items-center">
                                        <MapPin className="h-6 w-6 mr-3 text-blue-600" />
                                        Confirm Business Location on Map *
                                    </Label>
                                    <MapComponent
                                        onLocationSelect={setLocation}
                                        selectedLocation={location}
                                        center={mapCenter}
                                        zoom={mapZoom}
                                        height="600px"
                                        showCurrentLocation={true}
                                    />
                                    {location && (
                                        <div className="p-8 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 border-2 border-emerald-200 rounded-2xl shadow-xl">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                                                    <CheckCircle className="h-8 w-8 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-2xl text-emerald-700 font-bold">✅ Location Confirmed!</p>
                                                    <p className="text-lg text-emerald-600 font-mono bg-white px-4 py-2 rounded-lg mt-2 shadow-md">
                                                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-20 btn-primary rounded-2xl text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <Loader2 className="h-8 w-8 mr-4 animate-spin" />
                                            Registering Business...
                                        </div>
                                    ) : (
                                        <>
                                            <Store className="h-8 w-8 mr-4" />
                                            Register Business
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
