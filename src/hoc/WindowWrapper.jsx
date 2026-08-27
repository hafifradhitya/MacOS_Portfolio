import useWindowStore from "#store/window";
import { useLayoutEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";

const WindowWrapper = (Component, windowKey) => {
    const Wrapped = (props) => {
        const { focusWindow, windows } = useWindowStore();
        const { isOpen, zIndex, isMinimized, isMaximized } = windows[windowKey];
        const ref = useRef(null);
        const draggableRef = useRef(null);

        useGSAP(() => {
            const el = ref.current;
            if (!el || !isOpen) return;

            el.style.display = "block";

            gsap.fromTo(
                el,
                { scale: 0.8, opacity: 0, y: 40 },
                { scale: 1, opacity: 1, y: 0, duration: 0.2, ease: "power3.out" },
            );
        }, [isOpen]);

        useGSAP(() => {
            const el = ref.current;
            if (!el) return;

            const [instance] = Draggable.create(el, { onPress: () => focusWindow(windowKey) });
            draggableRef.current = instance;

            return () => instance.kill();
        }, []);

        useLayoutEffect(() => {
            const el = ref.current;
            if (!el) return;
            el.style.display = (isOpen && !isMinimized) ? "block" : "none";
        }, [isOpen, isMinimized]);

        useLayoutEffect(() => {
            if (draggableRef.current) {
                if (isMaximized) {
                    draggableRef.current.disable();
                } else {
                    draggableRef.current.enable();
                }
            }
        }, [isMaximized]);

        return (
            <section
                id={windowKey}
                ref={ref}
                style={{ zIndex }}
                className={`absolute transition-all duration-300 ${isMaximized ? "!top-0 !left-0 !w-full !h-full !transform-none !rounded-none" : ""}`}
            >
                <Component {...props} />
            </section>
        );
    };

    Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"}`;

    return Wrapped;
};

export default WindowWrapper;