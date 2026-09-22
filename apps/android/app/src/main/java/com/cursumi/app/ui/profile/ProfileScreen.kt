package com.cursumi.app.ui.profile

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import coil3.compose.AsyncImage
import com.cursumi.app.core.Formatting
import com.cursumi.app.core.model.MyProfile
import com.cursumi.app.core.model.ProfileUpdate
import com.cursumi.app.core.ui.AppCard
import com.cursumi.app.core.ui.Brand
import com.cursumi.app.core.ui.BrandTextField
import com.cursumi.app.core.ui.ErrorText
import com.cursumi.app.core.ui.StatRow
import com.cursumi.app.ui.LocalApp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.ByteArrayOutputStream

@Composable
fun MenuRow(label: String, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().clickable(onClick = onClick).padding(horizontal = 16.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(label, Modifier.weight(1f))
        Icon(Icons.Filled.KeyboardArrowRight, null, tint = Brand.muted)
    }
}

@Composable
fun MenuCard(title: String? = null, items: List<Pair<String, () -> Unit>>) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        if (title != null) Text(title, style = MaterialTheme.typography.labelLarge, color = Brand.muted, modifier = Modifier.padding(start = 4.dp))
        AppCard {
            items.forEachIndexed { i, (label, action) ->
                MenuRow(label, action)
                if (i < items.lastIndex) HorizontalDivider(color = Color.Gray.copy(alpha = 0.15f))
            }
        }
    }
}

@Composable
fun ProfileScreen(nav: NavController) {
    val app = LocalApp.current
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var profile by remember { mutableStateOf<MyProfile?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    var editing by remember { mutableStateOf(false) }
    var uploading by remember { mutableStateOf(false) }

    suspend fun load() { try { profile = app.student.profile() } catch (e: Exception) { error = "No se pudo cargar tu perfil." } }
    LaunchedEffect(Unit) { load() }

    val picker = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        if (uri == null) return@rememberLauncherForActivityResult
        scope.launch {
            uploading = true
            try {
                val jpeg = withContext(Dispatchers.IO) {
                    val bmp = context.contentResolver.openInputStream(uri)!!.use { BitmapFactory.decodeStream(it) }
                    val scale = minOf(1f, 800f / maxOf(bmp.width, bmp.height))
                    val scaled = if (scale < 1f) Bitmap.createScaledBitmap(bmp, (bmp.width * scale).toInt(), (bmp.height * scale).toInt(), true) else bmp
                    ByteArrayOutputStream().also { scaled.compress(Bitmap.CompressFormat.JPEG, 70, it) }.toByteArray()
                }
                app.student.uploadAvatar(jpeg); load()
            } catch (e: Exception) { error = "No se pudo actualizar la foto." }
            uploading = false
        }
    }

    val name = profile?.fullName ?: app.session.user?.name ?: "Usuario"
    val email = profile?.email ?: app.session.user?.email ?: ""
    val role = profile?.role

    Column(Modifier.fillMaxSize()) {
        Column(
            Modifier.fillMaxWidth().clip(androidx.compose.foundation.shape.RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp)).background(Brand.gradient)
                .padding(start = 20.dp, end = 20.dp, top = 44.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            Text("Perfil", color = Color.White, fontSize = 30.sp, fontWeight = FontWeight.ExtraBold)
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                Box(Modifier.size(64.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.25f)).clickable(enabled = !uploading) { picker.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) }, contentAlignment = Alignment.Center) {
                    val avatar = profile?.avatar
                    if (avatar != null) AsyncImage(avatar, null, Modifier.fillMaxSize(), contentScale = ContentScale.Crop)
                    else Text(Formatting.initials(name), color = Color.White, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                }
                Column {
                    Text(name, color = Color.White, fontWeight = FontWeight.Bold)
                    Text(email, color = Color.White.copy(alpha = 0.85f), style = MaterialTheme.typography.bodySmall)
                    Text(if (uploading) "Subiendo foto…" else "Toca la foto para cambiarla", color = Color.White.copy(alpha = 0.7f), style = MaterialTheme.typography.labelSmall)
                }
            }
        }
        LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            profile?.let { p -> item { StatRow("${p.coursesInProgress}" to "En progreso", "${p.coursesCompleted}" to "Completados") } }
            item { ErrorText(error) }
            if (role == "instructor" || role == "admin") item {
                MenuCard("Instructor", listOf(
                    "Panel de instructor" to { nav.navigate("instructor") },
                    "Perfil de instructor" to { nav.navigate("instructor-account") },
                    "Crear curso" to { nav.navigate("create-course") },
                    "Hostear juegos" to { nav.navigate("host-games") },
                    "Pizarrón" to { nav.navigate("whiteboard") },
                    "Plantillas" to { nav.navigate("templates") },
                ))
            }
            if (role == "admin") item { MenuCard("Administración", listOf("Administración" to { nav.navigate("admin") })) }
            item {
                MenuCard(null, listOf(
                    "Notificaciones" to { nav.navigate("notifications") },
                    "Certificados" to { nav.navigate("certificates") },
                    "Lista de deseos" to { nav.navigate("wishlist") },
                    "Mis notas" to { nav.navigate("notes") },
                    "Unirse a un juego" to { nav.navigate("games") },
                    "Referidos" to { nav.navigate("referral") },
                    "Materiales de mi empresa" to { nav.navigate("org-materials") },
                    "Blog" to { nav.navigate("blog") },
                    "Para empresas" to { nav.navigate("business") },
                ))
            }
            item {
                MenuCard(null, buildList {
                    add("Editar perfil" to { editing = true })
                    add("Configuración" to { nav.navigate("settings") })
                    if (role == "student") add("Conviértete en instructor" to { nav.navigate("become-instructor") })
                })
            }
            item { TextButton(onClick = { scope.launch { app.session.signOut() } }, modifier = Modifier.fillMaxWidth()) { Text("Cerrar sesión", color = Brand.danger) } }
            item { Spacer(Modifier.height(24.dp)) }
        }
    }

    profile?.let { p -> if (editing) EditProfileDialog(p, onDismiss = { editing = false }, onSaved = { scope.launch { load() } }) }
}

