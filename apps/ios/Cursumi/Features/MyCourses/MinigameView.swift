import SwiftUI

/// Minijuegos de sección: memoria, ahorcado, ordenar y emparejar.
struct MinigameView: View {
    let lesson: Lesson
    let onCompleted: (String) -> Void

    @State private var game: Minigame?
    @State private var won = false
    private let api = StudentAPI()

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            if let game {
                if let instruction = game.instruction, !instruction.isEmpty {
                    Text(instruction).font(.subheadline.weight(.medium))
                }
                if won {
                    Text("¡Completado! 🎉").font(.headline)
                        .frame(maxWidth: .infinity).padding(20)
                        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Brand.success, lineWidth: 2))
                } else {
                    switch game {
                    case .memory(_, let pairs): MemoryGame(pairs: pairs, onWin: win)
                    case .hangman(_, let words): HangmanGame(words: words, onWin: win)
                    case .sort(_, let items): SortGame(items: items, onWin: win)
                    case .match(_, let pairs): MatchGame(pairs: pairs, onWin: win)
                    }
                }
            } else {
                Text("Este minijuego no está disponible.").italic().foregroundStyle(.secondary)
            }
        }
        .onAppear { game = Minigame.parse(lesson.sectionMinigame) }
    }

    private func win() {
        won = true
        Task {
            if let sectionId = lesson.sectionId {
                try? await api.completeMinigame(sectionId: sectionId, courseId: lesson.courseId)
            }
            onCompleted(lesson.id)
        }
    }
}

// MARK: - Memoria

private struct MemoryGame: View {
    struct Card: Identifiable { let id: String; let pair: Int; let label: String }
    let pairs: [Minigame.Pair]
    let onWin: () -> Void

    @State private var cards: [Card] = []
    @State private var flipped: [String] = []
    @State private var matched: Set<String> = []
    @State private var busy = false

    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
            ForEach(cards) { card in
                Button { tap(card) } label: { face(card) }
                    .buttonStyle(.plain)
            }
        }
        .onAppear {
            if cards.isEmpty {
                cards = pairs.enumerated().flatMap { i, p in
                    [Card(id: "\(i)-t", pair: i, label: p.term), Card(id: "\(i)-d", pair: i, label: p.definition)]
                }.shuffled()
            }
        }
    }

    private func face(_ card: Card) -> some View {
        let isMatched = matched.contains(card.id)
        let show = isMatched || flipped.contains(card.id)
        let background: Color = isMatched ? Brand.success.opacity(0.15) : show ? Color.gray.opacity(0.12) : Brand.primary
        return Text(show ? card.label : "?")
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(show ? Color.primary : Color.white)
            .multilineTextAlignment(.center)
            .lineLimit(4)
            .padding(10)
            .frame(maxWidth: .infinity, minHeight: 80)
            .background(background)
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(isMatched ? Brand.success : Color.clear))
            .clipShape(RoundedRectangle(cornerRadius: 12))
    }

    private func tap(_ card: Card) {
        guard !busy, !matched.contains(card.id), !flipped.contains(card.id) else { return }
        flipped.append(card.id)
        guard flipped.count == 2,
              let a = cards.first(where: { $0.id == flipped[0] }),
              let b = cards.first(where: { $0.id == flipped[1] }) else { return }
        busy = true
        let match = a.pair == b.pair
        Task {
            try? await Task.sleep(for: .milliseconds(match ? 350 : 800))
            if match {
                matched.formUnion([a.id, b.id])
                if matched.count == cards.count { onWin() }
            }
            flipped = []
            busy = false
        }
    }
}

// MARK: - Ahorcado

private struct HangmanGame: View {
    let words: [Minigame.Word]
    let onWin: () -> Void

    private static let alphabet = Array("ABCDEFGHIJKLMNÑOPQRSTUVWXYZ")
    @State private var wordIndex = 0
    @State private var guessed: Set<Character> = []
    @State private var wrong = 0

    private var current: Minigame.Word { words[wordIndex] }
    private var target: String { normalizedLetters(current.word) }
    private var solved: Bool { target.filter(\.isLetter).allSatisfy { guessed.contains($0) } }
    private var dead: Bool { wrong >= 6 }

    var body: some View {
        VStack(spacing: 12) {
            Text("Pista: \(current.hint)").italic().foregroundStyle(.secondary).frame(maxWidth: .infinity, alignment: .leading)
            Text(masked).font(.system(size: 26, weight: .heavy)).kerning(2).frame(maxWidth: .infinity)
            Text("Errores: \(wrong) / 6").foregroundStyle(.secondary)
            if solved {
                PrimaryButton(title: wordIndex + 1 >= words.count ? "Terminar" : "Siguiente palabra") { next() }
            } else if dead {
                Text("La palabra era: \(current.word)").foregroundStyle(Brand.danger)
                GhostButton(title: "Reintentar") { guessed = []; wrong = 0 }
            } else {
                FlowLayout(spacing: 6) {
                    ForEach(Self.alphabet, id: \.self) { letter in
                        let used = guessed.contains(letter)
                        Button { guess(letter) } label: {
                            Text(String(letter)).font(.body.bold())
                                .frame(width: 34, height: 42)
                                .background(used ? Color.gray.opacity(0.2) : .clear)
                                .overlay(RoundedRectangle(cornerRadius: 8).stroke(Color.gray.opacity(0.3)))
                                .opacity(used ? 0.5 : 1)
                        }
                        .buttonStyle(.plain)
                        .disabled(used)
                    }
                }
            }
        }
    }

