package dev.slimevr.util

import java.util.*
import java.util.concurrent.locks.ReentrantLock

/**
 * A thread-safe LRU (Least Recently Used) cache implementation using a LinkedHashMap
 * for storing key-value pairs and a ReentrantLock for synchronization.
 *
 * @param capacity The maximum number of key-value pairs the cache can hold.
 * @param <K> The type of keys.
 * @param <V> The type of values.
 */
class LRUCache<K, V>(private val capacity: Int) {
    private val cache: LinkedHashMap<K, V> = object : LinkedHashMap<K, V>(capacity, 0.75f, true) {
        override fun removeEldestEntry(eldest: Map.Entry<K, V>?): Boolean {
            return size > capacity
        }
    }
    private val lock = ReentrantLock()

    /**
     * Get the value associated with the specified key.
     *
     * @param key The key to retrieve the value for.
     * @return The value associated with the key, or null if the key is not in the cache.
     */
    fun get(key: K): V? {
        lock.lock()
        try {
            return cache[key]
        } finally {
            lock.unlock()
        }
    }

    /**
     * Put a key-value pair into the cache. If the cache is full, it may evict the
     * least recently used entry to make space for the new entry.
     *
     * @param key The key to associate with the value.
     * @param value The value to store in the cache.
     */
    fun put(key: K, value: V) {
        lock.lock()
        try {
            cache[key] = value
        } finally {
            lock.unlock()
        }
    }

    /**
     * Get the value associated with the specified key, or insert a default value if
     * the key is not already in the cache.
     *
     * @param key The key to retrieve the value for.
     * @param defaultValue A lambda function that provides a default value to insert if
     * the key is not already in the cache.
     * @return The value associated with the key or the default value.
     */
    fun getOrPut(key: K, defaultValue: () -> V): V {
        lock.lock()
        try {
            return cache.getOrPut(key, defaultValue)
        } finally {
            lock.unlock()
        }
    }

    /**
     * Remove the key and its associated value from the cache.
     *
     * @param key The key to remove.
     */
    fun remove(key: K) {
        lock.lock()
        try {
            cache.remove(key)
        } finally {
            lock.unlock()
        }
    }

    /**
     * Get the current size of the cache.
     *
     * @return The number of key-value pairs currently in the cache.
     */
    fun size(): Int {
        lock.lock()
        try {
            return cache.size
        } finally {
            lock.unlock()
        }
    }

    /**
     * Convert the cache to a string representation.
     *
     * @return A string representation of the cache.
     */
    override fun toString(): String {
        lock.lock()
        try {
            return cache.toString()
        } finally {
            lock.unlock()
        }
    }
}
