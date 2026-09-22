import SwiftUI

/// Juegos en vivo, lado anfitrión: lista, crear y controlar.
struct HostGamesView: View {
    @State private var games: [HostGame] = []
    @State private var loading = true
    private let api = InstructorAPI()

    var body: some View {
        List {
            Section {
                NavigationLink { CreateGameView() } label: { Label("Crear juego", systemImage: "plus.circle.fill").foregroundStyle(Brand.primary) }
            }
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if games.isEmpty {
                EmptyState(title: "Aún no has creado juegos.")
            }
            ForEach(games) { g in
                NavigationLink { ControlGameView(gameId: g.id) } label: {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(g.title).font(.headline)
                        Text("Código \(g.code) · \(g._count?.questions ?? 0) preguntas · \(g._count?.participants ?? 0) jugadores · \(g.status)")
                            .font(.footnote).foregroundStyle(.secondary)
                    }
                }
            }
        }
        .navigationTitle("Juegos (anfitrión)")
        .refreshable { games = (try? await api.myGames()) ?? games }
        .task { games = (try? await api.myGames()) ?? []; loading = false }
    }
}

private struct CreateGameView: View {
    @State private var title = ""
    @State private var questions = [NewGameQuestion()]
    @State private var saving = false
    @State private var error: String?
    @State private var createdId: String?
    private let api = InstructorAPI()

    var body: some View {
        Form {
            Section { TextField("Título del juego", text: $title) }
            ForEach($questions) { $q in
                Section {
                    TextField("Escribe la pregunta", text: $q.question)
                    ForEach(0..<4, id: \.self) { i in
                        HStack {
                            Button { q.correct = i } label: {
                                Image(systemName: q.correct == i ? "checkmark.circle.fill" : "circle")
                                    .foregroundStyle(q.correct == i ? Brand.success : .secondary)
                            }
                            .buttonStyle(.plain)
                            TextField("Opción \(i + 1)", text: $q.options[i])
                        }
                    }
                } header: {
                    Text("Pregunta \((questions.firstIndex { $0.id == q.id } ?? 0) + 1)")
                } footer: {
                    Text("Marca la opción correcta.")
                }
            }
            Section {
                Button { questions.append(NewGameQuestion()) } label: { Label("Agregar pregunta", systemImage: "plus") }
            }
            if let error { Section { Text(error).foregroundStyle(Brand.danger) } }
            Section {
                PrimaryButton(title: "Crear juego", loading: saving) { Task { await submit() } }
                    .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
            }
        }
        .navigationTitle("Crear juego")
        .navigationDestination(item: $createdId) { ControlGameView(gameId: $0) }
    }

    private func submit() async {
        error = nil
        let t = title.trimmingCharacters(in: .whitespaces)
        guard !t.isEmpty else { error = "Ponle un título al juego."; return }
        let clean = questions.map { q -> NewGameQuestion in
            var c = q
            c.question = q.question.trimmingCharacters(in: .whitespaces)
            c.options = q.options.map { $0.trimmingCharacters(in: .whitespaces) }
            return c
        }.filter { !$0.question.isEmpty && $0.options.allSatisfy { !$0.isEmpty } }
        guard !clean.isEmpty else { error = "Agrega al menos una pregunta con 4 opciones."; return }
        saving = true
        defer { saving = false }
        do { createdId = try await api.createGame(title: t, questions: clean) } catch { self.error = error.localizedDescription }
    }
}

private struct ControlGameView: View {
    let gameId: String
    @Environment(\.dismiss) private var dismiss
    @State private var state: HostGameState?
    @State private var busy = false
    private let api = InstructorAPI()

