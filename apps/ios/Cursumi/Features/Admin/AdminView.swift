import SwiftUI

/// Panel de administración.
struct AdminView: View {
    var body: some View {
        List {
            NavigationLink("Resumen") { AdminStatsView() }
            NavigationLink("Solicitudes de instructor") { AdminApplicationsView() }
            NavigationLink("Usuarios") { AdminUsersView() }
            NavigationLink("Moderar reseñas") { AdminReviewsView() }
            NavigationLink("Finanzas") { AdminFinancesView() }
            NavigationLink("Analíticas") { AdminAnalyticsView() }
            NavigationLink("Cupones") { AdminCouponsView() }
            NavigationLink("Categorías") { AdminCategoriesView() }
            NavigationLink("KPIs") { AdminKpisView() }
            NavigationLink("Empresas") { AdminBusinessView() }
        }
        .navigationTitle("Administración")
    }
}

private struct AdminStatsView: View {
    @State private var data: AdminStats?
    @State private var loading = true
    private let api = AdminAPI()
    var body: some View {
        ScrollView {
            if loading { ProgressView().padding(.top, 40) }
            else if let data {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    StatCard(value: "\(data.totalUsers)", label: "Usuarios")
                    StatCard(value: "\(data.totalCourses)", label: "Cursos")
                    StatCard(value: "\(data.publishedCourses)", label: "Publicados")
                    StatCard(value: "\(data.draftCourses)", label: "Borradores")
                    StatCard(value: "\(data.totalEnrollments)", label: "Inscripciones")
                    StatCard(value: Formatting.priceMXN(data.estimatedRevenue), label: "Valor de catálogo")
                }
                .padding(16)
            } else { EmptyState(title: "No se pudo cargar.") }
        }
        .navigationTitle("Resumen")
        .task { data = try? await api.stats(); loading = false }
    }
}

private struct AdminFinancesView: View {
    @State private var data: AdminFinances?
    @State private var loading = true
    private let api = AdminAPI()
    var body: some View {
        ScrollView {
            if loading { ProgressView().padding(.top, 40) }
            else if let data {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                    StatCard(value: Formatting.priceMXN(data.totalRevenue ?? 0), label: "Ingresos totales")
                    StatCard(value: Formatting.priceMXN(data.totalPlatformFee ?? 0), label: "Comisión plataforma")
                    StatCard(value: Formatting.priceMXN(data.totalInstructorPayouts ?? 0), label: "Pagos a instructores")
                    StatCard(value: Formatting.priceMXN(data.thisMonthRevenue ?? 0), label: "Este mes")
                }
                .padding(16)
            } else { EmptyState(title: "No se pudo cargar.") }
        }
        .navigationTitle("Finanzas")
        .task { data = try? await api.finances(); loading = false }
    }
}

private struct AdminAnalyticsView: View {
    @State private var data: AdminAnalytics?
    @State private var loading = true
    private let api = AdminAPI()
    var body: some View {
        ScrollView {
            if loading { ProgressView().padding(.top, 40) }
            else if let data {
                VStack(alignment: .leading, spacing: 12) {
                    let revenue = data.revenueByMonth ?? []
                    let maxRev = max(1, revenue.map(\.amount).max() ?? 1)
                    Text("Ingresos por mes").font(.headline)
                    ForEach(revenue) { m in
                        HStack(spacing: 8) {
                            Text(m.month).font(.caption).frame(width: 56, alignment: .leading)
                            GeometryReader { geo in
                                Capsule().fill(Brand.primary).frame(width: max(2, geo.size.width * m.amount / maxRev))
                            }
                            .frame(height: 10)
                            Text(Formatting.priceMXN(m.amount)).font(.caption).frame(width: 90, alignment: .trailing)
                        }
                    }
                    Text("Usuarios nuevos por mes").font(.headline).padding(.top, 12)
                    ForEach(data.usersByMonth ?? []) { m in
                        HStack { Text(m.month).font(.caption); Spacer(); Text("\(m.users)").font(.caption.bold()) }
                    }
                }
                .padding(16)
            } else { EmptyState(title: "No se pudo cargar.") }
        }
        .navigationTitle("Analíticas")
        .task { data = try? await api.analytics(); loading = false }
    }
}

