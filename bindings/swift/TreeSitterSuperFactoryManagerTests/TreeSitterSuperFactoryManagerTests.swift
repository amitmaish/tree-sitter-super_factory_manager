import XCTest
import SwiftTreeSitter
import TreeSitterSuperFactoryManager

final class TreeSitterSuperFactoryManagerTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_super_factory_manager())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading SuperFactoryManager grammar")
    }
}
