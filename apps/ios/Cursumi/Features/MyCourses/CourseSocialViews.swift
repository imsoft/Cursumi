import SwiftUI

/// Mensajes con el instructor del curso. Sondea cada 5 s, como la app Expo.
struct ChatView: View {
    let courseId: String

    @Environment(SessionStore.self) private var session
    @State private var conversationId: String?
    @State private var messages: [ChatMessage] = []
    @State private var loading = true
    @State private var error: String?
    @State private var text = ""
    @State private var sending = false
    private let api = SocialAPI()

    var body: some View {
        Group {
            if loading {
                ProgressView()
            } else if let error {
                EmptyState(title: error)
            } else {
                VStack(spacing: 0) {
                    ScrollViewReader { proxy in
                        ScrollView {
                            LazyVStack(spacing: 8) {
                                if messages.isEmpty {
                                    Text("Escríbele a tu instructor. Te responderá por aquí.")
                                        .foregroundStyle(.secondary).padding(.vertical, 40)
                                }
                                ForEach(messages) { message in
                                    bubble(message).id(message.id)
                                }
                            }
                            .padding(16)
                        }
                        .onChange(of: messages.count) { _, _ in
                            if let last = messages.last { withAnimation { proxy.scrollTo(last.id, anchor: .bottom) } }
                        }
                        .onAppear {
                            if let last = messages.last { proxy.scrollTo(last.id, anchor: .bottom) }
                        }
                    }
                    Divider()
                    HStack(alignment: .bottom, spacing: 8) {
                        TextField("Escribe un mensaje…", text: $text, axis: .vertical)
                            .lineLimit(1...5)
                            .padding(.horizontal, 16).padding(.vertical, 10)
                            .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.gray.opacity(0.3)))
                        Button { Task { await send() } } label: {
                            if sending { ProgressView().tint(.white) } else { Text("Enviar").bold() }
                        }
                        .padding(.horizontal, 18).padding(.vertical, 11)
                        .background(Brand.primary).foregroundStyle(.white)
                        .clipShape(Capsule())
                        .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty || sending)
                    }
                    .padding(12)
                }
            }
        }
        .navigationTitle("Mensajes")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            do {
                let c = try await api.conversation(courseId: courseId)
                conversationId = c.id
                messages = c.messages ?? []
                try? await api.markConversationRead(c.id)
            } catch {
                self.error = "No se pudo abrir el chat."
            }
            loading = false
        }
        .task(id: conversationId) {
            guard let conversationId else { return }
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(5))
                if let m = try? await api.messages(conversationId: conversationId) { messages = m }
            }
        }
    }

    private func bubble(_ message: ChatMessage) -> some View {
        let mine = message.senderId == session.user?.id
        return HStack {
            if mine { Spacer(minLength: 60) }
            VStack(alignment: .leading, spacing: 2) {
                if !mine {
                    Text(message.sender?.name ?? "Instructor").font(.caption2.weight(.semibold)).foregroundStyle(.secondary)
                }
                Text(message.body).foregroundStyle(mine ? .white : .primary)
            }
            .padding(.horizontal, 14).padding(.vertical, 10)
            .background(mine ? Brand.primary : Color.gray.opacity(0.15))
            .clipShape(UnevenRoundedRectangle(
                topLeadingRadius: 16, bottomLeadingRadius: mine ? 16 : 4,
                bottomTrailingRadius: mine ? 4 : 16, topTrailingRadius: 16
            ))
            if !mine { Spacer(minLength: 60) }
        }
    }

    private func send() async {
        let body = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !body.isEmpty, let conversationId else { return }
        text = ""
        sending = true
        defer { sending = false }
        do {
            messages.append(try await api.sendMessage(conversationId: conversationId, body: body))
        } catch {
            text = body // restaurar para reintentar
        }
    }
}

/// Notas del alumno para una lección (listar, agregar, borrar).
struct NotesSection: View {
    let courseId: String
    let lessonId: String

    @State private var notes: [Note] = []
    @State private var loading = true
    @State private var text = ""
    @State private var saving = false
    private let api = SocialAPI()

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Mis notas").font(.headline)
            HStack(alignment: .top, spacing: 8) {
                TextField("Escribe una nota…", text: $text, axis: .vertical)
                    .lineLimit(1...4)
                    .padding(12)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.3)))
                Button { Task { await add() } } label: {
                    Group { if saving { ProgressView().tint(.white) } else { Image(systemName: "plus").bold() } }
                        .frame(width: 44, height: 44)
                        .background(Brand.primary).foregroundStyle(.white)
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                }
                .disabled(saving || text.trimmingCharacters(in: .whitespaces).isEmpty)
            }
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            }
            ForEach(notes) { note in
                VStack(alignment: .leading, spacing: 6) {
                    Text(note.content)
                    Button("Eliminar", role: .destructive) { Task { await remove(note) } }
                        .font(.footnote.weight(.semibold))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2)))
            }
        }
        .task {
            notes = (try? await api.notes(courseId: courseId, lessonId: lessonId)) ?? []
            loading = false
        }
    }

    private func add() async {
        let content = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !content.isEmpty else { return }
        saving = true
        defer { saving = false }
        if let note = try? await api.createNote(courseId: courseId, lessonId: lessonId, content: content) {
            notes.insert(note, at: 0)
            text = ""
        }
    }

    private func remove(_ note: Note) async {
        notes.removeAll { $0.id == note.id }
        try? await api.deleteNote(note.id)
    }
}

