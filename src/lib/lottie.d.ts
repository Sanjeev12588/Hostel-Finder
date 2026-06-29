// This file provides TypeScript definitions for the custom <dotlottie-player> element,
// preventing type errors when using it in TSX files.
declare namespace JSX {
    interface IntrinsicElements {
        'dotlottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
            src: string;
            background: string;
            speed: string;
            style?: React.CSSProperties;
            loop?: boolean;
            autoplay?: boolean;
        }, HTMLElement>;
    }
}
