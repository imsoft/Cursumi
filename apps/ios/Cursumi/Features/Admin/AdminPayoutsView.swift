import SwiftUI

/// Pagos pendientes a instructores: transferir por Stripe o registrar a mano.
struct AdminPayoutsView: View {
    @State private var data: AdminPayouts?
    @State private var loading = true
    @State private var error: String?
    @State private var busy: String?
    @State private var confirmTransfer: AdminPayoutRow?
    @State private var markingPaid: AdminPayoutRow?
    @State private var note = ""
    private let api = AdminAPI()

    var body: some View {
        List {
            if let error { Section { Text(error).foregroundStyle(Brand.danger) } }
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if let data {
                Section {
                    VStack(spacing: 4) {
                        Text("Pendiente por pagar").font(.footnote).foregroundStyle(.secondary)
                        Text(Formatting.centsMXN(data.totalPendingCents)).font(.system(size: 28, weight: .heavy)).foregroundStyle(Brand.primary)
                    }
                    .frame(maxWidth: .infinity).padding(.vertical, 8)
                    .listRowBackground(Color.clear)
                }
                if data.groups.isEmpty {
                    EmptyState(title: "No hay pagos pendientes.")
                }
                ForEach(data.groups) { group in
                    Section {
                        ForEach(group.rows) { row in
                            payoutRow(row, group: group)
                        }
                    } header: {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(group.instructorName ?? group.instructorEmail ?? "Instructor")
                            Text(Formatting.centsMXN(group.pendingCents) + (group.stripeOnboarded ? " · Stripe listo" : " · Sin Stripe"))
                                .font(.caption).foregroundStyle(group.stripeOnboarded ? Brand.success : Brand.warning)
                        }
                    } footer: {
                        if let email = group.instructorEmail { Text(email) }
                    }
                }
            }
        }
        .navigationTitle("Pagos a instructores")
        .refreshable { await load() }
        .task { await load(); loading = false }
        .confirmationDialog(
            "¿Transferir \(Formatting.centsMXN(confirmTransfer?.instructorAmountCents ?? 0)) por Stripe?",
            isPresented: Binding(get: { confirmTransfer != nil }, set: { if !$0 { confirmTransfer = nil } }),
            titleVisibility: .visible
        ) {
            Button("Transferir", role: .destructive) {
                if let row = confirmTransfer { Task { await transfer(row) } }
                confirmTransfer = nil
            }
            Button("Cancelar", role: .cancel) { confirmTransfer = nil }
        } message: {
            Text("Mueve dinero real a la cuenta de Stripe del instructor. No se puede deshacer.")
        }
        .sheet(item: $markingPaid) { row in
            markPaidSheet(row)
        }
    }

    private func payoutRow(_ row: AdminPayoutRow, group: AdminPayoutGroup) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(row.courseTitle ?? "Curso").font(.headline).lineLimit(2)
                    Text("\(row.studentName ?? "Alumno") · \(Formatting.shortDate(row.createdAt))").font(.footnote).foregroundStyle(.secondary)
                }
                Spacer()
                VStack(alignment: .trailing, spacing: 2) {
                    Text(Formatting.centsMXN(row.instructorAmountCents)).font(.subheadline.bold()).foregroundStyle(Brand.primary)
                    Text("de \(Formatting.centsMXN(row.amountCents))").font(.caption2).foregroundStyle(.tertiary)
                }
            }
            if busy == row.id {
                ProgressView()
            } else {
                HStack {
                    if group.stripeOnboarded {
                        Button("Transferir") { confirmTransfer = row }.buttonStyle(.borderedProminent).tint(Brand.primary)
                    }
                    Button("Registrar pago") { note = ""; markingPaid = row }.buttonStyle(.bordered)
                }
            }
        }
        .padding(.vertical, 4)
    }

    private func markPaidSheet(_ row: AdminPayoutRow) -> some View {
        NavigationStack {
            Form {
                Section {
                    Text("\(row.courseTitle ?? "Curso") · \(Formatting.centsMXN(row.instructorAmountCents))").font(.headline)
                    TextField("Nota (referencia, fecha, medio…)", text: $note, axis: .vertical).lineLimit(2...5)
                } footer: {
                    Text("Úsalo cuando ya pagaste fuera de Stripe (transferencia bancaria, efectivo). No mueve dinero.")
                }
                Section {
                    PrimaryButton(title: "Registrar como pagado", disabled: note.trimmingCharacters(in: .whitespaces).isEmpty) {
                        markingPaid = nil
                        Task { await markPaid(row) }
                    }
                    .listRowBackground(Color.clear).listRowInsets(EdgeInsets())
                }
            }
            .navigationTitle("Registrar pago")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { ToolbarItem(placement: .cancellationAction) { Button("Cancelar") { markingPaid = nil } } }
        }
        .presentationDetents([.medium])
    }

    private func load() async {
        error = nil
        do { data = try await api.payouts() } catch { self.error = "No se pudieron cargar los pagos." }
    }

    private func transfer(_ row: AdminPayoutRow) async {
        await act(row) { try await api.transferPayout(row.transactionId) }
    }

    private func markPaid(_ row: AdminPayoutRow) async {
        await act(row) { try await api.markPayoutPaid(row.transactionId, note: note.trimmingCharacters(in: .whitespacesAndNewlines)) }
    }

    /// Ejecuta la acción y recarga; un 409 trae el motivo del servidor (ya no estaba pendiente).
    private func act(_ row: AdminPayoutRow, _ f: () async throws -> Void) async {
        busy = row.id
        error = nil
        defer { busy = nil }
        do {
            try await f()
        } catch APIError.http(let status, let message) {
            self.error = message ?? (status == 409 ? "Este pago ya no está pendiente." : "No se pudo completar la acción (HTTP \(status)).")
        } catch {
            self.error = error.localizedDescription
        }
        await load()
    }
}
