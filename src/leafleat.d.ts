import "leaflet"

declare module "leaflet" {
    interface IconDefault {
        _getIconUrl?: () => string
    }
}