import Foundation

enum Formatting {
    /// Precio en pesos mexicanos con sufijo explícito, igual que `formatPriceMXN`
    /// de `@cursumi/shared`: `$1,234 MXN`; 0 → "Gratis".
    static func priceMXN(_ price: Double, showDecimals: Bool = false) -> String {
        if price == 0 { return "Gratis" }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "es_MX")
        formatter.currencyCode = "MXN"
        formatter.currencySymbol = "$"
        formatter.minimumFractionDigits = showDecimals ? 2 : 0
        formatter.maximumFractionDigits = showDecimals ? 2 : 0
        let formatted = formatter.string(from: NSNumber(value: price)) ?? "$\(price)"
        return "\(formatted) MXN"
    }

    /// Iniciales para el avatar de respaldo ("Ana López" → "AL").
    static func initials(_ name: String) -> String {
        let parts = name.split(separator: " ").prefix(2)
        let letters = parts.compactMap { $0.first.map(String.init) }
        return letters.joined().uppercased()
    }
}

enum VideoSource: Equatable {
    /// HLS de Mux o mp4/HLS directo, reproducible con AVPlayer.
    case native(URL)
    /// YouTube: se reproduce embebido en un WebView.
    case youtube(id: String)

    /// Traduce la `videoUrl` de la lección a una fuente reproducible. Misma lógica
    /// que `nativeVideoSource` en `apps/mobile/src/components/lesson-view.tsx`.
    static func from(_ raw: String?) -> VideoSource? {
        guard let raw, !raw.isEmpty else { return nil }
        if let id = muxPlaybackId(raw) {
            return .native(URL(string: "https://stream.mux.com/\(id).m3u8")!)
        }
        if let id = youTubeId(raw) {
            return .youtube(id: id)
        }
        return URL(string: raw).map { .native($0) }
    }

    static func muxPlaybackId(_ url: String) -> String? {
        firstMatch(#"stream\.mux\.com/([^/.]+)"#, in: url)
    }

    static func youTubeId(_ url: String) -> String? {
        firstMatch(#"(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)([A-Za-z0-9_-]{11})"#, in: url)
    }

    private static func firstMatch(_ pattern: String, in text: String) -> String? {
        guard let regex = try? NSRegularExpression(pattern: pattern),
              let match = regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)),
              let range = Range(match.range(at: 1), in: text) else { return nil }
        return String(text[range])
    }
}

enum LessonContent {
    /// Envuelve el contenido de una lección (HTML o texto plano) en una página
    /// con estilos legibles. Misma lógica que `contentToHtml` de la app Expo.
    static func html(from content: String) -> String {
        let isHtml = content.contains("<")
        let body = isHtml ? content : content
            .replacingOccurrences(of: "&", with: "&amp;")
            .replacingOccurrences(of: "<", with: "&lt;")
            .replacingOccurrences(of: "\n", with: "<br/>")
        return """
        <!DOCTYPE html><html><head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
        <style>
          body { font-family: -apple-system, system-ui, sans-serif; font-size: 17px; line-height: 1.6;
                 color: #111827; padding: 4px 2px; margin: 0; }
          @media (prefers-color-scheme: dark) { body { color: #f3f4f6; } }
          img, video { max-width: 100%; height: auto; }
          a { color: #6d28d9; }
          pre, code { white-space: pre-wrap; word-break: break-word; }
        </style></head><body>\(body)</body></html>
        """
    }
}
