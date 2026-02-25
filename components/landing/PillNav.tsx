import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './PillNav.css';

interface NavItem {
    label: string;
    href: string;
    ariaLabel?: string;
    onClick?: () => void;
    isPrimary?: boolean;
}

interface PillNavProps {
    logo?: string;
    logoAlt?: string;
    logoComponent?: React.ReactNode;
    items: NavItem[];
    activeHref?: string;
    className?: string;
    ease?: string;
    baseColor?: string;
    pillColor?: string;
    hoveredPillTextColor?: string;
    pillTextColor?: string;
    onMobileMenuClick?: () => void;
    initialLoadAnimation?: boolean;
}

const PillNav: React.FC<PillNavProps> = ({
    logo,
    logoAlt = 'Logo',
    logoComponent,
    items,
    activeHref,
    className = '',
    ease = 'power3.out',
    baseColor = '#fff',
    pillColor = '#5B3EF5',
    hoveredPillTextColor = '#fff',
    pillTextColor,
    onMobileMenuClick,
    initialLoadAnimation = true
}) => {
    const resolvedPillTextColor = pillTextColor ?? baseColor;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const tlRefs = useRef<(gsap.core.Timeline | null)[]>([]);
    const activeTweenRefs = useRef<(gsap.core.Tween | null)[]>([]);
    const logoImgRef = useRef<HTMLImageElement | HTMLDivElement | null>(null);
    const logoTweenRef = useRef<gsap.core.Tween | null>(null);
    const hamburgerRef = useRef<HTMLButtonElement | null>(null);
    const mobileMenuRef = useRef<HTMLDivElement | null>(null);
    const navItemsRef = useRef<HTMLDivElement | null>(null);
    const logoWrapperRef = useRef<HTMLAnchorElement | null>(null);

    useEffect(() => {
        const layout = () => {
            circleRefs.current.forEach((circle, index) => {
                if (!circle?.parentElement) return;

                const pill = circle.parentElement;
                const rect = pill.getBoundingClientRect();
                const { width: w, height: h } = rect;
                const R = ((w * w) / 4 + h * h) / (2 * h);
                const D = Math.ceil(2 * R) + 2;
                const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
                const originY = D - delta;

                circle.style.width = `${D}px`;
                circle.style.height = `${D}px`;
                circle.style.bottom = `-${delta}px`;

                gsap.set(circle, {
                    xPercent: -50,
                    scale: 0,
                    transformOrigin: `50% ${originY}px`
                });

                const label = pill.querySelector('.pill-label');
                const white = pill.querySelector('.pill-label-hover');

                if (label) gsap.set(label, { yPercent: 0 });
                if (white) gsap.set(white, { yPercent: 0, opacity: 1 });

                tlRefs.current[index]?.kill();
                const tl = gsap.timeline({ paused: true });

                tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.6, ease, overwrite: 'auto' }, 0);

                if (label && white) {
                    tl.to([label, white], { yPercent: -100, duration: 0.6, ease, overwrite: 'auto' }, 0);
                }

                tlRefs.current[index] = tl;
            });
        };

        layout();

        const onResize = () => layout();
        window.addEventListener('resize', onResize);

        // Use a small delay as a fallback for fonts being ready
        const timer = setTimeout(layout, 100);

        const menu = mobileMenuRef.current;
        if (menu) {
            gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
        }

        if (initialLoadAnimation) {
            const logoEl = logoWrapperRef.current;
            const navItems = navItemsRef.current;

            if (logoEl) {
                gsap.set(logoEl, { scale: 0 });
                gsap.to(logoEl, {
                    scale: 1,
                    duration: 0.6,
                    ease
                });
            }

            if (navItems) {
                gsap.set(navItems, { opacity: 0, y: -10 });
                gsap.to(navItems, {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    ease,
                    delay: 0.2
                });
            }
        }

        return () => {
            window.removeEventListener('resize', onResize);
            clearTimeout(timer);
        };
    }, [items, ease, initialLoadAnimation]);

    const handleEnter = (i: number) => {
        const tl = tlRefs.current[i];
        if (!tl) return;
        activeTweenRefs.current[i]?.kill();
        activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
            duration: 0.3,
            ease,
            overwrite: 'auto'
        });
    };

    const handleLeave = (i: number) => {
        const tl = tlRefs.current[i];
        if (!tl) return;
        activeTweenRefs.current[i]?.kill();
        activeTweenRefs.current[i] = tl.tweenTo(0, {
            duration: 0.2,
            ease,
            overwrite: 'auto'
        });
    };

    const handleLogoEnter = () => {
        const img = logoImgRef.current;
        if (!img) return;
        logoTweenRef.current?.kill();
        logoTweenRef.current = gsap.to(img, {
            scale: 1.1,
            rotate: 5,
            duration: 0.3,
            ease,
            overwrite: 'auto'
        });
    };

    const handleLogoLeave = () => {
        const img = logoImgRef.current;
        if (!img) return;
        logoTweenRef.current?.kill();
        logoTweenRef.current = gsap.to(img, {
            scale: 1,
            rotate: 0,
            duration: 0.3,
            ease,
            overwrite: 'auto'
        });
    };

    const toggleMobileMenu = () => {
        const newState = !isMobileMenuOpen;
        setIsMobileMenuOpen(newState);

        const hamburger = hamburgerRef.current;
        const menu = mobileMenuRef.current;

        if (hamburger) {
            const lines = hamburger.querySelectorAll('.hamburger-line');
            if (newState) {
                gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
                gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
            } else {
                gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
                gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
            }
        }

        if (menu) {
            if (newState) {
                gsap.set(menu, { visibility: 'visible' });
                gsap.fromTo(
                    menu,
                    { opacity: 0, y: 10, scaleY: 1 },
                    {
                        opacity: 1,
                        y: 0,
                        scaleY: 1,
                        duration: 0.3,
                        ease,
                        transformOrigin: 'top center'
                    }
                );
            } else {
                gsap.to(menu, {
                    opacity: 0,
                    y: 10,
                    scaleY: 1,
                    duration: 0.2,
                    ease,
                    transformOrigin: 'top center',
                    onComplete: () => {
                        gsap.set(menu, { visibility: 'hidden' });
                    }
                });
            }
        }

        onMobileMenuClick?.();
    };

    const isExternalLink = (href: string) =>
        href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('//') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('#');

    const isRouterLink = (href: string) => href && !isExternalLink(href);

    const cssVars = {
        '--base': baseColor,
        '--pill-bg': pillColor,
        '--hover-text': hoveredPillTextColor,
        '--pill-text': resolvedPillTextColor
    } as React.CSSProperties;

    return (
        <div className="pill-nav-container">
            <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
                <div
                    className="pill-logo"
                    onMouseEnter={handleLogoEnter}
                    onMouseLeave={handleLogoLeave}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    ref={el => {
                        logoWrapperRef.current = el as unknown as HTMLAnchorElement;
                    }}
                >
                    <div ref={el => { logoImgRef.current = el; }}>
                        {logoComponent || <img src={logo} alt={logoAlt} />}
                    </div>
                </div>

                <div className="pill-nav-items desktop-only" ref={navItemsRef}>
                    <ul className="pill-list" role="menubar">
                        {items.map((item, i) => (
                            <li key={item.href || `item-${i}`} role="none">
                                {isRouterLink(item.href) ? (
                                    <Link
                                        role="menuitem"
                                        to={item.href}
                                        className={`pill${activeHref === item.href ? ' is-active' : ''} ${item.isPrimary ? 'primary-pill' : ''}`}
                                        aria-label={item.ariaLabel || item.label}
                                        onMouseEnter={() => handleEnter(i)}
                                        onMouseLeave={() => handleLeave(i)}
                                        onClick={item.onClick}
                                    >
                                        <span
                                            className="hover-circle"
                                            aria-hidden="true"
                                            ref={el => {
                                                circleRefs.current[i] = el;
                                            }}
                                        />
                                        <span className="label-stack">
                                            <span className="pill-label">{item.label}</span>
                                            <span className="pill-label-hover" aria-hidden="true">
                                                {item.label}
                                            </span>
                                        </span>
                                    </Link>
                                ) : (
                                    <a
                                        role="menuitem"
                                        href={item.href}
                                        className={`pill${activeHref === item.href ? ' is-active' : ''} ${item.isPrimary ? 'primary-pill' : ''}`}
                                        aria-label={item.ariaLabel || item.label}
                                        onMouseEnter={() => handleEnter(i)}
                                        onMouseLeave={() => handleLeave(i)}
                                        onClick={(e) => {
                                            if (item.onClick) {
                                                e.preventDefault();
                                                item.onClick();
                                            }
                                        }}
                                    >
                                        <span
                                            className="hover-circle"
                                            aria-hidden="true"
                                            ref={el => {
                                                circleRefs.current[i] = el;
                                            }}
                                        />
                                        <span className="label-stack">
                                            <span className="pill-label">{item.label}</span>
                                            <span className="pill-label-hover" aria-hidden="true">
                                                {item.label}
                                            </span>
                                        </span>
                                    </a>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    className="mobile-menu-button mobile-only"
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                    ref={hamburgerRef}
                >
                    <span className="hamburger-line" />
                    <span className="hamburger-line" />
                </button>
            </nav>

            <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
                <ul className="mobile-menu-list">
                    {items.map((item) => (
                        <li key={item.href}>
                            {isRouterLink(item.href) ? (
                                <Link
                                    to={item.href}
                                    className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        item.onClick?.();
                                    }}
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a
                                    href={item.href}
                                    className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        item.onClick?.();
                                    }}
                                >
                                    {item.label}
                                </a>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default PillNav;
