package com.cursumi.app.ui

import android.net.Uri
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.staticCompositionLocalOf
import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.cursumi.app.core.PushManager
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.PaddingValues
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.cursumi.app.CursumiApp
import com.cursumi.app.core.auth.SessionStore
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.ui.admin.AdminHome
import com.cursumi.app.ui.admin.AdminSection
import com.cursumi.app.ui.auth.AuthScreen
import com.cursumi.app.ui.catalog.CatalogScreen
import com.cursumi.app.ui.courses.ChatScreen
import com.cursumi.app.ui.courses.CourseDetailScreen
import com.cursumi.app.ui.courses.ExamScreen
import com.cursumi.app.ui.courses.LessonScreen
import com.cursumi.app.ui.courses.MyCoursesScreen
import com.cursumi.app.ui.instructor.BusinessScreen
import com.cursumi.app.ui.instructor.ControlGameScreen
import com.cursumi.app.ui.instructor.CourseCreatorScreen
import com.cursumi.app.ui.instructor.CreateGameScreen
import com.cursumi.app.ui.instructor.HostGamesScreen
import com.cursumi.app.ui.instructor.InstructorAccountScreen
import com.cursumi.app.ui.instructor.InstructorScreen
import com.cursumi.app.ui.instructor.PlanningScreen
import com.cursumi.app.ui.instructor.TemplatesScreen
import com.cursumi.app.ui.instructor.ThreadScreen
import com.cursumi.app.ui.instructor.WhiteboardScreen
import com.cursumi.app.ui.profile.BecomeInstructorScreen
import com.cursumi.app.ui.profile.BlogReaderScreen
import com.cursumi.app.ui.profile.BlogScreen
import com.cursumi.app.ui.profile.CertificatesScreen
import com.cursumi.app.ui.profile.GamesScreen
import com.cursumi.app.ui.profile.NotesScreen
import com.cursumi.app.ui.profile.NotificationsScreen
import com.cursumi.app.ui.profile.OrgMaterialsScreen
import com.cursumi.app.ui.profile.ProfileScreen
import com.cursumi.app.ui.profile.ReferralScreen
import com.cursumi.app.ui.profile.SettingsScreen
import com.cursumi.app.ui.profile.WishlistScreen

/** Acceso a la composición de la app desde cualquier pantalla. */
val LocalApp = staticCompositionLocalOf<CursumiApp> { error("Sin CursumiApp") }

/** Rutas de navegación. */
object Routes {
    const val MY_COURSES = "my-courses"
    const val CATALOG = "catalog"
    const val PROFILE = "profile"
    fun course(id: String) = "course/${Uri.encode(id)}"
    fun lesson(id: String) = "lesson/${Uri.encode(id)}"
    fun exam(courseId: String) = "exam/${Uri.encode(courseId)}"
    fun chat(courseId: String) = "chat/${Uri.encode(courseId)}"
    fun thread(id: String, title: String) = "thread/${Uri.encode(id)}?title=${Uri.encode(title)}"
    fun planning(courseId: String) = "planning/${Uri.encode(courseId)}"
    fun controlGame(id: String) = "host-game/${Uri.encode(id)}"
    fun blogPost(slug: String) = "blog/${Uri.encode(slug)}"
    fun admin(section: String) = "admin/$section"
}

@Composable
fun Root() {
    val app = CursumiApp.from(LocalContext.current)
    CompositionLocalProvider(LocalApp provides app) {
        val session = app.session
        LaunchedEffect(Unit) { session.restore() }
        when (session.state) {
            SessionStore.State.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = Brand.primary) }
            SessionStore.State.SignedOut -> AuthScreen()
            is SessionStore.State.SignedIn -> AppNav()
        }
    }
}

private data class Tab(val route: String, val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector)

private val tabs = listOf(
    Tab(Routes.MY_COURSES, "Mis cursos", Icons.Filled.Home),
    Tab(Routes.CATALOG, "Explorar", Icons.Filled.Search),
    Tab(Routes.PROFILE, "Perfil", Icons.Filled.Person),
)

@Composable
fun AppNav() {
    val nav: NavHostController = rememberNavController()
    val context = LocalContext.current
    // Push: en Android 13+ hay que pedir permiso; después se registra el token de FCM.
    val askPermission = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        if (granted) PushManager.register(context)
    }
    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            askPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        } else {
            PushManager.register(context)
        }
    }
    val backStack by nav.currentBackStackEntryAsState()
    val current = backStack?.destination?.route
    val showBar = tabs.any { it.route == current }

    Scaffold(bottomBar = {
        if (showBar) NavigationBar {
            tabs.forEach { tab ->
                NavigationBarItem(
                    selected = current == tab.route,
                    onClick = {
                        nav.navigate(tab.route) { popUpTo(Routes.MY_COURSES) { saveState = true }; launchSingleTop = true; restoreState = true }
                    },
                    icon = { Icon(tab.icon, contentDescription = tab.label) },
                    label = { Text(tab.label) },
                )
            }
        }
    }) { padding ->
        NavHost(nav, startDestination = Routes.MY_COURSES, modifier = Modifier.padding(if (showBar) padding else PaddingValues(0.dp))) {
            composable(Routes.MY_COURSES) { MyCoursesScreen(nav) }
            composable(Routes.CATALOG) { CatalogScreen() }
            composable(Routes.PROFILE) { ProfileScreen(nav) }
            composable("course/{id}") { CourseDetailScreen(nav, it.arg("id")) }
            composable("lesson/{id}") { LessonScreen(nav, it.arg("id")) }
            composable("exam/{courseId}") { ExamScreen(nav, it.arg("courseId")) }
            composable("chat/{courseId}") { ChatScreen(nav, it.arg("courseId")) }
            composable("thread/{id}?title={title}") { ThreadScreen(nav, it.arg("id"), it.arguments?.getString("title") ?: "Estudiante") }
            composable("planning/{courseId}") { PlanningScreen(nav, it.arg("courseId")) }
            composable("host-game/{id}") { ControlGameScreen(nav, it.arg("id")) }
            composable("blog/{slug}") { BlogReaderScreen(nav, it.arg("slug")) }
            composable("notifications") { NotificationsScreen(nav) }
            composable("certificates") { CertificatesScreen(nav) }
            composable("wishlist") { WishlistScreen(nav) }
            composable("notes") { NotesScreen(nav) }
            composable("games") { GamesScreen(nav) }
            composable("referral") { ReferralScreen(nav) }
            composable("org-materials") { OrgMaterialsScreen(nav) }
            composable("blog") { BlogScreen(nav) }
            composable("business") { BusinessScreen(nav) }
            composable("settings") { SettingsScreen(nav) }
            composable("become-instructor") { BecomeInstructorScreen(nav) }
            composable("instructor") { InstructorScreen(nav) }
            composable("instructor-account") { InstructorAccountScreen(nav) }
            composable("create-course") { CourseCreatorScreen(nav) }
            composable("host-games") { HostGamesScreen(nav) }
            composable("create-game") { CreateGameScreen(nav) }
            composable("whiteboard") { WhiteboardScreen(nav) }
            composable("templates") { TemplatesScreen(nav) }
            composable("admin") { AdminHome(nav) }
            composable("admin/{section}") { AdminSection(nav, it.arg("section")) }
        }
    }
}

private fun androidx.navigation.NavBackStackEntry.arg(key: String): String = Uri.decode(arguments?.getString(key) ?: "")
