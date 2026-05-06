type CollapsibleSectionOptions = {
  editorMode?: boolean;
};

const boundListeners = new WeakMap<
  HTMLElement,
  {
    onClick: (event: MouseEvent) => void;
    onKeyDown: (event: KeyboardEvent) => void;
  }
>();

function getSectionNodes(heading: HTMLHeadingElement) {
  const nodes: HTMLElement[] = [];
  let current = heading.nextElementSibling;

  while (current) {
    if (current.tagName === 'H2') {
      break;
    }
    if (current instanceof HTMLElement) {
      nodes.push(current);
    }
    current = current.nextElementSibling;
  }

  return nodes;
}

function getHeadingFromEventTarget(target: EventTarget | null) {
  if (target instanceof HTMLHeadingElement) {
    return target.matches('h2[data-collapsible-heading="true"]') ? target : null;
  }

  if (target instanceof HTMLElement) {
    const heading = target.closest('h2[data-collapsible-heading="true"]');
    return heading instanceof HTMLHeadingElement ? heading : null;
  }

  if (target instanceof Node) {
    const parent = target.parentElement;
    if (!parent) {
      return null;
    }
    const heading = parent.closest('h2[data-collapsible-heading="true"]');
    return heading instanceof HTMLHeadingElement ? heading : null;
  }

  return null;
}

function applyHeadingState(heading: HTMLHeadingElement) {
  const collapsed = heading.dataset.collapsed === 'true';
  const sectionNodes = getSectionNodes(heading);

  heading.setAttribute('role', 'button');
  heading.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  heading.setAttribute('tabindex', '0');
  heading.dataset.collapsibleHeading = 'true';

  sectionNodes.forEach((node) => {
    node.style.display = collapsed ? 'none' : '';
  });
}

export function enhanceCollapsibleSections(root: HTMLElement, options: CollapsibleSectionOptions = {}) {
  const headings = Array.from(root.querySelectorAll('h2'));

  headings.forEach((heading) => {
    if (!(heading instanceof HTMLHeadingElement)) return;
    if (!heading.dataset.collapsed) {
      heading.dataset.collapsed = 'true';
    }
    applyHeadingState(heading);
  });

  const toggleHeading = (heading: HTMLHeadingElement) => {
    const nextCollapsed = heading.dataset.collapsed !== 'true';
    heading.dataset.collapsed = nextCollapsed ? 'true' : 'false';
    applyHeadingState(heading);
  };

  if (!boundListeners.has(root)) {
    const onClick = (event: MouseEvent) => {
      const heading = getHeadingFromEventTarget(event.target);
      if (!(heading instanceof HTMLHeadingElement) || !root.contains(heading)) {
        return;
      }

      if (options.editorMode) {
        const rect = heading.getBoundingClientRect();
        if (event.clientX > rect.left + 28) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
      }

      toggleHeading(heading);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const heading = getHeadingFromEventTarget(event.target);
      if (!(heading instanceof HTMLHeadingElement) || !root.contains(heading)) {
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleHeading(heading);
      }
    };

    root.addEventListener('click', onClick);
    root.addEventListener('keydown', onKeyDown);
    boundListeners.set(root, {onClick, onKeyDown});
  }

  return () => {
    const listeners = boundListeners.get(root);
    if (!listeners) {
      return;
    }
    root.removeEventListener('click', listeners.onClick);
    root.removeEventListener('keydown', listeners.onKeyDown);
    boundListeners.delete(root);
  };
}
