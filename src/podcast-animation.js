import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function animatePodcast(reducedMotion) {
  const scene = document.querySelector(".podcast-preview");
  if (!scene || reducedMotion) return;

  gsap.registerPlugin(ScrollTrigger);
  const select = gsap.utils.selector(scene);
  const curve = scene.querySelector(".bell-trace");
  const traveler = scene.querySelector(".bell-traveler");
  const length = curve.getTotalLength();
  const journey = { progress: 0 };
  const drawTraveler = () => {
    const point = curve.getPointAtLength(journey.progress * length);
    traveler.setAttribute("cx", point.x);
    traveler.setAttribute("cy", point.y);
  };

  gsap.set(select(".grug-portrait"), { transformOrigin: "50% 90%" });
  const timeline = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: "top 65%",
      end: "bottom bottom",
      scrub: .7,
    },
  });

  timeline
    .from(select(".bell-trace"), { strokeDashoffset: 1, duration: 2, ease: "none" }, 0)
    .fromTo(traveler, { opacity: 0 }, { opacity: 1, duration: .15 }, 0)
    .to(journey, { progress: 1, duration: 2, ease: "none", onUpdate: drawTraveler }, 0)
    .from(select(".bell-thinker"), { opacity: 0, y: 18, duration: .6 }, .6)
    .from(select(".bell-sage"), { opacity: 0, y: 12, duration: .6 }, 1.3)
    .fromTo(select(".bell-thinker"), { x: -2 }, { x: 2, duration: .1, repeat: 5, yoyo: true }, 1.2)
    .to(journey, { progress: .12, duration: 1.5, ease: "power2.inOut", onUpdate: drawTraveler }, 2.1)
    .to(select(".bell-thinker, .bell-sage"), { opacity: .2, duration: 1 }, 2.2)
    .to(select(".bell-trace"), { opacity: .28, duration: 1 }, 2.2)
    .from(select(".grug-portrait"), { y: 20, scale: .7, opacity: .3, duration: 1.2, ease: "power2.out" }, 2.2)
    .from(select(".grug-portrait"), { rotation: -6, duration: 1.3, ease: "power2.out" }, 2.4)
    .from(select(".grug-glow"), { opacity: 0, duration: 1 }, 2.5)
    .to(traveler, { opacity: 0, duration: .25 }, 3.4)
    .from(select(".grug-caption"), { opacity: 0, y: 8, duration: .6 }, 3.5);
}
