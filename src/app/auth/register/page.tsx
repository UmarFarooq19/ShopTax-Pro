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
import { toast } from "sonner"
import Link from "next/link"
import { Building2, Globe, MapPin, CheckCircle, Mail, AlertCircle } from "lucide-react"

// Countries with their coordinates
const countries = [
  { name: "Pakistan", code: "PK", lat: 30.3753, lng: 69.3451 },
  { name: "India", code: "IN", lat: 20.5937, lng: 78.9629 },
  { name: "United States", code: "US", lat: 39.8283, lng: -98.5795 },
  { name: "United Kingdom", code: "GB", lat: 55.3781, lng: -3.436 },
  { name: "Canada", code: "CA", lat: 56.1304, lng: -106.3468 },
  { name: "Australia", code: "AU", lat: -25.2744, lng: 133.7751 },
  { name: "Germany", code: "DE", lat: 51.1657, lng: 10.4515 },
  { name: "France", code: "FR", lat: 46.2276, lng: 2.2137 },
  { name: "Japan", code: "JP", lat: 36.2048, lng: 138.2529 },
  { name: "China", code: "CN", lat: 35.8617, lng: 104.1954 },
  { name: "Brazil", code: "BR", lat: -14.235, lng: -51.9253 },
  { name: "Mexico", code: "MX", lat: 23.6345, lng: -102.5528 },
  { name: "South Africa", code: "ZA", lat: -30.5595, lng: 22.9375 },
  { name: "Nigeria", code: "NG", lat: 9.082, lng: 8.6753 },
  { name: "Egypt", code: "EG", lat: 26.8206, lng: 30.8025 },
  { name: "Turkey", code: "TR", lat: 38.9637, lng: 35.2433 },
  { name: "Saudi Arabia", code: "SA", lat: 23.8859, lng: 45.0792 },
  { name: "UAE", code: "AE", lat: 23.4241, lng: 53.8478 },
  { name: "Bangladesh", code: "BD", lat: 23.685, lng: 90.3563 },
  { name: "Indonesia", code: "ID", lat: -0.7893, lng: 113.9213 },
]

// Major cities for different countries
const citiesByCountry: { [key: string]: Array<{ name: string; lat: number; lng: number }> } = {
  PK: [
    { name: "Karachi", lat: 24.8607, lng: 67.0011 },
    { name: "Lahore", lat: 31.5204, lng: 74.3587 },
    { name: "Islamabad", lat: 33.6844, lng: 73.0479 },
    { name: "Rawalpindi", lat: 33.5651, lng: 73.0169 },
    { name: "Faisalabad", lat: 31.4504, lng: 73.135 },
    { name: "Multan", lat: 30.1575, lng: 71.5249 },
    { name: "Peshawar", lat: 34.0151, lng: 71.5249 },
    { name: "Quetta", lat: 30.1798, lng: 66.975 },
    { name: "Sialkot", lat: 32.4945, lng: 74.5229 },
    { name: "Gujranwala", lat: 32.1877, lng: 74.1945 },
  ],
  IN: [
    { name: "Mumbai", lat: 19.076, lng: 72.8777 },
    { name: "Delhi", lat: 28.7041, lng: 77.1025 },
    { name: "Bangalore", lat: 12.9716, lng: 77.5946 },
    { name: "Hyderabad", lat: 17.385, lng: 78.4867 },
    { name: "Chennai", lat: 13.0827, lng: 80.2707 },
    { name: "Kolkata", lat: 22.5726, lng: 88.3639 },
    { name: "Pune", lat: 18.5204, lng: 73.8567 },
    { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  ],
  US: [
    { name: "New York", lat: 40.7128, lng: -74.006 },
    { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
    { name: "Chicago", lat: 41.8781, lng: -87.6298 },
    { name: "Houston", lat: 29.7604, lng: -95.3698 },
    { name: "Phoenix", lat: 33.4484, lng: -112.074 },
    { name: "Philadelphia", lat: 39.9526, lng: -75.1652 },
  ],
}

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    country: "",
    city: "",
  })
  const [loading, setLoading] = useState(false)
  const [availableCities, setAvailableCities] = useState<Array<{ name: string; lat: number; lng: number }>>([])
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const handleCountryChange = (countryCode: string) => {
    setFormData({ ...formData, country: countryCode, city: "" })
    setAvailableCities(citiesByCountry[countryCode] || [])
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

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

      // Get country and city coordinates
      const selectedCountry = countries.find((c) => c.code === formData.country)
      const selectedCity = availableCities.find((c) => c.name === formData.city)

      // Save user data to Firestore with default role as shop_owner
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: formData.email,
        fullName: formData.fullName,
        role: "shop_owner", // Default role
        country: formData.country,
        countryName: selectedCountry?.name || "",
        city: formData.city,
        location: {
          country: {
            lat: selectedCountry?.lat || 24.8607, // Default to Karachi
            lng: selectedCountry?.lng || 67.0011,
          },
          city: selectedCity
            ? {
                lat: selectedCity.lat,
                lng: selectedCity.lng,
              }
            : null,
        },
        createdAt: new Date(),
        status: "active",
        emailVerified: false, // Track verification status
      })

      // Send email verification
      await sendEmailVerification(userCredential.user)

      // Sign out the user immediately after registration
      await auth.signOut()

      setShowSuccess(true)
      toast.success("Account created successfully! Please verify your email before logging in.")
    } catch (error: any) {
      console.error("Registration error:", error)
      if (error.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists.")
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please choose a stronger password.")
      } else if (error.code === "auth/invalid-email") {
        toast.error("Please enter a valid email address.")
      } else {
        toast.error("Registration failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in-up">
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Account Created!
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Please verify your email to complete registration
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">Verification Email Sent</h3>
                    <p className="text-sm text-green-700">
                      We've sent a verification email to <strong>{formData.email}</strong>. Please check your inbox and
                      click the verification link.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-1">Important Notes</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Check your spam/junk folder if you don't see the email</li>
                      <li>• The verification link will expire in 24 hours</li>
                      <li>• You must verify your email before you can log in</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Go to Login Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Join ShopTax Pro
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Create your account to start managing your business
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-semibold text-gray-700 flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  Country *
                </Label>
                <Select value={formData.country} onValueChange={handleCountryChange}>
                  <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
                  <Label htmlFor="city" className="text-sm font-semibold text-gray-700 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    City (Optional)
                  </Label>
                  <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Email Verification Notice */}
              <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <p className="text-xs text-blue-700 font-medium">
                    You'll need to verify your email address before you can log in.
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
