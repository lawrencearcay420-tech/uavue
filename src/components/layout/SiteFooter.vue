<script setup>
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="wordmark">UA - <span>Under Asawa.</span></div>
        <p class="footer-tagline">GOOD CLOTHES.<br />THOUGHTFULLY MADE.</p>
      </div>

      <div class="footer-grid">
        <div class="footer-column">
          <h4 class="footer-title">SHOP</h4>
          <a href="/shop">New Arrivals</a>
          <a href="/shop">Clothing</a>
          <a href="/shop">Accessories</a>
          <a href="/shop">Best Sellers</a>
        </div>

        <div class="footer-column">
          <h4 class="footer-title">HELP</h4>
          <a href="/shop">Shipping</a>
          <a href="/shop">Returns</a>
          <a href="/shop">Size Guide</a>
          <a href="/shop">Contact</a>
        </div>

        <div class="footer-column">
          <h4 class="footer-title">ACCOUNT</h4>
          <a href="/account">Profile</a>
          <a href="/orders">Orders</a>
          <a href="/wishlist">Wishlist</a>
        </div>

        <div class="footer-column">
          <h4 class="footer-title">LETTER</h4>
          <p>Join the UA letter for new pieces, quiet launches, and behind-the-collection stories.</p>
          <form class="newsletter-form">
            <input type="email" placeholder="your@email.com" required />
            <button type="submit">Join</button>
          </form>
        </div>
      </div>

      <div class="footer-legal">
        <span>© {currentYear} Under Asawa Clothing</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 48px 7.1% 32px;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
}

.footer-brand {
  margin-bottom: 32px;
}

.wordmark {
  font-size: 25px;
  font-weight: 700;
  color: var(--ink);
}

.wordmark span {
  color: var(--red);
}

.footer-tagline {
  margin-top: 8px;
  font-family: var(--serif);
  font-size: 18px;
  font-style: italic;
  color: var(--muted);
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 40px;
  margin-bottom: 32px;
}

.footer-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0 0 16px;
  color: var(--muted);
}

.footer-column a {
  display: block;
  padding: 8px 0;
  color: var(--muted);
  font-size: 12px;
  transition: color 0.2s;
}

.footer-column a:hover {
  color: var(--ink);
}

.newsletter-form {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.newsletter-form input {
  flex: 1;
  height: 40px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  background: var(--input-bg);
  color: var(--text-primary);
  font-size: 13px;
}

.newsletter-form button {
  padding: 0 20px;
  border: 1px solid var(--ink);
  background: var(--ink);
  color: var(--text-inverse);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.newsletter-form button:hover {
  opacity: 0.8;
}

.footer-legal {
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
  color: var(--muted);
  font-size: 12px;
  text-align: center;
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

@media (max-width: 480px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
  .site-footer {
    padding: 32px 5%;
  }
}
</style>