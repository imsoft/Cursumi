import SwiftUI
import WebKit

/// Widget de Cloudflare Turnstile dentro de un WKWebView. Entrega el token
/// `cf-turnstile-response` que el servidor exige en el registro.
struct TurnstileView: UIViewRepresentable {
    let onToken: (String) -> Void
    let onError: () -> Void

    func makeCoordinator() -> Coordinator { Coordinator(onToken: onToken, onError: onError) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.userContentController.add(context.coordinator, name: "cursumi")
        let view = WKWebView(frame: .zero, configuration: config)
        view.isOpaque = false
        view.backgroundColor = .clear
        view.scrollView.isScrollEnabled = false
        // baseURL con el dominio real: el site key solo acepta hostnames de Cursumi.
        view.loadHTMLString(Self.html, baseURL: URL(string: "https://cursumi.com"))
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "cursumi")
    }

    final class Coordinator: NSObject, WKScriptMessageHandler {
        let onToken: (String) -> Void
        let onError: () -> Void
        init(onToken: @escaping (String) -> Void, onError: @escaping () -> Void) {
            self.onToken = onToken
            self.onError = onError
        }
        func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
            guard let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
            if type == "token", let token = body["token"] as? String {
                onToken(token)
            } else {
                onError()
            }
        }
    }

    private static let html = """
    <!DOCTYPE html><html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <style>html, body { margin: 0; padding: 0; background: transparent; }
      .wrap { display: flex; justify-content: center; padding: 4px 0; }</style>
    </head><body>
    <div class="wrap"><div class="cf-turnstile" data-sitekey="\(Config.turnstileSiteKey)"
      data-callback="onSuccess" data-error-callback="onError" data-theme="light"></div></div>
    <script>
      function post(msg) { window.webkit.messageHandlers.cursumi.postMessage(msg); }
      function onSuccess(token) { post({ type: "token", token: token }); }
      function onError() { post({ type: "error" }); }
    </script></body></html>
    """
}

/// Renderiza HTML (contenido de lección) o una URL (YouTube) y reporta su altura.
struct HTMLView: UIViewRepresentable {
    enum Source {
        case html(String)
        case url(URL)
    }

    let source: Source
    @Binding var height: CGFloat

    func makeCoordinator() -> Coordinator { Coordinator(height: $height) }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        let view = WKWebView(frame: .zero, configuration: config)
        view.navigationDelegate = context.coordinator
        view.isOpaque = false
        view.backgroundColor = .clear
        view.scrollView.isScrollEnabled = false
        load(view)
        return view
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    private func load(_ view: WKWebView) {
        switch source {
        case .html(let html):
            view.loadHTMLString(html, baseURL: URL(string: "https://cursumi.com"))
        case .url(let url):
            view.load(URLRequest(url: url))
        }
    }

    final class Coordinator: NSObject, WKNavigationDelegate {
        @Binding var height: CGFloat
        init(height: Binding<CGFloat>) { _height = height }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            webView.evaluateJavaScript("document.documentElement.scrollHeight") { [self] result, _ in
                if let value = result as? CGFloat, value > 0 { height = value }
            }
        }
    }
}
