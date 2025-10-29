import java.util.*;

public class CompressedTrieNode {
    Map<Character, CompressedTrieNode> children = new HashMap<>();
    String label = "";
    boolean isEndOfWord = false;

    public CompressedTrieNode() {}

    public CompressedTrieNode(String label) {
        this.label = label;
    }
}

public class CompressedTrie {
    private CompressedTrieNode root = new CompressedTrieNode();

    public void insert(String word) {
        insert(root, word, 0);
    }

    private void insert(CompressedTrieNode node, String word, int index) {
        if (index == word.length()) {
            node.isEndOfWord = true;
            return;
        }
        char ch = word.charAt(index);
        CompressedTrieNode child = node.children.get(ch);
        if (child == null) {
            String remaining = word.substring(index);
            CompressedTrieNode newNode = new CompressedTrieNode(remaining);
            newNode.isEndOfWord = true;
            node.children.put(ch, newNode);
        } else {
            String label = child.label;
            int commonPrefix = commonPrefixLength(word.substring(index), label);
            if (commonPrefix == label.length()) {
                insert(child, word, index + commonPrefix);
            } else {
                CompressedTrieNode splitNode = new CompressedTrieNode(label.substring(commonPrefix));
                splitNode.children = child.children;
                splitNode.isEndOfWord = child.isEndOfWord;
                child.label = label.substring(0, commonPrefix);
                child.children = new HashMap<>();
                child.children.put(label.charAt(commonPrefix), splitNode);
                child.isEndOfWord = false;
                if (commonPrefix == word.length() - index) {
                    child.isEndOfWord = true;
                } else {
                    CompressedTrieNode newNode = new CompressedTrieNode(word.substring(index + commonPrefix));
                    newNode.isEndOfWord = true;
                    child.children.put(word.charAt(index + commonPrefix), newNode);
                }
            }
        }
    }

    public boolean search(String word) {
        return search(root, word, 0) != null;
    }

    private CompressedTrieNode search(CompressedTrieNode node, String word, int index) {
        if (index == word.length()) {
            return node.isEndOfWord ? node : null;
        }
        char ch = word.charAt(index);
        CompressedTrieNode child = node.children.get(ch);
        if (child == null) return null;
        String label = child.label;
        if (word.startsWith(label, index)) {
            return search(child, word, index + label.length());
        }
        return null;
    }

    public boolean startsWith(String prefix) {
        return search(root, prefix, 0) != null;
    }

    public boolean delete(String word) {
        return delete(root, word, 0);
    }

    private boolean delete(CompressedTrieNode node, String word, int index) {
        if (index == word.length()) {
            if (!node.isEndOfWord) return false;
            node.isEndOfWord = false;
            return node.children.isEmpty();
        }
        char ch = word.charAt(index);
        CompressedTrieNode child = node.children.get(ch);
        if (child == null) return false;
        boolean shouldDelete = delete(child, word, index + child.label.length());
        if (shouldDelete && !child.isEndOfWord && child.children.isEmpty()) {
            node.children.remove(ch);
            return node.children.isEmpty() && !node.isEndOfWord;
        }
        return false;
    }

    public List<String> getAllWords() {
        List<String> words = new ArrayList<>();
        collectWords(root, new StringBuilder(), words);
        return words;
    }

    private void collectWords(CompressedTrieNode node, StringBuilder prefix, List<String> words) {
        prefix.append(node.label);
        if (node.isEndOfWord) {
            words.add(prefix.toString());
        }
        for (CompressedTrieNode child : node.children.values()) {
            collectWords(child, prefix, words);
        }
        prefix.setLength(prefix.length() - node.label.length());
    }

    private int commonPrefixLength(String a, String b) {
        int min = Math.min(a.length(), b.length());
        for (int i = 0; i < min; i++) {
            if (a.charAt(i) != b.charAt(i)) return i;
        }
        return min;
    }

    public CompressedTrieNode getRoot() {
        return root;
    }
}
