import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MapLegend() {
    return (
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl text-slate-900">Map Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">Tax Paid</p>
                        <p className="text-sm text-slate-600">Compliant shops</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">✗</span>
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">Tax Unpaid</p>
                        <p className="text-sm text-slate-600">Pending payment</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
                    <div>
                        <p className="font-semibold text-slate-900">Current Location</p>
                        <p className="text-sm text-slate-600">Your GPS position</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
