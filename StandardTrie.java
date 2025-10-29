import java.util.*;

public class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    boolean isEndOfWord = false;
}

public class StandardTrie {
    private TrieNode root = new TrieNode();

    public void insert(String word) {
        TrieNode node = root;
        for (char ch : word.toCharArray()) {
            node = node.children.computeIfAbsent(ch, c -> new TrieNode());
        }
        node.isEndOfWord = true;
    }

    public boolean search(String word) {
        TrieNode node = searchPrefix(word);
        return node != null && node.isEndOfWord;
    }

    public boolean startsWith(String prefix) {
        return searchPrefix(prefix) != null;
    }

    public boolean delete(String word) {
        return delete(root, word, 0);
    }

    private TrieNode searchPrefix(String prefix) {
        TrieNode node = root;
        for (char ch : prefix.toCharArray()) {
            node = node.children.get(ch);
            if (node == null) return null;
        }
        return node;
    }

    private boolean delete(TrieNode node, String word, int index) {
        if (index == word.length()) {
            if (!node.isEndOfWord) return false;
            node.isEndOfWord = false;
            return node.children.isEmpty();
        }
        char ch = word.charAt(index);
        TrieNode child = node.children.get(ch);
        if (child == null) return false;
        boolean shouldDeleteChild = delete(child, word, index + 1);
        if (shouldDeleteChild) {
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

    private void collectWords(TrieNode node, StringBuilder prefix, List<String> words) {
        if (node.isEndOfWord) {
            words.add(prefix.toString());
        }
        for (Map.Entry<Character, TrieNode> entry : node.children.entrySet()) {
            prefix.append(entry.getKey());
            collectWords(entry.getValue(), prefix, words);
            prefix.setLength(prefix.length() - 1);
        }
    }

    public TrieNode getRoot() {
        return root;
    }
}
