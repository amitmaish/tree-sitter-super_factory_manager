/**
 * @file A Minecraft mod that adds a domain-specific language for logistics automation.
 * @author amit maish
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "super_factory_manager",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
