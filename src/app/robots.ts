import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',            // Allow landing page
      disallow: [             // Block private/sensitive paths
        '/dashboard/',
        '/admin/',
        '/user/salary/',
        '/user/attendance/'
      ],
    },
    // Replace with your production domain later
    sitemap: `${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/sitemap.xml`,
  };
}