/// "¿Qué aprendiste?": reflexiones de los alumnos del curso.
struct ReflectionsSection: View {
    let courseId: String

    @State private var items: [Reflection] = []
    @State private var text = ""
    @State private var saving = false
    @State private var error: String?
    @State private var done = false
    private let api = SocialAPI()

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("¿Qué aprendiste?").font(.headline)
            VStack(alignment: .leading, spacing: 10) {
                TextField("Comparte lo que te llevas de este curso…", text: $text, axis: .vertical)
                    .lineLimit(3...6)
                    .padding(12)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.3)))
                if let error { Text(error).foregroundStyle(Brand.danger).font(.subheadline) }
                if done { Text("¡Gracias por compartir!").foregroundStyle(Brand.success).font(.subheadline) }
                PrimaryButton(title: "Compartir", loading: saving) { Task { await submit() } }
            }
            .padding(16)
            .card()
            ForEach(items) { r in
                VStack(alignment: .leading, spacing: 4) {
                    Text(r.user?.name ?? "Estudiante").font(.subheadline.weight(.semibold))
                    Text(r.content).font(.subheadline)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2)))
            }
        }
        .task { items = (try? await api.reflections(courseId: courseId)) ?? [] }
    }

    private func submit() async {
        let content = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard content.count >= 10 else { error = "Escribe al menos 10 caracteres."; return }
        error = nil
        saving = true
        defer { saving = false }
        do {
            try await api.postReflection(courseId: courseId, content: content)
            done = true
            text = ""
            items = (try? await api.reflections(courseId: courseId)) ?? items
        } catch {
            self.error = error.localizedDescription
        }
    }
}

/// Reseñas del curso con promedio y formulario.
struct ReviewsSection: View {
    let courseId: String

    @State private var reviews: [Review] = []
    @State private var average = 0.0
    @State private var total = 0
    @State private var rating = 0
    @State private var comment = ""
    @State private var saving = false
    @State private var error: String?
    @State private var done = false
    private let api = SocialAPI()

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Reseñas").font(.headline)
                Spacer()
                if total > 0 {
                    Stars(value: average, size: 14)
                    Text(String(format: "%.1f · %d", average, total)).font(.footnote).foregroundStyle(.secondary)
                }
            }
            VStack(alignment: .leading, spacing: 10) {
                Text("Tu reseña").font(.subheadline.weight(.semibold))
                HStack(spacing: 6) {
                    ForEach(1...5, id: \.self) { n in
                        Button { rating = n } label: {
                            Image(systemName: n <= rating ? "star.fill" : "star")
                                .font(.title)
                                .foregroundStyle(n <= rating ? Brand.warning : Color.gray.opacity(0.5))
                        }
                        .buttonStyle(.plain)
                    }
                }
                TextField("Comparte tu opinión (opcional)", text: $comment, axis: .vertical)
                    .lineLimit(2...5)
                    .padding(12)
                    .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.3)))
                if let error { Text(error).foregroundStyle(Brand.danger).font(.subheadline) }
                if done { Text("¡Gracias por tu reseña!").foregroundStyle(Brand.success).font(.subheadline) }
                PrimaryButton(title: "Enviar reseña", loading: saving) { Task { await submit() } }
            }
            .padding(16)
            .card()
            ForEach(reviews) { r in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(r.user?.name ?? "Estudiante").font(.subheadline.weight(.semibold))
                        Spacer()
                        Stars(value: Double(r.rating), size: 12)
                    }
                    if let c = r.comment, !c.isEmpty { Text(c).font(.subheadline) }
                }
                .padding(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2)))
            }
        }
        .task { await load() }
    }

    private func load() async {
        guard let data = try? await api.reviews(courseId: courseId) else { return }
        reviews = data.reviews
        average = data.average ?? 0
        total = data.total ?? 0
    }

    private func submit() async {
        guard rating >= 1 else { error = "Selecciona una calificación."; return }
        error = nil
        saving = true
        defer { saving = false }
        do {
            let text = comment.trimmingCharacters(in: .whitespacesAndNewlines)
            try await api.postReview(courseId: courseId, rating: rating, comment: text.isEmpty ? nil : text)
            done = true
            comment = ""
            await load()
        } catch {
            self.error = error.localizedDescription
        }
    }
}

struct Stars: View {
    let value: Double
    var size: CGFloat = 16
    var body: some View {
        HStack(spacing: 1) {
            ForEach(1...5, id: \.self) { n in
                Image(systemName: n <= Int(value.rounded()) ? "star.fill" : "star")
                    .font(.system(size: size))
                    .foregroundStyle(Brand.warning)
            }
        }
    }
}
