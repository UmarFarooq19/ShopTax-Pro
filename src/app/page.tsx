"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Building2, ArrowRight, Users, BarChart3, CheckCircle, Lock, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, userRole, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && user && userRole === "admin") {
      router.push("/admin")
    }
  }, [user, userRole, loading, router, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading ShopTax Pro Admin...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Initializing admin system...</p>
        </div>
      </div>
    )
  }

  if (user && userRole === "admin") {
    return null // Will redirect to admin dashboard
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b lg:px-8 xl:px-16 border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                  ShopTax Pro Admin
                </span>
                <p className="text-xs text-slate-500 font-medium">Administrative Control Panel</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/auth/login">Admin Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-8 shadow-sm">
              <Shield className="h-4 w-4 mr-2" />
              Administrative Access Only
            </div>
            <h1 className="text-6xl md:text-8xl font-bold text-slate-900 mb-8 leading-tight">
              ShopTax Pro
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Admin Portal
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 mb-12 leading-relaxed max-w-3xl mx-auto">
              Comprehensive tax management and business registration system for tax authorities and administrative
              staff.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
              <Button
                asChild
                size="lg"
                className="h-16 px-10 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
              >
                <Link href="/auth/login">
                  Access Admin Panel
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-slate-200">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
                <div className="text-sm text-slate-600 font-medium">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">50K+</div>
                <div className="text-sm text-slate-600 font-medium">Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">120+</div>
                <div className="text-sm text-slate-600 font-medium">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-sm text-slate-600 font-medium">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:px-8 xl:px-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-slate-900 mb-6">Administrative Features</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Powerful tools designed for tax authorities and administrative control
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Building2 className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Business Registration</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600 text-lg leading-relaxed">
                  Register new businesses with comprehensive details, location mapping, and challan payment tracking
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group bg-gradient-to-br from-white to-emerald-50">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <BarChart3 className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Tax Management</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600 text-lg leading-relaxed">
                  Monitor tax compliance, update payment status, and generate comprehensive reports for all businesses
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group bg-gradient-to-br from-white to-purple-50">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-slate-900">Administrative Control</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-600 text-lg leading-relaxed">
                  Complete administrative oversight with user management, system monitoring, and advanced analytics
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 lg:px-8 xl:px-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-5xl font-bold text-slate-900 mb-8">Why Choose ShopTax Pro Admin?</h2>
              <p className="text-xl text-slate-600 mb-12">
                Built specifically for tax authorities with enterprise-grade security and comprehensive management tools
              </p>

              <div className="space-y-8">
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <CheckCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Complete Tax Oversight</h3>
                    <p className="text-slate-600 text-lg">
                      Monitor all business registrations, tax payments, and compliance status with real-time updates and
                      comprehensive reporting
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <BarChart3 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Advanced Analytics</h3>
                    <p className="text-slate-600 text-lg">
                      Comprehensive dashboard with detailed insights, compliance trends, and revenue tracking for
                      informed decision making
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Lock className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Secure Administration</h3>
                    <p className="text-slate-600 text-lg">
                      Bank-level security with role-based access control, audit trails, and comprehensive data
                      protection
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 text-white shadow-2xl">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <Shield className="h-16 w-16 mx-auto mb-4 opacity-90" />
                    <div className="text-3xl font-bold mb-2">Secure</div>
                    <div className="text-sm opacity-80">Admin Only Access</div>
                  </div>
                  <div className="text-center">
                    <Lock className="h-16 w-16 mx-auto mb-4 opacity-90" />
                    <div className="text-3xl font-bold mb-2">Protected</div>
                    <div className="text-sm opacity-80">Enterprise Security</div>
                  </div>
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-90" />
                    <div className="text-3xl font-bold mb-2">Analytics</div>
                    <div className="text-sm opacity-80">Real-time Insights</div>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-90" />
                    <div className="text-3xl font-bold mb-2">Scalable</div>
                    <div className="text-sm opacity-80">Government Ready</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold text-slate-900 mb-8">Ready to Manage Tax Operations?</h2>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
            Access the comprehensive administrative panel designed specifically for tax authorities and government
            agencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              asChild
              size="lg"
              className="h-16 px-10 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
            >
              <Link href="/auth/login">
                Access Admin Panel
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-3xl font-bold">ShopTax Pro Admin</span>
                <p className="text-sm text-slate-400">Administrative Control Panel</p>
              </div>
            </div>
            <p className="text-slate-400 mb-6 text-lg">
              The most trusted tax management system for government agencies and tax authorities
            </p>
            <p className="text-slate-500 text-sm">
              © 2024 ShopTax Pro Admin. All rights reserved. Built for tax authorities worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
