import SwiftUI
import WebKit

/// Planeación didáctica del instructor: reutiliza los editores de la web dentro
/// de un WKWebView. La carga inicial va a `/api/mobile/planning-bridge` con la
/// cookie de sesión; ese endpoint la re-emite con `Set-Cookie` para que quede en
/// el jar del WebView y redirige a la página real.
///
/// La web detecta `window.ReactNativeWebView` para ocultar su chrome y para
/// entregar el PDF por `postMessage`; aquí inyectamos ese objeto y lo conectamos
/// al handler nativo, así no hace falta tocar la web.
struct PlanningWebView: View {
    let courseId: String

    @State private var loading = true
    @State private var pdfURL: URL?
    @State private var error: String?

    var body: some View {
        ZStack {
            PlanningWebContainer(courseId: courseId, loading: $loading, pdfURL: $pdfURL, error: $error)
            if loading { ProgressView().scaleEffect(1.4) }
        }
        .navigationTitle("Planeación didáctica")
        .navigationBarTitleDisplayMode(.inline)
        .safeAreaInset(edge: .top) {
            if let error {
                Text(error).font(.footnote).foregroundStyle(Brand.danger)
                    .frame(maxWidth: .infinity).padding(10).background(Brand.danger.opacity(0.1))
            }
        }
        .sheet(item: $pdfURL) { url in
            ShareSheet(items: [url])
        }
    }
}

private struct PlanningWebContainer: UIViewRepresentable {
    let courseId: String
    @Binding var loading: Bool
    @Binding var pdfURL: URL?
    @Binding var error: String?

    func makeCoordinator() -> Coordinator { Coordinator(self) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        let bridge = """
        window.ReactNativeWebView = {
          postMessage: function (m) { window.webkit.messageHandlers.cursumi.postMessage(String(m)); }
        };
        """
        config.userContentController.addUserScript(WKUserScript(source: bridge, injectionTime: .atDocumentStart, forMainFrameOnly: false))
        config.userContentController.add(context.coordinator, name: "cursumi")
        let view = WKWebView(frame: .zero, configuration: config)
        view.navigationDelegate = context.coordinator

        var components = URLComponents(url: Config.apiURL.appendingPathComponent("api/mobile/planning-bridge"), resolvingAgainstBaseURL: false)!
        components.queryItems = [URLQueryItem(name: "redirect", value: "/instructor/courses/\(courseId)/planning")]
        var req = URLRequest(url: components.url!)
        if let cookie = APIClient.shared.jar.cookieHeader { req.setValue(cookie, forHTTPHeaderField: "Cookie") }
        view.load(req)
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "cursumi")
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        let parent: PlanningWebContainer
        init(_ parent: PlanningWebContainer) { self.parent = parent }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { parent.loading = false }
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { parent.loading = false }

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
                parent.pdfURL = url
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
