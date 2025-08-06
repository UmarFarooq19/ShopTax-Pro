"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation } from 'lucide-react'

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
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })
}

// Create current location icon
const currentLocationIcon = L.divIcon({
  className: "current-location-icon",
  html: `
    <div style="
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #3b82f6;
      border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
        70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
      }
    </style>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
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
          <Popup>Selected Shop Location</Popup>
        </Marker>
      )}
      {currentLocation && (
        <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
          <Popup>Your Current Location</Popup>
        </Marker>
      )}
    </>
  )
}

export function MapComponent({
  onLocationSelect,
  selectedLocation,
  shops = [],
  center = { lat: 28.6139, lng: 77.209 },
  zoom = 10,
  height = "400px",
  showCurrentLocation = false,
}: MapComponentProps) {
  const [isClient, setIsClient] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.")
      return
    }

    setGettingLocation(true)
    setLocationError(null)

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
      },
      (error) => {
        setGettingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied by user.")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.")
            break
          case error.TIMEOUT:
            setLocationError("Location request timed out.")
            break
          default:
            setLocationError("An unknown error occurred.")
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
        className="flex items-center justify-center bg-gray-100 rounded-lg border"
        style={{ height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {showCurrentLocation && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Navigation className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              {currentLocation
                ? `Current location: ${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`
                : "Get your current location for easier shop registration"
              }
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={getCurrentLocation}
            disabled={gettingLocation}
            className="text-blue-600 border-blue-300 hover:bg-blue-100"
          >
            {gettingLocation ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Getting...
              </>
            ) : (
              <>
                <MapPin className="h-3 w-3 mr-1" />
                Use Current Location
              </>
            )}
          </Button>
        </div>
      )}

      {locationError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{locationError}</p>
        </div>
      )}

      <div style={{ height }} className="rounded-lg overflow-hidden border">
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
              <Popup>Your Shop Location</Popup>
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
                <div className="p-2">
                  <h3 className="font-semibold text-lg">{shop.shopName}</h3>
                  {shop.ownerName && (
                    <p className="text-sm text-gray-600">Owner: {shop.ownerName}</p>
                  )}
                  {shop.address && (
                    <p className="text-sm text-gray-600 mt-1">{shop.address}</p>
                  )}
                  <p className={`text-sm font-medium mt-2 ${shop.taxStatus === "paid" ? "text-green-600" : "text-red-600"
                    }`}>
                    Tax Status: {shop.taxStatus === "paid" ? "✅ Paid" : "❌ Unpaid"}
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
