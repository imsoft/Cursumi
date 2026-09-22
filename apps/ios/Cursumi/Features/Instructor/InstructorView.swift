import SwiftUI

/// Panel del instructor: ingresos, datos, cursos y chats.
struct InstructorView: View {
    private enum Tab: String, CaseIterable { case earnings = "Ingresos", analytics = "Datos", courses = "Cursos", messages = "Chats" }
    @State private var tab: Tab = .earnings

    var body: some View {
        VStack(spacing: 0) {
            Picker("Sección", selection: $tab) {
                ForEach(Tab.allCases, id: \.self) { Text($0.rawValue).tag($0) }
            }
            .pickerStyle(.segmented)
            .padding(16)
            switch tab {
            case .earnings: EarningsTab()
            case .analytics: AnalyticsTab()
            case .courses: CoursesTab()
            case .messages: MessagesTab()
            }
        }
        .navigationTitle("Instructor")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct EarningsTab: View {
    @State private var data: InstructorEarnings?
    @State private var loading = true
    private let api = InstructorAPI()

    var body: some View {
        ScrollView {
            if loading {
                ProgressView().padding(.top, 40)
            } else if let data {
                VStack(spacing: 12) {
                    VStack(spacing: 4) {
                        Text("Total generado").font(.footnote).foregroundStyle(.secondary)
                        Text(Formatting.priceMXN(data.total)).font(.system(size: 30, weight: .heavy)).foregroundStyle(Brand.primary)
                    }
                    .frame(maxWidth: .infinity).padding(20).card()
                    HStack(spacing: 12) {
                        StatCard(value: Formatting.priceMXN(data.thisMonth ?? 0), label: "Este mes")
                        StatCard(value: "\(data.courses ?? 0)", label: "Cursos")
                    }
                    Text("Solo cuenta dinero realmente cobrado; las inscripciones gratuitas o con cupón no suman.")
                        .font(.caption).foregroundStyle(.secondary).multilineTextAlignment(.center)
                }
                .padding(16)
            } else {
                EmptyState(title: "No se pudieron cargar tus ingresos.")
            }
        }
        .task { data = try? await api.earnings(); loading = false }
    }
}

private struct AnalyticsTab: View {
    @State private var data: InstructorAnalytics?
    @State private var loading = true
    private let api = InstructorAPI()

    var body: some View {
        ScrollView {
            if loading {
                ProgressView().padding(.top, 40)
            } else if let data {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    StatCard(value: "\(data.totalStudents)", label: "Estudiantes")
                    StatCard(value: "\(data.totalCourses)", label: "Cursos")
                    StatCard(value: "\(data.publishedCourses)", label: "Publicados")
                    StatCard(value: "\(Int(data.avgProgress.rounded()))%", label: "Avance prom.")
                }
                .padding(16)
            } else {
                EmptyState(title: "No se pudieron cargar las analíticas.")
            }
        }
        .task { data = try? await api.analytics(); loading = false }
    }
}

struct StatCard: View {
    let value: String
    let label: String
    var body: some View {
        VStack(spacing: 4) {
            Text(value).font(.title3.bold()).foregroundStyle(Brand.primary).lineLimit(1).minimumScaleFactor(0.6)
            Text(label).font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity).padding(14)
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(Color.gray.opacity(0.2)))
    }
}

private struct CoursesTab: View {
    @State private var courses: [InstructorCourse] = []
    @State private var loading = true
    @State private var error: String?
    @State private var busy: String?
    private let api = InstructorAPI()

