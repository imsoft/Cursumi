import PhotosUI
import SwiftUI

struct ProfileView: View {
    @Environment(SessionStore.self) private var session
    @State private var profile: MyProfile?
    @State private var loading = true
    @State private var error: String?
    @State private var editing = false
    @State private var signingOut = false
    @State private var avatarItem: PhotosPickerItem?
    @State private var uploadingAvatar = false
    private let api = StudentAPI()

    private var name: String { profile?.fullName ?? session.user?.name ?? "Usuario" }
    private var email: String { profile?.email ?? session.user?.email ?? "" }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                header
                List {
                    if let profile {
                        Section {
                            HStack(spacing: 12) {
                                stat(profile.coursesInProgress, "En progreso")
                                stat(profile.coursesCompleted, "Completados")
                            }
                            .listRowBackground(Color.clear)
                            .listRowInsets(EdgeInsets())
                        }
                        if !profile.bio.isEmpty || !profile.city.isEmpty {
                            Section("Sobre ti") {
                                if !profile.bio.isEmpty { Text(profile.bio) }
                                if !profile.city.isEmpty || !profile.state.isEmpty {
                                    Label([profile.city, profile.state].filter { !$0.isEmpty }.joined(separator: ", "), systemImage: "mappin")
                                }
                            }
                        }
                    }
                    Section {
                        NavigationLink { NotificationsView() } label: { Label("Notificaciones", systemImage: "bell") }
                        NavigationLink { CertificatesView() } label: { Label("Certificados", systemImage: "rosette") }
                        NavigationLink { WishlistView() } label: { Label("Lista de deseos", systemImage: "heart") }
                        Button { editing = true } label: { Label("Editar perfil", systemImage: "pencil") }
                    }
                    if let error {
                        Section { Text(error).foregroundStyle(Brand.danger) }
                    }
                    Section {
                        Button(role: .destructive) {
                            Task { signingOut = true; await session.signOut() }
                        } label: {
                            HStack {
                                Label("Cerrar sesión", systemImage: "rectangle.portrait.and.arrow.right")
                                if signingOut { Spacer(); ProgressView() }
                            }
                        }
                        .disabled(signingOut)
                    }
                }
                .listStyle(.insetGrouped)
                .refreshable { await load() }
            }
            .toolbar(.hidden, for: .navigationBar)
            .sheet(isPresented: $editing) {
                if let profile {
                    EditProfileView(profile: profile) { await load() }
                }
            }
        }
        .task { await load(); loading = false }
        .onChange(of: avatarItem) { _, item in
            guard let item else { return }
            Task { await upload(item) }
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Perfil").font(.system(size: 30, weight: .heavy)).foregroundStyle(.white)
            HStack(spacing: 14) {
                PhotosPicker(selection: $avatarItem, matching: .images) {
                    ZStack(alignment: .bottomTrailing) {
                        avatar
                        Circle().fill(Brand.vivid).frame(width: 24, height: 24)
                            .overlay {
                                if uploadingAvatar {
                                    ProgressView().tint(.white).scaleEffect(0.6)
                                } else {
                                    Image(systemName: "pencil").font(.caption2.bold()).foregroundStyle(.white)
                                }
                            }
                    }
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(name).font(.headline).foregroundStyle(.white)
                    Text(email).font(.footnote).foregroundStyle(.white.opacity(0.85))
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 20)
        .padding(.top, 20)
        .padding(.bottom, 24)
        .background(Brand.gradient)
        .clipShape(UnevenRoundedRectangle(bottomLeadingRadius: 24, bottomTrailingRadius: 24))
    }

    @ViewBuilder
    private var avatar: some View {
        if let raw = profile?.avatar, let url = URL(string: raw) {
            AsyncImage(url: url) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                Circle().fill(.white.opacity(0.3))
            }
            .frame(width: 64, height: 64)
            .clipShape(Circle())
        } else {
            Circle().fill(.white.opacity(0.25)).frame(width: 64, height: 64)
                .overlay { Text(Formatting.initials(name)).font(.title3.bold()).foregroundStyle(.white) }
        }
    }

    private func stat(_ value: Int, _ label: String) -> some View {
        VStack(spacing: 4) {
            Text("\(value)").font(.title.bold()).foregroundStyle(Brand.primary)
            Text(label).font(.caption).foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .card()
    }

    private func load() async {
        error = nil
        do {
            profile = try await api.profile()
        } catch {
            self.error = "No se pudo cargar tu perfil."
        }
    }

    private func upload(_ item: PhotosPickerItem) async {
        uploadingAvatar = true
        defer { uploadingAvatar = false; avatarItem = nil }
        guard let data = try? await item.loadTransferable(type: Data.self),
              let image = UIImage(data: data),
              let jpeg = image.resized(maxSide: 800).jpegData(compressionQuality: 0.7) else { return }
        do {
            try await api.uploadAvatar(jpeg: jpeg)
            await load()
        } catch {
            self.error = "No se pudo actualizar la foto."
        }
    }
}

