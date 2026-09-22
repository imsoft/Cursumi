import SwiftUI

/// Paleta de marca, alineada con los tokens de la web.
enum Brand {
    /// Morado principal (= web --primary).
    static let primary = Color(hex: 0x6D28D9)
    /// Morado profundo (cabeceras, fondos de marca).
    static let deep = Color(hex: 0x1F1147)
    /// Acento vívido (splash, gradientes, CTAs).
    static let vivid = Color(hex: 0x4F00F6)
    /// Magenta (extremo del gradiente).
    static let accent = Color(hex: 0xA400E3)

    static let success = Color(hex: 0x16A34A)
    static let danger = Color(hex: 0xDC2626)
    static let warning = Color(hex: 0xF59E0B)
    static let muted = Color(hex: 0x9CA3AF)

    /// Gradiente de marca (profundo → vívido → magenta).
    static let gradient = LinearGradient(
        colors: [deep, vivid, accent],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
}

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: opacity
        )
    }
}
