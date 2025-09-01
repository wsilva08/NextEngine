/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// Handle header style change on scroll
// FIX: Cast to HTMLElement to access the style property, which is not available on the base Element type.
const header = document.querySelector<HTMLElement>('.header');
window.addEventListener('scroll', () => {
    // FIX: Add null check to prevent runtime errors if the header element is not found.
    if (header) {
        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else {
            header.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
        }
    }
});

// Handle "Back to Top" button visibility and functionality
const backToTopButton = document.querySelector('.back-to-top');

window.addEventListener('scroll', () => {
    // FIX: Add null check to prevent runtime errors if the button element is not found.
    if (backToTopButton) {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    }
});

// FIX: Use optional chaining to safely add event listener and prevent runtime errors if the button is not found.
backToTopButton?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});