private extension UIImage {
    func resized(maxSide: CGFloat) -> UIImage {
        let scale = min(1, maxSide / max(size.width, size.height))
        guard scale < 1 else { return self }
        let target = CGSize(width: size.width * scale, height: size.height * scale)
        return UIGraphicsImageRenderer(size: target).image { _ in draw(in: CGRect(origin: .zero, size: target)) }
    }
}

struct EditProfileView: View {
    let profile: MyProfile
    let onSaved: () async -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var fullName: String
    @State private var phone: String
    @State private var city: String
    @State private var state: String
    @State private var bio: String
    @State private var website: String
    @State private var linkedinUrl: String
    @State private var instagramUrl: String
    @State private var saving = false
    @State private var error: String?
    private let api = StudentAPI()

    init(profile: MyProfile, onSaved: @escaping () async -> Void) {
        self.profile = profile
        self.onSaved = onSaved
        _fullName = State(initialValue: profile.fullName)
        _phone = State(initialValue: profile.phone)
        _city = State(initialValue: profile.city)
        _state = State(initialValue: profile.state)
        _bio = State(initialValue: profile.bio)
        _website = State(initialValue: profile.website)
        _linkedinUrl = State(initialValue: profile.linkedinUrl)
        _instagramUrl = State(initialValue: profile.instagramUrl)
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Datos") {
                    TextField("Nombre completo", text: $fullName).textContentType(.name)
                    TextField("Teléfono", text: $phone).keyboardType(.phonePad)
                    TextField("Ciudad", text: $city)
                    TextField("Estado", text: $state)
                }
                Section("Bio") {
                    TextField("Cuéntanos de ti", text: $bio, axis: .vertical).lineLimit(3...6)
                }
                Section("Enlaces") {
                    TextField("Sitio web", text: $website).keyboardType(.URL).textInputAutocapitalization(.never)
                    TextField("LinkedIn (URL)", text: $linkedinUrl).keyboardType(.URL).textInputAutocapitalization(.never)
                    TextField("Instagram (URL)", text: $instagramUrl).keyboardType(.URL).textInputAutocapitalization(.never)
                }
                if let error {
                    Section { Text(error).foregroundStyle(Brand.danger) }
                }
            }
            .navigationTitle("Editar perfil")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Cancelar") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    if saving { ProgressView() } else { Button("Guardar") { Task { await save() } } }
                }
            }
        }
    }

    private func save() async {
        error = nil
        saving = true
        defer { saving = false }
        func clean(_ s: String) -> String? {
            let t = s.trimmingCharacters(in: .whitespaces)
            return t.isEmpty ? nil : t
        }
        do {
            try await api.updateProfile(ProfileUpdate(
                fullName: clean(fullName),
                phone: clean(phone) ?? "",
                state: clean(state) ?? "",
                city: clean(city) ?? "",
                bio: clean(bio) ?? "",
                website: clean(website) ?? "",
                linkedinUrl: clean(linkedinUrl) ?? "",
                instagramUrl: clean(instagramUrl) ?? ""
            ))
            await onSaved()
            dismiss()
        } catch {
            self.error = error.localizedDescription
        }
    }
}
