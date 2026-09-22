import SwiftUI

/// Programa de referidos.
struct ReferralView: View {
    @State private var data: Referral?
    @State private var loading = true
    @State private var error: String?
    private let api = SocialAPI()

    var body: some View {
        Group {
            if loading {
                ProgressView()
            } else if let data {
                ScrollView {
                    VStack(spacing: 16) {
                        VStack(spacing: 8) {
                            Text("Tu código").font(.footnote).foregroundStyle(.secondary)
                            Text(data.referralCode ?? "—").font(.system(size: 28, weight: .heavy)).foregroundStyle(Brand.primary)
                            Text(data.referralLink).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                            ShareLink(item: "Únete a Cursumi con mi enlace: \(data.referralLink)") {
                                Text("Compartir enlace").font(.headline).foregroundStyle(.white)
                                    .padding(.horizontal, 28).padding(.vertical, 14)
                                    .background(Brand.primary).clipShape(RoundedRectangle(cornerRadius: 12))
                            }
                        }
                        .frame(maxWidth: .infinity).padding(20).card()
                        HStack(spacing: 12) {
                            stat("\(data.totalReferrals)", "Referidos")
                            stat("\(data.earnedReferrals)", "Con recompensa")
                            stat(Formatting.priceMXN(Double(data.totalEarnedCents) / 100).replacingOccurrences(of: " MXN", with: ""), "Ganado")
                        }
                        Text("Comparte tu enlace. Cuando alguien se registre y compre con él, recibes una recompensa.")
                            .font(.footnote).foregroundStyle(.secondary).multilineTextAlignment(.center)
                    }
                    .padding(16)
                }
            } else {
                EmptyState(title: error ?? "Sin datos.")
            }
        }
        .navigationTitle("Referidos")
        .task {
            do { data = try await api.referral() } catch { self.error = "No se pudo cargar tu programa de referidos." }
            loading = false
        }
    }

    private func stat(_ value: String, _ label: String) -> some View {
        VStack(spacing: 2) {
            Text(value).font(.title3.bold()).foregroundStyle(Brand.primary).lineLimit(1).minimumScaleFactor(0.6)
            Text(label).font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity).padding(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.gray.opacity(0.2)))
    }
}

/// Todas las notas del alumno.
struct NotesView: View {
    @State private var notes: [Note] = []
    @State private var loading = true
    @State private var error: String?
    private let api = SocialAPI()

    var body: some View {
        List {
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if notes.isEmpty {
                EmptyState(title: "Aún no tienes notas", message: error ?? "Agrégalas mientras ves una lección.")
            }
            ForEach(notes) { note in
                VStack(alignment: .leading, spacing: 4) {
                    if note.course != nil || note.lesson != nil {
                        Text([note.course?.title, note.lesson?.title].compactMap { $0 }.joined(separator: " · "))
                            .font(.caption).foregroundStyle(Brand.primary).lineLimit(1)
                    }
                    Text(note.content)
                }
                .swipeActions {
                    Button(role: .destructive) { Task { await remove(note) } } label: { Label("Eliminar", systemImage: "trash") }
                }
            }
        }
        .navigationTitle("Mis notas")
        .refreshable { await load() }
        .task { await load(); loading = false }
    }

    private func load() async {
        do { notes = try await api.notes() } catch { self.error = "No se pudieron cargar tus notas." }
    }

    private func remove(_ note: Note) async {
        notes.removeAll { $0.id == note.id }
        try? await api.deleteNote(note.id)
    }
}

/// Blog de Cursumi: lista y lectura.
struct BlogView: View {
    @State private var posts: [BlogPostSummary] = []
    @State private var loading = true
    @State private var error: String?
    private let api = SocialAPI()

