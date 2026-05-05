import { Icon } from '@/components/shared/Icon';
import { siteSettings } from '@/lib/website-data';
import { hasPublicPhoneNumber } from '@/lib/contact-href';

export function ContactInfo() {
  const hasPhone = hasPublicPhoneNumber();
  return (
    <ul className="space-y-3 text-sm">
      <li className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
        <Icon name="MessageCircle" size={20} className="mt-0.5 shrink-0 text-brand" />
        <div className="min-w-0">
          <p className="font-medium text-ink">Text Remy</p>
          {hasPhone ? (
            <a
              href={siteSettings.phoneHref}
              className="break-all text-ink-soft hover:text-brand"
            >
              {siteSettings.phoneDisplay}
            </a>
          ) : (
            <p className="text-ink-muted">Phone number coming soon — email works today.</p>
          )}
        </div>
      </li>
      <li className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
        <Icon name="ClipboardCheck" size={20} className="mt-0.5 shrink-0 text-brand" />
        <div className="min-w-0">
          <p className="font-medium text-ink">Email</p>
          <a
            href={siteSettings.emailHref}
            className="break-all text-ink-soft hover:text-brand"
          >
            {siteSettings.emailDisplay}
          </a>
        </div>
      </li>
      <li className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
        <Icon name="MapPin" size={20} className="mt-0.5 shrink-0 text-brand" />
        <div className="min-w-0">
          <p className="font-medium text-ink">Service area</p>
          <p className="text-ink-soft">{siteSettings.serviceArea}</p>
        </div>
      </li>
      <li className="flex items-start gap-3 rounded-lg border border-line bg-surface p-4">
        <Icon name="CalendarDays" size={20} className="mt-0.5 shrink-0 text-brand" />
        <div className="min-w-0">
          <p className="font-medium text-ink">Quote visits</p>
          <p className="text-ink-soft">Evenings and weekends usually work best.</p>
        </div>
      </li>
    </ul>
  );
}
