package com.cursumi.app.core

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.cursumi.app.CursumiApp
import com.cursumi.app.MainActivity
import com.cursumi.app.R
import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import kotlinx.serialization.Serializable

/**
 * Notificaciones push nativas (Firebase Cloud Messaging).
 *
 * Flujo: con sesión → pedir permiso (Android 13+) → pedir el token a FCM → mandarlo
 * a `POST /api/me/push-token` con el prefijo `fcm:`. Al cerrar sesión se da de baja.
 * Si FCM rota el token, [CursumiMessagingService.onNewToken] lo vuelve a registrar.
 */
object PushManager {
    const val CHANNEL_ID = "default"
    private const val PREF_TOKEN = "fcm_token"
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    @Serializable private data class TokenBody(val token: String)

    fun ensureChannel(context: Context) {
        val manager = context.getSystemService(NotificationManager::class.java)
        if (manager.getNotificationChannel(CHANNEL_ID) == null) {
            manager.createNotificationChannel(NotificationChannel(CHANNEL_ID, "Notificaciones", NotificationManager.IMPORTANCE_DEFAULT))
        }
    }

    /** Pide el token a FCM y lo registra (idempotente). Llamar con sesión y permiso concedido. */
    fun register(context: Context) {
        ensureChannel(context)
        scope.launch {
            val token = runCatching { FirebaseMessaging.getInstance().token.await() }.getOrNull() ?: return@launch
            sync(context, token)
        }
    }

    fun sync(context: Context, token: String) {
        val app = CursumiApp.from(context)
        if (!app.api.jar.hasSession()) return
        scope.launch {
            runCatching { app.api.postUnit("api/me/push-token", TokenBody("fcm:$token")) }
                .onSuccess { prefs(context).edit().putString(PREF_TOKEN, token).apply() }
        }
    }

    /** Da de baja el token al cerrar sesión (antes de invalidar la cookie). */
    suspend fun unregister(context: Context) {
        val token = prefs(context).getString(PREF_TOKEN, null) ?: return
        runCatching { CursumiApp.from(context).api.delete("api/me/push-token", TokenBody("fcm:$token")) }
        prefs(context).edit().remove(PREF_TOKEN).apply()
    }

    private fun prefs(context: Context) = context.getSharedPreferences("cursumi_push", Context.MODE_PRIVATE)
}

class CursumiMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) = PushManager.sync(this, token)

    /** Con la app en primer plano FCM no muestra nada por sí solo; lo hacemos aquí. */
    override fun onMessageReceived(message: RemoteMessage) {
        val title = message.notification?.title ?: message.data["title"] ?: return
        val body = message.notification?.body ?: message.data["body"] ?: ""
        PushManager.ensureChannel(this)
        val open = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            message.data["url"]?.let { putExtra("url", it) }
        }
        val pending = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val notification = NotificationCompat.Builder(this, PushManager.CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pending)
            .build()
        getSystemService(NotificationManager::class.java).notify(message.messageId?.hashCode() ?: 0, notification)
    }
}
