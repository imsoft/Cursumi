import Foundation

/// JSON arbitrario (campos `Json` de Prisma como `section.quiz` o `section.minigame`).
enum JSONValue: Codable, Equatable {
    case string(String)
    case number(Double)
    case bool(Bool)
    case null
    case array([JSONValue])
    case object([String: JSONValue])

    init(from decoder: Decoder) throws {
        let c = try decoder.singleValueContainer()
        if c.decodeNil() { self = .null }
        else if let b = try? c.decode(Bool.self) { self = .bool(b) }
        else if let n = try? c.decode(Double.self) { self = .number(n) }
        else if let s = try? c.decode(String.self) { self = .string(s) }
        else if let a = try? c.decode([JSONValue].self) { self = .array(a) }
        else if let o = try? c.decode([String: JSONValue].self) { self = .object(o) }
        else { throw DecodingError.dataCorrupted(.init(codingPath: decoder.codingPath, debugDescription: "JSON inválido")) }
    }

    func encode(to encoder: Encoder) throws {
        var c = encoder.singleValueContainer()
        switch self {
        case .string(let s): try c.encode(s)
        case .number(let n): try c.encode(n)
        case .bool(let b): try c.encode(b)
        case .null: try c.encodeNil()
        case .array(let a): try c.encode(a)
        case .object(let o): try c.encode(o)
        }
    }

    subscript(key: String) -> JSONValue? {
        if case .object(let o) = self { return o[key] }
        return nil
    }

    var string: String? { if case .string(let s) = self { return s }; return nil }
    var number: Double? { if case .number(let n) = self { return n }; return nil }
    var int: Int? { number.map { Int($0) } }
    var array: [JSONValue]? { if case .array(let a) = self { return a }; return nil }
    var stringArray: [String]? { array?.compactMap(\.string) }
    var intArray: [Int]? { array?.compactMap(\.int) }

    /// Parsea un texto JSON.
    static func parse(_ text: String) -> JSONValue? {
        try? JSONDecoder().decode(JSONValue.self, from: Data(text.utf8))
    }

    /// Versión en una línea para mostrar en listas: un objeto se vuelve
    /// `clave: valor · clave: valor`; lo demás, JSON compacto.
    var compact: String {
        switch self {
        case .null: return ""
        case .string(let s): return s
        case .bool(let b): return b ? "sí" : "no"
        case .number(let n): return n.truncatingRemainder(dividingBy: 1) == 0 ? String(Int(n)) : String(n)
        case .object(let o):
            return o.keys.sorted().map { "\($0): \(o[$0]!.compactNested)" }.joined(separator: " · ")
        case .array(let a):
            return "[" + a.map(\.compactNested).joined(separator: ", ") + "]"
        }
    }

    /// Como `compact`, pero los objetos anidados van como JSON para no perder la estructura.
    private var compactNested: String {
        switch self {
        case .object, .array:
            let encoder = JSONEncoder()
            encoder.outputFormatting = [.sortedKeys, .withoutEscapingSlashes]
            return (try? encoder.encode(self)).flatMap { String(data: $0, encoding: .utf8) } ?? ""
        case .null: return "null"
        default: return compact
        }
    }
}
