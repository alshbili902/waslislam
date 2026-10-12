import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  MOTION_DURATIONS,
  MOTION_EASINGS,
  isReducedMotionPreferred,
  smoothScrollTo,
  getStaggerDelay
} from '../src/utils/motion.ts';

test('1. Motion Tokens & Easing Integrity', () => {
  assert.equal(MOTION_DURATIONS.instant, 120);
  assert.equal(MOTION_DURATIONS.fast, 220);
  assert.equal(MOTION_DURATIONS.normal, 340);
  assert.equal(MOTION_DURATIONS.cinematic, 480);

  assert.ok(MOTION_EASINGS.easeOutExpo.includes('cubic-bezier'));
  assert.ok(MOTION_EASINGS.springTactile.includes('cubic-bezier'));
  assert.ok(MOTION_EASINGS.easeInOutSmooth.includes('cubic-bezier'));
});

test('2. Reduced Motion SSR Safety & Helper Calculations', () => {
  // In Node.js environment (SSR), isReducedMotionPreferred must safely return false without throwing
  assert.equal(isReducedMotionPreferred(), false);

  // smoothScrollTo must safely execute without window/DOM in SSR
  assert.doesNotThrow(() => {
    smoothScrollTo('non-existent-id');
  });

  // Stagger delays calculation
  assert.equal(getStaggerDelay(0), '0ms');
  assert.equal(getStaggerDelay(1), '45ms');
  assert.equal(getStaggerDelay(2), '90ms');
  assert.equal(getStaggerDelay(100), '400ms', 'Must cap at maxMs');
});

test('3. Motion CSS Architecture & Keyframes Verification', () => {
  const cssPath = path.resolve(process.cwd(), 'src/styles/motion.css');
  assert.ok(fs.existsSync(cssPath), 'motion.css must exist');
  
  const cssContent = fs.readFileSync(cssPath, 'utf-8');

  // Keyframes
  assert.ok(cssContent.includes('@keyframes waslPageEntrance'), 'Must contain waslPageEntrance keyframes');
  assert.ok(cssContent.includes('@keyframes emeraldLightSweep'), 'Must contain emeraldLightSweep keyframes');
  assert.ok(cssContent.includes('@keyframes waslCardRise'), 'Must contain waslCardRise keyframes');
  assert.ok(cssContent.includes('@keyframes waslModalZoom'), 'Must contain waslModalZoom keyframes');
  assert.ok(cssContent.includes('@keyframes waslDropdownSlide'), 'Must contain waslDropdownSlide keyframes');
  assert.ok(cssContent.includes('@keyframes waslAudioBarSlide'), 'Must contain waslAudioBarSlide keyframes');

  // Utility classes
  assert.ok(cssContent.includes('.wasl-page-transition'), 'Must contain .wasl-page-transition');
  assert.ok(cssContent.includes('.wasl-signature-sweep-bar'), 'Must contain .wasl-signature-sweep-bar');
  assert.ok(cssContent.includes('.wasl-card'), 'Must contain .wasl-card');
  assert.ok(cssContent.includes('.wasl-btn-interactive'), 'Must contain .wasl-btn-interactive');
  assert.ok(cssContent.includes('.wasl-dropdown-menu'), 'Must contain .wasl-dropdown-menu');

  // Accessibility override
  assert.ok(cssContent.includes('@media (prefers-reduced-motion: reduce)'), 'Must enforce prefers-reduced-motion');
  assert.ok(cssContent.includes('.reduced-motion'), 'Must support internal .reduced-motion class');
});

test('4. Page Transition Integration in App Shell', () => {
  const pagePath = path.resolve(process.cwd(), 'src/app/page.tsx');
  const pageContent = fs.readFileSync(pagePath, 'utf-8');

  assert.ok(pageContent.includes('CinematicPageTransition'), 'page.tsx must use CinematicPageTransition');
  assert.ok(pageContent.includes('handleTabChange'), 'page.tsx must provide handleTabChange');
  assert.ok(pageContent.includes('popstate'), 'page.tsx must listen to popstate for browser Back/Forward');
  assert.ok(pageContent.includes('hashchange'), 'page.tsx must listen to hashchange');
});

test('5. ScrollReveal & Component Export Integrity', () => {
  const revealPath = path.resolve(process.cwd(), 'src/components/motion/ScrollReveal.tsx');
  const transitionPath = path.resolve(process.cwd(), 'src/components/motion/CinematicPageTransition.tsx');

  assert.ok(fs.existsSync(revealPath), 'ScrollReveal component must exist');
  assert.ok(fs.existsSync(transitionPath), 'CinematicPageTransition component must exist');

  const revealContent = fs.readFileSync(revealPath, 'utf-8');
  assert.ok(revealContent.includes('isReducedMotionPreferred'), 'ScrollReveal must check reduced motion');
  assert.ok(revealContent.includes('IntersectionObserver'), 'ScrollReveal must use IntersectionObserver');
});