    private var masked: String {
        current.word.map { ch -> String in
            guard ch.isLetter else { return String(ch) }
            let n = normalizedLetters(String(ch)).first ?? ch
            return guessed.contains(n) ? String(ch) : "_"
        }.joined(separator: " ")
    }

    private func guess(_ letter: Character) {
        guard !guessed.contains(letter), !solved, !dead else { return }
        guessed.insert(letter)
        if !target.contains(letter) { wrong += 1 }
    }

    private func next() {
        if wordIndex + 1 >= words.count { onWin(); return }
        wordIndex += 1
        guessed = []
        wrong = 0
    }
}

// MARK: - Ordenar

private struct SortGame: View {
    let items: [String]
    let onWin: () -> Void

    @State private var order: [String] = []
    @State private var wrong = false

    var body: some View {
        VStack(spacing: 10) {
            ForEach(order.indices, id: \.self) { i in
                HStack(spacing: 10) {
                    Text("\(i + 1)").font(.body.bold()).foregroundStyle(Brand.primary).frame(width: 20)
                    Text(order[i]).frame(maxWidth: .infinity, alignment: .leading)
                    VStack(spacing: 2) {
                        Button { move(i, -1) } label: { Image(systemName: "arrowtriangle.up.fill") }
                            .disabled(i == 0).opacity(i == 0 ? 0.25 : 1)
                        Button { move(i, 1) } label: { Image(systemName: "arrowtriangle.down.fill") }
                            .disabled(i == order.count - 1).opacity(i == order.count - 1 ? 0.25 : 1)
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(Brand.primary)
                }
                .padding(12)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.gray.opacity(0.2)))
            }
            if wrong { Text("Aún no es el orden correcto.").foregroundStyle(Brand.danger) }
            PrimaryButton(title: "Comprobar") {
                if order == items { onWin() } else { wrong = true }
            }
        }
        .onAppear {
            if order.isEmpty {
                var s = items.shuffled()
                // Evitar empezar ya ordenado.
                if s == items { s = items.shuffled() }
                order = s
            }
        }
    }

    private func move(_ i: Int, _ dir: Int) {
        let j = i + dir
        guard j >= 0, j < order.count else { return }
        order.swapAt(i, j)
        wrong = false
    }
}

// MARK: - Emparejar

private struct MatchGame: View {
    let pairs: [Minigame.MatchPair]
    let onWin: () -> Void

    @State private var rights: [(right: String, index: Int)] = []
    @State private var selectedLeft: Int?
    @State private var matched: Set<Int> = []
    @State private var bad: Int?

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            VStack(spacing: 8) {
                ForEach(pairs.indices, id: \.self) { i in
                    item(pairs[i].left, selected: selectedLeft == i, done: matched.contains(i), bad: false) {
                        if !matched.contains(i) { selectedLeft = i }
                    }
                }
            }
            VStack(spacing: 8) {
                ForEach(rights.indices, id: \.self) { j in
                    item(rights[j].right, selected: false, done: matched.contains(rights[j].index), bad: bad == j) { tapRight(j) }
                }
            }
        }
        .onAppear {
            if rights.isEmpty { rights = pairs.enumerated().map { ($0.element.right, $0.offset) }.shuffled() }
        }
    }

    private func item(_ text: String, selected: Bool, done: Bool, bad: Bool, action: @escaping () -> Void) -> some View {
        let fill: Color = done ? Brand.success.opacity(0.12) : bad ? Brand.danger.opacity(0.08) : selected ? Brand.primary.opacity(0.08) : Color.clear
        let stroke: Color = done ? Brand.success : bad ? Brand.danger : selected ? Brand.primary : Color.gray.opacity(0.3)
        return Button(action: action) {
            Text(text).lineLimit(3)
                .frame(maxWidth: .infinity, minHeight: 56, alignment: .leading)
                .padding(12)
                .background(fill)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(stroke))
        }
        .buttonStyle(.plain)
        .disabled(done)
    }

    private func tapRight(_ j: Int) {
        guard let left = selectedLeft, !matched.contains(left) else { return }
        if rights[j].index == left {
            matched.insert(left)
            selectedLeft = nil
            if matched.count == pairs.count { onWin() }
        } else {
            bad = j
            Task {
                try? await Task.sleep(for: .milliseconds(500))
                bad = nil
            }
        }
    }
}
