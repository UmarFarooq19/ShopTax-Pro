"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from 'lucide-react'
import { toast } from "sonner"

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

// Create custom icons for tax status
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background-color: ${color};
        border: 4px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: white;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
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
    " class="pulse-ring"></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

const greenIcon = createCustomIcon("#10b981") // green-500
const redIcon = createCustomIcon("#ef4444") // red-500

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

// Component to handle map clicks
function LocationMarker({
  onLocationSelect,
  currentLocation
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

  return (
    <>
      {position && (
        <Marker position={[position.lat, position.lng]}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-semibold text-blue-600">Selected Shop Location</h3>
              <p className="text-sm text-gray-600 mt-1">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
            </div>
          </Popup>
        </Marker>
      )}
      {currentLocation && (
        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-semibold text-blue-600">Your Current Location</h3>
              <p className="text-sm text-gray-600 mt-1">
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

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
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

        // If we're in location selection mode, use current location as selected
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
      }
    )
  }

  if (!isClient) {
    return (
      <div
        className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border border-blue-200"
        style={{ height }}
      >
        <div className="text-blue-600 font-medium">Loading interactive map...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showCurrentLocation && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Navigation className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900">
                {currentLocation ? "Current Location Detected" : "Use Your Current Location"}
              </p>
              <p className="text-sm text-blue-700">
                {currentLocation
                  ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                  : "Click to automatically detect your location"
                }
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
          >
            {gettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Detecting...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Get Location
              </>
            )}
          </Button>
        </div>
      )}

      <div style={{ height }} className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
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

          {/* Location selection marker and current location */}
          {onLocationSelect && (
            <LocationMarker
              onLocationSelect={onLocationSelect}
              currentLocation={currentLocation}
            />
          )}

          {/* Selected location marker */}
          {selectedLocation && !onLocationSelect && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                <div className="text-center p-2">
                  <h3 className="font-semibold text-green-600">Your Shop Location</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Shop markers with color coding */}
          {shops.map((shop) => (
            <Marker
              key={shop.id}
              position={[shop.location.lat, shop.location.lng]}
              icon={shop.taxStatus === "paid" ? greenIcon : redIcon}
            >
              <Popup>
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{shop.shopName}</h3>
                  {shop.ownerName && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-semibold">Owner:</span> {shop.ownerName}
                    </p>
                  )}
                  {shop.address && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Address:</span> {shop.address}
                    </p>
                  )}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${shop.taxStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                    }`}>
                    {shop.taxStatus === "paid" ? "✅ Tax Paid" : "❌ Tax Unpaid"}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