    var body: some View {
        List {
            if let error { Text(error).foregroundStyle(Brand.danger) }
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if courses.isEmpty {
                EmptyState(title: "Aún no tienes cursos", message: "Créalos desde Perfil → Crear curso.")
            }
            ForEach(courses) { course in
                VStack(alignment: .leading, spacing: 8) {
                    HStack(alignment: .top) {
                        Text(course.title).font(.headline).lineLimit(2)
                        Spacer()
                        Text(course.statusLabel).font(.caption2.bold())
                            .padding(.horizontal, 8).padding(.vertical, 3)
                            .background(statusColor(course.status).opacity(0.15))
                            .foregroundStyle(statusColor(course.status))
                            .clipShape(Capsule())
                    }
                    Text("\(course.studentsCount ?? 0) estudiantes" + (course.price.map { " · \(Formatting.priceMXN($0))" } ?? ""))
                        .font(.footnote).foregroundStyle(.secondary)
                    HStack(spacing: 8) {
                        if busy == course.id {
                            ProgressView()
                        } else if course.status == "published" {
                            smallButton("Despublicar") { Task { await change(course, "draft") } }
                            smallButton("Archivar") { Task { await change(course, "archived") } }
                        } else {
                            smallButton("Publicar", filled: true) { Task { await change(course, "published") } }
                        }
                    }
                    NavigationLink { PlanningWebView(courseId: course.id) } label: {
                        Label("Planeación didáctica", systemImage: "doc.text").font(.subheadline.weight(.semibold)).foregroundStyle(Brand.primary)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .listStyle(.plain)
        .refreshable { await load() }
        .task { await load(); loading = false }
    }

    private func statusColor(_ status: String) -> Color {
        status == "published" ? Brand.success : status == "archived" ? .gray : Brand.warning
    }

    private func smallButton(_ title: String, filled: Bool = false, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title).font(.footnote.weight(.semibold))
                .padding(.horizontal, 12).padding(.vertical, 7)
                .background(filled ? Brand.primary : .clear)
                .foregroundStyle(filled ? .white : Brand.primary)
                .overlay(Capsule().stroke(Brand.primary))
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }

    private func load() async {
        do { courses = try await api.courses() } catch { self.error = "No se pudieron cargar tus cursos." }
    }

    private func change(_ course: InstructorCourse, _ status: String) async {
        busy = course.id
        error = nil
        defer { busy = nil }
        do {
            try await api.setCourseStatus(course.id, status: status)
            await load()
        } catch {
            self.error = error.localizedDescription
        }
    }
}

private struct MessagesTab: View {
    @State private var items: [InstructorConversation] = []
    @State private var loading = true
    @State private var error: String?
    private let api = InstructorAPI()

    var body: some View {
        List {
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if items.isEmpty {
                EmptyState(title: error ?? "No tienes conversaciones.")
            }
            ForEach(items) { c in
                NavigationLink { ThreadView(conversationId: c.id, title: c.student?.name ?? "Estudiante") } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(c.student?.name ?? "Estudiante").font(.headline)
                        Text(c.course?.title ?? "").font(.footnote).foregroundStyle(Brand.primary).lineLimit(1)
                        if let last = c.messages?.last { Text(last.body).font(.footnote).foregroundStyle(.secondary).lineLimit(1) }
                    }
                }
            }
        }
        .listStyle(.plain)
        .task {
            do { items = try await api.conversations() } catch { self.error = "No se pudieron cargar los mensajes." }
            loading = false
        }
    }
}

/// Hilo de una conversación existente (el instructor responde).
struct ThreadView: View {
    let conversationId: String
    let title: String

    @Environment(SessionStore.self) private var session
    @State private var messages: [ChatMessage] = []
    @State private var text = ""
    @State private var sending = false
    private let api = SocialAPI()

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(messages) { m in
                            let mine = m.senderId == session.user?.id
                            HStack {
                                if mine { Spacer(minLength: 60) }
                                Text(m.body).foregroundStyle(mine ? .white : .primary)
                                    .padding(.horizontal, 14).padding(.vertical, 10)
                                    .background(mine ? Brand.primary : Color.gray.opacity(0.15))
                                    .clipShape(RoundedRectangle(cornerRadius: 16))
                                if !mine { Spacer(minLength: 60) }
                            }
                            .id(m.id)
                        }
                    }
                    .padding(16)
                }
                .onChange(of: messages.count) { _, _ in
                    if let last = messages.last { withAnimation { proxy.scrollTo(last.id, anchor: .bottom) } }
                }
            }
            Divider()
            HStack(alignment: .bottom, spacing: 8) {
                TextField("Escribe una respuesta…", text: $text, axis: .vertical).lineLimit(1...5)
                    .padding(.horizontal, 16).padding(.vertical, 10)
                    .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.gray.opacity(0.3)))
                Button { Task { await send() } } label: {
                    if sending { ProgressView().tint(.white) } else { Text("Enviar").bold() }
                }
                .padding(.horizontal, 18).padding(.vertical, 11)
                .background(Brand.primary).foregroundStyle(.white).clipShape(Capsule())
                .disabled(text.trimmingCharacters(in: .whitespaces).isEmpty || sending)
            }
            .padding(12)
        }
        .navigationTitle(title)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            try? await api.markConversationRead(conversationId)
            while !Task.isCancelled {
                if let m = try? await api.messages(conversationId: conversationId) { messages = m }
                try? await Task.sleep(for: .seconds(5))
            }
        }
    }

    private func send() async {
        let body = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !body.isEmpty else { return }
        text = ""
        sending = true
        defer { sending = false }
        do { messages.append(try await api.sendMessage(conversationId: conversationId, body: body)) } catch { text = body }
    }
}

