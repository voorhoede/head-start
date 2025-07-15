export type Breadcrumb = {
  text: string;
  href?: string;
};

type IncompleteBreadcrumb = {
  text?: string;
  href?: string;
};

type AnyBreadcrumb = Breadcrumb | IncompleteBreadcrumb;

const isCompleteBreadcrumb = (breadcrumb: AnyBreadcrumb) => Boolean(breadcrumb.text);

export const formatBreadcrumb = (breadcrumb: AnyBreadcrumb) => ({
  text: isCompleteBreadcrumb(breadcrumb) ? breadcrumb.text : '...',
  href: isCompleteBreadcrumb(breadcrumb) ? breadcrumb.href : undefined,
} as Breadcrumb);
