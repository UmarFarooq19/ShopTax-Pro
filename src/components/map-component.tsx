"use client"

import { useEffect, useRef, useState } from "react"

interface MapComponentProps {
    onLocationSelect?: (location: { lat: number; lng: number }) => void
    selectedLocation?: { lat: number; lng: number } | null
    shops?: Array<{
        id: string
        shopName: string
        location: { lat: number; lng: number }
        taxStatus: "paid" | "unpaid"
    }>
    center?: { lat: number; lng: number }
    zoom?: number
}

export function MapComponent({
    onLocationSelect,
    selectedLocation,
    shops = [],
    center = { lat: 28.6139, lng: 77.209 }, // Default to Delhi
    zoom = 10,
}: MapComponentProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)
    const markerRef = useRef<any>(null)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (!isClient || !mapRef.current) return

        // Dynamically import Leaflet only on client side
        const initMap = async () => {
            const L = (await import("leaflet")).default

            // Import CSS
            await import("leaflet/dist/leaflet.css")

            // Fix for default markers in Leaflet
            delete (L.Icon.Default.prototype as any)._getIconUrl
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
                iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
                shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
            })

            // Initialize map
            const map = L.map(mapRef.current!).setView([center.lat, center.lng], zoom)
            mapInstanceRef.current = map

            // Add tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
            }).addTo(map)

            // Add click handler for location selection
            if (onLocationSelect) {
                map.on("click", (e: any) => {
                    const { lat, lng } = e.latlng
                    onLocationSelect({ lat, lng })

                    // Remove existing marker
                    if (markerRef.current) {
                        map.removeLayer(markerRef.current)
                    }

                    // Add new marker
                    markerRef.current = L.marker([lat, lng]).addTo(map)
                })
            }

            // Add shop markers
            shops.forEach((shop) => {
                const icon = L.divIcon({
                    className: "custom-marker",
                    html: `<div class="w-6 h-6 rounded-full border-2 border-white shadow-lg ${shop.taxStatus === "paid" ? "bg-green-500" : "bg-red-500"
                        }"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                })

                L.marker([shop.location.lat, shop.location.lng], { icon })
                    .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${shop.shopName}</h3>
              <p class="text-sm ${shop.taxStatus === "paid" ? "text-green-600" : "text-red-600"}">
                Tax Status: ${shop.taxStatus === "paid" ? "Paid" : "Unpaid"}
              </p>
            </div>
          `)
                    .addTo(map)
            })

            // Update marker when selectedLocation changes
            if (selectedLocation) {
                // Remove existing marker
                if (markerRef.current) {
                    map.removeLayer(markerRef.current)
                }

                // Add new marker
                markerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng]).addTo(map)

                // Center map on selected location
                map.setView([selectedLocation.lat, selectedLocation.lng], 15)
            }
        }

        initMap()

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
            }
        }
    }, [isClient, center.lat, center.lng, zoom, shops, selectedLocation])

    if (!isClient) {
        return (
            <div className="leaflet-container flex items-center justify-center bg-gray-100">
                <div className="text-gray-500">Loading map...</div>
            </div>
        )
    }

    return <div ref={mapRef} className="leaflet-container" />
}
