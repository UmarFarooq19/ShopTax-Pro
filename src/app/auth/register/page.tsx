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
import { Shield, Mail, Lock, User, Globe, MapPin, UserPlus, CheckCircle, AlertCircle } from "lucide-react"

// Country data with major countries
const countries = [
  {
    code: "PK",
    name: "Pakistan",
    cities: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"],
  },
  {
    code: "IN",
    name: "India",
    cities: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"],
  },
  {
    code: "US",
    name: "United States",
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"],
  },
  {
    code: "GB",
    name: "United Kingdom",
    cities: ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Sheffield", "Edinburgh"],
  },
  {
    code: "CA",
    name: "Canada",
    cities: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City"],
  },
  {
    code: "AU",
    name: "Australia",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Newcastle", "Canberra"],
  },
  {
    code: "DE",
    name: "Germany",
    cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund"],
  },
  {
    code: "FR",
    name: "France",
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier"],
  },
  {
    code: "JP",
    name: "Japan",
    cities: ["Tokyo", "Osaka", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto"],
  },
  {
    code: "CN",
    name: "China",
    cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Wuhan", "Xi'an"],
  },
  {
    code: "BR",
    name: "Brazil",
    cities: [
      "São Paulo",
      "Rio de Janeiro",
      "Brasília",
      "Salvador",
      "Fortaleza",
      "Belo Horizonte",
      "Manaus",
      "Curitiba",
    ],
  },
  {
    code: "MX",
    name: "Mexico",
    cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Zapopan"],
  },
  {
    code: "ZA",
    name: "South Africa",
    cities: [
      "Johannesburg",
      "Cape Town",
      "Durban",
      "Pretoria",
      "Port Elizabeth",
      "Bloemfontein",
      "East London",
      "Pietermaritzburg",
    ],
  },
  {
    code: "NG",
    name: "Nigeria",
    cities: ["Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City", "Maiduguri", "Zaria"],
  },
  {
    code: "EG",
    name: "Egypt",
    cities: ["Cairo", "Alexandria", "Giza", "Shubra El Kheima", "Port Said", "Suez", "Luxor", "Aswan"],
  },
  {
    code: "TR",
    name: "Turkey",
    cities: ["Istanbul", "Ankara", "Izmir", "Bursa", "Adana", "Gaziantep", "Konya", "Antalya"],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    cities: ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk", "Abha"],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
  },
  {
    code: "BD",
    name: "Bangladesh",
    cities: ["Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna", "Barisal", "Rangpur", "Mymensingh"],
  },
  {
    code: "ID",
    name: "Indonesia",
    cities: ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Tangerang"],
  },
]

export default function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    city: "",
  })
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")
  const router = useRouter()

  const selectedCountry = countries.find((c) => c.code === formData.country)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    if (!formData.country || !formData.city) {
      toast.error("Please select your country and city")
      return
    }

    setLoading(true)

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      const user = userCredential.user

      // Get country name
      const countryData = countries.find((c) => c.code === formData.country)

      // Save user data to Firestore with admin role
      await setDoc(doc(db, "users", user.uid), {
        fullName: formData.fullName,
        email: formData.email,
        role: "admin", // Set as admin
        country: formData.country,
        countryName: countryData?.name || formData.country,
        city: formData.city,
        status: "active",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Send email verification
      await sendEmailVerification(user)

      // Sign out the user immediately (they need to verify email first)
      await auth.signOut()

      setRegisteredEmail(formData.email)
      setShowSuccess(true)

      // Success
      toast.success("Admin account created successfully! Please check your email to verify your account.")
    } catch (error: any) {
      console.error("Registration error:", error)
      // For Checking Which Error Is Coming
      if (error.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists.")
      } else if (error.code === "auth/invalid-email") {
        toast.error("Please enter a valid email address.")
      } else if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please choose a stronger password.")
      } else {
        toast.error("Failed to create admin account. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    try {
      // This is a simplified version - in a real app you'd need to handle this differently
      toast.info("Please contact system administrator to resend verification email.")
    } catch (error) {
      toast.error("Failed to resend verification email.")
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute top-40 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md animate-fade-in-up">
            <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 card-hover">
              <CardHeader className="text-center space-y-6 pb-8">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-600 to-emerald-700 rounded-3xl flex items-center justify-center shadow-xl animate-float">
                  <CheckCircle className="h-10 w-10 text-white" />
                </div>
                <div>
                  <CardTitle className="text-4xl font-bold text-gradient-primary mb-2">
                    Registration Successful!
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-lg">
                    Your admin account has been created
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-green-800 text-lg mb-2">Verify Your Email</h3>
                        <p className="text-green-700 mb-4 leading-relaxed">We've sent a verification email to:</p>
                        <p className="font-bold text-green-800 bg-white px-4 py-2 rounded-lg border border-green-200 break-all">
                          {registeredEmail}
                        </p>
                        <p className="text-green-700 mt-4 text-sm">
                          Please check your email and click the verification link to activate your admin account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="h-5 w-5 text-blue-600" />
                      <p className="text-sm text-blue-700 font-medium">
                        You must verify your email before you can access the admin panel.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={resendVerification}
                      variant="outline"
                      className="w-full border-2 border-green-200 text-green-700 hover:bg-green-50 font-semibold bg-transparent"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </Button>

                    <Button asChild className="w-full btn-primary">
                      <Link href="/auth/login">
                        <Shield className="h-4 w-4 mr-2" />
                        Go to Login
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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

      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-lg animate-fade-in-up">
          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 card-hover">
            <CardHeader className="text-center space-y-6 pb-8">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-xl animate-float">
                <UserPlus className="h-10 w-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-4xl font-bold text-gradient-primary mb-2">Admin Registration</CardTitle>
                <CardDescription className="text-slate-600 text-lg">
                  Create a new administrator account for ShopTax Pro
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="fullName" className="text-lg font-bold text-slate-700 flex items-center">
                    <User className="h-5 w-5 mr-3 text-blue-600" />
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-lg font-bold text-slate-700 flex items-center">
                    <Mail className="h-5 w-5 mr-3 text-blue-600" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-lg font-bold text-slate-700 flex items-center">
                      <Lock className="h-5 w-5 mr-3 text-blue-600" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirmPassword" className="text-lg font-bold text-slate-700 flex items-center">
                      <Lock className="h-5 w-5 mr-3 text-blue-600" />
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="h-14 border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl text-lg shadow-lg"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-lg font-bold text-slate-700 flex items-center">
                      <Globe className="h-5 w-5 mr-3 text-blue-600" />
                      Country
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData({ ...formData, country: value, city: "" })}
                    >
                      <SelectTrigger className="h-14 border-2 border-slate-200 focus:border-blue-500 rounded-xl text-lg shadow-lg">
                        <SelectValue placeholder="Select country" />
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

                  <div className="space-y-3">
                    <Label htmlFor="city" className="text-lg font-bold text-slate-700 flex items-center">
                      <MapPin className="h-5 w-5 mr-3 text-blue-600" />
                      City
                    </Label>
                    <Select
                      value={formData.city}
                      onValueChange={(value) => setFormData({ ...formData, city: value })}
                      disabled={!formData.country}
                    >
                      <SelectTrigger className="h-14 border-2 border-slate-200 focus:border-blue-500 rounded-xl text-lg shadow-lg">
                        <SelectValue placeholder={formData.country ? "Select city" : "Select country first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCountry?.cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 btn-primary rounded-xl text-xl font-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Creating Admin Account...
                    </div>
                  ) : (
                    <>
                      <UserPlus className="h-6 w-6 mr-3" />
                      Create Admin Account
                    </>
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <p className="text-sm text-blue-700 font-medium">
                    Admin accounts have full system access and require email verification.
                  </p>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-slate-600 mb-4">Already have an admin account?</p>
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-700 font-bold hover:underline transition-colors text-lg"
                >
                  Sign In to Admin Panel
                </Link>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/"
                  className="text-slate-500 hover:text-slate-600 font-medium hover:underline transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
