"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

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
}

// Component to handle map clicks
function LocationMarker({ onLocationSelect }: { onLocationSelect?: (location: { lat: number; lng: number }) => void }) {
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

  return position === null ? null : (
    <Marker position={[position.lat, position.lng]}>
      <Popup>Selected Location</Popup>
    </Marker>
  )
}

export function MapComponent({
  onLocationSelect,
  selectedLocation,
  shops = [],
  center = { lat: 28.6139, lng: 77.209 }, // Default to Delhi
  zoom = 10,
  height = "400px",
}: MapComponentProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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
    <div style={{ height }} className="rounded-lg overflow-hidden border">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Location selection marker */}
        {onLocationSelect && <LocationMarker onLocationSelect={onLocationSelect} />}

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
  )
}
