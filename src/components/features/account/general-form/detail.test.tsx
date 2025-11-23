import { render, screen } from '@testing-library/react';
import { OrganizerDetailInfo } from './detail';

describe('OrganizerDetailInfo', () => {
  const mockOrganizerDetail = {
    id: '1',
    name: 'Test Organizer',
    phoneNumber: '+621234567890',
    email: 'test@example.com',
    address: 'Test Address',
    socialMedia: [
      { platform: 'Instagram', url: 'https://instagram.com/test' },
      { platform: 'TikTok', url: 'https://tiktok.com/@test' },
      { platform: 'Twitter', url: 'https://twitter.com/test' }
    ],
    aboutOrganizer: 'This is a test organizer description',
    profilePicture: 'https://example.com/profile.jpg',
    pictName: 'profile-image.jpg'
  };

  describe('Rendering Organizer Information', () => {
    it('should render organizer name', () => {
      render(<OrganizerDetailInfo organizerDetail={mockOrganizerDetail} />);

      expect(screen.getByText('Organizer Name*')).toBeInTheDocument();
      expect(screen.getByText('Test Organizer')).toBeInTheDocument();
    });

    it('should render email address', () => {
      render(<OrganizerDetailInfo organizerDetail={mockOrganizerDetail} />);

      expect(screen.getByText('Email Address*')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should render address', () => {
      render(<OrganizerDetailInfo organizerDetail={mockOrganizerDetail} />);

      expect(screen.getByText('Address*')).toBeInTheDocument();
      expect(screen.getByText('Test Address')).toBeInTheDocument();
    });

    it('should render about organizer', () => {
      render(<OrganizerDetailInfo organizerDetail={mockOrganizerDetail} />);

      expect(screen.getByText('About Organizer*')).toBeInTheDocument();
      expect(
        screen.getByText('This is a test organizer description')
      ).toBeInTheDocument();
    });
  });

  describe('Phone Number Display', () => {
    it('should display phone number without country code prefix', () => {
      render(<OrganizerDetailInfo organizerDetail={mockOrganizerDetail} />);

      expect(screen.getByText('Phone Number*')).toBeInTheDocument();
      // Should display without +62 prefix
      expect(screen.getByText('1234567890')).toBeInTheDocument();
      // Should show +62 as prefix icon
      expect(screen.getByText('+62')).toBeInTheDocument();
    });

    it('should handle phone number without country code', () => {
      const organizerWithoutCountryCode = {
        ...mockOrganizerDetail,
        phoneNumber: '1234567890'
      };

      render(
        <OrganizerDetailInfo organizerDetail={organizerWithoutCountryCode} />
      );

      expect(screen.getByText('Phone Number*')).toBeInTheDocument();
    });
  });

  describe('Social Media Display', () => {
    it('should render all social media links', () => {
      render(<OrganizerDetailInfo organizerDetail={mockOrganizerDetail} />);

      expect(screen.getByText('Social Media*')).toBeInTheDocument();
      expect(screen.getByText('https://instagram.com/test')).toBeInTheDocument();
      expect(screen.getByText('https://tiktok.com/@test')).toBeInTheDocument();
      expect(screen.getByText('https://twitter.com/test')).toBeInTheDocument();
    });

    it('should display "No social media links" when socialMedia is empty', () => {
      const organizerWithoutSocial = {
        ...mockOrganizerDetail,
        socialMedia: []
      };

      render(
        <OrganizerDetailInfo organizerDetail={organizerWithoutSocial} />
      );

      expect(screen.getByText('No social media links')).toBeInTheDocument();
    });

    it('should display "No social media links" when socialMedia is undefined', () => {
      const organizerWithoutSocial = {
        ...mockOrganizerDetail,
        socialMedia: undefined as any
      };

      render(
        <OrganizerDetailInfo organizerDetail={organizerWithoutSocial} />
      );

      expect(screen.getByText('No social media links')).toBeInTheDocument();
    });
  });

  describe('Profile Picture Display', () => {
    it('should display profile picture name', () => {
      render(<OrganizerDetailInfo organizerDetail={mockOrganizerDetail} />);

      expect(screen.getByText('Profile Picture*')).toBeInTheDocument();
      expect(screen.getByText('profile-image.jpg')).toBeInTheDocument();
    });

    it('should display "No profile picture uploaded" when pictName is missing', () => {
      const organizerWithoutPictName = {
        ...mockOrganizerDetail,
        pictName: undefined
      };

      render(
        <OrganizerDetailInfo organizerDetail={organizerWithoutPictName} />
      );

      expect(screen.getByText('No profile picture uploaded')).toBeInTheDocument();
    });

    it('should render profile picture image when profilePicture is provided', () => {
      render(<OrganizerDetailInfo organizerDetail={mockOrganizerDetail} />);

      const profileImage = screen.getByAltText('Profile Picture');
      expect(profileImage).toBeInTheDocument();
      expect(profileImage).toHaveAttribute(
        'src',
        'https://example.com/profile.jpg'
      );
    });

    it('should not render profile picture image when profilePicture is missing', () => {
      const organizerWithoutPicture = {
        ...mockOrganizerDetail,
        profilePicture: undefined
      };

      render(
        <OrganizerDetailInfo organizerDetail={organizerWithoutPicture} />
      );

      const profileImages = screen.queryAllByAltText('Profile Picture');
      expect(profileImages.length).toBe(0);
    });
  });

  describe('Layout', () => {
    it('should render all required fields in correct layout', () => {
      render(<OrganizerDetailInfo organizerDetail={mockOrganizerDetail} />);

      // Left column fields
      expect(screen.getByText('Organizer Name*')).toBeInTheDocument();
      expect(screen.getByText('Phone Number*')).toBeInTheDocument();
      expect(screen.getByText('Social Media*')).toBeInTheDocument();
      expect(screen.getByText('About Organizer*')).toBeInTheDocument();

      // Right column fields
      expect(screen.getByText('Email Address*')).toBeInTheDocument();
      expect(screen.getByText('Address*')).toBeInTheDocument();
      expect(screen.getByText('Profile Picture*')).toBeInTheDocument();
    });
  });
});