    var body: some View {
        ScrollView {
            if let state {
                VStack(alignment: .leading, spacing: 12) {
                    switch state.game.status {
                    case "waiting":
                        Text("Sala de espera").font(.title2.bold())
                        VStack(spacing: 4) {
                            Text("Código para unirse").font(.footnote).foregroundStyle(.secondary)
                            Text(state.game.code ?? "—").font(.system(size: 36, weight: .heavy, design: .monospaced)).foregroundStyle(Brand.primary)
                        }
                        .frame(maxWidth: .infinity).padding(20).card()
                        Text("Jugadores (\(state.participants.count))").font(.headline)
                        ForEach(state.ranked) { p in playerRow(p.nickname, score: nil) }
                        PrimaryButton(title: "Iniciar juego", loading: busy, disabled: state.participants.isEmpty) { Task { await run { try await api.startGame(gameId) } } }
                    case "finished":
                        Text("Resultados 🏆").font(.title2.bold())
                        ForEach(Array(state.ranked.enumerated()), id: \.element.id) { i, p in
                            playerRow((["🥇", "🥈", "🥉"].indices.contains(i) ? ["🥇", "🥈", "🥉"][i] : "\(i + 1).") + " " + p.nickname, score: p.score)
                        }
                        PrimaryButton(title: "Listo") { dismiss() }
                    default:
                        let total = state.game.questions?.count ?? 0
                        let idx = state.game.currentQuestion ?? 0
                        Text("Pregunta \(idx + 1) de \(total)").foregroundStyle(.secondary)
                        Text(state.currentQ?.question ?? "").font(.title3.bold())
                        Text("Marcador").font(.headline)
                        ForEach(Array(state.ranked.enumerated()), id: \.element.id) { i, p in playerRow("\(i + 1). \(p.nickname)", score: p.score) }
                        PrimaryButton(title: idx >= total - 1 ? "Terminar juego" : "Siguiente pregunta", loading: busy) {
                            Task { await run { idx >= total - 1 ? try await api.finishGame(gameId) : try await api.nextQuestion(gameId) } }
                        }
                    }
                }
                .padding(16)
            } else {
                ProgressView().padding(.top, 40)
            }
        }
        .navigationTitle("Control del juego")
        .navigationBarTitleDisplayMode(.inline)
        .task {
            while !Task.isCancelled {
                if let s = try? await api.hostGame(gameId) { state = s }
                try? await Task.sleep(for: .seconds(2))
            }
        }
    }

    private func playerRow(_ name: String, score: Int?) -> some View {
        HStack {
            Text(name)
            Spacer()
            if let score { Text("\(score)").bold().foregroundStyle(Brand.primary) }
        }
        .padding(12)
        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2)))
    }

    private func run(_ action: () async throws -> Void) async {
        busy = true
        defer { busy = false }
        try? await action()
        if let s = try? await api.hostGame(gameId) { state = s }
    }
}

/// Pizarrón: trazos libres con Canvas, colores, borrador, deshacer y limpiar.
struct WhiteboardView: View {
    private struct Stroke: Identifiable {
        let id = UUID()
        var points: [CGPoint]
        let color: Color
        let width: CGFloat
    }
    private static let colors: [Color] = [Color(hex: 0x111827), Color(hex: 0xDC2626), Color(hex: 0x2563EB), Color(hex: 0x16A34A), Color(hex: 0xF59E0B), Brand.primary]

    @State private var strokes: [Stroke] = []
    @State private var current: Stroke?
    @State private var color = Self.colors[0]
    @State private var eraser = false

    var body: some View {
        VStack(spacing: 0) {
            Canvas { ctx, _ in
                for stroke in strokes + (current.map { [$0] } ?? []) {
                    var path = Path()
                    path.addLines(stroke.points)
                    ctx.stroke(path, with: .color(stroke.color), style: StrokeStyle(lineWidth: stroke.width, lineCap: .round, lineJoin: .round))
                }
            }
            .background(Color.white)
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        if current == nil {
                            current = Stroke(points: [value.location], color: eraser ? .white : color, width: eraser ? 24 : 4)
                        } else {
                            current?.points.append(value.location)
                        }
                    }
                    .onEnded { _ in
                        if let current, current.points.count > 1 { strokes.append(current) }
                        current = nil
                    }
            )
            Divider()
            HStack(spacing: 12) {
                ForEach(Self.colors.indices, id: \.self) { i in
                    Circle().fill(Self.colors[i]).frame(width: 26, height: 26)
                        .overlay(Circle().stroke(Color.primary, lineWidth: !eraser && color == Self.colors[i] ? 2 : 0))
                        .onTapGesture { color = Self.colors[i]; eraser = false }
                }
                Button { eraser.toggle() } label: {
                    Image(systemName: "eraser").foregroundStyle(eraser ? Brand.primary : .secondary)
                }
                Spacer()
                Button { _ = strokes.popLast() } label: { Image(systemName: "arrow.uturn.backward") }.disabled(strokes.isEmpty)
                Button { strokes = [] } label: { Image(systemName: "trash") }.disabled(strokes.isEmpty)
            }
            .padding(12)
        }
        .navigationTitle("Pizarrón")
        .navigationBarTitleDisplayMode(.inline)
    }
}
