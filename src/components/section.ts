const styles = {
  section: 'py-3 mb-5 section-surface',
  header: 'mb-4 flex items-center justify-between section-header',
  title: 'text-xs font-semibold uppercase tracking-wide text-white/55',
  empty:
    'empty-surface mx-auto grid max-w-sm place-items-center rounded-3xl border border-white/10 bg-white/10 p-8 text-center text-white/70 backdrop-blur-md',
  emptyTitle: 'mb-2 text-base font-semibold text-white',
  emptyText: 'text-sm leading-6 text-white/60',
};

export function createSection(title: string, content: Node, emptyText?: string): HTMLElement {
  const section = document.createElement('section');
  section.className = styles.section;
  if (title) section.setAttribute('aria-labelledby', sectionId(title));

  if (title) {
    const header = document.createElement('div');
    header.className = styles.header;

    const heading = document.createElement('h2');
    heading.id = sectionId(title);
    heading.className = styles.title;
    heading.textContent = title;

    header.append(heading);
    section.append(header);
  }

  if (content.childNodes.length === 0 && emptyText) {
    const empty = document.createElement('div');
    empty.className = styles.empty;
    empty.innerHTML = `
      <p class="${styles.emptyTitle}">Nothing here yet</p>
      <p class="${styles.emptyText}">${emptyText}</p>
    `;
    section.append(empty);
  } else {
    section.append(content);
  }

  return section;
}

function sectionId(title: string): string {
  return `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}
