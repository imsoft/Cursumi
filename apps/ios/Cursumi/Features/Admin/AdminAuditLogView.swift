import SwiftUI

/// Bitácora de acciones administrativas (últimas 200).
struct AdminAuditLogView: View {
    @State private var logs: [AuditLog] = []
    @State private var loading = true
    @State private var error: String?
    @State private var search = ""
    private let api = AdminAPI()

    private var filtered: [AuditLog] {
        let q = search.trimmingCharacters(in: .whitespaces)
        guard !q.isEmpty else { return logs }
        return logs.filter {
            $0.actionLabel.localizedCaseInsensitiveContains(q) || $0.action.localizedCaseInsensitiveContains(q)
                || ($0.actorEmail ?? "").localizedCaseInsensitiveContains(q) || ($0.targetId ?? "").localizedCaseInsensitiveContains(q)
                || ($0.metadataSummary ?? "").localizedCaseInsensitiveContains(q)
        }
    }

    var body: some View {
        List {
            if let error { Text(error).foregroundStyle(Brand.danger) }
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if filtered.isEmpty {
                EmptyState(title: logs.isEmpty ? "La bitácora está vacía." : "Sin resultados")
            }
            ForEach(filtered) { log in
                VStack(alignment: .leading, spacing: 4) {
                    HStack(alignment: .top) {
                        Text(log.actionLabel).font(.headline)
                        Spacer()
                        Text(log.createdAt, style: .relative).font(.caption2).foregroundStyle(.tertiary)
                    }
                    Text(log.actorEmail ?? log.actorId).font(.footnote).foregroundStyle(.secondary).lineLimit(1)
                    if let target = targetLine(log) {
                        Text(target).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                    }
                    if let meta = log.metadataSummary {
                        Text(meta).font(.caption.monospaced()).foregroundStyle(.secondary).lineLimit(3)
                    }
                    if let ip = log.ip, !ip.isEmpty {
                        Text("IP \(ip) · \(Formatting.shortDate(log.createdAt))").font(.caption2).foregroundStyle(.tertiary)
                    }
                }
                .padding(.vertical, 4)
            }
        }
        .searchable(text: $search, prompt: "Acción, correo o destino")
        .navigationTitle("Bitácora")
        .refreshable { await load() }
        .task { await load(); loading = false }
    }

    private func targetLine(_ log: AuditLog) -> String? {
        let parts = [log.targetType, log.targetId].compactMap { $0 }.filter { !$0.isEmpty }
        return parts.isEmpty ? nil : parts.joined(separator: " · ")
    }

    private func load() async {
        error = nil
        do { logs = try await api.auditLogs(limit: 200) } catch { self.error = "No se pudo cargar la bitácora." }
    }
}
