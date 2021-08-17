import { writable } from 'svelte/store';

// true: mobile menu open
// false: mobile menu closed
export const mobileMenuState = writable(false);
