import { DOCUMENT } from "@angular/common";
import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input, numberAttribute, signal } from "@angular/core";

// Aparición suave (fade + subida) cuando el elemento entra en pantalla.
// Uso: <li appReveal> o <li [appReveal]="i * 90"> (retraso en ms para escalonar).
// Respeta "reducir movimiento" del sistema: en ese caso se muestra de inmediato.
@Directive({
  selector: "[appReveal]",
  host: {
    class: "transition duration-700 ease-out",
    "[class.opacity-0]": "!visible()",
    "[class.translate-y-6]": "!visible()",
    "[style.transition-delay.ms]": "retraso()"
  }
})
export class Reveal {
  readonly retraso = input(0, { alias: "appReveal", transform: (valor: unknown) => numberAttribute(valor, 0) });
  readonly visible = signal(false);

  constructor() {
    const elemento = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const ventana = inject(DOCUMENT).defaultView;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const sinAnimacion = !ventana || !("IntersectionObserver" in ventana) || ventana.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (sinAnimacion) {
        this.visible.set(true);
        return;
      }
      const observador = new ventana.IntersectionObserver(
        ([entrada]) => {
          if (entrada.isIntersecting) {
            this.visible.set(true);
            observador.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
      );
      observador.observe(elemento);
      destroyRef.onDestroy(() => observador.disconnect());
    });
  }
}
