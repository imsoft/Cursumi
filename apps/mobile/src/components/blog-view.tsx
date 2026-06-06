import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getBlogPost, getBlogPosts, type BlogPost, type BlogPostSummary } from "@/lib/me";

const PURPLE = "#6d28d9";

function contentToHtml(content: string): string {
  const isHtml = content.includes("<");
  const body = isHtml
    ? content
    : content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br/>");
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
    <style>body{font-family:-apple-system,system-ui,sans-serif;font-size:17px;line-height:1.6;color:#111827;padding:4px 2px;margin:0}
    img{max-width:100%;height:auto;border-radius:8px}a{color:#6d28d9}pre,code{white-space:pre-wrap}</style>
    </head><body>${body}</body></html>`;
}

function Reader({ slug, onBack }: { slug: string; onBack: () => void }) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getBlogPost(slug)
      .then((p) => active && setPost(p))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Blog</ThemedText>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : post ? (
        <ScrollView contentContainerStyle={styles.readerScroll}>
          {post.coverImageUrl ? (
            <Image source={{ uri: post.coverImageUrl }} style={styles.cover} resizeMode="cover" />
          ) : null}
          <ThemedText type="title">{post.title}</ThemedText>
          {post.author?.name ? (
            <ThemedText style={styles.meta}>Por {post.author.name}</ThemedText>
          ) : null}
          <View style={styles.articleWrap}>
            <WebView
              originWhitelist={["*"]}
              source={{ html: contentToHtml(post.content), baseUrl: "https://cursumi.vercel.app" }}
              style={styles.articleWebview}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      ) : (
        <ThemedText style={styles.error}>No se pudo cargar el artículo.</ThemedText>
      )}
    </SafeAreaView>
  );
}

export function BlogView({ onBack }: { onBack: () => void }) {
  const [posts, setPosts] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getBlogPosts()
      .then((p) => active && setPosts(p))
      .catch(() => active && setError("No se pudo cargar el blog."))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  if (slug) return <Reader slug={slug} onBack={() => setSlug(null)} />;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
      </View>
      <ThemedText type="title" style={styles.heading}>
        Blog
      </ThemedText>

      {loading ? (
        <ActivityIndicator style={styles.loader} color={PURPLE} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(p) => p.slug}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <ThemedText style={styles.empty}>{error ?? "No hay artículos por ahora."}</ThemedText>
          }
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.7} onPress={() => setSlug(item.slug)}>
              <ThemedView style={styles.card}>
                {item.coverImageUrl ? (
                  <Image source={{ uri: item.coverImageUrl }} style={styles.thumb} resizeMode="cover" />
                ) : null}
                <View style={styles.cardBody}>
                  <ThemedText type="subtitle" numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                  {item.excerpt ? (
                    <ThemedText style={styles.excerpt} numberOfLines={2}>
                      {item.excerpt}
                    </ThemedText>
                  ) : null}
                </View>
              </ThemedView>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: { paddingHorizontal: 16, paddingVertical: 8 },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600" },
  heading: { paddingHorizontal: 16, paddingBottom: 8 },
  loader: { marginTop: 40 },
  error: { padding: 16, color: "#dc2626" },
  list: { padding: 16, gap: 12, flexGrow: 1 },
  empty: { textAlign: "center", opacity: 0.7, paddingVertical: 60, paddingHorizontal: 24 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.2)",
    overflow: "hidden",
  },
  thumb: { width: "100%", height: 150, backgroundColor: "rgba(127,127,127,0.1)" },
  cardBody: { padding: 14, gap: 4 },
  excerpt: { opacity: 0.7, fontSize: 14 },
  readerScroll: { padding: 16, gap: 12 },
  cover: { width: "100%", height: 180, borderRadius: 12, backgroundColor: "rgba(127,127,127,0.1)" },
  meta: { opacity: 0.7, fontSize: 13 },
  articleWrap: { minHeight: 200 },
  articleWebview: { flex: 1, minHeight: 300, backgroundColor: "transparent" },
});
