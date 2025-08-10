// Extend Leaflet's IconDefault type
import "leaflet";

declare module "leaflet" {
    namespace Icon {
        interface Default {
            _getIconUrl?: () => string;
        }
    }
}
