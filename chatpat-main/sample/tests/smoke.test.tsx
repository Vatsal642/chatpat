import React from 'react';
import { render } from '@testing-library/react';

test('renders placeholder container', () => {
  const Comp = () => <div className="chat-container"><div className="chat-messages" /></div>;
  const { container } = render(<Comp />);
  expect(container.querySelector('.chat-container')).toBeTruthy();
});