@Composable
private fun EditProfileDialog(profile: MyProfile, onDismiss: () -> Unit, onSaved: () -> Unit) {
    val app = LocalApp.current
    val scope = rememberCoroutineScope()
    var fullName by remember { mutableStateOf(profile.fullName) }
    var phone by remember { mutableStateOf(profile.phone) }
    var city by remember { mutableStateOf(profile.city) }
    var state by remember { mutableStateOf(profile.state) }
    var bio by remember { mutableStateOf(profile.bio) }
    var website by remember { mutableStateOf(profile.website) }
    var linkedin by remember { mutableStateOf(profile.linkedinUrl) }
    var instagram by remember { mutableStateOf(profile.instagramUrl) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Editar perfil") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                BrandTextField(fullName, { fullName = it }, "Nombre completo")
                BrandTextField(phone, { phone = it }, "Teléfono")
                BrandTextField(city, { city = it }, "Ciudad")
                BrandTextField(state, { state = it }, "Estado")
                BrandTextField(bio, { bio = it }, "Bio", singleLine = false, minLines = 2)
                BrandTextField(website, { website = it }, "Sitio web")
                BrandTextField(linkedin, { linkedin = it }, "LinkedIn (URL)")
                BrandTextField(instagram, { instagram = it }, "Instagram (URL)")
                ErrorText(error)
            }
        },
        confirmButton = {
            TextButton(enabled = !saving, onClick = {
                scope.launch {
                    saving = true; error = null
                    try {
                        app.student.updateProfile(ProfileUpdate(fullName.trim().ifEmpty { null }, phone.trim(), state.trim(), city.trim(), bio.trim(), website.trim(), linkedin.trim(), instagram.trim()))
                        onSaved(); onDismiss()
                    } catch (e: Exception) { error = e.message }
                    saving = false
                }
            }) { Text(if (saving) "Guardando…" else "Guardar") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Cancelar") } },
    )
}
