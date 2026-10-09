import '../tokens.css';

export default {
  title: 'Design System/Button',
};

export const Primary = {
  render: () =>
    '<button style="background: var(--color-primary); border: 0; border-radius: var(--radius-sm); color: var(--color-primary-contrast); padding: var(--space-2) var(--space-3);">Play sound</button>',
};
