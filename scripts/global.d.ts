// global.d.ts
interface Element {
    /**
     * Waits for a child element matching the given selector.
     * @param {string} Selector - The CSS selector of the child element.
     * @param {number} [Timeout=5000] - The timeout in milliseconds.
     * @returns {Promise<Element>} - Resolves with the found child element.
     */
    WaitForChild(Selector: string, Timeout?: number): Promise<Element>;

    /**
     * Finds the first child element matching the given selector.
     * @param {string} Selector - The CSS selector of the child element.
     * @returns {HTMLElement | null} - The first found child element, or null if not found.
     */
    FindFirstChild(Selector: string): HTMLElement | null;
}