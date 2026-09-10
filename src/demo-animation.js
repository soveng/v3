import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function animateDemo(reducedMotion) {
  if (reducedMotion) return;
  const section = document.querySelector(".chapter-demo");
  const stage = section.querySelector(".demo-stage");
  const select = gsap.utils.selector(section);
  section.classList.add("demo-scroll");
  gsap.registerPlugin(ScrollTrigger);

  gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => "+=" + (section.offsetHeight - stage.offsetHeight),
      scrub: .6,
      invalidateOnRefresh: true,
    },
  })
    .from(select(".demo-power, .demo-lens"), { opacity: .15, duration: .4 }, 0)
    .from(select(".demo-beam"), { opacity: 0, scaleY: 0, svgOrigin: "174 428", duration: 1.2, ease: "power2.inOut" }, .3)
    .from(select(".demo-screen-light"), { opacity: 0, duration: .8 }, .6)
    .from(select(".demo-app"), { opacity: 0, y: 8, duration: .7 }, 1.1)
    .from(select(".demo-cursor"), { opacity: 0, x: 55, y: 70, duration: 1.1, ease: "power2.inOut" }, 1.8)
    .to(select(".demo-button"), { scale: .94, transformOrigin: "50% 50%", duration: .15 }, 2.9)
    .to(select(".demo-button"), { scale: 1, duration: .2 }, 3.05)
    .fromTo(select(".demo-click"), { scale: .3, opacity: .8, transformOrigin: "50% 50%" }, { scale: 1.6, opacity: 0, duration: .6, immediateRender: false }, 3)
    .from(select(".demo-result"), { opacity: 0, duration: .3 }, 3.1)
    .from(select(".demo-check"), { strokeDashoffset: 1, duration: .4, ease: "none" }, 3.1)
    .to(select(".demo-cursor"), { x: 20, y: 25, opacity: 0, duration: .5 }, 3.6)
    .to({}, { duration: .7 });
}
