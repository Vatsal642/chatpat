import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from '@/app/page';

jest.mock('@/client/trpc', () => ({
  trpc: {
    chat: {
      history: { useQuery: () => ({ data: [] }) },
      sendText: { useMutation: () => ({ mutateAsync: jest.fn(), isPending: false }) },
      generateImage: { useMutation: () => ({ mutateAsync: jest.fn(), isPending: false }) },
    },
  },
}));

describe('Page', () => {
  it('renders header', () => {
    render(<Page />);
    expect(screen.getByText('Sample Chat')).toBeInTheDocument();
  });
});