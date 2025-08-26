"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapComponent } from "@/components/map-component"
import { toast } from "sonner"
import {
    ArrowLeft,
    Store,
    User,
    Phone,
    MapPin,
    Calendar,
    Camera,
    Receipt,
    DollarSign,
    Shield,
    Trash2,
    CheckCircle,
    XCircle,
    Download,
    Eye,
    Building2,
    Loader2,
    Globe,
    CreditCard,
    FileText,
    Clock,
    UserCheck,
    MoreVertical,
} from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import firebase from "firebase/compat/app"
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
    challanAmount?: number
    challanImageUrl?: string
    taxStatus: "paid" | "unpaid"
    createdAt: firebase.firestore.Timestamp
    updatedAt?: firebase.firestore.Timestamp
    registeredBy?: string
    registeredByEmail?: string
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
    const [updating, setUpdating] = useState(false)
    const [deleting, setDeleting] = useState(false)

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

    const updateTaxStatus = async (newStatus: "paid" | "unpaid") => {
        if (!shop) return

        setUpdating(true)
        try {
            await updateDoc(doc(db, "shops", shop.id), {
                taxStatus: newStatus,
                updatedAt: new Date(),
                lastUpdatedBy: user?.uid,
                lastUpdatedByEmail: user?.email,
            })

            setShop({ ...shop, taxStatus: newStatus })
            toast.success(`Tax status updated to ${newStatus}`)
        } catch (error) {
            if (error instanceof Error)
                toast.error(error.message || "Failed to update tax status")
        } finally {
            setUpdating(false)
        }
    }

    const deleteShop = async () => {
        if (!shop) return

        const confirmDelete = confirm(
            `Are you sure you want to permanently delete "${shop.shopName}"? This action cannot be undone.`,
        )

        if (!confirmDelete) return

        setDeleting(true)
        try {
            await deleteDoc(doc(db, "shops", shop.id))
            toast.success("Business deleted successfully")
            router.push("/admin")
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message || "Failed to delete business")
                setDeleting(false)
            }
        }
    }

    const downloadChallanImage = () => {
        if (shop?.challanImageUrl) {
            const link = document.createElement("a")
            link.href = shop.challanImageUrl
            link.download = `challan_${shop.shopName}_${shop.id}.jpg`
            link.target = "_blank"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const viewFullImage = (imageUrl: string) => {
        window.open(imageUrl, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes")
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
                <div className="text-center space-y-4 max-w-sm mx-auto">
                    <div className="relative mx-auto w-16 h-16 lg:w-20 lg:h-20">
                        <div className="animate-spin rounded-full h-full w-full border-4 border-blue-200 border-t-blue-600"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-pulse"></div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-lg lg:text-xl font-semibold text-slate-700">Loading Business Details</p>
                        <p className="text-sm text-slate-500">Please wait while we fetch the information...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!shop) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
                <div className="text-center space-y-6 max-w-md mx-auto">
                    <div className="w-20 h-20 lg:w-24 lg:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="h-10 w-10 lg:h-12 lg:w-12 text-red-600" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl lg:text-2xl font-bold text-slate-900">Business Not Found</h2>
                        <p className="text-slate-600 text-sm lg:text-base">
                            The requested business could not be found or may have been deleted.
                        </p>
                    </div>
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <Link href="/admin">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Admin Dashboard
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 lg:h-20">
                        {/* Left Section */}
                        <div className="flex items-center space-x-2 lg:space-x-4 flex-1 min-w-0">
                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex-shrink-0"
                            >
                                <Link href="/admin">
                                    <ArrowLeft className="h-4 w-4 mr-1 lg:mr-2" />
                                    <span className="hidden sm:inline">Back to Dashboard</span>
                                    <span className="sm:hidden">Back</span>
                                </Link>
                            </Button>

                            <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
                                <div className="w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                    <Building2 className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                                </div>
                                <div className="hidden sm:block flex-1 min-w-0">
                                    <h1 className="text-base lg:text-xl font-bold text-slate-900 truncate">Business Details</h1>
                                    <p className="text-xs lg:text-sm text-slate-600">Administrative View</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Action Buttons */}
                        <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
                            <Button
                                onClick={() => updateTaxStatus(shop.taxStatus === "paid" ? "unpaid" : "paid")}
                                disabled={updating}
                                size="sm"
                                className={`${shop.taxStatus === "paid" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                                    } text-white font-medium hidden md:flex`}
                            >
                                {updating ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : shop.taxStatus === "paid" ? (
                                    <XCircle className="h-4 w-4 mr-2" />
                                ) : (
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                )}
                                <span className="hidden lg:inline cursor-pointer">Mark as {shop.taxStatus === "paid" ? "Unpaid" : "Paid"}</span>
                                <span className="lg:hidden">{shop.taxStatus === "paid" ? "Unpaid" : "Paid"}</span>
                            </Button>

                            <Button
                                onClick={deleteShop}
                                disabled={deleting}
                                variant="destructive"
                                size="sm"
                                className="font-medium hidden md:flex cursor-pointer"
                            >
                                {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                <span className="hidden lg:inline">Delete</span>
                            </Button>

                            {/* Mobile Menu Dropdown - Updated */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="md:hidden bg-white/90 backdrop-blur-sm">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                        onClick={() => updateTaxStatus(shop.taxStatus === "paid" ? "unpaid" : "paid")}
                                        disabled={updating}
                                        className="cursor-pointer"
                                    >
                                        {updating ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : shop.taxStatus === "paid" ? (
                                            <XCircle className="h-4 w-4 mr-2" />
                                        ) : (
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                        )}
                                        Mark as {shop.taxStatus === "paid" ? "Unpaid" : "Paid"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={deleteShop}
                                        disabled={deleting}
                                        className="cursor-pointer text-red-600 focus:text-red-600"
                                    >
                                        {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                        Delete Business
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Business Header Card */}
                <Card className="mb-6 lg:mb-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start space-x-3 lg:space-x-4 flex-1 min-w-0">
                                <div className="w-12 h-12 lg:w-20 lg:h-20 bg-white/20 rounded-xl lg:rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                                    <Store className="h-6 w-6 lg:h-10 lg:w-10 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white mb-2 truncate">
                                        {shop.shopName}
                                    </h1>
                                    <div className="space-y-1">
                                        <p className="text-blue-100 text-sm lg:text-base truncate">Owner: {shop.ownerName}</p>
                                        <p className="text-blue-100 text-sm lg:text-base">Contact: {shop.contactNumber}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 flex-shrink-0">
                                <Badge
                                    variant={shop.taxStatus === "paid" ? "default" : "destructive"}
                                    className={`${shop.taxStatus === "paid"
                                        ? "bg-green-500 hover:bg-green-600 text-white border-green-400"
                                        : "bg-red-500 hover:bg-red-600 text-white border-red-400"
                                        } text-sm lg:text-base px-3 lg:px-4 py-1 cursor-pointer lg:py-2 font-semibold shadow-lg border`}
                                >
                                    {shop.taxStatus === "paid" ? "✅ Tax Paid" : "❌ Tax Pending"}
                                </Badge>

                                {shop.challanAmount && (
                                    <div className="bg-white/20 backdrop-blur-sm rounded-lg lg:rounded-xl px-3 lg:px-4 py-2">
                                        <p className="text-white/80 text-xs font-medium">Challan Amount</p>
                                        <p className="text-white text-base lg:text-xl font-bold">
                                            PKR {shop.challanAmount.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column - Main Content */}
                    <div className="xl:col-span-2 space-y-6 lg:space-y-8">
                        {/* Business Images */}
                        {(shop.imageUrl || shop.challanImageUrl) && (
                            <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
                                    <CardTitle className="text-xl lg:text-2xl text-slate-900 flex items-center">
                                        <Camera className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-blue-600" />
                                        Business Images
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 lg:p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                        {shop.imageUrl && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-slate-900 flex items-center text-base lg:text-lg">
                                                        <Store className="h-4 w-4 mr-2 text-blue-600" />
                                                        Business Photo
                                                    </h4>
                                                    <Button
                                                        onClick={() => viewFullImage(shop.imageUrl!)}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-blue-600 cursor-pointer border-blue-200 hover:bg-blue-50 bg-transparent"
                                                    >
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        <span className="hidden sm:inline">View Full</span>
                                                    </Button>
                                                </div>
                                                <div className="relative group overflow-hidden rounded-xl shadow-lg bg-slate-100">
                                                    <img
                                                        src={shop.imageUrl || "/placeholder.svg"}
                                                        alt={shop.shopName}
                                                        className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>
                                            </div>
                                        )}

                                        {shop.challanImageUrl && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-semibold text-slate-900 flex items-center text-base lg:text-lg">
                                                        <Receipt className="h-4 w-4 mr-2 text-green-600" />
                                                        Challan Receipt
                                                    </h4>
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            onClick={() => viewFullImage(shop.challanImageUrl!)}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            <span className="hidden sm:inline">View</span>
                                                        </Button>
                                                        <Button
                                                            onClick={downloadChallanImage}
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent"
                                                        >
                                                            <Download className="h-4 w-4 mr-1" />
                                                            <span className="hidden sm:inline">Download</span>
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="relative group overflow-hidden rounded-xl shadow-lg bg-slate-100">
                                                    <img
                                                        src={shop.challanImageUrl || "/placeholder.svg"}
                                                        alt="Challan Receipt"
                                                        className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Business Information */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
                                <CardTitle className="text-xl lg:text-2xl text-slate-900 flex items-center">
                                    <Building2 className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-blue-600" />
                                    Business Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 lg:p-8">
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-4 lg:gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 lg:p-6 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Store className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-blue-700 mb-1">Business Name</p>
                                                <p className="text-base lg:text-lg font-bold text-blue-900 truncate">{shop.shopName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 lg:p-6 rounded-xl border border-green-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <User className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-green-700 mb-1">Owner Name</p>
                                                <p className="text-base lg:text-lg font-bold text-green-900 truncate">{shop.ownerName}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 lg:p-6 rounded-xl border border-purple-200 hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Phone className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-purple-700 mb-1">Contact Number</p>
                                                <p className="text-base lg:text-lg font-bold text-purple-900">{shop.contactNumber}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {shop.challanAmount && (
                                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 lg:p-6 rounded-xl border border-emerald-200 hover:shadow-md transition-shadow">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-emerald-700 mb-1">Challan Amount</p>
                                                    <p className="text-base lg:text-lg font-bold text-emerald-900">
                                                        PKR {shop.challanAmount.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Address */}
                                <div className="mt-6 lg:mt-8">
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 lg:p-6 rounded-xl border border-orange-200">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                                                <MapPin className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-orange-700 mb-2">Business Address</p>
                                                <p className="text-base lg:text-lg font-semibold text-orange-900 leading-relaxed">
                                                    {shop.address}
                                                </p>
                                                <p className="text-sm text-orange-600 mt-2 font-mono">
                                                    GPS: {shop.location.lat.toFixed(6)}, {shop.location.lng.toFixed(6)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Map */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-slate-100">
                                <CardTitle className="text-xl lg:text-2xl text-slate-900 flex items-center">
                                    <MapPin className="h-5 w-5 lg:h-6 lg:w-6 mr-3 text-green-600" />
                                    Business Location
                                </CardTitle>
                                <CardDescription className="text-slate-600 text-sm lg:text-base">
                                    Exact geographical location of the business
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 lg:p-8">
                                <div className="rounded-xl overflow-hidden shadow-lg">
                                    <MapComponent center={shop.location} zoom={15} selectedLocation={shop.location} height="400px" />
                                </div>
                                {/* Fallback location info */}
                                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <MapPin className="h-5 w-5 text-slate-600" />
                                        <div>
                                            <p className="font-semibold text-slate-900">GPS Coordinates</p>
                                            <p className="text-slate-600 font-mono">
                                                {shop.location.lat.toFixed(6)}, {shop.location.lng.toFixed(6)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-4 lg:space-y-6">
                        {/* Payment Information */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                                <CardTitle className="text-lg lg:text-xl flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Payment Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 lg:p-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-sm font-medium text-slate-700">Tax Status</span>
                                        <Badge
                                            variant={shop.taxStatus === "paid" ? "default" : "destructive"}
                                            className={`${shop.taxStatus === "paid"
                                                ? "bg-green-100 text-green-800 border-green-200"
                                                : "bg-red-100 text-red-800 border-red-200"
                                                } font-semibold border`}
                                        >
                                            {shop.taxStatus === "paid" ? "✅ Paid" : "❌ Unpaid"}
                                        </Badge>
                                    </div>

                                    {shop.challanAmount && (
                                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                            <span className="text-sm font-medium text-green-700">Amount</span>
                                            <span className="font-bold text-green-800 text-lg">
                                                PKR {shop.challanAmount.toLocaleString()}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm font-medium text-blue-700">Receipt</span>
                                        <span className={`font-semibold ${shop.challanImageUrl ? "text-green-600" : "text-red-600"}`}>
                                            {shop.challanImageUrl ? "✅ Available" : "❌ Missing"}
                                        </span>
                                    </div>
                                </div>

                                {shop.challanImageUrl && (
                                    <div className="pt-2 space-y-2">
                                        <Button
                                            onClick={downloadChallanImage}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                                            size="sm"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download Receipt
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Registration Details */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                                <CardTitle className="text-lg lg:text-xl flex items-center">
                                    <FileText className="h-5 w-5 mr-2" />
                                    Registration Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 lg:p-6 space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg">
                                        <Calendar className="h-5 w-5 text-slate-600 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700">Registered</p>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {shop.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    {shop.updatedAt && (
                                        <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                                            <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-yellow-700">Last Updated</p>
                                                <p className="text-sm font-semibold text-yellow-900">
                                                    {shop.updatedAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {shop.registeredByEmail && (
                                        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                                            <UserCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-blue-700">Registered By</p>
                                                <p className="text-xs font-semibold text-blue-900 truncate">{shop.registeredByEmail}</p>
                                            </div>
                                        </div>
                                    )}

                                    {shop.userCountryName && (
                                        <div className="flex items-center space-x-3 p-3 bg-teal-50 rounded-lg">
                                            <Globe className="h-5 w-5 text-teal-600 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-teal-700">Owner Location</p>
                                                <p className="text-sm font-semibold text-teal-900">
                                                    {shop.userCity ? `${shop.userCity}, ` : ""}
                                                    {shop.userCountryName}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Admin Actions */}
                        <Card className="shadow-lg border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-slate-600 to-gray-700 text-white">
                                <CardTitle className="text-lg lg:text-xl flex items-center">
                                    <Shield className="h-5 w-5 mr-2" />
                                    Admin Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 lg:p-6 space-y-3">
                                <Button
                                    onClick={() => updateTaxStatus(shop.taxStatus === "paid" ? "unpaid" : "paid")}
                                    disabled={updating}
                                    className={`w-full cursor-pointer ${shop.taxStatus === "paid" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                                        } text-white font-semibold`}
                                    size="sm"
                                >
                                    {updating ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : shop.taxStatus === "paid" ? (
                                        <XCircle className="h-4 w-4 mr-2" />
                                    ) : (
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                    )}
                                    Mark as {shop.taxStatus === "paid" ? "Unpaid" : "Paid"}
                                </Button>

                                <Button
                                    onClick={deleteShop}
                                    disabled={deleting}
                                    variant="destructive"
                                    className="w-full font-semibold cursor-pointer"
                                    size="sm"
                                >
                                    {deleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                                    Delete Business
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
