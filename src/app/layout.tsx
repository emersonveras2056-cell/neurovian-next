import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'Neurovian',
  description:
    'Neurovian - Realidade virtual para neurociência, clínica psicológica e treinamento cognitivo imersivo.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {/* Barra de progresso de scroll */}
        <div id="scroll-progress" aria-hidden="true" />

        {children}

        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Scroll progress bar
              (function () {
                var bar = document.getElementById('scroll-progress');
                if (!bar) return;
                function updateBar() {
                  var scrolled = window.scrollY || document.documentElement.scrollTop;
                  var total = document.documentElement.scrollHeight - window.innerHeight;
                  var pct = total > 0 ? (scrolled / total) * 100 : 0;
                  bar.style.width = pct + '%';
                }
                window.addEventListener('scroll', updateBar, { passive: true });
                updateBar();

                // Header scrolled class
                var header = document.querySelector('header');
                function updateHeader() {
                  if (!header) return;
                  if (window.scrollY > 20) {
                    header.classList.add('scrolled');
                  } else {
                    header.classList.remove('scrolled');
                  }
                }
                window.addEventListener('scroll', updateHeader, { passive: true });
                updateHeader();

                // Fade-in sections on scroll
                var sections = document.querySelectorAll('.fade-section');
                var observer = new IntersectionObserver(function (entries) {
                  entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                      entry.target.classList.add('visible');
                    }
                  });
                }, { threshold: 0.12 });
                sections.forEach(function (el) { observer.observe(el); });
              })();
            `
          }}
        />
      </body>
    </html>
  );
}
