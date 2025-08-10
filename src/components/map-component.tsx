"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useMapEvents } from "react-leaflet"
import { DivIcon } from "leaflet"
// Dynamically import React Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

interface Shop {
  id: string
  shopName: string
  location: { lat: number; lng: number }
  taxStatus: "paid" | "unpaid"
  ownerName?: string
  address?: string
}

interface MapComponentProps {
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  selectedLocation?: { lat: number; lng: number } | null
  shops?: Shop[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  showCurrentLocation?: boolean
}

interface CustomIcons {
  greenIcon: DivIcon
  redIcon: DivIcon
  currentLocationIcon: DivIcon
}

// Component to handle map clicks
function LocationMarker({
  onLocationSelect,
  currentLocation,
}: {
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  currentLocation?: { lat: number; lng: number } | null
}) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null)

  const map = useMapEvents({
    click(e) {
      const newPosition = { lat: e.latlng.lat, lng: e.latlng.lng }
      setPosition(newPosition)
      if (onLocationSelect) {
        onLocationSelect(newPosition)
      }
    },
  })
  console.log(map)
  return (
    <>
      {position && (
        <Marker position={[position.lat, position.lng]}>
          <Popup>
            <div className="text-center p-3">
              <h3 className="font-bold text-blue-600 text-lg">Selected Shop Location</h3>
              <p className="text-sm text-slate-600 mt-2">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
      {currentLocation && (
        <Marker position={[currentLocation.lat, currentLocation.lng]}>
          <Popup>
            <div className="text-center p-3">
              <h3 className="font-bold text-emerald-600 text-lg">Your Current Location</h3>
              <p className="text-sm text-slate-600 mt-2">
                {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  )
}

export function MapComponent({
  onLocationSelect,
  selectedLocation,
  shops = [],
  center = { lat: 24.8607, lng: 67.0011 }, // Default to Karachi, Pakistan
  zoom = 10,
  height = "400px",
  showCurrentLocation = false,
}: MapComponentProps) {
  const [isClient, setIsClient] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [customIcons, setCustomIcons] = useState<CustomIcons | null>(null)

  useEffect(() => {
    setIsClient(true)

    // Load Leaflet CSS and setup icons only on client side
    if (typeof window !== "undefined") {
      import("leaflet/dist/leaflet.css")
      import("leaflet").then((L) => {
        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        })

        // Create custom icons for tax status
        const createCustomIcon = (color: string, status: string) => {
          return L.divIcon({
            className: "custom-div-icon",
            html: `
              <div style="
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background-color: ${color};
                border: 4px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                font-weight: bold;
                color: white;
              ">
                ${status === "paid" ? "✓" : "✗"}
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })
        }

        // Create current location icon
        const currentLocationIcon = L.divIcon({
          className: "current-location-icon",
          html: `
            <div style="
              width: 24px;
              height: 24px;
              border-radius: 50%;
              background-color: #3b82f6;
              border: 4px solid white;
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
              animation: pulse 2s infinite;
            "></div>
            <style>
              @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
                70% { box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); }
                100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
              }
            </style>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        setCustomIcons({
          greenIcon: createCustomIcon("#10b981", "paid"), // emerald-500
          redIcon: createCustomIcon("#ef4444", "unpaid"), // red-500
          currentLocationIcon: currentLocationIcon,
        })

        setLeafletLoaded(true)
      })
    }
  }, [])

  const getCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser.")
      return
    }

    setGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCurrentLocation(location)
        setGettingLocation(false)

        if (onLocationSelect) {
          onLocationSelect(location)
        }

        toast.success("Current location detected successfully!")
      },
      (error) => {
        setGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied. Please enable location permissions.")
            break
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.")
            break
          case error.TIMEOUT:
            toast.error("Location request timed out.")
            break
          default:
            toast.error("An unknown error occurred while getting location.")
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      },
    )
  }

  if (!isClient || !leafletLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border-2 border-slate-200 shadow-lg"
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-600 mx-auto mb-3 animate-spin" />
          <div className="text-blue-600 font-semibold text-lg">Loading interactive map...</div>
          <div className="text-slate-500 text-sm mt-1">Please wait while we prepare your map</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showCurrentLocation && (
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-xl shadow-md">
              <Navigation className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-bold text-blue-900 text-lg">
                {currentLocation ? "Current Location Detected" : "Use Your Current Location"}
              </p>
              <p className="text-sm text-blue-700 mt-1">
                {currentLocation
                  ? `Coordinates: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                  : "Click to automatically detect your precise location"}
              </p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all px-6"
          >
            {gettingLocation ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <MapPin className="h-5 w-5 mr-2" />
                Get Location
              </>
            )}
          </Button>
        </div>
      )}

      <div style={{ height }} className="rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xl">
        <MapContainer
          center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [center.lat, center.lng]}
          zoom={currentLocation ? 15 : zoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} currentLocation={currentLocation} />}

          {selectedLocation && !onLocationSelect && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                <div className="text-center p-3">
                  <h3 className="font-bold text-emerald-600 text-lg">Your Shop Location</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Shop markers with color coding */}
          {customIcons &&
            shops.map((shop) => (
              <Marker
                key={shop.id}
                position={[shop.location.lat, shop.location.lng]}
                icon={shop.taxStatus === "paid" ? customIcons.greenIcon : customIcons.redIcon}
              >
                <Popup>
                  <div className="p-4 min-w-[250px]">
                    <h3 className="font-bold text-xl text-slate-800 mb-3">{shop.shopName}</h3>
                    {shop.ownerName && (
                      <p className="text-sm text-slate-600 mb-2">
                        <span className="font-semibold">Owner:</span> {shop.ownerName}
                      </p>
                    )}
                    {shop.address && (
                      <p className="text-sm text-slate-600 mb-3">
                        <span className="font-semibold">Address:</span> {shop.address}
                      </p>
                    )}
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-md ${shop.taxStatus === "paid"
                        ? "bg-emerald-100 text-emerald-800 border-2 border-emerald-200"
                        : "bg-red-100 text-red-800 border-2 border-red-200"
                        }`}
                    >
                      {shop.taxStatus === "paid" ? "✅ Tax Paid" : "❌ Tax Unpaid"}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Current location marker */}
          {currentLocation && customIcons && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={customIcons.currentLocationIcon}>
              <Popup>
                <div className="text-center p-3">
                  <h3 className="font-bold text-blue-600 text-lg">Your Current Location</h3>
                  <p className="text-sm text-slate-600 mt-2">
                    {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}
