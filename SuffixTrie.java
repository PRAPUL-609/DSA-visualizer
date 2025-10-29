import java.util.*;

public class SuffixTrieNode {
    Map<Character, SuffixTrieNode> children = new HashMap<>();
    List<Integer> indexes = new ArrayList<>();
}

public class SuffixTrie {
    private SuffixTrieNode root = new SuffixTrieNode();
    private String text;

    public SuffixTrie(String text) {
        this.text = text;
        build();
    }

    private void build() {
        for (int i = 0; i < text.length(); i++) {
            insertSuffix(text.substring(i), i);
        }
    }

    private void insertSuffix(String suffix, int index) {
        SuffixTrieNode node = root;
        for (char ch : suffix.toCharArray()) {
            node = node.children.computeIfAbsent(ch, c -> new SuffixTrieNode());
            node.indexes.add(index);
        }
    }

    public List<Integer> search(String pattern) {
        SuffixTrieNode node = searchPrefix(pattern);
        return node != null ? node.indexes : new ArrayList<>();
    }

    private SuffixTrieNode searchPrefix(String prefix) {
        SuffixTrieNode node = root;
        for (char ch : prefix.toCharArray()) {
            node = node.children.get(ch);
            if (node == null) return null;
        }
        return node;
    }

    public SuffixTrieNode getRoot() {
        return root;
    }

    public String getText() {
        return text;
    }
}