private struct AdminReviewsView: View {
    @State private var items: [AdminReview] = []
    @State private var loading = true
    @State private var busy: String?
    private let api = AdminAPI()
    var body: some View {
        List {
            if loading { ProgressView().frame(maxWidth: .infinity) }
            else if items.isEmpty { EmptyState(title: "No hay reseñas pendientes.") }
            ForEach(items) { r in
                VStack(alignment: .leading, spacing: 6) {
                    Stars(value: Double(r.rating), size: 13)
                    Text("\(r.user?.name ?? "Estudiante") · \(r.course?.title ?? "")").font(.footnote).foregroundStyle(.secondary)
                    if let c = r.comment { Text(c) }
                    if busy == r.id { ProgressView() } else {
                        HStack {
                            Button("Aprobar") { Task { await act(r.id) { try await api.setReviewApproved(r.id, true) } } }.buttonStyle(.borderedProminent).tint(Brand.primary)
                            Button("Eliminar", role: .destructive) { Task { await act(r.id) { try await api.deleteReview(r.id) } } }.buttonStyle(.bordered)
                        }
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .navigationTitle("Moderar reseñas")
        .task { items = (try? await api.reviews(approved: false)) ?? []; loading = false }
    }
    private func act(_ id: String, _ f: () async throws -> Void) async {
        busy = id
        defer { busy = nil }
        if (try? await f()) != nil { items.removeAll { $0.id == id } }
    }
}

private struct AdminApplicationsView: View {
    @State private var apps: [AdminApplication] = []
    @State private var loading = true
    @State private var busy: String?
    @State private var rejecting: String?
    @State private var reason = ""
    private let api = AdminAPI()
    var body: some View {
        List {
            if loading { ProgressView().frame(maxWidth: .infinity) }
            else if apps.isEmpty { EmptyState(title: "No hay solicitudes pendientes.") }
            ForEach(apps) { a in
                VStack(alignment: .leading, spacing: 6) {
                    Text(a.user?.name ?? "—").font(.headline)
                    Text(a.user?.email ?? "").font(.footnote).foregroundStyle(.secondary)
                    if let h = a.headline { Text(h).font(.subheadline.weight(.semibold)) }
                    if let r = a.reason { Text(r).font(.subheadline) }
                    if rejecting == a.id {
                        TextField("Motivo del rechazo", text: $reason, axis: .vertical).lineLimit(2...4)
                            .padding(8).overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.gray.opacity(0.3)))
                        HStack {
                            Button("Cancelar") { rejecting = nil }.buttonStyle(.bordered)
                            Button("Confirmar rechazo", role: .destructive) {
                                Task { await act(a.id) { try await api.reviewApplication(a.id, approve: false, reason: reason) }; rejecting = nil; reason = "" }
                            }.buttonStyle(.borderedProminent).tint(Brand.danger).disabled(reason.trimmingCharacters(in: .whitespaces).isEmpty)
                        }
                    } else if busy == a.id { ProgressView() } else {
                        HStack {
                            Button("Aprobar") { Task { await act(a.id) { try await api.reviewApplication(a.id, approve: true) } } }.buttonStyle(.borderedProminent).tint(Brand.primary)
                            Button("Rechazar") { rejecting = a.id; reason = "" }.buttonStyle(.bordered)
                        }
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .navigationTitle("Solicitudes")
        .task { apps = (try? await api.applications()) ?? []; loading = false }
    }
    private func act(_ id: String, _ f: () async throws -> Void) async {
        busy = id
        defer { busy = nil }
        if (try? await f()) != nil { apps.removeAll { $0.id == id } }
    }
}

private struct AdminUsersView: View {
    private static let roles = [("student", "Alumno"), ("instructor", "Instructor"), ("admin", "Admin")]
    @State private var users: [AdminUser] = []
    @State private var loading = true
    @State private var busy: String?
    @State private var search = ""
    private let api = AdminAPI()
    private var filtered: [AdminUser] {
        search.isEmpty ? users : users.filter { ($0.name ?? "").localizedCaseInsensitiveContains(search) || ($0.email ?? "").localizedCaseInsensitiveContains(search) }
    }
    var body: some View {
        List {
            if loading { ProgressView().frame(maxWidth: .infinity) }
            else if filtered.isEmpty { EmptyState(title: "Sin usuarios.") }
            ForEach(filtered) { u in
                VStack(alignment: .leading, spacing: 6) {
                    Text(u.name ?? "—").font(.headline)
                    Text(u.email ?? "").font(.footnote).foregroundStyle(.secondary)
                    if busy == u.id { ProgressView() } else {
                        Picker("Rol", selection: Binding(get: { u.role }, set: { role in Task { await change(u, role) } })) {
                            ForEach(Self.roles, id: \.0) { Text($0.1).tag($0.0) }
                        }
                        .pickerStyle(.segmented)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .searchable(text: $search, prompt: "Buscar por nombre o correo")
        .navigationTitle("Usuarios")
        .task { users = (try? await api.users()) ?? []; loading = false }
    }
    private func change(_ u: AdminUser, _ role: String) async {
        guard u.role != role else { return }
        busy = u.id
        defer { busy = nil }
        if (try? await api.setUserRole(u.id, role: role)) != nil, let i = users.firstIndex(where: { $0.id == u.id }) { users[i].role = role }
    }
}

private struct AdminCouponsView: View {
    @State private var items: [AdminCoupon] = []
    @State private var loading = true
    @State private var code = ""
    @State private var pct = ""
    @State private var busy = false
    @State private var error: String?
    private let api = AdminAPI()
    var body: some View {
        List {
            Section("Nuevo cupón") {
                TextField("CÓDIGO", text: $code).textInputAutocapitalization(.characters).autocorrectionDisabled()
                TextField("% de descuento", text: $pct).keyboardType(.numberPad)
                if let error { Text(error).foregroundStyle(Brand.danger) }
                PrimaryButton(title: "Crear cupón", loading: busy, disabled: code.isEmpty || pct.isEmpty) { Task { await add() } }
                    .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
            }
            Section {
                if loading { ProgressView().frame(maxWidth: .infinity) }
                ForEach(items) { c in
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text("\(c.code) · \(c.discountPct)%").font(.headline)
                            Spacer()
                            Text(c.active ? "Activo" : "Inactivo").font(.caption.bold()).foregroundStyle(c.active ? Brand.success : .secondary)
                        }
                        Text("Usos: \(c.usedCount ?? 0)" + (c.maxUses.map { " / \($0)" } ?? "")).font(.footnote).foregroundStyle(.secondary)
                    }
                    .swipeActions {
                        Button(role: .destructive) { Task { try? await api.deleteCoupon(c.id); await load() } } label: { Label("Eliminar", systemImage: "trash") }
                        Button { Task { try? await api.setCouponActive(c.id, !c.active); await load() } } label: { Label(c.active ? "Desactivar" : "Activar", systemImage: "power") }.tint(Brand.primary)
                    }
                }
            }
        }
        .navigationTitle("Cupones")
        .task { await load(); loading = false }
    }
    private func load() async { items = (try? await api.coupons()) ?? items }
    private func add() async {
        guard let p = Int(pct) else { error = "Código y % requeridos."; return }
        error = nil; busy = true
        defer { busy = false }
        do {
            try await api.createCoupon(code: code.trimmingCharacters(in: .whitespaces).uppercased(), discountPct: min(100, max(1, p)))
            code = ""; pct = ""
            await load()
        } catch { self.error = error.localizedDescription }
    }
}

private struct AdminCategoriesView: View {
    @State private var items: [AdminCategory] = []
    @State private var loading = true
    @State private var name = ""
    @State private var busy = false
    @State private var error: String?
    private let api = AdminAPI()
    var body: some View {
        List {
            Section("Nueva categoría") {
                TextField("Nombre", text: $name)
                if let error { Text(error).foregroundStyle(Brand.danger) }
                PrimaryButton(title: "Crear", loading: busy, disabled: name.isEmpty) { Task { await add() } }
                    .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
            }
            Section {
                if loading { ProgressView().frame(maxWidth: .infinity) }
                ForEach(items) { c in
                    VStack(alignment: .leading, spacing: 2) {
                        Text(c.name).font(.headline)
                        Text("\(c.slug) · \(c._count?.courses ?? 0) cursos").font(.footnote).foregroundStyle(.secondary)
                    }
                    .swipeActions {
                        Button(role: .destructive) { Task { try? await api.deleteCategory(c.id); await load() } } label: { Label("Eliminar", systemImage: "trash") }
                    }
                }
            }
        }
        .navigationTitle("Categorías")
        .task { await load(); loading = false }
    }
    private func load() async { items = (try? await api.categories()) ?? items }
    private func add() async {
        let n = name.trimmingCharacters(in: .whitespaces)
        guard n.count >= 2 else { error = "Nombre muy corto."; return }
        error = nil; busy = true
        defer { busy = false }
        do { try await api.createCategory(name: n); name = ""; await load() } catch { self.error = error.localizedDescription }
    }
}

private struct AdminKpisView: View {
    @State private var items: [AdminKpi] = []
    @State private var loading = true
    @State private var name = ""
    @State private var target = ""
    @State private var unit = ""
    @State private var busy = false
    @State private var error: String?
    private let api = AdminAPI()
    var body: some View {
        List {
            Section("Nuevo KPI") {
                TextField("Nombre", text: $name)
                TextField("Valor objetivo", text: $target).keyboardType(.decimalPad)
                TextField("Unidad (opcional)", text: $unit)
                if let error { Text(error).foregroundStyle(Brand.danger) }
                PrimaryButton(title: "Crear KPI", loading: busy, disabled: name.isEmpty || target.isEmpty) { Task { await add() } }
                    .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
            }
            Section {
                if loading { ProgressView().frame(maxWidth: .infinity) }
                ForEach(items) { k in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(k.name).font(.headline)
                        Text("\(k.currentValue.clean) / \(k.targetValue.clean) \(k.unit ?? "") (\(k.percent)%)").font(.footnote).foregroundStyle(.secondary)
                        ProgressView(value: Double(k.percent), total: 100).tint(Brand.primary)
                    }
                    .swipeActions {
                        Button(role: .destructive) { Task { try? await api.deleteKpi(k.id); await load() } } label: { Label("Eliminar", systemImage: "trash") }
                    }
                }
            }
        }
        .navigationTitle("KPIs")
        .task { await load(); loading = false }
    }
    private func load() async { items = (try? await api.kpis()) ?? items }
    private func add() async {
        guard let t = Double(target), t > 0 else { error = "Nombre y objetivo (>0) requeridos."; return }
        error = nil; busy = true
        defer { busy = false }
        do {
            try await api.createKpi(name: name.trimmingCharacters(in: .whitespaces), targetValue: t, unit: unit.isEmpty ? nil : unit)
            name = ""; target = ""; unit = ""
            await load()
        } catch { self.error = error.localizedDescription }
    }
}

private struct AdminBusinessView: View {
    @State private var reqs: [QuoteRequest] = []
    @State private var loading = true
    private let api = AdminAPI()
    var body: some View {
        List {
            if loading { ProgressView().frame(maxWidth: .infinity) }
            else if reqs.isEmpty { EmptyState(title: "No hay solicitudes.") }
            ForEach(reqs) { r in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(r.companyName).font(.headline)
                        Spacer()
                        Text(r.statusLabel).font(.caption.bold()).foregroundStyle(Brand.primary)
                    }
                    Text([r.contactName, r.contactEmail, r.contactPhone].compactMap { $0 }.joined(separator: " · ")).font(.footnote).foregroundStyle(.secondary)
                    if let s = r.companySize { Text("Tamaño: \(s)").font(.footnote).foregroundStyle(.secondary) }
                    if let i = r.interests { Text("Interés: \(i)").font(.footnote).foregroundStyle(.secondary) }
                    if let m = r.message { Text(m).font(.subheadline) }
                    HStack {
                        if r.status == "new" { Button("Contactada") { Task { await mark(r, "contacted") } }.buttonStyle(.bordered) }
                        if r.status != "closed", r.status != "converted" { Button("Cerrar") { Task { await mark(r, "closed") } }.buttonStyle(.bordered) }
                    }
                    Text("Provisionar: desde la web.").font(.caption).foregroundStyle(.tertiary)
                }
                .padding(.vertical, 4)
            }
        }
        .navigationTitle("Empresas")
        .task { reqs = (try? await api.quoteRequests()) ?? []; loading = false }
    }
    private func mark(_ r: QuoteRequest, _ status: String) async {
        if let i = reqs.firstIndex(where: { $0.id == r.id }) { reqs[i].status = status }
        try? await api.updateQuoteRequest(r.id, status: status)
    }
}

extension Double {
    /// Sin decimales si es entero ("12"), si no con hasta 2 ("12.5").
    var clean: String {
        truncatingRemainder(dividingBy: 1) == 0 ? String(Int(self)) : String(format: "%.2f", self)
    }
}
