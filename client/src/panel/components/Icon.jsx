import React from 'react';
import * as LucideIcons from 'lucide-react';

export function Icon({ name, className }) {
    if (!name) return null;

    // Convert kebab-case (e.g. layout-dashboard) to PascalCase (LayoutDashboard)
    const pascalName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const LucideIcon = LucideIcons[pascalName];

    if (!LucideIcon) return null;

    return <LucideIcon className={className} />;
}
