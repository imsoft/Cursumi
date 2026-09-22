# kotlinx.serialization
-keepclassmembers class kotlinx.serialization.json.** { *** Companion; }
-keepclasseswithmembers class com.cursumi.app.** { kotlinx.serialization.KSerializer serializer(...); }
-keep,includedescriptorclasses class com.cursumi.app.**$$serializer { *; }
-keepclassmembers class com.cursumi.app.** { *** Companion; }
# Interfaz JS del WebView de planeación
-keepclassmembers class * { @android.webkit.JavascriptInterface <methods>; }
