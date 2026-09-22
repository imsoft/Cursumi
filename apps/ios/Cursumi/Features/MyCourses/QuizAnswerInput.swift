import SwiftUI

/// Entrada de respuesta para los 5 tipos de pregunta.
struct QuizAnswerInput: View {
    let type: QuizQuestionType
    /// ordenar: elementos (se barajan al mostrar). relacionar: columna izquierda.
    let options: [String]
    /// relacionar: columna derecha (pool de parejas a elegir).
    let matchRight: [String]
    @Binding var answer: QuizAnswer?
    var disabled = false

    /// Orden inicial barajado (ordenar) o pool derecho barajado (relacionar),
    /// fijado una sola vez por pregunta.
    @State private var shuffled: [String] = []

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            switch type {
            case .checkbox: checkbox
            case .ordering: ordering
            case .matching: matching
            default: single
            }
        }
        .onAppear {
            if shuffled.isEmpty {
                shuffled = (type == .matching ? matchRight : options).shuffled()
                // Una pregunta de ordenar siempre tiene respuesta: el orden visible.
                if type == .ordering, answer == nil { answer = .texts(shuffled) }
            }
        }
    }

    // MARK: Opción múltiple / verdadero-falso

    private var single: some View {
        ForEach(options.indices, id: \.self) { i in
            let selected = answer == .index(i)
            OptionRow(text: options[i], selected: selected, disabled: disabled) { answer = .index(i) }
        }
    }

    // MARK: Casillas

    private var checkbox: some View {
        let selected: [Int] = { if case .indices(let a) = answer { return a }; return [] }()
        return Group {
            Text("Selecciona todas las que apliquen.").font(.caption).foregroundStyle(.secondary)
            ForEach(options.indices, id: \.self) { i in
                let isSel = selected.contains(i)
                OptionRow(text: options[i], selected: isSel, disabled: disabled, checkbox: true) {
                    answer = .indices(isSel ? selected.filter { $0 != i } : selected + [i])
                }
            }
        }
    }

    // MARK: Ordenar

    private var ordering: some View {
        let order: [String] = { if case .texts(let a) = answer { return a }; return shuffled }()
        return Group {
            Text("Ordena los elementos con las flechas.").font(.caption).foregroundStyle(.secondary)
            ForEach(order.indices, id: \.self) { i in
                HStack(spacing: 10) {
                    Text("\(i + 1).").bold().foregroundStyle(Brand.primary).frame(width: 22, alignment: .leading)
                    Text(order[i]).frame(maxWidth: .infinity, alignment: .leading)
                    HStack(spacing: 14) {
                        arrow("arrow.up", enabled: i > 0) { move(order, i, i - 1) }
                        arrow("arrow.down", enabled: i < order.count - 1) { move(order, i, i + 1) }
                    }
                }
                .padding(12)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.3)))
            }
        }
    }

    private func move(_ order: [String], _ from: Int, _ to: Int) {
        guard !disabled, to >= 0, to < order.count else { return }
        var next = order
        next.swapAt(from, to)
        answer = .texts(next)
    }

    private func arrow(_ symbol: String, enabled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: symbol).font(.body.bold()).foregroundStyle(Brand.primary)
        }
        .buttonStyle(.plain)
        .disabled(disabled || !enabled)
        .opacity(disabled || !enabled ? 0.25 : 1)
    }

    // MARK: Relacionar

    private var matching: some View {
        let picks: [String] = { if case .texts(let a) = answer { return a }; return [] }()
        return Group {
            Text("Toca la pareja correcta de cada elemento.").font(.caption).foregroundStyle(.secondary)
            ForEach(options.indices, id: \.self) { li in
                VStack(alignment: .leading, spacing: 8) {
                    Text(options[li]).font(.subheadline.weight(.semibold))
                    FlowLayout(spacing: 8) {
                        ForEach(shuffled, id: \.self) { right in
                            let chosen = li < picks.count && picks[li] == right
                            Button {
                                var next = (0..<options.count).map { $0 < picks.count ? picks[$0] : "" }
                                next[li] = right
                                answer = .texts(next)
                            } label: {
                                Text(right)
                                    .font(.subheadline.weight(chosen ? .bold : .regular))
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 7)
                                    .background(chosen ? Brand.primary : .clear)
                                    .foregroundStyle(chosen ? .white : .primary)
                                    .overlay(Capsule().stroke(chosen ? Brand.primary : Color.gray.opacity(0.4)))
                                    .clipShape(Capsule())
                            }
                            .buttonStyle(.plain)
                            .disabled(disabled)
                        }
                    }
                }
                .padding(12)
                .overlay(RoundedRectangle(cornerRadius: 10).stroke(Color.gray.opacity(0.3)))
            }
        }
    }
}

