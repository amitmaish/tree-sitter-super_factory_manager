package tree_sitter_super_factory_manager_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_super_factory_manager "github.com/tree-sitter/tree-sitter-super_factory_manager/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_super_factory_manager.Language())
	if language == nil {
		t.Errorf("Error loading SuperFactoryManager grammar")
	}
}
