import fs from 'fs';

let t = fs.readFileSync('Homestay.by.Patricia/frontend/scripts/gallery-head.tsx', 'utf8');

t = t.replace(
  'import Image from "next/image";',
  'import { AppImage } from "@/components/ui/app-image";'
);

const deferred = `
/**
 * Mount rail card image only when near the viewport.
 * \`allow\` gates an entire marquee copy (duplicate loop deferred until idle).
 */
function DeferredRailImage({
  allow,
  alt,
  src,
}: {
  allow: boolean;
  alt: string;
  src: string;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [inRange, setInRange] = useState(false);

  useEffect(() => {
    if (!allow) {
      setInRange(false);
      return;
    }
    const node = hostRef.current;
    if (!node) return;

    const margin = 160;
    const rect = node.getBoundingClientRect();
    const near =
      rect.bottom >= -margin &&
      rect.top <= window.innerHeight + margin &&
      rect.right >= -margin &&
      rect.left <= window.innerWidth + margin;
    if (near) {
      setInRange(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInRange(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin: "160px 0px 160px 120px", threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [allow]);

  return (
    <div className="absolute inset-0" ref={hostRef}>
      {allow && inRange ? (
        <AppImage
          alt={alt}
          className="image-cover image-zoom"
          fill
          loading="lazy"
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 38vw, 70vw"
          src={src}
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-[var(--surface-muted)]" />
      )}
    </div>
  );
}

`;

const ag = 'type ActiveGallery = {\n  property: Property;\n  index: number;\n};\n\n';
if (!t.includes(ag)) {
  console.error('ActiveGallery block missing');
  process.exit(1);
}
t = t.replace(ag, 'type ActiveGallery = {\n  property: Property;\n  index: number;\n};\n' + deferred);

const pauseLine = 'const [isRailPaused, setIsRailPaused] = useState(false);\n  const railRef = useRef<HTMLDivElement>(null);';
if (!t.includes(pauseLine)) {
  console.error('pause line missing');
  process.exit(1);
}
t = t.replace(
  pauseLine,
  'const [isRailPaused, setIsRailPaused] = useState(false);\n  /** Second marquee copy may load images only after idle (same URLs → cache). */\n  const [duplicateCopyAllowed, setDuplicateCopyAllowed] = useState(false);\n  const railRef = useRef<HTMLDivElement>(null);',
);

const motionFx = `useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsRailPaused(true);
    }
  }, []);`;

const motionFxNew = `useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsRailPaused(true);
    }
  }, []);

  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const enable = () => setDuplicateCopyAllowed(true);
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 2500 });
    } else {
      timeoutId = window.setTimeout(enable, 1500);
    }
    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);`;

if (!t.includes(motionFx)) {
  console.error('motion effect missing');
  process.exit(1);
}
t = t.replace(motionFx, motionFxNew);

const sigOld = `<Image
                alt={signatureStay.imageAlt}
                className="image-cover image-zoom"
                fill
                priority
                quality={100}
                sizes="(min-width: 768px) 62vw, 100vw"
                src={signatureStay.heroImage}
              />`;
const sigNew = `<AppImage
                alt={signatureStay.imageAlt}
                className="image-cover image-zoom"
                fill
                priority
                sizes="(min-width: 768px) 62vw, 100vw"
                src={signatureStay.heroImage}
              />`;
if (!t.includes(sigOld)) {
  console.error('signature Image missing');
  process.exit(1);
}
t = t.replace(sigOld, sigNew);

const railOld = `<Image
                          alt={property.imageAlt}
                          className="image-cover image-zoom"
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 42vw, 78vw"
                          src={property.heroImage}
                        />`;
const railNew = `<DeferredRailImage
                            allow={!isDuplicateCopy || duplicateCopyAllowed}
                            alt={property.imageAlt}
                            src={property.heroImage}
                          />`;
if (!t.includes(railOld)) {
  console.error('rail Image missing');
  process.exit(1);
}
t = t.replace(railOld, railNew);

const mapOpen = '{marqueeProperties.map((property, index) => (';
const mapOpenNew = `{marqueeProperties.map((property, index) => {
                  const isDuplicateCopy = index >= railProperties.length;
                  return (`;
if (!t.includes(mapOpen)) {
  console.error('map open missing');
  process.exit(1);
}
t = t.replace(mapOpen, mapOpenNew);

const mapClose = `                  ))}
                </div>
              </div>
            </>
          ) : (`;
const mapCloseNew = `                  );
                  })}
                </div>
              </div>
            </>
          ) : (`;
if (!t.includes(mapClose)) {
  console.error('map close missing');
  process.exit(1);
}
t = t.replace(mapClose, mapCloseNew);

if (t.includes('<Image') || t.includes('from "next/image"')) {
  console.error('Image remains');
  process.exit(1);
}

fs.writeFileSync('Homestay.by.Patricia/frontend/src/components/shared/gallery-grid.tsx', t);
console.log('patched OK', t.length);
