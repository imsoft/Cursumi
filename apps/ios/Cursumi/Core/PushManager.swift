import Foundation
import UIKit
import UserNotifications

/// Notificaciones push nativas (APNs).
///
/// Flujo: con sesión → pedir permiso → registrar en APNs → el sistema entrega el
/// token del dispositivo → se manda a `POST /api/me/push-token` con el prefijo
/// `apns:`. Al cerrar sesión se da de baja.
///
/// Requiere la capacidad Push Notifications (entitlement `aps-environment`) y un
/// dispositivo físico: el simulador no recibe push remoto.
@MainActor
final class PushManager: NSObject {
    static let shared = PushManager()
    private let api = APIClient.shared
    private var lastToken: String?

    private static let tokenKey = "cursumi_apns_token"

    /// Pide permiso y registra el dispositivo en APNs (idempotente).
    func register() async {
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        let settings = await center.notificationSettings()
        var granted = settings.authorizationStatus == .authorized || settings.authorizationStatus == .provisional
        if settings.authorizationStatus == .notDetermined {
            granted = (try? await center.requestAuthorization(options: [.alert, .badge, .sound])) ?? false
        }
        guard granted else { return }
        UIApplication.shared.registerForRemoteNotifications()
    }

    /// Llamado por el AppDelegate cuando APNs entrega el token.
    func didReceiveDeviceToken(_ data: Data) {
        let token = "apns:" + data.map { String(format: "%02x", $0) }.joined()
        lastToken = token
        UserDefaults.standard.set(token, forKey: Self.tokenKey)
        Task { await sync(token) }
    }

    private func sync(_ token: String) async {
        struct Body: Encodable { let token: String }
        _ = try? await api.request("POST", "api/me/push-token", json: Body(token: token))
    }

    /// Da de baja el token al cerrar sesión (antes de invalidar la cookie).
    func unregister() async {
        struct Body: Encodable { let token: String }
        guard let token = lastToken ?? UserDefaults.standard.string(forKey: Self.tokenKey) else { return }
        _ = try? await api.request("DELETE", "api/me/push-token", json: Body(token: token))
        UserDefaults.standard.removeObject(forKey: Self.tokenKey)
        lastToken = nil
    }
}

extension PushManager: UNUserNotificationCenterDelegate {
    /// Con la app en primer plano, mostrar la notificación igual.
    nonisolated func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        completionHandler([.banner, .list, .sound, .badge])
    }
}

/// Recibe el token de APNs; SwiftUI no expone ese callback.
final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        Task { @MainActor in PushManager.shared.didReceiveDeviceToken(deviceToken) }
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        // Simulador o sin entitlement: la app sigue sin push.
    }
}
