"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MapLegend() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm"></div>
                    <span className="text-sm text-gray-700">Tax Paid</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm"></div>
                    <span className="text-sm text-gray-700">Tax Unpaid</span>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-sm"></div>
                    <span className="text-sm text-gray-700">Selected Location</span>
                </div>
            </CardContent>
        </Card>
    )
}
