package com.cursumi.app

import android.app.Application
import android.content.Context
import com.cursumi.app.core.api.AdminApi
import com.cursumi.app.core.api.ApiClient
import com.cursumi.app.core.api.InstructorApi
import com.cursumi.app.core.api.SocialApi
import com.cursumi.app.core.api.StudentApi
import com.cursumi.app.core.auth.AuthService
import com.cursumi.app.core.auth.CookieJar
import com.cursumi.app.core.auth.SessionStore

/** Composición de dependencias de la app (sin framework de DI: son 6 objetos). */
class CursumiApp : Application() {
    lateinit var api: ApiClient; private set
    lateinit var auth: AuthService; private set
    lateinit var session: SessionStore; private set
    lateinit var student: StudentApi; private set
    lateinit var social: SocialApi; private set
    lateinit var instructor: InstructorApi; private set
    lateinit var admin: AdminApi; private set

    override fun onCreate() {
        super.onCreate()
        // La cookie de sesión vive en preferencias privadas de la app (sandbox de Android).
        val prefs = getSharedPreferences("cursumi_auth", Context.MODE_PRIVATE)
        val jar = CookieJar(
            read = { prefs.getString("cookie", null) },
            write = { prefs.edit().putString("cookie", it).apply() },
        )
        api = ApiClient(jar)
        auth = AuthService(api)
        session = SessionStore(auth)
        student = StudentApi(api)
        social = SocialApi(api)
        instructor = InstructorApi(api)
        admin = AdminApi(api)
    }

    companion object {
        fun from(context: Context): CursumiApp = context.applicationContext as CursumiApp
    }
}
