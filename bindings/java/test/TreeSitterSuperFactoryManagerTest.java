import io.github.treesitter.jtreesitter.Language;
import io.github.treesitter.jtreesitter.superfactorymanager.TreeSitterSuperFactoryManager;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

public class TreeSitterSuperFactoryManagerTest {
    @Test
    public void testCanLoadLanguage() {
        assertDoesNotThrow(() -> new Language(TreeSitterSuperFactoryManager.language()));
    }
}
