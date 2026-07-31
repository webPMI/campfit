/**
 * CampFit Animation Utilities (Client-side)
 * --------------------------------------------------
 * Funciones puras para micro-animaciones del lado del cliente.
 * Diseñadas para ser tree-shakeable y no requerir dependencias externas.
 */

/**
 * Detecta si el usuario tiene prefers-reduced-motion activado.
 * @returns true si el usuario prefiere reducir movimiento
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Anima un número desde un valor inicial hasta un valor final.
 * Usa requestAnimationFrame con easing.
 *
 * @param element - Elemento HTML cuyo textContent se actualizará
 * @param start - Valor inicial
 * @param end - Valor final
 * @param duration - Duración en ms (default: 1000)
 * @param formatter - Función opcional para formatear el número
 *
 * @example
 * ```ts
 * const el = document.querySelector('#stat-users')!;
 * animateCounter(el, 0, 1234, 1200, (n) => `${n} usuarios`);
 * ```
 */
export function animateCounter(
    element: HTMLElement,
    start: number,
    end: number,
    duration: number = 1000,
    formatter?: (value: number) => string
): void {
    if (prefersReducedMotion()) {
        element.textContent = formatter ? formatter(end) : String(end);
        return;
    }

    const startTime = performance.now();
    const delta = end - start;

    function easeOutExpo(t: number): number {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function update(currentTime: number): void {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutExpo(progress);
        const current = Math.round(start + delta * eased);

        element.textContent = formatter ? formatter(current) : String(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = formatter ? formatter(end) : String(end);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Inicializa un IntersectionObserver para activar animaciones stagger
 * cuando los elementos entran en el viewport.
 *
 * @param selector - Selector CSS de los elementos a observar
 * @param animationClass - Clase a añadir cuando el elemento es visible
 * @param threshold - Proporción visible para disparar (default: 0.1)
 * @param once - Si true, solo se anima una vez (default: true)
 */
export function initStaggerObserver(
    selector: string,
    animationClass: string = 'animate-fade-in-up',
    threshold: number = 0.1,
    once: boolean = true
): IntersectionObserver | null {
    if (typeof window === 'undefined') return null;

    const elements = document.querySelectorAll<HTMLElement>(selector);
    if (elements.length === 0) return null;

    if (prefersReducedMotion()) {
        elements.forEach((el) => el.classList.add(animationClass));
        return null;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    el.classList.add(animationClass);
                    if (once) {
                        observer.unobserve(el);
                    }
                } else if (!once) {
                    const el = entry.target as HTMLElement;
                    el.classList.remove(animationClass);
                }
            });
        },
        { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return observer;
}

/**
 * Inicializa el efecto ripple en elementos con la clase .cf-ripple.
 *
 * @param selector - Selector CSS de los elementos con ripple
 */
export function initRippleEffect(selector: string = '.cf-ripple'): void {
    if (typeof window === 'undefined' || prefersReducedMotion()) return;

    document.addEventListener('click', (event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>(selector);
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: cf-ripple var(--duration-slow, 400ms) var(--ease-out, ease-out) forwards;
      pointer-events: none;
    `;

        if (getComputedStyle(target).position === 'static') {
            target.style.position = 'relative';
        }
        target.style.overflow = 'hidden';
        target.appendChild(ripple);

        ripple.addEventListener('animationend', () => ripple.remove());
    });
}

/**
 * Inicializa todas las animaciones de página comunes.
 * Llamar una vez al cargar la página.
 */
export function initPageAnimations(): void {
    if (typeof window === 'undefined') return;

    initStaggerObserver('[data-stagger-item]', 'animate-fade-in-up');
    initRippleEffect('.cf-ripple');

    const counters = document.querySelectorAll<HTMLElement>('[data-counter]');
    counters.forEach((el) => {
        const target = parseInt(el.dataset.counter || '0', 10);
        const suffix = el.dataset.counterSuffix || '';
        const duration = parseInt(el.dataset.counterDuration || '1000', 10);
        animateCounter(el, 0, target, duration, (n) => `${n}${suffix}`);
    });
}