    var body: some View {
        List {
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if posts.isEmpty {
                EmptyState(title: error ?? "No hay artículos por ahora.")
            }
            ForEach(posts) { post in
                NavigationLink { BlogReaderView(slug: post.slug) } label: {
                    VStack(alignment: .leading, spacing: 0) {
                        if let url = post.coverImageUrl.flatMap(URL.init) { RemoteImage(url: url, height: 150) }
                        VStack(alignment: .leading, spacing: 4) {
                            Text(post.title).font(.headline).lineLimit(2)
                            if let excerpt = post.excerpt { Text(excerpt).font(.footnote).foregroundStyle(.secondary).lineLimit(2) }
                        }
                        .padding(16)
                    }
                    .card()
                }
                .buttonStyle(.plain)
                .listRowSeparator(.hidden)
                .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
            }
        }
        .listStyle(.plain)
        .navigationTitle("Blog")
        .task {
            do { posts = try await api.blogPosts() } catch { self.error = "No se pudo cargar el blog." }
            loading = false
        }
    }
}

struct BlogReaderView: View {
    let slug: String
    @State private var post: BlogPost?
    @State private var loading = true
    @State private var height: CGFloat = 400
    private let api = SocialAPI()

    var body: some View {
        Group {
            if loading {
                ProgressView()
            } else if let post {
                ScrollView {
                    VStack(alignment: .leading, spacing: 12) {
                        if let url = post.coverImageUrl.flatMap(URL.init) {
                            RemoteImage(url: url, height: 200).clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        Text(post.title).font(.title2.bold())
                        if let name = post.author?.name { Text("Por \(name)").font(.footnote).foregroundStyle(.secondary) }
                        HTMLView(source: .html(LessonContent.html(from: post.content)), height: $height)
                            .frame(height: height)
                    }
                    .padding(16)
                }
            } else {
                EmptyState(title: "No se pudo cargar el artículo.")
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .task {
            post = try? await api.blogPost(slug: slug)
            loading = false
        }
    }
}

/// Cambio de contraseña (solo cuentas con contraseña; Google no la tiene).
struct SettingsView: View {
    @State private var current = ""
    @State private var next = ""
    @State private var confirm = ""
    @State private var saving = false
    @State private var error: String?
    @State private var done = false
    private let api = SocialAPI()

    var body: some View {
        Form {
            Section {
                SecureField("Contraseña actual", text: $current).textContentType(.password)
                SecureField("Nueva contraseña", text: $next).textContentType(.newPassword)
                SecureField("Confirmar nueva contraseña", text: $confirm).textContentType(.newPassword)
            } header: {
                Text("Cambiar contraseña")
            } footer: {
                Text("Mínimo 8 caracteres. Si entras con Google, no tienes contraseña que cambiar.")
            }
            if let error { Section { Text(error).foregroundStyle(Brand.danger) } }
            if done { Section { Text("Contraseña actualizada ✓").foregroundStyle(Brand.success) } }
            Section {
                PrimaryButton(title: "Actualizar contraseña", loading: saving, disabled: current.isEmpty || next.isEmpty || confirm.isEmpty) {
                    Task { await submit() }
                }
                .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
            }
        }
        .navigationTitle("Configuración")
    }

    private func submit() async {
        error = nil
        done = false
        guard next.count >= 8 else { error = "La nueva contraseña debe tener al menos 8 caracteres."; return }
        guard next == confirm else { error = "Las contraseñas no coinciden."; return }
        saving = true
        defer { saving = false }
        do {
            try await api.changePassword(current: current, new: next)
            done = true
            current = ""; next = ""; confirm = ""
        } catch {
            self.error = "No se pudo cambiar la contraseña. Verifica tu contraseña actual."
        }
    }
}

/// Solicitud para volverse instructor.
struct BecomeInstructorView: View {
    @State private var headline = ""
    @State private var bio = ""
    @State private var reason = ""
    @State private var saving = false
    @State private var error: String?
    @State private var done = false
    private let api = SocialAPI()

    var body: some View {
        Form {
            if done {
                Section {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("¡Solicitud enviada!").font(.headline)
                        Text("Nuestro equipo la revisará y te contactará pronto.").foregroundStyle(.secondary)
                    }
                }
            } else {
                Section {
                    TextField("Titular profesional", text: $headline)
                } footer: { Text("Ej: Desarrollador web · 8 años de experiencia") }
                Section("Tu biografía") {
                    TextField("Cuéntanos de ti", text: $bio, axis: .vertical).lineLimit(3...6)
                }
                Section {
                    TextField("¿Por qué quieres enseñar?", text: $reason, axis: .vertical).lineLimit(3...6)
                } footer: { Text("Al menos 20 caracteres.") }
                if let error { Section { Text(error).foregroundStyle(Brand.danger) } }
                Section {
                    PrimaryButton(title: "Enviar solicitud", loading: saving) { Task { await submit() } }
                        .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
                }
            }
        }
        .navigationTitle("Ser instructor")
    }

    private func submit() async {
        error = nil
        let h = headline.trimmingCharacters(in: .whitespaces), b = bio.trimmingCharacters(in: .whitespacesAndNewlines), r = reason.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !h.isEmpty, b.count >= 10, r.count >= 20 else {
            error = "Completa todos los campos (la motivación necesita al menos 20 caracteres)."
            return
        }
        saving = true
        defer { saving = false }
        do {
            try await api.applyInstructor(headline: h, bio: b, reason: r)
            done = true
        } catch {
            self.error = error.localizedDescription
        }
    }
}

/// Materiales internos de la organización (planes de empresa).
struct OrgMaterialsView: View {
    @State private var materials: [OrgMaterial] = []
    @State private var orgName: String?
    @State private var loading = true
    @State private var error: String?
    @State private var openURL: URL?
    private let api = SocialAPI()

    var body: some View {
        List {
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if materials.isEmpty {
                EmptyState(title: error ?? "No hay materiales disponibles para tu organización.")
            }
            ForEach(materials) { m in
                Button { openURL = URL(string: m.fileUrl) } label: {
                    HStack(spacing: 12) {
                        Text(m.fileType.uppercased()).font(.caption2.bold())
                            .padding(6).background(Brand.primary.opacity(0.12)).foregroundStyle(Brand.primary)
                            .clipShape(RoundedRectangle(cornerRadius: 6))
                        VStack(alignment: .leading, spacing: 2) {
                            Text(m.name).font(.headline).lineLimit(2)
                            if let d = m.description { Text(d).font(.footnote).foregroundStyle(.secondary).lineLimit(2) }
                        }
                        Spacer()
                        Image(systemName: "chevron.right").foregroundStyle(.tertiary)
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .navigationTitle(orgName.map { "Materiales · \($0)" } ?? "Materiales")
        .task {
            do {
                let r = try await api.orgMaterials()
                materials = r.materials
                orgName = r.orgName
            } catch { self.error = "No se pudieron cargar los materiales." }
            loading = false
        }
        .sheet(item: $openURL) { SafariView(url: $0).ignoresSafeArea() }
    }
}

/// Juego en vivo, lado jugador (código + apodo, sala, preguntas, resultados).
struct GamesView: View {
    private static let optionColors: [Color] = [Color(hex: 0xEF4444), Color(hex: 0x3B82F6), Color(hex: 0xF59E0B), Color(hex: 0x22C55E)]

    @State private var code = ""
    @State private var nickname = ""
    @State private var joining = false
    @State private var error: String?
    @State private var gameId: String?
    @State private var state: GameState?
    @State private var answered: String?
    private let api = SocialAPI()

    var body: some View {
        Group {
            if gameId == nil { joinForm } else { play }
        }
        .navigationTitle(gameId == nil ? "Unirse a un juego" : (state?.myNickname ?? "Juego"))
        .navigationBarTitleDisplayMode(.inline)
        .task(id: gameId) {
            guard let gameId else { return }
            while !Task.isCancelled {
                if let s = try? await api.game(gameId) { state = s }
                try? await Task.sleep(for: .seconds(2))
            }
        }
    }

    private var joinForm: some View {
        Form {
            Section { Text("Ingresa el código que te compartió tu instructor.").foregroundStyle(.secondary) }
            Section {
                TextField("CÓDIGO", text: $code).textInputAutocapitalization(.characters).autocorrectionDisabled()
                    .font(.title2.bold().monospaced())
                TextField("Tu apodo", text: $nickname)
            }
            if let error { Section { Text(error).foregroundStyle(Brand.danger) } }
            Section {
                PrimaryButton(title: "Entrar", loading: joining, disabled: code.isEmpty || nickname.isEmpty) { Task { await join() } }
                    .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
            }
        }
    }

    @ViewBuilder
    private var play: some View {
        if let state {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    switch state.game.status {
                    case "waiting":
                        Text("Sala de espera").font(.title2.bold())
                        Text("Esperando a que el anfitrión inicie…").foregroundStyle(.secondary)
                        Text("Jugadores (\(state.participants.count))").font(.headline)
                        ForEach(state.ranked) { p in row(p.nickname, score: nil, me: p.id == state.myParticipantId, rank: nil) }
                    case "finished":
                        Text("Resultados 🏆").font(.title2.bold())
                        ForEach(Array(state.ranked.enumerated()), id: \.element.id) { i, p in
                            row(p.nickname, score: p.score, me: p.id == state.myParticipantId, rank: i)
                        }
                    default:
                        if let q = state.currentQ {
                            Text("Pregunta \((state.game.currentQuestion ?? 0) + 1)").font(.footnote).foregroundStyle(.secondary)
                            Text(q.question).font(.title3.bold())
                            if state.myAnswer != nil || answered == q.id {
                                VStack(spacing: 4) {
                                    Text("¡Respondido!").font(.headline)
                                    Text("Espera la siguiente pregunta…").foregroundStyle(.secondary)
                                }
                                .frame(maxWidth: .infinity).padding(20).card()
                            } else {
                                ForEach(q.options.indices, id: \.self) { i in
                                    Button { Task { await pick(q, i) } } label: {
                                        Text(q.options[i]).font(.headline).foregroundStyle(.white)
                                            .frame(maxWidth: .infinity, minHeight: 64).padding(.horizontal, 12)
                                            .background(Self.optionColors[i % Self.optionColors.count])
                                            .clipShape(RoundedRectangle(cornerRadius: 14))
                                    }
                                }
                            }
                        } else {
                            ProgressView().frame(maxWidth: .infinity)
                        }
                    }
                }
                .padding(16)
            }
        } else {
            ProgressView()
        }
    }

    private func row(_ name: String, score: Int?, me: Bool, rank: Int?) -> some View {
        HStack {
            if let rank { Text(["🥇", "🥈", "🥉"].indices.contains(rank) ? ["🥇", "🥈", "🥉"][rank] : "\(rank + 1).").frame(width: 32) }
            Text(name).fontWeight(me ? .bold : .regular)
            Spacer()
            if let score { Text("\(score)").bold().foregroundStyle(Brand.primary) }
        }
        .padding(12)
        .background(me ? Brand.primary.opacity(0.08) : .clear)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2)))
    }

    private func join() async {
        error = nil
        joining = true
        defer { joining = false }
        do { gameId = try await api.joinGame(code: code, nickname: nickname) } catch { self.error = error.localizedDescription }
    }

    private func pick(_ q: GameQuestion, _ option: Int) async {
        guard let gameId else { return }
        answered = q.id
        do {
            try await api.answerGame(gameId, questionId: q.id, option: option)
            if let s = try? await api.game(gameId) { state = s }
        } catch {
            answered = nil
        }
    }
}
