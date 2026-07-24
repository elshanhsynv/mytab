import {
    CheckCircle2,
    ChevronDown,
    Clock3,
    Copy,
    Download,
    ExternalLink,
    Folder,
    Grid2x2,
    Link,
    Moon,
    MoreHorizontal,
    Pencil,
    Pin,
    Plus,
    Search,
    Settings,
    Sun,
    Trash2,
    Upload,
    X,
} from "lucide";
import type { IconNode } from "lucide";

function icon(node: IconNode): string {
    const body = node
        .map(([tag, attrs]) => {
            const attributes = Object.entries(attrs)
                .map(([key, value]) => `${key}="${value}"`)
                .join(" ");

            return `<${tag} ${attributes}></${tag}>`;
        })
        .join("");

    return `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
        >
            ${body}
        </svg>
    `.trim();
}

export const icons = {
    search: icon(Search),
    x: icon(X),
    settings: icon(Settings),
    grid: icon(Grid2x2),
    dots: icon(MoreHorizontal),
    clock: icon(Clock3),
    link: icon(Link),
    plus: icon(Plus),
    checkCircle: icon(CheckCircle2),
    sun: icon(Sun),
    moon: icon(Moon),
    pin: icon(Pin),
    folder: icon(Folder),
    chevron: icon(ChevronDown),
    external: icon(ExternalLink),
    edit: icon(Pencil),
    trash: icon(Trash2),
    copy: icon(Copy),
    download: icon(Download),
    upload: icon(Upload),
} as const;
