import Foundation

// Formas de la API de Cursumi.

/// `category` llega como string o como `{ name }` según el endpoint.
enum CategoryRef: Decodable, Equatable {
    case name(String)
    case object(String?)

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let raw = try? container.decode(String.self) {
            self = .name(raw)
        } else if let obj = try? container.decode([String: String?].self) {
            self = .object(obj["name"] ?? nil)
        } else {
            self = .object(nil)
        }
    }

    var label: String? {
        switch self {
        case .name(let n): return n
        case .object(let n): return n
        }
    }
}

struct StudentCourse: Decodable, Identifiable, Equatable {
    let id: String
    let title: String
    let modality: String?
    let progress: Double
    let instructorName: String
    let category: CategoryRef?
    let status: String
    let imageUrl: String?
    let lastLessonId: String?
    let lastLessonTitle: String?

    var isCompleted: Bool { status == "completed" }
}

struct CourseSummary: Decodable, Identifiable, Equatable {
    let id: String
    let title: String
    let price: Double
    let modality: String?
    let slug: String?
    let imageUrl: String?
}

/// `/api/courses` devuelve `{ courses, ... }` o un array; normalizamos.
struct CourseListResponse: Decodable {
    let courses: [CourseSummary]

    init(from decoder: Decoder) throws {
        if let list = try? decoder.singleValueContainer().decode([CourseSummary].self) {
            courses = list
            return
        }
        let container = try decoder.container(keyedBy: Keys.self)
        courses = (try? container.decode([CourseSummary].self, forKey: .courses))
            ?? (try? container.decode([CourseSummary].self, forKey: .data))
            ?? []
    }

    private enum Keys: String, CodingKey { case courses, data }
}

struct CourseLesson: Decodable, Identifiable, Equatable {
    let id: String
    let title: String
    let type: String?
}

struct CourseSection: Decodable, Identifiable, Equatable {
    let id: String
    let title: String
    let lessons: [CourseLesson]
}

struct StudentCourseDetail: Decodable {
    struct Course: Decodable {
        struct Instructor: Decodable { let name: String? }
        let title: String
        let description: String?
        let instructor: Instructor?
        let sections: [CourseSection]
    }
    struct LessonProgress: Decodable { let lessonId: String }

    let progress: Double
    let course: Course
    let lessonProgress: [LessonProgress]
}

struct Lesson: Decodable, Identifiable {
    let id: String
    let courseId: String
    let sectionId: String?
    let title: String
    let description: String?
    let type: String
    let duration: String?
    let videoUrl: String?
    let content: String?
    /// Solo en lecciones `section_quiz`: preguntas de la sección (Json).
    let sectionQuiz: JSONValue?
    /// Solo en lecciones `section_minigame`: definición del juego (Json).
    let sectionMinigame: JSONValue?
    let completed: Bool
}

struct Certificate: Decodable, Identifiable, Equatable {
    let id: String
    let courseId: String
    let courseTitle: String
    let instructorName: String
    let issueDate: String
    let certificateNumber: String
    let hours: Double?
}

struct Notification: Decodable, Identifiable, Equatable {
    let id: String
    let type: String
    let title: String
    let body: String
    let read: Bool
    let link: String?
    let createdAt: Date
}

struct NotificationsResponse: Decodable {
    let notifications: [Notification]
    let unreadCount: Int
}

struct MyProfile: Decodable, Equatable {
    let fullName: String
    let email: String
    let joinDate: String
    let avatar: String?
    let phone: String
    let state: String
    let city: String
    let bio: String
    let website: String
    let linkedinUrl: String
    let instagramUrl: String
    let role: String
    let coursesCompleted: Int
    let coursesInProgress: Int
}

struct ProfileUpdate: Encodable {
    var fullName: String?
    var phone: String?
    var state: String?
    var city: String?
    var bio: String?
    var website: String?
    var linkedinUrl: String?
    var instagramUrl: String?
}
