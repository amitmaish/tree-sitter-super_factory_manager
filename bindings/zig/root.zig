extern fn tree_sitter_super_factory_manager() callconv(.c) *const anyopaque;

pub fn language() *const anyopaque {
    return tree_sitter_super_factory_manager();
}
