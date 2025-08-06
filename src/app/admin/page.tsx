"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapComponent } from "@/components/map-component"
import { Store, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

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

export default function AdminPage() {
    const { user, userRole, loading } = useAuth()
    const router = useRouter()
    const [shops, setShops] = useState<Shop[]>([])
    const [loadingShops, setLoadingShops] = useState(true)
    const [updatingTax, setUpdatingTax] = useState<string | null>(null)

    useEffect(() => {
        if (!loading && (!user || userRole !== "admin")) {
            router.push("/auth/login")
        }
    }, [user, userRole, loading, router])

    useEffect(() => {
        if (user && userRole === "admin") {
            fetchAllShops()
        }
    }, [user, userRole])

    const fetchAllShops = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "shops"))
            const shopsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Shop[]

            setShops(shopsData)
        } catch (error) {
            console.error("Error fetching shops:", error)
            toast.error("Failed to fetch shops data")
        } finally {
            setLoadingShops(false)
        }
    }

    const updateTaxStatus = async (shopId: string, newStatus: "paid" | "unpaid") => {
        setUpdatingTax(shopId)

        try {
            await updateDoc(doc(db, "shops", shopId), {
                taxStatus: newStatus,
            })

            // Update local state
            setShops(shops.map((shop) => (shop.id === shopId ? { ...shop, taxStatus: newStatus } : shop)))

            toast.success(`Tax status updated to ${newStatus}`)
        } catch (error) {
            toast.error("Failed to update tax status")
        } finally {
            setUpdatingTax(null)
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

    const paidShops = shops.filter((shop) => shop.taxStatus === "paid").length
    const unpaidShops = shops.filter((shop) => shop.taxStatus === "unpaid").length

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Tax Officer Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">Welcome, {user.email}</span>
                        <Button onClick={handleLogout} variant="outline">
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {/* Statistics */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
                            <Store className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{shops.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tax Paid</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{paidShops}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tax Unpaid</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{unpaidShops}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Map View */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Shop Locations Map</CardTitle>
                        <CardDescription>Green pins indicate shops with paid tax, red pins indicate unpaid tax</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MapComponent
                            shops={shops.map((shop) => ({
                                id: shop.id,
                                shopName: shop.shopName,
                                location: shop.location,
                                taxStatus: shop.taxStatus,
                            }))}
                        />
                    </CardContent>
                </Card>

                {/* Shops Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>All Registered Shops</CardTitle>
                        <CardDescription>Manage tax status for all registered shops</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingShops ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Shop Name</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Address</TableHead>
                                        <TableHead>Tax Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shops.map((shop) => (
                                        <TableRow key={shop.id}>
                                            <TableCell className="font-medium">{shop.shopName}</TableCell>
                                            <TableCell>{shop.ownerName}</TableCell>
                                            <TableCell>{shop.contactNumber}</TableCell>
                                            <TableCell className="max-w-xs truncate">{shop.address}</TableCell>
                                            <TableCell>
                                                <Badge variant={shop.taxStatus === "paid" ? "default" : "destructive"}>
                                                    {shop.taxStatus === "paid" ? "Paid" : "Unpaid"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant={shop.taxStatus === "paid" ? "outline" : "default"}
                                                        onClick={() => updateTaxStatus(shop.id, "paid")}
                                                        disabled={updatingTax === shop.id || shop.taxStatus === "paid"}
                                                    >
                                                        Mark Paid
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={shop.taxStatus === "unpaid" ? "outline" : "destructive"}
                                                        onClick={() => updateTaxStatus(shop.id, "unpaid")}
                                                        disabled={updatingTax === shop.id || shop.taxStatus === "unpaid"}
                                                    >
                                                        Mark Unpaid
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
