import { useRef, useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
/* import styles from "./Overlay.module.css"; */

interface PortalProps {
  children: ReactNode;
}

export const CustomPortal = (props: PortalProps) => {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.querySelector<HTMLElement>("#portal");
    setMounted(true);
  }, []);

  {
    /* <div className={styles.overlay}>{props.children}</div>, */
  }
  return mounted && ref.current
    ? createPortal(<div>{props.children}</div>, ref.current)
    : null;
};
