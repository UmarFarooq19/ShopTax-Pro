"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, Loader2 } from 'lucide-react'

interface AddressSearchProps {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
    placeholder?: string
    className?: string
}

interface SearchResult {
    display_name: string
    lat: string
    lon: string
    place_id: string
}

export function AddressSearch({ onLocationSelect, placeholder = "Search for an address...", className }: AddressSearchProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)

    useEffect(() => {
        const searchTimeout = setTimeout(() => {
            if (query.length > 2) {
                searchAddress(query)
            } else {
                setResults([])
                setShowResults(false)
            }
        }, 500)

        return () => clearTimeout(searchTimeout)
    }, [query])

    const searchAddress = async (searchQuery: string) => {
        setLoading(true)
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=pk,in,us,gb,ca,au,de,fr,jp,cn,br,mx,za,ng,eg,tr,sa,ae,bd,id`
            )
            const data = await response.json()
            setResults(data)
            setShowResults(true)
        } catch (error) {
            console.error("Error searching address:", error)
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    const handleSelectResult = (result: SearchResult) => {
        const location = {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            address: result.display_name
        }
        onLocationSelect(location)
        setQuery(result.display_name)
        setShowResults(false)
    }

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                {loading && (
                    <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 animate-spin" />
                )}
            </div>

            {showResults && results.length > 0 && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border-0 bg-white">
                    <CardContent className="p-0 max-h-60 overflow-y-auto">
                        {results.map((result) => (
                            <button
                                key={result.place_id}
                                onClick={() => handleSelectResult(result)}
                                className="w-full text-left p-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {result.display_name.split(',')[0]}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {result.display_name}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </CardContent>
                </Card>
            )}

            {showResults && results.length === 0 && !loading && query.length > 2 && (
                <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border-0 bg-white">
                    <CardContent className="p-4 text-center text-gray-500">
                        <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No locations found for "{query}"</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
