package com.cursumi.app.core.api

import com.cursumi.app.core.Config
import com.cursumi.app.core.auth.CookieJar
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.serializer
import okhttp3.Call
import okhttp3.Callback
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrl
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import java.io.IOException
import java.util.concurrent.TimeUnit
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class ApiException(val status: Int, message: String?) : Exception(message ?: "HTTP $status")
class NetworkException(cause: Throwable) : Exception("No se pudo conectar. Revisa tu conexión.", cause)

/** JSON tolerante para toda la app. */
val AppJson = Json {
    ignoreUnknownKeys = true
    isLenient = true
    coerceInputValues = true
    explicitNulls = false
}

/**
 * Cliente HTTP hacia la API de Cursumi. Adjunta la cookie de sesión y las
 * cabecera que espera el plugin native-app del servidor. OkHttp no gestiona cookies:
 * así controlamos qué se guarda y la cookie nunca sale del dominio de Cursumi.
 */
class ApiClient(val jar: CookieJar, val baseUrl: String = Config.API_URL) {
    val http: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .followRedirects(false)
        .build()

    class ApiResponse(val status: Int, val body: String, val headers: okhttp3.Headers) {
        val isOk get() = status in 200..299
        inline fun <reified T> decode(): T = AppJson.decodeFromString(body)
        fun <T> decode(serializer: KSerializer<T>): T = AppJson.decodeFromString(serializer, body)

        /** Mensaje `{ error }` o `{ message }` del cuerpo, si lo hay. */
        val errorMessage: String?
            get() = runCatching {
                val obj = AppJson.parseToJsonElement(body) as? JsonObject
                (obj?.get("error") as? JsonPrimitive)?.content ?: (obj?.get("message") as? JsonPrimitive)?.content
            }.getOrNull()

        fun throwIfError(): ApiResponse {
            if (!isOk) throw ApiException(status, errorMessage)
            return this
        }
    }

    fun url(path: String, query: Map<String, String> = emptyMap()): HttpUrl {
        val b = "$baseUrl/${path.trimStart('/')}".toHttpUrl().newBuilder()
        query.forEach { (k, v) -> b.addQueryParameter(k, v) }
        return b.build()
    }

    suspend fun request(
        method: String,
        path: String,
        query: Map<String, String> = emptyMap(),
        jsonBody: JsonElement? = null,
        rawBody: RequestBody? = null,
        auth: Boolean = true,
    ): ApiResponse = withContext(Dispatchers.IO) {
        val builder = Request.Builder().url(url(path, query)).header("Accept", "application/json")
        if (auth) jar.cookieHeader()?.let { builder.header("Cookie", it) }
        if (path.trimStart('/').startsWith("api/auth/")) {
            // El plugin native-app del servidor copia esta cabecera a `Origin`.
            builder.header("x-native-origin", Config.ORIGIN)
        }
        val body: RequestBody? = when {
            jsonBody != null -> jsonBody.toString().toRequestBody("application/json".toMediaType())
            rawBody != null -> rawBody
            method == "POST" || method == "PATCH" || method == "PUT" -> "".toRequestBody(null)
            else -> null
        }
        builder.method(method, body)
        val response = try {
            http.newCall(builder.build()).await()
        } catch (e: IOException) {
            throw NetworkException(e)
        }
        response.use {
            jar.store(it.headers("Set-Cookie"), it.request.url)
            ApiResponse(it.code, it.body.string(), it.headers)
        }
    }

    suspend inline fun <reified T> get(path: String, query: Map<String, String> = emptyMap(), auth: Boolean = true): T =
        request("GET", path, query, auth = auth).throwIfError().decode()

    suspend inline fun <reified B, reified T> post(path: String, body: B): T =
        request("POST", path, jsonBody = AppJson.encodeToJsonElement(serializer<B>(), body)).throwIfError().decode()

    suspend inline fun <reified B> postUnit(path: String, body: B? = null) {
        request("POST", path, jsonBody = body?.let { AppJson.encodeToJsonElement(serializer<B>(), it) }).throwIfError()
    }

    suspend fun postEmpty(path: String) { request("POST", path).throwIfError() }

    suspend inline fun <reified B> patch(path: String, body: B? = null) {
        request("PATCH", path, jsonBody = body?.let { AppJson.encodeToJsonElement(serializer<B>(), it) }).throwIfError()
    }

    suspend inline fun <reified B> delete(path: String, body: B? = null) {
        request("DELETE", path, jsonBody = body?.let { AppJson.encodeToJsonElement(serializer<B>(), it) }).throwIfError()
    }
}

suspend fun Call.await(): Response = suspendCancellableCoroutine { cont ->
    enqueue(object : Callback {
        override fun onFailure(call: Call, e: IOException) { if (cont.isActive) cont.resumeWithException(e) }
        override fun onResponse(call: Call, response: Response) { cont.resume(response) }
    })
    cont.invokeOnCancellation { cancel() }
}