private struct OptionRow: View {
    let text: String
    let selected: Bool
    let disabled: Bool
    var checkbox = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                if checkbox {
                    RoundedRectangle(cornerRadius: 5)
                        .stroke(selected ? Brand.primary : Color.gray.opacity(0.5), lineWidth: 1.5)
                        .background(RoundedRectangle(cornerRadius: 5).fill(selected ? Brand.primary : .clear))
                        .frame(width: 20, height: 20)
                        .overlay { if selected { Image(systemName: "checkmark").font(.caption2.bold()).foregroundStyle(.white) } }
                }
                Text(text).frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .background(selected ? Brand.primary.opacity(0.08) : .clear)
            .overlay(RoundedRectangle(cornerRadius: 10).stroke(selected ? Brand.primary : Color.gray.opacity(0.3)))
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .disabled(disabled)
    }
}

/// Layout de chips que salta de línea.
struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let width = proposal.width ?? .infinity
        var x: CGFloat = 0, y: CGFloat = 0, rowHeight: CGFloat = 0
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x + size.width > width, x > 0 {
                x = 0; y += rowHeight + spacing; rowHeight = 0
            }
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
        return CGSize(width: width == .infinity ? x : width, height: y + rowHeight)
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        var x = bounds.minX, y = bounds.minY, rowHeight: CGFloat = 0
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x + size.width > bounds.maxX, x > bounds.minX {
                x = bounds.minX; y += rowHeight + spacing; rowHeight = 0
            }
            view.place(at: CGPoint(x: x, y: y), proposal: .unspecified)
            x += size.width + spacing
            rowHeight = max(rowHeight, size.height)
        }
    }
}

/// Tarjeta con el resultado de un quiz o examen.
struct ResultCard: View {
    let score: Int
    let passed: Bool
    var message: String? = nil
    var extra: String? = nil

    var body: some View {
        VStack(spacing: 4) {
            Text("Tu resultado: \(score)%").font(.headline)
            Text(message ?? (passed ? "¡Aprobado!" : "No alcanzaste el mínimo.")).foregroundStyle(.secondary)
            if let extra { Text(extra).font(.subheadline.weight(.semibold)).foregroundStyle(Brand.success) }
        }
        .frame(maxWidth: .infinity)
        .padding(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(passed ? Brand.success : Brand.danger, lineWidth: 2))
    }
}

/// Tarjeta de pregunta con su número y, tras enviar, la corrección.
struct QuestionCard<Content: View>: View {
    let number: Int
    let text: String
    var graded: Bool? = nil
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("\(number). \(text)").font(.body.weight(.semibold))
            content
            if let graded {
                Text(graded ? "✓ Correcto" : "✗ Incorrecto")
                    .font(.footnote.bold())
                    .foregroundStyle(graded ? Brand.success : Brand.danger)
            }
        }
        .padding(16)
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.gray.opacity(0.2)))
    }
}

/// Botón secundario con borde morado.
struct GhostButton: View {
    let title: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title).font(.headline).foregroundStyle(Brand.primary)
                .frame(maxWidth: .infinity).padding(.vertical, 14)
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(Brand.primary))
        }
    }
}