/// Perfil de instructor + Stripe Connect.
struct InstructorAccountView: View {
    @State private var loading = true
    @State private var saving = false
    @State private var error: String?
    @State private var done = false
    @State private var headline = ""
    @State private var bio = ""
    @State private var specialties = ""
    @State private var teachingYears = ""
    @State private var stripe: StripeStatus?
    @State private var stripeBusy = false
    @State private var stripeURL: URL?
    private let api = InstructorAPI()

    var body: some View {
        Form {
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else {
                Section("Cobros (Stripe)") {
                    Text(stripeMessage).foregroundStyle(.secondary)
                    PrimaryButton(title: stripe?.onboarded == true ? "Abrir panel de Stripe" : "Conectar Stripe", loading: stripeBusy) {
                        Task { await connectStripe() }
                    }
                    .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
                }
                Section("Tu información") {
                    TextField("Titular profesional", text: $headline)
                    TextField("Biografía", text: $bio, axis: .vertical).lineLimit(3...6)
                    TextField("Especialidades", text: $specialties)
                    TextField("Años enseñando", text: $teachingYears).keyboardType(.numberPad)
                }
                if let error { Section { Text(error).foregroundStyle(Brand.danger) } }
                if done { Section { Text("Guardado ✓").foregroundStyle(Brand.success) } }
                Section {
                    PrimaryButton(title: "Guardar", loading: saving) { Task { await save() } }
                        .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
                } footer: {
                    Text("Nombre, correo y foto se editan en tu perfil general.")
                }
            }
        }
        .navigationTitle("Perfil de instructor")
        .task { await load(); loading = false }
        .sheet(item: $stripeURL, onDismiss: { Task { stripe = try? await api.stripeStatus() } }) { SafariView(url: $0).ignoresSafeArea() }
    }

    private var stripeMessage: String {
        if stripe?.onboarded == true { return "Tu cuenta de cobros está conectada y activa." }
        if stripe?.connected == true { return "Conexión iniciada. Completa el onboarding para recibir pagos." }
        return "Conecta Stripe para recibir tus pagos."
    }

    private func load() async {
        do {
            let p = try await api.profile()
            headline = p.headline; bio = p.bio; specialties = p.specialties
            teachingYears = p.teachingYears.map(String.init) ?? ""
            stripe = try? await api.stripeStatus()
        } catch { self.error = "No se pudo cargar tu perfil." }
    }

    private func save() async {
        error = nil; done = false; saving = true
        defer { saving = false }
        do {
            try await api.updateProfile(InstructorProfileUpdate(
                headline: headline.trimmingCharacters(in: .whitespaces), bio: bio.trimmingCharacters(in: .whitespacesAndNewlines),
                specialties: specialties.trimmingCharacters(in: .whitespaces), teachingYears: Int(teachingYears)
            ))
            done = true
        } catch { self.error = error.localizedDescription }
    }

    private func connectStripe() async {
        stripeBusy = true
        defer { stripeBusy = false }
        do { stripeURL = try await api.startStripeConnect() } catch { self.error = error.localizedDescription }
    }
}

