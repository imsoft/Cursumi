package com.cursumi.app.core.auth

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.cursumi.app.core.api.NetworkException

/** Estado global de la sesión. Equivale a `useSession()` de la app Expo. */
class SessionStore(private val auth: AuthService) {
    sealed interface State {
        data object Loading : State
        data object SignedOut : State
        data class SignedIn(val user: SessionUser) : State
    }

    var state: State by mutableStateOf(State.Loading)
        private set

    val user: SessionUser? get() = (state as? State.SignedIn)?.user

    /** Al arrancar: si hay cookie guardada, valida la sesión contra el servidor. */
    suspend fun restore() {
        if (!auth.api.jar.hasSession()) { state = State.SignedOut; return }
        state = try {
            val info = auth.currentSession()
            if (info != null) State.SignedIn(info.user) else { auth.api.jar.clear(); State.SignedOut }
        } catch (_: NetworkException) {
            // Sin red: conservamos la cookie; las pantallas mostrarán su error al cargar.
            State.SignedIn(SessionUser(id = ""))
        } catch (_: Exception) {
            auth.api.jar.clear(); State.SignedOut
        }
    }

    /** Tras un login exitoso: carga el usuario y cambia a SignedIn. */
    suspend fun refresh() {
        runCatching { auth.currentSession() }.getOrNull()?.let { state = State.SignedIn(it.user) }
    }

    suspend fun signOut() {
        auth.signOut()
        state = State.SignedOut
    }
}
