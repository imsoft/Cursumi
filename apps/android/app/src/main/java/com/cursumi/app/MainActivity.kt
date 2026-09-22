package com.cursumi.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import com.cursumi.app.core.Config
import com.cursumi.app.core.ui.CursumiTheme
import com.cursumi.app.ui.Root
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        handleDeepLink(intent)
        setContent { CursumiTheme { Root() } }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    /** Vuelta del navegador tras entrar con Google: `mobile://?cookie=<Set-Cookie>`. */
    private fun handleDeepLink(intent: Intent?) {
        val uri = intent?.data ?: return
        if (uri.scheme != Config.SCHEME) return
        val app = CursumiApp.from(this)
        if (app.auth.completeGoogle(uri)) {
            lifecycleScope.launch { app.session.refresh() }
        }
    }
}