/// Plantillas oficiales (mismas que `public/templates/` en la web).
struct TemplatesView: View {
    private let templates = [
        ("Presentación Cursumi", "Plantilla de PowerPoint para presentar tus cursos o la plataforma.", "cursumi_presentation.pptx"),
        ("Membrete Cursumi", "Plantilla PDF con membrete oficial para documentos o comunicados.", "cursumi_letterhead.pdf"),
    ]
    @State private var openURL: URL?

    var body: some View {
        List(templates, id: \.2) { t in
            VStack(alignment: .leading, spacing: 8) {
                Text(t.0).font(.headline)
                Text(t.1).font(.footnote).foregroundStyle(.secondary)
                Button("Abrir / descargar") { openURL = Config.apiURL.appendingPathComponent("templates/\(t.2)") }
                    .font(.subheadline.weight(.semibold))
            }
            .padding(.vertical, 4)
        }
        .navigationTitle("Plantillas")
        .sheet(item: $openURL) { SafariView(url: $0).ignoresSafeArea() }
    }
}

/// Formulario público de Cursumi Business.
struct BusinessView: View {
    private static let sizes = ["1-10", "11-50", "51-200", "201-500", "500+"]
    private static let benefits = [
        "Capacita a todo tu equipo con el catálogo de Cursumi",
        "Métricas de avance y certificados por empleado",
        "Equipos, asignación de cursos y materiales internos",
        "Precio a la medida según tu empresa",
    ]
    @State private var companyName = ""
    @State private var contactName = ""
    @State private var contactEmail = ""
    @State private var contactPhone = ""
    @State private var companySize = ""
    @State private var interests = ""
    @State private var message = ""
    @State private var saving = false
    @State private var error: String?
    @State private var done = false
    private let api = InstructorAPI()

    var body: some View {
        Form {
            Section {
                ForEach(Self.benefits, id: \.self) { Label($0, systemImage: "checkmark").foregroundStyle(.primary) }
            } header: { Text("Capacitación para tu equipo, con precio a la medida.") }
            if done {
                Section {
                    Text("¡Solicitud enviada!").font(.headline)
                    Text("Nuestro equipo te contactará pronto con una cotización a la medida.").foregroundStyle(.secondary)
                }
            } else {
                Section("Empresa") {
                    TextField("Nombre de la empresa", text: $companyName)
                    Picker("Tamaño", selection: $companySize) {
                        Text("—").tag("")
                        ForEach(Self.sizes, id: \.self) { Text("\($0) personas").tag($0) }
                    }
                }
                Section("Contacto") {
                    TextField("Tu nombre", text: $contactName).textContentType(.name)
                    TextField("Correo", text: $contactEmail).keyboardType(.emailAddress).textContentType(.emailAddress).textInputAutocapitalization(.never)
                    TextField("Teléfono (opcional)", text: $contactPhone).keyboardType(.phonePad)
                }
                Section("Interés") {
                    TextField("¿Qué te interesa capacitar?", text: $interests)
                    TextField("Mensaje (opcional)", text: $message, axis: .vertical).lineLimit(3...6)
                }
                if let error { Section { Text(error).foregroundStyle(Brand.danger) } }
                Section {
                    PrimaryButton(title: "Solicitar cotización", loading: saving) { Task { await submit() } }
                        .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
                }
            }
        }
        .navigationTitle("Cursumi Business")
    }

    private func submit() async {
        error = nil
        let c = companyName.trimmingCharacters(in: .whitespaces), n = contactName.trimmingCharacters(in: .whitespaces), e = contactEmail.trimmingCharacters(in: .whitespaces)
        guard !c.isEmpty, !n.isEmpty, !e.isEmpty else { error = "Empresa, nombre y correo son obligatorios."; return }
        saving = true
        defer { saving = false }
        func opt(_ s: String) -> String? { let t = s.trimmingCharacters(in: .whitespacesAndNewlines); return t.isEmpty ? nil : t }
        do {
            try await api.submitQuoteRequest(QuoteRequestPayload(
                companyName: c, contactName: n, contactEmail: e, contactPhone: opt(contactPhone),
                companySize: opt(companySize), interests: opt(interests), message: opt(message)
            ))
            done = true
        } catch { self.error = error.localizedDescription }
    }
}
