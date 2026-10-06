import SwiftUI

/// Planeación didáctica del instructor: reutiliza los editores de la web dentro
/// del visor con sesión (`WebSectionView`), que también recibe el PDF generado
/// por la web y lo ofrece para compartir.
struct PlanningWebView: View {
    let courseId: String

    var body: some View {
        WebSectionView(path: "/instructor/courses/\(courseId)/planning", title: "Planeación didáctica")
    }
}
