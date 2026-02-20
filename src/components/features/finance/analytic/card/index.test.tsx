import { render, screen } from '@testing-library/react';

import AnalyticCard from './index';

describe('AnalyticCard', () => {
  describe('Rendering', () => {
    it('should render card with title and value', () => {
      render(
        <AnalyticCard
          icon="/icon/test.svg"
          title="Total Balance"
          value="Rp 10.000.000"
        />
      );

      expect(screen.getByText('Total Balance')).toBeInTheDocument();
      expect(screen.getByText('Rp 10.000.000')).toBeInTheDocument();
    });

    it('should render icon when not loading', () => {
      render(
        <AnalyticCard
          icon="/icon/test.svg"
          title="Total Balance"
          value="Rp 10.000.000"
        />
      );

      const icon = screen.getByAltText('icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('src', '/icon/test.svg');
    });

    it('should not render icon when loading', () => {
      render(
        <AnalyticCard
          icon="/icon/test.svg"
          loading={true}
          title="Total Balance"
          value="Rp 10.000.000"
        />
      );

      const icon = screen.queryByAltText('icon');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('should display correct title', () => {
      render(
        <AnalyticCard
          icon="/icon/test.svg"
          title="Custom Title"
          value="Rp 5.000.000"
        />
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('should display correct value', () => {
      render(
        <AnalyticCard
          icon="/icon/test.svg"
          title="Total Revenue"
          value="Rp 25.000.000"
        />
      );

      expect(screen.getByText('Rp 25.000.000')).toBeInTheDocument();
    });

    it('should handle zero value', () => {
      render(
        <AnalyticCard
          icon="/icon/test.svg"
          title="Total Balance"
          value="Rp 0"
        />
      );

      expect(screen.getByText('Rp 0')).toBeInTheDocument();
    });

    it('should handle large numbers', () => {
      render(
        <AnalyticCard
          icon="/icon/test.svg"
          title="Total Balance"
          value="Rp 1.000.000.000"
        />
      );

      expect(screen.getByText('Rp 1.000.000.000')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should be loading false by default', () => {
      render(
        <AnalyticCard
          icon="/icon/test.svg"
          title="Total Balance"
          value="Rp 10.000.000"
        />
      );

      const icon = screen.getByAltText('icon');
      expect(icon).toBeInTheDocument();
    });

    it('should hide icon when loading is true', () => {
      render(
        <AnalyticCard
          icon="/icon/test.svg"
          loading={true}
          title="Total Balance"
          value="Rp 10.000.000"
        />
      );

      expect(screen.queryByAltText('icon')).not.toBeInTheDocument();
      expect(screen.getByText('Total Balance')).toBeInTheDocument();
      expect(screen.getByText('Rp 10.000.000')).toBeInTheDocument();
    });
  });
});
