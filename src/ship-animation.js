import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function animateShip(reducedMotion) {
  const section = document.querySelector(".chapter-ship");
  if (reducedMotion) return;
  const stage = section.querySelector(".ship-stage");
  const select = gsap.utils.selector(section);
  section.classList.add("ship-scroll");
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => "+=" + (section.offsetHeight - stage.offsetHeight),
      scrub: .7,
      invalidateOnRefresh: true,
    },
  })
    .from(select(".ship-water path"), { strokeDashoffset: 1, duration: 1.2, stagger: .12, ease: "none" }, 0)
    .from(select(".ship-hull"), { y: 45, opacity: 0, duration: .9, ease: "power2.out" }, 0)
    .from(select(".ship-rig path"), { strokeDashoffset: 1, duration: 1, ease: "none" }, .6)
    .from(select(".ship-sail-main"), { scaleX: .02, opacity: 0, transformOrigin: "100% 100%", duration: 1, ease: "power2.out" }, 1.2)
    .from(select(".ship-sail-front"), { scaleX: .02, opacity: 0, transformOrigin: "0% 100%", duration: 1, ease: "power2.out" }, 1.4)
    .from(select(".ship-sail-seam"), { opacity: 0, duration: .5 }, 1.8)
    .from(select(".ship-pennant"), { scaleX: 0, transformOrigin: "0% 50%", duration: .5 }, 2)
    .from(select(".launch-glow"), { opacity: 0, duration: 1.2 }, 1.5)
    .to(select(".ship-vessel"), { x: 135, y: -28, scale: .76, rotation: -3, transformOrigin: "70% 100%", duration: 2.3, ease: "power2.inOut" }, 2.5)
    .from(select(".ship-wake path"), { strokeDashoffset: 1, opacity: 0, stagger: .2, duration: 1.8, ease: "power1.inOut" }, 2.5)
    .to(select(".ship-water"), { x: -25, duration: 2.3, ease: "none" }, 2.5);
}
