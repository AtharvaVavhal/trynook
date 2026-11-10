/* Directory content source. Descriptions and release states come from the six
   existing ecosystem platform HTML pages. Categories are editorial groupings,
   not claims about technical dependencies. Never infer a URL from an id. */
export const categories = [
  { id: 'all', label: 'All platforms' },
  { id: 'everyday', label: 'Everyday experiences' },
  { id: 'platform', label: 'Platform & infrastructure' },
  { id: 'resources', label: 'Resources & updates' },
];
export const platforms = [
  { id: 'app', name: 'Management Dashboard', short: 'Management', url: 'https://app.trynook.in/', category: 'everyday', icon: 'grid', status: 'Coming soon', description: 'Your entire hostel in one workspace. Bring bookings, rooms, residents and finances together.', source: 'ecosystem/app/index.html' },
  { id: 'resident', name: 'Nook for Residents', short: 'Residents', url: 'https://resident.trynook.in/', category: 'everyday', icon: 'person', status: 'Coming soon', description: 'Your stay. Your space. Your Nook. A simpler digital experience for hostel residents.', source: 'ecosystem/resident/index.html' },
  { id: 'superadmin', name: 'Super Admin', short: 'Super Admin', url: 'https://superadmin.trynook.in/', category: 'platform', icon: 'shield', status: 'Coming soon', note: 'Restricted platform access', description: 'A dedicated control environment for overseeing the wider Nook platform.', source: 'ecosystem/superadmin/index.html' },
  { id: 'api', name: 'Platform API', short: 'API', url: 'https://api.trynook.in/', category: 'platform', icon: 'code', status: 'Coming soon', description: 'The engine behind the ecosystem. A foundation for connected Nook experiences.', source: 'ecosystem/api/index.html' },
  { id: 'docs', name: 'Documentation', short: 'Docs', url: 'https://docs.trynook.in/', category: 'resources', icon: 'book', status: 'Coming soon', description: 'Get to know Nook. Product guides, helpful resources and ecosystem documentation.', source: 'ecosystem/docs/index.html' },
  { id: 'status', name: 'System Status', short: 'Status', url: 'https://status.trynook.in/', category: 'resources', icon: 'pulse', status: 'Coming soon', description: 'A dedicated place for service availability information and incident updates.', source: 'ecosystem/status/index.html' },
  // TODO(owner): Supply the seventh platform's verified name, URL, purpose,
  // release status and category. Null deliberately prevents a fabricated link.
  { id: 'unconfigured', name: 'Platform details pending', short: null, url: null, category: null, icon: 'plus', status: 'Not configured', description: 'The seventh platform’s name, destination and description are awaiting confirmation.' },
];
