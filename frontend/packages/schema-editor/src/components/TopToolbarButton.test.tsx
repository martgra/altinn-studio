import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopToolbarButton } from './TopToolbarButton';

jest.mock('./TopToolbarButton.module.css', () => ({ iconButton: 'iconButton' }));

const renderButton = (text: string, style = 'text', disabled = false) => {
  const handleClick = jest.fn();
  const user = userEvent.setup();

  render(
    <TopToolbarButton
      id='toolbar-test-button'
      faIcon='fa ai-trash'
      hideText={style === 'icon'}
      onClick={handleClick}
      disabled={disabled}
      warning={style === 'warning'}
    >
      {text}
    </TopToolbarButton>
  );
  return { handleClick, user };
};

test('renders a text button', () => {
  renderButton('delete');
  const button = screen.getByRole('button');
  expect(button).toBeDefined();
  expect(button.textContent).toBe('delete');
});

test('renders an icon only button with aria-label', () => {
  renderButton('delete', 'icon');
  const button = screen.getByRole('button');
  expect(button).toBeDefined();
  expect(button.textContent).not.toBe('delete');
  expect(button.getAttribute('aria-label')).toBe('delete');
  expect(button.getAttribute('class')).toContain('iconButton');
});

test('renders a warning button', () => {
  renderButton('delete', 'warning');
  const button = screen.getByRole('button');
  expect(button).toBeDefined();
  expect(button.getAttribute('class')).toContain('warn');
});

test('reacts to being clicked', async () => {
  const { handleClick, user } = renderButton('delete', 'text');
  await user.click(screen.getByRole('button'));
  expect(handleClick).toBeCalledTimes(1);
});

test('reacts to being clicked (icon button)', async () => {
  const { handleClick, user } = renderButton('delete', 'icon');
  await user.click(screen.getByRole('button'));
  expect(handleClick).toBeCalledTimes(1);
});

test('does nothing when disabled', async () => {
  const { handleClick } = renderButton('delete', 'text', true);
  await fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toBeCalledTimes(0);
});

test('does nothing when disabled (icon button)', async () => {
  const { handleClick } = renderButton('delete', 'icon', true);
  await fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toBeCalledTimes(0);
});
