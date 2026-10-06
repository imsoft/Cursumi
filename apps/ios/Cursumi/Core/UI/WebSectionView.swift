import SwiftUI
import WebKit

/// Sección de la web abierta con la sesión del usuario dentro de un WKWebView.
/// La carga inicial va a `/api/mobile/planning-bridge?redirect=<path>` con la
/// cookie de sesión; ese endpoint la re-emite con `Set-Cookie` para que quede en
/// el jar del WebView y redirige a la página real.
///
/// La web detecta `window.CursumiNative` para ocultar su chrome y para entregar
/// archivos por `postMessage` (hoy el PDF de la planeación didáctica); aquí
/// inyectamos ese objeto y lo conectamos al handler nativo.
struct WebSectionView: View {
    /// Ruta dentro de la web, p. ej. `/instructor/blog` o `/gobernanza`.
    let path: String
    let title: String

    @State private var loading = true
    @State private var fileURL: URL?
    @State private var error: String?

    var body: some View {
        ZStack {
            WebSectionContainer(path: path, loading: $loading, fileURL: $fileURL, error: $error)
            if loading { ProgressView().scaleEffect(1.4) }
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .top) {
            if let error {
                Text(error).font(.footnote).foregroundStyle(Brand.danger)
                    .frame(maxWidth: .infinity).padding(10).background(Brand.danger.opacity(0.1))
            }
        }
        .sheet(item: $fileURL) { url in
            ShareSheet(items: [url])
        }
    }

    /// URL del puente con sesión para una ruta de la web.
    static func bridgeURL(for path: String) -> URL {
        var components = URLComponents(url: Config.apiURL.appendingPathComponent("api/mobile/planning-bridge"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "redirect", value: path)]
        return components.url!
    }
}

private struct WebSectionContainer: UIViewRepresentable {
    let path: String
    @Binding var loading: Bool
    @Binding var fileURL: URL?
    @Binding var error: String?

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        let bridge = """
        window.CursumiNative = {
          postMessage: function (m) { window.webkit.messageHandlers.cursumi.postMessage(String(m)); }
        };
        """
        config.userContentController.addUserScript(WKUserScript(source: bridge, injectionTime: .atDocumentStart, forMainFrameOnly: false))
        config.userContentController.add(context.coordinator, name: "cursumi")
        let view = WKWebView(frame: .zero, configuration: config)
        view.navigationDelegate = context.coordinator

        var req = URLRequest(url: WebSectionView.bridgeURL(for: path))
        if let cookie = APIClient.shared.jar.cookieHeader { req.setValue(cookie, forHTTPHeaderField: "Cookie") }
        view.load(req)
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "cursumi")
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        let parent: WebSectionContainer
        init(_ parent: WebSectionContainer) { self.parent = parent }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { parent.loading = false }
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            parent.loading = false
            parent.error = "No se pudo cargar la página. Revisa tu conexión."
        }
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            parent.loading = false
            // -999 = cancelada por una nueva navegación (redirect del puente): no es error.
            if (error as NSError).code == NSURLErrorCancelled { return }
            parent.error = "No se pudo cargar la página. Revisa tu conexión."
        }

        /// Mensajes de la web: `{ type: "planning-pdf", base64, filename }` entrega un PDF para compartir.
        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let raw = message.body as? String,
                  let data = raw.data(using: .utf8),
                  let payload = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  payload["type"] as? String == "planning-pdf",
                  let base64 = payload["base64"] as? String,
                  let pdf = Data(base64Encoded: base64) else { return }
            let rawName = (payload["filename"] as? String) ?? "documento.pdf"
            let name = rawName.replacingOccurrences(of: #"[\\/:*?"<>|]"#, with: "", options: .regularExpression)
            let url = FileManager.default.temporaryDirectory.appendingPathComponent(name.isEmpty ? "documento.pdf" : name)
            do {
                try pdf.write(to: url, options: .atomic)
                parent.fileURL = url
            } catch {
                parent.error = "No se pudo guardar el PDF. Inténtalo de nuevo."
            }
        }
    }
}

/// Hoja nativa de compartir (para el PDF).
struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }
    func updateUIViewController(_ controller: UIActivityViewController, context: Context) {}
}
