import SwiftUI

/// Alumnos inscritos en los cursos del instructor, agrupados por curso.
struct InstructorStudentsView: View {
    @State private var courses: [InstructorCourseStudents] = []
    @State private var loading = true
    @State private var error: String?
    @State private var search = ""
    private let api = InstructorAPI()

    /// Cursos con solo los alumnos que coinciden con la búsqueda (por nombre, correo o curso).
    private var filtered: [InstructorCourseStudents] {
        let q = search.trimmingCharacters(in: .whitespaces)
        guard !q.isEmpty else { return courses }
        return courses.compactMap { course in
            if course.courseTitle.localizedCaseInsensitiveContains(q) { return course }
            let students = course.students.filter {
                ($0.studentName ?? "").localizedCaseInsensitiveContains(q) || ($0.studentEmail ?? "").localizedCaseInsensitiveContains(q)
            }
            return students.isEmpty ? nil : InstructorCourseStudents(courseId: course.courseId, courseTitle: course.courseTitle, modality: course.modality, status: course.status, students: students)
        }
    }

    private var total: Int { courses.reduce(0) { $0 + $1.students.count } }

    var body: some View {
        List {
            if let error { Text(error).foregroundStyle(Brand.danger) }
            if loading {
                ProgressView().frame(maxWidth: .infinity)
            } else if filtered.isEmpty {
                EmptyState(title: courses.isEmpty ? "Aún no tienes alumnos" : "Sin resultados",
                           message: courses.isEmpty ? "Cuando alguien se inscriba a tus cursos aparecerá aquí." : nil)
            } else if search.isEmpty {
                Section { Text("\(total) alumnos en \(courses.count) cursos").font(.footnote).foregroundStyle(.secondary) }
            }
            ForEach(filtered) { course in
                Section {
                    if course.students.isEmpty {
                        Text("Sin inscritos.").font(.footnote).foregroundStyle(.secondary)
                    }
                    ForEach(course.students) { s in
                        StudentRow(student: s)
                    }
                } header: {
                    HStack {
                        Text(course.courseTitle)
                        Spacer()
                        Text("\(course.students.count)")
                    }
                }
            }
        }
        .searchable(text: $search, prompt: "Nombre, correo o curso")
        .refreshable { await load() }
        .task { await load(); loading = false }
    }

    private func load() async {
        error = nil
        do { courses = try await api.students() } catch { self.error = "No se pudieron cargar tus alumnos." }
    }
}

private struct StudentRow: View {
    let student: InstructorStudent

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(student.studentName ?? "Estudiante").font(.headline)
                    if let email = student.studentEmail, !email.isEmpty {
                        Text(email).font(.footnote).foregroundStyle(.secondary).lineLimit(1)
                    }
                }
                Spacer()
                Text("\(student.progressPercent)%").font(.subheadline.bold()).foregroundStyle(student.progressPercent >= 100 ? Brand.success : Brand.primary)
            }
            ProgressView(value: Double(student.progressPercent), total: 100).tint(student.progressPercent >= 100 ? Brand.success : Brand.primary)
            Text("Inscrito el \(Formatting.shortDate(student.enrolledAt))" + statusSuffix)
                .font(.caption).foregroundStyle(.tertiary)
        }
        .padding(.vertical, 4)
    }

    private var statusSuffix: String {
        guard let status = student.status, !status.isEmpty else { return "" }
        let label = ["active": "activo", "completed": "completado", "in-progress": "en progreso", "cancelled": "cancelado"][status] ?? status
        return " · \(label)"
    }
}
