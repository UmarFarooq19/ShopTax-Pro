"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { toast } from "sonner"

// Popular countries with their coordinates
const countries = [
    { name: "Pakistan", code: "PK", lat: 30.3753, lng: 69.3451 },
    { name: "India", code: "IN", lat: 20.5937, lng: 78.9629 },
    { name: "United States", code: "US", lat: 39.8283, lng: -98.5795 },
    { name: "United Kingdom", code: "GB", lat: 55.3781, lng: -3.4360 },
    { name: "Canada", code: "CA", lat: 56.1304, lng: -106.3468 },
    { name: "Australia", code: "AU", lat: -25.2744, lng: 133.7751 },
    { name: "Germany", code: "DE", lat: 51.1657, lng: 10.4515 },
    { name: "France", code: "FR", lat: 46.2276, lng: 2.2137 },
    { name: "Japan", code: "JP", lat: 36.2048, lng: 138.2529 },
    { name: "China", code: "CN", lat: 35.8617, lng: 104.1954 },
    { name: "Brazil", code: "BR", lat: -14.2350, lng: -51.9253 },
    { name: "Mexico", code: "MX", lat: 23.6345, lng: -102.5528 },
    { name: "South Africa", code: "ZA", lat: -30.5595, lng: 22.9375 },
    { name: "Nigeria", code: "NG", lat: 9.0820, lng: 8.6753 },
    { name: "Egypt", code: "EG", lat: 26.8206, lng: 30.8025 },
    { name: "Turkey", code: "TR", lat: 38.9637, lng: 35.2433 },
    { name: "Saudi Arabia", code: "SA", lat: 23.8859, lng: 45.0792 },
    { name: "UAE", code: "AE", lat: 23.4241, lng: 53.8478 },
    { name: "Bangladesh", code: "BD", lat: 23.6850, lng: 90.3563 },
    { name: "Indonesia", code: "ID", lat: -0.7893, lng: 113.9213 },
]

// Major cities for Pakistan (you can expand this for other countries)
const pakistanCities = [
    { name: "Karachi", lat: 24.8607, lng: 67.0011 },
    { name: "Lahore", lat: 31.5204, lng: 74.3587 },
    { name: "Islamabad", lat: 33.6844, lng: 73.0479 },
    { name: "Rawalpindi", lat: 33.5651, lng: 73.0169 },
    { name: "Faisalabad", lat: 31.4504, lng: 73.1350 },
    { name: "Multan", lat: 30.1575, lng: 71.5249 },
    { name: "Peshawar", lat: 34.0151, lng: 71.5249 },
    { name: "Quetta", lat: 30.1798, lng: 66.9750 },
    { name: "Sialkot", lat: 32.4945, lng: 74.5229 },
    { name: "Gujranwala", lat: 32.1877, lng: 74.1945 },
]

const indiaCities = [
    { name: "Mumbai", lat: 19.0760, lng: 72.8777 },
    { name: "Delhi", lat: 28.7041, lng: 77.1025 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { name: "Hyderabad", lat: 17.3850, lng: 78.4867 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
]

const usCities = [
    { name: "New York", lat: 40.7128, lng: -74.0060 },
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
    { name: "Chicago", lat: 41.8781, lng: -87.6298 },
    { name: "Houston", lat: 29.7604, lng: -95.3698 },
    { name: "Phoenix", lat: 33.4484, lng: -112.0740 },
    { name: "Philadelphia", lat: 39.9526, lng: -75.1652 },
]

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
        role: "shop_owner",
        country: "",
        city: "",
    })
    const [loading, setLoading] = useState(false)
    const [availableCities, setAvailableCities] = useState<Array<{ name: string, lat: number, lng: number }>>([])
    const router = useRouter()

    const handleCountryChange = (countryCode: string) => {
        setFormData({ ...formData, country: countryCode, city: "" })

        // Set available cities based on selected country
        switch (countryCode) {
            case "PK":
                setAvailableCities(pakistanCities)
                break
            case "IN":
                setAvailableCities(indiaCities)
                break
            case "US":
                setAvailableCities(usCities)
                break
            default:
                setAvailableCities([])
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        if (!formData.country) {
            toast.error("Please select your country")
            return
        }

        setLoading(true)

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

            // Get country and city coordinates
            const selectedCountry = countries.find(c => c.code === formData.country)
            const selectedCity = availableCities.find(c => c.name === formData.city)

            // Save user data to Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                email: formData.email,
                fullName: formData.fullName,
                role: formData.role,
                country: formData.country,
                countryName: selectedCountry?.name || "",
                city: formData.city,
                location: {
                    country: {
                        lat: selectedCountry?.lat || 0,
                        lng: selectedCountry?.lng || 0,
                    },
                    city: selectedCity ? {
                        lat: selectedCity.lat,
                        lng: selectedCity.lng,
                    } : null,
                },
                createdAt: new Date(),
            })

            // Send email verification
            await sendEmailVerification(userCredential.user)

            toast.success("Account created successfully! Please check your email for verification.")

            router.push("/auth/login")
        } catch (error: any) {
            toast.error(error.message || "Error")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Register for ShopTax Pro</CardTitle>
                    <CardDescription>Create your account to get started</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Select value={formData.country} onValueChange={handleCountryChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries.map((country) => (
                                        <SelectItem key={country.code} value={country.code}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {availableCities.length > 0 && (
                            <div className="space-y-2">
                                <Label htmlFor="city">City (Optional)</Label>
                                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your city" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableCities.map((city) => (
                                            <SelectItem key={city.name} value={city.name}>
                                                {city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="shop_owner">Shop Owner</SelectItem>
                                    <SelectItem value="admin">Tax Officer (Admin)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating Account..." : "Register"}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="text-primary hover:underline">
                            Login here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
